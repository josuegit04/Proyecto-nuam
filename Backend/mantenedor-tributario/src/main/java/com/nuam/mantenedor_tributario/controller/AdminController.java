package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.AuditoriaEvento;
import com.nuam.mantenedor_tributario.model.Certificado;
import com.nuam.mantenedor_tributario.repository.AuditoriaRepository;
import com.nuam.mantenedor_tributario.repository.CertificadoRepository;
import com.nuam.mantenedor_tributario.service.AuditoriaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AuditoriaRepository auditoriaRepository;

    @Autowired
    private CertificadoRepository certificadoRepository;

    @Autowired
    private AuditoriaService auditoriaService;

    @GetMapping("/auditoria")
    public List<AuditoriaEvento> getActividadReciente() {
        return auditoriaRepository.findTop50ByOrderByIdDesc();
    }

    @DeleteMapping("/certificados/{id}")
    public ResponseEntity<?> eliminarCertificado(@PathVariable Long id, Authentication auth) {

        Optional<Certificado> optCertificado = certificadoRepository.findById(id);
        if (optCertificado.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Certificado certificado = optCertificado.get();
        String codigoCertificado = certificado.getCodigo();
        String correoAdmin = auth.getName();

        try {
            certificadoRepository.deleteById(id);

            String evento = String.format("Certificado %s fue ELIMINADO por %s",
                    codigoCertificado,
                    correoAdmin);
            auditoriaService.registrarEvento(correoAdmin, evento);

            return ResponseEntity.ok().build();

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error al eliminar el certificado: " + e.getMessage());
        }
    }
}