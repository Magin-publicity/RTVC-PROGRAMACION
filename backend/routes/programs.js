const express = require('express');
const router = express.Router();
const pool = require('../database/db');

// GET - Obtener todos los programas
router.get('/', async (req, res) => {
  try {
    const { estado, tipo, id_estudio, id_master } = req.query;

    let query = `
      SELECT p.*,
             e.nombre as estudio_nombre, e.codigo as estudio_codigo,
             m.nombre as master_nombre, m.codigo as master_codigo
      FROM programas p
      LEFT JOIN estudios e ON p.id_estudio = e.id
      LEFT JOIN masters m ON p.id_master = m.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 1;

    if (estado) {
      query += ` AND p.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    if (tipo) {
      query += ` AND p.tipo = $${paramCount}`;
      params.push(tipo);
      paramCount++;
    }

    if (id_estudio) {
      query += ` AND p.id_estudio = $${paramCount}`;
      params.push(id_estudio);
      paramCount++;
    }

    if (id_master) {
      query += ` AND p.id_master = $${paramCount}`;
      params.push(id_master);
      paramCount++;
    }

    query += ' ORDER BY p.horario_inicio ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener programas:', error);
    res.status(500).json({ error: 'Error al obtener programas' });
  }
});

// GET - Obtener un programa por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*,
              e.nombre as estudio_nombre, e.codigo as estudio_codigo,
              m.nombre as master_nombre, m.codigo as master_codigo
       FROM programas p
       LEFT JOIN estudios e ON p.id_estudio = e.id
       LEFT JOIN masters m ON p.id_master = m.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener programa:', error);
    res.status(500).json({ error: 'Error al obtener programa' });
  }
});

// POST - Crear un nuevo programa
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      id_estudio,
      id_master,
      horario_inicio,
      horario_fin,
      dias_semana,
      tipo,
      estado
    } = req.body;

    // Validaciones
    if (!nombre || !horario_inicio || !horario_fin) {
      return res.status(400).json({
        error: 'Nombre, horario de inicio y fin son requeridos'
      });
    }

    // Validar que al menos tenga un estudio o master asignado
    if (!id_estudio && !id_master) {
      return res.status(400).json({
        error: 'El programa debe tener asignado al menos un estudio o un master'
      });
    }

    // Validar horarios
    if (horario_inicio >= horario_fin) {
      return res.status(400).json({
        error: 'El horario de fin debe ser posterior al horario de inicio'
      });
    }

    // Validar tipo si se proporciona
    const validTipos = ['noticiero', 'magazine', 'debate', 'entretenimiento', 'especial', 'otro'];
    if (tipo && !validTipos.includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo inválido. Debe ser: noticiero, magazine, debate, entretenimiento, especial u otro'
      });
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

    const result = await pool.query(
      `INSERT INTO programas
       (nombre, descripcion, id_estudio, id_master, horario_inicio, horario_fin, dias_semana, tipo, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        nombre,
        descripcion || null,
        id_estudio || null,
        id_master || null,
        horario_inicio,
        horario_fin,
        dias_semana || null,
        tipo || null,
        estado || 'activo'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear programa:', error);
    res.status(500).json({ error: 'Error al crear programa' });
  }
});

// PUT - Actualizar un programa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      id_estudio,
      id_master,
      horario_inicio,
      horario_fin,
      dias_semana,
      tipo,
      estado
    } = req.body;

    // Verificar que el programa existe
    const existingProgram = await pool.query('SELECT * FROM programas WHERE id = $1', [id]);
    if (existingProgram.rows.length === 0) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }

    const currentProgram = existingProgram.rows[0];

    // Validar horarios si se proporcionan
    const newInicio = horario_inicio || currentProgram.horario_inicio;
    const newFin = horario_fin || currentProgram.horario_fin;
    if (newInicio >= newFin) {
      return res.status(400).json({
        error: 'El horario de fin debe ser posterior al horario de inicio'
      });
    }

    // Validar tipo si se proporciona
    const validTipos = ['noticiero', 'magazine', 'debate', 'entretenimiento', 'especial', 'otro'];
    if (tipo && !validTipos.includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo inválido. Debe ser: noticiero, magazine, debate, entretenimiento, especial u otro'
      });
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

    const result = await pool.query(
      `UPDATE programas
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           id_estudio = COALESCE($3, id_estudio),
           id_master = COALESCE($4, id_master),
           horario_inicio = COALESCE($5, horario_inicio),
           horario_fin = COALESCE($6, horario_fin),
           dias_semana = COALESCE($7, dias_semana),
           tipo = COALESCE($8, tipo),
           estado = COALESCE($9, estado),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [nombre, descripcion, id_estudio, id_master, horario_inicio, horario_fin, dias_semana, tipo, estado, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar programa:', error);
    res.status(500).json({ error: 'Error al actualizar programa' });
  }
});

// DELETE - Eliminar un programa
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay asignaciones de personal a este programa
    const assignmentsCheck = await pool.query(
      'SELECT COUNT(*) FROM personal_asignado WHERE id_programa = $1',
      [id]
    );

    if (parseInt(assignmentsCheck.rows[0].count) > 0) {
      return res.status(409).json({
        error: 'No se puede eliminar el programa porque tiene asignaciones de personal'
      });
    }

    const result = await pool.query('DELETE FROM programas WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Programa no encontrado' });
    }

    res.json({ message: 'Programa eliminado exitosamente', programa: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar programa:', error);
    res.status(500).json({ error: 'Error al eliminar programa' });
  }
});

// GET - Obtener asignaciones de personal de un programa
router.get('/:id/asignaciones', async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha } = req.query;

    let query = `
      SELECT pa.*,
             pe.name as personal_nombre, pe.area as personal_area,
             e.nombre as estudio_nombre,
             m.nombre as master_nombre
      FROM personal_asignado pa
      LEFT JOIN personnel pe ON pa.id_personal = pe.id
      LEFT JOIN estudios e ON pa.id_estudio = e.id
      LEFT JOIN masters m ON pa.id_master = m.id
      WHERE pa.id_programa = $1
    `;
    let params = [id];

    if (fecha) {
      query += ' AND pa.fecha = $2';
      params.push(fecha);
    }

    query += ' ORDER BY pa.fecha DESC, pa.hora_inicio ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener asignaciones del programa:', error);
    res.status(500).json({ error: 'Error al obtener asignaciones del programa' });
  }
});

// GET - Obtener programas del día
router.get('/dia/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    const diaSemana = new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long' });

    const result = await pool.query(
      `SELECT p.*,
              e.nombre as estudio_nombre, e.codigo as estudio_codigo,
              m.nombre as master_nombre, m.codigo as master_codigo
       FROM programas p
       LEFT JOIN estudios e ON p.id_estudio = e.id
       LEFT JOIN masters m ON p.id_master = m.id
       WHERE p.estado = 'activo'
         AND (p.dias_semana IS NULL OR p.dias_semana LIKE $1)
       ORDER BY p.horario_inicio ASC`,
      [`%${diaSemana}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener programas del día:', error);
    res.status(500).json({ error: 'Error al obtener programas del día' });
  }
});

module.exports = router;
