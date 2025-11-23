import React, { useState, useEffect } from 'react';

const buttonStyles = {
    delete: { backgroundColor: '#b20000', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
    unlock: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
    approve: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' },
    reject: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginRight: '10px' }
};

function DashboardAdmin() {
    const [eventos, setEventos] = useState([]); 
    const [certificados, setCertificados] = useState([]); 
    const [usuarios, setUsuarios] = useState([]); 
    const [error, setError] = useState('');
    
    const [selectedCert, setSelectedCert] = useState(null);
    const [modalAction, setModalAction] = useState('DETALLE');
    const [observacion, setObservacion] = useState('');

    const auth = localStorage.getItem('auth');

    useEffect(() => {
        fetchAuditoria();
        fetchCertificados();
        fetchUsuarios(); 
    }, []);

    const fetchAuditoria = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/auditoria', { headers: { 'Authorization': auth } });
            if (response.ok) setEventos(await response.json());
        } catch (error) { console.error(error); }
    };

    const fetchCertificados = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/corredor/certificados', { headers: { 'Authorization': auth } });
            if (response.ok) setCertificados(await response.json());
        } catch (error) { setError('Error de conexión.'); }
    };

    const fetchUsuarios = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/usuarios', { headers: { 'Authorization': auth } });
            if (response.ok) setUsuarios(await response.json());
        } catch (error) { console.error("Error cargando usuarios"); }
    };

    const handleDesbloquear = async (id, nombre) => {
        if (!window.confirm(`¿Confirmas desbloquear al usuario ${nombre}?`)) return;
        try {
            const response = await fetch(`http://localhost:8080/api/admin/usuarios/${id}/desbloquear`, {
                method: 'PUT', headers: { 'Authorization': auth }
            });
            if (response.ok) {
                alert("Usuario desbloqueado.");
                fetchUsuarios(); 
                fetchAuditoria(); 
            }
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("⚠️ ¿Estás seguro de ELIMINAR este certificado?")) return;
        try {
            const response = await fetch(`http://localhost:8080/api/admin/certificados/${id}`, { 
                method: 'DELETE', headers: { 'Authorization': auth } 
            });
            if (response.ok) {
                setCertificados(prev => prev.filter(cert => cert.id !== id));
                closeModal();
                fetchAuditoria(); 
            } else { alert('Error al eliminar.'); }
        } catch (error) { console.error(error); }
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
                fetchAuditoria();
            }
        } catch (error) { console.error("Error:", error); }
    };

    const openDetalles = (cert) => {
        setSelectedCert(cert);
        setModalAction('DETALLE');
        setObservacion('');
    };

    const openRechazo = () => {
        setModalAction('RECHAZAR');
    };

    const closeModal = () => {
        setSelectedCert(null);
        setModalAction('DETALLE');
    };

    return (
        <div>
            {error && <p className="error-message">{error}</p>}

            <div className="card">
                <h2>Gestión de Usuarios (Desbloqueo)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Intentos</th><th>Estado</th><th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usuarios.map(u => (
                            <tr key={u.id} style={{backgroundColor: u.cuentaBloqueada ? '#fff3cd' : 'transparent'}}>
                                <td>{u.id}</td><td>{u.nombre}</td><td>{u.correo}</td><td>{u.rol}</td>
                                <td style={{textAlign: 'center', color: u.intentosFallidos > 0 ? 'red' : 'black'}}>{u.intentosFallidos}</td>
                                <td>{u.cuentaBloqueada ? <span style={{color: 'red', fontWeight: 'bold'}}>🔒 BLOQUEADO</span> : <span style={{color: 'green'}}>Activo</span>}</td>
                                <td>{u.cuentaBloqueada && <button style={buttonStyles.unlock} onClick={() => handleDesbloquear(u.id, u.nombre)}>🔓 Desbloquear</button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h2>Gestión de Certificados</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Folio</th><th>Cód. Interno</th><th>Tipo</th><th>Monto</th><th>Estado</th><th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                         {certificados.length === 0 ? (
                            <tr><td colSpan="6" style={{textAlign: 'center'}}>No hay certificados.</td></tr>
                        ) : (
                            certificados.map(cert => (
                                <tr key={cert.id}>
                                    <td>{cert.nroCertificado}</td>
                                    <td>{cert.codigoCertificado}</td>
                                    <td>{cert.tipoCertificado?.codigo}</td>
                                    <td>${cert.montoPago?.toLocaleString('es-CL')}</td>
                                    <td style={{ fontWeight: 'bold', color: cert.estado === 'PENDIENTE' ? '#ff9800' : (cert.estado === 'APROBADO' ? 'green' : 'red') }}>
                                        {cert.estado}
                                    </td>
                                    <td>
                                        <button className="btn-primary" style={{marginRight: '10px', fontSize: '12px', padding: '6px 12px'}} onClick={() => openDetalles(cert)}>
                                            👁️ Gestionar
                                        </button>
                                        <button style={buttonStyles.delete} onClick={() => handleDelete(cert.id)}>
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedCert && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px'}}>
                            <h3 style={{margin:0, color: '#002D5C'}}>Gestión Completa (Admin)</h3>
                            <small>ID Interno: {selectedCert.id} | Folio: {selectedCert.nroCertificado}</small>
                        </div>
                        
                        <div className="detail-grid">
                            <div className="detail-item"><strong>Emisor:</strong> {selectedCert.rutEmisor}-{selectedCert.dvEmisor}</div>
                            <div className="detail-item"><strong>Titular:</strong> {selectedCert.rutTitular}-{selectedCert.dvTitular}</div>
                            <div className="detail-item"><strong>Tipo:</strong> {selectedCert.tipoCertificado?.nombre}</div>
                            <div className="detail-item"><strong>Año:</strong> {selectedCert.anioTributario}</div>
                            <div className="detail-item">
                                <strong>Monto:</strong> <span style={{fontSize: '1.2em', fontWeight: 'bold', color: '#002D5C'}}>${selectedCert.montoPago?.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="detail-item"><strong>Fecha Pago:</strong> {selectedCert.fechaPago}</div>
                        </div>

                        {modalAction === 'RECHAZAR' && (
                            <div style={{marginTop: '20px', backgroundColor: '#fff3cd', padding: '15px', borderRadius: '5px'}}>
                                <label style={{color: '#856404', fontWeight: 'bold', display: 'block', marginBottom: '5px'}}>
                                    Motivo del Rechazo (Obligatorio):
                                </label>
                                <textarea 
                                    className="reject-reason"
                                    placeholder="Indique por qué rechaza este documento..."
                                    value={observacion}
                                    onChange={(e) => setObservacion(e.target.value)}
                                />
                            </div>
                        )}

                        <div className="modal-actions" style={{borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px'}}>
                            
                            {selectedCert.estado === 'PENDIENTE' && modalAction === 'DETALLE' && (
                                <>
                                    <button style={buttonStyles.reject} onClick={openRechazo}>✕ Rechazar</button>
                                    <button style={buttonStyles.approve} onClick={() => handleProcess('APROBADO')}>✓ Aprobar</button>
                                </>
                            )}

                            {modalAction === 'RECHAZAR' && (
                                <button style={buttonStyles.reject} onClick={() => handleProcess('RECHAZADO')}>Confirmar Rechazo</button>
                            )}

                            <button className="btn-secondary" onClick={closeModal} style={{marginLeft: 'auto'}}>Cancelar</button>
                            
                            {modalAction === 'DETALLE' && (
                                <button style={buttonStyles.delete} onClick={() => handleDelete(selectedCert.id)}>
                                    Eliminar Definitivamente
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <h2>Log de Auditoría</h2>
                <div style={{maxHeight: '300px', overflowY: 'auto'}}>
                    <table>
                        <thead><tr><th>ID</th><th>Evento</th><th>Usuario</th><th>Fecha</th></tr></thead>
                        <tbody>
                            {eventos.map(ev => (
                                <tr key={ev.id}><td>{ev.id}</td><td>{ev.evento}</td><td>{ev.usuarioCorreo}</td><td>{new Date(ev.fechaEvento).toLocaleString()}</td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default DashboardAdmin;