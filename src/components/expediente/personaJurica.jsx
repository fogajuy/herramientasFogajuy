import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import JSZip from 'jszip';

// Importación de Modales
import ModalNotaSolicitud from '../helpers/modalNotaSolicitud';
import ModalDDJJGrupoEconomico from '../helpers/modalDDJJGrupoEconomico';
import ModalDDJJDeudaPostBalance from '../helpers/modalDDJJDeudaPostBalance';
import ModalFlujoFondos from '../helpers/modalFlujoFondos';
import ModalInformacionAdicional from '../helpers/modalInformacionAdicional';
import ModalNominaAdministradores from '../helpers/modalNominaAdministradores';
import ModalDDJJPEP from '../helpers/modalDDJJPEP';
import ModalDDJJLicitudFondos from '../helpers/modalDDJJLicitudFondos';
import ModalBeneficiarioFinal from '../helpers/modalDDJJBeneficiarioFinal';

import Navbar from '../navBar/navBar';
import '../../styles/personaJuridica.css';

const REQUISITOS_JURIDICA = [
  { id: 0, titulo: "0. Nota de Solicitud", descripcion: "Nota de solicitud de garantía preferida del FOGAJUY." },
  { id: 1, titulo: "1. IGJ", descripcion: "Fecha y número de inscripción ante IGJ." },
  { id: 2, titulo: "2. Estatuto", descripcion: "Fotocopia de estatuto (certificada y legalizada)." },
  { id: 3, titulo: "3. Contrato Social", descripcion: "Fotocopia de contrato social y sus modificaciones (certificada y legalizada)." },
  { id: 4, titulo: "4. Acta de Designación", descripcion: "Fotocopia de acta de designación de directorio (certificada y legalizada)." },
  { id: 5, titulo: "5. Poder del Representante Legal", descripcion: "Fotocopia de poder otorgado al representante legal (certificada y legalizada)." },
  { id: 6, titulo: "6. DNI Firmante y Accionistas", descripcion: "Fotocopia DNI del firmante y accionistas." },
  { id: 7, titulo: "7. Acta Trámite FOGAJUY", descripcion: "Fotocopia de acta autorizando trámite ante FOGAJUY, firma de convenio y conformación de contragarantías (certificada y legalizada)." },
  { id: 8, titulo: "8. DDJJ PEP Firmante, Accionistas y Fiadores", descripcion: "Declaración Jurada de Persona Expuesta Políticamente de firmantes, accionistas y fiadores." },
  { id: 9, titulo: "9. Nómina de Órgano de Administración y Nómina de Accionistas", descripcion: "Nómina de integrantes del órgano de administración o equivalente y Nómina de accionistas y porcentaje de participación." },
  { id: 10, titulo: "10. DDJJ Grupo Económico", descripcion: "Declaración Jurada de Grupo Económico." },
  { id: 11, titulo: "11. DDJJ Ingresos y Deudas Post Balances", descripcion: "Declaración Jurada de Ingresos y Deudas Post Balances." },
  { id: 12, titulo: "12. DDJJ Beneficiario Final", descripcion: "Declaración Jurada de Beneficiario Final." },
  { id: 13, titulo: "13. DDJJ Licitud Fondos", descripcion: "Declaración Jurada de Licitud de uso de fondos." },
  { id: 14, titulo: "14. Constancia AFIP", descripcion: "Inscripción en AFIP vigente." },
  { id: 15, titulo: "15. Constancia Rentas", descripcion: "Inscripción provincial / Rentas." },
  { id: 16, titulo: "16. DDJJ IIBB / Convenio (Últimos 12)", descripcion: "Declaraciones juradas de Ingresos Brutos/Convenio Multilateral del último año." },
  { id: 17, titulo: "17. Constancia Regularización Fiscal Rentas", descripcion: "Certificado de libre deuda o regularización." },
  { id: 18, titulo: "18. Libre Deuda Previsional", descripcion: "Certificado de libre deuda o regularización o formulario F522A." },
  { id: 19, titulo: "19. DDJJ Ganancias (Últimos 2)", descripcion: "Declaraciones juradas de Ganancias presentadas." },
  { id: 20, titulo: "20. DDJJ Acciones / Bienes (Últimos 2)", descripcion: "Declaraciones de Acciones y/o Bienes Personales." },
  { id: 21, titulo: "21. EECC e Informe de Auditor", descripcion: "2 últimos Estados Contables e Informe de Auditor (certificados por Colegio de Contadores)." },
  { id: 22, titulo: "22. Veraz / Nosis Empresa", descripcion: "Informe comercial de la empresa." },
  { id: 23, titulo: "23. Contragarantía", descripcion: "En caso de hipoteca adjuntar cédula parcelaria, boleto de compra venta, tasación. En caso de prenda adjuntar título, informe de dominio y tasación." },
  { id: 24, titulo: "24. Fiador/es Solidario/s", descripcion: "DNI, Constancia de CUIT." },
  { id: 25, titulo: "22. Veraz / Nosis Fiador/es", descripcion: "Informe comercial de fiadores." },
  { id: 26, titulo: "26. Información Adicional", descripcion: "Planos, fotos, presupuestos, etc." },
  { id: 27, titulo: "27. Flujo de Fondos", descripcion: "Proyección por plazo igual o superior a la vida del crédito." }
];

const FORMATOS_PERMITIDOS = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/jpg'
];

const EXTENSIONES_PERMITIDAS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];

export default function PersonaJuridica({ datosClienteProps }) {
  const location = useLocation();
  const navigate = useNavigate();

  const datosCliente = location.state?.datosCliente || datosClienteProps || null;

  const [archivos, setArchivos] = useState({});
  const [generandoZip, setGenerandoZip] = useState(false);

  // Estados Modales
  const [isModalNotaOpen, setIsModalNotaOpen] = useState(false);
  const [isModalGrupoOpen, setIsModalGrupoOpen] = useState(false);
  const [isModalDeudaOpen, setIsModalDeudaOpen] = useState(false);
  const [isModalPEPOpen, setIsModalPEPOpen] = useState(false);
  const [isModalLicitudOpen, setIsModalLicitudOpen] = useState(false);

  const [isModalBeneficiarioOpen, setIsModalBeneficiarioOpen] = useState(false);
  const [datosBeneficiarioGuardados, setDatosBeneficiarioGuardados] = useState(null);

  const [isModalFlujoOpen, setIsModalFlujoOpen] = useState(false);
  const [datosFlujoGuardados, setDatosFlujoGuardados] = useState(null);

  const [isModalInfoAdicionalOpen, setIsModalInfoAdicionalOpen] = useState(false);
  const [datosInfoAdicionalGuardados, setDatosInfoAdicionalGuardados] = useState(null);

  const [isModalNominaOpen, setIsModalNominaOpen] = useState(false);
  const [datosNominaGuardados, setDatosNominaGuardados] = useState(null);

  // Helper robusto para convertir imágenes a PDF utilizando pdf-lib
  const convertirImagenAPdf = async (archivo) => {
    try {
      const pdfDoc = await PDFDocument.create();
      const arrayBuffer = await archivo.arrayBuffer();
      let image;

      const nombreLower = archivo.name.toLowerCase();
      const esJpg = archivo.type === 'image/jpeg' || nombreLower.endsWith('.jpg') || nombreLower.endsWith('.jpeg');
      const esPng = archivo.type === 'image/png' || nombreLower.endsWith('.png');

      if (esJpg) {
        image = await pdfDoc.embedJpg(arrayBuffer);
      } else if (esPng) {
        image = await pdfDoc.embedPng(arrayBuffer);
      } else {
        return archivo;
      }

      // Ajuste de página adaptado a dimensiones de imagen manteniendo escala legible
      const originalWidth = image.width;
      const originalHeight = image.height;
      
      const page = pdfDoc.addPage([originalWidth, originalHeight]);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: originalWidth,
        height: originalHeight,
      });

      const pdfBytes = await pdfDoc.save();
      const nombreSinExt = archivo.name.substring(0, archivo.name.lastIndexOf('.')) || archivo.name;
      return new File([pdfBytes], `${nombreSinExt}.pdf`, { type: 'application/pdf' });
    } catch (err) {
      console.error('Error al convertir imagen a PDF:', err);
      return archivo;
    }
  };

  // Handlers para archivos y modales
  const handleDocumentoGenerado = (reqId, archivoPDF) => {
    setArchivos((prev) => ({
      ...prev,
      [reqId]: [archivoPDF]
    }));
  };

  const handleAgregarPEPGenerado = (archivoPDF) => {
    if (!archivoPDF) return;
    setArchivos((prev) => {
      const listaExistente = prev[8] || [];
      return {
        ...prev,
        8: [...listaExistente, archivoPDF]
      };
    });
  };

  const handleAgregarLicitudGenerado = (archivoPDF) => {
    if (!archivoPDF) return;
    setArchivos((prev) => {
      const listaExistente = prev[13] || [];
      return {
        ...prev,
        13: [...listaExistente, archivoPDF]
      };
    });
  };

  const handleAgregarArchivos = async (reqId, e) => {
    const nuevosArchivos = Array.from(e.target.files);
    if (nuevosArchivos.length === 0) return;

    const archivosProcesados = [];
    const archivosRechazados = [];

    for (const file of nuevosArchivos) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const esTipoValido = FORMATOS_PERMITIDOS.includes(file.type) || EXTENSIONES_PERMITIDAS.includes(ext);

      if (!esTipoValido) {
        archivosRechazados.push(file.name);
        continue;
      }

      const esImagen = file.type.startsWith('image/') || ['.jpg', '.jpeg', '.png'].includes(ext);
      if (esImagen) {
        const pdfConvertido = await convertirImagenAPdf(file);
        archivosProcesados.push(pdfConvertido);
      } else {
        archivosProcesados.push(file);
      }
    }

    if (archivosRechazados.length > 0) {
      alert(`⚠️ Formato no permitido:\n\nLos siguientes archivos fueron rechazados por no cumplir con el formato requerido:\n• ${archivosRechazados.join('\n• ')}\n\nFormatos válidos: PDF, Word, Excel e Imágenes.`);
    }

    if (archivosProcesados.length > 0) {
      setArchivos((prev) => {
        const acumulados = prev[reqId] || [];
        return {
          ...prev,
          [reqId]: [...acumulados, ...archivosProcesados]
        };
      });
    }

    e.target.value = null;
  };

  const handleEliminarArchivo = (reqId, indexFile) => {
    setArchivos((prev) => {
      const actualList = prev[reqId] || [];
      const filtrados = actualList.filter((_, idx) => idx !== indexFile);

      if (filtrados.length === 0) {
        const copia = { ...prev };
        delete copia[reqId];
        return copia;
      }

      return {
        ...prev,
        [reqId]: filtrados
      };
    });
  };

  const totalRequisitos = REQUISITOS_JURIDICA.length;
  const RequisitosCompletados = Object.keys(archivos).length;
  const porcentajeProgreso = Math.round((RequisitosCompletados / totalRequisitos) * 100);

  // Función para Descargar Carpeta ZIP (Soporta todos los archivos cargados, incluidos Excel y Word)
  const handleDescargarZip = async () => {
    if (Object.keys(archivos).length === 0) {
      alert('No hay archivos cargados para compilar en el archivo ZIP.');
      return;
    }

    try {
      setGenerandoZip(true);
      const zip = new JSZip();
      const razonSocialSanitizada = (datosCliente?.razonSocial || datosCliente?.nombre || 'Persona_Juridica').replace(/[^a-zA-Z0-9_-]/g, '_');
      const carpetaRaiz = zip.folder(`Archivos_${razonSocialSanitizada}`);

      for (const req of REQUISITOS_JURIDICA) {
        const listaFiles = archivos[req.id];
        if (listaFiles && listaFiles.length > 0) {
          const nombreSubCarpeta = `${String(req.id).padStart(2, '0')}_${req.titulo.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
          const subFolder = carpetaRaiz.folder(nombreSubCarpeta);

          for (let i = 0; i < listaFiles.length; i++) {
            const file = listaFiles[i];
            const arrayBuffer = await file.arrayBuffer();
            subFolder.file(file.name, arrayBuffer);
          }
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Archivos_Originales_${razonSocialSanitizada}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al generar el archivo ZIP:', error);
      alert('Ocurrió un error al generar la carpeta ZIP.');
    } finally {
      setGenerandoZip(false);
    }
  };

    // Función Principal de Compilación PDF con validación y alerta para Word/Excel
  const handleGenerar = async () => {
    try {
      // 1. Detectar si existen archivos Excel o Word en el checklist actual
      const archivosNoCompilables = [];
      
      Object.keys(archivos).forEach((reqId) => {
        const lista = archivos[reqId];
        const reqInfo = REQUISITOS_JURIDICA.find(r => r.id === Number(reqId));
        
        lista.forEach(file => {
          const nameLower = file.name.toLowerCase();
          const esExcelOrWord = nameLower.endsWith('.xls') || 
                                nameLower.endsWith('.xlsx') || 
                                nameLower.endsWith('.doc') || 
                                nameLower.endsWith('.docx');
          
          if (esExcelOrWord) {
            archivosNoCompilables.push(`• [Ít. ${reqInfo?.titulo || reqId}] ${file.name}`);
          }
        });
      });

      if (archivosNoCompilables.length > 0) {
        const confirmar = window.confirm(
          `⚠️ Atención: Archivos no compatibles con el visor PDF\n\n` +
          `Se detectaron los siguientes archivos de Word o Excel que no pueden ser integrados directamente dentro de la compilación en PDF:\n\n` +
          `${archivosNoCompilables.join('\n')}\n\n` +
          `💡 Solución: Puede descargarlos todos juntos usando el botón "Descargar Todos los Archivos (ZIP)", o bien eliminar estos archivos específicos del checklist para poder generar el expediente PDF completo.`
        );
        return;
      }

      const pdfFinal = await PDFDocument.create();
      const fontHelvetica = await pdfFinal.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfFinal.embedFont(StandardFonts.HelveticaBold);

      const cumplidos = [];
      const faltantes = [];

      REQUISITOS_JURIDICA.forEach((item) => {
        const tieneFiles = archivos[item.id] && archivos[item.id].length > 0;
        if (tieneFiles) {
          cumplidos.push(item);
        } else {
          faltantes.push(item);
        }
      });

      const totalReq = REQUISITOS_JURIDICA.length;
      const totalCumplidos = cumplidos.length;
      const porcentaje = Math.round((totalCumplidos / totalReq) * 100);
      const fechaHora = new Date().toLocaleString('es-AR', {
        dateStyle: 'long',
        timeStyle: 'medium'
      });

      // Página inicial del Reporte
      const reportPage = pdfFinal.addPage([595.28, 841.89]);
      let y = 790;

      reportPage.drawText('FOGAJUY - REPORTE DE ESTADO DE EXPEDIENTE', {
        x: 50,
        y,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.4)
      });
      y -= 25;

      reportPage.drawText('EXPEDIENTE COMPILADO - PERSONA JURÍDICA', {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.3)
      });
      y -= 15;

      reportPage.drawLine({
        start: { x: 50, y },
        end: { x: 545, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8)
      });
      y -= 25;

      const razonSocial = datosCliente?.razonSocial || datosCliente?.nombre || 'No especificado';

      reportPage.drawText(`Cliente / Razón Social: ${razonSocial}`, { x: 50, y, size: 10, font: fontBold });
      y -= 15;
      reportPage.drawText(`Fecha de Armado: ${fechaHora}`, { x: 50, y, size: 10, font: fontHelvetica });
      y -= 15;
      reportPage.drawText(`Estado del Checklist: ${totalCumplidos} de ${totalReq} ítems completados (${porcentaje}%)`, { x: 50, y, size: 10, font: fontHelvetica });
      y -= 15;

      // Anexar y Copiar los PDF adjuntos
      let paginasAdjuntasCount = 0;

      for (const reqId of Object.keys(archivos)) {
        const listaArchivos = archivos[reqId];

        for (const archivo of listaArchivos) {
          const esPdf = archivo.type === 'application/pdf' || (archivo.name && archivo.name.toLowerCase().endsWith('.pdf'));

          if (esPdf) {
            try {
              const arrayBuffer = await archivo.arrayBuffer();
              const pdfAInsertar = await PDFDocument.load(arrayBuffer);
              const paginasCopiadas = await pdfFinal.copyPages(
                pdfAInsertar,
                pdfAInsertar.getPageIndices()
              );

              paginasCopiadas.forEach((pagina) => {
                pdfFinal.addPage(pagina);
                paginasAdjuntasCount++;
              });
            } catch (err) {
              console.warn(`No se pudo procesar el archivo ${archivo.name}:`, err);
            }
          }
        }
      }

      const totalPaginasFinal = 1 + paginasAdjuntasCount;
      reportPage.drawText(`Total de Páginas del Expediente: ${totalPaginasFinal} página(s)`, { 
        x: 50, 
        y, 
        size: 10, 
        font: fontBold, 
        color: rgb(0.1, 0.4, 0.2) 
      });
      y -= 30;

      reportPage.drawText(`REQUISITOS FALTANTES (${faltantes.length}):`, {
        x: 50,
        y,
        size: 11,
        font: fontBold,
        color: rgb(0.7, 0.1, 0.1)
      });
      y -= 15;

      if (faltantes.length === 0) {
        reportPage.drawText('✓ Checklist 100% Completo. No se registran requisitos faltantes.', {
          x: 60,
          y,
          size: 9,
          font: fontHelvetica,
          color: rgb(0, 0.5, 0)
        });
        y -= 15;
      } else {
        faltantes.forEach((item) => {
          if (y > 60) {
            reportPage.drawText(`• ${item.titulo}`, {
              x: 60,
              y,
              size: 8.5,
              font: fontHelvetica,
              color: rgb(0.3, 0.3, 0.3)
            });
            y -= 13;
          }
        });
      }

      y -= 15;
      reportPage.drawLine({
        start: { x: 50, y },
        end: { x: 545, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8)
      });
      y -= 25;

      reportPage.drawText('DOCUMENTACIÓN ADJUNTA COMPILADA EN LAS PÁGINAS SIGUIENTES', {
        x: 50,
        y,
        size: 9,
        font: fontBold,
        color: rgb(0.4, 0.4, 0.4)
      });

      // --- FOLIADO Y NUMERACIÓN DE HOJAS CON DETECCIÓN DE ORIENTACIÓN HORIZONTAL ---
      const todasLasPaginas = pdfFinal.getPages();
      const totalPages = todasLasPaginas.length;

      for (let i = 0; i < totalPages; i++) {
        const page = todasLasPaginas[i];
        const { width, height } = page.getSize();
        const esHorizontal = width > height;
        
        const numeroPagina = String(i + 1);
        const radioCirculo = 26;
        
        // Ajuste dinámico de coordenadas en base a las dimensiones de la página
        const centerX = esHorizontal ? width - 45 : width - 50;
        const centerY = esHorizontal ? height - 45 : height - 50;

        page.drawCircle({
          x: centerX,
          y: centerY,
          size: radioCirculo,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1.5,
          color: undefined,
        });

        const fontSizeNum = 14;
        const textWidthNum = fontBold.widthOfTextAtSize(numeroPagina, fontSizeNum);
        
        page.drawText(numeroPagina, {
          x: centerX - (textWidthNum / 2),
          y: centerY - 5,
          size: fontSizeNum,
          font: fontBold, 
          color: rgb(0, 0, 0)
        });

        const textoLeyenda = "FOGAJUY";
        const fontSizeLeyenda = 7;
        const textRadius = radioCirculo - 8;
        
        const angleStep = 18;
        const startAngle = 90 + ((textoLeyenda.length - 1) / 2) * angleStep; 

        for (let j = 0; j < textoLeyenda.length; j++) {
          const char = textoLeyenda[j];
          
          const thetaDeg = startAngle - (j * angleStep);
          const thetaRad = thetaDeg * (Math.PI / 180);

          const x = centerX + textRadius * Math.cos(thetaRad);
          const yPos = centerY + textRadius * Math.sin(thetaRad);

          const charWidth = fontBold.widthOfTextAtSize(char, fontSizeLeyenda);
          const baselineAngleRad = (thetaDeg - 90) * (Math.PI / 180);
          
          const offsetX = - (charWidth / 2) * Math.cos(baselineAngleRad);
          const offsetY = - (charWidth / 2) * Math.sin(baselineAngleRad);

          page.drawText(char, {
            x: x + offsetX,
            y: yPos + offsetY,
            size: fontSizeLeyenda,
            font: fontBold,
            color: rgb(0, 0, 0),
            rotate: degrees(thetaDeg - 90),
          });
        }
      }

      const pdfBytes = await pdfFinal.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);

      navigate('/expedientePDF', {
        state: {
          pdfUrl: pdfUrl,
          nombreArchivo: 'Expediente_Persona_Juridica.pdf'
        }
      });

    } catch (error) {
      console.error('Error al compilar el PDF:', error);
      alert('Ocurrió un error al armar el expediente. Verificá que los archivos no estén dañados.');
    }
  };

  const renderBotonesSubida = (item, tieneArchivos) => {
    switch (item.id) {
      case 0:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              type="button"
              className="btn-upload" 
              onClick={() => setIsModalNotaOpen(true)}
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
            >
              {tieneArchivos ? '📝 Editar / Regenerar Nota' : '📝 Llenar y Generar Nota'}
            </button>
            <input
              type="file"
              id={`file-input-${item.id}`}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar Archivo
            </label>
          </div>
        );
      
      case 8:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              type="button"
              className="btn-upload" 
              onClick={() => setIsModalPEPOpen(true)}
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
            >
              📝 Generar DDJJ PEP para un Declarante
            </button>
            <input
              type="file"
              id={`file-input-${item.id}`}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label htmlFor={`file-input-${item.id}`} className="btn-upload" style={{ background: '#f1f5f9', color: '#334155', textAlign: 'center', cursor: 'pointer' }}>
              📎 Adjuntar Archivo
            </label>
          </div>
        );

      case 9:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              type="button"
              className="btn-upload" 
              onClick={() => setIsModalNominaOpen(true)}
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
            >
              {tieneArchivos ? '📝 Editar / Regenerar Nóminas' : '📝 Llenar y Generar Nóminas'}
            </button>
            <input
              type="file"
              id={`file-input-${item.id}`}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar Archivo
            </label>
          </div>
        );

      case 10:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              type="button"
              className="btn-upload" 
              onClick={() => setIsModalGrupoOpen(true)}
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
            >
              {tieneArchivos ? '📝 Editar / Regenerar DDJJ' : '📝 Llenar y Generar DDJJ'}
            </button>
            <input
              type="file"
              id={`file-input-${item.id}`}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar Archivo
            </label>
          </div>
        );

      case 11:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              type="button"
              className="btn-upload" 
              onClick={() => setIsModalDeudaOpen(true)}
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
            >
              {tieneArchivos ? '📝 Editar / Regenerar DDJJ' : '📝 Llenar y Generar DDJJ'}
            </button>
            <input
              type="file"
              id={`file-input-${item.id}`}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar Archivo
            </label>
          </div>
        );

      case 12:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              type="button"
              className="btn-upload" 
              onClick={() => setIsModalBeneficiarioOpen(true)}
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
            >
              {tieneArchivos ? '📝 Editar / Regenerar Beneficiario Final' : '📝 Llenar y Generar Beneficiario Final'}
            </button>
            <input
              type="file"
              id={`file-input-${item.id}`}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar Archivo
            </label>
          </div>
        );

      case 13:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              type="button"
              className="btn-upload" 
              onClick={() => setIsModalLicitudOpen(true)}
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
            >
              📝 Generar DDJJ Licitud de Fondos
            </button>
            <input
              type="file"
              id={`file-input-${item.id}`}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar Archivo
            </label>
          </div>
        );

      case 26:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              type="button"
              className="btn-upload" 
              onClick={() => setIsModalInfoAdicionalOpen(true)}
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
            >
              {tieneArchivos ? '📝 Editar / Regenerar Info Adicional' : '📝 Llenar y Generar Info Adicional'}
            </button>
            <input
              type="file"
              id={`file-input-${item.id}`}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar Archivo
            </label>
          </div>
        );

      case 27:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
              type="button"
              className="btn-upload" 
              onClick={() => setIsModalFlujoOpen(true)}
              style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
            >
              {tieneArchivos ? '📝 Editar / Regenerar Flujo' : '📝 Cargar Flujo de Fondos'}
            </button>
            <input
              type="file"
              id={`file-input-${item.id}`}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar Archivo
            </label>
          </div>
        );

      default:
        return (
          <>
            <input
              type="file"
              id={`file-input-${item.id}`}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label htmlFor={`file-input-${item.id}`} className="btn-upload" style={{ cursor: 'pointer' }}>
              {tieneArchivos ? '+ Adjuntar otro archivo' : '📎 Adjuntar Archivo(s)'}
            </label>
          </>
        );
    }
  };

  return (
    <div className="juridica-container">
      <Navbar /> 

      <section className="progreso-section">
        <div className="progreso-info">
          <span>Progreso: <strong>{RequisitosCompletados} de {totalRequisitos} ítems completados</strong></span>
          <span className="porcentaje">{porcentajeProgreso}%</span>
        </div>
        <div className="bar-container">
          <div className="bar-fill" style={{ width: `${porcentajeProgreso}%` }}></div>
        </div>
      </section>

      <section className="checklist-container">
        <h3>Lista de Control de Documentación</h3>
        <p className="checklist-subtext">Podés adjuntar uno o varios archivos por cada ítem. Formatos aceptados: PDF, Word, Excel e Imágenes.</p>

        <div className="requisitos-grid">
          {REQUISITOS_JURIDICA.map((item) => {
            const listaArchivos = archivos[item.id] || [];
            const tieneArchivos = listaArchivos.length > 0;

            return (
              <div key={item.id} className={`requisito-card ${tieneArchivos ? 'completado' : ''}`}>
                <div className="requisito-head">
                  <span className={`status-badge ${tieneArchivos ? 'ok' : 'pending'}`}>
                    {tieneArchivos ? `✓ ${listaArchivos.length} Adjunto(s)` : 'Pendiente'}
                  </span>
                  <h4>{item.titulo}</h4>
                </div>

                <p className="requisito-desc">{item.descripcion}</p>

                {tieneArchivos && (
                  <div className="archivos-lista">
                    {listaArchivos.map((file, idx) => (
                      <div key={idx} className="file-chip">
                        <span className="file-name" title={file.name}>📄 {file.name}</span>
                        <button 
                          type="button"
                          className="btn-eliminar-file"
                          onClick={() => handleEliminarArchivo(item.id, idx)}
                          title="Eliminar este archivo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="upload-area">
                  {renderBotonesSubida(item, tieneArchivos)}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODALES */}
      <ModalNotaSolicitud
        isOpen={isModalNotaOpen}
        onClose={() => setIsModalNotaOpen(false)}
        datosCliente={datosCliente}
        onDocumentoGenerado={handleDocumentoGenerado}
      />

      <ModalDDJJGrupoEconomico
        isOpen={isModalGrupoOpen}
        onClose={() => setIsModalGrupoOpen(false)}
        datosCliente={datosCliente}
        onDocumentoGenerado={handleDocumentoGenerado}
      />

      <ModalDDJJDeudaPostBalance
        isOpen={isModalDeudaOpen}
        onClose={() => setIsModalDeudaOpen(false)}
        datosCliente={datosCliente}
        onDocumentoGenerado={handleDocumentoGenerado}
      />

      <ModalFlujoFondos
        isOpen={isModalFlujoOpen}
        onClose={() => setIsModalFlujoOpen(false)}
        datosCliente={datosCliente}
        datosGuardados={datosFlujoGuardados}
        onDocumentoGenerado={(reqId, archivoPdf, estadoFormulario) => {
          handleDocumentoGenerado(reqId, archivoPdf);
          if (estadoFormulario) {
            setDatosFlujoGuardados(estadoFormulario);
          }
        }}
      />

      <ModalInformacionAdicional
        isOpen={isModalInfoAdicionalOpen}
        onClose={() => setIsModalInfoAdicionalOpen(false)}
        datosCliente={datosCliente}
        datosGuardados={datosInfoAdicionalGuardados}
        onDocumentoGenerado={(reqId, archivoPdf, estadoFormulario) => {
          handleDocumentoGenerado(reqId, archivoPdf);
          if (estadoFormulario) {
            setDatosInfoAdicionalGuardados(estadoFormulario);
          }
        }}
      />

      <ModalNominaAdministradores
        isOpen={isModalNominaOpen}
        onClose={() => setIsModalNominaOpen(false)}
        datosCliente={datosCliente}
        datosGuardados={datosNominaGuardados}
        onDocumentoGenerado={(reqId, archivoPdf, estadoFormulario) => {
          handleDocumentoGenerado(9, archivoPdf);
          if (estadoFormulario) {
            setDatosNominaGuardados(estadoFormulario);
          }
        }}
      />

      <ModalDDJJPEP
        isOpen={isModalPEPOpen}
        onClose={() => setIsModalPEPOpen(false)}
        datosCliente={datosCliente}
        onDocumentoGenerado={handleAgregarPEPGenerado}
      />

      <ModalDDJJLicitudFondos
        isOpen={isModalLicitudOpen}
        onClose={() => setIsModalLicitudOpen(false)}
        datosCliente={datosCliente}
        onDocumentoGenerado={handleAgregarLicitudGenerado}
      />

      <ModalBeneficiarioFinal
        isOpen={isModalBeneficiarioOpen}
        onClose={() => setIsModalBeneficiarioOpen(false)}
        datosCliente={datosCliente}
        datosGuardados={datosBeneficiarioGuardados}
        onDocumentoGenerado={(archivoPdf, estadoFormulario) => {
          handleDocumentoGenerado(12, archivoPdf);
          if (estadoFormulario) {
            setDatosBeneficiarioGuardados(estadoFormulario);
          }
        }}
      />

      <footer className="juridica-footer" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '30px', paddingBottom: '40px' }}>
        <button 
          type="button"
          className="btn-descargar-zip"
          disabled={RequisitosCompletados === 0 || generandoZip}
          onClick={handleDescargarZip}
          style={{
            backgroundColor: '#0d9488',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: RequisitosCompletados === 0 || generandoZip ? 'not-allowed' : 'pointer',
            opacity: RequisitosCompletados === 0 || generandoZip ? 0.6 : 1,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          {generandoZip ? '📦 Generando ZIP...' : '📦 Descargar Todos los Archivos (ZIP)'}
        </button>

        <button 
          type="button"
          className="btn-generar-expediente"
          disabled={RequisitosCompletados === 0}
          onClick={handleGenerar}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 'bold',
            fontSize: '15px',
            cursor: RequisitosCompletados === 0 ? 'not-allowed' : 'pointer',
            opacity: RequisitosCompletados === 0 ? 0.6 : 1,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        >
          Compilar y Generar Expediente Completo (PDF A4) →
        </button>
      </footer>
    </div>
  );
}