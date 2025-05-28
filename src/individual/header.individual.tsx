import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './individual.nav.css';

export default function IndividualNav() {
  const [showMenu, setShowMenu] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <>
      <header className="app-header">
        <h1 className="app-title">Clean&amp;SecureMoney</h1>
        <div className="profile-container" ref={menuRef}>
          <div className="profile-icon" onClick={() => setShowMenu(!showMenu)}>
          <img src="../pictures/profile-icon.png" alt="Perfil" />
          </div>
          {showMenu && (
            <div className="profile-menu active">
              <div className="menu-item" onClick={handleSignOut}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Cerrar sesión</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <nav className="app-nav">
        <Link to="/individual/inicio" className="nav-item">
          Tus gastos
        </Link>
        <Link to="/individual/resumen" className="nav-item">
          Resumen semanal
        </Link>
        <Link to="/individual/cl" className="nav-item">
          Conceptos/Límites
        </Link>
      </nav>
    </>
  );
}
