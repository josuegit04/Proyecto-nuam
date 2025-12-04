package com.nuam.mantenedor_tributario.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "factores", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"anio", "mes"})
})
public class Factor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer anio;

    @Column(nullable = false)
    private Integer mes;

    @Column(nullable = false, precision = 5, scale = 3)
    private BigDecimal valor;

    public Factor() {}
    public Factor(Integer anio, Integer mes, BigDecimal valor) {
        this.anio = anio;
        this.mes = mes;
        this.valor = valor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getAnio() { return anio; }
    public void setAnio(Integer anio) { this.anio = anio; }
    public Integer getMes() { return mes; }
    public void setMes(Integer mes) { this.mes = mes; }
    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }
}