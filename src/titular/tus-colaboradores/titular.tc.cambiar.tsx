import React from 'react';
import HeaderTitular from '../header.titular'; // Ajusta la ruta si es necesario
import './titular.tc.cambiar.css';

export default function TitularCambiarGasto() {
  return (
    <div className="app-container">
      <HeaderTitular />

      {/* Perfil del colaborador */}
      <div className="collaborator-profile">
        <div className="collaborator-avatar">
          <img
            src="../pictures/avatar.png"
            alt="Avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=?';
            }}
          />
        </div>
        <h2 className="collaborator-name">Nombre(s) Apellidos</h2>
      </div>

      {/* Formulario de cambio de gasto */}
      <div className="edit-expense-form-container">
        <div className="edit-form">
          <div className="form-row">
            <div className="form-label">Concepto</div>
            <div className="form-fields">
              <input type="text" className="old-value" value="Concepto antiguo" readOnly />
              <input type="text" className="new-value" placeholder="Concepto nuevo" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-label">Fecha</div>
            <div className="form-fields">
              <input type="text" className="old-value" value="Fecha antigua" readOnly />
              <input type="text" className="new-value" placeholder="Fecha nueva" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-label">Método</div>
            <div className="form-fields">
              <input type="text" className="old-value" value="Método de pago antiguo" readOnly />
              <input type="text" className="new-value" placeholder="Método de pago nuevo" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-label">Monto</div>
            <div className="form-fields">
              <input type="text" className="old-value" value="Monto de pago antiguo" readOnly />
              <input type="text" className="new-value" placeholder="Monto de pago nuevo" />
            </div>
          </div>

          <div className="form-actions">
            <button className="apply-button" type="button">
              Aplicar cambios
            </button>
          </div>
        </div>
      </div>

      {/* Botones flotantes */}
      <div className="floating-buttons">
        <div className="export-container">
          <button className="export-btn" type="button">
            <i className="fas fa-file-export"></i>
          </button>
          <div className="export-text">Exportar</div>
        </div>
        <div className="add-container">
          <button className="add-btn" type="button">
            <i className="fas fa-plus"></i>
          </button>
          <div className="add-text">Registrar gasto</div>
        </div>
      </div>
    </div>
  );
}
