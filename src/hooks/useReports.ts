import { useState, useEffect } from 'react';
import { 
  collection,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

interface Report {
  id: string;
  userId: string;
  familyId?: string;
  title: string;
  type: 'expense' | 'budget' | 'summary' | 'custom';
  status: 'pending' | 'completed' | 'error';
  dateRange: {
    start: Date;
    end: Date;
  };
  filters?: {
    concepts?: string[];
    categories?: string[];
    members?: string[];
  };
  data?: any;
  createdAt: Date;
  completedAt?: Date;
  format: 'pdf' | 'excel' | 'csv';
  downloadUrl?: string;
}

export const useReports = (familyId?: string) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  // Cargar reportes
  const loadReports = async () => {
    try {
      setLoading(true);
      const reportsRef = collection(db, 'reports');
      let q;

      if (familyId) {
        // Si hay familyId, cargar reportes de la familia
        q = query(
          reportsRef,
          where('familyId', '==', familyId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Si no hay familyId, cargar solo reportes del usuario
        q = query(
          reportsRef,
          where('userId', '==', currentUser?.uid),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const reportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
        createdAt: doc.data().createdAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
        'dateRange.start': doc.data().dateRange?.start?.toDate(),
        'dateRange.end': doc.data().dateRange?.end?.toDate()
      })) as Report[];

      setReports(reportsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generar reporte
  const generateReport = async (reportData: Omit<Report, 'id' | 'userId' | 'status' | 'createdAt'>) => {
    try {
      const newReport = {
        ...reportData,
        userId: currentUser?.uid,
        status: 'pending',
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'reports'), newReport);
      
      // Aquí iría la lógica para generar el reporte
      // Por ejemplo, llamar a una Cloud Function que procese los datos
      
      setReports(prev => [{
        ...newReport,
        id: docRef.id
      } as Report, ...prev]);

      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Actualizar estado del reporte
  const updateReportStatus = async (id: string, status: Report['status'], downloadUrl?: string) => {
    try {
      const reportRef = doc(db, 'reports', id);
      const updateData: any = {
        status,
        ...(status === 'completed' ? { completedAt: new Date() } : {}),
        ...(downloadUrl ? { downloadUrl } : {})
      };
      
      await updateDoc(reportRef, updateData);

      setReports(prev =>
        prev.map(report =>
          report.id === id
            ? { ...report, ...updateData }
            : report
        )
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Eliminar reporte
  const deleteReport = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reports', id));
      setReports(prev => prev.filter(report => report.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Cargar reportes al montar el componente
  useEffect(() => {
    if (currentUser) {
      loadReports();
    }
  }, [currentUser, familyId]);

  return {
    reports,
    loading,
    error,
    generateReport,
    updateReportStatus,
    deleteReport,
    refreshReports: loadReports
  };
}; 