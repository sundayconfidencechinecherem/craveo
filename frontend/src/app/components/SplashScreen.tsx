'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(1); 
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
   
    const phase1Timer = setTimeout(() => {
      setPhase(2);
    }, 1000); 

    
    const phase2Timer = setTimeout(() => {
      setFadeOut(true);
    }, 2500); 

    
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000); 

    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-500 ${
      fadeOut ? 'opacity-0' : 'opacity-100'
    } ${phase === 1 ? 'bg-app-bg' : 'bg-primary'}`}>
    
      {phase === 1 && (
        <div className="text-center">
        
          <div className="relative w-40 h-40 mx-auto mb-4">
            <Image
              src="/logo.png"
              alt="Craveo Logo"
              fill
              className="object-contain animate-scale-in"
              priority
              sizes="160px"
            />
          </div>
          
          <div className="flex justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-slow"></div>
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-slow delay-100"></div>
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse-slow delay-200"></div>
          </div>
        </div>
      )}

      
      {phase === 2 && (
        <div className="text-center animate-fade-in-up">
          <div className="relative w-36 h-36 mx-auto mb-6">
            <Image
              src="/tpwhitelogo.png"
              alt="Craveo"
              fill
              className="object-contain"
              priority
              sizes="144px"
            />
          </div>
          <p className="text-white/80">Discover foods worth craving</p>
        </div>
      )}
    </div>
  );
}