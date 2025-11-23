import React, { useState, useEffect } from 'react';
import CargaManual from './CargaManual'; 
import CargaMasiva from './CargaMasiva'; 

const tabStyles = {
    tabsContainer: { display: 'flex', marginBottom: '-1px' },
    tab: (isActive) => ({
        padding: '15px 25px', cursor: 'pointer', border: '1px solid #E2E8F0', borderBottom: 'none',
        borderTopLeftRadius: '8px', borderTopRightRadius: '8px',
        backgroundColor: isActive ? 'white' : '#F4F6F8',
        fontWeight: isActive ? '700' : '500', color: isActive ? '#002D5C' : '#4A5568',
        marginRight: '5px', position: 'relative', top: isActive ? '1px' : '0'
    })
};

function DashboardCorredor() {
    const [certificados, setCertificados] = useState([]);
    const [view, setView] = useState('manual'); 
    const auth = localStorage.getItem('auth');

    useEffect(() => { fetchCertificados(); }, []);

    const fetchCertificados = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/corredor/certificados', {
                headers: { 'Authorization': auth }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("DATA RECIBIDA DEL BACKEND:", data);
                setCertificados(data);
            }
        } catch (error) { console.error("Error:", error); }
    };

    return (
        <div>
            <div style={tabStyles.tabsContainer}>
                <div style={tabStyles.tab(view === 'manual')} onClick={() => setView('manual')}>Carga Manual</div>
                <div style={tabStyles.tab(view === 'masiva')} onClick={() => setView('masiva')}>Carga Masiva (Excel)</div>
            </div>

            <div className="card">
                {view === 'manual' && <CargaManual onCargaExitosa={fetchCertificados} />}
                {view === 'masiva' && <CargaMasiva onCargaExitosa={fetchCertificados} />}
            </div>

            <div className="card">
                <h2>Mis Certificados Registrados</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Folio</th>
                            <th>Cód. Único</th>
                            <th>Tipo</th>
                            <th>Año</th>
                            <th>Monto</th>
                            <th>Fecha Pago</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {certificados.length === 0 ? (
                            <tr><td colSpan="7" style={{textAlign: 'center'}}>No hay certificados registrados.</td></tr>
                        ) : (
                            certificados.map(cert => (
                                <tr key={cert.id}>
                                    <td>{cert.nroCertificado}</td>
                                    <td>{cert.codigoCertificado}</td>
                                    <td>{cert.tipoCertificado ? cert.tipoCertificado.nombre : 'N/A'}</td>
                                    <td>{cert.anioTributario}</td>
                                    
                                    <td>${cert.montoPago ? cert.montoPago.toLocaleString('es-CL') : '0'}</td>
                                    
                                    <td>{cert.fechaPago}</td>
                                    
                                    <td style={{ fontWeight: 'bold', color: cert.estado === 'PENDIENTE' ? '#ff9800' : (cert.estado === 'APROBADO' ? 'green' : 'red') }}>
                                        {cert.estado}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DashboardCorredor;