import React, { useState, useEffect } from 'react';

const styles = {
    tabs: { display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: '20px' },
    tab: (active) => ({
        padding: '15px 30px', cursor: 'pointer', fontWeight: 'bold', 
        borderBottom: active ? '3px solid #002D5C' : 'none', color: active ? '#002D5C' : '#666'
    }),
    btnEdit: { backgroundColor: '#ffc107', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#000', marginRight: '10px' },
    input: { padding: '5px', width: '100%', marginBottom: '10px' }
};

function DashboardAdmin() {
    const [activeTab, setActiveTab] = useState('MAIN');
    
    const [certificados, setCertificados] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [factores, setFactores] = useState([]);

    const [selectedCert, setSelectedCert] = useState(null);
    const [isEditingCert, setIsEditingCert] = useState(false); 
    const [editCertData, setEditCertData] = useState({}); 

    const [modalAction, setModalAction] = useState('DETALLE'); 
    const [observacion, setObservacion] = useState('');

    const [userModalOpen, setUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [userData, setUserData] = useState({ nombre: '', correo: '', rol: 'CORREDOR' });

    const [newFactor, setNewFactor] = useState({ anio: 2025, mes: 1, valor: '' });

    const auth = localStorage.getItem('auth');

    const fetchCertificados = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/corredor/certificados', { headers: { 'Authorization': auth } });
            if (res.ok) setCertificados(await res.json());
        } catch (e) { console.error(e); }
    };
    const fetchAuditoria = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/admin/auditoria', { headers: { 'Authorization': auth } });
            if (res.ok) setEventos(await res.json());
        } catch (e) { console.error(e); }
    };
    const fetchUsuarios = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/admin/usuarios', { headers: { 'Authorization': auth } });
            if (res.ok) setUsuarios(await res.json());
        } catch (e) { console.error(e); }
    };
    const fetchFactores = async () => {
        try {
            const res = await fetch('http://localhost:8080/api/admin/factores', { headers: { 'Authorization': auth } });
            if (res.ok) setFactores(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchData = async () => {
        await fetchCertificados();
        await fetchAuditoria();
        await fetchUsuarios();
        await fetchFactores();
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEditCertSave = async () => {
        const res = await fetch(`http://localhost:8080/api/admin/certificados/${selectedCert.id}`, {
            method: 'PUT',
            headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
            body: JSON.stringify(editCertData)
        });
        if (res.ok) {
            alert('Certificado Actualizado');
            setIsEditingCert(false);
            fetchCertificados();
            setSelectedCert(null);
        }
    };

    const handleProcessCert = async (estado) => {
        if (estado === 'RECHAZADO' && !observacion.trim()) { alert("Falta observación"); return; }
        const res = await fetch(`http://localhost:8080/api/auditor/certificados/${selectedCert.id}/estado`, { 
            method: 'PUT', headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado, observacion })
        });
        if (res.ok) { fetchCertificados(); setSelectedCert(null); fetchAuditoria(); }
    };

    const handleDeleteCert = async (id) => {
        if(!window.confirm("¿Eliminar?")) return;
        const res = await fetch(`http://localhost:8080/api/admin/certificados/${id}`, { method: 'DELETE', headers: { 'Authorization': auth } });
        if(res.ok) { fetchCertificados(); setSelectedCert(null); fetchAuditoria(); }
    };

    const handleSaveUser = async (e) => {
        e.preventDefault();
        const url = editingUser ? `http://localhost:8080/api/admin/usuarios/${editingUser.id}` : 'http://localhost:8080/api/admin/usuarios';
        const method = editingUser ? 'PUT' : 'POST';
        const res = await fetch(url, {
            method: method, headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        if (res.ok) { setUserModalOpen(false); fetchUsuarios(); fetchAuditoria(); }
    };
    const handleUnlock = async (id) => {
        await fetch(`http://localhost:8080/api/admin/usuarios/${id}/desbloquear`, { method: 'PUT', headers: { 'Authorization': auth } });
        fetchUsuarios();
    };
    const handleDeleteUser = async (id) => {
        if(window.confirm("¿Borrar usuario?")) {
            await fetch(`http://localhost:8080/api/admin/usuarios/${id}`, { method: 'DELETE', headers: { 'Authorization': auth } });
            fetchUsuarios();
        }
    };

    const handleSaveFactor = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:8080/api/admin/factores', {
            method: 'POST', headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
            body: JSON.stringify(newFactor)
        });
        if (res.ok) { fetchFactores(); fetchAuditoria(); } else { alert("Error al guardar factor"); }
    };

    return (
        <div>
            <div style={styles.tabs}>
                <div style={styles.tab(activeTab === 'MAIN')} onClick={() => setActiveTab('MAIN')}>Principal (Certificados + Log)</div>
                <div style={styles.tab(activeTab === 'USUARIOS')} onClick={() => setActiveTab('USUARIOS')}>Gestión Usuarios</div>
                <div style={styles.tab(activeTab === 'FACTORES')} onClick={() => setActiveTab('FACTORES')}>Factores IPC</div>
            </div>

            {activeTab === 'MAIN' && (
                <div>
                    <div className="card">
                        <h2>Gestión de Certificados</h2>
                        <table>
                            <thead><tr><th>Folio</th><th>Código</th><th>Tipo</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {certificados.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.nroCertificado}</td>
                                        <td>{c.codigoCertificado}</td>
                                        <td>{c.tipoCertificado?.codigo}</td>
                                        <td>${c.montoPago?.toLocaleString('es-CL')}</td>
                                        <td style={{fontWeight:'bold', color: c.estado==='PENDIENTE'?'orange':c.estado==='APROBADO'?'green':'red'}}>{c.estado}</td>
                                        <td>
                                            <button className="btn-primary" style={{padding:'5px 10px'}} onClick={() => { setSelectedCert(c); setIsEditingCert(false); setModalAction('DETALLE'); }}>
                                                Gestionar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="card" style={{marginTop: '20px'}}>
                        <h2>Log de Auditoría (Actividad Reciente)</h2>
                        <div style={{maxHeight:'300px', overflowY:'auto'}}>
                            <table>
                                <thead><tr><th>Fecha</th><th>Usuario</th><th>Evento</th></tr></thead>
                                <tbody>
                                    {eventos.map(e => (
                                        <tr key={e.id}>
                                            <td>{new Date(e.fechaEvento).toLocaleString()}</td>
                                            <td>{e.usuarioCorreo}</td>
                                            <td>{e.evento}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'USUARIOS' && (
                <div className="card">
                    <div style={{display:'flex', justifyContent:'space-between'}}>
                        <h2>Usuarios</h2>
                        <button className="btn-primary" style={{width:'auto'}} onClick={() => { setEditingUser(null); setUserData({}); setUserModalOpen(true); }}>+ Nuevo</button>
                    </div>
                    <table>
                        <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id} style={{backgroundColor: u.cuentaBloqueada?'#fff3cd':'white'}}>
                                    <td>{u.nombre}</td><td>{u.correo}</td><td>{u.rol}</td>
                                    <td>{u.cuentaBloqueada ? 'BLOQUEADO' : 'Activo'}</td>
                                    <td>
                                        <button onClick={() => { setEditingUser(u); setUserData(u); setUserModalOpen(true); }}>✏️</button>
                                        <button onClick={() => handleDeleteUser(u.id)} style={{marginLeft:'5px'}}>🗑</button>
                                        {u.cuentaBloqueada && <button onClick={() => handleUnlock(u.id)} style={{marginLeft:'5px'}}>🔓</button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'FACTORES' && (
                <div className="card">
                    <h2>Factores de Actualización (IPC)</h2>
                    <form onSubmit={handleSaveFactor} style={{display:'flex', gap:'10px', alignItems:'end', marginBottom:'20px'}}>
                        <div><label>Año</label><input type="number" value={newFactor.anio} onChange={e=>setNewFactor({...newFactor, anio:e.target.value})} style={{width:'80px'}}/></div>
                        <div><label>Mes</label><input type="number" value={newFactor.mes} onChange={e=>setNewFactor({...newFactor, mes:e.target.value})} style={{width:'60px'}}/></div>
                        <div><label>Valor (Ej: 1.045)</label><input type="number" step="0.001" value={newFactor.valor} onChange={e=>setNewFactor({...newFactor, valor:e.target.value})} style={{width:'100px'}}/></div>
                        <button className="btn-primary" style={{width:'auto', padding:'10px'}}>Guardar Factor</button>
                    </form>
                    <table>
                        <thead><tr><th>Año</th><th>Mes</th><th>Valor Factor</th></tr></thead>
                        <tbody>
                            {factores.map(f => (
                                <tr key={f.id}>
                                    <td>{f.anio}</td><td>{f.mes}</td><td><strong>{f.valor}</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedCert && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{isEditingCert ? 'Editando Certificado' : `Certificado #${selectedCert.nroCertificado}`}</h3>
                        
                        {isEditingCert ? (
                            <div>
                                <label>RUT Emisor:</label>
                                <input type="text" style={styles.input} defaultValue={selectedCert.rutEmisor} onChange={e=>setEditCertData({...editCertData, rutEmisor:e.target.value})} />
                                <label>Monto Pago ($):</label>
                                <input type="number" style={styles.input} defaultValue={selectedCert.montoPago} onChange={e=>setEditCertData({...editCertData, montoPago:e.target.value})} />
                                <div style={{marginTop:'10px'}}>
                                    <button className="btn-primary" onClick={handleEditCertSave}>Guardar Cambios</button>
                                    <button className="btn-secondary" onClick={()=>setIsEditingCert(false)} style={{marginLeft:'10px'}}>Cancelar</button>
                                </div>
                            </div>
                        ) : (
                            <div className="detail-grid">
                                <div><strong>Emisor:</strong> {selectedCert.rutEmisor}</div>
                                <div><strong>Titular:</strong> {selectedCert.rutTitular}</div>
                                <div><strong>Monto:</strong> ${selectedCert.montoPago}</div>
                                <div><strong>Monto Actualizado:</strong> ${selectedCert.montoActualizado}</div>
                                <div><strong>Factor:</strong> {selectedCert.factorAplicado}</div>
                            </div>
                        )}

                        {!isEditingCert && modalAction === 'RECHAZAR' && (
                            <textarea className="reject-reason" placeholder="Motivo..." value={observacion} onChange={e=>setObservacion(e.target.value)} />
                        )}

                        {!isEditingCert && (
                            <div className="modal-actions" style={{marginTop:'20px', borderTop:'1px solid #eee', paddingTop:'10px'}}>
                                <button className="btn-secondary" onClick={()=>setSelectedCert(null)}>Cerrar</button>
                                
                                <button style={styles.btnEdit} onClick={()=>{ setIsEditingCert(true); setEditCertData({}); }}>✏️ Editar Datos</button>

                                {selectedCert.estado === 'PENDIENTE' && modalAction === 'DETALLE' && (
                                    <>
                                        <button style={{backgroundColor:'#dc3545', color:'white', border:'none', padding:'10px', borderRadius:'4px', marginRight:'5px'}} onClick={()=>setModalAction('RECHAZAR')}>Rechazar</button>
                                        <button style={{backgroundColor:'#28a745', color:'white', border:'none', padding:'10px', borderRadius:'4px'}} onClick={()=>handleProcessCert('APROBADO')}>Aprobar</button>
                                    </>
                                )}
                                {modalAction === 'RECHAZAR' && <button className="btn-primary" onClick={()=>handleProcessCert('RECHAZADO')}>Confirmar Rechazo</button>}
                                <button style={{backgroundColor:'#b20000', color:'white', border:'none', padding:'10px', borderRadius:'4px', marginLeft:'auto'}} onClick={()=>handleDeleteCert(selectedCert.id)}>Eliminar</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {userModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{editingUser ? 'Editar Usuario' : 'Crear Usuario'}</h3>
                        <form onSubmit={handleSaveUser}>
                            <input type="text" placeholder="Nombre" value={userData.nombre} onChange={e=>setUserData({...userData, nombre:e.target.value})} required style={styles.input}/>
                            <input type="email" placeholder="Correo" value={userData.correo} onChange={e=>setUserData({...userData, correo:e.target.value})} required style={styles.input}/>
                            <input type="password" placeholder="Contraseña" value={userData.password||''} onChange={e=>setUserData({...userData, password:e.target.value})} style={styles.input}/>
                            <select value={userData.rol} onChange={e=>setUserData({...userData, rol:e.target.value})} style={styles.input}>
                                <option value="CORREDOR">CORREDOR</option>
                                <option value="AUDITOR">AUDITOR</option>
                                <option value="ADMIN">ADMIN</option>
                            </select>
                            <button className="btn-primary">Guardar</button>
                            <button type="button" className="btn-secondary" onClick={()=>setUserModalOpen(false)} style={{marginLeft:'10px'}}>Cancelar</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardAdmin;