import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  Auth,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<{ user: User }>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Registro con email y contraseña
  const register = async (email: string, password: string, userData: any) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Crear documento de usuario en Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email: email,
      ...userData,
      createdAt: new Date(),
      lastLogin: new Date()
    });

    return { user: result.user };
  };

  // Login con email y contraseña
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Login con Google
  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Verificar si el usuario ya existe
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Crear nuevo usuario
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          nombres: result.user.displayName,
          photoURL: result.user.photoURL,
          role: 'individual', // Por defecto es individual
          createdAt: new Date(),
          lastLogin: new Date()
        });
      } else {
        // Actualizar último login
        await setDoc(doc(db, 'users', result.user.uid), {
          lastLogin: new Date()
        }, { merge: true });
      }
    } catch (error) {
      console.error('Error en login con Google:', error);
      throw error;
    }
  };

  // Logout
  const logout = () => signOut(auth);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    googleLogin,
    signOut: logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 