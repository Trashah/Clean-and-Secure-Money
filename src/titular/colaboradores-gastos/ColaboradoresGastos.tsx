import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import './ColaboradoresGastos.css';

interface Colaborador {
  id: string;
  userId: string;
  email: string;
  nombres: string;
  apellido1: string;
  apellido2: string;
  status: string;
}

interface Gasto {
  id: string;
  concepto: string;
  fecha: string;
  metodo: string;
  monto: number;
  userId: string;
}

export default function ColaboradoresGastos() {
  const { currentUser } = useAuth();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [gastosColaboradores, setGastosColaboradores] = useState<{ [key: string]: Gasto[] }>({});
  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!currentUser) return;

      try {
        if (isInitialLoad) {
          setLoading(true);
        }
        setError(null);

        // 1. Obtener colaboradores desde invitations
        const invitationsRef = collection(db, 'invitations');
        const invitationsQuery = query(
          invitationsRef,
          where('titularId', '==', currentUser.uid),
          where('status', '==', 'accepted')
        );

        const invitationsSnapshot = await getDocs(invitationsQuery);
        const colaboradoresData = invitationsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            email: data.email,
            nombres: data.nombres || '',
            apellido1: data.apellido1 || '',
            apellido2: data.apellido2 || '',
            status: data.status
          };
        });

        setColaboradores(colaboradoresData);

        // 2. Si hay colaboradores, obtener sus gastos en paralelo
        if (colaboradoresData.length > 0) {
          const gastosRef = collection(db, 'expenses');
          
          // Crear un array de promesas para todas las consultas de gastos
          const gastosPromises = colaboradoresData.map(colaborador => {
            const gastosQuery = query(
              gastosRef,
              where('userId', '==', colaborador.userId),
              where('titularId', '==', currentUser.uid)
            );
            return getDocs(gastosQuery);
          });

          // Ejecutar todas las consultas en paralelo
          const gastosSnapshots = await Promise.all(gastosPromises);
          
          // Procesar los resultados
          const gastosMap: { [key: string]: Gasto[] } = {};
          gastosSnapshots.forEach((snapshot, index) => {
            const colaborador = colaboradoresData[index];
            const gastos = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Gasto[];

            gastosMap[colaborador.userId] = gastos.sort((a, b) => 
              new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );
          });

          setGastosColaboradores(gastosMap);

          // Seleccionar el primer colaborador por defecto solo en la carga inicial
          if (isInitialLoad && !colaboradorSeleccionado && colaboradoresData.length > 0) {
            setColaboradorSeleccionado(colaboradoresData[0].userId);
          }
        }

        setLoading(false);
        setIsInitialLoad(false);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    cargarDatos();
  }, [currentUser]); // Removida la dependencia de colaboradorSeleccionado

  // Memoizar los datos del colaborador actual y sus gastos
  const { colaboradorActual, gastosColaboradorActual, totalGastosColaborador } = useMemo(() => {
    const colaboradorActual = colaboradores.find(c => c.userId === colaboradorSeleccionado);
    const gastosColaboradorActual = colaboradorSeleccionado ? gastosColaboradores[colaboradorSeleccionado] || [] : [];
    const totalGastosColaborador = gastosColaboradorActual.reduce((sum, gasto) => sum + gasto.monto, 0);

    return {
      colaboradorActual,
      gastosColaboradorActual,
      totalGastosColaborador
    };
  }, [colaboradorSeleccionado, colaboradores, gastosColaboradores]);

  if (loading && isInitialLoad) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando datos de colaboradores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => {
          setIsInitialLoad(true);
          window.location.reload();
        }} className="retry-button">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (colaboradores.length === 0) {
    return (
      <div className="no-colaboradores">
        <i className="fas fa-users"></i>
        <h2>No hay colaboradores registrados</h2>
        <p>Aún no has agregado colaboradores a tu cuenta familiar.</p>
      </div>
    );
  }

  return (
    <div className="colaboradores-gastos-container">
      <div className="colaboradores-list">
        <h2 className="colaboradores-title">Colaboradores</h2>
        <div className="colaboradores-cards-container">
          {colaboradores.map((colaborador) => (
            <div
              key={colaborador.id}
              className={`colaborador-card ${colaboradorSeleccionado === colaborador.userId ? 'selected' : ''}`}
              onClick={() => setColaboradorSeleccionado(colaborador.userId)}
            >
              <div className="colaborador-info">
                <h3>{`${colaborador.nombres} ${colaborador.apellido1}`.trim() || colaborador.email}</h3>
                <p className="colaborador-email">{colaborador.email}</p>
                <p className="estado-colaborador">
                  <span className="estado-dot activo"></span>
                  Activo
                </p>
              </div>
              <div className="colaborador-stats">
                <span className="gasto-count">
                  {gastosColaboradores[colaborador.userId]?.length || 0} gastos
                </span>
                <span className="gasto-total">
                  Total: ${(gastosColaboradores[colaborador.userId]?.reduce((sum, gasto) => sum + gasto.monto, 0) || 0)
                    .toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {colaboradorSeleccionado && colaboradorActual && (
        <div className="gastos-detail">
          <div className="gastos-header">
            <h2>Gastos de {`${colaboradorActual.nombres} ${colaboradorActual.apellido1}`.trim() || colaboradorActual.email}</h2>
            <div className="total-gastos">
              Total: ${totalGastosColaborador.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </div>
          
          <div className="gastos-content">
            {loading && !isInitialLoad && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
              </div>
            )}
            
            {gastosColaboradorActual.length > 0 ? (
              <table className="gastos-table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Fecha</th>
                    <th>Método</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {gastosColaboradorActual.map((gasto) => (
                    <tr key={gasto.id}>
                      <td>{gasto.concepto}</td>
                      <td>{new Date(gasto.fecha).toLocaleDateString('es-MX')}</td>
                      <td>{gasto.metodo}</td>
                      <td className="monto">
                        ${gasto.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-gastos">Este colaborador no tiene gastos registrados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 