import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function ModalDDJJLicitudFondos({ isOpen, onClose, datosCliente, onDocumentoGenerado }) {
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [residenciaFiscal, setResidenciaFiscal] = useState('Argentina');
  const [esUSPerson, setEsUSPerson] = useState('NO');

  // Tipo de Firma: 'dibujo' o 'tipeada'
  const [tipoFirma, setTipoFirma] = useState('dibujo');
  const [firmaTipeada, setFirmaTipeada] = useState('');
  
  // Ref para Canvas nativo HTML5
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Cargar datos preexistentes del cliente si están disponibles
  useEffect(() => {
    if (datosCliente) {
      if (datosCliente.razonSocial) setNombre(datosCliente.razonSocial);
      if (datosCliente.cuit) setDni(datosCliente.cuit);
      if (datosCliente.domicilioLegal) setDomicilio(datosCliente.domicilioLegal);
    }
  }, [datosCliente, isOpen]);

  if (!isOpen) return null;

  // Eventos del Canvas Nativo
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

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
  };

  const limpiarTextoPDF = (str) => {
    if (!str) return '';
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/g, "n")
      .replace(/Ñ/g, "N")
      .replace(/[º°]/g, ".")
      .replace(/[“”"']/g, '"');
  };

  const splitText = (text, maxLength = 85) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    words.forEach(word => {
      if ((currentLine + word).length > maxLength) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine += word + ' ';
      }
    });
    if (currentLine) lines.push(currentLine.trim());
    return lines;
  };

  const handleGenerarPDF = async (e) => {
    if (e) e.preventDefault();

    if (!nombre.trim() || !dni.trim() || !domicilio.trim() || !residenciaFiscal.trim()) {
      alert('Por favor, completá los campos obligatorios (Nombre, DNI, Domicilio y Residencia Fiscal).');
      return;
    }

    const tieneFirmaDibujada = tipoFirma === 'dibujo' && hasSignature;
    const tieneFirmaTipeada = tipoFirma === 'tipeada' && firmaTipeada.trim().length > 0;

    if (!tieneFirmaDibujada && !tieneFirmaTipeada) {
      alert('Por favor, ingresá o dibujá la firma antes de generar la declaración.');
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const page = pdfDoc.addPage([595.28, 841.89]);
      let y = 790;

      page.drawText('DECLARACION JURADA DE LICITUD Y ORIGEN DE FONDOS', {
        x: 80, y, size: 12, font: fontBold, color: rgb(0, 0, 0)
      });
      y -= 16;
      page.drawText('Y DECLARACION JURADA OCDE-CRS / FATCA', {
        x: 135, y, size: 11, font: fontBold, color: rgb(0, 0, 0)
      });
      y -= 30;

      const textoPresentacion = limpiarTextoPDF(
        `Yo, ${nombre.toUpperCase()}, DNI/CUIT N. ${dni}, con domicilio en ${domicilio}, en caracter de cliente de FOGAJUY, DECLARO BAJO JURAMENTO que:`
      );
      splitText(textoPresentacion).forEach(line => {
        page.drawText(line, { x: 50, y, size: 10, font: fontRegular });
        y -= 14;
      });

      y -= 10;
      const clausulasLicitud = [
        "- Los fondos que seran aplicados en la presente operacion tienen origen licito, no provienen de actividades ilicitas ni seran utilizados para el financiamiento del terrorismo u otras conductas prohibidas por la legislacion vigente.",
        "- Me comprometo a suministrar, en caso de requerimiento, la documentacion respaldatoria del origen de los fondos involucrados.",
        "- Autorizo a FOGAJUY a verificar la informacion suministrada y a reportar, en caso de corresponder, cualquier operacion sospechosa a la Unidad de Informacion Financiera (UIF) conforme a la Ley N. 25.246."
      ];

      clausulasLicitud.forEach(clausula => {
        splitText(limpiarTextoPDF(clausula), 88).forEach(line => {
          page.drawText(line, { x: 50, y, size: 9.5, font: fontRegular });
          y -= 13;
        });
        y -= 5;
      });

      y -= 15;
      page.drawText('Declaracion Jurada OCDE-CRS / FATCA', {
        x: 50, y, size: 10, font: fontBold, color: rgb(0, 0, 0)
      });
      y -= 15;

      page.drawText('Asimismo, declaro bajo juramento que:', { x: 50, y, size: 9.5, font: fontRegular });
      y -= 14;

      const clausulasCRS = [
        `- Mi residencia fiscal se encuentra en ${residenciaFiscal.toUpperCase()}.`,
        "- El/los paises mencionados son los unicos en los cuales poseo obligaciones fiscales.",
        "- Me comprometo a informar cualquier modificacion respecto de mi residencia fiscal en un plazo no mayor a 30 dias."
      ];

      clausulasCRS.forEach(clausula => {
        splitText(limpiarTextoPDF(clausula), 88).forEach(line => {
          page.drawText(line, { x: 50, y, size: 9.5, font: fontRegular });
          y -= 13;
        });
        y -= 3;
      });

      y -= 10;
      page.drawText('Asimismo, declaro bajo juramento que:', { x: 50, y, size: 9.5, font: fontRegular });
      y -= 15;

      const fatcaOption1 = esUSPerson === 'NO' ? '[X]' : '[  ]';
      const fatcaOption2 = esUSPerson === 'SI' ? '[X]' : '[  ]';

      const textoFatca1 = `${fatcaOption1} No soy ciudadano/a ni residente fiscal de los Estados Unidos de America.`;
      splitText(textoFatca1, 85).forEach(line => {
        page.drawText(line, { x: 50, y, size: 9.5, font: esUSPerson === 'NO' ? fontBold : fontRegular });
        y -= 13;
      });
      y -= 5;

      const textoFatca2 = `${fatcaOption2} Soy ciudadano/a o residente fiscal de los Estados Unidos, y por lo tanto declaro mi condicion de U.S. Person conforme a la normativa FATCA. En caso de corresponder, autorizo a FOGAJUY a reportar la informacion requerida a la autoridad tributaria local y/o al IRS.`;
      splitText(textoFatca2, 85).forEach(line => {
        page.drawText(line, { x: 50, y, size: 9.5, font: esUSPerson === 'SI' ? fontBold : fontRegular });
        y -= 13;
      });

      y -= 10;
      page.drawText('Me comprometo a informar de inmediato cualquier cambio en mi condicion fiscal.', {
        x: 50, y, size: 9.5, font: fontRegular
      });

      y -= 30;
      const hoy = new Date();
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const fechaTexto = `Lugar y Fecha: San Salvador de Jujuy, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
      page.drawText(fechaTexto, { x: 50, y, size: 9.5, font: fontRegular });

      y -= 70;
      if (tieneFirmaDibujada && canvasRef.current) {
        const firmaDataUrl = canvasRef.current.toDataURL('image/png');
        const firmaImageBytes = await fetch(firmaDataUrl).then(res => res.arrayBuffer());
        const firmaImage = await pdfDoc.embedPng(firmaImageBytes);

        page.drawImage(firmaImage, {
          x: 180,
          y: y,
          width: 200,
          height: 60,
        });
      } else if (tieneFirmaTipeada) {
        page.drawText(limpiarTextoPDF(firmaTipeada), {
          x: 180,
          y: y + 20,
          size: 16,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.5)
        });
        page.drawText('(Firma Digitalizada / Declarada)', {
          x: 180,
          y: y + 5,
          size: 8,
          font: fontRegular,
          color: rgb(0.4, 0.4, 0.4)
        });
      }

      y -= 10;
      page.drawLine({ start: { x: 160, y }, end: { x: 400, y }, thickness: 1, color: rgb(0, 0, 0) });
      y -= 15;
      page.drawText(`FIRMA: ${limpiarTextoPDF(nombre.toUpperCase())}`, { x: 160, y, size: 9, font: fontBold });
      y -= 12;
      page.drawText(`ACLARACION: ${limpiarTextoPDF(nombre)}`, { x: 160, y, size: 9, font: fontRegular });
      y -= 12;
      page.drawText(`DNI/CUIT: ${dni}`, { x: 160, y, size: 9, font: fontRegular });

      const pdfBytes = await pdfDoc.save();
      const nombreLimpio = nombre.trim().replace(/\s+/g, '_');
      const nombreArchivo = `DDJJ_Licitud_Fondos_${nombreLimpio}_${dni}.pdf`;
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const archivoFinal = new File([blob], nombreArchivo, { type: 'application/pdf' });

      if (typeof onDocumentoGenerado === 'function') {
        onDocumentoGenerado(archivoFinal);
      }

      setNombre('');
      setDni('');
      setDomicilio('');
      setResidenciaFiscal('Argentina');
      setEsUSPerson('NO');
      limpiarFirma();
      setFirmaTipeada('');
      onClose();

    } catch (error) {
      console.error("Error generando PDF Licitud de Fondos:", error);
      alert("Error al generar la Declaración Jurada. Revisa la consola.");
    }
  };

  return ReactDOM.createPortal(
    <div 
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    >
      <div 
        className="modal-container" 
        style={{ 
          maxWidth: '650px', 
          width: '90%',
          maxHeight: '90vh', 
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          color: '#0f172a'
        }}
      >
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>💼 DDJJ Licitud de Fondos y FATCA/CRS</h3>
          <button type="button" className="btn-close" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleGenerarPDF} className="modal-body" style={{ marginTop: '15px' }}>
          <p className="subtext" style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Completá los datos requeridos para emitir la Declaración Jurada de Licitud de Fondos y Cumplimiento Fiscal.
          </p>

          <div className="form-group-row" style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 2 }}>
              <label htmlFor="nombre" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Nombre y Apellido / Razón Social *</label>
              <input 
                id="nombre" 
                name="nombre" 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                placeholder="Nombre completo o Razón Social"
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="dni" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>DNI / CUIT *</label>
              <input 
                id="dni"
                name="dni"
                type="text" 
                value={dni} 
                onChange={(e) => setDni(e.target.value)} 
                placeholder="Ej: 30123456" 
                required 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
            <label htmlFor="domicilio" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>Domicilio Completo *</label>
            <input 
              id="domicilio"
              name="domicilio"
              type="text" 
              value={domicilio} 
              onChange={(e) => setDomicilio(e.target.value)} 
              placeholder="Calle, Número, Localidad, Provincia" 
              required 
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginTop: '10px' }}>
            <label htmlFor="residenciaFiscal" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold' }}>País/es de Residencia Fiscal *</label>
            <input 
              id="residenciaFiscal"
              name="residenciaFiscal"
              type="text" 
              value={residenciaFiscal} 
              onChange={(e) => setResidenciaFiscal(e.target.value)} 
              placeholder="Ej: Argentina" 
              required 
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          {/* Condición FATCA */}
          <div style={{ marginTop: '15px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Condición FATCA (Estados Unidos) *</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <label style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                <input 
                  type="radio" 
                  name="fatcaOption" 
                  value="NO" 
                  checked={esUSPerson === 'NO'} 
                  onChange={() => setEsUSPerson('NO')} 
                />
                <span style={{ marginLeft: '6px' }}><strong>NO</strong> soy ciudadano/a ni residente fiscal de los EE.UU.</span>
              </label>
              <label style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                <input 
                  type="radio" 
                  name="fatcaOption" 
                  value="SI" 
                  checked={esUSPerson === 'SI'} 
                  onChange={() => setEsUSPerson('SI')} 
                />
                <span style={{ marginLeft: '6px' }}><strong>SÍ</strong> soy ciudadano/a o residente fiscal de los EE.UU. (U.S. Person)</span>
              </label>
            </div>
          </div>

          {/* Opciones de Firma */}
          <div style={{ marginTop: '15px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Firma del Declarante *</label>
            <div style={{ display: 'flex', gap: '15px', margin: '8px 0' }}>
              <button 
                type="button" 
                onClick={() => setTipoFirma('dibujo')} 
                style={{ background: tipoFirma === 'dibujo' ? '#0284c7' : '#e2e8f0', color: tipoFirma === 'dibujo' ? '#fff' : '#000', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
              >
                ✏️ Dibujar Firma
              </button>
              <button 
                type="button" 
                onClick={() => setTipoFirma('tipeada')} 
                style={{ background: tipoFirma === 'tipeada' ? '#0284c7' : '#e2e8f0', color: tipoFirma === 'tipeada' ? '#fff' : '#000', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
              >
                ⌨️ Tipear Nombre / Firma
              </button>
            </div>

            {tipoFirma === 'dibujo' ? (
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', background: '#fafafa' }}>
                <canvas 
                  ref={canvasRef}
                  width={400}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{ border: '1px dashed #94a3b8', borderRadius: '4px', background: '#ffffff', cursor: 'crosshair', display: 'block', margin: '0 auto' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Dibuje su firma dentro del recuadro</span>
                  <button type="button" onClick={limpiarFirma} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                    🗑️ Limpiar Firma
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <input 
                  id="firmaTipeada"
                  name="firmaTipeada"
                  type="text" 
                  value={firmaTipeada} 
                  onChange={(e) => setFirmaTipeada(e.target.value)} 
                  placeholder="Escriba su nombre completo a modo de firma"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ backgroundColor: '#0284c7', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              📄 Generar y Adjuntar DDJJ
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}