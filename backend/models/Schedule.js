// backend/models/Schedule.js
const db = require('../config/database');

class Schedule {
  static async getByDate(date) {
    const query = `
      SELECT s.*, p.name, p.area, p.role
      FROM schedules s
      JOIN personnel p ON s.personnel_id = p.id
      WHERE s.date = $1
      ORDER BY p.area, s.shift_time
    `;
    const result = await db.query(query, [date]);
    return result.rows;
  }

  static async getByWeek(startDate, endDate) {
    const query = `
      SELECT s.*, p.name, p.area, p.role
      FROM schedules s
      JOIN personnel p ON s.personnel_id = p.id
      WHERE s.date BETWEEN $1 AND $2
      ORDER BY s.date, p.area, s.shift_time
    `;
    const result = await db.query(query, [startDate, endDate]);
    return result.rows;
  }

  static async create(data) {
    const query = `
      INSERT INTO schedules (personnel_id, date, shift_time, program, location, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (personnel_id, date) 
      DO UPDATE SET shift_time = $3, program = $4, location = $5, notes = $6, updated_at = NOW()
      RETURNING *
    `;
    const values = [data.personnel_id, data.date, data.shift_time, data.program, data.location, data.notes];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async bulkCreate(schedules) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      
      for (const schedule of schedules) {
        const query = `
          INSERT INTO schedules (personnel_id, date, shift_time, program, location, notes)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (personnel_id, date) 
          DO UPDATE SET shift_time = $3, program = $4, location = $5, notes = $6, updated_at = NOW()
          RETURNING *
        `;
        const values = [schedule.personnel_id, schedule.date, schedule.shift_time, schedule.program, schedule.location, schedule.notes];
        const result = await client.query(query, values);
        results.push(result.rows[0]);
      }
      
      await client.query('COMMIT');
      return results;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async delete(id) {
    const query = 'DELETE FROM schedules WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Schedule;