import React from 'react';
import FloatingButtons from '../../components/FloatingButtons/FloatingButtons';
import HeaderColaborador from '../../colaborador/header.colaborador';

const DashboardColaborador = () => {
  return (
    <div className="dashboard-container">
      <HeaderColaborador />
      
      <div className="dashboard-content">
        <h1>Dashboard Colaborador</h1>
        {/* Aquí va el contenido del dashboard */}
      </div>

      {/* Botones flotantes para colaborador - nota que no tendrá botón de exportar */}
      <FloatingButtons variant="colaborador" />
    </div>
  );
};

export default DashboardColaborador; 