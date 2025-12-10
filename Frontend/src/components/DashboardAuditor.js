import React, { useState, useEffect, useCallback } from 'react';

const styles = {
    tabs: { display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: '20px' },
    tab: (active) => ({
        padding: '15px 30px', cursor: 'pointer', fontWeight: 'bold', 
        borderBottom: active ? '3px solid #002D5C' : 'none', color: active ? '#002D5C' : '#666'
    }),
    
    toast: (type) => ({
        position: 'fixed', top: '20px', right: '20px', zIndex: 3000,
        backgroundColor: type === 'success' ? '#4caf50' : '#f44336',
        color: 'white', padding: '15px 25px', borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)', fontWeight: 'bold',
        animation: 'fadeIn 0.3s ease-in-out'
    }),

    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    },

    confirmOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, 
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    },
    
    confirmBox: {
        backgroundColor: 'white', padding: '25px', borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)', maxWidth: '400px', width: '100%',
        textAlign: 'center'
    },

    badgeSuccess: { backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold', fontSize: '12px' },
    badgeError: { backgroundColor: '#ffebee', color: '#c62828', padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold', fontSize: '12px' }
};

const COLUMN_LABELS = {
    8:  "Factor 8 - Rentas RAP / Diferencia Inicial (Art 14 TER)",
    9:  "Factor 9 - Otras Rentas (Sin Prioridad)",
    10: "Factor 10 - Exceso Distribuciones Desproporcionadas",
    11: "Factor 11 - Utilidades ISFUT (Ley 20.780)",
    12: "Factor 12 - Rentas < 1983 / ISFUT (Ley 21.210)",
    13: "Factor 13 - Rentas Exentas IGC (Art 11 Ley 18.401)",
    14: "Factor 14 - Rentas Exentas IGC / Impuesto Adicional",
    15: "Factor 15 - Ingresos No Constitutivos de Renta (INR)",
    16: "Factor 16 - Crédito IDPC > 2017 (Sin Restitución)",
    17: "Factor 17 - Crédito IDPC > 2017 (Con Restitución)",
    18: "Factor 18 - Crédito IDPC Acumulado < 2016",
    19: "Factor 19 - Crédito IDPC Voluntario",
    20: "Factor 20 - Crédito IPE (Sin Restitución)",
    21: "Factor 21 - Crédito IPE (Con Restitución)",
    22: "Factor 22 - Crédito Art. 21 LIR",
    23: "Factor 23 - Otros Créditos / Impuestos Finales",
    24: "Factor 24 - Tasa Efectiva del Crédito (TEF)",
    25: "Factor 25 - Tasa Efectiva del Crédito (TEX)",
    26: "Factor 26 - Devolución de Capital (Art 17 N7)",
    27: "Factor 27 - Monto Retiro / Dividendo Reajustado",
    28: "Factor 28 - Incremento por Impuesto Primera Categoría",
    29: "Factor 29 - Crédito Total Disponible",
    30: "Factor 30 - Remanente de Crédito",
    31: "Factor 31 - Imputación al Fondo",
    32: "Factor 32 - Saldo STUT",
    33: "Factor 33 - Saldo SAC",
    34: "Factor 34 - Saldo REX",
    35: "Factor 35 - Saldo RAP",
    36: "Factor 36 - Saldo RAI",
    37: "Factor 37 - Devolución Art 17 (Exceso)"
};

function DashboardAuditor() {
    const [activeTab, setActiveTab] = useState('BANDEJA'); 
    
    const [certificados, setCertificados] = useState([]);
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); 
    
    const [selectedCert, setSelectedCert] = useState(null);
    const [modalAction, setModalAction] = useState('DETALLE'); 
    const [observacion, setObservacion] = useState('');
    
    const [notification, setNotification] = useState({ show: false, msg: '', type: '' });
    const [confirmModal, setConfirmModal] = useState({ show: false, msg: '', action: null });

    const auth = localStorage.getItem('auth');

    const showToast = (msg, type = 'success') => {
        setNotification({ show: true, msg, type });
        setTimeout(() => setNotification({ show: false, msg: '', type: '' }), 3000);
    };

    const requestConfirm = (msg, action) => {
        setConfirmModal({ show: true, msg, action });
    };

    const executeConfirm = () => {
        if (confirmModal.action) confirmModal.action();
        setConfirmModal({ show: false, msg: '', action: null });
    };

    const safeNumber = (val) => {
        if (val === null || val === undefined || val === '') return 0;
        const cleanVal = String(val).replace(',', '.');
        const num = parseFloat(cleanVal);
        return isNaN(num) ? 0 : num;
    };

    const fetchCertificados = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:8080/api/auditor/certificados', { headers: { 'Authorization': auth } });
            if (res.ok) setCertificados(await res.json());
        } catch (e) { console.error(e); }
    }, [auth]);

    const fetchLogs = useCallback(async () => {
        try {
            const res = await fetch('http://localhost:8080/api/auditor/logs', { headers: { 'Authorization': auth } });
            if (res.ok) setLogs(await res.json());
        } catch (e) { console.error(e); }
    }, [auth]);

    useEffect(() => {
        if (activeTab === 'BANDEJA') fetchCertificados();
        if (activeTab === 'LOGS') fetchLogs();
    }, [activeTab, fetchCertificados, fetchLogs]);

    const handleProcess = (estado) => {
        if (estado === 'RECHAZADO' && !observacion.trim()) { 
            showToast("Debe ingresar el motivo del rechazo.", 'error'); 
            return; 
        }

        requestConfirm(`¿Confirma que desea ${estado} este certificado?`, async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/auditor/certificados/${selectedCert.id}/estado`, { 
                    method: 'PUT', 
                    headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado, observacion })
                });
                
                if (res.ok) { 
                    showToast(`Certificado ${estado} correctamente.`, 'success');
                    setSelectedCert(null); 
                    fetchCertificados(); 
                    fetchLogs(); 
                } else {
                    const err = await res.json();
                    showToast("Error: " + (err.message || "No se pudo procesar"), 'error');
                }
            } catch (error) { showToast("Error de conexión", 'error'); }
        });
    };

    return (
        <div>
            {notification.show && (
                <div style={styles.toast(notification.type)}>
                    {notification.type === 'success' ? '✅' : '⚠️'} {notification.msg}
                </div>
            )}

            {confirmModal.show && (
                <div style={styles.modalOverlay}>
                    <div style={styles.confirmBox}>
                        <h3 style={{marginTop:0, color:'#002D5C'}}>Confirmación</h3>
                        <p style={{fontSize:'16px', margin:'20px 0'}}>{confirmModal.msg}</p>
                        <div style={{display:'flex', justifyContent:'center', gap:'15px'}}>
                            <button className="btn-secondary" onClick={()=>setConfirmModal({show:false, msg:'', action:null})}>Cancelar</button>
                            <button className="btn-primary" onClick={executeConfirm}>Aceptar</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.tabs}>
                <div style={styles.tab(activeTab === 'BANDEJA')} onClick={() => setActiveTab('BANDEJA')}>Revisión Certificados</div>
                <div style={styles.tab(activeTab === 'LOGS')} onClick={() => setActiveTab('LOGS')}>Log de Actividad</div>
            </div>

            {activeTab === 'BANDEJA' && (
                <div className="card">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                        <h2>Certificados por Revisar</h2>
                        <input 
                            type="text" 
                            placeholder="🔍 Buscar Folio / Instrumento..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{padding:'8px', width:'250px', borderRadius:'4px', border:'1px solid #ccc'}}
                        />
                    </div>

                    <table>
                        <thead><tr><th>Folio</th><th>Instrumento</th><th>Monto</th><th>Estado</th><th>Acción</th></tr></thead>
                        <tbody>
                            {certificados
                                .filter(c => 
                                    (c.nroCertificado?.toString() || "").includes(searchTerm) ||
                                    (c.instrumento?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                                )
                                .map(c => (
                                <tr key={c.id}>
                                    <td>{c.nroCertificado}</td>
                                    <td>{c.instrumento} ({c.mercado})</td>
                                    <td>${c.montoPago?.toLocaleString('es-CL')}</td>
                                    <td style={{fontWeight:'bold', color: c.estado==='PENDIENTE'?'orange':c.estado==='APROBADO'?'green':'red'}}>{c.estado}</td>
                                    <td>
                                        <button className="btn-primary" style={{padding:'5px 15px'}} onClick={() => { setSelectedCert(c); setModalAction('DETALLE'); setObservacion(''); }}>
                                            Revisar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {certificados.length > 0 && certificados.filter(c => (c.nroCertificado?.toString()||"").includes(searchTerm)).length === 0 && 
                                <tr><td colSpan="5" style={{textAlign:'center', padding:'15px'}}>No se encontraron resultados</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'LOGS' && (
                <div className="card">
                    <h2>Historial de Eventos</h2>
                    <div style={{maxHeight:'500px', overflowY:'auto'}}>
                        <table>
                            <thead><tr><th>Fecha / Hora</th><th>Usuario</th><th>Evento</th></tr></thead>
                            <tbody>
                                {logs.map(l => (
                                    <tr key={l.id}>
                                        <td style={{whiteSpace:'nowrap'}}>{new Date(l.fechaEvento).toLocaleString()}</td>
                                        <td style={{fontWeight:'bold', color:'#002D5C'}}>{l.usuarioCorreo}</td>
                                        <td>{l.evento}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedCert && (
                <div style={styles.modalOverlay}>
                    <div className="modal-content" style={{maxWidth:'700px'}}>
                        <h3>Revisión Folio #{selectedCert.nroCertificado}</h3>
                        
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'15px', paddingBottom:'10px', borderBottom:'1px solid #eee'}}>
                            <div><strong>Instrumento:</strong> {selectedCert.instrumento}</div>
                            <div><strong>Mercado:</strong> {selectedCert.mercado}</div>
                            <div><strong>RUT Emisor:</strong> {selectedCert.rutEmisor}</div>
                            <div><strong>Fecha Pago:</strong> {selectedCert.fechaPago}</div>
                            <div><strong>Monto Histórico:</strong> ${safeNumber(selectedCert.montoPago).toLocaleString('es-CL')}</div>
                            <div><strong>Factor IPC:</strong> {selectedCert.factorAplicado}</div>
                            <div><strong>Monto Actualizado:</strong> ${selectedCert.montoActualizado?.toLocaleString('es-CL')}</div>
                        </div>

                        <h4 style={{marginTop:'0', color:'#002D5C'}}>Factores de Atribución</h4>
                        <div style={{maxHeight:'200px', overflowY:'auto', border:'1px solid #ccc', backgroundColor:'#fafafa', padding:'5px'}}>
                            <table style={{width:'100%', fontSize:'13px'}}>
                                <thead>
                                    <tr style={{textAlign:'left'}}><th>Concepto</th><th>Monto Calculado ($)</th><th>Factor</th></tr>
                                </thead>
                                <tbody>
                                    {selectedCert.detalles && selectedCert.detalles.filter(d => d.factor > 0).length > 0 ? (
                                        selectedCert.detalles
                                            .filter(d => d.factor > 0)
                                            .sort((a,b) => a.numeroColumna - b.numeroColumna)
                                            .map(d => {
                                                const total = safeNumber(selectedCert.montoPago);
                                                const factor = safeNumber(d.factor);
                                                const montoVisual = Math.round(total * factor);

                                                return (
                                                    <tr key={d.id} style={{borderBottom:'1px solid #eee'}}>
                                                        <td>{COLUMN_LABELS[d.numeroColumna] || `F${d.numeroColumna}`}</td>
                                                        <td style={{fontWeight:'bold'}}>${montoVisual.toLocaleString('es-CL')}</td>
                                                        <td>{d.factor}</td>
                                                    </tr>
                                                );
                                            })
                                    ) : (
                                        <tr><td colSpan="3" style={{textAlign:'center', color:'#999'}}>No hay factores con atribución (Todos en 0).</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {modalAction === 'RECHAZAR' && (
                            <div style={{marginTop:'15px'}}>
                                <label style={{color:'red', fontWeight:'bold'}}>Motivo del Rechazo:</label>
                                <textarea 
                                    style={{width:'100%', padding:'10px', borderColor:'red', minHeight:'60px'}} 
                                    placeholder="Indique al corredor qué debe corregir..." 
                                    value={observacion} 
                                    onChange={e=>setObservacion(e.target.value)} 
                                />
                            </div>
                        )}

                        <div className="modal-actions" style={{marginTop:'20px', display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                            <button className="btn-secondary" onClick={()=>setSelectedCert(null)}>Cerrar</button>
                            
                            {selectedCert.estado === 'PENDIENTE' && modalAction !== 'RECHAZAR' && (
                                <>
                                    <button style={{backgroundColor:'#dc3545', color:'white', border:'none', padding:'10px 20px', borderRadius:'4px'}} onClick={()=>setModalAction('RECHAZAR')}>Rechazar</button>
                                    <button style={{backgroundColor:'#28a745', color:'white', border:'none', padding:'10px 20px', borderRadius:'4px'}} onClick={()=>handleProcess('APROBADO')}>Aprobar</button>
                                </>
                            )}
                            
                            {modalAction === 'RECHAZAR' && (
                                <button style={{backgroundColor:'#dc3545', color:'white', border:'none', padding:'10px 20px', borderRadius:'4px'}} onClick={()=>handleProcess('RECHAZADO')}>Confirmar Rechazo</button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {confirmModal.show && (
                <div style={styles.confirmOverlay}>
                    <div style={styles.confirmBox}>
                        <h3 style={{marginTop:0, color:'#002D5C'}}>Confirmación</h3>
                        <p style={{fontSize:'16px', margin:'20px 0'}}>{confirmModal.msg}</p>
                        <div style={{display:'flex', justifyContent:'center', gap:'15px'}}>
                            <button className="btn-secondary" onClick={()=>setConfirmModal({show:false, msg:'', action:null})}>Cancelar</button>
                            <button className="btn-primary" onClick={executeConfirm}>Aceptar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardAuditor;