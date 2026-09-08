// src/components/simuladorBursatil.jsx
import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Navbar from '../navBar/navBar';
import '../../styles/simuladorBursatil.css';

export default function SimuladorBursatil() {
  const [instrumentos, setInstrumentos] = useState([
    {
      id: 1,
      fechaOp: '2026-08-19',
      monto: 11000000,
      fechaVenc: '2026-09-19',
      tasa: 19.5,
      esGobJujuy: 'SI',
      moneda: 'PESOS'
    }
  ]);

  const [nuevoForm, setNuevoForm] = useState({
    fechaOp: new Date().toISOString().split('T')[0],
    monto: 1000000,
    fechaVenc: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tasa: 20,
    esGobJujuy: 'NO',
    moneda: 'PESOS'
  });

  const formatoMoneda = (valor, moneda = 'PESOS') => {
    const symbol = moneda === 'DOLARES' ? 'ARS' : 'ARS';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: symbol,
      minimumFractionDigits: 2
    }).format(valor);
  };

  // Cálculo de fecha de pago real (+48hs hábiles de clearing)
  const calcularFechaPagoYDias = (fechaOpStr, fechaVencStr) => {
    const op = new Date(fechaOpStr + 'T00:00:00');
    let venc = new Date(fechaVencStr + 'T00:00:00');

    const diasVto = Math.round((venc - op) / (1000 * 60 * 60 * 24));

    if (venc.getDay() === 6) {
      venc.setDate(venc.getDate() + 2);
    } else if (venc.getDay() === 0) {
      venc.setDate(venc.getDate() + 1);
    }

    let diasHabilesSumados = 0;
    const pago = new Date(venc);

    while (diasHabilesSumados < 2) {
      pago.setDate(pago.getDate() + 1);
      if (pago.getDay() !== 0 && pago.getDay() !== 6) {
        diasHabilesSumados++;
      }
    }

    const diasPago = Math.round((pago - op) / (1000 * 60 * 60 * 24));

    return {
      fechaPagoStr: pago.toISOString().split('T')[0],
      diasVto,
      diasPago
    };
  };

  const obtenerTasaComisionSGR = (moneda, esGobJujuy, diasVto) => {
    if (moneda === 'DOLARES') return 0.04;

    if (esGobJujuy === 'SI') {
      if (diasVto <= 30) return 0.0025;
      if (diasVto <= 60) return 0.0050;
      if (diasVto <= 180) return 0.0100;
      return 0.0200;
    } else {
      if (diasVto <= 180) return 0.0100;
      return 0.0200;
    }
  };

    const calculos = useMemo(() => {
    let totNominal = 0;
    let totDescuentoOperado = 0;
    let totArancelAlyc = 0;
    let totComisionAlyc3 = 0;
    let totDerechoMercado = 0;
    let totIva = 0;
    let totNetoComitente = 0;
    let totComisionSgr = 0;
    let totNetoResultante = 0;

    const lineasCalculadas = instrumentos.map((item) => {
      const { fechaPagoStr, diasVto, diasPago } = calcularFechaPagoYDias(item.fechaOp, item.fechaVenc);
      
      const C = item.monto;
      const F = item.tasa / 100;
      const K = diasPago;

      // 1. Descuento Operado (Financiero)
      const descuentoOperado = K > 0 ? (C - (C / (1 + F * (K / 365)))) : 0;

      // Base para ALYC = Nominal - Descuento Operado
      const baseNetoValor = C - descuentoOperado;

      // 2. Arancel ALYC 0.06% con prorrateo / tope a 90 días
      let arancelAlyc = 0;
      if (K <= 90) {
        arancelAlyc = (baseNetoValor * 0.0006 / 90) * K;
      } else {
        arancelAlyc = baseNetoValor * 0.0006;
      }

      // 3. Comisión ALYC 3% prorrateada por plazo real
      const comisionAlyc3 = C * 0.03 * (K / 365);
      const derechoMercado = 0;
      
      // 4. Base IVA Mercado e IVA (21%)
      const baseIva = (descuentoOperado * 0)+ arancelAlyc + comisionAlyc3;
      const ivaMercado = baseIva * 0.21;

      // 5. Neto en Cuenta Comitente
      const resultadoDescuento = C - (descuentoOperado + arancelAlyc + comisionAlyc3 + derechoMercado + ivaMercado);

      // 6. Comisión SGR FOGAJUY
      const tasaSgr = obtenerTasaComisionSGR(item.moneda, item.esGobJujuy, diasVto);
      const comisionSgr = C * tasaSgr;

      // 7. Neto Resultante Socio
      const netoResultante = resultadoDescuento - comisionSgr;

      // Acumuladores
      totNominal += C;
      totDescuentoOperado += descuentoOperado;
      totArancelAlyc += arancelAlyc;
      totComisionAlyc3 += comisionAlyc3;
      totDerechoMercado += derechoMercado;
      totIva += ivaMercado;
      totNetoComitente += resultadoDescuento;
      totComisionSgr += comisionSgr;
      totNetoResultante += netoResultante;

      return {
        ...item,
        fechaPagoStr,
        diasVto,
        diasPago,
        descuentoOperado,
        arancelAlyc,
        comisionAlyc3,
        derechoMercado,
        ivaMercado,
        resultadoDescuento,
        tasaSgrPct: (tasaSgr * 100).toFixed(2),
        comisionSgr,
        netoResultante
      };
    });

    return {
      lineas: lineasCalculadas,
      totales: {
        nominal: totNominal,
        descuentoOperado: totDescuentoOperado,
        arancelAlyc: totArancelAlyc,
        comisionAlyc3: totComisionAlyc3,
        derechoMercado: totDerechoMercado,
        iva: totIva,
        netoComitente: totNetoComitente,
        comisionSgr: totComisionSgr,
        netoResultante: totNetoResultante
      }
    };
  }, [instrumentos]);  

  const agregarInstrumento = () => {
    setInstrumentos([
      ...instrumentos,
      { ...nuevoForm, id: Date.now(), monto: parseFloat(nuevoForm.monto) || 0, tasa: parseFloat(nuevoForm.tasa) || 0 }
    ]);
  };

  const eliminarInstrumento = (id) => {
    setInstrumentos(instrumentos.filter((i) => i.id !== id));
  };

//   const exportarExcel = () => {
//     const filasExcel = calculos.lineas.map((l) => ({
//       'Fecha Op': l.fechaOp,
//       'Importe Nominal': l.monto,
//       'Fecha Venc': l.fechaVenc,
//       'Fecha Pago Real': l.fechaPagoStr,
//       'Tasa %': l.tasa,
//       'Gob Jujuy': l.esGobJujuy,
//       'Moneda': l.moneda,
//       'Días Vto': l.diasVto,
//       'Días Pago': l.diasPago,
//       'Descuento Operado': l.descuentoOperado,
//       'Arancel ALYC (0.06%)': l.arancelAlyc,
//       'Comisión ALYC (3% Prorrateado)': l.comisionAlyc3,
//       'Derecho Mercado': l.derechoMercado,
//       'IVA Mercado (21%)': l.ivaMercado,
//       'Neto Cta. Comitente': l.resultadoDescuento,
//       'Comisión SGR %': `${l.tasaSgrPct}%`,
//       'Comisión SGR ($)': l.comisionSgr,
//       'Neto Resultante Socio': l.netoResultante
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(filasExcel);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Liquidacion Bursatil');
//     XLSX.writeFile(workbook, `FOGAJUY_Simulacion_Bursatil.xlsx`);
//   };


  const exportarExcel = () => {
    // 1. Filas de cada instrumento
    const filasExcel = calculos.lineas.map((l) => ({
      'Fecha Op': l.fechaOp,
      'Importe Nominal': l.monto,
      'Fecha Venc': l.fechaVenc,
      'Fecha Pago Real': l.fechaPagoStr,
      'Tasa %': l.tasa,
      'Gob Jujuy': l.esGobJujuy,
      'Moneda': l.moneda,
      'Días Vto': l.diasVto,
      'Días Pago': l.diasPago,
      'Descuento Operado': l.descuentoOperado,
      'Arancel ALYC (0.06%)': l.arancelAlyc,
      'Comisión ALYC (3% Prorrateado)': l.comisionAlyc3,
      'Derecho Mercado': l.derechoMercado,
      'IVA Mercado (21%)': l.ivaMercado,
      'Neto Cta. Comitente': l.resultadoDescuento,
      'Comisión SGR %': `${l.tasaSgrPct}%`,
      'Comisión SGR ($)': l.comisionSgr,
      'Neto Resultante Socio': l.netoResultante
    }));

    // 2. Separador y bloque de totales
    filasExcel.push({}); // Fila en blanco
    filasExcel.push({
      'Fecha Op': 'RESUMEN GENERAL',
      'Importe Nominal': calculos.totales.nominal,
      'Descuento Operado': calculos.totales.descuentoOperado,
      'Arancel ALYC (0.06%)': calculos.totales.arancelAlyc,
      'Comisión ALYC (3% Prorrateado)': calculos.totales.comisionAlyc3,
      'Derecho Mercado': calculos.totales.derechoMercado,
      'IVA Mercado (21%)': calculos.totales.iva,
      'Neto Cta. Comitente': calculos.totales.netoComitente,
      'Comisión SGR ($)': calculos.totales.comisionSgr,
      'Neto Resultante Socio': calculos.totales.netoResultante
    });

    const worksheet = XLSX.utils.json_to_sheet(filasExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Liquidacion Bursatil');
    XLSX.writeFile(workbook, `FOGAJUY_Simulacion_Bursatil.xlsx`);
  };

//   const exportarPDF = () => {
//     const doc = new jsPDF('landscape');

//     doc.setFontSize(15);
//     doc.setTextColor(10, 37, 64);
//     doc.text('FOGAJUY - Fondo de Garantías de Jujuy', 14, 15);
//     doc.setFontSize(11);
//     doc.text('Proyección de Descuento de Valores en Mercado de Capitales', 14, 22);

//     const bodyPDF = calculos.lineas.map((l) => [
//       l.fechaOp,
//       formatoMoneda(l.monto, l.moneda),
//       l.fechaVenc,
//       l.fechaPagoStr,
//       `${l.tasa}%`,
//       `${l.diasPago}d`,
//       formatoMoneda(l.descuentoOperado, l.moneda),
//       formatoMoneda(l.arancelAlyc, l.moneda),
//       formatoMoneda(l.comisionAlyc3, l.moneda),
//       formatoMoneda(l.ivaMercado, l.moneda),
//       formatoMoneda(l.resultadoDescuento, l.moneda),
//       formatoMoneda(l.comisionSgr, l.moneda),
//       formatoMoneda(l.netoResultante, l.moneda)
//     ]);

//     autoTable(doc, {
//       startY: 28,
//       head: [['Fecha Op', 'Nominal', 'F. Venc', 'F. Pago', 'TNA', 'Días', 'Desc. Operado', 'Arancel 0.06%', 'Comis. ALYC 3%', 'IVA Merc.', 'Neto Comitente', 'Comis. SGR', 'Neto Resultante']],
//       body: bodyPDF,
//       theme: 'striped',
//       headStyles: { fillColor: [10, 37, 64], halign: 'right' },
//       styles: { fontSize: 7.5, halign: 'right' },
//       columnStyles: { 0: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' } }
//     });

//     doc.save('FOGAJUY_Simulacion_Bursatil.pdf');
//   };


  const exportarPDF = () => {
    const doc = new jsPDF('landscape');

    doc.setFontSize(15);
    doc.setTextColor(10, 37, 64);
    doc.text('FOGAJUY - Fondo de Garantías de Jujuy', 14, 15);
    doc.setFontSize(11);
    doc.text('Proyección de Descuento de Valores en Mercado de Capitales', 14, 22);

    // Filas individuales
    const bodyPDF = calculos.lineas.map((l) => [
      l.fechaOp,
      formatoMoneda(l.monto, l.moneda),
      l.fechaVenc,
      l.fechaPagoStr,
      `${l.tasa}%`,
      `${l.diasPago}d`,
      formatoMoneda(l.descuentoOperado, l.moneda),
      formatoMoneda(l.arancelAlyc, l.moneda),
      formatoMoneda(l.comisionAlyc3, l.moneda),
      formatoMoneda(l.ivaMercado, l.moneda),
      formatoMoneda(l.resultadoDescuento, l.moneda),
      formatoMoneda(l.comisionSgr, l.moneda),
      formatoMoneda(l.netoResultante, l.moneda)
    ]);

    // Fila de pie de tabla (totales generales)
    const footPDF = [[
      'TOTALES',
      formatoMoneda(calculos.totales.nominal),
      '-',
      '-',
      '-',
      '-',
      formatoMoneda(calculos.totales.descuentoOperado),
      formatoMoneda(calculos.totales.arancelAlyc),
      formatoMoneda(calculos.totales.comisionAlyc3),
      formatoMoneda(calculos.totales.iva),
      formatoMoneda(calculos.totales.netoComitente),
      formatoMoneda(calculos.totales.comisionSgr),
      formatoMoneda(calculos.totales.netoResultante)
    ]];

    autoTable(doc, {
      startY: 28,
      head: [['Fecha Op', 'Nominal', 'F. Venc', 'F. Pago', 'TNA', 'Días', 'Desc. Operado', 'Arancel 0.06%', 'Comis. ALYC 3%', 'IVA Merc.', 'Neto Comitente', 'Comis. SGR', 'Neto Resultante']],
      body: bodyPDF,
      foot: footPDF,
      theme: 'striped',
      headStyles: { fillColor: [10, 37, 64], halign: 'right' },
      footStyles: { fillColor: [230, 235, 245], textColor: [10, 37, 64], fontStyle: 'bold', halign: 'right' },
      styles: { fontSize: 7.5, halign: 'right' },
      columnStyles: { 0: { halign: 'center' }, 2: { halign: 'center' }, 3: { halign: 'center' } }
    });

    // Cuadro de Resumen General al final del PDF
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setTextColor(10, 37, 64);
    doc.text('RESUMEN DE LIQUIDACIÓN', 14, finalY);

    const resumenData = [
      ['Total Valor Nominal:', formatoMoneda(calculos.totales.nominal), 'Neto Comitente:', formatoMoneda(calculos.totales.netoComitente)],
      ['(-) Descuento Operado:', formatoMoneda(calculos.totales.descuentoOperado), '(-) Comisión SGR FOGAJUY:', formatoMoneda(calculos.totales.comisionSgr)],
      ['(-) Arancel Soc. Bolsa (0.06%):', formatoMoneda(calculos.totales.arancelAlyc), 'Neto Resultante Socio:', formatoMoneda(calculos.totales.netoResultante)],
      ['(-) Comisión ALYC (3% Prorr.):', formatoMoneda(calculos.totales.comisionAlyc3), '', ''],
      ['(-) IVA Mercado (21%):', formatoMoneda(calculos.totales.iva), '', ''],
      ['Neto Cta. Comitente:', formatoMoneda(calculos.totales.netoComitente), '', '']
    ];

    autoTable(doc, {
      startY: finalY + 4,
      body: resumenData,
      theme: 'plain',
      styles: { fontSize: 8.5, cellPadding: 1.5 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { halign: 'right', cellWidth: 40 },
        2: { fontStyle: 'bold', cellWidth: 50 },
        3: { halign: 'right', cellWidth: 40 }
      }
    });

    doc.save('FOGAJUY_Simulacion_Bursatil.pdf');
  };

  return (
    <div className="bursatil-container">
      <Navbar />

      <header className="bursatil-header">
        <h2>Simulador Bursátil - Descuento de Valores</h2>
        <p>Proyección de liquidación de Cheques, Echeqs y Pagarés en Mercado de Capitales (FOGAJUY).</p>
      </header>

      {/* Formulario */}
      <div className="bursatil-card">
        <h3>Agregar Instrumento a Operar</h3>
        <div className="form-grid-bursatil">
          <div className="form-group-b">
            <label>Fecha Operación</label>
            <input
              type="date"
              value={nuevoForm.fechaOp}
              onChange={(e) => setNuevoForm({ ...nuevoForm, fechaOp: e.target.value })}
            />
          </div>

          <div className="form-group-b">
            <label>Valor Nominal ($)</label>
            <input
              type="number"
              value={nuevoForm.monto}
              onChange={(e) => setNuevoForm({ ...nuevoForm, monto: e.target.value })}
            />
          </div>

          <div className="form-group-b">
            <label>Fecha Vencimiento</label>
            <input
              type="date"
              value={nuevoForm.fechaVenc}
              onChange={(e) => setNuevoForm({ ...nuevoForm, fechaVenc: e.target.value })}
            />
          </div>

          <div className="form-group-b">
            <label>Tasa Descuento (TNA %)</label>
            <input
              type="number"
              step="0.1"
              value={nuevoForm.tasa}
              onChange={(e) => setNuevoForm({ ...nuevoForm, tasa: e.target.value })}
            />
          </div>

          <div className="form-group-b">
            <label>Gobierno de Jujuy</label>
            <select
              value={nuevoForm.esGobJujuy}
              onChange={(e) => setNuevoForm({ ...nuevoForm, esGobJujuy: e.target.value })}
            >
              <option value="NO">NO</option>
              <option value="SI">SI</option>
            </select>
          </div>

          <div className="form-group-b">
            <label>Moneda</label>
            <select
              value={nuevoForm.moneda}
              onChange={(e) => setNuevoForm({ ...nuevoForm, moneda: e.target.value })}
            >
              <option value="PESOS">PESOS (ARS)</option>
              <option value="DOLARES">DÓLARES (USD)</option>
            </select>
          </div>

          <button className="btn-add-linea" onClick={agregarInstrumento}>
            + Cargar Línea
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-bursatil-responsive">
        <table className="tabla-bursatil">
          <thead>
            <tr>
              <th>#</th>
              <th>F. Op</th>
              <th>Importe Nominal</th>
              <th>F. Venc</th>
              <th>F. Pago Real</th>
              <th>TNA %</th>
              <th>Días Pago</th>
              <th>Desc. Operado</th>
              <th>Arancel ALYC (0.06%)</th>
              <th>Comis. ALYC (3%)</th>
              <th>IVA (21%)</th>
              <th>Neto Cta. Comitente</th>
              <th>Comis. SGR</th>
              <th>Neto Resultante</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {calculos.lineas.map((l, index) => (
              <tr key={l.id}>
                <td>{index + 1}</td>
                <td>{l.fechaOp}</td>
                <td><strong>{formatoMoneda(l.monto, l.moneda)}</strong></td>
                <td>{l.fechaVenc}</td>
                <td>{l.fechaPagoStr}</td>
                <td>{l.tasa}%</td>
                <td>{l.diasPago}d</td>
                <td>{formatoMoneda(l.descuentoOperado, l.moneda)}</td>
                <td>{formatoMoneda(l.arancelAlyc, l.moneda)}</td>
                <td>{formatoMoneda(l.comisionAlyc3, l.moneda)}</td>
                <td>{formatoMoneda(l.ivaMercado, l.moneda)}</td>
                <td><strong>{formatoMoneda(l.resultadoDescuento, l.moneda)}</strong></td>
                <td>{formatoMoneda(l.comisionSgr, l.moneda)} ({l.tasaSgrPct}%)</td>
                <td><strong style={{ color: '#00d4b2' }}>{formatoMoneda(l.netoResultante, l.moneda)}</strong></td>
                <td>
                  <button className="btn-delete-linea" onClick={() => eliminarInstrumento(l.id)}>
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      <div className="resumen-bursatil-grid">
        <div className="resumen-b-card">
          <h4>Descuento e Impuestos Mercado</h4>
          <div className="resumen-b-row">
            <span>Total Valor Nominal:</span>
            <strong>{formatoMoneda(calculos.totales.nominal)}</strong>
          </div>
          <div className="resumen-b-row">
            <span>(-) Descuento Operado:</span>
            <span>{formatoMoneda(calculos.totales.descuentoOperado)}</span>
          </div>
          <div className="resumen-b-row">
            <span>(-) Arancel Soc. Bolsa (0.06%):</span>
            <span>{formatoMoneda(calculos.totales.arancelAlyc)}</span>
          </div>
          <div className="resumen-b-row">
            <span>(-) Comisión ALYC (3% Prorrateado):</span>
            <span>{formatoMoneda(calculos.totales.comisionAlyc3)}</span>
          </div>
          <div className="resumen-b-row">
            <span>(-) IVA Mercado (21%):</span>
            <span>{formatoMoneda(calculos.totales.iva)}</span>
          </div>
          <div className="resumen-b-row total-destacado">
            <span>Neto Cta. Comitente:</span>
            <span>{formatoMoneda(calculos.totales.netoComitente)}</span>
          </div>
        </div>

        <div className="resumen-b-card">
          <h4>Comisión FOGAJUY & Liquidación Final</h4>
          <div className="resumen-b-row">
            <span>Neto a Depositar Comitente:</span>
            <strong>{formatoMoneda(calculos.totales.netoComitente)}</strong>
          </div>
          <div className="resumen-b-row">
            <span>(-) Comisión SGR FOGAJUY:</span>
            <span style={{ color: '#d83b01' }}>{formatoMoneda(calculos.totales.comisionSgr)}</span>
          </div>
          <div className="resumen-b-row total-destacado">
            <span>Neto Resultante Socio:</span>
            <span style={{ color: '#107c41' }}>{formatoMoneda(calculos.totales.netoResultante)}</span>
          </div>
        </div>
      </div>

      {/* Botones de Exportación */}
      <div className="bursatil-acciones">
        <button className="btn-add-linea btn-bursatil-excel" onClick={exportarExcel}>
          📊 Exportar a Excel
        </button>
        <button className="btn-add-linea btn-bursatil-pdf" onClick={exportarPDF}>
          📄 Exportar a PDF
        </button>
      </div>
    </div>
  );
}