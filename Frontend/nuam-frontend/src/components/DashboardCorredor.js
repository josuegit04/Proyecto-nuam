import React, { useState, useEffect } from 'react';
import CargaManual from './CargaManual'; 
import CargaMasiva from './CargaMasiva'; 

const styles = {
    tabs: { display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: '20px' },
    tab: (active) => ({
        padding: '15px 30px', cursor: 'pointer', fontWeight: 'bold', 
        borderBottom: active ? '3px solid #002D5C' : 'none', color: active ? '#002D5C' : '#666'
    })
};

function DashboardCorredor() {
    const [activeTab, setActiveTab] = useState('CARGA');
    const [subTab, setSubTab] = useState('MANUAL'); 
    
    const [certificados, setCertificados] = useState([]);
    const auth = localStorage.getItem('auth');

    useEffect(() => {
        fetchCertificados();
    }, []);

    const fetchCertificados = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/corredor/certificados', { headers: { 'Authorization': auth } });
            if (response.ok) {
                setCertificados(await response.json());
            }
        } catch (error) { console.error("Error cargando certificados:", error); }
    };

    return (
        <div>
            <div style={styles.tabs}>
                <div style={styles.tab(activeTab === 'CARGA')} onClick={() => setActiveTab('CARGA')}>Nueva Carga</div>
                <div style={styles.tab(activeTab === 'LISTA')} onClick={() => setActiveTab('LISTA')}>Mis Certificados</div>
            </div>

            {activeTab === 'CARGA' && (
                <div>
                    <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                        <button className="btn-primary" style={{opacity: subTab==='MANUAL'?1:0.5}} onClick={()=>setSubTab('MANUAL')}>Manual</button>
                        <button className="btn-primary" style={{opacity: subTab==='MASIVA'?1:0.5}} onClick={()=>setSubTab('MASIVA')}>Masiva (Excel)</button>
                    </div>
                    <div className="card">
                        {subTab === 'MANUAL' && <CargaManual onCargaExitosa={fetchCertificados} />}
                        {subTab === 'MASIVA' && <CargaMasiva onCargaExitosa={fetchCertificados} />}
                    </div>
                </div>
            )}

            {/* VISTA 2: LISTA */}
            {activeTab === 'LISTA' && (
                <div className="card">
                    <h2>Mis Certificados Registrados</h2>
                    <table>
                        <thead>
                            <tr><th>Folio</th><th>Cód. Único</th><th>Tipo</th><th>Año</th><th>Monto Original</th><th>Estado</th></tr>
                        </thead>
                        <tbody>
                            {certificados.length === 0 ? (<tr><td colSpan="6">Sin registros.</td></tr>) : (
                                certificados.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.nroCertificado}</td>
                                        <td>{c.codigoCertificado}</td>
                                        <td>{c.tipoCertificado?.nombre}</td>
                                        <td>{c.anioTributario}</td>
                                        <td>${c.montoPago?.toLocaleString('es-CL')}</td>
                                        <td style={{fontWeight:'bold', color: c.estado==='PENDIENTE'?'orange':c.estado==='APROBADO'?'green':'red'}}>{c.estado}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default DashboardCorredor;