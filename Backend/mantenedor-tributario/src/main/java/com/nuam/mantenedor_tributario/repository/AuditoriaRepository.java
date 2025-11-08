package com.nuam.mantenedor_tributario.repository;

import com.nuam.mantenedor_tributario.model.AuditoriaEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditoriaRepository extends JpaRepository<AuditoriaEvento, Long> {
    // Método para obtener los últimos 50 eventos para el dashboard
    List<AuditoriaEvento> findTop50ByOrderByIdDesc();
}