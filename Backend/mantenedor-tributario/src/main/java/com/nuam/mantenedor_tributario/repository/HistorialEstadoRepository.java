package com.nuam.mantenedor_tributario.repository;

import com.nuam.mantenedor_tributario.model.HistorialEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistorialEstadoRepository extends JpaRepository<HistorialEstado, Long> {

    List<HistorialEstado> findByCertificadoIdOrderByFechaCambioDesc(Long certificadoId);
}