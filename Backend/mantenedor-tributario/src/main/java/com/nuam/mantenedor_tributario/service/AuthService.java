package com.nuam.mantenedor_tributario.service;

import com.nuam.mantenedor_tributario.dto.LoginRequest;
import com.nuam.mantenedor_tributario.model.Usuario;
import com.nuam.mantenedor_tributario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Usuario autenticar(LoginRequest request) throws Exception {
        Usuario usuario = usuarioRepository.findByCorreo(request.getCorreo())
                .orElseThrow(() -> new Exception("Credenciales incorrectas."));

        if (usuario.isCuentaBloqueada()) {
            throw new Exception("¡CUENTA BLOQUEADA! Contacte a soporte o al administrador.");
        }

        if (passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            if (usuario.getIntentosFallidos() > 0) {
                usuario.setIntentosFallidos(0);
                usuarioRepository.save(usuario);
            }
            return usuario;
        } else {
            aumentarIntentosFallidos(usuario);

            int restantes = 5 - usuario.getIntentosFallidos();
            throw new Exception("Credenciales incorrectas. Intentos restantes: " + restantes);
        }
    }

    private void aumentarIntentosFallidos(Usuario usuario) {
        int nuevosIntentos = usuario.getIntentosFallidos() + 1;
        usuario.setIntentosFallidos(nuevosIntentos);

        if (nuevosIntentos >= 5) {
            usuario.setCuentaBloqueada(true);
        }

        usuarioRepository.save(usuario);
    }
}