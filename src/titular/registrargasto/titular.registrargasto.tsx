import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HeaderTitular from '../header.titular';
import { useExpenses } from '../../hooks/useExpenses';
import { useConcepts } from '../../hooks/useConcepts';
import { useAuth } from '../../context/AuthContext';
import './titular.registrargasto.css';

export default function TitularRegistrarGasto() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const familyId = currentUser?.uid;
  const { addExpense, expenses, updateExpense } = useExpenses(familyId);
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

  // Validar y formatear el monto
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Solo permitir números y un punto decimal
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setMonto(value);
      setLimitWarning('');
    }
  };

  // Validar límite cuando cambia el concepto o monto
  const handleConceptoChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedConcepto = e.target.value;
    setConcepto(selectedConcepto);
    if (selectedConcepto && monto) {
      validateLimit(selectedConcepto, parseFloat(monto));
    }
  };

  const validateLimit = async (conceptoToCheck: string, montoToCheck: number) => {
    try {
      console.log('Validando límite para:', conceptoToCheck, montoToCheck);
      const limitCheck = await checkLimit(conceptoToCheck, montoToCheck);
      console.log('Resultado de checkLimit:', limitCheck);
      if (!limitCheck.isValid && limitCheck.exceededBy !== undefined) {
        setLimitWarning(`¡Advertencia! Este gasto excederá el límite mensual por $${limitCheck.exceededBy.toFixed(2)}`);
      } else {
        setLimitWarning('');
      }
    } catch (err) {
      console.error('Error al validar límite:', err);
      // No establecer warning en caso de error para permitir continuar
      setLimitWarning('');
    }
  };

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
      navigate('/titular/inicio');
      
    } catch (err: any) {
      console.error('Error en submit:', err);
      setError(err.message || 'Error al guardar el gasto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <HeaderTitular />

      <div className="main-content">
        <form className="form-container" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {conceptsError && <div className="error-message">{conceptsError}</div>}
          {limitWarning && <div className="warning-message">{limitWarning}</div>}
          
          <div className="form-group">
            <label htmlFor="concepto">Concepto</label>
            <div className="select-wrapper">
              <select
                id="concepto"
                className="form-control"
                value={concepto}
                onChange={handleConceptoChange}
                required
                disabled={isSubmitting || conceptsLoading}
              >
                <option value="" disabled>
                  {conceptsLoading ? 'Cargando conceptos...' : 'Seleccione un concepto'}
                </option>
                {concepts.map(concept => (
                  <option key={concept.id} value={concept.nombre}>
                    {concept.nombre}
                  </option>
                ))}
              </select>
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fecha">Fecha</label>
            <div className="date-wrapper">
              <input
                type="date"
                id="fecha"
                className="form-control"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
                disabled={isSubmitting}
                max={new Date().toISOString().split('T')[0]}
              />
              <i className="fas fa-calendar"></i>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="metodo">Método</label>
            <div className="select-wrapper">
              <select
                id="metodo"
                className="form-control"
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="" disabled>
                  Método de pago
                </option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta de crédito/débito</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Otro">Otro</option>
              </select>
              <i className="fas fa-chevron-down"></i>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="monto">Monto</label>
            <div className="input-wrapper">
              <span className="currency-symbol">$</span>
              <input
                type="text"
                id="monto"
                className="form-control"
                placeholder="0.00"
                value={monto}
                onChange={handleMontoChange}
                onBlur={() => {
                  if (concepto && monto) {
                    validateLimit(concepto, parseFloat(monto));
                  }
                }}
                required
                disabled={isSubmitting}
                pattern="^\d*\.?\d{0,2}$"
                title="Ingrese un monto válido (máximo 2 decimales)"
              />
            </div>
          </div>

          <button
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting || conceptsLoading}
          >
            {isSubmitting ? (isEditing ? 'Actualizando...' : 'Registrando...') : 
             (isEditing ? 'Actualizar gasto' : 'Registrar gasto')}
          </button>
        </form>
      </div>

      {concepts.length === 0 && !conceptsLoading && (
        <div className="floating-button">
          <div 
            className="floating-btn" 
            onClick={refreshConcepts}
            title="Recargar conceptos"
          >
            <i className="fas fa-sync"></i>
            <span>Recargar conceptos</span>
          </div>
        </div>
      )}
    </div>
  );
}
