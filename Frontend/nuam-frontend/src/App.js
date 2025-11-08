// src/App.js (actualizado para logout y renderizado por rol)
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardCorredor from './components/DashboardCorredor'; // Lo crearemos en breve
import DashboardAuditor from './components/DashboardAuditor';   // Lo crearemos en breve

function App() {
    // Inicializa el rol desde localStorage al cargar la app
    const [rol, setRol] = useState(localStorage.getItem('rol'));

    // Efecto para escuchar cambios en localStorage si es necesario (menos crítico ahora)
    useEffect(() => {
        const handleStorageChange = () => {
            setRol(localStorage.getItem('rol'));
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogin = (nuevoRol) => {
        setRol(nuevoRol);
    };

    const handleLogout = () => {
        localStorage.clear(); // Limpia todas las credenciales
        setRol(null); // Resetea el rol para mostrar el Login
    };

    return (
        <div className="App">
            <header>
                <h1>Sistema NUAM</h1>
                {rol && <button onClick={handleLogout}>Cerrar Sesión</button>}
            </header>

            <main>
                {!rol && <Login onLogin={handleLogin} />}
                
                {rol === 'ADMIN' && <DashboardAdmin />}

                {rol === 'CORREDOR' && <DashboardCorredor />}

                {rol === 'AUDITOR' && <DashboardAuditor />}
            </main>
        </div>
    );
}

export default App;