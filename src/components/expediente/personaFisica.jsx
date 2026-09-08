// import React, { useState } from 'react';
// import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
// import { useLocation, useNavigate } from 'react-router-dom';
// import Navbar from '../navBar/navBar';
// import ModalNotaSolicitudFisica from '../helpers/modalNotaSolicitudFisica';
// import ModalDDJJPEPFisica from '../helpers/ModalDDJJPEPFisica';
// import ModalFlujoFondos from '../helpers/modalFlujoFondos';
// import ModalInformacionAdicional from '../helpers/ModalInformacionAdicional'; // Nueva importación
// import '../../styles/personaFisica.css';

// const REQUISITOS_FISICA = [
//   { id: 0, titulo: "0. Nota de Solicitud", descripcion: "Nota de solicitud de garantía preferida del FOGAJUY." },
//   { id: 1, titulo: "1. Fotocopia DNI Titular", descripcion: "Fotocopia de DNI del titular." },
//   { id: 2, titulo: "2. DDJJ PEP Firmante Titular y Fiadores", descripcion: "Declaración Jurada de Persona Expuesta Políticamente del titular y fiadores." },
//   { id: 3, titulo: "3. Fotocopia DNI Cónyuge", descripcion: "Fotocopia de DNI del cónyuge (solo en caso de matrimonio)." },
//   { id: 4, titulo: "4. Fotocopia Acta de Matrimonio", descripcion: "Fotocopia de acta o certificado de matrimonio." },
//   { id: 5, titulo: "5. Fotocopia Acta de Defunción", descripcion: "Fotocopia de acta de defunción (si corresponde)." },
//   { id: 6, titulo: "6. Fotocopia DNI Firmante Titular", descripcion: "Fotocopia adicional/validación de DNI firmante." },
//   { id: 7, titulo: "7. Certificado de Residencia", descripcion: "Certificado de residencia emitido por autoridad competente." },
//   { id: 8, titulo: "8. Constancia AFIP", descripcion: "Inscripción en AFIP / Constancia de CUIT vigente." },
//   { id: 9, titulo: "9. Constancia Rentas", descripcion: "Inscripción provincial / Rentas Jujuy." },
//   { id: 10, titulo: "10. Constancia Regularización Fiscal Rentas", descripcion: "Certificado de libre deuda o regularización fiscal de Rentas." },
//   { id: 11, titulo: "11. Libre Deuda Previsional", descripcion: "Constancia de libre deuda previsional." },
//   { id: 12, titulo: "12. DDJJ IIBB / Convenio (Últimos 12)", descripcion: "Declaraciones juradas de Ingresos Brutos/Convenio Multilateral del último año." },
//   { id: 13, titulo: "13. DDJJ Bienes (Últimos 2)", descripcion: "Declaraciones juradas de Bienes Personales de los últimos 2 períodos." },
//   { id: 14, titulo: "14. DDJJ Ganancias (Últimos 2)", descripcion: "Declaraciones juradas de Impuesto a las Ganancias de los últimos 2 períodos." },
//   { id: 15, titulo: "15. Habilitación Municipal", descripcion: "Constancia de habilitación municipal del comercio/establecimiento." },
//   { id: 16, titulo: "16. Flujo de Fondos", descripcion: "Proyección por plazo igual o superior a la vida del crédito." },
//   { id: 17, titulo: "17. Información Adicional", descripcion: "Planos, fotos, presupuestos, etc." },
//   { id: 18, titulo: "18. Fiador/es Solidario/s", descripcion: "DNI Y Constancia de CUIT de fiadores." },
//   { id: 19, titulo: "19. Veraz / Nosis Titular", descripcion: "Informe comercial Veraz/Nosis u otros del titular." },
//   { id: 20, titulo: "20. Veraz / Nosis Fiador/es", descripcion: "Informe comercial Veraz/Nosis u otros de fiadores." },
//   { id: 21, titulo: "21. Contragarantía", descripcion: "En caso de hipoteca adjuntar cédula parcelaria, boleto de compra venta, tasación. En caso de prenda adjuntar título, informe de dominio y tasación. Para los restantes tipos su valor nominal o de mercado el menor." }
// ];

// export default function PersonaFisica({ datosClienteProps }) {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const datosCliente = location.state?.datosCliente || datosClienteProps || null;
//   const [archivos, setArchivos] = useState({});

//   // Modales
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isModalPEPOpen, setIsModalPEPOpen] = useState(false);
//   const [isModalFlujoOpen, setIsModalFlujoOpen] = useState(false);
//   const [isModalInfoOpen, setIsModalInfoOpen] = useState(false); // Estado para modal de Info Adicional

//   // Estados de datos guardados de modales para edición
//   const [datosGuardadosModal, setDatosGuardadosModal] = useState(null);
//   const [datosFlujoGuardados, setDatosFlujoGuardados] = useState(null);
//   const [datosInfoGuardados, setDatosInfoGuardados] = useState(null); // Guardado de formulario Info Adicional

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

//   // Callback Nota de Solicitud
//   const handleDocumentoGeneradoModal = (archivoFile, estadoModalGuardado) => {
//     setArchivos((prev) => ({
//       ...prev,
//       0: [archivoFile]
//     }));
//     setDatosGuardadosModal(estadoModalGuardado);
//   };

//   // Callback DDJJ PEP
//   const handleDocumentoGeneradoPEP = (archivoFile) => {
//     setArchivos((prev) => {
//       const acumulados = prev[2] || [];
//       return {
//         ...prev,
//         2: [...acumulados, archivoFile]
//       };
//     });
//   };

//   // Callback Flujo de Fondos (Soporta PDF generado y adjuntos adicionales)
//   const handleDocumentoGeneradoFlujo = (reqId, archivoPDF, estadoForm, archivosAdjuntos = []) => {
//     setArchivos((prev) => {
//       const acumulados = prev[reqId] || [];
//       const nuevosIntegrados = [archivoPDF, ...archivosAdjuntos];
//       return {
//         ...prev,
//         [reqId]: [...acumulados, ...nuevosIntegrados]
//       };
//     });
//     setDatosFlujoGuardados(estadoForm);
//   };

//   // Callback genérico para formularios con PDF (útil para el Modal de Información Adicional)
//   const handleDocumentoGeneradoForm = (reqId, archivoPDF, estadoForm) => {
//     setArchivos((prev) => {
//       const acumulados = prev[reqId] || [];
//       return {
//         ...prev,
//         [reqId]: [...acumulados, archivoPDF]
//       };
//     });

//     if (reqId === 17) {
//       setDatosInfoGuardados(estadoForm);
//     }
//   };

//   // Métricas de progreso
//   const totalRequisitos = REQUISITOS_FISICA.length;
//   const RequisitosCompletados = Object.keys(archivos).length;
//   const porcentajeProgreso = Math.round((RequisitosCompletados / totalRequisitos) * 100);

//   const handleGenerar = async () => {
//     try {
//       const pdfFinal = await PDFDocument.create();

//       const fontHelvetica = await pdfFinal.embedFont(StandardFonts.Helvetica);
//       const fontBold = await pdfFinal.embedFont(StandardFonts.HelveticaBold);

//       const cumplidos = [];
//       const faltantes = [];

//       REQUISITOS_FISICA.forEach((item) => {
//         const tieneFiles = archivos[item.id] && archivos[item.id].length > 0;
//         if (tieneFiles) {
//           cumplidos.push(item);
//         } else {
//           faltantes.push(item);
//         }
//       });

//       const totalReq = REQUISITOS_FISICA.length;
//       const totalCumplidos = cumplidos.length;
//       const porcentaje = Math.round((totalCumplidos / totalReq) * 100);
//       const fechaHora = new Date().toLocaleString('es-AR', {
//         dateStyle: 'long',
//         timeStyle: 'medium'
//       });

//       let paginasAdjuntas = 0;
//       const arrayBuffersGuardados = [];

//       for (const reqId of Object.keys(archivos)) {
//         const listaArchivos = archivos[reqId];

//         for (const archivo of listaArchivos) {
//           if (archivo.type === 'application/pdf') {
//             const arrayBuffer = await archivo.arrayBuffer();
//             const pdfAInsertar = await PDFDocument.load(arrayBuffer);
//             const paginasCopiadas = await pdfFinal.copyPages(
//               pdfAInsertar,
//               pdfAInsertar.getPageIndices()
//             );

//             paginasAdjuntas += paginasCopiadas.length;
//             arrayBuffersGuardados.push(paginasCopiadas);
//           }
//         }
//       }

//       const totalPaginasFinal = 1 + paginasAdjuntas;

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

//       reportPage.drawText('EXPEDIENTE COMPILADO - PERSONA FÍSICA', {
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

//       const nombreTitular = datosCliente?.nombre || datosCliente?.nombreApellido || 'No especificado';

//       reportPage.drawText(`Cliente / Titular: ${nombreTitular}`, { x: 50, y, size: 10, font: fontBold });
//       y -= 15;
//       reportPage.drawText(`Fecha de Armado: ${fechaHora}`, { x: 50, y, size: 10, font: fontHelvetica });
//       y -= 15;
//       reportPage.drawText(`Estado del Checklist: ${totalCumplidos} de ${totalReq} ítems completados (${porcentaje}%)`, { x: 50, y, size: 10, font: fontHelvetica });
//       y -= 15;
//       reportPage.drawText(`Total de Páginas del Expediente: ${totalPaginasFinal} página(s)`, { x: 50, y, size: 10, font: fontBold, color: rgb(0.1, 0.4, 0.2) });
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

//       arrayBuffersGuardados.forEach((paginas) => {
//         paginas.forEach((pagina) => pdfFinal.addPage(pagina));
//       });

//       const pdfBytes = await pdfFinal.save();
//       const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//       const pdfUrl = URL.createObjectURL(blob);

//       navigate('/expedientePDF', {
//         state: {
//           pdfUrl: pdfUrl,
//           nombreArchivo: 'Expediente_Persona_Fisica.pdf'
//         }
//       });

//     } catch (error) {
//       console.error('Error al compilar el PDF:', error);
//       alert('Ocurrió un error al armar el expediente. Verificá que los archivos no estén dañados.');
//     }
//   };

//   return (
//     <div className="fisica-container">
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
//         <h3>Lista de Control de Documentación - Persona Física</h3>
//         <p className="checklist-subtext">Podés adjuntar uno o varios archivos por cada ítem. Formatos aceptados: PDF, Word, Excel e Imágenes.</p>

//         <div className="requisitos-grid">
//           {REQUISITOS_FISICA.map((item) => {
//             const listaArchivos = archivos[item.id] || [];
//             const tieneArchivos = listaArchivos.length > 0;
//             const esItemNota = item.id === 0;
//             const esItemPEP = item.id === 2;
//             const esItemFlujo = item.id === 16;
//             const esItemInfoAdicional = item.id === 17;

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
//                   {esItemNota ? (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
//                       <button
//                         type="button"
//                         className="btn-upload"
//                         onClick={() => setIsModalOpen(true)}
//                       >
//                         {tieneArchivos ? '✏️ Editar / Regenerar Nota' : '📝 Generar Nota con Asistente'}
//                       </button>

//                       <input
//                         type="file"
//                         id={`file-input-${item.id}`}
//                         multiple
//                         accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
//                         onChange={(e) => handleAgregarArchivos(item.id, e)}
//                         style={{ display: 'none' }}
//                       />
//                       <label htmlFor={`file-input-${item.id}`} className="btn-upload" style={{ textAlign: 'center' }}>
//                         {tieneArchivos ? '+ Adjuntar otro archivo manual' : '📎 Subir Nota escaneada / externa'}
//                       </label>
//                     </div>
//                   ) : esItemPEP ? (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
//                       <button
//                         type="button"
//                         className="btn-upload"
//                         onClick={() => setIsModalPEPOpen(true)}
//                       >
//                         {tieneArchivos ? '➕ Generar otra DDJJ PEP' : '📝 Generar DDJJ PEP'}
//                       </button>

//                       <input
//                         type="file"
//                         id={`file-input-${item.id}`}
//                         multiple
//                         accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
//                         onChange={(e) => handleAgregarArchivos(item.id, e)}
//                         style={{ display: 'none' }}
//                       />
//                       <label htmlFor={`file-input-${item.id}`} className="btn-upload" style={{ textAlign: 'center' }}>
//                         📎 Subir PEP firmada / externa
//                       </label>
//                     </div>
//                   ) : esItemFlujo ? (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
//                       <button
//                         type="button"
//                         className="btn-upload"
//                         onClick={() => setIsModalFlujoOpen(true)}
//                       >
//                         {datosFlujoGuardados ? '📊 Editar Flujo de Fondos' : '📊 Generar Flujo de Fondos'}
//                       </button>

//                       <input
//                         type="file"
//                         id={`file-input-${item.id}`}
//                         multiple
//                         accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
//                         onChange={(e) => handleAgregarArchivos(item.id, e)}
//                         style={{ display: 'none' }}
//                       />
//                       <label htmlFor={`file-input-${item.id}`} className="btn-upload" style={{ textAlign: 'center' }}>
//                         📎 Adjuntar archivo externo
//                       </label>
//                     </div>
//                   ) : esItemInfoAdicional ? (
//                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
//                       <button
//                         type="button"
//                         className="btn-upload"
//                         onClick={() => setIsModalInfoOpen(true)}
//                       >
//                         {datosInfoGuardados ? '✏️ Editar Información Adicional' : '📝 Cargar Información Adicional'}
//                       </button>

//                       <input
//                         type="file"
//                         id={`file-input-${item.id}`}
//                         multiple
//                         accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
//                         onChange={(e) => handleAgregarArchivos(item.id, e)}
//                         style={{ display: 'none' }}
//                       />
//                       <label htmlFor={`file-input-${item.id}`} className="btn-upload" style={{ textAlign: 'center' }}>
//                         📎 Adjuntar archivos (planos, fotos, etc.)
//                       </label>
//                     </div>
//                   ) : (
//                     <>
//                       <input
//                         type="file"
//                         id={`file-input-${item.id}`}
//                         multiple
//                         accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
//                         onChange={(e) => handleAgregarArchivos(item.id, e)}
//                         style={{ display: 'none' }}
//                       />
//                       <label htmlFor={`file-input-${item.id}`} className="btn-upload">
//                         {tieneArchivos ? '+ Adjuntar otro archivo' : '📎 Adjuntar Archivo(s)'}
//                       </label>
//                     </>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </section>

//       <footer className="fisica-footer">
//         <button
//           className="btn-generar-expediente"
//           disabled={RequisitosCompletados === 0}
//           onClick={handleGenerar}
//         >
//           Compilar y Generar Expediente Completo (PDF A4) →
//         </button>
//       </footer>

//       {/* Modal Nota de Solicitud */}
//       <ModalNotaSolicitudFisica
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         datosCliente={datosCliente}
//         datosGuardados={datosGuardadosModal}
//         onDocumentoGenerado={handleDocumentoGeneradoModal}
//       />

//       {/* Modal DDJJ PEP Persona Física */}
//       <ModalDDJJPEPFisica
//         isOpen={isModalPEPOpen}
//         onClose={() => setIsModalPEPOpen(false)}
//         datosCliente={datosCliente}
//         onDocumentoGenerado={handleDocumentoGeneradoPEP}
//       />

//       {/* Modal Flujo de Fondos */}
//       <ModalFlujoFondos
//         isOpen={isModalFlujoOpen}
//         onClose={() => setIsModalFlujoOpen(false)}
//         datosCliente={datosCliente}
//         datosGuardados={datosFlujoGuardados}
//         onDocumentoGenerado={handleDocumentoGeneradoFlujo}
//       />

//       {/* Modal Información Adicional */}
//       <ModalInformacionAdicional
//         isOpen={isModalInfoOpen}
//         onClose={() => setIsModalInfoOpen(false)}
//         datosCliente={datosCliente}
//         datosGuardados={datosInfoGuardados}
//         onDocumentoGenerado={handleDocumentoGeneradoForm}
//       />
//     </div>
//   );
// }

import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../navBar/navBar';
import ModalNotaSolicitudFisica from '../helpers/modalNotaSolicitudFisica';
import ModalDDJJPEPFisica from '../helpers/ModalDDJJPEPFisica';
import ModalFlujoFondos from '../helpers/modalFlujoFondos';
import ModalInformacionAdicional from '../helpers/ModalInformacionAdicional';
import '../../styles/personaFisica.css';

const REQUISITOS_FISICA = [
  { id: 0, titulo: "0. Nota de Solicitud", descripcion: "Nota de solicitud de garantía preferida del FOGAJUY." },
  { id: 1, titulo: "1. Fotocopia DNI Titular", descripcion: "Fotocopia de DNI del titular." },
  { id: 2, titulo: "2. DDJJ PEP Firmante Titular y Fiadores", descripcion: "Declaración Jurada de Persona Expuesta Políticamente del titular y fiadores." },
  { id: 3, titulo: "3. Fotocopia DNI Cónyuge", descripcion: "Fotocopia de DNI del cónyuge (solo en caso de matrimonio)." },
  { id: 4, titulo: "4. Fotocopia Acta de Matrimonio", descripcion: "Fotocopia de acta o certificado de matrimonio." },
  { id: 5, titulo: "5. Fotocopia Acta de Defunción", descripcion: "Fotocopia de acta de defunción (si corresponde)." },
  { id: 6, titulo: "6. Fotocopia DNI Firmante Titular", descripcion: "Fotocopia adicional/validación de DNI firmante." },
  { id: 7, titulo: "7. Certificado de Residencia", descripcion: "Certificado de residencia emitido por autoridad competente." },
  { id: 8, titulo: "8. Constancia AFIP", descripcion: "Inscripción en AFIP / Constancia de CUIT vigente." },
  { id: 9, titulo: "9. Constancia Rentas", descripcion: "Inscripción provincial / Rentas Jujuy." },
  { id: 10, titulo: "10. Constancia Regularización Fiscal Rentas", descripcion: "Certificado de libre deuda o regularización fiscal de Rentas." },
  { id: 11, titulo: "11. Libre Deuda Previsional", descripcion: "Constancia de libre deuda previsional." },
  { id: 12, titulo: "12. DDJJ IIBB / Convenio (Últimos 12)", descripcion: "Declaraciones juradas de Ingresos Brutos/Convenio Multilateral del último año." },
  { id: 13, titulo: "13. DDJJ Bienes (Últimos 2)", descripcion: "Declaraciones juradas de Bienes Personales de los últimos 2 períodos." },
  { id: 14, titulo: "14. DDJJ Ganancias (Últimos 2)", descripcion: "Declaraciones juradas de Impuesto a las Ganancias de los últimos 2 períodos." },
  { id: 15, titulo: "15. Habilitación Municipal", descripcion: "Constancia de habilitación municipal del comercio/establecimiento." },
  { id: 16, titulo: "16. Flujo de Fondos", descripcion: "Proyección por plazo igual o superior a la vida del crédito." },
  { id: 17, titulo: "17. Información Adicional", descripcion: "Planos, fotos, presupuestos, etc." },
  { id: 18, titulo: "18. Fiador/es Solidario/s", descripcion: "DNI Y Constancia de CUIT de fiadores." },
  { id: 19, titulo: "19. Veraz / Nosis Titular", descripcion: "Informe comercial Veraz/Nosis u otros del titular." },
  { id: 20, titulo: "20. Veraz / Nosis Fiador/es", descripcion: "Informe comercial Veraz/Nosis u otros de fiadores." },
  { id: 21, titulo: "21. Contragarantía", descripcion: "En caso de hipoteca adjuntar cédula parcelaria, boleto de compra venta, tasación. En caso de prenda adjuntar título, informe de dominio y tasación. Para los restantes tipos su valor nominal o de mercado el menor." }
];

export default function PersonaFisica({ datosClienteProps }) {
  const location = useLocation();
  const navigate = useNavigate();

  const datosCliente = location.state?.datosCliente || datosClienteProps || null;
  const [archivos, setArchivos] = useState({});

  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalPEPOpen, setIsModalPEPOpen] = useState(false);
  const [isModalFlujoOpen, setIsModalFlujoOpen] = useState(false);
  const [isModalInfoOpen, setIsModalInfoOpen] = useState(false);

  // Estados de datos guardados de modales para edición
  const [datosGuardadosModal, setDatosGuardadosModal] = useState(null);
  const [datosFlujoGuardados, setDatosFlujoGuardados] = useState(null);
  const [datosInfoGuardados, setDatosInfoGuardados] = useState(null);

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

  const handleDocumentoGeneradoModal = (archivoFile, estadoModalGuardado) => {
    setArchivos((prev) => ({
      ...prev,
      0: [archivoFile]
    }));
    setDatosGuardadosModal(estadoModalGuardado);
  };

  const handleDocumentoGeneradoPEP = (archivoFile) => {
    setArchivos((prev) => {
      const acumulados = prev[2] || [];
      return {
        ...prev,
        2: [...acumulados, archivoFile]
      };
    });
  };

  const handleDocumentoGeneradoFlujo = (reqId, archivoPDF, estadoForm, archivosAdjuntos = []) => {
    setArchivos((prev) => {
      const acumulados = prev[reqId] || [];
      const nuevosIntegrados = [archivoPDF, ...archivosAdjuntos];
      return {
        ...prev,
        [reqId]: [...acumulados, ...nuevosIntegrados]
      };
    });
    setDatosFlujoGuardados(estadoForm);
  };

  const handleDocumentoGeneradoForm = (reqId, archivoPDF, estadoForm) => {
    setArchivos((prev) => {
      const acumulados = prev[reqId] || [];
      return {
        ...prev,
        [reqId]: [...acumulados, archivoPDF]
      };
    });

    if (reqId === 17) {
      setDatosInfoGuardados(estadoForm);
    }
  };

  const totalRequisitos = REQUISITOS_FISICA.length;
  const RequisitosCompletados = Object.keys(archivos).length;
  const porcentajeProgreso = Math.round((RequisitosCompletados / totalRequisitos) * 100);

  const handleGenerar = async () => {
    try {
      const pdfFinal = await PDFDocument.create();

      const fontHelvetica = await pdfFinal.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfFinal.embedFont(StandardFonts.HelveticaBold);

      const cumplidos = [];
      const faltantes = [];

      REQUISITOS_FISICA.forEach((item) => {
        const tieneFiles = archivos[item.id] && archivos[item.id].length > 0;
        if (tieneFiles) {
          cumplidos.push(item);
        } else {
          faltantes.push(item);
        }
      });

      const totalReq = REQUISITOS_FISICA.length;
      const totalCumplidos = cumplidos.length;
      const porcentaje = Math.round((totalCumplidos / totalReq) * 100);
      const fechaHora = new Date().toLocaleString('es-AR', {
        dateStyle: 'long',
        timeStyle: 'medium'
      });

      let paginasAdjuntas = 0;
      const arrayBuffersGuardados = [];

      for (const reqId of Object.keys(archivos)) {
        const listaArchivos = archivos[reqId];

        for (const archivo of listaArchivos) {
          if (archivo.type === 'application/pdf') {
            const arrayBuffer = await archivo.arrayBuffer();
            const pdfAInsertar = await PDFDocument.load(arrayBuffer);
            const paginasCopiadas = await pdfFinal.copyPages(
              pdfAInsertar,
              pdfAInsertar.getPageIndices()
            );

            paginasAdjuntas += paginasCopiadas.length;
            arrayBuffersGuardados.push(paginasCopiadas);
          }
        }
      }

      const totalPaginasFinal = 1 + paginasAdjuntas;

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

      reportPage.drawText('EXPEDIENTE COMPILADO - PERSONA FÍSICA', {
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

      const nombreTitular = datosCliente?.nombre || datosCliente?.nombreApellido || 'No especificado';

      reportPage.drawText(`Cliente / Titular: ${nombreTitular}`, { x: 50, y, size: 10, font: fontBold });
      y -= 15;
      reportPage.drawText(`Fecha de Armado: ${fechaHora}`, { x: 50, y, size: 10, font: fontHelvetica });
      y -= 15;
      reportPage.drawText(`Estado del Checklist: ${totalCumplidos} de ${totalReq} ítems completados (${porcentaje}%)`, { x: 50, y, size: 10, font: fontHelvetica });
      y -= 15;
      reportPage.drawText(`Total de Páginas del Expediente: ${totalPaginasFinal} página(s)`, { x: 50, y, size: 10, font: fontBold, color: rgb(0.1, 0.4, 0.2) });
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

      arrayBuffersGuardados.forEach((paginas) => {
        paginas.forEach((pagina) => pdfFinal.addPage(pagina));
      });

      // --- APLICACIÓN DEL SELLO CIRCULAR DE FOLIADO A TODAS LAS PÁGINAS ---
      const paginasTodas = pdfFinal.getPages();
      paginasTodas.forEach((pagina, index) => {
        const { width, height } = pagina.getSize();

        const centerX = width - 45;
        const centerY = height - 45;
        const radius = 26;

        // 1. Círculo exterior
        pagina.drawCircle({
          x: centerX,
          y: centerY,
          size: radius,
          borderWidth: 1.5,
          borderColor: rgb(0, 0, 0)
        });

        // 2. Arco superior "FOGAJUY"
        const textoArco = 'FOGAJUY';
        const radiusArc = 19;
        const angleStep = 18;
        const startAngle = 90 + ((textoArco.length - 1) * angleStep) / 2;

        for (let j = 0; j < textoArco.length; j++) {
          const char = textoArco[j];
          const charWidth = fontBold.widthOfTextAtSize(char, 7);
          const thetaDeg = startAngle - j * angleStep;
          const thetaRad = (thetaDeg * Math.PI) / 180;

          const charX = centerX + radiusArc * Math.cos(thetaRad) - charWidth / 2;
          const charY = centerY + radiusArc * Math.sin(thetaRad) - 2.5;

          pagina.drawText(char, {
            x: charX,
            y: charY,
            size: 7,
            font: fontBold,
            color: rgb(0, 0, 0),
            rotate: degrees(thetaDeg - 90)
          });
        }

        // 3. Número central de foliado
        const numeroTexto = String(index + 1);
        const numWidth = fontBold.widthOfTextAtSize(numeroTexto, 14);

        pagina.drawText(numeroTexto, {
          x: centerX - numWidth / 2,
          y: centerY - 5,
          size: 14,
          font: fontBold,
          color: rgb(0, 0, 0)
        });
      });

      const pdfBytes = await pdfFinal.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(blob);

      navigate('/expedientePDF', {
        state: {
          pdfUrl: pdfUrl,
          nombreArchivo: 'Expediente_Persona_Fisica.pdf'
        }
      });

    } catch (error) {
      console.error('Error al compilar el PDF:', error);
      alert('Ocurrió un error al armar el expediente. Verificá que los archivos no estén dañados.');
    }
  };

  return (
    <div className="fisica-container">
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
        <h3>Lista de Control de Documentación - Persona Física</h3>
        <p className="checklist-subtext">Podés adjuntar uno o varios archivos por cada ítem. Formatos aceptados: PDF, Word, Excel e Imágenes.</p>

        <div className="requisitos-grid">
          {REQUISITOS_FISICA.map((item) => {
            const listaArchivos = archivos[item.id] || [];
            const tieneArchivos = listaArchivos.length > 0;
            const esItemNota = item.id === 0;
            const esItemPEP = item.id === 2;
            const esItemFlujo = item.id === 16;
            const esItemInfoAdicional = item.id === 17;

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
                  {esItemNota ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={() => setIsModalOpen(true)}
                      >
                        {tieneArchivos ? '✏️ Editar / Regenerar Nota' : '📝 Generar Nota con Asistente'}
                      </button>

                      <input
                        type="file"
                        id={`file-input-${item.id}`}
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={(e) => handleAgregarArchivos(item.id, e)}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor={`file-input-${item.id}`} className="btn-upload" style={{ textAlign: 'center' }}>
                        {tieneArchivos ? '+ Adjuntar otro archivo manual' : '📎 Subir Nota escaneada / externa'}
                      </label>
                    </div>
                  ) : esItemPEP ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={() => setIsModalPEPOpen(true)}
                      >
                        {tieneArchivos ? '➕ Generar otra DDJJ PEP' : '📝 Generar DDJJ PEP'}
                      </button>

                      <input
                        type="file"
                        id={`file-input-${item.id}`}
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={(e) => handleAgregarArchivos(item.id, e)}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor={`file-input-${item.id}`} className="btn-upload" style={{ textAlign: 'center' }}>
                        📎 Subir PEP firmada / externa
                      </label>
                    </div>
                  ) : esItemFlujo ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={() => setIsModalFlujoOpen(true)}
                      >
                        {datosFlujoGuardados ? '📊 Editar Flujo de Fondos' : '📊 Generar Flujo de Fondos'}
                      </button>

                      <input
                        type="file"
                        id={`file-input-${item.id}`}
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={(e) => handleAgregarArchivos(item.id, e)}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor={`file-input-${item.id}`} className="btn-upload" style={{ textAlign: 'center' }}>
                        📎 Adjuntar archivo externo
                      </label>
                    </div>
                  ) : esItemInfoAdicional ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                      <button
                        type="button"
                        className="btn-upload"
                        onClick={() => setIsModalInfoOpen(true)}
                      >
                        {datosInfoGuardados ? '✏️ Editar Información Adicional' : '📝 Cargar Información Adicional'}
                      </button>

                      <input
                        type="file"
                        id={`file-input-${item.id}`}
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                        onChange={(e) => handleAgregarArchivos(item.id, e)}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor={`file-input-${item.id}`} className="btn-upload" style={{ textAlign: 'center' }}>
                        📎 Adjuntar archivos (planos, fotos, etc.)
                      </label>
                    </div>
                  ) : (
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
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="fisica-footer">
        <button
          className="btn-generar-expediente"
          disabled={RequisitosCompletados === 0}
          onClick={handleGenerar}
        >
          Compilar y Generar Expediente Completo (PDF A4) →
        </button>
      </footer>

      {/* Modal Nota de Solicitud */}
      <ModalNotaSolicitudFisica
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        datosCliente={datosCliente}
        datosGuardados={datosGuardadosModal}
        onDocumentoGenerado={handleDocumentoGeneradoModal}
      />

      {/* Modal DDJJ PEP Persona Física */}
      <ModalDDJJPEPFisica
        isOpen={isModalPEPOpen}
        onClose={() => setIsModalPEPOpen(false)}
        datosCliente={datosCliente}
        onDocumentoGenerado={handleDocumentoGeneradoPEP}
      />

      {/* Modal Flujo de Fondos */}
      <ModalFlujoFondos
        isOpen={isModalFlujoOpen}
        onClose={() => setIsModalFlujoOpen(false)}
        datosCliente={datosCliente}
        datosGuardados={datosFlujoGuardados}
        onDocumentoGenerado={handleDocumentoGeneradoFlujo}
      />

      {/* Modal Información Adicional */}
      <ModalInformacionAdicional
        isOpen={isModalInfoOpen}
        onClose={() => setIsModalInfoOpen(false)}
        datosCliente={datosCliente}
        datosGuardados={datosInfoGuardados}
        onDocumentoGenerado={handleDocumentoGeneradoForm}
      />
    </div>
  );
}