import React, { useState, useEffect } from 'react';

function DashboardAuditor() {
    const [certificados, setCertificados] = useState([]);
    const [error, setError] = useState('');
    
    const [selectedCert, setSelectedCert] = useState(null);
    const [modalAction, setModalAction] = useState(null); 
    const [observacion, setObservacion] = useState('');

    const auth = localStorage.getItem('auth');

    useEffect(() => { fetchCertificados(); }, []);

    const fetchCertificados = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/corredor/certificados', { 
                headers: { 'Authorization': auth }
            });
            if (response.ok) setCertificados(await response.json());
        } catch (error) { console.error(error); }
    };

    const openDetalles = (cert) => {
        setSelectedCert(cert);
        setModalAction('DETALLE');
        setObservacion('');
    };

    const openRechazo = (cert) => {
        setSelectedCert(cert);
        setModalAction('RECHAZAR');
        setObservacion('');
    };

    const handleProcess = async (estado) => {
        if (estado === 'RECHAZADO' && !observacion.trim()) {
            alert("Debe ingresar una observación para rechazar.");
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/auditor/certificados/${selectedCert.id}/estado`, { 
                method: 'PUT',
                headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: estado, observacion: observacion })
            });
            if (response.ok) {
                const updated = await response.json();
                setCertificados(prev => prev.map(c => c.id === updated.id ? updated : c));
                closeModal();
            }
        } catch (error) { console.error("Error:", error); }
    };

    const closeModal = () => { setSelectedCert(null); setModalAction(null); };

    return (
        <div className="card">
            <h2>Bandeja de Entrada - Auditoría</h2>
            
            <table>
                <thead>
                    <tr>
                        <th>Folio</th>
                        <th>Cód. Interno</th>
                        <th>Tipo Certificado</th>
                        <th>Monto Total</th>
                        <th>Estado</th>
                        <th>Acción</th> 
                    </tr>
                </thead>
                <tbody>
                    {certificados.map(cert => (
                        <tr key={cert.id}>
                            <td>{cert.nroCertificado}</td>
                            <td>{cert.codigoCertificado}</td>
                            <td>{cert.tipoCertificado?.nombre}</td>
                            <td>${cert.montoPago?.toLocaleString('es-CL')}</td>
                            <td style={{fontWeight: 'bold', color: cert.estado === 'PENDIENTE' ? 'orange' : cert.estado === 'APROBADO' ? 'green' : 'red'}}>
                                {cert.estado}
                            </td>
                            <td>
                                <button className="btn-primary" style={{fontSize: '13px', padding: '6px 12px'}} onClick={() => openDetalles(cert)}>
                                    🔍 Revisar Detalle
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedCert && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px'}}>
                            <h3 style={{margin:0, color: '#002D5C'}}>Revisión de Certificado</h3>
                            <small>Folio: {selectedCert.nroCertificado} | ID Sistema: {selectedCert.codigoCertificado}</small>
                        </div>
                        
                        <div className="detail-grid">
                            <div className="detail-item">
                                <strong>Emisor (Empresa):</strong> 
                                {selectedCert.rutEmisor}-{selectedCert.dvEmisor}
                            </div>
                            <div className="detail-item">
                                <strong>Titular (Empleado):</strong> 
                                {selectedCert.rutTitular}-{selectedCert.dvTitular}
                            </div>
                            
                            <div className="detail-item">
                                <strong>Tipo Documento:</strong> 
                                {selectedCert.tipoCertificado?.codigo} - {selectedCert.tipoCertificado?.nombre}
                            </div>
                            <div className="detail-item">
                                <strong>Año Tributario:</strong> 
                                {selectedCert.anioTributario}
                            </div>
                            
                            <div className="detail-item">
                                <strong>Monto Informado:</strong> 
                                <span style={{fontSize: '1.2em', fontWeight: 'bold', color: '#002D5C'}}>
                                    ${selectedCert.montoPago?.toLocaleString('es-CL')} {selectedCert.tipoMoneda}
                                </span>
                            </div>
                            <div className="detail-item">
                                <strong>Fecha de Pago:</strong> 
                                {selectedCert.fechaPago}
                            </div>
                        </div>

                        {modalAction === 'RECHAZAR' && (
                            <div style={{marginTop: '20px', backgroundColor: '#fff3cd', padding: '15px', borderRadius: '5px'}}>
                                <label style={{color: '#856404', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>
                                    Motivo del Rechazo (Requerido):
                                </label>
                                <textarea 
                                    className="reject-reason"
                                    placeholder="Ej: El monto no coincide con la DJ 1887 presentada ante el SII..."
                                    value={observacion}
                                    onChange={(e) => setObservacion(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="modal-actions" style={{borderTop: '1px solid #eee', paddingTop: '20px'}}>
                            <button className="btn-secondary" onClick={closeModal}>Cerrar / Cancelar</button>
                            
                            {selectedCert.estado === 'PENDIENTE' && modalAction === 'DETALLE' && (
                                <>
                                    <button 
                                        style={{backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}} 
                                        onClick={() => openRechazo(selectedCert)}
                                    >
                                        ✕ Rechazar
                                    </button>
                                    <button 
                                        style={{backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}} 
                                        onClick={() => handleProcess('APROBADO')}
                                    >
                                        ✓ Aprobar Certificado
                                    </button>
                                </>
                            )}

                            {modalAction === 'RECHAZAR' && (
                                <button 
                                    style={{backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}} 
                                    onClick={() => handleProcess('RECHAZADO')}
                                >
                                    Confirmar Rechazo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardAuditor;