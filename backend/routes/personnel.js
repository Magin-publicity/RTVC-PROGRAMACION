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
    const { name, role, area, current_shift, email, contract_start, contract_end, phone, direccion, barrio, localidad, tipo_personal, cedula, fecha_nacimiento, arl, eps } = req.body;

    console.log('📝 [POST /personnel] Datos recibidos:', JSON.stringify(req.body, null, 2));

    // IMPORTANTE: active SIEMPRE debe ser true al crear personal
    const activeAlwaysTrue = true;

    // tipo_personal: 'TECNICO' (default) o 'LOGISTICO'
    const tipoPersonal = tipo_personal || 'TECNICO';

    // Verificar que los campos requeridos estén presentes
    if (!name || !role || !area) {
      console.error('❌ [POST /personnel] Faltan campos requeridos');
      return res.status(400).json({ error: 'Nombre, rol y área son requeridos' });
    }

    // Convertir cadenas vacías a null para campos de fecha
    const contractStartValue = contract_start && contract_start.trim() !== '' ? contract_start : null;
    const contractEndValue = contract_end && contract_end.trim() !== '' ? contract_end : null;
    const fechaNacimientoValue = fecha_nacimiento && fecha_nacimiento.trim() !== '' ? fecha_nacimiento : null;

    console.log('📤 [POST /personnel] Ejecutando INSERT...');
    const result = await pool.query(
      `INSERT INTO personnel (name, role, area, current_shift, active, email, contract_start, contract_end, phone, direccion, barrio, localidad, tipo_personal, cedula, fecha_nacimiento, arl, eps)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [name, role, area, current_shift, activeAlwaysTrue, email, contractStartValue, contractEndValue, phone, direccion, barrio, localidad, tipoPersonal, cedula, fechaNacimientoValue, arl, eps]
    );

    console.log('✅ [POST /personnel] Personal creado exitosamente:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ [POST /personnel] Error SQL al crear personal:');
    console.error('  Mensaje:', error.message);
    console.error('  Código:', error.code);
    console.error('  Stack:', error.stack);
    res.status(500).json({
      error: 'Error al crear personal',
      details: error.message,
      code: error.code
    });
  }
});

// PUT - Actualizar personal
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, area, current_shift, email, contract_start, contract_end, phone, direccion, barrio, localidad, tipo_personal, cedula, fecha_nacimiento, arl, eps } = req.body;

    // IMPORTANTE: active SIEMPRE debe ser true, ignorar cualquier valor que venga del frontend
    const activeAlwaysTrue = true;

    // tipo_personal: mantener el que venga o default 'TECNICO'
    const tipoPersonal = tipo_personal || 'TECNICO';

    // Convertir cadenas vacías a null para campos de fecha
    const contractStartValue = contract_start && contract_start.trim() !== '' ? contract_start : null;
    const contractEndValue = contract_end && contract_end.trim() !== '' ? contract_end : null;
    const fechaNacimientoValue = fecha_nacimiento && fecha_nacimiento.trim() !== '' ? fecha_nacimiento : null;

    const result = await pool.query(
      `UPDATE personnel
       SET name = $1, role = $2, area = $3, current_shift = $4, active = $5,
           email = $6, contract_start = $7, contract_end = $8, phone = $9,
           direccion = $10, barrio = $11, localidad = $12, tipo_personal = $13,
           cedula = $14, fecha_nacimiento = $15, arl = $16, eps = $17, updated_at = NOW()
       WHERE id = $18
       RETURNING *`,
      [name, role, area, current_shift, activeAlwaysTrue, email, contractStartValue, contractEndValue, phone, direccion, barrio, localidad, tipoPersonal, cedula, fechaNacimientoValue, arl, eps, id]
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