import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import './login.css'; // Importa tus estilos aquí

export default function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      await login(formData.email, formData.password);
      
      // Obtener el rol del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      const userData = userDoc.data();
      
      // Redirigir según el rol
      if (userData?.role === 'titular') {
        navigate('/titular/inicio');
      } else if (userData?.role === 'colaborador') {
        navigate('/colaborador/inicio');
      } else {
        navigate('/individual/inicio');
      }
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await googleLogin();
      
      // Obtener el rol del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      const userData = userDoc.data();
      
      // Redirigir según el rol
      if (userData?.role === 'titular') {
        navigate('/titular/inicio');
      } else if (userData?.role === 'colaborador') {
        navigate('/colaborador/inicio');
      } else {
        navigate('/individual/inicio');
      }
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="login-container">
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

        <div className="form-section">
          <div className="form-container">
            <div className="form-header">
              <h2>Bienvenido de nuevo</h2>
              <p>Ingresa tus credenciales para continuar</p>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={handleChange}
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

              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>Recordarme</span>
                </label>
                <a href="#" className="forgot-password">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>

              <div className="separator">
                <span>O continúa con</span>
              </div>

              <button
                type="button"
                className="google-button"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <img
                  src="/pictures/google-icon.png"
                  alt="Google"
                  className="google-icon"
                />
                <span>Google</span>
              </button>

              <p className="register-prompt">
                ¿No tienes una cuenta?{' '}
                <a href="/registro" className="register-link">
                  Regístrate aquí
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
