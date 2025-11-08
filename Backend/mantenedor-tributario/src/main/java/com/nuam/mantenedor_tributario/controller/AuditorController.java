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
@RequestMapping("/api/auditor") // <-- Escucha en la ruta /api/auditor
public class AuditorController {

    @Autowired
    private CertificadoRepository certificadoRepository;

    @Autowired
    private AuditoriaService auditoriaService;

    /**
     * Este es el endpoint que permite al Auditor (o Admin) cambiar el estado
     * de un certificado a APROBADO o RECHAZADO.
     * El Frontend lo llama con un método PUT.
     */
    @PutMapping("/certificados/{id}/estado")
    public ResponseEntity<Certificado> actualizarEstadoCertificado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication auth) {

        // 1. Obtiene el nuevo estado ("APROBADO" o "RECHAZADO") del JSON
        String nuevoEstado = body.get("estado");
        if (nuevoEstado == null || (!nuevoEstado.equals("APROBADO") && !nuevoEstado.equals("RECHAZADO"))) {
            return ResponseEntity.badRequest().build(); // Petición incorrecta
        }

        // 2. Busca el certificado en la base de datos por su ID
        Optional<Certificado> optCertificado = certificadoRepository.findById(id);
        if (optCertificado.isEmpty()) {
            return ResponseEntity.notFound().build(); // No se encontró
        }

        // 3. Actualiza el estado y lo guarda en la BD
        Certificado certificado = optCertificado.get();
        certificado.setEstado(nuevoEstado);
        Certificado certificadoActualizado = certificadoRepository.save(certificado);

        // 4. Registra la acción en la tabla de auditoría
        String correoAuditor = auth.getName();
        String evento = String.format("Certificado %s fue %s por %s",
                certificado.getCodigo(),
                nuevoEstado.toLowerCase(),
                correoAuditor);
        auditoriaService.registrarEvento(correoAuditor, evento);

        // 5. Devuelve el certificado actualizado al Frontend
        return ResponseEntity.ok(certificadoActualizado);
    }
}