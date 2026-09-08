import React from 'react';
import { useNavigate } from "react-router-dom";
import NavBar from "../navBar/navBar";
import '../../styles/pantallaInicio.css';

export default function PantallaInicio() {
  const navigate = useNavigate();

  return (
    <div className="inicio-container">
      <NavBar /> 
      
      {/* Encabezado */}
      <header className="inicio-header">
        <h1>Asistente de Armado de Expedientes</h1>
        <p>
          Te guiaremos paso a paso para reunir y consolidar toda la documentación 
          necesaria para la solicitud de tus garantías en un único archivo PDF listo para enviar o imprimir.
        </p>
      </header>

      {/* Tarjetas Explicativas */}
      <section className="inicio-pasos-grid">
        <div className="paso-card">
          <div className="paso-numero">1</div>
          <h3>Seleccioná el Tipo de Persona</h3>
          <p>Elegí si la solicitud corresponde a una Persona Física o una Persona Jurídica.</p>
        </div>
        <div className="paso-card">
          <div className="paso-numero">2</div>
          <h3>Adjuntá tus Archivos</h3>
          <p>Podés subir archivos en PDF, Word, Excel o Imágenes en el orden que prefieras.</p>
        </div>
        <div className="paso-card">
          <div className="paso-numero">3</div>
          <h3>Generación Unificada A4</h3>
          <p>Convertimos y estandarizamos todo en una sola carpeta digital con carátula e índice.</p>
        </div>
        <div className="paso-card">
          <div className="paso-numero">4</div>
          <h3>Descargá o Compartí</h3>
          <p>Descargá el archivo a tu equipo o compartilo directamente por WhatsApp o Email.</p>
        </div>
      </section>

      {/* Recomendaciones */}
      <div className="inicio-alerta">
        <strong>💡 Recomendaciones Importantes:</strong>
        <ul>
          <li>No te preocupes por el orden: podés ir avanzando o salteando pasos según tengas la información.</li>
          <li>Asegúrate de que las fotos de documentos sean legibles y con buena luz.</li>
          <li>Los documentos en Word o Excel serán acomodados automáticamente a tamaño hoja A4.</li>
        </ul>
      </div>

      {/* Botones de Selección */}
      <div className="inicio-acciones">
        <h2>Seleccioná la opción para comenzar:</h2>
        
        <div className="botones-container">
          <button 
            type="button" 
            className="btn-comenzar btn-juridica"
            onClick={() => navigate("/personaJurica")}
          >
            🏢 Expediente Persona Jurídica (Empresa / Sociedad) →
          </button>

          <button 
            type="button" 
            className="btn-comenzar btn-fisica"
            onClick={() => navigate("/personaFisica")}
          >
            👤 Expediente Persona Física (Humana / Unipersonal) →
          </button>
        </div>
      </div>
    </div>
  );
}