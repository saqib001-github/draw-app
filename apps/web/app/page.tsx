'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { AuthForm } from '../components/AuthForm';
import { ChatRoom } from '../components/ChatRoom';

export default function Home() {
  const { isAuthenticated, loadProfile } = useAuthStore();

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow">
            <ChatRoom roomId="default-room" slug="default" />
          </div>
        </div>
      </div>
    </div>
  );
}
}
