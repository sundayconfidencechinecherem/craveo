'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaGoogle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '@/app/context/AuthContext';
import Footer from '@/app/components/Footer';

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
      {/* Main Container - No scrolling */}
      <div className="flex min-h-screen items-center justify-center px-4 py-8 lg:px-8">
        
        {/* Desktop Layout - Elegant centered split */}
        <div className="hidden w-full max-w-7xl lg:flex lg:items-center lg:justify-between lg:gap-16 xl:gap-24">
          {/* Left Panel - Hero Section */}
          <div className="w-1/2 max-w-[600px]">
            <div className="space-y-8">
              {/* Logo with glow effect */}
              <div className="mb-6">
                <div className="relative h-[160px] w-[160px] xl:h-[200px] xl:w-[200px]">
                  <Image
                    src="/tpgreenlogo.png"
                    alt="Craveo Logo"
                    fill
                    className="object-contain drop-shadow-lg"
                    priority
                    sizes="(max-width: 1536px) 200px"
                  />
                </div>
              </div>
              
              {/* Hero Text with elegant typography */}
              <div className="space-y-6 xl:space-y-8">
                <div className="space-y-4">
                  <h1 className="text-6xl font-black leading-[1.1] text-text-primary xl:text-6xl 2xl:text-7xl">
                    Discover
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                      delicious foods
                    </span>
                  </h1>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-4xl font-bold text-secondary xl:text-5xl 2xl:text-6xl">
                    and experiences from people around the world.
                  </h2>
 
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Form with elegant styling */}
          <div className="w-[480px]">
            <div className="rounded-3xl border border-border/50 bg-surface/95 backdrop-blur-sm p-10 shadow-2xl xl:p-12">
              <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-text-primary xl:text-4xl">
                  Welcome Back
                </h1>
                <p className="mt-3 text-text-secondary xl:text-lg">
                  Sign in to continue your culinary journey
                </p>
              </div>

              {error && (
                <div className="mb-8 rounded-xl border border-error/20 bg-error/10 p-4 text-sm text-error backdrop-blur-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-7">
                <div>
                  <label className="mb-3 block text-sm font-semibold text-text-primary xl:text-base">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-xl border-2 border-border/50 bg-surface px-5 py-4 text-text-primary placeholder-text-tertiary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 disabled:opacity-50 xl:py-4.5 xl:text-base"
                    placeholder="Enter your email or username"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-text-primary xl:text-base">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border-2 border-border/50 bg-surface px-5 py-4 pr-14 text-text-primary placeholder-text-tertiary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 disabled:opacity-50 xl:py-4.5 xl:text-base"
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-primary transition-transform p-2 disabled:opacity-50 hover:scale-110 active:scale-95 transition-transform"
                      disabled={loading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 text-sm text-text-secondary xl:text-base cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer sr-only"
                        disabled={loading}
                      />
                      <div className="h-5 w-5 rounded border-2 border-border/50 peer-checked:border-primary peer-checked:bg-primary group-hover:border-primary/50 transition-all duration-200 flex items-center justify-center">
                        {rememberMe && (
                          <div className="h-2.5 w-2.5 rounded-sm bg-white"></div>
                        )}
                      </div>
                    </div>
                    <span className="group-hover:text-text-primary transition-colors">Remember me</span>
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary-dark hover:underline transition-colors xl:text-base"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/90 py-4 text-lg font-semibold text-white hover:from-primary-dark hover:to-primary/80 disabled:opacity-50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl xl:py-4.5 xl:text-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="mr-3 h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/30"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-surface px-4 text-sm text-text-tertiary/70 xl:text-base">or continue with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Google login would go here')}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-4 rounded-xl border-2 border-border/50 bg-white py-3.5 text-base font-semibold text-text-primary hover:bg-surface-hover disabled:opacity-50 transition-all duration-300 hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98] xl:py-4 xl:text-lg"
                >
                  <FaGoogle className="text-[#4285F4]" size={22} />
                  Continue with Google
                </button>

                <div className="pt-8 text-center border-t border-border/30">
                  <p className="text-text-secondary xl:text-lg">
                    Don't have an account?{' '}
                    <Link
                      href="/auth/register"
                      className="font-semibold text-primary hover:text-primary-dark hover:underline transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout - Single centered column */}
        <div className="w-full max-w-lg lg:hidden">
          {/* Logo with padding */}
          <div className=" flex justify-center">
            <div className="relative h-[140px] w-[140px] sm:h-[160px] sm:w-[160px]">
              <Image
                src="/tpgreenlogo.png"
                alt="Craveo Logo"
                fill
                className="object-contain drop-shadow-lg"
                priority
                sizes="(max-width: 768px) 160px"
              />
            </div>
          </div>

          {/* Hero Text for Mobile */}
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-medium text-text-primary sm:text-4xl">
              Discover delicious foods 
              <span className="block font-medium text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                 and experiences from around the world
              </span>
            </h1>
          </div>

          {/* Form Container */}
          <div className="rounded-3xl border border-border/50 bg-surface p-8 shadow-2xl sm:p-10">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
                Welcome Back
              </h1>
              <p className="mt-2 text-text-secondary sm:text-lg">
                Sign in to continue
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-error/20 bg-error/10 p-3 text-xs text-error sm:text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
              <div>
                <label className="mb-2 block text-sm font-semibold text-text-primary sm:text-base">
                  Email or Username
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full rounded-xl border-2 border-border/50 bg-surface px-4 py-3.5 text-sm text-text-primary placeholder-text-tertiary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 sm:py-4 sm:text-base"
                  placeholder="Enter your email or username"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-text-primary sm:text-base">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border-2 border-border/50 bg-surface px-4 py-3.5 pr-12 text-sm text-text-primary placeholder-text-tertiary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 sm:py-4 sm:text-base"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-primary transition-colors p-1.5 disabled:opacity-50 hover:scale-110 active:scale-95 transition-transform"
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer group sm:text-sm">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                      disabled={loading}
                    />
                    <div className="h-4 w-4 rounded border border-border/50 peer-checked:border-primary peer-checked:bg-primary group-hover:border-primary/50 transition-all duration-200 flex items-center justify-center sm:h-4.5 sm:w-4.5">
                      {rememberMe && (
                        <div className="h-2 w-2 rounded-sm bg-white"></div>
                      )}
                    </div>
                  </div>
                  <span className="group-hover:text-text-primary transition-colors">Remember me</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-primary hover:text-primary-dark hover:underline transition-colors sm:text-sm"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/90 py-3.5 text-base font-semibold text-white hover:from-primary-dark hover:to-primary/80 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl sm:py-4 sm:text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-surface px-3 text-xs text-text-tertiary/70 sm:text-sm">or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert('Google login would go here')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-border/50 bg-white py-3 text-sm font-semibold text-text-primary hover:bg-surface-hover disabled:opacity-50 transition-all duration-200 hover:border-primary/30 hover:scale-[1.02] active:scale-[0.98] sm:py-3.5 sm:text-base"
              >
                <FaGoogle className="text-[#4285F4]" size={18} />
                Continue with Google
              </button>

              <div className="pt-6 text-center border-t border-border/30">
                <p className="text-xs text-text-secondary sm:text-sm">
                  Don't have an account?{' '}
                  <Link
                    href="/auth/register"
                    className="font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
}