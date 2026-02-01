// src/app/auth/login/page.tsx - FIXED FOR ALL SCREENS
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '@/app/context/AuthContext';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const queryRedirect = searchParams.get('redirect');
  const localStorageRedirect = isClient ? localStorage.getItem('redirectAfterLogin') : null;
  const sessionRedirect = isClient ? sessionStorage.getItem('redirectAfterLogin') : null;
  const redirectPath = queryRedirect || sessionRedirect || localStorageRedirect || '/';

  useEffect(() => {
    if (!isClient) return;
    
    localStorage.removeItem('redirectAfterLogin');
    sessionStorage.removeItem('redirectAfterLogin');
    
    if (isAuthenticated && !authLoading) {
      handleRedirect();
    }
  }, [isAuthenticated, authLoading, redirectPath, isClient]);

  const handleRedirect = () => {
    if (isClient) {
      localStorage.removeItem('redirectAfterLogin');
      sessionStorage.removeItem('redirectAfterLogin');
    }
    
    router.push(redirectPath);
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login({ 
        identifier, 
        password,
        rememberMe 
      });
      
      if (!result.success) {
        setError(result.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Container */}
      <div className="flex min-h-screen items-center justify-center px-4 py-8 lg:px-8">
        {/* Desktop Layout - Side by side */}
        <div className="hidden w-full max-w-6xl lg:flex lg:items-center lg:gap-12 xl:gap-16">
          {/* Left Panel - Branding */}
          <div className="flex-1">
            <div className="max-w-lg">
              {/* Logo */}
              <div className="mb-10">
                <div className="relative h-[180px] w-[180px]">
                  <Image
                    src="/craveologo.png"
                    alt="Craveo Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              
              {/* Hero Text */}
              <div className="space-y-6">
                <h1 className="text-4xl font-black leading-tight text-text-primary xl:text-5xl">
                  Discover delicious foods
                </h1>
                <h2 className="text-3xl font-black leading-tight text-primary xl:text-4xl">
                  and experiences
                </h2>
                <p className="text-xl text-text-secondary">
                  from people around the world.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="flex-1 max-w-md">
            <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl">
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-text-primary">
                  Welcome Back
                </h1>
                <p className="mt-2 text-text-secondary">
                  Sign in to continue discovering delicious foods.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-4 text-sm text-error">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">
                    Email or Username *
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    placeholder="Enter your email or username"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-text-primary">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-border bg-surface px-4 py-3 pr-10 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary disabled:opacity-50"
                      disabled={loading}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm text-text-secondary">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                      disabled={loading}
                    />
                    <span>Remember me</span>
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-surface px-4 text-sm text-text-tertiary">or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Google login would go here')}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white py-3 font-semibold text-text-primary hover:bg-surface-hover disabled:opacity-50"
                >
                  <FaGoogle className="text-green-500" />
                  Continue with Google
                </button>

                <div className="pt-6 text-center">
                  <p className="text-text-secondary">
                    Don't have an account?{' '}
                    <Link
                      href="/auth/register"
                      className="font-semibold text-primary hover:underline"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout - Single column */}
        <div className="w-full max-w-md lg:hidden">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative h-[120px] w-[120px]">
              <Image
                src="/craveologo.png"
                alt="Craveo Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <div className="mb-6 text-center">
              <h1 className="text-xl font-bold text-text-primary">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Sign in to continue discovering delicious foods.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-error/20 bg-error/10 p-3 text-xs text-error">
                <strong>Error:</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-text-primary">
                  Email or Username *
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  placeholder="Enter your email or username"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-text-primary">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 pr-10 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary disabled:opacity-50"
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-xs text-text-secondary">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-3 w-3 rounded border-border text-primary focus:ring-primary disabled:opacity-50"
                    disabled={loading}
                  />
                  <span>Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-surface px-3 text-xs text-text-tertiary">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert('Google login would go here')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-white py-2.5 text-sm font-semibold text-text-primary hover:bg-surface-hover disabled:opacity-50"
              >
                <FaGoogle className="text-green-500" />
                Continue with Google
              </button>

              <div className="pt-4 text-center">
                <p className="text-xs text-text-secondary">
                  Don't have an account?{' '}
                  <Link
                    href="/auth/register"
                    className="font-semibold text-primary hover:underline"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>

          {/* Footer for mobile */}
          <div className="mt-8 text-center">
            <p className="text-xs text-text-tertiary">
              © 2026 Craveo. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}