import React, { useState } from 'react';

function CargaManual({ onCargaExitosa }) { 
    
    const initialState = {
        codigo: '', 
        tipo: 'Certificado Tipo A', 
        monto: '',
        fecha: ''
    };
    
    const [nuevoCertificado, setNuevoCertificado] = useState(initialState);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const auth = localStorage.getItem('auth');

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'codigo') {
            let numericValue = value.startsWith('CERT-') ? value.substring(5) : value;
            numericValue = numericValue.replace(/[^0-9]/g, ''); 
            setNuevoCertificado(prev => ({ ...prev, codigo: numericValue }));
        } else {
            setNuevoCertificado(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const certificadoParaEnviar = {
            ...nuevoCertificado,
            codigo: "CERT-" + nuevoCertificado.codigo, 
            estado: 'PENDIENTE', 
            monto: nuevoCertificado.monto === '' ? null : nuevoCertificado.monto,
            fecha: nuevoCertificado.fecha === '' ? null : nuevoCertificado.fecha
        };
        
        if (parseFloat(certificadoParaEnviar.monto) < 0) {
            setError("El monto no puede ser negativo.");
            return;
        }

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
                onCargaExitosa();
            } else {
                const errorData = await response.json();
                if (response.status === 400) {
                    const messages = errorData.message || (errorData.errors ? Object.values(errorData.errors).join(', ') : "Error de validación");
                    setError(messages);
                } else {
                    setError('Error al crear el certificado. Intente de nuevo.');
                }
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            setError('Error de conexión con el servidor al crear certificado.');
        }
    };

    return (
        <div>
            <h2>Registrar Nuevo Certificado (Manual)</h2>
            {success && <p style={{ color: 'green' }}>{success}</p>}
            {error && <p className="error-message">{error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Código:</label>
                    <input 
                        type="text" 
                        name="codigo" 
                        value={"CERT-" + nuevoCertificado.codigo} 
                        onChange={handleChange} 
                        required 
                        placeholder="CERT-123456"
                    />
                </div>
                
                <div>
                    <label>Tipo:</label>
                    <select name="tipo" value={nuevoCertificado.tipo} onChange={handleChange} required>
                        <option value="Certificado Tipo A">Certificado Tipo A</option>
                        <option value="Certificado Tipo B">Certificado Tipo B</option>
                        <option value="Certificado Tipo C">Certificado Tipo C</option>
                    </select>
                </div>

                <div>
                    <label>Monto:</label>
                    <input 
                        type="number" 
                        name="monto" 
                        value={nuevoCertificado.monto} 
                        onChange={handleChange} 
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required 
                    />
                </div>
                <div>
                    <label>Fecha:</label>
                    <input 
                        type="date" 
                        name="fecha" 
                        value={nuevoCertificado.fecha} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                
                <button type="submit">Enviar a Revisión</button>
            </form>
        </div>
    );
}

export default CargaManual;