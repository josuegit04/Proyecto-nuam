import React, { useState, useEffect } from 'react';

const buttonStyles = {
    approve: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: 'bold' },
    reject: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    delete: { backgroundColor: '#b20000', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }
};

function DashboardAdmin() {
    const [eventos, setEventos] = useState([]); 
    const [certificados, setCertificados] = useState([]); 
    const [error, setError] = useState('');
    const auth = localStorage.getItem('auth');

    useEffect(() => {
        fetchAuditoria();
        fetchCertificados();
    }, []);

    const fetchAuditoria = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/admin/auditoria', {
                headers: { 'Authorization': auth }
            });
            if (response.ok) {
                const data = await response.json();
                setEventos(data);
            }
        } catch (error) {
            console.error("Error cargando auditoría:", error);
        }
    };

    const fetchCertificados = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/corredor/certificados', { 
                headers: { 'Authorization': auth }
            });
            if (response.ok) {
                const data = await response.json();
                setCertificados(data);
            } else {
                setError('No se pudieron cargar los certificados.');
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            setError('Error de conexión con el servidor.');
        }
    };

    const handleUpdateEstado = async (id, nuevoEstado) => {
        try {
            const response = await fetch(`http://localhost:8080/api/auditor/certificados/${id}/estado`, { 
                method: 'PUT',
                headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado })
            });
            
            if (response.ok) {
                const updatedCert = await response.json();
                setCertificados(prev => prev.map(cert => cert.id === id ? updatedCert : cert));
                fetchAuditoria(); 
            } else {
                setError(`Error al ${nuevoEstado.toLowerCase()} el certificado.`);
            }
        } catch (error) {
            setError('Error de conexión al actualizar el estado.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Estás seguro de que quieres ELIMINAR este certificado permanentemente? Esta acción no se puede deshacer.")) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/api/admin/certificados/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': auth }
            });
            
            if (response.ok) {
                setCertificados(prev => prev.filter(cert => cert.id !== id));
                fetchAuditoria(); 
            } else {
                setError('Error al eliminar el certificado.');
            }
        } catch (error) {
            setError('Error de conexión al eliminar el certificado.');
        }
    };

    return (
        <div>
            {error && <p className="error-message">{error}</p>}

            <div className="card">
                <h2>Gestión de Certificados (CRUD)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Monto</th>
                            <th>Estado</th>
                            <th>Corredor</th>
                            <th style={{width: '250px'}}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                         {certificados.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{textAlign: 'center', fontStyle: 'italic', color: '#666'}}>No hay certificados en el sistema.</td>
                            </tr>
                        ) : (
                            certificados.map(cert => (
                                <tr key={cert.id}>
                                    <td>{cert.codigo}</td>
                                    <td>${cert.monto ? cert.monto.toFixed(2) : '0.00'}</td>
                                    <td style={{ fontWeight: 'bold', color: cert.estado === 'PENDIENTE' ? '#ff9800' : (cert.estado === 'APROBADO' ? 'green' : 'red') }}>
                                        {cert.estado}
                                    </td>
                                    <td>{cert.corredor ? cert.corredor.nombre : 'N/A'}</td>
                                    <td>
                                        {cert.estado === 'PENDIENTE' && (
                                            <>
                                                <button 
                                                    style={buttonStyles.approve}
                                                    onClick={() => handleUpdateEstado(cert.id, 'APROBADO')}
                                                >
                                                    Aprobar
                                                </button>
                                                <button 
                                                    style={buttonStyles.reject}
                                                    onClick={() => handleUpdateEstado(cert.id, 'RECHAZADO')}
                                                >
                                                    Rechazar
                                                </button>
                                            </>
                                        )}
                                        <button 
                                            style={buttonStyles.delete}
                                            onClick={() => handleDelete(cert.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="card">
                <h2>Actividad Reciente (Auditoría)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Evento</th>
                            <th>Usuario</th>
                            <th>Fecha y Hora</th>
                        </tr>
                    </thead>
                    <tbody>
                        {eventos.length === 0 ? (
                             <tr>
                                <td colSpan="4" style={{textAlign: 'center', fontStyle: 'italic', color: '#666'}}>No hay eventos de auditoría.</td>
                            </tr>
                        ) : (
                            eventos.map(evento => (
                                <tr key={evento.id}>
                                    <td>{evento.id}</td>
                                    <td>{evento.evento}</td>
                                    <td>{evento.usuarioCorreo}</td>
                                    <td>{new Date(evento.fechaEvento).toLocaleString()}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DashboardAdmin;