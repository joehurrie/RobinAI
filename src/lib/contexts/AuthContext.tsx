"use client";

import React, { createContext, useEffect, useState, useContext } from "react";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { User } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => ({ success: false, message: '' }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('AuthProvider: Auth state changed', { user: user ? 'User exists' : 'No user' });
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('AuthProvider: Error in auth state listener', error);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const handleSignInWithGoogle = async () => {
    console.log('AuthProvider: Starting Google sign in');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      console.log('AuthProvider: Google sign in successful');
      router.push('/');
    } catch (error) {
      console.error("AuthProvider: Error signing in with Google", error);
      throw error;
    }
  };

  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('AuthProvider: Email sign in successful');
      router.push('/');
    } catch (error) {
      console.error("AuthProvider: Error signing in with email", error);
      throw error;
    }
  };

  const handleSignUpWithEmail = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('AuthProvider: Email sign up successful');
      router.push('/');
    } catch (error) {
      console.error("AuthProvider: Error signing up with email", error);
      throw error;
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('AuthProvider: Password reset email sent');
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error: any) {
      console.error("AuthProvider: Error sending password reset email", error);
      throw new Error(error.message || 'Failed to send password reset email');
    }
  };

  const handleSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      console.log('AuthProvider: Sign out successful');
      router.push('/login');
    } catch (error) {
      console.error("AuthProvider: Error signing out", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signInWithGoogle: handleSignInWithGoogle, 
      signInWithEmail: handleSignInWithEmail,
      signUpWithEmail: handleSignUpWithEmail,
      resetPassword: handleResetPassword,
      signOut: handleSignOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
