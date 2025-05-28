import React, { useState } from 'react';
import HeaderTitular from '../header.titular';
import { useConcepts } from '../../hooks/useConcepts';
import './titular.cl.css';

export default function TitularConceptosLimites() {
  const { concepts, loading, error, addConcept, updateConcept, deleteConcept, refreshConcepts } = useConcepts();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editingConcepto, setEditingConcepto] = useState<string | null>(null);
  const [conceptoValue, setConceptoValue] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [newConcepto, setNewConcepto] = useState('');
  const [newLimite, setNewLimite] = useState('');

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
    setShowModal(true);
  };

  const handleSaveNewConcept = async () => {
    try {
      if (newConcepto.trim() && newLimite) {
        await addConcept(newConcepto, parseFloat(newLimite));
        setNewConcepto('');
        setNewLimite('');
        setShowModal(false);
        refreshConcepts();
      }
    } catch (err) {
      console.error('Error al agregar concepto:', err);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <HeaderTitular />
        <div className="main-content">
          <div className="loading-state">Cargando...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="app-container">
        <HeaderTitular />
        <div className="main-content">
          <div className="error-state">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <HeaderTitular />
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
                    <div className="concept-content">
                      <input
                        type="text"
                        value={concept.nombre}
                        readOnly
                        onClick={() => handleEditConcepto(concept)}
                      />
                      <div className="actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEditConcepto(concept)}
                          aria-label={`Editar concepto ${concept.nombre}`}
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                      </div>
                    </div>
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
                    <div className="limit-content">
                      <input
                        type="text"
                        value={concept.limite ? `$ ${concept.limite}` : 'NA'}
                        readOnly
                        onClick={() => handleEdit(concept)}
                      />
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
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="add-container">
          <button 
            className="add-btn" 
            onClick={handleAdd}
            aria-label="Agregar nuevo concepto"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Agregar nuevo concepto</h3>
              <div className="modal-form">
                <div className="form-group">
                  <label>Nombre del concepto</label>
                  <input
                    type="text"
                    value={newConcepto}
                    onChange={(e) => setNewConcepto(e.target.value)}
                    placeholder="Ingrese el nombre del concepto"
                  />
                </div>
                <div className="form-group">
                  <label>Límite</label>
                  <input
                    type="number"
                    value={newLimite}
                    onChange={(e) => setNewLimite(e.target.value)}
                    placeholder="Ingrese el límite"
                  />
                </div>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button 
                    className="save-btn" 
                    onClick={handleSaveNewConcept}
                    disabled={!newConcepto.trim() || !newLimite}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
