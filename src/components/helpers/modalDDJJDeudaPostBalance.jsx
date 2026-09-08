import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function ModalDDJJDeudaPostBalance({
  isOpen,
  onClose,
  datosCliente,
  onDocumentoGenerado
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const [tipoFirma, setTipoFirma] = useState('tipeada');
  const [firmaTipeada, setFirmaTipeada] = useState('');

  const [solicitante, setSolicitante] = useState({
    nombre: '',
    cargo: 'Socio / Representante Legal',
    empresa: '',
    cuit: '',
    domicilio: '',
    email: '',
    telefono: '',
    lugarFecha: `San Salvador de Jujuy, ${new Date().toLocaleDateString('es-AR')}`
  });

  const [deudas, setDeudas] = useState([
    { entidad: '', importe: '' }
  ]);

  useEffect(() => {
    if (datosCliente) {
      const nombreInicial = datosCliente.firmante || datosCliente.nombre || '';
      setSolicitante({
        nombre: nombreInicial,
        cargo: datosCliente.caracter || datosCliente.cargo || 'Representante Legal',
        empresa: datosCliente.razonSocial || datosCliente.nombre || '',
        cuit: datosCliente.cuit || datosCliente.dni || '',
        domicilio: datosCliente.domicilio || '',
        email: datosCliente.email || '',
        telefono: datosCliente.telefono || '',
        lugarFecha: `San Salvador de Jujuy, ${new Date().toLocaleDateString('es-AR')}`
      });
      setFirmaTipeada(nombreInicial);
    }
  }, [datosCliente, isOpen]);

  if (!isOpen) return null;

  // Lógica Canvas para Firma
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const limpiarCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleSolicitanteChange = (e) => setSolicitante({ ...solicitante, [e.target.name]: e.target.value });

  const handleDeudaChange = (index, field, value) => {
    const list = [...deudas];
    list[index][field] = value;
    setDeudas(list);
  };

  const handleAgregarDeuda = () => {
    setDeudas([...deudas, { entidad: '', importe: '' }]);
  };

  const handleEliminarDeuda = (index) => {
    if (deudas.length === 1) return;
    setDeudas(deudas.filter((_, i) => i !== index));
  };

  const calcularTotalDeuda = () => {
    return deudas.reduce((acc, curr) => acc + (parseFloat(curr.importe) || 0), 0);
  };

  const wrapText = (text, font, size, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, size);
      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const handleGenerarPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      let page = pdfDoc.addPage([595.28, 841.89]);
      let y = 800;
      const margin = 40;
      const width = 515;

      const checkNewPage = (neededSpace = 30) => {
        if (y - neededSpace < 40) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = 800;
        }
      };

      // TÍTULO
      page.drawText('DECLARACIÓN DEUDA POST BALANCE', {
        x: margin,
        y,
        size: 13,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.4)
      });
      y -= 25;

      // FECHA Y DESTINATARIO
      page.drawText(solicitante.lugarFecha, { x: margin, y, size: 9, font: fontReg });
      y -= 18;
      page.drawText('AL COMITÉ EJECUTIVO DEL', { x: margin, y, size: 9, font: fontBold });
      y -= 12;
      page.drawText('FONDO DE GARANTÍAS PÚBLICAS DE JUJUY (FOGAJUY)', { x: margin, y, size: 9, font: fontBold });
      y -= 12;
      page.drawText('S____________/____________D', { x: margin, y, size: 9, font: fontReg });
      y -= 20;

      // PARRAFO ENCABEZADO
      const textoEncabezado = `Por medio de la presente, quien suscribe, ${solicitante.nombre || '----------------------------------------'}, en mi carácter de ${solicitante.cargo || '--------------------'} de la empresa/firma ${solicitante.empresa || '----------------------------------------'}, identificada con CUIT N° ${solicitante.cuit || '------------------------'}, con domicilio legal en ${solicitante.domicilio || '----------------------------------------'}, domicilio electrónico en ${solicitante.email || '----------------------------------------'}, y número de contacto ${solicitante.telefono || '------------------------'}, me dirijo a Uds. con el fin de informar la deuda adquirida post balance:`;
      
      const lineasEncabezado = wrapText(textoEncabezado, fontReg, 9, width);
      lineasEncabezado.forEach((line) => {
        checkNewPage(13);
        page.drawText(line, { x: margin, y, size: 9, font: fontReg });
        y -= 13;
      });
      y -= 15;

      // TABLA DE DEUDAS
      checkNewPage(40);
      page.drawRectangle({ x: margin, y: y - 14, width, height: 18, color: rgb(0.9, 0.9, 0.9) });
      page.drawText('ENTIDAD', { x: margin + 10, y: y - 9, size: 8.5, font: fontBold });
      page.drawText('IMPORTE', { x: margin + 380, y: y - 9, size: 8.5, font: fontBold });
      y -= 22;

      deudas.forEach((item) => {
        checkNewPage(18);
        const importeFormatted = parseFloat(item.importe) ? `$ ${parseFloat(item.importe).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$ 0.00';
        
        page.drawText(item.entidad || '-', { x: margin + 10, y, size: 8.5, font: fontReg });
        page.drawText(importeFormatted, { x: margin + 380, y, size: 8.5, font: fontReg });
        page.drawLine({ start: { x: margin, y: y - 4 }, end: { x: margin + width, y: y - 4 }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
        y -= 16;
      });

      // FILA TOTAL DEUDA
      checkNewPage(20);
      y -= 5;
      page.drawRectangle({ x: margin, y: y - 14, width, height: 18, color: rgb(0.95, 0.95, 0.95) });
      page.drawText('TOTAL DEUDA POST BALANCE', { x: margin + 10, y: y - 9, size: 8.5, font: fontBold });
      const totalFormatted = `$ ${calcularTotalDeuda().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      page.drawText(totalFormatted, { x: margin + 380, y: y - 9, size: 9, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
      y -= 25;

      // TEXTOS LEGALES Y DECLARACIÓN JURADA
      const parrafosLegales = [
        "Declaro bajo juramento que la información y documentación presentada es fidedigna y actual, y que representa de manera veraz la situación jurídica, económica y financiera de la empresa/firma.",
        "Asimismo, reconozco que la presente solicitud no genera derechos adquiridos ni constituye aprobación alguna por parte del FOGAJUY hasta tanto el Comité Ejecutivo emita una resolución favorable.",
        "Me comprometo a suministrar en los plazos requeridos cualquier información o documentación adicional que pudiera ser requerida por el FOGAJUY para la correcta evaluación de esta solicitud.",
        "Asimismo, autorizo expresamente al FOGAJUY y a las instituciones financieras involucradas a realizar las consultas que consideren necesarias ante organismos públicos, privados o entidades financieras, a efectos de verificar la información suministrada en la presente solicitud.",
        "Sin otro particular, quedo a disposición para cualquier consulta adicional y a la espera de una pronta y favorable respuesta."
      ];

      parrafosLegales.forEach((p) => {
        const lines = wrapText(p, fontReg, 8.5, width);
        lines.forEach((l) => {
          checkNewPage(12);
          page.drawText(l, { x: margin, y, size: 8.5, font: fontReg, color: rgb(0.2, 0.2, 0.2) });
          y -= 11.5;
        });
        y -= 6;
      });
      y -= 15;

      // FIRMA Y PIE
      checkNewPage(90);
      page.drawText('Atentamente. –', { x: margin, y, size: 9, font: fontBold });
      y -= 15;

      if (tipoFirma === 'dibujada' && hasDrawn && canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const imageBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());
        const embeddedImage = await pdfDoc.embedPng(imageBytes);

        page.drawImage(embeddedImage, {
          x: margin + 20,
          y: y - 35,
          width: 130,
          height: 35
        });
      } else if (tipoFirma === 'tipeada' && firmaTipeada) {
        page.drawText(firmaTipeada, {
          x: margin + 30,
          y: y - 25,
          size: 14,
          font: fontOblique,
          color: rgb(0, 0.2, 0.6)
        });
      }

      y -= 40;
      page.drawLine({ start: { x: margin, y }, end: { x: margin + 200, y }, thickness: 1, color: rgb(0.5, 0.5, 0.5) });
      y -= 12;

      page.drawText(`Firma del solicitante`, { x: margin, y, size: 8.5, font: fontReg });
      y -= 12;
      page.drawText(`Nombre y Apellido: ${solicitante.nombre}`, { x: margin, y, size: 8.5, font: fontBold });
      y -= 12;
      page.drawText(`CUIT: ${solicitante.cuit}`, { x: margin, y, size: 8.5, font: fontReg });
      y -= 12;
      page.drawText(`Cargo: ${solicitante.cargo}`, { x: margin, y, size: 8.5, font: fontReg });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const archivoPDF = new File([blob], 'DDJJ_Deuda_Post_Balance.pdf', { type: 'application/pdf' });

      onDocumentoGenerado(8, archivoPDF);
      onClose();

    } catch (error) {
      console.error('Error al generar la DDJJ Deuda Post Balance:', error);
      alert('Error al generar el PDF de la Declaración Jurada.');
    }
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div className="modal-content" style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '92%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginTop: 0, color: '#0284c7' }}>Declaración Jurada - Deuda Post Balance (Ítem 8)</h2>

        {/* Datos Solicitante y Empresa */}
        <fieldset style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
          <legend style={{ fontWeight: 'bold', color: '#334155' }}>Datos del Solicitante y Empresa</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Nombre completo del Solicitante:</label>
              <input type="text" name="nombre" value={solicitante.nombre} onChange={handleSolicitanteChange} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Cargo o función:</label>
              <input type="text" name="cargo" value={solicitante.cargo} onChange={handleSolicitanteChange} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Nombre / Razón Social de la Firma:</label>
              <input type="text" name="empresa" value={solicitante.empresa} onChange={handleSolicitanteChange} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>CUIT de la Empresa:</label>
              <input type="text" name="cuit" value={solicitante.cuit} onChange={handleSolicitanteChange} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Domicilio Legal:</label>
              <input type="text" name="domicilio" value={solicitante.domicilio} onChange={handleSolicitanteChange} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Domicilio Electrónico (Email):</label>
              <input type="email" name="email" value={solicitante.email} onChange={handleSolicitanteChange} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Número de contacto:</label>
              <input type="text" name="telefono" value={solicitante.telefono} onChange={handleSolicitanteChange} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Lugar y Fecha:</label>
              <input type="text" name="lugarFecha" value={solicitante.lugarFecha} onChange={handleSolicitanteChange} style={{ width: '100%', padding: '6px' }} />
            </div>
          </div>
        </fieldset>

        {/* Detalle de Deudas */}
        <fieldset style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
          <legend style={{ fontWeight: 'bold', color: '#334155' }}>Deudas Adquiridas Post Balance</legend>
          {deudas.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 2fr auto', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Entidad Financiera / Acreedor"
                value={item.entidad}
                onChange={(e) => handleDeudaChange(idx, 'entidad', e.target.value)}
                style={{ padding: '6px' }}
              />
              <input
                type="number"
                placeholder="Importe ($)"
                value={item.importe}
                onChange={(e) => handleDeudaChange(idx, 'importe', e.target.value)}
                style={{ padding: '6px' }}
              />
              {deudas.length > 1 && (
                <button type="button" onClick={() => handleEliminarDeuda(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              )}
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <button type="button" onClick={handleAgregarDeuda} style={{ padding: '6px 12px', cursor: 'pointer' }}>+ Agregar Deuda</button>
            <div style={{ fontWeight: 'bold', color: '#0284c7', fontSize: '14px' }}>
              TOTAL DEUDA: $ {calcularTotalDeuda().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </fieldset>

        {/* Textos Legales / Juramento */}
        <div style={{ backgroundColor: '#f1f5f9', borderLeft: '4px solid #0284c7', padding: '10px 12px', fontSize: '11px', color: '#334155', marginBottom: '16px', borderRadius: '0 4px 4px 0' }}>
          <p style={{ margin: '0 0 4px 0' }}>• Declaro bajo juramento que la información y documentación presentada es fidedigna y actual, y que representa de manera veraz la situación jurídica, económica y financiera de la empresa/firma.</p>
          <p style={{ margin: '0 0 4px 0' }}>• Reconozco que la presente solicitud no genera derechos adquiridos ni constituye aprobación alguna por parte del FOGAJUY hasta tanto el Comité Ejecutivo emita una resolución favorable.</p>
          <p style={{ margin: 0 }}>• Autorizo expresamente al FOGAJUY y a las instituciones financieras involucradas a realizar las consultas que consideren necesarias ante organismos públicos, privados o entidades financieras.</p>
        </div>

        {/* Firma */}
        <fieldset style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
          <legend style={{ fontWeight: 'bold', color: '#334155' }}>Firma del Solicitante</legend>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', cursor: 'pointer' }}>
              <input type="radio" name="tipoFirma" value="tipeada" checked={tipoFirma === 'tipeada'} onChange={() => setTipoFirma('tipeada')} /> Tipear Firma (Texto)
            </label>
            <label style={{ fontSize: '12px', cursor: 'pointer' }}>
              <input type="radio" name="tipoFirma" value="dibujada" checked={tipoFirma === 'dibujada'} onChange={() => setTipoFirma('dibujada')} /> Dibujar Firma
            </label>
          </div>

          {tipoFirma === 'tipeada' ? (
            <input
              type="text"
              placeholder="Ingrese su nombre o firma"
              value={firmaTipeada}
              onChange={(e) => setFirmaTipeada(e.target.value)}
              style={{ width: '100%', padding: '8px', fontStyle: 'italic', fontFamily: 'serif', fontSize: '16px' }}
            />
          ) : (
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ border: '1px dashed #0284c7', borderRadius: '4px', background: '#f8fafc', display: 'inline-block' }}>
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={90}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{ cursor: 'crosshair', display: 'block' }}
                />
              </div>
              <button type="button" onClick={limpiarCanvas} style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>
                🗑️ Limpiar Trazo
              </button>
            </div>
          )}
        </fieldset>

        {/* Botones de Acción */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="button" onClick={handleGenerarPDF} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#0284c7', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
            Generar DDJJ y Adjuntar PDF
          </button>
        </div>
      </div>
    </div>
  );
}