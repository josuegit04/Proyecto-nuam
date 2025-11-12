import React, { useState, useEffect } from 'react';

const buttonStyles = {
    approve: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginRight: '8px', fontWeight: 'bold' },
    reject: { backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};

function DashboardAuditor() {
    const [certificados, setCertificados] = useState([]);
    const [error, setError] = useState('');

    const auth = localStorage.getItem('auth');

    useEffect(() => {
        fetchCertificados();
    }, []);

    const fetchCertificados = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/corredor/certificados', { 
                headers: { 'Authorization': auth }
            });
            if (response.ok) {
                const data = await response.json();
                setCertificados(data);
            } else {
                console.error("Error al cargar certificados. Status:", response.status);
                setError('No se pudieron cargar los certificados. Verifica que iniciaste sesión como AUDITOR.');
            }
        } catch (error) {
            console.error("Error de red:", error);
            setError('Error de conexión con el servidor.');
        }
    };

    const handleUpdateEstado = async (id, nuevoEstado) => {
        console.log(`Intentando cambiar certificado ${id} a ${nuevoEstado}...`);
        
        try {
            const response = await fetch(`http://localhost:8080/api/auditor/certificados/${id}/estado`, { 
                method: 'PUT',
                headers: { 
                    'Authorization': auth,          
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: nuevoEstado }) 
            });
            
            if (response.ok) {
                console.log("¡Actualización exitosa!");
                const updatedCert = await response.json();
                
                setCertificados(prevCertificados => 
                    prevCertificados.map(cert => 
                        cert.id === id ? updatedCert : cert
                    )
                );
                setError(''); 
            } else {
                console.error("Error del servidor:", response.status);
                const errorText = await response.text();
                console.error("Detalle del error:", errorText);
                setError(`Error al actualizar: El servidor respondió con estado ${response.status}`);
            }
        } catch (error) {
            console.error("Error de red al actualizar:", error);
            setError('Error de conexión al intentar actualizar el estado.');
        }
    };

    return (
        <div className="card">
            <h2>Panel de Auditor - Revisión de Certificados</h2>
            {error && <p className="error-message">{error}</p>}
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Código</th>
                        <th>Tipo</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                        <th>Estado Actual</th>
                        <th>Acciones de Auditoría</th>
                    </tr>
                </thead>
                <tbody>
                    {certificados.map(cert => (
                        <tr key={cert.id}>
                            <td>{cert.id}</td>
                            <td>{cert.codigo}</td>
                            <td>{cert.tipo}</td>
                            <td>${cert.monto}</td>
                            <td>{cert.fecha}</td>
                            <td style={{ fontWeight: 'bold', color: cert.estado === 'PENDIENTE' ? 'orange' : (cert.estado === 'APROBADO' ? 'green' : 'red') }}>
                                {cert.estado}
                            </td>
                            <td>
                                {cert.estado === 'PENDIENTE' ? (
                                    <div>
                                        <button 
                                            style={buttonStyles.approve}
                                            onClick={() => handleUpdateEstado(cert.id, 'APROBADO')}
                                        >
                                            ✓ Aprobar
                                        </button>
                                        <button 
                                            style={buttonStyles.reject}
                                            onClick={() => handleUpdateEstado(cert.id, 'RECHAZADO')}
                                        >
                                            ✕ Rechazar
                                        </button>
                                    </div>
                                ) : (
                                    <span style={{ color: '#666', fontStyle: 'italic' }}>
                                        Revisión finalizada
                                    </span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DashboardAuditor;