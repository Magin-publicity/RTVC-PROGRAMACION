// Script para insertar novelties para comisiones existentes
const db = require('../config/database');

async function backfillTravelNovelties() {
  const client = await db.connect();

  try {
    console.log('🚗 Iniciando backfill de novelties para comisiones de viaje...\n');

    await client.query('BEGIN');

    // 1. Obtener todas las comisiones activas
    const eventsResult = await client.query(`
      SELECT te.id, te.start_date, te.end_date, te.event_name, te.event_type, te.destination, te.status
      FROM travel_events te
      WHERE te.status != 'CANCELADO'
      ORDER BY te.id
    `);

    console.log(`📋 Encontradas ${eventsResult.rows.length} comisiones activas\n`);

    let totalNovelties = 0;

    for (const event of eventsResult.rows) {
      const eventStartStr = event.start_date.toISOString ? event.start_date.toISOString().split('T')[0] : event.start_date;
      const eventEndStr = event.end_date.toISOString ? event.end_date.toISOString().split('T')[0] : event.end_date;

      console.log(`\n📅 Procesando comisión ID ${event.id}: ${event.event_name}`);
      console.log(`   Fechas: ${eventStartStr} a ${eventEndStr}`);

      // 2. Obtener personal asignado a esta comisión
      const personnelResult = await client.query(`
        SELECT personnel_id, personnel_name
        FROM travel_event_personnel
        WHERE travel_event_id = $1
      `, [event.id]);

      console.log(`   👥 Personal asignado: ${personnelResult.rows.length}`);

      // 3. Determinar tipo de novelty
      let noveltyType = 'VIAJE';
      if (event.event_type === 'EVENTO') {
        noveltyType = 'EVENTO';
      }

      // 3.5. Preparar fechas
      const startDateStr = event.start_date.toISOString ? event.start_date.toISOString().split('T')[0] : event.start_date;
      const endDateStr = event.end_date.toISOString ? event.end_date.toISOString().split('T')[0] : event.end_date;

      // 4. Para cada persona, insertar novelties para cada día del rango
      for (const person of personnelResult.rows) {
        console.log(`      Procesando ${person.personnel_name} (ID ${person.personnel_id})`);

        // Verificar si ya existen novelties para esta persona y evento
        const existingCheck = await client.query(`
          SELECT COUNT(*) as count
          FROM novelties
          WHERE personnel_id = $1
            AND description = $2
            AND start_date = $3
            AND end_date = $4
        `, [person.personnel_id, `${event.event_name} - ${event.destination}`, startDateStr, endDateStr]);

        if (parseInt(existingCheck.rows[0].count) > 0) {
          console.log(`      ⏭️  Ya existen novelties, saltando...`);
          continue;
        }

        // Calcular días en el rango

        const start = new Date(startDateStr + 'T12:00:00');
        const end = new Date(endDateStr + 'T12:00:00');
        const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

        console.log(`      📝 Insertando ${daysDiff} novelties...`);

        for (let i = 0; i < daysDiff; i++) {
          const currentDate = new Date(start);
          currentDate.setDate(start.getDate() + i);
          const dateStr = currentDate.toISOString().split('T')[0];

          await client.query(`
            INSERT INTO novelties (
              personnel_id, date, type, description, start_date, end_date
            )
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            person.personnel_id,
            dateStr,
            noveltyType,
            `${event.event_name} - ${event.destination}`,
            startDateStr,
            endDateStr
          ]);

          totalNovelties++;
        }

        console.log(`      ✅ ${daysDiff} novelties insertadas`);
      }
    }

    await client.query('COMMIT');

    console.log(`\n✅ Backfill completado exitosamente!`);
    console.log(`📊 Total de novelties insertadas: ${totalNovelties}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error durante backfill:', error);
    throw error;
  } finally {
    client.release();
    process.exit(0);
  }
}

// Ejecutar
backfillTravelNovelties().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
