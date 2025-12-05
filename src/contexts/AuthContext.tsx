import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { generateSalt, deriveKey } from '@/lib/encryption';

interface UserProfile {
  displayName: string;
  email: string;
  createdAt: string;
  encryptionSalt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  encryptionKey: CryptoKey | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPassword, setPendingPassword] = useState<string | null>(null);

  const loadProfile = useCallback(async (uid: string) => {
    const profileDoc = await getDoc(doc(db, 'users', uid));
    if (profileDoc.exists()) {
      return profileDoc.data() as UserProfile;
    }
    return null;
  }, []);

  const initializeEncryption = useCallback(async (password: string, salt: string) => {
    const key = await deriveKey(password, salt);
    setEncryptionKey(key);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const userProfile = await loadProfile(firebaseUser.uid);
        setProfile(userProfile);
        
        // If we have a pending password (from recent sign in), derive the key
        if (pendingPassword && userProfile?.encryptionSalt) {
          await initializeEncryption(pendingPassword, userProfile.encryptionSalt);
          setPendingPassword(null);
        }
      } else {
        setProfile(null);
        setEncryptionKey(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadProfile, initializeEncryption, pendingPassword]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await loadProfile(result.user.uid);
      
      if (userProfile?.encryptionSalt) {
        await initializeEncryption(password, userProfile.encryptionSalt);
      }
      
      setProfile(userProfile);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const salt = generateSalt();
      
      const newProfile: UserProfile = {
        displayName,
        email,
        createdAt: new Date().toISOString(),
        encryptionSalt: salt
      };

      await setDoc(doc(db, 'users', result.user.uid), newProfile);
      await initializeEncryption(password, salt);
      setProfile(newProfile);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setEncryptionKey(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        encryptionKey,
        loading,
        signIn,
        signUp,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
