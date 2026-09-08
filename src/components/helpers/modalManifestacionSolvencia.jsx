import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function ModalManifestacionSolvencia({
  isOpen,
  onClose,
  datosCliente,
  datosGuardados,
  onDocumentoGenerado
}) {
  const [formData, setFormData] = useState({
    nombreSolicitante: '',
    dniSolicitante: '',
    cuitSolicitante: '',
    estadoCivil: 'soltero',
    nombreConyuge: '',
    dniConyuge: '',
    lugarFecha: 'San Salvador de Jujuy, ' + new Date().toLocaleDateString('es-AR')
  });

  // Estructura de Activos
  const [activos, setActivos] = useState({
    inmuebles: [{ descripcion: '', valor: '', renta: '' }],
    muebles: [{ descripcion: '', valor: '', renta: '' }],
    disponibilidades: [{ descripcion: '', valor: '', renta: '' }],
    participaciones: [{ descripcion: '', valor: '', renta: '' }],
    otrosBienes: [{ descripcion: '', valor: '', renta: '' }]
  });

  // Estructura de Pasivos
  const [pasivos, setPasivos] = useState({
    comerciales: [{ descripcion: '', enJuicio: false, valor: '', renta: '' }],
    fiscales: [{ descripcion: '', enJuicio: false, valor: '', renta: '' }],
    otrasDeudas: [{ descripcion: '', enJuicio: false, valor: '', renta: '' }]
  });

  const canvasRefSolicitante = useRef(null);
  const canvasRefConyuge = useRef(null);
  const [isDrawingSol, setIsDrawingSol] = useState(false);
  const [hasSignatureSol, setHasSignatureSol] = useState(false);
  const [isDrawingCon, setIsDrawingCon] = useState(false);
  const [hasSignatureCon, setHasSignatureCon] = useState(false);

  useEffect(() => {
    if (datosGuardados) {
      setFormData(datosGuardados.formData || formData);
      setActivos(datosGuardados.activos || activos);
      setPasivos(datosGuardados.pasivos || pasivos);
    } else if (datosCliente) {
      setFormData((prev) => ({
        ...prev,
        nombreSolicitante: datosCliente.nombre || datosCliente.razonSocial || '',
        dniSolicitante: datosCliente.dni || datosCliente.dniFirmante || '',
        cuitSolicitante: datosCliente.cuit || '',
        estadoCivil: datosCliente.estadoCivil || 'soltero'
      }));
    }
  }, [datosCliente, datosGuardados, isOpen]);

  if (!isOpen) return null;

  // Calculadores de totales
  const sumarLista = (lista) => lista.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
  
  const totalActivo = 
    sumarLista(activos.inmuebles) +
    sumarLista(activos.muebles) +
    sumarLista(activos.disponibilidades) +
    sumarLista(activos.participaciones) +
    sumarLista(activos.otrosBienes);

  const totalPasivo = 
    sumarLista(pasivos.comerciales) +
    sumarLista(pasivos.fiscales) +
    sumarLista(pasivos.otrasDeudas);

  const patrimonioNeto = totalActivo - totalPasivo;

  // Manejo de Arrays Dinámicos
  const handleArrayChange = (categoria, subcat, index, field, value) => {
    if (categoria === 'activos') {
      const copia = [...activos[subcat]];
      copia[index][field] = value;
      setActivos({ ...activos, [subcat]: copia });
    } else {
      const copia = [...pasivos[subcat]];
      copia[index][field] = value;
      setPasivos({ ...pasivos, [subcat]: copia });
    }
  };

  const agregarFila = (categoria, subcat) => {
    if (categoria === 'activos') {
      setActivos({ ...activos, [subcat]: [...activos[subcat], { descripcion: '', valor: '', renta: '' }] });
    } else {
      setPasivos({ ...pasivos, [subcat]: [...pasivos[subcat], { descripcion: '', enJuicio: false, valor: '', renta: '' }] });
    }
  };

  const eliminarFila = (categoria, subcat, index) => {
    if (categoria === 'activos') {
      setActivos({ ...activos, [subcat]: activos[subcat].filter((_, i) => i !== index) });
    } else {
      setPasivos({ ...pasivos, [subcat]: pasivos[subcat].filter((_, i) => i !== index) });
    }
  };

  // Trazo de Firmas
  const setupCanvas = (ref, setIsDrawing, setHasSignature) => ({
    start: (e) => {
      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      setIsDrawing(true);
      setHasSignature(true);
    },
    draw: (e, isDrawing) => {
      if (!isDrawing) return;
      const canvas = ref.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    },
    stop: (setIsDrawing) => setIsDrawing(false),
    clear: (setHasSignature) => {
      const canvas = ref.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSignature(false);
    }
  });

  const solDraw = setupCanvas(canvasRefSolicitante, setIsDrawingSol, setHasSignatureSol);
  const conDraw = setupCanvas(canvasRefConyuge, setIsDrawingCon, setHasSignatureCon);

  const handleGenerarPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595.28, 841.89]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let y = 800;

      const verificarSalto = (requerido = 30) => {
        if (y - requerido < 40) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = 800;
        }
      };

      // Título
      page.drawText('MANIFESTACIÓN DE SOLVENCIA PATRIMONIAL BAJO DECLARACIÓN JURADA', { x: 45, y, size: 10, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
      y -= 15;
      page.drawText(`Solicitante: ${formData.nombreSolicitante} | DNI/CUIT: ${formData.dniSolicitante || formData.cuitSolicitante}`, { x: 45, y, size: 8, font });
      y -= 18;

      // Header Tabla
      const renderHeaderTabla = () => {
        page.drawRectangle({ x: 45, y: y - 2, width: 505, height: 14, color: rgb(0.9, 0.9, 0.9) });
        page.drawText('RUBRO', { x: 50, y, size: 8, font: fontBold });
        page.drawText('VALOR ACTUAL', { x: 370, y, size: 8, font: fontBold });
        page.drawText('RENTA ANUAL', { x: 470, y, size: 8, font: fontBold });
        y -= 14;
      };

      renderHeaderTabla();

      const renderSeccionActivo = (titulo, items) => {
        verificarSalto(20);
        page.drawText(titulo, { x: 50, y, size: 8, font: fontBold });
        y -= 12;
        items.forEach((item) => {
          verificarSalto(14);
          page.drawText((item.descripcion || '-').substring(0, 55), { x: 60, y, size: 7.5, font });
          page.drawText(`$ ${(parseFloat(item.valor) || 0).toLocaleString('es-AR')}`, { x: 370, y, size: 7.5, font });
          page.drawText(`$ ${(parseFloat(item.renta) || 0).toLocaleString('es-AR')}`, { x: 470, y, size: 7.5, font });
          y -= 12;
        });
      };

      page.drawText('ACTIVO: Bienes, Disponibilidades y Participación', { x: 45, y, size: 8.5, font: fontBold });
      y -= 14;

      renderSeccionActivo('A. Bienes Inmuebles', activos.inmuebles);
      renderSeccionActivo('Bienes Muebles', activos.muebles);
      renderSeccionActivo('B. Disponibilidades', activos.disponibilidades);
      renderSeccionActivo('C. Participación en Empresas', activos.participaciones);
      renderSeccionActivo('D. Otros Bienes y Créditos a cobrar', activos.otrosBienes);

      // Total Activo
      verificarSalto(20);
      page.drawRectangle({ x: 45, y: y - 2, width: 505, height: 14, color: rgb(0.85, 0.92, 1) });
      page.drawText('I - TOTAL DEL ACTIVO (A + B + C + D)', { x: 50, y, size: 8, font: fontBold });
      page.drawText(`$ ${totalActivo.toLocaleString('es-AR')}`, { x: 370, y, size: 8, font: fontBold });
      y -= 20;

      // Pasivos
      page.drawText('II. PASIVO: Deudas y Gravámenes', { x: 45, y, size: 8.5, font: fontBold });
      y -= 14;

      const renderSeccionPasivo = (titulo, items) => {
        verificarSalto(20);
        page.drawText(titulo, { x: 50, y, size: 8, font: fontBold });
        y -= 12;
        items.forEach((item) => {
          verificarSalto(14);
          const txtJuicio = item.enJuicio ? ' [EN JUICIO]' : '';
          page.drawText(`${(item.descripcion || '-').substring(0, 48)}${txtJuicio}`, { x: 60, y, size: 7.5, font });
          page.drawText(`$ ${(parseFloat(item.valor) || 0).toLocaleString('es-AR')}`, { x: 370, y, size: 7.5, font });
          page.drawText(`$ ${(parseFloat(item.renta) || 0).toLocaleString('es-AR')}`, { x: 470, y, size: 7.5, font });
          y -= 12;
        });
      };

      renderSeccionPasivo('Deudas Comerciales', pasivos.comerciales);
      renderSeccionPasivo('Deudas Fiscales, Previsionales y Laborales', pasivos.fiscales);
      renderSeccionPasivo('Otras Deudas', pasivos.otrasDeudas);

      // Total Pasivo y Patrimonio Neto
      verificarSalto(35);
      page.drawRectangle({ x: 45, y: y - 2, width: 505, height: 14, color: rgb(0.95, 0.88, 0.88) });
      page.drawText('II - TOTAL DEL PASIVO', { x: 50, y, size: 8, font: fontBold });
      page.drawText(`$ ${totalPasivo.toLocaleString('es-AR')}`, { x: 370, y, size: 8, font: fontBold });
      y -= 18;

      page.drawRectangle({ x: 45, y: y - 2, width: 505, height: 16, color: rgb(0.8, 0.9, 0.8) });
      page.drawText('III - PATRIMONIO NETO = (I - II)', { x: 50, y, size: 8.5, font: fontBold });
      page.drawText(`$ ${patrimonioNeto.toLocaleString('es-AR')}`, { x: 370, y, size: 8.5, font: fontBold });
      y -= 35;

      // Firmas
      verificarSalto(80);
      if (hasSignatureSol && canvasRefSolicitante.current) {
        const solImgBytes = await fetch(canvasRefSolicitante.current.toDataURL('image/png')).then(r => r.arrayBuffer());
        const solImg = await pdfDoc.embedPng(solImgBytes);
        page.drawImage(solImg, { x: 70, y: y, width: 120, height: 40 });
      }

      if (hasSignatureCon && canvasRefConyuge.current && formData.estadoCivil === 'casado') {
        const conImgBytes = await fetch(canvasRefConyuge.current.toDataURL('image/png')).then(r => r.arrayBuffer());
        const conImg = await pdfDoc.embedPng(conImgBytes);
        page.drawImage(conImg, { x: 350, y: y, width: 120, height: 40 });
      }

      y -= 10;
      page.drawLine({ start: { x: 60, y }, end: { x: 220, y }, thickness: 1, color: rgb(0, 0, 0) });
      if (formData.estadoCivil === 'casado') {
        page.drawLine({ start: { x: 340, y }, end: { x: 500, y }, thickness: 1, color: rgb(0, 0, 0) });
      }
      y -= 12;
      page.drawText('Firma del Solicitante', { x: 95, y, size: 8, font: fontBold });
      if (formData.estadoCivil === 'casado') {
        page.drawText('Firma del Cónyuge', { x: 380, y, size: 8, font: fontBold });
      }

      // Guía de Llenado en Segunda Página / Nueva Sección
      page = pdfDoc.addPage([595.28, 841.89]);
      y = 800;

      page.drawText('MANIFESTACIÓN DE SOLVENCIA PATRIMONIAL - GUÍA PARA SU LLENADO', { x: 45, y, size: 10, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
      y -= 18;

      const guiaTextos = [
        { t: 'ACTIVO:', b: true },
        { t: 'A) BIENES:', b: true },
        { t: 'INMUEBLES: Comprende todo tipo de bienes raíces (casa habitación, terrenos baldíos, fincas - urbanas, suburbanas o rurales) - sean de pleno dominio o en condominio (indicar %), o en propiedad horizontal (indicar coeficiente sobre bienes comunes).', b: false },
        { t: 'MUEBLES: Comprende todo tipo de bienes susceptibles de adquirir valor, factibles de ser gravados en prenda o afectados a la actividad, tales como rodados, maquinarias, equipos, instalaciones, etc.', b: false },
        { t: 'B) DISPONIBILIDADES: Comprende tenencias de efectivo, depósitos en entidades bancarias/financieras o propiedad de títulos valores, acciones, etc.', b: false },
        { t: 'C) PARTICIPACIÓN EN EMPRESAS: Comprende toda participación en sociedades, compañías, comercios, empresas de cualquier tipo (indicar %).', b: false },
        { t: 'D) OTROS BIENES: Comprende todo tipo de bienes no declarados anteriormente (semovientes, objetos de arte, joyas, etc.). Indicar patente, matrícula, dominio o registro correspondiente.', b: false },
        { t: '', b: false },
        { t: 'PASIVO:', b: true },
        { t: 'A) DEUDAS COMERCIALES: Comprende todas las deudas del giro normal de los negocios (Proveedores, Acreedores Varios, etc.).', b: false },
        { t: 'B) DEUDAS FISCALES, PREVISIONALES Y LABORALES: Comprende deudas por tributos nacionales, provinciales y municipales, de la seguridad social y laborales.', b: false },
        { t: 'C) OTRAS DEUDAS: Comprende deudas bancarias, pendientes a la fecha, y todo tipo de gravámenes (Prenda e Hipoteca) que garanticen deudas propias o de terceros.', b: false },
        { t: '', b: false },
        { t: 'EN CASO DE SER CASADO/A, EL CÓNYUGE DEBE TAMBIÉN RUBRICAR LA MANIFESTACIÓN JURADA.', b: true }
      ];

      guiaTextos.forEach((item) => {
        if (!item.t) {
          y -= 8;
          return;
        }
        page.drawText(item.t.substring(0, 110), { x: 45, y, size: 7.5, font: item.b ? fontBold : font });
        y -= 11;
        if (item.t.length > 110) {
          page.drawText(item.t.substring(110), { x: 45, y, size: 7.5, font: item.b ? fontBold : font });
          y -= 11;
        }
      });

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const archivoPDF = new File([pdfBlob], 'Manifestacion_Solvencia_Patrimonial.pdf', { type: 'application/pdf' });

      const estadoParaGuardar = { formData, activos, pasivos };

      if (typeof onDocumentoGenerado === 'function') {
        onDocumentoGenerado(archivoPDF, estadoParaGuardar);
      }

      onClose();
    } catch (err) {
      console.error('Error al generar Manifestación de Solvencia:', err);
      alert('Error al generar la Manifestación de Solvencia Patrimonial.');
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>29. Manifestación de Solvencia Patrimonial</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '68vh', paddingRight: '10px' }}>
          {/* DATOS DEL SOLICITANTE */}
          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>Datos Generales</legend>
            <div style={grid2Col}>
              <div>
                <label style={labelStyle}>Solicitante:</label>
                <input type="text" value={formData.nombreSolicitante} onChange={(e) => setFormData({ ...formData, nombreSolicitante: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>DNI / CUIT:</label>
                <input type="text" value={formData.dniSolicitante} onChange={(e) => setFormData({ ...formData, dniSolicitante: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Estado Civil:</label>
                <select value={formData.estadoCivil} onChange={(e) => setFormData({ ...formData, estadoCivil: e.target.value })} style={inputStyle}>
                  <option value="soltero">Soltero/a</option>
                  <option value="casado">Casado/a</option>
                  <option value="divorciado">Divorciado/a</option>
                  <option value="viudo">Viudo/a</option>
                </select>
              </div>
              {formData.estadoCivil === 'casado' && (
                <div>
                  <label style={labelStyle}>Nombre Cónyuge:</label>
                  <input type="text" value={formData.nombreConyuge} onChange={(e) => setFormData({ ...formData, nombreConyuge: e.target.value })} style={inputStyle} />
                </div>
              )}
            </div>
          </fieldset>

          {/* SECCIÓN ACTIVOS */}
          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>I. ACTIVO: Bienes, Disponibilidades y Participación</legend>
            {Object.keys(activos).map((subcat) => (
              <div key={subcat} style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#0369a1', textTransform: 'capitalize' }}>
                  {subcat.replace(/([A-Z])/g, ' $1')}
                </strong>
                {activos[subcat].map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '6px', marginTop: '4px' }}>
                    <input type="text" placeholder="Descripción bien/disponibilidad" value={item.descripcion} onChange={(e) => handleArrayChange('activos', subcat, idx, 'descripcion', e.target.value)} style={inputStyle} />
                    <input type="number" placeholder="Valor Actual ($)" value={item.valor} onChange={(e) => handleArrayChange('activos', subcat, idx, 'valor', e.target.value)} style={inputStyle} />
                    <input type="number" placeholder="Renta Anual ($)" value={item.renta} onChange={(e) => handleArrayChange('activos', subcat, idx, 'renta', e.target.value)} style={inputStyle} />
                    {activos[subcat].length > 1 && (
                      <button type="button" onClick={() => eliminarFila('activos', subcat, idx)} style={btnDeleteStyle}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => agregarFila('activos', subcat)} style={btnSecondaryStyle}>+ Agregar en {subcat}</button>
              </div>
            ))}
            <div style={totalBoxStyle}>
              TOTAL ACTIVO: $ {totalActivo.toLocaleString('es-AR')}
            </div>
          </fieldset>

          {/* SECCIÓN PASIVOS */}
          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>II. PASIVO: Deudas y Gravámenes</legend>
            {Object.keys(pasivos).map((subcat) => (
              <div key={subcat} style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '0.8rem', color: '#b91c1c', textTransform: 'capitalize' }}>
                  {subcat.replace(/([A-Z])/g, ' $1')}
                </strong>
                {pasivos[subcat].map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr auto 1fr 1fr auto', gap: '6px', marginTop: '4px', alignItems: 'center' }}>
                    <input type="text" placeholder="Descripción de la deuda" value={item.descripcion} onChange={(e) => handleArrayChange('pasivos', subcat, idx, 'descripcion', e.target.value)} style={inputStyle} />
                    <label style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <input type="checkbox" checked={item.enJuicio} onChange={(e) => handleArrayChange('pasivos', subcat, idx, 'enJuicio', e.target.checked)} /> Juicio
                    </label>
                    <input type="number" placeholder="Valor Actual ($)" value={item.valor} onChange={(e) => handleArrayChange('pasivos', subcat, idx, 'valor', e.target.value)} style={inputStyle} />
                    <input type="number" placeholder="Renta Anual ($)" value={item.renta} onChange={(e) => handleArrayChange('pasivos', subcat, idx, 'renta', e.target.value)} style={inputStyle} />
                    {pasivos[subcat].length > 1 && (
                      <button type="button" onClick={() => eliminarFila('pasivos', subcat, idx)} style={btnDeleteStyle}>✕</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => agregarFila('pasivos', subcat)} style={btnSecondaryStyle}>+ Agregar en {subcat}</button>
              </div>
            ))}
            <div style={{ ...totalBoxStyle, background: '#fee2e2', color: '#991b1b' }}>
              TOTAL PASIVO: $ {totalPasivo.toLocaleString('es-AR')}
            </div>
          </fieldset>

          {/* RESUMEN PATRIMONIAL */}
          <div style={{ ...totalBoxStyle, background: '#dcfce7', color: '#166534', fontSize: '1rem', marginTop: '10px' }}>
            III. PATRIMONIO NETO (ACTIVO - PASIVO): $ {patrimonioNeto.toLocaleString('es-AR')}
          </div>

          {/* FIRMAS */}
          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>Firmas</legend>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <div>
                <span style={labelStyle}>Firma Solicitante:</span>
                <canvas
                  ref={canvasRefSolicitante}
                  width={240}
                  height={90}
                  style={canvasStyle}
                  onMouseDown={(e) => solDraw.start(e)}
                  onMouseMove={(e) => solDraw.draw(e, isDrawingSol)}
                  onMouseUp={() => solDraw.stop(setIsDrawingSol)}
                  onMouseLeave={() => solDraw.stop(setIsDrawingSol)}
                />
                <button type="button" onClick={() => solDraw.clear(setHasSignatureSol)} style={btnMiniStyle}>Limpiar</button>
              </div>

              {formData.estadoCivil === 'casado' && (
                <div>
                  <span style={labelStyle}>Firma Cónyuge:</span>
                  <canvas
                    ref={canvasRefConyuge}
                    width={240}
                    height={90}
                    style={canvasStyle}
                    onMouseDown={(e) => conDraw.start(e)}
                    onMouseMove={(e) => conDraw.draw(e, isDrawingCon)}
                    onMouseUp={() => conDraw.stop(setIsDrawingCon)}
                    onMouseLeave={() => conDraw.stop(setIsDrawingCon)}
                  />
                  <button type="button" onClick={() => conDraw.clear(setHasSignatureCon)} style={btnMiniStyle}>Limpiar</button>
                </div>
              )}
            </div>
          </fieldset>
        </div>

        {/* ACCIONES */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
          <button type="button" onClick={onClose} style={btnCancelStyle}>Cancelar</button>
          <button type="button" onClick={handleGenerarPDF} style={btnPrimaryStyle}>Generar y Adjuntar (PDF)</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: '#fff', padding: '20px', borderRadius: '10px', width: '90%', maxWidth: '850px', maxHeight: '90vh', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const fieldsetStyle = { border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '12px' };
const legendStyle = { fontWeight: 'bold', fontSize: '0.85rem', color: '#0369a1', padding: '0 5px' };
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '3px' };
const inputStyle = { width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' };
const grid2Col = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' };
const closeBtnStyle = { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' };
const btnPrimaryStyle = { background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const btnSecondaryStyle = { background: '#f1f5f9', color: '#0369a1', border: 'none', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.75rem', marginTop: '4px' };
const btnCancelStyle = { background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' };
const btnDeleteStyle = { background: 'none', border: 'none', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer' };
const btnMiniStyle = { display: 'block', marginTop: '4px', background: '#f1f5f9', border: 'none', padding: '2px 6px', fontSize: '0.7rem', borderRadius: '3px', cursor: 'pointer' };
const totalBoxStyle = { padding: '8px', background: '#e0f2fe', color: '#0369a1', fontWeight: 'bold', borderRadius: '6px', fontSize: '0.85rem', textAlign: 'right', marginTop: '8px' };
const canvasStyle = { border: '1px dashed #64748b', borderRadius: '4px', background: '#fff', cursor: 'crosshair' };