import React, { useState } from 'react';

function CargaManual({ onCargaExitosa }) { 
    
    const initialState = {
        rutEmisor: '', dvEmisor: '',
        rutTitular: '', dvTitular: '',
        codigoTipoCertificado: 'C1887',
        codigoCertificado: '',
        nroCertificado: '', 
        anioTributario: new Date().getFullYear(),
        tipoMoneda: 'CLP',
        montoPago: '',
        fechaPago: ''
    };
    
    const [formData, setFormData] = useState(initialState);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const auth = localStorage.getItem('auth');

    const validarRut = (rut, dv) => {
        if (!rut || !dv) return false;
        let suma = 0;
        let multiplicador = 2;
        for (let i = rut.length - 1; i >= 0; i--) {
            suma += parseInt(rut.charAt(i)) * multiplicador;
            multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
        }
        const resto = 11 - (suma % 11);
        let dvCalculado = (resto === 11) ? '0' : (resto === 10) ? 'K' : resto.toString();
        return dvCalculado.toUpperCase() === dv.toUpperCase();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'dvEmisor' || name === 'dvTitular') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (parseFloat(formData.montoPago) < 0) { setError("El monto no puede ser negativo."); return; }
        if (parseInt(formData.anioTributario) < 1900 || parseInt(formData.anioTributario) > 2100) { setError("Año inválido."); return; }
        if (!validarRut(formData.rutEmisor, formData.dvEmisor)) { setError("RUT Emisor inválido."); return; }
        if (!validarRut(formData.rutTitular, formData.dvTitular)) { setError("RUT Titular inválido."); return; }
        
        if (!formData.nroCertificado) { setError("El Nro de Folio es obligatorio."); return; }

        try {
            const response = await fetch('http://localhost:8080/api/corredor/certificados', {
                method: 'POST',
                headers: { 
                    'Authorization': auth,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSuccess('Certificado creado exitosamente!');
                setFormData(initialState); 
                onCargaExitosa();
            } else {
                const errorData = await response.json();
                setError(errorData.message || "Error al crear certificado");
            }
        } catch (error) {
            console.error("Error:", error);
            setError('Error de conexión con el servidor.');
        }
    };

    return (
        <div>
            <h2>Registrar Nuevo Certificado</h2>
            {success && <p style={{ color: 'green', fontWeight: 'bold' }}>{success}</p>}
            {error && <p className="error-message" style={{ backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px' }}>⚠️ {error}</p>}
            
            <form onSubmit={handleSubmit}>
                <div className="detail-grid">
                    <div>
                        <label>RUT Emisor (Sin puntos):</label>
                        <input type="number" name="rutEmisor" value={formData.rutEmisor} onChange={handleChange} required placeholder="Ej: 12345678" min="1"/>
                    </div>
                    <div>
                        <label>DV:</label>
                        <input type="text" name="dvEmisor" value={formData.dvEmisor} onChange={handleChange} required maxLength="1" style={{width: '60px', textTransform: 'uppercase'}} placeholder="K"/>
                    </div>
                    <div>
                        <label>RUT Titular (Sin puntos):</label>
                        <input type="number" name="rutTitular" value={formData.rutTitular} onChange={handleChange} required placeholder="Ej: 11222333" min="1"/>
                    </div>
                    <div>
                        <label>DV:</label>
                        <input type="text" name="dvTitular" value={formData.dvTitular} onChange={handleChange} required maxLength="1" style={{width: '60px', textTransform: 'uppercase'}} placeholder="0"/>
                    </div>
                </div>

                <div style={{marginTop: '15px'}}>
                    <label>Tipo de Certificado:</label>
                    <select name="codigoTipoCertificado" value={formData.codigoTipoCertificado} onChange={handleChange} required>
                        <option value="C1887">C1887 - Sueldos y Salarios</option>
                        <option value="C1879">C1879 - Honorarios</option>
                        <option value="C1943">C1943 - Renta Presunta</option>
                    </select>
                </div>

                <div className="detail-grid">
                    <div>
                        <label>Código Único (Identificador):</label>
                        <input type="text" name="codigoCertificado" value={formData.codigoCertificado} onChange={handleChange} required placeholder="Ej: CERT-2024-001" />
                    </div>
                    <div>
                        <label>Nro. Folio Certificado (Numérico):</label>
                        <input type="number" name="nroCertificado" value={formData.nroCertificado} onChange={handleChange} required placeholder="Ej: 8500" min="1" />
                    </div>
                </div>

                <div className="detail-grid">
                    <div>
                        <label>Año Tributario:</label>
                        <input type="number" name="anioTributario" value={formData.anioTributario} onChange={handleChange} required min="1900" />
                    </div>
                    <div>
                        <label>Moneda:</label>
                        <select name="tipoMoneda" value={formData.tipoMoneda} onChange={handleChange}>
                            <option value="CLP">Pesos (CLP)</option>
                            <option value="UF">UF</option>
                            <option value="USD">Dólar</option>
                        </select>
                    </div>
                </div>

                <div className="detail-grid">
                    <div>
                        <label>Monto Pago:</label>
                        <input type="number" name="montoPago" value={formData.montoPago} onChange={handleChange} required min="0" step="0.01" />
                    </div>
                    <div>
                        <label>Fecha Pago:</label>
                        <input type="date" name="fechaPago" value={formData.fechaPago} onChange={handleChange} required />
                    </div>
                </div>
                
                <button type="submit" style={{marginTop: '20px'}}>Guardar Certificado</button>
            </form>
        </div>
    );
}

export default CargaManual;