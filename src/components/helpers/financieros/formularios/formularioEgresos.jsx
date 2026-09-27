import React, { useState, useEffect } from 'react';

// const generarDatosPorDefecto = (cantidadPeriodos) => [
//     { id: 'def-1', nombre: 'Materia Prima / Insumos', centroCosto: 'Producción', esFijo: true, valores: Array(cantidadPeriodos).fill(0) },
//     { id: 'def-2', nombre: 'Sueldos Administrativos', centroCosto: 'Administración', esFijo: true, valores: Array(cantidadPeriodos).fill(0) },
//     { id: 'def-3', nombre: 'Publicidad y Ventas', centroCosto: 'Comercial', esFijo: true, valores: Array(cantidadPeriodos).fill(0) }
// ];

// CÓDIGO CORREGIDO
const generarDatosPorDefecto = (cantidadPeriodos) => [
    { id: 'def-1', nombre: 'Materia Prima / Insumos', centroCosto: 'Producción', esFijo: false, valores: Array(cantidadPeriodos).fill(0) },
    { id: 'def-2', nombre: 'Sueldos Administrativos', centroCosto: 'Administración', esFijo: false, valores: Array(cantidadPeriodos).fill(0) },
    { id: 'def-3', nombre: 'Publicidad y Ventas', centroCosto: 'Comercial', esFijo: false, valores: Array(cantidadPeriodos).fill(0) }
];

const FormularioEgresos = ({ numeroPaso, onGuardar, datosIniciales, periodosGlobales = 5 }) => {
    
    // Inicializamos con los datos guardados del draft, o generamos por defecto
    const [egresos, setEgresos] = useState(() => {
        if (datosIniciales && datosIniciales.egresos) {
            return datosIniciales.egresos;
        }
        return generarDatosPorDefecto(periodosGlobales);
    });

    // EFECTO CRUCIAL: Sincronización si el usuario vuelve al Paso 1 y cambia los años
    useEffect(() => {
        setEgresos(prev => prev.map(item => {
            const nuevosValores = [...item.valores];
            if (periodosGlobales > nuevosValores.length) {
                // Rellenar con ceros si el usuario aumentó los años en el Paso 1
                const faltantes = periodosGlobales - nuevosValores.length;
                nuevosValores.push(...Array(faltantes).fill(0));
            } else if (periodosGlobales < nuevosValores.length) {
                // Truncar si el usuario achicó los años en el Paso 1
                nuevosValores.length = periodosGlobales;
            }
            return { ...item, valores: nuevosValores };
        }));
    }, [periodosGlobales]);

    // Calculamos los totales dinámicamente
    const totalesCalculados = Array(periodosGlobales).fill(0);
    egresos.forEach(item => {
        item.valores.forEach((valor, i) => {
            if (i < periodosGlobales) {
                totalesCalculados[i] += Number(valor) || 0;
            }
        });
    });

    const handleValorChange = (id, indexPeriodo, valor) => {
        const nuevoValor = Math.max(0, Number(valor) || 0);
        setEgresos((prev) => prev.map(item => {
            if (item.id === id) {
                const nuevosValores = [...item.valores];
                nuevosValores[indexPeriodo] = nuevoValor;
                return { ...item, valores: nuevosValores };
            }
            return item;
        }));
    };

    const handleCampoChange = (id, campo, valor) => {
        setEgresos((prev) => prev.map(item =>
            item.id === id ? { ...item, [campo]: valor } : item
        ));
    };

    const agregarEgreso = () => {
        const nuevo = {
            id: `egr-${Date.now()}`,
            nombre: 'Nuevo Costo / Gasto',
            centroCosto: 'Producción',
            esFijo: false,
            valores: Array(periodosGlobales).fill(0)
        };
        setEgresos((prev) => [...prev, nuevo]);
    };

    const eliminarEgreso = (id) => {
        setEgresos((prev) => prev.filter(item => item.id !== id));
    };

    const handleGuardar = () => {
        onGuardar(numeroPaso, {
            egresos,
            totales: totalesCalculados
        });
    };

    return (
        <div style={{ marginBottom: '30px', padding: '20px', background: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#c62828' }}>Egresos Proyectados</h2>
                    <small style={{ color: '#666' }}>Proyectando para {periodosGlobales} años (definido en Ingresos)</small>
                </div>
                <button 
                    onClick={agregarEgreso} 
                    style={{ padding: '8px 15px', background: '#c62828', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    + Agregar Egreso
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ background: '#ffebee', color: '#b71c1c' }}>
                            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ffcdd2' }}>Concepto</th>
                            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #ffcdd2', width: '160px' }}>Centro de Costo</th>
                            {Array.from({ length: periodosGlobales }).map((_, index) => (
                                <th key={index} style={{ padding: '10px', border: '1px solid #ffcdd2', textAlign: 'center', minWidth: '100px' }}>
                                    Año {index + 1}
                                </th>
                            ))}
                            <th style={{ padding: '10px', border: '1px solid #ffcdd2', textAlign: 'center', width: '50px' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {egresos.map((item) => (
                            <tr key={item.id}>
                                <td style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
                                    {item.esFijo ? (
                                        <span style={{ fontWeight: '500', marginLeft: '5px' }}>{item.nombre}</span>
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
                                {item.valores.map((valor, colIdx) => (
                                    <td key={colIdx} style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={valor === 0 ? '' : valor}
                                            placeholder="0"
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
                                <td key={idx} style={{ padding: '10px', border: '1px solid #ef9a9a', textAlign: 'right', color: '#b71c1c' }}>
                                    $ {tot.toLocaleString('es-AR')}
                                </td>
                            ))}
                            <td style={{ border: '1px solid #ef9a9a' }}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={handleGuardar}
                    style={{ padding: '10px 20px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                >
                    Guardar Paso 2
                </button>
            </div>
        </div>
    );
};

export default FormularioEgresos;