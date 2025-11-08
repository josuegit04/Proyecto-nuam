// src/components/DashboardCorredor.js
import React, { useState, useEffect } from 'react';

function DashboardCorredor() {
    const [certificados, setCertificados] = useState([]);
    const [nuevoCertificado, setNuevoCertificado] = useState({
        codigo: '', tipo: '', monto: '', fecha: '', estado: 'PENDIENTE'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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
                console.error("Error al obtener certificados");
            }
        } catch (error) {
            console.error("Error de conexión:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNuevoCertificado(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch('http://localhost:8080/api/corredor/certificados', {
                method: 'POST',
                headers: { 
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(nuevoCertificado)
            });

            if (response.ok) {
                setSuccess('Certificado creado exitosamente!');
                setNuevoCertificado({ codigo: '', tipo: '', monto: '', fecha: '', estado: 'PENDIENTE' });
                fetchCertificados(); // Recargar la lista
            } else {
                setError('Error al crear el certificado. Intente de nuevo.');
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            setError('Error de conexión con el servidor al crear certificado.');
        }
    };

    return (
        <div>
            <div className="card" style={{ marginBottom: '30px' }}>
                <h2>Registrar Nuevo Certificado</h2>
                {success && <p style={{ color: 'green' }}>{success}</p>}
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Código:</label>
                        <input type="text" name="codigo" value={nuevoCertificado.codigo} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Tipo:</label>
                        <input type="text" name="tipo" value={nuevoCertificado.tipo} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Monto:</label>
                        <input type="number" name="monto" value={nuevoCertificado.monto} onChange={handleChange} />
                    </div>
                    <div>
                        <label>Fecha:</label>
                        <input type="date" name="fecha" value={nuevoCertificado.fecha} onChange={handleChange} />
                    </div>
                    <button type="submit">Crear Certificado</button>
                </form>
            </div>

            <div className="card">
                <h2>Mis Certificados</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Código</th>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {certificados.map(cert => (
                            <tr key={cert.id}>
                                <td>{cert.id}</td>
                                <td>{cert.codigo}</td>
                                <td>{cert.tipo}</td>
                                <td>${cert.monto ? cert.monto.toFixed(2) : '0.00'}</td>
                                <td>{cert.fecha}</td>
                                <td>{cert.estado}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DashboardCorredor;