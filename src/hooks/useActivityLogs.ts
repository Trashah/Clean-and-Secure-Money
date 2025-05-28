import { useState, useEffect } from 'react';
import { 
  collection,
  query,
  where,
  orderBy,
  addDoc,
  getDocs,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: any;
  timestamp: Date;
  familyId?: string;
  type: 'expense' | 'concept' | 'invitation' | 'user' | 'family' | 'system';
  metadata?: {
    ip?: string;
    device?: string;
    browser?: string;
  };
}

export const useActivityLogs = (familyId?: string) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  // Cargar logs
  const loadLogs = async () => {
    try {
      setLoading(true);
      const logsRef = collection(db, 'activity_logs');
      let q;

      if (familyId) {
        // Si hay familyId, cargar logs de la familia
        q = query(
          logsRef,
          where('familyId', '==', familyId),
          orderBy('timestamp', 'desc')
        );
      } else {
        // Si no hay familyId, cargar solo logs del usuario
        q = query(
          logsRef,
          where('userId', '==', currentUser?.uid),
          orderBy('timestamp', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const logsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
        timestamp: doc.data().timestamp?.toDate()
      })) as ActivityLog[];

      setLogs(logsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Registrar nueva actividad
  const logActivity = async (
    action: string,
    type: ActivityLog['type'],
    details: any,
    metadata?: ActivityLog['metadata']
  ) => {
    try {
      const newLog = {
        userId: currentUser?.uid,
        familyId,
        action,
        type,
        details,
        metadata: {
          ...metadata,
          timestamp: new Date()
        }
      };

      const docRef = await addDoc(collection(db, 'activity_logs'), newLog);
      setLogs(prev => [{
        ...newLog,
        id: docRef.id,
        timestamp: new Date()
      } as ActivityLog, ...prev]);

      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Cargar logs al montar el componente
  useEffect(() => {
    if (currentUser) {
      loadLogs();
    }
  }, [currentUser, familyId]);

  return {
    logs,
    loading,
    error,
    logActivity,
    refreshLogs: loadLogs
  };
}; 