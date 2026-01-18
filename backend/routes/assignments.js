const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// GET - Obtener todas las asignaciones
router.get('/', async (req, res) => {
  try {
    const { fecha, estado, id_personal, id_programa, id_estudio, id_master } = req.query;

    let query = `
      SELECT pa.*,
             pe.name as personal_nombre, pe.area as personal_area,
             pr.nombre as programa_nombre,
             e.nombre as estudio_nombre, e.codigo as estudio_codigo,
             m.nombre as master_nombre, m.codigo as master_codigo
      FROM personal_asignado pa
      LEFT JOIN personnel pe ON pa.id_personal = pe.id
      LEFT JOIN programas pr ON pa.id_programa = pr.id
      LEFT JOIN estudios e ON pa.id_estudio = e.id
      LEFT JOIN masters m ON pa.id_master = m.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 1;

    if (fecha) {
      query += ` AND pa.fecha = $${paramCount}`;
      params.push(fecha);
      paramCount++;
    }

    if (estado) {
      query += ` AND pa.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    if (id_personal) {
      query += ` AND pa.id_personal = $${paramCount}`;
      params.push(id_personal);
      paramCount++;
    }

    if (id_programa) {
      query += ` AND pa.id_programa = $${paramCount}`;
      params.push(id_programa);
      paramCount++;
    }

    if (id_estudio) {
      query += ` AND pa.id_estudio = $${paramCount}`;
      params.push(id_estudio);
      paramCount++;
    }

    if (id_master) {
      query += ` AND pa.id_master = $${paramCount}`;
      params.push(id_master);
      paramCount++;
    }

    query += ' ORDER BY pa.fecha DESC, pa.hora_inicio ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({ error: 'Error al obtener asignaciones' });
  }
});

// GET - Obtener una asignación por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT pa.*,
              pe.name as personal_nombre, pe.area as personal_area,
              pr.nombre as programa_nombre,
              e.nombre as estudio_nombre, e.codigo as estudio_codigo,
              m.nombre as master_nombre, m.codigo as master_codigo
       FROM personal_asignado pa
       LEFT JOIN personnel pe ON pa.id_personal = pe.id
       LEFT JOIN programas pr ON pa.id_programa = pr.id
       LEFT JOIN estudios e ON pa.id_estudio = e.id
       LEFT JOIN masters m ON pa.id_master = m.id
       WHERE pa.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener asignación:', error);
    res.status(500).json({ error: 'Error al obtener asignación' });
  }
});

// POST - Crear una nueva asignación
router.post('/', async (req, res) => {
  try {
    const {
      id_personal,
      id_programa,
      id_estudio,
      id_master,
      fecha,
      hora_inicio,
      hora_fin,
      rol,
      estado,
      notas
    } = req.body;

    // Validaciones
    if (!id_personal || !fecha || !hora_inicio || !hora_fin) {
      return res.status(400).json({
        error: 'Personal, fecha, hora de inicio y fin son requeridos'
      });
    }

    // Validar que al menos tenga un programa, estudio o master asignado
    if (!id_programa && !id_estudio && !id_master) {
      return res.status(400).json({
        error: 'La asignación debe tener al menos un programa, estudio o master'
      });
    }

    // Validar horarios
    if (hora_inicio >= hora_fin) {
      return res.status(400).json({
        error: 'La hora de fin debe ser posterior a la hora de inicio'
      });
    }

    // Verificar que el personal existe
    const personnelCheck = await pool.query('SELECT id FROM personnel WHERE id = $1', [id_personal]);
    if (personnelCheck.rows.length === 0) {
      return res.status(404).json({ error: 'El personal especificado no existe' });
    }

    // Verificar que el programa existe si se proporciona
    if (id_programa) {
      const programCheck = await pool.query('SELECT id FROM programas WHERE id = $1', [id_programa]);
      if (programCheck.rows.length === 0) {
        return res.status(404).json({ error: 'El programa especificado no existe' });
      }
    }

    // Verificar que el estudio existe si se proporciona
    if (id_estudio) {
      const studioCheck = await pool.query('SELECT id FROM estudios WHERE id = $1', [id_estudio]);
      if (studioCheck.rows.length === 0) {
        return res.status(404).json({ error: 'El estudio especificado no existe' });
      }
    }

    // Verificar que el master existe si se proporciona
    if (id_master) {
      const masterCheck = await pool.query('SELECT id FROM masters WHERE id = $1', [id_master]);
      if (masterCheck.rows.length === 0) {
        return res.status(404).json({ error: 'El master especificado no existe' });
      }
    }

    // Verificar conflictos de horario para el personal
    const conflictCheck = await pool.query(
      `SELECT id FROM personal_asignado
       WHERE id_personal = $1
         AND fecha = $2
         AND estado != 'cancelado'
         AND (
           (hora_inicio <= $3 AND hora_fin > $3)
           OR (hora_inicio < $4 AND hora_fin >= $4)
           OR (hora_inicio >= $3 AND hora_fin <= $4)
         )`,
      [id_personal, fecha, hora_inicio, hora_fin]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(409).json({
        error: 'El personal ya tiene una asignación en ese horario'
      });
    }

    const result = await pool.query(
      `INSERT INTO personal_asignado
       (id_personal, id_programa, id_estudio, id_master, fecha, hora_inicio, hora_fin, rol, estado, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id_personal,
        id_programa || null,
        id_estudio || null,
        id_master || null,
        fecha,
        hora_inicio,
        hora_fin,
        rol || null,
        estado || 'programado',
        notas || null
      ]
    );

    // Emitir evento WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`date-${fecha}`).emit('assignment-created', {
        assignment: result.rows[0],
        fecha
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear asignación:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Ya existe una asignación para este personal en ese horario' });
    } else {
      res.status(500).json({ error: 'Error al crear asignación' });
    }
  }
});

// PUT - Actualizar una asignación
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_personal,
      id_programa,
      id_estudio,
      id_master,
      fecha,
      hora_inicio,
      hora_fin,
      rol,
      estado,
      notas
    } = req.body;

    // Verificar que la asignación existe
    const existingAssignment = await pool.query('SELECT * FROM personal_asignado WHERE id = $1', [id]);
    if (existingAssignment.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    const currentAssignment = existingAssignment.rows[0];

    // Validar horarios si se proporcionan
    const newInicio = hora_inicio || currentAssignment.hora_inicio;
    const newFin = hora_fin || currentAssignment.hora_fin;
    if (newInicio >= newFin) {
      return res.status(400).json({
        error: 'La hora de fin debe ser posterior a la hora de inicio'
      });
    }

    // Verificar que el personal existe si se proporciona
    if (id_personal) {
      const personnelCheck = await pool.query('SELECT id FROM personnel WHERE id = $1', [id_personal]);
      if (personnelCheck.rows.length === 0) {
        return res.status(404).json({ error: 'El personal especificado no existe' });
      }
    }

    // Verificar conflictos de horario si se está cambiando el horario o el personal
    if (id_personal || fecha || hora_inicio || hora_fin) {
      const checkPersonal = id_personal || currentAssignment.id_personal;
      const checkFecha = fecha || currentAssignment.fecha;
      const checkInicio = hora_inicio || currentAssignment.hora_inicio;
      const checkFin = hora_fin || currentAssignment.hora_fin;

      const conflictCheck = await pool.query(
        `SELECT id FROM personal_asignado
         WHERE id_personal = $1
           AND fecha = $2
           AND id != $3
           AND estado != 'cancelado'
           AND (
             (hora_inicio <= $4 AND hora_fin > $4)
             OR (hora_inicio < $5 AND hora_fin >= $5)
             OR (hora_inicio >= $4 AND hora_fin <= $5)
           )`,
        [checkPersonal, checkFecha, id, checkInicio, checkFin]
      );

      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({
          error: 'El personal ya tiene una asignación en ese horario'
        });
      }
    }

    const result = await pool.query(
      `UPDATE personal_asignado
       SET id_personal = COALESCE($1, id_personal),
           id_programa = COALESCE($2, id_programa),
           id_estudio = COALESCE($3, id_estudio),
           id_master = COALESCE($4, id_master),
           fecha = COALESCE($5, fecha),
           hora_inicio = COALESCE($6, hora_inicio),
           hora_fin = COALESCE($7, hora_fin),
           rol = COALESCE($8, rol),
           estado = COALESCE($9, estado),
           notas = COALESCE($10, notas),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [id_personal, id_programa, id_estudio, id_master, fecha, hora_inicio, hora_fin, rol, estado, notas, id]
    );

    // Emitir evento WebSocket
    const io = req.app.get('io');
    if (io) {
      const updatedFecha = result.rows[0].fecha;
      io.to(`date-${updatedFecha}`).emit('assignment-updated', {
        assignment: result.rows[0],
        fecha: updatedFecha
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    res.status(500).json({ error: 'Error al actualizar asignación' });
  }
});

// DELETE - Eliminar una asignación
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM personal_asignado WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    // Emitir evento WebSocket
    const io = req.app.get('io');
    if (io) {
      const deletedFecha = result.rows[0].fecha;
      io.to(`date-${deletedFecha}`).emit('assignment-deleted', {
        assignmentId: id,
        fecha: deletedFecha
      });
    }

    res.json({ message: 'Asignación eliminada exitosamente', asignacion: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ error: 'Error al eliminar asignación' });
  }
});

// GET - Obtener resumen de asignaciones por día
router.get('/resumen/dia/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;

    // Obtener todas las asignaciones del día agrupadas
    const result = await pool.query(
      `SELECT
         e.id as estudio_id, e.nombre as estudio_nombre, e.codigo as estudio_codigo,
         m.id as master_id, m.nombre as master_nombre, m.codigo as master_codigo,
         pr.id as programa_id, pr.nombre as programa_nombre,
         COUNT(pa.id) as total_asignaciones,
         jsonb_agg(
           jsonb_build_object(
             'id', pa.id,
             'personal_nombre', pe.name,
             'personal_area', pe.area,
             'hora_inicio', pa.hora_inicio,
             'hora_fin', pa.hora_fin,
             'rol', pa.rol,
             'estado', pa.estado
           )
         ) as asignaciones
       FROM personal_asignado pa
       LEFT JOIN personnel pe ON pa.id_personal = pe.id
       LEFT JOIN programas pr ON pa.id_programa = pr.id
       LEFT JOIN estudios e ON pa.id_estudio = e.id
       LEFT JOIN masters m ON pa.id_master = m.id
       WHERE pa.fecha = $1
       GROUP BY e.id, e.nombre, e.codigo, m.id, m.nombre, m.codigo, pr.id, pr.nombre
       ORDER BY e.nombre, m.nombre, pr.nombre`,
      [fecha]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener resumen de asignaciones:', error);
    res.status(500).json({ error: 'Error al obtener resumen de asignaciones' });
  }
});

// PATCH - Cambiar estado de una asignación
router.patch('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'El estado es requerido' });
    }

    const validEstados = ['programado', 'en_curso', 'completado', 'cancelado'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json({
        error: 'Estado inválido. Debe ser: programado, en_curso, completado o cancelado'
      });
    }

    const result = await pool.query(
      `UPDATE personal_asignado
       SET estado = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    // Emitir evento WebSocket
    const io = req.app.get('io');
    if (io) {
      const updatedFecha = result.rows[0].fecha;
      io.to(`date-${updatedFecha}`).emit('assignment-updated', {
        assignment: result.rows[0],
        fecha: updatedFecha
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al cambiar estado de asignación:', error);
    res.status(500).json({ error: 'Error al cambiar estado de asignación' });
  }
});

module.exports = router;
