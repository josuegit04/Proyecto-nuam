package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.Certificado;
import com.nuam.mantenedor_tributario.model.Usuario;
import com.nuam.mantenedor_tributario.repository.CertificadoRepository;
import com.nuam.mantenedor_tributario.repository.UsuarioRepository;
import com.nuam.mantenedor_tributario.service.AuditoriaService;
import com.nuam.mantenedor_tributario.service.CargaMasivaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/corredor")
public class CorredorController {

    @Autowired
    private CertificadoRepository certificadoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private AuditoriaService auditoriaService;

    @Autowired
    private CargaMasivaService cargaMasivaService;

    @GetMapping("/certificados")
    public List<Certificado> getCertificados(Authentication auth) {
        String correoUsuario = auth.getName();
        List<String> roles = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        if (roles.contains("ROLE_ADMIN") || roles.contains("ROLE_AUDITOR")) {
            return certificadoRepository.findAll();
        } else {
            Usuario corredor = usuarioRepository.findByCorreo(correoUsuario)
                    .orElseThrow(() -> new RuntimeException("Corredor no encontrado para el correo: " + correoUsuario));
            return certificadoRepository.findByCorredor(corredor);
        }
    }

    @PostMapping("/certificados")
    public Certificado crearCertificado(@Valid @RequestBody Certificado certificado, Authentication auth) {
        String correoUsuario = auth.getName();
        Usuario corredor = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Corredor no encontrado para el correo: " + correoUsuario));

        certificado.setCorredor(corredor);
        certificado.setEstado("PENDIENTE");
        Certificado nuevo = certificadoRepository.save(certificado);

        auditoriaService.registrarEvento(correoUsuario, "Creó certificado manual: " + nuevo.getCodigo());
        return nuevo;
    }

    @PostMapping("/carga-masiva")
    public ResponseEntity<?> cargaMasiva(@RequestParam("file") MultipartFile file, Authentication auth) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Por favor, seleccione un archivo."));
        }
        if (!file.getContentType().equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error: Solo se permiten archivos .xlsx"));
        }
        try {
            String correoUsuario = auth.getName();
            Usuario corredor = usuarioRepository.findByCorreo(correoUsuario)
                    .orElseThrow(() -> new RuntimeException("Corredor no encontrado: " + correoUsuario));

            int registrosProcesados = cargaMasivaService.procesarArchivo(file.getInputStream(), corredor);

            return ResponseEntity.ok(Map.of("message", "Archivo procesado exitosamente. " + registrosProcesados + " registros guardados."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }
}