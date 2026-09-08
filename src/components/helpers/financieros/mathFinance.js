/**
 * Calcula el Valor Actual Neto (VAN)
 * @param {number} tasa - La tasa de descuento expresada en decimal (ej: 0.30 para 30%)
 * @param {Array<number>} flujos - Array con los flujos de fondos netos. El índice 0 es el periodo inicial (inversión, suele ser negativo).
 * @returns {number} - El VAN calculado
 */
export const calcularVAN = (tasa, flujos) => {
    return flujos.reduce((acumulador, flujo, periodo) => {
        return acumulador + flujo / Math.pow(1 + tasa, periodo);
    }, 0);
};

/**
 * Calcula la Tasa Interna de Retorno (TIR)
 * @param {Array<number>} flujos - Array con los flujos de fondos netos. El índice 0 debe ser negativo (inversión).
 * @param {number} estimacionInicial - Valor inicial para comenzar la iteración (por defecto 10%)
 * @returns {number|null} - La TIR expresada en decimal, o null si no logra converger.
 */
export const calcularTIR = (flujos, estimacionInicial = 0.1) => {
    const maxIteraciones = 1000;
    const precision = 1e-7;
    let tir = estimacionInicial;

    for (let i = 0; i < maxIteraciones; i++) {
        let van = 0;
        let derivadaVan = 0;

        for (let t = 0; t < flujos.length; t++) {
            // Calcula el VAN actual
            van += flujos[t] / Math.pow(1 + tir, t);
            
            // Calcula la derivada del VAN (necesaria para el método de Newton-Raphson)
            if (t > 0) {
                derivadaVan -= (t * flujos[t]) / Math.pow(1 + tir, t + 1);
            }
        }

        // Si el VAN es prácticamente cero, encontramos la TIR
        if (Math.abs(van) < precision) {
            return tir;
        }

        // Calculamos el próximo valor de prueba
        let nuevaTir = tir - (van / derivadaVan);
        
        // Si la diferencia entre iteraciones es minúscula, terminamos
        if (Math.abs(nuevaTir - tir) < precision) {
            return nuevaTir;
        }
        
        tir = nuevaTir;
    }
    
    // Si después de 1000 iteraciones no encuentra el valor, devuelve null
    return null; 
};


/**
 * Calcula el cuadro de amortización bajo el Sistema Francés
 * @param {number} monto - Capital solicitado
 * @param {number} tasaAnual - Tasa de interés anual expresada en decimal (ej: 0.15 para 15%)
 * @param {number} plazoMeses - Cantidad total de meses del crédito
 * @param {number} plazoGracia - Meses de gracia (solo paga intereses)
 * @returns {Array} - Array de objetos con el detalle mes a mes
 */
export const calcularSistemaFrances = (monto, tasaAnual, plazoMeses, plazoGracia = 0) => {
    const tasaMensual = tasaAnual / 12;
    const mesesAmortizacion = plazoMeses - plazoGracia;
    
    // Fórmula de cuota constante
    const cuotaFija = monto * (tasaMensual * Math.pow(1 + tasaMensual, mesesAmortizacion)) / 
                      (Math.pow(1 + tasaMensual, mesesAmortizacion) - 1);
                      
    let saldo = monto;
    const cuadro = [];

    for (let mes = 1; mes <= plazoMeses; mes++) {
        let interes = saldo * tasaMensual;
        let amortizacion = 0;
        let cuotaTotal = 0;

        if (mes <= plazoGracia) {
            // En periodo de gracia, asumo que solo se pagan los intereses generados
            cuotaTotal = interes; 
        } else {
            amortizacion = cuotaFija - interes;
            cuotaTotal = cuotaFija;
            saldo -= amortizacion;
        }

        cuadro.push({
            mes,
            cuotaTotal,
            interes,
            amortizacionCapital: amortizacion,
            saldoRestante: Math.max(0, saldo) // Math.max evita saldos negativos por redondeo
        });
    }
    
    return cuadro;
};