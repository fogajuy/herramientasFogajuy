// import React, { useState } from 'react';
// import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
// import { useNavigate } from 'react-router-dom';

// const InformeEvaluacion = ({ numeroPaso, datosFlujo, onGuardar, datosIniciales }) => {
//   const navigate = useNavigate();
//   const [paginaInicial, setPaginaInicial] = useState(1);
//   const [generandoPDF, setGenerandoPDF] = useState(false);

//   // Leer datos generales directamente del LocalStorage por seguridad complementaria
//   const obtenerDatosStorage = (key) => {
//     try {
//       const data = localStorage.getItem('evaluacion_datos_draft');
//       if (!data) return null;
//       const parsed = JSON.parse(data);
//       return parsed[key] || null;
//     } catch (e) {
//       console.error(e);
//       return null;
//     }
//   };

//   const paso1 = obtenerDatosStorage('paso1'); // Ingresos
//   const paso2 = obtenerDatosStorage('paso2'); // Egresos
//   const paso3 = obtenerDatosStorage('paso3'); // Financiación
//   const paso4 = obtenerDatosStorage('paso4'); // Inversiones

//   const handleGenerarPDFCompleto = async () => {
//     try {
//       setGenerandoPDF(true);
//       const pdfDoc = await PDFDocument.create();
//       const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
//       const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//       const xLeft = 40;
//       const pageWidth = 595.28;
//       const pageHeight = 841.89;

//       // ==========================================
//       // PÁGINA 1: INGRESOS Y EGRESOS
//       // ==========================================
//       const page1 = pdfDoc.addPage([pageWidth, pageHeight]);
//       let y1 = 780;

//       page1.drawText('INFORME ECONÓMICO - EXPEDIENTE CONSOLIDADO', { x: xLeft, y: y1, size: 14, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
//       y1 -= 30;
//       page1.drawText('1. RESUMEN DE INGRESOS PROYECTADOS', { x: xLeft, y: y1, size: 11, font: fontBold, color: rgb(0, 0.4, 0) });
//       y1 -= 20;

//       if (paso1 && paso1.ingresos) {
//         paso1.ingresos.forEach(item => {
//           const valoresStr = item.valores.map((v, i) => `A${i+1}: $${Number(v).toLocaleString('es-AR')}`).join(' | ');
//           page1.drawText(`• ${item.nombre}: ${valoresStr}`, { x: xLeft + 10, y: y1, size: 9, font: fontHelvetica });
//           y1 -= 16;
//         });
//       } else {
//         page1.drawText('Sin datos de ingresos registrados.', { x: xLeft + 10, y: y1, size: 9, font: fontHelvetica });
//         y1 -= 16;
//       }

//       y1 -= 20;
//       page1.drawText('2. RESUMEN DE EGRESOS', { x: xLeft, y: y1, size: 11, font: fontBold, color: rgb(0.8, 0.2, 0.2) });
//       y1 -= 20;

//       if (paso2 && paso2.egresos) {
//         paso2.egresos.forEach(item => {
//           const valoresStr = (item.valores || []).map((v, i) => `A${i+1}: $${Number(v).toLocaleString('es-AR')}`).join(' | ');
//           page1.drawText(`• ${item.nombre} (${item.centroCosto || 'General'}): ${valoresStr}`, { x: xLeft + 10, y: y1, size: 9, font: fontHelvetica });
//           y1 -= 16;
//         });
//       } else {
//         page1.drawText('Sin datos de egresos registrados.', { x: xLeft + 10, y: y1, size: 9, font: fontHelvetica });
//       }

//       // ==========================================
//       // PÁGINA 2: INVERSIONES Y FINANCIACIÓN
//       // ==========================================
//       const page2 = pdfDoc.addPage([pageWidth, pageHeight]);
//       let y2 = 780;

//       page2.drawText('3. PLAN DE INVERSIONES Y CAPITAL DE TRABAJO', { x: xLeft, y: y2, size: 11, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
//       y2 -= 20;

//       if (paso4 && paso4.inversiones) {
//         paso4.inversiones.forEach(inv => {
//           page2.drawText(`• ${inv.nombre || 'Inversión'}: $${Number(inv.monto || 0).toLocaleString('es-AR')}`, { x: xLeft + 10, y: y2, size: 9, font: fontHelvetica });
//           y2 -= 16;
//         });
//       } else {
//         page2.drawText('Sin inversiones registradas.', { x: xLeft + 10, y: y2, size: 9, font: fontHelvetica });
//         y2 -= 16;
//       }

//       y2 -= 20;
//       page2.drawText('4. FINANCIACIÓN Y SERVICIO DE DEUDA', { x: xLeft, y: y2, size: 11, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
//       y2 -= 20;

//       if (paso3) {
//         page2.drawText(`• Monto de Préstamo Solicitado: $${Number(paso3.montoPrestamo || 0).toLocaleString('es-AR')}`, { x: xLeft + 10, y: y2, size: 9, font: fontHelvetica });
//         y2 -= 16;
//       } else {
//         page2.drawText('Sin datos de financiación registrados.', { x: xLeft + 10, y: y2, size: 9, font: fontHelvetica });
//       }

//       // ==========================================
//       // PÁGINA 3: FLUJO DE CAJA Y RATIOS
//       // ==========================================
//       const page3 = pdfDoc.addPage([pageWidth, pageHeight]);
//       let y3 = 780;

//       page3.drawText('5. FLUJO DE CAJA CONSOLIDADO E INDICADORES', { x: xLeft, y: y3, size: 11, font: fontBold, color: rgb(0, 0.4, 0) });
//       y3 -= 20;

//       if (datosFlujo) {
//         page3.drawText(`• Períodos evaluados: ${datosFlujo.periodos} años`, { x: xLeft + 10, y: y3, size: 9, font: fontHelvetica });
//         y3 -= 16;
//         const totalIngresosAcum = (datosFlujo.ingresosAños || []).reduce((a, b) => a + b, 0);
//         page3.drawText(`• Ingresos Totales Acumulados: $${totalIngresosAcum.toLocaleString('es-AR')}`, { x: xLeft + 10, y: y3, size: 9, font: fontHelvetica });
//       } else {
//         page3.drawText('Flujo consolidado pendiente de cálculo.', { x: xLeft + 10, y: y3, size: 9, font: fontHelvetica });
//       }

//       // ==========================================
//       // APLICAR SELLO Y FOLIACIÓN A TODAS LAS PÁGINAS
//       // ==========================================
//       const paginasTodas = pdfDoc.getPages();
//       const numInicioFoliado = parseInt(paginaInicial) || 1;

//       paginasTodas.forEach((unaPagina, index) => {
//         const { width, height } = unaPagina.getSize();
//         const centerX = width - 45;
//         const centerY = height - 45;
//         const radius = 24;

//         // Círculo del Sello
//         unaPagina.drawCircle({
//           x: centerX, y: centerY, size: radius,
//           borderWidth: 1.5, borderColor: rgb(0, 0, 0)
//         });

//         // Texto curvo del sello "FOGAJUY"
//         const textoArco = 'FOGAJUY';
//         const radiusArc = 17;
//         const angleStep = 18;
//         const startAngle = 90 + ((textoArco.length - 1) * angleStep) / 2;

//         for (let j = 0; j < textoArco.length; j++) {
//           const char = textoArco[j];
//           const charWidth = fontBold.widthOfTextAtSize(char, 6.5);
//           const thetaDeg = startAngle - j * angleStep;
//           const thetaRad = (thetaDeg * Math.PI) / 180;

//           unaPagina.drawText(char, {
//             x: centerX + radiusArc * Math.cos(thetaRad) - charWidth / 2,
//             y: centerY + radiusArc * Math.sin(thetaRad) - 2,
//             size: 6.5, font: fontBold, color: rgb(0, 0, 0),
//             rotate: degrees(thetaDeg - 90)
//           });
//         }

//         // Número de Folio
//         const numeroFolioActual = String(numInicioFoliado + index);
//         const numWidth = fontBold.widthOfTextAtSize(numeroFolioActual, 12);
//         unaPagina.drawText(numeroFolioActual, {
//           x: centerX - numWidth / 2, y: centerY - 4,
//           size: 12, font: fontBold, color: rgb(0, 0, 0)
//         });
//       });

//       const pdfBytes = await pdfDoc.save();
//       const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//       const pdfUrl = URL.createObjectURL(blob);

//       // Redirigir a tu visor de PDF guardando el estado
//       navigate('/expedientePDF', {
//         state: { pdfUrl, nombreArchivo: 'Expediente_Consolidado.pdf' }
//       });

//     } catch (error) {
//       console.error(error);
//       alert('Ocurrió un error al generar el PDF completo.');
//     } finally {
//       setGenerandoPDF(false);
//     }
//   };

//   return (
//     <div style={{ padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
//       <h2 style={{ color: '#004080', borderBottom: '2px solid #004080', paddingBottom: '10px' }}>
//         Paso 6: Informe Ejecutivo y Evaluación Consolidada
//       </h2>
//       <p style={{ color: '#555' }}>
//         Aquí visualizas el resumen global de todos los pasos cargados en el sistema previo a la emisión del expediente formal.
//       </p>

//       {/* Resumen visual rápido en pantalla */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', margin: '20px 0' }}>
//         <div style={{ background: '#f1f8e9', padding: '15px', borderRadius: '6px', border: '1px solid #c8e6c9' }}>
//           <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Paso 1: Ingresos</h4>
//           <p style={{ margin: 0, fontSize: '14px' }}>{paso1 ? 'Cargado y sincronizado ✓' : 'Pendiente'}</p>
//         </div>
//         <div style={{ background: '#ffebee', padding: '15px', borderRadius: '6px', border: '1px solid #ffcdd2' }}>
//           <h4 style={{ margin: '0 0 10px 0', color: '#c62828' }}>Paso 2: Egresos</h4>
//           <p style={{ margin: 0, fontSize: '14px' }}>{paso2 ? 'Cargado y sincronizado ✓' : 'Pendiente'}</p>
//         </div>
//         <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '6px', border: '1px solid #bbdefb' }}>
//           <h4 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>Paso 3 y 4: Inversiones / Fin.</h4>
//           <p style={{ margin: 0, fontSize: '14px' }}>{paso3 || paso4 ? 'Cargado y sincronizado ✓' : 'Pendiente'}</p>
//         </div>
//       </div>

//       {/* Controles para generar PDF multipágina */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginTop: '30px' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//           <label htmlFor="folioInput" style={{ fontWeight: 'bold', color: '#333' }}>
//             Número de hoja (folio) inicial del expediente:
//           </label>
//           <input
//             id="folioInput"
//             type="number"
//             min="1"
//             value={paginaInicial}
//             onChange={(e) => setPaginaInicial(e.target.value)}
//             style={{ width: '80px', padding: '8px', fontSize: '15px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold' }}
//           />
//         </div>

//         <button
//           disabled={generandoPDF}
//           onClick={handleGenerarPDFCompleto}
//           style={{ padding: '12px 24px', backgroundColor: '#004080', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}
//         >
//           {generandoPDF ? 'Generando PDF Multipágina...' : 'Imprimir Expediente Completo (PDF) →'}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default InformeEvaluacion;

import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { useNavigate } from 'react-router-dom';

const InformeEvaluacion = ({ numeroPaso, datosFlujo, onGuardar, datosIniciales }) => {
  const navigate = useNavigate();
  const [paginaInicial, setPaginaInicial] = useState(1);
  const [generandoPDF, setGenerandoPDF] = useState(false);

  // Lectura segura del LocalStorage
  const obtenerDatosStorage = (key) => {
    try {
      const data = localStorage.getItem('evaluacion_datos_draft');
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed[key] || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const paso1 = obtenerDatosStorage('paso1'); // Ingresos
  const paso2 = obtenerDatosStorage('paso2'); // Egresos
  const paso3 = obtenerDatosStorage('paso3'); // Financiación y Amortización
  const paso4 = obtenerDatosStorage('paso4'); // Inversiones

  const handleGenerarPDFCompleto = async () => {
    try {
      setGenerandoPDF(true);
      const pdfDoc = await PDFDocument.create();
      const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const xLeft = 40;
      const pageWidth = 595.28;
      const pageHeight = 841.89;

      // ==========================================
      // PÁGINA 1: INGRESOS Y EGRESOS
      // ==========================================
      const page1 = pdfDoc.addPage([pageWidth, pageHeight]);
      let y1 = 780;

      page1.drawText('INFORME ECONÓMICO Y FINANCIERO - CONSOLIDADO', { x: xLeft, y: y1, size: 14, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
      y1 -= 30;
      
      page1.drawText('1. RESUMEN DE INGRESOS PROYECTADOS', { x: xLeft, y: y1, size: 11, font: fontBold, color: rgb(0.1, 0.5, 0.2) });
      y1 -= 18;

      if (paso1 && paso1.ingresos && paso1.ingresos.length > 0) {
        paso1.ingresos.forEach(item => {
          const valoresStr = (item.valores || []).map((v, i) => `A${i+1}: $${Number(v).toLocaleString('es-AR')}`).join(' | ');
          page1.drawText(`• ${item.nombre}: ${valoresStr}`, { x: xLeft + 10, y: y1, size: 9, font: fontHelvetica });
          y1 -= 14;
        });
      } else {
        page1.drawText('Sin datos de ingresos registrados.', { x: xLeft + 10, y: y1, size: 9, font: fontHelvetica });
        y1 -= 14;
      }

      y1 -= 15;
      page1.drawText('2. RESUMEN DE EGRESOS OPERATIVOS', { x: xLeft, y: y1, size: 11, font: fontBold, color: rgb(0.7, 0.2, 0.2) });
      y1 -= 18;

      if (paso2 && paso2.egresos && paso2.egresos.length > 0) {
        paso2.egresos.forEach(item => {
          const valoresStr = (item.valores || []).map((v, i) => `A${i+1}: $${Number(v).toLocaleString('es-AR')}`).join(' | ');
          page1.drawText(`• ${item.nombre} (${item.centroCosto || 'General'}): ${valoresStr}`, { x: xLeft + 10, y: y1, size: 9, font: fontHelvetica });
          y1 -= 14;
        });
      } else {
        page1.drawText('Sin datos de egresos registrados.', { x: xLeft + 10, y: y1, size: 9, font: fontHelvetica });
      }

      // ==========================================
      // PÁGINA 2: INVERSIONES Y FINANCIACIÓN
      // ==========================================
      const page2 = pdfDoc.addPage([pageWidth, pageHeight]);
      let y2 = 780;

      page2.drawText('3. PLAN DE INVERSIONES', { x: xLeft, y: y2, size: 11, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
      y2 -= 18;

      if (paso4 && paso4.inversiones && paso4.inversiones.length > 0) {
        paso4.inversiones.forEach(inv => {
          page2.drawText(`• ${inv.nombre || 'Inversión'}: $${Number(inv.monto || 0).toLocaleString('es-AR')}`, { x: xLeft + 10, y: y2, size: 9, font: fontHelvetica });
          y2 -= 14;
        });
      } else {
        page2.drawText('Sin inversiones registradas.', { x: xLeft + 10, y: y2, size: 9, font: fontHelvetica });
        y2 -= 14;
      }

      y2 -= 15;
      page2.drawText('4. FINANCIACIÓN Y CUADRO DE AMORTIZACIÓN', { x: xLeft, y: y2, size: 11, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
      y2 -= 18;

      if (paso3) {
        page2.drawText(`• Monto Solicitado: $${Number(paso3.montoPrestamo || 0).toLocaleString('es-AR')} | Plazo: ${paso3.plazo || '-'} meses | Tasa: ${paso3.tasa || '-'}%`, { x: xLeft + 10, y: y2, size: 9, font: fontHelvetica });
        y2 -= 18;

        if (paso3.amortizacion && paso3.amortizacion.length > 0) {
          page2.drawText('Cuota | Capital | Interés | Saldo Pendiente', { x: xLeft + 10, y: y2, size: 8, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
          y2 -= 14;
          paso3.amortizacion.slice(0, 15).forEach(row => {
            const filaStr = `C${row.cuota}: $${Number(row.capital || 0).toLocaleString('es-AR')} | $${Number(row.interes || 0).toLocaleString('es-AR')} | Saldo: $${Number(row.saldo || 0).toLocaleString('es-AR')}`;
            page2.drawText(filaStr, { x: xLeft + 10, y: y2, size: 8, font: fontHelvetica });
            y2 -= 12;
          });
        }
      } else {
        page2.drawText('Sin datos de financiación registrados.', { x: xLeft + 10, y: y2, size: 9, font: fontHelvetica });
      }

      // ==========================================
      // PÁGINA 3: FLUJO DE CAJA Y RATIOS
      // ==========================================
      const page3 = pdfDoc.addPage([pageWidth, pageHeight]);
      let y3 = 780;

      page3.drawText('5. FLUJO DE CAJA CONSOLIDADO E INDICADORES', { x: xLeft, y: y3, size: 11, font: fontBold, color: rgb(0.1, 0.5, 0.2) });
      y3 -= 18;

      if (datosFlujo) {
        page3.drawText(`• Períodos evaluados: ${datosFlujo.periodos} años`, { x: xLeft + 10, y: y3, size: 9, font: fontHelvetica });
        y3 -= 14;
        const totalIngresosAcum = (datosFlujo.ingresosAños || []).reduce((a, b) => a + b, 0);
        page3.drawText(`• Ingresos Totales Acumulados: $${totalIngresosAcum.toLocaleString('es-AR')}`, { x: xLeft + 10, y: y3, size: 9, font: fontHelvetica });
      } else {
        page3.drawText('Flujo consolidado pendiente de cálculo.', { x: xLeft + 10, y: y3, size: 9, font: fontHelvetica });
      }

      // ==========================================
      // SELLO Y FOLIACIÓN
      // ==========================================
      const paginasTodas = pdfDoc.getPages();
      const numInicioFoliado = parseInt(paginaInicial) || 1;

      paginasTodas.forEach((unaPagina, index) => {
        const { width, height } = unaPagina.getSize();
        const centerX = width - 45;
        const centerY = height - 45;
        const radius = 24;

        unaPagina.drawCircle({
          x: centerX, y: centerY, size: radius,
          borderWidth: 1.5, borderColor: rgb(0, 0, 0)
        });

        const textoArco = 'FOGAJUY';
        const radiusArc = 17;
        const angleStep = 18;
        const startAngle = 90 + ((textoArco.length - 1) * angleStep) / 2;

        for (let j = 0; j < textoArco.length; j++) {
          const char = textoArco[j];
          const charWidth = fontBold.widthOfTextAtSize(char, 6.5);
          const thetaDeg = startAngle - j * angleStep;
          const thetaRad = (thetaDeg * Math.PI) / 180;

          unaPagina.drawText(char, {
            x: centerX + radiusArc * Math.cos(thetaRad) - charWidth / 2,
            y: centerY + radiusArc * Math.sin(thetaRad) - 2,
            size: 6.5, font: fontBold, color: rgb(0, 0, 0),
            rotate: degrees(thetaDeg - 90)
          });
        }

        const numeroFolioActual = String(numInicioFoliado + index);
        const numWidth = fontBold.widthOfTextAtSize(numeroFolioActual, 12);
        unaPagina.drawText(numeroFolioActual, {
          x: centerX - numWidth / 2, y: centerY - 4,
          size: 12, font: fontBold, color: rgb(0, 0, 0)
        });
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);

      navigate('/expedientePDF', {
        state: { pdfUrl, nombreArchivo: 'Expediente_Consolidado.pdf' }
      });

    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al generar el PDF completo.');
    } finally {
      setGenerandoPDF(false);
    }
  };

  return (
    <div style={{ padding: '30px', background: '#f4f6f9', minHeight: '100vh', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      
      {/* CABECERA */}
      <div style={{ background: '#ffffff', padding: '20px 25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '25px', borderLeft: '5px solid #004080' }}>
        <h2 style={{ color: '#004080', margin: '0 0 8px 0', fontSize: '22px' }}>
          Paso 6: Informe Ejecutivo y Evaluación Consolidada
        </h2>
        <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
          Panel de control y revisión general de las etapas previas antes de la emisión del expediente formal.
        </p>
      </div>

      {/* GRID DE TARJETAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        
        {/* TARJETA INGRESOS */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#2e7d32', marginTop: 0, borderBottom: '1px solid #e0e0e0', paddingBottom: '10px', fontSize: '16px' }}>
            1. Ingresos Proyectados
          </h3>
          {paso1 && paso1.ingresos && paso1.ingresos.length > 0 ? (
            <ul style={{ paddingLeft: '18px', margin: '10px 0 0 0', fontSize: '13px', color: '#333' }}>
              {paso1.ingresos.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>
                  <strong>{item.nombre}:</strong> {(item.valores || []).map((v, i) => `A${i+1}: $${Number(v).toLocaleString('es-AR')}`).join(' | ')}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#888', fontStyle: 'italic', fontSize: '13px', margin: '10px 0 0 0' }}>Sin registros de ingresos.</p>
          )}
        </div>

        {/* TARJETA EGRESOS */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#c62828', marginTop: 0, borderBottom: '1px solid #e0e0e0', paddingBottom: '10px', fontSize: '16px' }}>
            2. Egresos Operativos
          </h3>
          {paso2 && paso2.egresos && paso2.egresos.length > 0 ? (
            <ul style={{ paddingLeft: '18px', margin: '10px 0 0 0', fontSize: '13px', color: '#333' }}>
              {paso2.egresos.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>
                  <strong>{item.nombre}</strong> ({item.centroCosto || 'General'}): {(item.valores || []).map((v, i) => `A${i+1}: $${Number(v).toLocaleString('es-AR')}`).join(' | ')}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#888', fontStyle: 'italic', fontSize: '13px', margin: '10px 0 0 0' }}>Sin registros de egresos.</p>
          )}
        </div>

        {/* TARJETA INVERSIONES */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#1565c0', marginTop: 0, borderBottom: '1px solid #e0e0e0', paddingBottom: '10px', fontSize: '16px' }}>
            3. Plan de Inversiones
          </h3>
          {paso4 && paso4.inversiones && paso4.inversiones.length > 0 ? (
            <ul style={{ paddingLeft: '18px', margin: '10px 0 0 0', fontSize: '13px', color: '#333' }}>
              {paso4.inversiones.map((inv, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>
                  <strong>{inv.nombre}:</strong> ${Number(inv.monto || 0).toLocaleString('es-AR')}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#888', fontStyle: 'italic', fontSize: '13px', margin: '10px 0 0 0' }}>Sin inversiones cargadas.</p>
          )}
        </div>

      </div>

      {/* BLOQUE FINANCIACIÓN Y AMORTIZACIÓN (ANCHO COMPLETO) */}
      <div style={{ background: '#ffffff', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
        <h3 style={{ color: '#004080', marginTop: 0, borderBottom: '1px solid #e0e0e0', paddingBottom: '10px', fontSize: '16px' }}>
          4. Financiación Solicitada y Cuadro de Amortización
        </h3>
        {paso3 ? (
          <div>
            <div style={{ display: 'flex', gap: '30px', margin: '15px 0', fontSize: '14px', background: '#f8f9fa', padding: '12px 15px', borderRadius: '6px' }}>
              <div><strong>Monto Préstamo:</strong> ${Number(paso3.montoPrestamo || 0).toLocaleString('es-AR')}</div>
              <div><strong>Plazo:</strong> {paso3.plazo || '-'} meses</div>
              <div><strong>Tasa Anual:</strong> {paso3.tasa || '-'}%</div>
            </div>

            {paso3.amortizacion && paso3.amortizacion.length > 0 ? (
              <div style={{ overflowX: 'auto', maxHeight: '250px', border: '1px solid #eee', borderRadius: '6px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead style={{ background: '#f1f3f5', position: 'sticky', top: 0 }}>
                    <tr>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Cuota</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Capital</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Interés</th>
                      <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Saldo Pendiente</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paso3.amortizacion.map((row, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f1f1f1' }}>
                        <td style={{ padding: '8px 10px' }}>{row.cuota}</td>
                        <td style={{ padding: '8px 10px' }}>${Number(row.capital || 0).toLocaleString('es-AR')}</td>
                        <td style={{ padding: '8px 10px' }}>${Number(row.interes || 0).toLocaleString('es-AR')}</td>
                        <td style={{ padding: '8px 10px' }}>${Number(row.saldo || 0).toLocaleString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#888', fontStyle: 'italic', fontSize: '13px' }}>No hay cuadro de amortización generado en el Paso 3.</p>
            )}
          </div>
        ) : (
          <p style={{ color: '#888', fontStyle: 'italic', fontSize: '13px', margin: 0 }}>Sin datos de financiación registrados.</p>
        )}
      </div>

      {/* BARRA DE ACCIONES INFERIOR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '20px 25px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <label htmlFor="folioInput" style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
            Número de hoja (folio) inicial:
          </label>
          <input
            id="folioInput"
            type="number"
            min="1"
            value={paginaInicial}
            onChange={(e) => setPaginaInicial(e.target.value)}
            style={{ width: '80px', padding: '8px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc', textAlign: 'center', fontWeight: 'bold' }}
          />
        </div>

        <button
          disabled={generandoPDF}
          onClick={handleGenerarPDFCompleto}
          style={{ padding: '12px 24px', backgroundColor: '#004080', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }}
        >
          {generandoPDF ? 'Generando PDF Multipágina...' : 'Imprimir Expediente Completo (PDF) →'}
        </button>
      </div>

    </div>
  );
};

export default InformeEvaluacion;