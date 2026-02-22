// backend/routes/meals.js
// API para Gestión de Alimentación (Desayunos, Almuerzos, Cenas)

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// ========================================
// SERVICIOS ALIMENTICIOS (meal_services)
// ========================================

// GET: Obtener todos los servicios disponibles
router.get('/services', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, service_name, service_time, description, is_active
      FROM meal_services
      WHERE is_active = true
      ORDER BY service_time
    `);

    console.log(`📋 Servicios consultados: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: 'Error al obtener servicios' });
  }
});

// ========================================
// SOLICITUDES DE COMIDA (meal_requests)
// ========================================

// GET: Obtener todas las solicitudes de un servicio en una fecha específica
router.get('/requests/:serviceId/:date', async (req, res) => {
  try {
    const { serviceId, date } = req.params;

    const result = await pool.query(`
      SELECT
        mr.id,
        mr.service_id,
        mr.service_date,
        mr.personnel_id,
        mr.personnel_name,
        mr.cargo,
        mr.scheduled_time,
        mr.status,
        mr.is_guest,
        mr.notes,
        mr.program_name,
        p.area as personnel_area
      FROM meal_requests mr
      LEFT JOIN personnel p ON mr.personnel_id = p.id
      WHERE mr.service_id = $1 AND mr.service_date = $2
      ORDER BY
        mr.is_guest ASC,
        mr.cargo ASC,
        mr.personnel_name ASC
    `, [serviceId, date]);

    console.log(`🍽️  Solicitudes consultadas: ${result.rows.length} para servicio ${serviceId} en ${date}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
});

// POST: Crear nueva solicitud de comida
router.post('/requests', async (req, res) => {
  try {
    const {
      service_id,
      service_date,
      personnel_id,
      personnel_name,
      cargo,
      scheduled_time,
      status = 'POR_CONFIRMAR',
      is_guest = false,
      notes,
      program_name
    } = req.body;

    // Validaciones
    if (!service_id || !service_date || !personnel_name) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: service_id, service_date, personnel_name'
      });
    }

    const result = await pool.query(`
      INSERT INTO meal_requests
        (service_id, service_date, personnel_id, personnel_name, cargo, scheduled_time, status, is_guest, notes, program_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [service_id, service_date, personnel_id, personnel_name, cargo, scheduled_time, status, is_guest, notes, program_name]);

    console.log(`✅ Nueva solicitud creada: ${personnel_name} - ${cargo}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({
        error: 'Esta persona ya tiene una solicitud para este servicio en esta fecha'
      });
    }
    console.error('Error creando solicitud:', error);
    res.status(500).json({ error: 'Error al crear solicitud' });
  }
});

// PUT: Actualizar solicitud existente
router.put('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      personnel_name,
      cargo,
      scheduled_time,
      status,
      is_guest,
      notes,
      program_name
    } = req.body;

    const result = await pool.query(`
      UPDATE meal_requests
      SET
        personnel_name = COALESCE($1, personnel_name),
        cargo = COALESCE($2, cargo),
        scheduled_time = COALESCE($3, scheduled_time),
        status = COALESCE($4, status),
        is_guest = COALESCE($5, is_guest),
        notes = COALESCE($6, notes),
        program_name = COALESCE($7, program_name),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [personnel_name, cargo, scheduled_time, status, is_guest, notes, program_name, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    console.log(`✏️  Solicitud actualizada: ID ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando solicitud:', error);
    res.status(500).json({ error: 'Error al actualizar solicitud' });
  }
});

// DELETE: Eliminar solicitud
router.delete('/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      DELETE FROM meal_requests
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    console.log(`🗑️  Solicitud eliminada: ID ${id}`);
    res.json({ message: 'Solicitud eliminada exitosamente', request: result.rows[0] });
  } catch (error) {
    console.error('Error eliminando solicitud:', error);
    res.status(500).json({ error: 'Error al eliminar solicitud' });
  }
});

// DELETE: Reset completo - eliminar todas las solicitudes de un servicio en una fecha
router.delete('/requests/reset/:serviceId/:date', async (req, res) => {
  try {
    const { serviceId, date } = req.params;

    const result = await pool.query(`
      DELETE FROM meal_requests
      WHERE service_id = $1 AND service_date = $2
      RETURNING *
    `, [serviceId, date]);

    console.log(`🔄 Reset completado: ${result.rows.length} solicitudes eliminadas para servicio ${serviceId} en ${date}`);
    res.json({
      message: 'Reset completado exitosamente',
      deleted_count: result.rows.length
    });
  } catch (error) {
    console.error('Error en reset:', error);
    res.status(500).json({ error: 'Error al realizar reset' });
  }
});

// ========================================
// CARGA AUTOMÁTICA DESDE PROGRAMACIÓN
// ========================================

// POST: Cargar personal desde programación según horario
router.post('/requests/load-from-schedule', async (req, res) => {
  try {
    const { service_id, service_date, time_reference } = req.body;

    // Validaciones
    if (!service_id || !service_date || !time_reference) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: service_id, service_date, time_reference'
      });
    }

    console.log(`📥 Cargando personal para servicio ${service_id} en ${service_date} cerca de ${time_reference}`);

    // Obtener turnos del día usando el mismo endpoint que usa el frontend
    // Esto garantiza que siempre obtenemos la programación, aunque no esté guardada en daily_schedules
    const shiftsResponse = await fetch(`http://localhost:3000/api/schedule/auto-shifts/${service_date}`);

    if (!shiftsResponse.ok) {
      return res.status(404).json({
        error: 'No hay programación para esta fecha',
        loaded_count: 0
      });
    }

    const shifts = await shiftsResponse.json();

    if (!shifts || shifts.length === 0) {
      return res.status(404).json({
        error: 'No hay turnos programados para esta fecha',
        loaded_count: 0
      });
    }

    // Crear un objeto compatible con la estructura anterior
    const programsData = { shifts: shifts };

    // Convertir time_reference a minutos para comparación
    const [serviceHour, serviceMin] = time_reference.split(':').map(Number);
    const serviceMinutes = serviceHour * 60 + serviceMin;

    // Determinar tipo de servicio basado en la hora
    const isDesayuno = serviceMinutes <= 7 * 60;  // 06:00 - 07:00
    const isCena = serviceMinutes >= 18 * 60;      // 18:00 o después

    // Filtrar personal según el tipo de servicio
    let relevantShifts;

    if (isDesayuno) {
      // DESAYUNO: Solo personal que INICIA a las 05:00 o 06:00
      console.log('☀️ Filtrando para DESAYUNO: solo personal que inicia a las 05:00 o 06:00');
      relevantShifts = programsData.shifts.filter(shift => {
        return shift.shift_start === '05:00:00' || shift.shift_start === '05:00' ||
               shift.shift_start === '06:00:00' || shift.shift_start === '06:00';
      });
    } else if (isCena) {
      // CENA: Solo personal que TERMINA a las 22:00
      console.log('🌙 Filtrando para CENA: solo personal que termina a las 22:00');
      relevantShifts = programsData.shifts.filter(shift => {
        return shift.shift_end === '22:00:00' || shift.shift_end === '22:00';
      });
    } else {
      // ALMUERZO: Personal con turno cercano a las 11:00 (±2 horas)
      console.log('🍽️ Filtrando para ALMUERZO: personal con turno cercano a las 11:00 ±2h');
      relevantShifts = programsData.shifts.filter(shift => {
        const [startHour, startMin] = shift.shift_start.split(':').map(Number);
        const [endHour, endMin] = shift.shift_end.split(':').map(Number);

        const shiftStartMinutes = startHour * 60 + startMin;
        const shiftEndMinutes = endHour * 60 + endMin;

        // Persona está programada si el servicio cae dentro de su turno ±2 horas
        return (
          (serviceMinutes >= shiftStartMinutes - 120 && serviceMinutes <= shiftEndMinutes + 120) ||
          (shiftStartMinutes >= serviceMinutes - 120 && shiftStartMinutes <= serviceMinutes + 120)
        );
      });
    }

    console.log(`🔍 Total turnos en programación: ${programsData.shifts.length}`);
    console.log(`✅ Turnos relevantes para ${time_reference}: ${relevantShifts.length}`);

    // Insertar solicitudes de comida
    const insertedRequests = [];
    for (const shift of relevantShifts) {
      try {
        // Intentar obtener el programa asignado al personal en esta fecha
        const programQuery = await pool.query(`
          SELECT p.nombre as program_name
          FROM personal_asignado pa
          JOIN programas p ON pa.id_programa = p.id
          WHERE pa.id_personal = $1
            AND pa.fecha = $2
            AND pa.estado IN ('programado', 'en_curso')
          ORDER BY pa.hora_inicio
          LIMIT 1
        `, [shift.personnel_id, service_date]);

        const programName = programQuery.rows.length > 0 ? programQuery.rows[0].program_name : null;

        const result = await pool.query(`
          INSERT INTO meal_requests
            (service_id, service_date, personnel_id, personnel_name, cargo, scheduled_time, status, is_guest, program_name)
          VALUES ($1, $2, $3, $4, $5, $6, 'POR_CONFIRMAR', false, $7)
          ON CONFLICT (service_id, service_date, personnel_id, personnel_name) DO NOTHING
          RETURNING *
        `, [
          service_id,
          service_date,
          shift.personnel_id,
          shift.name,
          shift.area,
          shift.shift_start,
          programName
        ]);

        if (result.rows.length > 0) {
          insertedRequests.push(result.rows[0]);
        }
      } catch (err) {
        console.error(`⚠️  Error insertando ${shift.name}:`, err.message);
      }
    }

    console.log(`✅ Carga automática: ${insertedRequests.length} personas importadas`);
    res.json({
      message: 'Personal cargado exitosamente',
      loaded_count: insertedRequests.length,
      total_shifts: programsData.shifts.length,
      relevant_shifts: relevantShifts.length,
      requests: insertedRequests
    });
  } catch (error) {
    console.error('❌ Error cargando desde programación:', error);
    res.status(500).json({ error: 'Error al cargar personal desde programación' });
  }
});

// ========================================
// ESTADÍSTICAS Y RESÚMENES
// ========================================

// GET: Obtener estadísticas de un servicio en una fecha
router.get('/stats/:serviceId/:date', async (req, res) => {
  try {
    const { serviceId, date } = req.params;

    const result = await pool.query(`
      SELECT
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE status = 'CONFIRMADO') as confirmed,
        COUNT(*) FILTER (WHERE status = 'POR_CONFIRMAR') as pending,
        COUNT(*) FILTER (WHERE is_guest = true) as guests,
        COUNT(*) FILTER (WHERE is_guest = false) as internal
      FROM meal_requests
      WHERE service_id = $1 AND service_date = $2
    `, [serviceId, date]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// ========================================
// DATOS PARA PDF Y WHATSAPP
// ========================================

// GET: Obtener datos formateados para PDF
router.get('/pdf-data/:serviceId/:date', async (req, res) => {
  try {
    const { serviceId, date } = req.params;

    // Obtener servicio
    const service = await pool.query(`
      SELECT service_name, service_time
      FROM meal_services
      WHERE id = $1
    `, [serviceId]);

    if (service.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Obtener solicitudes confirmadas
    const requests = await pool.query(`
      SELECT
        mr.personnel_name,
        mr.cargo,
        mr.status
      FROM meal_requests mr
      WHERE mr.service_id = $1 AND mr.service_date = $2
      ORDER BY
        mr.is_guest ASC,
        mr.cargo ASC,
        mr.personnel_name ASC
    `, [serviceId, date]);

    res.json({
      service: service.rows[0],
      date: date,
      requests: requests.rows,
      total: requests.rows.length
    });
  } catch (error) {
    console.error('Error obteniendo datos para PDF:', error);
    res.status(500).json({ error: 'Error al obtener datos para PDF' });
  }
});

// GET: Generar mensaje de WhatsApp
router.get('/whatsapp-message/:serviceId/:date', async (req, res) => {
  try {
    const { serviceId, date } = req.params;

    // Obtener servicio
    const service = await pool.query(`
      SELECT service_name
      FROM meal_services
      WHERE id = $1
    `, [serviceId]);

    if (service.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    // Obtener total confirmado
    const stats = await pool.query(`
      SELECT COUNT(*) as total
      FROM meal_requests
      WHERE service_id = $1 AND service_date = $2 AND status = 'CONFIRMADO'
    `, [serviceId, date]);

    const total = stats.rows[0].total;
    const serviceName = service.rows[0].service_name;
    const dateFormatted = new Date(date + 'T00:00:00').toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const message = `Hola! 👋\n\nPara el *${serviceName.toLowerCase()}* del día *${dateFormatted}* necesitamos:\n\n🍽️ *${total} porciones*\n\nGracias!`;

    res.json({ message, total });
  } catch (error) {
    console.error('Error generando mensaje WhatsApp:', error);
    res.status(500).json({ error: 'Error al generar mensaje WhatsApp' });
  }
});

// ========================================
// PERSONAL LOGÍSTICO
// ========================================

// GET: Obtener personal logístico disponible
router.get('/logistic-personnel', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, area
      FROM personnel
      WHERE active = true
        AND area IN (
          'PERIODISTAS', 'PRODUCTORES', 'PRESENTADORES',
          'INGENIEROS', 'INGENIEROS EMISION', 'DIRECTORES',
          'ALMACEN', 'ADMINISTRATIVO'
        )
      ORDER BY area, name
    `);

    console.log(`👥 Personal logístico consultado: ${result.rows.length}`);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo personal logístico:', error);
    res.status(500).json({ error: 'Error al obtener personal logístico' });
  }
});

// POST: Agregar personal logístico a un servicio
router.post('/add-logistic-personnel', async (req, res) => {
  try {
    const { service_id, service_date, personnel_ids } = req.body;

    if (!service_id || !service_date || !personnel_ids || !Array.isArray(personnel_ids)) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: service_id, service_date, personnel_ids (array)'
      });
    }

    // Obtener información del personal seleccionado
    const personnelResult = await pool.query(`
      SELECT id, name, area
      FROM personnel
      WHERE id = ANY($1::int[])
    `, [personnel_ids]);

    const insertedRequests = [];
    const errors = [];

    for (const person of personnelResult.rows) {
      try {
        const result = await pool.query(`
          INSERT INTO meal_requests
            (service_id, service_date, personnel_id, personnel_name, cargo, status, is_guest)
          VALUES ($1, $2, $3, $4, $5, 'POR_CONFIRMAR', false)
          ON CONFLICT (service_id, service_date, personnel_id, personnel_name) DO NOTHING
          RETURNING *
        `, [service_id, service_date, person.id, person.name, person.area]);

        if (result.rows.length > 0) {
          insertedRequests.push(result.rows[0]);
        }
      } catch (err) {
        errors.push(`${person.name}: ${err.message}`);
      }
    }

    console.log(`✅ Personal logístico agregado: ${insertedRequests.length} personas`);
    res.json({
      message: `Se agregaron ${insertedRequests.length} personas del personal logístico`,
      added_count: insertedRequests.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error agregando personal logístico:', error);
    res.status(500).json({ error: 'Error al agregar personal logístico' });
  }
});

// ========================================
// GRUPOS / PLANTILLAS DE ALIMENTACIÓN
// ========================================

// GET: Obtener todos los grupos (opcionalmente filtrar por service_type)
router.get('/groups', async (req, res) => {
  try {
    const { service_type } = req.query;
    let query = `SELECT * FROM meal_groups`;
    const params = [];
    if (service_type) {
      query += ` WHERE service_type = $1`;
      params.push(service_type);
    }
    query += ` ORDER BY name`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo grupos de alimentación:', error);
    res.status(500).json({ error: 'Error al obtener grupos' });
  }
});

// POST: Crear nuevo grupo
router.post('/groups', async (req, res) => {
  try {
    const { name, description, service_type, personnel_ids } = req.body;
    if (!name || !service_type || !Array.isArray(personnel_ids)) {
      return res.status(400).json({ error: 'Faltan campos: name, service_type, personnel_ids' });
    }
    const result = await pool.query(
      `INSERT INTO meal_groups (name, description, service_type, personnel_ids)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), description || null, service_type, personnel_ids]
    );
    console.log(`✅ Grupo de alimentación creado: ${name}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando grupo:', error);
    res.status(500).json({ error: 'Error al crear grupo' });
  }
});

// PUT: Actualizar grupo existente
router.put('/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, service_type, personnel_ids } = req.body;
    const result = await pool.query(
      `UPDATE meal_groups
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           service_type = COALESCE($3, service_type),
           personnel_ids = COALESCE($4, personnel_ids),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [name, description, service_type, personnel_ids, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Grupo no encontrado' });
    console.log(`✏️  Grupo actualizado: ID ${id}`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando grupo:', error);
    res.status(500).json({ error: 'Error al actualizar grupo' });
  }
});

// DELETE: Eliminar grupo
router.delete('/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM meal_groups WHERE id = $1 RETURNING *`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Grupo no encontrado' });
    console.log(`🗑️  Grupo eliminado: ID ${id}`);
    res.json({ message: 'Grupo eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando grupo:', error);
    res.status(500).json({ error: 'Error al eliminar grupo' });
  }
});

// POST: Cargar grupo en solicitudes de alimentación del día
router.post('/groups/load', async (req, res) => {
  try {
    const { group_id, service_id, service_date } = req.body;
    if (!group_id || !service_id || !service_date) {
      return res.status(400).json({ error: 'Faltan campos: group_id, service_id, service_date' });
    }

    // Obtener el grupo
    const groupResult = await pool.query(`SELECT * FROM meal_groups WHERE id = $1`, [group_id]);
    if (groupResult.rows.length === 0) return res.status(404).json({ error: 'Grupo no encontrado' });
    const group = groupResult.rows[0];

    // Obtener info del personal
    const personnelResult = await pool.query(
      `SELECT id, name, area FROM personnel WHERE id = ANY($1::int[])`,
      [group.personnel_ids]
    );

    let added = 0;
    for (const person of personnelResult.rows) {
      try {
        const r = await pool.query(
          `INSERT INTO meal_requests
             (service_id, service_date, personnel_id, personnel_name, cargo, status, is_guest)
           VALUES ($1, $2, $3, $4, $5, 'POR_CONFIRMAR', false)
           ON CONFLICT (service_id, service_date, personnel_id, personnel_name) DO NOTHING
           RETURNING id`,
          [service_id, service_date, person.id, person.name, person.area]
        );
        if (r.rows.length > 0) added++;
      } catch (err) {
        console.error(`⚠️ Error insertando ${person.name}:`, err.message);
      }
    }

    console.log(`✅ Grupo "${group.name}" cargado: ${added} personas agregadas`);
    res.json({ message: `Se agregaron ${added} personas del grupo "${group.name}"`, added_count: added });
  } catch (error) {
    console.error('Error cargando grupo:', error);
    res.status(500).json({ error: 'Error al cargar grupo' });
  }
});

module.exports = router;

