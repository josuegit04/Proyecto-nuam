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
    
    const [searchTerm, setSearchTerm] = useState("");
    const [certificadoAEditar, setCertificadoAEditar] = useState(null);

    const auth = localStorage.getItem('auth');

    useEffect(() => {
        fetchCertificados();
    }, []);

    const fetchCertificados = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/corredor/certificados', { headers: { 'Authorization': auth } });
            if (response.ok) setCertificados(await response.json());
        } catch (error) { console.error("Error cargando certificados:", error); }
    };

    const handleEditar = (cert) => {
        setCertificadoAEditar(cert); 
        setActiveTab('CARGA');
        setSubTab('MANUAL');
    };

    const handleCargaExitosa = (origen) => {
        fetchCertificados();
        setCertificadoAEditar(null);
        if (origen === 'MANUAL') {
            setActiveTab('LISTA');
        }
    };

    return (
        <div>
            <div style={styles.tabs}>
                <div style={styles.tab(activeTab === 'CARGA')} onClick={() => { setActiveTab('CARGA'); setCertificadoAEditar(null); }}>
                    {certificadoAEditar ? 'Corregir Certificado' : 'Nueva Carga'}
                </div>
                <div style={styles.tab(activeTab === 'LISTA')} onClick={() => setActiveTab('LISTA')}>Mis Certificados</div>
            </div>

            {activeTab === 'CARGA' && (
                <div>
                    {!certificadoAEditar && (
                        <div style={{display:'flex', gap:'10px', marginBottom:'15px'}}>
                            <button className="btn-primary" style={{opacity: subTab==='MANUAL'?1:0.5}} onClick={()=>setSubTab('MANUAL')}>Manual</button>
                            <button className="btn-primary" style={{opacity: subTab==='MASIVA'?1:0.5}} onClick={()=>setSubTab('MASIVA')}>Masiva (Excel)</button>
                        </div>
                    )}
                    
                    <div className="card">
                        {subTab === 'MANUAL' && (
                            <CargaManual   
                                onCargaExitosa={() => handleCargaExitosa('MANUAL')}
                                edicionData={certificadoAEditar} 
                            />
                        )}
                        {subTab === 'MASIVA' && (
                            <CargaMasiva 
                                onCargaExitosa={() => handleCargaExitosa('MASIVA')}
                            />
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'LISTA' && (
                <div className="card">
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                        <h2>Mis Certificados Registrados</h2>
                        <input 
                            type="text" 
                            placeholder="🔍 Buscar..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            style={{padding:'8px', width:'250px', borderRadius:'4px', border:'1px solid #ccc'}}
                        />
                    </div>

                    <table>
                        <thead>
                            <tr><th>Folio</th><th>Instrumento</th><th>Fecha</th><th>Monto Original</th><th>Estado</th><th>Acción</th></tr>
                        </thead>
                        <tbody>
                            {certificados
                                .filter(c => 
                                    (c.nroCertificado?.toString() || "").includes(searchTerm) ||
                                    (c.instrumento?.toLowerCase() || "").includes(searchTerm.toLowerCase())
                                )
                                .map(c => (
                                    <tr key={c.id}>
                                        <td>{c.nroCertificado}</td>
                                        <td>{c.instrumento}</td>
                                        <td>{c.fechaPago}</td>
                                        <td>${c.montoPago?.toLocaleString('es-CL')}</td>
                                        <td style={{fontWeight:'bold', color: c.estado==='PENDIENTE'?'orange':c.estado==='APROBADO'?'green':'red'}}>
                                            {c.estado}
                                        </td>
                                        <td>
                                            {c.estado === 'RECHAZADO' && (
                                                <button className="btn-primary" style={{padding:'5px 10px', fontSize:'12px', backgroundColor:'#ffc107', color:'#000'}} onClick={() => handleEditar(c)}>
                                                    Corregir
                                                </button>
                                            )}
                                            {c.estado === 'APROBADO' && <span>✅ Listo</span>}
                                            {c.estado === 'PENDIENTE' && <span>Esperando...</span>}
                                        </td>
                                    </tr>
                                ))
                            }
                            {certificados.length > 0 && certificados.filter(c => (c.instrumento?.toLowerCase()||"").includes(searchTerm.toLowerCase())).length === 0 && 
                                <tr><td colSpan="6" style={{textAlign:'center'}}>No hay coincidencias.</td></tr>
                            }
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default DashboardCorredor;