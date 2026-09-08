// import React, { useState } from 'react';

// // Recibimos los datos y la función desde el ContenedorEvaluador
// const FormularioEncabezado = ({ datos, onActualizar }) => {

//     // Obtenemos la fecha de hoy para el valor por defecto
//     const hoy = new Date().toISOString().split('T')[0];

//     // 🏆 EL GRAN JSON MAESTRO AISLADO 🏆
//     const [datosProyecto, setDatosProyecto] = useState({
//         encabezado: {
//             titular: '', 
//             expediente: '', 
//             localidad: '', 
//             monto: '', 
//             nombreProyecto: '', 
//             fecha: hoy, 
//             periodos: 1
//         },
//         flujoFondos: {
//             ingresos: [], egresosFijos: [], egresosVariables: []
//         },
//         inversionesCapital: {
//             inversiones: [], capitalTrabajo: []
//         },
//         financiacion: {
//             credito: {}, deudas: []
//         }
//     });

//     // Función para manejar los cambios en los inputs
//     const handleChange = (e) => {
//         const { name, value } = e.target;
        
//         // Convertimos a número los campos que lo requieran (monto y periodos)
//         let valorFinal = value;
//         if (name === 'monto' || name === 'periodos') {
//             valorFinal = value === '' ? '' : Number(value);
//         }

//         onActualizar({
//             ...datos,
//             [name]: valorFinal
//         });
//     };

//     return (
//         <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', background: '#f9f9f9', borderRadius: '10px', border: '1px solid #ddd' }}>
//             <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Datos del Proyecto (Encabezado)</h2>
            
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
//                 {/* TITULAR */}
//                 <div style={{ display: 'flex', flexDirection: 'column' }}>
//                     <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Titular:</label>
//                     <input type="text" name="titular" value={datos.titular || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Nombre del titular o empresa" />
//                 </div>

//                 {/* EXPEDIENTE */}
//                 <div style={{ display: 'flex', flexDirection: 'column' }}>
//                     <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Expediente Nº:</label>
//                     <input type="text" name="expediente" value={datos.expediente || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Ej: 2026000174" />
//                 </div>

//                 {/* NOMBRE DEL PROYECTO */}
//                 <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
//                     <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Nombre del Proyecto:</label>
//                     <input type="text" name="nombreProyecto" value={datos.nombreProyecto || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Breve descripción o título" />
//                 </div>

//                 {/* LOCALIDAD Y DEPARTAMENTO */}
//                 <div style={{ display: 'flex', flexDirection: 'column' }}>
//                     <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Localidad y Depto:</label>
//                     <input type="text" name="localidad" value={datos.localidad || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Ej: El Carmen - Dpto. El Carmen" />
//                 </div>

//                 {/* MONTO SOLICITADO */}
//                 <div style={{ display: 'flex', flexDirection: 'column' }}>
//                     <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Monto Solicitado ($):</label>
//                     <input type="number" name="monto" value={datos.monto === 0 ? '' : datos.monto} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} placeholder="Ej: 20000000" />
//                 </div>

//                 {/* FECHA */}
//                 <div style={{ display: 'flex', flexDirection: 'column' }}>
//                     <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Fecha de Evaluación:</label>
//                     <input type="date" name="fecha" value={datos.fecha || ''} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
//                 </div>

//                 {/* CANTIDAD DE PERIODOS */}
//                 <div style={{ display: 'flex', flexDirection: 'column' }}>
//                     <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Periodos a proyectar (1 a 10):</label>
//                     <input type="number" name="periodos" min="1" max="10" value={datos.periodos === 0 ? '' : datos.periodos} onChange={handleChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} />
//                 </div>

//             </div>
//         </div>
//     );
// };

// export default FormularioEncabezado;

import React from 'react';

// Lista de departamentos de Jujuy con sus cabeceras
const DEPARTAMENTOS_JUJUY = [
    "Dr. Manuel Belgrano (Cabecera: San Salvador de Jujuy)",
    "Ledesma (Cabecera: Libertador General San Martín)",
    "San Pedro (Cabecera: San Pedro de Jujuy)",
    "Palpalá (Cabecera: Palpalá)",
    "El Carmen (Cabecera: El Carmen)",
    "Tilcara (Cabecera: Tilcara)",
    "Humahuaca (Cabecera: Humahuaca)",
    "Tumbaya (Cabecera: Tumbaya)",
    "Valle Grande (Cabecera: Valle Grande)",
    "Santa Bárbara (Cabecera: Santa Clara / El Talar)",
    "Rinconada (Cabecera: Rinconada)",
    "Susques (Cabecera: Susques)",
    "Yavi (Cabecera: La Quiaca)",
    "Santa Catalina (Cabecera: Santa Catalina)",
    "Cochinoca (Cabecera: Abra Pampa)",
    "San Antonio (Cabecera: San Antonio)"
];

const FormularioEncabezado = ({ datos = {}, onActualizar }) => {
    // Fecha de hoy por defecto si no viene cargada
    const hoy = new Date().toISOString().split('T')[0];

    // Aseguramos que siempre tengamos un objeto seguro para trabajar
    const d = datos || {};

    const handleChange = (e) => {
        const { name, value } = e.target;
        let valorFinal = value;

        if (name === 'monto') {
            valorFinal = value === '' ? '' : Math.max(0, Number(value));
        }

        if (name === 'periodos') {
            if (value === '') {
                valorFinal = '';
            } else {
                const num = Number(value);
                valorFinal = Math.min(10, Math.max(1, num));
            }
        }

        if (onActualizar) {
            onActualizar({
                ...d,
                [name]: valorFinal
            });
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', background: '#ffffff', borderRadius: '8px', border: '1px solid #ddd', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <h2 style={{ borderBottom: '2px solid #1a237e', color: '#1a237e', paddingBottom: '10px', marginTop: 0, marginBottom: '20px' }}>
                Evaluación Financiera - Datos del Proyecto
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
                {/* TITULAR */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Titular:</label>
                    <input type="text" name="titular" value={d.titular || ''} onChange={handleChange} style={inputStyle} placeholder="Nombre del titular o empresa" />
                </div>

                {/* EXPEDIENTE */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Expediente Nº:</label>
                    <input type="text" name="expediente" value={d.expediente || ''} onChange={handleChange} style={inputStyle} placeholder="Ej: 2026000174" />
                </div>

                {/* NOMBRE DEL PROYECTO */}
                <div style={{ display: 'flex', flexDirection: 'column', gridColumn: '1 / -1' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Nombre del Proyecto:</label>
                    <input type="text" name="nombreProyecto" value={d.nombreProyecto || ''} onChange={handleChange} style={inputStyle} placeholder="Breve descripción o título" />
                </div>

                {/* LOCALIDAD Y DEPARTAMENTO (AHORA ES UN SELECT) */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Localidad y Depto:</label>
                    <select 
                        name="localidad" 
                        value={d.localidad || ''} 
                        onChange={handleChange} 
                        style={inputStyle}
                    >
                        <option value="">-- Seleccione un Departamento --</option>
                        {DEPARTAMENTOS_JUJUY.map((depto, index) => (
                            <option key={index} value={depto}>
                                {depto}
                            </option>
                        ))}
                    </select>
                </div>

                {/* MONTO SOLICITADO */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Monto Solicitado ($):</label>
                    <input type="number" name="monto" value={d.monto === '' || d.monto === undefined ? '' : d.monto} onChange={handleChange} style={inputStyle} placeholder="Ej: 20000000" />
                </div>

                {/* FECHA DE EVALUACIÓN */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Fecha de Evaluación:</label>
                    <input type="date" name="fecha" value={d.fecha || hoy} onChange={handleChange} style={inputStyle} />
                </div>

                {/* CANTIDAD DE PERIODOS */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Períodos a proyectar (1 a 10 años):</label>
                    <input type="number" name="periodos" min="1" max="10" value={d.periodos === '' || d.periodos === undefined ? '' : d.periodos} onChange={handleChange} style={inputStyle} />
                </div>

            </div>
        </div>
    );
};

const inputStyle = {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    backgroundColor: '#fff' // Asegura que el select se vea igual que los inputs
};

export default FormularioEncabezado;