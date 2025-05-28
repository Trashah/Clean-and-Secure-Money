import React, { useEffect, useState } from 'react';
import HeaderTitular from '../header.titular';
import './exportar.titular.css';
import { useExpenses } from '../../hooks/useExpenses';
import { useAuth } from '../../context/AuthContext';
import { exportTitularToPDF } from '../../services/ExportTitularService';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Expense } from '../../types/expense';
import * as XLSX from 'xlsx';

export default function ExportarTitular() {
  const { currentUser } = useAuth();
  const { expenses: gastosTitular, loading: loadingTitular, error: errorTitular } = useExpenses();
  const [usersData, setUsersData] = useState<{ [key: string]: { nombre: string, email: string } }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar datos de usuarios
  useEffect(() => {
    const fetchUsersData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      if (!gastosTitular || gastosTitular.length === 0) {
        setLoading(false);
        return;
      }

      console.log('Iniciando carga de datos de usuarios...');
      const usersInfo: { [key: string]: { nombre: string, email: string } } = {};
      
      try {
        // Obtener datos del titular
        console.log('Obteniendo datos del titular...');
        const titularDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (titularDoc.exists()) {
          const titularData = titularDoc.data();
          usersInfo[currentUser.uid] = {
            nombre: titularData.nombres ? `${titularData.nombres} ${titularData.apellido1 || ''}`.trim() : titularData.email,
            email: titularData.email
          };
          console.log('Datos del titular obtenidos:', usersInfo[currentUser.uid]);
        } else {
          console.log('No se encontró documento del titular');
        }

        // Obtener todos los usuarios que tienen gastos
        const uniqueUserIds = new Set(gastosTitular.map(gasto => gasto.userId));
        console.log('IDs únicos de usuarios encontrados:', Array.from(uniqueUserIds));

        // Obtener datos de cada usuario
        for (const userId of uniqueUserIds) {
          if (userId !== currentUser.uid) { // Evitar obtener datos del titular nuevamente
            console.log('Obteniendo datos para usuario:', userId);
            try {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                usersInfo[userId] = {
                  nombre: userData.nombres ? 
                    `${userData.nombres} ${userData.apellido1 || ''}`.trim() : 
                    userData.email,
                  email: userData.email
                };
                console.log('Datos obtenidos para usuario:', userId, usersInfo[userId]);
              } else {
                console.log('No se encontró documento para usuario:', userId);
              }
            } catch (userError) {
              console.error('Error al obtener datos para usuario específico:', userId, userError);
              // Continuar con el siguiente usuario en caso de error
            }
          }
        }

        console.log('Datos de usuarios obtenidos exitosamente:', usersInfo);
        setUsersData(usersInfo);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error al cargar datos de usuarios:', err);
        setError('Error al cargar los datos de usuarios. Por favor, intenta de nuevo.');
        setLoading(false);
      }
    };

    fetchUsersData();
  }, [currentUser, gastosTitular]);

  const handleExcelExport = () => {
    if (!gastosTitular || gastosTitular.length === 0) {
      alert('No hay datos disponibles para exportar');
      return;
    }

    try {
      console.log('Preparando datos para Excel...');
      // Preparar los datos para el Excel
      const allExpenses = gastosTitular.map(gasto => {
        const userData = usersData[gasto.userId];
        const isCurrentUser = gasto.userId === currentUser?.uid;
        const nombreUsuario = userData?.nombre || (isCurrentUser ? 'Titular' : 'Colaborador');
        
        return {
          'Concepto': gasto.concepto || '',
          'Fecha': new Date(gasto.fecha).toLocaleDateString('es-MX'),
          'Método': gasto.metodo || '',
          'Monto': gasto.monto || 0,
          'Usuario': nombreUsuario,
          'Rol': isCurrentUser ? 'Titular' : 'Colaborador'
        };
      });

      // Crear el libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(allExpenses);

      // Ajustar el ancho de las columnas
      const colWidths = [
        { wch: 30 }, // Concepto
        { wch: 12 }, // Fecha
        { wch: 15 }, // Método
        { wch: 12 }, // Monto
        { wch: 25 }, // Usuario
        { wch: 12 }  // Rol
      ];
      ws['!cols'] = colWidths;

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Gastos');

      // Generar el archivo y descargarlo
      const fileName = `Gastos_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      console.log('Archivo Excel generado exitosamente');
    } catch (error) {
      console.error('Error al generar Excel:', error);
      alert('Hubo un error al generar el archivo Excel. Por favor, intenta de nuevo.');
    }
  };

  const handlePDFExport = () => {
    if (!gastosTitular || gastosTitular.length === 0) {
      alert('No hay datos disponibles para exportar');
      return;
    }

    try {
      console.log('Preparando datos para PDF...');
      // Preparar los datos para el PDF
      const allExpenses = gastosTitular.map(gasto => {
        const userData = usersData[gasto.userId];
        const isCurrentUser = gasto.userId === currentUser?.uid;
        const nombreUsuario = userData?.nombre || (isCurrentUser ? 'Titular' : 'Colaborador');
        
        return {
          concepto: gasto.concepto || '',
          fecha: new Date(gasto.fecha).toLocaleDateString('es-MX'),
          metodo: gasto.metodo || '',
          monto: gasto.monto || 0,
          usuario: nombreUsuario,
          rol: isCurrentUser ? 'Titular' : 'Colaborador'
        };
      });

      const reportData = {
        gastos: allExpenses,
        columns: [
          { header: 'Concepto', key: 'concepto' },
          { header: 'Fecha', key: 'fecha' },
          { header: 'Método', key: 'metodo' },
          { header: 'Monto', key: 'monto' },
          { header: 'Usuario', key: 'usuario' },
          { header: 'Rol', key: 'rol' }
        ]
      };

      exportTitularToPDF(reportData);
      console.log('Archivo PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, intenta de nuevo.');
    }
  };

  // Solo mostrar loading cuando estamos cargando datos iniciales
  if (loadingTitular) {
    return (
      <div className="app-container">
        <HeaderTitular />
        <div className="main-content">
          <div className="loading">Cargando gastos...</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-container">
        <HeaderTitular />
        <div className="main-content">
          <div className="loading">Cargando datos de usuarios...</div>
        </div>
      </div>
    );
  }

  // Mostrar error si hay alguno
  if (error || errorTitular) {
    return (
      <div className="app-container">
        <HeaderTitular />
        <div className="main-content">
          <div className="error">
            <p>{error || errorTitular}</p>
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

  // Verificar si tenemos los datos necesarios antes de mostrar las opciones
  if (!gastosTitular || !currentUser) {
    return (
      <div className="app-container">
        <HeaderTitular />
        <div className="main-content">
          <div className="error">No hay datos disponibles para exportar</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <HeaderTitular />
      <main className="main-content">
        <div className="export-container">
          <h2>Exportar en:</h2>
          <div className="export-options">
            <div 
              className="export-option excel" 
              onClick={handleExcelExport}
              role="button" 
              tabIndex={0}
              aria-label="Exportar a Excel"
            >
              <div className="export-icon">
                <img
                  src="/pictures/excel-icon.png"
                  alt="Excel"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/80x80?text=Excel')}
                />
              </div>
              <span>Excel</span>
            </div>
            <div 
              className="export-option pdf"
              onClick={handlePDFExport}
              role="button" 
              tabIndex={0}
              aria-label="Exportar a PDF"
            >
              <div className="export-icon">
                <img
                  src="/pictures/pdf-icon.png"
                  alt="PDF"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/80x80?text=PDF')}
                />
              </div>
              <span>PDF</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
