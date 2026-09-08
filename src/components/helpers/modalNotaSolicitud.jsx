import React, { useState, useRef, useEffect } from 'react';

const REQUISITOS_TABLA = [
  "FECHA Y NUMERO DE INSCRIPCION ANTE IGJ",
  "FOTOCOPIA ESTATUTO (CERTIFICADA Y LEGALIZADA)",
  "FOTOCOPIA CONTRATO SOCIAL Y SUS MODIFCIACIONES (CERTIFICADA Y LEGALIZADA)",
  "FOTOCOPIA DE ACTA DE DESIGNACION DIRECTORIO (CERTIFICADA Y LEGALIZADA)",
  "FOTOCOPIA DE PODER OTORGADO AL REPRESENTANTE LEGAL (CERTIFICADA Y LEGALIZADA)",
  "FOTOCOPIA DE ACTA AUTORIZANDO TRÁMITE ANTE FOGAJUY, FIRMA DE CONVENIO Y CONFORMACIÓN DE CONTRAGARANTÍAS (CERTIFICADA Y LEGALIZADA)",
  "DDJJ GRUPO ECONOMICO",
  "DDJJ INGRESOS Y DEUDAS POST BALANCES",
  "CONSTANCIA AFIP",
  "CONSTANCIA RENTAS",
  "CONSTANCIA REGULARIZACION FISCAL RENTAS",
  "DDJJ IIBB/CONVENIO (ÚLTIMOS 12)",
  "DDJJ GCIA (ÚLTIMOS 2)",
  "DDJJ ACCIONES/BIENES (ÚLTIMOS 2)",
  "FLUJO FONDOS (IGUAL O SUPERIOR A LA VIDA DEL CRÉDITO)",
  "INFORMACIÓN ADICIONAL (PLANOS, FOTOS, PRESUPUESTOS, ETC)",
  "NOMINA DE INTEGRANTES ORGANO DE ADMINISTRACION O EQUIVALENTE",
  "NOMINA DE ACCIONISTAS Y PORCENTAJE DE PARTICIPACIÓN",
  "FOTOCOPIA DNI FIRMANTE Y ACCIONISTAS",
  "DDJJ PEP FIRMANTE Y ACCIONISTAS",
  "2 ULTIMOS EECC E INFORME DE AUDITOR (CERTIFICADOS POR COLEGIO DE CONTADORES)",
  "DDJJ IIBB/CONVENIO (ÚLTIMOS 12)",
  "DDJJ GCIA (ÚLTIMOS 2)",
  "VERAZ - NOSIS - OTROS EMPRESA",
  "VERAZ - NOSIS - OTROS FIADOR/ES",
  "LIBRE DEUDA PREVISIONAL",
  "FIADOR/ES SOLIDARIO/S (DNI, CONSTANCIA DE CUIT, PEP)",
  "CONTRAGARANTÍA (EN CASO DE HIPOTECA ADJUNTA CÉDULA PARCELARIA, BOLETO DE COMPRA VENTA, TASACIÓN. EN CASO DE PRENDA ADJUNTAR TÍTULO, INFORME DE DOMINIO Y TASACIÓN. PARA LOS RESTANTES TIPOS SU VALOR NOMINAL O DE MERCADO EL MENOR)"
];

export default function ModalNotaSolicitud({ isOpen, onClose, datosCliente, onDocumentoGenerado }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const [modoFirma, setModoFirma] = useState('dibujar');
  const [textoFirma, setTextoFirma] = useState('');

  const [checklistValues, setChecklistValues] = useState(
    REQUISITOS_TABLA.reduce((acc, _, idx) => ({ ...acc, [idx]: 'N/A' }), {})
  );

  const [formData, setFormData] = useState({
    solicitanteNombre: '',
    cargo: '',
    empresaNombre: '',
    cuit: '',
    domicilioLegal: '',
    domicilioElectronico: '',
    telefono: '',
    entidadFinanciera: '',
    montoAval: '',
    mesesCredito: '',
    mesesGracia: '',
    observaciones: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        solicitanteNombre: datosCliente?.representanteLegal || datosCliente?.nombre || '',
        cargo: datosCliente?.cargo || 'Representante Legal',
        empresaNombre: datosCliente?.razonSocial || datosCliente?.nombre || '',
        cuit: datosCliente?.cuit || '',
        domicilioLegal: datosCliente?.domicilio || '',
        domicilioElectronico: datosCliente?.email || '',
        telefono: datosCliente?.telefono || '',
        entidadFinanciera: datosCliente?.entidadFinanciera || '',
        montoAval: datosCliente?.montoSolicitado || '',
        mesesCredito: datosCliente?.mesesCredito || '',
        mesesGracia: datosCliente?.mesesGracia || '',
        observaciones: ''
      });
      setTextoFirma(datosCliente?.representanteLegal || datosCliente?.nombre || '');
      setTimeout(() => {
        limpiarFirma();
      }, 100);
    }
  }, [isOpen, datosCliente]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChecklistChange = (idx, valor) => {
    setChecklistValues((prev) => ({ ...prev, [idx]: valor }));
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const obtenerImagenFirmaTexto = (texto) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 400;
    tempCanvas.height = 100;
    const ctx = tempCanvas.getContext('2d');
    ctx.font = '32px "Brush Script MT", cursive, sans-serif';
    ctx.fillStyle = '#0a2540';
    ctx.fillText(texto, 20, 60);
    return tempCanvas.toDataURL('image/png');
  };

  const handleGenerarPDF = async () => {
    if (!formData.solicitanteNombre || !formData.empresaNombre || !formData.cuit) {
      alert('Por favor, complete los campos obligatorios (Nombre, Empresa y CUIT).');
      return;
    }

    if (modoFirma === 'dibujar' && !hasSignature) {
      alert('Por favor, dibuje su firma antes de continuar.');
      return;
    }

    if (modoFirma === 'texto' && !textoFirma.trim()) {
      alert('Por favor, ingrese el nombre para la firma aclarada.');
      return;
    }

    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

      let firmaPngBase64 = '';
      if (modoFirma === 'dibujar') {
        firmaPngBase64 = canvasRef.current.toDataURL('image/png');
      } else {
        firmaPngBase64 = obtenerImagenFirmaTexto(textoFirma);
      }

      const pdfDoc = await PDFDocument.create();
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      let page = pdfDoc.addPage([595.28, 841.89]);
      let y = 780;
      const marginX = 50;
      const printWidth = 495.28; // Ancho efectivo del texto

      // Título
      page.drawText('NOTA DE SOLICITUD DE GARANTÍA PREFERIDA DEL FOGAJUY', {
        x: marginX, y, size: 12, font: fontBold, color: rgb(0, 0, 0)
      });
      y -= 30;

      // Fecha
      const hoy = new Date();
      const textoFecha = `San Salvador de Jujuy, ${hoy.getDate()} de ${hoy.toLocaleString('es-AR', { month: 'long' })} de ${hoy.getFullYear()}`;
      page.drawText(textoFecha, { x: 280, y, size: 12, font: fontRegular });
      y -= 35;

      // Destinatario
      page.drawText('AL COMITÉ EJECUTIVO DEL FONDO DE GARANTÍAS PÚBLICAS DE JUJUY (FOGAJUY)', { x: marginX, y, size: 11, font: fontBold });
      y -= 16;
      page.drawText('S____________/____________D', { x: marginX, y, size: 11, font: fontBold });
      y -= 30;

      // Párrafo principal
      const p1 = `Por medio de la presente, quien suscribe, ${formData.solicitanteNombre}, en mi carácter de ${formData.cargo} de la empresa/firma ${formData.empresaNombre}, identificada con CUIT N° ${formData.cuit}, con domicilio legal en ${formData.domicilioLegal || '___________'} y domicilio electrónico en ${formData.domicilioElectronico || '___________'}, y número de contacto ${formData.telefono || '___________'}, me dirijo a Uds. con el fin de solicitar el otorgamiento de la Garantía Preferida del FOGAJUY para acceder a asistencia financiera en la siguiente institución:`;
      
      y = drawJustifiedParagraph(page, p1, marginX, y, printWidth, 12, fontRegular, pdfDoc, (newPage) => { page = newPage; });
      y -= 10;

      // Bullets
      const bullets = [
        `•  Nombre de la entidad financiera: ${formData.entidadFinanciera || '___________'}`,
        `•  Monto de aval a solicitar: $ ${formData.montoAval || '___________'}`,
        `•  Meses del crédito: ${formData.mesesCredito || '___________'}`,
        `•  Meses de gracia: ${formData.mesesGracia || '___________'}`
      ];

      bullets.forEach((bullet) => {
        page.drawText(bullet, { x: marginX + 10, y, size: 12, font: fontRegular });
        y -= 18;
      });
      y -= 10;

      page.drawText('Con el propósito de calificar para la garantía solicitada, adjunto la siguiente documentación:', { x: marginX, y, size: 12, font: fontRegular });
      y -= 25;

      // Tabla CHECKLIST
      page.drawRectangle({ x: marginX, y: y - 5, width: printWidth, height: 20, color: rgb(0.9, 0.9, 0.9) });
      page.drawText('CHECK LIST EMPRESAS - REQUISITOS', { x: marginX + 5, y, size: 11, font: fontBold });
      page.drawText('RESPUESTA', { x: marginX + 410, y, size: 11, font: fontBold });
      y -= 22;

      REQUISITOS_TABLA.forEach((req, idx) => {
        if (y < 60) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = 780;
        }

        page.drawRectangle({ x: marginX, y: y - 4, width: printWidth, height: 16, borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 0.5 });
        const numStr = `${idx + 1}`;
        const descTruncated = req.length > 70 ? req.substring(0, 67) + '...' : req;
        const valorSeleccionado = checklistValues[idx] || 'SI';

        let colorTexto = rgb(0, 0.4, 0);
        if (valorSeleccionado === 'NO') colorTexto = rgb(0.7, 0, 0);
        if (valorSeleccionado === 'N/A') colorTexto = rgb(0.4, 0.4, 0.4);

        page.drawText(`${numStr}`, { x: marginX + 5, y, size: 9, font: fontBold });
        page.drawText(descTruncated, { x: marginX + 25, y, size: 8.5, font: fontRegular });
        page.drawText(`[ ${valorSeleccionado} ]`, { x: marginX + 420, y, size: 9, font: fontBold, color: colorTexto });
        
        y -= 16;
      });

      // OBSERVACIONES
      if (y < 130) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 780;
      }

      y -= 10;
      page.drawRectangle({ x: marginX, y: y - 35, width: printWidth, height: 40, borderColor: rgb(0.7, 0.7, 0.7), borderWidth: 0.5 });
      page.drawText('OBSERVACIONES:', { x: marginX + 5, y: y - 2, size: 10, font: fontBold });
      const obsTexto = formData.observaciones || 'Sin observaciones adicionales.';
      const lineasObs = wrapText(obsTexto, fontOblique, 10, printWidth - 10);
      let yObs = y - 16;
      lineasObs.slice(0, 2).forEach((l) => {
        page.drawText(l, { x: marginX + 5, y: yObs, size: 10, font: fontOblique, color: rgb(0.3, 0.3, 0.3) });
        yObs -= 12;
      });
      y -= 50;

      // NOTAS LEGALES AL PIE DE TABLA
      page.drawText('* Solo legalizar en caso que la jurisdicción donde se origina sea fuera de la provincia de Jujuy.', { x: marginX, y, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
      y -= 14;
      page.drawText('* Solo certificar copia en caso de no mostrar los originales en las oficinas comerciales de FOGAJUY.', { x: marginX, y, size: 9, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
      y -= 25;

      // PÁRRAFOS LEGALES JUSTIFICADOS
      const parrafosLegales = [
        "Declaro bajo juramento que la información y documentación presentada es fidedigna y actual, y que representa de manera veraz la situación jurídica, económica y financiera de la empresa/firma.",
        "Asimismo, reconozco que la presente solicitud no genera derechos adquiridos ni constituye aprobación alguna por parte del FOGAJUY hasta tanto el Comité Ejecutivo emita una resolución favorable.",
        "Me comprometo a suministrar en los plazos requeridos cualquier información o documentación adicional que pudiera ser requerida por el FOGAJUY para la correcta evaluación de esta solicitud.",
        "Asimismo, autorizo expresamente al FOGAJUY y a las instituciones financieras involucradas a realizar las consultas que consideren necesarias ante organismos públicos, privados o entidades financieras, a efectos de verificar la información suministrada en la presente solicitud.",
        "Sin otro particular, quedo a disposición para cualquier consulta adicional y a la espera de una pronta y favorable respuesta.",
        "Atentamente. –"
      ];

      for (const p of parrafosLegales) {
        y = drawJustifiedParagraph(page, p, marginX, y, printWidth, 12, fontRegular, pdfDoc, (newPage) => { page = newPage; });
        y -= 8;
      }

      if (y < 160) {
        page = pdfDoc.addPage([595.28, 841.89]);
        y = 780;
      }

      y -= 20;

      // FIRMA Y DATOS DEL SOLICITANTE
      const firmaImageBytes = await fetch(firmaPngBase64).then((res) => res.arrayBuffer());
      const firmaImage = await pdfDoc.embedPng(firmaImageBytes);

      page.drawImage(firmaImage, { x: marginX, y: y, width: 150, height: 50 });
      y -= 12;
      page.drawText('Firma del solicitante: ____________________________', { x: marginX, y, size: 12, font: fontBold });
      y -= 16;
      page.drawText(`Nombre y Apellido: ${formData.solicitanteNombre}`, { x: marginX, y, size: 12, font: fontRegular });
      y -= 15;
      page.drawText(`CUIT: ${formData.cuit}`, { x: marginX, y, size: 12, font: fontRegular });
      y -= 15;
      page.drawText(`Cargo: ${formData.cargo}`, { x: marginX, y, size: 12, font: fontRegular });

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      
      const archivoPDF = new File([pdfBlob], '00_Nota_de_Solicitud_FOGAJUY.pdf', {
        type: 'application/pdf'
      });

      if (onDocumentoGenerado) {
        onDocumentoGenerado(0, archivoPDF);
      }

      onClose();
    } catch (error) {
      console.error('Error al generar la nota PDF:', error);
      alert('Error al generar el documento PDF.');
    }
  };

  // Función para envolver texto calculando ancho exacto por fuente
  const wrapText = (text, font, fontSize, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  // Función para dibujar texto JUSTIFICADO línea por línea
  const drawJustifiedParagraph = (page, text, x, y, maxWidth, fontSize, font, pdfDoc, onNewPage) => {
    const lines = wrapText(text, font, fontSize, maxWidth);
    let currentY = y;

    lines.forEach((line, index) => {
      if (currentY < 60) {
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        onNewPage(newPage);
        page = newPage;
        currentY = 780;
      }

      const isLastLine = index === lines.length - 1;
      const words = line.split(' ');

      if (isLastLine || words.length === 1) {
        page.drawText(line, { x, y: currentY, size: fontSize, font });
      } else {
        const totalWordWidth = words.reduce((acc, w) => acc + font.widthOfTextAtSize(w, fontSize), 0);
        const totalSpace = maxWidth - totalWordWidth;
        const spacing = totalSpace / (words.length - 1);

        let currentX = x;
        words.forEach((word) => {
          page.drawText(word, { x: currentX, y: currentY, size: fontSize, font });
          currentX += font.widthOfTextAtSize(word, fontSize) + spacing;
        });
      }

      currentY -= fontSize * 1.35; // Espaciado interlineal
    });

    return currentY;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '95%', maxWidth: '700px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>Nota de Solicitud de Garantía FOGAJUY</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Complete la información, seleccione la documentación adjunta y firme la solicitud.</p>

        {/* CAMPOS FORMULARIO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Nombre Completo Solicitante *</label>
            <input type="text" name="solicitanteNombre" value={formData.solicitanteNombre} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Cargo / Función *</label>
            <input type="text" name="cargo" value={formData.cargo} onChange={handleChange} placeholder="Ej: Socio Gerente / Apoderado" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Nombre Empresa / Firma *</label>
            <input type="text" name="empresaNombre" value={formData.empresaNombre} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>CUIT Empresa *</label>
            <input type="text" name="cuit" value={formData.cuit} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Domicilio Legal</label>
            <input type="text" name="domicilioLegal" value={formData.domicilioLegal} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Email / Dom. Electrónico</label>
            <input type="email" name="domicilioElectronico" value={formData.domicilioElectronico} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Teléfono de Contacto</label>
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Entidad Financiera</label>
            <input type="text" name="entidadFinanciera" value={formData.entidadFinanciera} onChange={handleChange} placeholder="Ej: Banco Macro" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Monto de Aval ($)</label>
            <input type="number" name="montoAval" value={formData.montoAval} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Meses Crédito</label>
              <input type="number" name="mesesCredito" value={formData.mesesCredito} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Meses Gracia</label>
              <input type="number" name="mesesGracia" value={formData.mesesGracia} onChange={handleChange} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* CHECKLIST */}
        <h4 style={{ margin: '12px 0 6px 0', fontSize: '0.85rem', color: '#0f172a' }}>Checklist de Documentación Requerida</h4>
        <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px', marginBottom: '14px', backgroundColor: '#f8fafc' }}>
          {REQUISITOS_TABLA.map((req, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: idx < REQUISITOS_TABLA.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
              <span style={{ fontSize: '0.75rem', color: '#334155', paddingRight: '10px' }}>
                <strong>{idx + 1}.</strong> {req}
              </span>
              <select
                value={checklistValues[idx] || 'SI'}
                onChange={(e) => handleChecklistChange(idx, e.target.value)}
                style={{ padding: '2px 4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 'bold' }}
              >
                <option value="SI">SI</option>
                <option value="NO">NO</option>
                <option value="N/A">N/A</option>
              </select>
            </div>
          ))}
        </div>

        {/* OBSERVACIONES */}
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Observaciones Generales</label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            placeholder="Escriba aquí aclaraciones adicionales si las hubiera..."
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* FIRMA Y OPCIONES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Firma del Solicitante *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setModoFirma('dibujar')}
              style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: modoFirma === 'dibujar' ? '#0284c7' : '#fff', color: modoFirma === 'dibujar' ? '#fff' : '#334155', cursor: 'pointer' }}
            >
              ✍️ Trazo manual
            </button>
            <button
              type="button"
              onClick={() => setModoFirma('texto')}
              style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: modoFirma === 'texto' ? '#0284c7' : '#fff', color: modoFirma === 'texto' ? '#fff' : '#334155', cursor: 'pointer' }}
            >
              🔤 Escribir nombre
            </button>
          </div>
        </div>

        {modoFirma === 'dibujar' ? (
          <div>
            <div style={{ border: '2px dashed #cbd5e1', borderRadius: '8px', marginBottom: '4px', backgroundColor: '#fafafa' }}>
              <canvas
                ref={canvasRef}
                width={550}
                height={110}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ width: '100%', height: '110px', cursor: 'crosshair', display: 'block' }}
              />
            </div>
            <button type="button" onClick={limpiarFirma} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', marginBottom: '16px' }}>
              🗑 Limpiar Firma
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              value={textoFirma}
              onChange={(e) => setTextoFirma(e.target.value)}
              placeholder="Escriba su Nombre y Apellido completo..."
              style={{ ...inputStyle, fontFamily: 'cursive', fontSize: '1.2rem', fontStyle: 'italic', padding: '10px' }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
            Cancelar
          </button>
          <button type="button" onClick={handleGenerarPDF} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
            Generar Nota Oficial PDF
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: '0.78rem',
  fontWeight: 'bold',
  color: '#334155'
};

const inputStyle = {
  width: '100%',
  padding: '6px 8px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  marginTop: '2px',
  boxSizing: 'border-box',
  fontSize: '0.85rem'
};