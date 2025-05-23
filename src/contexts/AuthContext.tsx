"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdmin, loginReviewer, loginResearcher, logout } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Credentials {
  email: string;
  password: string;
}

type LoginFunction = (credentials: Credentials) => Promise<{
  user: User;
  accessToken: string;
}>;

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  userType?: 'admin' | 'reviewer' | 'researcher';
}

export const AuthProvider = ({ children, userType = 'admin' }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');
      
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          
          if (parsedUser.role === userType) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem('userData');
            localStorage.removeItem('accessToken');
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
          localStorage.removeItem('userData');
          localStorage.removeItem('accessToken');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [userType]);

  const getLoginFunction = (type: string): LoginFunction => {
    switch (type) {
      case 'admin':
        return loginAdmin;
      case 'reviewer':
        return loginReviewer;
      case 'researcher':
        return loginResearcher;
      default:
        return loginAdmin;
    }
  };
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loginFn = getLoginFunction(userType);
      const response = await loginFn({ email, password });
      
      if (response.user && response.accessToken) {
        if (response.user.role === userType) {
          setUser(response.user);
          localStorage.setItem('userData', JSON.stringify(response.user));
          
          switch (userType) {
            case 'admin':
              router.push('/admin/dashboard');
              break;
            case 'reviewer':
              router.push('/reviewers/dashboard');
              break;
            case 'researcher':
              router.push('/researchers/dashboard');
              break;
            default:
              router.push('/');
          }
        } else {
          setError(`Invalid login. You are trying to log in as a ${userType} but your account is a ${response.user.role}.`);
          localStorage.removeItem('accessToken');
        }
      } else {
        setError('Invalid login response');
      }
    } catch (err: any) {
      // This is the key fix - properly extract the error message
      let errorMessage = 'An unknown error occurred';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      console.error('Login error:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    localStorage.removeItem('userData');
    setUser(null);
    setError(null);
    
    switch (userType) {
      case 'admin':
        router.push('/admin/login');
        break;
      case 'reviewer':
        router.push('/reviewers/login');
        break;
      case 'researcher':
        router.push('/researchers/login');
        break;
      default:
        router.push('/');
    }
  };

  const clearError = () => {
    setError(null);
  };
  
  const isAuthenticated = !!user;
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout: handleLogout,
        error,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};