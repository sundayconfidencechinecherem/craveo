// src/app/notifications/page.tsx
'use client';

import NotificationsList from '@/app/components/NotificationsList';

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-app-bg pt-16 lg:pt-0 lg:ml-64">
      <div className="container mx-auto px-4 max-w-6xl py-8">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        <NotificationsList />
      </div>
    </div>
  );
}
