// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';
import { formatDateShort } from '../utils/dateUtils';

export const useNotifications = (novelties = [], personnel = []) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Verificar novedades que terminan hoy o mañana
  useEffect(() => {
    // DESHABILITADO TEMPORALMENTE PARA EVITAR BUCLES
    return;

    const checkExpiringNovelties = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const newNotifications = [];

      novelties.forEach(novelty => {
        let endDate = null;
        let endDateStr = '';

        // Obtener fecha de fin de la novedad
        if (novelty.end_date) {
          endDateStr = novelty.end_date.split('T')[0];
          // Crear fecha en UTC para evitar problemas de timezone
          const [year, month, day] = endDateStr.split('-').map(Number);
          endDate = new Date(year, month - 1, day);
        } else if (novelty.date) {
          endDateStr = novelty.date.split('T')[0];
          // Crear fecha en UTC para evitar problemas de timezone
          const [year, month, day] = endDateStr.split('-').map(Number);
          endDate = new Date(year, month - 1, day);
        }

        // Buscar el nombre del trabajador
        const person = personnel.find(p => p.id === novelty.personnel_id);
        const personnelName = person?.name || 'Personal no encontrado';

        // Formatear fecha de terminación usando nuestro helper
        const formattedEndDate = endDate ? formatDateShort(endDate) : '';

        if (endDate) {
          endDate.setHours(0, 0, 0, 0);

          // Si la novedad termina hoy
          if (endDate.getTime() === today.getTime()) {
            newNotifications.push({
              id: `expiring-${novelty.id}`,
              type: 'novelty_expiring_today',
              title: 'Novedad termina hoy',
              message: `${personnelName} - ${novelty.type}`,
              endDate: formattedEndDate,
              noveltyId: novelty.id,
              personnelId: novelty.personnel_id,
              personnelName,
              timestamp: new Date(),
              read: false
            });
          }

          // Si la novedad termina mañana
          if (endDate.getTime() === tomorrow.getTime()) {
            newNotifications.push({
              id: `expiring-tomorrow-${novelty.id}`,
              type: 'novelty_expiring_tomorrow',
              title: 'Novedad termina mañana',
              message: `${personnelName} - ${novelty.type}`,
              endDate: formattedEndDate,
              noveltyId: novelty.id,
              personnelId: novelty.personnel_id,
              personnelName,
              timestamp: new Date(),
              read: false
            });
          }
        }
      });

      // Agregar nuevas notificaciones sin duplicar
      setNotifications(prev => {
        const existingIds = new Set(prev.map(n => n.id));
        const filtered = newNotifications.filter(n => !existingIds.has(n.id));
        const updated = [...prev, ...filtered];

        // Actualizar contador de no leídas basado en el total
        const totalUnread = updated.filter(n => !n.read).length;
        setUnreadCount(totalUnread);

        return updated;
      });
    };

    if (novelties.length > 0 && personnel.length > 0) {
      checkExpiringNovelties();
    }
  }, [novelties, personnel]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(c => Math.max(0, c - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  };
};
