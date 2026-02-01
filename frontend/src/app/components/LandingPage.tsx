
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FaGoogle, FaApple } from 'react-icons/fa';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-app-bg via-surface to-surface">
      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen">
        {/* Left Column */}
        <div className="flex-1 flex items-center justify-center px-12 xl:px-20">

          <div className="max-w-2xl -mt-[200px]">
            {/* Logo*/}
            <div className="relative w-[400px] h-[400px] mx-auto">
              <Image
                src="/craveologo.png"
                alt="Craveo Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
           
             {/* Hero Text */}
            <div className="space-y-8 text-left">
              <h1 className="text-4xl xl:text-5xl font-black text-text-primary leading-tight">
                Discover delicious foods  
                <p className="block text-primary mt-4 ">and experiences</p>
                from people around the world.
              </h1>
            </div>

          </div>

            {/* Desktop Footer */}
            <div className="absolute bottom-8 left-12 right-12">
             
              <p className="text-text-tertiary text-sm text-center">
                © 2026 Craveo All Rights reserved.
              </p>
            </div>
        </div>

        {/* Right Column - Auth Form */}
        <div className="flex-1 flex items-center justify-center px-12 xl:px-20">
          <div className="w-full max-w-md">
            <div className="bg-surface border border-border rounded-lg p-10 shadow-2xl">
              <h2 className="text-4xl font-black text-primary  text-center leading-tight mb-4">  Join Craveo </h2>
              <p className="text-base text-black mb-4 " >Join to see what’s happening in the world of food right now.</p>
              
              {/* Google Login */}
              <Link href="/auth/login?provider=google" className="block mb-5">
                <button className="w-full bg-white border-2 border-border hover:bg-gray-50 text-text-primary font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-4 transition-all text-lg shadow-sm hover:shadow-md">
                  <FaGoogle className="text-green-500 text-2xl" />
                  <span>Continue with Google</span>
                </button>
              </Link>

              {/* Divider */}
              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 bg-surface text-text-secondary text-lg font-medium">or</span>
                </div>
              </div>

              {/* Create Account Button */}
              <Link href="/auth/register" className="block mb-8">
                <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-lg transition-all text-xl shadow-lg hover:shadow-xl">
                  Create Account
                </button>
              </Link>

              {/* Terms Text */}
              <p className="text-sm text-text-tertiary text-center mb-8 leading-relaxed">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline font-medium">Terms</Link>
                ,{' '}
                <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                {' '}and{' '}
                <Link href="/cookies" className="text-primary hover:underline font-medium">Cookie Use</Link>.
              </p>

              {/* Sign In Section */}
              <div>
                <p className="text-center text-text-secondary text-lg mb-6"> Already have an account?  <Link className=" text-primary font-bold transition-all text-lg" href="/auth/login">  Sign In </Link> </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tablet Layout */}
      <div className="hidden md:flex lg:hidden min-h-screen flex-col items-center justify-center px-8">
        {/* Logo  */}
        <div className="mb-12">
          <div className="relative w-[300px] h-[300px] mx-auto">
            <Image
              src="/craveologo.png"
              alt="Craveo Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          {/* Tablet Hero Text */}
          <div className="text-center mt-10 space-y-6 max-w-2xl">
            <h1 className="text-5xl font-black text-primary leading-tight">Join Craveo
              <span className="block text-text-primary text-3xl  mt-3 mb-10">
                Discover delicious foods and experiences from people around the world.
              </span>
            </h1>
            
            <div>
              {/* Google Login */}
              <Link href="/auth/login?provider=google" className="block mb-4">
                <button className="w-full bg-white border-2 border-border hover:bg-gray-50 text-text-primary font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-3 transition-all text-base shadow-sm">
                  <FaGoogle className="text-green-500 text-xl" />
                  <span>Continue with Google</span>
                </button>
              </Link>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-surface text-text-secondary font-medium">or</span>
                </div>
              </div>

              {/* Create Account Button */}
              <Link href="/auth/register" className="block mb-6">
                <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-all text-lg shadow-lg">
                  Create Account
                </button>
              </Link>

              {/* Terms Text */}
              <p className="text-xs text-text-tertiary text-center mb-6 leading-relaxed">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline font-medium">Terms</Link>
                ,{' '}
                <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                {' '}and{' '}
                <Link href="/cookies" className="text-primary hover:underline font-medium">Cookie Use</Link>.
              </p>

              {/* Sign In Section */}
              <div>
                <p className="text-center text-text-secondary mb-4">
                  Already have an account? <Link className=" text-primary  transition-all" href="/auth/login"> Sign In  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tablet Footer */}
        <div className="mt-10 text-center">
         
          <p className="text-text-tertiary text-sm">
            © 2026 Craveo All Rights reserved.
          </p>
        </div>
      </div>

      {/* Mobile Layout  */}
      <div className="md:hidden min-h-screen flex flex-col items-center justify-center px-6 py-8">
        {/* Logo */}
        <div className="mb-10">
          <div className="relative w-[200px] h-[200px] mx-auto">
            <Image
              src="/craveologo.png"
              alt="Craveo Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          {/* Mobile Hero Text */}
          <div className="text-center space-y-8 max-w-md">
            <h1 className="text-4xl font-black text-primary leading-tight">
              Join Craveo
              <p className="block text-text-primary text-base mt-3">
                Discover delicious foods and experiences from people around the world.
              </p>
            </h1>
            
            <div className="space-y-6">
              {/* Google Login */}
              <Link href="/auth/login?provider=google" className="block">
                <button className="w-full bg-white border-2 border-border hover:bg-gray-50 text-text-primary font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 transition-all text-base shadow-sm">
                  <FaGoogle className="text-green-500 text-xl" />
                  <span>Continue with Google</span>
                </button>
              </Link>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-app-bg text-text-secondary font-medium">or</span>
                </div>
              </div>

              {/* Create Account Button */}
              <Link href="/auth/register" className="block">
                <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-lg transition-all text-lg shadow-lg">
                  Create Account
                </button>
              </Link>

              {/* Terms Text */}
              <p className="text-xs text-text-tertiary text-center leading-relaxed">
                By signing up, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline font-medium">Terms</Link>
                ,{' '}
                <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                {' '}and{' '}
                <Link href="/cookies" className="text-primary hover:underline font-medium">Cookie Use</Link>.
              </p>

              {/* Mobile Sign In Section  */}
              <div >
                <p className="text-center text-text-secondary mb-3">
                  Already have an account? <Link   href="/auth/login"  className="text-primary hover:underline font-medium text-lg"  > Sign In </Link> </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="text-center">
          <p className="text-text-tertiary text-xs">
            © 2026 Craveo All Rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}