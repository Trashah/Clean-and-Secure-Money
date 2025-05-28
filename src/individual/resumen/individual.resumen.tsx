import React, { useState, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import HeaderIndividual from '../header.individual';
import './individual.resumen.css';
import { useExpenses } from '../../hooks/useExpenses';

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

export default function IndividualResumen() {
  const [filtro, setFiltro] = useState<'Semanal' | 'Mensual' | 'Anual'>('Semanal');
  const { expenses, loading, error } = useExpenses();

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

    return expenses.filter(expense => 
      new Date(expense.fecha) >= startDate && 
      new Date(expense.fecha) <= now
    );
  }, [expenses, filtro]);

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

  if (loading) {
    return (
      <div className="app-container">
        <HeaderIndividual />
        <div className="main-content">
          <div className="loading">Cargando datos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <HeaderIndividual />
        <div className="main-content">
          <div className="error">Error al cargar los datos: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <HeaderIndividual />
      <div className="main-content">
        <div className="dashboard-container">
          <div className="left-panel">
            <div className="chart-container">
              <div className="chart-title">Distribución de Gastos</div>
              {filteredExpenses.length > 0 ? (
                <>
                  <div className="chart-wrapper">
                    <Doughnut data={chartData} options={chartOptions} />
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
                  No hay gastos registrados en este período
                </div>
              )}
            </div>
          </div>

          <div className="right-panel">
            <div className="expenses-section">
              <div className="section-header">
                <h2>Detalle de gastos</h2>
                <div className="filters-container">
                  {(['Semanal', 'Mensual', 'Anual'] as const).map((opt) => (
                    <button
                      key={opt}
                      className={`filter-button ${filtro === opt ? 'active' : ''}`}
                      onClick={() => setFiltro(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="expenses-table">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((gasto) => (
                    <div key={gasto.id} className="expense-item">
                      <div className="expense-date">
                        <span className="day">{new Date(gasto.fecha).getDate()}</span>
                        <span className="month">
                          {new Date(gasto.fecha).toLocaleString('es-MX', { month: 'short' })}
                        </span>
                      </div>
                      <div className="expense-info">
                        <div className="categoria">{gasto.concepto}</div>
                        <div className="descripcion">{gasto.metodo}</div>
                      </div>
                      <div className="expense-amount">
                        ${gasto.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-expenses-message">
                    No hay gastos registrados en este período
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
