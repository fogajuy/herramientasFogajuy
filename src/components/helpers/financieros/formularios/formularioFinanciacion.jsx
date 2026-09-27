// import React, { useState } from 'react';

// const FormularioFinanciacion = ({ numeroPaso, datosIniciales, onGuardar, periodosGlobales = 5 }) => {
//     const [vistaActiva, setVistaActiva] = useState(1); 
//     const TASA_IVA = 0.21; // 21% IVA sobre intereses

//     // 1. ESTADO LOCAL: Inicializamos con los datos del localStorage (si existen) o vacío
//     const [datosLocales, setDatosLocales] = useState(datosIniciales || { credito: {}, deudas: [] });

//     // --- FUNCIONES FINANCIERAS (SISTEMA FRANCÉS + IVA + GRACIA) ---
//     const calcularCuadro = (monto, tasaAnual, meses, gracia = 0) => {
//         let cuadro = [];
//         let saldo = Number(monto) || 0;
//         let tasaMensual = (Number(tasaAnual) || 0) / 12 / 100;
        
//         let totalMeses = Math.min(Math.max(Number(meses) || 0, 0), 60);
//         let numGracia = Math.min(Math.max(Number(gracia) || 0, 0), Math.max(0, totalMeses - 1)); 

//         if (saldo <= 0 || totalMeses <= 0) return [];

//         let nAmort = totalMeses - numGracia; 
//         let cuotaPuraAmort = 0;
        
//         if (tasaMensual > 0 && nAmort > 0) {
//             cuotaPuraAmort = saldo * (tasaMensual * Math.pow(1 + tasaMensual, nAmort)) / (Math.pow(1 + tasaMensual, nAmort) - 1);
//         } else if (nAmort > 0) {
//             cuotaPuraAmort = saldo / nAmort;
//         }

//         for (let i = 1; i <= totalMeses; i++) {
//             let interes = saldo * tasaMensual;
//             let capital = 0;
//             let cuotaPura = 0;

//             if (i <= numGracia) {
//                 capital = 0;
//                 cuotaPura = interes;
//             } else {
//                 cuotaPura = cuotaPuraAmort;
//                 capital = cuotaPura - interes;
//             }

//             if (i === totalMeses) {
//                 capital = saldo;
//                 cuotaPura = capital + interes;
//             }

//             let ivaInteres = interes * TASA_IVA;
//             let cuotaTotal = cuotaPura + ivaInteres;

//             cuadro.push({
//                 mes: i, saldoInicial: saldo, capital: capital, interes: interes, iva: ivaInteres,
//                 cuotaPura: cuotaPura, cuotaTotal: cuotaTotal, saldoFinal: Math.max(0, saldo - capital)
//             });

//             saldo -= capital;
//             if (saldo < 0.01) saldo = 0; 
//         }
//         return cuadro;
//     };

//     const agruparAnual = (cuadro) => {
//         let años = [];
//         if (!cuadro || cuadro.length === 0) return años;

//         const totalMeses = cuadro.length;
//         const periodosReales = Math.ceil(totalMeses / 12);

//         for (let i = 1; i <= periodosReales; i++) {
//             let inicio = (i - 1) * 12 + 1;
//             let fin = i * 12;
//             let cuotasAño = cuadro.filter(c => c.mes >= inicio && c.mes <= fin);
            
//             if (cuotasAño.length > 0) {
//                 años.push({
//                     año: i,
//                     capital: cuotasAño.reduce((acc, val) => acc + val.capital, 0),
//                     interes: cuotasAño.reduce((acc, val) => acc + val.interes, 0),
//                     iva: cuotasAño.reduce((acc, val) => acc + val.iva, 0),
//                     cuotaTotal: cuotasAño.reduce((acc, val) => acc + val.cuotaTotal, 0)
//                 });
//             }
//         }
//         return años;
//     };

//     // --- ESTADO DERIVADO CON RECÁLCULO SEGURO (Usando datosLocales) ---
//     const creditoBase = {
//         monto: '', tasaInteresAnual: '', plazoFinanciacion: Math.min(Number(periodosGlobales) * 12, 60), plazoGracia: 0,
//         ...(datosLocales?.credito || {})
//     };
    
//     const credito = {
//         ...creditoBase,
//         proyeccionMensual: calcularCuadro(creditoBase.monto, creditoBase.tasaInteresAnual, creditoBase.plazoFinanciacion, creditoBase.plazoGracia),
//     };
//     credito.proyeccionAnual = agruparAnual(credito.proyeccionMensual);

//     const deudas = (datosLocales?.deudas || []).map(d => {
//         const mensual = calcularCuadro(d.monto, d.tasaInteresAnual, d.plazoFinanciacion, 0);
//         return { ...d, proyeccionMensual: mensual, proyeccionAnual: agruparAnual(mensual) };
//     });

//     // --- HANDLERS (Ahora actualizan el estado local en vez de disparar onActualizar) ---
//     const handleCreditoChange = (e) => {
//         const { name, value } = e.target;
//         let nuevoValor = value === '' ? '' : Number(value);
//         if (name === 'plazoFinanciacion' && nuevoValor > 60) nuevoValor = 60;

//         const nuevoCredito = { ...creditoBase, [name]: nuevoValor };
//         setDatosLocales({ ...datosLocales, credito: nuevoCredito });
//     };

//     const agregarDeuda = () => {
//         const nuevaDeuda = { 
//             id: Date.now(), entidad: '', monto: '', tasaInteresAnual: '', plazoFinanciacion: Math.min(Number(periodosGlobales) * 12, 60)
//         };
//         setDatosLocales({ ...datosLocales, deudas: [...(datosLocales.deudas || []), nuevaDeuda] });
//     };

//     const handleDeudaChange = (id, campo, valor) => {
//         const nuevasDeudas = (datosLocales.deudas || []).map(deuda => {
//             if (deuda.id === id) {
//                 let v = campo === 'entidad' ? valor : (valor === '' ? '' : Number(valor));
//                 if (campo === 'plazoFinanciacion' && v > 60) v = 60;
//                 return { ...deuda, [campo]: v };
//             }
//             return deuda;
//         });
//         setDatosLocales({ ...datosLocales, deudas: nuevasDeudas });
//     };

//     const eliminarDeuda = (id) => {
//         const nuevasDeudas = (datosLocales.deudas || []).filter(d => d.id !== id);
//         setDatosLocales({ ...datosLocales, deudas: nuevasDeudas });
//     };

//     // --- CÁLCULO DE ACUMULADO GENERAL GLOBAL ---
//     const obtenerAcumuladoGlobal = () => {
//         const todosLosAnuales = [ ...(credito.proyeccionAnual || []), ...deudas.flatMap(d => d.proyeccionAnual || []) ];
//         return todosLosAnuales.reduce((acc, curr) => ({
//             capital: acc.capital + curr.capital,
//             interes: acc.interes + curr.interes,
//             iva: acc.iva + curr.iva,
//             cuotaTotal: acc.cuotaTotal + curr.cuotaTotal
//         }), { capital: 0, interes: 0, iva: 0, cuotaTotal: 0 });
//     };

//     const acumuladoGlobal = obtenerAcumuladoGlobal();

//     // --- RENDERIZADO DE TABLA ANUAL ---
//     const renderTablaAnual = (proyeccionAnual) => {
//         if (!proyeccionAnual || proyeccionAnual.length === 0) return <p style={{ color: '#666', fontStyle: 'italic' }}>Faltan datos para generar el cuadro anual.</p>;
        
//         const totCapital = proyeccionAnual.reduce((acc, val) => acc + val.capital, 0);
//         const totInteres = proyeccionAnual.reduce((acc, val) => acc + val.interes, 0);
//         const totIva = proyeccionAnual.reduce((acc, val) => acc + val.iva, 0);
//         const totServicio = proyeccionAnual.reduce((acc, val) => acc + val.cuotaTotal, 0);

//         return (
//             <div style={{ marginBottom: '20px', border: '1px solid #90caf9', borderRadius: '5px', overflow: 'hidden' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px', backgroundColor: '#fff' }}>
//                     <thead style={{ backgroundColor: '#bbdefb', color: '#0d47a1' }}>
//                         <tr>
//                             <th style={{ padding: '10px', textAlign: 'center' }}>Período (Año)</th>
//                             <th style={{ padding: '10px' }}>Capital Pagado</th>
//                             <th style={{ padding: '10px' }}>Interés Pagado</th>
//                             <th style={{ padding: '10px' }}>IVA Interés (21%)</th>
//                             <th style={{ padding: '10px', fontWeight: 'bold' }}>Servicio de Deuda Total</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {proyeccionAnual.map(fila => (
//                             <tr key={fila.año} style={{ borderBottom: '1px solid #eee' }}>
//                                 <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Año {fila.año}</td>
//                                 <td style={{ padding: '10px', color: '#2e7d32' }}>$ {(fila.capital || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
//                                 <td style={{ padding: '10px', color: '#c62828' }}>$ {(fila.interes || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
//                                 <td style={{ padding: '10px', color: '#e65100' }}>$ {(fila.iva || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
//                                 <td style={{ padding: '10px', fontWeight: 'bold', color: '#1565c0' }}>$ {(fila.cuotaTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                     <tfoot style={{ backgroundColor: '#e3f2fd', fontWeight: 'bold', borderTop: '2px solid #90caf9' }}>
//                         <tr>
//                             <td style={{ padding: '10px', textAlign: 'center' }}>TOTAL OBLIGACIÓN</td>
//                             <td style={{ padding: '10px', color: '#2e7d32' }}>$ {totCapital.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
//                             <td style={{ padding: '10px', color: '#c62828' }}>$ {totInteres.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
//                             <td style={{ padding: '10px', color: '#e65100' }}>$ {totIva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
//                             <td style={{ padding: '10px', color: '#0d47a1', fontSize: '15px' }}>$ {totServicio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
//                         </tr>
//                     </tfoot>
//                 </table>
//             </div>
//         );
//     };

//     return (
//         <div style={{ padding: '20px', maxWidth: '1000px', margin: '20px auto', fontFamily: 'sans-serif', background: '#f5f5f5', borderRadius: '10px', border: '1px solid #ddd' }}>
            
//             <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
//                 <button onClick={() => setVistaActiva(1)} style={{ flex: 1, padding: '10px', backgroundColor: vistaActiva === 1 ? '#8e24aa' : '#e0e0e0', color: vistaActiva === 1 ? '#fff' : '#333', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
//                     📝 1. Carga de Datos de Financiación
//                 </button>
//                 <button onClick={() => setVistaActiva(2)} style={{ flex: 1, padding: '10px', backgroundColor: vistaActiva === 2 ? '#8e24aa' : '#e0e0e0', color: vistaActiva === 2 ? '#fff' : '#333', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
//                     📊 2. Resumen Ejecutivo (Anual y General)
//                 </button>
//             </div>

//             {vistaActiva === 1 && (
//                 <div>
//                     <h2 style={{ borderBottom: '2px solid #8e24aa', paddingBottom: '10px', marginBottom: '20px', color: '#6a1b9a', marginTop: 0 }}>Crédito Solicitado (Nuevo)</h2>
//                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '40px' }}>
                        
//                         <div style={{ display: 'flex', flexDirection: 'column' }}>
//                             <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Monto Solicitado ($):</label>
//                             <input type="number" name="monto" value={credito.monto} onChange={handleCreditoChange} placeholder="Ej: 5000000" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
//                         </div>

//                         <div style={{ display: 'flex', flexDirection: 'column' }}>
//                             <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Tasa Interés Anual (%):</label>
//                             <input type="number" name="tasaInteresAnual" value={credito.tasaInteresAnual} onChange={handleCreditoChange} placeholder="Ej: 45" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
//                         </div>

//                         <div style={{ display: 'flex', flexDirection: 'column' }}>
//                             <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Plazo (Máx 60 cuotas):</label>
//                             <input type="number" name="plazoFinanciacion" max="60" value={credito.plazoFinanciacion} onChange={handleCreditoChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
//                         </div>

//                         <div style={{ display: 'flex', flexDirection: 'column' }}>
//                             <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Gracia (Meses):</label>
//                             <input type="number" name="plazoGracia" value={credito.plazoGracia} onChange={handleCreditoChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
//                         </div>
//                     </div>

//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e65100', paddingBottom: '10px', marginBottom: '20px' }}>
//                         <h2 style={{ margin: 0, color: '#e65100' }}>Deudas Previas (Central BCRA)</h2>
//                         <button onClick={agregarDeuda} style={{ padding: '8px 15px', background: '#ef6c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
//                             + Agregar Deuda
//                         </button>
//                     </div>

//                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff' }}>
//                         <thead>
//                             <tr style={{ backgroundColor: '#fff3e0' }}>
//                                 <th style={{ padding: '10px', border: '1px solid #ccc' }}>Entidad Financiera</th>
//                                 <th style={{ padding: '10px', border: '1px solid #ccc' }}>Monto Adeudado ($)</th>
//                                 <th style={{ padding: '10px', border: '1px solid #ccc' }}>Tasa Anual (%)</th>
//                                 <th style={{ padding: '10px', border: '1px solid #ccc' }}>Plazo Restante (Máx 60)</th>
//                                 <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center' }}>Acción</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {deudas.length === 0 ? (
//                                 <tr><td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>No registra deudas previas.</td></tr>
//                             ) : (
//                                 deudas.map((deuda) => (
//                                     <tr key={deuda.id}>
//                                         <td style={{ padding: '8px', border: '1px solid #ccc' }}>
//                                             <input type="text" value={deuda.entidad} onChange={(e) => handleDeudaChange(deuda.id, 'entidad', e.target.value)} placeholder="Ej: Banco Macro" style={{ width: '90%', padding: '6px' }} />
//                                         </td>
//                                         <td style={{ padding: '8px', border: '1px solid #ccc' }}>
//                                             <input type="number" value={deuda.monto} onChange={(e) => handleDeudaChange(deuda.id, 'monto', e.target.value)} placeholder="$ 0" style={{ width: '90%', padding: '6px' }} />
//                                         </td>
//                                         <td style={{ padding: '8px', border: '1px solid #ccc' }}>
//                                             <input type="number" value={deuda.tasaInteresAnual} onChange={(e) => handleDeudaChange(deuda.id, 'tasaInteresAnual', e.target.value)} placeholder="%" style={{ width: '90%', padding: '6px' }} />
//                                         </td>
//                                         <td style={{ padding: '8px', border: '1px solid #ccc' }}>
//                                             <input type="number" max="60" value={deuda.plazoFinanciacion} onChange={(e) => handleDeudaChange(deuda.id, 'plazoFinanciacion', e.target.value)} style={{ width: '90%', padding: '6px' }} />
//                                         </td>
//                                         <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'center' }}>
//                                             <button onClick={() => eliminarDeuda(deuda.id)} style={{ background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' }}>
//                                                 Eliminar
//                                             </button>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             )}

//             {vistaActiva === 2 && (
//                 <div>
//                     <h3 style={{ color: '#6a1b9a', borderBottom: '2px solid #8e24aa', paddingBottom: '5px' }}>
//                         📊 Impacto Anual: Crédito Solicitado
//                     </h3>
//                     {renderTablaAnual(credito.proyeccionAnual)}
                    
//                     {deudas.length > 0 && <h3 style={{ color: '#e65100', borderBottom: '2px solid #e65100', paddingBottom: '5px', marginTop: '30px' }}>
//                         📊 Impacto Anual: Deudas Previas
//                     </h3>}
                    
//                     {deudas.map((deuda, idx) => (
//                         <div key={deuda.id} style={{ marginBottom: '20px' }}>
//                             <h4 style={{ color: '#555', margin: '10px 0' }}>Entidad: {deuda.entidad || `Deuda Previa ${idx + 1}`}</h4>
//                             {renderTablaAnual(deuda.proyeccionAnual)}
//                         </div>
//                     ))}

//                     <div style={{ marginTop: '40px', background: '#37474f', color: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//                         <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #546e7a', paddingBottom: '10px', color: '#eceff1' }}>
//                             📌 Acumulado General (Crédito + Deudas Previas)
//                         </h3>
//                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', textAlign: 'center' }}>
//                             <div style={{ background: '#455a64', padding: '10px', borderRadius: '5px' }}>
//                                 <small style={{ color: '#b0bec5' }}>Total Capital</small>
//                                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#81c784', marginTop: '5px' }}>
//                                     $ {acumuladoGlobal.capital.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
//                                 </div>
//                             </div>
//                             <div style={{ background: '#455a64', padding: '10px', borderRadius: '5px' }}>
//                                 <small style={{ color: '#b0bec5' }}>Total Intereses</small>
//                                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e57373', marginTop: '5px' }}>
//                                     $ {acumuladoGlobal.interes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
//                                 </div>
//                             </div>
//                             <div style={{ background: '#455a64', padding: '10px', borderRadius: '5px' }}>
//                                 <small style={{ color: '#b0bec5' }}>Total IVA (21%)</small>
//                                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffb74d', marginTop: '5px' }}>
//                                     $ {acumuladoGlobal.iva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
//                                 </div>
//                             </div>
//                             <div style={{ background: '#263238', padding: '10px', borderRadius: '5px', border: '1px solid #80cbc4' }}>
//                                 <small style={{ color: '#80cbc4' }}>Servicio Deuda Total</small>
//                                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4fc3f7', marginTop: '5px' }}>
//                                     $ {acumuladoGlobal.cuotaTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* 2. BOTÓN DE GUARDADO: Envía el estado local al orquestador padre */}
//             <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
//                 <button 
//                     className="btn btn-primary"
//                     onClick={() => onGuardar(numeroPaso, datosLocales)}
//                     style={{ padding: '12px 24px', fontSize: '16px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
//                 >
//                     Guardar Datos de Financiación y Continuar
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default FormularioFinanciacion;
import React, { useState, useMemo, useEffect } from 'react';

// --- CONSTANTES Y FUNCIONES PURAS DE CÁLCULO ---
const TASA_IVA = 0.21; // 21% IVA sobre intereses (Argentina)

/**
 * Calcula la tabla de amortización mes a mes (Sistema Francés con período de gracia)
 */
const calcularCuadro = (monto, tasaAnual, meses, gracia = 0) => {
    const numMonto = parseFloat(monto) || 0;
    const numTasa = parseFloat(tasaAnual) || 0;
    const numMeses = Math.min(Math.max(parseInt(meses, 10) || 0, 0), 120);
    const numGracia = Math.min(Math.max(parseInt(gracia, 10) || 0, 0), Math.max(0, numMeses - 1));

    if (numMonto <= 0 || numMeses <= 0) return [];

    let cuadro = [];
    let saldo = numMonto;
    let tasaMensual = numTasa / 12 / 100;
    let nAmort = numMeses - numGracia; 
    let cuotaPuraAmort = 0;
    
    if (tasaMensual > 0 && nAmort > 0) {
        cuotaPuraAmort = saldo * (tasaMensual * Math.pow(1 + tasaMensual, nAmort)) / (Math.pow(1 + tasaMensual, nAmort) - 1);
    } else if (nAmort > 0) {
        cuotaPuraAmort = saldo / nAmort;
    }

    for (let i = 1; i <= numMeses; i++) {
        let interes = saldo * tasaMensual;
        let capital = 0;
        let cuotaPura = 0;

        if (i <= numGracia) {
            capital = 0;
            cuotaPura = interes;
        } else {
            cuotaPura = cuotaPuraAmort;
            capital = cuotaPura - interes;
        }

        if (i === numMeses) {
            capital = saldo;
            cuotaPura = capital + interes;
        }

        let ivaInteres = interes * TASA_IVA;
        let cuotaTotal = cuotaPura + ivaInteres;

        cuadro.push({
            mes: i, 
            saldoInicial: saldo, 
            capital, 
            interes, 
            iva: ivaInteres,
            cuotaPura, 
            cuotaTotal, 
            saldoFinal: Math.max(0, saldo - capital)
        });

        saldo -= capital;
        if (saldo < 0.01) saldo = 0; 
    }
    return cuadro;
};

/**
 * Agrupa las cuotas mensuales en períodos anuales (1..N)
 */
const agruparAnual = (cuadro, periodosGlobales = 5) => {
    const numAños = Math.max(parseInt(periodosGlobales, 10) || 1, 1);
    let años = [];

    for (let i = 1; i <= numAños; i++) {
        let inicio = (i - 1) * 12 + 1;
        let fin = i * 12;
        let cuotasAño = (cuadro || []).filter(c => c.mes >= inicio && c.mes <= fin);
        
        años.push({
            año: i,
            capital: cuotasAño.reduce((acc, val) => acc + val.capital, 0),
            interes: cuotasAño.reduce((acc, val) => acc + val.interes, 0),
            iva: cuotasAño.reduce((acc, val) => acc + val.iva, 0),
            cuotaTotal: cuotasAño.reduce((acc, val) => acc + val.cuotaTotal, 0)
        });
    }
    return años;
};

/**
 * Helper para extraer datosLocales de forma limpia desde datosIniciales,
 * contemplando si el padre guardó la estructura devuelta por onGuardar/onChange.
 */
const extraerDatosLocales = (datos) => {
    if (!datos) return { credito: {}, deudas: [] };
    if (datos.datosLocales) {
        return {
            credito: datos.datosLocales.credito || {},
            deudas: datos.datosLocales.deudas || []
        };
    }
    return {
        credito: datos.credito || {},
        deudas: datos.deudas || []
    };
};

// --- COMPONENTE PRINCIPAL ---
const FormularioFinanciacion = ({ 
    numeroPaso = 1, 
    datosIniciales, 
    onGuardar, 
    onChange, 
    periodosGlobales = 3 
}) => {
    const [vistaActiva, setVistaActiva] = useState(1); 
    const maxMesesPermitidos = Math.min(Number(periodosGlobales) * 12, 120);

    // 1. ESTADO LOCAL NORMALIZADO
    const [datosLocales, setDatosLocales] = useState(() => extraerDatosLocales(datosIniciales));

    // Sincronización cuando cambia la prop datosIniciales (navegación entre pasos)
    useEffect(() => {
        if (datosIniciales) {
            const nuevosDatos = extraerDatosLocales(datosIniciales);
            setDatosLocales(prev => {
                if (JSON.stringify(prev) === JSON.stringify(nuevosDatos)) {
                    return prev;
                }
                return nuevosDatos;
            });
        }
    }, [datosIniciales]);

    // 2. CÁLCULOS DERIVADOS DE CRÉDITO Y DEUDAS
    const credito = useMemo(() => {
        const base = {
            monto: '', 
            tasaInteresAnual: '', 
            plazoFinanciacion: maxMesesPermitidos, 
            plazoGracia: 0,
            ...(datosLocales?.credito || {})
        };
        const proyeccionMensual = calcularCuadro(base.monto, base.tasaInteresAnual, base.plazoFinanciacion, base.plazoGracia);
        return {
            ...base,
            proyeccionMensual,
            proyeccionAnual: agruparAnual(proyeccionMensual, periodosGlobales)
        };
    }, [datosLocales?.credito, maxMesesPermitidos, periodosGlobales]);

    const deudas = useMemo(() => {
        return (datosLocales?.deudas || []).map(d => {
            const mensual = calcularCuadro(d.monto, d.tasaInteresAnual, d.plazoFinanciacion, 0);
            return { 
                ...d, 
                proyeccionMensual: mensual, 
                proyeccionAnual: agruparAnual(mensual, periodosGlobales) 
            };
        });
    }, [datosLocales?.deudas, periodosGlobales]);

    // 3. MATRIZ CONSOLIDADA INCLUYENDO AÑO 0
    const flujoCajaAnual = useMemo(() => {
        const numAños = Math.max(parseInt(periodosGlobales, 10) || 1, 1);
        const matriz = [];

        // AÑO 0: Ingreso del desembolso inicial del préstamo nuevo
        const ingresoInicial = parseFloat(credito.monto) || 0;
        matriz.push({
            periodo: 0,
            ingresoCredito: ingresoInicial,
            amortizacionCapital: 0,
            intereses: 0,
            ivaIntereses: 0,
            servicioDeudaTotal: 0,
            flujoNetoFinanciero: ingresoInicial
        });

        // AÑOS 1..N: Servicio de Deuda
        for (let i = 1; i <= numAños; i++) {
            const capCredito = credito.proyeccionAnual.find(a => a.año === i)?.capital || 0;
            const intCredito = credito.proyeccionAnual.find(a => a.año === i)?.interes || 0;
            const ivaCredito = credito.proyeccionAnual.find(a => a.año === i)?.iva || 0;

            let capDeudas = 0;
            let intDeudas = 0;
            let ivaDeudas = 0;

            deudas.forEach(d => {
                const fila = d.proyeccionAnual.find(a => a.año === i);
                if (fila) {
                    capDeudas += fila.capital;
                    intDeudas += fila.interes;
                    ivaDeudas += fila.iva;
                }
            });

            const amortizacionCapital = capCredito + capDeudas;
            const intereses = intCredito + intDeudas;
            const ivaIntereses = ivaCredito + ivaDeudas;
            const servicioDeudaTotal = amortizacionCapital + intereses + ivaIntereses;
            const flujoNetoFinanciero = -servicioDeudaTotal;

            matriz.push({
                periodo: i,
                ingresoCredito: 0, // En años operativos no entra nuevo capital
                amortizacionCapital,
                intereses,
                ivaIntereses,
                servicioDeudaTotal,
                flujoNetoFinanciero
            });
        }

        return matriz;
    }, [credito, deudas, periodosGlobales]);

    // 4. TOTALES ACUMULADOS
    const acumuladoGlobal = useMemo(() => {
        return flujoCajaAnual.reduce((acc, curr) => ({
            ingresoCredito: acc.ingresoCredito + curr.ingresoCredito,
            capital: acc.capital + curr.amortizacionCapital,
            interes: acc.interes + curr.intereses,
            iva: acc.iva + curr.ivaIntereses,
            cuotaTotal: acc.cuotaTotal + curr.servicioDeudaTotal,
            flujoNetoFinanciero: acc.flujoNetoFinanciero + curr.flujoNetoFinanciero
        }), { ingresoCredito: 0, capital: 0, interes: 0, iva: 0, cuotaTotal: 0, flujoNetoFinanciero: 0 });
    }, [flujoCajaAnual]);

    // 5. COMUNICACIÓN EN TIEMPO REAL CON EL COMPONENTE PADRE
    useEffect(() => {
        if (typeof onChange === 'function') {
            onChange({
                datosLocales,
                flujoCajaAnual, 
                totalesAcumulados: acumuladoGlobal,
                calculosDetallados: {
                    credito,
                    deudas
                }
            });
        }
    }, [datosLocales, flujoCajaAnual, acumuladoGlobal, credito, deudas]);

    // --- HANDLERS ---
    const handleCreditoChange = (e) => {
        const { name, value } = e.target;
        let valorAjustado = value;
        if (name === 'plazoFinanciacion' && parseFloat(value) > maxMesesPermitidos) {
            valorAjustado = maxMesesPermitidos;
        }
        setDatosLocales(prev => ({ 
            ...prev, 
            credito: { ...prev.credito, [name]: valorAjustado } 
        }));
    };

    const agregarDeuda = () => {
        const nuevaDeuda = { 
            id: Date.now(), 
            entidad: '', 
            monto: '', 
            tasaInteresAnual: '', 
            plazoFinanciacion: maxMesesPermitidos 
        };
        setDatosLocales(prev => ({ 
            ...prev, 
            deudas: [...(prev.deudas || []), nuevaDeuda] 
        }));
    };

    const handleDeudaChange = (id, campo, valor) => {
        let valorAjustado = valor;
        if (campo === 'plazoFinanciacion' && parseFloat(valor) > maxMesesPermitidos) {
            valorAjustado = maxMesesPermitidos;
        }
        setDatosLocales(prev => ({
            ...prev,
            deudas: (prev.deudas || []).map(deuda => {
                if (deuda.id === id) return { ...deuda, [campo]: valorAjustado };
                return deuda;
            })
        }));
    };

    const eliminarDeuda = (id) => {
        setDatosLocales(prev => ({ 
            ...prev, 
            deudas: (prev.deudas || []).filter(d => d.id !== id) 
        }));
    };

    const handleGuardar = () => {
        if (typeof onGuardar === 'function') {
            onGuardar(numeroPaso, {
                datosLocales,
                flujoCajaAnual,
                totalesAcumulados: acumuladoGlobal,
                calculosDetallados: { credito, deudas }
            });
        }
    };

    const renderTablaAnual = (proyeccionAnual) => {
        if (!proyeccionAnual || proyeccionAnual.length === 0) {
            return <p style={{ color: '#666', fontStyle: 'italic' }}>Faltan datos para generar el cuadro anual.</p>;
        }
        
        const totCapital = proyeccionAnual.reduce((acc, val) => acc + val.capital, 0);
        const totInteres = proyeccionAnual.reduce((acc, val) => acc + val.interes, 0);
        const totIva = proyeccionAnual.reduce((acc, val) => acc + val.iva, 0);
        const totServicio = proyeccionAnual.reduce((acc, val) => acc + val.cuotaTotal, 0);

        return (
            <div style={{ marginBottom: '20px', border: '1px solid #90caf9', borderRadius: '5px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px', backgroundColor: '#fff' }}>
                    <thead style={{ backgroundColor: '#bbdefb', color: '#0d47a1' }}>
                        <tr>
                            <th style={{ padding: '10px', textAlign: 'center' }}>Período (Año)</th>
                            <th style={{ padding: '10px' }}>Capital Pagado</th>
                            <th style={{ padding: '10px' }}>Interés Pagado</th>
                            <th style={{ padding: '10px' }}>IVA Interés (21%)</th>
                            <th style={{ padding: '10px', fontWeight: 'bold' }}>Servicio de Deuda Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proyeccionAnual.map(fila => (
                            <tr key={fila.año} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Año {fila.año}</td>
                                <td style={{ padding: '10px', color: '#2e7d32' }}>$ {(fila.capital || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                <td style={{ padding: '10px', color: '#c62828' }}>$ {(fila.interes || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                <td style={{ padding: '10px', color: '#e65100' }}>$ {(fila.iva || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold', color: '#1565c0' }}>$ {(fila.cuotaTotal || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot style={{ backgroundColor: '#e3f2fd', fontWeight: 'bold', borderTop: '2px solid #90caf9' }}>
                        <tr>
                            <td style={{ padding: '10px', textAlign: 'center' }}>TOTAL OBLIGACIÓN</td>
                            <td style={{ padding: '10px', color: '#2e7d32' }}>$ {totCapital.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: '10px', color: '#c62828' }}>$ {totInteres.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: '10px', color: '#e65100' }}>$ {totIva.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: '10px', color: '#0d47a1', fontSize: '15px' }}>$ {totServicio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '20px auto', fontFamily: 'sans-serif', background: '#f5f5f5', borderRadius: '10px', border: '1px solid #ddd' }}>
            
            <div style={{ display: 'flex', marginBottom: '20px', gap: '10px' }}>
                <button onClick={() => setVistaActiva(1)} style={{ flex: 1, padding: '10px', backgroundColor: vistaActiva === 1 ? '#8e24aa' : '#e0e0e0', color: vistaActiva === 1 ? '#fff' : '#333', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    📝 1. Carga de Datos de Financiación
                </button>
                <button onClick={() => setVistaActiva(2)} style={{ flex: 1, padding: '10px', backgroundColor: vistaActiva === 2 ? '#8e24aa' : '#e0e0e0', color: vistaActiva === 2 ? '#fff' : '#333', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    📊 2. Resumen Ejecutivo (Flujo de Caja)
                </button>
            </div>

            {vistaActiva === 1 && (
                <div>
                    <h2 style={{ borderBottom: '2px solid #8e24aa', paddingBottom: '10px', marginBottom: '20px', color: '#6a1b9a', marginTop: 0 }}>Crédito Solicitado (Nuevo)</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Monto Solicitado ($):</label>
                            <input type="number" name="monto" value={credito.monto} onChange={handleCreditoChange} placeholder="Ej: 50000000" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Tasa Interés Anual (%):</label>
                            <input type="number" name="tasaInteresAnual" value={credito.tasaInteresAnual} onChange={handleCreditoChange} placeholder="Ej: 36" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Plazo (Máx {maxMesesPermitidos} m):</label>
                            <input type="number" name="plazoFinanciacion" max={maxMesesPermitidos} value={credito.plazoFinanciacion} onChange={handleCreditoChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Gracia (Meses):</label>
                            <input type="number" name="plazoGracia" value={credito.plazoGracia} onChange={handleCreditoChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e65100', paddingBottom: '10px', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, color: '#e65100' }}>Deudas Previas (Central BCRA)</h2>
                        <button onClick={agregarDeuda} style={{ padding: '8px 15px', background: '#ef6c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                            + Agregar Deuda
                        </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#fff' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#fff3e0' }}>
                                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Entidad Financiera</th>
                                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Monto Adeudado ($)</th>
                                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Tasa Anual (%)</th>
                                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Plazo Restante (Máx {maxMesesPermitidos} m)</th>
                                <th style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center' }}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deudas.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '15px', textAlign: 'center', color: '#666' }}>No registra deudas previas.</td></tr>
                            ) : (
                                deudas.map((deuda) => (
                                    <tr key={deuda.id}>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                                            <input type="text" value={deuda.entidad} onChange={(e) => handleDeudaChange(deuda.id, 'entidad', e.target.value)} placeholder="Ej: Banco Macro" style={{ width: '90%', padding: '6px' }} />
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                                            <input type="number" value={deuda.monto} onChange={(e) => handleDeudaChange(deuda.id, 'monto', e.target.value)} placeholder="$ 0" style={{ width: '90%', padding: '6px' }} />
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                                            <input type="number" value={deuda.tasaInteresAnual} onChange={(e) => handleDeudaChange(deuda.id, 'tasaInteresAnual', e.target.value)} placeholder="%" style={{ width: '90%', padding: '6px' }} />
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                                            <input type="number" max={maxMesesPermitidos} value={deuda.plazoFinanciacion} onChange={(e) => handleDeudaChange(deuda.id, 'plazoFinanciacion', e.target.value)} style={{ width: '90%', padding: '6px' }} />
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc', textAlign: 'center' }}>
                                            <button onClick={() => eliminarDeuda(deuda.id)} style={{ background: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer', fontWeight: 'bold' }}>
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {vistaActiva === 2 && (
                <div>
                    <h3 style={{ color: '#2e7d32', borderBottom: '2px solid #2e7d32', paddingBottom: '5px' }}>
                        💵 Impacto Consolidado en el Flujo de Caja (Crédito + Deudas)
                    </h3>
                    <div style={{ marginBottom: '30px', border: '1px solid #a5d6a7', borderRadius: '5px', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '13px', backgroundColor: '#fff' }}>
                            <thead style={{ backgroundColor: '#c8e6c9', color: '#1b5e20' }}>
                                <tr>
                                    <th style={{ padding: '10px', textAlign: 'center' }}>Período</th>
                                    <th style={{ padding: '10px' }}>(+) Ingreso Préstamo</th>
                                    <th style={{ padding: '10px' }}>(-) Amortiz. Capital</th>
                                    <th style={{ padding: '10px' }}>(-) Intereses</th>
                                    <th style={{ padding: '10px' }}>(-) IVA Intereses</th>
                                    <th style={{ padding: '10px', fontWeight: 'bold' }}>(=) Servicio Deuda</th>
                                    <th style={{ padding: '10px', fontWeight: 'bold', backgroundColor: '#a5d6a7' }}>Flujo Neto Financiero</th>
                                </tr>
                            </thead>
                            <tbody>
                                {flujoCajaAnual.map(fila => (
                                    <tr key={fila.periodo} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>Año {fila.periodo}</td>
                                        <td style={{ padding: '10px', color: '#2e7d32', fontWeight: fila.ingresoCredito > 0 ? 'bold' : 'normal' }}>
                                            $ {fila.ingresoCredito.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{ padding: '10px', color: '#c62828' }}>$ {fila.amortizacionCapital.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '10px', color: '#c62828' }}>$ {fila.intereses.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '10px', color: '#e65100' }}>$ {fila.ivaIntereses.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#b71c1c' }}>$ {fila.servicioDeudaTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: '10px', fontWeight: 'bold', backgroundColor: fila.flujoNetoFinanciero >= 0 ? '#e8f5e9' : '#ffebee', color: fila.flujoNetoFinanciero >= 0 ? '#2e7d32' : '#c62828' }}>
                                            $ {fila.flujoNetoFinanciero.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <h3 style={{ color: '#6a1b9a', borderBottom: '2px solid #8e24aa', paddingBottom: '5px', marginTop: '30px' }}>
                        📊 Cuadro Anual Crédito Solicitado
                    </h3>
                    {renderTablaAnual(credito.proyeccionAnual)}
                </div>
            )}

            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
                <button 
                    onClick={handleGuardar}
                    style={{ padding: '12px 24px', fontSize: '16px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Guardar Datos de Financiación y Continuar
                </button>
            </div>
        </div>
    );
};

export default FormularioFinanciacion;