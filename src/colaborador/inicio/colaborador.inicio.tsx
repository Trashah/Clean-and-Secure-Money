import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderColaborador from '../header.colaborador';
import './colaborador.inicio.css';
import { useExpenses } from '../../hooks/useExpenses';
import { useAuth } from '../../context/AuthContext';
import FloatingButtons from '../../components/FloatingButtons/FloatingButtons';
import ExportarColaborador from '../exportar/exportar.colaborador';

export default function ColaboradorInicio() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { expenses, loading, error, deleteExpense } = useExpenses();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Filtrar solo los gastos del colaborador actual
  const gastosFiltrados = expenses.filter(expense => expense.userId === currentUser?.uid);

  // Calcular el monto total
  const totalAmount = useMemo(() => {
    return gastosFiltrados.reduce((sum, expense) => sum + expense.monto, 0);
  }, [gastosFiltrados]);

  const handleEdit = (gastoId: string) => {
    navigate('/colaborador/registrargasto', { state: { gastoId } });
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

  const handleExport = () => {
    setShowExportModal(true);
  };

  if (loading) {
    return (
      <div className="app-container">
        <HeaderColaborador />
        <div className="main-content">
          <div className="loading">Cargando gastos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <HeaderColaborador />
        <div className="main-content">
          <div className="error">Error al cargar los gastos: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <HeaderColaborador />
      <div className="main-content">
        <div className="table-container">
          {gastosFiltrados.length === 0 ? (
            <div className="no-expenses">
              <p>No hay gastos registrados</p>
              <button 
                className="add-first-expense"
                onClick={() => navigate('/colaborador/registrargasto')}
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
                {gastosFiltrados.map((gasto) => (
                  <tr key={gasto.id}>
                    <td>{gasto.concepto}</td>
                    <td>{new Date(gasto.fecha).toLocaleDateString('es-MX')}</td>
                    <td>{gasto.metodo}</td>
                    <td className="monto-cell">
                      ${gasto.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          onClick={() => handleEdit(gasto.id)}
                          disabled={isDeleting}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(gasto.id)}
                          disabled={isDeleting}
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

        <FloatingButtons 
          variant="colaborador"
          showAddButton={true}
          showExportButton={true}
          onAddClick={() => navigate('/colaborador/registrargasto')}
          onExport={handleExport}
          exportText="Exportar gastos"
        />

        {showExportModal && (
          <ExportarColaborador
            data={gastosFiltrados}
            periodo="Todos"
            onClose={() => setShowExportModal(false)}
            totalAmount={totalAmount}
          />
        )}
      </div>
    </div>
  );
}
