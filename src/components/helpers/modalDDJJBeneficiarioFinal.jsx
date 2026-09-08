import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function ModalDDJJBeneficiarioFinal({
  isOpen,
  onClose,
  datosCliente,
  datosGuardados,
  onDocumentoGenerado
}) {
  const [formData, setFormData] = useState({
    razonSocial: '',
    cuitEntidad: '',
    domicilioEntidad: '',
    nombreFirmante: '',
    cargoFirmante: '',
    domicilioFirmante: '',
    dniFirmante: '',
    lugarFecha: 'San Salvador de Jujuy, ' + new Date().toLocaleDateString('es-AR')
  });

  const [integrantes, setIntegrantes] = useState([
    { nombre: '', documento: '', domicilio: '', nacionalidad: '', cargo: '', fechaDesignacion: '' }
  ]);

  const [beneficiarios, setBeneficiarios] = useState([
    { nombre: '', dni: '', cuit: '', domicilio: '', nacionalidad: '', profesion: '', estadoCivil: '', participacion: '' }
  ]);

  // --- ESTADOS PARA LA FIRMA ---
  const [tipoFirma, setTipoFirma] = useState('dibujo'); // 'dibujo' | 'tipeada'
  const [firmaTipeada, setFirmaTipeada] = useState('');
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (datosGuardados) {
      setFormData(datosGuardados.formData || formData);
      setIntegrantes(datosGuardados.integrantes || integrantes);
      setBeneficiarios(datosGuardados.beneficiarios || beneficiarios);
      if (datosGuardados.tipoFirma) setTipoFirma(datosGuardados.tipoFirma);
      if (datosGuardados.firmaTipeada) setFirmaTipeada(datosGuardados.firmaTipeada);
    } else if (datosCliente) {
      const nombreInicial = datosCliente.representanteLegal || datosCliente.nombre || '';
      setFormData((prev) => ({
        ...prev,
        razonSocial: datosCliente.razonSocial || datosCliente.nombre || '',
        cuitEntidad: datosCliente.cuit || '',
        domicilioEntidad: datosCliente.domicilio || '',
        nombreFirmante: nombreInicial,
        cuitFirmante: datosCliente.cuitFirmante || '',
        dniFirmante: datosCliente.dniFirmante || ''
      }));
      setFirmaTipeada(nombreInicial);
    }
  }, [datosCliente, datosGuardados, isOpen]);

  if (!isOpen) return null;

  // Manejadores del Canvas (Dibujo)
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Sincronizar firma tipeada por defecto si el usuario edita el nombre y no ha tipeado algo personalizado
    if (name === 'nombreFirmante' && tipoFirma === 'tipeada' && !firmaTipeada) {
      setFirmaTipeada(value);
    }
  };

  const handleIntegranteChange = (index, e) => {
    const { name, value } = e.target;
    const copia = [...integrantes];
    copia[index][name] = value;
    setIntegrantes(copia);
  };

  const agregarIntegrante = () => {
    setIntegrantes([...integrantes, { nombre: '', documento: '', domicilio: '', nacionalidad: '', cargo: '', fechaDesignacion: '' }]);
  };

  const eliminarIntegrante = (index) => {
    setIntegrantes(integrantes.filter((_, i) => i !== index));
  };

  const handleBeneficiarioChange = (index, e) => {
    const { name, value } = e.target;
    const copia = [...beneficiarios];
    copia[index][name] = value;
    setBeneficiarios(copia);
  };

  const agregarBeneficiario = () => {
    setBeneficiarios([...beneficiarios, { nombre: '', dni: '', cuit: '', domicilio: '', nacionalidad: '', profesion: '', estadoCivil: '', participacion: '' }]);
  };

  const eliminarBeneficiario = (index) => {
    setBeneficiarios(beneficiarios.filter((_, i) => i !== index));
  };

  // Generación de DataURL para firma tipeada
  const generarDataUrlFirmaTipeada = (texto) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 120;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'italic 32px "Caveat", "Dancing Script", "Brush Script MT", cursive';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texto || formData.nombreFirmante || 'Firma', 200, 60);

    return canvas.toDataURL('image/png');
  };

  const handleGenerarPDF = async () => {
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage([595.28, 841.89]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let y = 800;

      const verificarSaltoPagina = (requerido = 40) => {
        if (y - requerido < 50) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = 800;
        }
      };

      // Encabezado
      page.drawText('DECLARACIÓN JURADA - BENEFICIARIO FINAL Y NÓMINA DE INTEGRANTES', { x: 50, y, size: 11, font: fontBold, color: rgb(0.1, 0.2, 0.4) });
      y -= 15;
      page.drawText('Art. 21 bis Ley N° 25.246 y Resolución UIF N° 112/2021', { x: 50, y, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
      y -= 20;

      // Datos entidad
      page.drawText(`RAZÓN SOCIAL: ${formData.razonSocial || '------------------'}`, { x: 50, y, size: 9, font: fontBold });
      page.drawText(`CUIT: ${formData.cuitEntidad || '------------------'}`, { x: 380, y, size: 9, font: fontBold });
      y -= 14;
      page.drawText(`DOMICILIO LEGAL: ${formData.domicilioEntidad || '------------------'}`, { x: 50, y, size: 9, font });
      y -= 20;

      const introText = `Yo, ${formData.nombreFirmante || '....................'}, en mi carácter de ${formData.cargoFirmante || '....................'} de la entidad mencionada, con domicilio en ${formData.domicilioFirmante || '....................'}, declaro bajo juramento que la nómina completa y actualizada de integrantes de la persona jurídica es la siguiente:`;
      page.drawText(introText.substring(0, 110), { x: 50, y, size: 8.5, font });
      y -= 12;
      page.drawText(introText.substring(110), { x: 50, y, size: 8.5, font });
      y -= 20;

      // Tabla 1: Integrantes
      page.drawText('1. NÓMINA DE INTEGRANTES DE LA PERSONA JURÍDICA', { x: 50, y, size: 9, font: fontBold });
      y -= 15;
      page.drawRectangle({ x: 50, y: y - 2, width: 495, height: 16, color: rgb(0.9, 0.9, 0.9) });
      page.drawText('Nombre / Apellido / Razón Social', { x: 55, y, size: 7.5, font: fontBold });
      page.drawText('Doc / CUIT', { x: 190, y, size: 7.5, font: fontBold });
      page.drawText('Domicilio', { x: 260, y, size: 7.5, font: fontBold });
      page.drawText('Nacionalidad', { x: 360, y, size: 7.5, font: fontBold });
      page.drawText('Cargo', { x: 425, y, size: 7.5, font: fontBold });
      page.drawText('Designación', { x: 485, y, size: 7.5, font: fontBold });
      y -= 15;

      integrantes.forEach((item) => {
        verificarSaltoPagina(20);
        page.drawText((item.nombre || '-').substring(0, 25), { x: 55, y, size: 7.5, font });
        page.drawText((item.documento || '-').substring(0, 15), { x: 190, y, size: 7.5, font });
        page.drawText((item.domicilio || '-').substring(0, 18), { x: 260, y, size: 7.5, font });
        page.drawText((item.nacionalidad || '-').substring(0, 12), { x: 360, y, size: 7.5, font });
        page.drawText((item.cargo || '-').substring(0, 12), { x: 425, y, size: 7.5, font });
        page.drawText((item.fechaDesignacion || '-').substring(0, 10), { x: 485, y, size: 7.5, font });
        y -= 14;
      });

      y -= 15;
      verificarSaltoPagina(60);
      page.drawText('Declaro asimismo que los datos consignados son veraces y completos...', { x: 50, y, size: 7.5, font });
      y -= 25;

      // Tabla 2: Beneficiarios Finales
      page.drawText('2. DECLARACIÓN JURADA SOBRE BENEFICIARIO FINAL (Resolución UIF N° 112/2021)', { x: 50, y, size: 9, font: fontBold });
      y -= 12;
      const textoUIF = 'En cumplimiento con lo dispuesto por la UNIDAD DE INFORMACIÓN FINANCIERA (UIF), por la presente informo con carácter de Declaración Jurada...';
      page.drawText(textoUIF.substring(0, 115), { x: 50, y, size: 7.5, font });
      y -= 10;
      page.drawText(textoUIF.substring(115), { x: 50, y, size: 7.5, font });
      y -= 15;

      page.drawRectangle({ x: 50, y: y - 2, width: 495, height: 16, color: rgb(0.9, 0.9, 0.9) });
      page.drawText('Nombre y Apellido', { x: 55, y, size: 7.5, font: fontBold });
      page.drawText('DNI/CUIT', { x: 175, y, size: 7.5, font: fontBold });
      page.drawText('Domicilio', { x: 245, y, size: 7.5, font: fontBold });
      page.drawText('Nación.', { x: 340, y, size: 7.5, font: fontBold });
      page.drawText('Profesión', { x: 390, y, size: 7.5, font: fontBold });
      page.drawText('Est. Civil', { x: 450, y, size: 7.5, font: fontBold });
      page.drawText('Part.(%)', { x: 500, y, size: 7.5, font: fontBold });
      y -= 15;

      beneficiarios.forEach((ben) => {
        verificarSaltoPagina(20);
        page.drawText((ben.nombre || '-').substring(0, 22), { x: 55, y, size: 7.5, font });
        page.drawText((ben.cuit || ben.dni || '-').substring(0, 13), { x: 175, y, size: 7.5, font });
        page.drawText((ben.domicilio || '-').substring(0, 17), { x: 245, y, size: 7.5, font });
        page.drawText((ben.nacionalidad || '-').substring(0, 10), { x: 340, y, size: 7.5, font });
        page.drawText((ben.profesion || '-').substring(0, 12), { x: 390, y, size: 7.5, font });
        page.drawText((ben.estadoCivil || '-').substring(0, 10), { x: 450, y, size: 7.5, font });
        page.drawText(`${ben.participacion || '0'}%`, { x: 500, y, size: 7.5, font });
        y -= 14;
      });

      verificarSaltoPagina(100);

      // ESTAMPA DE FIRMA (DIBUJADA O TIPEADA)
      let signatureDataUrl = null;

      if (tipoFirma === 'dibujo' && hasSignature && canvasRef.current) {
        signatureDataUrl = canvasRef.current.toDataURL('image/png');
      } else if (tipoFirma === 'tipeada' && (firmaTipeada || formData.nombreFirmante)) {
        signatureDataUrl = generarDataUrlFirmaTipeada(firmaTipeada || formData.nombreFirmante);
      }

      if (signatureDataUrl) {
        const signatureImageBytes = await fetch(signatureDataUrl).then((res) => res.arrayBuffer());
        const signatureImage = await pdfDoc.embedPng(signatureImageBytes);
        page.drawImage(signatureImage, {
          x: 350,
          y: Math.max(y - 50, 80),
          width: 140,
          height: 45
        });
      }

      y = Math.max(y - 60, 60);
      page.drawLine({ start: { x: 330, y }, end: { x: 520, y }, thickness: 1, color: rgb(0, 0, 0) });
      y -= 12;
      page.drawText('Firma del Representante Legal', { x: 350, y, size: 8, font: fontBold });
      y -= 12;
      page.drawText(`Aclaración: ${formData.nombreFirmante || ''}`, { x: 330, y, size: 8, font });
      y -= 12;
      page.drawText(`DNI: ${formData.dniFirmante || ''}`, { x: 330, y, size: 8, font });

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const archivoPDF = new File([pdfBlob], 'DDJJ_Beneficiario_Final.pdf', { type: 'application/pdf' });

      const estadoParaGuardar = { formData, integrantes, beneficiarios, tipoFirma, firmaTipeada };

      if (typeof onDocumentoGenerado === 'function') {
        onDocumentoGenerado(archivoPDF, estadoParaGuardar);
      }

      onClose();
    } catch (err) {
      console.error('Error al generar DDJJ Beneficiario Final:', err);
      alert('Error al generar la Declaración Jurada. Por favor, reintente.');
    }
  };

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content" style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Declaración Jurada - Beneficiario Final (Res. UIF 112/2021)</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>

        <div style={{ overflowY: 'auto', maxHeight: '65vh', paddingRight: '10px' }}>
          {/* SECCIÓN DATOS ENTIDAD Y FIRMANTE */}
          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>Datos de la Entidad y Declarante</legend>
            <div style={grid2Col}>
              <div>
                <label style={labelStyle}>Razón Social:</label>
                <input type="text" name="razonSocial" value={formData.razonSocial} onChange={handleChangeForm} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>CUIT Entidad:</label>
                <input type="text" name="cuitEntidad" value={formData.cuitEntidad} onChange={handleChangeForm} style={inputStyle} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Domicilio Legal:</label>
                <input type="text" name="domicilioEntidad" value={formData.domicilioEntidad} onChange={handleChangeForm} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Nombre y Apellido del Firmante:</label>
                <input type="text" name="nombreFirmante" value={formData.nombreFirmante} onChange={handleChangeForm} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Cargo (Ej: Presidente / Apoderado):</label>
                <input type="text" name="cargoFirmante" value={formData.cargoFirmante} onChange={handleChangeForm} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>DNI Firmante:</label>
                <input type="text" name="dniFirmante" value={formData.dniFirmante} onChange={handleChangeForm} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Domicilio Firmante:</label>
                <input type="text" name="domicilioFirmante" value={formData.domicilioFirmante} onChange={handleChangeForm} style={inputStyle} />
              </div>
            </div>
          </fieldset>

          {/* SECCIÓN 1: INTEGRANTES */}
          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>1. Nómina de Integrantes de la Persona Jurídica</legend>
            {integrantes.map((item, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.85rem' }}>Integrante #{idx + 1}</strong>
                  {integrantes.length > 1 && (
                    <button type="button" onClick={() => eliminarIntegrante(idx)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Eliminar</button>
                  )}
                </div>
                <div style={grid3Col}>
                  <input type="text" name="nombre" placeholder="Nombre / Razón Social" value={item.nombre} onChange={(e) => handleIntegranteChange(idx, e)} style={inputStyle} />
                  <input type="text" name="documento" placeholder="DNI / CUIT" value={item.documento} onChange={(e) => handleIntegranteChange(idx, e)} style={inputStyle} />
                  <input type="text" name="domicilio" placeholder="Domicilio" value={item.domicilio} onChange={(e) => handleIntegranteChange(idx, e)} style={inputStyle} />
                  <input type="text" name="nacionalidad" placeholder="Nacionalidad" value={item.nacionalidad} onChange={(e) => handleIntegranteChange(idx, e)} style={inputStyle} />
                  <input type="text" name="cargo" placeholder="Cargo" value={item.cargo} onChange={(e) => handleIntegranteChange(idx, e)} style={inputStyle} />
                  <input type="text" name="fechaDesignacion" placeholder="Fecha Designación" value={item.fechaDesignacion} onChange={(e) => handleIntegranteChange(idx, e)} style={inputStyle} />
                </div>
              </div>
            ))}
            <button type="button" onClick={agregarIntegrante} style={btnSecondaryStyle}>+ Agregar Integrante</button>
          </fieldset>

          {/* SECCIÓN 2: BENEFICIARIOS FINALES */}
          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>2. Beneficiarios Finales</legend>
            {beneficiarios.map((ben, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '0.85rem' }}>Beneficiario Final #{idx + 1}</strong>
                  {beneficiarios.length > 1 && (
                    <button type="button" onClick={() => eliminarBeneficiario(idx)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Eliminar</button>
                  )}
                </div>
                <div style={grid4Col}>
                  <input type="text" name="nombre" placeholder="Nombre y Apellido" value={ben.nombre} onChange={(e) => handleBeneficiarioChange(idx, e)} style={inputStyle} />
                  <input type="text" name="cuit" placeholder="DNI / CUIT" value={ben.cuit} onChange={(e) => handleBeneficiarioChange(idx, e)} style={inputStyle} />
                  <input type="text" name="domicilio" placeholder="Domicilio" value={ben.domicilio} onChange={(e) => handleBeneficiarioChange(idx, e)} style={inputStyle} />
                  <input type="text" name="nacionalidad" placeholder="Nacionalidad" value={ben.nacionalidad} onChange={(e) => handleBeneficiarioChange(idx, e)} style={inputStyle} />
                  <input type="text" name="profesion" placeholder="Profesión" value={ben.profesion} onChange={(e) => handleBeneficiarioChange(idx, e)} style={inputStyle} />
                  <input type="text" name="estadoCivil" placeholder="Estado Civil" value={ben.estadoCivil} onChange={(e) => handleBeneficiarioChange(idx, e)} style={inputStyle} />
                  <input type="number" name="participacion" placeholder="% Participación" value={ben.participacion} onChange={(e) => handleBeneficiarioChange(idx, e)} style={inputStyle} />
                </div>
              </div>
            ))}
            <button type="button" onClick={agregarBeneficiario} style={btnSecondaryStyle}>+ Agregar Beneficiario Final</button>
          </fieldset>

          {/* SECCIÓN 3: FIRMA DIGITAL */}
          <fieldset style={fieldsetStyle}>
            <legend style={legendStyle}>Firma Digital</legend>
            
            {/* TAB / SELECTOR DE MÓDULO */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setTipoFirma('dibujo')}
                style={{
                  ...btnTabStyle,
                  borderBottom: tipoFirma === 'dibujo' ? '2px solid #0284c7' : '2px solid transparent',
                  color: tipoFirma === 'dibujo' ? '#0284c7' : '#64748b',
                  fontWeight: tipoFirma === 'dibujo' ? 'bold' : 'normal'
                }}
              >
                ✏️ Dibujar Firma
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipoFirma('tipeada');
                  if (!firmaTipeada) setFirmaTipeada(formData.nombreFirmante);
                }}
                style={{
                  ...btnTabStyle,
                  borderBottom: tipoFirma === 'tipeada' ? '2px solid #0284c7' : '2px solid transparent',
                  color: tipoFirma === 'tipeada' ? '#0284c7' : '#64748b',
                  fontWeight: tipoFirma === 'tipeada' ? 'bold' : 'normal'
                }}
              >
                ⌨️ Tipear Firma
              </button>
            </div>

            {/* VISTA 1: CANVAS DIBUJO */}
            {tipoFirma === 'dibujo' && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={120}
                  style={{ border: '1px dashed #64748b', borderRadius: '4px', background: '#fff', cursor: 'crosshair' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <button type="button" onClick={limpiarFirma} style={{ ...btnCancelStyle, padding: '4px 10px', fontSize: '0.75rem' }}>Limpiar Firma</button>
              </div>
            )}

            {/* VISTA 2: FIRMA TIPEADA */}
            {tipoFirma === 'tipeada' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={labelStyle}>Escriba su firma (Aparecerá en manuscrita):</label>
                <input
                  type="text"
                  value={firmaTipeada}
                  onChange={(e) => setFirmaTipeada(e.target.value)}
                  placeholder="Ingrese su nombre para la firma..."
                  style={inputStyle}
                />
                <div style={{ marginTop: '8px', padding: '15px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '6px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Vista previa de la firma:</span>
                  <span style={{ fontFamily: '"Caveat", "Dancing Script", "Brush Script MT", cursive', fontSize: '2rem', color: '#0f172a' }}>
                    {firmaTipeada || formData.nombreFirmante || 'Su Firma Aquí'}
                  </span>
                </div>
              </div>
            )}
          </fieldset>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
          <button type="button" onClick={onClose} style={btnCancelStyle}>Cancelar</button>
          <button type="button" onClick={handleGenerarPDF} style={btnPrimaryStyle}>Generar y Adjuntar DDJJ (PDF)</button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalContentStyle = { background: '#fff', padding: '20px', borderRadius: '10px', width: '90%', maxWidth: '850px', maxHeight: '90vh', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const fieldsetStyle = { border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '15px' };
const legendStyle = { fontWeight: 'bold', fontSize: '0.85rem', color: '#0369a1', padding: '0 5px' };
const labelStyle = { display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#475569', marginBottom: '3px' };
const inputStyle = { width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.8rem', boxSizing: 'border-box' };
const grid2Col = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' };
const grid3Col = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' };
const grid4Col = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' };
const closeBtnStyle = { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' };
const btnPrimaryStyle = { background: '#0284c7', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const btnSecondaryStyle = { background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' };
const btnCancelStyle = { background: '#f1f5f9', color: '#475569', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' };
const btnTabStyle = { background: 'none', border: 'none', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem' };