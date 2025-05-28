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
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

interface Invitation {
  id: string;
  familyId: string;
  titularId: string;
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  expiresAt: Date;
  nombres: string;
  apellido1: string;
  apellido2: string;
}

export const useInvitations = (familyId?: string) => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  // Cargar invitaciones
  const loadInvitations = async () => {
    try {
      setLoading(true);
      const invitationsRef = collection(db, 'invitations');
      let q;

      if (familyId) {
        // Si hay familyId, cargar invitaciones de la familia
        q = query(
          invitationsRef,
          where('familyId', '==', familyId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Si no hay familyId, cargar invitaciones del usuario por email
        q = query(
          invitationsRef,
          where('email', '==', currentUser?.email),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      const invitationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invitation[];

      setInvitations(invitationsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Crear invitación
  const createInvitation = async (invitationData: Omit<Invitation, 'id' | 'status' | 'createdAt' | 'titularId'>) => {
    try {
      const newInvitation = {
        ...invitationData,
        titularId: currentUser?.uid,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      };

      const docRef = await addDoc(collection(db, 'invitations'), newInvitation);
      setInvitations(prev => [{
        ...newInvitation,
        id: docRef.id
      } as Invitation, ...prev]);

      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Responder a invitación
  const respondToInvitation = async (id: string, accept: boolean) => {
    try {
      const invitationRef = doc(db, 'invitations', id);
      const status = accept ? 'accepted' : 'rejected';
      
      await updateDoc(invitationRef, {
        status,
        respondedAt: new Date()
      });

      if (accept) {
        // Si se acepta, actualizar el documento de la familia
        const invitation = invitations.find(inv => inv.id === id);
        if (invitation) {
          const familyRef = doc(db, 'families', invitation.familyId);
          await updateDoc(familyRef, {
            members: [{
              userId: currentUser?.uid,
              role: 'colaborador',
              joinedAt: new Date(),
              status: 'active'
            }]
          });
        }
      }

      setInvitations(prev =>
        prev.map(invitation =>
          invitation.id === id
            ? { ...invitation, status }
            : invitation
        )
      );
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Cancelar invitación
  const cancelInvitation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'invitations', id));
      setInvitations(prev => prev.filter(invitation => invitation.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Cargar invitaciones al montar el componente
  useEffect(() => {
    if (currentUser) {
      loadInvitations();
    }
  }, [currentUser, familyId]);

  return {
    invitations,
    loading,
    error,
    createInvitation,
    respondToInvitation,
    cancelInvitation,
    refreshInvitations: loadInvitations
  };
}; 