import React from 'react';
import FloatingButtons from '../../components/FloatingButtons/FloatingButtons';
import HeaderIndividual from '../../individual/header.individual';

const DashboardIndividual = () => {
  return (
    <div className="dashboard-container">
      <HeaderIndividual />
      
      <div className="dashboard-content">
        <h1>Dashboard Individual</h1>
        {/* Aquí va el contenido del dashboard */}
      </div>

      {/* Botones flotantes para usuario individual */}
      <FloatingButtons variant="individual" />
    </div>
  );
};

export default DashboardIndividual; 