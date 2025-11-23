package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.Certificado;
import com.nuam.mantenedor_tributario.model.HistorialEstado;
import com.nuam.mantenedor_tributario.model.Usuario;
import com.nuam.mantenedor_tributario.repository.CertificadoRepository;
import com.nuam.mantenedor_tributario.repository.HistorialEstadoRepository;
import com.nuam.mantenedor_tributario.repository.UsuarioRepository;
import com.nuam.mantenedor_tributario.service.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auditor")
public class AuditorController {

    @Autowired
    private CertificadoRepository certificadoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private HistorialEstadoRepository historialEstadoRepository;

    @Autowired
    private AuditoriaService auditoriaService;

    @PutMapping("/certificados/{id}/estado")
    public ResponseEntity<?> actualizarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {

        String nuevoEstado = body.get("estado");
        String observacion = body.get("observacion");

        if (nuevoEstado == null) return ResponseEntity.badRequest().body("El estado es obligatorio");

        Optional<Certificado> optCert = certificadoRepository.findById(id);
        if (optCert.isEmpty()) return ResponseEntity.notFound().build();

        Certificado certificado = optCert.get();
        String estadoAnterior = certificado.getEstado();

        certificado.setEstado(nuevoEstado);
        certificadoRepository.save(certificado);

        String correoAuditor = auth.getName();
        Usuario auditor = usuarioRepository.findByCorreo(correoAuditor).orElseThrow();

        HistorialEstado historial = new HistorialEstado();
        historial.setCertificado(certificado);
        historial.setUsuario(auditor);
        historial.setEstadoAnterior(estadoAnterior);
        historial.setEstadoNuevo(nuevoEstado);
        historial.setObservacion(observacion);
        historialEstadoRepository.save(historial);

        auditoriaService.registrarEvento(correoAuditor, "Auditor cambió estado de " + certificado.getCodigoCertificado() + " a " + nuevoEstado);

        return ResponseEntity.ok(certificado);
    }
}