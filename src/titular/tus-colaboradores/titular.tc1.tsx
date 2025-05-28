import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderTitular from '../header.titular';
import './titular.tc1.css';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  getDoc,
  onSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

interface Colaborador {
  id: string;
  nombre: string;
  email: string;
  userId: string;
  nombres: string;
  apellido1: string;
  apellido2: string;
  status: 'pending' | 'registered';
}

interface UserData extends DocumentData {
  role: string;
  titularId: string;
  nombres: string;
  apellido1: string;
  apellido2: string;
  email: string;
}

export default function TitularColaboradores() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [invitacionesPendientes, setInvitacionesPendientes] = useState<Colaborador[]>([]);
  const [colaboradoresActivos, setColaboradoresActivos] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'invitaciones' | 'colaboradores'>('colaboradores');

  // Verificar si el usuario es titular
  const verificarTitular = async (userId: string) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userDoc.data() as UserData;
      return userData.role === 'titular';
    } catch (err) {
      console.error('Error al verificar rol:', err);
      return false;
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setError('No hay usuario autenticado');
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        // Verificar si el usuario es titular
        const esTitular = await verificarTitular(currentUser.uid);
        if (!esTitular) {
          setError('No tienes permisos para ver colaboradores');
          setLoading(false);
          return;
        }

        // Configurar listeners para invitaciones
        const invitationsRef = collection(db, 'invitations');
        
        // Listener para invitaciones pendientes
        const pendingQuery = query(
          invitationsRef,
          where('titularId', '==', currentUser.uid),
          where('status', '==', 'pending')
        );
        
        const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
          const invitaciones = snapshot.docs.map(doc => ({
          id: doc.id,
            nombre: doc.data().email,
            email: doc.data().email,
            userId: '',
            nombres: doc.data().nombres || '',
            apellido1: doc.data().apellido1 || '',
            apellido2: doc.data().apellido2 || '',
            status: 'pending' as const
          }));
          setInvitacionesPendientes(invitaciones);
        });

        // Listener para colaboradores activos (invitaciones aceptadas)
        const acceptedQuery = query(
          invitationsRef,
          where('titularId', '==', currentUser.uid),
          where('status', '==', 'accepted')
        );

        const unsubscribeAccepted = onSnapshot(acceptedQuery, (snapshot) => {
          const colaboradores = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
          id: doc.id,
              nombre: `${data.nombres || ''} ${data.apellido1 || ''} ${data.apellido2 || ''}`.trim(),
              email: data.email,
              userId: data.userId || '',
              nombres: data.nombres || '',
              apellido1: data.apellido1 || '',
              apellido2: data.apellido2 || '',
              status: 'registered' as const
            };
          });
          setColaboradoresActivos(colaboradores);
        });

        setLoading(false);
        setError(null);

        return () => {
          unsubscribePending();
          unsubscribeAccepted();
        };
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos. Por favor, intenta de nuevo.');
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  const handleAddCollaborator = () => {
    navigate('/titular/tus-colaboradores/agregar');
  };

  const handleDeleteCollaborator = async (colaborador: Colaborador) => {
    if (!currentUser) {
      alert('Debes estar autenticado para realizar esta acción');
      return;
    }

    if (!window.confirm('¿Estás seguro de que deseas eliminar este colaborador?')) {
      return;
    }

    try {
      // Verificar permisos antes de eliminar
      const esTitular = await verificarTitular(currentUser.uid);
      if (!esTitular) {
        throw new Error('No tienes permisos para eliminar colaboradores');
      }

      if (colaborador.status === 'pending') {
        // Eliminar invitación
        await deleteDoc(doc(db, 'invitations', colaborador.id));
      } else {
        // Buscar y eliminar la invitación aceptada
        const invitationsRef = collection(db, 'invitations');
        const q = query(
          invitationsRef,
          where('titularId', '==', currentUser.uid),
          where('userId', '==', colaborador.userId),
          where('status', '==', 'accepted')
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          await deleteDoc(querySnapshot.docs[0].ref);
        }
      }
    } catch (err) {
      console.error('Error al eliminar colaborador:', err);
      alert('Error al eliminar el colaborador: ' + (err instanceof Error ? err.message : 'Por favor, intenta de nuevo.'));
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <HeaderTitular />
        <div className="main-content">
          <div className="loading">Cargando datos...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <HeaderTitular />
        <div className="main-content">
          <div className="error">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <HeaderTitular />

      <main className="main-content">
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'colaboradores' ? 'active' : ''}`}
            onClick={() => setActiveTab('colaboradores')}
          >
            Colaboradores ({colaboradoresActivos.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'invitaciones' ? 'active' : ''}`}
            onClick={() => setActiveTab('invitaciones')}
          >
            Invitaciones Pendientes ({invitacionesPendientes.length})
          </button>
        </div>

        <div className="collaborators-container">
          {activeTab === 'colaboradores' ? (
            <>
              {colaboradoresActivos.length === 0 ? (
                <div className="no-collaborators">
                  <p>No hay colaboradores activos</p>
                </div>
              ) : (
                colaboradoresActivos.map((colaborador) => (
            <div key={colaborador.id} className="collaborator-card">
              <div className="collaborator-avatar">
                <img
                  src="../pictures/avatar.png"
                  alt="Avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=?';
                  }}
                />
              </div>
              <div className="collaborator-info">
                <p className="collaborator-name">{colaborador.nombre}</p>
                <p className="collaborator-email">{colaborador.email}</p>
                      <p className="collaborator-status">Activo</p>
              </div>
              <button 
                className="delete-collaborator" 
                type="button" 
                aria-label={`Eliminar colaborador ${colaborador.nombre}`}
                onClick={() => handleDeleteCollaborator(colaborador)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
                ))
              )}

          <div 
            className="collaborator-card add-card" 
            role="button" 
            tabIndex={0} 
            aria-label="Añadir colaborador"
            onClick={handleAddCollaborator}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleAddCollaborator();
              }
            }}
          >
            <div className="add-collaborator-icon">
              <i className="fas fa-plus"></i>
            </div>
            <div className="collaborator-info">
              <p className="collaborator-name">Añadir colaborador</p>
            </div>
          </div>
            </>
          ) : (
            <>
              {invitacionesPendientes.length === 0 ? (
                <div className="no-collaborators">
                  <p>No hay invitaciones pendientes</p>
                </div>
              ) : (
                invitacionesPendientes.map((invitacion) => (
                  <div key={invitacion.id} className="collaborator-card invitation-card">
                    <div className="collaborator-avatar">
                      <img
                        src="../pictures/avatar.png"
                        alt="Avatar"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=?';
                        }}
                      />
                    </div>
                    <div className="collaborator-info">
                      <p className="collaborator-name">{invitacion.email}</p>
                      <p className="invitation-status">Invitación pendiente</p>
                    </div>
                    <button 
                      className="delete-collaborator" 
                      type="button" 
                      aria-label={`Cancelar invitación a ${invitacion.email}`}
                      onClick={() => handleDeleteCollaborator(invitacion)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
