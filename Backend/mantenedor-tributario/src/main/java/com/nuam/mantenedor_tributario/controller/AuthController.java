package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.dto.LoginRequest;
import com.nuam.mantenedor_tributario.model.Usuario;
import com.nuam.mantenedor_tributario.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Usuario usuario = authService.autenticar(loginRequest);
            return ResponseEntity.ok("Login exitoso. Rol: " + usuario.getRol());

        } catch (Exception e) {

            if (e.getMessage().contains("BLOQUEADA")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}