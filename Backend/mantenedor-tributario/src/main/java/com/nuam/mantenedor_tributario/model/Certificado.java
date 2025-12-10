package com.nuam.mantenedor_tributario.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "certificados")
public class Certificado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "codigo_tipo_certificado") private TipoCertificado tipoCertificado;
    @ManyToOne @JoinColumn(name = "corredor_id") private Usuario corredor;

    @OneToMany(mappedBy = "certificado", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleCertificado> detalles = new ArrayList<>();

    @Column(name = "mercado") private String mercado;
    @Column(name = "instrumento") private String instrumento;
    @Column(name = "secuencia_evento") private Long secuenciaEvento;
    @Column(name = "descripcion") private String descripcion;
    @Column(name = "is_fut") private Boolean isFut;
    @Column(name = "fuente_ingreso") private String fuenteIngreso; // MANUAL o ARCHIVO

    @Column(name = "rut_emisor") private String rutEmisor;
    @Column(name = "dv_emisor") private String dvEmisor;
    @Column(name = "rut_titular") private String rutTitular;
    @Column(name = "dv_titular") private String dvTitular;
    @Column(name = "codigo_certificado", unique = true) private String codigoCertificado;
    @Column(name = "nro_certificado") private Long nroCertificado;
    @Column(name = "anio_tributario") private Integer anioTributario;
    @Column(name = "tipo_moneda") private String tipoMoneda;
    @Column(name = "fecha_pago") private LocalDate fechaPago;

    @Column(name = "monto_pago") private BigDecimal montoPago;
    @Column(name = "monto_actualizado") private BigDecimal montoActualizado;
    @Column(name = "factor_aplicado") private Double factorAplicado;
    @Column(name = "observacion_rechazo") private String observacionRechazo;

    private String estado;
    @Column(name = "pdf_url") private String pdfUrl;

    public void addDetalle(DetalleCertificado detalle) {
        detalles.add(detalle);
        detalle.setCertificado(this);
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public List<DetalleCertificado> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleCertificado> detalles) { this.detalles = detalles; }
    public TipoCertificado getTipoCertificado() { return tipoCertificado; }
    public void setTipoCertificado(TipoCertificado tipoCertificado) { this.tipoCertificado = tipoCertificado; }
    public Usuario getCorredor() { return corredor; }
    public void setCorredor(Usuario corredor) { this.corredor = corredor; }
    public String getMercado() { return mercado; }
    public void setMercado(String mercado) { this.mercado = mercado; }
    public String getInstrumento() { return instrumento; }
    public void setInstrumento(String instrumento) { this.instrumento = instrumento; }
    public Long getSecuenciaEvento() { return secuenciaEvento; }
    public void setSecuenciaEvento(Long secuenciaEvento) { this.secuenciaEvento = secuenciaEvento; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Boolean getIsFut() { return isFut; }
    public void setIsFut(Boolean isFut) { this.isFut = isFut; }
    public String getFuenteIngreso() { return fuenteIngreso; }
    public void setFuenteIngreso(String fuenteIngreso) { this.fuenteIngreso = fuenteIngreso; }
    public String getRutEmisor() { return rutEmisor; }
    public void setRutEmisor(String rutEmisor) { this.rutEmisor = rutEmisor; }
    public String getDvEmisor() { return dvEmisor; }
    public void setDvEmisor(String dvEmisor) { this.dvEmisor = dvEmisor; }
    public String getRutTitular() { return rutTitular; }
    public void setRutTitular(String rutTitular) { this.rutTitular = rutTitular; }
    public String getDvTitular() { return dvTitular; }
    public void setDvTitular(String dvTitular) { this.dvTitular = dvTitular; }
    public String getCodigoCertificado() { return codigoCertificado; }
    public void setCodigoCertificado(String codigoCertificado) { this.codigoCertificado = codigoCertificado; }
    public Long getNroCertificado() { return nroCertificado; }
    public void setNroCertificado(Long nroCertificado) { this.nroCertificado = nroCertificado; }
    public Integer getAnioTributario() { return anioTributario; }
    public void setAnioTributario(Integer anioTributario) { this.anioTributario = anioTributario; }
    public String getTipoMoneda() { return tipoMoneda; }
    public void setTipoMoneda(String tipoMoneda) { this.tipoMoneda = tipoMoneda; }
    public LocalDate getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDate fechaPago) { this.fechaPago = fechaPago; }
    public BigDecimal getMontoPago() { return montoPago; }
    public void setMontoPago(BigDecimal montoPago) { this.montoPago = montoPago; }
    public BigDecimal getMontoActualizado() { return montoActualizado; }
    public void setMontoActualizado(BigDecimal montoActualizado) { this.montoActualizado = montoActualizado; }
    public Double getFactorAplicado() { return factorAplicado; }
    public void setFactorAplicado(Double factorAplicado) { this.factorAplicado = factorAplicado; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }
    public String getObservacionRechazo() { return observacionRechazo; }
    public void setObservacionRechazo(String observacionRechazo) { this.observacionRechazo = observacionRechazo; }
}