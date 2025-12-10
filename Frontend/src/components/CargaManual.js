import React, { useState, useEffect } from 'react';

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

function CargaManual({ onCargaExitosa, edicionData }) { 
    
    const [formData, setFormData] = useState({
        mercado: 'Nacional', instrumento: '', secuenciaEvento: '', descripcion: '', isFut: false,
        rutEmisor: '99999999', dvEmisor: 'K', rutTitular: '11111111', dvTitular: '1',
        codigoTipoCertificado: 'DJ1948', codigoCertificado: '', nroCertificado: '',
        anioTributario: 2024, tipoMoneda: 'CLP', montoPago: '', fechaPago: ''
    });

    const [detalles, setDetalles] = useState(
        Array.from({ length: 30 }, (_, i) => ({ numeroColumna: i + 8, monto: 0, factor: 0 }))
    );

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const auth = localStorage.getItem('auth');

    const toNumber = (val) => {
        if (!val) return 0;
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    };

    useEffect(() => {
        if (edicionData) {
            setFormData({
                mercado: edicionData.mercado || 'Nacional',
                instrumento: edicionData.instrumento || '',
                secuenciaEvento: edicionData.secuenciaEvento || '',
                descripcion: edicionData.descripcion || '',
                isFut: edicionData.isFut || false,
                rutEmisor: edicionData.rutEmisor,
                dvEmisor: edicionData.dvEmisor,
                rutTitular: edicionData.rutTitular,
                dvTitular: edicionData.dvTitular,
                codigoTipoCertificado: edicionData.tipoCertificado?.codigo || 'DJ1948',
                codigoCertificado: edicionData.codigoCertificado,
                nroCertificado: edicionData.nroCertificado,
                anioTributario: edicionData.anioTributario,
                tipoMoneda: edicionData.tipoMoneda,
                montoPago: edicionData.montoPago,
                fechaPago: edicionData.fechaPago
            });

            if (edicionData.detalles && edicionData.detalles.length > 0) {
                const nuevosDetalles = Array.from({ length: 30 }, (_, i) => ({ numeroColumna: i + 8, monto: 0, factor: 0 }));
                edicionData.detalles.forEach(d => {
                    const index = d.numeroColumna - 8;
                    if (index >= 0 && index < 30) {
                        nuevosDetalles[index].monto = d.monto;
                        nuevosDetalles[index].factor = d.factor;
                    }
                });
                setDetalles(nuevosDetalles);
            }
        }
    }, [edicionData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        
        setFormData(prev => {
            const newData = { ...prev, [name]: val };
            if (name === 'montoPago') {
                const total = toNumber(val);
                setDetalles(prevDetalles => prevDetalles.map(d => ({
                    ...d,
                    monto: Math.round(toNumber(d.factor) * total)
                })));
            }
            return newData;
        });
    };

    const handleDetalleChange = (index, field, value) => {
        const nuevos = [...detalles];
        const montoTotal = toNumber(formData.montoPago);

        if (field === 'factor') {
            nuevos[index].factor = value; 
            const factorNum = toNumber(value);
            nuevos[index].monto = Math.round(montoTotal * factorNum);
        } 
        else if (field === 'monto') {
            nuevos[index].monto = value;
            const montoNum = toNumber(value);
            if (montoTotal > 0) nuevos[index].factor = parseFloat((montoNum / montoTotal).toFixed(8));
        }

        setDetalles(nuevos);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        let suma = 0;
        for (let i = 0; i <= 8; i++) suma += parseFloat(detalles[i].factor || 0);
        if (suma > 1.0001) { setError(`Error: Suma Factores 8-16 es ${suma.toFixed(4)}. Máximo 1.`); return; }

        const codigoFinal = formData.codigoCertificado || `${formData.instrumento}-${formData.secuenciaEvento}`;

        const payload = {
            ...formData,
            codigoCertificado: codigoFinal,
            detalles: detalles.map(d => ({ numeroColumna: d.numeroColumna, monto: d.monto || 0, factor: d.factor || 0 }))
        };

        try {
            const url = edicionData 
                ? `http://localhost:8080/api/corredor/certificados/${edicionData.id}` 
                : 'http://localhost:8080/api/corredor/certificados';
            const method = edicionData ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': auth, 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSuccess(edicionData ? 'Calificación corregida exitosamente.' : 'Calificación guardada exitosamente.');
                onCargaExitosa();
            } else {
                const data = await response.json();
                setError(data.message || "Error al guardar");
            }
        } catch (error) { setError('Error de conexión.'); }
    };

    const sectionStyle = { borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px', color: '#002D5C' };
    const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '15px' };

    return (
        <div>
            <h2>{edicionData ? `Corrigiendo Folio #${edicionData.nroCertificado}` : 'Ingreso Manual de Calificación'}</h2>
            
            {edicionData && edicionData.observacionRechazo && (
                <div style={{backgroundColor: '#ffebee', border: '1px solid #ef9a9a', color: '#c62828', padding: '15px', borderRadius: '5px', marginBottom: '20px'}}>
                    <strong>RECHAZADO:</strong> "{edicionData.observacionRechazo}"
                </div>
            )}

            {success && <p style={{ color: 'green', fontWeight: 'bold' }}>✅ {success}</p>}
            {error && <p style={{ backgroundColor: '#ffebee', padding: '10px', borderRadius:'4px', color:'red' }}>⚠️ {error}</p>}
            
            <form onSubmit={handleSubmit}>
                <h3 style={sectionStyle}>1. Datos del Instrumento</h3>
                <div style={gridStyle}>
                     <div><label>Instrumento:</label><input type="text" name="instrumento" value={formData.instrumento} onChange={handleChange} required style={{width:'100%', padding:'8px'}}/></div>
                     <div><label>Secuencia:</label><input type="number" name="secuenciaEvento" value={formData.secuenciaEvento} onChange={handleChange} required style={{width:'100%', padding:'8px'}}/></div>
                     <div><label>Monto Total ($):</label><input type="number" name="montoPago" value={formData.montoPago} onChange={handleChange} required style={{width:'100%', padding:'8px'}}/></div>
                     <div><label>Fecha:</label><input type="date" name="fechaPago" value={formData.fechaPago} onChange={handleChange} required style={{width:'100%', padding:'8px'}}/></div>
                     <div><label>Año:</label><input type="number" name="anioTributario" value={formData.anioTributario} onChange={handleChange} required style={{width:'100%', padding:'8px'}}/></div>
                </div>

                <h3 style={sectionStyle}>3. Detalle de Factores (8 al 37)</h3>
                <div style={{maxHeight:'400px', overflowY:'auto', border:'1px solid #ccc', padding:'10px', marginBottom:'20px'}}>
                    <table style={{width:'100%', fontSize:'13px', borderCollapse:'collapse'}}>
                        <thead>
                            <tr style={{background:'#f0f0f0', textAlign:'left', position:'sticky', top:0}}>
                                <th style={{padding:'8px', width:'50%'}}>Concepto</th>
                                <th style={{padding:'8px'}}>Monto ($)</th>
                                <th style={{padding:'8px'}}>Factor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detalles.map((fila, idx) => (
                                <tr key={idx} style={{borderBottom:'1px solid #eee', backgroundColor: (idx<=8)?'#e8f5e9':'white'}}>
                                    <td style={{padding:'8px'}}>
                                        {COLUMN_LABELS[fila.numeroColumna] || `Factor ${fila.numeroColumna}`}
                                    </td>
                                    <td style={{padding:'8px'}}><input type="number" value={fila.monto} onChange={e=>handleDetalleChange(idx,'monto',e.target.value)} style={{width:'100%'}}/></td>
                                    <td style={{padding:'8px'}}><input type="number" step="0.0001" value={fila.factor} onChange={e=>handleDetalleChange(idx,'factor',e.target.value)} style={{width:'100%'}}/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <button type="submit" className="btn-primary" style={{width:'100%', padding:'15px', fontSize:'16px'}}>
                    {edicionData ? 'ENVIAR CORRECCIÓN' : 'GUARDAR CALIFICACIÓN'}
                </button>
            </form>
        </div>
    );
}

export default CargaManual;