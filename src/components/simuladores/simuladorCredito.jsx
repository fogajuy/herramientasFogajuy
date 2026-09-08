// src/components/simuladorCredito.jsx
import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from '../navBar/navBar';
import '../../styles/simuladorCredito.css';

export default function SimuladorCredito() {
  // Estados de entrada del usuario
  const [monto, setMonto] = useState(1000000);
  const [plazoMeses, setPlazoMeses] = useState(36);
  const [tna, setTna] = useState(30); // Tasa Nominal Anual %
  const [graciaMeses, setGraciaMeses] = useState(0);
  const [sistema, setSistema] = useState('FRANCES'); // 'FRANCES' o 'ALEMAN'

  // Formateador de moneda en pesos argentinos
  const formatoMoneda = (valor) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(valor);
  };

  // Cálculo de la tabla de amortización con capitalización de gracia
  const { cuotas, totales, capitalReajustado } = useMemo(() => {
    const listaCuotas = [];
    const tasaMensual = (tna / 100) / 12;
    
    let saldoPendiente = parseFloat(monto) || 0;
    const numGracia = Math.min(parseInt(graciaMeses) || 0, (parseInt(plazoMeses) || 1) - 1);
    const numPlazo = parseInt(plazoMeses) || 1;
    const mesesPagos = numPlazo - numGracia;

    let totAmortizacion = 0;
    let totInteres = 0;
    let totIva = 0;
    let totCuota = 0;

    // --- FASE 1: Período de Gracia (Intereses acumulados y agregados al capital) ---
    for (let m = 1; m <= numGracia; m++) {
      const interesMes = saldoPendiente * tasaMensual;
      const ivaMes = interesMes * 0.21;
      const saldoInicial = saldoPendiente;
      
      // En gracia el interés se capitaliza al saldo final del periodo
      saldoPendiente += interesMes;

      listaCuotas.push({
        numero: m,
        esGracia: true,
        capitalInicio: saldoInicial,
        amortizacion: 0,
        interes: interesMes,
        iva: ivaMes,
        cuotaTotal: 0, // Durante gracia no desembolsa pago regular
        capitalFin: saldoPendiente
      });

      totInteres += interesMes;
      totIva += ivaMes;
    }

    const capitalFinalInicioPagos = saldoPendiente;

    // --- FASE 2: Pagos Regulares (Sistema Francés o Alemán) ---
    // Cálculo de cuota para sistema francés sobre el nuevo capital ajustado
    let cuotaFijaFrances = 0;
    if (sistema === 'FRANCES' && mesesPagos > 0) {
      if (tasaMensual > 0) {
        cuotaFijaFrances = capitalFinalInicioPagos * (tasaMensual * Math.pow(1 + tasaMensual, mesesPagos)) / (Math.pow(1 + tasaMensual, mesesPagos) - 1);
      } else {
        cuotaFijaFrances = capitalFinalInicioPagos / mesesPagos;
      }
    }

    const amortizacionFijaAleman = sistema === 'ALEMAN' && mesesPagos > 0 ? capitalFinalInicioPagos / mesesPagos : 0;

    for (let m = numGracia + 1; m <= numPlazo; m++) {
      const saldoInicial = saldoPendiente;
      const interesMes = saldoInicial * tasaMensual;
      const ivaMes = interesMes * 0.21;
      let amortizacionMes = 0;
      let cuotaPura = 0;

      if (sistema === 'FRANCES') {
        cuotaPura = cuotaFijaFrances;
        amortizacionMes = cuotaPura - interesMes;
      } else {
        // ALEMAN
        amortizacionMes = amortizacionFijaAleman;
        cuotaPura = amortizacionMes + interesMes;
      }

      // Ajuste de redondeo final para la última cuota
      if (m === numPlazo) {
        amortizacionMes = saldoInicial;
        cuotaPura = amortizacionMes + interesMes;
      }

      saldoPendiente -= amortizacionMes;
      if (saldoPendiente < 0.001) saldoPendiente = 0;

      const cuotaTotalMes = cuotaPura + ivaMes;

      listaCuotas.push({
        numero: m,
        esGracia: false,
        capitalInicio: saldoInicial,
        amortizacion: amortizacionMes,
        interes: interesMes,
        iva: ivaMes,
        cuotaTotal: cuotaTotalMes,
        capitalFin: saldoPendiente
      });

      totAmortizacion += amortizacionMes;
      totInteres += interesMes;
      totIva += ivaMes;
      totCuota += cuotaTotalMes;
    }

    return {
      cuotas: listaCuotas,
      capitalReajustado: capitalFinalInicioPagos,
      totales: {
        amortizacion: totAmortizacion,
        interes: totInteres,
        iva: totIva,
        cuotaTotal: totCuota
      }
    };
  }, [monto, plazoMeses, tna, graciaMeses, sistema]);

  // Exportar a Excel
  const exportarExcel = () => {
    const datosExcel = cuotas.map((c) => ({
      'Cuota N°': c.numero + (c.esGracia ? ' (Gracia)' : ''),
      'Capital Deuda Inicial': c.capitalInicio,
      'Amortización Capital': c.amortizacion,
      'Interés': c.interes,
      'IVA (21%)': c.iva,
      'Cuota Total': c.cuotaTotal,
      'Capital Deuda Final': c.capitalFin
    }));

    // Fila de totales
    datosExcel.push({
      'Cuota N°': 'TOTALES',
      'Capital Deuda Inicial': '',
      'Amortización Capital': totales.amortizacion,
      'Interés': totales.interes,
      'IVA (21%)': totales.iva,
      'Cuota Total': totales.cuotaTotal,
      'Capital Deuda Final': ''
    });

    const worksheet = XLSX.utils.json_to_sheet(datosExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Simulación Crédito');
    XLSX.writeFile(workbook, `FOGAJUY_Simulacion_${sistema}_${plazoMeses}M.xlsx`);
  };

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(10, 37, 64);
    doc.text('FOGAJUY - Fondo de Garantías de Jujuy', 14, 15);
    doc.setFontSize(12);
    doc.text(`Simulación de Crédito - Sistema ${sistema}`, 14, 23);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Monto Solicitado: ${formatoMoneda(monto)} | Plazo: ${plazoMeses} meses | TNA: ${tna}% | Gracia: ${graciaMeses} meses`, 14, 30);
    if (graciaMeses > 0) {
      doc.text(`Capital Reajustado tras período de gracia: ${formatoMoneda(capitalReajustado)}`, 14, 35);
    }

    const filasTabla = cuotas.map((c) => [
      c.numero + (c.esGracia ? ' (G)' : ''),
      formatoMoneda(c.capitalInicio),
      formatoMoneda(c.amortizacion),
      formatoMoneda(c.interes),
      formatoMoneda(c.iva),
      formatoMoneda(c.cuotaTotal)
    ]);

    // Fila totalizadora
    filasTabla.push([
      'TOTALES',
      '-',
      formatoMoneda(totales.amortizacion),
      formatoMoneda(totales.interes),
      formatoMoneda(totales.iva),
      formatoMoneda(totales.cuotaTotal)
    ]);

    // Uso correcto con autoTable(doc, {...})
    autoTable(doc, {
      startY: graciaMeses > 0 ? 40 : 35,
      head: [['N°', 'Capital Deuda Inicial', 'Amortización', 'Interés', 'IVA (21%)', 'Cuota Total']],
      body: filasTabla,
      theme: 'striped',
      headStyles: { fillColor: [10, 37, 64], halign: 'right' },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      }
    });

    doc.save(`FOGAJUY_Simulacion_${sistema}.pdf`);
  };

  return (
    <div className="simulador-container">
      <Navbar />

      <header className="simulador-header">
        <h2>Simulador de Financiación de Crédito</h2>
        <p>Proyección de cuotas, intereses e impuestos para líneas de garantía FOGAJUY.</p>
      </header>

      {/* Formulario de Parámetros */}
      <div className="simulador-form">
        <div className="form-group">
          <label>Monto Solicitado ($)</label>
          <input
            type="number"
            min="1000"
            value={monto}
            onChange={(e) => setMonto(Math.max(0, parseFloat(e.target.value) || 0))}
          />
        </div>

        <div className="form-group">
          <label>Plazo Total (Meses)</label>
          <input
            type="number"
            min="1"
            value={plazoMeses}
            onChange={(e) => setPlazoMeses(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>

        <div className="form-group">
          <label>Tasa Nominal Anual (TNA %)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={tna}
            onChange={(e) => setTna(Math.max(0, parseFloat(e.target.value) || 0))}
          />
        </div>

        <div className="form-group">
          <label>Período de Gracia (Meses)</label>
          <input
            type="number"
            min="0"
            max={plazoMeses - 1}
            value={graciaMeses}
            onChange={(e) => setGraciaMeses(Math.max(0, parseInt(e.target.value) || 0))}
          />
        </div>

        <div className="form-group">
          <label>Sistema de Amortización</label>
          <select value={sistema} onChange={(e) => setSistema(e.target.value)}>
            <option value="FRANCES">Sistema Francés (Cuota Pura Fija)</option>
            <option value="ALEMAN">Sistema Alemán (Amortización Fija)</option>
          </select>
        </div>
      </div>

      {/* Resumen Informativo */}
      <div className="resumen-card">
        <div className="resumen-item">
          <span>Capital Inicial</span>
          <strong>{formatoMoneda(monto)}</strong>
        </div>
        {graciaMeses > 0 && (
          <div className="resumen-item">
            <span>Capital Post-Gracia (Reajustado)</span>
            <strong>{formatoMoneda(capitalReajustado)}</strong>
          </div>
        )}
        <div className="resumen-item">
          <span>Total Intereses</span>
          <strong>{formatoMoneda(totales.interes)}</strong>
        </div>
        <div className="resumen-item">
          <span>Total IVA (21%)</span>
          <strong>{formatoMoneda(totales.iva)}</strong>
        </div>
        <div className="resumen-item">
          <span>Costo Total Financiero</span>
          <strong>{formatoMoneda(totales.cuotaTotal)}</strong>
        </div>
      </div>

      {/* Botones de Exportación */}
      <div className="simulador-acciones">
        <button className="btn-export btn-excel" onClick={exportarExcel}>
          📊 Exportar a Excel
        </button>
        <button className="btn-export btn-pdf" onClick={exportarPDF}>
          📄 Exportar a PDF
        </button>
      </div>

      {/* Tabla de Resultados */}
      <div className="table-responsive">
        <table className="tabla-amortizacion">
          <thead>
            <tr>
              <th>Cuota N°</th>
              <th>Capital Deuda Inicial</th>
              <th>Amortización Capital</th>
              <th>Intereses</th>
              <th>IVA (21%)</th>
              <th>Cuota Total</th>
            </tr>
          </thead>
          <tbody>
            {cuotas.map((c) => (
              <tr key={c.numero} className={c.esGracia ? 'fila-gracia' : ''}>
                <td>
                  {c.numero}
                  {c.esGracia && <span className="badge-gracia">Gracia</span>}
                </td>
                <td>{formatoMoneda(c.capitalInicio)}</td>
                <td>{formatoMoneda(c.amortizacion)}</td>
                <td>{formatoMoneda(c.interes)}</td>
                <td>{formatoMoneda(c.iva)}</td>
                <td><strong>{c.esGracia ? '-' : formatoMoneda(c.cuotaTotal)}</strong></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>TOTALES</td>
              <td>-</td>
              <td>{formatoMoneda(totales.amortizacion)}</td>
              <td>{formatoMoneda(totales.interes)}</td>
              <td>{formatoMoneda(totales.iva)}</td>
              <td>{formatoMoneda(totales.cuotaTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}