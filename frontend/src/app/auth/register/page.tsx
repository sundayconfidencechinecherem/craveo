// src/app/auth/register/page.tsx - OPTIMIZED SINGLE VERSION
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaGoogle } from 'react-icons/fa';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, isAuthenticated, isLoading } = useAuth();
  
  const queryRedirect = searchParams.get('redirect');
  const redirectPath = queryRedirect || '/';
  const [isClient, setIsClient] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: '',
    agreeToTerms: false
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && isAuthenticated && !isLoading) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, router, redirectPath, isClient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: formData.fullName,
        username: formData.username,
        dateOfBirth: formData.dob || undefined
      });

      if (result.success) {
        router.push(redirectPath);
        router.refresh();
      } else {
        throw new Error(result.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const LoadingSpinner = () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
  );

  if (!isClient || isLoading) {
    return <LoadingSpinner />;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-surface">
      <div className="container mx-auto flex min-h-screen items-center justify-center p-4 lg:items-stretch">
        
        {/* Branding Panel - Desktop only */}
        <div className="hidden flex-1 flex-col justify-center lg:flex">
          <div className="max-w-xl">
            <div className="relative mb-12 h-[400px]">
              <Image
                src="/craveologo.png"
                alt="Craveo Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            
            <h1 className="text-4xl font-black leading-tight xl:text-5xl">
              <span className="block text-foreground">Join our community</span>
              <span className="mt-4 block text-primary">of food lovers</span>
              <span className="block text-foreground">and share your culinary adventures.</span>
            </h1>
          </div>
        </div>

        {/* Form Panel - All screens */}
        <div className="flex w-full max-w-md flex-col justify-center">
          <div className="rounded-2xl border border-border bg-surface p-8 shadow-2xl">
            
            {/* Logo - Mobile only */}
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="relative h-[150px] w-[150px]">
                <Image
                  src="/craveologo.png"
                  alt="Craveo Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-foreground lg:text-3xl">
                Join Craveo
              </h1>
              <p className="mt-2 text-muted">
                Create your account and start discovering delicious foods.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-4 text-sm text-error">
                <strong>Error:</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { 
                  label: 'Full Name *', 
                  name: 'fullName', 
                  type: 'text', 
                  placeholder: 'Enter your full name' 
                },
                { 
                  label: 'Username *', 
                  name: 'username', 
                  type: 'text', 
                  placeholder: 'Choose a username' 
                },
                { 
                  label: 'Email *', 
                  name: 'email', 
                  type: 'email', 
                  placeholder: 'Enter your email' 
                },
                { 
                  label: 'Password *', 
                  name: 'password', 
                  type: 'password', 
                  placeholder: 'Create a password (min 6 characters)' 
                },
                { 
                  label: 'Confirm Password *', 
                  name: 'confirmPassword', 
                  type: 'password', 
                  placeholder: 'Confirm your password' 
                }
              ].map((field) => (
                <div key={field.name}>
                  <label className="mb-2 block text-sm font-semibold">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData] as string}
                    onChange={handleChange}
                    className={`w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${
                      formErrors[field.name] 
                        ? 'border-error bg-error/5' 
                        : 'border-border bg-surface'
                    }`}
                    placeholder={field.placeholder}
                    disabled={loading}
                  />
                  {formErrors[field.name] && (
                    <p className="mt-1 text-xs text-error">{formErrors[field.name]}</p>
                  )}
                </div>
              ))}

              {/* Date of Birth */}
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-muted">
                  This will not be shown publicly. Confirm your own age.
                </p>
              </div>

              {/* Terms Agreement */}
              <div className="space-y-1">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`mt-1 h-4 w-4 rounded border text-primary focus:ring-primary disabled:opacity-50 ${
                      formErrors.agreeToTerms ? 'border-error' : 'border-border'
                    }`}
                    disabled={loading}
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 text-sm text-muted">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                    ,{' '}
                    <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    {' '}and{' '}
                    <Link href="/cookies" className="text-primary hover:underline">Cookie Use</Link>.
                  </label>
                </div>
                {formErrors.agreeToTerms && (
                  <p className="ml-6 text-xs text-error">{formErrors.agreeToTerms}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-lg bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Creating account...
                  </span>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface px-4 text-sm text-muted">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert('Google registration would go here')}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 font-semibold hover:bg-gray-50 disabled:opacity-50"
            >
              <FaGoogle className="text-green-500" />
              Continue with Google
            </button>

            <div className="pt-6 text-center">
              <p className="text-muted">
                Already have an account?{' '}
                <Link
                  href="/auth/login"
                  className="font-semibold text-primary hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Single Footer */}
          <div className="mt-8 text-center lg:mt-12">
            <p className="text-xs text-muted">
              © 2026 Craveo All Rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}