// // import React, { useState } from 'react';

// // // Recibe la cantidad de periodos por prop (usamos 5 por defecto para probar)
// // const FormularioIngresos = ({ periodos = 5 }) => {
    
// //     // Estado inicial: un array con un ingreso por defecto. 
// //     // Array(periodos).fill(0) crea dinámicamente [0, 0, 0, 0, 0]
// //     const [ingresos, setIngresos] = useState([
// //         { id: Date.now(), nombre: 'Ventas', valores: Array(Number(periodos)).fill(0) }
// //     ]);

// //     // Función para agregar una nueva fila de ingreso
// //     const agregarFila = () => {
// //         setIngresos([
// //             ...ingresos,
// //             { id: Date.now(), nombre: '', valores: Array(Number(periodos)).fill(0) }
// //         ]);
// //     };

// //     // Actualiza el nombre del ítem
// //     const handleNombreChange = (id, nuevoNombre) => {
// //         setIngresos(ingresos.map(item => 
// //             item.id === id ? { ...item, nombre: nuevoNombre } : item
// //         ));
// //     };

// //     // Actualiza el valor de un periodo específico
// //     const handleValorChange = (id, indicePeriodo, nuevoValor) => {
// //         setIngresos(ingresos.map(item => {
// //             if (item.id === id) {
// //                 const nuevosValores = [...item.valores];
// //                 nuevosValores[indicePeriodo] = Number(nuevoValor) || 0;
// //                 return { ...item, valores: nuevosValores };
// //             }
// //             return item;
// //         }));
// //     };

// //     return (
// //         <div style={{ padding: '20px', maxWidth: '900px', margin: '20px auto', fontFamily: 'sans-serif', background: '#f9f9f9', borderRadius: '10px', border: '1px solid #ddd' }}>
// //             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
// //                 <h2 style={{ margin: 0 }}>Proyección de Ingresos</h2>
// //                 <button 
// //                     onClick={agregarFila}
// //                     style={{ padding: '8px 15px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
// //                 >
// //                     + Agregar Ítem
// //                 </button>
// //             </div>

// //             <div style={{ overflowX: 'auto' }}>
// //                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
// //                     <thead>
// //                         <tr style={{ backgroundColor: '#e3f2fd' }}>
// //                             <th style={{ padding: '10px', border: '1px solid #ccc', width: '250px' }}>Concepto de Ingreso</th>
// //                             {/* Generamos los encabezados de columnas dinámicamente según los periodos */}
// //                             {Array.from({ length: periodos }).map((_, index) => (
// //                                 <th key={index} style={{ padding: '10px', border: '1px solid #ccc', textAlign: 'center' }}>
// //                                     Año {index + 1}
// //                                 </th>
// //                             ))}
// //                         </tr>
// //                     </thead>
// //                     <tbody>
// //                         {ingresos.map((ingreso) => (
// //                             <tr key={ingreso.id}>
// //                                 <td style={{ padding: '8px', border: '1px solid #ccc' }}>
// //                                     <input 
// //                                         type="text" 
// //                                         value={ingreso.nombre} 
// //                                         onChange={(e) => handleNombreChange(ingreso.id, e.target.value)}
// //                                         placeholder="Ej: Venta de productos..."
// //                                         style={{ width: '90%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
// //                                     />
// //                                 </td>
// //                                 {/* Generamos los inputs de valores dinámicamente */}
// //                                 {ingreso.valores.map((valor, index) => (
// //                                     <td key={index} style={{ padding: '8px', border: '1px solid #ccc' }}>
// //                                         <input 
// //                                             type="number" 
// //                                             value={valor === 0 ? '' : valor} 
// //                                             onChange={(e) => handleValorChange(ingreso.id, index, e.target.value)}
// //                                             placeholder="$ 0"
// //                                             style={{ width: '90%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'right' }}
// //                                         />
// //                                     </td>
// //                                 ))}
// //                             </tr>
// //                         ))}
// //                     </tbody>
// //                 </table>
// //             </div>

// //             {/* Cuadro de previsualización para comprobar que los arrays se arman bien */}
// //             <div style={{ marginTop: '30px', padding: '15px', background: '#e8f5e9', borderRadius: '8px' }}>
// //                 <h4>Estructura de datos generada:</h4>
// //                 <pre style={{ margin: 0, fontSize: '14px', overflowX: 'auto' }}>
// //                     {JSON.stringify(ingresos, null, 2)}
// //                 </pre>
// //             </div>
// //         </div>
// //     );
// // };

// // export default FormularioIngresos;

// import React from 'react';

// const FormularioIngresos = ({ periodos, ingresos, setIngresos, totales }) => {
//     // Actualiza el valor numérico de un año específico
//     const handleValorChange = (id, indexPeriodo, valor) => {
//         const nuevoValor = Math.max(0, Number(valor) || 0);
//         setIngresos(ingresos.map(item => {
//             if (item.id === id) {
//                 const nuevosValores = [...item.valores];
//                 nuevosValores[indexPeriodo] = nuevoValor;
//                 return { ...item, valores: nuevosValores };
//             }
//             return item;
//         }));
//     };

//     // Actualiza el nombre del concepto de ingreso
//     const handleNombreChange = (id, nombre) => {
//         setIngresos(ingresos.map(item =>
//             item.id === id ? { ...item, nombre } : item
//         ));
//     };

//     // Agrega una nueva fila de ingreso
//     const agregarIngreso = () => {
//         const nuevo = {
//             id: Date.now(),
//             nombre: 'Nuevo Ingreso',
//             valores: Array(periodos).fill(0)
//         };
//         setIngresos([...ingresos, nuevo]);
//     };

//     // Elimina una fila existente
//     const eliminarIngreso = (id) => {
//         setIngresos(ingresos.filter(item => item.id !== id));
//     };

//     return (
//         <div style={{ marginBottom: '30px', padding: '20px', background: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
//                 <h2 style={{ margin: 0, color: '#2e7d32' }}>Ingresos Proyectados</h2>
//                 <button
//                     onClick={agregarIngreso}
//                     style={{ padding: '8px 15px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
//                 >
//                     + Agregar Ingreso
//                 </button>
//             </div>

//             <div style={{ overflowX: 'auto' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                     <thead>
//                         <tr style={{ background: '#e8f5e9', color: '#1b5e20' }}>
//                             <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #c8e6c9' }}>Concepto</th>
//                             {Array.from({ length: periodos }).map((_, index) => (
//                                 <th key={index} style={{ padding: '10px', border: '1px solid #c8e6c9', textAlign: 'center' }}>
//                                     Año {index + 1}
//                                 </th>
//                             ))}
//                             <th style={{ padding: '10px', border: '1px solid #c8e6c9', textAlign: 'center', width: '80px' }}>Acciones</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {ingresos.map((item) => (
//                             <tr key={item.id}>
//                                 <td style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
//                                     <input
//                                         type="text"
//                                         value={item.nombre}
//                                         onChange={(e) => handleNombreChange(item.id, e.target.value)}
//                                         style={{ width: '95%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
//                                     />
//                                 </td>
//                                 {item.valores.map((valor, colIdx) => (
//                                     <td key={colIdx} style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
//                                         <input
//                                             type="number"
//                                             min="0"
//                                             value={valor || ''}
//                                             onChange={(e) => handleValorChange(item.id, colIdx, e.target.value)}
//                                             style={{ width: '90%', padding: '6px', textAlign: 'right', border: '1px solid #ccc', borderRadius: '4px' }}
//                                         />
//                                     </td>
//                                 ))}
//                                 <td style={{ padding: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
//                                     <button
//                                         onClick={() => eliminarIngreso(item.id)}
//                                         disabled={ingresos.length === 1}
//                                         style={{
//                                             padding: '4px 8px',
//                                             background: ingresos.length === 1 ? '#ccc' : '#e53935',
//                                             color: 'white',
//                                             border: 'none',
//                                             borderRadius: '4px',
//                                             cursor: ingresos.length === 1 ? 'not-allowed' : 'pointer'
//                                         }}
//                                     >
//                                         ✕
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                     <tfoot>
//                         <tr style={{ background: '#c8e6c9', fontWeight: 'bold' }}>
//                             <td style={{ padding: '10px', border: '1px solid #a5d6a7' }}>Total Ingresos</td>
//                             {totales.map((tot, idx) => (
//                                 <td key={idx} style={{ padding: '10px', border: '1px solid #a5d6a7', textAlign: 'right' }}>
//                                     $ {tot.toLocaleString('es-AR')}
//                                 </td>
//                             ))}
//                             <td style={{ border: '1px solid #a5d6a7' }}></td>
//                         </tr>
//                     </tfoot>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default FormularioIngresos;

import React, { useState } from 'react';

// Generador de datos por defecto para el renderizado inicial
const generarIngresosPorDefecto = (cantidadPeriodos) => [
    { id: 'ing-1', nombre: 'Venta de Productos / Servicios', valores: Array(cantidadPeriodos).fill(0) },
    { id: 'ing-2', nombre: 'Otros Ingresos Operativos', valores: Array(cantidadPeriodos).fill(0) }
];

const FormularioIngresos = ({ 
    periodos = 5, 
    ingresos: ingresosProp, 
    setIngresos: setIngresosProp 
}) => {
    const cantidadPeriodos = Number(periodos) || 5;

    // Estado local de respaldo si el padre no suministra props
    const [ingresosLocales, setIngresosLocales] = useState(() => 
        ingresosProp || generarIngresosPorDefecto(cantidadPeriodos)
    );

    // Selección dinámica de origen de datos y dispatchers
    const ingresos = ingresosProp !== undefined ? ingresosProp : ingresosLocales;
    const setIngresos = setIngresosProp || setIngresosLocales;

    // Cálculo interno de totales por período
    const totalesCalculados = Array(cantidadPeriodos).fill(0);
    (ingresos || []).forEach(item => {
        (item.valores || []).forEach((valor, i) => {
            totalesCalculados[i] += Number(valor) || 0;
        });
    });

    const handleValorChange = (id, indexPeriodo, valor) => {
        const nuevoValor = Math.max(0, Number(valor) || 0);
        setIngresos((prev) => (prev || []).map(item => {
            if (item.id === id) {
                const nuevosValores = [...(item.valores || [])];
                nuevosValores[indexPeriodo] = nuevoValor;
                return { ...item, valores: nuevosValores };
            }
            return item;
        }));
    };

    const handleNombreChange = (id, nombre) => {
        setIngresos((prev) => (prev || []).map(item =>
            item.id === id ? { ...item, nombre } : item
        ));
    };

    const agregarIngreso = () => {
        const nuevo = {
            id: Date.now(),
            nombre: 'Nuevo Ingreso',
            valores: Array(cantidadPeriodos).fill(0)
        };
        setIngresos((prev) => [...(prev || []), nuevo]);
    };

    const eliminarIngreso = (id) => {
        setIngresos((prev) => (prev || []).filter(item => item.id !== id));
    };

    return (
        <div style={{ marginBottom: '30px', padding: '20px', background: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#2e7d32' }}>Ingresos Proyectados</h2>
                <button
                    onClick={agregarIngreso}
                    style={{ padding: '8px 15px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Agregar Ingreso
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#e8f5e9', color: '#1b5e20' }}>
                            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #c8e6c9' }}>Concepto</th>
                            {Array.from({ length: cantidadPeriodos }).map((_, index) => (
                                <th key={index} style={{ padding: '10px', border: '1px solid #c8e6c9', textAlign: 'center' }}>
                                    Año {index + 1}
                                </th>
                            ))}
                            <th style={{ padding: '10px', border: '1px solid #c8e6c9', textAlign: 'center', width: '60px' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(ingresos || []).map((item) => (
                            <tr key={item.id}>
                                <td style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
                                    <input
                                        type="text"
                                        value={item.nombre || ''}
                                        onChange={(e) => handleNombreChange(item.id, e.target.value)}
                                        style={{ width: '95%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                                    />
                                </td>
                                {(item.valores || []).map((valor, colIdx) => (
                                    <td key={colIdx} style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={valor || ''}
                                            onChange={(e) => handleValorChange(item.id, colIdx, e.target.value)}
                                            style={{ width: '90%', padding: '6px', textAlign: 'right', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                    </td>
                                ))}
                                <td style={{ padding: '8px', border: '1px solid #e0e0e0', textAlign: 'center' }}>
                                    <button
                                        onClick={() => eliminarIngreso(item.id)}
                                        disabled={ingresos.length === 1}
                                        style={{
                                            padding: '4px 8px',
                                            background: ingresos.length === 1 ? '#ccc' : '#e53935',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: ingresos.length === 1 ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#c8e6c9', fontWeight: 'bold' }}>
                            <td style={{ padding: '10px', border: '1px solid #a5d6a7' }}>Total Ingresos</td>
                            {totalesCalculados.map((tot, idx) => (
                                <td key={idx} style={{ padding: '10px', border: '1px solid #a5d6a7', textAlign: 'right' }}>
                                    $ {tot.toLocaleString('es-AR')}
                                </td>
                            ))}
                            <td style={{ border: '1px solid #a5d6a7' }}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default FormularioIngresos;