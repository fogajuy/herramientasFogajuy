// src/components/Home.jsx
import { useNavigate } from "react-router-dom";
import NavBar from "../navBar/navBar";
import '../../styles/home.css'

export default function Home() {
  const navigate = useNavigate();  
  return (
    <div className="home-container">
      <NavBar />  
      <section className="home-hero">
        <h2>Fondo de Garantías de Jujuy (FOGAJUY)</h2>
        <p>
          Optimizamos y facilitamos el acceso a garantías públicas para PyMEs, Monotributistas y Personas Jurídicas. 
          A través de esta plataforma digital local podrás realizar simulaciones de financiamiento y compilar tu expediente 
          documental unificado de manera ágil y directa.
        </p>
        <a 
          href="https://www.fogajuy.com.ar/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="home-link"
        >
          Visitar sitio web oficial: www.fogajuy.com.ar →
        </a>
      </section>

      <div className="home-grid">
        <article className="home-card">
          <div>
            <h3>Simulador de Financiación Crédito</h3>
            <p>
              Calcula montos, esquemas de amortización y proyecciones financieras.
            </p>
          </div>
          <button 
            className="home-card-btn" 
            onClick={() => navigate("/simuladorCredito")}
          >
            Ir al Simulador Crédito
          </button>
        </article>

        <article className="home-card">
          <div>
            <h3>Simulador de Financiación Descuento Echeqs-Pagaré</h3>
            <p>
              Calcula montos y proyecciones financieras.
            </p>
          </div>
          <button 
            className="home-card-btn" 
            onClick={() => navigate("/simuladorBursatil")}
          >
            Ir al Simulador Descuento
          </button>
        </article>

        <article className="home-card">
          <div>
            <h3>Armador de Expediente</h3>
            <p>
              Carga tus archivos PDF requeridos según tu perfil y línea de crédito. Genera un único documento final consolidado con la nota e informes requeridos.
            </p>
          </div>
          <button 
            className="home-card-btn" 
            onClick={() => navigate("/pantallaInicio")}
          >
            Ir al Expediente
          </button>
        </article>
        <article className="home-card">
          <div>
            <h3>Evaluación Financiera</h3>
            <p>
              Carga datos requeridos y línea de crédito. Genera un único documento final consolidado con la nota e informes requeridos.
            </p>
          </div>
          <button 
            className="home-card-btn" 
            onClick={() => navigate("/evaluacionFinanciera")}
          >
            Ir a la Evaluación Financiera
          </button>
        </article>
      </div>
    </div>
  );
}