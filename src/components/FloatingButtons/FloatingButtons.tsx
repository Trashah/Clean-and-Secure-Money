import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FloatingButtons.css';

type ButtonVariant = 'titular' | 'colaborador' | 'individual';

interface FloatingButtonsProps {
  variant: ButtonVariant;
  showExportButton?: boolean;
  showAddButton?: boolean;
  onExport?: () => void;
  addPath?: string;
  exportPath?: string;
  addText?: string;
  exportText?: string;
  onAddClick?: () => void;
}

const FloatingButtons: React.FC<FloatingButtonsProps> = ({ 
  variant,
  showExportButton,
  showAddButton = true,
  onExport,
  addPath,
  exportPath,
  addText = 'Registrar Gasto',
  exportText = 'Exportar',
  onAddClick
}) => {
  const navigate = useNavigate();

  // Determinar la ruta del botón de agregar según el variant
  const getAddPath = () => {
    if (addPath) return addPath;
    
    switch (variant) {
      case 'titular':
        return '/titular/registrar-gasto';
      case 'colaborador':
        return '/colaborador/registrar-gasto';
      case 'individual':
        return '/individual/registrar-gasto';
      default:
        return '/';
    }
  };

  // Determinar la ruta del botón de exportar según el variant
  const getExportPath = () => {
    if (exportPath) return exportPath;
    
    switch (variant) {
      case 'titular':
        return '/titular/exportar';
      case 'colaborador':
        return '/colaborador/exportar';
      case 'individual':
        return '/individual/exportar';
      default:
        return '/';
    }
  };

  // Determinar si se debe mostrar el botón de exportar
  const shouldShowExport = () => {
    if (showExportButton !== undefined) {
      return showExportButton;
    }
    // Valores por defecto según el variant
    return variant === 'titular' || variant === 'individual';
  };

  const finalAddPath = getAddPath();
  const finalExportPath = getExportPath();
  const showExport = shouldShowExport();

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    } else {
      const path = `/${variant}/registrargasto`;
      navigate(path);
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else if (exportPath) {
      navigate(finalExportPath);
    } else {
      console.log('Exportando...');
    }
  };

  return (
    <div className="floating-buttons">
      <div className="export-container">
        {showExport && (
          <div className="export-btn-container">
            <button className="export-btn" onClick={handleExport} aria-label="Exportar gastos">
              <i className="fas fa-file-export"></i>
            </button>
            <span className="export-text">{exportText}</span>
          </div>
        )}
        
        {showAddButton && (
          <div className="add-btn-container">
            <button className="add-btn" onClick={handleAddClick} aria-label="Registrar gasto">
              <i className="fas fa-plus"></i>
            </button>
            <span className="add-text">{addText}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingButtons; 