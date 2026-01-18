// backend/controllers/noveltyController.js
const Novelty = require('../models/Novelty');

const noveltyController = {
  async getAll(req, res) {
    try {
      const novelties = await Novelty.getAll();
      res.json(novelties);
    } catch (error) {
      console.error('Error al obtener novedades:', error);
      res.status(500).json({ error: 'Error al obtener novedades' });
    }
  },

  async getByDate(req, res) {
    try {
      const { date } = req.params;
      const novelties = await Novelty.getByDate(date);
      res.json(novelties);
    } catch (error) {
      console.error('Error al obtener novedades por fecha:', error);
      res.status(500).json({ error: 'Error al obtener novedades por fecha' });
    }
  },

  async getByPersonnel(req, res) {
    try {
      const { personnelId } = req.params;
      const novelties = await Novelty.getByPersonnel(personnelId);
      res.json(novelties);
    } catch (error) {
      console.error('Error al obtener novedades por persona:', error);
      res.status(500).json({ error: 'Error al obtener novedades por persona' });
    }
  },

  async getByDateRange(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const novelties = await Novelty.getByDateRange(startDate, endDate);
      res.json(novelties);
    } catch (error) {
      console.error('Error al obtener novedades por rango:', error);
      res.status(500).json({ error: 'Error al obtener novedades por rango' });
    }
  },

  async create(req, res) {
    try {
      const novelty = await Novelty.create(req.body);
      res.status(201).json(novelty);
    } catch (error) {
      console.error('Error al crear novedad:', error);
      res.status(500).json({ error: 'Error al crear novedad' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const novelty = await Novelty.update(id, req.body);
      if (!novelty) {
        return res.status(404).json({ error: 'Novedad no encontrada' });
      }
      res.json(novelty);
    } catch (error) {
      console.error('Error al actualizar novedad:', error);
      res.status(500).json({ error: 'Error al actualizar novedad' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const novelty = await Novelty.delete(id);
      if (!novelty) {
        return res.status(404).json({ error: 'Novedad no encontrada' });
      }
      res.json({ message: 'Novedad eliminada exitosamente', novelty });
    } catch (error) {
      console.error('Error al eliminar novedad:', error);
      res.status(500).json({ error: 'Error al eliminar novedad' });
    }
  }
};

module.exports = noveltyController;