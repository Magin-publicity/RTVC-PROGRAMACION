// src/hooks/usePersonnel.js
import { useState, useEffect, useCallback } from 'react';
import { personnelService } from '../services/personnelService';

export const usePersonnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPersonnel = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Intentar cargar desde backend
      try {
        const data = await personnelService.getAll();
        setPersonnel(data);
        personnelService.saveLocal(data);
      } catch (apiError) {
        // Si falla, usar localStorage
        console.log('Usando datos locales de personal');
        const localData = personnelService.getAllLocal();
        setPersonnel(localData);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPerson = useCallback(async (personData) => {
    setLoading(true);
    setError(null);
    try {
      let newPerson;
      try {
        newPerson = await personnelService.create(personData);
      } catch (apiError) {
        newPerson = personnelService.addLocal(personData);
      }
      
      setPersonnel(prev => [...prev, newPerson]);
      return newPerson;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePerson = useCallback(async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      let updatedPerson;
      try {
        updatedPerson = await personnelService.update(id, updates);
      } catch (apiError) {
        updatedPerson = personnelService.updateLocal(id, updates);
      }
      
      setPersonnel(prev =>
        prev.map(p => (p.id === id ? updatedPerson : p))
      );
      return updatedPerson;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePerson = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      try {
        await personnelService.delete(id);
      } catch (apiError) {
        personnelService.deleteLocal(id);
      }
      
      setPersonnel(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateShift = useCallback(async (id, newShift) => {
    setLoading(true);
    setError(null);
    try {
      let updatedPerson;
      try {
        updatedPerson = await personnelService.updateShift(id, newShift);
      } catch (apiError) {
        updatedPerson = personnelService.updateLocal(id, { current_shift: newShift });
      }
      
      setPersonnel(prev =>
        prev.map(p => (p.id === id ? updatedPerson : p))
      );
      return updatedPerson;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getByArea = useCallback((area) => {
    return personnel.filter(p => p.area === area);
  }, [personnel]);

  const getByRole = useCallback((role) => {
    return personnel.filter(p => p.role === role);
  }, [personnel]);

  useEffect(() => {
    loadPersonnel();
  }, [loadPersonnel]);

  return {
    personnel,
    loading,
    error,
    loadPersonnel,
    addPerson,
    updatePerson,
    deletePerson,
    updateShift,
    getByArea,
    getByRole
  };
};