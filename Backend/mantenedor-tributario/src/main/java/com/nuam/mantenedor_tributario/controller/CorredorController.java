package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.*;
import com.nuam.mantenedor_tributario.repository.*;
import com.nuam.mantenedor_tributario.service.AuditoriaService;
import com.nuam.mantenedor_tributario.service.CargaMasivaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/corredor")
public class CorredorController {

    @Autowired private CertificadoRepository certificadoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private TipoCertificadoRepository tipoCertificadoRepository;
    @Autowired private FactorRepository factorRepository;
    @Autowired private AuditoriaRepository auditoriaRepository;
    @Autowired private AuditoriaService auditoriaService;
    @Autowired private CargaMasivaService cargaMasivaService;

    @GetMapping("/certificados")
    public List<Certificado> getCertificados(Authentication auth) {
        String correo = auth.getName();
        Usuario usuario = usuarioRepository.findByCorreo(correo).orElseThrow();
        if (usuario.getRol().name().equals("CORREDOR")) {
            return certificadoRepository.findByCorredor(usuario);
        }
        return certificadoRepository.findAll();
    }

    @GetMapping("/mis-logs")
    public List<AuditoriaEvento> getMisLogs(Authentication auth) {
        return auditoriaRepository.findByUsuarioCorreoOrderByFechaEventoDesc(auth.getName());
    }

    @PutMapping("/certificados/{id}")
    public ResponseEntity<?> editarCertificado(@PathVariable Long id, @RequestBody Map<String, Object> request, Authentication auth) {
        try {
            Certificado cert = certificadoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Certificado no encontrado"));

            if (!cert.getCorredor().getCorreo().equals(auth.getName())) {
                return ResponseEntity.status(403).body(Map.of("message", "No tiene permiso para editar este certificado"));
            }

            if ("APROBADO".equals(cert.getEstado())) {
                return ResponseEntity.badRequest().body(Map.of("message", "No se puede editar un certificado Aprobado."));
            }

            cert.setMercado((String) request.get("mercado"));
            cert.setInstrumento((String) request.get("instrumento"));
            cert.setDescripcion((String) request.get("descripcion"));
            if (request.get("secuenciaEvento") != null) cert.setSecuenciaEvento(Long.parseLong(request.get("secuenciaEvento").toString()));
            if (request.get("isFut") != null) cert.setIsFut(Boolean.parseBoolean(request.get("isFut").toString()));

            cert.setMontoPago(new BigDecimal(request.get("montoPago").toString()));
            LocalDate fechaPago = LocalDate.parse((String) request.get("fechaPago"));
            cert.setFechaPago(fechaPago);
            cert.setAnioTributario(Integer.parseInt(request.get("anioTributario").toString()));

            Optional<Factor> factorOpt = factorRepository.findByAnioAndMes(fechaPago.getYear(), fechaPago.getMonthValue());
            if (factorOpt.isPresent()) {
                BigDecimal valorFactor = factorOpt.get().getValor();
                cert.setFactorAplicado(valorFactor.doubleValue());
                cert.setMontoActualizado(cert.getMontoPago().multiply(valorFactor));
            }

            cert.getDetalles().clear();

            if (request.get("detalles") != null) {
                List<Map<String, Object>> listaDetalles = (List<Map<String, Object>>) request.get("detalles");
                double sumaFactores = 0;

                for (Map<String, Object> detMap : listaDetalles) {
                    Integer numCol = Integer.parseInt(detMap.get("numeroColumna").toString());
                    BigDecimal m = new BigDecimal(detMap.get("monto").toString());
                    Double f = Double.parseDouble(detMap.get("factor").toString());

                    if (numCol >= 8 && numCol <= 16) sumaFactores += f;

                    DetalleCertificado detalle = new DetalleCertificado(numCol, m, f);
                    cert.addDetalle(detalle);
                }
                if (sumaFactores > 1.0001) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Error: Suma factores 8-16 supera 1."));
                }
            }

            cert.setEstado("PENDIENTE");

            certificadoRepository.save(cert);
            auditoriaService.registrarEvento(auth.getName(), "Corrigió certificado folio: " + cert.getNroCertificado());

            return ResponseEntity.ok(Map.of("message", "Certificado corregido y enviado a revisión."));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Error al editar: " + e.getMessage()));
        }
    }

    @PostMapping("/carga-masiva")
    public ResponseEntity<?> cargaMasiva(@RequestParam("file") MultipartFile file, Authentication auth) {
        try {
            Usuario corredor = usuarioRepository.findByCorreo(auth.getName()).orElseThrow();
            int cantidad = cargaMasivaService.procesarArchivo(file.getInputStream(), corredor);
            return ResponseEntity.ok(Map.of("message", "Procesados: " + cantidad));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}