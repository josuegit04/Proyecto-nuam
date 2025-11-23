package com.nuam.mantenedor_tributario.repository;

import com.nuam.mantenedor_tributario.model.TipoCertificado;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoCertificadoRepository extends JpaRepository<TipoCertificado, String> {
}