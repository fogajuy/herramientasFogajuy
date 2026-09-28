import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import Navbar from '../navBar/navBar';
import '../../styles/anexarExpediente.css';

const AnexarExpediente = () => {
  // Estado para los archivos del primer ítem (Expediente base / ya trabajado)
  const [primerItemFiles, setPrimerItemFiles] = useState([]);
  
  // Estado para los archivos del segundo ítem (Documentos a anexar y foliar)
  const [segundoItemFiles, setSegundoItemFiles] = useState([]);
  
  // Número inicial de foliado para el segundo ítem
  const [numeroInicial, setNumeroInicial] = useState('');
  
  // Estados de control de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfBlob, setPdfBlob] = useState(null);

  // Manejadores de carga de archivos
  const handlePrimerItemChange = (e) => {
    setPrimerItemFiles(Array.from(e.target.files));
  };

  const handleSegundoItemChange = (e) => {
    setSegundoItemFiles(Array.from(e.target.files));
  };

  // Función auxiliar para convertir imágenes a PDF en formato A4
  const convertImageToPdf = async (file) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // Tamaño A4 en puntos (72 DPI)
    const { width, height } = page.getSize();

    let imageEmbed;
    const arrayBuffer = await file.arrayBuffer();

    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      imageEmbed = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === 'image/png') {
      imageEmbed = await pdfDoc.embedPng(arrayBuffer);
    } else {
      throw new Error(`Formato de imagen no soportado: ${file.type}`);
    }

    // Escalar la imagen manteniendo proporciones dentro de A4
    const imgDims = imageEmbed.scaleToFit(width - 60, height - 60);
    page.drawImage(imageEmbed, {
      x: (width - imgDims.width) / 2,
      y: (height - imgDims.height) / 2,
      width: imgDims.width,
      height: imgDims.height,
    });

    const pdfBytes = await pdfDoc.save();
    return await PDFDocument.load(pdfBytes);
  };

  // Función para dibujar el sello circular institucional con texto curvo y negrita
  const drawSelloFoliado = async (page, numeroFoliado, pdfDoc) => {
    const { width, height } = page.getSize();
    const centerX = width - 45;
    const centerY = height - 45;
    const radius = 28;

    // Incrustar fuente en negrita
    const fontBold = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);

    // Círculo único (Negro institucional)
    page.drawCircle({
      x: centerX,
      y: centerY,
      size: radius,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1.5,
    });

    // Texto curvo superior "FOGAJUY" siguiendo el arco del círculo
    const text = 'FOGAJUY';
    const fontSize = 7.5;
    const textRadius = radius - 8; // Radio interno para el arco de las letras
    const startAngle = Math.PI * 0.78; // Ángulo de inicio (superior izquierdo)
    const angleStep = (Math.PI * 0.56) / (text.length - 1); // Espaciado entre letras

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const angle = startAngle - i * angleStep;
      const x = centerX + textRadius * Math.cos(angle);
      const y = centerY + textRadius * Math.sin(angle);
      const rotation = angle - Math.PI / 2; // Rotación tangencial para acompañar la curva

      page.drawText(char, {
        x: x,
        y: y,
        size: fontSize,
        font: fontBold,
        color: rgb(0, 0, 0),
        rotate: { type: 'radians', angle: rotation },
      });
    }

    // Número de folio actual centrado y en negrita
    const numStr = String(numeroFoliado);
    const numFontSize = 10.5;
    const numWidth = fontBold.widthOfTextAtSize(numStr, numFontSize);

    page.drawText(numStr, {
      x: centerX - numWidth / 2,
      y: centerY - 7,
      size: numFontSize,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
  };

  // Proceso principal de unificación y foliado
  const procesarExpediente = async (e) => {
    e.preventDefault();
    setError('');

    if (primerItemFiles.length === 0 && segundoItemFiles.length === 0) {
      setError('Debe seleccionar al menos un archivo en alguno de los ítems.');
      return;
    }

    if (segundoItemFiles.length > 0 && (numeroInicial === '' || isNaN(numeroInicial))) {
      setError('Debe ingresar un número inicial válido para el foliado del segundo ítem.');
      return;
    }

    setLoading(true);

    try {
      const mergedPdf = await PDFDocument.create();
      let folioActual = parseInt(numeroInicial, 10) || 1;

      // 1. Procesar el Primer Ítem (Se integran tal cual llegan, sin sello)
      for (const file of primerItemFiles) {
        let donorDoc;
        if (file.type === 'application/pdf') {
          const arrayBuffer = await file.arrayBuffer();
          donorDoc = await PDFDocument.load(arrayBuffer);
        } else if (file.type.startsWith('image/')) {
          donorDoc = await convertImageToPdf(file);
        } else {
          continue;
        }

        const copiedPages = await mergedPdf.copyPages(donorDoc, donorDoc.getPageIndices());
        for (const page of copiedPages) {
          page.setSize(595.28, 841.89); // Forzar tamaño A4
          mergedPdf.addPage(page);
        }
      }

      // 2. Procesar el Segundo Ítem (Se integran y se les aplica el sello con texto curvo y negrita)
      for (const file of segundoItemFiles) {
        let donorDoc;
        if (file.type === 'application/pdf') {
          const arrayBuffer = await file.arrayBuffer();
          donorDoc = await PDFDocument.load(arrayBuffer);
        } else if (file.type.startsWith('image/')) {
          donorDoc = await convertImageToPdf(file);
        } else {
          continue;
        }

        const copiedPages = await mergedPdf.copyPages(donorDoc, donorDoc.getPageIndices());
        for (const page of copiedPages) {
          page.setSize(595.28, 841.89); // Asegurar A4
          await drawSelloFoliado(page, folioActual, mergedPdf);
          mergedPdf.addPage(page);
          folioActual++;
        }
      }

      // Guardar resultado y generar URL para vista previa
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setPdfBlob(blob);
      setPdfUrl(url);
    } catch (err) {
      console.error('Error al procesar los archivos:', err);
      setError('Ocurrió un error al procesar y unir los documentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = () => {
    if (!pdfBlob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(pdfBlob);
    link.download = 'Expediente_Foliado_FOGAJUY.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
    <Navbar />
    <div className="anexar-container">
        
      <h2>Unión y Foliado de Expediente - FOGAJUY</h2>
      <p className="subtitle">
        Integre el expediente base (sin foliar) y agregue los nuevos documentos foliados automáticamente en formato A4.
      </p>

      <form onSubmit={procesarExpediente} className="anexar-form">
        {/* Sección Primer Ítem */}
        <div className="form-group">
          <label htmlFor="primerItem">
            <strong>1. Expediente Base / Primer Ítem (Sin foliado nuevo):</strong>
          </label>
          <input
            id="primerItem"
            type="file"
            multiple
            accept=".pdf,image/jpeg,image/png"
            onChange={handlePrimerItemChange}
          />
          <small>Archivos seleccionados: {primerItemFiles.length}</small>
        </div>

        {/* Sección Segundo Ítem */}
        <div className="form-group">
          <label htmlFor="segundoItem">
            <strong>2. Documentos a Anexar (Se aplicará foliado):</strong>
          </label>
          <input
            id="segundoItem"
            type="file"
            multiple
            accept=".pdf,image/jpeg,image/png"
            onChange={handleSegundoItemChange}
          />
          <small>Archivos seleccionados: {segundoItemFiles.length}</small>
        </div>

        {/* Número Inicial de Foliado */}
        <div className="form-group">
          <label htmlFor="numeroInicial">
            <strong>Número inicial de folio:</strong>
          </label>
          <input
            id="numeroInicial"
            type="number"
            min="1"
            placeholder="Ej: 15"
            value={numeroInicial}
            onChange={(e) => setNumeroInicial(e.target.value)}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn-procesar" disabled={loading}>
          {loading ? 'Generando expediente...' : 'Generar y Foliar Expediente'}
        </button>
      </form>

      {/* Sección de Vista Previa */}
      {pdfUrl && (
        <div className="preview-section">
          <h3>Vista Previa del Expediente Unificado</h3>
          <div className="iframe-container">
            <iframe src={pdfUrl} title="Vista previa del PDF" />
          </div>
          <button onClick={handleDescargar} className="btn-descargar">
            Descargar PDF Definitivo
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export default AnexarExpediente;