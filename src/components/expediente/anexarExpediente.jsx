// import React, { useState } from 'react';
// import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
// import Navbar from '../navBar/navBar';
// import '../../styles/anexarExpediente.css';

// const AnexarExpediente = () => {
//   // Estado para los archivos del primer ítem (Expediente base / ya trabajado)
//   const [primerItemFiles, setPrimerItemFiles] = useState([]);
  
//   // Estado para los archivos del segundo ítem (Documentos a anexar y foliar)
//   const [segundoItemFiles, setSegundoItemFiles] = useState([]);
  
//   // Número inicial de foliado para el segundo ítem
//   const [numeroInicial, setNumeroInicial] = useState('');
  
//   // Estados de control de UI
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [pdfUrl, setPdfUrl] = useState('');
//   const [pdfBlob, setPdfBlob] = useState(null);

//   // Manejadores de carga de archivos
//   const handlePrimerItemChange = (e) => {
//     setPrimerItemFiles(Array.from(e.target.files));
//   };

//   const handleSegundoItemChange = (e) => {
//     setSegundoItemFiles(Array.from(e.target.files));
//   };

//   // Función auxiliar para convertir imágenes a PDF respetando su orientación original
//   const convertImageToPdf = async (file) => {
//     const pdfDoc = await PDFDocument.create();
//     const arrayBuffer = await file.arrayBuffer();

//     let imageEmbed;
//     if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
//       imageEmbed = await pdfDoc.embedJpg(arrayBuffer);
//     } else if (file.type === 'image/png') {
//       imageEmbed = await pdfDoc.embedPng(arrayBuffer);
//     } else {
//       throw new Error(`Formato de imagen no soportado: ${file.type}`);
//     }

//     const imgDims = imageEmbed.scale(1);
//     // Si la imagen es más ancha que alta, se crea apaisada (horizontal)
//     const isLandscape = imgDims.width > imgDims.height;
//     const pageWidth = isLandscape ? 841.89 : 595.28;
//     const pageHeight = isLandscape ? 595.28 : 841.89;

//     const page = pdfDoc.addPage([pageWidth, pageHeight]);
//     const { width, height } = page.getSize();

//     const scaledDims = imageEmbed.scaleToFit(width - 60, height - 60);
//     page.drawImage(imageEmbed, {
//       x: (width - scaledDims.width) / 2,
//       y: (height - scaledDims.height) / 2,
//       width: scaledDims.width,
//       height: scaledDims.height,
//     });

//     const pdfBytes = await pdfDoc.save();
//     return await PDFDocument.load(pdfBytes);
//   };

//   // Función para dibujar el sello circular institucional con texto curvo y negrita
//   const drawSelloFoliado = async (page, numeroFoliado, pdfDoc) => {
//     const { width, height } = page.getSize();
//     const centerX = width - 45;
//     const centerY = height - 45;
//     const radius = 28;

//     // Incrustar fuente en negrita
//     const fontBold = await pdfDoc.embedStandardFont(StandardFonts.HelveticaBold);

//     // Círculo único (Negro institucional)
//     page.drawCircle({
//       x: centerX,
//       y: centerY,
//       size: radius,
//       borderColor: rgb(0, 0, 0),
//       borderWidth: 1.5,
//     });

//     // Texto curvo superior "FOGAJUY" siguiendo el arco del círculo
//     const text = 'FOGAJUY';
//     const fontSize = 7.5;
//     const textRadius = radius - 8; // Radio interno para el arco de las letras
//     const startAngle = Math.PI * 0.78; // Ángulo de inicio (superior izquierdo)
//     const angleStep = (Math.PI * 0.56) / (text.length - 1); // Espaciado entre letras

//     for (let i = 0; i < text.length; i++) {
//       const char = text[i];
//       const angle = startAngle - i * angleStep;
//       const x = centerX + textRadius * Math.cos(angle);
//       const y = centerY + textRadius * Math.sin(angle);
//       const rotation = angle - Math.PI / 2; // Rotación tangencial para acompañar la curva

//       page.drawText(char, {
//         x: x,
//         y: y,
//         size: fontSize,
//         font: fontBold,
//         color: rgb(0, 0, 0),
//         rotate: { type: 'radians', angle: rotation },
//       });
//     }

//     // Número de folio actual centrado y en negrita
//     const numStr = String(numeroFoliado);
//     const numFontSize = 10.5;
//     const numWidth = fontBold.widthOfTextAtSize(numStr, numFontSize);

//     page.drawText(numStr, {
//       x: centerX - numWidth / 2,
//       y: centerY - 7,
//       size: numFontSize,
//       font: fontBold,
//       color: rgb(0, 0, 0),
//     });
//   };

//   // Proceso principal de unificación y foliado
//   const procesarExpediente = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (primerItemFiles.length === 0 && segundoItemFiles.length === 0) {
//       setError('Debe seleccionar al menos un archivo en alguno de los ítems.');
//       return;
//     }

//     if (segundoItemFiles.length > 0 && (numeroInicial === '' || isNaN(numeroInicial))) {
//       setError('Debe ingresar un número inicial válido para el foliado del segundo ítem.');
//       return;
//     }

//     setLoading(true);

//     try {
//       const mergedPdf = await PDFDocument.create();
//       let folioActual = parseInt(numeroInicial, 10) || 1;

//       // 1. Procesar el Primer Ítem (Preservando su orientación original)
//       for (const file of primerItemFiles) {
//         let donorDoc;
//         if (file.type === 'application/pdf') {
//           const arrayBuffer = await file.arrayBuffer();
//           donorDoc = await PDFDocument.load(arrayBuffer);
//         } else if (file.type.startsWith('image/')) {
//           donorDoc = await convertImageToPdf(file);
//         } else {
//           continue;
//         }

//         const copiedPages = await mergedPdf.copyPages(donorDoc, donorDoc.getPageIndices());
//         for (const page of copiedPages) {
//           const { width, height } = page.getSize();
//           // Mantener horizontal si el ancho original supera al alto, sino vertical estándar
//           if (width > height) {
//             page.setSize(841.89, 595.28);
//           } else {
//             page.setSize(595.28, 841.89);
//           }
//           mergedPdf.addPage(page);
//         }
//       }

//       // 2. Procesar el Segundo Ítem (Preservando orientación y aplicando sello)
//       for (const file of segundoItemFiles) {
//         let donorDoc;
//         if (file.type === 'application/pdf') {
//           const arrayBuffer = await file.arrayBuffer();
//           donorDoc = await PDFDocument.load(arrayBuffer);
//         } else if (file.type.startsWith('image/')) {
//           donorDoc = await convertImageToPdf(file);
//         } else {
//           continue;
//         }

//         const copiedPages = await mergedPdf.copyPages(donorDoc, donorDoc.getPageIndices());
//         for (const page of copiedPages) {
//           const { width, height } = page.getSize();
//           if (width > height) {
//             page.setSize(841.89, 595.28);
//           } else {
//             page.setSize(595.28, 841.89);
//           }
//           await drawSelloFoliado(page, folioActual, mergedPdf);
//           mergedPdf.addPage(page);
//           folioActual++;
//         }
//       }

//       // Guardar resultado y generar URL para vista previa
//       const pdfBytes = await mergedPdf.save();
//       const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//       const url = URL.createObjectURL(blob);

//       setPdfBlob(blob);
//       setPdfUrl(url);
//     } catch (err) {
//       console.error('Error al procesar los archivos:', err);
//       setError('Ocurrió un error al procesar y unir los documentos.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDescargar = () => {
//     if (!pdfBlob) return;
//     const link = document.createElement('a');
//     link.href = URL.createObjectURL(pdfBlob);
//     link.download = 'Expediente_Foliado_FOGAJUY.pdf';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return (
//     <>
//     <Navbar />
//     <div className="anexar-container">
        
//       <h2>Unión y Foliado de Expediente - FOGAJUY</h2>
//       <p className="subtitle">
//         Integre el expediente base (sin foliar) y agregue los nuevos documentos foliados automáticamente respetando los formatos vertical y horizontal.
//       </p>

//       <form onSubmit={procesarExpediente} className="anexar-form">
//         {/* Sección Primer Ítem */}
//         <div className="form-group">
//           <label htmlFor="primerItem">
//             <strong>1. Expediente Base / Primer Ítem (Sin foliado nuevo):</strong>
//           </label>
//           <input
//             id="primerItem"
//             type="file"
//             multiple
//             accept=".pdf,image/jpeg,image/png"
//             onChange={handlePrimerItemChange}
//           />
//           <small>Archivos seleccionados: {primerItemFiles.length}</small>
//         </div>

//         {/* Sección Segundo Ítem */}
//         <div className="form-group">
//           <label htmlFor="segundoItem">
//             <strong>2. Documentos a Anexar (Se aplicará foliado):</strong>
//           </label>
//           <input
//             id="segundoItem"
//             type="file"
//             multiple
//             accept=".pdf,image/jpeg,image/png"
//             onChange={handleSegundoItemChange}
//           />
//           <small>Archivos seleccionados: {segundoItemFiles.length}</small>
//         </div>

//         {/* Número Inicial de Foliado */}
//         <div className="form-group">
//           <label htmlFor="numeroInicial">
//             <strong>Número inicial de folio:</strong>
//           </label>
//           <input
//             id="numeroInicial"
//             type="number"
//             min="1"
//             placeholder="Ej: 15"
//             value={numeroInicial}
//             onChange={(e) => setNumeroInicial(e.target.value)}
//           />
//         </div>

//         {error && <div className="error-message">{error}</div>}

//         <button type="submit" className="btn-procesar" disabled={loading}>
//           {loading ? 'Generando expediente...' : 'Generar y Foliar Expediente'}
//         </button>
//       </form>

//       {/* Sección de Vista Previa */}
//       {pdfUrl && (
//         <div className="preview-section">
//           <h3>Vista Previa del Expediente Unificado</h3>
//           <div className="iframe-container">
//             <iframe src={pdfUrl} title="Vista previa del PDF" />
//           </div>
//           <button onClick={handleDescargar} className="btn-descargar">
//             Descargar PDF Definitivo
//           </button>
//         </div>
//       )}
//     </div>
//     </>
//   );
// };

// export default AnexarExpediente;


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

  // Función auxiliar para convertir imágenes a PDF respetando su orientación original
  const convertImageToPdf = async (file) => {
    const pdfDoc = await PDFDocument.create();
    const arrayBuffer = await file.arrayBuffer();

    let imageEmbed;
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      imageEmbed = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === 'image/png') {
      imageEmbed = await pdfDoc.embedPng(arrayBuffer);
    } else {
      throw new Error(`Formato de imagen no soportado: ${file.type}`);
    }

    const imgDims = imageEmbed.scale(1);
    // Si la imagen es más ancha que alta, se crea apaisada (horizontal)
    const isLandscape = imgDims.width > imgDims.height;
    const pageWidth = isLandscape ? 841.89 : 595.28;
    const pageHeight = isLandscape ? 595.28 : 841.89;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const { width, height } = page.getSize();

    const scaledDims = imageEmbed.scaleToFit(width - 60, height - 60);
    page.drawImage(imageEmbed, {
      x: (width - scaledDims.width) / 2,
      y: (height - scaledDims.height) / 2,
      width: scaledDims.width,
      height: scaledDims.height,
    });

    const pdfBytes = await pdfDoc.save();
    return await PDFDocument.load(pdfBytes);
  };

  // Función para dibujar el sello circular institucional con texto curvo y negrita
  const drawSelloFoliado = async (page, numeroFoliado, pdfDoc) => {
    const { width, height } = page.getSize();
    // Detección de página horizontal para ajustar la posición del sello si es necesario
    const esHorizontal = width > height;
    const centerX = esHorizontal ? width - 45 : width - 50;
    const centerY = esHorizontal ? height - 45 : height - 50;
    const radius = 26;

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
    const fontSize = 7;
    const textRadius = radius - 8; 
    const angleStep = 18;
    const startAngle = 90 + ((text.length - 1) / 2) * angleStep; 

    for (let j = 0; j < text.length; j++) {
      const char = text[j];
      const thetaDeg = startAngle - (j * angleStep);
      const thetaRad = thetaDeg * (Math.PI / 180);

      const x = centerX + textRadius * Math.cos(thetaRad);
      const yPos = centerY + textRadius * Math.sin(thetaRad);

      const charWidth = fontBold.widthOfTextAtSize(char, fontSize);
      const baselineAngleRad = (thetaDeg - 90) * (Math.PI / 180);
      
      const offsetX = - (charWidth / 2) * Math.cos(baselineAngleRad);
      const offsetY = - (charWidth / 2) * Math.sin(baselineAngleRad);

      page.drawText(char, {
        x: x + offsetX,
        y: yPos + offsetY,
        size: fontSize,
        font: fontBold,
        color: rgb(0, 0, 0),
        rotate: { type: 'degrees', angle: thetaDeg - 90 },
      });
    }

    // Número de folio actual centrado y en negrita
    const numStr = String(numeroFoliado);
    const numFontSize = 14;
    const numWidth = fontBold.widthOfTextAtSize(numStr, numFontSize);

    page.drawText(numStr, {
      x: centerX - (numWidth / 2),
      y: centerY - 5,
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

      // 1. Procesar el Primer Ítem (Preservando las dimensiones y proporciones originales)
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
          mergedPdf.addPage(page);
        }
      }

      // 2. Procesar el Segundo Ítem (Preservando proporciones y aplicando sello)
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
        Integre el expediente base (sin foliar) y agregue los nuevos documentos foliados automáticamente respetando los formatos vertical y horizontal.
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