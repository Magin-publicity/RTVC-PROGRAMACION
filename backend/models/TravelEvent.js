// backend/models/TravelEvent.js
const db = require('../config/database');

class TravelEvent {
  // ========================================
  // CRUD para travel_events
  // ========================================

  /**
   * Obtener todas las comisiones de viaje/eventos
   */
  static async getAll() {
    const query = `
      SELECT * FROM travel_events_with_details
      ORDER BY date DESC, event_name
    `;
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Obtener comisiones por fecha (incluyendo eventos que abarcan esa fecha)
   */
  static async getByDate(date) {
    const query = `
      SELECT * FROM travel_events_with_details
      WHERE $1 BETWEEN start_date AND end_date
      ORDER BY start_date, departure_time, event_name
    `;
    const result = await db.query(query, [date]);
    return result.rows;
  }

  /**
   * Obtener comisiones por rango de fechas
   */
  static async getByDateRange(startDate, endDate) {
    const query = `
      SELECT * FROM travel_events_with_details
      WHERE (start_date <= $2 AND end_date >= $1)
      ORDER BY start_date, departure_time
    `;
    const result = await db.query(query, [startDate, endDate]);
    return result.rows;
  }

  /**
   * Obtener una comisión por ID
   */
  static async getById(id) {
    const query = `
      SELECT * FROM travel_events_with_details
      WHERE id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Crear una nueva comisión (con transacción)
   */
  static async create(data, personnelList = [], equipmentList = []) {
    const client = await db.connect();
    let travelEvent = null;

    try {
      await client.query('BEGIN');

      // 🔹 PASO 0: LIMPIEZA PREVIA - Eliminar asignaciones duplicadas
      console.log('🧹 Limpiando asignaciones previas para evitar errores...');

      // Limpiar novelties duplicadas del mismo evento/fecha/personal
      for (const person of personnelList) {
        await client.query(`
          DELETE FROM novelties
          WHERE personnel_id = $1
            AND start_date = $2
            AND end_date = $3
            AND description LIKE $4
        `, [person.personnel_id, data.start_date, data.end_date, `%${data.event_name}%`]);
      }

      // 1. Crear el registro principal de la comisión (SIEMPRE SE GUARDA)
      const eventQuery = `
        INSERT INTO travel_events (
          start_date, end_date, event_name, event_type, destination,
          departure_time, estimated_return, status, description, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const eventValues = [
        data.start_date,
        data.end_date,
        data.event_name,
        data.event_type,
        data.destination,
        data.departure_time || null,
        data.estimated_return || null,
        data.status || 'PROGRAMADO',
        data.description || null,
        data.created_by || null
      ];
      const eventResult = await client.query(eventQuery, eventValues);
      travelEvent = eventResult.rows[0];
      console.log(`✅ Evento creado con ID: ${travelEvent.id}`);

      // 2. Asignar personal a la comisión (INDEPENDIENTE - No bloquea el guardado)
      try {
        if (personnelList && personnelList.length > 0) {
          for (const person of personnelList) {
            const personnelQuery = `
              INSERT INTO travel_event_personnel (
                travel_event_id, personnel_id, personnel_name, role, notes
              )
              VALUES ($1, $2, $3, $4, $5)
            `;
            await client.query(personnelQuery, [
              travelEvent.id,
              person.personnel_id,
              person.personnel_name,
              person.role,
              person.notes || null
            ]);

            // 3. Si es una Dupla de Reportería, crear relevo automático
            if (person.role.includes('Dupla') || person.assignment_type) {
              try {
                const reliefQuery = `
                  INSERT INTO travel_event_reliefs (
                    travel_event_id, original_personnel_id, original_assignment_type, notes
                  )
                  VALUES ($1, $2, $3, $4)
                `;
                await client.query(reliefQuery, [
                  travelEvent.id,
                  person.personnel_id,
                  person.assignment_type || 'REPORTERIA_DUPLA',
                  `Relevo automático por viaje: ${data.event_name}`
                ]);
              } catch (reliefError) {
                console.warn(`⚠️ No se pudo crear relevo para ${person.personnel_name}:`, reliefError.message);
              }
            }

            // 4. Insertar novelty (con manejo de errores independiente)
            try {
              let noveltyType = 'VIAJE';
              if (data.event_type === 'EVENTO') {
                noveltyType = 'EVENTO';
              }

              const noveltyQuery = `
                INSERT INTO novelties (
                  personnel_id, date, type, description, start_date, end_date
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (personnel_id, date, type) DO UPDATE
                SET description = EXCLUDED.description,
                    start_date = EXCLUDED.start_date,
                    end_date = EXCLUDED.end_date
              `;

              await client.query(noveltyQuery, [
                person.personnel_id,
                data.start_date,
                noveltyType,
                `${data.event_name} - ${data.destination}`,
                data.start_date,
                data.end_date
              ]);

              console.log(`✅ Novelty insertada para ${person.personnel_name}`);
            } catch (novError) {
              console.warn(`⚠️ Error al insertar novelty para ${person.personnel_name}:`, novError.message);
            }
          }
        }
      } catch (personnelError) {
        console.error('⚠️ Error al asignar personal, pero el viaje se guardó:', personnelError.message);
      }

      // 5. Asignar equipos a la comisión (INDEPENDIENTE - No bloquea el guardado)
      try {
        if (equipmentList && equipmentList.length > 0) {
          console.log('🔧 Procesando equipos...');

          for (const equipment of equipmentList) {
            try {
              const equipmentQuery = `
                INSERT INTO travel_event_equipment (
                  travel_event_id, equipment_type, equipment_reference, liveu_id, notes
                )
                VALUES ($1, $2, $3, $4, $5)
              `;

              await client.query(equipmentQuery, [
                travelEvent.id,
                equipment.equipment_type,
                equipment.equipment_reference || null,
                equipment.liveu_id || null,
                equipment.notes || null
              ]);
              console.log(`✅ Equipo ${equipment.equipment_type} insertado`);

              // Actualizar estado de LiveU
              if (equipment.liveu_id) {
                try {
                  const updateLiveUQuery = `
                    UPDATE liveu_equipment
                    SET status = 'EN_TERRENO'
                    WHERE id = $1
                  `;
                  await client.query(updateLiveUQuery, [equipment.liveu_id]);
                  console.log(`✅ LiveU ${equipment.liveu_id} actualizado a EN_TERRENO`);
                } catch (liveUError) {
                  console.warn(`⚠️ No se pudo actualizar estado de LiveU:`, liveUError.message);
                }
              }
            } catch (equipError) {
              console.warn(`⚠️ Error al insertar equipo ${equipment.equipment_type}:`, equipError.message);
            }
          }
        }
      } catch (equipmentError) {
        console.error('⚠️ Error al asignar equipos, pero el viaje se guardó:', equipmentError.message);
      }

      await client.query('COMMIT');
      console.log(`✅ Comisión guardada exitosamente con ID: ${travelEvent.id}`);

      // Retornar la comisión completa con detalles
      return await this.getById(travelEvent.id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error fatal al crear comisión:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Actualizar una comisión existente
   */
  static async update(id, updateData) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const { personnel = null, equipment = null, ...data } = updateData;

      // 1. Actualizar datos básicos del evento
      const query = `
        UPDATE travel_events
        SET
          start_date = COALESCE($1, start_date),
          end_date = COALESCE($2, end_date),
          event_name = COALESCE($3, event_name),
          event_type = COALESCE($4, event_type),
          destination = COALESCE($5, destination),
          departure_time = COALESCE($6, departure_time),
          estimated_return = COALESCE($7, estimated_return),
          status = COALESCE($8, status),
          description = COALESCE($9, description),
          updated_at = NOW()
        WHERE id = $10
        RETURNING *
      `;
      const values = [
        data.start_date,
        data.end_date,
        data.event_name,
        data.event_type,
        data.destination,
        data.departure_time,
        data.estimated_return,
        data.status,
        data.description,
        id
      ];
      const result = await client.query(query, values);
      const updatedEvent = result.rows[0];

      // 2. Si se proporciona personnel, actualizar personal
      if (personnel !== null && Array.isArray(personnel)) {
        // Eliminar personal existente
        await client.query('DELETE FROM travel_event_personnel WHERE travel_event_id = $1', [id]);

        // Insertar nuevo personal
        for (const person of personnel) {
          await client.query(
            'INSERT INTO travel_event_personnel (travel_event_id, personnel_id, personnel_name) VALUES ($1, $2, $3)',
            [id, person.personnel_id, person.personnel_name]
          );
        }

        // Actualizar novelties: eliminar las antiguas y crear nuevas (UNA por persona)
        await client.query(`
          DELETE FROM novelties
          WHERE start_date = $1
            AND end_date = $2
            AND description LIKE $3
        `, [updatedEvent.start_date, updatedEvent.end_date, `%${updatedEvent.event_name}%`]);

        // Crear UNA novelty por persona (no múltiples)
        const noveltyType = updatedEvent.event_type === 'EVENTO' ? 'EVENTO' : 'VIAJE';

        for (const person of personnel) {
          await client.query(`
            INSERT INTO novelties (personnel_id, date, type, description, start_date, end_date)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            person.personnel_id,
            updatedEvent.start_date,
            noveltyType,
            `${updatedEvent.event_name} - ${updatedEvent.destination}`,
            updatedEvent.start_date,
            updatedEvent.end_date
          ]);
        }
      }

      // 3. Si se proporciona equipment, actualizar equipos
      if (equipment !== null && Array.isArray(equipment)) {
        // Eliminar equipos existentes de ESTE evento (permitir duplicados del mismo evento)
        await client.query('DELETE FROM travel_event_equipment WHERE travel_event_id = $1', [id]);

        // Insertar nuevos equipos
        for (const equip of equipment) {
          await client.query(
            'INSERT INTO travel_event_equipment (travel_event_id, equipment_type, equipment_reference) VALUES ($1, $2, $3)',
            [id, equip.equipment_type, equip.equipment_reference]
          );
        }
      }

      await client.query('COMMIT');

      // Retornar la comisión completa actualizada
      return await this.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error en TravelEvent.update:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Eliminar una comisión (con transacción)
   */
  static async delete(id) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // 0. Obtener información de la comisión antes de eliminarla
      const eventInfoQuery = 'SELECT start_date, end_date, event_name FROM travel_events WHERE id = $1';
      const eventInfo = await client.query(eventInfoQuery, [id]);
      const { start_date, end_date, event_name } = eventInfo.rows[0];

      // 1. Eliminar novelties asociadas a esta comisión
      const deleteNoveltiesQuery = `
        DELETE FROM novelties
        WHERE personnel_id IN (
          SELECT personnel_id FROM travel_event_personnel
          WHERE travel_event_id = $1
        )
        AND start_date = $2
        AND end_date = $3
        AND description LIKE $4
      `;
      const deleteResult = await client.query(deleteNoveltiesQuery, [id, start_date, end_date, `${event_name}%`]);
      console.log(`🗑️ Eliminadas ${deleteResult.rowCount} novelties de la comisión "${event_name}"`);

      // 2. Liberar equipos LiveU asociados
      const liveUQuery = `
        UPDATE liveu_equipment
        SET status = 'DISPONIBLE'
        WHERE id IN (
          SELECT liveu_id FROM travel_event_equipment
          WHERE travel_event_id = $1 AND liveu_id IS NOT NULL
        )
      `;
      await client.query(liveUQuery, [id]);

      // 3. Eliminar la comisión (cascade eliminará personal, equipos y relevos)
      const deleteQuery = 'DELETE FROM travel_events WHERE id = $1 RETURNING *';
      const result = await client.query(deleteQuery, [id]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // ========================================
  // Gestión de Personal en Comisiones
  // ========================================

  /**
   * Agregar personal a una comisión existente
   */
  static async addPersonnel(travelEventId, personnelData) {
    const query = `
      INSERT INTO travel_event_personnel (
        travel_event_id, personnel_id, personnel_name, role, notes
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (travel_event_id, personnel_id) DO UPDATE
      SET role = $4, notes = $5
      RETURNING *
    `;
    const values = [
      travelEventId,
      personnelData.personnel_id,
      personnelData.personnel_name,
      personnelData.role,
      personnelData.notes || null
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Remover personal de una comisión
   */
  static async removePersonnel(travelEventId, personnelId) {
    const query = `
      DELETE FROM travel_event_personnel
      WHERE travel_event_id = $1 AND personnel_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [travelEventId, personnelId]);
    return result.rows[0];
  }

  /**
   * Obtener personal asignado a una comisión
   */
  static async getPersonnel(travelEventId) {
    const query = `
      SELECT tep.*, p.area, p.email
      FROM travel_event_personnel tep
      LEFT JOIN personnel p ON tep.personnel_id = p.id
      WHERE tep.travel_event_id = $1
      ORDER BY tep.role, tep.personnel_name
    `;
    const result = await db.query(query, [travelEventId]);
    return result.rows;
  }

  // ========================================
  // Gestión de Equipos en Comisiones
  // ========================================

  /**
   * Agregar equipo a una comisión
   */
  static async addEquipment(travelEventId, equipmentData) {
    const query = `
      INSERT INTO travel_event_equipment (
        travel_event_id, equipment_type, equipment_reference, liveu_id, notes
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      travelEventId,
      equipmentData.equipment_type,
      equipmentData.equipment_reference || null,
      equipmentData.liveu_id || null,
      equipmentData.notes || null
    ];
    const result = await db.query(query, values);
    return result.rows[0];
  }

  /**
   * Remover equipo de una comisión
   */
  static async removeEquipment(equipmentId) {
    const query = `
      DELETE FROM travel_event_equipment
      WHERE id = $1
      RETURNING *
    `;
    const result = await db.query(query, [equipmentId]);
    return result.rows[0];
  }

  /**
   * Obtener equipos asignados a una comisión
   */
  static async getEquipment(travelEventId) {
    const query = `
      SELECT tee.*, le.equipment_code, le.status as liveu_status
      FROM travel_event_equipment tee
      LEFT JOIN liveu_equipment le ON tee.liveu_id = le.id
      WHERE tee.travel_event_id = $1
      ORDER BY tee.equipment_type
    `;
    const result = await db.query(query, [travelEventId]);
    return result.rows;
  }

  // ========================================
  // Consultas especiales para contadores
  // ========================================

  /**
   * Obtener estadísticas de comisiones por fecha
   */
  static async getStatsByDate(date) {
    const query = `
      SELECT
        COUNT(DISTINCT te.id) as total_events,
        COUNT(DISTINCT tep.personnel_id) as total_personnel,
        COUNT(DISTINCT CASE WHEN tee.equipment_type = 'LIVEU' THEN tee.id END) as liveu_count,
        COUNT(DISTINCT CASE WHEN tep.role ILIKE '%cámara%' THEN tep.personnel_id END) as cameras_count,
        COUNT(DISTINCT CASE WHEN tep.role ILIKE '%asistente%' THEN tep.personnel_id END) as assistants_count,
        COUNT(DISTINCT CASE WHEN tep.role ILIKE '%realizador%' THEN tep.personnel_id END) as directors_count,
        COUNT(DISTINCT CASE WHEN tep.role ILIKE '%periodista%' THEN tep.personnel_id END) as journalists_count
      FROM travel_events te
      LEFT JOIN travel_event_personnel tep ON te.id = tep.travel_event_id
      LEFT JOIN travel_event_equipment tee ON te.id = tee.travel_event_id
      WHERE $1 BETWEEN te.start_date AND te.end_date AND te.status != 'CANCELADO'
    `;
    const result = await db.query(query, [date]);
    return result.rows[0];
  }

  /**
   * Obtener IDs de personal en comisión por fecha (para excluir de disponibilidad)
   */
  static async getPersonnelIdsInEvent(date) {
    const query = `
      SELECT DISTINCT tep.personnel_id
      FROM travel_event_personnel tep
      JOIN travel_events te ON tep.travel_event_id = te.id
      WHERE $1 BETWEEN te.start_date AND te.end_date AND te.status IN ('PROGRAMADO', 'EN_CURSO')
    `;
    const result = await db.query(query, [date]);
    return result.rows.map(row => row.personnel_id);
  }
}

module.exports = TravelEvent;
