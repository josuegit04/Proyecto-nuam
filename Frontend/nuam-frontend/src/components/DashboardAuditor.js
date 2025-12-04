import React, { useState, useEffect } from 'react';

const styles = {
    tabs: { display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: '20px' },
    tab: (active) => ({
        padding: '15px 30px', cursor: 'pointer', fontWeight: 'bold', 
        borderBottom: active ? '3px solid #002D5C' : 'none', color: active ? '#002D5C' : '#666'
    }),
    modalTabs: { display: 'flex', borderBottom: '1px solid #ddd', marginBottom: '15px' },
    modalTab: (active) => ({
        padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold',
        backgroundColor: active ? '#f0f4f8' : 'transparent',
        borderBottom: active ? '2px solid #002D5C' : 'none',
        color: active ? '#002D5C' : '#666'
    })
};

function DashboardAuditor() {
    const [activeTab, setActiveTab] = useState('BANDEJA');
    const [certificados, setCertificados] = useState([]);
    const [logs, setLogs] = useState([]);
    const [factores, setFactores] = useState([]);
    
    const [selectedCert, setSelectedCert] = useState(null);
    const [modalAction, setModalAction] = useState('DETALLE'); 
    const [observacion, setObservacion] = useState('');
    
    const [modalTab, setModalTab] = useState('INFO');

    const auth = localStorage.getItem('auth');

    useEffect(() => {
        fetchCertificados();
        fetchLogs();
        fetchFactores();
    }, []);

    const fetchCertificados = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/corredor/certificados', { headers: { 'Authorization': auth } });
            if (res.ok) setCertificados(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/auditor/logs', { headers: { 'Authorization': auth } });
            if (res.ok) setLogs(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchFactores = async () => {
            try {
                const res = await fetch('http://localhost:8080/api/auditor/factores', { headers: { 'Authorization': auth } });
                if (res.ok) setFactores(await res.json());
            } catch (e) { console.error(e); }
        };

    const handleProcess = async (estado) => {
        if (estado === 'RECHAZADO' && !observacion.trim()) { alert("Debe ingresar observación."); return; }
        const res = await fetch(`http://localhost:8080/api/auditor/certificados/${selectedCert.id}/estado`, { 
            method: 'PUT', headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado, observacion })
        });
        if (res.ok) { fetchCertificados(); setSelectedCert(null); fetchLogs(); }
    };

    const openModal = (cert) => {
        setSelectedCert(cert);
        setModalAction('DETALLE');
        setModalTab('INFO');
        setObservacion('');
    };

    return (
        <div>
            <div style={styles.tabs}>
                <div style={styles.tab(activeTab === 'BANDEJA')} onClick={() => setActiveTab('BANDEJA')}>Revisión Certificados</div>
                <div style={styles.tab(activeTab === 'LOGS')} onClick={() => setActiveTab('LOGS')}>Log del Sistema</div>
            </div>

            {activeTab === 'BANDEJA' && (
                <div className="card">
                    <h2>Certificados por Revisar</h2>
                    <table>
                        <thead><tr><th>Folio</th><th>Tipo</th><th>Monto Total</th><th>Estado</th><th>Acción</th></tr></thead>
                        <tbody>
                            {certificados.map(c => (
                                <tr key={c.id}>
                                    <td>{c.nroCertificado}</td>
                                    <td>{c.tipoCertificado?.nombre}</td>
                                    <td>${c.montoPago?.toLocaleString('es-CL')}</td>
                                    <td style={{fontWeight:'bold', color: c.estado==='PENDIENTE'?'orange':c.estado==='APROBADO'?'green':'red'}}>{c.estado}</td>
                                    <td>
                                        <button className="btn-primary" style={{padding:'5px 10px'}} onClick={() => openModal(c)}>
                                            🔍 Revisar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'LOGS' && (
                <div className="card">
                    <h2>Auditoría Global (Solo Lectura)</h2>
                    <div style={{maxHeight:'400px', overflowY:'auto'}}>
                        <table>
                            <thead><tr><th>Fecha</th><th>Usuario</th><th>Evento</th></tr></thead>
                            <tbody>
                                {logs.map(L => (
                                    <tr key={L.id}>
                                        <td>{new Date(L.fechaEvento).toLocaleString()}</td>
                                        <td>{L.usuarioCorreo}</td>
                                        <td>{L.evento}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedCert && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Revisión Certificado #{selectedCert.nroCertificado}</h3>
                        
                        <div style={styles.modalTabs}>
                            <div style={styles.modalTab(modalTab === 'INFO')} onClick={() => setModalTab('INFO')}>
                                Datos del Certificado
                            </div>
                            <div style={styles.modalTab(modalTab === 'FACTORES')} onClick={() => setModalTab('FACTORES')}>
                                Verificar Tabla IPC
                            </div>
                        </div>

                        {modalTab === 'INFO' && (
                            <>
                                <div className="detail-grid">
                                    <div><strong>Emisor:</strong> {selectedCert.rutEmisor}</div>
                                    <div><strong>Titular:</strong> {selectedCert.rutTitular}</div>
                                    <div><strong>Tipo:</strong> {selectedCert.tipoCertificado?.nombre}</div>
                                    <div><strong>Fecha Pago:</strong> {selectedCert.fechaPago}</div>
                                    
                                    <div style={{gridColumn:'1 / -1', borderTop:'1px dashed #ccc', marginTop:'10px', paddingTop:'10px'}}>
                                        <strong>Cálculo Tributario Automático:</strong>
                                        <div style={{display:'flex', justifyContent:'space-between', marginTop:'5px', backgroundColor:'#f9f9f9', padding:'10px', borderRadius:'5px'}}>
                                            <span>Monto Histórico: <br/>${selectedCert.montoPago?.toLocaleString('es-CL')}</span>
                                            <span>x Factor (Mes): <br/><strong>{selectedCert.factorAplicado}</strong></span>
                                            <span style={{color:'#002D5C', fontWeight:'bold'}}>Monto Final:<br/> ${selectedCert.montoActualizado?.toLocaleString('es-CL')}</span>
                                        </div>
                                    </div>
                                </div>

                                {modalAction === 'RECHAZAR' && (
                                    <textarea className="reject-reason" placeholder="Razón del rechazo..." value={observacion} onChange={e=>setObservacion(e.target.value)} />
                                )}
                            </>
                        )}

                        {modalTab === 'FACTORES' && (
                            <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                                <p style={{fontSize:'13px', color:'#666', fontStyle:'italic'}}>
                                    * Utilice esta tabla oficial para corroborar que el factor aplicado en la pestaña anterior sea el correcto según el mes.
                                </p>
                                <table>
                                    <thead><tr><th>Año</th><th>Mes</th><th>Valor Factor</th></tr></thead>
                                    <tbody>
                                        {factores.map(f => (
                                            <tr key={f.id} style={{backgroundColor: (selectedCert.fechaPago && parseInt(selectedCert.fechaPago.split('-')[1]) === f.mes) ? '#e3f2fd' : 'transparent'}}>
                                                <td>{f.anio}</td>
                                                <td>{f.mes}</td>
                                                <td><strong>{f.valor}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <div className="modal-actions" style={{marginTop:'20px', borderTop:'1px solid #eee', paddingTop:'10px'}}>
                            <button className="btn-secondary" onClick={()=>setSelectedCert(null)}>Cerrar</button>
                            
                            {modalTab === 'INFO' && selectedCert.estado === 'PENDIENTE' && modalAction === 'DETALLE' && (
                                <>
                                    <button style={{backgroundColor:'#dc3545', color:'white', border:'none', padding:'10px', borderRadius:'4px', marginRight:'5px'}} onClick={()=>setModalAction('RECHAZAR')}>Rechazar</button>
                                    <button style={{backgroundColor:'#28a745', color:'white', border:'none', padding:'10px', borderRadius:'4px'}} onClick={()=>handleProcess('APROBADO')}>Aprobar</button>
                                </>
                            )}
                            
                            {modalTab === 'INFO' && modalAction === 'RECHAZAR' && (
                                <button className="btn-primary" style={{backgroundColor:'#dc3545'}} onClick={()=>handleProcess('RECHAZADO')}>Confirmar Rechazo</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardAuditor;