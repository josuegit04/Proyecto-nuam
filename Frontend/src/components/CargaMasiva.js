import React, { useState } from 'react';

function CargaMasiva({ onCargaExitosa }) {
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const auth = localStorage.getItem('auth');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
        setSuccess('');
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Por favor, seleccione un archivo .xlsx primero.');
            return;
        }
        
        if (!file.name.endsWith('.xlsx')) {
            setError('Error: Solo se permiten archivos Excel (.xlsx)');
            return;
        }

        setIsUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8080/api/corredor/carga-masiva', {
                method: 'POST',
                headers: { 'Authorization': auth },
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(data.message || 'Carga masiva procesada exitosamente.');
                setFile(null); 
                document.getElementById('fileInput').value = "";
                onCargaExitosa(); 
            } else {
                const errorData = await response.json();
                setError(`Error en la carga: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Error:", error);
            setError('Error de conexión con el servidor.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <h2>Carga Masiva de Instrumentos (Excel)</h2>
            
            <div style={{backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '5px', marginBottom: '20px', fontSize: '13px', borderLeft: '5px solid #2196F3'}}>
                <h4 style={{marginTop:0, color:'#0d47a1'}}>Formato Requerido del Excel</h4>
                <p>El archivo debe contener las siguientes columnas en orden estricto (sin encabezados de texto en la fila 1, o el sistema la saltará):</p>
                
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                    <div>
                        <strong>Cabecera (Columnas A - H):</strong>
                        <ul style={{marginTop:'5px', paddingLeft:'20px'}}>
                            <li><strong>A:</strong> Año Tributario (Ej: 2024)</li>
                            <li><strong>B:</strong> Mercado (Nacional/Ext)</li>
                            <li><strong>C:</strong> Instrumento (Nemo)</li>
                            <li><strong>D:</strong> Fecha (dd-mm-aaaa)</li>
                            <li><strong>E:</strong> Secuencia (N° Único)</li>
                            <li><strong>F:</strong> N° Dividendo</li>
                            <li><strong>G:</strong> Tipo Sociedad</li>
                            <li><strong>H:</strong> Valor Histórico ($)</li>
                        </ul>
                    </div>
                    <div>
                        <strong>Factores (Columnas I - AL):</strong>
                        <ul style={{marginTop:'5px', paddingLeft:'20px'}}>
                            <li><strong>I:</strong> Factor 8</li>
                            <li><strong>J:</strong> Factor 9</li>
                            <li><strong>...</strong> (Sucesivos)</li>
                            <li><strong>AL:</strong> Factor 37</li>
                        </ul>
                        <small style={{color:'#d32f2f'}}>* Importante: La suma de factores 8 al 16 (Cols I a Q) no puede superar 1.0.</small>
                    </div>
                </div>
            </div>

            {success && (
                <div style={{backgroundColor:'#d4edda', color:'#155724', padding:'15px', borderRadius:'4px', marginBottom:'15px', border:'1px solid #c3e6cb'}}>
                    <strong>¡Éxito!</strong> {success}
                </div>
            )}
            
            {error && (
                <div style={{backgroundColor:'#f8d7da', color:'#721c24', padding:'15px', borderRadius:'4px', marginBottom:'15px', border:'1px solid #f5c6cb'}}>
                    <strong>Fallo:</strong> {error}
                </div>
            )}

            <div style={{padding:'20px', border:'2px dashed #ccc', borderRadius:'10px', textAlign:'center', backgroundColor:'#fafafa'}}>
                <label style={{fontWeight:'bold', display:'block', marginBottom:'15px', fontSize:'16px'}}>
                    Seleccionar archivo .xlsx
                </label>
                
                <input 
                    id="fileInput"
                    type="file" 
                    accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                    style={{display:'block', margin:'0 auto 20px auto'}}
                />
                
                <button 
                    className="btn-primary" 
                    onClick={handleUpload} 
                    disabled={isUploading}
                    style={{
                        padding:'12px 30px', 
                        fontSize:'16px', 
                        opacity: isUploading ? 0.6 : 1,
                        cursor: isUploading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isUploading ? 'Procesando Datos...' : 'Subir y Procesar'}
                </button>
            </div>
        </div>
    );
}

export default CargaMasiva;