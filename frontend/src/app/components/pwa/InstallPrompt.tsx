import { useState, useEffect } from 'react';
import { FaDownload, FaTimes, FaChrome, FaSafari, FaFirefox, FaEdge, FaShare } from 'react-icons/fa';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
   
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsStandalone(true);
      return;
    }

    // Check for iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      setShowPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Show prompt after delay if installable
    const timer = setTimeout(() => {
      if (isInstallable) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(timer);
    };
  }, [isInstallable]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Don't show if already standalone or recently dismissed
  if (isStandalone || !showPrompt) return null;

  // Check if recently dismissed
  const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
  if (dismissedTime) {
    const timeSinceDismissal = Date.now() - parseInt(dismissedTime);
    if (timeSinceDismissal < 7 * 24 * 60 * 60 * 1000) { // 7 days
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {isIOS ? (
        // iOS installation instructions
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center">
              <FaSafari className="text-blue-500 text-xl mr-2" />
              <h3 className="font-bold text-gray-900">Install Craveo</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            For the best experience, install Craveo to your home screen:
          </p>
          <ol className="text-sm text-gray-700 space-y-2 mb-4">
            <li className="flex items-start">
              <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">1</span>
              Tap the <FaShare className="inline mx-1" /> Share button
            </li>
            <li className="flex items-start">
              <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">2</span>
              Scroll down and tap &quot;Add to Home Screen&quot;
            </li>
            <li className="flex items-start">
              <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5 flex-shrink-0">3</span>
              Tap &quot;Add&quot; in the top right
            </li>
          </ol>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleDismiss}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Remind me later
            </button>
          </div>
        </div>
      ) : (
        // Standard PWA install prompt
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg shadow-xl p-4 text-white">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              <FaDownload className="text-xl mr-2" />
              <h3 className="font-bold">Install Craveo App</h3>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-sm text-white/90 mb-3">
            Install Craveo for a faster, better experience with offline access.
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-xs">
              {typeof navigator !== 'undefined' && (
                <>
                  {navigator.userAgent.includes('Chrome') && <FaChrome title="Chrome" />}
                  {navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') && <FaSafari title="Safari" />}
                  {navigator.userAgent.includes('Firefox') && <FaFirefox title="Firefox" />}
                  {navigator.userAgent.includes('Edg') && <FaEdge title="Edge" />}
                </>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleDismiss}
                className="px-3 py-1 text-sm bg-white/20 hover:bg-white/30 rounded"
              >
                Not now
              </button>
              <button
                onClick={handleInstallClick}
                className="px-3 py-1 text-sm bg-white text-primary hover:bg-gray-100 rounded font-medium"
              >
                Install
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
