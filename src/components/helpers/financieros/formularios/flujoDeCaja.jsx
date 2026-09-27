import React, { useMemo, useEffect, useState } from 'react';

// --- FUNCIONES AUXILIARES DE CÁLCULO Y FORMATO ---

const formatMoneda = (valor) => {
    const num = Number(valor) || 0;
    if (Math.abs(num) < 0.01) return '$0';
    if (num < 0) {
        return `-$${Math.abs(num).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
    }
    return `$${num.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
};

const calcularTIR = (flujos) => {
    if (!flujos || flujos.length < 2) return null;
    let tir = 0.1;
    const maxIter = 100;
    const precision = 1e-6;

    for (let i = 0; i < maxIter; i++) {
        let npv = 0;
        let dnpv = 0;
        for (let t = 0; t < flujos.length; t++) {
            npv += flujos[t] / Math.pow(1 + tir, t);
            dnpv -= (t * flujos[t]) / Math.pow(1 + tir, t + 1);
        }
        if (Math.abs(dnpv) < 1e-10) break;
        const newTir = tir - npv / dnpv;
        if (Math.abs(newTir - tir) < precision) return newTir * 100;
        tir = newTir;
    }
    return null;
};

const calcularProyeccionAnualRespaldo = (monto, tasaAnual, plazoMeses, graciaMeses = 0, periodosGlobales = 5, tasaIvaInt = 21) => {
    const numMonto = Number(monto) || 0;
    const numTasa = Number(tasaAnual) || 0;
    const numMeses = Number(plazoMeses) || 0;
    const numGracia = Number(graciaMeses) || 0;

    if (numMonto <= 0 || numMeses <= 0) return [];

    let saldo = numMonto;
    const tasaMensual = numTasa / 12 / 100;
    const nAmort = numMeses - numGracia;
    let cuotaFija = 0;

    if (tasaMensual > 0 && nAmort > 0) {
        cuotaFija = saldo * (tasaMensual * Math.pow(1 + tasaMensual, nAmort)) / (Math.pow(1 + tasaMensual, nAmort) - 1);
    } else if (nAmort > 0) {
        cuotaFija = saldo / nAmort;
    }

    const cuadroMensual = [];
    for (let i = 1; i <= numMeses; i++) {
        const interes = saldo * tasaMensual;
        const ivaInteres = interes * (tasaIvaInt / 100);
        let capital = 0;

        if (i > numGracia) {
            capital = Math.min(saldo, cuotaFija - interes);
        }

        cuadroMensual.push({ mes: i, capital, interes, ivaInteres });
        saldo -= capital;
        if (saldo < 1e-6) saldo = 0;
    }

    const proyeccionAnual = [];
    for (let p = 1; p <= periodosGlobales; p++) {
        const inicio = (p - 1) * 12 + 1;
        const fin = p * 12;
        const cuotasAño = cuadroMensual.filter(c => c.mes >= inicio && c.mes <= fin);

        proyeccionAnual.push({
            año: p,
            capital: cuotasAño.reduce((acc, c) => acc + c.capital, 0),
            interes: cuotasAño.reduce((acc, c) => acc + c.interes, 0),
            ivaInteres: cuotasAño.reduce((acc, c) => acc + c.ivaInteres, 0)
        });
    }
    return proyeccionAnual;
};

const PARAMETROS_EVALUACION = {
    pePorcentaje: { umbral: 70, condicion: 'menor', etiqueta: 'Punto de Equilibrio Acumulado (Promedio)' },
    cargaDeuda: { umbral: 40, condicion: 'menor', etiqueta: 'Carga de la Deuda (Promedio Plurianual)' },
    liquidez: { umbral: 0.36, condicion: 'mayor', etiqueta: 'Liquidez' },
    cuotaIngreso: { umbral: 30, condicion: 'menor', etiqueta: 'Cuota / Ingreso Máxima (Promedio Plurianual)' },
    patrimonioAval: { umbral: 2.58, condicion: 'mayor', etiqueta: 'Patrimonio sobre Aval' },
    solvencia: { umbral: 4, condicion: 'mayor', etiqueta: 'Solvencia (Año 1)' },
    inmovilizacion: { umbral: 90, condicion: 'mayor', etiqueta: 'Índice de Inmovilización' }
};

const FlujoDeCaja = ({ 
    periodos = 5, 
    inversiones = [], 
    capitalTrabajo = [], 
    ingresosAños = [], 
    egresosProduccion = [], 
    egresosOtros = [],  
    financiacion = {}, 
    tasaImpositiva = 30,       // Impuesto a las Ganancias
    tasaIvaIntereses = 21,    // % IVA aplicable sobre Intereses Financieros
    tasaDescuento: tasaDescuentoProp = 15,
    aniosDepreciacion = 10,
    recuperarCapitalTrabajo = true,
    onFlujosListos             // <--- Prop para enviar flujos, indicadores y métricas al Paso 7
}) => {
    const [tasaDescuento, setTasaDescuento] = useState(tasaDescuentoProp);

    useEffect(() => {
        setTasaDescuento(tasaDescuentoProp);
    }, [tasaDescuentoProp]);

    const tasaImp = Number(tasaImpositiva) || 0;
    const tasaIvaInt = Number(tasaIvaIntereses) || 0;
    const cantPeriodos = Number(periodos) || 5;

    // --- NORMALIZACIÓN MULTI-ESTRUCTURA DE FINANCIACIÓN ---
    const { creditoNormalizado, deudasNormalizadas, matrizPrecalculada } = useMemo(() => {
        const datosBase = financiacion?.datosLocales || financiacion;
        const calculos = financiacion?.calculosDetallados || {};
        
        const creditoRaw = calculos?.credito || datosBase?.credito || {};
        const deudasRaw = Array.isArray(calculos?.deudas) 
            ? calculos.deudas 
            : (Array.isArray(datosBase?.deudas) ? datosBase.deudas : []);

        const proyeccionCredito = Array.isArray(creditoRaw.proyeccionAnual) && creditoRaw.proyeccionAnual.length > 0
            ? creditoRaw.proyeccionAnual
            : calcularProyeccionAnualRespaldo(creditoRaw.monto, creditoRaw.tasaInteresAnual, creditoRaw.plazoFinanciacion, creditoRaw.plazoGracia, cantPeriodos, tasaIvaInt);

        const deudasProcesadas = deudasRaw.map(d => ({
            ...d,
            proyeccionAnual: Array.isArray(d.proyeccionAnual) && d.proyeccionAnual.length > 0
                ? d.proyeccionAnual
                : calcularProyeccionAnualRespaldo(d.monto, d.tasaInteresAnual, d.plazoFinanciacion, 0, cantPeriodos, tasaIvaInt)
        }));

        return {
            creditoNormalizado: { ...creditoRaw, proyeccionAnual: proyeccionCredito },
            deudasNormalizadas: deudasProcesadas,
            matrizPrecalculada: Array.isArray(financiacion?.flujoCajaAnual) ? financiacion.flujoCajaAnual : null
        };
    }, [financiacion, cantPeriodos, tasaIvaInt]);

    const montoPrestamoNuevo = Number(creditoNormalizado.monto) || 0;
    const años = useMemo(() => Array.from({ length: cantPeriodos + 1 }, (_, i) => i), [cantPeriodos]);

    const totalInversionesAño0 = useMemo(() => {
        return inversiones
            .filter(inv => Number(inv.periodoInicio) === 0)
            .reduce((acc, inv) => acc + (Number(inv.monto) || 0), 0);
    }, [inversiones]);

    const depreciacionAnual = useMemo(() => {
        return aniosDepreciacion > 0 ? totalInversionesAño0 / aniosDepreciacion : 0;
    }, [totalInversionesAño0, aniosDepreciacion]);

    // --- CÁLCULO DEL FLUJO DE CAJA ---
    const flujoDatos = useMemo(() => {
        const totalCapTrabajoInicial = capitalTrabajo.reduce((acc, cap) => acc + (Number(cap.monto) || 0), 0);

        return años.map(año => {
            // AÑO 0
            if (año === 0) {
                const totalInversiones = totalInversionesAño0;
                const flujoNetoAño0 = montoPrestamoNuevo - totalInversiones - totalCapTrabajoInicial;

                return {
                    año,
                    ingresos: 0,
                    egresosProd: 0,
                    flujoProduccion: 0,
                    egresosOtros: 0,
                    depreciacion: 0,
                    intereses: 0,
                    uai: 0,
                    impuestos: 0,
                    utilidadNeta: 0,
                    ivaIntereses: 0,
                    amortizacionCapital: 0,
                    inversiones: -totalInversiones,
                    capitalTrabajo: -totalCapTrabajoInicial,
                    ingresoPrestamo: montoPrestamoNuevo, 
                    flujoNeto: flujoNetoAño0
                };
            }

            // AÑOS 1 a N
            const ingresosOperativos = Number(ingresosAños[año - 1]) || 0;
            const gastosProd = Number(egresosProduccion[año - 1]) || 0;
            const gastosOtros = Number(egresosOtros[año - 1]) || 0;
            
            const flujoProduccion = ingresosOperativos - gastosProd;
            const ebitda = flujoProduccion - gastosOtros;

            // Servicio de Deuda (Intereses, Capital e IVA Intereses)
            let totalIntereses = 0;
            let totalAmortizacion = 0;
            let totalIvaIntereses = 0;

            if (matrizPrecalculada) {
                const filaMatriz = matrizPrecalculada.find(m => Number(m.periodo || m.año) === año);
                if (filaMatriz) {
                    totalIntereses = Number(filaMatriz.intereses) || 0;
                    totalAmortizacion = Number(filaMatriz.amortizacionCapital) || 0;
                    totalIvaIntereses = Number(filaMatriz.ivaIntereses) || (totalIntereses * (tasaIvaInt / 100));
                }
            } else {
                const proyCredito = creditoNormalizado.proyeccionAnual.find(p => Number(p.año || p.periodo) === año) || { interes: 0, capital: 0, ivaInteres: 0 };
                
                const totalesDeudas = deudasNormalizadas.reduce((tot, deuda) => {
                    const proyDeuda = deuda.proyeccionAnual.find(p => Number(p.año || p.periodo) === año) || { interes: 0, capital: 0, ivaInteres: 0 };
                    const intD = Number(proyDeuda.interes) || 0;
                    const ivaD = Number(proyDeuda.ivaInteres) || (intD * (tasaIvaInt / 100));

                    return {
                        interes: tot.interes + intD,
                        capital: tot.capital + (Number(proyDeuda.capital) || 0),
                        ivaInteres: tot.ivaInteres + ivaD
                    };
                }, { interes: 0, capital: 0, ivaInteres: 0 });

                const intCredito = Number(proyCredito.interes) || 0;
                const ivaCredito = Number(proyCredito.ivaInteres) || (intCredito * (tasaIvaInt / 100));

                totalIntereses = intCredito + totalesDeudas.interes;
                totalAmortizacion = (Number(proyCredito.capital) || 0) + totalesDeudas.capital;
                totalIvaIntereses = ivaCredito + totalesDeudas.ivaInteres;
            }

            const invDelAño = inversiones
                .filter(inv => Number(inv.periodoInicio) === año)
                .reduce((acc, inv) => acc + (Number(inv.monto) || 0), 0);

            const recuperoCapTrabajo = (año === cantPeriodos && recuperarCapitalTrabajo) ? totalCapTrabajoInicial : 0;

            // ESTADO DE RESULTADOS
            const dep = depreciacionAnual;
            const ebit = ebitda - dep;
            const uai = ebit - totalIntereses;
            const montoImpuesto = uai > 0 ? uai * (tasaImp / 100) : 0; 
            const utilidadNeta = uai - montoImpuesto;

            // FLUJO DE CAJA NETO
            const flujoOperativo = utilidadNeta + dep;
            const flujoNeto = flujoOperativo - totalAmortizacion - totalIvaIntereses - invDelAño + recuperoCapTrabajo;

            return {
                año,
                ingresos: ingresosOperativos,
                egresosProd: -gastosProd,
                flujoProduccion,
                egresosOtros: -gastosOtros,
                depreciacion: -dep,
                intereses: -totalIntereses, 
                uai,
                impuestos: -montoImpuesto,
                utilidadNeta,
                ivaIntereses: -totalIvaIntereses,
                amortizacionCapital: -totalAmortizacion,
                inversiones: -invDelAño,
                capitalTrabajo: recuperoCapTrabajo,
                ingresoPrestamo: 0,
                flujoNeto
            };
        });
    }, [años, inversiones, capitalTrabajo, ingresosAños, egresosProduccion, egresosOtros, creditoNormalizado, deudasNormalizadas, matrizPrecalculada, montoPrestamoNuevo, tasaImp, totalInversionesAño0, depreciacionAnual, cantPeriodos, recuperarCapitalTrabajo, tasaIvaInt]);

    const { van, tir } = useMemo(() => {
        const k = (Number(tasaDescuento) || 0) / 100;
        const calculoVan = flujoDatos.reduce((acc, d) => acc + (d.flujoNeto / Math.pow(1 + k, d.año)), 0);
        const flujosArr = flujoDatos.map(d => d.flujoNeto);
        const calculoTir = calcularTIR(flujosArr);

        return { van: calculoVan, tir: calculoTir };
    }, [flujoDatos, tasaDescuento]);

    // --- CÁLCULO EN TIEMPO REAL DE INDICADORES DE EVALUACIÓN ---
    const indicadoresEvaluacionCalculados = useMemo(() => {
        const primerEgresoProd = Math.abs(Number(egresosProduccion[0]) || 0);

        // --- CÁLCULO DE CARGA DE LA DEUDA POR PERIODO Y PROMEDIO PLURIANUAL ---
        console.log('=== COMPROBACIÓN CARGA DE LA DEUDA POR PERIODO (PROMEDIO PLURIANUAL) ===');
        let sumaPorcentajesCargaDeuda = 0;
        let periodosDeudaContados = 0;

        for (let a = 1; a <= cantPeriodos; a++) {
            const ingresoAnual = Number(ingresosAños[a - 1]) || 0;
            const filaPeriodo = flujoDatos.find(d => d.año === a) || {};
            
            const amortizacionVal = Math.abs(Number(filaPeriodo.amortizacionCapital) || 0);
            const interesesVal = Math.abs(Number(filaPeriodo.intereses) || 0);
            const ivaInteresesVal = Math.abs(Number(filaPeriodo.ivaIntereses) || 0);
            
            const servicioDeudaPeriodo = amortizacionVal + interesesVal + ivaInteresesVal;
            const cargaDeudaPer = ingresoAnual > 0 ? (servicioDeudaPeriodo / ingresoAnual) * 100 : 0;

            sumaPorcentajesCargaDeuda += cargaDeudaPer;
            periodosDeudaContados++;

            console.log(`--- Año ${a} ---`);
            console.log('  - Ingresos Operativos:', ingresoAnual);
            console.log('  - Servicio de Deuda Total (Capital + Intereses + IVA Intereses):', servicioDeudaPeriodo);
            console.log(`  => Carga de Deuda Año ${a}:`, cargaDeudaPer.toFixed(2) + '%');
        }

        const cargaDeudaPromedioVal = periodosDeudaContados > 0 ? sumaPorcentajesCargaDeuda / periodosDeudaContados : 0;
        console.log('================================================================');
        console.log('=> PROMEDIO CARGA DE LA DEUDA (TODOS LOS PERIODOS):', cargaDeudaPromedioVal.toFixed(2) + '%');
        console.log('================================================================');

        // --- CÁLCULO DEL PUNTO DE EQUILIBRIO POR PERIODO Y PROMEDIO ---
        console.log('=== COMPROBACIÓN PUNTO DE EQUILIBRIO POR PERIODO ===');
        let sumaPorcentajesPE = 0;
        let periodosOperativosContados = 0;

        for (let a = 1; a <= cantPeriodos; a++) {
            const ingresoAnual = Number(ingresosAños[a - 1]) || 0;
            const egresoProdAnual = Math.abs(Number(egresosProduccion[a - 1]) || 0);
            const egresoOtrosAnual = Math.abs(Number(egresosOtros[a - 1]) || 0);
            
            const filaPeriodo = flujoDatos.find(d => d.año === a) || {};
            const depVal = Math.abs(Number(filaPeriodo.depreciacion) || depreciacionAnual);
            const intVal = Math.abs(Number(filaPeriodo.intereses) || 0);
            const ivaIntVal = Math.abs(Number(filaPeriodo.ivaIntereses) || 0);
            const amortCapVal = Math.abs(Number(filaPeriodo.amortizacionCapital) || 0);

            const costosFijosPer = egresoOtrosAnual + depVal + intVal + ivaIntVal + amortCapVal;
            const margenContribucionPer = ingresoAnual > 0 ? (ingresoAnual - egresoProdAnual) / ingresoAnual : 0;
            
            const pePer = (margenContribucionPer > 0 && ingresoAnual > 0) 
                ? (costosFijosPer / (ingresoAnual * margenContribucionPer)) * 100 
                : 0;

            sumaPorcentajesPE += pePer;
            periodosOperativosContados++;

            console.log(`--- Año ${a} ---`);
            console.log('  - Ingresos Operativos:', ingresoAnual);
            console.log('  - Costos Variables (Egresos Prod):', egresoProdAnual);
            console.log('  - Margen de Contribución (%):', (margenContribucionPer * 100).toFixed(2) + '%');
            console.log('  - Costos Fijos (Otros + Depr + Int + IVA Int + Amort):', costosFijosPer);
            console.log(`  => Punto de Equilibrio Año ${a}:`, pePer.toFixed(2) + '%');
        }

        const pePromedioVal = periodosOperativosContados > 0 ? sumaPorcentajesPE / periodosOperativosContados : 0;
        console.log('================================================');
        console.log('=> PROMEDIO PUNTO DE EQUILIBRIO (TODOS LOS PERIODOS):', pePromedioVal.toFixed(2) + '%');
        console.log('================================================');

        // --- CÁLCULO DE RATIO DEUDA / ACTIVO TOTAL INICIAL (SALDO DE CAPITAL DE LA DEUDA) ---
        console.log('=== COMPROBACIÓN RATIO DEUDA / ACTIVO TOTAL (SALDO DE CAPITAL / ACTIVO INICIAL) ===');
        let sumaRatiosLiquidez = 0;
        let periodosLiquidezContados = 0;

        // Activo Total Inicial (Inversiones Año 0)
        const activoTotalInicial = totalInversionesAño0 > 0 ? totalInversionesAño0 : 1;

        // Si el crédito principal o las deudas extra no guardan un array directo de proyección, 
        // estimamos el saldo de capital remanente restando la amortización acumulada hasta el periodo 'a'.
        let capitalInicialPrestamoPrincipal = Number(montoPrestamoNuevo) || 0;

        for (let a = 1; a <= cantPeriodos; a++) {
            // 1. Buscamos saldo en proyecciones estructuradas si existen
            let saldoDeudaCredito = 0;
            if (creditoNormalizado) {
                if (Array.isArray(creditoNormalizado.proyeccionAnual)) {
                    const pCredito = creditoNormalizado.proyeccionAnual.find(p => Number(p.año || p.periodo) === a);
                    saldoDeudaCredito = pCredito ? Number(pCredito.saldoFinal || pCredito.saldoDeuda || pCredito.capitalVivo || 0) : 0;
                }
            }

            // Fallback analítico si no viene mapeado en proyeccionAnual del crédito principal: 
            // Sumamos amortizaciones de los periodos 1 hasta 'a' y las restamos al capital inicial
            if (saldoDeudaCredito === 0 && capitalInicialPrestamoPrincipal > 0) {
                let amortizadoAcumulado = 0;
                for (let k = 1; k <= a; k++) {
                    const filaK = flujoDatos.find(d => d.año === k) || {};
                    amortizadoAcumulado += Math.abs(Number(filaK.amortizacionCapital) || 0);
                }
                saldoDeudaCredito = Math.max(capitalInicialPrestamoPrincipal - amortizadoAcumulado, 0);
            }

            // 2. Sumamos deudas adicionales o externas si las hubiera
            let saldoDeudaDeudasExtra = 0;
            if (Array.isArray(deudasNormalizadas)) {
                saldoDeudaDeudasExtra = deudasNormalizadas.reduce((acc, deuda) => {
                    let saldoD = 0;
                    if (Array.isArray(deuda.proyeccionAnual)) {
                        const pD = deuda.proyeccionAnual.find(p => Number(p.año || p.periodo) === a);
                        saldoD = pD ? Number(pD.saldoFinal || pD.saldoDeuda || pD.capitalVivo || 0) : 0;
                    }
                    if (saldoD === 0 && Number(deuda.monto || deuda.capital) > 0) {
                        const capD = Number(deuda.monto || deuda.capital);
                        // Estimación por tramos si aplica
                        saldoD = Math.max(capD - (capD / cantPeriodos) * a, 0);
                    }
                    return acc + saldoD;
                }, 0);
            }

            const saldoTotalCapitalDeudaPeriodo = saldoDeudaCredito + saldoDeudaDeudasExtra;
            const ratioPeriodo = activoTotalInicial > 0 ? saldoTotalCapitalDeudaPeriodo / activoTotalInicial : 0;

            sumaRatiosLiquidez += ratioPeriodo;
            periodosLiquidezContados++;

            console.log(`--- Año ${a} ---`);
            console.log('  - Activo Total Inicial (Inversiones base):', activoTotalInicial);
            console.log('  - Saldo de Capital de la Deuda (Periodo):', saldoTotalCapitalDeudaPeriodo);
            console.log(`  => Ratio Saldo Deuda / Activo Inicial Año ${a}:`, ratioPeriodo.toFixed(4));
        }

        const liquidezVal = periodosLiquidezContados > 0 ? sumaRatiosLiquidez / periodosLiquidezContados : 0;
        console.log('========================================================================');
        console.log('=> PROMEDIO RATIO SALDO DE CAPITAL / ACTIVO INICIAL:', liquidezVal.toFixed(4));
        console.log('========================================================================');

        // Cuota / Ingreso Máxima (alineada al promedio plurianual de carga de deuda)
        const cuotaIngresoVal = cargaDeudaPromedioVal > 0 ? cargaDeudaPromedioVal : 0;

        // Patrimonio sobre Aval y Solvencia (Derivados de capital e inversiones iniciales)
        const totalInversiones = totalInversionesAño0 > 0 ? totalInversionesAño0 : 1;
         // Monto de la deuda solicitada incrementada en un 130% (factor 2.30; si se refiere al 130% directo del valor, use 1.30)
        const deudaIncrementadaAval = montoPrestamoNuevo * 1.30;
        const patrimonioAvalVal = deudaIncrementadaAval > 0 ? totalInversiones / deudaIncrementadaAval : 0.00;
        const divisorSolvencia = cantPeriodos > 0 ? montoPrestamoNuevo / cantPeriodos : 0;
        const solvenciaVal = divisorSolvencia > 0 ? totalInversiones / divisorSolvencia : 0.00;


        // --- ÍNDICE DE INMOVILIZACIÓN (Activos Fijos / Inversiones Totales con Capital de Trabajo) ---
        const totalCapTrabajoInicial = capitalTrabajo.reduce((acc, cap) => acc + (Number(cap.monto) || 0), 0);
        const inversionTotalConCapTrabajo = totalInversionesAño0 + totalCapTrabajoInicial;
        
        // Si el índice busca la proporción de activos fijos (inversiones sin cap. trabajo) sobre el total de inversiones:
        const inmovilizacionVal = inversionTotalConCapTrabajo > 0 
            ? (totalInversionesAño0 / inversionTotalConCapTrabajo) * 100 
            : 100.00;

        return {
            pePorcentaje: Math.min(Math.max(pePromedioVal, 0), 100),
            cargaDeuda: Math.min(Math.max(cargaDeudaPromedioVal, 0), 100),
            liquidez: Number(liquidezVal.toFixed(2)),
            cuotaIngreso: Math.min(Math.max(cuotaIngresoVal, 0), 100),
            patrimonioAval: Number(patrimonioAvalVal.toFixed(2)),
            solvencia: Number(solvenciaVal.toFixed(2)),
            inmovilizacion: Number(inmovilizacionVal.toFixed(2))
        };
    }, [flujoDatos, ingresosAños, egresosProduccion, egresosOtros, depreciacionAnual, capitalTrabajo, totalInversionesAño0, montoPrestamoNuevo, cantPeriodos, creditoNormalizado, deudasNormalizadas]);


    // --- EFECTO PARA ENVIAR DATOS AL PASO 7 (CON DATOS AUXILIARES E INDICADORES) ---
    useEffect(() => {
        if (typeof onFlujosListos === 'function') {
            const flujosNetosPorPeriodo = flujoDatos.map(d => ({
                periodo: d.año,
                flujoNeto: d.flujoNeto,
                ingresos: d.ingresos,
                egresosTotales: Math.abs(d.egresosProd) + Math.abs(d.egresosOtros)
            }));

            onFlujosListos({
                flujosNetos: flujosNetosPorPeriodo,
                indicadores: {
                    van,
                    tir,
                    tasaDescuento,
                    evaluacion: indicadoresEvaluacionCalculados
                },
                datosAuxiliares: {
                    vanCalculado: van,
                    tirCalculada: tir,
                    tasaDescuentoAplicada: tasaDescuento,
                    flujoNetoAccionista: flujoDatos.map(d => d.flujoNeto),
                    indicadoresEvaluacion: indicadoresEvaluacionCalculados
                }
            });
        }
    }, [flujoDatos, van, tir, tasaDescuento, indicadoresEvaluacionCalculados, onFlujosListos]);

    const stickyHeaderStyle = {
        position: 'sticky',
        left: 0,
        backgroundColor: '#f5f5f5',
        zIndex: 2,
        textAlign: 'left',
        padding: '10px',
        boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)'
    };

    const stickyCellStyle = (bgColor = 'white') => ({
        position: 'sticky',
        left: 0,
        backgroundColor: bgColor,
        zIndex: 1,
        textAlign: 'left',
        padding: '8px',
        boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)'
    });

    const evaluarCondicion = (key, valor) => {
        const param = PARAMETROS_EVALUACION[key];
        if (!param) return true;
        return param.condicion === 'menor' ? valor < param.umbral : valor > param.umbral;
    };

    return (
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ color: '#2e7d32', margin: 0 }}>Flujo de Caja Financiero e Indicadores</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    <label htmlFor="tasaDescuentoInput" style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                        Tasa de Descuento (%):
                    </label>
                    <input 
                        id="tasaDescuentoInput"
                        type="number" 
                        value={tasaDescuento} 
                        onChange={(e) => setTasaDescuento(e.target.value === '' ? '' : Number(e.target.value))}
                        style={{ width: '70px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}
                    />
                </div>
            </div>
            
            <div style={{ overflowX: 'auto', marginBottom: '30px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ccc' }}>
                            <th style={stickyHeaderStyle}>Concepto</th>
                            {años.map(a => <th key={a} style={{ padding: '10px', minWidth: '110px' }}>Año {a}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {/* BLOQUE 1: OPERACIÓN */}
                        <tr>
                            <td style={{ ...stickyCellStyle(), fontWeight: 'bold', color: '#1976d2' }}>(+) Ingresos Operativos</td>
                            {flujoDatos.map(d => <td key={`ing-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.ingresos)}</td>)}
                        </tr>
                        <tr>
                            <td style={{ ...stickyCellStyle(), color: '#c62828' }}>(-) Egresos de Producción</td>
                            {flujoDatos.map(d => <td key={`eprod-${d.año}`} style={{ padding: '8px', color: d.egresosProd < 0 ? '#c62828' : 'inherit' }}>{formatMoneda(d.egresosProd)}</td>)}
                        </tr>
                        <tr style={{ background: '#e3f2fd', fontWeight: 'bold', borderTop: '1px solid #90caf9', borderBottom: '1px solid #90caf9' }}>
                            <td style={{ ...stickyCellStyle('#e3f2fd'), color: '#1565c0' }}>= Flujo Neto de Producción</td>
                            {flujoDatos.map(d => <td key={`fprod-${d.año}`} style={{ padding: '8px', color: '#1565c0' }}>{formatMoneda(d.flujoProduccion)}</td>)}
                        </tr>
                        
                        {/* BLOQUE 2: OTROS EGRESOS Y DEPRECIACIÓN */}
                        <tr>
                            <td style={{ ...stickyCellStyle(), color: '#c62828' }}>(-) Otros Egresos Operativos</td>
                            {flujoDatos.map(d => <td key={`eotr-${d.año}`} style={{ padding: '8px', color: d.egresosOtros < 0 ? '#c62828' : 'inherit' }}>{formatMoneda(d.egresosOtros)}</td>)}
                        </tr>
                        <tr>
                            <td style={{ ...stickyCellStyle(), color: '#757575', fontSize: '13px' }}>(-) Depreciación (Escudo Fiscal)</td>
                            {flujoDatos.map(d => <td key={`dep-${d.año}`} style={{ padding: '8px', color: '#757575' }}>{formatMoneda(d.depreciacion)}</td>)}
                        </tr>
                        
                        {/* BLOQUE 3: ESTADO DE RESULTADOS (SIN IVA) */}
                        <tr style={{ borderTop: '1px dashed #ccc' }}>
                            <td style={{ ...stickyCellStyle(), color: '#c62828' }}>(-) Intereses Deudas (Deductible Ganancias)</td>
                            {flujoDatos.map(d => <td key={`int-${d.año}`} style={{ padding: '8px', fontWeight: d.intereses !== 0 ? 'bold' : 'normal', color: d.intereses < 0 ? '#c62828' : 'inherit' }}>{formatMoneda(d.intereses)}</td>)}
                        </tr>
                        <tr style={{ background: '#fafafa', fontWeight: 'bold' }}>
                            <td style={stickyCellStyle('#fafafa')}>= Utilidad Antes de Impuestos (UAI)</td>
                            {flujoDatos.map(d => <td key={`uai-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.uai)}</td>)}
                        </tr>
                        <tr>
                            <td style={{ ...stickyCellStyle(), color: '#c62828' }}>(-) Impuesto a las Ganancias ({tasaImp}%)</td>
                            {flujoDatos.map(d => <td key={`imp-${d.año}`} style={{ padding: '8px', color: d.impuestos < 0 ? '#c62828' : 'inherit' }}>{formatMoneda(d.impuestos)}</td>)}
                        </tr>
                        <tr style={{ background: '#f1f8e9', fontWeight: 'bold' }}>
                            <td style={stickyCellStyle('#f1f8e9')}>= Utilidad Neta</td>
                            {flujoDatos.map(d => <td key={`un-${d.año}`} style={{ padding: '8px' }}>{formatMoneda(d.utilidadNeta)}</td>)}
                        </tr>

                        {/* BLOQUE 4: AJUSTES DE CAJA Y SERVICIO DE DEUDA REAL */}
                        <tr>
                            <td style={{ ...stickyCellStyle(), color: '#2e7d32' }}>(+) Ajuste Depreciación (No desembolsable)</td>
                            {flujoDatos.map(d => <td key={`adjdep-${d.año}`} style={{ padding: '8px', color: '#2e7d32' }}>{formatMoneda(-d.depreciacion)}</td>)}
                        </tr>
                        <tr>
                            <td style={{ ...stickyCellStyle(), color: '#c62828' }}>(-) Amortización de Capital</td>
                            {flujoDatos.map(d => <td key={`cap-${d.año}`} style={{ padding: '8px', fontWeight: d.amortizacionCapital !== 0 ? 'bold' : 'normal', color: d.amortizacionCapital < 0 ? '#c62828' : 'inherit' }}>{formatMoneda(d.amortizacionCapital)}</td>)}
                        </tr>
                        <tr>
                            <td style={{ ...stickyCellStyle(), color: '#d32f2f' }}>(-) IVA sobre Intereses ({tasaIvaInt}%)</td>
                            {flujoDatos.map(d => <td key={`ivaint-${d.año}`} style={{ padding: '8px', color: d.ivaIntereses < 0 ? '#d32f2f' : 'inherit' }}>{formatMoneda(d.ivaIntereses)}</td>)}
                        </tr>
                        <tr>
                            <td style={{ ...stickyCellStyle(), color: '#c62828' }}>(-) Inversiones Físicas</td>
                            {flujoDatos.map(d => <td key={`inv-${d.año}`} style={{ padding: '8px', color: d.inversiones < 0 ? '#c62828' : 'inherit' }}>{formatMoneda(d.inversiones)}</td>)}
                        </tr>
                        <tr>
                            <td style={{ ...stickyCellStyle() }}>(+/-) Capital de Trabajo</td>
                            {flujoDatos.map(d => <td key={`ct-${d.año}`} style={{ padding: '8px', color: d.capitalTrabajo < 0 ? '#c62828' : (d.capitalTrabajo > 0 ? '#1b5e20' : 'inherit') }}>{formatMoneda(d.capitalTrabajo)}</td>)}
                        </tr>
                        <tr>
                            <td style={{ ...stickyCellStyle(), color: '#1976d2', fontWeight: 'bold' }}>(+) Ingreso Préstamo Nuevo</td>
                            {flujoDatos.map(d => <td key={`pre-${d.año}`} style={{ padding: '8px', fontWeight: 'bold', color: '#1976d2' }}>{formatMoneda(d.ingresoPrestamo)}</td>)}
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr style={{ background: '#2e7d32', color: 'white', fontWeight: 'bold', fontSize: '15px' }}>
                            <td style={{ position: 'sticky', left: 0, backgroundColor: '#2e7d32', color: 'white', textAlign: 'left', padding: '12px', zIndex: 2 }}>
                                FLUJO DE CAJA NETO
                            </td>
                            {flujoDatos.map(d => (
                                <td key={`fn-${d.año}`} style={{ padding: '12px' }}>
                                    {formatMoneda(d.flujoNeto)}
                                </td>
                            ))}
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* SECCIÓN DE INDICADORES DE EVALUACIÓN Y ESTÁNDARES */}
            <div style={{ marginTop: '24px', borderTop: '2px solid #e0e0e0', paddingTop: '20px' }}>
                <h3 style={{ color: '#1b5e20', marginBottom: '16px', fontSize: '18px' }}>
                    Indicadores de Evaluación y Estándares Comparativos
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {/* TARJETA VAN */}
                    <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#2e7d32', fontWeight: 'bold', marginBottom: '4px' }}>
                                Valor Actual Neto (VAN a {tasaDescuento}%)
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1b5e20', marginBottom: '8px' }}>
                                {formatMoneda(van)}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: van >= 0 ? '#2e7d32' : '#c62828' }}>
                            <span>{van >= 0 ? '✅' : '⚠️'}</span>
                            <span>{van >= 0 ? 'Proyecto Rentable (VAN >= 0)' : 'Proyecto No Rentable (VAN < 0)'}</span>
                        </div>
                    </div>

                    {/* TARJETA TIR */}
                    <div style={{ background: '#e8f5e9', border: '1px solid #c8e6c9', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '13px', color: '#2e7d32', fontWeight: 'bold', marginBottom: '4px' }}>
                                Tasa Interna de Retorno (TIR)
                            </div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: tir !== null && tir >= Number(tasaDescuento) ? '#1b5e20' : '#c62828', marginBottom: '8px' }}>
                                {tir !== null ? `${tir.toFixed(2)}%` : 'N/A'}
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: tir !== null && tir >= Number(tasaDescuento) ? '#2e7d32' : '#c62828' }}>
                            <span>{tir !== null && tir >= Number(tasaDescuento) ? '✅' : '⚠️'}</span>
                            <span>Estándar: TIR &gt;= {tasaDescuento}%</span>
                        </div>
                    </div>

                    {/* RESTO DE INDICADORES */}
                    {Object.entries(PARAMETROS_EVALUACION).map(([key, config]) => {
                        const valorActual = indicadoresEvaluacionCalculados[key];
                        const aprobado = evaluarCondicion(key, valorActual);
                        const unidad = key === 'liquidez' || key === 'patrimonioAval' || key === 'solvencia' ? ' x' : ' %';
                        const valorFormateado = `${valorActual.toFixed(2)}${unidad}`;

                        return (
                            <div key={key} style={{ background: '#f9fbe7', border: '1px solid #dcedc8', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '13px', color: '#558b2f', fontWeight: 'bold', marginBottom: '4px' }}>
                                        {config.etiqueta}
                                    </div>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2e7d32', marginBottom: '8px' }}>
                                        {valorFormateado}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '500', color: aprobado ? '#2e7d32' : '#c62828' }}>
                                    <span>{aprobado ? '✅' : '⚠️'}</span>
                                    <span>Estándar: {config.condicion === 'menor' ? '<' : '>'} {config.umbral}{unidad.trim() === '%' ? '%' : ''}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FlujoDeCaja;