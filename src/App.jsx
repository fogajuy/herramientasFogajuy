// import { useState } from 'react'
// import { Route, Routes, Navigate  } from 'react-router-dom';
// import './App.css'
// import Home from './components/pages/home';
// import SimuladorCredito from './components/simuladores/simuladorCredito';
// import SimuladorBursatil from './components/simuladores/simuladorBursatil';
// import PantallaInicio from './components/expediente/pantallaInicio';
// import PersonaJuridica from './components/expediente/personaJurica';
// import PersonaFisica from './components/expediente/personaFisica';
// import ExpedientePDF from './components/expediente/expedientePDF';
// import EvaluacionFinanciera from './components/expediente/evaluacionFinanciera';
// import FormularioEncabezado from './components/helpers/financieros/formularios/formularioEncabezado';
// import FormularioIngresos from './components/helpers/financieros/formularios/formularioIngresos';
// import FormularioEgresos from './components/helpers/financieros/formularios/formularioEgresos';
// import FormularioInversiones from './components/helpers/financieros/formularios/formularioInversiones';
// import FormularioFinanciacion from './components/helpers/financieros/formularios/formularioFinanciacion';
// import ContenedorEvaluador from './components/helpers/financieros/formularios/contenedorEvaluador';
// import FlujoDeCaja from './components/helpers/financieros/formularios/flujoDeCaja';


// function App() {

//   return (
//     <Routes>
//         <Route path="/home" element={<Home />} />
//         <Route path="/simuladorCredito" element={<SimuladorCredito />} />
//         <Route path="/simuladorBursatil" element={<SimuladorBursatil />} />
//         <Route path="/pantallaInicio" element={<PantallaInicio />} />
//         <Route path="/personaJurica" element={<PersonaJuridica />} />
//         <Route path="/personaFisica" element={<PersonaFisica />} />
//         <Route path="/expedientePDF" element={<ExpedientePDF />} />
//         <Route path="/evaluacionFinanciera" element={<EvaluacionFinanciera />} />
//         <Route path="/formularioEncabezado" element={<FormularioEncabezado />} />
//         <Route path="/formularioIngresos" element={<FormularioIngresos />} />
//         <Route path="/formularioEgresos" element={<FormularioEgresos />} />
//         <Route path="/formularioInversiones" element={<FormularioInversiones />} />
//         <Route path="/formularioFinanciacion" element={<FormularioFinanciacion />} />
//         <Route path="/contenedorEvaluador" element={<ContenedorEvaluador />} />
//         <Route path="/flujoCaja" element={<FlujoDeCaja />} />
//       </Routes>
//   )
// }

// export default App


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
        <Route path="/evaluacionFinanciera" element={<EvaluacionFinanciera />} />
        
        {/* 🏆 ESTA ES LA ÚNICA RUTA QUE NECESITAS PARA TODO EL MÓDULO */}
        <Route path="/contenedorEvaluador" element={<ContenedorEvaluador />} />
      </Routes>
  )
}

export default App