import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import './registro.css';

export default function Registro() {
  const navigate = useNavigate();
  const { register, googleLogin } = useAuth();
  const [tipoUso, setTipoUso] = useState<'individual' | 'familiar' | 'colaborador'>('individual');
  const [nombreFamilia, setNombreFamilia] = useState('');
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitacionEncontrada, setInvitacionEncontrada] = useState(false);
  const [formData, setFormData] = useState({
    nombres: '',
    apellido1: '',
    apellido2: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleTipoUsoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTipoUso(e.target.value as 'individual' | 'familiar' | 'colaborador');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);

      // Buscar invitaciones pendientes para este email
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef,
        where('email', '==', formData.email.toLowerCase()),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      const invitation = querySnapshot.docs[0]?.data();
      const invitationId = querySnapshot.docs[0]?.id;

      // Si hay una invitación pendiente, registrar como colaborador
      if (invitation) {
        const userData = {
          nombres: formData.nombres,
          apellido1: formData.apellido1,
          apellido2: formData.apellido2,
          email: formData.email.toLowerCase(),
          role: 'colaborador',
          titularId: invitation.titularId,
          titularEmail: invitation.titularEmail
        };

        const { user } = await register(formData.email, formData.password, userData);

        if (invitationId && user) {
          await updateDoc(doc(db, 'invitations', invitationId), {
            status: 'accepted',
            acceptedAt: new Date(),
            userId: user.uid
          });
        }

        navigate('/colaborador/inicio');
        return;
      }

      // Si no hay invitación, proceder con el registro normal
      const userData = {
        nombres: formData.nombres,
        apellido1: formData.apellido1,
        apellido2: formData.apellido2,
        email: formData.email.toLowerCase(),
        role: tipoUso === 'familiar' ? 'titular' : 'individual',
        ...(tipoUso === 'familiar' && { nombreFamilia })
      };

      await register(formData.email, formData.password, userData);

      // Redirigir según el tipo de cuenta
      if (tipoUso === 'familiar') {
        navigate('/titular/inicio');
      } else {
        navigate('/individual/inicio');
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      setError(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      setError('');
      await googleLogin();
      navigate('/individual/inicio');
    } catch (error: any) {
      setError(error.message || 'Error al registrarse con Google');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
    if (error) setError('');
  };

  // Verificar invitación cuando cambia el email
  const verificarInvitacion = async (email: string) => {
    if (!email) return;
    
    try {
      const invitationsRef = collection(db, 'invitations');
      const q = query(
        invitationsRef,
        where('email', '==', email.toLowerCase()),
        where('status', '==', 'pending')
      );
      
      const querySnapshot = await getDocs(q);
      const tieneInvitacion = !querySnapshot.empty;
      setInvitacionEncontrada(tieneInvitacion);
      
      // Si encuentra una invitación, cambiar automáticamente a tipo colaborador
      if (tieneInvitacion) {
        setTipoUso('colaborador');
      }
    } catch (error) {
      console.error('Error al verificar invitación:', error);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      email: value
    }));
    verificarInvitacion(value);
  };

  return (
    <div className="auth-page">
      <div className="registro-container">
        <div className="form-section">
          <div className="form-container">
            <div className="form-header">
              <button className="back-button" onClick={() => navigate('/login')}>
                <i className="fas fa-arrow-left"></i>
              </button>
              <h2>Crear una cuenta</h2>
              <p>Ingresa tus datos para comenzar</p>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form className="registro-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="nombres">Nombre(s)</label>
                <input
                  type="text"
                  id="nombres"
                  placeholder="Nombre(s)"
                  value={formData.nombres}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellidos">Apellidos</label>
                <div className="apellidos-container">
                  <input
                    type="text"
                    id="apellido1"
                    placeholder="Apellido 1"
                    value={formData.apellido1}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  <input
                    type="text"
                    id="apellido2"
                    placeholder="Apellido 2"
                    value={formData.apellido2}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleEmailChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Tipo de uso</label>
                <div className="radio-container">
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="individual"
                      name="tipo-uso"
                      value="individual"
                      checked={tipoUso === 'individual'}
                      onChange={handleTipoUsoChange}
                      disabled={loading || invitacionEncontrada}
                    />
                    <label htmlFor="individual">
                      <i className="fas fa-user"></i>
                      Individual
                    </label>
                  </div>
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="familiar"
                      name="tipo-uso"
                      value="familiar"
                      checked={tipoUso === 'familiar'}
                      onChange={handleTipoUsoChange}
                      disabled={loading || invitacionEncontrada}
                    />
                    <label htmlFor="familiar">
                      <i className="fas fa-users"></i>
                      Familiar
                    </label>
                  </div>
                  <div className="radio-option">
                    <input
                      type="radio"
                      id="colaborador"
                      name="tipo-uso"
                      value="colaborador"
                      checked={tipoUso === 'colaborador'}
                      onChange={handleTipoUsoChange}
                      disabled={loading || !invitacionEncontrada}
                    />
                    <label htmlFor="colaborador" className={!invitacionEncontrada ? 'disabled' : ''}>
                      <i className="fas fa-user-plus"></i>
                      Colaborador invitación
                      {!invitacionEncontrada && <span className="tooltip">Ingresa el email con el que fuiste invitado</span>}
                    </label>
                  </div>
                </div>
              </div>

              {tipoUso === 'familiar' && (
                <div className="form-group familia-field">
                  <label htmlFor="nombre-familia">Nombre de la familia</label>
                  <input
                    type="text"
                    id="nombre-familia"
                    placeholder="Ej: Familia Pérez"
                    value={nombreFamilia}
                    onChange={(e) => setNombreFamilia(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              )}

              <button
                type="submit"
                className="registro-button"
                disabled={loading || btnDisabled}
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>

              <div className="separator">
                <span>O regístrate con</span>
              </div>

              <button
                type="button"
                className="google-button"
                onClick={handleGoogleRegister}
                disabled={loading}
              >
                <img src="/pictures/google-icon.png" alt="Google" className="google-icon" />
                <span>Google</span>
              </button>

              <p className="login-prompt">
                ¿Ya tienes una cuenta?{' '}
                <a href="/login" className="login-link">
                  Inicia sesión aquí
                </a>
              </p>
            </form>
          </div>
        </div>

        <div className="image-section">
          <div className="overlay"></div>
          <img
            src="/pictures/money-image.jpg"
            alt="Finanzas y crecimiento"
            className="background-image"
          />
          <div className="image-content">
            <h1>Clean&amp;SecureMoney</h1>
            <p>Gestiona tus finanzas de manera segura y eficiente</p>
          </div>
        </div>
      </div>
    </div>
  );
}
