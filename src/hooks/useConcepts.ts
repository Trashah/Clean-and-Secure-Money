import { useState, useEffect } from 'react';
import { 
  collection,
  query,
  where,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

interface Concept {
  id: string;
  nombre: string;
  limite: number;
  userId: string;
}

const DEFAULT_CONCEPTS = [
  { nombre: 'Alimentación', limite: 5000 },
  { nombre: 'Transporte', limite: 2000 },
  { nombre: 'Entretenimiento', limite: 1500 },
  { nombre: 'Servicios', limite: 2500 },
  { nombre: 'Otros', limite: 2000 }
];

export const useConcepts = () => {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  // Reiniciar conceptos: elimina todos y crea los predeterminados
  const resetConcepts = async () => {
    try {
      if (!currentUser) return;

      // 1. Obtener todos los conceptos existentes
      const conceptsRef = collection(db, 'concepts');
      const q = query(
        conceptsRef,
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);

      // 2. Eliminar todos los conceptos existentes
      const batch = writeBatch(db);
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // 3. Crear los nuevos conceptos predeterminados
      DEFAULT_CONCEPTS.forEach(concept => {
        const newDocRef = doc(collection(db, 'concepts'));
        batch.set(newDocRef, {
          nombre: concept.nombre,
          limite: concept.limite,
          userId: currentUser.uid,
          createdAt: serverTimestamp()
        });
      });

      // 4. Ejecutar todas las operaciones
      await batch.commit();
      console.log('Conceptos reiniciados exitosamente');
    } catch (err) {
      console.error('Error al reiniciar conceptos:', err);
      throw err;
    }
  };

  // Cargar conceptos
  const loadConcepts = async () => {
    try {
      if (!currentUser) return;
      
      setLoading(true);
      const conceptsRef = collection(db, 'concepts');
      const q = query(
        conceptsRef,
        where('userId', '==', currentUser.uid),
        orderBy('nombre', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const conceptsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Concept[];

      // Si no hay conceptos o hay más/menos de los predeterminados, reiniciar
      if (conceptsData.length !== DEFAULT_CONCEPTS.length) {
        await resetConcepts();
        return loadConcepts(); // Volver a cargar después del reinicio
      }

      setConcepts(conceptsData);
    } catch (err: any) {
      console.error('Error al cargar conceptos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar concepto
  const updateConcept = async (id: string, data: Partial<Concept>) => {
    try {
      const conceptRef = doc(db, 'concepts', id);
      await updateDoc(conceptRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      setConcepts(prev => 
        prev.map(concept => 
          concept.id === id 
            ? { ...concept, ...data }
            : concept
        )
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Verificar límite
  const checkLimit = async (concepto: string, monto: number) => {
    try {
      const concept = concepts.find(c => c.nombre === concepto);
      if (!concept) return { isValid: true };

      const expensesRef = collection(db, 'expenses');
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const q = query(
        expensesRef,
        where('userId', '==', currentUser?.uid),
        where('concepto', '==', concepto),
        where('fecha', '>=', startOfMonth.toISOString())
      );

      const querySnapshot = await getDocs(q);
      const totalGastado = querySnapshot.docs.reduce((sum, doc) => {
        const data = doc.data();
        return sum + (data.monto || 0);
      }, 0);

      const exceedsLimit = (totalGastado + monto) > concept.limite;
      
      return {
        isValid: !exceedsLimit,
        currentTotal: totalGastado,
        limit: concept.limite,
        exceededBy: exceedsLimit ? (totalGastado + monto) - concept.limite : 0
      };
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Agregar concepto
  const addConcept = async (nombre: string, limite: number) => {
    try {
      if (!currentUser) return;
      
      const conceptRef = collection(db, 'concepts');
      await addDoc(conceptRef, {
        nombre,
        limite,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      
      await loadConcepts();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Eliminar concepto
  const deleteConcept = async (id: string) => {
    try {
      const conceptRef = doc(db, 'concepts', id);
      await deleteDoc(conceptRef);
      await loadConcepts();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Cargar conceptos al montar el componente
  useEffect(() => {
    if (currentUser) {
      loadConcepts();
    }
  }, [currentUser]);

  return {
    concepts,
    loading,
    error,
    updateConcept,
    checkLimit,
    refreshConcepts: loadConcepts,
    addConcept,
    deleteConcept
  };
}; 