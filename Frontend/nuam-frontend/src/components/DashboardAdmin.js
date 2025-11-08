// src/components/DashboardAdmin.js (actualizado con estilos)
import React, { useState, useEffect } from 'react';

function DashboardAdmin() {
    const [eventos, setEventos] = useState([]);

    useEffect(() => {
        const fetchAuditoria = async () => {
            const auth = localStorage.getItem('auth');
            try {
                const response = await fetch('http://localhost:8080/api/admin/auditoria', {
                    headers: { 'Authorization': auth }
                });
                if (response.ok) {
                    const data = await response.json();
                    setEventos(data);
                } else {
                    console.error("Error al obtener auditoría");
                    // Puedes agregar un mensaje de error en la UI si lo deseas
                }
            } catch (error) {
                console.error("Error de conexión:", error);
            }
        };
        fetchAuditoria();
    }, []);

    return (
        <div className="card">
            <h2>Panel de Administrador - Actividad Reciente</h2>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Evento</th>
                        <th>Usuario</th>
                        <th>Fecha y Hora</th>
                    </tr>
                </thead>
                <tbody>
                    {eventos.map(evento => (
                        <tr key={evento.id}>
                            <td>{evento.id}</td>
                            <td>{evento.evento}</td>
                            <td>{evento.usuarioCorreo}</td>
                            <td>{new Date(evento.fechaEvento).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default DashboardAdmin;