package com.nuam.mantenedor_tributario.service;

import com.nuam.mantenedor_tributario.model.Certificado;
import com.nuam.mantenedor_tributario.model.Usuario;
import com.nuam.mantenedor_tributario.repository.CertificadoRepository;
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
import java.util.Date;
import java.util.Iterator;
import java.util.List;

@Service
public class CargaMasivaService {

    @Autowired
    private CertificadoRepository certificadoRepository;
    @Autowired
    private AuditoriaService auditoriaService;

    @Transactional
    public int procesarArchivo(InputStream inputStream, Usuario corredor) throws Exception {
        List<Certificado> certificadosParaGuardar = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(inputStream);
        Sheet sheet = workbook.getSheetAt(0);
        Iterator<Row> rows = sheet.iterator();

        if (rows.hasNext()) {
            rows.next();
        }

        int fila = 1;
        while (rows.hasNext()) {
            fila++;
            Row currentRow = rows.next();

            try {
                String codigo = getStringCellValue(currentRow.getCell(0));
                String tipo = getStringCellValue(currentRow.getCell(1));
                BigDecimal monto = getNumericCellValue(currentRow.getCell(2));
                LocalDate fecha = getDateCellValue(currentRow.getCell(3));

                if (codigo == null || codigo.isBlank() || monto == null || fecha == null) {
                    throw new Exception("Datos obligatorios faltantes (Código, Monto, Fecha)");
                }
                if (monto.compareTo(BigDecimal.ZERO) < 0) {
                    throw new Exception("Monto no puede ser negativo");
                }

                Certificado cert = new Certificado();
                cert.setCodigo(codigo);
                cert.setTipo(tipo);
                cert.setMonto(monto);
                cert.setFecha(fecha);

                cert.setEstado("PENDIENTE");
                cert.setCorredor(corredor);
                certificadosParaGuardar.add(cert);

            } catch (Exception e) {
                throw new Exception("Error en la fila " + fila + ": " + e.getMessage());
            }
        }

        workbook.close();

        if (!certificadosParaGuardar.isEmpty()) {
            certificadoRepository.saveAll(certificadosParaGuardar);
            auditoriaService.registrarEvento(corredor.getCorreo(),
                    "Carga Masiva: " + certificadosParaGuardar.size() + " certificados procesados.");
        }

        return certificadosParaGuardar.size();
    }

    private String getStringCellValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        }
        if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((long) cell.getNumericCellValue());
        }
        return null;
    }
    private BigDecimal getNumericCellValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return BigDecimal.valueOf(cell.getNumericCellValue());
        }
        if (cell.getCellType() == CellType.STRING) {
            try { return new BigDecimal(cell.getStringCellValue()); }
            catch (NumberFormatException e) { return null; }
        }
        return null;
    }
    private LocalDate getDateCellValue(Cell cell) {
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            if (DateUtil.isCellDateFormatted(cell)) {
                Date javaDate = cell.getDateCellValue();
                return javaDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            }
        }
        if(cell.getCellType() == CellType.STRING) {
            try { return LocalDate.parse(cell.getStringCellValue()); }
            catch (Exception e) { return null; }
        }
        return null;
    }
}