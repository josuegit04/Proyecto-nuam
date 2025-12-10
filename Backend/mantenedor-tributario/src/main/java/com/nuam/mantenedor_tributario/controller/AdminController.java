package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.*;
import com.nuam.mantenedor_tributario.repository.*;
import com.nuam.mantenedor_tributario.service.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private AuditoriaRepository auditoriaRepository;
    @Autowired private CertificadoRepository certificadoRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private FactorRepository factorRepository;
    @Autowired private AuditoriaService auditoriaService;
    @Autowired private PasswordEncoder passwordEncoder;

    @GetMapping("/auditoria")
    public List<AuditoriaEvento> getActividadReciente() {
        return auditoriaRepository.findTop50ByOrderByIdDesc();
    }

    @DeleteMapping("/certificados/{id}")
    public ResponseEntity<?> eliminarCertificado(@PathVariable Long id, Authentication auth) {
        if (!certificadoRepository.existsById(id)) return ResponseEntity.notFound().build();
        certificadoRepository.deleteById(id);
        auditoriaService.registrarEvento(auth.getName(), "ADMIN: Eliminó certificado ID: " + id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/certificados/{id}")
    public ResponseEntity<?> actualizarCertificado(@PathVariable Long id, @RequestBody Map<String, Object> request, Authentication auth) {
        try {
            Certificado cert = certificadoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Certificado no encontrado"));

            if (request.get("estado") != null) {
                String nuevoEstado = String.valueOf(request.get("estado"));
                cert.setEstado(nuevoEstado);
                if ("APROBADO".equals(nuevoEstado)) {
                    cert.setObservacionRechazo(null);
                }
            }

            if (request.get("mercado") != null) cert.setMercado(String.valueOf(request.get("mercado")));
            if (request.get("instrumento") != null) cert.setInstrumento(String.valueOf(request.get("instrumento")));
            if (request.get("descripcion") != null) cert.setDescripcion(String.valueOf(request.get("descripcion")));

            if (request.get("secuenciaEvento") != null) {
                cert.setSecuenciaEvento(Long.parseLong(String.valueOf(request.get("secuenciaEvento"))));
            }
            if (request.get("isFut") != null) {
                cert.setIsFut(Boolean.parseBoolean(String.valueOf(request.get("isFut"))));
            }

            if (request.get("rutEmisor") != null) cert.setRutEmisor(String.valueOf(request.get("rutEmisor")));
            if (request.get("montoPago") != null) {
                cert.setMontoPago(new BigDecimal(String.valueOf(request.get("montoPago"))));
            }
            if (request.get("anioTributario") != null) {
                cert.setAnioTributario(Integer.parseInt(String.valueOf(request.get("anioTributario"))));
            }

            if (request.get("fechaPago") != null) {
                LocalDate fecha = LocalDate.parse(String.valueOf(request.get("fechaPago")));
                cert.setFechaPago(fecha);

                Optional<Factor> factorOpt = factorRepository.findByAnioAndMes(fecha.getYear(), fecha.getMonthValue());
                double factorVal = factorOpt.map(f -> f.getValor().doubleValue()).orElse(1.0);
                cert.setFactorAplicado(factorVal);

                if(cert.getMontoPago() != null) {
                    cert.setMontoActualizado(cert.getMontoPago().multiply(BigDecimal.valueOf(factorVal)));
                }
            }

            if (request.get("detalles") != null) {
                cert.getDetalles().clear(); // Borrar viejos
                List<Map<String, Object>> listaDetalles = (List<Map<String, Object>>) request.get("detalles");

                for (Map<String, Object> detMap : listaDetalles) {
                    Integer numCol = Integer.parseInt(String.valueOf(detMap.get("numeroColumna")));

                    BigDecimal m = detMap.get("monto") != null ? new BigDecimal(String.valueOf(detMap.get("monto"))) : BigDecimal.ZERO;
                    Double f = detMap.get("factor") != null ? Double.parseDouble(String.valueOf(detMap.get("factor"))) : 0.0;

                    DetalleCertificado detalle = new DetalleCertificado(numCol, m, f);
                    cert.addDetalle(detalle);
                }
            }

            certificadoRepository.save(cert);
            auditoriaService.registrarEvento(auth.getName(), "ADMIN: Modificó certificado #" + cert.getNroCertificado());

            return ResponseEntity.ok(Map.of("message", "Certificado actualizado correctamente."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", "Error interno: " + e.getMessage()));
        }
    }

    @GetMapping("/usuarios")
    public List<Usuario> listarUsuarios() { return usuarioRepository.findAll(); }

    @PostMapping("/usuarios")
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario u, Authentication auth) {
        if (usuarioRepository.findByCorreo(u.getCorreo()).isPresent()) return ResponseEntity.badRequest().body(Map.of("message", "Correo duplicado"));
        u.setPassword(passwordEncoder.encode(u.getPassword()));
        usuarioRepository.save(u);
        auditoriaService.registrarEvento(auth.getName(), "ADMIN: Creó usuario " + u.getCorreo());
        return ResponseEntity.ok(u);
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<?> editarUsuario(@PathVariable Long id, @RequestBody Usuario u, Authentication auth) {
        return usuarioRepository.findById(id).map(user -> {
            user.setNombre(u.getNombre());
            user.setCorreo(u.getCorreo());
            user.setRol(u.getRol());
            if (u.getPassword() != null && !u.getPassword().isEmpty()) user.setPassword(passwordEncoder.encode(u.getPassword()));
            usuarioRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id, Authentication auth) {
        usuarioRepository.deleteById(id);
        auditoriaService.registrarEvento(auth.getName(), "ADMIN: Eliminó usuario ID " + id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/usuarios/{id}/desbloquear")
    public ResponseEntity<?> desbloquear(@PathVariable Long id, Authentication auth) {
        Usuario u = usuarioRepository.findById(id).get();
        u.setCuentaBloqueada(false);
        u.setIntentosFallidos(0);
        usuarioRepository.save(u);
        auditoriaService.registrarEvento(auth.getName(), "ADMIN: Desbloqueó usuario " + u.getCorreo());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/factores")
    public List<Factor> listarFactores() { return factorRepository.findAll(); }

    @PostMapping("/factores")
    public ResponseEntity<?> guardarFactor(@RequestBody Factor factor, Authentication auth) {
        try {
            factorRepository.save(factor);
            auditoriaService.registrarEvento(auth.getName(), "ADMIN: IPC " + factor.getAnio() + "-" + factor.getMes());
            return ResponseEntity.ok(factor);
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("message", "Error al guardar (¿Ya existe?)")); }
    }
}