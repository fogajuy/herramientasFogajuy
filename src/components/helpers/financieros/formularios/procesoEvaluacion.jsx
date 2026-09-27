import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../../../navBar/navBar'; 
import '../../../../styles/procesoEvaluacion.css'; 

import FormularioIngresos from './formularioIngresos'; 
import FormularioEgresos from './formularioEgresos';
import FormularioFinanciacion from './formularioFinanciacion';
import FormularioInversiones from './formularioInversiones'; 
import FlujoDeCaja from './flujoDeCaja'; 
import EvaluacionRatios from './informeEvaluacion'; // <-- 1. IMPORTACIÓN DEL PASO 6

const PasoGenerico = ({ numeroPaso, onGuardar }) => {
  return (
    <div>
      <h3>Contenido del Paso {numeroPaso}</h3>
      <p>Aquí irá el informe final consolidado.</p>
      <button 
        className="btn btn-primary mt-3" 
        onClick={() => onGuardar(numeroPaso, { datoEjemplo: 'Prueba' })}
      >
        Guardar datos en LocalStorage (Simulación)
      </button>
    </div>
  );
};

const ProcesoEvaluacion = () => {
  const [pasoActivo, setPasoActivo] = useState(1);
  const [pasosGuardados, setPasosGuardados] = useState([]);

  const LOCAL_STORAGE_KEY = 'evaluacion_datos_draft';

  // Helper seguro para leer LocalStorage evitando crashes por JSON corrupto
  const obtenerTodosLosDatosStorage = () => {
    try {
      const datosStorage = localStorage.getItem(LOCAL_STORAGE_KEY);
      return datosStorage ? JSON.parse(datosStorage) : {};
    } catch (error) {
      console.error("Error al leer de LocalStorage:", error);
      return {};
    }
  };

  useEffect(() => {
    const datosParseados = obtenerTodosLosDatosStorage();
    const pasosCompletados = Object.keys(datosParseados)
      .filter(key => key.startsWith('paso'))
      .map(key => parseInt(key.replace('paso', ''), 10));
    
    setPasosGuardados(pasosCompletados);
  }, []);

  const manejarGuardadoPaso = (numeroPaso, datosDelPaso) => {
    const datosActuales = obtenerTodosLosDatosStorage();
    datosActuales[`paso${numeroPaso}`] = datosDelPaso;
    
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(datosActuales));
    } catch (error) {
      console.error("Error al guardar en LocalStorage:", error);
    }

    if (!pasosGuardados.includes(numeroPaso)) {
      setPasosGuardados([...pasosGuardados, numeroPaso]);
    }

    if (numeroPaso < 7) setPasoActivo(numeroPaso + 1);
  };

  const obtenerDatosDelPaso = (numeroPaso) => {
    const parseados = obtenerTodosLosDatosStorage();
    return parseados[`paso${numeroPaso}`] || null;
  };

  const obtenerPeriodosGlobales = () => {
    const datosPaso1 = obtenerDatosDelPaso(1);
    return Number(datosPaso1?.periodos) || 5;
  };

  // =========================================================================
  // CONSOLIDACIÓN FINANCIERA PARA EL PASO 5 Y PASO 6
  // =========================================================================
  const datosFlujoConsolidados = useMemo(() => {
    // 2. Ejecutar la consolidación tanto para el Paso 5 como para el Paso 6
    if (pasoActivo !== 5 && pasoActivo !== 6) return null;

    const periodos = obtenerPeriodosGlobales();
    const dIngresos = obtenerDatosDelPaso(1) || {};
    const dEgresos = obtenerDatosDelPaso(2) || {};
    const dFinanciacion = obtenerDatosDelPaso(3) || {};
    const dInversiones = obtenerDatosDelPaso(4) || {};

    // 1. Consolidar Ingresos por Año (Años 1..N)
    const ingresosAños = Array(periodos).fill(0);
    const listaIngresos = Array.isArray(dIngresos.ingresos) ? dIngresos.ingresos : [];

    listaIngresos.forEach(ingreso => {
      const valores = ingreso.valores || []; 
      for (let i = 0; i < periodos; i++) {
        const monto = Number(valores[i]) || 0;
        ingresosAños[i] += monto;
      }
    });

    // 2. Consolidar Egresos
    const egresosProduccion = Array(periodos).fill(0);
    const egresosOtros = Array(periodos).fill(0);
    const egresosOperativos = Array(periodos).fill(0);

    const listaEgresos = Array.isArray(dEgresos.egresos) ? dEgresos.egresos : [];

    listaEgresos.forEach(egreso => {
      const centroCosto = String(egreso.centroCosto || '').toLowerCase().trim();
      const esProductivo = centroCosto.includes('producción') || centroCosto.includes('produccion');
      const valores = egreso.valores || [];

      for (let i = 0; i < periodos; i++) {
        const monto = Number(valores[i]) || 0;
        if (esProductivo) {
          egresosProduccion[i] += monto;
        } else {
          egresosOtros[i] += monto;
        }
        egresosOperativos[i] += monto;
      }
    });

    // 3. Inversión Inicial (Año 0)
    let inversionInicialTotal = 0;
    const listaInversiones = Array.isArray(dInversiones.inversiones) ? dInversiones.inversiones : [];
    listaInversiones.forEach(inv => {
      inversionInicialTotal += Number(inv.monto) || 0;
    });

    const listaCapTrabajo = Array.isArray(dInversiones.capitalTrabajo) ? dInversiones.capitalTrabajo : [];
    let capitalTrabajoTotal = 0;
    listaCapTrabajo.forEach(ct => {
      capitalTrabajoTotal += Number(ct.monto) || 0;
    });

    // 4. Servicio de Deuda Anual
    const servicioDeudaAños = Array(periodos + 1).fill(0);
    const flujoCajaFinanciacion = dFinanciacion.flujoCajaAnual || [];
    if (Array.isArray(flujoCajaFinanciacion)) {
      flujoCajaFinanciacion.forEach(f => {
        if (f.periodo <= periodos) {
          servicioDeudaAños[f.periodo] = Number(f.servicioDeudaTotal || f.cuota || 0);
        }
      });
    }

    // 5. Flujos Netos en Formato Matriz (Año 0 a N) para Ratios
    const flujoNetoProyecto = Array(periodos + 1).fill(0);
    const flujoNetoAccionista = Array(periodos + 1).fill(0);

    const desembolsoInicial = inversionInicialTotal + capitalTrabajoTotal;
    flujoNetoProyecto[0] = -desembolsoInicial;

    const ingresoPrestamo = Number(dFinanciacion.totalesAcumulados?.ingresoCredito || dFinanciacion.montoPrestamo || 0);
    flujoNetoAccionista[0] = -desembolsoInicial + ingresoPrestamo;

    for (let i = 0; i < periodos; i++) {
      const año = i + 1;
      const flujoOp = ingresosAños[i] - egresosOperativos[i];
      flujoNetoProyecto[año] = flujoOp;
      flujoNetoAccionista[año] = flujoOp - servicioDeudaAños[año];
    }

    return {
      periodos,
      ingresosAños,
      egresosProduccion,
      egresosOtros,
      egresosOperativos,
      financiacion: dFinanciacion,
      inversiones: listaInversiones,
      capitalTrabajo: listaCapTrabajo,
      // Propiedades estructuradas enviadas a EvaluacionRatios
      flujoNetoProyecto,
      flujoNetoAccionista,
      servicioDeudaAños
    };
  }, [pasoActivo]);

  const renderizarPaso = () => {
    switch (pasoActivo) {
      case 1:
        return (
          <FormularioIngresos 
            numeroPaso={1} 
            onGuardar={manejarGuardadoPaso} 
            datosIniciales={obtenerDatosDelPaso(1)} 
          />
        );
      case 2:
        return (
          <FormularioEgresos 
            numeroPaso={2} 
            onGuardar={manejarGuardadoPaso} 
            datosIniciales={obtenerDatosDelPaso(2)}
            periodosGlobales={obtenerPeriodosGlobales()} 
          />
        );
      case 3: 
        return (
          <FormularioFinanciacion 
            numeroPaso={3} 
            onGuardar={manejarGuardadoPaso} 
            datosIniciales={obtenerDatosDelPaso(3)}
            periodosGlobales={obtenerPeriodosGlobales()} 
          />
        );
      case 4: 
        return (
          <FormularioInversiones 
            numeroPaso={4} 
            onGuardar={manejarGuardadoPaso} 
            datosIniciales={obtenerDatosDelPaso(4)}
            periodosGlobales={obtenerPeriodosGlobales()} 
          />
        );
      case 5: {
        if (!datosFlujoConsolidados) return null;

        return (
          <div className="paso-flujo-caja">
            <FlujoDeCaja 
              periodos={datosFlujoConsolidados.periodos}
              ingresosAños={datosFlujoConsolidados.ingresosAños}
              egresosProduccion={datosFlujoConsolidados.egresosProduccion}
              egresosOtros={datosFlujoConsolidados.egresosOtros}
              financiacion={datosFlujoConsolidados.financiacion}
              inversiones={datosFlujoConsolidados.inversiones}
              capitalTrabajo={datosFlujoConsolidados.capitalTrabajo}
              tasaImpositiva={30} 
            />
            
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button 
                className="btn btn-success" 
                style={{ padding: '10px 20px', fontSize: '16px' }}
                onClick={() => manejarGuardadoPaso(5, { 
                  revisado: true, 
                  timestamp: new Date().toISOString(),
                  ingresosAños: datosFlujoConsolidados.ingresosAños,
                  egresosProduccion: datosFlujoConsolidados.egresosProduccion,
                  egresosOtros: datosFlujoConsolidados.egresosOtros
                })}
              >
                Confirmar y Continuar al Paso 6
              </button>
            </div>
          </div>
        );
      }
      case 6: { // <-- 3. MONTAJE DEL COMPONENTE EN EL PASO 6
        if (!datosFlujoConsolidados) return null;

        return (
          <EvaluacionRatios 
            numeroPaso={6}
            datosFlujo={datosFlujoConsolidados}
            onGuardar={manejarGuardadoPaso}
            datosIniciales={obtenerDatosDelPaso(6)}
          />
        );
      }
      default:
        return (
          <PasoGenerico 
            numeroPaso={pasoActivo} 
            onGuardar={manejarGuardadoPaso} 
          />
        );
    }
  };

  return (
    <div className="evaluacion-container">
      <Navbar/>
      <div className="evaluacion-header">
        <h2>Proceso de Evaluación Económica</h2>
        <h4>Pasos</h4>
      </div>

      <div className="stepper-container">
        {[1, 2, 3, 4, 5, 6, 7].map((num) => {
          const tieneDatos = pasosGuardados.includes(num);
          const esActivo = pasoActivo === num;

          return (
            <button
              key={num}
              onClick={() => setPasoActivo(num)}
              className={`step-btn ${tieneDatos ? 'completado' : 'pendiente'} ${esActivo ? 'activo' : ''}`}
              title={tieneDatos ? `Paso ${num} (Datos guardados)` : `Paso ${num} (Pendiente)`}
            >
              {num}
            </button>
          );
        })}
      </div>

      <div className="step-content">
        {renderizarPaso()}
      </div>
    </div>
  );
};

export default ProcesoEvaluacion;