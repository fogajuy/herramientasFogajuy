import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function ModalDDJJPEPFisica({ isOpen, onClose, datosCliente, onDocumentoGenerado }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [estadoCivil, setEstadoCivil] = useState('Soltero/a');
  const [domicilio, setDomicilio] = useState('');
  const [caracter, setCaracter] = useState('Titular');

  // Condición PEP
  const [esPEP, setEsPEP] = useState('NO');
  const [motivoPEP, setMotivoPEP] = useState('');

  // Tipo de Firma: 'dibujada' o 'tipeada'
  const [tipoFirma, setTipoFirma] = useState('dibujada');
  const [firmaTipeada, setFirmaTipeada] = useState('');

  useEffect(() => {
    if (datosCliente) {
      setNombre(datosCliente.nombre || datosCliente.firmante || '');
      setDni(datosCliente.dni || datosCliente.cuit || '');
      setEstadoCivil(datosCliente.estadoCivil || 'Soltero/a');
      setDomicilio(datosCliente.domicilio || '');
      setCaracter(datosCliente.caracter || datosCliente.rol || 'Titular');
      setFirmaTipeada(datosCliente.nombre || datosCliente.firmante || '');
    }
  }, [datosCliente, isOpen]);

  if (!isOpen) return null;

  // Lógica Canvas Nativa para Firma Dibujada
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

  const handleGenerarPDF = async (e) => {
    if (e) e.preventDefault();

    if (!nombre.trim() || !dni.trim() || !domicilio.trim()) {
      alert('Por favor, completá los campos obligatorios (Nombre, DNI y Domicilio).');
      return;
    }

    if (esPEP === 'SI' && !motivoPEP.trim()) {
      alert('Al indicar que SÍ sos Persona Expuesta Políticamente, debés detallar el motivo/cargo.');
      return;
    }

    const tieneFirmaDibujada = tipoFirma === 'dibujada' && hasDrawn;
    const tieneFirmaTipeada = tipoFirma === 'tipeada' && firmaTipeada.trim().length > 0;

    if (!tieneFirmaDibujada && !tieneFirmaTipeada) {
      alert('Por favor, ingresá o dibujá la firma antes de generar la declaración.');
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // --- PÁGINA 1: DECLARACIÓN JURADA ---
      const page1 = pdfDoc.addPage([595.28, 841.89]);
      let y = 780;

      // Encabezado
      page1.drawText('DECLARACION JURADA SOBRE LA CONDICION DE', {
        x: 95, y, size: 12, font: fontBold, color: rgb(0, 0, 0)
      });
      y -= 16;
      page1.drawText('PERSONA EXPUESTA POLITICAMENTE (PEP)', {
        x: 125, y, size: 12, font: fontBold, color: rgb(0, 0, 0)
      });
      y -= 14;
      page1.drawText('(LEY N. 25.246 y modif., RESOLUCION UIF N. 35/2023)', {
        x: 115, y, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3)
      });
      y -= 35;

      // Fecha y Lugar
      const hoy = new Date();
      const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const fechaTexto = `En la ciudad de San Salvador de Jujuy, a los ${hoy.getDate()} dias del mes de ${meses[hoy.getMonth()]} del ano ${hoy.getFullYear()}.`;
      page1.drawText(fechaTexto, { x: 50, y, size: 10, font: fontRegular });
      y -= 25;

      // Texto de Comparecencia
      const textoComparece = limpiarTextoPDF(
        `Comparece el/la Sr./Sra. ${nombre.toUpperCase()}, D.N.I. N. ${dni}, Estado Civil ${estadoCivil}, con domicilio real en ${domicilio}, quien suscribe con caracter de FORMAL DECLARACION JURADA y respetuosamente dice:`
      );

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

      splitText(textoComparece).forEach(line => {
        page1.drawText(line, { x: 50, y, size: 10, font: fontRegular });
        y -= 14;
      });

      y -= 15;
      page1.drawText('I.- Declaro bajo juramento que los datos consignados en la presente son correctos, completos y fiel', { x: 50, y, size: 10, font: fontRegular });
      y -= 14;
      page1.drawText('expresion de la verdad.', { x: 50, y, size: 10, font: fontRegular });

      y -= 15;
      const textoII = `II.- Que (${esPEP}) me encuentro incluido y/o alcanzado dentro de la nomina de funciones de personas expuestas politicamente aprobada por la Unidad de Informacion Financiera que he leido y suscripto.`;
      splitText(textoII).forEach(line => {
        page1.drawText(line, { x: 50, y, size: 10, font: line.includes(`(${esPEP})`) ? fontBold : fontRegular });
        y -= 14;
      });

      y -= 15;
      const textoIII = `III.- Que me comprometo a informar cualquier cambio o modificacion que afecte mi condicion de PEP dentro de los plazos establecidos por la normativa vigente (30 dias de corrido) mediante la presentacion de una nueva declaracion jurada.`;
      splitText(textoIII).forEach(line => {
        page1.drawText(line, { x: 50, y, size: 10, font: fontRegular });
        y -= 14;
      });

      y -= 25;
      page1.drawText('En caso afirmativo indicar detalladamente el motivo:', { x: 50, y, size: 10, font: fontBold });
      y -= 15;

      const motivoTexto = limpiarTextoPDF(esPEP === 'SI' ? motivoPEP : 'NO CORRESPONDE');
      splitText(motivoTexto, 80).forEach(line => {
        page1.drawText(line, { x: 60, y, size: 9.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        y -= 13;
      });

      // Inserción de Firma
      y = 190;
      if (tipoFirma === 'dibujada' && hasDrawn && canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const imageBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());
        const embeddedImage = await pdfDoc.embedPng(imageBytes);

        page1.drawImage(embeddedImage, {
          x: 200,
          y: y,
          width: 140,
          height: 40
        });
      } else if (tipoFirma === 'tipeada' && firmaTipeada) {
        page1.drawText(limpiarTextoPDF(firmaTipeada), {
          x: 200,
          y: y + 15,
          size: 16,
          font: fontBold,
          color: rgb(0.1, 0.1, 0.5)
        });
      }

      // Pie de firma
      y -= 10;
      page1.drawLine({ start: { x: 180, y }, end: { x: 420, y }, thickness: 1, color: rgb(0, 0, 0) });
      y -= 15;
      page1.drawText(`FIRMA: ${limpiarTextoPDF(nombre.toUpperCase())}`, { x: 180, y, size: 9, font: fontBold });
      y -= 12;
      page1.drawText(`ACLARACION: ${limpiarTextoPDF(nombre)}`, { x: 180, y, size: 9, font: fontRegular });
      y -= 12;
      page1.drawText(`DNI: ${dni} - CARACTER: ${limpiarTextoPDF(caracter)}`, { x: 180, y, size: 9, font: fontRegular });

      // --- PÁGINA 2: NÓMINA RES. UIF 35/2023 ---
      const page2 = pdfDoc.addPage([595.28, 841.89]);
      let y2 = 800;

      page2.drawText('Nomina de Personas Expuestas Politicamente (RESOLUCION UIF N. 35/2023)', {
        x: 40, y: y2, size: 10, font: fontBold
      });
      y2 -= 20;

      const col1Items = [
        "1.- Son consideradas Personas Expuestas Politicamente Extranjeras los funcionarios publicos pertenecientes a paises extranjeros que desempenen o hayan desempenado funciones ejecutivas, legislativas, judiciales o de representacion internacional.",
        "2.- Son consideradas Personas Expuestas Politicamente por parentesco o cercania aquellas que mantienen vinculos de conyuge, conviviente, familiares en linea ascendente, descendente o colateral hasta el segundo grado de consanguinidad o afinidad con las personas indicadas en la norma.",
        "3.- Son consideradas Personas Expuestas Politicamente Nacionales, provinciales, municipales o de la CABA los funcionarios de alta jerarquia de los Poderes Ejecutivo, Legislativo y Judicial, Jefes de Fuerzas Armadas y de Seguridad, Directores de Empresas del Estado, entre otros."
      ];

      const col2Items = [
        "4.- Sin perjuicio de lo expuesto en los articulos precedentes, son consideradas Personas Expuestas Politicamente las autoridades de partidos politicos, organizaciones sindicales y empresariales, y administradores de fondos publicos.",
        "5.- Se consideran tambien Personas Expuestas Politicamente por parentesco o cercania a quienes mantengan relaciones juridicas de negocios o allegados cercanos con las personas expuestas politicamente nacional o localmente."
      ];

      // Renderizado en Columna Izquierda
      let yCol1 = y2;
      col1Items.forEach(item => {
        splitText(item, 45).forEach(line => {
          page2.drawText(line, { x: 40, y: yCol1, size: 7.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
          yCol1 -= 10;
        });
        yCol1 -= 8;
      });

      // Renderizado en Columna Derecha
      let yCol2 = y2;
      col2Items.forEach(item => {
        splitText(item, 45).forEach(line => {
          page2.drawText(line, { x: 300, y: yCol2, size: 7.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
          yCol2 -= 10;
        });
        yCol2 -= 8;
      });

      // Generar y descargar/enviar archivo
      const pdfBytes = await pdfDoc.save();
      const nombreLimpio = nombre.trim().replace(/\s+/g, '_');
      const nombreArchivo = `DDJJ_PEP_${nombreLimpio}_${dni}.pdf`;
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const archivoFinal = new File([blob], nombreArchivo, { type: 'application/pdf' });

      if (typeof onDocumentoGenerado === 'function') {
        onDocumentoGenerado(archivoFinal);
      }

      onClose();

    } catch (error) {
      console.error("Error generando PDF PEP Persona Física:", error);
      alert("Error al generar la Declaración Jurada PEP. Revisa la consola.");
    }
  };

  return ReactDOM.createPortal(
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#0284c7' }}>📝 Generar DDJJ PEP (Titular / Fiador)</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
        </div>

        <form onSubmit={handleGenerarPDF} style={{ marginTop: '15px' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>
            Completá los datos del declarante (Titular, Co-titular o Fiador).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Nombre Completo *</label>
              <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ width: '100%', padding: '6px' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>DNI / CUIT *</label>
              <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} style={{ width: '100%', padding: '6px' }} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Estado Civil</label>
              <select value={estadoCivil} onChange={(e) => setEstadoCivil(e.target.value)} style={{ width: '100%', padding: '6px' }}>
                <option value="Soltero/a">Soltero/a</option>
                <option value="Casado/a">Casado/a</option>
                <option value="Divorciado/a">Divorciado/a</option>
                <option value="Viudo/a">Viudo/a</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Rol / Carácter</label>
              <select value={caracter} onChange={(e) => setCaracter(e.target.value)} style={{ width: '100%', padding: '6px' }}>
                <option value="Titular">Titular</option>
                <option value="Co-titular">Co-titular</option>
                <option value="Fiador / Garante">Fiador / Garante</option>
                <option value="Declarante">Declarante</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Domicilio Real *</label>
              <input type="text" value={domicilio} onChange={(e) => setDomicilio(e.target.value)} style={{ width: '100%', padding: '6px' }} required />
            </div>
          </div>

          <fieldset style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', marginBottom: '15px' }}>
            <legend style={{ fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>Condición PEP</legend>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', cursor: 'pointer' }}>
                <input type="radio" name="esPEP" value="NO" checked={esPEP === 'NO'} onChange={() => setEsPEP('NO')} /> NO soy Persona Expuesta Políticamente
              </label>
              <label style={{ fontSize: '13px', cursor: 'pointer' }}>
                <input type="radio" name="esPEP" value="SI" checked={esPEP === 'SI'} onChange={() => setEsPEP('SI')} /> SÍ soy Persona Expuesta Políticamente
              </label>
            </div>

            {esPEP === 'SI' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>Detalle de Cargo / Motivo *</label>
                <textarea value={motivoPEP} onChange={(e) => setMotivoPEP(e.target.value)} style={{ width: '100%', padding: '6px', height: '60px' }} placeholder="Indicar cargo, organismo y fecha..." />
              </div>
            )}
          </fieldset>

          <fieldset style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '12px', marginBottom: '15px' }}>
            <legend style={{ fontWeight: 'bold', fontSize: '13px', color: '#334155' }}>Firma del Declarante</legend>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
              <label style={{ fontSize: '12px', cursor: 'pointer' }}>
                <input type="radio" name="tipoFirmaPEP" value="dibujada" checked={tipoFirma === 'dibujada'} onChange={() => setTipoFirma('dibujada')} /> Dibujar Firma
              </label>
              <label style={{ fontSize: '12px', cursor: 'pointer' }}>
                <input type="radio" name="tipoFirmaPEP" value="tipeada" checked={tipoFirma === 'tipeada'} onChange={() => setTipoFirma('tipeada')} /> Tipear Nombre/Firma
              </label>
            </div>

            {tipoFirma === 'dibujada' ? (
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
            ) : (
              <input
                type="text"
                placeholder="Ingrese su nombre o firma"
                value={firmaTipeada}
                onChange={(e) => setFirmaTipeada(e.target.value)}
                style={{ width: '100%', padding: '8px', fontStyle: 'italic', fontFamily: 'serif', fontSize: '16px' }}
              />
            )}
          </fieldset>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#0284c7', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>
              Generar DDJJ y Adjuntar PDF
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}