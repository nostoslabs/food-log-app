import { useState, useEffect, useContext, createContext, type ReactNode } from 'react';
import { authService } from '../services/auth';
import { syncLocalStorageToFirestore } from '../utils/dataMigration';
import type { User, AuthState } from '../types';

// Create the auth context
const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
} | undefined>(undefined);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // Clear error
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Sign in
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authService.signIn(email, password);
      setAuthState(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign in failed'
      }));
    }
  };

  // Sign up
  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authService.signUp(email, password, displayName);
      setAuthState(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign up failed'
      }));
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authService.signInWithGoogle();
      setAuthState(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Google sign in failed'
      }));
    }
  };

  // Sign in with Facebook
  const signInWithFacebook = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const user = await authService.signInWithFacebook();
      setAuthState(prev => ({ ...prev, user, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Facebook sign in failed'
      }));
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.signOut();
      setAuthState(prev => ({ ...prev, user: null, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Sign out failed'
      }));
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.resetPassword(email);
      setAuthState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Password reset failed'
      }));
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setAuthState(prev => ({
        ...prev,
        user,
        loading: false,
        error: null
      }));

      // Sync localStorage data to Firestore for authenticated users
      if (user) {
        try {
          console.log('[DATA SYNC] User authenticated, syncing localStorage to Firestore...');
          const result = await syncLocalStorageToFirestore(user.uid);
          console.log(`[DATA SYNC] Sync completed: ${result.syncedCount}/${result.totalFound} entries synced`);
          if (result.errors.length > 0) {
            console.warn('[DATA SYNC] Some entries failed to sync:', result.errors);
          }
        } catch (error) {
          console.error('[DATA SYNC] Sync failed:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  const value = {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signOut,
    resetPassword,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}