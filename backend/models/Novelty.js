// backend/models/Novelty.js
const db = require('../config/database');

class Novelty {
  static async getAll() {
    const query = `
      SELECT n.*, p.name, p.area, p.role
      FROM novelties n
      JOIN personnel p ON n.personnel_id = p.id
      ORDER BY n.date DESC, p.name
    `;
    const result = await db.query(query);
    return result.rows;
  }

  static async getByDate(date) {
    const query = `
      SELECT n.*, p.name, p.area, p.role
      FROM novelties n
      JOIN personnel p ON n.personnel_id = p.id
      WHERE n.date = $1
      ORDER BY p.area, p.name
    `;
    const result = await db.query(query, [date]);
    return result.rows;
  }

  static async getByPersonnel(personnelId) {
    const query = 'SELECT * FROM novelties WHERE personnel_id = $1 ORDER BY date DESC';
    const result = await db.query(query, [personnelId]);
    return result.rows;
  }

  static async getByDateRange(startDate, endDate) {
    const query = `
      SELECT n.*, p.name, p.area, p.role
      FROM novelties n
      JOIN personnel p ON n.personnel_id = p.id
      WHERE n.date BETWEEN $1 AND $2
      ORDER BY n.date, p.area, p.name
    `;
    const result = await db.query(query, [startDate, endDate]);
    return result.rows;
  }

  static async create(data) {
    // Si tiene start_date y end_date, usar esos campos (grupos exclusivos)
    if (data.start_date && data.end_date) {
      const query = `
        INSERT INTO novelties (personnel_id, date, start_date, end_date, type, description, program_id, program_name, exclusive_type)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        data.personnel_id,
        data.start_date, // Usar start_date como date también para compatibilidad
        data.start_date,
        data.end_date,
        data.type,
        data.description,
        data.program_id || null,
        data.program_name || null,
        data.exclusive_type || null
      ];
      const result = await db.query(query, values);
      return result.rows[0];
    }

    // Modo legacy: solo date
    const query = `
      INSERT INTO novelties (personnel_id, date, type, description)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (personnel_id, date)
      DO UPDATE SET type = $3, description = $4, updated_at = NOW()
      RETURNING *
    `;
    const values = [data.personnel_id, data.date, data.type, data.description];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async update(id, data) {
    // Si tiene campos de grupo exclusivo, actualizarlos también
    if (data.start_date !== undefined || data.program_id !== undefined) {
      const query = `
        UPDATE novelties
        SET type = $1, description = $2, start_date = COALESCE($3, start_date),
            end_date = COALESCE($4, end_date), program_id = $5, program_name = $6,
            exclusive_type = $7, updated_at = NOW()
        WHERE id = $8
        RETURNING *
      `;
      const values = [
        data.type,
        data.description,
        data.start_date || null,
        data.end_date || null,
        data.program_id || null,
        data.program_name || null,
        data.exclusive_type || null,
        id
      ];
      const result = await db.query(query, values);
      return result.rows[0];
    }

    // Modo legacy
    const query = `
      UPDATE novelties
      SET type = $1, description = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const values = [data.type, data.description, id];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM novelties WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async deleteByPersonnelAndDate(personnelId, date) {
    const query = 'DELETE FROM novelties WHERE personnel_id = $1 AND date = $2 RETURNING *';
    const result = await db.query(query, [personnelId, date]);
    return result.rows[0];
  }

  static async deleteByProgramId(programId) {
    const query = 'DELETE FROM novelties WHERE program_id = $1 RETURNING *';
    const result = await db.query(query, [programId]);
    return result.rows;
  }

  static async getByProgramId(programId) {
    const query = `
      SELECT n.*, p.name, p.area, p.role
      FROM novelties n
      JOIN personnel p ON n.personnel_id = p.id
      WHERE n.program_id = $1
      ORDER BY p.name
    `;
    const result = await db.query(query, [programId]);
    return result.rows;
  }
}

module.exports = Novelty;