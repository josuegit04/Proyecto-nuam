package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.Certificado;
import com.nuam.mantenedor_tributario.model.Usuario;
import com.nuam.mantenedor_tributario.repository.CertificadoRepository;
import com.nuam.mantenedor_tributario.repository.UsuarioRepository;
import com.nuam.mantenedor_tributario.service.AuditoriaService;
import jakarta.validation.Valid; // <-- 1. IMPORTA ESTO
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
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
    // 2. AGREGA @Valid AQUÍ y arregla la firma duplicada
    public Certificado crearCertificado(@Valid @RequestBody Certificado certificado, Authentication auth) {

        String correoUsuario = auth.getName();
        Usuario corredor = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new RuntimeException("Corredor no encontrado para el correo: " + correoUsuario));

        // Calcular Factor (si el monto existe y es positivo)
        if (certificado.getMonto() != null && certificado.getMonto().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal divisor = new BigDecimal(50000);
            BigDecimal factorCalculado = certificado.getMonto().divide(divisor, 6, RoundingMode.HALF_UP);
            certificado.setFactor(factorCalculado);
        }

        certificado.setCorredor(corredor);
        Certificado nuevo = certificadoRepository.save(certificado);
        auditoriaService.registrarEvento(correoUsuario, "Creó certificado: " + nuevo.getCodigo() + " con factor: " + (nuevo.getFactor() != null ? nuevo.getFactor().toPlainString() : "N/A"));
        return nuevo;
    }
}