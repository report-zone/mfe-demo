import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService, { AuthUser } from '../services/authService';

interface User {
  username: string;
  email?: string;
  groups?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (username: string, password: string, email: string) => Promise<void>;
  confirmSignUp: (username: string, code: string) => Promise<void>;
  resetPassword: (username: string) => Promise<void>;
  confirmResetPassword: (username: string, code: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      await authService.signIn(username, password);
      await checkUser();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signup = async (username: string, password: string, email: string) => {
    try {
      await authService.signUp({ username, password, email });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const confirmSignup = async (username: string, code: string) => {
    try {
      await authService.confirmSignUp({ username, code });
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
  };

  const resetPass = async (username: string) => {
    try {
      await authService.resetPassword({ username });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const confirmResetPass = async (username: string, code: string, newPassword: string) => {
    try {
      await authService.confirmResetPassword({ username, code, newPassword });
    } catch (error) {
      console.error('Confirm reset password error:', error);
      throw error;
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.groups?.includes('admin') || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        logout,
        signUp: signup,
        confirmSignUp: confirmSignup,
        resetPassword: resetPass,
        confirmResetPassword: confirmResetPass,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
