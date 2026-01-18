// src/components/Layout/MainLayout.jsx
import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const MainLayout = ({ children, activeView, onViewChange, currentUser, onLogout, notifications, unreadCount, onMarkAsRead, onMarkAllAsRead, onRemoveNotification, onViewAllNovelties }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        currentUser={currentUser}
        onLogout={onLogout}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={onMarkAsRead}
        onMarkAllAsRead={onMarkAllAsRead}
        onRemoveNotification={onRemoveNotification}
        onViewAllNovelties={onViewAllNovelties}
      />
      
      <div className="flex flex-1">
        <Sidebar activeView={activeView} onViewChange={onViewChange} />

        <main className="flex-1 p-4 sm:p-6 ml-64">
          <div className="w-full">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};