package com.nuam.mantenedor_tributario.service;

import com.nuam.mantenedor_tributario.model.Certificado;
import com.nuam.mantenedor_tributario.model.Factor;
import com.nuam.mantenedor_tributario.model.TipoCertificado;
import com.nuam.mantenedor_tributario.model.Usuario;
import com.nuam.mantenedor_tributario.repository.CertificadoRepository;
import com.nuam.mantenedor_tributario.repository.FactorRepository;
import com.nuam.mantenedor_tributario.repository.TipoCertificadoRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

@Service
public class CargaMasivaService {

    @Autowired
    private CertificadoRepository certificadoRepository;
    @Autowired
    private TipoCertificadoRepository tipoCertificadoRepository;
    @Autowired
    private FactorRepository factorRepository;
    @Autowired
    private AuditoriaService auditoriaService;

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
                    String rutEmisor = getStringCellValue(currentRow.getCell(0));
                    String dvEmisor = getStringCellValue(currentRow.getCell(1));
                    String rutTitular = getStringCellValue(currentRow.getCell(2));
                    String dvTitular = getStringCellValue(currentRow.getCell(3));
                    String codigoTipoStr = getStringCellValue(currentRow.getCell(4));
                    String codigoCert = getStringCellValue(currentRow.getCell(5));
                    Long nroCertificado = getLongCellValue(currentRow.getCell(6));
                    Integer anio = getIntegerCellValue(currentRow.getCell(7));
                    String moneda = getStringCellValue(currentRow.getCell(8));
                    BigDecimal monto = getNumericCellValue(currentRow.getCell(9));
                    LocalDate fecha = getDateCellValue(currentRow.getCell(10));

                    if (codigoCert == null || monto == null || codigoTipoStr == null || anio == null) {
                        throw new Exception("Faltan datos obligatorios");
                    }
                    if (monto.compareTo(BigDecimal.ZERO) < 0) throw new Exception("Monto negativo");
                    if (anio < 1990 || anio > 2100) throw new Exception("Año inválido");

                    if (!validarRut(rutEmisor, dvEmisor)) throw new Exception("RUT Emisor inválido");
                    if (!validarRut(rutTitular, dvTitular)) throw new Exception("RUT Titular inválido");

                    if (certificadoRepository.existsByCodigoCertificado(codigoCert)) {
                        throw new Exception("Certificado duplicado: " + codigoCert);
                    }

                    TipoCertificado tipo = tipoCertificadoRepository.findById(codigoTipoStr)
                            .orElseThrow(() -> new Exception("Tipo '" + codigoTipoStr + "' no existe."));

                    Certificado cert = new Certificado();
                    cert.setTipoCertificado(tipo);
                    cert.setCodigoCertificado(codigoCert);
                    cert.setRutEmisor(rutEmisor);
                    cert.setDvEmisor(dvEmisor.toUpperCase());
                    cert.setRutTitular(rutTitular);
                    cert.setDvTitular(dvTitular.toUpperCase());
                    cert.setNroCertificado(nroCertificado);
                    cert.setAnioTributario(anio);
                    cert.setTipoMoneda(moneda);
                    cert.setMontoPago(monto);
                    cert.setFechaPago(fecha);

                    Optional<Factor> factorOpt = factorRepository.findByAnioAndMes(fecha.getYear(), fecha.getMonthValue());

                    if (factorOpt.isPresent()) {
                        BigDecimal valorFactor = factorOpt.get().getValor();
                        cert.setFactorAplicado(valorFactor.doubleValue());
                        cert.setMontoActualizado(monto.multiply(valorFactor));
                    } else {
                        cert.setFactorAplicado(1.0);
                        cert.setMontoActualizado(monto);
                    }

                    cert.setEstado("PENDIENTE");
                    cert.setCorredor(corredor);
                    certificadosParaGuardar.add(cert);

                } catch (Exception e) {
                    throw new Exception("Error Fila " + fila + ": " + e.getMessage());
                }
            }
        }

        if (!certificadosParaGuardar.isEmpty()) {
            certificadoRepository.saveAll(certificadosParaGuardar);
            auditoriaService.registrarEvento(corredor.getCorreo(),
                    "Carga Masiva: " + certificadosParaGuardar.size() + " certificados subidos.");
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
    private String getStringCellValue(Cell cell) {
        if (cell == null) return null;
        return (cell.getCellType() == CellType.NUMERIC) ? String.valueOf((long)cell.getNumericCellValue()) : cell.getStringCellValue().trim();
    }
    private BigDecimal getNumericCellValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) return BigDecimal.valueOf(cell.getNumericCellValue());
        try { return new BigDecimal(cell.getStringCellValue().replace(",", ".")); } catch (Exception e) { return null; }
    }
    private Long getLongCellValue(Cell cell) {
        try { return (long) cell.getNumericCellValue(); } catch (Exception e) { return null; }
    }
    private Integer getIntegerCellValue(Cell cell) {
        try { return (int) cell.getNumericCellValue(); } catch (Exception e) { return null; }
    }
    private LocalDate getDateCellValue(Cell cell) {
        if (cell != null && DateUtil.isCellDateFormatted(cell)) {
            return cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
        return null;
    }
    private boolean validarRut(String rutStr, String dvStr) {
        if (rutStr == null || dvStr == null) return false;
        try {
            int rut = Integer.parseInt(rutStr);
            char dv = dvStr.toUpperCase().charAt(0);
            int m = 0, s = 1;
            for (; rut != 0; rut /= 10) s = (s + rut % 10 * (9 - m++ % 6)) % 11;
            char dvCalculado = (char) (s != 0 ? s + 47 : 75);
            return dv == dvCalculado;
        } catch (Exception e) { return false; }
    }
}