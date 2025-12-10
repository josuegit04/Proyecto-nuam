import React, { useState, useEffect, useCallback } from 'react';

const styles = {
    tabs: { display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: '20px' },
    tab: (active) => ({
        padding: '15px 30px', cursor: 'pointer', fontWeight: 'bold', 
        borderBottom: active ? '3px solid #002D5C' : 'none', color: active ? '#002D5C' : '#666'
    }),
    readField: { padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px', border: '1px solid #ddd', minHeight: '20px' },
    
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

function DashboardAdmin() {
    const [activeTab, setActiveTab] = useState('CERTIFICADOS'); 
    
    const [certificados, setCertificados] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [factores, setFactores] = useState([]);
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); 

    const [editingCert, setEditingCert] = useState(null); 
    const [isEditMode, setIsEditMode] = useState(false);
    
    const [certFormData, setCertFormData] = useState({});
    const [certDetalles, setCertDetalles] = useState([]);

    const [userForm, setUserForm] = useState({ nombre: '', correo: '', password: '', rol: 'CORREDOR' });
    const [editingUser, setEditingUser] = useState(null);
    const [factorForm, setFactorForm] = useState({ anio: 2024, mes: 1, valor: 0 });

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
            const res = await fetch('http://localhost:8080/api/corredor/certificados', { headers: { 'Authorization': auth } }); 
            if (res.ok) setCertificados(await res.json());
        } catch(e) { console.error(e); }
    }, [auth]);

    const fetchUsuarios = useCallback(async () => { 
        const res = await fetch('http://localhost:8080/api/admin/usuarios', { headers: { 'Authorization': auth } }); 
        if (res.ok) setUsuarios(await res.json());
    }, [auth]);

    const fetchFactores = useCallback(async () => { 
        const res = await fetch('http://localhost:8080/api/admin/factores', { headers: { 'Authorization': auth } }); 
        if (res.ok) setFactores(await res.json());
    }, [auth]);

    const fetchLogs = useCallback(async () => { 
        const res = await fetch('http://localhost:8080/api/admin/auditoria', { headers: { 'Authorization': auth } }); 
        if (res.ok) setLogs(await res.json());
    }, [auth]);

    useEffect(() => {
        if (activeTab === 'CERTIFICADOS') fetchCertificados();
        if (activeTab === 'USUARIOS') fetchUsuarios();
        if (activeTab === 'FACTORES') fetchFactores();
        if (activeTab === 'LOGS') fetchLogs();
    }, [activeTab, fetchCertificados, fetchUsuarios, fetchFactores, fetchLogs]);

    const openCertModal = (cert) => {
        setEditingCert(cert);
        setIsEditMode(false); 
        
        setCertFormData({
            estado: cert.estado,
            mercado: cert.mercado || 'Nacional',
            instrumento: cert.instrumento || '',
            secuenciaEvento: cert.secuenciaEvento || '',
            rutEmisor: cert.rutEmisor || '',
            montoPago: cert.montoPago || 0,
            fechaPago: cert.fechaPago || '',
            anioTributario: cert.anioTributario || 2024
        });
        
        const totalBase = safeNumber(cert.montoPago);
        const loadedDetalles = Array.from({ length: 30 }, (_, i) => ({ numeroColumna: i + 8, monto: 0, factor: 0 }));
        
        if (cert.detalles) {
            cert.detalles.forEach(d => {
                const idx = d.numeroColumna - 8;
                if (idx >= 0 && idx < 30) {
                    const factorVal = safeNumber(d.factor);
                    loadedDetalles[idx].factor = factorVal;
                    loadedDetalles[idx].monto = Math.round(totalBase * factorVal);
                }
            });
        }
        setCertDetalles(loadedDetalles);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setCertFormData(prev => {
            const newData = { ...prev, [name]: value };
            if (name === 'montoPago') {
                const nuevoTotal = safeNumber(value);
                setCertDetalles(prevDetalles => prevDetalles.map(d => ({
                    ...d,
                    monto: Math.round(safeNumber(d.factor) * nuevoTotal)
                })));
            }
            return newData;
        });
    };

    const handleDetalleChange = (idx, field, val) => {
        const nuevos = [...certDetalles];
        const montoTotal = safeNumber(certFormData.montoPago);

        if (field === 'factor') {
            nuevos[idx].factor = val;
            const factorNum = safeNumber(val);
            nuevos[idx].monto = Math.round(montoTotal * factorNum);
        } 
        else if (field === 'monto') {
            nuevos[idx].monto = val;
            const montoNum = safeNumber(val);
            if (montoTotal > 0) {
                nuevos[idx].factor = parseFloat((montoNum / montoTotal).toFixed(8));
            } else {
                nuevos[idx].factor = 0;
            }
        }
        setCertDetalles(nuevos);
    };

    const handleQuickState = (newState) => {
        requestConfirm(`¿Confirma marcar este certificado como ${newState}?`, async () => {
            try {
                const res = await fetch(`http://localhost:8080/api/admin/certificados/${editingCert.id}`, {
                    method: 'PUT',
                    headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado: newState }) 
                });

                if (res.ok) {
                    showToast(`Certificado ${newState} correctamente`, 'success');
                    setCertFormData(prev => ({ ...prev, estado: newState }));
                    fetchCertificados();
                    fetchLogs();
                    setEditingCert(null); 
                } else {
                    const err = await res.json();
                    showToast("Error: " + err.message, 'error');
                }
            } catch (e) { showToast("Error de conexión", 'error'); }
        });
    };

    const handleCertSave = async (e) => {
        e.preventDefault();
        const payload = { ...certFormData, detalles: certDetalles };
        try {
            const res = await fetch(`http://localhost:8080/api/admin/certificados/${editingCert.id}`, {
                method: 'PUT', 
                headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) { 
                showToast("Guardado correctamente", 'success');
                setEditingCert(null); 
                fetchCertificados(); 
                fetchLogs(); 
            } else { 
                const err = await res.json();
                showToast("Error: " + err.message, 'error'); 
            }
        } catch(e) { showToast("Error de conexión", 'error'); }
    };

    const handleCertDelete = (id) => {
        requestConfirm("¿Eliminar definitivamente este registro?", async () => {
            await fetch(`http://localhost:8080/api/admin/certificados/${id}`, { method: 'DELETE', headers: { 'Authorization': auth } });
            showToast("Registro eliminado", 'success');
            fetchCertificados(); fetchLogs();
        });
    };

    const handleUserSave = async (e) => { e.preventDefault(); const url=editingUser?`http://localhost:8080/api/admin/usuarios/${editingUser.id}`:'http://localhost:8080/api/admin/usuarios'; const method=editingUser?'PUT':'POST'; const res = await fetch(url,{method,headers:{'Authorization':auth,'Content-Type':'application/json'},body:JSON.stringify(userForm)}); if (res.ok) { fetchUsuarios(); setUserForm({ nombre: '', correo: '', password: '', rol: 'CORREDOR' }); setEditingUser(null); fetchLogs(); showToast("Usuario guardado", 'success'); } else { showToast("Error", 'error'); } };
    
    const handleUnlockUser = (id) => { 
        requestConfirm("¿Desbloquear este usuario?", async () => { 
            await fetch(`http://localhost:8080/api/admin/usuarios/${id}/desbloquear`, {method:'PUT',headers:{'Authorization':auth}}); 
            showToast("Usuario desbloqueado", 'success'); 
            fetchUsuarios(); fetchLogs(); 
        }); 
    };
    
    const handleUserDelete = (id) => { requestConfirm("¿Eliminar?", async () => { await fetch(`http://localhost:8080/api/admin/usuarios/${id}`, {method:'DELETE',headers:{'Authorization':auth}}); showToast("Eliminado", 'success'); fetchUsuarios(); fetchLogs(); }); };
    const handleFactorSave = async (e) => { e.preventDefault(); await fetch('http://localhost:8080/api/admin/factores', {method:'POST',headers:{'Authorization':auth,'Content-Type':'application/json'},body:JSON.stringify(factorForm)}); fetchFactores(); fetchLogs(); showToast("IPC guardado", 'success'); };

    return (
        <div>
            {notification.show && (
                <div style={styles.toast(notification.type)}>
                    {notification.type === 'success' ? '✅' : '⚠️'} {notification.msg}
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

            <div style={styles.tabs}>
                <div style={styles.tab(activeTab==='CERTIFICADOS')} onClick={()=>setActiveTab('CERTIFICADOS')}>Certificados</div>
                <div style={styles.tab(activeTab==='USUARIOS')} onClick={()=>setActiveTab('USUARIOS')}>Usuarios</div>
                <div style={styles.tab(activeTab==='FACTORES')} onClick={()=>setActiveTab('FACTORES')}>IPC</div>
                <div style={styles.tab(activeTab==='LOGS')} onClick={()=>setActiveTab('LOGS')}>Auditoría</div>
            </div>

            {activeTab === 'CERTIFICADOS' && (
                <div className="card">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                        <h2>Gestión Total de Certificados</h2>
                        <input type="text" placeholder="🔍 Buscar por Folio..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{padding:'8px', width:'300px', borderRadius:'4px', border:'1px solid #ccc'}} />
                    </div>
                    <table>
                        <thead><tr><th>Folio</th><th>Instrumento</th><th>Corredor</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {certificados.filter(c => (c.nroCertificado?.toString()||"").includes(searchTerm) || (c.instrumento?.toLowerCase()||"").includes(searchTerm.toLowerCase())).map(c => (
                                <tr key={c.id}>
                                    <td>{c.nroCertificado}</td>
                                    <td>{c.instrumento} ({c.mercado})</td>
                                    <td>{c.corredor?.correo}</td>
                                    <td style={{fontWeight:'bold', color: c.estado==='PENDIENTE'?'orange':c.estado==='APROBADO'?'green':'red'}}>{c.estado}</td>
                                    <td style={{width:150}}>
                                            <button className="btn-primary" style={{margin:'5px', padding:'5px 10px',width:150}} onClick={()=>openCertModal(c)}>Revisar Detalle</button>
                                        <button className="btn-primary" style={{backgroundColor:'#dc3545', padding:'5px 10px',width:150,margin:'5px'}} onClick={()=>handleCertDelete(c.id)}>🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'USUARIOS' && (
                <div className="card">
                    <h2>Gestión de Usuarios</h2>
                    <form onSubmit={handleUserSave} style={{display:'flex', gap:'10px', marginBottom:'20px', padding:'15px', background:'#f9f9f9', borderRadius:'5px'}}>
                        <input placeholder="Nombre" value={userForm.nombre} onChange={e=>setUserForm({...userForm, nombre:e.target.value})} required style={{padding:'8px'}} />
                        <input placeholder="Correo" type="email" value={userForm.correo} onChange={e=>setUserForm({...userForm, correo:e.target.value})} required style={{padding:'8px'}} />
                        <input placeholder="Password" type="password" value={userForm.password} onChange={e=>setUserForm({...userForm, password:e.target.value})} style={{padding:'8px'}} />
                        <select value={userForm.rol} onChange={e=>setUserForm({...userForm, rol:e.target.value})} style={{padding:'8px'}}>
                            <option value="CORREDOR">Corredor</option>
                            <option value="AUDITOR">Auditor</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                        <button className="btn-primary" type="submit">{editingUser ? 'Actualizar' : 'Crear Usuario'}</button>
                    </form>
                    <table>
                        <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id}>
                                    <td>{u.nombre}</td>
                                    <td>{u.correo}</td>
                                    <td>{u.rol}</td>
                                    <td>
                                        {u.cuentaBloqueada ? (
                                            <span style={styles.badgeError}>🛑 BLOQUEADO</span>
                                        ) : (
                                            <span style={styles.badgeSuccess}>🟢 ACTIVO</span>
                                        )}
                                    </td>
                                    <td style={{width:150}}>
                                        <button className="btn-primary" style={{margin:'5px', padding:'5px 10px',width:150}} onClick={()=>{setEditingUser(u); setUserForm({...u, password:''})}}>✏️</button>
                                        <button className="btn-primary" style={{backgroundColor:'#dc3545', margin:'5px', padding:'5px 10px',width:150}} onClick={()=>handleUserDelete(u.id)}>🗑️</button>
                                        {u.cuentaBloqueada && (
                                            <button 
                                                className="btn-primary" 
                                                style={{backgroundColor:'#ffc107', color:'black', padding:'5px 10px', fontWeight:'bold', margin:'5px',width:150}} 
                                                onClick={()=>handleUnlockUser(u.id)}
                                            >
                                                🔓 Desbloquear
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'FACTORES' && (
                <div className="card">
                    <h2>Tabla Oficial IPC</h2>
                    <form onSubmit={handleFactorSave} style={{margin:'20px', padding:'15px', background:'#f9f9f9', borderRadius:'5px'}}>
                        <input type="number" placeholder="Año" value={factorForm.anio} onChange={e=>setFactorForm({...factorForm, anio:e.target.value})} style={{width:'80px', marginRight:'10px', padding:'8px'}}/>
                        <input type="number" placeholder="Mes" value={factorForm.mes} onChange={e=>setFactorForm({...factorForm, mes:e.target.value})} style={{width:'60px', marginRight:'10px', padding:'8px'}}/>
                        <input type="number" step="0.001" placeholder="Valor" value={factorForm.valor} onChange={e=>setFactorForm({...factorForm, valor:e.target.value})} style={{width:'100px', marginRight:'10px', padding:'8px'}}/>
                        <button className="btn-primary" style={{marginTop:10}}>Guardar Factor</button>
                    </form>
                    <table><thead><tr><th>Año</th><th>Mes</th><th>Valor</th></tr></thead><tbody>{factores.map(f=>(<tr key={f.id}><td>{f.anio}</td><td>{f.mes}</td><td>{f.valor}</td></tr>))}</tbody></table>
                </div>
            )}

            {activeTab === 'LOGS' && (
                <div className="card">
                    <h2>Historial</h2>
                    <div style={{maxHeight:'400px', overflowY:'auto'}}><table><thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th></tr></thead><tbody>{logs.map(l=>(<tr key={l.id}><td>{new Date(l.fechaEvento).toLocaleString()}</td><td>{l.usuarioCorreo}</td><td>{l.evento}</td></tr>))}</tbody></table></div>
                </div>
            )}

            {editingCert && (
                <div style={styles.modalOverlay}>
                    <div className="modal-content" style={{maxWidth:'800px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee', paddingBottom:'10px', marginBottom:'15px'}}>
                            <h3 style={{margin:0}}>
                                {isEditMode ? `Editando #${editingCert.nroCertificado}` : `Detalle #${editingCert.nroCertificado}`}
                            </h3>
                            {!isEditMode && <button className="btn-primary" style={{backgroundColor:'#ffc107', color:'black'}} onClick={()=>setIsEditMode(true)}>✏️ Habilitar Edición</button>}
                        </div>

                        <form onSubmit={handleCertSave}>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'15px'}}>
                                <div><label>Estado</label>
                                    {isEditMode ? (
                                        <select name="estado" value={certFormData.estado} onChange={handleFormChange} style={{width:'100%', padding:'8px', fontWeight:'bold', color: certFormData.estado==='APROBADO'?'green':'red'}}>
                                            <option value="PENDIENTE">PENDIENTE</option>
                                            <option value="APROBADO">APROBADO</option>
                                            <option value="RECHAZADO">RECHAZADO</option>
                                        </select>
                                    ) : <div style={{...styles.readField, fontWeight:'bold', color: certFormData.estado==='APROBADO'?'green':(certFormData.estado==='RECHAZADO'?'red':'orange')}}>{certFormData.estado}</div>}
                                </div>
                                <div><label>Monto Total ($)</label>{isEditMode ? <input type="number" name="montoPago" value={certFormData.montoPago} onChange={handleFormChange} style={{width:'100%', fontWeight:'bold', background:'#e3f2fd'}}/> : <div style={styles.readField}>${parseFloat(certFormData.montoPago).toLocaleString('es-CL')}</div>}</div>
                                <div><label>Instrumento</label>{isEditMode?<input name="instrumento" value={certFormData.instrumento} onChange={handleFormChange} style={{width:'100%'}}/>:<div style={styles.readField}>{certFormData.instrumento}</div>}</div>
                                <div><label>RUT</label>{isEditMode?<input name="rutEmisor" value={certFormData.rutEmisor} onChange={handleFormChange} style={{width:'100%'}}/>:<div style={styles.readField}>{certFormData.rutEmisor}</div>}</div>
                                <div><label>Fecha Pago</label>{isEditMode?<input type="date" name="fechaPago" value={certFormData.fechaPago} onChange={handleFormChange} style={{width:'100%'}}/>:<div style={styles.readField}>{certFormData.fechaPago}</div>}</div>
                                <div><label>Secuencia</label>{isEditMode?<input name="secuenciaEvento" value={certFormData.secuenciaEvento} onChange={handleFormChange} style={{width:'100%'}}/>:<div style={styles.readField}>{certFormData.secuenciaEvento}</div>}</div>
                            </div>

                            <div style={{maxHeight:'250px', overflowY:'auto', border:'1px solid #ccc', padding:'5px', backgroundColor: isEditMode?'white':'#fafafa'}}>
                                <table style={{width:'100%', fontSize:'12px'}}>
                                    <thead><tr><th>Concepto</th><th>Monto</th><th>Factor</th></tr></thead>
                                    <tbody>
                                        {certDetalles.filter(d => isEditMode || d.factor > 0).map((d, idx) => (
                                            <tr key={idx}>
                                                <td style={{width:'50%'}}>{COLUMN_LABELS[d.numeroColumna] || `F${d.numeroColumna}`}</td>
                                                <td>{isEditMode ? <input type="number" value={d.monto} onChange={e=>handleDetalleChange(idx,'monto',e.target.value)} style={{width:'90px'}}/> : <span>{d.monto}</span>}</td>
                                                <td>{isEditMode ? <input type="number" step="0.0001" value={d.factor} onChange={e=>handleDetalleChange(idx,'factor',e.target.value)} style={{width:'90px'}}/> : <strong>{d.factor}</strong>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={{marginTop:'20px', display:'flex', justifyContent:'flex-end', gap:'10px'}}>
                                
                                {!isEditMode && certFormData.estado === 'PENDIENTE' && (
                                    <>
                                        <button type="button" className="btn-primary" style={{backgroundColor:'green'}} onClick={()=>handleQuickState('APROBADO')}>✅ Aprobar</button>
                                        <button type="button" className="btn-primary" style={{backgroundColor:'red'}} onClick={()=>handleQuickState('RECHAZADO')}>🛑 Rechazar</button>
                                    </>
                                )}

                                <button type="button" className="btn-secondary" onClick={()=>setEditingCert(null)}>Cerrar</button>
                                
                                {isEditMode && <button type="submit" className="btn-primary">Guardar Cambios</button>}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardAdmin;