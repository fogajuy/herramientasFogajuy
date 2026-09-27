import React, { useState } from 'react';

const generarIngresosPorDefecto = (cantidadPeriodos) => [
    { id: 'ing-1', nombre: 'Venta de Productos / Servicios', valores: Array(cantidadPeriodos).fill(0) },
    { id: 'ing-2', nombre: 'Otros Ingresos Operativos', valores: Array(cantidadPeriodos).fill(0) }
];

const FormularioIngresos = ({ numeroPaso, onGuardar, datosIniciales }) => {
    // Inicializamos con los datos del draft del padre si existen, sino por defecto
    const [periodos, setPeriodos] = useState(datosIniciales?.periodos || 5);
    const [ingresos, setIngresos] = useState(datosIniciales?.ingresos || generarIngresosPorDefecto(5));

    // Cálculo interno de totales
    const totalesCalculados = Array(periodos).fill(0);
    ingresos.forEach(item => {
        item.valores.forEach((valor, i) => {
            if (i < periodos) {
                totalesCalculados[i] += Number(valor) || 0;
            }
        });
    });

    const handlePeriodosChange = (e) => {
        let nuevaCantidad = Number(e.target.value);
        if (nuevaCantidad < 1) nuevaCantidad = 1;
        if (nuevaCantidad > 10) nuevaCantidad = 10;
        
        setPeriodos(nuevaCantidad);

        setIngresos(prev => prev.map(item => {
            const nuevosValores = [...item.valores];
            if (nuevaCantidad > nuevosValores.length) {
                const faltantes = nuevaCantidad - nuevosValores.length;
                nuevosValores.push(...Array(faltantes).fill(0));
            } else if (nuevaCantidad < nuevosValores.length) {
                nuevosValores.length = nuevaCantidad;
            }
            return { ...item, valores: nuevosValores };
        }));
    };

    const handleValorChange = (id, indexPeriodo, valor) => {
        const nuevoValor = Math.max(0, Number(valor) || 0);
        setIngresos((prev) => prev.map(item => {
            if (item.id === id) {
                const nuevosValores = [...item.valores];
                nuevosValores[indexPeriodo] = nuevoValor;
                return { ...item, valores: nuevosValores };
            }
            return item;
        }));
    };

    const handleNombreChange = (id, nombre) => {
        setIngresos((prev) => prev.map(item =>
            item.id === id ? { ...item, nombre } : item
        ));
    };

    const agregarIngreso = () => {
        const nuevo = {
            id: `ing-${Date.now()}`,
            nombre: 'Nuevo Ingreso',
            valores: Array(periodos).fill(0)
        };
        setIngresos((prev) => [...prev, nuevo]);
    };

    const eliminarIngreso = (id) => {
        setIngresos((prev) => prev.filter(item => item.id !== id));
    };

    // Función para enviar los datos al padre
    const handleGuardar = () => {
        onGuardar(numeroPaso, {
            periodos,
            ingresos,
            totales: totalesCalculados // Opcional: enviamos los totales si los necesitas luego en el resumen
        });
    };

    return (
        <div style={{ marginBottom: '30px', padding: '20px', background: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ margin: 0, color: '#2e7d32' }}>Ingresos Proyectados</h2>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label htmlFor="cantPeriodos" style={{ fontWeight: 'bold', color: '#1b5e20' }}>
                            Años a proyectar:
                        </label>
                        <input
                            id="cantPeriodos"
                            type="number"
                            min="1"
                            max="10"
                            value={periodos}
                            onChange={handlePeriodosChange}
                            style={{ width: '60px', padding: '6px', border: '1px solid #ccc', borderRadius: '4px', textAlign: 'center' }}
                        />
                    </div>
                    
                    <button
                        onClick={agregarIngreso}
                        style={{ padding: '8px 15px', background: '#2e7d32', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        + Agregar Ingreso
                    </button>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        <tr style={{ background: '#e8f5e9', color: '#1b5e20' }}>
                            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #c8e6c9', minWidth: '200px' }}>Concepto</th>
                            {Array.from({ length: periodos }).map((_, index) => (
                                <th key={index} style={{ padding: '10px', border: '1px solid #c8e6c9', textAlign: 'center', minWidth: '120px' }}>
                                    Año {index + 1}
                                </th>
                            ))}
                            <th style={{ padding: '10px', border: '1px solid #c8e6c9', textAlign: 'center', width: '60px' }}>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingresos.map((item) => (
                            <tr key={item.id}>
                                <td style={{ padding: '8px', border: '1px solid #e0e0e0' }}>
                                    <input
                                        type="text"
                                        value={item.nombre}
                                        onChange={(e) => handleNombreChange(item.id, e.target.value)}
                                        style={{ width: '95%', padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}
                                    />
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
                                    <button
                                        onClick={() => eliminarIngreso(item.id)}
                                        disabled={ingresos.length === 1}
                                        style={{ padding: '4px 8px', background: ingresos.length === 1 ? '#ccc' : '#e53935', color: 'white', border: 'none', borderRadius: '4px', cursor: ingresos.length === 1 ? 'not-allowed' : 'pointer' }}
                                    >✕</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#c8e6c9', fontWeight: 'bold' }}>
                            <td style={{ padding: '10px', border: '1px solid #a5d6a7' }}>Total Ingresos</td>
                            {totalesCalculados.map((tot, idx) => (
                                <td key={idx} style={{ padding: '10px', border: '1px solid #a5d6a7', textAlign: 'right', color: '#1b5e20' }}>
                                    $ {tot.toLocaleString('es-AR')}
                                </td>
                            ))}
                            <td style={{ border: '1px solid #a5d6a7' }}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                    onClick={handleGuardar}
                    style={{ padding: '10px 20px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
                >
                    Guardar Paso 1
                </button>
            </div>
        </div>
    );
};

export default FormularioIngresos;