package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.AuditoriaEvento;
import com.nuam.mantenedor_tributario.model.Certificado;
import com.nuam.mantenedor_tributario.model.Usuario;
import com.nuam.mantenedor_tributario.repository.AuditoriaRepository;
import com.nuam.mantenedor_tributario.repository.CertificadoRepository;
import com.nuam.mantenedor_tributario.repository.UsuarioRepository;
import com.nuam.mantenedor_tributario.service.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AuditoriaRepository auditoriaRepository;
    @Autowired
    private CertificadoRepository certificadoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private AuditoriaService auditoriaService;

    @GetMapping("/auditoria")
    public List<AuditoriaEvento> getActividadReciente() {
        return auditoriaRepository.findTop50ByOrderByIdDesc();
    }

    @DeleteMapping("/certificados/{id}")
    public ResponseEntity<?> eliminarCertificado(@PathVariable Long id, Authentication auth) {
        Optional<Certificado> optCertificado = certificadoRepository.findById(id);
        if (optCertificado.isEmpty()) return ResponseEntity.notFound().build();

        try {
            Certificado certificado = optCertificado.get();
            String codigo = certificado.getCodigoCertificado();
            certificadoRepository.deleteById(id);

            String correoAdmin = auth.getName();
            auditoriaService.registrarEvento(correoAdmin, "Eliminó certificado: " + codigo);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al eliminar: " + e.getMessage());
        }
    }

    @GetMapping("/usuarios")
    public List<Usuario> listarUsuarios() {
        return usuarioRepository.findAll();
    }

    @PutMapping("/usuarios/{id}/desbloquear")
    public ResponseEntity<?> desbloquearUsuario(@PathVariable Long id, Authentication auth) {
        Optional<Usuario> optUser = usuarioRepository.findById(id);
        if (optUser.isEmpty()) return ResponseEntity.notFound().build();

        Usuario usuario = optUser.get();

        usuario.setCuentaBloqueada(false);
        usuario.setIntentosFallidos(0);
        usuarioRepository.save(usuario);

        String admin = auth.getName();
        auditoriaService.registrarEvento(admin, "Desbloqueó al usuario: " + usuario.getCorreo());

        return ResponseEntity.ok(Map.of("message", "Usuario desbloqueado exitosamente"));
    }
}