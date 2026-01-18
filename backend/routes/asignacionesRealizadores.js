const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// GET - Obtener todas las asignaciones de realizadores
router.get('/', async (req, res) => {
  try {
    const { fecha } = req.query;

    let query = `
      SELECT ar.*, p.name as personal_nombre, p.area as personal_area
      FROM asignaciones_realizadores ar
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
    console.error('Error al obtener asignaciones de realizadores:', error);
    res.status(500).json({ error: 'Error al obtener asignaciones de realizadores' });
  }
});

// GET - Obtener asignaciones por fecha (agrupadas por personal)
router.get('/fecha/:fecha', async (req, res) => {
  try {
    const { fecha} = req.params;

    const result = await pool.query(
      `SELECT ar.*, p.name as personal_nombre, p.area as personal_area
       FROM asignaciones_realizadores ar
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

// GET - Obtener conteo de disponibilidad (En Canal)
router.get('/disponibilidad/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;

    // Obtener todos los realizadores
    const personalResult = await pool.query(
      `SELECT COUNT(*) as total
       FROM personnel
       WHERE area = 'REALIZADORES'`
    );

    // Obtener los que NO están En Canal (están en Trayecto o Locación)
    const ocupadosResult = await pool.query(
      `SELECT COUNT(DISTINCT id_personal) as ocupados
       FROM asignaciones_realizadores
       WHERE fecha = $1 AND estatus IN ('En Trayecto', 'En Locación')`,
      [fecha]
    );

    // 🆕 RESTAR realizadores en despachos activos
    const realizadoresEnDespachosResult = await pool.query(
      `SELECT COUNT(DISTINCT director_id) as en_despachos
       FROM press_dispatches
       WHERE date = $1
         AND status IN ('PROGRAMADO', 'EN_RUTA')
         AND director_id IS NOT NULL`,
      [fecha]
    );

    const total = parseInt(personalResult.rows[0].total);
    const ocupadosEnAsignaciones = parseInt(ocupadosResult.rows[0].ocupados);
    const realizadoresEnDespachos = parseInt(realizadoresEnDespachosResult.rows[0].en_despachos);
    const totalOcupados = ocupadosEnAsignaciones + realizadoresEnDespachos;
    const disponibles = total - totalOcupados;

    res.json({
      total,
      disponibles,
      ocupados: totalOcupados,
      en_asignaciones: ocupadosEnAsignaciones,
      en_despachos: realizadoresEnDespachos,
      porcentaje: total > 0 ? Math.round((disponibles / total) * 100) : 0
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
      `INSERT INTO asignaciones_realizadores
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
      io.to(`date-${fecha}`).emit('asignacion-realizadores-updated', {
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
      `UPDATE asignaciones_realizadores
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
      io.to(`date-${fecha}`).emit('asignacion-realizadores-updated', {
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

    const result = await pool.query('DELETE FROM asignaciones_realizadores WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }

    // Emitir evento WebSocket
    const io = req.app.get('io');
    if (io) {
      const fecha = result.rows[0].fecha;
      io.to(`date-${fecha}`).emit('asignacion-realizadores-deleted', {
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

// GET - Detalle de Realizadores para el Dashboard
router.get('/detalle/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    console.log(`🎬 Obteniendo detalle de realizadores para ${fecha}`);

    // Obtener todos los realizadores activos
    const realizadoresQuery = `
      SELECT
        p.id,
        p.name as nombre,
        p.role as cargo
      FROM personnel p
      WHERE p.role = 'Realizador'
        AND p.active = true
      ORDER BY p.name
    `;

    const result = await pool.query(realizadoresQuery);
    const realizadores = result.rows;

    // 🔄 Obtener turnos en TIEMPO REAL desde auto-shifts
    const http = require('http');
    let autoShifts = [];
    try {
      const shiftsResponse = await new Promise((resolve, reject) => {
        http.get(`http://localhost:3000/api/schedule/auto-shifts/${fecha}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve([]);
            }
          });
        }).on('error', reject);
      });
      autoShifts = shiftsResponse || [];
    } catch (error) {
      console.log('   ⚠️ No se pudieron obtener turnos automáticos');
    }

    // Crear mapa de turnos
    const autoShiftsMap = {};
    autoShifts.forEach(shift => {
      if (shift.area === 'REALIZADORES') {
        autoShiftsMap[shift.personnel_id] = shift;
      }
    });

    // Obtener asignaciones para esta fecha
    const asignacionesQuery = `
      SELECT
        a.id_personal,
        a.hora_salida,
        a.destino,
        a.producto,
        a.estatus
      FROM asignaciones_realizadores a
      WHERE a.fecha = $1
    `;

    const asignacionesResult = await pool.query(asignacionesQuery, [fecha]);
    const asignaciones = asignacionesResult.rows;

    // 🆕 TAMBIÉN buscar en press_dispatches para despachos activos
    const despachosQuery = `
      SELECT
        director_id as id_personal,
        departure_time as hora_salida,
        destination as destino,
        notes as producto,
        status as estatus,
        vehicle_plate as vehiculo,
        liveu_code as liveu,
        journalist_name as periodista,
        cameraman_name as camarografo,
        assistant_name as asistente,
        driver_name as conductor
      FROM press_dispatches
      WHERE date = $1
        AND status IN ('PROGRAMADO', 'EN_RUTA')
        AND director_id IS NOT NULL
    `;
    const despachosResult = await pool.query(despachosQuery, [fecha]);
    const despachos = despachosResult.rows;

    // Enriquecer la información
    const detalle = realizadores.map(real => {
      const asignacionRealizador = asignaciones.find(a => a.id_personal === real.id);
      const despachoRealizador = despachos.find(d => d.id_personal === real.id);
      const autoShift = autoShiftsMap[real.id];

      // Priorizar despacho activo sobre asignación
      const asignacion = despachoRealizador || asignacionRealizador;

      // Determinar estado
      let estado = 'EN_CANAL';
      if (asignacion) {
        if (asignacion.estatus === 'En Canal') {
          estado = 'EN_CANAL';
        } else if (asignacion.estatus === 'En Trayecto' || asignacion.estatus === 'En Locación' || asignacion.estatus === 'PROGRAMADO' || asignacion.estatus === 'EN_RUTA') {
          estado = 'EN_TERRENO';
        }
      }

      // Obtener turno y hora de llamado del auto-shift
      let turnoNombre = 'N/A';
      let horaLlamado = 'N/A';

      if (autoShift) {
        const shiftStartHour = parseInt(autoShift.shift_start.split(':')[0]);
        turnoNombre = shiftStartHour < 12 ? 'MAÑANA' :
                      shiftStartHour < 18 ? 'TARDE' : 'NOCHE';
        horaLlamado = autoShift.shift_start.substring(0, 5);
      }

      return {
        id: real.id,
        nombre: real.nombre,
        cargo: real.cargo,
        turno: turnoNombre,
        hora_llamado: horaLlamado,
        estado: estado,
        despacho: asignacion ? {
          destino: asignacion.destino,
          producto: asignacion.producto,
          estatus: asignacion.estatus,
          vehiculo: asignacion.vehiculo,
          liveu: asignacion.liveu,
          periodista: asignacion.periodista,
          camarografo: asignacion.camarografo,
          asistente: asignacion.asistente,
          conductor: asignacion.conductor,
          hora_salida: asignacion.hora_salida
        } : null
      };
    });

    // Filtrar solo los que tienen turno programado y ordenar por hora de llamado
    const detalleConTurno = detalle
      .filter(d => d.turno !== 'N/A')
      .sort((a, b) => {
        if (a.hora_llamado === 'N/A') return 1;
        if (b.hora_llamado === 'N/A') return -1;
        return a.hora_llamado.localeCompare(b.hora_llamado);
      });

    res.json(detalleConTurno);
  } catch (error) {
    console.error('❌ Error al obtener detalle de realizadores:', error);
    res.status(500).json({ error: 'Error al obtener detalle de realizadores' });
  }
});

module.exports = router;
