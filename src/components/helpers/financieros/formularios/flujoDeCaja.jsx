// import React, { useState } from 'react';
// import FormularioIngresos from './formularioIngresos';
// import FormularioEgresos from './formularioEgresos';
// import FormularioInversiones from './formularioInversiones'; // Asegurate de que la ruta y mayúsculas coincidan

// const FlujoDeCaja = () => {
//     // Parámetros Generales
//     const [periodos, setPeriodos] = useState(5);
//     const [tasaDescuento, setTasaDescuento] = useState(10); // Tasa por defecto: 10%

//     // Estados Consolidados
//     const [inversiones, setInversiones] = useState([]);
//     const [capitalTrabajo, setCapitalTrabajo] = useState([]);
    
//     const [ingresos, setIngresos] = useState([
//         { id: 'ing-base', nombre: 'Ventas generales', valores: Array(5).fill(0) }
//     ]);

//     const categoriasBaseEgresos = [
//         "Materias primas", "Materiales", "Energía", "Combustible",
//         "Sueldos (Admin)", "Sueldos (Fábrica)", "Sueldos (Comercial)",
//         "Servicios", "Mantenimiento", "Seguros", "Impuestos", "Alquileres"
//     ];

//     const [egresos, setEgresos] = useState(
//         categoriasBaseEgresos.map((cat, index) => ({
//             id: `base-${index}`, nombre: cat, esFijo: true, valores: Array(5).fill(0)
//         }))
//     );

//     // Redimensionar matrices si cambian los años
//     const handlePeriodosChange = (nuevoNumero) => {
//         const num = Math.max(1, Number(nuevoNumero) || 1);
//         setPeriodos(num);

//         const redimensionarValores = (lista) =>
//             lista.map((item) => {
//                 const nuevosValores = [...item.valores];
//                 if (nuevosValores.length < num) {
//                     while (nuevosValores.length < num) nuevosValores.push(0);
//                 } else if (nuevosValores.length > num) {
//                     nuevosValores.length = num;
//                 }
//                 return { ...item, valores: nuevosValores };
//             });

//         setIngresos((prev) => redimensionarValores(prev));
//         setEgresos((prev) => redimensionarValores(prev));
//     };

//     // --- CÁLCULO DEL FLUJO DE FONDOS NETO (AÑO 0 AL AÑO N) ---
//     const flujoNeto = Array(periodos + 1).fill(0);
//     const detalleFlujo = { inversiones: Array(periodos + 1).fill(0), ingresos: Array(periodos + 1).fill(0), egresos: Array(periodos + 1).fill(0) };

//     // 1. Asignar Inversiones y Capital de Trabajo (pueden ocurrir en el año 0 o siguientes)
//     detalleFlujo.inversiones[0] += capitalTrabajo.reduce((acc, cap) => acc + (Number(cap.monto) || 0), 0);
//     inversiones.forEach(inv => {
//         const p = Number(inv.periodoInicio) || 0;
//         if (p >= 0 && p <= periodos) {
//             detalleFlujo.inversiones[p] += (Number(inv.monto) || 0);
//         }
//     });

//     // 2. Asignar Ingresos y Egresos Operativos (Ocurren del Año 1 en adelante)
//     for (let i = 1; i <= periodos; i++) {
//         detalleFlujo.ingresos[i] = ingresos.reduce((sum, item) => sum + (Number(item.valores[i - 1]) || 0), 0);
//         detalleFlujo.egresos[i] = egresos.reduce((sum, item) => sum + (Number(item.valores[i - 1]) || 0), 0);
//     }

//     // 3. Consolidar Flujo Neto: Ingresos - Egresos - Inversiones
//     for (let i = 0; i <= periodos; i++) {
//         flujoNeto[i] = detalleFlujo.ingresos[i] - detalleFlujo.egresos[i] - detalleFlujo.inversiones[i];
//     }

//     // --- INDICADORES FINANCIEROS (VAN y TIR) ---
//     const calcularVAN = (flujos, tasa) => {
//         const r = tasa / 100;
//         return flujos.reduce((van, flujo, t) => van + (flujo / Math.pow(1 + r, t)), 0);
//     };

//     const calcularTIR = (flujos) => {
//         const tienePos = flujos.some(f => f > 0);
//         const tieneNeg = flujos.some(f => f < 0);
//         if (!tienePos || !tieneNeg) return null; // No se puede calcular TIR sin cambios de signo

//         let tasaMin = -0.99; // -99%
//         let tasaMax = 10.0;  // 1000%
//         let tasaEst = 0.1;   // 10%

//         // Búsqueda binaria aproximada
//         for (let i = 0; i < 100; i++) {
//             const van = calcularVAN(flujos, tasaEst * 100);
//             if (Math.abs(van) < 0.1) break;
//             if (van > 0) tasaMin = tasaEst;
//             else tasaMax = tasaEst;
//             tasaEst = (tasaMin + tasaMax) / 2;
//         }
//         return tasaEst * 100;
//     };

//     const van = calcularVAN(flujoNeto, tasaDescuento);
//     const tir = calcularTIR(flujoNeto);

//     return (
//         <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
//             <h1 style={{ textAlign: 'center', color: '#1a237e', marginBottom: '30px' }}>Evaluación de Proyecto: Flujo de Fondos</h1>

//             {/* Panel de Control Global */}
//             <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', padding: '20px', background: '#e3f2fd', borderRadius: '8px', border: '1px solid #90caf9' }}>
//                 <div>
//                     <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#1565c0' }}>Años a proyectar (Horizonte):</label>
//                     <input 
//                         type="number" min="1" max="20" 
//                         value={periodos} 
//                         onChange={(e) => handlePeriodosChange(e.target.value)}
//                         style={{ width: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
//                     />
//                 </div>
//                 <div>
//                     <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: '#1565c0' }}>Tasa de Descuento (Costo de Capital %):</label>
//                     <input 
//                         type="number" step="0.1"
//                         value={tasaDescuento} 
//                         onChange={(e) => setTasaDescuento(Number(e.target.value) || 0)}
//                         style={{ width: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
//                     />
//                 </div>
//             </div>

//             {/* Componentes Hijos (pasándoles su estado correspondiente) */}
//             <FormularioInversiones 
//                 periodos={periodos} 
//                 inversiones={inversiones} setInversiones={setInversiones}
//                 capitalTrabajo={capitalTrabajo} setCapitalTrabajo={setCapitalTrabajo}
//             />
            
//             <FormularioIngresos 
//                 periodos={periodos} 
//                 ingresos={ingresos} setIngresos={setIngresos} 
//             />
            
//             <FormularioEgresos 
//                 periodos={periodos} 
//                 egresos={egresos} setEgresos={setEgresos} 
//             />

//             {/* Tabla Consolidada del Flujo de Fondos */}
//             <div style={{ marginTop: '40px', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
//                 <h2 style={{ margin: '0 0 20px 0', color: '#37474f', borderBottom: '2px solid #cfd8dc', paddingBottom: '10px' }}>
//                     Cuadro Resumen: Flujo de Fondos Neto
//                 </h2>
//                 <div style={{ overflowX: 'auto' }}>
//                     <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
//                         <thead>
//                             <tr style={{ background: '#37474f', color: 'white' }}>
//                                 <th style={{ padding: '12px', textAlign: 'left' }}>Concepto</th>
//                                 {Array.from({ length: periodos + 1 }).map((_, idx) => (
//                                     <th key={idx} style={{ padding: '12px', textAlign: 'center' }}>
//                                         Año {idx}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody>
//                             <tr>
//                                 <td style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>(+) Ingresos Operativos</td>
//                                 {detalleFlujo.ingresos.map((val, idx) => <td key={idx} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{val > 0 ? `$ ${val.toLocaleString('es-AR')}` : '-'}</td>)}
//                             </tr>
//                             <tr>
//                                 <td style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>(-) Egresos Operativos</td>
//                                 {detalleFlujo.egresos.map((val, idx) => <td key={idx} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{val > 0 ? `$ (${val.toLocaleString('es-AR')})` : '-'}</td>)}
//                             </tr>
//                             <tr>
//                                 <td style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>(-) Inversiones Físicas y Capital</td>
//                                 {detalleFlujo.inversiones.map((val, idx) => <td key={idx} style={{ padding: '10px', borderBottom: '1px solid #eee', color: val > 0 ? '#d32f2f' : 'inherit' }}>{val > 0 ? `$ (${val.toLocaleString('es-AR')})` : '-'}</td>)}
//                             </tr>
//                             <tr style={{ background: '#eceff1', fontWeight: 'bold', fontSize: '16px' }}>
//                                 <td style={{ padding: '15px', textAlign: 'left', borderTop: '2px solid #b0bec5' }}>FLUJO NETO DE FONDOS</td>
//                                 {flujoNeto.map((val, idx) => (
//                                     <td key={idx} style={{ padding: '15px', borderTop: '2px solid #b0bec5', color: val < 0 ? '#d32f2f' : '#2e7d32', textAlign: 'center' }}>
//                                         $ {val.toLocaleString('es-AR')}
//                                     </td>
//                                 ))}
//                             </tr>
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Dashboard de Viabilidad (VAN y TIR) */}
//             <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
//                 <div style={{ background: van >= 0 ? '#e8f5e9' : '#ffebee', padding: '25px', borderRadius: '8px', border: `2px solid ${van >= 0 ? '#4caf50' : '#f44336'}`, textAlign: 'center' }}>
//                     <h3 style={{ margin: '0 0 10px 0', color: van >= 0 ? '#2e7d32' : '#c62828' }}>Valor Actual Neto (VAN)</h3>
//                     <div style={{ fontSize: '32px', fontWeight: 'bold', color: van >= 0 ? '#2e7d32' : '#c62828' }}>
//                         $ {van.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
//                     </div>
//                     <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#555' }}>
//                         {van > 0 ? 'El proyecto genera valor por encima de la tasa exigida. (Viable)' : 'El proyecto destruye valor a la tasa exigida. (Rechazar)'}
//                     </p>
//                 </div>
                
//                 <div style={{ background: '#fff8e1', padding: '25px', borderRadius: '8px', border: '2px solid #ffc107', textAlign: 'center' }}>
//                     <h3 style={{ margin: '0 0 10px 0', color: '#f57f17' }}>Tasa Interna de Retorno (TIR)</h3>
//                     <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f57f17' }}>
//                         {tir !== null ? `${tir.toLocaleString('es-AR', { maximumFractionDigits: 2 })} %` : 'N/A'}
//                     </div>
//                     <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#555' }}>
//                         {tir !== null 
//                             ? (tir > tasaDescuento ? `Supera la tasa de descuento del ${tasaDescuento}%.` : `Es inferior a la tasa de descuento exigida.`)
//                             : 'Requiere flujos negativos (inversión) y positivos (retornos) para calcularse.'}
//                     </p>
//                 </div>
//             </div>

//         </div>
//     );
// };

// export default FlujoDeCaja;

import React from 'react';

// Función auxiliar para que los números se vean limpios, sin "$-0"
const formatMoneda = (valor) => {
    const num = Number(valor) || 0;
    if (num === 0) return '$0';
    if (num < 0) return `-$${Math.abs(num).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
    return `$${num.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
};

const FlujoDeCaja = ({ 
    periodos = 5, 
    inversiones = [], 
    capitalTrabajo = [], 
    ingresosAños = [], 
    egresosAños = [],  
    financiacion = {}, 
    tasaImpositiva = 30 
}) => {
    // AGREGAR ESTA LÍNEA DE PRUEBA:
    console.log("RADIOGRAFÍA - Props de Financiación recibidas:", financiacion);
    const tasaImp = Number(tasaImpositiva) || 0;
    const cantPeriodos = Number(periodos) || 5;

    // Extraemos los datos de forma segura
    const creditoNuevo = financiacion?.credito || {};
    const deudasPrevias = Array.isArray(financiacion?.deudas) ? financiacion.deudas : [];
    const montoPrestamoNuevo = Number(creditoNuevo.monto) || 0;

    const años = Array.from({ length: cantPeriodos + 1 }, (_, i) => i);

    const flujoDatos = años.map(año => {
        // --- AÑO 0 (Momento de Inversión y Desembolso del Préstamo) ---
        if (año === 0) {
            const totalInversiones = inversiones.filter(inv => Number(inv.periodoInicio) === 0).reduce((acc, inv) => acc + (Number(inv.monto) || 0), 0);
            const totalCapTrabajo = capitalTrabajo.reduce((acc, cap) => acc + (Number(cap.monto) || 0), 0);
            
            return {
                año,
                ingresos: 0,
                egresos: 0,
                intereses: 0,
                uai: 0,
                impuestos: 0,
                utilidadNeta: 0,
                amortizacionCapital: 0,
                inversiones: -totalInversiones,
                capitalTrabajo: -totalCapTrabajo,
                ingresoPrestamo: montoPrestamoNuevo, 
                flujoNeto: montoPrestamoNuevo - totalInversiones - totalCapTrabajo
            };
        }

        // --- AÑOS 1 a N (Operación y Pago de Deudas) ---
        const ingresosOperativos = Number(ingresosAños[año - 1]) || 0;
        const egresosOperativos = Number(egresosAños[año - 1]) || 0;
        const ebitda = ingresosOperativos - egresosOperativos;

        // 1. Crédito Nuevo (Blindado con validación de Array y Number)
        const proyAnualCredito = Array.isArray(creditoNuevo.proyeccionAnual) ? creditoNuevo.proyeccionAnual : [];
        const proyCredito = proyAnualCredito.find(p => Number(p.año) === año) || { interes: 0, capital: 0 };
        
        // 2. Deudas Previas (Iteración blindada)
        const totalesDeudas = deudasPrevias.reduce((totales, deuda) => {
            const proyAnualDeuda = Array.isArray(deuda.proyeccionAnual) ? deuda.proyeccionAnual : [];
            const proyDeuda = proyAnualDeuda.find(p => Number(p.año) === año) || { interes: 0, capital: 0 };
            return {
                interes: totales.interes + (Number(proyDeuda.interes) || 0),
                capital: totales.capital + (Number(proyDeuda.capital) || 0)
            };
        }, { interes: 0, capital: 0 });

        // 3. Consolidar el Servicio de Deuda
        const totalIntereses = (Number(proyCredito.interes) || 0) + totalesDeudas.interes;
        const totalAmortizacion = (Number(proyCredito.capital) || 0) + totalesDeudas.capital;

        const invDelAño = inversiones.filter(inv => Number(inv.periodoInicio) === año).reduce((acc, inv) => acc + (Number(inv.monto) || 0), 0);

        // --- CÁLCULO EN CASCADA ---
        const uai = ebitda - totalIntereses;
        const impuestos = uai > 0 ? uai * (tasaImp / 100) : 0; 
        const utilidadNeta = uai - impuestos;

        const flujoNeto = utilidadNeta - totalAmortizacion - invDelAño;

        return {
            año,
            ingresos: ingresosOperativos,
            egresos: egresosOperativos,
            intereses: -totalIntereses, // Lo guardamos en negativo para la visual
            uai,
            impuestos: -impuestos,
            utilidadNeta,
            amortizacionCapital: -totalAmortizacion,
            inversiones: -invDelAño,
            capitalTrabajo: 0,
            ingresoPrestamo: 0,
            flujoNeto
        };
    });

    return (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', overflowX: 'auto' }}>
            <h2 style={{ color: '#2e7d32', marginTop: 0 }}>Flujo de Caja Financiero</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                <thead>
                    <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ccc' }}>
                        <th style={{ textAlign: 'left', padding: '10px' }}>Concepto</th>
                        {años.map(a => <th key={a} style={{ padding: '10px' }}>Año {a}</th>)}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={{ textAlign: 'left', padding: '8px', fontWeight: 'bold', color: '#1976d2' }}>(+) Ingresos Operativos</td>
                        {flujoDatos.map(d => <td key={`ing-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.ingresos)}</td>)}
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left', padding: '8px', color: '#c62828' }}>(-) Egresos Operativos</td>
                        {flujoDatos.map(d => <td key={`egr-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.egresos)}</td>)}
                    </tr>
                    
                    <tr style={{ borderTop: '1px dashed #ccc' }}>
                        <td style={{ textAlign: 'left', padding: '8px', color: '#c62828' }}>(-) Intereses (Deudas)</td>
                        {flujoDatos.map(d => <td key={`int-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.intereses)}</td>)}
                    </tr>
                    
                    <tr style={{ background: '#fafafa', fontWeight: 'bold' }}>
                        <td style={{ textAlign: 'left', padding: '8px' }}>= Utilidad Antes de Impuestos</td>
                        {flujoDatos.map(d => <td key={`uai-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.uai)}</td>)}
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left', padding: '8px', color: '#c62828' }}>(-) Impuestos ({tasaImp}%)</td>
                        {flujoDatos.map(d => <td key={`imp-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.impuestos)}</td>)}
                    </tr>
                    <tr style={{ background: '#e8f5e9', fontWeight: 'bold' }}>
                        <td style={{ textAlign: 'left', padding: '8px' }}>= Utilidad Neta</td>
                        {flujoDatos.map(d => <td key={`un-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.utilidadNeta)}</td>)}
                    </tr>

                    <tr>
                        <td style={{ textAlign: 'left', padding: '8px', color: '#c62828' }}>(-) Amortización de Capital</td>
                        {flujoDatos.map(d => <td key={`cap-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.amortizacionCapital)}</td>)}
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left', padding: '8px', color: '#c62828' }}>(-) Inversiones Físicas</td>
                        {flujoDatos.map(d => <td key={`inv-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.inversiones)}</td>)}
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left', padding: '8px', color: '#c62828' }}>(-) Capital de Trabajo</td>
                        {flujoDatos.map(d => <td key={`ct-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.capitalTrabajo)}</td>)}
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left', padding: '8px', color: '#1976d2' }}>(+) Ingreso Préstamo Nuevo</td>
                        {flujoDatos.map(d => <td key={`pre-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.ingresoPrestamo)}</td>)}
                    </tr>
                </tbody>
                <tfoot>
                    <tr style={{ background: '#2e7d32', color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                        <td style={{ textAlign: 'left', padding: '12px' }}>FLUJO DE CAJA FINANCIERO</td>
                        {flujoDatos.map(d => (
                            <td key={`fn-${d.año}`} style={{ padding: '12px' }}>
                                {formatMoneda(d.flujoNeto)}
                            </td>
                        ))}
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default FlujoDeCaja;