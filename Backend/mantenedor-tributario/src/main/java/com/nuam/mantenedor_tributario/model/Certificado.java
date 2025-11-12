package com.nuam.mantenedor_tributario.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min; // <-- 1. IMPORTA ESTO
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "certificados")
public class Certificado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String codigo;
    private String tipo;

    @Min(value = 0, message = "El monto no puede ser negativo") // <-- 2. AGREGA ESTA LÍNEA
    private BigDecimal monto;

    @Column(precision = 10, scale = 6)
    private BigDecimal factor;

    private LocalDate fecha;
    private String estado;

    @ManyToOne
    @JoinColumn(name = "corredor_id")
    private Usuario corredor;

    // ... (El resto de tus Getters y Setters) ...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }
    public BigDecimal getFactor() { return factor; }
    public void setFactor(BigDecimal factor) { this.factor = factor; }
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Usuario getCorredor() { return corredor; }
    public void setCorredor(Usuario corredor) { this.corredor = corredor; }
}