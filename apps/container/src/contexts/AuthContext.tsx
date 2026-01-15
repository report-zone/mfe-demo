import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IAuthService } from '../services/interfaces/IAuthService';
import authService from '../services/authService';
import { User, IAuthContext } from './interfaces/IAuthContext';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
  authService?: IAuthService; // Allow injection for testing (Dependency Injection)
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ 
  children, 
  authService: injectedAuthService = authService 
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUser = async () => {
    try {
      const currentUser = await injectedAuthService.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username: string, password: string) => {
    try {
      await injectedAuthService.signIn(username, password);
      await checkUser();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await injectedAuthService.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const signup = async (username: string, password: string, email: string) => {
    try {
      await injectedAuthService.signUp({ username, password, email });
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const confirmSignup = async (username: string, code: string) => {
    try {
      await injectedAuthService.confirmSignUp({ username, code });
    } catch (error) {
      console.error('Confirm sign up error:', error);
      throw error;
    }
  };

  const resetPass = async (username: string) => {
    try {
      await injectedAuthService.resetPassword({ username });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const confirmResetPass = async (username: string, code: string, newPassword: string) => {
    try {
      await injectedAuthService.confirmResetPassword({ username, code, newPassword });
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
