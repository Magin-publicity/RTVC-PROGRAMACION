// src/services/personnelService.js
import api from './api';

export const personnelService = {
  async getAll() {
    return await api.get('/personnel');
  },

  async getById(id) {
    return await api.get(`/personnel/${id}`);
  },

  async getByArea(area) {
    return await api.get(`/personnel/area/${area}`);
  },

  async create(data) {
    return await api.post('/personnel', data);
  },

  async update(id, data) {
    return await api.put(`/personnel/${id}`, data);
  },

  async updateShift(id, shift) {
    return await api.patch(`/personnel/${id}/shift`, { shift });
  },

  async delete(id) {
    return await api.delete(`/personnel/${id}`);
  },

  // Métodos locales para cuando no hay backend
  getAllLocal() {
    const personnel = localStorage.getItem('rtvc_personnel');
    return personnel ? JSON.parse(personnel) : [];
  },

  saveLocal(personnel) {
    localStorage.setItem('rtvc_personnel', JSON.stringify(personnel));
  },

  addLocal(person) {
    const personnel = this.getAllLocal();
    const newPerson = {
      ...person,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    personnel.push(newPerson);
    this.saveLocal(personnel);
    return newPerson;
  },

  updateLocal(id, data) {
    const personnel = this.getAllLocal();
    const index = personnel.findIndex(p => p.id === id);
    if (index !== -1) {
      personnel[index] = {
        ...personnel[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      this.saveLocal(personnel);
      return personnel[index];
    }
    return null;
  },

  deleteLocal(id) {
    const personnel = this.getAllLocal();
    const filtered = personnel.filter(p => p.id !== id);
    this.saveLocal(filtered);
  }
};