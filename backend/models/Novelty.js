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
}

module.exports = Novelty;