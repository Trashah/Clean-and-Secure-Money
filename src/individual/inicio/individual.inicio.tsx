import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderIndividual from '../header.individual';
import './individual.inicio.css';
import { useExpenses } from '../../hooks/useExpenses';
import { useAuth } from '../../context/AuthContext';
import FloatingButtons from '../../components/FloatingButtons/FloatingButtons';

export default function IndividualInicio() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { expenses, loading, error, deleteExpense } = useExpenses();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (gastoId: string) => {
    navigate('/individual/registrargasto', { state: { gastoId } });
  };

  const handleDelete = async (gastoId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      try {
        setIsDeleting(true);
        await deleteExpense(gastoId);
      } catch (error) {
        console.error('Error al eliminar el gasto:', error);
        alert('Error al eliminar el gasto. Por favor, intenta de nuevo.');
      } finally {
        setIsDeleting(false);
      }
    }
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
        <div className="table-container">
          {expenses.length === 0 ? (
            <div className="no-expenses">
              <p>No hay gastos registrados</p>
              <button 
                className="add-first-expense"
                onClick={() => navigate('/individual/registrargasto')}
              >
                Registrar primer gasto
              </button>
            </div>
          ) : (
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Concepto</th>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th>Monto</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((gasto) => (
                  <tr key={gasto.id}>
                    <td>
                      <input 
                        type="text" 
                        value={gasto.concepto} 
                        readOnly 
                        className="concepto-input"
                      />
                    </td>
                    <td className="fecha-cell">
                      {new Date(gasto.fecha).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="metodo-cell">{gasto.metodo}</td>
                    <td className="monto-cell">
                      ${gasto.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="acciones-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          onClick={() => handleEdit(gasto.id)}
                          disabled={isDeleting}
                          aria-label={`Editar gasto ${gasto.concepto}`}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(gasto.id)}
                          disabled={isDeleting}
                          aria-label={`Eliminar gasto ${gasto.concepto}`}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <FloatingButtons 
        variant="individual"
        showAddButton={true}
        showExportButton={true}
        addPath="/individual/registrargasto"
        exportPath="/individual/exportar"
      />
    </div>
  );
}
