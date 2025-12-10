package com.nuam.mantenedor_tributario.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_certificados")
public class DetalleCertificado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_columna")
    private Integer numeroColumna;

    @Column(name = "monto")
    private BigDecimal monto;

    @Column(name = "factor")
    private Double factor;

    @ManyToOne
    @JoinColumn(name = "certificado_id")
    @JsonIgnore
    private Certificado certificado;

    public DetalleCertificado() {}
    public DetalleCertificado(Integer numeroColumna, BigDecimal monto, Double factor) {
        this.numeroColumna = numeroColumna;
        this.monto = monto;
        this.factor = factor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getNumeroColumna() { return numeroColumna; }
    public void setNumeroColumna(Integer numeroColumna) { this.numeroColumna = numeroColumna; }
    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }
    public Double getFactor() { return factor; }
    public void setFactor(Double factor) { this.factor = factor; }
    public Certificado getCertificado() { return certificado; }
    public void setCertificado(Certificado certificado) { this.certificado = certificado; }
}