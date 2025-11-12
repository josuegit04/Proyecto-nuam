import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardCorredor from './components/DashboardCorredor';
import DashboardAuditor from './components/DashboardAuditor';   

function App() {
    const [rol, setRol] = useState(localStorage.getItem('rol'));

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
        localStorage.clear();
        setRol(null); 
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