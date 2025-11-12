package com.nuam.mantenedor_tributario.repository;

import com.nuam.mantenedor_tributario.model.Certificado;
import com.nuam.mantenedor_tributario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CertificadoRepository extends JpaRepository<Certificado, Long> {
    List<Certificado> findByCorredor(Usuario corredor);}