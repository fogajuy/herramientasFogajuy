import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export default function ModalInformacionAdicional({
  isOpen,
  onClose,
  datosCliente,
  datosGuardados,
  onDocumentoGenerado
}) {
  const [formData, setFormData] = useState({
    historia: '',
    ventajas: '',
    perspectiva: '',
    destinoFinanciacion: '',
    observaciones: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Cargar datos previos si existen
  useEffect(() => {
    if (datosGuardados) {
      setFormData(datosGuardados);
    }
  }, [datosGuardados, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerarPDF = async () => {
    try {
      setIsGenerating(true);

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // Tamaño A4 en puntos
      const { height } = page.getSize();

      const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let y = height - 50;

      // Encabezado Principal
      page.drawText('INFORMACIÓN ADICIONAL DEL PROYECTO', {
        x: 50,
        y,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.2, 0.4)
      });
      y -= 18;

      const razonSocial = datosCliente?.razonSocial || datosCliente?.nombre || '--------------------';
      const cuit = datosCliente?.cuit || '--------------------';

      page.drawText(`Empresa / Razón Social: ${razonSocial} | CUIT: ${cuit}`, {
        x: 50,
        y,
        size: 9,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3)
      });
      y -= 15;

      page.drawLine({
        start: { x: 50, y },
        end: { x: 545, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8)
      });
      y -= 25;

      // Función auxiliar para envolver y dibujar texto de párrafos
      const drawSection = (title, content) => {
        if (y < 80) return; // Margen inferior de seguridad

        page.drawText(title, {
          x: 50,
          y,
          size: 10,
          font: fontBold,
          color: rgb(0.1, 0.3, 0.5)
        });
        y -= 14;

        const textToDraw = content.trim() || 'Sin especificar.';
        const maxLineWidth = 495;
        const fontSize = 9;

        const paragraphs = textToDraw.split('\n');

        paragraphs.forEach((p) => {
          const words = p.split(' ');
          let currentLine = '';

          words.forEach((word) => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = fontRegular.widthOfTextAtSize(testLine, fontSize);

            if (textWidth > maxLineWidth) {
              if (y > 50) {
                page.drawText(currentLine, {
                  x: 50,
                  y,
                  size: fontSize,
                  font: fontRegular,
                  color: rgb(0.2, 0.2, 0.2)
                });
                y -= 12;
              }
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          });

          if (currentLine && y > 50) {
            page.drawText(currentLine, {
              x: 50,
              y,
              size: fontSize,
              font: fontRegular,
              color: rgb(0.2, 0.2, 0.2)
            });
            y -= 12;
          }
        });

        y -= 15;
      };

      // Secciones requeridas por el formulario
      drawSection('1. BREVE HISTORIA DE LA EMPRESA:', formData.historia);
      drawSection('2. VENTAJAS COMPETITIVAS:', formData.ventajas);
      drawSection('3. PERSPECTIVA COMERCIAL:', formData.perspectiva);
      drawSection('4. LA FINANCIACIÓN SE USARÁ PARA:', formData.destinoFinanciacion);
      drawSection('5. OTRAS OBSERVACIONES:', formData.observaciones);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const archivoPdf = new File([blob], '16_Informacion_Adicional_Proyecto.pdf', {
        type: 'application/pdf'
      });

      onDocumentoGenerado(16, archivoPdf, formData);
      setIsGenerating(false);
      onClose();
    } catch (error) {
      console.error('Error al generar PDF de Información Adicional:', error);
      alert('Ocurrió un error al generar el PDF. Por favor intentá nuevamente.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '850px', width: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <header className="modal-header" style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>📝 Información Adicional del Proyecto</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
        </header>

        <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              BREVE HISTORIA DE LA EMPRESA:
            </label>
            <textarea
              name="historia"
              rows={3}
              value={formData.historia}
              onChange={handleChange}
              placeholder="Detalle cuándo se fundó, evolución, hitos principales y trayectoria..."
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              VENTAJAS COMPETITIVAS:
            </label>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b' }}>
              (Menores costos, alta calidad, tiempos de entrega, ubicación, políticas ambientales, etc.)
            </p>
            <textarea
              name="ventajas"
              rows={3}
              value={formData.ventajas}
              onChange={handleChange}
              placeholder="Describa qué caracteriza a la empresa por sobre sus competidores..."
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              PERSPECTIVA COMERCIAL:
            </label>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b' }}>
              (Incrementar ventas %, mejorar calidad, reducir costos, incrementar producción, diversificar, etc.)
            </p>
            <textarea
              name="perspectiva"
              rows={3}
              value={formData.perspectiva}
              onChange={handleChange}
              placeholder="Detalle de las proyecciones o expectativas de la empresa a futuro..."
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              LA FINANCIACIÓN SE USARÁ PARA:
            </label>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b' }}>
              (Monto que se destinará a máquinas, equipos, vehículos, materiales, mercadería, etc.)
            </p>
            <textarea
              name="destinoFinanciacion"
              rows={3}
              value={formData.destinoFinanciacion}
              onChange={handleChange}
              placeholder="Desglose del uso que se le dará al crédito/financiamiento..."
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', fontSize: '14px' }}>
              OTRAS OBSERVACIONES:
            </label>
            <textarea
              name="observaciones"
              rows={2}
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Cualquier otro dato o aclaración que considere importante..."
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>
        </div>

        <footer className="modal-footer" style={{ padding: '15px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleGenerarPDF}
            disabled={isGenerating}
            style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#0284c7', color: '#fff', cursor: 'pointer' }}
          >
            {isGenerating ? 'Generando PDF...' : 'Guardar y Adjuntar PDF'}
          </button>
        </footer>
      </div>
    </div>
  );
}