// app/layout.tsx - WITH PROPER POSITIONING
'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import ApolloProvider from './providers/ApolloProvider';
import Navbar from './components/Navbar';
import InstallPrompt from './components/pwa/InstallPrompt';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <title>Craveo</title>
        <meta name="description" content="Share and discover delicious food creations from people around the world" />
        <meta name="theme-color" content="#FF6B35" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.className} h-full`}>
        <ApolloProvider>
          <AuthProvider>
            {/* Global Navbar - Will appear on ALL pages */}
            <Navbar />
            
            {/* Main content with proper offset */}
            <main className="min-h-screen lg:ml-64">
              {children}
            </main>
            
            <InstallPrompt />
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}