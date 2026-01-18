const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// GET - Obtener todas las asignaciones de reportería
router.get('/', async (req, res) => {
  try {
    const { fecha } = req.query;

    let query = `
      SELECT ar.*, p.name as personal_nombre, p.area as personal_area
      FROM asignaciones_reporteria ar
      LEFT JOIN personnel p ON ar.id_personal = p.id
      WHERE 1=1
    `;
    const params = [];

    if (fecha) {
      query += ` AND ar.fecha = $1`;
      params.push(fecha);
    }

    query += ` ORDER BY ar.fecha DESC, ar.id_personal, ar.numero_salida ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener asignaciones de reportería:', error);
    res.status(500).json({ error: 'Error al obtener asignaciones de reportería' });
  }
});

// GET - Obtener asignaciones por fecha (agrupadas por personal)
router.get('/fecha/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;

    const result = await pool.query(
      `SELECT ar.*, p.name as personal_nombre, p.area as personal_area
       FROM asignaciones_reporteria ar
       LEFT JOIN personnel p ON ar.id_personal = p.id
       WHERE ar.fecha = $1
       ORDER BY ar.id_personal, ar.numero_salida ASC`,
      [fecha]
    );

    // Agrupar por personal
    const agrupado = result.rows.reduce((acc, asignacion) => {
      const personalId = asignacion.id_personal;
      if (!acc[personalId]) {
        acc[personalId] = {
          id_personal: personalId,
          personal_nombre: asignacion.personal_nombre,
          personal_area: asignacion.personal_area,
          asignaciones: []
        };
      }
      acc[personalId].asignaciones.push(asignacion);
      return acc;
    }, {});

    res.json(Object.values(agrupado));
  } catch (error) {
    console.error('Error al obtener asignaciones por fecha:', error);
    res.status(500).json({ error: 'Error al obtener asignaciones por fecha' });
  }
});

// GET - Obtener conteo de disponibilidad (En Canal) - Separado por camarógrafos y asistentes
router.get('/disponibilidad/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;

    // Usar auto-shifts para obtener personal con turno HOY (respeta rotación GRUPO_A/GRUPO_B)
    const autoShiftsResponse = await fetch(`http://localhost:3000/api/schedule/auto-shifts/${fecha}`);
    const shifts = await autoShiftsResponse.json();

    // Contar camarógrafos y asistentes que tienen turno HOY
    const camarasConTurno = shifts.filter(s => s.area === 'CAMARÓGRAFOS DE REPORTERÍA');
    const asistentesConTurno = shifts.filter(s => s.area === 'ASISTENTES DE REPORTERÍA');

    const totalCamarografosTurno = camarasConTurno.length;
    const totalAsistentesTurno = asistentesConTurno.length;

    // Obtener IDs de personal con turno
    const camarasIds = camarasConTurno.map(s => s.personnel_id);
    const asistentesIds = asistentesConTurno.map(s => s.personnel_id);

    // Obtener camarógrafos ocupados (En Trayecto o En Locación)
    let ocupadosCamarografos = 0;
    if (camarasIds.length > 0) {
      const camarografosOcupadosResult = await pool.query(
        `SELECT COUNT(DISTINCT ar.id_personal) as ocupados
         FROM asignaciones_reporteria ar
         WHERE ar.fecha = $1
           AND ar.estatus IN ('En Trayecto', 'En Locación')
           AND ar.id_personal = ANY($2::int[])`,
        [fecha, camarasIds]
      );
      ocupadosCamarografos = parseInt(camarografosOcupadosResult.rows[0].ocupados);
    }

    // Obtener asistentes ocupados (En Trayecto o En Locación)
    let ocupadosAsistentes = 0;
    if (asistentesIds.length > 0) {
      const asistentesOcupadosResult = await pool.query(
        `SELECT COUNT(DISTINCT ar.id_personal) as ocupados
         FROM asignaciones_reporteria ar
         WHERE ar.fecha = $1
           AND ar.estatus IN ('En Trayecto', 'En Locación')
           AND ar.id_personal = ANY($2::int[])`,
        [fecha, asistentesIds]
      );
      ocupadosAsistentes = parseInt(asistentesOcupadosResult.rows[0].ocupados);
    }

    const disponiblesCamarografos = totalCamarografosTurno - ocupadosCamarografos;
    const disponiblesAsistentes = totalAsistentesTurno - ocupadosAsistentes;

    const total = totalCamarografosTurno + totalAsistentesTurno;
    const disponibles = disponiblesCamarografos + disponiblesAsistentes;
    const ocupados = ocupadosCamarografos + ocupadosAsistentes;

    res.json({
      total,
      disponibles,
      ocupados,
      porcentaje: total > 0 ? Math.round((disponibles / total) * 100) : 0,
      // Datos separados por área
      camarografos_total: totalCamarografosTurno,
      camarografos_disponibles: disponiblesCamarografos,
      camarografos_ocupados: ocupadosCamarografos,
      asistentes_total: totalAsistentesTurno,
      asistentes_disponibles: disponiblesAsistentes,
      asistentes_ocupados: ocupadosAsistentes
    });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
});

// POST - Crear o actualizar asignación (UPSERT para evitar 409)
router.post('/', async (req, res) => {
  try {
    const {
      id_personal,
      fecha,
      numero_salida,
      hora_salida,
      destino,
      producto,
      estatus,
      fuera_ciudad,
      dias_bloqueado,
      fecha_retorno,
      notas
    } = req.body;

    // Validaciones
    if (!id_personal || !fecha || !numero_salida || !hora_salida || !destino || !producto) {
      return res.status(400).json({
        error: 'Faltan campos requeridos'
      });
    }

    // UPSERT: Si existe, actualiza; si no existe, crea
    const result = await pool.query(
      `INSERT INTO asignaciones_reporteria
       (id_personal, fecha, numero_salida, hora_salida, destino, producto, estatus, fuera_ciudad, dias_bloqueado, fecha_retorno, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id_personal, fecha, numero_salida)
       DO UPDATE SET
         hora_salida = EXCLUDED.hora_salida,
         destino = EXCLUDED.destino,
         producto = EXCLUDED.producto,
         estatus = EXCLUDED.estatus,
         fuera_ciudad = EXCLUDED.fuera_ciudad,
         dias_bloqueado = EXCLUDED.dias_bloqueado,
         fecha_retorno = EXCLUDED.fecha_retorno,
         notas = EXCLUDED.notas,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [id_personal, fecha, numero_salida, hora_salida, destino, producto, estatus || 'En Canal', fuera_ciudad || false, dias_bloqueado || 0, fecha_retorno, notas]
    );

    // Emitir evento WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`date-${fecha}`).emit('asignacion-reporteria-updated', {
        asignacion: result.rows[0],
        fecha
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear/actualizar asignación:', error);
    res.status(500).json({ error: 'Error al procesar asignación' });
  }
});

// PUT - Actualizar asignación
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      hora_salida,
      destino,
      producto,
      estatus,
      fuera_ciudad,
      dias_bloqueado,
      fecha_retorno,
      notas
    } = req.body;

    const result = await pool.query(
      `UPDATE asignaciones_reporteria
       SET hora_salida = COALESCE($1, hora_salida),
           destino = COALESCE($2, destino),
           producto = COALESCE($3, producto),
           estatus = COALESCE($4, estatus),
           fuera_ciudad = COALESCE($5, fuera_ciudad),
           dias_bloqueado = COALESCE($6, dias_bloqueado),
           fecha_retorno = COALESCE($7, fecha_retorno),
           notas = COALESCE($8, notas),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [hora_salida, destino, producto, estatus, fuera_ciudad, dias_bloqueado, fecha_retorno, notas, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    // Emitir evento WebSocket
    const io = req.app.get('io');
    if (io) {
      const fecha = result.rows[0].fecha;
      io.to(`date-${fecha}`).emit('asignacion-reporteria-updated', {
        asignacion: result.rows[0],
        fecha
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar asignación:', error);
    res.status(500).json({ error: 'Error al actualizar asignación' });
  }
});

// DELETE - Eliminar asignación
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM asignaciones_reporteria WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    // Emitir evento WebSocket
    const io = req.app.get('io');
    if (io) {
      const fecha = result.rows[0].fecha;
      io.to(`date-${fecha}`).emit('asignacion-reporteria-deleted', {
        asignacionId: id,
        fecha
      });
    }

    res.json({ message: 'Asignación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ error: 'Error al eliminar asignación' });
  }
});

module.exports = router;
