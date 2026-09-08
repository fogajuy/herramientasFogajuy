import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function ModalDDJJGrupoEconomico({
  isOpen,
  onClose,
  datosCliente,
  onDocumentoGenerado
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  
  // Estado para tipo de firma: 'tipeada' o 'dibujada'
  const [tipoFirma, setTipoFirma] = useState('tipeada');
  const [firmaTipeada, setFirmaTipeada] = useState('');

  const [empresa, setEmpresa] = useState({
    nombre: '',
    cuit: '',
    domicilio: '',
    nombreGrupo: ''
  });

  const [declarante, setDeclarante] = useState({
    firmante: '',
    aclaracion: '',
    caracter: 'Representante Legal',
    lugarFecha: `San Salvador de Jujuy, ${new Date().toLocaleDateString('es-AR')}`
  });

  const [observaciones, setObservaciones] = useState('');

  const [integrantes, setIntegrantes] = useState([
    { denominacion: '', tipoId: '11', numeroId: '', vinculacion: 'Directa - Control Total', participacion: '' }
  ]);

  useEffect(() => {
    if (datosCliente) {
      const nombreInicial = datosCliente.razonSocial || datosCliente.nombre || '';
      setEmpresa({
        nombre: nombreInicial,
        cuit: datosCliente.cuit || datosCliente.dni || '',
        domicilio: datosCliente.domicilio || '',
        nombreGrupo: datosCliente.nombreGrupo || ''
      });
      setDeclarante((prev) => ({
        ...prev,
        firmante: datosCliente.firmante || nombreInicial,
        aclaracion: datosCliente.aclaracion || nombreInicial
      }));
      setFirmaTipeada(datosCliente.firmante || nombreInicial);
    }
  }, [datosCliente, isOpen]);

  if (!isOpen) return null;

  // Lógica para Canvas de Dibujo
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

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const limpiarCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleEmpresaChange = (e) => setEmpresa({ ...empresa, [e.target.name]: e.target.value });
  const handleDeclaranteChange = (e) => setDeclarante({ ...declarante, [e.target.name]: e.target.value });

  const handleIntegranteChange = (index, field, value) => {
    const list = [...integrantes];
    list[index][field] = value;
    setIntegrantes(list);
  };

  const handleAgregarIntegrante = () => {
    setIntegrantes([
      ...integrantes,
      { denominacion: '', tipoId: '11', numeroId: '', vinculacion: 'Directa - Control Total', participacion: '' }
    ]);
  };

  const handleEliminarIntegrante = (index) => {
    if (integrantes.length === 1) return;
    setIntegrantes(integrantes.filter((_, i) => i !== index));
  };

  // Ajuste de líneas de texto dentro del PDF
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
      page.drawText('DECLARACIÓN JURADA DE GRUPO ECONÓMICO', {
        x: margin,
        y,
        size: 12,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.4)
      });
      y -= 25;

      // 1. DATOS EMPRESA
      page.drawText('1. DATOS DE LA EMPRESA DECLARANTE', { x: margin, y, size: 9.5, font: fontBold });
      y -= 14;
      page.drawText(`Razón Social / Nombre: ${empresa.nombre || '----------------------------------------'}`, { x: margin + 10, y, size: 8.5, font: fontReg });
      y -= 12;
      page.drawText(`CUIT / DNI: ${empresa.cuit || '------------------------'}   |   Domicilio: ${empresa.domicilio || '----------------------------------------'}`, { x: margin + 10, y, size: 8.5, font: fontReg });
      y -= 12;
      page.drawText(`Nombre del Grupo Económico: ${empresa.nombreGrupo || '----------------------------------------'}`, { x: margin + 10, y, size: 8.5, font: fontReg });
      y -= 20;

      // 2. TABLA INTEGRANTES
      page.drawText('2. INTEGRANTES DEL GRUPO ECONÓMICO', { x: margin, y, size: 9.5, font: fontBold });
      y -= 14;

      page.drawRectangle({ x: margin, y: y - 12, width, height: 16, color: rgb(0.92, 0.92, 0.92) });
      page.drawText('Denominación / Nombre', { x: margin + 5, y: y - 8, size: 8, font: fontBold });
      page.drawText('Tipo/Nº Id.', { x: margin + 200, y: y - 8, size: 8, font: fontBold });
      page.drawText('Vinculación', { x: margin + 290, y: y - 8, size: 8, font: fontBold });
      page.drawText('% Part.', { x: margin + 460, y: y - 8, size: 8, font: fontBold });
      y -= 20;

      integrantes.forEach((item) => {
        checkNewPage(20);
        page.drawText(item.denominacion || '-', { x: margin + 5, y, size: 8, font: fontReg });
        page.drawText(`${item.tipoId}: ${item.numeroId || '-'}`, { x: margin + 200, y, size: 8, font: fontReg });
        page.drawText(item.vinculacion || '-', { x: margin + 290, y, size: 8, font: fontReg });
        page.drawText(`${item.participacion || '0'}%`, { x: margin + 460, y, size: 8, font: fontReg });
        y -= 14;
      });
      y -= 15;

      // 3. OBSERVACIONES
      checkNewPage(40);
      page.drawText('3. OBSERVACIONES:', { x: margin, y, size: 9.5, font: fontBold });
      y -= 14;
      const obsLines = wrapText(observaciones || 'Sin observaciones.', fontReg, 8, width);
      obsLines.forEach((line) => {
        checkNewPage(12);
        page.drawText(line, { x: margin + 10, y, size: 8, font: fontReg });
        y -= 12;
      });
      y -= 15;

      // 4. LEYENDA BAJO JURAMENTO
      checkNewPage(60);
      const leyendaTexto = "Declaramos bajo juramento que los datos consignados en la presente son ciertos y nos obligamos a permitir que FOGAJUY efectúe las verificaciones que estime conveniente para comprobar la exactitud de los mismos. Asimismo, nos comprometemos a comunicar a FOGAJUY cualquier modificación que se produzca en la composición del grupo económico declarado, especialmente toda nueva vinculación con otras empresas.";
      const leyendaLines = wrapText(leyendaTexto, fontReg, 8, width);

      leyendaLines.forEach((line) => {
        checkNewPage(11);
        page.drawText(line, { x: margin, y, size: 8, font: fontReg, color: rgb(0.15, 0.15, 0.15) });
        y -= 11;
      });
      y -= 20;

      // 5. FIRMA, ACLARACIÓN, CARÁCTER Y FECHA
      checkNewPage(80);
      page.drawText(`Lugar y Fecha: ${declarante.lugarFecha}`, { x: margin, y, size: 8.5, font: fontReg });

      if (tipoFirma === 'dibujada' && hasDrawn && canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const imageBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());
        const embeddedImage = await pdfDoc.embedPng(imageBytes);

        page.drawImage(embeddedImage, {
          x: margin + 40,
          y: y - 40,
          width: 130,
          height: 40
        });
      } else if (tipoFirma === 'tipeada' && firmaTipeada) {
        page.drawText(firmaTipeada, {
          x: margin + 50,
          y: y - 30,
          size: 14,
          font: fontOblique,
          color: rgb(0, 0.2, 0.6)
        });
      }

      y -= 45;
      page.drawLine({ start: { x: margin + 30, y }, end: { x: margin + 210, y }, thickness: 1, color: rgb(0.5, 0.5, 0.5) });
      page.drawLine({ start: { x: margin + 250, y }, end: { x: margin + 470, y }, thickness: 1, color: rgb(0.5, 0.5, 0.5) });
      y -= 12;

      page.drawText(`Firma del Declarante`, { x: margin + 65, y, size: 8, font: fontReg });
      page.drawText(`Aclaración: ${declarante.aclaracion || declarante.firmante}`, { x: margin + 250, y, size: 8.5, font: fontBold });
      y -= 12;
      page.drawText(`Carácter del Declarante: ${declarante.caracter}`, { x: margin + 250, y, size: 8, font: fontReg });
      y -= 25;

      // 6. INSTRUCCIONES PARA COMPLETAR EL FORMULARIO
      checkNewPage(120);
      page.drawLine({ start: { x: margin, y }, end: { x: margin + width, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
      y -= 15;

      page.drawText('INSTRUCCIONES PARA COMPLETAR EL FORMULARIO', { x: margin, y, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
      y -= 12;

      const instruccionesCompletas = [
        "Definición de Grupos o Conjuntos Económicos:",
        "“Se considera que dos o más personas físicas o jurídicas forman un conjunto y/o grupo económico cuando de hecho o de derecho, la unidad de decisión, el control patrimonial o la participación en el capital, entre otras modalidades de la estructura societaria del conjunto, revela la existencia de una relación de persona física o sociedad controlante - controlada” (Lisol I, Cap. II, Punto 1.2. y Oprac. I, Cap. I, Punto 4; del B.C.R.A.)",
        "(1) Identificación:",
        "Tipo: Se consignarán las siguientes abreviaturas según corresponda a:",
        "• 11 IG Impuesto a las Ganancias",
        "Personas físicas: (si no están inscriptas en el impuesto a las Ganancias)",
        "• 01 DNI Documento Nacional de Identidad",
        "• 02 LE Libreta de Enrolamiento (sólo si no posee DNI)",
        "• 03 LC Libreta Cívica (sólo si no posee DNI)",
        "• 04 CI Cédula de Identidad (extranjeros no nacionalizados residentes en el país)",
        "Personas Jurídicas: (si no están inscriptas en el impuesto a las Ganancias)",
        "• 12 INAC Instituto Nacional de Acción Cooperativa",
        "• 13 INAM Instituto Nacional de Acción Mutual",
        "• 66 DNRP Dirección Nacional de Recaudación Previsional (nº de cuenta)",
        "• 77 PJ Registro de Personas Jurídicas (si no están inscriptas en la Dirección General de Recaudación Previsional)",
        "• 88 Entes Estatales",
        "• 99 Personas Físicas o Jurídicas radicadas en el exterior",
        "Número: Se anotará el número correspondiente al tipo de identificación empleado, excepto para los códigos 88 y 99 en los que no deberá consignarse número.",
        "(2) Vinculación Directa / Indirecta:",
        "Se anotará el carácter de la vinculación directa o indirecta, para lo cual se tendrá en cuenta lo siguiente:",
        "Vinculación Directa:",
        "1 - Control Total:",
        "a) la controlante posee la totalidad o la mayor parte del capital de la controlada.",
        "b) la controlante y la controlada tienen directores y/o funcionarios y/o administradores comunes.",
        "c) la controlante financia significativamente a la controlada o viceversa.",
        "d) el patrimonio de la controlada es manifiestamente inadecuado para su giro económico y/o el cumplimiento de sus fines.",
        "e) la controlante se hace cargo de los gastos y/o pérdidas de la controlada o viceversa.",
        "f) la controlante no tiene actividades de importancia excepto con su controlada o viceversa.",
        "g) en la documentación de la controlada ésta es descripta como un departamento o división de la controlante, o su actividad o responsabilidades es referida a la de la controlante, y",
        "h) los directores y/o funcionarios y/o administradores de la controlada reciben instrucciones de la controlante y actúan en interés de esta última.",
        "2 - Influencia Significativa:",
        "a) la posesión de un porcentaje tal del capital de la vinculada que otorgue los votos necesarios para influir en la aprobación de sus estados contables y en la distribución de utilidades, para lo cual debe tenerse en cuenta la forma en que este distribuido el resto del capital.",
        "b) la representación en el directorio y/u órganos administrativos superiores de la vinculada, para lo cual debe tenerse en cuenta también la existencia de acuerdos circunstancias o situaciones que pudieran otorgar la dirección a algún grupo minoritario.",
        "c) la participación en la fijación de las políticas societarias.",
        "d) la existencia de operaciones importantes con la vinculada.",
        "e) el intercambio de personal directivo y",
        "f) la dependencia técnico administrativa de la vinculada.",
        "Vinculación Indirecta:",
        "1) Con sociedades y/o empresas unipersonales: Cuando las mismas son controlantes o controladas de/por empresas que tengan vinculación económica con la empresa declarante.",
        "2) Con personas: Cónyuges y parientes hasta 2º grado de consanguinidad (hijos, nietos, padres, abuelos y hermanos) o 1º de afinidad (suegros, nueras y yernos) de quien ejerza el control total o influencia significativa en las decisiones de la empresa en forma directa o a través de una sociedad.",
        "(3) Participación accionaria / societaria (%):",
        "Vinculación Directa: Se indicará el porcentaje de capital con el que participa la controlante en cada una de las empresas integrantes del grupo.",
        "Vinculación Indirecta: Se consignará la tenencia accionaria o participación de la empresa integrante del grupo que es controlante de la empresa informada. En este caso se aclara en observaciones quién es la persona física o jurídica controlante de esta empresa."
      ];

      instruccionesCompletas.forEach((p) => {
        const isHeader = p.startsWith('Definición') || p.startsWith('(1)') || p.startsWith('(2)') || p.startsWith('(3)') || p.startsWith('Vinculación') || p.startsWith('1 - Control') || p.startsWith('2 - Influencia');
        const fontSize = isHeader ? 7.5 : 7;
        const currentFont = isHeader ? fontBold : fontReg;

        const lines = wrapText(p, currentFont, fontSize, width);
        lines.forEach((l) => {
          checkNewPage(9);
          page.drawText(l, {
            x: margin + (isHeader ? 0 : 5),
            y,
            size: fontSize,
            font: currentFont,
            color: rgb(0.25, 0.25, 0.25)
          });
          y -= 8.5;
        });
        y -= 2;
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const archivoPDF = new File([blob], 'DDJJ_Grupo_Economico.pdf', { type: 'application/pdf' });

      onDocumentoGenerado(7, archivoPDF);
      onClose();

    } catch (error) {
      console.error('Error al generar la DDJJ de Grupo Económico:', error);
      alert('Error al generar el PDF de la Declaración Jurada.');
    }
  };

  return (
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div className="modal-content" style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px', width: '92%', maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h2 style={{ marginTop: 0, color: '#0284c7' }}>Declaración Jurada - Grupo Económico (Ítem 7)</h2>

        {/* 1. Datos Empresa */}
        <fieldset style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
          <legend style={{ fontWeight: 'bold', color: '#334155' }}>Datos de la Empresa Declarante</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Razón Social / Nombre:</label>
              <input type="text" name="nombre" value={empresa.nombre} onChange={handleEmpresaChange} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>CUIT / DNI:</label>
              <input type="text" name="cuit" value={empresa.cuit} onChange={handleEmpresaChange} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Domicilio Legal:</label>
              <input type="text" name="domicilio" value={empresa.domicilio} onChange={handleEmpresaChange} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Nombre del Grupo Económico:</label>
              <input type="text" name="nombreGrupo" value={empresa.nombreGrupo} onChange={handleEmpresaChange} style={{ width: '100%', padding: '6px' }} />
            </div>
          </div>
        </fieldset>

        {/* 2. Integrantes */}
        <fieldset style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
          <legend style={{ fontWeight: 'bold', color: '#334155' }}>Integrantes del Grupo Económico</legend>
          {integrantes.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
              <input type="text" placeholder="Nombre / Razón Social" value={item.denominacion} onChange={(e) => handleIntegranteChange(idx, 'denominacion', e.target.value)} style={{ padding: '6px' }} />
              <select value={item.tipoId} onChange={(e) => handleIntegranteChange(idx, 'tipoId', e.target.value)} style={{ padding: '6px' }}>
                <option value="11">11 - IG</option>
                <option value="01">01 - DNI</option>
                <option value="02">02 - LE</option>
                <option value="03">03 - LC</option>
                <option value="04">04 - CI</option>
                <option value="12">12 - INAC</option>
                <option value="13">13 - INAM</option>
                <option value="66">66 - DNRP</option>
                <option value="77">77 - PJ</option>
                <option value="88">88 - Estatal</option>
                <option value="99">99 - Exterior</option>
              </select>
              <input type="text" placeholder="Número ID" value={item.numeroId} onChange={(e) => handleIntegranteChange(idx, 'numeroId', e.target.value)} style={{ padding: '6px' }} />
              <select value={item.vinculacion} onChange={(e) => handleIntegranteChange(idx, 'vinculacion', e.target.value)} style={{ padding: '6px' }}>
                <option value="Directa - Control Total">Directa - Control Total</option>
                <option value="Directa - Influencia Signif.">Directa - Influencia Signif.</option>
                <option value="Indirecta - Sociedades">Indirecta - Sociedades</option>
                <option value="Indirecta - Personas">Indirecta - Personas</option>
              </select>
              <input type="number" placeholder="% Part." value={item.participacion} onChange={(e) => handleIntegranteChange(idx, 'participacion', e.target.value)} style={{ padding: '6px' }} />
              {integrantes.length > 1 && (
                <button type="button" onClick={() => handleEliminarIntegrante(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAgregarIntegrante} style={{ marginTop: '8px', padding: '6px 12px', cursor: 'pointer' }}>+ Agregar Integrante</button>
        </fieldset>

        {/* 3. Observaciones */}
        <fieldset style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
          <legend style={{ fontWeight: 'bold', color: '#334155' }}>Observaciones</legend>
          <textarea rows={3} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Aclaraciones..." style={{ width: '100%', padding: '6px', resize: 'vertical' }} />
        </fieldset>

        {/* 4. Leyenda bajo juramento */}
        <div style={{ backgroundColor: '#f1f5f9', borderLeft: '4px solid #0284c7', padding: '10px 12px', fontSize: '12px', color: '#334155', marginBottom: '16px', borderRadius: '0 4px 4px 0' }}>
          <strong>Declaración Jurada:</strong> Declaramos bajo juramento que los datos consignados en la presente son ciertos y nos obligamos a permitir que FOGAJUY efectúe las verificaciones que estime conveniente para comprobar la exactitud de los mismos. Asimismo, nos comprometemos a comunicar a FOGAJUY cualquier modificación que se produzca en la composición del grupo económico declarado, especialmente toda nueva vinculación con otras empresas.
        </div>

        {/* 5. Datos Declarante y Firma (Tipeada / Dibujada) */}
        <fieldset style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
          <legend style={{ fontWeight: 'bold', color: '#334155' }}>Firma y Datos del Declarante</legend>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Aclaración del Firmante:</label>
              <input type="text" name="aclaracion" value={declarante.aclaracion} onChange={handleDeclaranteChange} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Carácter del Declarante:</label>
              <input type="text" name="caracter" value={declarante.caracter} onChange={handleDeclaranteChange} style={{ width: '100%', padding: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px' }}>Lugar y Fecha:</label>
              <input type="text" name="lugarFecha" value={declarante.lugarFecha} onChange={handleDeclaranteChange} style={{ width: '100%', padding: '6px' }} />
            </div>
          </div>

          {/* Selector y Modalidad de Firma */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '6px' }}>Modalidad de Firma:</label>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', cursor: 'pointer' }}>
                <input type="radio" name="tipoFirma" value="tipeada" checked={tipoFirma === 'tipeada'} onChange={() => setTipoFirma('tipeada')} /> Tipear Firma (Texto)
              </label>
              <label style={{ fontSize: '12px', cursor: 'pointer' }}>
                <input type="radio" name="tipoFirma" value="dibujada" checked={tipoFirma === 'dibujada'} onChange={() => setTipoFirma('dibujada')} /> Dibujar Firma
              </label>
            </div>

            {tipoFirma === 'tipeada' ? (
              <div>
                <input
                  type="text"
                  placeholder="Ingrese su firma o nombre completo"
                  value={firmaTipeada}
                  onChange={(e) => setFirmaTipeada(e.target.value)}
                  style={{ width: '100%', padding: '8px', fontStyle: 'italic', fontFamily: 'serif', fontSize: '16px' }}
                />
              </div>
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
          </div>
        </fieldset>

        {/* 6. Lectura de Instrucciones del Formulario */}
        <details style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '6px', fontSize: '11px', color: '#475569' }}>
          <summary style={{ fontWeight: 'bold', cursor: 'pointer', color: '#0284c7' }}>📄 Ver Instrucciones Completas para Completar el Formulario (Texto BCRA)</summary>
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            <p><strong>Definición de Grupos Económicos:</strong> “Se considera que dos o más personas físicas o jurídicas forman un conjunto y/o grupo económico cuando de hecho o de derecho, la unidad de decisión, el control patrimonial o la participación en el capital...”</p>
            <p><strong>(1) Identificación:</strong> 11 Impuesto a las Ganancias | Personas Físicas: 01 DNI, 02 LE, 03 LC, 04 CI | Personas Jurídicas: 12 INAC, 13 INAM, 66 DNRP, 77 PJ, 88 Entes Estatales, 99 Exterior.</p>
            <p><strong>(2) Vinculación Directa / Indirecta:</strong> Control Total (puntos a-h) e Influencia Significativa (puntos a-f).</p>
            <p><strong>(3) Participación:</strong> Porcentajes directos e indirectos correspondientes.</p>
          </div>
        </details>

        {/* Botones de acción */}
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