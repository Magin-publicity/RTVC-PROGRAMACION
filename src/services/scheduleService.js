// src/services/scheduleService.js
import api from './api';

export const scheduleService = {
  async getByDate(date) {
    return await api.get(`/schedule/date/${date}`);
  },

  async getByWeek(startDate, endDate) {
    return await api.get(`/schedule/week?startDate=${startDate}&endDate=${endDate}`);
  },

  async create(data) {
    return await api.post('/schedule', data);
  },

  async bulkCreate(schedules) {
    return await api.post('/schedule/bulk', { schedules });
  },

  async delete(id) {
    return await api.delete(`/schedule/${id}`);
  },

  // Métodos locales
  getAllLocal() {
    const schedules = localStorage.getItem('rtvc_schedules');
    return schedules ? JSON.parse(schedules) : {};
  },

  saveLocal(schedules) {
    localStorage.setItem('rtvc_schedules', JSON.stringify(schedules));
  },

  getByDateLocal(date) {
    const schedules = this.getAllLocal();
    return schedules[date] || null;
  },

  getByWeekLocal(startDate, endDate) {
    const schedules = this.getAllLocal();
    const result = {};
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    Object.keys(schedules).forEach(dateStr => {
      const date = new Date(dateStr);
      if (date >= start && date <= end) {
        result[dateStr] = schedules[dateStr];
      }
    });
    
    return result;
  },

  saveScheduleLocal(date, schedule) {
    const schedules = this.getAllLocal();
    schedules[date] = schedule;
    this.saveLocal(schedules);
  },

  deleteScheduleLocal(date) {
    const schedules = this.getAllLocal();
    delete schedules[date];
    this.saveLocal(schedules);
  }
};