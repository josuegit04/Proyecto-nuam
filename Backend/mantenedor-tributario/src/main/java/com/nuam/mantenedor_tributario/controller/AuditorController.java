package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.Certificado;
import com.nuam.mantenedor_tributario.repository.CertificadoRepository;
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
    private AuditoriaService auditoriaService;

    @PutMapping("/certificados/{id}/estado")
    public ResponseEntity<Certificado> actualizarEstadoCertificado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {

        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || (!nuevoEstado.equals("APROBADO") && !nuevoEstado.equals("RECHAZADO"))) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Certificado> optCertificado = certificadoRepository.findById(id);
        if (optCertificado.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Certificado certificado = optCertificado.get();
        certificado.setEstado(nuevoEstado);
        Certificado certificadoActualizado = certificadoRepository.save(certificado);

        String correoAuditor = auth.getName();
        String evento = String.format("Certificado %s fue %s por %s",
                certificado.getCodigo(),
                nuevoEstado.toLowerCase(),
                correoAuditor);
        auditoriaService.registrarEvento(correoAuditor, evento);

        return ResponseEntity.ok(certificadoActualizado);
    }
}