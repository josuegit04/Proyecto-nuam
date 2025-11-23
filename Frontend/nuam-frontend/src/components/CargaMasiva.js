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
            setError('Error: Solo se permiten archivos .xlsx');
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
                setSuccess(data.message || 'Archivo procesado exitosamente.');
                setFile(null); 
                document.getElementById('fileInput').value = "";
                onCargaExitosa(); 
            } else {
                const errorData = await response.json();
                setError(`Error: ${errorData.message}`);
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
            <h2>Carga Masiva de Certificados</h2>
            
            <div style={{backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '5px', marginBottom: '20px', fontSize: '14px'}}>
                <strong>⚠️ Instrucciones del Excel:</strong>
                <p style={{margin: '5px 0'}}>El archivo debe contener estrictamente las siguientes columnas en orden (sin encabezados):</p>
                <ol style={{paddingLeft: '20px'}}>
                    <li><strong>A:</strong> RUT Emisor (Sin DV)</li>
                    <li><strong>B:</strong> DV Emisor</li>
                    <li><strong>C:</strong> RUT Titular (Sin DV)</li>
                    <li><strong>D:</strong> DV Titular</li>
                    <li><strong>E:</strong> Cód. Tipo (Ej: C1887)</li>
                    <li><strong>F:</strong> Cód. Único Certificado (ID)</li>
                    <li><strong>G:</strong> Nro. Folio (Nuevo Campo)</li>
                    <li><strong>H:</strong> Año Tributario</li>
                    <li><strong>I:</strong> Moneda (CLP/UF)</li>
                    <li><strong>J:</strong> Monto</li>
                    <li><strong>K:</strong> Fecha (aaaa-mm-dd)</li>
                </ol>
            </div>

            {success && <p style={{ color: 'green', fontWeight: 'bold' }}>✅ {success}</p>}
            {error && <p className="error-message" style={{backgroundColor: '#ffebee', padding: '10px'}}>❌ {error}</p>}

            <div style={{marginBottom: '20px'}}>
                <label style={{fontWeight: 'bold', display: 'block', marginBottom: '10px'}}>Seleccionar archivo (.xlsx):</label>
                <input 
                    id="fileInput"
                    type="file" 
                    accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                    style={{padding: '10px', border: '1px solid #ccc', width: '100%'}}
                />
            </div>
            
            <button 
                className="btn-primary" 
                onClick={handleUpload} 
                disabled={isUploading}
                style={{opacity: isUploading ? 0.7 : 1}}
            >
                {isUploading ? '⏳ Procesando y Validando...' : '📤 Subir y Procesar Excel'}
            </button>
        </div>
    );
}

export default CargaMasiva;