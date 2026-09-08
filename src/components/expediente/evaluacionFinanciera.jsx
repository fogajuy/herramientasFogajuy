import React from 'react';
// Asegurate de que las rutas coincidan con tu estructura
import { calcularVAN, calcularTIR, calcularSistemaFrances } from '../helpers/financieros/mathFinance'; 
import { calcularFlujoFondos } from '../helpers/financieros/flujoFondos'; 

const EvaluacionFinanciera = () => {
    // --- 1. Datos simulados para el Flujo de Fondos ---
    const periodosPrueba = 3;
    const ingresosPrueba = [
        { nombre: "Ventas Principales", valores: [10000, 12000, 15000] }
    ];
    const egresosPrueba = [
        { nombre: "Materia Prima", valores: [3000, 4000, 5000] },
        { nombre: "Sueldos", valores: [1000, 1000, 1000] }
    ];
    const inversionInicial = 5000;
    const capitalTrabajo = 1000;
    const tasaImpuesto = 0.35; // 35% de ganancias

    // Ejecutamos el helper
    const flujoNeto = calcularFlujoFondos(
        periodosPrueba, 
        ingresosPrueba, 
        egresosPrueba, 
        inversionInicial, 
        capitalTrabajo, 
        tasaImpuesto
    );

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>Panel de Prueba - Flujo de Fondos Neto</h2>
            
            <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>Parámetros del Proyecto (3 periodos)</h3>
                <ul style={{ lineHeight: '1.6' }}>
                    <li><strong>Inversión + Cap. Trabajo (Periodo 0):</strong> $ {(inversionInicial + capitalTrabajo).toLocaleString('es-AR')}</li>
                    <li><strong>Ingresos proyectados:</strong> $ 10.000 | $ 12.000 | $ 15.000</li>
                    <li><strong>Egresos proyectados:</strong> $ 4.000 | $ 5.000 | $ 6.000</li>
                    <li><strong>Impuesto a las ganancias:</strong> 35% sobre resultado positivo</li>
                </ul>
            </div>

            <div style={{ background: '#fff', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
                <h3>Resultado: Flujo de Fondos Neto</h3>
                <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #333', backgroundColor: '#f5f5f5' }}>
                            <th style={{ padding: '10px' }}>Periodo</th>
                            <th style={{ padding: '10px' }}>Flujo de Caja</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flujoNeto.map((monto, index) => (
                            <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '10px' }}><strong>Año {index}</strong></td>
                                <td style={{ 
                                    padding: '10px', 
                                    color: monto < 0 ? '#d32f2f' : '#388e3c',
                                    fontWeight: 'bold'
                                }}>
                                    $ {monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EvaluacionFinanciera;