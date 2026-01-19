// src/components/Layout/Header.jsx
import React, { useState } from 'react';
import { Users, Calendar, Bell, Settings, LogOut, User, X, Check } from 'lucide-react';

export const Header = ({ currentUser, onLogout, notifications = [], unreadCount = 0, onMarkAsRead, onMarkAllAsRead, onRemoveNotification, onViewAllNovelties }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getRoleName = (role) => {
    const roleNames = {
      'admin': 'Administrador',
      'coordinator': 'Coordinador',
      'director': 'Director',
      'employee': 'Empleado'
    };
    return roleNames[role] || role;
  };

  const getInitials = (name) => {
    if (!name) return currentUser?.username?.substring(0, 1).toUpperCase() || 'U';
    const parts = name.split(' ');
    return parts.length > 1
      ? parts[0][0] + parts[1][0]
      : parts[0].substring(0, 2);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
              <Calendar className="text-white" size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">RTVC</h1>
              <p className="text-xs text-gray-600 truncate hidden sm:block">Sistema de Programación</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={onMarkAllAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>

                  <div className="overflow-y-auto flex-1">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Termina: {notification.endDate}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <button
                                  onClick={() => onMarkAsRead(notification.id)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  title="Marcar como leída"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => onRemoveNotification(notification.id)}
                                className="p-1 text-gray-400 hover:bg-gray-200 rounded"
                                title="Eliminar"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        <Bell size={48} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm">No hay notificaciones</p>
                      </div>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          if (onViewAllNovelties) onViewAllNovelties();
                        }}
                        className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Ver todas las novedades
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden sm:block">
              <Settings size={20} className="text-gray-600" />
            </button>

            <div className="relative ml-2 sm:ml-4 pl-2 sm:pl-4 border-l border-gray-200">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {getInitials(currentUser?.personnel_name)}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                    {currentUser?.personnel_name || currentUser?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{getRoleName(currentUser?.role)}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">
                      {currentUser?.personnel_name || currentUser?.username}
                    </p>
                    <p className="text-xs text-gray-500">{currentUser?.area || getRoleName(currentUser?.role)}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Aquí podrías abrir un modal de perfil
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <User size={16} />
                    Mi Perfil
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-200"
                  >
                    <LogOut size={16} />
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};