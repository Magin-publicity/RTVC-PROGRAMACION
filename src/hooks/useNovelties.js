// src/hooks/useNovelties.js
import { useState, useEffect, useCallback } from 'react';
import { noveltyService } from '../services/noveltyService';

export const useNovelties = () => {
  const [novelties, setNovelties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNovelties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        const data = await noveltyService.getAll();
        setNovelties(data);
        noveltyService.saveLocal(data);
      } catch (apiError) {
        console.log('Usando datos locales de novedades');
        const localData = noveltyService.getAllLocal();
        setNovelties(localData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadByDate = useCallback(async (date) => {
    setLoading(true);
    setError(null);
    try {
      try {
        const data = await noveltyService.getByDate(date);
        return data;
      } catch (apiError) {
        return noveltyService.getByDateLocal(date);
      }
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const loadByPersonnel = useCallback(async (personnelId) => {
    setLoading(true);
    setError(null);
    try {
      try {
        const data = await noveltyService.getByPersonnel(personnelId);
        return data;
      } catch (apiError) {
        return noveltyService.getByPersonnelLocal(personnelId);
      }
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addNovelty = useCallback(async (noveltyData) => {
    setLoading(true);
    setError(null);
    try {
      let newNovelty;
      try {
        newNovelty = await noveltyService.create(noveltyData);
      } catch (apiError) {
        newNovelty = noveltyService.addLocal(noveltyData);
      }
      
      setNovelties(prev => [...prev, newNovelty]);
      return newNovelty;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNovelty = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      let updatedNovelty;
      try {
        updatedNovelty = await noveltyService.update(id, updates);
      } catch (apiError) {
        updatedNovelty = noveltyService.updateLocal(id, updates);
      }
      
      setNovelties(prev =>
        prev.map(n => (n.id === id ? updatedNovelty : n))
      );
      return updatedNovelty;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNovelty = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      try {
        await noveltyService.delete(id);
      } catch (apiError) {
        noveltyService.deleteLocal(id);
      }
      
      setNovelties(prev => prev.filter(n => n.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // DESHABILITADO TEMPORALMENTE PARA EVITAR BUCLES
    // loadNovelties();
  }, [loadNovelties]);

  return {
    novelties,
    loading,
    error,
    loadNovelties,
    loadByDate,
    loadByPersonnel,
    addNovelty,
    updateNovelty,
    deleteNovelty
  };
};