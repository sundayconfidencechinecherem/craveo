// src/app/components/ProtectedRoute.tsx - COMPLETE FIXED VERSION
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  requireVerified?: boolean;
  requireAdmin?: boolean;
}

/**
 * ProtectedRoute component
 * Wraps routes that require authentication or specific permissions
 */
export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = '/auth/login',
  requireVerified = false,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      setChecked(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!checked || isLoading || !isClient) {
      return;
    }

    console.log('🔐 ProtectedRoute check:', {
      requireAuth,
      isAuthenticated,
      pathname,
      redirectTo,
      isAuthPage: pathname === '/auth/login' || pathname === '/auth/register'
    });

    // If user is authenticated and trying to access auth pages, redirect to home
    if ((pathname === '/auth/login' || pathname === '/auth/register') && isAuthenticated) {
      console.log('✅ User authenticated, redirecting from auth page to home');
      
      // Get redirect from query params or default to home
      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get('redirect');
      const redirectPath = redirectParam || '/';
      
      // Clear any redirect storage
      localStorage.removeItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLoginProtected');
      
      router.push(redirectPath);
      return;
    }

    // Check if authentication is required
    if (requireAuth && !isAuthenticated) {
      console.log('🔐 Authentication required, redirecting to login');
      
      // Store the attempted URL for redirect after login
      // Don't store auth pages themselves
      const redirectPath = (pathname !== '/auth/login' && pathname !== '/auth/register') 
        ? pathname 
        : '/';
      
      // Store in both localStorage (persists) and sessionStorage (session only)
      localStorage.setItem('redirectAfterLogin', redirectPath);
      sessionStorage.setItem('redirectAfterLogin', redirectPath);
      sessionStorage.setItem('redirectAfterLoginProtected', redirectPath);
      
      console.log('📝 Saved redirect path:', redirectPath);
      
      // Build redirect URL with query parameter
      const redirectUrl = new URL(redirectTo, window.location.origin);
      if (redirectPath !== '/') {
        redirectUrl.searchParams.set('redirect', redirectPath);
      }
      
      router.push(redirectUrl.toString());
      return;
    }

    // Check if user needs to be verified
    if (requireVerified && isAuthenticated && !user?.isVerified) {
      console.log('🔐 User needs verification');
      router.push('/verify-email');
      return;
    }

    // Check if admin role is required
    if (requireAdmin && isAuthenticated) {
      // Future implementation for admin checks
      console.log('🔐 Admin check would go here');
      // Add your admin check logic here
    }
    
    // If authenticated and on a protected page, clear any redirect storage
    if (isAuthenticated && requireAuth) {
      console.log('✅ User authenticated, clearing redirect storage');
      localStorage.removeItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLoginProtected');
    }
  }, [isAuthenticated, isLoading, user, requireAuth, requireVerified, requireAdmin, router, pathname, redirectTo, checked, isClient]);

  // Show loading while checking auth or waiting for check
  if (isLoading || !checked || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show content if authenticated (or if auth not required)
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  // Show redirecting message (should rarely be seen as redirect happens quickly)
  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-text-primary font-medium">Redirecting to login...</p>
        <p className="mt-2 text-text-secondary text-sm">
          Please wait while we redirect you to the login page
        </p>
      </div>
    </div>
  );
}