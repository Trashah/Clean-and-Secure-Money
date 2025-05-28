import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css'; // Asumiendo que tienes un CSS para esta página

export default function Home() {
  const navigate = useNavigate();

  const handleAcceder = () => {
    navigate('/login');
  };

  return (
    <div>
      <header className="header">
        <div className="logo">
          <img src="/api/placeholder/32/32" alt="Csm logo" />
          <span>Clean & Secure Money</span>
        </div>
        <nav className="nav">
          {/* Navegación opcional */}
        </nav>
        <div className="buttons">
          <button className="btn btn-primary" onClick={handleAcceder}>
            Acceder
          </button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Almacena y controla tus gastos en línea</h1>
          <p className="hero-description">
            Gestiona tus finanzas para establecer presupuestos y mejorar tu control financiero. Lleva una grata vida controlando tus finanzas
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={handleAcceder}>
              Acceder
            </button>
            {/* Otro botón si quieres */}
          </div>
        </div>
        <div className="hero-image">
          <img src="../pictures/image-hero.png" alt="Dashboard de GastoSmart" />
        </div>
      </section>

      <section className="dashboard-preview">
        <div className="preview-container">
          <h2 className="preview-title">Toma decisiones más inteligentes con tus finanzas</h2>
          <div className="preview-image">
            <img src="../pictures/image.png" alt="Dashboard inteligente de GastoSmart" />
          </div>
        </div>
      </section>
    </div>
  );
}
