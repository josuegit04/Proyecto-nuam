package com.nuam.mantenedor_tributario.repository;

import com.nuam.mantenedor_tributario.model.Factor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FactorRepository extends JpaRepository<Factor, Long> {
    Optional<Factor> findByAnioAndMes(Integer anio, Integer mes);
}