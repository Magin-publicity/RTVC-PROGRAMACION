// backend/controllers/personnelController.js
const Personnel = require('../models/Personnel');

const personnelController = {
  async getAll(req, res) {
    try {
      const personnel = await Personnel.getAll();
      res.json(personnel);
    } catch (error) {
      console.error('Error al obtener personal:', error);
      res.status(500).json({ error: 'Error al obtener personal' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const person = await Personnel.getById(id);
      if (!person) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }
      res.json(person);
    } catch (error) {
      console.error('Error al obtener persona:', error);
      res.status(500).json({ error: 'Error al obtener persona' });
    }
  },

  async getByArea(req, res) {
    try {
      const { area } = req.params;
      const personnel = await Personnel.getByArea(area);
      res.json(personnel);
    } catch (error) {
      console.error('Error al obtener personal por área:', error);
      res.status(500).json({ error: 'Error al obtener personal por área' });
    }
  },

  async create(req, res) {
    try {
      const person = await Personnel.create(req.body);
      res.status(201).json(person);
    } catch (error) {
      console.error('Error al crear persona:', error);
      res.status(500).json({ error: 'Error al crear persona' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const person = await Personnel.update(id, req.body);
      if (!person) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }
      res.json(person);
    } catch (error) {
      console.error('Error al actualizar persona:', error);
      res.status(500).json({ error: 'Error al actualizar persona' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const person = await Personnel.delete(id);
      if (!person) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }
      res.json({ message: 'Persona desactivada exitosamente', person });
    } catch (error) {
      console.error('Error al eliminar persona:', error);
      res.status(500).json({ error: 'Error al eliminar persona' });
    }
  },

  async updateShift(req, res) {
    try {
      const { id } = req.params;
      const { shift } = req.body;
      const person = await Personnel.updateShift(id, shift);
      if (!person) {
        return res.status(404).json({ error: 'Persona no encontrada' });
      }
      res.json(person);
    } catch (error) {
      console.error('Error al actualizar turno:', error);
      res.status(500).json({ error: 'Error al actualizar turno' });
    }
  }
};

module.exports = personnelController;