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

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  status: 'unread' | 'read' | 'archived';
  createdAt: Date;
  readAt?: Date;
  familyId?: string;
  link?: string;
  priority?: 'low' | 'medium' | 'high';
  expiresAt?: Date;
}

export const useNotifications = (familyId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  // Cargar notificaciones
  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notificationsRef = collection(db, 'notifications');
      let q;

      if (familyId) {
        // Si hay familyId, cargar notificaciones de la familia
        q = query(
          notificationsRef,
          where('familyId', '==', familyId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Si no hay familyId, cargar solo notificaciones del usuario
        q = query(
          notificationsRef,
          where('userId', '==', currentUser?.uid),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const notificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as DocumentData),
        createdAt: doc.data().createdAt?.toDate(),
        readAt: doc.data().readAt?.toDate(),
        expiresAt: doc.data().expiresAt?.toDate()
      })) as Notification[];

      setNotifications(notificationsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear notificación
  const createNotification = async (notificationData: Omit<Notification, 'id' | 'userId' | 'status' | 'createdAt'>) => {
    try {
      const newNotification = {
        ...notificationData,
        userId: currentUser?.uid,
        status: 'unread',
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'notifications'), newNotification);
      setNotifications(prev => [{
        ...newNotification,
        id: docRef.id
      } as Notification, ...prev]);

      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Marcar como leída
  const markAsRead = async (id: string) => {
    try {
      const notificationRef = doc(db, 'notifications', id);
      const readAt = new Date();
      
      await updateDoc(notificationRef, {
        status: 'read',
        readAt
      });

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, status: 'read', readAt }
            : notification
        )
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Archivar notificación
  const archiveNotification = async (id: string) => {
    try {
      const notificationRef = doc(db, 'notifications', id);
      await updateDoc(notificationRef, {
        status: 'archived'
      });

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, status: 'archived' }
            : notification
        )
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Eliminar notificación
  const deleteNotification = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    if (currentUser) {
      loadNotifications();
    }
  }, [currentUser, familyId]);

  return {
    notifications,
    loading,
    error,
    createNotification,
    markAsRead,
    archiveNotification,
    deleteNotification,
    refreshNotifications: loadNotifications
  };
}; 