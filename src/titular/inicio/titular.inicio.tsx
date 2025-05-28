import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderTitular from '../header.titular';
import './titular.inicio.css';
import FloatingButtons from '../../components/FloatingButtons/FloatingButtons';
import { useExpenses } from '../../hooks/useExpenses';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ColaboradoresGastos from '../colaboradores-gastos/ColaboradoresGastos';

type FiltroGastos = 'todos' | 'titular' | 'colaboradores';

interface Expense {
  id: string;
  concepto: string;
  fecha: string;
  metodo: string;
  monto: number;
  userId: string;
  userName?: string;
  userEmail: string;
  userRole: 'titular' | 'colaborador';
}

function TodosLosGastos() {
  const { expenses } = useExpenses();
  const { currentUser } = useAuth();
  const [usersData, setUsersData] = useState<{ [key: string]: { nombre: string, email: string } }>({});

  useEffect(() => {
    const fetchUsersData = async () => {
      if (!currentUser) return;

      const usersInfo: { [key: string]: { nombre: string, email: string } } = {};
      
      try {
        // Obtener datos del titular
        const titularDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (titularDoc.exists()) {
          const titularData = titularDoc.data();
          usersInfo[currentUser.uid] = {
            nombre: titularData.nombres ? `${titularData.nombres} ${titularData.apellido1 || ''}`.trim() : titularData.email,
            email: titularData.email
          };
        }

        // Obtener todos los colaboradores activos del titular
        const invitationsQuery = query(
          collection(db, 'invitations'),
          where('titularId', '==', currentUser.uid),
          where('status', '==', 'accepted')
        );

        const invitationsSnapshot = await getDocs(invitationsQuery);
        
        invitationsSnapshot.docs.forEach(doc => {
          const invitationData = doc.data();
          usersInfo[invitationData.userId] = {
            nombre: invitationData.nombres ? 
              `${invitationData.nombres} ${invitationData.apellido1 || ''}`.trim() : 
              invitationData.email,
            email: invitationData.email
          };
        });

        setUsersData(usersInfo);
      } catch (error) {
        console.error('Error al obtener datos de usuarios:', error);
      }
    };

    fetchUsersData();
  }, [currentUser]);

  // Ordenar los gastos por fecha y usuario
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateA = new Date(a.fecha).getTime();
    const dateB = new Date(b.fecha).getTime();
    if (dateB !== dateA) {
      return dateB - dateA; // Ordenar por fecha descendente
    }
    // Si las fechas son iguales, ordenar por usuario
    const userNameA = usersData[a.userId]?.nombre || '';
    const userNameB = usersData[b.userId]?.nombre || '';
    return userNameA.localeCompare(userNameB);
  });

  if (!currentUser) return null;

  return (
    <div className="table-container">
      <table className="expenses-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Fecha</th>
            <th>Método</th>
            <th>Monto</th>
            <th>Usuario</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {sortedExpenses.map((expense) => {
            const userData = usersData[expense.userId];
            const isCurrentUser = expense.userId === currentUser.uid;
            
            return (
              <tr key={expense.id} className={isCurrentUser ? 'titular-row' : 'colaborador-row'}>
                <td>{expense.concepto}</td>
                <td>{new Date(expense.fecha).toLocaleDateString('es-MX')}</td>
                <td>{expense.metodo}</td>
                <td className="monto">
                  ${expense.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </td>
                <td className="usuario-cell">
                  <div className="usuario-info">
                    <span className="usuario-nombre">
                      {userData?.nombre || 'Usuario no disponible'}
                    </span>
                    <span className="usuario-email">
                      {userData?.email || 'Email no disponible'}
                    </span>
                  </div>
                </td>
                <td className="rol-cell">
                  <span className={`rol-badge ${isCurrentUser ? 'titular' : 'colaborador'}`}>
                    {isCurrentUser ? 'Titular' : 'Colaborador'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MisGastos() {
  const { expenses } = useExpenses();
  const { currentUser } = useAuth();
  
  const misGastos = expenses.filter(expense => expense.userId === currentUser?.uid);
  
  return (
    <div className="table-container">
      <table className="expenses-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Fecha</th>
            <th>Método</th>
            <th>Monto</th>
          </tr>
        </thead>
        <tbody>
          {misGastos.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.concepto}</td>
              <td>{new Date(expense.fecha).toLocaleDateString('es-MX')}</td>
              <td>{expense.metodo}</td>
              <td className="monto">
                ${expense.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TitularInicio() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { expenses, loading, error, deleteExpense } = useExpenses();
  const [isDeleting, setIsDeleting] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState('todos');

  const gastosFiltrados = expenses.filter(gasto => {
    switch (filtroActivo) {
      case 'titular':
        return gasto.userId === currentUser?.uid;
      case 'colaboradores':
        return gasto.userId !== currentUser?.uid;
      case 'todos':
      default:
        return true;
    }
  });

  const handleEdit = (gastoId: string) => {
    navigate('/titular/registrargasto', { state: { gastoId } });
  };

  const handleDelete = async (gastoId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      try {
        setIsDeleting(true);
        await deleteExpense(gastoId);
      } catch (error) {
        console.error('Error al eliminar el gasto:', error);
        alert('Error al eliminar el gasto. Por favor, intenta de nuevo.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Cargando gastos...</div>;
    }

    if (error) {
      return <div className="error">Error al cargar los gastos: {error}</div>;
    }

    if (filtroActivo === 'colaboradores') {
      return <ColaboradoresGastos />;
    }

    return (
      <div className="table-container">
        {gastosFiltrados.length === 0 ? (
          <div className="no-expenses">
            <p>No hay gastos registrados</p>
            <button 
              className="add-first-expense"
              onClick={() => navigate('/titular/registrargasto')}
            >
              Registrar primer gasto
            </button>
          </div>
        ) : (
          <table className="expenses-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Fecha</th>
                <th>Método</th>
                <th>Monto</th>
                <th>Usuario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {gastosFiltrados.map((gasto) => (
                <tr key={gasto.id}>
                  <td>
                    <input 
                      type="text" 
                      value={gasto.concepto} 
                      readOnly 
                      className="concepto-input"
                    />
                  </td>
                  <td className="fecha-cell">
                    {new Date(gasto.fecha).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="metodo-cell">{gasto.metodo}</td>
                  <td className="monto-cell">
                    ${gasto.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="usuario-cell">
                    {gasto.userId === currentUser?.uid ? 'Titular' : 'Colaborador'}
                  </td>
                  <td className="acciones-cell">
                    {gasto.userId === currentUser?.uid && (
                      <div className="action-buttons">
                        <button
                          className="action-btn edit"
                          onClick={() => handleEdit(gasto.id)}
                          disabled={isDeleting}
                          aria-label={`Editar gasto ${gasto.concepto}`}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(gasto.id)}
                          disabled={isDeleting}
                          aria-label={`Eliminar gasto ${gasto.concepto}`}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <>
      <HeaderTitular />
      <div className="main-content">
        <div className="filtros-wrapper">
          <div className="filtros-container">
            <button
              className={`filtro-btn ${filtroActivo === 'todos' ? 'active' : ''}`}
              onClick={() => setFiltroActivo('todos')}
            >
              Todos los gastos
            </button>
            <button
              className={`filtro-btn ${filtroActivo === 'propios' ? 'active' : ''}`}
              onClick={() => setFiltroActivo('propios')}
            >
              Mis gastos
            </button>
            <button
              className={`filtro-btn ${filtroActivo === 'colaboradores' ? 'active' : ''}`}
              onClick={() => setFiltroActivo('colaboradores')}
            >
              Gastos de colaboradores
            </button>
          </div>
        </div>

        <div className="content-wrapper">
          <div className="content-container">
            {filtroActivo === 'todos' && <TodosLosGastos />}
            {filtroActivo === 'propios' && <MisGastos />}
            {filtroActivo === 'colaboradores' && <ColaboradoresGastos />}
          </div>
        </div>

        <FloatingButtons 
          variant="titular"
          showAddButton={filtroActivo !== 'colaboradores'}
          showExportButton={filtroActivo === 'todos'}
          onAddClick={() => navigate('/titular/registrargasto')}
          onExport={() => navigate('/titular/exportar')}
        />
      </div>
    </>
  );
}
