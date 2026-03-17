const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'rtvc_scheduling',
  password: process.env.DB_PASSWORD || 'Padres2023',
  port: process.env.DB_PORT || 5432,
});

/**
 * GET /api/logistics/liveu
 * Obtiene todos los equipos LiveU con su estado actual
 */
router.get('/liveu', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        le.*,
        CASE
          WHEN pd.id IS NOT NULL THEN json_build_object(
            'dispatch_id', pd.id,
            'journalist', pd.journalist_name,
            'destination', pd.destination,
            'departure_time', pd.departure_time
          )
          ELSE NULL
        END as current_dispatch
      FROM liveu_equipment le
      LEFT JOIN press_dispatches pd ON pd.liveu_id = le.id
        AND pd.status IN ('PROGRAMADO', 'EN_RUTA')
        AND pd.date = CURRENT_DATE
      WHERE le.is_active = true
      ORDER BY le.equipment_code
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo equipos LiveU:', error);
    res.status(500).json({ error: 'Error al obtener equipos LiveU' });
  }
});

/**
 * GET /api/logistics/liveu/available/:date
 * Obtiene equipos LiveU disponibles para una fecha específica
 */
router.get('/liveu/available/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const result = await pool.query(`
      SELECT le.*
      FROM liveu_equipment le
      WHERE le.is_active = true
        AND le.status != 'REPARACION'
        AND le.id NOT IN (
          SELECT liveu_id
          FROM press_dispatches
          WHERE date = $1
            AND status IN ('PROGRAMADO', 'EN_RUTA')
            AND liveu_id IS NOT NULL
        )
      ORDER BY le.equipment_code
    `, [date]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo LiveU disponibles:', error);
    res.status(500).json({ error: 'Error al obtener LiveU disponibles' });
  }
});

/**
 * POST /api/logistics/liveu
 * Crea un nuevo equipo LiveU
 */
router.post('/liveu', async (req, res) => {
  try {
    const { equipment_code, serial_number, status } = req.body;

    // Validar que el código de equipo no exista
    const existing = await pool.query(
      'SELECT id FROM liveu_equipment WHERE equipment_code = $1',
      [equipment_code]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe un equipo con ese código' });
    }

    const result = await pool.query(`
      INSERT INTO liveu_equipment (equipment_code, serial_number, status, is_active)
      VALUES ($1, $2, $3, true)
      RETURNING *
    `, [equipment_code, serial_number || null, status || 'DISPONIBLE']);

    console.log(`✅ Nuevo equipo LiveU creado: ${result.rows[0].equipment_code}`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creando LiveU:', error);
    res.status(500).json({ error: 'Error al crear equipo LiveU' });
  }
});

/**
 * PUT /api/logistics/liveu/:id
 * Actualiza el estado o información de un equipo LiveU
 */
router.put('/liveu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, equipment_code, serial_number } = req.body;

    // Si se proporciona código de equipo, validar que no exista en otro equipo
    if (equipment_code) {
      const existing = await pool.query(
        'SELECT id FROM liveu_equipment WHERE equipment_code = $1 AND id != $2',
        [equipment_code, id]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Ya existe otro equipo con ese código' });
      }
    }

    // Construir query dinámicamente según los campos proporcionados
    let query = 'UPDATE liveu_equipment SET updated_at = CURRENT_TIMESTAMP';
    const values = [];
    let paramCount = 1;

    if (status !== undefined) {
      query += `, status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (notes !== undefined) {
      query += `, notes = $${paramCount}`;
      values.push(notes);
      paramCount++;
    }

    if (equipment_code !== undefined) {
      query += `, equipment_code = $${paramCount}`;
      values.push(equipment_code);
      paramCount++;
    }

    if (serial_number !== undefined) {
      query += `, serial_number = $${paramCount}`;
      values.push(serial_number);
      paramCount++;
    }

    query += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(id);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipo LiveU no encontrado' });
    }

    console.log(`✅ LiveU ${result.rows[0].equipment_code} actualizado`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error actualizando LiveU:', error);
    res.status(500).json({ error: 'Error al actualizar LiveU' });
  }
});

/**
 * DELETE /api/logistics/liveu/:id
 * Elimina un equipo LiveU (soft delete)
 */
router.delete('/liveu/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que no esté en uso en despachos activos
    const inUse = await pool.query(`
      SELECT id FROM press_dispatches
      WHERE liveu_id = $1
        AND status IN ('PROGRAMADO', 'EN_RUTA')
        AND date >= CURRENT_DATE
    `, [id]);

    if (inUse.rows.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el equipo porque está asignado a un despacho activo'
      });
    }

    // Soft delete: marcar como inactivo
    const result = await pool.query(`
      UPDATE liveu_equipment
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipo LiveU no encontrado' });
    }

    console.log(`✅ LiveU ${result.rows[0].equipment_code} eliminado (soft delete)`);
    res.json({ message: 'Equipo eliminado correctamente', equipment: result.rows[0] });
  } catch (error) {
    console.error('Error eliminando LiveU:', error);
    res.status(500).json({ error: 'Error al eliminar equipo LiveU' });
  }
});

/**
 * GET /api/logistics/liveu/detalle/:fecha
 * Obtiene detalle completo de equipos LiveU con información de despachos para el Dashboard
 */
router.get('/liveu/detalle/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    console.log(`📡 Obteniendo detalle de LiveU para ${fecha}`);

    const liveuQuery = `
      SELECT
        le.id,
        le.equipment_code,
        le.serial_number,
        le.status as status_base,
        le.notes
      FROM liveu_equipment le
      WHERE le.is_active = true
      ORDER BY le.equipment_code
    `;

    const result = await pool.query(liveuQuery);
    const equipos = result.rows;

    // Obtener despachos activos con toda la información
    const despachosQuery = `
      SELECT
        pd.liveu_id,
        pd.journalist_name as periodista,
        pd.destination as destino,
        pd.departure_time as hora_salida,
        pd.vehicle_plate as placa_vehiculo,
        pd.status,
        pd.cameraman_name as camarografo,
        pd.director_name as realizador
      FROM press_dispatches pd
      WHERE pd.date = $1
        AND pd.status IN ('PROGRAMADO', 'EN_RUTA')
        AND pd.liveu_id IS NOT NULL
    `;

    const despachosResult = await pool.query(despachosQuery, [fecha]);
    const despachos = despachosResult.rows;

    const detalle = equipos.map(equipo => {
      const despacho = despachos.find(d => d.liveu_id === equipo.id);

      // Calcular estado dinámico basado en la fecha consultada
      let status;
      if (despacho) {
        // Si tiene despacho activo en esta fecha, está en terreno
        status = 'EN_TERRENO';
      } else if (equipo.status_base === 'REPARACION') {
        // Mantener REPARACION solo si es estado base (no depende de fecha)
        status = 'REPARACION';
      } else {
        // Sin despacho y no en reparación = disponible
        status = 'DISPONIBLE';
      }

      return {
        id: equipo.id,
        equipment_code: equipo.equipment_code,
        serial_number: equipo.serial_number,
        status: status,
        notes: equipo.notes,
        despacho: despacho ? {
          periodista: despacho.periodista,
          camarografo: despacho.camarografo,
          realizador: despacho.realizador,
          placa_vehiculo: despacho.placa_vehiculo,
          destino: despacho.destino,
          hora_salida: despacho.hora_salida,
          status: despacho.status
        } : null
      };
    });

    console.log(`✅ ${detalle.length} equipos LiveU encontrados`);
    res.json(detalle);
  } catch (error) {
    console.error('❌ Error al obtener detalle de LiveU:', error);
    res.status(500).json({ error: 'Error al obtener detalle de LiveU' });
  }
});

/**
 * GET /api/logistics/liveu/stats?date=YYYY-MM-DD
 * Obtiene estadísticas de equipos LiveU para una fecha específica (o hoy si no se proporciona)
 */
router.get('/liveu/stats', async (req, res) => {
  try {
    // Obtener fecha desde query param o usar fecha actual
    const fecha = req.query.date || new Date().toISOString().split('T')[0];

    // Obtener equipos LiveU activos en despachos para la fecha especificada
    const despachosHoy = await pool.query(`
      SELECT DISTINCT liveu_id
      FROM press_dispatches
      WHERE date = $1
        AND status IN ('PROGRAMADO', 'EN_RUTA')
        AND liveu_id IS NOT NULL
    `, [fecha]);

    const liveuEnTerreno = despachosHoy.rows.map(d => d.liveu_id);

    // Obtener total de equipos y en reparación
    const equiposResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'REPARACION') as en_reparacion,
        COUNT(*) as total
      FROM liveu_equipment
      WHERE is_active = true
    `);

    const { total, en_reparacion } = equiposResult.rows[0];
    const en_terreno = liveuEnTerreno.length;
    const disponibles = parseInt(total) - en_terreno - parseInt(en_reparacion);

    res.json({
      disponibles,
      en_terreno,
      en_reparacion: parseInt(en_reparacion),
      total: parseInt(total)
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas LiveU:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

/**
 * GET /api/logistics/personnel-on-duty/:date
 * Obtiene el personal que está EN TURNO según la rotación del día
 * PRIORIZA este personal en los selectores de despacho
 */
router.get('/personnel-on-duty/:date', async (req, res) => {
  try {
    const { date } = req.params;

    // Obtener la programación del día (usando el endpoint auto-shifts)
    const shiftsResponse = await fetch(`http://localhost:3000/api/schedule/auto-shifts/${date}`);

    if (!shiftsResponse.ok) {
      return res.json({
        journalists: [],
        cameramen: [],
        assistants: [],
        directors: []
      });
    }

    const shifts = await shiftsResponse.json();

    // TODO: Implementar detección de novedades de viaje
    const noveltiesMap = new Map();

    // Extraer IDs únicos de cada área
    const journalistIds = [...new Set(shifts
      .filter(s => s.area === 'PERIODISTAS')
      .map(s => s.personnel_id))];

    const cameramanIds = [...new Set(shifts
      .filter(s => s.area === 'CAMARÓGRAFOS DE REPORTERÍA')
      .map(s => s.personnel_id))];

    const assistantIds = [...new Set(shifts
      .filter(s => s.area === 'ASISTENTES DE REPORTERÍA')
      .map(s => s.personnel_id))];

    const directorIds = [...new Set(shifts
      .filter(s => s.area === 'REALIZADORES')
      .map(s => s.personnel_id))];

    // Obtener datos completos de personal CON información de turno
    const getPersonnel = async (ids, areaName) => {
      if (ids.length === 0) return [];

      // Buscar shifts del día para obtener turno
      const shiftsForArea = shifts.filter(s => s.area === areaName && ids.includes(s.personnel_id));

      const result = await pool.query(`
        SELECT id, name as full_name, area
        FROM personnel
        WHERE id = ANY($1)
        ORDER BY name
      `, [ids]);

      // Agregar información de turno
      return result.rows.map(person => {
        const shift = shiftsForArea.find(s => s.personnel_id === person.id);

        // Determinar el turno basado en shift_start
        let turno = shift?.turno_rotado || null;
        let call_time = shift?.shift_start || null;

        if (!turno && call_time) {
          const hour = parseInt(call_time.substring(0, 2));
          turno = hour < 12 ? 'AM' : 'PM';
        }

        // Verificar si está viajando (bloqueado)
        const noveltyType = noveltiesMap.get(person.id);
        const isBlocked = noveltyType === 'VIAJE';

        return {
          ...person,
          shift_start: call_time,
          shift_end: shift?.shift_end || null,
          turno: turno,
          call_time: call_time, // Usar shift_start como call_time
          is_blocked: isBlocked,
          novelty_tipo: noveltyType || null
        };
      });
    };

    const [journalists, cameramen, assistants, directors] = await Promise.all([
      getPersonnel(journalistIds, 'PERIODISTAS'),
      getPersonnel(cameramanIds, 'CAMARÓGRAFOS DE REPORTERÍA'),
      getPersonnel(assistantIds, 'ASISTENTES DE REPORTERÍA'),
      getPersonnel(directorIds, 'REALIZADORES')
    ]);

    res.json({
      journalists,
      cameramen,
      assistants,
      directors
    });
  } catch (error) {
    console.error('Error obteniendo personal en turno:', error);
    res.status(500).json({ error: 'Error al obtener personal en turno' });
  }
});

/**
 * GET /api/logistics/status/:date
 * Obtiene el estado logístico de todo el personal para una fecha
 */
router.get('/status/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const result = await pool.query(`
      SELECT
        pls.*,
        p.name as personnel_name,
        p.area,
        pd.destination,
        pd.departure_time,
        pd.vehicle_plate
      FROM personnel_logistics_status pls
      JOIN personnel p ON p.id = pls.personnel_id
      LEFT JOIN press_dispatches pd ON pd.id = pls.dispatch_id
      WHERE pls.date = $1
      ORDER BY pls.logistics_status, p.area, p.name
    `, [date]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error obteniendo estado logístico:', error);
    res.status(500).json({ error: 'Error al obtener estado logístico' });
  }
});

/**
 * GET /api/logistics/dashboard/:date
 * Dashboard completo: Personal y LiveU
 */
router.get('/dashboard/:date', async (req, res) => {
  try {
    const { date } = req.params;

    // Estadísticas de personal por área
    const personnelStats = await pool.query(`
      SELECT
        p.area,
        COUNT(*) FILTER (WHERE pls.logistics_status = 'EN_CANAL') as en_canal,
        COUNT(*) FILTER (WHERE pls.logistics_status = 'EN_TERRENO') as en_terreno,
        COUNT(*) FILTER (WHERE pls.logistics_status = 'DESCANSO') as descanso,
        COUNT(*) as total_programado
      FROM personnel p
      LEFT JOIN personnel_logistics_status pls ON pls.personnel_id = p.id AND pls.date = $1
      WHERE p.area IN ('PERIODISTAS', 'CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA', 'REALIZADORES')
      GROUP BY p.area
      ORDER BY p.area
    `, [date]);

    // Estadísticas de LiveU
    const liveuStats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'DISPONIBLE') as disponibles,
        COUNT(*) FILTER (WHERE status = 'EN_TERRENO') as en_terreno,
        COUNT(*) FILTER (WHERE status = 'REPARACION') as en_reparacion,
        COUNT(*) as total
      FROM liveu_equipment
      WHERE is_active = true
    `);

    // Despachos activos
    const activeDispatches = await pool.query(`
      SELECT
        pd.*,
        fv.vehicle_code,
        le.equipment_code as liveu_code
      FROM press_dispatches pd
      JOIN fleet_vehicles fv ON fv.id = pd.vehicle_id
      LEFT JOIN liveu_equipment le ON le.id = pd.liveu_id
      WHERE pd.date = $1 AND pd.status IN ('PROGRAMADO', 'EN_RUTA')
      ORDER BY pd.departure_time
    `, [date]);

    res.json({
      personnel: personnelStats.rows,
      liveu: liveuStats.rows[0],
      active_dispatches: activeDispatches.rows
    });
  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
});

module.exports = router;
