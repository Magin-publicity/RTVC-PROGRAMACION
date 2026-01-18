const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// GET - Obtener todo el personal
router.get('/', async (req, res) => {
  try {
    // tipo puede ser: 'TECNICO' (default), 'LOGISTICO', 'ALL'
    const tipo = req.query.tipo || 'TECNICO';

    let query = 'SELECT * FROM personnel WHERE active = true';

    if (tipo !== 'ALL') {
      query += ` AND tipo_personal = '${tipo}'`;
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener personal:', error);
    res.status(500).json({ error: 'Error al obtener personal' });
  }
});

// GET - Obtener un miembro del personal por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM personnel WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personal no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener personal:', error);
    res.status(500).json({ error: 'Error al obtener personal' });
  }
});

// POST - Crear nuevo personal
router.post('/', async (req, res) => {
  try {
    const { name, role, area, current_shift, email, contract_start, contract_end, phone, direccion, barrio, localidad, tipo_personal } = req.body;

    // IMPORTANTE: active SIEMPRE debe ser true al crear personal
    const activeAlwaysTrue = true;

    // tipo_personal: 'TECNICO' (default) o 'LOGISTICO'
    const tipoPersonal = tipo_personal || 'TECNICO';

    const result = await pool.query(
      `INSERT INTO personnel (name, role, area, current_shift, active, email, contract_start, contract_end, phone, direccion, barrio, localidad, tipo_personal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [name, role, area, current_shift, activeAlwaysTrue, email, contract_start, contract_end, phone, direccion, barrio, localidad, tipoPersonal]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear personal:', error);
    res.status(500).json({ error: 'Error al crear personal' });
  }
});

// PUT - Actualizar personal
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, area, current_shift, email, contract_start, contract_end, phone, direccion, barrio, localidad, tipo_personal } = req.body;

    // IMPORTANTE: active SIEMPRE debe ser true, ignorar cualquier valor que venga del frontend
    const activeAlwaysTrue = true;

    // tipo_personal: mantener el que venga o default 'TECNICO'
    const tipoPersonal = tipo_personal || 'TECNICO';

    const result = await pool.query(
      `UPDATE personnel
       SET name = $1, role = $2, area = $3, current_shift = $4, active = $5,
           email = $6, contract_start = $7, contract_end = $8, phone = $9,
           direccion = $10, barrio = $11, localidad = $12, tipo_personal = $13, updated_at = NOW()
       WHERE id = $14
       RETURNING *`,
      [name, role, area, current_shift, activeAlwaysTrue, email, contract_start, contract_end, phone, direccion, barrio, localidad, tipoPersonal, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personal no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar personal:', error);
    res.status(500).json({ error: 'Error al actualizar personal' });
  }
});

// DELETE - Eliminar personal
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM personnel WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Personal no encontrado' });
    }
    
    res.json({ message: 'Personal eliminado correctamente', deleted: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar personal:', error);
    res.status(500).json({ error: 'Error al eliminar personal' });
  }
});

module.exports = router;