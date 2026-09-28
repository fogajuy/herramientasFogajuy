import { useState } from 'react'
import { Route, Routes, Navigate  } from 'react-router-dom';
import './App.css'
import Home from './components/pages/home';
import SimuladorCredito from './components/simuladores/simuladorCredito';
import SimuladorBursatil from './components/simuladores/simuladorBursatil';
import PantallaInicio from './components/expediente/pantallaInicio';
import PersonaJuridica from './components/expediente/personaJurica';
import PersonaFisica from './components/expediente/personaFisica';
import ExpedientePDF from './components/expediente/expedientePDF';
import EvaluacionFinanciera from './components/expediente/evaluacionFinanciera';
import ContenedorEvaluador from './components/helpers/financieros/formularios/contenedorEvaluador';
import ProcesoEvaluacion from './components/helpers/financieros/formularios/procesoEvaluacion';
import InformeEvaluacion from './components/helpers/financieros/formularios/informeEvaluacion';
import AnexarExpediente from './components/expediente/anexarExpediente';

// 🧹 BORRAMOS LAS IMPORTACIONES DE LOS FORMULARIOS INDIVIDUALES
// Porque ahora solo se importan y usan adentro de ContenedorEvaluador.jsx

function App() {
  return (
    <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/simuladorCredito" element={<SimuladorCredito />} />
        <Route path="/simuladorBursatil" element={<SimuladorBursatil />} />
        <Route path="/pantallaInicio" element={<PantallaInicio />} />
        <Route path="/personaJurica" element={<PersonaJuridica />} />
        <Route path="/personaFisica" element={<PersonaFisica />} />
        <Route path="/expedientePDF" element={<ExpedientePDF />} />
        <Route path="/evaluacionFinanciera" element={<InformeEvaluacion />} />
        <Route path="/anexarExpediente" element={<AnexarExpediente />} />
        
        {/* 🏆 ESTA ES LA ÚNICA RUTA QUE NECESITAS PARA TODO EL MÓDULO */}
        <Route path="/contenedorEvaluador" element={<ContenedorEvaluador />} />
        <Route path="/procesoEvaluacion" element={<ProcesoEvaluacion />} />
      </Routes>
  )
}

export default App