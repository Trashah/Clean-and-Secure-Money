import React, { useState } from 'react';
import TitularHeader from '../header.titular'; // Ajusta la ruta a tu componente header
import './titular.cl.agregar.css';

export default function TitularClAgregar() {
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');

  const handleSubmit = () => {
    // Aquí puedes agregar la lógica para guardar el concepto y monto
    alert(`Concepto: ${concepto}\nMonto: ${monto}`);
  };

  return (
    <div className="app-container">
      <div id="header">
        <TitularHeader />
      </div>

      <main className="main-content">
        <div className="concepto-limite-container">
          <div className="concepto-row">
            <div className="concepto-label">Concepto</div>
            <input
              type="text"
              placeholder="Concepto de pago nuevo"
              className="form-control"
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
            />
          </div>

          <div className="monto-row">
            <div className="monto-label">Monto</div>
            <input
              type="number"
              placeholder="Limite de monto de pago del concepto"
              className="form-control"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>

          <button
            id="aplicar-cambios"
            className="button primary-button"
            onClick={handleSubmit}
            disabled={!concepto || !monto}
          >
            Aplicar cambios
          </button>
        </div>
      </main>
    </div>
  );
}
