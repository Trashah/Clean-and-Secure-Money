import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home/Home';
import Login from './auth/login';
import Registro from './auth/registro';
//import individual
import IndividualInicio from './individual/inicio/individual.inicio';
import IndividualResumen from './individual/resumen/individual.resumen';
import IndividualCl from './individual/conceptos-limites/individual.cl';
import IndividualRegistrarGasto from './individual/registrargasto/individual.registrargasto';
import IndividualExportar from './individual/exportar/exportar.individual';
//import colaborador
import ColaboradorInicio from './colaborador/inicio/colaborador.inicio';
import ColaboradorResumen from './colaborador/resumen/colaborador.resumen';
import ColaboradorExportar from './colaborador/exportar/exportar.colaborador';
import ColaboradorRegistrarGasto from './colaborador/registrargasto/colaborador.registrargasto';
//import titular
import TitularClAgregar from './titular/conceptos-limites/titular.cl.agregar';
import TitularConceptosLimites from './titular/conceptos-limites/titular.cl';
import ExportarTitular from './titular/exportar/exportar.titular';
import TitularInicio from './titular/inicio/titular.inicio';
import TitularRegistrarGasto from './titular/registrargasto/titular.registrargasto';
import TitularResumen from './titular/resumen/titular.resumen';
import TitularAgregarColaborador from './titular/tus-colaboradores/titular.tc.agregar';
import TitularCambiarGasto from './titular/tus-colaboradores/titular.tc.cambiar';
import TitularColaboradores from './titular/tus-colaboradores/titular.tc1';
import TitularDetalleColaborador from './titular/tus-colaboradores/titular.tc2';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        {/* Rutas individuales */}
        <Route path="/individual/inicio" element={<IndividualInicio />} /> 
        <Route path="/individual/resumen" element={<IndividualResumen />} />
        <Route path="/individual/cl" element={<IndividualCl />} />
        <Route path="/individual/registrargasto" element={<IndividualRegistrarGasto />} />
        <Route path="/individual/exportar" element={<IndividualExportar />} />
        {/* Rutas colaboradores */}
        <Route path="/colaborador/inicio" element={<ColaboradorInicio />} />
        <Route path="/colaborador/resumen" element={<ColaboradorResumen />} />
        <Route path="/colaborador/exportar" element={<ColaboradorExportar />} />
        <Route path="/colaborador/registrargasto" element={<ColaboradorRegistrarGasto />} />
        {/* Rutas titulares */}
        <Route path="/titular/inicio" element={<TitularInicio />} />
        <Route path="/titular/registrargasto" element={<TitularRegistrarGasto />} />
        <Route path="/titular/resumen" element={<TitularResumen />} />
        <Route path="/titular/cl" element={<TitularConceptosLimites />} />
        <Route path="/titular/cl/agregar" element={<TitularClAgregar />} />
        <Route path="/titular/exportar" element={<ExportarTitular />} />
        <Route path="/titular/tus-colaboradores" element={<TitularColaboradores />} />
        <Route path="/titular/tus-colaboradores/agregar" element={<TitularAgregarColaborador />} />
        <Route path="/titular/tus-colaboradores/cambiar" element={<TitularCambiarGasto />} />
        <Route path="/titular/tus-colaboradores/detalle" element={<TitularDetalleColaborador />} />
      </Routes>
    </BrowserRouter>
  );
}
