package com.nuam.mantenedor_tributario.controller;

import com.nuam.mantenedor_tributario.model.AuditoriaEvento;
import com.nuam.mantenedor_tributario.repository.AuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AuditoriaRepository auditoriaRepository;

    @GetMapping("/auditoria")
    public List<AuditoriaEvento> getActividadReciente() {
        return auditoriaRepository.findTop50ByOrderByIdDesc();
    }
}