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
                headers: {
                    'Authorization': auth
                    // ¡NO se pone 'Content-Type': 'application/json'!
                    // El navegador lo pondrá como 'multipart/form-data' automáticamente.
                },
                body: formData
            });

            if (response.ok) {
                setSuccess('Archivo subido y procesado exitosamente.');
                setFile(null); 
                onCargaExitosa(); 
            } else {
                const errorText = await response.text();
                setError(`Error al procesar el archivo: ${errorText}`);
            }
        } catch (error) {
            console.error("Error de conexión:", error);
            setError('Error de conexión con el servidor.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div>
            <h2>Carga Masiva de Certificados</h2>
            <p>Suba un archivo Excel (.xlsx) con las siguientes columnas:</p>
            <p><code>Columna A: Código</code> | <code>Columna B: Tipo</code> | <code>Columna C: Monto</code> | <code>Columna D: Fecha</code></p>
            <hr style={{margin: '20px 0'}} />

            {success && <p style={{ color: 'green' }}>{success}</p>}
            {error && <p className="error-message">{error}</p>}

            <div>
                <label>Seleccionar archivo (.xlsx):</label>
                <input 
                    type="file" 
                    accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleFileChange}
                    style={{padding: '10px 0'}}
                />
            </div>
            
            <button 
                className="btn-primary" 
                onClick={handleUpload} 
                disabled={isUploading}
            >
                {isUploading ? 'Procesando...' : 'Subir y Procesar Archivo'}
            </button>
        </div>
    );
}

export default CargaMasiva;