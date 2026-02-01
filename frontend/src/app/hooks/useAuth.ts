// app/hooks/useAuth.ts - COMPLETE VERSION
'use client';

import { useAuth as useAuthContext } from '../context/AuthContext';
import { User } from '../graphql/types';

/**
 * Custom hook for authentication with extended functionality
 */
export const useAuth = () => {
  const auth = useAuthContext();

  /**
   * Check if user has specific role (for future role-based auth)
   */
  const hasRole = (role: string): boolean => {
    return false; // Placeholder for future role-based auth
  };

  /**
   * Check if user is the owner of a resource
   */
  const isOwner = (resourceOwnerId: string): boolean => {
    return auth.user?.id === resourceOwnerId;
  };

  /**
   * Get user initials for avatar fallback
   */
  const getUserInitials = (): string => {
    if (!auth.user?.fullName) return 'U';
    return auth.user.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Get user display name (full name or username)
   */
  const getDisplayName = (): string => {
    return auth.user?.fullName || auth.user?.username || 'User';
  };

  /**
   * Check if user is verified
   */
  const isVerified = (): boolean => {
    return auth.user?.isVerified || false;
  };

  /**
   * Check if user can post (basic validation)
   */
  const canPost = (): boolean => {
    return auth.isAuthenticated && (auth.user?.isVerified || false);
  };

  /**
   * Get auth debug info
   */
  const getDebugInfo = () => {
    return {
      user: auth.user,
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      cookies: typeof document !== 'undefined' ? document.cookie : 'No document',
      localStorage: typeof window !== 'undefined' 
        ? { user: localStorage.getItem('user') }
        : 'No window'
    };
  };

  return {
    ...auth,
    hasRole,
    isOwner,
    getUserInitials,
    getDisplayName,
    isVerified,
    canPost,
    getDebugInfo,
  };
};

/**
 * Hook for checking authentication status only
 */
export const useAuthStatus = () => {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
};

/**
 * Hook for getting current user only
 */
export const useCurrentUser = () => {
  const { user } = useAuth();
  return user;
};

