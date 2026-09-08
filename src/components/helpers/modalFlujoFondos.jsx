import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Función para normalizar texto y evitar errores con fuentes estándar de pdf-lib
const normalizarTexto = (str) => {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N');
};

export default function ModalFlujoFondos({
  isOpen,
  onClose,
  datosCliente,
  datosGuardados,
  onDocumentoGenerado
}) {
  // Cantidad de períodos (años): de 1 a 10
  const [numPeriodos, setNumPeriodos] = useState(3);

  // Conceptos iniciales para Ingresos
  const [ingresos, setIngresos] = useState([
    { id: 'ing-1', concepto: 'VENTAS' },
    { id: 'ing-2', concepto: 'OTROS INGRESOS' }
  ]);

  // Conceptos iniciales para Egresos
  const [egresos, setEgresos] = useState([
    { id: 'egr-1', concepto: 'ENERGIA' },
    { id: 'egr-2', concepto: 'COMBUSTIBLE' },
    { id: 'egr-3', concepto: 'MATERIALES' },
    { id: 'egr-4', concepto: 'MANTENIMIENTOS' },
    { id: 'egr-5', concepto: 'MATERIA PRIMA' },
    { id: 'egr-6', concepto: 'SERVICIOS' },
    { id: 'egr-7', concepto: 'HONORARIOS' },
    { id: 'egr-8', concepto: 'ALQUILERES' },
    { id: 'egr-9', concepto: 'IMPUESTOS' },
    { id: 'egr-10', concepto: 'PRESTAMOS' }
  ]);

  // Guardamos las cadenas tal como las escribe el usuario: { [itemId]: { [pIdx]: "100" } }
  const [valores, setValores] = useState({});

  // Cargar datos previos si existen al abrir la modal
  useEffect(() => {
    if (isOpen && datosGuardados) {
      if (datosGuardados.numPeriodos) setNumPeriodos(datosGuardados.numPeriodos);
      if (datosGuardados.ingresos) setIngresos(datosGuardados.ingresos);
      if (datosGuardados.egresos) setEgresos(datosGuardados.egresos);
      if (datosGuardados.valores) setValores(datosGuardados.valores);
    }
  }, [isOpen, datosGuardados]);

  console.log("ModalFlujoFondos llamado. isOpen =", isOpen); // <--- AGREGAR ESTO

  if (!isOpen) return null;

  // Actualizar el valor manteniendo el string original en el input
  const handleMontoChange = (id, pIdx, value) => {
    setValores((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [pIdx]: value
      }
    }));
  };

  // Agregar nuevo concepto dinámico
  const handleAgregarConcepto = (tipo) => {
    const nuevoId = `${tipo}-${Date.now()}`;
    const nuevoItem = { id: nuevoId, concepto: '' };
    if (tipo === 'ing') {
      setIngresos((prev) => [...prev, nuevoItem]);
    } else {
      setEgresos((prev) => [...prev, nuevoItem]);
    }
  };

  // Modificar el nombre de un concepto
  const handleNombreConceptoChange = (tipo, id, nuevoNombre) => {
    if (tipo === 'ing') {
      setIngresos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, concepto: nuevoNombre } : item))
      );
    } else {
      setEgresos((prev) =>
        prev.map((item) => (item.id === id ? { ...item, concepto: nuevoNombre } : item))
      );
    }
  };

  // Eliminar un concepto
  const handleEliminarConcepto = (tipo, id) => {
    if (tipo === 'ing') {
      setIngresos((prev) => prev.filter((item) => item.id !== id));
    } else {
      setEgresos((prev) => prev.filter((item) => item.id !== id));
    }
    setValores((prev) => {
      const copia = { ...prev };
      delete copia[id];
      return copia;
    });
  };

  // CÁLCULOS MATEMÁTICOS (Convierte a Float de forma segura solo al calcular)
  const getValorNum = (id, pIdx) => {
    const raw = valores[id]?.[pIdx];
    const parsed = parseFloat(raw);
    return isNaN(parsed) ? 0 : parsed;
  };

  const getTotalFila = (id) => {
    let sum = 0;
    for (let p = 0; p < numPeriodos; p++) {
      sum += getValorNum(id, p);
    }
    return sum;
  };

  const getTotalSeccionPeriodo = (lista, pIdx) => {
    return lista.reduce((acc, item) => acc + getValorNum(item.id, pIdx), 0);
  };

  const getTotalSeccionGeneral = (lista) => {
    return lista.reduce((acc, item) => acc + getTotalFila(item.id), 0);
  };

  const getFlujoNetoPeriodo = (pIdx) => {
    const totalIng = getTotalSeccionPeriodo(ingresos, pIdx);
    const totalEgr = getTotalSeccionPeriodo(egresos, pIdx);
    return totalIng - totalEgr;
  };

  const getFlujoNetoTotal = () => {
    const totalIng = getTotalSeccionGeneral(ingresos);
    const totalEgr = getTotalSeccionGeneral(egresos);
    return totalIng - totalEgr;
  };

  const formatMoneda = (val) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  // GENERACIÓN DEL PDF EN MODO LANDSCAPE (HORIZONTAL)
  const handleGenerarPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([841.89, 595.28]); // A4 Horizontal
      const { width, height } = page.getSize();

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const margin = 40;
      let y = height - margin;
      const rowHeight = 16;

      // Auxiliar para salto automático si la lista de conceptos es muy larga
      const verificarSaltoPagina = () => {
        if (y - rowHeight < margin) {
          page = pdfDoc.addPage([841.89, 595.28]);
          y = height - margin;
        }
      };

      // Encabezado
      page.drawText('FOGAJUY - FLUJO DE FONDOS PROYECTADO', {
        x: margin,
        y,
        size: 14,
        font: fontBold,
        color: rgb(0.01, 0.2, 0.45)
      });
      y -= 18;

      const razonSocial = normalizarTexto(datosCliente?.razonSocial || datosCliente?.nombre || 'No especificado');
      const cuit = normalizarTexto(datosCliente?.cuit || datosCliente?.dni || 'No especificado');

      page.drawText(`Empresa / Razon Social: ${razonSocial}  |  CUIT: ${cuit}  |  Periodos Proyectados: ${numPeriodos} Anio(s)`, {
        x: margin,
        y,
        size: 9,
        font: font,
        color: rgb(0.3, 0.3, 0.3)
      });
      y -= 15;

      page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8)
      });
      y -= 20;

      // DEFINICIÓN DE ANCHOS DE COLUMNAS
      const tableWidth = width - margin * 2;
      const conceptoColWidth = 180;
      const periodosColsWidth = tableWidth - conceptoColWidth;
      const colWidth = periodosColsWidth / (numPeriodos + 1);

      // Dibujar celda
      const drawCell = (text, x, yPos, w, h, isBold = false, alignRight = false, bgColor = null, textColor = rgb(0, 0, 0)) => {
        if (bgColor) {
          page.drawRectangle({
            x,
            y: yPos - h + 3,
            width: w,
            height: h,
            color: bgColor
          });
        }
        page.drawRectangle({
          x,
          y: yPos - h + 3,
          width: w,
          height: h,
          borderColor: rgb(0.85, 0.85, 0.85),
          borderWidth: 0.5
        });

        const selectedFont = isBold ? fontBold : font;
        const fontSize = 7.5;
        const strText = normalizarTexto(String(text));
        const textWidth = selectedFont.widthOfTextAtSize(strText, fontSize);

        let xText = x + 4;
        if (alignRight) {
          xText = x + w - textWidth - 4;
        }

        page.drawText(strText, {
          x: xText,
          y: yPos - h + 7,
          size: fontSize,
          font: selectedFont,
          color: textColor
        });
      };

      // CABECERA DE LA TABLA
      let currentX = margin;
      drawCell('DETALLE / CONCEPTOS', currentX, y, conceptoColWidth, rowHeight, true, false, rgb(0.9, 0.93, 0.97));
      currentX += conceptoColWidth;

      for (let p = 0; p < numPeriodos; p++) {
        drawCell(`ANIO ${p + 1}`, currentX, y, colWidth, rowHeight, true, true, rgb(0.9, 0.93, 0.97));
        currentX += colWidth;
      }
      drawCell('TOTAL', currentX, y, colWidth, rowHeight, true, true, rgb(0.85, 0.89, 0.95));
      y -= rowHeight;

      // SECCIÓN INGRESOS
      verificarSaltoPagina();
      currentX = margin;
      drawCell('INGRESOS POR', currentX, y, tableWidth, rowHeight, true, false, rgb(0.95, 0.97, 1.0), rgb(0.01, 0.2, 0.45));
      y -= rowHeight;

      ingresos.forEach((item) => {
        verificarSaltoPagina();
        currentX = margin;
        drawCell(`  ${item.concepto || 'Sin concepto'}`, currentX, y, conceptoColWidth, rowHeight);
        currentX += conceptoColWidth;

        for (let p = 0; p < numPeriodos; p++) {
          const val = getValorNum(item.id, p);
          drawCell(formatMoneda(val), currentX, y, colWidth, rowHeight, false, true);
          currentX += colWidth;
        }

        drawCell(formatMoneda(getTotalFila(item.id)), currentX, y, colWidth, rowHeight, true, true, rgb(0.97, 0.97, 0.97));
        y -= rowHeight;
      });

      // TOTAL INGRESOS
      verificarSaltoPagina();
      currentX = margin;
      drawCell('TOTAL INGRESOS', currentX, y, conceptoColWidth, rowHeight, true, false, rgb(0.88, 0.94, 0.88));
      currentX += conceptoColWidth;

      for (let p = 0; p < numPeriodos; p++) {
        const tot = getTotalSeccionPeriodo(ingresos, p);
        drawCell(formatMoneda(tot), currentX, y, colWidth, rowHeight, true, true, rgb(0.88, 0.94, 0.88));
        currentX += colWidth;
      }
      drawCell(formatMoneda(getTotalSeccionGeneral(ingresos)), currentX, y, colWidth, rowHeight, true, true, rgb(0.8, 0.9, 0.8));
      y -= rowHeight + 5;

      // SECCIÓN EGRESOS
      verificarSaltoPagina();
      currentX = margin;
      drawCell('EGRESOS', currentX, y, tableWidth, rowHeight, true, false, rgb(1.0, 0.95, 0.95), rgb(0.6, 0.1, 0.1));
      y -= rowHeight;

      egresos.forEach((item) => {
        verificarSaltoPagina();
        currentX = margin;
        drawCell(`  ${item.concepto || 'Sin concepto'}`, currentX, y, conceptoColWidth, rowHeight);
        currentX += conceptoColWidth;

        for (let p = 0; p < numPeriodos; p++) {
          const val = getValorNum(item.id, p);
          drawCell(formatMoneda(val), currentX, y, colWidth, rowHeight, false, true);
          currentX += colWidth;
        }

        drawCell(formatMoneda(getTotalFila(item.id)), currentX, y, colWidth, rowHeight, true, true, rgb(0.97, 0.97, 0.97));
        y -= rowHeight;
      });

      // TOTAL EGRESOS
      verificarSaltoPagina();
      currentX = margin;
      drawCell('TOTAL EGRESOS', currentX, y, conceptoColWidth, rowHeight, true, false, rgb(0.98, 0.88, 0.88));
      currentX += conceptoColWidth;

      for (let p = 0; p < numPeriodos; p++) {
        const tot = getTotalSeccionPeriodo(egresos, p);
        drawCell(formatMoneda(tot), currentX, y, colWidth, rowHeight, true, true, rgb(0.98, 0.88, 0.88));
        currentX += colWidth;
      }
      drawCell(formatMoneda(getTotalSeccionGeneral(egresos)), currentX, y, colWidth, rowHeight, true, true, rgb(0.95, 0.8, 0.8));
      y -= rowHeight + 5;

      // FLUJO NETO
      verificarSaltoPagina();
      currentX = margin;
      drawCell('FLUJO NETO', currentX, y, conceptoColWidth, rowHeight, true, false, rgb(0.82, 0.91, 0.98), rgb(0.01, 0.2, 0.45));
      currentX += conceptoColWidth;

      for (let p = 0; p < numPeriodos; p++) {
        const neto = getFlujoNetoPeriodo(p);
        drawCell(formatMoneda(neto), currentX, y, colWidth, rowHeight, true, true, rgb(0.82, 0.91, 0.98));
        currentX += colWidth;
      }
      drawCell(formatMoneda(getFlujoNetoTotal()), currentX, y, colWidth, rowHeight, true, true, rgb(0.72, 0.85, 0.96));

      // Generar Blob/File y enviarlo al componente Padre
      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const archivoPDF = new File([pdfBlob], 'Flujo_de_Fondos_Proyectado.pdf', {
        type: 'application/pdf'
      });

      // Objeto con la información para recuperar la edición en el futuro
      const estadoFormulario = { numPeriodos, ingresos, egresos, valores };

      onDocumentoGenerado(15, archivoPDF, estadoFormulario);
      onClose();
    } catch (error) {
      console.error('Error al generar el Flujo de Fondos:', error);
      alert('Ocurrió un error al generar el archivo PDF.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container modal-lg">
        <header className="modal-header">
          <h3>Flujo de Fondos Proyectado</h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body">
          {/* Selector de Períodos */}
          <div className="config-periodos">
            <label htmlFor="select-periodos">
              <strong>Años a Proyectar (1 a 10): </strong>
            </label>
            <select
              id="select-periodos"
              value={numPeriodos}
              onChange={(e) => setNumPeriodos(Number(e.target.value))}
              className="select-periodos-input"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Año' : 'Años'}
                </option>
              ))}
            </select>
          </div>

          <div className="table-responsive">
            <table className="tabla-flujo">
              <thead>
                <tr>
                  <th>DETALLE</th>
                  {Array.from({ length: numPeriodos }).map((_, idx) => (
                    <th key={idx}>AÑO {idx + 1}</th>
                  ))}
                  <th>TOTAL</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {/* SECCIÓN INGRESOS */}
                <tr className="row-section-header ing-header">
                  <td colSpan={numPeriodos + 3}>INGRESOS POR</td>
                </tr>

                {ingresos.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="text"
                        value={item.concepto}
                        onChange={(e) => handleNombreConceptoChange('ing', item.id, e.target.value)}
                        placeholder="Nombre del concepto"
                        className="input-concepto"
                      />
                    </td>
                    {Array.from({ length: numPeriodos }).map((_, pIdx) => (
                      <td key={pIdx}>
                        <input
                          type="number"
                          step="any"
                          value={valores[item.id]?.[pIdx] ?? ''}
                          onChange={(e) => handleMontoChange(item.id, pIdx, e.target.value)}
                          placeholder="0,00"
                          className="input-monto"
                        />
                      </td>
                    ))}
                    <td className="monto-subtotal">${formatMoneda(getTotalFila(item.id))}</td>
                    <td>
                      <button
                        className="btn-delete-row"
                        onClick={() => handleEliminarConcepto('ing', item.id)}
                        title="Eliminar fila"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}

                <tr>
                  <td colSpan={numPeriodos + 3}>
                    <button className="btn-add-row" onClick={() => handleAgregarConcepto('ing')}>
                      + Agregar Concepto de Ingreso
                    </button>
                  </td>
                </tr>

                {/* TOTAL INGRESOS */}
                <tr className="row-total total-ingresos">
                  <td>TOTAL INGRESOS</td>
                  {Array.from({ length: numPeriodos }).map((_, pIdx) => (
                    <td key={pIdx}>${formatMoneda(getTotalSeccionPeriodo(ingresos, pIdx))}</td>
                  ))}
                  <td>${formatMoneda(getTotalSeccionGeneral(ingresos))}</td>
                  <td></td>
                </tr>

                {/* SECCIÓN EGRESOS */}
                <tr className="row-section-header egr-header">
                  <td colSpan={numPeriodos + 3}>EGRESOS</td>
                </tr>

                {egresos.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <input
                        type="text"
                        value={item.concepto}
                        onChange={(e) => handleNombreConceptoChange('egr', item.id, e.target.value)}
                        placeholder="Nombre del concepto"
                        className="input-concepto"
                      />
                    </td>
                    {Array.from({ length: numPeriodos }).map((_, pIdx) => (
                      <td key={pIdx}>
                        <input
                          type="number"
                          step="any"
                          value={valores[item.id]?.[pIdx] ?? ''}
                          onChange={(e) => handleMontoChange(item.id, pIdx, e.target.value)}
                          placeholder="0,00"
                          className="input-monto"
                        />
                      </td>
                    ))}
                    <td className="monto-subtotal">${formatMoneda(getTotalFila(item.id))}</td>
                    <td>
                      <button
                        className="btn-delete-row"
                        onClick={() => handleEliminarConcepto('egr', item.id)}
                        title="Eliminar fila"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}

                <tr>
                  <td colSpan={numPeriodos + 3}>
                    <button className="btn-add-row" onClick={() => handleAgregarConcepto('egr')}>
                      + Agregar Concepto de Egreso
                    </button>
                  </td>
                </tr>

                {/* TOTAL EGRESOS */}
                <tr className="row-total total-egresos">
                  <td>TOTAL EGRESOS</td>
                  {Array.from({ length: numPeriodos }).map((_, pIdx) => (
                    <td key={pIdx}>${formatMoneda(getTotalSeccionPeriodo(egresos, pIdx))}</td>
                  ))}
                  <td>${formatMoneda(getTotalSeccionGeneral(egresos))}</td>
                  <td></td>
                </tr>

                {/* FLUJO NETO */}
                <tr className="row-total flujo-neto">
                  <td>FLUJO NETO</td>
                  {Array.from({ length: numPeriodos }).map((_, pIdx) => (
                    <td key={pIdx}>${formatMoneda(getFlujoNetoPeriodo(pIdx))}</td>
                  ))}
                  <td>${formatMoneda(getFlujoNetoTotal())}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn-primary" onClick={handleGenerarPDF}>
            Guardar y Adjuntar Flujo en PDF (A4 Landscape)
          </button>
        </footer>
      </div>
    </div>
  );
}