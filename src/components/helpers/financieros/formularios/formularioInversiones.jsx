// import React, { useState } from 'react';

// const tiposInversionDefault = [
//     "1. Terrenos", "2. Obra civil", "3. Maquinarias", "4. Equipos", 
//     "5. Instalaciones", "6. Rodados", "7. Gastos de montajes", 
//     "8. Cultivos", "9. Animales", "10. Otros"
// ];

// const categoriasCapitalDefault = [
//     "1. Stock de materia prima", "2. Stock de materiales", 
//     "3. Stock de productos en proceso", "4. Stock de producto terminado", 
//     "5. Crédito por ventas", "6. Disponibilidades en Caja y/o Bancos"
// ];

// const generarCapitalInicial = () => 
//     categoriasCapitalDefault.map((cat, index) => ({ id: `cap-${index}`, nombre: cat, monto: 0 }));

// const FormularioInversiones = ({ 
//     periodos = 5,
//     inversiones: inversionesProp,
//     setInversiones: setInversionesProp,
//     capitalTrabajo: capitalTrabajoProp,
//     setCapitalTrabajo: setCapitalTrabajoProp
// }) => {
//     const cantidadPeriodos = Number(periodos) || 5;

//     // Estados locales de respaldo (Modo Híbrido)
//     const [inversionesLocales, setInversionesLocales] = useState([]);
//     const [capitalLocales, setCapitalLocales] = useState(generarCapitalInicial);

//     // Selección dinámica de datos (prop del padre o estado local)
//     const inversiones = inversionesProp !== undefined ? inversionesProp : inversionesLocales;
//     const setInversiones = setInversionesProp || setInversionesLocales;

//     const capitalTrabajo = capitalTrabajoProp !== undefined ? capitalTrabajoProp : capitalLocales;
//     const setCapitalTrabajo = setCapitalTrabajoProp || setCapitalLocales;

//     // --- MANEJO DE INVERSIONES FÍSICAS ---
//     const agregarInversion = () => {
//         const nueva = {
//             id: Date.now(),
//             tipo: tiposInversionDefault[2], // Maquinarias por defecto
//             monto: 0,
//             periodoInicio: 0,
//             vidaUtil: 5
//         };
//         setInversiones((prev) => [...(prev || []), nueva]);
//     };

//     const handleInversionChange = (id, campo, valor) => {
//         setInversiones((prev) => (prev || []).map(inv => 
//             inv.id === id ? { ...inv, [campo]: campo === 'tipo' ? valor : Math.max(0, Number(valor) || 0) } : inv
//         ));
//     };

//     const eliminarInversion = (id) => {
//         setInversiones((prev) => (prev || []).filter(inv => inv.id !== id));
//     };

//     // --- MANEJO DE CAPITAL DE TRABAJO ---
//     const handleCapitalChange = (id, valor) => {
//         const montoNum = Math.max(0, Number(valor) || 0);
//         setCapitalTrabajo((prev) => (prev || []).map(cap => 
//             cap.id === id ? { ...cap, monto: montoNum } : cap
//         ));
//     };

//     // --- CÁLCULOS FINANCIEROS Y TOTALES ---
//     const totalInversionesFisicas = (inversiones || []).reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
//     const totalCapitalTrabajo = (capitalTrabajo || []).reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
    
//     // Inversión en Año 0 (Físicas Año 0 + Capital de Trabajo)
//     const inversionesAñoCero = (inversiones || [])
//         .filter(inv => Number(inv.periodoInicio) === 0)
//         .reduce((acc, item) => acc + (Number(item.monto) || 0), 0);
    
//     const totalInversionInicial = inversionesAñoCero + totalCapitalTrabajo;

//     return (
//         <div style={{ padding: '20px', maxWidth: '1000px', margin: '20px auto', fontFamily: 'sans-serif', background: '#f8f9fa', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
            
//             {/* RESUMEN EJECUTIVO DE INVERSIÓN */}
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' }}>
//                 <div style={{ background: '#1565c0', color: 'white', padding: '15px', borderRadius: '8px' }}>
//                     <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.8 }}>Total Inv. Físicas</div>
//                     <div style={{ fontSize: '20px', fontWeight: 'bold' }}>$ {totalInversionesFisicas.toLocaleString('es-AR')}</div>
//                 </div>
//                 <div style={{ background: '#2e7d32', color: 'white', padding: '15px', borderRadius: '8px' }}>
//                     <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.8 }}>Total Capital de Trabajo</div>
//                     <div style={{ fontSize: '20px', fontWeight: 'bold' }}>$ {totalCapitalTrabajo.toLocaleString('es-AR')}</div>
//                 </div>
//                 <div style={{ background: '#424242', color: 'white', padding: '15px', borderRadius: '8px' }}>
//                     <div style={{ fontSize: '12px', textTransform: 'uppercase', opacity: 0.8 }}>Desembolso Inicial (Año 0)</div>
//                     <div style={{ fontSize: '20px', fontWeight: 'bold' }}>$ {totalInversionInicial.toLocaleString('es-AR')}</div>
//                 </div>
//             </div>

//             {/* SECCIÓN 1: INVERSIONES FÍSICAS */}
//             <div style={{ marginBottom: '35px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
//                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #1565c0', paddingBottom: '10px', marginBottom: '15px' }}>
//                     <h3 style={{ margin: 0, color: '#1565c0' }}>1. Inversiones Físicas y Equipamiento</h3>
//                     <button 
//                         onClick={agregarInversion}
//                         style={{ padding: '8px 15px', background: '#1565c0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
//                     >
//                         + Agregar Activo
//                     </button>
//                 </div>

//                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
//                     <thead>
//                         <tr style={{ backgroundColor: '#e3f2fd', color: '#0d47a1' }}>
//                             <th style={{ padding: '10px', border: '1px solid #bbdefb' }}>Tipo de Inversión</th>
//                             <th style={{ padding: '10px', border: '1px solid #bbdefb' }}>Monto ($)</th>
//                             <th style={{ padding: '10px', border: '1px solid #bbdefb', textAlign: 'center' }}>Año de Alta</th>
//                             <th style={{ padding: '10px', border: '1px solid #bbdefb', textAlign: 'center' }}>Vida Útil (Años)</th>
//                             <th style={{ padding: '10px', border: '1px solid #bbdefb', textAlign: 'center', width: '50px' }}>Acción</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {(inversiones || []).length === 0 ? (
//                             <tr>
//                                 <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#757575' }}>
//                                     No hay inversiones registradas. Presioná <strong>"+ Agregar Activo"</strong> para incluir equipamiento, obras o rodados.
//                                 </td>
//                             </tr>
//                         ) : (
//                             (inversiones || []).map((inv) => (
//                                 <tr key={inv.id}>
//                                     <td style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
//                                         <select 
//                                             value={inv.tipo} 
//                                             onChange={(e) => handleInversionChange(inv.id, 'tipo', e.target.value)}
//                                             style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
//                                         >
//                                             {tiposInversionDefault.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
//                                         </select>
//                                     </td>
//                                     <td style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
//                                         <input 
//                                             type="number" 
//                                             min="0"
//                                             value={inv.monto || ''} 
//                                             onChange={(e) => handleInversionChange(inv.id, 'monto', e.target.value)} 
//                                             placeholder="0" 
//                                             style={{ width: '90%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'right' }} 
//                                         />
//                                     </td>
//                                     <td style={{ padding: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
//                                         <input 
//                                             type="number" 
//                                             min="0" 
//                                             max={cantidadPeriodos} 
//                                             value={inv.periodoInicio} 
//                                             onChange={(e) => handleInversionChange(inv.id, 'periodoInicio', e.target.value)} 
//                                             style={{ width: '60px', padding: '6px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' }} 
//                                             title="0 = Al inicio del proyecto" 
//                                         />
//                                     </td>
//                                     <td style={{ padding: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
//                                         <input 
//                                             type="number" 
//                                             min="1" 
//                                             value={inv.vidaUtil} 
//                                             onChange={(e) => handleInversionChange(inv.id, 'vidaUtil', e.target.value)} 
//                                             style={{ width: '60px', padding: '6px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '4px' }} 
//                                         />
//                                     </td>
//                                     <td style={{ padding: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
//                                         <button 
//                                             onClick={() => eliminarInversion(inv.id)}
//                                             style={{ background: '#e53935', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
//                                         >
//                                             ✕
//                                         </button>
//                                     </td>
//                                 </tr>
//                             ))
//                         )}
//                     </tbody>
//                 </table>
//             </div>

//             {/* SECCIÓN 2: CAPITAL DE TRABAJO */}
//             <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
//                 <h3 style={{ borderBottom: '2px solid #2e7d32', paddingBottom: '10px', marginBottom: '15px', color: '#2e7d32', marginTop: 0 }}>
//                     2. Capital de Trabajo Requerido (Año 0)
//                 </h3>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
//                     {(capitalTrabajo || []).map((cap) => (
//                         <div key={cap.id} style={{ display: 'flex', flexDirection: 'column', background: '#f5f5f5', padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
//                             <label style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '6px', color: '#424242' }}>{cap.nombre}</label>
//                             <input 
//                                 type="number" 
//                                 min="0"
//                                 value={cap.monto || ''} 
//                                 onChange={(e) => handleCapitalChange(cap.id, e.target.value)}
//                                 placeholder="$ 0"
//                                 style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'right' }}
//                             />
//                         </div>
//                     ))}
//                 </div>
//             </div>

//         </div>
//     );
// };

// export default FormularioInversiones;

import React from 'react';

// Opciones predeterminadas para Inversiones Físicas
const OPCIONES_ACTIVOS_FISICOS = [
    "Terrenos",
    "Obra civil",
    "Maquinarias",
    "Equipos",
    "Instalaciones",
    "Rodados",
    "Gastos de montajes",
    "Cultivos",
    "Animales",
    "Otros"
];

// Opciones predeterminadas para Capital de Trabajo
const OPCIONES_CAPITAL_TRABAJO = [
    "Stock de materia prima",
    "Stock de materiales",
    "Stock de productos en proceso",
    "Stock de producto terminado",
    "Crédito por ventas",
    "Disponibilidades en Caja y/o Bcos"
];

const FormularioInversiones = ({ periodos, inversiones, setInversiones, capitalTrabajo, setCapitalTrabajo }) => {

    // --- MANEJO DE INVERSIONES FÍSICAS ---
    const agregarInversion = () => {
        setInversiones([...inversiones, { id: Date.now(), concepto: '', monto: 0, periodoInicio: 0 }]);
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

    return (
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #e0e0e0' }}>
            <h2 style={{ color: '#1565c0', marginTop: 0 }}>Inversiones del Proyecto</h2>
            
            {/* SECCIÓN 1: INVERSIONES FÍSICAS */}
            <div style={{ marginBottom: '30px' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px', color: '#424242' }}>1. Activos Físicos e Intangibles</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>Maquinaria, obras, software, etc. (Elegí en qué año se hace el desembolso).</p>
                
                {inversiones.map((inv, index) => (
                    <div key={inv.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', width: '20px' }}>{index + 1}.</span>
                        
                        {/* SELECT EN LUGAR DE INPUT TEXT */}
                        <select 
                            value={inv.concepto} 
                            onChange={(e) => actualizarInversion(inv.id, 'concepto', e.target.value)}
                            style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' }}
                        >
                            <option value="">-- Seleccione una inversión --</option>
                            {OPCIONES_ACTIVOS_FISICOS.map((opcion, i) => (
                                <option key={i} value={opcion}>{opcion}</option>
                            ))}
                        </select>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>$</span>
                            <input 
                                type="number" placeholder="Monto" 
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
                                {Array.from({ length: (periodos || 0) + 1 }).map((_, i) => (
                                    <option key={i} value={i}>{i === 0 ? '0 (Inicial)' : i}</option>
                                ))}
                            </select>
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
                <p style={{ fontSize: '14px', color: '#666' }}>Dinero necesario para operar antes de que el proyecto genere ingresos (Stock, caja chica). Se asume siempre en el Año 0.</p>
                
                {capitalTrabajo.map((cap, index) => (
                    <div key={cap.id} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold', width: '20px' }}>{index + 1}.</span>
                        
                        {/* SELECT EN LUGAR DE INPUT TEXT */}
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
                                type="number" placeholder="Monto" 
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
        </div>
    );
};

export default FormularioInversiones;