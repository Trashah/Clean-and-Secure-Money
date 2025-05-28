import React, { useState, useMemo, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';
import HeaderColaborador from '../header.colaborador';
import FloatingButtons from '../../components/FloatingButtons/FloatingButtons';
import ExportarColaborador from '../exportar/exportar.colaborador';
import './colaborador.resumen.css';
import { useExpenses } from '../../hooks/useExpenses';
import { useAuth } from '../../context/AuthContext';
import { Chart } from 'chart.js';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

// Colores predefinidos para las categorías
const COLORS = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#B2EBF2',
  '#FFCCBC',
  '#C5CAE9',
  '#F8BBD0'
];

export default function ColaboradorResumen() {
  const [filtro, setFiltro] = useState<'Semanal' | 'Mensual' | 'Anual'>('Semanal');
  const [mostrarGastos, setMostrarGastos] = useState<'propios' | 'titular' | 'todos'>('propios');
  const [showExportModal, setShowExportModal] = useState(false);
  const chartRef = useRef<any>(null);
  const { expenses, loading, error } = useExpenses();
  const { currentUser } = useAuth();

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    
    const now = new Date();
    const startDate = new Date();
    
    switch (filtro) {
      case 'Semanal':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'Mensual':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'Anual':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    let filteredByDate = expenses.filter(expense => 
      new Date(expense.fecha) >= startDate && 
      new Date(expense.fecha) <= now
    );

    // Filtrar por tipo de gastos
    switch (mostrarGastos) {
      case 'propios':
        return filteredByDate.filter(expense => expense.userId === currentUser?.uid);
      case 'titular':
        return filteredByDate.filter(expense => expense.userId !== currentUser?.uid);
      case 'todos':
      default:
        return filteredByDate;
    }
  }, [expenses, filtro, mostrarGastos, currentUser]);

  const chartData = useMemo(() => {
    if (!filteredExpenses.length) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
        }]
      };
    }

    // Agrupar gastos por concepto
    const groupedExpenses = filteredExpenses.reduce((acc, expense) => {
      acc[expense.concepto] = (acc[expense.concepto] || 0) + expense.monto;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(groupedExpenses);
    const data = Object.values(groupedExpenses);
    const backgroundColors = COLORS.slice(0, labels.length);

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1,
      }]
    };
  }, [filteredExpenses]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.monto, 0);
  }, [filteredExpenses]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    cutout: '70%'
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  if (loading) {
    return (
      <div className="app-container">
        <HeaderColaborador />
        <div className="main-content">
          <div className="loading">Cargando datos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <HeaderColaborador />
        <div className="main-content">
          <div className="error">Error al cargar los datos: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <HeaderColaborador />
      <div className="main-content">
        <div className="dashboard-container">
          <div className="left-panel">
            <div className="chart-container">
              <div className="chart-title">Distribución de Gastos</div>
              <div className="view-filters">
                <button
                  className={`view-filter-button ${mostrarGastos === 'propios' ? 'active' : ''}`}
                  onClick={() => setMostrarGastos('propios')}
                >
                  Mis Gastos
                </button>
                <button
                  className={`view-filter-button ${mostrarGastos === 'titular' ? 'active' : ''}`}
                  onClick={() => setMostrarGastos('titular')}
                >
                  Gastos del Titular
                </button>
                <button
                  className={`view-filter-button ${mostrarGastos === 'todos' ? 'active' : ''}`}
                  onClick={() => setMostrarGastos('todos')}
                >
                  Todos los Gastos
                </button>
              </div>
              {filteredExpenses.length > 0 ? (
                <>
                  <div className="chart-wrapper">
                    <Doughnut 
                      data={chartData} 
                      options={chartOptions}
                      ref={chartRef}
                    />
                    <div className="chart-center-text">
                      <div className="total-amount">
                        ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="total-label">Total</div>
                    </div>
                  </div>
                  <div className="chart-legend">
                    {chartData.labels.map((label, i) => (
                      <div key={label} className="legend-item">
                        <span className="color-dot" style={{ backgroundColor: chartData.datasets[0].backgroundColor[i] }}></span>
                        <span className="label">{label}</span>
                        <span className="amount">
                          ${chartData.datasets[0].data[i].toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-data">
                  <p>No hay datos para mostrar en el período seleccionado</p>
                </div>
              )}
            </div>
          </div>
          <div className="right-panel">
            <div className="time-filters">
              <button
                className={`time-filter-button ${filtro === 'Semanal' ? 'active' : ''}`}
                onClick={() => setFiltro('Semanal')}
              >
                Semanal
              </button>
              <button
                className={`time-filter-button ${filtro === 'Mensual' ? 'active' : ''}`}
                onClick={() => setFiltro('Mensual')}
              >
                Mensual
              </button>
              <button
                className={`time-filter-button ${filtro === 'Anual' ? 'active' : ''}`}
                onClick={() => setFiltro('Anual')}
              >
                Anual
              </button>
            </div>

            <div className="expenses-detail">
              <h3>Detalle de Gastos</h3>
              {filteredExpenses.length > 0 ? (
                <div className="table-container">
                  <table className="expenses-table">
                    <thead>
                      <tr>
                        <th>Concepto</th>
                        <th>Fecha</th>
                        <th>Método</th>
                        <th>Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.map((gasto) => (
                        <tr key={gasto.id}>
                          <td>{gasto.concepto}</td>
                          <td>{new Date(gasto.fecha).toLocaleDateString('es-MX')}</td>
                          <td>{gasto.metodo}</td>
                          <td className="monto-cell">
                            ${gasto.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-expenses-message">
                  No hay gastos registrados en este período
                </div>
              )}
            </div>
          </div>
        </div>

        <FloatingButtons 
          variant="colaborador"
          showAddButton={false}
          showExportButton={true}
          onExport={handleExport}
          exportText={`Exportar gastos ${filtro.toLowerCase()}`}
        />

        {showExportModal && (
          <ExportarColaborador
            data={filteredExpenses}
            periodo={filtro}
            onClose={() => setShowExportModal(false)}
            chartRef={chartRef}
            totalAmount={totalAmount}
          />
        )}
      </div>
    </div>
  );
}
