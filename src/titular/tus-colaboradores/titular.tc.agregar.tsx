import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderTitular from '../header.titular'; // Ajusta la ruta si es necesario
import './titular.tc.agregar.css';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

export default function TitularAgregarColaborador() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [showMessage, setShowMessage] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    nombres: '',
    apellido1: '',
    apellido2: '',
    email: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
    // Ocultar mensaje de error cuando el usuario empiece a escribir
    if (showError) {
      setShowError(false);
    }
  };

  const validateForm = () => {
    return formData.nombres.trim() !== '' && 
           formData.apellido1.trim() !== '' && 
           formData.apellido2.trim() !== '' && 
           formData.email.trim() !== '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setErrorMessage('Por favor, complete todos los campos.');
      setShowError(true);
      return;
    }

    if (!currentUser) {
      setErrorMessage('No hay un titular autenticado.');
      setShowError(true);
      return;
    }

    try {
      const nombreCompleto = `${formData.nombres} ${formData.apellido1} ${formData.apellido2}`;

      // Crear la invitación en Firestore
      const invitacionData = {
        email: formData.email.toLowerCase(),
        nombre: nombreCompleto,
        titularId: currentUser.uid,
        titularEmail: currentUser.email,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días de expiración
      };

      await addDoc(collection(db, 'invitations'), invitacionData);

      // Mostrar mensaje de éxito
      setShowMessage(true);
      setShowError(false);
      
      // Ocultar el mensaje después de 3 segundos y navegar
      setTimeout(() => {
        setShowMessage(false);
        navigate('/titular/tus-colaboradores');
      }, 3000);

    } catch (error: any) {
      console.error('Error al crear invitación:', error);
      setErrorMessage('Error al crear la invitación. Por favor, intente de nuevo.');
      setShowError(true);
    }
  };

  return (
    <div className="app-container">
      <HeaderTitular />

      <div className="add-collaborator-container">
        {showMessage && (
          <div className="success-message">
            ¡Se ha enviado la invitación al colaborador exitosamente!
          </div>
        )}

        {showError && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
        

        {/* Formulario de registro */}
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombres">Nombre(s)</label>
            <input
              type="text"
              id="nombres"
              placeholder="Nombre(s)"
              value={formData.nombres}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellidos">Apellidos</label>
            <div className="apellidos-container">
              <input
                type="text"
                id="apellido1"
                placeholder="Primer apellido"
                value={formData.apellido1}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                id="apellido2"
                placeholder="Segundo apellido"
                value={formData.apellido2}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit"
              className="submit-btn"
            >
              Invitar colaborador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
