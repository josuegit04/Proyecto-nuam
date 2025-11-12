import React, { useState, useEffect } from 'react';

function DashboardCorredor() {
    const [certificados, setCertificados] = useState([]);
    
    // Estado inicial del formulario
    const initialState = {
        codigo: '', // Ahora solo guardará la parte numérica
        tipo: 'Certificado Tipo A', // Valor por defecto
        monto: '',
        fecha: ''
    };
    
    const [nuevoCertificado, setNuevoCertificado] = useState(initialState);
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

    // --- MANEJADOR DE CAMBIOS MODIFICADO ---
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'codigo') {
            // 1. Quitar el prefijo si el usuario intenta borrarlo (para que solo quede el número)
            let numericValue = value.startsWith('CERT-') ? value.substring(5) : value;
            
            // 2. Filtrar y permitir solo números
            numericValue = numericValue.replace(/[^0-9]/g, ''); 
            
            setNuevoCertificado(prev => ({ ...prev, codigo: numericValue }));
        } else {
            // Manejador normal para los otros campos (tipo, monto, fecha)
            setNuevoCertificado(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Preparamos el objeto a enviar
        const certificadoParaEnviar = {
            ...nuevoCertificado,
            codigo: "CERT-" + nuevoCertificado.codigo, // 3. Añadimos el prefijo al enviar
            estado: 'PENDIENTE' // Lógica de negocio: siempre pendiente
        };

        try {
            const response = await fetch('http://localhost:8080/api/corredor/certificados', {
                method: 'POST',
                headers: { 
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(certificadoParaEnviar)
            });

            if (response.ok) {
                setSuccess('Certificado creado exitosamente! Quedó PENDIENTE de revisión.');
                setNuevoCertificado(initialState); 
                fetchCertificados(); 
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
                        <input type="text" name="codigo" value={"CERT-" + nuevoCertificado.codigo} onChange={handleChange} required />
                    </div>
                    
                    <div>
                        <label>Tipo:</label>
                        <select name="tipo" value={nuevoCertificado.tipo} onChange={handleChange}>
                            <option value="Certificado Tipo A">Certificado Tipo A</option>
                            <option value="Certificado Tipo B">Certificado Tipo B</option>
                            <option value="Certificado Tipo C">Certificado Tipo C</option>
                        </select>
                    </div>

                    <div>
                        <label>Monto:</label>
                    <input type="number" name="monto" value={nuevoCertificado.monto} onChange={handleChange} required min="1" />
                    </div>
                    <div>
                        <label>Fecha:</label>
                        <input type="date" name="fecha" value={nuevoCertificado.fecha} onChange={handleChange} required />
                    </div>
                    
                    <button type="submit">Enviar a Revisión</button>
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
                            <th>Factor</th>
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
                                <td>{cert.factor ? cert.factor : 'N/A'}</td>
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