package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.AuditoriaEvento;
import com.nuam.mantenedor_tributario.model.Certificado; // <-- 1. Importar Certificado
import com.nuam.mantenedor_tributario.repository.AuditoriaRepository;
import com.nuam.mantenedor_tributario.repository.CertificadoRepository; // <-- 2. Importar Repo
import com.nuam.mantenedor_tributario.service.AuditoriaService; // <-- 3. Importar Servicio
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity; // <-- 4. Importar ResponseEntity
import org.springframework.security.core.Authentication; // <-- 5. Importar Authentication
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional; // <-- 6. Importar Optional

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AuditoriaRepository auditoriaRepository;

    // --- 7. AÑADIR NUEVAS DEPENDENCIAS ---
    @Autowired
    private CertificadoRepository certificadoRepository;

    @Autowired
    private AuditoriaService auditoriaService;
    // ------------------------------------

    // --- Esta función se mantiene igual ---
    @GetMapping("/auditoria")
    public List<AuditoriaEvento> getActividadReciente() {
        return auditoriaRepository.findTop50ByOrderByIdDesc();
    }

    // --- 8. AÑADIR NUEVA FUNCIÓN DE BORRADO ---
    @DeleteMapping("/certificados/{id}")
    public ResponseEntity<?> eliminarCertificado(@PathVariable Long id, Authentication auth) {

        Optional<Certificado> optCertificado = certificadoRepository.findById(id);
        if (optCertificado.isEmpty()) {
            return ResponseEntity.notFound().build(); // No se encontró
        }

        Certificado certificado = optCertificado.get();
        String codigoCertificado = certificado.getCodigo(); // Guardamos el código antes de borrar
        String correoAdmin = auth.getName();

        try {
            certificadoRepository.deleteById(id);

            // Registrar en la auditoría
            String evento = String.format("Certificado %s fue ELIMINADO por %s",
                    codigoCertificado,
                    correoAdmin);
            auditoriaService.registrarEvento(correoAdmin, evento);

            return ResponseEntity.ok().build(); // Borrado exitoso

        } catch (Exception e) {
            // Manejar error si, por ejemplo, está en uso
            return ResponseEntity.status(500).body("Error al eliminar el certificado: " + e.getMessage());
        }
    }
}