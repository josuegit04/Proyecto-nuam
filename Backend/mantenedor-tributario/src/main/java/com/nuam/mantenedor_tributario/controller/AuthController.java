package com.nuam.mantenedor_tributario.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @GetMapping("/login")
    public String login(Authentication auth) {
        // Si Spring Security deja llegar hasta aquí, es que el login fue exitoso.
        return "Login exitoso. Usuario: " + auth.getName() + " - Roles: " + auth.getAuthorities();
    }
}