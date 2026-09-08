/**
 * Calcula el Flujo de Fondos Neto proyectado
 * @param {number} periodos - Cantidad de periodos a proyectar (1 a 10)
 * @param {Array} ingresos - Array de objetos con las ventas por periodo
 * @param {Array} egresos - Array de objetos con los costos por periodo
 * @param {number} totalInversiones - Suma total de inversiones en el periodo 0
 * @param {number} totalCapitalTrabajo - Suma del capital de trabajo inicial
 * @param {number} tasaImpuesto - Alícuota del impuesto (ej: 0.35)
 * @returns {Array<number>} - Array con el flujo neto de cada periodo [Periodo 0, Periodo 1, ...]
 */
export const calcularFlujoFondos = (
    periodos, 
    ingresos, 
    egresos, 
    totalInversiones, 
    totalCapitalTrabajo, 
    tasaImpuesto = 0.35
) => {
    const flujos = [];

    // --- PERIODO 0: Salidas de dinero iniciales ---
    // Recordá que definimos que el capital de trabajo se consume al inicio como inversión
    const flujoPeriodoCero = -(totalInversiones + totalCapitalTrabajo);
    flujos.push(flujoPeriodoCero);

    // --- PERIODOS 1 al N: Operatoria del proyecto ---
    for (let t = 1; t <= periodos; t++) {
        // 1. Sumamos todos los ingresos de este periodo
        let ingresosDelPeriodo = ingresos.reduce((total, item) => total + (item.valores[t - 1] || 0), 0);
        
        // 2. Sumamos todos los egresos operativos de este periodo
        let egresosDelPeriodo = egresos.reduce((total, item) => total + (item.valores[t - 1] || 0), 0);
        
        // 3. Resultado antes de impuestos
        let resultadoBruto = ingresosDelPeriodo - egresosDelPeriodo;
        
        // 4. Cálculo de impuesto (solo si hay ganancias)
        let impuesto = 0;
        if (resultadoBruto > 0) {
            impuesto = resultadoBruto * tasaImpuesto;
        }

        // 5. Flujo Neto del periodo
        let flujoNeto = resultadoBruto - impuesto;
        flujos.push(flujoNeto);
    }

    return flujos;
};