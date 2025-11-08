package com.nuam.mantenedor_tributario.service;

import com.nuam.mantenedor_tributario.model.AuditoriaEvento;
import com.nuam.mantenedor_tributario.repository.AuditoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuditoriaService {

    @Autowired
    private AuditoriaRepository auditoriaRepository;

    public void registrarEvento(String usuarioCorreo, String descripcionEvento) {
        AuditoriaEvento evento = new AuditoriaEvento();
        evento.setUsuarioCorreo(usuarioCorreo);
        evento.setEvento(descripcionEvento);
        evento.setFechaEvento(LocalDateTime.now());
        auditoriaRepository.save(evento);
    }
}