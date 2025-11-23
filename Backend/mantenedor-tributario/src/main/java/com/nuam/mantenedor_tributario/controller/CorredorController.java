package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.Certificado;
import com.nuam.mantenedor_tributario.model.TipoCertificado;
import com.nuam.mantenedor_tributario.model.Usuario;
import com.nuam.mantenedor_tributario.repository.CertificadoRepository;
import com.nuam.mantenedor_tributario.repository.TipoCertificadoRepository;
import com.nuam.mantenedor_tributario.repository.UsuarioRepository;
import com.nuam.mantenedor_tributario.service.AuditoriaService;
import com.nuam.mantenedor_tributario.service.CargaMasivaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Map;

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

    @PostMapping("/certificados")
    public ResponseEntity<?> crearCertificado(@RequestBody Map<String, Object> request, Authentication auth) {
        try {
            System.out.println("JSON Recibido del Front: " + request);

            String correo = auth.getName();
            Usuario corredor = usuarioRepository.findByCorreo(correo).orElseThrow();

            String codigoCert = (String) request.get("codigoCertificado");
            String codigoTipo = (String) request.get("codigoTipoCertificado");

            if (certificadoRepository.existsByCodigoCertificado(codigoCert)) {
                return ResponseEntity.badRequest().body(Map.of("message", "El código ya existe."));
            }

            TipoCertificado tipo = tipoCertificadoRepository.findById(codigoTipo)
                    .orElseThrow(() -> new RuntimeException("Tipo de certificado inválido: " + codigoTipo));

            Certificado cert = new Certificado();
            cert.setCodigoCertificado(codigoCert);
            cert.setTipoCertificado(tipo);

            cert.setRutEmisor(String.valueOf(request.get("rutEmisor")));
            cert.setDvEmisor((String) request.get("dvEmisor"));
            cert.setRutTitular(String.valueOf(request.get("rutTitular")));
            cert.setDvTitular((String) request.get("dvTitular"));

            if (request.get("nroCertificado") != null && !request.get("nroCertificado").toString().isEmpty()) {
                cert.setNroCertificado(Long.parseLong(request.get("nroCertificado").toString()));
            } else {
                System.err.println("ERROR: nroCertificado llegó NULO");
                return ResponseEntity.badRequest().body(Map.of("message", "El Nro de Folio (nroCertificado) es obligatorio."));
            }
            cert.setAnioTributario(Integer.parseInt(request.get("anioTributario").toString()));
            cert.setTipoMoneda((String) request.get("tipoMoneda"));
            cert.setMontoPago(new java.math.BigDecimal(request.get("montoPago").toString()));
            cert.setFechaPago(java.time.LocalDate.parse((String) request.get("fechaPago")));
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