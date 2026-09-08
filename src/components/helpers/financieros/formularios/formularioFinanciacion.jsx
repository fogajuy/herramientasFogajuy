import React, { useState } from 'react';

const FormularioFinanciacion = ({ periodos = 5, datos, onActualizar }) => {
    const [vistaActiva, setVistaActiva] = useState(1); 
    const mesesPorDefecto = Number(periodos) * 12;

    // --- FUNCIONES FINANCIERAS (SISTEMA FRANCÉS) ---
    const calcularCuadro = (monto, tasaAnual, meses, gracia = 0) => {
        let cuadro = [];
        let saldo = Number(monto) || 0;
        let tasaMensual = (Number(tasaAnual) || 0) / 12 / 100;
        let numGracia = Number(gracia) || 0;
        let n = (Number(meses) || 0) - numGracia; 

        if (saldo <= 0 || meses <= 0) return [];

        let cuotaFrancesa = 0;
        if (tasaMensual > 0 && n > 0) {
            cuotaFrancesa = saldo * (tasaMensual * Math.pow(1 + tasaMensual, n)) / (Math.pow(1 + tasaMensual, n) - 1);
        } else if (n > 0) {
            cuotaFrancesa = saldo / n;
        }

        let cuotaAcumulada = 0; 

        for (let i = 1; i <= meses; i++) {
            let interes = saldo * tasaMensual;
            let capital = 0;
            let cuota = 0;

            if (i <= numGracia) {
                cuota = interes;
                capital = 0;
            } else {
                cuota = cuotaFrancesa;
                capital = cuota - interes;
            }

            if (i === meses) {
                capital = saldo;
                cuota = capital + interes;
            }

            cuotaAcumulada += cuota;

            cuadro.push({
                mes: i,
                saldoInicial: saldo,
                cuota: cuota,
                interes: interes,
                capital: capital,
                saldoFinal: saldo - capital,
                cuotaAcumulada: cuotaAcumulada 
            });

            saldo -= capital;
            if (saldo < 0.01) saldo = 0; 
        }
        return cuadro;
    };

    const agruparAnual = (cuadro) => {
        let años = [];
        if (!cuadro || cuadro.length === 0) return años;

        const totalMeses = cuadro.length;
        const periodosReales = Math.ceil(totalMeses / 12);

        for (let i = 1; i <= periodosReales; i++) {
            let inicio = (i - 1) * 12 + 1;
            let fin = i * 12;
            let cuotasAño = cuadro.filter(c => c.mes >= inicio && c.mes <= fin);
            
            if (cuotasAño.length > 0) {
                años.push({
                    año: i,
                    cuota: cuotasAño.reduce((acc, val) => acc + val.cuota, 0),
                    interes: cuotasAño.reduce((acc, val) => acc + val.interes, 0),
                    capital: cuotasAño.reduce((acc, val) => acc + val.capital, 0),
                    cuotaAcumulada: cuotasAño[cuotasAño.length - 1].cuotaAcumulada
                });
            }
        }
        return años;
    };

    // --- ESTADO DERIVADO CON RECÁLCULO SEGURO ---
    const creditoBase = {
        monto: '', tasaInteresAnual: '', plazoFinanciacion: mesesPorDefecto, plazoGracia: 0,
        ...(datos?.credito || {})
    };
    const credito = {
        ...creditoBase,
        proyeccionMensual: calcularCuadro(creditoBase.monto, creditoBase.tasaInteresAnual, creditoBase.plazoFinanciacion, creditoBase.plazoGracia),
    };
    credito.proyeccionAnual = agruparAnual(credito.proyeccionMensual);

    const deudas = (datos?.deudas || []).map(d => {
        const mensual = calcularCuadro(d.monto, d.tasaInteresAnual, d.plazoFinanciacion, 0);
        return {
            ...d,
            proyeccionMensual: mensual,
            proyeccionAnual: agruparAnual(mensual)
        };
    });

    // --- HANDLERS ---
    const handleCreditoChange = (e) => {
        const { name, value } = e.target;
        const nuevoValor = value === '' ? '' : Number(value); 

        const nuevoCredito = { ...credito, [name]: nuevoValor };
        nuevoCredito.proyeccionMensual = calcularCuadro(nuevoCredito.monto, nuevoCredito.tasaInteresAnual, nuevoCredito.plazoFinanciacion, nuevoCredito.plazoGracia);
        nuevoCredito.proyeccionAnual = agruparAnual(nuevoCredito.proyeccionMensual);

        onActualizar({ credito: nuevoCredito, deudas });
    };

    const agregarDeuda = () => {
        const nuevaDeuda = { 
            id: Date.now(), entidad: '', monto: '', tasaInteresAnual: '', plazoFinanciacion: mesesPorDefecto, proyeccionMensual: [], proyeccionAnual: [] 
        };
        onActualizar({ credito, deudas: [...deudas, nuevaDeuda] });
    };

    const handleDeudaChange = (id, campo, valor) => {
        const nuevasDeudas = deudas.map(deuda => {
            if (deuda.id === id) {
                const deudaActualizada = { ...deuda, [campo]: campo === 'entidad' ? valor : (valor === '' ? '' : Number(valor)) };
                deudaActualizada.proyeccionMensual = calcularCuadro(deudaActualizada.monto, deudaActualizada.tasaInteresAnual, deudaActualizada.plazoFinanciacion, 0);
                deudaActualizada.proyeccionAnual = agruparAnual(deudaActualizada.proyeccionMensual);
                return deudaActualizada;
            }
            return deuda;
        });
        onActualizar({ credito, deudas: nuevasDeudas });
    };

    const eliminarDeuda = (id) => {
        const nuevasDeudas = deudas.filter(d => d.id !== id);
        onActualizar({ credito, deudas: nuevasDeudas });
    };

    // --- RENDERIZADO DE TABLA ANUAL ---
    const renderTablaAnual = (proyeccionAnual) => {
        if (!proyeccionAnual || proyeccionAnual.length === 0) return <p style={{ color: '#666', fontStyle: 'italic' }}>Faltan datos para generar el cuadro anual.</p>;
        
        return (
            <div style={{ marginBottom: '20px', border: '1px solid #90caf9', borderRadius: '5px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px', backgroundColor: '#fff' }}>
                    <thead style={{ backgroundColor: '#bbdefb', color: '#0d47a1' }}>
                        <tr>
                            <th style={{ padding: '10px', textAlign: 'center' }}>Año</th>
                            <th style={{ padding: '10px' }}>Capital Pagado</th>
                            <th style={{ padding: '10px' }}>Interés Pagado</th>
                            <th style={{ padding: '10px', fontWeight: 'bold' }}>Servicio de Deuda (Cuota Total)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proyeccionAnual.map(fila => (
                            <tr key={fila.año} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold' }}>{fila.año}</td>
                                <td style={{ padding: '10px', color: '#2e7d32' }}>$ {(fila.capital || 0).toFixed(2)}</td>
                                <td style={{ padding: '10px', color: '#c62828' }}>$ {(fila.interes || 0).toFixed(2)}</td>
                                <td style={{ padding: '10px', fontWeight: 'bold', color: '#1565c0' }}>$ {(fila.cuota || 0).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
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
                    📊 2. Resumen Ejecutivo (Anual)
                </button>
            </div>

            {vistaActiva === 1 && (
                <div>
                    <h2 style={{ borderBottom: '2px solid #8e24aa', paddingBottom: '10px', marginBottom: '20px', color: '#6a1b9a', marginTop: 0 }}>Crédito Solicitado (Nuevo)</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px', background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '40px' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Monto Solicitado ($):</label>
                            <input type="number" name="monto" value={credito.monto} onChange={handleCreditoChange} placeholder="Ej: 5000000" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Tasa Interés Anual (%):</label>
                            <input type="number" name="tasaInteresAnual" value={credito.tasaInteresAnual} onChange={handleCreditoChange} placeholder="Ej: 45" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>Plazo (Meses):</label>
                            <input type="number" name="plazoFinanciacion" value={credito.plazoFinanciacion} onChange={handleCreditoChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
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
                                <th style={{ padding: '10px', border: '1px solid #ccc' }}>Plazo Restante (Mes)</th>
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
                                            <input type="number" value={deuda.plazoFinanciacion} onChange={(e) => handleDeudaChange(deuda.id, 'plazoFinanciacion', e.target.value)} style={{ width: '90%', padding: '6px' }} />
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
                    <h3 style={{ color: '#6a1b9a', borderBottom: '2px solid #8e24aa', paddingBottom: '5px' }}>
                        📊 Impacto Anual: Crédito Solicitado
                    </h3>
                    {renderTablaAnual(credito.proyeccionAnual)}
                    
                    {deudas.length > 0 && <h3 style={{ color: '#e65100', borderBottom: '2px solid #e65100', paddingBottom: '5px', marginTop: '30px' }}>
                        📊 Impacto Anual: Deudas Previas
                    </h3>}
                    
                    {deudas.map((deuda, idx) => (
                        <div key={deuda.id} style={{ marginBottom: '20px' }}>
                            <h4 style={{ color: '#555', margin: '10px 0' }}>Entidad: {deuda.entidad || `Deuda Previa ${idx + 1}`}</h4>
                            {renderTablaAnual(deuda.proyeccionAnual)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FormularioFinanciacion;