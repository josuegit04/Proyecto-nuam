// src/components/Login.js (actualizado con estilos)
import React, { useState } from 'react';

function Login({ onLogin }) {
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const basicAuth = 'Basic ' + btoa(correo + ':' + password);

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'GET',
                headers: { 'Authorization': basicAuth }
            });

            if (response.ok) {
                const data = await response.text();
                console.log("Login exitoso:", data);
                localStorage.setItem('auth', basicAuth);
                let rol = 'CORREDOR'; // Default
                if (data.includes('ADMIN')) rol = 'ADMIN';
                else if (data.includes('AUDITOR')) rol = 'AUDITOR';
                
                localStorage.setItem('rol', rol);
                localStorage.setItem('correo', correo); // Guarda el correo también
                onLogin(rol);
            } else {
                setError('Credenciales incorrectas');
            }
        } catch (err) {
            console.error("Error de conexión con el servidor:", err);
            setError('Error de conexión con el servidor. Asegúrate de que el backend esté corriendo.');
        }
    };

    return (
        <div className="card" style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Iniciar Sesión</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Correo:</label>
                    <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} required />
                </div>
                <div>
                    <label>Contraseña:</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <button type="submit">Ingresar</button>
            </form>
        </div>
    );
}

export default Login;