// src/components/Layout/MainLayout.jsx
import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';

export const MainLayout = ({ children, activeView, onViewChange, currentUser, onLogout, notifications, unreadCount, onMarkAsRead, onMarkAllAsRead, onRemoveNotification, onViewAllNovelties }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('rtvc_sidebar_collapsed');
    return saved === 'true';
  });

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
        <Sidebar
          activeView={activeView}
          onViewChange={onViewChange}
          onCollapseChange={setIsSidebarCollapsed}
        />

        {/* Main content - responsive: sin margen en móviles, con margen ajustable en desktop */}
        <main
          className={`
            flex-1 p-4 sm:p-6 w-full transition-all duration-300
            ml-0
            ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}
          `}
          style={{ display: 'block', overflow: 'visible' }}
        >
          <div className="w-full" style={{ overflow: 'visible' }}>
            {children}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};