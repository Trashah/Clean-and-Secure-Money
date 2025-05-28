import React, { useState } from 'react';
import HeaderIndividual from '../header.individual';
import { useConcepts } from '../../hooks/useConcepts';
import './individual.cl.css';

export default function IndividualCL() {
  const { concepts, loading, error, addConcept, updateConcept, deleteConcept, refreshConcepts } = useConcepts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editingConcepto, setEditingConcepto] = useState<string | null>(null);
  const [conceptoValue, setConceptoValue] = useState<string>('');

  const handleEdit = (concept: any) => {
    setEditingId(concept.id);
    setEditValue(concept.limite?.toString() || '');
  };

  const handleEditConcepto = (concept: any) => {
    setEditingConcepto(concept.id);
    setConceptoValue(concept.nombre);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateConcept(id, {
        limite: parseFloat(editValue)
      });
    setEditingId(null);
    setEditValue('');
      refreshConcepts();
    } catch (err) {
      console.error('Error al guardar el límite:', err);
    }
  };

  const handleSaveConcepto = async (id: string) => {
    if (conceptoValue.trim()) {
      try {
        await updateConcept(id, {
          nombre: conceptoValue
        });
        setEditingConcepto(null);
        setConceptoValue('');
        refreshConcepts();
      } catch (err) {
        console.error('Error al guardar el concepto:', err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este concepto?')) {
      try {
        await deleteConcept(id);
        refreshConcepts();
      } catch (err) {
        console.error('Error al eliminar el concepto:', err);
      }
    }
  };

  const handleAdd = async () => {
    try {
      await addConcept('Nuevo concepto', 0);
      refreshConcepts();
    } catch (err) {
      console.error('Error al agregar concepto:', err);
      }
  };

  if (loading) return <div className="loading-state">Cargando...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="app-container">
      <HeaderIndividual />
      <div className="main-content">
        <div className="columns-container">
          {/* Columna conceptos */}
          <div className="column">
            <h2>Conceptos existentes</h2>
            <div className="concepts-list">
              {concepts.map(concept => (
                <div key={concept.id} className="concept-item">
                  {editingConcepto === concept.id ? (
                    <input
                      type="text"
                      value={conceptoValue}
                      onChange={(e) => setConceptoValue(e.target.value)}
                      onBlur={() => handleSaveConcepto(concept.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveConcepto(concept.id);
                        if (e.key === 'Escape') {
                          setEditingConcepto(null);
                          setConceptoValue('');
                        }
                      }}
                      autoFocus
                      placeholder="Nombre del concepto"
                    />
                  ) : (
                    <input
                      type="text"
                      value={concept.nombre}
                      readOnly
                      onClick={() => handleEditConcepto(concept)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Columna límites */}
          <div className="column">
            <h2>Límite de monto del concepto</h2>
            <div className="limits-list">
              {concepts.map(concept => (
                <div key={concept.id} className="limit-item">
                  {editingId === concept.id ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleSaveEdit(concept.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(concept.id);
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setEditValue('');
                        }
                      }}
                      autoFocus
                      placeholder="Ingrese el límite"
                    />
                  ) : (
                    <input
                      type="text"
                      value={concept.limite ? `$ ${concept.limite}` : 'NA'}
                      readOnly
                      onClick={() => handleEdit(concept)}
                    />
                  )}
                  <div className="actions">
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(concept)}
                      aria-label={`Editar límite para ${concept.nombre}`}
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </button>
                      <button
                        className="delete-btn"
                      onClick={() => handleDelete(concept.id)}
                      aria-label={`Eliminar ${concept.nombre}`}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="add-container">
          <button 
            className="add-btn" 
            onClick={handleAdd}
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
