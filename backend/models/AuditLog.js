const db = require('../config/database');

class AuditLog {
  static async create(data) {
    const query = `
      INSERT INTO audit_log (action, table_name, record_id, user_name, changes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      data.action,
      data.table_name,
      data.record_id || null,
      data.user_name || 'system',
      JSON.stringify(data.changes)
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async getByTable(tableName, limit = 100) {
    const query = `
      SELECT * FROM audit_log 
      WHERE table_name = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await db.query(query, [tableName, limit]);
    return result.rows;
  }

  static async getRecent(limit = 50) {
    const query = `
      SELECT * FROM audit_log 
      ORDER BY created_at DESC 
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  }
}

module.exports = AuditLog;