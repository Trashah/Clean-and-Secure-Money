import { useState, useEffect } from 'react';
import { 
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export interface Expense {
  id: string;
  concepto: string;
  fecha: string;
  metodo: string;
  monto: number;
  userId: string;
  titularId?: string;
  familyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  // Cargar gastos
  const loadExpenses = async () => {
    if (!currentUser) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    try {
      console.log('[useExpenses] Iniciando carga de gastos');
      const expensesRef = collection(db, 'expenses');
      let allExpenses: Expense[] = [];

      // Primero, obtener el documento del usuario para verificar su rol
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userDoc.data();
      const userRole = userData.role;
      console.log('[useExpenses] Rol del usuario:', userRole);

      if (userRole === 'colaborador') {
        // Si es colaborador, obtener solo sus gastos
        const colaboradorQuery = query(
          expensesRef,
          where('userId', '==', currentUser.uid),
          orderBy('fecha', 'desc')
        );

        const colaboradorSnapshot = await getDocs(colaboradorQuery);
        allExpenses = colaboradorSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Expense, 'id'>)
        }));
      } else if (userRole === 'titular') {
        // Si es titular, obtener sus gastos y los de sus colaboradores
        const titularQuery = query(
          expensesRef,
          where('userId', '==', currentUser.uid),
          orderBy('fecha', 'desc')
        );

        const titularSnapshot = await getDocs(titularQuery);
        const titularExpenses = titularSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Expense, 'id'>)
        }));

        // Obtener gastos de los colaboradores
        const colaboradoresQuery = query(
          expensesRef,
          where('titularId', '==', currentUser.uid),
          orderBy('fecha', 'desc')
        );

        const colaboradoresSnapshot = await getDocs(colaboradoresQuery);
        const colaboradoresExpenses = colaboradoresSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Expense, 'id'>)
        }));

        allExpenses = [...titularExpenses, ...colaboradoresExpenses];
      } else {
        // Si es individual, obtener solo sus gastos
        const userQuery = query(
          expensesRef,
          where('userId', '==', currentUser.uid),
          orderBy('fecha', 'desc')
        );

        const userSnapshot = await getDocs(userQuery);
        allExpenses = userSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Expense, 'id'>)
        }));
      }

      // Ordenar todos los gastos por fecha
      allExpenses.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      console.log('[useExpenses] Total de gastos cargados:', allExpenses.length);
      setExpenses(allExpenses);
      setError('');
    } catch (err: any) {
      console.error('[useExpenses] Error al cargar gastos:', err);
      setError('Error al cargar los gastos: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  // Agregar gasto
  const addExpense = async (expenseData: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'titularId'>) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    try {
      // Obtener información del usuario
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error('Usuario no encontrado');
      }

      const userData = userDoc.data();
      const now = new Date();
      
      const newExpense = {
        ...expenseData,
        userId: currentUser.uid,
        createdAt: now,
        updatedAt: now,
        ...(userData.role === 'colaborador' ? { titularId: userData.titularId } : {})
      };

      const docRef = await addDoc(collection(db, 'expenses'), newExpense);

      // Actualizar el estado local
      setExpenses(prev => [{
        id: docRef.id,
        ...newExpense
      } as Expense, ...prev]);

      // Recargar los gastos para asegurar sincronización
      await loadExpenses();
    } catch (err: any) {
      console.error('Error al agregar gasto:', err);
      throw new Error('Error al agregar el gasto: ' + (err.message || 'Error desconocido'));
    }
  };

  // Actualizar gasto
  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const expenseRef = doc(db, 'expenses', id);
      const expenseDoc = await getDoc(expenseRef);
      
      if (!expenseDoc.exists()) {
        throw new Error('Gasto no encontrado');
      }

      // Verificar permisos
      const expenseData = expenseDoc.data();
      if (expenseData.userId !== currentUser.uid) {
        throw new Error('No tienes permisos para editar este gasto');
      }

      const updateData = {
        ...expenseData,
        updatedAt: new Date()
      };

      await updateDoc(expenseRef, updateData);

      // Actualizar el estado local
      setExpenses(prev => {
        const updated = prev.map(expense => 
          expense.id === id 
            ? { ...expense, ...expenseData }
            : expense
        );
        return updated.sort((a, b) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
      });

      // Recargar los gastos
      await loadExpenses();
    } catch (err: any) {
      console.error('Error al actualizar gasto:', err);
      throw new Error('Error al actualizar el gasto: ' + (err.message || 'Error desconocido'));
    }
  };

  // Eliminar gasto
  const deleteExpense = async (id: string) => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const expenseRef = doc(db, 'expenses', id);
      const expenseDoc = await getDoc(expenseRef);
      
      if (!expenseDoc.exists()) {
        throw new Error('Gasto no encontrado');
      }

      // Verificar permisos
      const expenseData = expenseDoc.data();
      if (expenseData.userId !== currentUser.uid) {
        throw new Error('No tienes permisos para eliminar este gasto');
      }

      await deleteDoc(expenseRef);
      
      // Actualizar el estado local
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      
      // Recargar los gastos
      await loadExpenses();
    } catch (err: any) {
      console.error('Error al eliminar gasto:', err);
      throw new Error('Error al eliminar el gasto: ' + (err.message || 'Error desconocido'));
    }
  };

  // Cargar gastos al montar el componente
  useEffect(() => {
    if (currentUser) {
      loadExpenses();
    }
  }, [currentUser]);

  return {
    expenses,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    loadExpenses
  };
}; 