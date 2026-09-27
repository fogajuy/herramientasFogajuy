// src/components/Navbar.jsx
import { useNavigate } from "react-router-dom";
import '../../styles/navBar.css'

export default function Navbar({ vistaActual, setVistaActual }) {
  const navigate = useNavigate(); 
  return (
    <nav className="navbar">
      <h1 className="navbar-logo" onClick={() => setVistaActual('expediente')}>
        FOGAJUY
      </h1>
      <div className="navbar-menu">
        <button
          className={`navbar-btn ${vistaActual === 'simulador' ? 'active' : ''}`}
          onClick={() => navigate("/home")}
        >
          INICIO
        </button>
        <button
          className={`navbar-btn ${vistaActual === 'simulador' ? 'active' : ''}`}
          onClick={() => navigate("/simuladorCredito")}
        >
          SIMULADOR FINANCIACIÓN
        </button>
        <button
          className={`navbar-btn ${vistaActual === 'simulador' ? 'active' : ''}`}
          onClick={() => navigate("/simuladorBursatil")}
        >
          SIMULADOR ECHEQS / PAGARÉ
        </button>
        <button
          className={`navbar-btn ${vistaActual === 'expediente' ? 'active' : ''}`}
          onClick={() => navigate("/pantallaInicio")}
        >
          EXPEDIENTE
        </button>
        {/* <button
          className={`navbar-btn ${vistaActual === 'expediente' ? 'active' : ''}`}
          onClick={() => navigate("/procesoEvaluacion")}
        >
          EVALUACION
        </button> */}
      </div>
    </nav>
  );
}