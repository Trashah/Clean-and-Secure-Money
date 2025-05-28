import React, { useEffect } from 'react';
import HeaderIndividual from '../header.individual'; // Ajusta ruta si es necesario
import './exportar.individual.css';
import { useExpenses } from '../../hooks/useExpenses';
import { exportToPDF } from '../../services/ExportService';
import { exportToExcel } from '../../services/ExportExcelService';
import { useNavigate } from 'react-router-dom';

export default function ExportarIndividual() {
  const { expenses, loading, error } = useExpenses();
  const navigate = useNavigate();

  // Log para diagnóstico
  useEffect(() => {
    console.log('Estado actual:', { loading, error, expensesCount: expenses?.length });
    if (expenses?.length > 0) {
      console.log('Primer gasto:', expenses[0]);
    }
  }, [expenses, loading, error]);

  const handlePDFExport = () => {
    console.log('Iniciando exportación PDF...');
    console.log('Gastos disponibles:', expenses?.length);
    
    if (!expenses || expenses.length === 0) {
      alert('No hay gastos para exportar');
      return;
    }

    try {
      console.log('Intentando generar PDF con gastos:', expenses);
      exportToPDF(expenses);
      console.log('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
    }
  };

  const handleExcelExport = () => {
    if (!expenses || expenses.length === 0) {
      alert('No hay gastos para exportar');
      return;
    }

    try {
      exportToExcel(expenses);
    } catch (error) {
      console.error('Error al generar Excel:', error);
      alert('Hubo un error al generar el Excel. Por favor, intenta de nuevo.');
    }
  };

  const handleRegistrarGasto = () => {
    navigate('/individual/registrargasto');
  };

  if (loading) {
    return (
      <div className="app-container">
        <HeaderIndividual />
        <div className="main-content">
          <div className="loading">Cargando gastos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <HeaderIndividual />
        <div className="main-content">
          <div className="error">Error al cargar los gastos: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <HeaderIndividual />

      <div className="main-content">
        <div className="export-container">
          <h2>Exportar en:</h2>
          <div className="export-options">
            <div 
              className="export-option excel" 
              onClick={handleExcelExport}
              role="button" 
              tabIndex={0}
              aria-label="Exportar a Excel"
            >
              <div className="export-icon">
                <img
                  src="/pictures/excel-icon.png"
                  alt="Excel"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/80x80?text=Excel';
                  }}
                />
              </div>
              <span>Excel</span>
            </div>
            <div 
              className="export-option pdf"
              onClick={handlePDFExport}
              role="button" 
              tabIndex={0}
              aria-label="Exportar a PDF"
            >
              <div className="export-icon">
                <img
                  src="/pictures/pdf-icon.png"
                  alt="PDF"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/80x80?text=PDF';
                  }}
                />
              </div>
              <span>PDF</span>
            </div>
          </div>
        </div>
      </div>

      <div className="floating-buttons">
        <div
          className="floating-btn add-btn"
          onClick={handleRegistrarGasto}
          role="button"
          tabIndex={0}
        >
          <i className="fas fa-plus"></i>
          <span>Registrar gasto</span>
        </div>
      </div>
    </div>
  );
}
