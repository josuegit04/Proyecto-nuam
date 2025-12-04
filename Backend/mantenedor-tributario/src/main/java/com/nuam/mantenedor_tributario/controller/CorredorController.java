package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.AuditoriaEvento;
import com.nuam.mantenedor_tributario.model.Certificado;
import com.nuam.mantenedor_tributario.model.Factor;
import com.nuam.mantenedor_tributario.model.TipoCertificado;
import com.nuam.mantenedor_tributario.model.Usuario;
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

    @Autowired
    private CertificadoRepository certificadoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private TipoCertificadoRepository tipoCertificadoRepository;
    @Autowired
    private FactorRepository factorRepository;
    @Autowired
    private AuditoriaRepository auditoriaRepository;
    @Autowired
    private AuditoriaService auditoriaService;
    @Autowired
    private CargaMasivaService cargaMasivaService;

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

    @PostMapping("/certificados")
    public ResponseEntity<?> crearCertificado(@RequestBody Map<String, Object> request, Authentication auth) {
        try {
            String correo = auth.getName();
            Usuario corredor = usuarioRepository.findByCorreo(correo).orElseThrow();

            String codigoCert = (String) request.get("codigoCertificado");
            String codigoTipo = (String) request.get("codigoTipoCertificado");

            if (certificadoRepository.existsByCodigoCertificado(codigoCert)) {
                return ResponseEntity.badRequest().body(Map.of("message", "El código ya existe."));
            }

            TipoCertificado tipo = tipoCertificadoRepository.findById(codigoTipo)
                    .orElseThrow(() -> new RuntimeException("Tipo de certificado inválido"));

            Certificado cert = new Certificado();
            cert.setCodigoCertificado(codigoCert);
            cert.setTipoCertificado(tipo);

            cert.setRutEmisor(String.valueOf(request.get("rutEmisor")));
            cert.setDvEmisor((String) request.get("dvEmisor"));
            cert.setRutTitular(String.valueOf(request.get("rutTitular")));
            cert.setDvTitular((String) request.get("dvTitular"));

            if (request.get("nroCertificado") != null) {
                cert.setNroCertificado(Long.parseLong(request.get("nroCertificado").toString()));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "El Nro de Folio es obligatorio."));
            }

            cert.setAnioTributario(Integer.parseInt(request.get("anioTributario").toString()));
            cert.setTipoMoneda((String) request.get("tipoMoneda"));

            BigDecimal montoOriginal = new BigDecimal(request.get("montoPago").toString());
            LocalDate fechaPago = LocalDate.parse((String) request.get("fechaPago"));

            cert.setMontoPago(montoOriginal);
            cert.setFechaPago(fechaPago);

            Optional<Factor> factorOpt = factorRepository.findByAnioAndMes(fechaPago.getYear(), fechaPago.getMonthValue());

            if (factorOpt.isPresent()) {
                BigDecimal valorFactor = factorOpt.get().getValor();
                BigDecimal montoFinal = montoOriginal.multiply(valorFactor);

                cert.setFactorAplicado(valorFactor.doubleValue());
                cert.setMontoActualizado(montoFinal);
            } else {
                cert.setFactorAplicado(1.0);
                cert.setMontoActualizado(montoOriginal);
            }

            cert.setEstado("PENDIENTE");
            cert.setCorredor(corredor);

            certificadoRepository.save(cert);
            auditoriaService.registrarEvento(correo, "Creó certificado manual: " + codigoCert);

            return ResponseEntity.ok(Map.of("message", "Certificado creado exitosamente"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error al crear: " + e.getMessage()));
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