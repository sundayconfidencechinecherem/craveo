// app/components/Navbar.tsx - FIXED VERSION WITH ACTUAL USER AVATAR
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaPlus, FaHome, FaCompass, FaUser, FaBell, FaBars, FaTimes, FaSignOutAlt, FaBookmark, FaCog } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

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

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      //console.error('Logout failed:', error);
    } finally {
      setShowLogoutConfirm(false);
    }
  };

  // Render user avatar with fallback
  const renderUserAvatar = (size: 'sm' | 'md' | 'lg' = 'md', showBorder = false) => {
    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    };

    const borderClass = showBorder ? 'border-2 border-primary shadow-sm' : '';

    if (user?.avatar) {
      return (
        <div className={`relative ${sizeClasses[size]} overflow-hidden rounded-full ${borderClass}`}>
          <Image
            src={user.avatar}
            alt={user.fullName || user.username}
            fill
            sizes="(max-width: 768px) 48px, 64px"
            className="object-cover"
            priority={size === 'lg'}
          />
        </div>
      );
    }

    // Fallback avatar with initials
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/40 ${sizeClasses[size]} ${borderClass}`}
      >
        <span className="font-semibold text-primary">
          {(user?.fullName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
        </span>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-border bg-surface lg:block">
        <div className="flex h-full flex-col p-4">
          {/* Logo */}
          <div className="mb-8 px-2">
            <Link href="/" className="group flex items-center gap-2 transition-opacity hover:opacity-90">
              <div className="relative h-10 w-32">
                <Image
                  src="/craveologo.png"
                  alt="Craveo Logo"
                  fill
                  className="object-contain"
                  priority
                  sizes="256px"
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
                  className={`group flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-200 ${
                    active
                      ? 'bg-primary/10 text-primary font-semibold shadow-sm'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary hover:shadow-sm'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  <Icon
                    className={`text-xl transition-transform group-hover:scale-110 ${
                      active && 'text-primary'
                    }`}
                  />
                  <span className="text-lg transition-colors">{item.label}</span>
                  {active && (
                    <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Create Post Button */}
          <div className="mt-8 px-2">
            <Link href="/create-post">
              <button className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-primary-dark py-3 text-lg font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95">
                <FaPlus className="transition-transform group-hover:rotate-90" />
                <span>Create</span>
              </button>
            </Link>
          </div>

          {/* User Profile - FIXED: Now shows actual avatar */}
          {user && (
            <div className="mt-auto border-t border-border pt-4">
              <div className="group relative rounded-lg p-3 transition-all duration-200 hover:bg-surface-hover">
                <Link
                  href={'/profile'}
                  className="flex items-center gap-3"
                >
                  {renderUserAvatar('md', isActive('/profile'))}
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate font-semibold text-text-primary group-hover:text-primary">
                      {user.fullName || user.username}
                    </p>
                    <p className="truncate text-sm text-text-secondary">@{user.username}</p>
                  </div>
                </Link>

                {/* Settings & Logout Dropdown */}
                <div className="absolute -top-12 right-0 hidden group-hover:block">
                  <div className="rounded-lg border border-border bg-surface p-2 shadow-lg">
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                    >
                      <FaCog />
                      Settings
                    </Link>
                    <button
                      onClick={() => setShowLogoutConfirm(true)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-50"
                    >
                      <FaSignOutAlt />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="fixed top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-sm lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-8 w-8">
              <Image
                src="/craveologo.png"
                alt="Craveo Logo"
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            <span className="text-xl font-bold text-primary">Craveo</span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-3">
          
            <Link
              href="/notifications"
              className={`relative rounded-lg p-2 transition-all duration-200 ${
                isActive('/notifications')
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              <FaBell className="text-xl" />
              {/* Notification badge - uncomment if you have notifications
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gray-500 text-xs text-white"></span>
              */}
            </Link>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-lg p-2 text-text-secondary transition-all duration-200 hover:bg-surface-hover hover:text-text-primary"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? (
                <FaTimes className="text-xl transition-transform duration-300" />
              ) : (
                <FaBars className="text-xl transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Side Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <div className="fixed right-0 top-0 z-50 h-screen w-64 border-l border-border bg-surface shadow-xl lg:hidden">
            <div className="flex h-full flex-col p-4">
              {/* Menu Header */}
              <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
                <span className="text-lg font-semibold text-text-primary">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg p-2 text-text-secondary hover:bg-surface-hover"
                  aria-label="Close menu"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* User Info - FIXED: Shows actual avatar */}
              {user && (
                <Link
                  href={'/profile'}
                  className="mb-6 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-surface-hover"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {renderUserAvatar('lg', true)}
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-lg font-bold text-text-primary">
                      {user.fullName || user.username}
                    </p>
                    <p className="truncate text-sm text-text-secondary">@{user.username}</p>
                  </div>
                </Link>
              )}

              {/* Mobile Navigation */}
              <nav className="flex-1 space-y-1">
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
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon className="text-xl" />
                      <span className="text-lg">{item.label}</span>
                      {active && (
                        <div className="ml-auto h-2 w-2 animate-pulse rounded-full bg-primary"></div>
                      )}
                    </Link>
                  );
                })}

                {/* Additional Mobile Links */}
                <Link
                  href="/settings"
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 transition-all duration-200 ${
                    isActive('/settings')
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaCog className="text-xl" />
                  <span className="text-lg">Settings</span>
                </Link>
              </nav>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 py-3 text-gray-600 transition-colors hover:bg-gray-100"
              >
                <FaSignOutAlt />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation - FIXED: Now shows actual avatar */}
      <nav className="fixed bottom-0 z-40 w-full border-t border-border bg-surface/95 backdrop-blur-sm lg:hidden">
        <div className="flex h-16 items-center justify-around">
          <Link 
            href="/" 
            className={`flex flex-col items-center p-2 transition-all duration-200 ${
              isActive('/') ? 'text-primary' : 'text-text-secondary hover:text-primary'
            }`}
          >
            <div className={`p-1 transition-transform ${isActive('/') ? 'rounded-full bg-primary/10 scale-110' : ''}`}>
              <FaHome className="text-xl" />
            </div>
            <span className="mt-1 text-xs font-medium">Home</span>
          </Link>
          
          <Link 
            href="/explore" 
            className={`flex flex-col items-center p-2 transition-all duration-200 ${
              isActive('/explore') ? 'text-primary' : 'text-text-secondary hover:text-primary'
            }`}
          >
            <div className={`p-1 transition-transform ${isActive('/explore') ? 'rounded-full bg-primary/10 scale-110' : ''}`}>
              <FaCompass className="text-xl" />
            </div>
            <span className="mt-1 text-xs font-medium">Explore</span>
          </Link>
          
          <Link 
            href="/create-post" 
            className="-mt-6"
          >
            <div className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary-dark shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95">
              <FaPlus className="text-xl text-white transition-transform group-hover:rotate-90" />
            </div>
          </Link>
          
          <Link 
            href="/saved" 
            className={`flex flex-col items-center p-2 transition-all duration-200 ${
              isActive('/saved') ? 'text-primary' : 'text-text-secondary hover:text-primary'
            }`}
          >
            <div className={`p-1 transition-transform ${isActive('/saved') ? 'rounded-full bg-primary/10 scale-110' : ''}`}>
              <FaBookmark className="text-xl" />
            </div>
            <span className="mt-1 text-xs font-medium">Saved</span>
          </Link>
          
          {/* Profile Link - FIXED: Shows actual avatar */}
          <Link 
            href={'/profile'}
            className={`flex flex-col items-center p-2 transition-all duration-200 ${
              isActive('/profile') ? 'text-primary' : 'text-text-secondary hover:text-primary'
            }`}
          >
            <div className={`p-1 transition-transform ${isActive('/profile') ? 'rounded-full bg-primary/10 scale-110' : ''}`}>
              {renderUserAvatar('sm', isActive('/profile'))}
            </div>
            <span className="mt-1 text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50"
            onClick={() => setShowLogoutConfirm(false)}
            aria-hidden="true"
          />
          <div className="fixed left-1/2 top-1/2 z-[70] w-80 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-surface p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <FaSignOutAlt className="text-xl text-gray-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-text-primary">Logout</h3>
              <p className="mb-6 text-text-secondary">Are you sure you want to logout?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-lg border border-border py-2 font-medium transition-colors hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 rounded-lg bg-gray-600 py-2 font-medium text-white transition-colors hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
