package com.nuam.mantenedor_tributario.service;

import com.nuam.mantenedor_tributario.model.*;
import com.nuam.mantenedor_tributario.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

@Service
public class CargaMasivaService {

    @Autowired private CertificadoRepository certificadoRepository;
    @Autowired private TipoCertificadoRepository tipoCertificadoRepository;
    @Autowired private FactorRepository factorRepository;
    @Autowired private AuditoriaService auditoriaService;

    @Transactional(rollbackFor = Exception.class)
    public int procesarArchivo(InputStream inputStream, Usuario corredor) throws Exception {
        List<Certificado> certificadosParaGuardar = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            if (rows.hasNext()) rows.next();

            int fila = 1;
            while (rows.hasNext()) {
                fila++;
                Row currentRow = rows.next();
                if (isRowEmpty(currentRow)) continue;

                try {
                    Integer anio = getIntegerCellValue(currentRow.getCell(0));
                    String mercado = getStringCellValue(currentRow.getCell(1));
                    String instrumento = getStringCellValue(currentRow.getCell(2));
                    LocalDate fecha = getDateCellValue(currentRow.getCell(3));
                    Long secuencia = getLongCellValue(currentRow.getCell(4));

                    String desc = "Div: " + getStringCellValue(currentRow.getCell(5)) + " | Soc: " + getStringCellValue(currentRow.getCell(6));
                    BigDecimal monto = getNumericCellValue(currentRow.getCell(7));

                    if (anio == null) System.out.println("Fila " + fila + ": Año es null");
                    if (instrumento == null) System.out.println("Fila " + fila + ": Instrumento es null");
                    if (fecha == null) System.out.println("Fila " + fila + ": Fecha es null");
                    if (monto == null) System.out.println("Fila " + fila + ": Monto es null");

                    if (instrumento == null || monto == null || fecha == null || anio == null || secuencia == null) {
                        throw new Exception("Faltan datos obligatorios (Col 0-7)");
                    }
                    if (monto.compareTo(BigDecimal.ZERO) < 0) throw new Exception("Monto negativo");
                    if (anio < 1990 || anio > 2100) throw new Exception("Año inválido");

                    String codigoCert = instrumento + "-" + secuencia + "-" + anio;

                    Optional<Certificado> existente = certificadoRepository.findByCodigoCertificado(codigoCert);
                    Certificado cert = existente.orElse(new Certificado());

                    if (!existente.isPresent()) {
                        cert.setCodigoCertificado(codigoCert);
                        TipoCertificado tipo = tipoCertificadoRepository.findById("DJ1948")
                                .orElseThrow(() -> new Exception("Tipo DJ1948 no configurado en BD"));
                        cert.setTipoCertificado(tipo);
                    } else {
                        cert.getDetalles().clear();
                    }

                    cert.setMercado(mercado);
                    cert.setInstrumento(instrumento);
                    cert.setSecuenciaEvento(secuencia);
                    cert.setDescripcion(desc);
                    cert.setAnioTributario(anio);
                    cert.setFechaPago(fecha);
                    cert.setMontoPago(monto);
                    cert.setFuenteIngreso("ARCHIVO");
                    cert.setCorredor(corredor);
                    cert.setEstado("PENDIENTE");

                    if (cert.getRutEmisor() == null) {
                        cert.setRutEmisor("99999999"); cert.setDvEmisor("K");
                        cert.setRutTitular("11111111"); cert.setDvTitular("1");
                        cert.setNroCertificado(secuencia);
                    }

                    Optional<Factor> factorOpt = factorRepository.findByAnioAndMes(fecha.getYear(), fecha.getMonthValue());
                    if (factorOpt.isPresent()) {
                        BigDecimal valFactor = factorOpt.get().getValor();
                        cert.setFactorAplicado(valFactor.doubleValue());
                        cert.setMontoActualizado(monto.multiply(valFactor));
                    } else {
                        cert.setFactorAplicado(1.0);
                        cert.setMontoActualizado(monto);
                    }

                    double sumaFactoresControlados = 0;
                    for (int i = 0; i < 30; i++) {
                        BigDecimal valorFactor = getNumericCellValue(currentRow.getCell(8 + i));
                        if (valorFactor == null) valorFactor = BigDecimal.ZERO;

                        int numeroFactorReal = 8 + i;
                        DetalleCertificado detalle = new DetalleCertificado();
                        detalle.setNumeroColumna(numeroFactorReal);
                        detalle.setFactor(valorFactor.doubleValue());
                        detalle.setMonto(BigDecimal.ZERO);
                        cert.addDetalle(detalle);

                        if (numeroFactorReal >= 8 && numeroFactorReal <= 16) {
                            sumaFactoresControlados += valorFactor.doubleValue();
                        }
                    }

                    if (sumaFactoresControlados > 1.0001) {
                        throw new Exception("Suma de factores 8-16 supera 1.0 (" + sumaFactoresControlados + ")");
                    }

                    certificadosParaGuardar.add(cert);

                } catch (Exception e) {
                    throw new Exception("Error en Fila " + fila + ": " + e.getMessage());
                }
            }
        }

        if (!certificadosParaGuardar.isEmpty()) {
            certificadoRepository.saveAll(certificadosParaGuardar);
            auditoriaService.registrarEvento(corredor.getCorreo(),
                    "Carga Masiva: " + certificadosParaGuardar.size() + " instrumentos procesados.");
        }
        return certificadosParaGuardar.size();
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) return false;
        }
        return true;
    }

    private String getStringCellValue(Cell c) {
        if (c == null) return "";
        if (c.getCellType() == CellType.NUMERIC) return String.valueOf((long)c.getNumericCellValue());
        return c.getStringCellValue().trim();
    }

    private BigDecimal getNumericCellValue(Cell c) {
        if (c == null) return BigDecimal.ZERO;
        if (c.getCellType() == CellType.NUMERIC) return BigDecimal.valueOf(c.getNumericCellValue());
        try { return new BigDecimal(c.getStringCellValue().trim().replace(",", ".")); } catch (Exception e) { return BigDecimal.ZERO; }
    }

    private Long getLongCellValue(Cell c) {
        if (c == null) return null;
        if (c.getCellType() == CellType.NUMERIC) return (long) c.getNumericCellValue();
        try { return Long.parseLong(c.getStringCellValue().trim()); } catch (Exception e) { return null; }
    }

    private Integer getIntegerCellValue(Cell c) {
        if (c == null) return null;
        if (c.getCellType() == CellType.NUMERIC) return (int) c.getNumericCellValue();
        try { return Integer.parseInt(c.getStringCellValue().trim()); } catch (Exception e) { return null; }
    }

    private LocalDate getDateCellValue(Cell c) {
        if (c == null) return null;
        if (c.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(c)) {
            return c.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
        try {
            String val = c.getStringCellValue().trim();
            if (val.contains("-")) {
                if (val.split("-")[0].length() == 2) {
                    return LocalDate.parse(val, DateTimeFormatter.ofPattern("dd-MM-yyyy"));
                }
                return LocalDate.parse(val);
            }
        } catch (Exception e) { return null; }
        return null;
    }
}