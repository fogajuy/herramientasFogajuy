// import React from 'react';

// const FormularioEgresos = ({ periodos, egresos, setEgresos, totales }) => {
//     // Actualiza el valor numérico de un año específico
//     const handleValorChange = (id, indexPeriodo, valor) => {
//         const nuevoValor = Math.max(0, Number(valor) || 0);
//         setEgresos(egresos.map(item => {
//             if (item.id === id) {
//                 const nuevosValores = [...item.valores];
//                 nuevosValores[indexPeriodo] = nuevoValor;
//                 return { ...item, valores: nuevosValores };
//             }
//             return item;
//         }));
//     };

//     // Actualiza el nombre solo si no es una categoría fija
//     const handleNombreChange = (id, nombre) => {
//         setEgresos(egresos.map(item =>
//             item.id === id ? { ...item, nombre } : item
//         ));
//     };

//     // Agrega una nueva categoría personalizada
//     const agregarEgreso = () => {
//         const nuevo = {
//             id: Date.now(),
//             nombre: 'Nuevo Costo / Gasto',
//             esFijo: false,
//             valores: Array(periodos).fill(0)
//         };
//         setEgresos([...egresos, nuevo]);
//     };

//     // Elimina una categoría personalizada (las base no se pueden borrar)
//     const eliminarEgreso = (id) => {
//         setEgresos(egresos.filter(item => item.id !== id));
//     };

//     return (
//         <div style={{ marginBottom: '30px', padding: '20px', background: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
//                 <h2 style={{ margin: 0, color: '#c62828' }}>Egresos Proyectados</h2>
//                 <button
//                     onClick={agregarEgreso}
//                     style={{ padding: '8px 15px', background: '#c62828', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
//                 >
//                     + Agregar Egreso
//                 </button>
//             </div>

//             <div style={{ overflowX: 'auto' }}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                     <thead>
//                         <tr style={{ background: '#ffebee', color: '#b71c1c' }}>
//                             <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ffcdd2' }}>Concepto</th>
//                             {Array.from({ length: periodos }).map((_, index) => (
//                                 <th key={index} style={{ padding: '10px', border: '1px solid #ffcdd2', textAlign: 'center' }}>
//                                     Año {index + 1}
//                                 </th>
//                             ))}
//                             <th style={{ padding: '10px', border: '1px solid #ffcdd2', textAlign: 'center', width: '80px' }}>Acciones</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {egresos.map((item) => (
//                             <tr key={item.id}>
//                                 <td style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
//                                     {item.esFijo ? (
//                                         <span style={{ fontWeight: '500', color: '#333' }}>{item.nombre}</span>
//                                     ) : (
//                                         <input
//                                             type="text"
//                                             value={item.nombre}
//                                             onChange={(e) => handleNombreChange(item.id, e.target.value)}
//                                             style={{ width: '95%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
//                                         />
//                                     )}
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
//                                     {!item.esFijo && (
//                                         <button
//                                             onClick={() => eliminarEgreso(item.id)}
//                                             style={{
//                                                 padding: '4px 8px',
//                                                 background: '#e53935',
//                                                 color: 'white',
//                                                 border: 'none',
//                                                 borderRadius: '4px',
//                                                 cursor: 'pointer'
//                                             }}
//                                         >
//                                             ✕
//                                         </button>
//                                     )}
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                     <tfoot>
//                         <tr style={{ background: '#ffcdd2', fontWeight: 'bold' }}>
//                             <td style={{ padding: '10px', border: '1px solid #ef9a9a' }}>Total Egresos</td>
//                             {totales.map((tot, idx) => (
//                                 <td key={idx} style={{ padding: '10px', border: '1px solid #ef9a9a', textAlign: 'right' }}>
//                                     $ {tot.toLocaleString('es-AR')}
//                                 </td>
//                             ))}
//                             <td style={{ border: '1px solid #ef9a9a' }}></td>
//                         </tr>
//                     </tfoot>
//                 </table>
//             </div>
//         </div>
//     );
// };

// export default FormularioEgresos;

import React, { useState } from 'react';

const generarDatosPorDefecto = (cantidadPeriodos) => [
    { id: 'def-1', nombre: 'Materia Prima / Insumos', centroCosto: 'Producción', esFijo: true, valores: Array(cantidadPeriodos).fill(0) },
    { id: 'def-2', nombre: 'Sueldos Administrativos', centroCosto: 'Administración', esFijo: true, valores: Array(cantidadPeriodos).fill(0) },
    { id: 'def-3', nombre: 'Publicidad y Ventas', centroCosto: 'Comercial', esFijo: true, valores: Array(cantidadPeriodos).fill(0) }
];

const FormularioEgresos = ({ 
    periodos = 5, 
    egresos: egresosProp, 
    setEgresos: setEgresosProp 
}) => {
    const cantidadPeriodos = Number(periodos) || 5;

    // Estado local de respaldo si el padre no pasa props
    const [egresosLocales, setEgresosLocales] = useState(() => 
        egresosProp || generarDatosPorDefecto(cantidadPeriodos)
    );

    // Si el padre pasa props usamos las del padre; si no, usamos el estado local
    const egresos = egresosProp !== undefined ? egresosProp : egresosLocales;
    const setEgresos = setEgresosProp || setEgresosLocales;

    // Calculamos los totales dinámicamente
    const totalesCalculados = Array(cantidadPeriodos).fill(0);
    (egresos || []).forEach(item => {
        (item.valores || []).forEach((valor, i) => {
            totalesCalculados[i] += Number(valor) || 0;
        });
    });

    const handleValorChange = (id, indexPeriodo, valor) => {
        const nuevoValor = Math.max(0, Number(valor) || 0);
        setEgresos((prevEgresos) => (prevEgresos || []).map(item => {
            if (item.id === id) {
                const nuevosValores = [...(item.valores || [])];
                nuevosValores[indexPeriodo] = nuevoValor;
                return { ...item, valores: nuevosValores };
            }
            return item;
        }));
    };

    const handleCampoChange = (id, campo, valor) => {
        setEgresos((prevEgresos) => (prevEgresos || []).map(item =>
            item.id === id ? { ...item, [campo]: valor } : item
        ));
    };

    const agregarEgreso = () => {
        const nuevo = {
            id: Date.now(),
            nombre: 'Nuevo Costo / Gasto',
            centroCosto: 'Producción',
            esFijo: false,
            valores: Array(cantidadPeriodos).fill(0)
        };
        setEgresos((prevEgresos) => [...(prevEgresos || []), nuevo]);
    };

    const eliminarEgreso = (id) => {
        setEgresos((prevEgresos) => (prevEgresos || []).filter(item => item.id !== id));
    };

    return (
        <div style={{ marginBottom: '30px', padding: '20px', background: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, color: '#c62828' }}>Egresos Proyectados</h2>
                <button 
                    onClick={agregarEgreso} 
                    style={{ padding: '8px 15px', background: '#c62828', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Agregar Egreso
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#ffebee', color: '#b71c1c' }}>
                            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ffcdd2' }}>Concepto</th>
                            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ffcdd2', width: '140px' }}>Centro de Costo</th>
                            {Array.from({ length: cantidadPeriodos }).map((_, index) => (
                                <th key={index} style={{ padding: '10px', border: '1px solid #ffcdd2', textAlign: 'center' }}>
                                    Año {index + 1}
                                </th>
                            ))}
                            <th style={{ padding: '10px', border: '1px solid #ffcdd2', textAlign: 'center', width: '50px' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(egresos || []).map((item) => (
                            <tr key={item.id}>
                                <td style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
                                    {item.esFijo ? (
                                        <span style={{ fontWeight: '500' }}>{item.nombre}</span>
                                    ) : (
                                        <input
                                            type="text"
                                            value={item.nombre || ''}
                                            onChange={(e) => handleCampoChange(item.id, 'nombre', e.target.value)}
                                            style={{ width: '95%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                                        />
                                    )}
                                </td>
                                <td style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
                                    <select
                                        value={item.centroCosto || 'Producción'}
                                        onChange={(e) => handleCampoChange(item.id, 'centroCosto', e.target.value)}
                                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
                                    >
                                        <option value="Producción">Producción</option>
                                        <option value="Administración">Administración</option>
                                        <option value="Comercial">Comercial</option>
                                    </select>
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
                                    {!item.esFijo && (
                                        <button 
                                            onClick={() => eliminarEgreso(item.id)} 
                                            style={{ padding: '4px 8px', background: '#e53935', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#ffcdd2', fontWeight: 'bold' }}>
                            <td colSpan="2" style={{ padding: '10px', border: '1px solid #ef9a9a' }}>Total Egresos</td>
                            {totalesCalculados.map((tot, idx) => (
                                <td key={idx} style={{ padding: '10px', border: '1px solid #ef9a9a', textAlign: 'right' }}>
                                    $ {tot.toLocaleString('es-AR')}
                                </td>
                            ))}
                            <td style={{ border: '1px solid #ef9a9a' }}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default FormularioEgresos;