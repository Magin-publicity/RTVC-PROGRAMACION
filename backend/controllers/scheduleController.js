// backend/controllers/scheduleController.js
const Schedule = require('../models/Schedule');

const scheduleController = {
  async getByDate(req, res) {
    try {
      const { date } = req.params;
      const schedules = await Schedule.getByDate(date);
      res.json(schedules);
    } catch (error) {
      console.error('Error al obtener programación:', error);
      res.status(500).json({ error: 'Error al obtener programación' });
    }
  },

  async getByWeek(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const schedules = await Schedule.getByWeek(startDate, endDate);
      res.json(schedules);
    } catch (error) {
      console.error('Error al obtener programación semanal:', error);
      res.status(500).json({ error: 'Error al obtener programación semanal' });
    }
  },

  async create(req, res) {
    try {
      const schedule = await Schedule.create(req.body);
      res.status(201).json(schedule);
    } catch (error) {
      console.error('Error al crear programación:', error);
      res.status(500).json({ error: 'Error al crear programación' });
    }
  },

  async bulkCreate(req, res) {
    try {
      const { schedules } = req.body;
      const result = await Schedule.bulkCreate(schedules);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error al crear programación masiva:', error);
      res.status(500).json({ error: 'Error al crear programación masiva' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const schedule = await Schedule.delete(id);
      if (!schedule) {
        return res.status(404).json({ error: 'Programación no encontrada' });
      }
      res.json({ message: 'Programación eliminada exitosamente', schedule });
    } catch (error) {
      console.error('Error al eliminar programación:', error);
      res.status(500).json({ error: 'Error al eliminar programación' });
    }
  }
};

module.exports = scheduleController;