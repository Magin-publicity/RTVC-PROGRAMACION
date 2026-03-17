// backend/models/Personnel.js
const db = require('../config/database');

class Personnel {
  static async getAll() {
    const query = 'SELECT * FROM personnel WHERE active = true ORDER BY area, name';
    const result = await db.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM personnel WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async getByArea(area) {
    const query = 'SELECT * FROM personnel WHERE area = $1 AND active = true ORDER BY name';
    const result = await db.query(query, [area]);
    return result.rows;
  }

  static async create(data) {
    const query = `
      INSERT INTO personnel (name, area, role, current_shift, email, phone, direccion, barrio, localidad, cedula, fecha_nacimiento, arl, eps)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const values = [
      data.name,
      data.area,
      data.role,
      data.current_shift,
      data.email,
      data.phone,
      data.direccion || null,
      data.barrio || null,
      data.localidad || null,
      data.cedula || null,
      data.fecha_nacimiento || null,
      data.arl || null,
      data.eps || null
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(id, data) {
    const query = `
      UPDATE personnel
      SET name = $1, area = $2, role = $3, current_shift = $4,
          email = $5, phone = $6, direccion = $7, barrio = $8, localidad = $9,
          cedula = $10, fecha_nacimiento = $11, arl = $12, eps = $13, updated_at = NOW()
      WHERE id = $14
      RETURNING *
    `;
    const values = [
      data.name,
      data.area,
      data.role,
      data.current_shift,
      data.email,
      data.phone,
      data.direccion || null,
      data.barrio || null,
      data.localidad || null,
      data.cedula || null,
      data.fecha_nacimiento || null,
      data.arl || null,
      data.eps || null,
      id
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'UPDATE personnel SET active = false, updated_at = NOW() WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async updateShift(id, newShift) {
    const query = 'UPDATE personnel SET current_shift = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
    const result = await db.query(query, [newShift, id]);
    return result.rows[0];
  }
}

module.exports = Personnel;