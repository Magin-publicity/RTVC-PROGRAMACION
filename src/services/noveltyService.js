// src/services/noveltyService.js
import api from './api';

export const noveltyService = {
  async getAll() {
    return await api.get('/novelties');
  },

  async getByDate(date) {
    return await api.get(`/novelties/date/${date}`);
  },

  async getByPersonnel(personnelId) {
    return await api.get(`/novelties/personnel/${personnelId}`);
  },

  async getByDateRange(startDate, endDate) {
    return await api.get(`/novelties/range?startDate=${startDate}&endDate=${endDate}`);
  },

  async create(data) {
    return await api.post('/novelties', data);
  },

  async update(id, data) {
    return await api.put(`/novelties/${id}`, data);
  },

  async delete(id) {
    return await api.delete(`/novelties/${id}`);
  },

  // Métodos locales
  getAllLocal() {
    const novelties = localStorage.getItem('rtvc_novelties');
    return novelties ? JSON.parse(novelties) : [];
  },

  saveLocal(novelties) {
    localStorage.setItem('rtvc_novelties', JSON.stringify(novelties));
  },

  getByDateLocal(date) {
    const novelties = this.getAllLocal();
    return novelties.filter(n => n.date === date);
  },

  getByPersonnelLocal(personnelId) {
    const novelties = this.getAllLocal();
    return novelties.filter(n => n.personnel_id === personnelId);
  },

  addLocal(novelty) {
    const novelties = this.getAllLocal();
    const newNovelty = {
      ...novelty,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    novelties.push(newNovelty);
    this.saveLocal(novelties);
    return newNovelty;
  },

  updateLocal(id, data) {
    const novelties = this.getAllLocal();
    const index = novelties.findIndex(n => n.id === id);
    if (index !== -1) {
      novelties[index] = {
        ...novelties[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      this.saveLocal(novelties);
      return novelties[index];
    }
    return null;
  },

  deleteLocal(id) {
    const novelties = this.getAllLocal();
    const filtered = novelties.filter(n => n.id !== id);
    this.saveLocal(filtered);
  }
};