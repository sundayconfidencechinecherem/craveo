// src/app/components/NotificationsList.tsx
'use client';

import { useNotifications, useMarkNotificationRead } from '@/app/hooks/useGraphQL';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { Notification } from '@/app/graphql/types';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function NotificationsList() {
  const { notifications, loading, error } = useNotifications(20, 0);
  const { markNotificationRead } = useMarkNotificationRead();

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-error">Error loading notifications</p>;

  return (
    <ProtectedRoute>
      <div className="space-y-4">
        {notifications.map((n: Notification) => (
          <div key={n.id} className="p-4 rounded-lg shadow bg-white">
            <p className="font-medium">{n.message}</p>
            {n.post && <p className="text-sm text-gray-500">Related post: {n.post.title}</p>}
            {!n.isRead && (
              <button
                onClick={() => markNotificationRead(n.id)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Mark as read
              </button>
            )}
          </div>
        ))}
      </div>
    </ProtectedRoute>
  );
}
