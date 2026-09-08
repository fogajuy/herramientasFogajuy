// import React, { useState } from 'react';
// import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import { useLocation, useNavigate } from 'react-router-dom';

// // Importación de Modales
// import ModalNotaSolicitud from '../helpers/modalNotaSolicitud';
// import ModalDDJJGrupoEconomico from '../helpers/modalDDJJGrupoEconomico';
// import ModalDDJJDeudaPostBalance from '../helpers/modalDDJJDeudaPostBalance';
// import ModalFlujoFondos from '../helpers/modalFlujoFondos';
// import ModalInformacionAdicional from '../helpers/modalInformacionAdicional';
// import ModalNominaAdministradores from '../helpers/ModalNominaAdministradores';
// import ModalDDJJPEP from '../helpers/modalDDJJPEP';
// import ModalDDJJLicitudFondos from '../helpers/ModalDDJJLicitudFondos';
// import ModalBeneficiarioFinal from '../helpers/modalDDJJBeneficiarioFinal';

// import Navbar from '../navBar/navBar';
// import '../../styles/personaJuridica.css';

// const REQUISITOS_JURIDICA = [
//   { id: 0, titulo: "0. Nota de Solicitud", descripcion: "Nota de solicitud de garantía preferida del FOGAJUY." },
//   { id: 1, titulo: "1. IGJ", descripcion: "Fecha y número de inscripción ante IGJ." },
//   { id: 2, titulo: "2. Estatuto", descripcion: "Fotocopia de estatuto (certificada y legalizada)." },
//   { id: 3, titulo: "3. Contrato Social", descripcion: "Fotocopia de contrato social y sus modificaciones (certificada y legalizada)." },
//   { id: 4, titulo: "4. Acta de Designación", descripcion: "Fotocopia de acta de designación de directorio (certificada y legalizada)." },
//   { id: 5, titulo: "5. Poder del Representante Legal", descripcion: "Fotocopia de poder otorgado al representante legal (certificada y legalizada)." },
//   { id: 6, titulo: "6. Acta Trámite FOGAJUY", descripcion: "Fotocopia de acta autorizando trámite ante FOGAJUY, firma de convenio y conformación de contragarantías (certificada y legalizada)." },
//   { id: 7, titulo: "7. DDJJ Grupo Económico", descripcion: "Declaración Jurada de Grupo Económico." },
//   { id: 8, titulo: "8. DDJJ Ingresos y Deudas Post Balances", descripcion: "Declaración Jurada de Ingresos y Deudas Post Balances." },
//   { id: 9, titulo: "9. Constancia AFIP", descripcion: "Inscripción en AFIP vigente." },
//   { id: 10, titulo: "10. Constancia Rentas", descripcion: "Inscripción provincial / Rentas." },
//   { id: 11, titulo: "11. Constancia Regularización Fiscal Rentas", descripcion: "Certificado de libre deuda o regularización." },
//   { id: 12, titulo: "12. DDJJ IIBB / Convenio (Últimos 12)", descripcion: "Declaraciones juradas de Ingresos Brutos/Convenio Multilateral del último año." },
//   { id: 13, titulo: "13. DDJJ Ganancias (Últimos 2)", descripcion: "Declaraciones juradas de Ganancias presentadas." },
//   { id: 14, titulo: "14. DDJJ Acciones / Bienes (Últimos 2)", descripcion: "Declaraciones de Acciones y/o Bienes Personales." },
//   { id: 15, titulo: "15. Flujo de Fondos", descripcion: "Proyección por plazo igual o superior a la vida del crédito." },
//   { id: 16, titulo: "16. Información Adicional", descripcion: "Planos, fotos, presupuestos, etc." },
//   { id: 17, titulo: "17. Nómina de Órgano de Administración y Nómina de Accionistas", descripcion: "Nómina de integrantes del órgano de administración o equivalente y Nómina de accionistas y porcentaje de participación." },
//   { id: 18, titulo: "18. DNI Firmante y Accionistas", descripcion: "Fotocopia DNI del firmante y accionistas." },
//   { id: 19, titulo: "19. DDJJ PEP Firmante, Accionistas y Fiadores", descripcion: "Declaración Jurada de Persona Expuesta Políticamente de firmantes, accionistas y fiadores." },
//   { id: 20, titulo: "20. DDJJ Licitud Fondos", descripcion: "Declaración Jurada de Licitud de uso de fondos." },
//   { id: 21, titulo: "21. DDJJ Beneficiario Final", descripcion: "Declaración Jurada de Beneficiario Final." },
//   { id: 22, titulo: "22. EECC e Informe de Auditor", descripcion: "2 últimos Estados Contables e Informe de Auditor (certificados por Colegio de Contadores)." },
//   { id: 23, titulo: "23. DDJJ IIBB / Convenio adicionales", descripcion: "Declaraciones juradas complementarias IIBB/Convenio." },
//   { id: 24, titulo: "24. DDJJ Ganancias complementarias", descripcion: "Declaraciones juradas complementarias de Ganancias." },
//   { id: 25, titulo: "25. Veraz / Nosis Empresa", descripcion: "Informe comercial de la empresa." },
//   { id: 26, titulo: "26. Veraz / Nosis Fiador/es", descripcion: "Informe comercial de fiadores." },
//   { id: 27, titulo: "27. Libre Deuda Previsional", descripcion: "Constancia de libre deuda previsional." },
//   { id: 28, titulo: "28. Fiador/es Solidario/s", descripcion: "DNI, Constancia de CUIT." },
//   { id: 29, titulo: "29. Contragarantía", descripcion: "En caso de hipoteca adjuntar cédula parcelaria, boleto de compra venta, tasación. En caso de prenda adjuntar título, informe de dominio y tasación." }
// ];

// export default function PersonaJuridica({ datosClienteProps }) {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const datosCliente = location.state?.datosCliente || datosClienteProps || null;

//   const [archivos, setArchivos] = useState({});

//   // Estados Modales
//   const [isModalNotaOpen, setIsModalNotaOpen] = useState(false);
//   const [isModalGrupoOpen, setIsModalGrupoOpen] = useState(false);
//   const [isModalDeudaOpen, setIsModalDeudaOpen] = useState(false);
//   const [isModalPEPOpen, setIsModalPEPOpen] = useState(false);
//   const [isModalLicitudOpen, setIsModalLicitudOpen] = useState(false);

//   const [isModalBeneficiarioOpen, setIsModalBeneficiarioOpen] = useState(false);
//   const [datosBeneficiarioGuardados, setDatosBeneficiarioGuardados] = useState(null);

//   const [isModalFlujoOpen, setIsModalFlujoOpen] = useState(false);
//   const [datosFlujoGuardados, setDatosFlujoGuardados] = useState(null);

//   const [isModalInfoAdicionalOpen, setIsModalInfoAdicionalOpen] = useState(false);
//   const [datosInfoAdicionalGuardados, setDatosInfoAdicionalGuardados] = useState(null);

//   const [isModalNominaOpen, setIsModalNominaOpen] = useState(false);
//   const [datosNominaGuardados, setDatosNominaGuardados] = useState(null);

//   // Handlers para archivos y modales
//   const handleDocumentoGenerado = (reqId, archivoPDF) => {
//     setArchivos((prev) => ({
//       ...prev,
//       [reqId]: [archivoPDF]
//     }));
//   };

//   const handleAgregarPEPGenerado = (archivoPDF) => {
//     if (!archivoPDF) return;
//     setArchivos((prev) => {
//       const listaExistente = prev[19] || [];
//       return {
//         ...prev,
//         19: [...listaExistente, archivoPDF]
//       };
//     });
//   };

//   const handleAgregarArchivos = (reqId, e) => {
//     const nuevosArchivos = Array.from(e.target.files);
//     if (nuevosArchivos.length === 0) return;

//     setArchivos((prev) => {
//       const acumulados = prev[reqId] || [];
//       return {
//         ...prev,
//         [reqId]: [...acumulados, ...nuevosArchivos]
//       };
//     });

//     e.target.value = null;
//   };

//   const handleEliminarArchivo = (reqId, indexFile) => {
//     setArchivos((prev) => {
//       const actualList = prev[reqId] || [];
//       const filtrados = actualList.filter((_, idx) => idx !== indexFile);

//       if (filtrados.length === 0) {
//         const copia = { ...prev };
//         delete copia[reqId];
//         return copia;
//       }

//       return {
//         ...prev,
//         [reqId]: filtrados
//       };
//     });
//   };

//   const handleAgregarLicitudGenerado = (archivoPDF) => {
//   if (!archivoPDF) return;
//   setArchivos((prev) => {
//     const listaExistente = prev[20] || [];
//     return {
//       ...prev,
//       20: [...listaExistente, archivoPDF]
//     };
//   });
// };

//   const totalRequisitos = REQUISITOS_JURIDICA.length;
//   const RequisitosCompletados = Object.keys(archivos).length;
//   const porcentajeProgreso = Math.round((RequisitosCompletados / totalRequisitos) * 100);

//   // Función Principal de Compilación PDF
//   const handleGenerar = async () => {
//     try {
//       const pdfFinal = await PDFDocument.create();
//       const fontHelvetica = await pdfFinal.embedFont(StandardFonts.Helvetica);
//       const fontBold = await pdfFinal.embedFont(StandardFonts.HelveticaBold);

//       const cumplidos = [];
//       const faltantes = [];

//       REQUISITOS_JURIDICA.forEach((item) => {
//         const tieneFiles = archivos[item.id] && archivos[item.id].length > 0;
//         if (tieneFiles) {
//           cumplidos.push(item);
//         } else {
//           faltantes.push(item);
//         }
//       });

//       const totalReq = REQUISITOS_JURIDICA.length;
//       const totalCumplidos = cumplidos.length;
//       const porcentaje = Math.round((totalCumplidos / totalReq) * 100);
//       const fechaHora = new Date().toLocaleString('es-AR', {
//         dateStyle: 'long',
//         timeStyle: 'medium'
//       });

//       // 1. Crear primero la página del Reporte
//       const reportPage = pdfFinal.addPage([595.28, 841.89]);
//       let y = 790;

//       reportPage.drawText('FOGAJUY - REPORTE DE ESTADO DE EXPEDIENTE', {
//         x: 50,
//         y,
//         size: 14,
//         font: fontBold,
//         color: rgb(0.1, 0.2, 0.4)
//       });
//       y -= 25;

//       reportPage.drawText('EXPEDIENTE COMPILADO - PERSONA JURÍDICA', {
//         x: 50,
//         y,
//         size: 11,
//         font: fontBold,
//         color: rgb(0.3, 0.3, 0.3)
//       });
//       y -= 15;

//       reportPage.drawLine({
//         start: { x: 50, y },
//         end: { x: 545, y },
//         thickness: 1,
//         color: rgb(0.8, 0.8, 0.8)
//       });
//       y -= 25;

//       const razonSocial = datosCliente?.razonSocial || datosCliente?.nombre || 'No especificado';

//       reportPage.drawText(`Cliente / Razón Social: ${razonSocial}`, { x: 50, y, size: 10, font: fontBold });
//       y -= 15;
//       reportPage.drawText(`Fecha de Armado: ${fechaHora}`, { x: 50, y, size: 10, font: fontHelvetica });
//       y -= 15;
//       reportPage.drawText(`Estado del Checklist: ${totalCumplidos} de ${totalReq} ítems completados (${porcentaje}%)`, { x: 50, y, size: 10, font: fontHelvetica });
//       y -= 15;

//       // 2. Anexar y Copiar los PDF adjuntos
//       let paginasAdjuntasCount = 0;

//       for (const reqId of Object.keys(archivos)) {
//         const listaArchivos = archivos[reqId];

//         for (const archivo of listaArchivos) {
//           const esPdf = archivo.type === 'application/pdf' || (archivo.name && archivo.name.toLowerCase().endsWith('.pdf'));

//           if (esPdf) {
//             try {
//               const arrayBuffer = await archivo.arrayBuffer();
//               const pdfAInsertar = await PDFDocument.load(arrayBuffer);
//               const paginasCopiadas = await pdfFinal.copyPages(
//                 pdfAInsertar,
//                 pdfAInsertar.getPageIndices()
//               );

//               paginasCopiadas.forEach((pagina) => {
//                 pdfFinal.addPage(pagina);
//                 paginasAdjuntasCount++;
//               });
//             } catch (err) {
//               console.warn(`No se pudo procesar el archivo ${archivo.name}:`, err);
//             }
//           }
//         }
//       }

//       // Dibujar la cantidad total exacta de páginas en el reporte
//       const totalPaginasFinal = 1 + paginasAdjuntasCount;
//       reportPage.drawText(`Total de Páginas del Expediente: ${totalPaginasFinal} página(s)`, { 
//         x: 50, 
//         y, 
//         size: 10, 
//         font: fontBold, 
//         color: rgb(0.1, 0.4, 0.2) 
//       });
//       y -= 30;

//       reportPage.drawText(`REQUISITOS FALTANTES (${faltantes.length}):`, {
//         x: 50,
//         y,
//         size: 11,
//         font: fontBold,
//         color: rgb(0.7, 0.1, 0.1)
//       });
//       y -= 15;

//       if (faltantes.length === 0) {
//         reportPage.drawText('✓ Checklist 100% Completo. No se registran requisitos faltantes.', {
//           x: 60,
//           y,
//           size: 9,
//           font: fontHelvetica,
//           color: rgb(0, 0.5, 0)
//         });
//         y -= 15;
//       } else {
//         faltantes.forEach((item) => {
//           if (y > 60) {
//             reportPage.drawText(`• ${item.titulo}`, {
//               x: 60,
//               y,
//               size: 8.5,
//               font: fontHelvetica,
//               color: rgb(0.3, 0.3, 0.3)
//             });
//             y -= 13;
//           }
//         });
//       }

//       y -= 15;
//       reportPage.drawLine({
//         start: { x: 50, y },
//         end: { x: 545, y },
//         thickness: 1,
//         color: rgb(0.8, 0.8, 0.8)
//       });
//       y -= 25;

//       reportPage.drawText('DOCUMENTACIÓN ADJUNTA COMPILADA EN LAS PÁGINAS SIGUIENTES', {
//         x: 50,
//         y,
//         size: 9,
//         font: fontBold,
//         color: rgb(0.4, 0.4, 0.4)
//       });

//       // 3. Generar y Redirigir
//       const pdfBytes = await pdfFinal.save();
//       const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//       const pdfUrl = URL.createObjectURL(blob);

//       navigate('/expedientePDF', {
//         state: {
//           pdfUrl: pdfUrl,
//           nombreArchivo: 'Expediente_Persona_Juridica.pdf'
//         }
//       });

//     } catch (error) {
//       console.error('Error al compilar el PDF:', error);
//       alert('Ocurrió un error al armar el expediente. Verificá que los archivos no estén dañados.');
//     }
//   };

//   // Helper de Renderizado para Botones de Acción de cada Card
//   const renderBotonesSubida = (item, tieneArchivos) => {
//     switch (item.id) {
//       case 0:
//         return (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//             <button 
//               type="button"
//               className="btn-upload" 
//               onClick={() => setIsModalNotaOpen(true)}
//               style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
//             >
//               {tieneArchivos ? '📝 Editar / Regenerar Nota' : '📝 Llenar y Generar Nota'}
//             </button>
//             <input
//               type="file"
//               id={`file-input-${item.id}`}
//               multiple
//               accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//               onChange={(e) => handleAgregarArchivos(item.id, e)}
//               style={{ display: 'none' }}
//             />
//             <label 
//               htmlFor={`file-input-${item.id}`} 
//               className="btn-upload" 
//               style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
//             >
//               📎 Adjuntar PDF / Escaneado externo
//             </label>
//           </div>
//         );

//       case 7:
//         return (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//             <button 
//               type="button"
//               className="btn-upload" 
//               onClick={() => setIsModalGrupoOpen(true)}
//               style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
//             >
//               {tieneArchivos ? '📝 Editar / Regenerar DDJJ' : '📝 Llenar y Generar DDJJ'}
//             </button>
//             <input
//               type="file"
//               id={`file-input-${item.id}`}
//               multiple
//               accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//               onChange={(e) => handleAgregarArchivos(item.id, e)}
//               style={{ display: 'none' }}
//             />
//             <label 
//               htmlFor={`file-input-${item.id}`} 
//               className="btn-upload" 
//               style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
//             >
//               📎 Adjuntar PDF / Escaneado externo
//             </label>
//           </div>
//         );

//       case 8:
//         return (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//             <button 
//               type="button"
//               className="btn-upload" 
//               onClick={() => setIsModalDeudaOpen(true)}
//               style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
//             >
//               {tieneArchivos ? '📝 Editar / Regenerar DDJJ' : '📝 Llenar y Generar DDJJ'}
//             </button>
//             <input
//               type="file"
//               id={`file-input-${item.id}`}
//               multiple
//               accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//               onChange={(e) => handleAgregarArchivos(item.id, e)}
//               style={{ display: 'none' }}
//             />
//             <label 
//               htmlFor={`file-input-${item.id}`} 
//               className="btn-upload" 
//               style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
//             >
//               📎 Adjuntar PDF / Escaneado externo
//             </label>
//           </div>
//         );

//       case 15:
//         return (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//             <button 
//               type="button"
//               className="btn-upload" 
//               onClick={() => setIsModalFlujoOpen(true)}
//               style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
//             >
//               {tieneArchivos ? '📝 Editar / Regenerar Flujo' : '📝 Cargar Flujo de Fondos'}
//             </button>
//             <input
//               type="file"
//               id={`file-input-${item.id}`}
//               multiple
//               accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
//               onChange={(e) => handleAgregarArchivos(item.id, e)}
//               style={{ display: 'none' }}
//             />
//             <label 
//               htmlFor={`file-input-${item.id}`} 
//               className="btn-upload" 
//               style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
//             >
//               📎 Adjuntar PDF / Excel externo
//             </label>
//           </div>
//         );

//       case 16:
//         return (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//             <button 
//               type="button"
//               className="btn-upload" 
//               onClick={() => setIsModalInfoAdicionalOpen(true)}
//               style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
//             >
//               {tieneArchivos ? '📝 Editar / Regenerar Info Adicional' : '📝 Llenar y Generar Info Adicional'}
//             </button>
//             <input
//               type="file"
//               id={`file-input-${item.id}`}
//               multiple
//               accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
//               onChange={(e) => handleAgregarArchivos(item.id, e)}
//               style={{ display: 'none' }}
//             />
//             <label 
//               htmlFor={`file-input-${item.id}`} 
//               className="btn-upload" 
//               style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
//             >
//               📎 Adjuntar PDF / Archivos externos
//             </label>
//           </div>
//         );

//       case 17:
//         return (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//             <button 
//               type="button"
//               className="btn-upload" 
//               onClick={() => setIsModalNominaOpen(true)}
//               style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
//             >
//               {tieneArchivos ? '📝 Editar / Regenerar Nóminas' : '📝 Llenar y Generar Nóminas'}
//             </button>
//             <input
//               type="file"
//               id={`file-input-${item.id}`}
//               multiple
//               accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
//               onChange={(e) => handleAgregarArchivos(item.id, e)}
//               style={{ display: 'none' }}
//             />
//             <label 
//               htmlFor={`file-input-${item.id}`} 
//               className="btn-upload" 
//               style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
//             >
//               📎 Adjuntar PDF / Archivos externos
//             </label>
//           </div>
//         );

//       case 19:
//         return (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//             <button 
//               type="button"
//               className="btn-upload" 
//               onClick={() => setIsModalPEPOpen(true)}
//               style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
//             >
//               📝 Generar DDJJ PEP para un Declarante
//             </button>
//             <input
//               type="file"
//               id={`file-input-${item.id}`}
//               multiple
//               accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//               onChange={(e) => handleAgregarArchivos(item.id, e)}
//               style={{ display: 'none' }}
//             />
//             <label htmlFor={`file-input-${item.id}`} className="btn-upload" style={{ background: '#f1f5f9', color: '#334155', textAlign: 'center' }}>
//               📎 Adjuntar PDF / Escaneado externo
//             </label>
//           </div>
//         );

//       case 20:
//         return (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//             <button 
//               type="button"
//               className="btn-upload" 
//               onClick={() => setIsModalLicitudOpen(true)}
//               style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
//             >
//               📝 Generar DDJJ Licitud de Fondos
//             </button>
//             <input
//               type="file"
//               id={`file-input-${item.id}`}
//               multiple
//               accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//               onChange={(e) => handleAgregarArchivos(item.id, e)}
//               style={{ display: 'none' }}
//             />
//             <label 
//               htmlFor={`file-input-${item.id}`} 
//               className="btn-upload" 
//               style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
//             >
//               📎 Adjuntar PDF / Escaneado externo
//             </label>
//           </div>
//         );
//       case 21:
//         return (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//             <button 
//               type="button"
//               className="btn-upload" 
//               onClick={() => setIsModalBeneficiarioOpen(true)}
//               style={{ backgroundColor: '#0284c7', color: '#fff', border: 'none' }}
//             >
//               {tieneArchivos ? '📝 Editar / Regenerar Beneficiario Final' : '📝 Llenar y Generar Beneficiario Final'}
//             </button>
//             <input
//               type="file"
//               id={`file-input-${item.id}`}
//               multiple
//               accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//               onChange={(e) => handleAgregarArchivos(item.id, e)}
//               style={{ display: 'none' }}
//             />
//             <label 
//               htmlFor={`file-input-${item.id}`} 
//               className="btn-upload" 
//               style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
//             >
//               📎 Adjuntar PDF / Escaneado externo
//             </label>
//           </div>
//         );

//       default:
//         return (
//           <>
//             <input
//               type="file"
//               id={`file-input-${item.id}`}
//               multiple
//               accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
//               onChange={(e) => handleAgregarArchivos(item.id, e)}
//               style={{ display: 'none' }}
//             />
//             <label htmlFor={`file-input-${item.id}`} className="btn-upload">
//               {tieneArchivos ? '+ Adjuntar otro archivo' : '📎 Adjuntar Archivo(s)'}
//             </label>
//           </>
//         );
//     }
//   };

//   return (
//     <div className="juridica-container">
//       <Navbar /> 

//       <section className="progreso-section">
//         <div className="progreso-info">
//           <span>Progreso: <strong>{RequisitosCompletados} de {totalRequisitos} ítems completados</strong></span>
//           <span className="porcentaje">{porcentajeProgreso}%</span>
//         </div>
//         <div className="bar-container">
//           <div className="bar-fill" style={{ width: `${porcentajeProgreso}%` }}></div>
//         </div>
//       </section>

//       <section className="checklist-container">
//         <h3>Lista de Control de Documentación</h3>
//         <p className="checklist-subtext">Podés adjuntar uno o varios archivos por cada ítem. Formatos aceptados: PDF, Word, Excel e Imágenes.</p>

//         <div className="requisitos-grid">
//           {REQUISITOS_JURIDICA.map((item) => {
//             const listaArchivos = archivos[item.id] || [];
//             const tieneArchivos = listaArchivos.length > 0;

//             return (
//               <div key={item.id} className={`requisito-card ${tieneArchivos ? 'completado' : ''}`}>
//                 <div className="requisito-head">
//                   <span className={`status-badge ${tieneArchivos ? 'ok' : 'pending'}`}>
//                     {tieneArchivos ? `✓ ${listaArchivos.length} Adjunto(s)` : 'Pendiente'}
//                   </span>
//                   <h4>{item.titulo}</h4>
//                 </div>

//                 <p className="requisito-desc">{item.descripcion}</p>

//                 {tieneArchivos && (
//                   <div className="archivos-lista">
//                     {listaArchivos.map((file, idx) => (
//                       <div key={idx} className="file-chip">
//                         <span className="file-name" title={file.name}>📄 {file.name}</span>
//                         <button 
//                           type="button"
//                           className="btn-eliminar-file"
//                           onClick={() => handleEliminarArchivo(item.id, idx)}
//                           title="Eliminar este archivo"
//                         >
//                           ✕
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 <div className="upload-area">
//                   {renderBotonesSubida(item, tieneArchivos)}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </section>

//       {/* MODALES */}
//       <ModalNotaSolicitud
//         isOpen={isModalNotaOpen}
//         onClose={() => setIsModalNotaOpen(false)}
//         datosCliente={datosCliente}
//         onDocumentoGenerado={handleDocumentoGenerado}
//       />

//       <ModalDDJJGrupoEconomico
//         isOpen={isModalGrupoOpen}
//         onClose={() => setIsModalGrupoOpen(false)}
//         datosCliente={datosCliente}
//         onDocumentoGenerado={handleDocumentoGenerado}
//       />

//       <ModalDDJJDeudaPostBalance
//         isOpen={isModalDeudaOpen}
//         onClose={() => setIsModalDeudaOpen(false)}
//         datosCliente={datosCliente}
//         onDocumentoGenerado={handleDocumentoGenerado}
//       />

//       <ModalFlujoFondos
//         isOpen={isModalFlujoOpen}
//         onClose={() => setIsModalFlujoOpen(false)}
//         datosCliente={datosCliente}
//         datosGuardados={datosFlujoGuardados}
//         onDocumentoGenerado={(reqId, archivoPdf, estadoFormulario) => {
//           handleDocumentoGenerado(reqId, archivoPdf);
//           if (estadoFormulario) {
//             setDatosFlujoGuardados(estadoFormulario);
//           }
//         }}
//       />

//       <ModalInformacionAdicional
//         isOpen={isModalInfoAdicionalOpen}
//         onClose={() => setIsModalInfoAdicionalOpen(false)}
//         datosCliente={datosCliente}
//         datosGuardados={datosInfoAdicionalGuardados}
//         onDocumentoGenerado={(reqId, archivoPdf, estadoFormulario) => {
//           handleDocumentoGenerado(reqId, archivoPdf);
//           if (estadoFormulario) {
//             setDatosInfoAdicionalGuardados(estadoFormulario);
//           }
//         }}
//       />

//       <ModalNominaAdministradores
//         isOpen={isModalNominaOpen}
//         onClose={() => setIsModalNominaOpen(false)}
//         datosCliente={datosCliente}
//         datosGuardados={datosNominaGuardados}
//         onDocumentoGenerado={(reqId, archivoPdf, estadoFormulario) => {
//           handleDocumentoGenerado(17, archivoPdf);
//           if (estadoFormulario) {
//             setDatosNominaGuardados(estadoFormulario);
//           }
//         }}
//       />

//       <ModalDDJJPEP
//         isOpen={isModalPEPOpen}
//         onClose={() => setIsModalPEPOpen(false)}
//         datosCliente={datosCliente}
//         onDocumentoGenerado={handleAgregarPEPGenerado}
//       />

//       <ModalDDJJLicitudFondos
//         isOpen={isModalLicitudOpen}
//         onClose={() => setIsModalLicitudOpen(false)}
//         datosCliente={datosCliente}
//         onDocumentoGenerado={handleAgregarLicitudGenerado}
//       />

//       <ModalBeneficiarioFinal
//         isOpen={isModalBeneficiarioOpen}
//         onClose={() => setIsModalBeneficiarioOpen(false)}
//         datosCliente={datosCliente}
//         datosGuardados={datosBeneficiarioGuardados}
//         onDocumentoGenerado={(archivoPdf, estadoFormulario) => {
//           handleDocumentoGenerado(21, archivoPdf);
//           if (estadoFormulario) {
//             setDatosBeneficiarioGuardados(estadoFormulario);
//           }
//         }}
//       />

//       <footer className="juridica-footer">
//         <button 
//           type="button"
//           className="btn-generar-expediente"
//           disabled={RequisitosCompletados === 0}
//           onClick={handleGenerar}
//         >
//           Compilar y Generar Expediente Completo (PDF A4) →
//         </button>
//       </footer>
//     </div>
//   );
// }

import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { useLocation, useNavigate } from 'react-router-dom';

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
  { id: 6, titulo: "6. Acta Trámite FOGAJUY", descripcion: "Fotocopia de acta autorizando trámite ante FOGAJUY, firma de convenio y conformación de contragarantías (certificada y legalizada)." },
  { id: 7, titulo: "7. DDJJ Grupo Económico", descripcion: "Declaración Jurada de Grupo Económico." },
  { id: 8, titulo: "8. DDJJ Ingresos y Deudas Post Balances", descripcion: "Declaración Jurada de Ingresos y Deudas Post Balances." },
  { id: 9, titulo: "9. Constancia AFIP", descripcion: "Inscripción en AFIP vigente." },
  { id: 10, titulo: "10. Constancia Rentas", descripcion: "Inscripción provincial / Rentas." },
  { id: 11, titulo: "11. Constancia Regularización Fiscal Rentas", descripcion: "Certificado de libre deuda o regularización." },
  { id: 12, titulo: "12. DDJJ IIBB / Convenio (Últimos 12)", descripcion: "Declaraciones juradas de Ingresos Brutos/Convenio Multilateral del último año." },
  { id: 13, titulo: "13. DDJJ Ganancias (Últimos 2)", descripcion: "Declaraciones juradas de Ganancias presentadas." },
  { id: 14, titulo: "14. DDJJ Acciones / Bienes (Últimos 2)", descripcion: "Declaraciones de Acciones y/o Bienes Personales." },
  { id: 15, titulo: "15. Flujo de Fondos", descripcion: "Proyección por plazo igual o superior a la vida del crédito." },
  { id: 16, titulo: "16. Información Adicional", descripcion: "Planos, fotos, presupuestos, etc." },
  { id: 17, titulo: "17. Nómina de Órgano de Administración y Nómina de Accionistas", descripcion: "Nómina de integrantes del órgano de administración o equivalente y Nómina de accionistas y porcentaje de participación." },
  { id: 18, titulo: "18. DNI Firmante y Accionistas", descripcion: "Fotocopia DNI del firmante y accionistas." },
  { id: 19, titulo: "19. DDJJ PEP Firmante, Accionistas y Fiadores", descripcion: "Declaración Jurada de Persona Expuesta Políticamente de firmantes, accionistas y fiadores." },
  { id: 20, titulo: "20. DDJJ Licitud Fondos", descripcion: "Declaración Jurada de Licitud de uso de fondos." },
  { id: 21, titulo: "21. DDJJ Beneficiario Final", descripcion: "Declaración Jurada de Beneficiario Final." },
  { id: 22, titulo: "22. EECC e Informe de Auditor", descripcion: "2 últimos Estados Contables e Informe de Auditor (certificados por Colegio de Contadores)." },
  { id: 23, titulo: "23. DDJJ IIBB / Convenio adicionales", descripcion: "Declaraciones juradas complementarias IIBB/Convenio." },
  { id: 24, titulo: "24. DDJJ Ganancias complementarias", descripcion: "Declaraciones juradas complementarias de Ganancias." },
  { id: 25, titulo: "25. Veraz / Nosis Empresa", descripcion: "Informe comercial de la empresa." },
  { id: 26, titulo: "26. Veraz / Nosis Fiador/es", descripcion: "Informe comercial de fiadores." },
  { id: 27, titulo: "27. Libre Deuda Previsional", descripcion: "Constancia de libre deuda previsional." },
  { id: 28, titulo: "28. Fiador/es Solidario/s", descripcion: "DNI, Constancia de CUIT." },
  { id: 29, titulo: "29. Contragarantía", descripcion: "En caso de hipoteca adjuntar cédula parcelaria, boleto de compra venta, tasación. En caso de prenda adjuntar título, informe de dominio y tasación." }
];

export default function PersonaJuridica({ datosClienteProps }) {
  const location = useLocation();
  const navigate = useNavigate();

  const datosCliente = location.state?.datosCliente || datosClienteProps || null;

  const [archivos, setArchivos] = useState({});

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
      const listaExistente = prev[19] || [];
      return {
        ...prev,
        19: [...listaExistente, archivoPDF]
      };
    });
  };

  const handleAgregarArchivos = (reqId, e) => {
    const nuevosArchivos = Array.from(e.target.files);
    if (nuevosArchivos.length === 0) return;

    setArchivos((prev) => {
      const acumulados = prev[reqId] || [];
      return {
        ...prev,
        [reqId]: [...acumulados, ...nuevosArchivos]
      };
    });

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

  const handleAgregarLicitudGenerado = (archivoPDF) => {
    if (!archivoPDF) return;
    setArchivos((prev) => {
      const listaExistente = prev[20] || [];
      return {
        ...prev,
        20: [...listaExistente, archivoPDF]
      };
    });
  };

  const totalRequisitos = REQUISITOS_JURIDICA.length;
  const RequisitosCompletados = Object.keys(archivos).length;
  const porcentajeProgreso = Math.round((RequisitosCompletados / totalRequisitos) * 100);

  // Función Principal de Compilación PDF
  const handleGenerar = async () => {
    try {
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

      // 1. Crear primero la página del Reporte
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

      // 2. Anexar y Copiar los PDF adjuntos
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

      // Dibujar la cantidad total exacta de páginas en el reporte
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

      // ---> INICIO: LÓGICA DE FOLIADO (NUMERACIÓN DE HOJAS) <---
      const todasLasPaginas = pdfFinal.getPages();
      const totalPages = todasLasPaginas.length;

      for (let i = 0; i < totalPages; i++) {
        const page = todasLasPaginas[i];
        const { width, height } = page.getSize();
        
        const numeroPagina = String(i + 1);
        const radioCirculo = 26; // Círculo más grande
        
        const centerX = width - 50;
        const centerY = height - 50;

        // 1. Dibujar el círculo SIN fondo y con borde negro
        page.drawCircle({
          x: centerX,
          y: centerY,
          size: radioCirculo,
          borderColor: rgb(0, 0, 0),
          borderWidth: 1.5,
          color: undefined, // undefined hace que no tenga color de fondo (transparente)
        });

        // 2. Número de página en el centro (Negro)
        const fontSizeNum = 14;
        const textWidthNum = fontBold.widthOfTextAtSize(numeroPagina, fontSizeNum);
        
        page.drawText(numeroPagina, {
          x: centerX - (textWidthNum / 2),
          y: centerY - 5, // Ajuste óptico para centrar verticalmente
          size: fontSizeNum,
          font: fontBold, 
          color: rgb(0, 0, 0) // Letra negra
        });

        // 3. Leyenda "FOGAJUY" circular siguiendo el borde superior
        const textoLeyenda = "FOGAJUY";
        const fontSizeLeyenda = 7;
        const textRadius = radioCirculo - 8; // Radio del texto (ligeramente menor al círculo)
        
        // Matemáticas para distribuir las letras en arco
        const angleStep = 18; // Separación en grados entre cada letra
        // startAngle centra la palabra "FOGAJUY" exactamente en los 90 grados (arriba al centro)
        const startAngle = 90 + ((textoLeyenda.length - 1) / 2) * angleStep; 

        for (let j = 0; j < textoLeyenda.length; j++) {
          const char = textoLeyenda[j];
          
          // Ángulo actual para esta letra
          const thetaDeg = startAngle - (j * angleStep);
          const thetaRad = thetaDeg * (Math.PI / 180);

          // Coordenadas base en el arco de la circunferencia
          const x = centerX + textRadius * Math.cos(thetaRad);
          const y = centerY + textRadius * Math.sin(thetaRad);

          // Medimos el ancho de la letra actual para poder anclarla desde su centro
          const charWidth = fontBold.widthOfTextAtSize(char, fontSizeLeyenda);
          const baselineAngleRad = (thetaDeg - 90) * (Math.PI / 180);
          
          // Desplazamiento fino para que la rotación se haga desde el centro del carácter
          const offsetX = - (charWidth / 2) * Math.cos(baselineAngleRad);
          const offsetY = - (charWidth / 2) * Math.sin(baselineAngleRad);

          // Dibujamos la letra rotada
          page.drawText(char, {
            x: x + offsetX,
            y: y + offsetY,
            size: fontSizeLeyenda,
            font: fontBold,
            color: rgb(0, 0, 0), // Letra negra
            rotate: degrees(thetaDeg - 90), // Se gira para que la base apunte al centro del círculo
          });
        }
      }
      // ---> FIN: LÓGICA DE FOLIADO <---

      // 3. Generar y Redirigir
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

  // Helper de Renderizado para Botones de Acción de cada Card
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
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar PDF / Escaneado externo
            </label>
          </div>
        );

      case 7:
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
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar PDF / Escaneado externo
            </label>
          </div>
        );

      case 8:
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
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar PDF / Escaneado externo
            </label>
          </div>
        );

      case 15:
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
              📎 Adjuntar PDF / Excel externo
            </label>
          </div>
        );

      case 16:
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
              📎 Adjuntar PDF / Archivos externos
            </label>
          </div>
        );

      case 17:
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
              📎 Adjuntar PDF / Archivos externos
            </label>
          </div>
        );

      case 19:
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
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label htmlFor={`file-input-${item.id}`} className="btn-upload" style={{ background: '#f1f5f9', color: '#334155', textAlign: 'center' }}>
              📎 Adjuntar PDF / Escaneado externo
            </label>
          </div>
        );

      case 20:
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
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar PDF / Escaneado externo
            </label>
          </div>
        );
      case 21:
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
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleAgregarArchivos(item.id, e)}
              style={{ display: 'none' }}
            />
            <label 
              htmlFor={`file-input-${item.id}`} 
              className="btn-upload" 
              style={{ background: '#f1f5f9', color: '#334155', cursor: 'pointer', textAlign: 'center' }}
            >
              📎 Adjuntar PDF / Escaneado externo
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
            <label htmlFor={`file-input-${item.id}`} className="btn-upload">
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
          handleDocumentoGenerado(17, archivoPdf);
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
          handleDocumentoGenerado(21, archivoPdf);
          if (estadoFormulario) {
            setDatosBeneficiarioGuardados(estadoFormulario);
          }
        }}
      />

      <footer className="juridica-footer">
        <button 
          type="button"
          className="btn-generar-expediente"
          disabled={RequisitosCompletados === 0}
          onClick={handleGenerar}
        >
          Compilar y Generar Expediente Completo (PDF A4) →
        </button>
      </footer>
    </div>
  );
}