# Clean&SecureMoney - Aplicación de Gestión de Gastos

## Índice
1. [Descripción General](#descripción-general)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Integración con Firebase](#integración-con-firebase)
5. [Roles de Usuario](#roles-de-usuario)
6. [Funcionalidades por Rol](#funcionalidades-por-rol)
7. [Guía de Instalación](#guía-de-instalación)
8. [Documentación Técnica](#documentación-técnica)

## Descripción General
Clean&SecureMoney es una aplicación web desarrollada con React y Firebase que permite gestionar gastos personales y familiares. La aplicación soporta múltiples roles de usuario y ofrece diferentes funcionalidades según el tipo de cuenta.

## Tecnologías Utilizadas
- React 18
- TypeScript
- Firebase (Authentication, Firestore, Storage)
- Material-UI
- React Router
- Context API
- Custom Hooks
- XLSX para exportación a Excel
- jsPDF para exportación a PDF

## Estructura del Proyecto
```
src/
├── assets/         # Recursos estáticos
├── auth/           # Componentes de autenticación
├── components/     # Componentes reutilizables
├── context/       # Contextos de React (Auth, Theme)
├── firebase/      # Configuración de Firebase
├── hooks/         # Custom hooks
├── pages/         # Páginas principales
├── services/      # Servicios de la aplicación
├── styles/        # Estilos globales
├── types/         # Definiciones de TypeScript
├── utils/         # Utilidades y helpers
└── [roles]/       # Componentes específicos por rol
```

## Integración con Firebase

### Configuración
La aplicación utiliza los siguientes servicios de Firebase:
```typescript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

### Colecciones en Firestore
1. **users**: Información de usuarios
   - Campos: nombres, apellido1, email, rol, createdAt
   ```typescript
   interface User {
     nombres: string;
     apellido1: string;
     email: string;
     rol: 'titular' | 'colaborador' | 'individual';
     createdAt: Timestamp;
   }
   ```

2. **expenses**: Registro de gastos
   ```typescript
   interface Expense {
     id: string;
     concepto: string;
     fecha: string | Date;
     metodo: string;
     monto: number;
     userId: string;
   }
   ```

3. **invitations**: Gestión de colaboradores
   ```typescript
   interface Invitation {
     titularId: string;
     email: string;
     status: 'pending' | 'accepted' | 'rejected';
     createdAt: Timestamp;
   }
   ```

## Roles de Usuario y Funcionalidades Específicas

### 1. Usuario Individual

#### Características Principales
- Gestión personal de gastos
- Dashboard individual
- Reportes personalizados
- Categorización de gastos

#### Implementación
```typescript
// individual/dashboard/Dashboard.tsx
const DashboardIndividual: React.FC = () => {
  const { expenses } = useExpenses();
  const { currentUser } = useAuth();

  const stats = useMemo(() => ({
    totalGastos: expenses.reduce((sum, exp) => sum + exp.monto, 0),
    promedioDiario: calculateDailyAverage(expenses),
    gastosPorCategoria: groupExpensesByCategory(expenses)
  }), [expenses]);

  return (
    <div className="dashboard">
      <StatsOverview stats={stats} />
      <ExpenseCharts data={stats.gastosPorCategoria} />
      <ExpenseTable expenses={expenses} />
    </div>
  );
};
```

#### Flujo de Trabajo
1. Registro de gastos individual
2. Visualización de estadísticas personales
3. Generación de reportes individuales
4. Gestión de categorías personales

### 2. Usuario Titular

#### Características Principales
- Gestión de cuenta familiar
- Administración de colaboradores
- Dashboard familiar
- Reportes consolidados
- Control de límites y conceptos

#### Implementación de Gestión de Colaboradores
```typescript
// titular/colaboradores/GestionColaboradores.tsx
const GestionColaboradores: React.FC = () => {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [invitacionesPendientes, setInvitacionesPendientes] = useState<Invitation[]>([]);

  const enviarInvitacion = async (email: string) => {
    try {
      await addDoc(collection(db, 'invitations'), {
        email,
        titularId: currentUser.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setInvitacionesPendientes(prev => [...prev, { email, status: 'pending' }]);
    } catch (error) {
      handleError(error);
    }
  };

  const removerColaborador = async (colaboradorId: string) => {
    try {
      await deleteDoc(doc(db, 'colaboradores', colaboradorId));
      setColaboradores(prev => prev.filter(c => c.id !== colaboradorId));
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    const loadColaboradores = async () => {
      const snapshot = await getDocs(
        query(collection(db, 'users'), 
              where('rol', '==', 'colaborador'),
              where('titularId', '==', currentUser.uid))
      );
      const colaboradoresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setColaboradores(colaboradoresData);
    };

    loadColaboradores();
  }, [currentUser]);

  return (
    <div className="colaboradores-container">
      <InvitationForm onSubmit={enviarInvitacion} />
      <ColaboradoresList 
        colaboradores={colaboradores}
        onRemove={removerColaborador}
      />
      <PendingInvitations invitaciones={invitacionesPendientes} />
    </div>
  );
};
```

#### Implementación de Límites y Conceptos
```typescript
// titular/configuracion/ConfiguracionGastos.tsx
interface LimiteGasto {
  categoria: string;
  monto: number;
  periodo: 'diario' | 'semanal' | 'mensual';
}

const ConfiguracionGastos: React.FC = () => {
  const [limites, setLimites] = useState<LimiteGasto[]>([]);
  const [conceptos, setConceptos] = useState<string[]>([]);

  const establecerLimite = async (limite: LimiteGasto) => {
    try {
      await setDoc(doc(db, 'limites', limite.categoria), {
        ...limite,
        titularId: currentUser.uid,
        updatedAt: serverTimestamp()
      });
      
      setLimites(prev => [
        ...prev.filter(l => l.categoria !== limite.categoria),
        limite
      ]);

      await notifyCollaborators('LIMITE_ACTUALIZADO', limite);
    } catch (error) {
      handleError(error);
    }
  };

  const agregarConcepto = async (concepto: string) => {
    try {
      await updateDoc(doc(db, 'configuracion', currentUser.uid), {
        conceptosPermitidos: arrayUnion(concepto)
      });
      setConceptos(prev => [...prev, concepto]);
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    const loadConfiguracion = async () => {
      const configDoc = await getDoc(doc(db, 'configuracion', currentUser.uid));
      if (configDoc.exists()) {
        const data = configDoc.data();
        setConceptos(data.conceptosPermitidos || []);
      }

      const limitesSnapshot = await getDocs(
        query(collection(db, 'limites'), 
              where('titularId', '==', currentUser.uid))
      );
      setLimites(limitesSnapshot.docs.map(doc => doc.data() as LimiteGasto));
    };

    loadConfiguracion();
  }, [currentUser]);

  return (
    <div className="configuracion-container">
      <LimitesForm onSubmit={establecerLimite} />
      <ConceptosManager 
        conceptos={conceptos}
        onAdd={agregarConcepto}
      />
      <ConfiguracionSummary 
        limites={limites}
        conceptos={conceptos}
      />
    </div>
  );
};
```

#### Flujo de Trabajo del Titular
1. Configuración inicial de la cuenta familiar
2. Invitación y gestión de colaboradores
3. Establecimiento de límites y conceptos
4. Monitoreo de gastos familiares
5. Generación de reportes consolidados

### 3. Usuario Colaborador

#### Características Principales
- Registro de gastos
- Vista limitada del dashboard familiar
- Reportes personales
- Acceso a conceptos predefinidos

#### Implementación
```typescript
// colaborador/registro/RegistroGasto.tsx
const RegistroGastoColaborador: React.FC = () => {
  const { conceptosPermitidos, limites } = useConfiguracionTitular();
  const { registrarGasto } = useExpenses();
  const { currentUser } = useAuth();

  const validarLimites = (monto: number, categoria: string): boolean => {
    const limiteCategoria = limites.find(l => l.categoria === categoria);
    if (!limiteCategoria) return true;

    const gastosDelPeriodo = calcularGastosPeriodo(
      limiteCategoria.periodo,
      categoria
    );

    return (gastosDelPeriodo + monto) <= limiteCategoria.monto;
  };

  const handleSubmit = async (gasto: Expense) => {
    if (!validarLimites(gasto.monto, gasto.concepto)) {
      alert('El gasto excede el límite establecido');
      return;
    }

    try {
      await registrarGasto({
        ...gasto,
        userId: currentUser.uid,
        fecha: new Date(),
        createdAt: serverTimestamp()
      });

      await notifyTitular('NUEVO_GASTO', gasto);
      
      resetForm();
      showSuccess('Gasto registrado exitosamente');
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="registro-gasto">
      <GastoForm 
        conceptosPermitidos={conceptosPermitidos}
        onSubmit={handleSubmit}
      />
      <LimitesIndicator limites={limites} />
    </div>
  );
};
```

#### Flujo de Trabajo del Colaborador
1. Acceso mediante invitación
2. Registro de gastos dentro de límites
3. Visualización de gastos personales
4. Acceso a reportes limitados

## Guía de Instalación

1. Clonar el repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd CSM-react-app
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
Crear archivo `.env` con:
```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
```

4. Iniciar el proyecto
```bash
npm start
```

## Documentación Técnica

### Hooks Personalizados

#### useAuth
```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
```

#### useExpenses
```typescript
// hooks/useExpenses.ts
export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'expenses'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(expensesData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return { expenses };
};
```

### Componentes Principales

#### TablaGastos
```typescript
// components/TablaGastos.tsx
interface TablaGastosProps {
  gastos: Expense[];
  onEdit?: (gasto: Expense) => void;
  onDelete?: (id: string) => void;
}

const TablaGastos: React.FC<TablaGastosProps> = ({
  gastos,
  onEdit,
  onDelete
}) => {
  // Implementación de la tabla
};
```

### Servicios

#### AuthService
```typescript
// services/AuthService.ts
export const signIn = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
};
```

### Seguridad y Reglas de Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para colección de usuarios
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Reglas para gastos
    match /expenses/{expenseId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        exists(/databases/$(database)/documents/invitations/$(request.auth.uid))
      );
      allow write: if request.auth != null && 
        request.resource.data.userId == request.auth.uid;
    }
  }
}
```

### Manejo de Errores
La aplicación implementa un sistema centralizado de manejo de errores:

```typescript
// utils/errorHandler.ts
export const handleFirebaseError = (error: FirebaseError) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'Usuario no encontrado';
    case 'auth/wrong-password':
      return 'Contraseña incorrecta';
    // ... más casos de error
    default:
      return 'Error desconocido';
  }
};
```

### Pruebas
La aplicación incluye pruebas unitarias y de integración:

```typescript
// __tests__/components/TablaGastos.test.tsx
describe('TablaGastos', () => {
  it('renderiza correctamente los gastos', () => {
    // Implementación de pruebas
  });

  it('maneja correctamente la edición de gastos', () => {
    // Implementación de pruebas
  });
});
```

## Contribución
Para contribuir al proyecto:

1. Fork del repositorio
2. Crear una rama para la feature
3. Commit de los cambios
4. Push a la rama
5. Crear Pull Request

## Licencia
Este proyecto está bajo la licencia MIT.
