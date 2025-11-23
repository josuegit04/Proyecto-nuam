import React, { useState } from 'react';

function Login({ onLogin }) {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Botón presionado. Intentando loguear con:", correo);
        
        setError('');

        const basicAuth = 'Basic ' + btoa(correo + ':' + password);

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ correo, password })
            });

            if (response.ok) {
                const data = await response.text();
                console.log("Respuesta del servidor:", data);
                
                const basicAuth = 'Basic ' + btoa(correo + ':' + password);
                localStorage.setItem('auth', basicAuth);
                
                let rol = 'CORREDOR'; 
                if (data.includes('ADMIN')) rol = 'ADMIN';
                else if (data.includes('AUDITOR')) rol = 'AUDITOR';
                
                localStorage.setItem('rol', rol);
                localStorage.setItem('correo', correo);
                
                onLogin(rol);
            } else {
                const mensajeError = await response.text();
                console.warn("Error de login:", mensajeError);
                setError(mensajeError); 
            }
        } catch (err) {
            console.error("Error crítico:", err);
            setError('Error de conexión con el servidor (Backend caído o red).');
        }
    };

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Iniciar Sesión</h2>
            
            {error && (
                <div className="error-message" style={{
                    padding: '10px', 
                    backgroundColor: error.includes('BLOQUEADA') ? '#f8d7da' : '#fff3cd',
                    color: error.includes('BLOQUEADA') ? '#721c24' : '#856404',
                    fontWeight: 'bold',
                    borderRadius: '4px',
                    marginBottom: '15px'
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Correo:</label>
                    <input 
                        type="email" 
                        value={correo} 
                        onChange={(e) => setCorreo(e.target.value)} 
                        required 
                        placeholder="ejemplo@empresa.cl"
                    />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                
                <button type="submit" style={{marginTop: '15px'}}>Ingresar</button>
            </form>
        </div>
    );
}

export default Login;