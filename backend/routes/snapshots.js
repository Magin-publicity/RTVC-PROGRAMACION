const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * POST /api/snapshots/save/:date
 * Guarda un snapshot de la programación de un día específico
 *
 * Body esperado:
 * {
 *   shifts: [
 *     {
 *       area: "AUDIO",
 *       personnel_id: 123,
 *       personnel_name: "John Valencia",
 *       personnel_role: "Operador consola de sonido",
 *       shift_number: 1,
 *       shift_start_time: "05:00",
 *       shift_end_time: "10:00",
 *       shift_label: "T1 05:00 (Apertura)",
 *       status: "ACTIVO",
 *       notes: "CAPACITACION ESTUDIO 1 DOS HORAS"
 *     },
 *     ...
 *   ],
 *   rotation_week: 3,
 *   notes: "Programación con capacitaciones obligatorias"
 * }
 */
router.post('/save/:date', async (req, res) => {
  const client = await pool.connect();

  try {
    const { date } = req.params;
    const { shifts, rotation_week, notes } = req.body;
    const user_id = req.user?.id; // Asumiendo que tienes middleware de auth

    console.log(`📸 Guardando snapshot para ${date}...`);
    console.log(`   Total de asignaciones: ${shifts?.length || 0}`);

    if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de shifts' });
    }

    await client.query('BEGIN');

    // 1. Verificar si ya existe un snapshot para esta fecha
    const existingSnapshotResult = await client.query(
      'SELECT id, is_locked FROM snapshot_metadata WHERE snapshot_date = $1',
      [date]
    );

    if (existingSnapshotResult.rows.length > 0 && existingSnapshotResult.rows[0].is_locked) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        error: 'El snapshot de esta fecha está bloqueado y no se puede modificar',
        snapshot_date: date
      });
    }

    // 2. Eliminar snapshot anterior si existe (para permitir sobreescritura)
    if (existingSnapshotResult.rows.length > 0) {
      console.log(`   ♻️  Eliminando snapshot anterior para ${date}...`);
      await client.query('DELETE FROM shift_snapshots WHERE snapshot_date = $1', [date]);
      await client.query('DELETE FROM snapshot_metadata WHERE snapshot_date = $1', [date]);
    }

    // 3. Insertar todas las asignaciones
    console.log(`   💾 Insertando ${shifts.length} asignaciones...`);

    const insertPromises = shifts.map(shift => {
      return client.query(`
        INSERT INTO shift_snapshots (
          snapshot_date, area, personnel_id, personnel_name, personnel_role,
          shift_number, shift_start_time, shift_end_time, shift_label,
          shift_description, status, notes, rotation_week, saved_by,
          is_weekend
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      `, [
        date,
        shift.area,
        shift.personnel_id || null,
        shift.personnel_name,
        shift.personnel_role || null,
        shift.shift_number,
        shift.shift_start_time,
        shift.shift_end_time || null,
        shift.shift_label || `T${shift.shift_number}`,
        shift.shift_description || null,
        shift.status || 'ACTIVO',
        shift.notes || null,
        rotation_week || null,
        user_id || null,
        shift.is_weekend || false
      ]);
    });

    await Promise.all(insertPromises);

    // 4. Crear metadata del snapshot
    const areasCount = new Set(shifts.map(s => s.area)).size;

    await client.query(`
      INSERT INTO snapshot_metadata (
        snapshot_date, saved_by, total_personnel, total_areas, notes
      ) VALUES ($1, $2, $3, $4, $5)
    `, [date, user_id || null, shifts.length, areasCount, notes || null]);

    await client.query('COMMIT');

    console.log(`   ✅ Snapshot guardado exitosamente`);
    console.log(`      - ${shifts.length} asignaciones`);
    console.log(`      - ${areasCount} áreas`);

    res.json({
      success: true,
      message: `Snapshot guardado para ${date}`,
      snapshot: {
        date,
        total_shifts: shifts.length,
        total_areas: areasCount,
        rotation_week
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error guardando snapshot:', error);
    res.status(500).json({ error: 'Error al guardar snapshot', details: error.message });
  } finally {
    client.release();
  }
});

/**
 * GET /api/snapshots/list
 * Obtiene la lista de todos los snapshots guardados (para la Máquina del Tiempo)
 */
router.get('/list', async (req, res) => {
  try {
    console.log(`📚 Consultando lista de snapshots...`);

    const result = await pool.query(`
      SELECT
        snapshot_date,
        saved_at,
        saved_by,
        total_personnel,
        total_areas,
        is_locked,
        notes
      FROM snapshot_metadata
      ORDER BY snapshot_date DESC
    `);

    const snapshots = result.rows;

    // Calcular estadísticas
    const stats = {
      totalDays: snapshots.length,
      oldestDate: snapshots.length > 0 ? snapshots[snapshots.length - 1].snapshot_date : null,
      newestDate: snapshots.length > 0 ? snapshots[0].snapshot_date : null
    };

    console.log(`   ✅ ${snapshots.length} snapshots encontrados`);

    res.json({
      snapshots,
      stats
    });

  } catch (error) {
    console.error('❌ Error consultando lista de snapshots:', error);
    res.status(500).json({ error: 'Error al consultar lista de snapshots', details: error.message });
  }
});

/**
 * GET /api/snapshots/:date
 * Obtiene el snapshot de una fecha específica
 */
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;

    console.log(`📖 Consultando snapshot para ${date}...`);

    // 1. Verificar si existe snapshot para esta fecha
    const metadataResult = await pool.query(
      'SELECT * FROM snapshot_metadata WHERE snapshot_date = $1',
      [date]
    );

    if (metadataResult.rows.length === 0) {
      return res.json({
        exists: false,
        message: `No existe snapshot para ${date}`,
        date
      });
    }

    // 2. Obtener todas las asignaciones del snapshot
    const shiftsResult = await pool.query(`
      SELECT *
      FROM shift_snapshots
      WHERE snapshot_date = $1
      ORDER BY area, shift_number
    `, [date]);

    console.log(`   ✅ Snapshot encontrado: ${shiftsResult.rows.length} asignaciones`);

    res.json({
      exists: true,
      metadata: metadataResult.rows[0],
      shifts: shiftsResult.rows,
      total_shifts: shiftsResult.rows.length
    });

  } catch (error) {
    console.error('❌ Error consultando snapshot:', error);
    res.status(500).json({ error: 'Error al consultar snapshot', details: error.message });
  }
});

/**
 * GET /api/snapshots/:date/by-area/:area
 * Obtiene las asignaciones de un área específica en una fecha
 */
router.get('/:date/by-area/:area', async (req, res) => {
  try {
    const { date, area } = req.params;

    const result = await pool.query(`
      SELECT *
      FROM shift_snapshots
      WHERE snapshot_date = $1 AND area = $2
      ORDER BY shift_number
    `, [date, area]);

    res.json({
      date,
      area,
      shifts: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Error consultando snapshot por área:', error);
    res.status(500).json({ error: 'Error al consultar snapshot por área' });
  }
});

/**
 * POST /api/snapshots/:date/lock
 * Bloquea un snapshot para que no pueda ser modificado
 */
router.post('/:date/lock', async (req, res) => {
  try {
    const { date } = req.params;

    const result = await pool.query(`
      UPDATE snapshot_metadata
      SET is_locked = true
      WHERE snapshot_date = $1
      RETURNING *
    `, [date]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `No existe snapshot para ${date}` });
    }

    console.log(`🔒 Snapshot bloqueado para ${date}`);
    res.json({
      success: true,
      message: `Snapshot de ${date} bloqueado exitosamente`,
      metadata: result.rows[0]
    });

  } catch (error) {
    console.error('Error bloqueando snapshot:', error);
    res.status(500).json({ error: 'Error al bloquear snapshot' });
  }
});

/**
 * DELETE /api/snapshots/:date
 * Elimina un snapshot (solo si no está bloqueado)
 */
router.delete('/:date', async (req, res) => {
  const client = await pool.connect();

  try {
    const { date } = req.params;

    await client.query('BEGIN');

    // Verificar si está bloqueado
    const metadataResult = await client.query(
      'SELECT is_locked FROM snapshot_metadata WHERE snapshot_date = $1',
      [date]
    );

    if (metadataResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: `No existe snapshot para ${date}` });
    }

    if (metadataResult.rows[0].is_locked) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'El snapshot está bloqueado y no se puede eliminar' });
    }

    // Eliminar snapshot
    await client.query('DELETE FROM shift_snapshots WHERE snapshot_date = $1', [date]);
    await client.query('DELETE FROM snapshot_metadata WHERE snapshot_date = $1', [date]);

    await client.query('COMMIT');

    console.log(`🗑️  Snapshot eliminado: ${date}`);
    res.json({
      success: true,
      message: `Snapshot de ${date} eliminado exitosamente`
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error eliminando snapshot:', error);
    res.status(500).json({ error: 'Error al eliminar snapshot' });
  } finally {
    client.release();
  }
});

module.exports = router;
