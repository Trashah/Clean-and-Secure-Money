import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './header.titular.css';

function TitularNav() {
  return (
    <nav className="app-nav">
      <NavLink
        to="/titular/inicio"
        className={({ isActive }) =>
          isActive ? 'nav-item active' : 'nav-item'
        }
      >
        Tus gastos
      </NavLink>
      <NavLink
        to="/titular/resumen"
        className={({ isActive }) =>
          isActive ? 'nav-item active' : 'nav-item'
        }
      >
        Resumen semanal
      </NavLink>
      <NavLink
        to="/titular/tus-colaboradores"
        className={({ isActive }) =>
          isActive ? 'nav-item active' : 'nav-item'
        }
      >
        Tus colaboradores
      </NavLink>
      <NavLink
        to="/titular/cl"
        className={({ isActive }) =>
          isActive ? 'nav-item active' : 'nav-item'
        }
      >
        Conceptos/Límites
      </NavLink>
    </nav>
  );
}

export default function HeaderTitular() {
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
    <div className="header-container">
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
      <TitularNav />
    </div>
  );
}
