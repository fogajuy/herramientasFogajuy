// import React, { useState } from 'react';
// import FormularioEncabezado from './formularioEncabezado';
// import FormularioIngresos from './formularioIngresos';
// import FormularioEgresos from './formularioEgresos';
// import FormularioInversiones from './formularioInversiones';
// import FormularioFinanciacion from './formularioFinanciacion';

// const ContenedorEvaluador = () => {
//     const [tabActiva, setTabActiva] = useState(1);

//     // Obtenemos la fecha de hoy para el valor por defecto
//     const hoy = new Date().toISOString().split('T')[0];

//     // 🏆 EL GRAN JSON MAESTRO AISLADO 🏆
//     const [datosProyecto, setDatosProyecto] = useState({
//         encabezado: {
//             titular: '', 
//             expediente: '', 
//             localidad: '', 
//             monto: '', 
//             nombreProyecto: '', 
//             fecha: hoy, 
//             periodos: 1
//         },
//         flujoFondos: {
//             ingresos: [], egresosFijos: [], egresosVariables: []
//         },
//         inversionesCapital: {
//             inversiones: [], capitalTrabajo: []
//         },
//         financiacion: {
//             credito: {}, deudas: []
//         }
//     });

//     const actualizarDatosProyecto = (seccion, nuevosDatos) => {
//         setDatosProyecto(prev => ({
//             ...prev,
//             [seccion]: nuevosDatos
//         }));
//     };

//     const tabStyle = (isActive) => ({
//         padding: '10px 20px',
//         cursor: 'pointer',
//         border: 'none',
//         backgroundColor: isActive ? '#1976d2' : '#e0e0e0',
//         color: isActive ? 'white' : '#333',
//         fontWeight: 'bold',
//         flex: 1,
//         borderRadius: '5px 5px 0 0',
//         marginRight: '5px'
//     });

//     return (
//         <div style={{ maxWidth: '1000px', margin: '30px auto', fontFamily: 'sans-serif', border: '1px solid #ccc', padding: '20px', borderRadius: '10px', backgroundColor: '#fafafa' }}>
//             <h2 style={{ textAlign: 'center', color: '#333', marginTop: 0 }}>Módulo de Evaluación de Proyectos</h2>
            
//             {/* TABS */}
//             <div style={{ display: 'flex', borderBottom: '3px solid #1976d2', marginBottom: '20px' }}>
//                 <button style={tabStyle(tabActiva === 1)} onClick={() => setTabActiva(1)}>1. Datos Generales</button>
//                 <button style={tabStyle(tabActiva === 2)} onClick={() => setTabActiva(2)}>2. Ingresos y Egresos</button>
//                 <button style={tabStyle(tabActiva === 3)} onClick={() => setTabActiva(3)}>3. Inversiones</button>
//                 <button style={tabStyle(tabActiva === 4)} onClick={() => setTabActiva(4)}>4. Financiación</button>
//             </div>

//             {/* FORMULARIO ACTIVO */}
//             <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '0 0 8px 8px' }}>
//                 {tabActiva === 1 && (
//                     <FormularioEncabezado 
//                         datos={datosProyecto.encabezado} 
//                         onActualizar={(datos) => actualizarDatosProyecto('encabezado', datos)} 
//                     />
//                 )}
                
//                 {/* TAB 2: Renderizamos AMBOS formularios pasándoles el flujoFondos */}
//                 {tabActiva === 2 && (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
//                         <FormularioIngresos 
//                             periodos={datosProyecto.encabezado.periodos}
//                             datos={datosProyecto.flujoFondos}
//                             onActualizar={(datos) => actualizarDatosProyecto('flujoFondos', datos)}
//                         />
//                         <FormularioEgresos 
//                             periodos={datosProyecto.encabezado.periodos}
//                             datos={datosProyecto.flujoFondos}
//                             onActualizar={(datos) => actualizarDatosProyecto('flujoFondos', datos)}
//                         />
//                     </div>
//                 )}
                
//                 {tabActiva === 3 && (
//                     <FormularioInversiones 
//                         periodos={datosProyecto.encabezado.periodos}
//                         datos={datosProyecto.inversionesCapital}
//                         onActualizar={(datos) => actualizarDatosProyecto('inversionesCapital', datos)}
//                     />
//                 )}
//                 {tabActiva === 4 && (
//                     <FormularioFinanciacion 
//                         periodos={datosProyecto.encabezado.periodos}
//                         datos={datosProyecto.financiacion}
//                         onActualizar={(datos) => actualizarDatosProyecto('financiacion', datos)}
//                     />
//                 )}
//             </div>

//             {/* VISOR PARA DEBUG */}
//             <div style={{ marginTop: '40px', padding: '20px', background: '#282c34', color: '#61dafb', borderRadius: '8px' }}>
//                 <h3 style={{ marginTop: 0 }}>JSON Maestro (Debug)</h3>
//                 <pre style={{ fontSize: '13px', overflowX: 'auto', margin: 0 }}>
//                     {JSON.stringify(datosProyecto, null, 2)}
//                 </pre>
//             </div>
//         </div>
//     );
// };

// export default ContenedorEvaluador;

import React, { useState, useEffect } from 'react';
import FormularioEncabezado from './formularioEncabezado';
import FormularioIngresos from './formularioIngresos';
import FormularioEgresos from './formularioEgresos';
import FormularioInversiones from './formularioInversiones';
import FormularioFinanciacion from './formularioFinanciacion';
import FlujoDeCaja from './FlujoDeCaja'; 

// Definimos el estado inicial fuera del componente (o al principio) para poder reusarlo al resetear
const hoy = new Date().toISOString().split('T')[0];
const ESTADO_INICIAL_PROYECTO = {
    encabezado: {
        titular: '', expediente: '', localidad: '', monto: '', nombreProyecto: '', fecha: hoy, periodos: 5
    },
    flujoFondos: {
        ingresos: [], egresosFijos: [], egresosVariables: []
    },
    inversionesCapital: {
        inversiones: [], capitalTrabajo: []
    },
    financiacion: {
        credito: {}, deudas: []
    }
};

const ContenedorEvaluador = () => {
    const [tabActiva, setTabActiva] = useState(1);

    // 🏆 1. INICIALIZACIÓN INTELIGENTE (Busca en localStorage o usa el inicial)
    const [datosProyecto, setDatosProyecto] = useState(() => {
        const datosGuardados = localStorage.getItem('expediente_maestro');
        return datosGuardados ? JSON.parse(datosGuardados) : ESTADO_INICIAL_PROYECTO;
    });

    // 💾 2. GUARDADO AUTOMÁTICO EN LOCALSTORAGE
    // Cada vez que datosProyecto cambia, se actualiza el archivo en el navegador
    useEffect(() => {
        localStorage.setItem('expediente_maestro', JSON.stringify(datosProyecto));
    }, [datosProyecto]);

    const actualizarDatosProyecto = (seccion, nuevosDatos) => {
        setDatosProyecto(prev => ({
            ...prev,
            [seccion]: nuevosDatos
        }));
    };

    // 🗑️ 3. FUNCIÓN PARA RESETEAR (Nuevo Expediente)
    const resetearEvaluacion = () => {
        if(window.confirm("¿Estás seguro de borrar todos los datos y empezar un expediente nuevo?")) {
            setDatosProyecto(ESTADO_INICIAL_PROYECTO);
            localStorage.removeItem('expediente_maestro');
            setTabActiva(1); // Volvemos a la pestaña 1
        }
    };

    // 📄 4. FUNCIÓN PARA EL PDF (Base)
    const generarExpedientePDF = () => {
        alert("¡Todo listo en la estructura! En el próximo paso instalaremos jsPDF para tomar el JSON Maestro e imprimir el documento A4 foliado.");
    };

    const tabStyle = (isActive) => ({
        padding: '10px 20px', cursor: 'pointer', border: 'none',
        backgroundColor: isActive ? '#1976d2' : '#e0e0e0',
        color: isActive ? 'white' : '#333',
        fontWeight: 'bold', flex: 1, borderRadius: '5px 5px 0 0', marginRight: '5px'
    });

    // ADAPTAMOS LOS INGRESOS/EGRESOS AL FORMATO QUE ESPERA LA TABLA [0,0,0...]
    const ingresosProcesados = datosProyecto.flujoFondos.ingresos.length > 0 
        ? datosProyecto.flujoFondos.ingresos 
        : Array(Number(datosProyecto.encabezado.periodos)).fill(0);
        
    const egresosProcesados = (datosProyecto.flujoFondos.egresosFijos.length > 0)
        ? datosProyecto.flujoFondos.egresosFijos 
        : Array(Number(datosProyecto.encabezado.periodos)).fill(0);

    return (
        <div style={{ maxWidth: '1200px', margin: '30px auto', fontFamily: 'sans-serif', border: '1px solid #ccc', padding: '20px', borderRadius: '10px', backgroundColor: '#fafafa' }}>
            
            {/* 🆕 ENCABEZADO CON BOTONES MAESTROS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#333', margin: 0 }}>Módulo de Evaluación de Proyectos</h2>
                <div>
                    <button 
                        onClick={resetearEvaluacion} 
                        style={{ padding: '10px 15px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', marginRight: '10px', cursor: 'pointer' }}
                    >
                        🔄 Nuevo Expediente
                    </button>
                    <button 
                        onClick={generarExpedientePDF} 
                        style={{ padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        📄 Crear Expediente (PDF)
                    </button>
                </div>
            </div>
            
            {/* TABS */}
            <div style={{ display: 'flex', borderBottom: '3px solid #1976d2', marginBottom: '20px' }}>
                <button style={tabStyle(tabActiva === 1)} onClick={() => setTabActiva(1)}>1. Datos Generales</button>
                <button style={tabStyle(tabActiva === 2)} onClick={() => setTabActiva(2)}>2. Ingresos y Egresos</button>
                <button style={tabStyle(tabActiva === 3)} onClick={() => setTabActiva(3)}>3. Inversiones</button>
                <button style={tabStyle(tabActiva === 4)} onClick={() => setTabActiva(4)}>4. Financiación</button>
            </div>

            {/* FORMULARIO ACTIVO */}
            <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '0 0 8px 8px', minHeight: '300px' }}>
                {tabActiva === 1 && (
                    <FormularioEncabezado datos={datosProyecto.encabezado} onActualizar={(datos) => actualizarDatosProyecto('encabezado', datos)} />
                )}
                {tabActiva === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <FormularioIngresos periodos={datosProyecto.encabezado.periodos} datos={datosProyecto.flujoFondos} onActualizar={(datos) => actualizarDatosProyecto('flujoFondos', datos)} />
                        <FormularioEgresos periodos={datosProyecto.encabezado.periodos} datos={datosProyecto.flujoFondos} onActualizar={(datos) => actualizarDatosProyecto('flujoFondos', datos)} />
                    </div>
                )}
                {tabActiva === 3 && (
                    <FormularioInversiones 
                        periodos={datosProyecto.encabezado.periodos}
                        inversiones={datosProyecto.inversionesCapital.inversiones}
                        setInversiones={(nuevasInversiones) => actualizarDatosProyecto('inversionesCapital', { 
                            ...datosProyecto.inversionesCapital, 
                            inversiones: nuevasInversiones 
                        })}
                        capitalTrabajo={datosProyecto.inversionesCapital.capitalTrabajo}
                        setCapitalTrabajo={(nuevoCapital) => actualizarDatosProyecto('inversionesCapital', { 
                            ...datosProyecto.inversionesCapital, 
                            capitalTrabajo: nuevoCapital 
                        })}
                    />
                )}
                {tabActiva === 4 && (
                    <FormularioFinanciacion periodos={datosProyecto.encabezado.periodos} datos={datosProyecto.financiacion} onActualizar={(datos) => actualizarDatosProyecto('financiacion', datos)} />
                )}
            </div>

            {/* RENDERIZAMOS EL FLUJO DE CAJA (La tabla de resultados) */}
            <div style={{ marginTop: '40px' }}>
                <FlujoDeCaja 
                    periodos={datosProyecto.encabezado.periodos}
                    inversiones={datosProyecto.inversionesCapital.inversiones}
                    capitalTrabajo={datosProyecto.inversionesCapital.capitalTrabajo}
                    ingresosAños={ingresosProcesados}
                    egresosAños={egresosProcesados}
                    
                    // ⚠️ LÍNEA CAMBIADA: Pasamos todo el nodo de financiación
                    financiacion={datosProyecto.financiacion} 
                    
                    tasaImpositiva={30}
                />
            </div>

            {/* VISOR PARA DEBUG (Ideal para ver cómo se va armando todo) */}
            <div style={{ marginTop: '40px', padding: '20px', background: '#282c34', color: '#61dafb', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0 }}>JSON Maestro (Debug)</h3>
                <pre style={{ fontSize: '13px', overflowX: 'auto', margin: 0 }}>
                    {JSON.stringify(datosProyecto, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default ContenedorEvaluador;