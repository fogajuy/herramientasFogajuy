import React, { useState, useRef, useEffect } from 'react';
// Importación corregida de pdf-lib (Named exports)
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function ModalNominaAdministradores({ isOpen, onClose, datosCliente, datosGuardados, onDocumentoGenerado }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  // Selección de tipo de firma: 'dibujar' o 'texto'
  const [modoFirma, setModoFirma] = useState('dibujar');
  const [textoFirma, setTextoFirma] = useState('');

  // Encabezado Formulario
  const [formData, setFormData] = useState({
    solicitanteNombre: '',
    cargo: '',
    empresaNombre: '',
    cuit: '',
    domicilioLegal: '',
    domicilioElectronico: '',
    telefono: ''
  });

  // Tabla 1: Administradores
  const [administradores, setAdministradores] = useState([
    { cargo: 'Presidente', nombre: '', cuit: '' },
    { cargo: 'Director / Socio Gerente', nombre: '', cuit: '' }
  ]);

  // Tabla 2: Accionistas
  const [accionistas, setAccionistas] = useState([
    { nombre: '', cuit: '', porcentaje: '' }
  ]);

  useEffect(() => {
    if (isOpen) {
      if (datosGuardados) {
        setFormData(datosGuardados.formData || {});
        setAdministradores(datosGuardados.administradores || []);
        setAccionistas(datosGuardados.accionistas || []);
        setTextoFirma(datosGuardados.formData?.solicitanteNombre || '');
      } else {
        setFormData({
          solicitanteNombre: datosCliente?.representanteLegal || datosCliente?.nombre || '',
          cargo: datosCliente?.cargo || '',
          empresaNombre: datosCliente?.razonSocial || datosCliente?.nombre || '',
          cuit: datosCliente?.cuit || '',
          domicilioLegal: datosCliente?.domicilio || '',
          domicilioElectronico: datosCliente?.email || '',
          telefono: datosCliente?.telefono || ''
        });
        setTextoFirma(datosCliente?.representanteLegal || datosCliente?.nombre || '');
      }

      setTimeout(() => {
        limpiarFirma();
      }, 100);
    }
  }, [isOpen, datosCliente, datosGuardados]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejadores de Administradores
  const handleAdminChange = (index, field, value) => {
    setAdministradores((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const agregarAdministrador = () => {
    setAdministradores((prev) => [...prev, { cargo: '', nombre: '', cuit: '' }]);
  };

  const eliminarAdministrador = (index) => {
    if (administradores.length === 1) return;
    setAdministradores((prev) => prev.filter((_, i) => i !== index));
  };

  // Manejadores de Accionistas
  const handleAccionistaChange = (index, field, value) => {
    setAccionistas((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const agregarAccionista = () => {
    setAccionistas((prev) => [...prev, { nombre: '', cuit: '', porcentaje: '' }]);
  };

  const eliminarAccionista = (index) => {
    if (accionistas.length === 1) return;
    setAccionistas((prev) => prev.filter((_, i) => i !== index));
  };

  // Suma de porcentajes controlando precisión de decimales
  const totalPorcentaje = Math.round(
    accionistas.reduce((acc, curr) => acc + (parseFloat(curr.porcentaje) || 0), 0) * 100
  ) / 100;

  // Obtención exacta de coordenadas ajustadas al escalado del Canvas
  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // Dibujo en Canvas
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoordinates(e);

    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0f172a';
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
    ctx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.font = '32px "Brush Script MT", cursive, sans-serif';
    ctx.fillStyle = '#0a2540';
    ctx.fillText(texto, 20, 60);
    return tempCanvas.toDataURL('image/png');
  };

  // Generador PDF optimizado con PDF-Lib
  // const handleGenerarPDF = async () => {
  //   if (!formData.solicitanteNombre || !formData.empresaNombre || !formData.cuit) {
  //     alert('Por favor, complete los campos obligatorios (*).');
  //     return;
  //   }

  //   if (modoFirma === 'dibujar' && !hasSignature) {
  //     alert('Por favor, dibuje su firma antes de continuar.');
  //     return;
  //   }

  //   if (modoFirma === 'texto' && !textoFirma.trim()) {
  //     alert('Por favor, ingrese el nombre para la firma aclarada.');
  //     return;
  //   }

  //   try {
  //     const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

  //     let firmaPngBase64 = '';
  //     if (modoFirma === 'dibujar' && canvasRef.current) {
  //       firmaPngBase64 = canvasRef.current.toDataURL('image/png');
  //     } else {
  //       firmaPngBase64 = obtenerImagenFirmaTexto(textoFirma);
  //     }

  //     const pdfDoc = await PDFDocument.create();
  //     const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  //     const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  //     let page = pdfDoc.addPage([595.28, 841.89]);
  //     let y = 790;
  //     const marginX = 45;
  //     const printWidth = 505.28;

  //     const checkNewPage = (neededSpace = 25) => {
  //       if (y - neededSpace < 45) {
  //         page = pdfDoc.addPage([595.28, 841.89]);
  //         y = 790;
  //       }
  //     };

  //     // Título Encabezado
  //     page.drawText('NÓMINA DE ADMINISTRADORES Y ACCIONISTAS', {
  //       x: marginX,
  //       y,
  //       size: 11.5,
  //       font: fontBold,
  //       color: rgb(0, 0, 0)
  //     });
  //     y -= 20;

  //     // Fecha
  //     const hoy = new Date();
  //     const meses = [
  //       'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  //       'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  //     ];
  //     const textoFecha = `San Salvador de Jujuy, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
  //     page.drawText(textoFecha, { x: 300, y, size: 9.5, font: fontRegular });
  //     y -= 25;

  //     // Destinatario
  //     page.drawText('AL COMITÉ EJECUTIVO DEL', { x: marginX, y, size: 9.5, font: fontBold });
  //     y -= 13;
  //     page.drawText('FONDO DE GARANTÍAS PÚBLICAS DE JUJUY (FOGAJUY)', { x: marginX, y, size: 9.5, font: fontBold });
  //     y -= 13;
  //     page.drawText('S____________/____________D', { x: marginX, y, size: 9.5, font: fontBold });
  //     y -= 22;

  //     // Párrafo Inicial
  //     const p1 = `Por medio de la presente, quien suscribe, ${formData.solicitanteNombre || ''}, en mi carácter de ${formData.cargo || '___________'} de la empresa/firma ${formData.empresaNombre || ''}, identificada con CUIT N° ${formData.cuit || ''}, con domicilio legal en ${formData.domicilioLegal || '___________'} y domicilio electrónico en ${formData.domicilioElectronico || '___________'}, y número de contacto ${formData.telefono || '___________'}, me dirijo a Uds. con el fin de informar la nómina de administradores y accionistas de la empresa representada.`;

  //     y = drawJustifiedParagraph(page, p1, marginX, y, printWidth, 9.5, fontRegular, pdfDoc, (newPage) => { page = newPage; });
  //     y -= 12;

  //     // Tabla Administradores
  //     checkNewPage(35);
  //     page.drawRectangle({ x: marginX, y: y - 3, width: printWidth, height: 15, color: rgb(0.92, 0.94, 0.96) });
  //     page.drawText('CARGO', { x: marginX + 5, y, size: 8, font: fontBold });
  //     page.drawText('NOMBRE Y APELLIDO ADMINISTRADORES', { x: marginX + 130, y, size: 8, font: fontBold });
  //     page.drawText('CUIT', { x: marginX + 390, y, size: 8, font: fontBold });
  //     y -= 16;

  //     const adminFiltrados = administradores.filter((a) => (a.nombre && a.nombre.trim() !== '') || (a.cargo && a.cargo.trim() !== ''));
  //     const adminsAImprimir = adminFiltrados.length > 0 ? adminFiltrados : [{ cargo: '-', nombre: '-', cuit: '-' }];

  //     adminsAImprimir.forEach((admin) => {
  //       checkNewPage(18);
  //       page.drawRectangle({ x: marginX, y: y - 3, width: printWidth, height: 14, borderColor: rgb(0.88, 0.88, 0.88), borderWidth: 0.5 });
  //       page.drawText((admin.cargo || '').substring(0, 24), { x: marginX + 5, y, size: 7.5, font: fontRegular });
  //       page.drawText((admin.nombre || '').substring(0, 50), { x: marginX + 130, y, size: 7.5, font: fontRegular });
  //       page.drawText(admin.cuit || '-', { x: marginX + 390, y, size: 7.5, font: fontRegular });
  //       y -= 14;
  //     });

  //     y -= 14;

  //     // Tabla Accionistas
  //     checkNewPage(35);
  //     page.drawRectangle({ x: marginX, y: y - 3, width: printWidth, height: 15, color: rgb(0.92, 0.94, 0.96) });
  //     page.drawText('NOMBRE Y APELLIDO ACCIONISTAS', { x: marginX + 5, y, size: 8, font: fontBold });
  //     page.drawText('CUIT', { x: marginX + 270, y, size: 8, font: fontBold });
  //     page.drawText('% TENENCIA', { x: marginX + 410, y, size: 8, font: fontBold });
  //     y -= 16;

  //     const accionistasFiltrados = accionistas.filter((a) => a.nombre && a.nombre.trim() !== '');
  //     const accionistasAImprimir = accionistasFiltrados.length > 0 ? accionistasFiltrados : [{ nombre: '-', cuit: '-', porcentaje: '0' }];

  //     accionistasAImprimir.forEach((acc) => {
  //       checkNewPage(18);
  //       page.drawRectangle({ x: marginX, y: y - 3, width: printWidth, height: 14, borderColor: rgb(0.88, 0.88, 0.88), borderWidth: 0.5 });
  //       page.drawText((acc.nombre || '').substring(0, 50), { x: marginX + 5, y, size: 7.5, font: fontRegular });
  //       page.drawText(acc.cuit || '-', { x: marginX + 270, y, size: 7.5, font: fontRegular });
  //       page.drawText(`${acc.porcentaje || 0}%`, { x: marginX + 415, y, size: 7.5, font: fontBold });
  //       y -= 14;
  //     });

  //     // Total Accionario
  //     checkNewPage(18);
  //     page.drawRectangle({ x: marginX, y: y - 3, width: printWidth, height: 15, color: rgb(0.96, 0.96, 0.96), borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5 });
  //     page.drawText('TOTAL ACCIONARIO', { x: marginX + 5, y, size: 8, font: fontBold });
  //     page.drawText(`${totalPorcentaje}%`, {
  //       x: marginX + 415,
  //       y,
  //       size: 8,
  //       font: fontBold,
  //       color: totalPorcentaje === 100 ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0)
  //     });
  //     y -= 20;

  //     // Cláusulas Legales
  //     const parrafosLegales = [
  //       "Declaro bajo juramento que la información y documentación presentada es fidedigna y actual, y que representa de manera veraz la situación jurídica, económica y financiera de la empresa/firma.",
  //       "Asimismo, reconozco que la presente solicitud no genera derechos adquiridos ni constituye aprobación alguna por parte del FOGAJUY hasta tanto el Comité Ejecutivo emita una resolución favorable.",
  //       "Me comprometo a suministrar en los plazos requeridos cualquier información o documentación adicional que pudiera ser requerida por el FOGAJUY para la correcta evaluación de esta solicitud.",
  //       "Autorizo expresamente al FOGAJUY a realizar las consultas necesarias ante organismos públicos, privados o entidades financieras a efectos de verificar la información suministrada.",
  //       "Sin otro particular, quedo a disposición para cualquier consulta adicional. Atentamente. –"
  //     ];

  //     for (const p of parrafosLegales) {
  //       y = drawJustifiedParagraph(page, p, marginX, y, printWidth, 8.5, fontRegular, pdfDoc, (newPage) => { page = newPage; });
  //       y -= 4;
  //     }

  //     checkNewPage(85);
  //     y -= 5;

  //     // Sección Firma
  //     const firmaImageBytes = await fetch(firmaPngBase64).then((res) => res.arrayBuffer());
  //     const firmaImage = await pdfDoc.embedPng(firmaImageBytes);

  //     page.drawImage(firmaImage, { x: marginX, y: y - 28, width: 120, height: 35 });
  //     y -= 32;
  //     page.drawText('Firma del solicitante: ____________________________', { x: marginX, y, size: 9, font: fontBold });
  //     y -= 12;
  //     page.drawText(`Nombre y Apellido: ${formData.solicitanteNombre || ''}`, { x: marginX, y, size: 8.5, font: fontRegular });
  //     y -= 11;
  //     page.drawText(`CUIT: ${formData.cuit || ''}`, { x: marginX, y, size: 8.5, font: fontRegular });
  //     y -= 11;
  //     page.drawText(`Cargo: ${formData.cargo || ''}`, { x: marginX, y, size: 8.5, font: fontRegular });

  //     const pdfBytes = await pdfDoc.save();
  //     const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
  //     const archivoPDF = new File([pdfBlob], 'Nomina_Administradores_y_Accionistas_FOGAJUY.pdf', { type: 'application/pdf' });

  //     if (onDocumentoGenerado) {
  //       onDocumentoGenerado(17, archivoPDF, { formData, administradores, accionistas });
  //     }

  //     onClose();
  //   } catch (error) {
  //     console.error('Error al generar PDF:', error);
  //     alert('Ocurrió un error al generar el PDF.');
  //   }
  // };

  const handleGenerarPDF = async () => {
    if (!formData.solicitanteNombre || !formData.empresaNombre || !formData.cuit) {
      alert('Por favor, complete los campos obligatorios (*).');
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
      // Obtenemos la firma en formato DataURL Base64 (PNG)
      let firmaPngBase64 = '';
      if (modoFirma === 'dibujar' && canvasRef.current) {
        firmaPngBase64 = canvasRef.current.toDataURL('image/png');
      } else {
        firmaPngBase64 = obtenerImagenFirmaTexto(textoFirma);
      }

      // Se utiliza la instancia importada estáticamente
      const pdfDoc = await PDFDocument.create();
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

      let page = pdfDoc.addPage([595.28, 841.89]);
      let y = 790;
      const marginX = 45;
      const printWidth = 505.28;

      const checkNewPage = (neededSpace = 25) => {
        if (y - neededSpace < 45) {
          page = pdfDoc.addPage([595.28, 841.89]);
          y = 790;
        }
      };

      // Título Encabezado
      page.drawText('NÓMINA DE ADMINISTRADORES Y ACCIONISTAS', {
        x: marginX,
        y,
        size: 11.5,
        font: fontBold,
        color: rgb(0, 0, 0)
      });
      y -= 20;

      // Fecha
      const hoy = new Date();
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      const textoFecha = `San Salvador de Jujuy, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
      page.drawText(textoFecha, { x: 300, y, size: 9.5, font: fontRegular });
      y -= 25;

      // Destinatario
      page.drawText('AL COMITÉ EJECUTIVO DEL', { x: marginX, y, size: 9.5, font: fontBold });
      y -= 13;
      page.drawText('FONDO DE GARANTÍAS PÚBLICAS DE JUJUY (FOGAJUY)', { x: marginX, y, size: 9.5, font: fontBold });
      y -= 13;
      page.drawText('S____________/____________D', { x: marginX, y, size: 9.5, font: fontBold });
      y -= 22;

      // Párrafo Inicial
      const p1 = `Por medio de la presente, quien suscribe, ${formData.solicitanteNombre || ''}, en mi carácter de ${formData.cargo || '___________'} de la empresa/firma ${formData.empresaNombre || ''}, identificada con CUIT N° ${formData.cuit || ''}, con domicilio legal en ${formData.domicilioLegal || '___________'} y domicilio electrónico en ${formData.domicilioElectronico || '___________'}, y número de contacto ${formData.telefono || '___________'}, me dirijo a Uds. con el fin de informar la nómina de administradores y accionistas de la empresa representada.`;

      y = drawJustifiedParagraph(page, p1, marginX, y, printWidth, 9.5, fontRegular, pdfDoc, (newPage) => { page = newPage; });
      y -= 12;

      // Tabla Administradores
      checkNewPage(35);
      page.drawRectangle({ x: marginX, y: y - 3, width: printWidth, height: 15, color: rgb(0.92, 0.94, 0.96) });
      page.drawText('CARGO', { x: marginX + 5, y, size: 8, font: fontBold });
      page.drawText('NOMBRE Y APELLIDO ADMINISTRADORES', { x: marginX + 130, y, size: 8, font: fontBold });
      page.drawText('CUIT', { x: marginX + 390, y, size: 8, font: fontBold });
      y -= 16;

      const adminFiltrados = administradores.filter((a) => (a.nombre && a.nombre.trim() !== '') || (a.cargo && a.cargo.trim() !== ''));
      const adminsAImprimir = adminFiltrados.length > 0 ? adminFiltrados : [{ cargo: '-', nombre: '-', cuit: '-' }];

      adminsAImprimir.forEach((admin) => {
        checkNewPage(18);
        page.drawRectangle({ x: marginX, y: y - 3, width: printWidth, height: 14, borderColor: rgb(0.88, 0.88, 0.88), borderWidth: 0.5 });
        page.drawText((admin.cargo || '').substring(0, 24), { x: marginX + 5, y, size: 7.5, font: fontRegular });
        page.drawText((admin.nombre || '').substring(0, 50), { x: marginX + 130, y, size: 7.5, font: fontRegular });
        page.drawText(admin.cuit || '-', { x: marginX + 390, y, size: 7.5, font: fontRegular });
        y -= 14;
      });

      y -= 14;

      // Tabla Accionistas
      checkNewPage(35);
      page.drawRectangle({ x: marginX, y: y - 3, width: printWidth, height: 15, color: rgb(0.92, 0.94, 0.96) });
      page.drawText('NOMBRE Y APELLIDO ACCIONISTAS', { x: marginX + 5, y, size: 8, font: fontBold });
      page.drawText('CUIT', { x: marginX + 270, y, size: 8, font: fontBold });
      page.drawText('% TENENCIA', { x: marginX + 410, y, size: 8, font: fontBold });
      y -= 16;

      const accionistasFiltrados = accionistas.filter((a) => a.nombre && a.nombre.trim() !== '');
      const accionistasAImprimir = accionistasFiltrados.length > 0 ? accionistasFiltrados : [{ nombre: '-', cuit: '-', porcentaje: '0' }];

      accionistasAImprimir.forEach((acc) => {
        checkNewPage(18);
        page.drawRectangle({ x: marginX, y: y - 3, width: printWidth, height: 14, borderColor: rgb(0.88, 0.88, 0.88), borderWidth: 0.5 });
        page.drawText((acc.nombre || '').substring(0, 50), { x: marginX + 5, y, size: 7.5, font: fontRegular });
        page.drawText(acc.cuit || '-', { x: marginX + 270, y, size: 7.5, font: fontRegular });
        page.drawText(`${acc.porcentaje || 0}%`, { x: marginX + 415, y, size: 7.5, font: fontBold });
        y -= 14;
      });

      // Total Accionario
      checkNewPage(18);
      page.drawRectangle({ x: marginX, y: y - 3, width: printWidth, height: 15, color: rgb(0.96, 0.96, 0.96), borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5 });
      page.drawText('TOTAL ACCIONARIO', { x: marginX + 5, y, size: 8, font: fontBold });
      page.drawText(`${totalPorcentaje}%`, {
        x: marginX + 415,
        y,
        size: 8,
        font: fontBold,
        color: totalPorcentaje === 100 ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0)
      });
      y -= 20;

      // Cláusulas Legales
      const parrafosLegales = [
        "Declaro bajo juramento que la información y documentación presentada es fidedigna y actual, y que representa de manera veraz la situación jurídica, económica y financiera de la empresa/firma.",
        "Asimismo, reconozco que la presente solicitud no genera derechos adquiridos ni constituye aprobación alguna por parte del FOGAJUY hasta tanto el Comité Ejecutivo emita una resolución favorable.",
        "Me comprometo a suministrar en los plazos requeridos cualquier información o documentación adicional que pudiera ser requerida por el FOGAJUY para la correcta evaluación de esta solicitud.",
        "Autorizo expresamente al FOGAJUY a realizar las consultas necesarias ante organismos públicos, privados o entidades financieras a efectos de verificar la información suministrada.",
        "Sin otro particular, quedo a disposición para cualquier consulta adicional. Atentamente. –"
      ];

      for (const p of parrafosLegales) {
        y = drawJustifiedParagraph(page, p, marginX, y, printWidth, 8.5, fontRegular, pdfDoc, (newPage) => { page = newPage; });
        y -= 4;
      }

      checkNewPage(85);
      y -= 5;

      // Inserción de la Imagen de Firma Gráfica
      const firmaImageBytes = await fetch(firmaPngBase64).then((res) => res.arrayBuffer());
      const firmaImage = await pdfDoc.embedPng(firmaImageBytes);

      page.drawImage(firmaImage, { x: marginX, y: y - 28, width: 120, height: 35 });
      y -= 32;
      page.drawText('Firma del solicitante: ____________________________', { x: marginX, y, size: 9, font: fontBold });
      y -= 12;
      page.drawText(`Nombre y Apellido: ${formData.solicitanteNombre || ''}`, { x: marginX, y, size: 8.5, font: fontRegular });
      y -= 11;
      page.drawText(`CUIT: ${formData.cuit || ''}`, { x: marginX, y, size: 8.5, font: fontRegular });
      y -= 11;
      page.drawText(`Cargo: ${formData.cargo || ''}`, { x: marginX, y, size: 8.5, font: fontRegular });

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const archivoPDF = new File([pdfBlob], 'Nomina_Administradores_y_Accionistas_FOGAJUY.pdf', { type: 'application/pdf' });

      if (onDocumentoGenerado) {
        onDocumentoGenerado(17, archivoPDF, { formData, administradores, accionistas });
      }

      onClose();
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Ocurrió un error al generar el PDF.');
    }
  };

  const wrapText = (text, font, fontSize, maxWidth) => {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (font.widthOfTextAtSize(testLine, fontSize) <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const drawJustifiedParagraph = (pageRef, text, x, y, maxWidth, fontSize, font, pdfDoc, onNewPage) => {
    const lines = wrapText(text, font, fontSize, maxWidth);
    let currentY = y;
    let currentPage = pageRef;

    lines.forEach((line, index) => {
      if (currentY < 45) {
        currentPage = pdfDoc.addPage([595.28, 841.89]);
        onNewPage(currentPage);
        currentY = 790;
      }

      const isLastLine = index === lines.length - 1;
      const words = line.split(' ');

      if (isLastLine || words.length === 1) {
        currentPage.drawText(line, { x, y: currentY, size: fontSize, font });
      } else {
        const totalWordWidth = words.reduce((acc, w) => acc + font.widthOfTextAtSize(w, fontSize), 0);
        const spacing = (maxWidth - totalWordWidth) / (words.length - 1);

        let currentX = x;
        words.forEach((word) => {
          currentPage.drawText(word, { x: currentX, y: currentY, size: fontSize, font });
          currentX += font.widthOfTextAtSize(word, fontSize) + spacing;
        });
      }

      currentY -= fontSize * 1.3;
    });

    return currentY;
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(3px)'
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '95%', maxWidth: '750px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginTop: 0, color: '#0f172a', fontSize: '1.25rem', fontWeight: 600 }}>Nómina de Administradores y Accionistas</h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Complete los campos requeridos para la generación de la nota oficial FOGAJUY.</p>

        {/* DATOS ENCABEZADO */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Solicitante (Nombre Completo) *</label>
            <input type="text" name="solicitanteNombre" value={formData.solicitanteNombre} onChange={handleChange} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Cargo / Función *</label>
            <input type="text" name="cargo" value={formData.cargo} onChange={handleChange} placeholder="Ej: Socio Gerente / Presidente" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Empresa / Firma *</label>
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
            <label style={labelStyle}>Domicilio Electrónico</label>
            <input type="email" name="domicilioElectronico" value={formData.domicilioElectronico} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ gridColumn: 'span 2' }}>
            <label style={labelStyle}>Teléfono de Contacto</label>
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} style={inputStyle} />
          </div>
        </div>

        {/* TABLA ADMINISTRADORES */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>1. Órgano de Administración</h4>
            <button type="button" onClick={agregarAdministrador} style={btnAgregarStyle}>+ Agregar Fila</button>
          </div>
          <div style={tableContainerStyle}>
            {administradores.map((admin, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                <input
                  type="text"
                  placeholder="Cargo"
                  value={admin.cargo}
                  onChange={(e) => handleAdminChange(idx, 'cargo', e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Nombre y Apellido"
                  value={admin.nombre}
                  onChange={(e) => handleAdminChange(idx, 'nombre', e.target.value)}
                  style={{ ...inputStyle, flex: 2 }}
                />
                <input
                  type="text"
                  placeholder="CUIT"
                  value={admin.cuit}
                  onChange={(e) => handleAdminChange(idx, 'cuit', e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                {administradores.length > 1 && (
                  <button type="button" onClick={() => eliminarAdministrador(idx)} style={btnEliminarStyle}>✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TABLA ACCIONISTAS */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>2. Nómina de Accionistas</h4>
            <button type="button" onClick={agregarAccionista} style={btnAgregarStyle}>+ Agregar Fila</button>
          </div>
          <div style={tableContainerStyle}>
            {accionistas.map((acc, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                <input
                  type="text"
                  placeholder="Nombre y Apellido Accionista"
                  value={acc.nombre}
                  onChange={(e) => handleAccionistaChange(idx, 'nombre', e.target.value)}
                  style={{ ...inputStyle, flex: 2 }}
                />
                <input
                  type="text"
                  placeholder="CUIT"
                  value={acc.cuit}
                  onChange={(e) => handleAccionistaChange(idx, 'cuit', e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input
                  type="number"
                  placeholder="% Tenencia"
                  value={acc.porcentaje}
                  onChange={(e) => handleAccionistaChange(idx, 'porcentaje', e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                {accionistas.length > 1 && (
                  <button type="button" onClick={() => eliminarAccionista(idx)} style={btnEliminarStyle}>✕</button>
                )}
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', paddingRight: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              <span>Total Accionario: <span style={{ color: totalPorcentaje === 100 ? '#16a34a' : '#dc2626' }}>{totalPorcentaje}%</span></span>
            </div>
          </div>
        </div>

        {/* FIRMA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#334155' }}>Firma del Solicitante *</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setModoFirma('dibujar')}
              style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: modoFirma === 'dibujar' ? '#0284c7' : '#fff', color: modoFirma === 'dibujar' ? '#fff' : '#334155', cursor: 'pointer' }}
            >
              ✍️ Trazo manual
            </button>
            <button
              type="button"
              onClick={() => setModoFirma('texto')}
              style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', background: modoFirma === 'texto' ? '#0284c7' : '#fff', color: modoFirma === 'texto' ? '#fff' : '#334155', cursor: 'pointer' }}
            >
              🔤 Escribir nombre
            </button>
          </div>
        </div>

        {modoFirma === 'dibujar' ? (
          <div>
            <div style={{ border: '1px dashed #94a3b8', borderRadius: '8px', marginBottom: '4px', backgroundColor: '#f8fafc' }}>
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
              placeholder="Escriba su Nombre y Apellido para la firma..."
              style={{ ...inputStyle, fontFamily: 'cursive', fontSize: '1.2rem', fontStyle: 'italic', padding: '10px' }}
            />
          </div>
        )}

        {/* ACCIONES */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}>
            Cancelar
          </button>
          <button type="button" onClick={handleGenerarPDF} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0284c7', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
            Generar PDF Oficial
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: '0.78rem',
  fontWeight: '600',
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

const tableContainerStyle = {
  border: '1px solid #e2e8f0',
  borderRadius: '6px',
  padding: '8px',
  backgroundColor: '#f8fafc'
};

const btnAgregarStyle = {
  background: '#e0f2fe',
  color: '#0369a1',
  border: 'none',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  fontWeight: '600',
  cursor: 'pointer'
};

const btnEliminarStyle = {
  background: '#fee2e2',
  color: '#dc2626',
  border: 'none',
  borderRadius: '4px',
  padding: '4px 8px',
  cursor: 'pointer',
  fontWeight: 'bold'
};