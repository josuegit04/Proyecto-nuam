package com.nuam.mantenedor_tributario.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "certificados")
public class Certificado {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "codigo_tipo_certificado")
    private TipoCertificado tipoCertificado;

    @Column(name = "rut_emisor")
    private String rutEmisor;
    @Column(name = "dv_emisor")
    private String dvEmisor;

    @Column(name = "rut_titular")
    private String rutTitular;
    @Column(name = "dv_titular")
    private String dvTitular;

    @Column(name = "codigo_certificado", unique = true)
    private String codigoCertificado;

    @Column(name = "nro_certificado")
    private Long nroCertificado; // <--- OJO CON ESTE

    @Column(name = "anio_tributario")
    private Integer anioTributario;

    @Column(name = "tipo_moneda")
    private String tipoMoneda;

    @Column(name = "monto_pago")
    private BigDecimal montoPago;

    @Column(name = "fecha_pago")
    private LocalDate fechaPago;

    private String estado;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @ManyToOne
    @JoinColumn(name = "corredor_id")
    private Usuario corredor;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public TipoCertificado getTipoCertificado() { return tipoCertificado; }
    public void setTipoCertificado(TipoCertificado tipoCertificado) { this.tipoCertificado = tipoCertificado; }

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

    public BigDecimal getMontoPago() { return montoPago; } // IMPORTANTE
    public void setMontoPago(BigDecimal montoPago) { this.montoPago = montoPago; }

    public LocalDate getFechaPago() { return fechaPago; } // IMPORTANTE
    public void setFechaPago(LocalDate fechaPago) { this.fechaPago = fechaPago; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public Usuario getCorredor() { return corredor; }
    public void setCorredor(Usuario corredor) { this.corredor = corredor; }

    public String getPdfUrl() { return pdfUrl; }
    public void setPdfUrl(String pdfUrl) { this.pdfUrl = pdfUrl; }
}