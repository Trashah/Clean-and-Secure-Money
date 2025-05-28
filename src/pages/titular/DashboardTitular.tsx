import React from 'react';
import HeaderTitular from '../../titular/header.titular';
import './DashboardTitular.css';

const DashboardTitular = () => {
  return (
    <div className="app-container">
      <HeaderTitular />
      <div className="main-content">
        <div className="dashboard-content">
          <h1>Dashboard Titular</h1>
          {/* Aquí va el contenido del dashboard */}
        </div>
      </div>
    </div>
  );
};

export default DashboardTitular; 