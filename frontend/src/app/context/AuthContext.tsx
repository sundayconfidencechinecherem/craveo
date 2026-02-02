// src/app/context/AuthContext.tsx - FIXED VERSION
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { apolloClient, clearAuthData } from '../services/apollo-client';
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION
} from '../graphql/mutations';
import { GET_ME_QUERY } from '../graphql/queries';
import { User } from '../graphql/types';

interface LoginCredentials {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterCredentials {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  username: string;
  dateOfBirth?: string;
  avatar?: string;
  bio?: string;
  website?: string;
  location?: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResult>;
  register: (credentials: RegisterCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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

  // Get current user query - FIXED: removed onError callback
  const { data: userData, loading: userLoading, error: userError, refetch } = useQuery(GET_ME_QUERY, {
    fetchPolicy: 'network-only',
    skip: typeof window === 'undefined' // Skip during SSR
  });

  // Login mutation - FIXED: removed onError/onCompleted callbacks
  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);

  // Register mutation - FIXED: removed onError/onCompleted callbacks
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION);

  // Logout mutation - FIXED: removed onError/onCompleted callbacks
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  // Refresh token mutation
  const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);

  // Load user from localStorage on initial load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          //console.error('Failed to parse stored user:', error);
          localStorage.removeItem('user');
        }
      }
    }
    setIsLoading(false);
  }, []);

  // Handle user query errors
  useEffect(() => {
    if (userError) {
      //console.error('User query error:', userError);
      // If not authenticated, clear any stale data
      setUser(null);
      clearAuthData();
    }
  }, [userError]);

  // Update user state when query completes
  useEffect(() => {
    if (userData?.me) {
      setUser(userData.me);
      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(userData.me));
    }
  }, [userData]);

const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
  try {
    const { data } = await loginMutation({ variables: credentials });

    if (data?.login?.success) {
      const { accessToken, refreshToken, user } = data.login;

      if (accessToken) localStorage.setItem('token', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
      }

      await refetch();

      return { success: true, accessToken, refreshToken, user };
    }

    return { success: false, message: data?.login?.message || 'Login failed' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};


  const register = async (credentials: RegisterCredentials): Promise<{ success: boolean; message?: string }> => {
    try {
      const { data } = await registerMutation({
        variables: {
          username: credentials.username,
          email: credentials.email,
          fullName: credentials.fullName,
          password: credentials.password,
          confirmPassword: credentials.confirmPassword,
          dateOfBirth: credentials.dateOfBirth || null,
          bio: credentials.bio || '',
          website: credentials.website || '',
          location: credentials.location || '',
          avatar: credentials.avatar || null
        }
      });

      if (data?.signup?.success) {
        // Store tokens
        if (data.signup.accessToken) {
          localStorage.setItem('token', data.signup.accessToken);
        }
        if (data.signup.refreshToken) {
          localStorage.setItem('refreshToken', data.signup.refreshToken);
        }
        // Store user data
        if (data.signup.user) {
          const userData = data.signup.user;
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        }
        
        // Refetch user data
        await refetch();
        
        return { success: true };
      } else {
        return { 
          success: false, 
          message: data?.signup?.message || 'Registration failed' 
        };
      }
    } catch (error: any) {
      //console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

// In your AuthContext.tsx - Update the logout function
const logout = async (): Promise<void> => {
  try {
    // Call logout mutation
    await logoutMutation();
  } catch (error) {
    //console.error('Logout mutation error:', error);
  } finally {
    // Always perform local logout
    handleLogout();
  }
};

const handleLogout = () => {
  // Clear auth data
  clearAuthData();
  setUser(null);
  
  // Clear Apollo cache
  apolloClient.clearStore();
  
  // Redirect to login page after logout
  if (typeof window !== 'undefined') {
    // Store current path for redirect after login (optional)
    const currentPath = window.location.pathname;
    if (currentPath !== '/auth/login' && currentPath !== '/auth/register') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    // Redirect to login
    window.location.href = '/auth/login';
  }
};

  const refreshUser = async (): Promise<void> => {
    try {
      await refetch();
    } catch (error) {
      //console.error('Failed to refresh user:', error);
    }
  };

  // Try to refresh token if user data query fails with authentication error
  useEffect(() => {
    if (userError?.message?.includes('Not authenticated') || userError?.message?.includes('UNAUTHENTICATED')) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        refreshTokenMutation({
          variables: { token: refreshToken }
        }).then(({ data }) => {
          if (data?.refreshToken?.success) {
            // Update tokens
            if (data.refreshToken.accessToken) {
              localStorage.setItem('token', data.refreshToken.accessToken);
            }
            if (data.refreshToken.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken.refreshToken);
            }
            // Token refreshed, retry user query
            refetch();
          } else {
            // Refresh failed, logout
            handleLogout();
          }
        }).catch(() => {
          handleLogout();
        });
      } else {
        handleLogout();
      }
    }
  }, [userError, refreshTokenMutation, refetch]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !userLoading,
    isLoading: isLoading || userLoading || loginLoading || registerLoading,
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};