import React from 'react';
import HeaderTitular from '../header.titular'; // Ajusta ruta si es necesario
import './titular.tc2.css';

const gastos = [
  { id: 1, concepto: 'Concepto de pago', fecha: 'XX/XX/20XX', metodo: 'Efectivo/Tarjeta', monto: '$ ####' },
  { id: 2, concepto: 'Concepto de pago', fecha: 'XX/XX/20XX', metodo: 'Efectivo/Tarjeta', monto: '$ ####' },
  { id: 3, concepto: 'Concepto de pago', fecha: 'XX/XX/20XX', metodo: 'Efectivo/Tarjeta', monto: '$ ####' },
  { id: 4, concepto: 'Concepto de pago', fecha: 'XX/XX/20XX', metodo: 'Efectivo/Tarjeta', monto: '$ ####' },
  { id: 5, concepto: 'Concepto de pago', fecha: 'XX/XX/20XX', metodo: 'Efectivo/Tarjeta', monto: '$ ####' },
  { id: 6, concepto: 'Concepto de pago', fecha: 'XX/XX/20XX', metodo: 'Efectivo/Tarjeta', monto: '$ ####' },
];

export default function TitularDetalleColaborador() {
  return (
    <div className="app-container">
      <HeaderTitular />

      {/* Perfil del colaborador */}
      <div className="collaborator-profile">
        <div className="collaborator-avatar">
          <img
            src="../pictures/avatar.png"
            alt="Avatar"
            onError={(e) => ((e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=?')}
          />
        </div>
        <h2 className="collaborator-name">Nombre(s) Apellidos</h2>
      </div>

      {/* Tabla de gastos */}
      <div className="expenses-section">
        <div className="table-header">
          <div className="column concepto">Concepto</div>
          <div className="column fecha">Fecha</div>
          <div className="column metodo">Método</div>
          <div className="column monto">Monto</div>
          <div className="column acciones"></div>
        </div>

        <div className="table-body">
          {gastos.map((gasto) => (
            <div key={gasto.id} className="table-row">
              <div className="column concepto">{gasto.concepto}</div>
              <div className="column fecha">{gasto.fecha}</div>
              <div className="column metodo">{gasto.metodo}</div>
              <div className="column monto">{gasto.monto}</div>
              <div className="column acciones">
                <button className="action-btn edit" aria-label={`Editar gasto ${gasto.id}`}>
                  <i className="fas fa-pencil-alt"></i>
                </button>
                <button className="action-btn delete" aria-label={`Eliminar gasto ${gasto.id}`}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Botones flotantes */}
      <div className="floating-buttons">
        <div className="export-container">
          <button className="export-btn" aria-label="Exportar">
            <i className="fas fa-file-export"></i>
          </button>
          <div className="export-text">Exportar</div>
        </div>
        <div className="add-container">
          <button className="add-btn" aria-label="Registrar gasto">
            <i className="fas fa-plus"></i>
          </button>
          <div className="add-text">Registrar gasto</div>
        </div>
      </div>
    </div>
  );
}
