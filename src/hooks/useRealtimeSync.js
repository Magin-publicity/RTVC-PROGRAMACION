// src/hooks/useRealtimeSync.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Hook para sincronización en tiempo real mediante WebSockets
 * @param {string} date - Fecha a la que suscribirse (formato YYYY-MM-DD)
 * @param {Object} callbacks - Callbacks para los diferentes eventos
 * @param {Function} callbacks.onAssignmentCreated - Callback cuando se crea una asignación
 * @param {Function} callbacks.onAssignmentUpdated - Callback cuando se actualiza una asignación
 * @param {Function} callbacks.onAssignmentDeleted - Callback cuando se elimina una asignación
 * @returns {Object} Estado de la conexión y funciones de control
 */
export function useRealtimeSync(date, callbacks = {}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const currentDateRef = useRef(date);

  // Actualizar la referencia de fecha cuando cambia
  useEffect(() => {
    currentDateRef.current = date;
  }, [date]);

  // Conectar al socket
  useEffect(() => {
    // Crear conexión solo si no existe
    if (!socketRef.current) {
      console.log('🔌 Conectando a WebSocket:', SOCKET_URL);

      socketRef.current = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling']
      });

      // Eventos de conexión
      socketRef.current.on('connect', () => {
        console.log('✅ WebSocket conectado');
        setIsConnected(true);
        setError(null);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ WebSocket desconectado:', reason);
        setIsConnected(false);
      });

      socketRef.current.on('connect_error', (err) => {
        console.error('❌ Error de conexión WebSocket:', err);
        setError(err.message);
        setIsConnected(false);
      });
    }

    return () => {
      // No desconectar el socket aquí para mantener la conexión persistente
      // Solo limpiar listeners específicos
    };
  }, []);

  // Suscribirse a la fecha actual
  useEffect(() => {
    if (!socketRef.current || !date) return;

    const socket = socketRef.current;
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

    console.log('📅 Suscribiéndose a fecha:', dateStr);
    socket.emit('join-date', dateStr);

    // Cleanup: salir de la sala cuando cambia la fecha
    return () => {
      console.log('📅 Saliendo de fecha:', dateStr);
      socket.emit('leave-date', dateStr);
    };
  }, [date]);

  // Configurar listeners para eventos de asignaciones
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    // Listener para creación de asignaciones
    const handleAssignmentCreated = (data) => {
      console.log('📝 Asignación creada:', data);
      if (callbacks.onAssignmentCreated) {
        callbacks.onAssignmentCreated(data);
      }
    };

    // Listener para actualización de asignaciones
    const handleAssignmentUpdated = (data) => {
      console.log('✏️ Asignación actualizada:', data);
      if (callbacks.onAssignmentUpdated) {
        callbacks.onAssignmentUpdated(data);
      }
    };

    // Listener para eliminación de asignaciones
    const handleAssignmentDeleted = (data) => {
      console.log('🗑️ Asignación eliminada:', data);
      if (callbacks.onAssignmentDeleted) {
        callbacks.onAssignmentDeleted(data);
      }
    };

    socket.on('assignment-created', handleAssignmentCreated);
    socket.on('assignment-updated', handleAssignmentUpdated);
    socket.on('assignment-deleted', handleAssignmentDeleted);

    // Cleanup: remover listeners
    return () => {
      socket.off('assignment-created', handleAssignmentCreated);
      socket.off('assignment-updated', handleAssignmentUpdated);
      socket.off('assignment-deleted', handleAssignmentDeleted);
    };
  }, [callbacks.onAssignmentCreated, callbacks.onAssignmentUpdated, callbacks.onAssignmentDeleted]);

  // Función para desconectar manualmente
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Función para reconectar manualmente
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  }, []);

  return {
    isConnected,
    error,
    disconnect,
    reconnect,
    socket: socketRef.current
  };
}

/**
 * Hook simplificado para auto-guardado con debounce y sincronización
 * @param {Function} saveFunction - Función que guarda los datos
 * @param {number} delay - Delay del debounce en milisegundos
 * @returns {Function} Función para guardar con debounce
 */
export function useAutoSave(saveFunction, delay = 1000) {
  const timeoutRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const save = useCallback(async (...args) => {
    // Cancelar guardado pendiente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Programar nuevo guardado
    timeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await saveFunction(...args);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error al auto-guardar:', error);
      } finally {
        setIsSaving(false);
      }
    }, delay);
  }, [saveFunction, delay]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    save,
    isSaving,
    lastSaved
  };
}
