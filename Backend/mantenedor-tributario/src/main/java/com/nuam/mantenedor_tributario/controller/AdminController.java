package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.AuditoriaEvento;
import com.nuam.mantenedor_tributario.model.Certificado;
import com.nuam.mantenedor_tributario.model.Factor;
import com.nuam.mantenedor_tributario.model.Usuario;
import com.nuam.mantenedor_tributario.repository.AuditoriaRepository;
import com.nuam.mantenedor_tributario.repository.CertificadoRepository;
import com.nuam.mantenedor_tributario.repository.FactorRepository;
import com.nuam.mantenedor_tributario.repository.UsuarioRepository;
import com.nuam.mantenedor_tributario.service.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
        auditoriaService.registrarEvento(auth.getName(), "Eliminó certificado ID: " + id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/certificados/{id}")
    public ResponseEntity<?> editarCertificado(@PathVariable Long id, @RequestBody Map<String, Object> datos, Authentication auth) {
        return certificadoRepository.findById(id).map(cert -> {
            // Actualizar datos básicos
            if (datos.containsKey("montoPago")) cert.setMontoPago(new BigDecimal(datos.get("montoPago").toString()));
            if (datos.containsKey("rutEmisor")) cert.setRutEmisor(datos.get("rutEmisor").toString());
            if (cert.getFactorAplicado() != null) {
                BigDecimal factor = BigDecimal.valueOf(cert.getFactorAplicado());
                cert.setMontoActualizado(cert.getMontoPago().multiply(factor));
            }

            certificadoRepository.save(cert);
            auditoriaService.registrarEvento(auth.getName(), "Editó certificado: " + cert.getCodigoCertificado());
            return ResponseEntity.ok(cert);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuarios")
    public List<Usuario> listarUsuarios() { return usuarioRepository.findAll(); }

    @PostMapping("/usuarios")
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario u, Authentication auth) {
        if (usuarioRepository.findByCorreo(u.getCorreo()).isPresent()) return ResponseEntity.badRequest().body(Map.of("message", "Correo duplicado"));
        u.setPassword(passwordEncoder.encode(u.getPassword()));
        usuarioRepository.save(u);
        auditoriaService.registrarEvento(auth.getName(), "Creó usuario: " + u.getCorreo());
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
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/usuarios/{id}/desbloquear")
    public ResponseEntity<?> desbloquear(@PathVariable Long id) {
        Usuario u = usuarioRepository.findById(id).get();
        u.setCuentaBloqueada(false);
        u.setIntentosFallidos(0);
        usuarioRepository.save(u);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/factores")
    public List<Factor> listarFactores() {
        return factorRepository.findAll();
    }

    @PostMapping("/factores")
    public ResponseEntity<?> guardarFactor(@RequestBody Factor factor, Authentication auth) {
        try {
            factorRepository.save(factor);
            auditoriaService.registrarEvento(auth.getName(), "Actualizó Factor: " + factor.getAnio() + "-" + factor.getMes());
            return ResponseEntity.ok(factor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error al guardar factor (¿Ya existe?)"));
        }
    }
}