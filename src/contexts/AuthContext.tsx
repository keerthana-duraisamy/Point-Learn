import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface User {
  id: string;
  name: string;
  email: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginAsDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore if needed
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : null;
          
          setUser({
            id: firebaseUser.uid,
            name: userData?.name || firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Demo Learner' : 'User'),
            email: firebaseUser.email || (firebaseUser.isAnonymous ? 'demo@pointlearn.preview' : ''),
            isDemo: firebaseUser.isAnonymous,
          });
        } catch {
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Demo Learner' : 'User'),
            email: firebaseUser.email || '',
            isDemo: firebaseUser.isAnonymous,
          });
        }
      } else {
        // If not authenticated via Firebase, check if we have an active demo user in state
        setUser((prev) => (prev?.isDemo ? prev : null));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginAsDemo = async () => {
    setLoading(true);
    try {
      const cred = await signInAnonymously(auth);
      setUser({
        id: cred.user.uid,
        name: 'Demo Learner',
        email: 'demo@pointlearn.preview',
        isDemo: true,
      });
    } catch {
      // Fallback demo user if anonymous auth is disabled
      setUser({
        id: 'preview-demo-user',
        name: 'Demo Learner',
        email: 'demo@pointlearn.preview',
        isDemo: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, loginAsDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

