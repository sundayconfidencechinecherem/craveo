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
    <div className="flex min-h-screen items-center justify-center bg-background">
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
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen items-center justify-center px-4 py-8 lg:px-8">
        
        {/* Desktop Layout - Side by side */}
        <div className="hidden w-full max-w-6xl lg:flex lg:gap-12 xl:gap-16 2xl:gap-20">
          {/* Left Panel - Logo + Hero Text */}
          <div className="flex-1 flex flex-col justify-start max-w-lg relative">
            {/* Logo */}
            <div className="mb-8 flex justify-center relative top-12">
              <div className="relative h-[240px] w-[240px] xl:h-[260px] xl:w-[260px] 2xl:h-[280px] 2xl:w-[280px]">
                <Image
                  src="/tpgreenlogo.png"
                  alt="Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 1536px) 260px, 280px"
                />
              </div>
            </div>

            {/* Hero Text */}
            <div className="space-y-4 xl:space-y-6 mt-6">
              <h1 className="text-4xl font-black leading-tight text-text-primary xl:text-5xl 2xl:text-6xl">
                Join our community of food lovers
              </h1>
              <h2 className="text-3xl font-black leading-tight text-primary xl:text-4xl 2xl:text-5xl">
                and share your culinary adventures.
              </h2>
            </div>
          </div>

          {/* Right Panel - Form */}
          <div className="flex-1 max-h-[90vh] overflow-y-auto">
            <div className="rounded-2xl border border-border bg-surface p-8 shadow-xl xl:p-10">
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-text-primary xl:text-3xl">
                  Join Craveo
                </h1>
                <p className="mt-2 text-text-secondary xl:text-lg">
                  Create your account and start discovering delicious foods.
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-lg border border-error/20 bg-error/10 p-4 text-sm text-error">
                  <strong>Error:</strong> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Form Fields */}
                {[
                  { label: 'Full Name *', name: 'fullName', type: 'text', placeholder: 'Enter your full name' },
                  { label: 'Username *', name: 'username', type: 'text', placeholder: 'Choose a username (min 3 chars)' },
                  { label: 'Email *', name: 'email', type: 'email', placeholder: 'Enter your email' },
                  { label: 'Password *', name: 'password', type: 'password', placeholder: 'Create a password (min 6 characters)' },
                  { label: 'Confirm Password *', name: 'confirmPassword', type: 'password', placeholder: 'Confirm your password' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="mb-2 block text-sm font-semibold text-text-primary xl:text-base">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData] as string}
                      onChange={handleChange}
                      className={`w-full rounded-lg border px-4 py-3 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:opacity-50 xl:py-3.5 xl:text-base ${
                        formErrors[field.name] ? 'border-error bg-error/5' : 'border-border bg-surface'
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
                  <label className="mb-2 block text-sm font-semibold text-text-primary xl:text-base">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:opacity-50 xl:py-3.5 xl:text-base"
                    disabled={loading}
                  />
                  <p className="mt-1 text-xs text-text-secondary">
                    This will not be shown publicly. Confirm your own age.
                  </p>
                </div>

                {/* Terms */}
                <div className="space-y-1">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className={`mt-1 h-4 w-4 rounded border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer disabled:opacity-50 xl:h-5 xl:w-5 ${
                        formErrors.agreeToTerms ? 'border-error' : 'border-border'
                      }`}
                      disabled={loading}
                    />
                    <label htmlFor="agreeToTerms" className="ml-2 text-sm text-text-secondary xl:text-base">
                      I agree to the{' '}
                      <Link href="/terms" className="text-primary hover:text-primary-dark hover:underline transition-colors">Terms of Service</Link>
                      ,{' '}
                      <Link href="/privacy" className="text-primary hover:text-primary-dark hover:underline transition-colors">Privacy Policy</Link>
                      {' '}and{' '}
                      <Link href="/cookies" className="text-primary hover:text-primary-dark hover:underline transition-colors">Cookie Use</Link>.
                    </label>
                  </div>
                  {formErrors.agreeToTerms && (
                    <p className="ml-6 text-xs text-error">{formErrors.agreeToTerms}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-4 w-full rounded-lg bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 xl:py-3.5 xl:text-lg"
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
                  <span className="bg-surface px-4 text-sm text-text-tertiary xl:text-base">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert('Google registration would go here')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white py-3 font-semibold text-text-primary hover:bg-surface-hover disabled:opacity-50 transition-all duration-200 hover:border-primary/30 xl:py-3.5 xl:text-lg"
              >
                <FaGoogle className="text-[#4285F4]" size={20} />
                Continue with Google
              </button>

              <div className="pt-6 text-center">
                <p className="text-text-secondary xl:text-lg">
                  Already have an account?{' '}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout - Single column */}
        <div className="w-full  lg:hidden">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative h-[120px] w-[120px] sm:h-[140px] sm:w-[140px] md:h-[160px] md:w-[160px]">
              <Image
                src="/tpgreenlogo.png"
                alt="Craveo Logo"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 140px, 160px"
              />
            </div>
          </div>

          {/* Form Container */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-xl font-bold text-text-primary sm:text-2xl md:text-3xl">
                Join Craveo
              </h1>
              <p className="mt-2 text-sm text-text-secondary sm:text-base md:text-lg">
                Create your account and start discovering delicious foods.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-error/20 bg-error/10 p-3 text-xs text-error sm:text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {[
                { label: 'Full Name *', name: 'fullName', type: 'text', placeholder: 'Enter your full name' },
                { label: 'Username *', name: 'username', type: 'text', placeholder: 'Choose a username (min 3 chars)' },
                { label: 'Email *', name: 'email', type: 'email', placeholder: 'Enter your email' },
                { label: 'Password *', name: 'password', type: 'password', placeholder: 'Create a password (min 6 characters)' },
                { label: 'Confirm Password *', name: 'confirmPassword', type: 'password', placeholder: 'Confirm your password' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="mb-1 block text-sm font-semibold text-text-primary sm:text-base">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name as keyof typeof formData] as string}
                    onChange={handleChange}
                    className={`w-full rounded-lg border px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:opacity-50 sm:py-3 sm:text-base ${
                      formErrors[field.name] ? 'border-error bg-error/5' : 'border-border bg-surface'
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
                <label className="mb-1 block text-sm font-semibold text-text-primary sm:text-base">
                  Date of Birth (Optional)
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 disabled:opacity-50 sm:py-3 sm:text-base"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-text-secondary">
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
                    className={`mt-1 h-3 w-3 rounded border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 transition-all cursor-pointer disabled:opacity-50 sm:h-4 sm:w-4 ${
                      formErrors.agreeToTerms ? 'border-error' : 'border-border'
                    }`}
                    disabled={loading}
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 text-xs text-text-secondary sm:text-sm">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:text-primary-dark hover:underline transition-colors">Terms of Service</Link>
                    ,{' '}
                    <Link href="/privacy" className="text-primary hover:text-primary-dark hover:underline transition-colors">Privacy Policy</Link>
                    {' '}and{' '}
                    <Link href="/cookies" className="text-primary hover:text-primary-dark hover:underline transition-colors">Cookie Use</Link>.
                  </label>
                </div>
                {formErrors.agreeToTerms && (
                  <p className="ml-6 text-xs text-error">{formErrors.agreeToTerms}</p>)}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full rounded-lg bg-primary py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-50 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 xl:py-3.5 xl:text-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                    Creating account...
                  </span>
                ) : 'Sign Up'}
              </button>

              {/* OR Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-surface px-4 text-sm text-text-tertiary xl:text-base">or</span>
                </div>
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={() => alert('Google registration would go here')}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white py-3 font-semibold text-text-primary hover:bg-surface-hover disabled:opacity-50 transition-all duration-200 hover:border-primary/30 xl:py-3.5 xl:text-lg"
              >
                <FaGoogle className="text-[#4285F4]" size={20} />
                Continue with Google
              </button>

              {/* Sign in link */}
              <div className="pt-6 text-center">
                <p className="text-text-secondary xl:text-lg">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="font-semibold text-primary hover:text-primary-dark hover:underline transition-colors">
                    Sign In
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
