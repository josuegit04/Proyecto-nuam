package com.nuam.mantenedor_tributario.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tipo_certificados")
public class TipoCertificado {

    @Id
    @Column(length = 10)
    private String codigo; // Ej: "C1887"

    @Column(nullable = false, length = 100)
    private String nombre;

    private String descripcion;

    public TipoCertificado() {}

    public TipoCertificado(String codigo) { this.codigo = codigo; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}