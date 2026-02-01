// app/components/Navbar.tsx - WITH ACTIVE STATES & HOVER EFFECTS
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaSearch, FaPlus, FaHome, FaCompass, FaUser, FaBell, FaBars, FaTimes, FaSignOutAlt, FaBookmark } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  if (!isAuthenticated) {
    return null;
  }

  // Desktop navigation with active state detection
  const navItems = [
    { id: 'home', label: 'Home', icon: FaHome, href: '/' },
    { id: 'explore', label: 'Explore', icon: FaCompass, href: '/explore' },
    { id: 'notifications', label: 'Notifications', icon: FaBell, href: '/notifications' },
    { id: 'saved', label: 'Saved', icon: FaBookmark, href: '/saved' },
    { id: 'profile', label: 'Profile', icon: FaUser, href: '/profile' },
  ];

  // Check if item is active
  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-surface lg:block">
        <div className="flex h-full flex-col p-4">
          {/* Logo */}
          <div className="mb-8 px-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-10 w-32">
                <Image 
                  src="/craveologo.png" 
                  alt="Craveo Logo" 
                  fill 
                  className="object-contain" 
                  priority 
                />
              </div>
            </Link>
          </div>

          {/* Navigation with active states */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-200 ${
                    active
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  <Icon className="text-xl" />
                  <span className="text-lg">{item.label}</span>
                  {active && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Create Post Button */}
          <div className="mt-8 px-2">
            <Link href="/create-post">
              <button className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-lg font-semibold text-white transition-all duration-200 hover:bg-primary-dark hover:shadow-lg">
                <FaPlus />
                <span>Create</span>
              </button>
            </Link>
          </div>

          {/* User Profile */}
          {user && (
            <div className="mt-auto border-t border-border pt-4">
              <div className="flex items-center gap-3 rounded-lg p-3 transition-all duration-200 hover:bg-surface-hover">
                <div className={`h-10 w-10 rounded-full ${
                  isActive('/profile') ? 'border-2 border-primary' : ''
                }`}>
                  <div className="h-full w-full rounded-full bg-primary/20"></div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-text-primary">{user.fullName || user.username}</p>
                  <p className="text-sm text-text-secondary">@{user.username}</p>
                </div>
                <button
                  onClick={logout}
                  className="rounded-lg p-2 text-text-secondary transition-all duration-200 hover:bg-surface-hover hover:text-text-primary"
                  title="Logout"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border bg-surface lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-16 w-16">
              <Image 
                src="/craveologo.png" 
                alt="Craveo Logo" 
                fill 
                className="object-contain" 
              />
            </div>
           
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            <Link 
              href="/notifications" 
              className={`rounded-lg p-2 transition-all duration-200 ${
                isActive('/notifications')
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              <FaBell className="text-xl" />
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2 text-text-secondary transition-all duration-200 hover:bg-surface-hover hover:text-text-primary"
            >
              {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation with active states */}
      <nav className="fixed bottom-0 z-40 w-full border-t border-border bg-surface/95 backdrop-blur-sm lg:hidden">
        <div className="flex h-16 items-center justify-around">
          <Link 
            href="/" 
            className={`flex flex-col items-center p-2 transition-all duration-200 ${
              isActive('/') ? 'text-primary' : 'text-text-secondary hover:text-primary'
            }`}
          >
            <div className={`p-1 ${isActive('/') ? 'rounded-full bg-primary/10' : ''}`}>
              <FaHome className="text-xl" />
            </div>
            <span className="mt-1 text-xs">Home</span>
          </Link>
          
          <Link 
            href="/explore" 
            className={`flex flex-col items-center p-2 transition-all duration-200 ${
              isActive('/explore') ? 'text-primary' : 'text-text-secondary hover:text-primary'
            }`}
          >
            <div className={`p-1 ${isActive('/explore') ? 'rounded-full bg-primary/10' : ''}`}>
              <FaCompass className="text-xl" />
            </div>
            <span className="mt-1 text-xs">Explore</span>
          </Link>
          
          <Link 
            href="/create-post" 
            className="-mt-6"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-dark shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl">
              <FaPlus className="text-xl text-white" />
            </div>
          </Link>
          
          <Link 
            href="/saved" 
            className={`flex flex-col items-center p-2 transition-all duration-200 ${
              isActive('/saved') ? 'text-primary' : 'text-text-secondary hover:text-primary'
            }`}
          >
            <div className={`p-1 ${isActive('/saved') ? 'rounded-full bg-primary/10' : ''}`}>
              <FaBookmark className="text-xl" />
            </div>
            <span className="mt-1 text-xs">Saved</span>
          </Link>
          
          <Link 
            href="/profile" 
            className={`flex flex-col items-center p-2 transition-all duration-200 ${
              isActive('/profile') ? 'text-primary' : 'text-text-secondary hover:text-primary'
            }`}
          >
            <div className={`p-1 ${isActive('/profile') ? 'rounded-full bg-primary/10' : ''}`}>
              <div className={`h-6 w-6 rounded-full ${
                isActive('/profile') ? 'border-2 border-primary' : ''
              }`}>
                <div className="h-full w-full rounded-full bg-primary/20"></div>
              </div>
            </div>
            <span className="mt-1 text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}