import React, { useState } from 'react';

const OPCIONES_ACTIVOS_FISICOS = [
    "Terrenos", "Obra civil", "Maquinarias", "Equipos", 
    "Instalaciones", "Rodados", "Gastos de montajes", 
    "Cultivos", "Animales", "Software/Intangibles", "Otros"
];

const OPCIONES_CAPITAL_TRABAJO = [
    "Stock de materia prima", "Stock de materiales", 
    "Stock de productos en proceso", "Stock de producto terminado", 
    "Crédito por ventas", "Disponibilidades en Caja y/o Bcos"
];

const FormularioInversiones = ({ numeroPaso, onGuardar, datosIniciales, periodosGlobales }) => {
    
    // Inicializamos el estado local con los datos previos o arrays vacíos
    const [inversiones, setInversiones] = useState(datosIniciales?.inversiones || []);
    const [capitalTrabajo, setCapitalTrabajo] = useState(datosIniciales?.capitalTrabajo || []);

    // --- MANEJO DE INVERSIONES FÍSICAS ---
    const agregarInversion = () => {
        setInversiones([...inversiones, { id: Date.now(), concepto: '', monto: 0, periodoInicio: 0, vidaUtil: 5 }]);
    };

    const actualizarInversion = (id, campo, valor) => {
        setInversiones(inversiones.map(inv => inv.id === id ? { ...inv, [campo]: valor } : inv));
    };

    const eliminarInversion = (id) => {
        setInversiones(inversiones.filter(inv => inv.id !== id));
    };

    // --- MANEJO DE CAPITAL DE TRABAJO ---
    const agregarCapitalTrabajo = () => {
        setCapitalTrabajo([...capitalTrabajo, { id: Date.now(), concepto: '', monto: 0 }]);
    };

    const actualizarCapitalTrabajo = (id, campo, valor) => {
        setCapitalTrabajo(capitalTrabajo.map(cap => cap.id === id ? { ...cap, [campo]: valor } : cap));
    };

    const eliminarCapitalTrabajo = (id) => {
        setCapitalTrabajo(capitalTrabajo.filter(cap => cap.id !== id));
    };

    // --- GUARDAR ESTADO ---
    const handleGuardar = () => {
        onGuardar(numeroPaso, { inversiones, capitalTrabajo });
    };

    return (
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
            <h2 style={{ color: '#1565c0', marginTop: 0 }}>Paso {numeroPaso}: Inversiones del Proyecto</h2>
            
            {/* SECCIÓN 1: INVERSIONES FÍSICAS */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px', color: '#424242' }}>1. Activos Físicos e Intangibles</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>Maquinaria, obras, software, etc. Ingresa el monto, año de desembolso y su vida útil.</p>
                
                {inversiones.map((inv, index) => (
                    <div key={inv.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 'bold', width: '20px' }}>{index + 1}.</span>
                        
                        <select 
                            value={inv.concepto} 
                            onChange={(e) => actualizarInversion(inv.id, 'concepto', e.target.value)}
                            style={{ flex: '1 1 200px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                        >
                            <option value="">-- Seleccione una inversión --</option>
                            {OPCIONES_ACTIVOS_FISICOS.map((opcion, i) => (
                                <option key={i} value={opcion}>{opcion}</option>
                            ))}
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>$</span>
                            <input 
                                type="number" placeholder="Monto" min="0"
                                value={inv.monto === 0 ? '' : inv.monto} 
                                onChange={(e) => actualizarInversion(inv.id, 'monto', Number(e.target.value))}
                                style={{ width: '120px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '14px' }}>Año:</span>
                            <select 
                                value={inv.periodoInicio} 
                                onChange={(e) => actualizarInversion(inv.id, 'periodoInicio', Number(e.target.value))}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                            >
                                {/* Utilizamos los periodos globales del orquestador */}
                                {Array.from({ length: (periodosGlobales || 5) + 1 }).map((_, i) => (
                                    <option key={i} value={i}>{i === 0 ? '0 (Inicial)' : i}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '14px', title: "Años que dura el activo" }}>Vida útil:</span>
                            <input 
                                type="number" placeholder="Años" min="1"
                                value={inv.vidaUtil === 0 ? '' : inv.vidaUtil} 
                                onChange={(e) => actualizarInversion(inv.id, 'vidaUtil', Number(e.target.value))}
                                style={{ width: '70px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>

                        <button onClick={() => eliminarInversion(inv.id)} style={{ padding: '8px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>X</button>
                    </div>
                ))}
                <button onClick={agregarInversion} style={{ padding: '8px 15px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                    + Agregar Activo
                </button>
            </div>

            {/* SECCIÓN 2: CAPITAL DE TRABAJO */}
            <div>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px', color: '#424242' }}>2. Capital de Trabajo Inicial</h3>
                
                {capitalTrabajo.map((cap, index) => (
                    <div key={cap.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', width: '20px' }}>{index + 1}.</span>
                        
                        <select 
                            value={cap.concepto} 
                            onChange={(e) => actualizarCapitalTrabajo(cap.id, 'concepto', e.target.value)}
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                        >
                            <option value="">-- Seleccione un concepto --</option>
                            {OPCIONES_CAPITAL_TRABAJO.map((opcion, i) => (
                                <option key={i} value={opcion}>{opcion}</option>
                            ))}
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>$</span>
                            <input 
                                type="number" placeholder="Monto" min="0"
                                value={cap.monto === 0 ? '' : cap.monto} 
                                onChange={(e) => actualizarCapitalTrabajo(cap.id, 'monto', Number(e.target.value))}
                                style={{ width: '150px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <button onClick={() => eliminarCapitalTrabajo(cap.id)} style={{ padding: '8px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>X</button>
                    </div>
                ))}
                <button onClick={agregarCapitalTrabajo} style={{ padding: '8px 15px', background: '#43a047', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                    + Agregar Capital de Trabajo
                </button>
            </div>

            {/* BOTÓN DE GUARDADO */}
            <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '15px', textAlign: 'right' }}>
                <button 
                    onClick={handleGuardar} 
                    style={{ padding: '10px 20px', background: '#0d47a1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
                >
                    Guardar y Continuar
                </button>
            </div>
        </div>
    );
};

export default FormularioInversiones;