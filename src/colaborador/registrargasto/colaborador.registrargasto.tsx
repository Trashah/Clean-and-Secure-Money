import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderColaborador from '../header.colaborador';
import { useExpenses } from '../../hooks/useExpenses';
import { useConcepts } from '../../hooks/useConcepts';
import './colaborador.registrargasto.css';

export default function ColaboradorRegistrarGasto() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addExpense, expenses, updateExpense } = useExpenses();
  const { concepts, loading: conceptsLoading, error: conceptsError, refreshConcepts, checkLimit } = useConcepts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [limitWarning, setLimitWarning] = useState('');
  
  const [concepto, setConcepto] = useState('');
  const [fecha, setFecha] = useState('');
  const [metodo, setMetodo] = useState('');
  const [monto, setMonto] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [gastoId, setGastoId] = useState<string | null>(null);

  // Cargar datos del gasto si estamos en modo edición
  useEffect(() => {
    const state = location.state as { gastoId?: string };
    if (state?.gastoId) {
      const gastoToEdit = expenses.find(g => g.id === state.gastoId);
      if (gastoToEdit) {
        setGastoId(gastoToEdit.id);
        setConcepto(gastoToEdit.concepto);
        setFecha(gastoToEdit.fecha);
        setMetodo(gastoToEdit.metodo);
        setMonto(gastoToEdit.monto.toString());
        setIsEditing(true);
      }
    }
  }, [location.state, expenses]);

  // Efecto para cargar conceptos si no hay ninguno
  useEffect(() => {
    if (!conceptsLoading && concepts.length === 0) {
      refreshConcepts();
    }
  }, [conceptsLoading, concepts.length]);

  // Efecto para verificar límite cuando cambia el concepto o monto
  useEffect(() => {
    const checkConceptLimit = async () => {
      if (concepto && monto) {
        try {
          const montoNum = parseFloat(monto);
          if (!isNaN(montoNum)) {
            const limitCheck = await checkLimit(concepto, montoNum);
            if (!limitCheck.isValid) {
              setLimitWarning(`Este gasto excederá el límite mensual por $${limitCheck.exceededBy?.toFixed(2)}`);
            } else {
              setLimitWarning('');
            }
          }
        } catch (err) {
          console.error('Error al verificar límite:', err);
          setLimitWarning('');
        }
      }
    };

    checkConceptLimit();
  }, [concepto, monto]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log('Iniciando submit con datos:', { concepto, fecha, metodo, monto });
      setIsSubmitting(true);
      setError('');

      // Validar el monto
      const montoNumerico = parseFloat(monto);
      if (isNaN(montoNumerico) || montoNumerico <= 0) {
        throw new Error('El monto debe ser un número válido mayor a 0');
      }

      // Validar límite antes de guardar
      try {
        const limitCheck = await checkLimit(concepto, montoNumerico);
        console.log('Resultado de checkLimit en submit:', limitCheck);
        if (!limitCheck.isValid && limitCheck.exceededBy !== undefined) {
          if (!window.confirm(`Este gasto excederá el límite mensual por $${limitCheck.exceededBy.toFixed(2)}. ¿Desea continuar?`)) {
            setIsSubmitting(false);
            return;
          }
        }
      } catch (limitErr) {
        console.error('Error al verificar límite en submit:', limitErr);
        // Continuar incluso si hay error en la verificación del límite
      }

      const gastoData = {
        concepto,
        fecha,
        metodo,
        monto: montoNumerico,
      };

      console.log('Intentando guardar gasto:', gastoData);

      if (isEditing && gastoId) {
        // Actualizar gasto existente
        await updateExpense(gastoId, gastoData);
        console.log('Gasto actualizado exitosamente');
      } else {
        // Crear nuevo gasto
        await addExpense(gastoData);
        console.log('Gasto creado exitosamente');
      }

      // Redireccionar a la página de gastos
      navigate('/colaborador/inicio');
      
    } catch (err: any) {
      console.error('Error en submit:', err);
      setError(err.message || 'Error al guardar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (conceptsLoading) {
    return (
      <div className="app-container">
        <HeaderColaborador />
        <div className="main-content">
          <div className="loading">Cargando conceptos...</div>
        </div>
      </div>
    );
  }

  if (conceptsError) {
    return (
      <div className="app-container">
        <HeaderColaborador />
        <div className="main-content">
          <div className="error">Error al cargar los conceptos: {conceptsError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <HeaderColaborador />
      <div className="main-content">
        <div className="form-container">
          <h2 className="form-title">
            {isEditing ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
          </h2>

          {error && <div className="error-message">{error}</div>}
          {limitWarning && <div className="warning-message">{limitWarning}</div>}

          <form onSubmit={handleSubmit} className="expense-form">
            <div className="form-group">
              <label htmlFor="concepto">Concepto:</label>
              <select
                id="concepto"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="">Selecciona un concepto</option>
                {concepts.map((concept) => (
                  <option key={concept.id} value={concept.nombre}>
                    {concept.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fecha">Fecha:</label>
              <input
                type="date"
                id="fecha"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="form-group">
              <label htmlFor="metodo">Método de Pago:</label>
              <select
                id="metodo"
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="">Selecciona un método</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="monto">Monto:</label>
              <div className="monto-input-container">
                <span className="currency-symbol">$</span>
                <input
                  type="number"
                  id="monto"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/colaborador/inicio')}
                className="cancel-button"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
