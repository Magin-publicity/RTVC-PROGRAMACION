// src/hooks/usePersonnel.js
import { useState, useEffect, useCallback } from 'react';
import { personnelService } from '../services/personnelService';

export const usePersonnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPersonnel = useCallback(async () => {
    console.log('📂 [PERSONNEL] Cargando personal...');
    setLoading(true);
    setError(null);
    try {
      // Intentar cargar desde backend
      try {
        const data = await personnelService.getAll();
        console.log(`✅ [PERSONNEL] Cargado desde backend: ${data.length} personas`);
        setPersonnel(data);
        personnelService.saveLocal(data);
      } catch (apiError) {
        // Si falla, usar localStorage
        console.warn('⚠️ [PERSONNEL] Backend falló, usando localStorage:', apiError);
        const localData = personnelService.getAllLocal();
        console.log(`💾 [PERSONNEL] Cargado desde localStorage: ${localData.length} personas`);
        setPersonnel(localData);
      }
    } catch (err) {
      console.error('❌ [PERSONNEL] Error crítico al cargar:', err);
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
        console.log('💾 [PERSONNEL] Intentando guardar en backend:', personData);
        newPerson = await personnelService.create(personData);
        console.log('✅ [PERSONNEL] Guardado en backend exitosamente:', newPerson);
      } catch (apiError) {
        console.error('❌ [PERSONNEL] Error guardando en backend, usando localStorage:', apiError);
        newPerson = personnelService.addLocal(personData);
        console.log('💾 [PERSONNEL] Guardado en localStorage:', newPerson);
      }

      setPersonnel(prev => [...prev, newPerson]);
      return newPerson;
    } catch (err) {
      console.error('❌ [PERSONNEL] Error crítico:', err);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo cargar una vez al montar

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