// src/app/utils/auth.utils.ts - FIXED VERSION
import { REFRESH_TOKEN_MUTATION } from '@/app/graphql/mutations'; // Changed from queries to mutations
import { apolloClient } from '@/app/services/apollo-client';

export interface RefreshTokenResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: any;
}

export const refreshAuthToken = async (): Promise<RefreshTokenResponse> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return { success: false, message: 'No refresh token available' };
    }

    const { data } = await apolloClient.mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: { token: refreshToken },
    });
    
    if (data?.refreshToken?.success) {
      // Update tokens in localStorage
      if (data.refreshToken.accessToken) {
        localStorage.setItem('token', data.refreshToken.accessToken);
      }
      if (data.refreshToken.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken.refreshToken);
      }
      
      return { 
        success: true, 
        accessToken: data.refreshToken.accessToken,
        refreshToken: data.refreshToken.refreshToken,
        user: data.refreshToken.user 
      };
    }
    
    return { 
      success: false, 
      message: data?.refreshToken?.message || 'Token refresh failed' 
    };
  } catch (error: any) {
    console.error('Failed to refresh token:', error);
    return { 
      success: false, 
      message: error.message || 'Token refresh error' 
    };
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    if (!token) return true;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // Add 5-minute buffer to be safe
    return expirationTime - 5 * 60 * 1000 < currentTime;
  } catch {
    return true;
  }
};

export const getTokenPayload = (token: string): any | null => {
  try {
    if (!token) return null;
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
};

export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && !isTokenExpired(token)) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectAfterLogin');
    
    sessionStorage.removeItem('redirectAfterLogin');
    sessionStorage.removeItem('redirectAfterLoginProtected');
    
    // Clear Apollo cache
    apolloClient.clearStore();
  }
};

export const checkAuthStatus = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  return !isTokenExpired(token);
};

// Helper to get user info from token
export const getUserFromToken = (): { id?: string; username?: string; email?: string } | null => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    const payload = getTokenPayload(token);
    if (!payload) return null;
    
    return {
      id: payload._id || payload.id,
      username: payload.username,
      email: payload.email
    };
  } catch {
    return null;
  }
};