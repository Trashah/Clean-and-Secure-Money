import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Aquí deberás colocar tu configuración de Firebase
  apiKey: "AIzaSyACJXcVT4YBHmnirct_7DAOXzKbfE5ZdyU",
  authDomain: "clean-and--money.firebaseapp.com",
  databaseURL: "https://clean-and--money-default-rtdb.firebaseio.com",
  projectId: "clean-and--money",
  storageBucket: "clean-and--money.firebasestorage.app",
  messagingSenderId: "940791486531",
  appId: "1:940791486531:web:5efa8759a2d4d70fefdcf6",
  measurementId: "G-W867QD439P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 