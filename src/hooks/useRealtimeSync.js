// src/hooks/useRealtimeSync.js
import { useState } from 'react';

/**
 * Hook simplificado sin WebSocket - Solo retorna estado básico
 * El sistema ahora carga datos directamente desde la BD sin sincronización en tiempo real
 */
export function useRealtimeSync(date, callbacks = {}) {
  const [isConnected] = useState(true); // Siempre "conectado" porque usamos fetch directo
  const [error] = useState(null);

  return {
    isConnected,
    error,
    disconnect: () => {},
    reconnect: () => {},
    socket: null
  };
}

/**
 * Hook para auto-guardado - NO USADO actualmente (guardado es manual)
 */
export function useAutoSave(saveFunction, delay = 1000) {
  const [isSaving] = useState(false);
  const [lastSaved] = useState(null);

  return {
    save: () => {},
    isSaving,
    lastSaved
  };
}
