// routes/routeGroups.js
// Endpoints para gestionar grupos/plantillas de personal para rutas

const express = require('express');
const router = express.Router();
const pool = require('../config/database');

/**
 * GET /api/route-groups
 * Obtiene todos los grupos de rutas
 */
router.get('/', async (req, res) => {
  try {
    const { shift_type } = req.query;

    let query = 'SELECT * FROM route_groups';
    const params = [];

    if (shift_type) {
      query += ' WHERE shift_type = $1';
      params.push(shift_type);
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);

    // Para cada grupo, obtener los detalles del personal
    const groupsWithPersonnel = await Promise.all(
      result.rows.map(async (group) => {
        if (group.personnel_ids && group.personnel_ids.length > 0) {
          const personnelResult = await pool.query(
            `SELECT id, name, role, area, direccion, barrio, localidad, phone
             FROM personnel
             WHERE id = ANY($1) AND active = true AND tipo_personal = 'LOGISTICO'
             ORDER BY name`,
            [group.personnel_ids]
          );

          return {
            ...group,
            personnel: personnelResult.rows
          };
        }

        return {
          ...group,
          personnel: []
        };
      })
    );

    res.json(groupsWithPersonnel);
  } catch (error) {
    console.error('Error obteniendo grupos de rutas:', error);
    res.status(500).json({ error: 'Error al obtener grupos de rutas' });
  }
});

/**
 * GET /api/route-groups/:id
 * Obtiene un grupo específico
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM route_groups WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    const group = result.rows[0];

    // Obtener detalles del personal
    if (group.personnel_ids && group.personnel_ids.length > 0) {
      const personnelResult = await pool.query(
        `SELECT id, name, role, area, direccion, barrio, localidad, phone
         FROM personnel
         WHERE id = ANY($1) AND active = true AND tipo_personal = 'LOGISTICO'
         ORDER BY name`,
        [group.personnel_ids]
      );

      group.personnel = personnelResult.rows;
    } else {
      group.personnel = [];
    }

    res.json(group);
  } catch (error) {
    console.error('Error obteniendo grupo:', error);
    res.status(500).json({ error: 'Error al obtener grupo' });
  }
});

/**
 * POST /api/route-groups
 * Crea un nuevo grupo de ruta
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, shift_type, personnel_ids, created_by } = req.body;

    if (!name || !shift_type) {
      return res.status(400).json({
        error: 'Nombre y tipo de turno son requeridos'
      });
    }

    if (!['AM', 'PM'].includes(shift_type)) {
      return res.status(400).json({
        error: 'Tipo de turno debe ser AM o PM'
      });
    }

    const result = await pool.query(
      `INSERT INTO route_groups (name, description, shift_type, personnel_ids, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, shift_type, personnel_ids || [], created_by || null]
    );

    console.log(`✅ Grupo de ruta creado: ${name} (${shift_type})`);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      // Unique constraint violation
      return res.status(409).json({
        error: 'Ya existe un grupo con ese nombre'
      });
    }

    console.error('Error creando grupo de ruta:', error);
    res.status(500).json({ error: 'Error al crear grupo de ruta' });
  }
});

/**
 * PUT /api/route-groups/:id
 * Actualiza un grupo existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, shift_type, personnel_ids } = req.body;

    if (!name || !shift_type) {
      return res.status(400).json({
        error: 'Nombre y tipo de turno son requeridos'
      });
    }

    if (!['AM', 'PM'].includes(shift_type)) {
      return res.status(400).json({
        error: 'Tipo de turno debe ser AM o PM'
      });
    }

    const result = await pool.query(
      `UPDATE route_groups
       SET name = $1, description = $2, shift_type = $3, personnel_ids = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [name, description || null, shift_type, personnel_ids || [], id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    console.log(`✅ Grupo de ruta actualizado: ${name}`);
    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Ya existe un grupo con ese nombre'
      });
    }

    console.error('Error actualizando grupo de ruta:', error);
    res.status(500).json({ error: 'Error al actualizar grupo de ruta' });
  }
});

/**
 * DELETE /api/route-groups/:id
 * Elimina un grupo
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM route_groups WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    console.log(`✅ Grupo de ruta eliminado: ${result.rows[0].name}`);
    res.json({ message: 'Grupo eliminado correctamente', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error eliminando grupo de ruta:', error);
    res.status(500).json({ error: 'Error al eliminar grupo de ruta' });
  }
});

module.exports = router;
