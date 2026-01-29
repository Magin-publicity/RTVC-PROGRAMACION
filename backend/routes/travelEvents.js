// backend/routes/travelEvents.js
const express = require('express');
const router = express.Router();
const TravelEvent = require('../models/TravelEvent');

// ========================================
// CRUD Endpoints para Travel Events
// ========================================

/**
 * GET /api/travel-events
 * Obtener todas las comisiones de viaje/eventos
 */
router.get('/', async (req, res) => {
  try {
    const events = await TravelEvent.getAll();
    res.json(events);
  } catch (error) {
    console.error('Error al obtener comisiones:', error);
    res.status(500).json({ error: 'Error al obtener comisiones de viaje/eventos' });
  }
});

/**
 * GET /api/travel-events/date/:date
 * Obtener comisiones por fecha específica
 */
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const events = await TravelEvent.getByDate(date);
    res.json(events);
  } catch (error) {
    console.error('Error al obtener comisiones por fecha:', error);
    res.status(500).json({ error: 'Error al obtener comisiones por fecha' });
  }
});

/**
 * GET /api/travel-events/date-range
 * Obtener comisiones por rango de fechas
 * Query params: startDate, endDate
 */
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Se requieren startDate y endDate' });
    }

    const events = await TravelEvent.getByDateRange(startDate, endDate);
    res.json(events);
  } catch (error) {
    console.error('Error al obtener comisiones por rango:', error);
    res.status(500).json({ error: 'Error al obtener comisiones por rango de fechas' });
  }
});

/**
 * GET /api/travel-events/:id
 * Obtener una comisión específica por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await TravelEvent.getById(id);

    if (!event) {
      return res.status(404).json({ error: 'Comisión no encontrada' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error al obtener comisión:', error);
    res.status(500).json({ error: 'Error al obtener comisión' });
  }
});

/**
 * POST /api/travel-events
 * Crear una nueva comisión de viaje/evento
 * Body: { start_date, end_date, event_name, event_type, destination, personnel: [], equipment: [] }
 */
router.post('/', async (req, res) => {
  try {
    const { personnel = [], equipment = [], ...eventData } = req.body;

    console.log('📝 Creando nueva comisión');
    console.log('📦 eventData:', JSON.stringify(eventData, null, 2));
    console.log('👥 personnel:', JSON.stringify(personnel, null, 2));
    console.log('🔧 equipment:', JSON.stringify(equipment, null, 2));

    // Validaciones básicas
    if (!eventData.start_date || !eventData.end_date || !eventData.event_name || !eventData.event_type || !eventData.destination) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: start_date, end_date, event_name, event_type, destination'
      });
    }

    const newEvent = await TravelEvent.create(eventData, personnel, equipment);

    // Emitir evento Socket.io para actualizar clientes en tiempo real
    const io = req.app.get('io');
    if (io) {
      // Emitir para todas las fechas afectadas (desde start_date hasta end_date)
      const start = new Date(eventData.start_date);
      const end = new Date(eventData.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        io.to(`date-${dateStr}`).emit('travel-event-created', newEvent);
      }
      io.emit('travel-events-updated');
    }

    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error al crear comisión:', error);
    res.status(500).json({ error: 'Error al crear comisión de viaje/evento' });
  }
});

/**
 * PUT /api/travel-events/:id
 * Actualizar una comisión existente
 * Body puede incluir: { start_date, end_date, event_name, event_type, destination, personnel: [], equipment: [] }
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📝 Actualizando comisión ID:', id);
    console.log('📦 Datos recibidos:', JSON.stringify(req.body, null, 2));

    const updatedEvent = await TravelEvent.update(id, req.body);

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Comisión no encontrada' });
    }

    console.log('✅ Comisión actualizada exitosamente:', updatedEvent);

    // Emitir evento Socket.io para todas las fechas afectadas
    const io = req.app.get('io');
    if (io) {
      // Emitir para el rango de fechas
      const start = new Date(updatedEvent.start_date);
      const end = new Date(updatedEvent.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        io.to(`date-${dateStr}`).emit('travel-event-updated', updatedEvent);
      }
      io.emit('travel-events-updated');
    }

    res.json(updatedEvent);
  } catch (error) {
    console.error('❌ Error al actualizar comisión:', error);
    res.status(500).json({ error: 'Error al actualizar comisión: ' + error.message });
  }
});

/**
 * DELETE /api/travel-events/:id
 * Eliminar una comisión
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await TravelEvent.delete(id);

    if (!deletedEvent) {
      return res.status(404).json({ error: 'Comisión no encontrada' });
    }

    // Emitir evento Socket.io para todas las fechas afectadas
    const io = req.app.get('io');
    if (io) {
      // Emitir para el rango de fechas
      if (deletedEvent.start_date && deletedEvent.end_date) {
        const start = new Date(deletedEvent.start_date);
        const end = new Date(deletedEvent.end_date);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          io.to(`date-${dateStr}`).emit('travel-event-deleted', { id });
        }
      }
      io.emit('travel-events-updated');
    }

    res.json({ message: 'Comisión eliminada exitosamente', event: deletedEvent });
  } catch (error) {
    console.error('Error al eliminar comisión:', error);
    res.status(500).json({ error: 'Error al eliminar comisión' });
  }
});

// ========================================
// Gestión de Personal en Comisiones
// ========================================

/**
 * GET /api/travel-events/:id/personnel
 * Obtener personal asignado a una comisión
 */
router.get('/:id/personnel', async (req, res) => {
  try {
    const { id } = req.params;
    const personnel = await TravelEvent.getPersonnel(id);
    res.json(personnel);
  } catch (error) {
    console.error('Error al obtener personal de comisión:', error);
    res.status(500).json({ error: 'Error al obtener personal de comisión' });
  }
});

/**
 * POST /api/travel-events/:id/personnel
 * Agregar personal a una comisión
 */
router.post('/:id/personnel', async (req, res) => {
  try {
    const { id } = req.params;
    const personnel = await TravelEvent.addPersonnel(id, req.body);

    // Emitir evento Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('travel-events-updated');
    }

    res.status(201).json(personnel);
  } catch (error) {
    console.error('Error al agregar personal a comisión:', error);
    res.status(500).json({ error: 'Error al agregar personal a comisión' });
  }
});

/**
 * DELETE /api/travel-events/:id/personnel/:personnelId
 * Remover personal de una comisión
 */
router.delete('/:id/personnel/:personnelId', async (req, res) => {
  try {
    const { id, personnelId } = req.params;
    const removed = await TravelEvent.removePersonnel(id, personnelId);

    if (!removed) {
      return res.status(404).json({ error: 'Personal no encontrado en esta comisión' });
    }

    // Emitir evento Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('travel-events-updated');
    }

    res.json({ message: 'Personal removido de comisión exitosamente' });
  } catch (error) {
    console.error('Error al remover personal de comisión:', error);
    res.status(500).json({ error: 'Error al remover personal de comisión' });
  }
});

// ========================================
// Gestión de Equipos en Comisiones
// ========================================

/**
 * GET /api/travel-events/:id/equipment
 * Obtener equipos asignados a una comisión
 */
router.get('/:id/equipment', async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await TravelEvent.getEquipment(id);
    res.json(equipment);
  } catch (error) {
    console.error('Error al obtener equipos de comisión:', error);
    res.status(500).json({ error: 'Error al obtener equipos de comisión' });
  }
});

/**
 * POST /api/travel-events/:id/equipment
 * Agregar equipo a una comisión
 */
router.post('/:id/equipment', async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await TravelEvent.addEquipment(id, req.body);

    // Emitir evento Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('travel-events-updated');
    }

    res.status(201).json(equipment);
  } catch (error) {
    console.error('Error al agregar equipo a comisión:', error);
    res.status(500).json({ error: 'Error al agregar equipo a comisión' });
  }
});

/**
 * DELETE /api/travel-events/:id/equipment/:equipmentId
 * Remover equipo de una comisión
 */
router.delete('/:id/equipment/:equipmentId', async (req, res) => {
  try {
    const { equipmentId } = req.params;
    const removed = await TravelEvent.removeEquipment(equipmentId);

    if (!removed) {
      return res.status(404).json({ error: 'Equipo no encontrado en esta comisión' });
    }

    // Emitir evento Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('travel-events-updated');
    }

    res.json({ message: 'Equipo removido de comisión exitosamente' });
  } catch (error) {
    console.error('Error al remover equipo de comisión:', error);
    res.status(500).json({ error: 'Error al remover equipo de comisión' });
  }
});

// ========================================
// Estadísticas y Consultas Especiales
// ========================================

/**
 * GET /api/travel-events/stats/:date
 * Obtener estadísticas de comisiones por fecha
 */
router.get('/stats/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const stats = await TravelEvent.getStatsByDate(date);
    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de comisiones:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

/**
 * GET /api/travel-events/personnel-in-event/:date
 * Obtener IDs de personal en comisión para una fecha
 * (Útil para excluirlos de la disponibilidad)
 */
router.get('/personnel-in-event/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const personnelIds = await TravelEvent.getPersonnelIdsInEvent(date);
    res.json(personnelIds);
  } catch (error) {
    console.error('Error al obtener personal en comisión:', error);
    res.status(500).json({ error: 'Error al obtener personal en comisión' });
  }
});

/**
 * GET /api/travel-events/liveu/available/:date
 * Obtener equipos LiveU disponibles (excluyendo los que están en comisiones Y despachos activos)
 * Query param opcional: excludeEventId - ID del evento a excluir (útil para edición)
 */
router.get('/liveu/available/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { excludeEventId } = req.query;
    const db = require('../config/database');

    console.log('🔍 Verificando LiveU disponibles para fecha:', date, 'excludeEventId:', excludeEventId);

    // Obtener todos los LiveU activos
    const allLiveUQuery = `
      SELECT * FROM liveu_equipment
      WHERE is_active = true
      ORDER BY equipment_code
    `;
    const allLiveU = await db.query(allLiveUQuery);

    // 1. Obtener LiveU que están en COMISIONES activas para esta fecha
    let usedInEventsQuery = `
      SELECT DISTINCT tee.equipment_reference as equipment_code
      FROM travel_events te
      JOIN travel_event_equipment tee ON te.id = tee.travel_event_id
      WHERE $1 BETWEEN te.start_date AND te.end_date
        AND te.status != 'CANCELADO'
        AND tee.equipment_type = 'LIVEU'
    `;

    const queryParams = [date];

    if (excludeEventId) {
      usedInEventsQuery += ' AND te.id != $2';
      queryParams.push(excludeEventId);
    }

    const usedInEvents = await db.query(usedInEventsQuery, queryParams);
    const usedInEventsCodes = usedInEvents.rows.map(row => row.equipment_code);

    // 2. Obtener LiveU que están en DESPACHOS activos para esta fecha
    const usedInDispatchesQuery = `
      SELECT DISTINCT le.equipment_code
      FROM press_dispatches pd
      JOIN liveu_equipment le ON pd.liveu_id = le.id
      WHERE pd.date = $1
        AND pd.status != 'CANCELADO'
    `;
    const usedInDispatches = await db.query(usedInDispatchesQuery, [date]);
    const usedInDispatchesCodes = usedInDispatches.rows.map(row => row.equipment_code);

    // 3. Combinar ambos arrays (equipos ocupados en comisiones O despachos)
    const allUsedCodes = [...new Set([...usedInEventsCodes, ...usedInDispatchesCodes])];

    console.log('📊 LiveU en comisiones:', usedInEventsCodes);
    console.log('📊 LiveU en despachos:', usedInDispatchesCodes);
    console.log('📊 Total LiveU ocupados:', allUsedCodes);

    // Marcar los LiveU con su estado de disponibilidad
    const liveUWithAvailability = allLiveU.rows.map(liveu => ({
      ...liveu,
      is_available_for_date: !allUsedCodes.includes(liveu.equipment_code),
      in_travel_event: usedInEventsCodes.includes(liveu.equipment_code),
      in_dispatch: usedInDispatchesCodes.includes(liveu.equipment_code)
    }));

    res.json(liveUWithAvailability);
  } catch (error) {
    console.error('Error al obtener LiveU disponibles:', error);
    res.status(500).json({ error: 'Error al obtener LiveU disponibles' });
  }
});

module.exports = router;
