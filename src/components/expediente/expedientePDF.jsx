import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../navBar/navBar';
import '../../styles/expedientePDF.css';

export default function ExpedientePDF() {
  const location = useLocation();
  const navigate = useNavigate();

  // Recibimos la URL del PDF y los datos desde el estado de la navegación
  const pdfUrl = location.state?.pdfUrl;
  const nombreArchivo = location.state?.nombreArchivo || 'Expediente_Compilado.pdf';

  const handleDescargar = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = nombreArchivo;
    link.click();
  };

  if (!pdfUrl) {
    return (
      <div className="expediente-error-container">
        <Navbar />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>No se encontró ningún expediente cargado</h2>
          <button onClick={() => navigate('/')}>Volver al Inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="expediente-container">
      <Navbar />

      <header className="expediente-actions-bar">
        <button className="btn-volver" onClick={() => navigate(-1)}>
          ← Volver al Checklist
        </button>
        <h3>Vista Previa del Expediente Compilado</h3>
        <button className="btn-descargar" onClick={handleDescargar}>
          📥 Descargar PDF Final
        </button>
      </header>

      {/* Visor integrado del PDF */}
      <div className="pdf-viewer-container">
        <iframe
          src={pdfUrl}
          title="Vista Previa del Expediente"
          width="100%"
          height="750px"
        />
      </div>
    </div>
  );
}