const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const { getTurnoActual, validarHorarioPrograma } = require('../utils/reporteriaRotation');

// GET - Obtener personal de reportería agrupado por TURNOS ACTUALES (AM/PM) con rotación semanal
router.get('/grupos/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;

    console.log(`📋 Obteniendo grupos de reportería para ${fecha}`);

    // Determinar si es fin de semana
    const fechaObj = new Date(fecha + 'T12:00:00');
    const diaSemana = fechaObj.getDay();
    const esFinDeSemana = diaSemana === 0 || diaSemana === 6;

    // Obtener personal de reportería ordenado por grupo
    const personalQuery = `
      SELECT
        id,
        name,
        area,
        grupo_reporteria,
        turno,
        active
      FROM personnel
      WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
        AND active = true
        AND grupo_reporteria IS NOT NULL
      ORDER BY
        CASE
          WHEN grupo_reporteria = 'GRUPO_A' THEN 1
          WHEN grupo_reporteria = 'GRUPO_B' THEN 2
          ELSE 3
        END,
        area DESC,
        name
    `;

    const personalResult = await pool.query(personalQuery);
    const personal = personalResult.rows;

    // 🆕 Agrupar por TURNO ACTUAL (AM/PM) con rotación semanal
    const turnoAM = {
      nombre: 'TURNO MAÑANA (08:00 - 13:00)',
      horario: '08:00 - 13:00',
      camarografos: [],
      asistentes: [],
      horaLimite: '13:00'
    };

    const turnoPM = {
      nombre: 'TURNO TARDE (13:00 - 20:00)',
      horario: '13:00 - 20:00',
      camarografos: [],
      asistentes: [],
      horaLimite: '13:00'
    };

    // 🆕 LEER ASIGNACIONES DE LA PESTAÑA DE PROGRAMACIÓN
    // Llamar al endpoint /daily/:date que maneja TODA la lógica de generación y herencia
    console.log(`📞 Llamando a GET /api/schedule/daily/${fecha} para obtener programación completa...`);

    let assignmentsData = {};
    let programsData = {};
    let programs = [];

    try {
      const dailyResponse = await fetch(`http://localhost:3000/api/schedule/daily/${fecha}`);

      if (dailyResponse.ok) {
        const dailyData = await dailyResponse.json();
        assignmentsData = dailyData.assignments || {};
        programs = dailyData.programs || [];

        const assignmentKeys = Object.keys(assignmentsData);
        console.log(`✅ Programación cargada: ${assignmentKeys.length} asignaciones, ${programs.length} programas`);

        // Si hay muy pocas asignaciones (solo reportería heredada), advertir
        if (assignmentKeys.length > 0 && assignmentKeys.length < 100) {
          console.log(`⚠️  ADVERTENCIA: Solo ${assignmentKeys.length} asignaciones encontradas (puede ser datos incompletos)`);
        }
      } else {
        const errorText = await dailyResponse.text();
        console.error(`❌ Error al obtener programación diaria: ${dailyResponse.status} - ${errorText}`);
      }
    } catch (error) {
      console.error(`❌ Error al llamar /daily/${fecha}:`, error.message);
    }

    for (const persona of personal) {
      // Obtener o crear espacios de salida para esta persona
      const espaciosResult = await pool.query(
        `SELECT * FROM reporteria_espacios_salida
         WHERE personnel_id = $1 AND fecha = $2
         ORDER BY numero_espacio`,
        [persona.id, fecha]
      );

      let espacios = espaciosResult.rows;

      // 🆕 BUSCAR PROGRAMAS ASIGNADOS EN LA PROGRAMACIÓN
      const programasAsignados = [];
      Object.entries(assignmentsData).forEach(([key, value]) => {
        const [personnelId, programId] = key.split('_');
        if (personnelId === persona.id.toString() && value === true) {
          // Buscar el programa (programId puede ser string o número)
          const programa = programs.find(p => p.id.toString() === programId.toString());
          if (programa) {
            programasAsignados.push({
              id: programId,
              nombre: programa.name,
              hora: programa.defaultTime || programa.time
            });
          }
        }
      });

      // Si no existen los 3 espacios, crearlos
      if (espacios.length < 3) {
        for (let i = 1; i <= 3; i++) {
          const existe = espacios.find(e => e.numero_espacio === i);
          if (!existe) {
            // 🆕 Si hay un programa asignado, usarlo
            const programaAsignado = programasAsignados[i - 1];

            const nuevoEspacio = await pool.query(
              `INSERT INTO reporteria_espacios_salida
               (personnel_id, numero_espacio, fecha, hora_salida, hora_llegada, conductor, ubicacion)
               VALUES ($1, $2, $3, $4, $5, $6, $7)
               ON CONFLICT (personnel_id, fecha, numero_espacio) DO NOTHING
               RETURNING *`,
              [
                persona.id,
                i,
                fecha,
                programaAsignado?.hora || null,
                null,
                null,
                programaAsignado?.nombre || null
              ]
            );
            if (nuevoEspacio.rows[0]) {
              espacios.push(nuevoEspacio.rows[0]);
            }
          }
        }
        // Reordenar
        espacios.sort((a, b) => a.numero_espacio - b.numero_espacio);
      }

      // 🆕 Calcular turno actual con rotación semanal
      const turnoInfo = getTurnoActual(persona.grupo_reporteria, fecha);

      const personaConEspacios = {
        ...persona,
        turnoActual: turnoInfo.turno, // 'AM' o 'PM'
        turnoInfo: turnoInfo, // Info completa de rotación
        espacios_salida: espacios.map(e => ({
          id: e.id,
          numero_espacio: e.numero_espacio,
          hora_salida: e.hora_salida,
          hora_llegada: e.hora_llegada,
          conductor: e.conductor,
          periodista: e.periodista,
          ubicacion: e.ubicacion
        }))
      };

      // Agregar al TURNO ACTUAL (no al grupo fijo)
      if (turnoInfo.turno === 'AM') {
        if (persona.area === 'CAMARÓGRAFOS DE REPORTERÍA') {
          turnoAM.camarografos.push(personaConEspacios);
        } else {
          turnoAM.asistentes.push(personaConEspacios);
        }
      } else {
        if (persona.area === 'CAMARÓGRAFOS DE REPORTERÍA') {
          turnoPM.camarografos.push(personaConEspacios);
        } else {
          turnoPM.asistentes.push(personaConEspacios);
        }
      }
    }

    console.log(`✅ Turnos procesados para ${fecha}:`);
    console.log(`   Turno AM: ${turnoAM.camarografos.length} camarógrafos, ${turnoAM.asistentes.length} asistentes`);
    console.log(`   Turno PM: ${turnoPM.camarografos.length} camarógrafos, ${turnoPM.asistentes.length} asistentes`);

    res.json({
      fecha,
      esFinDeSemana,
      turnos: {
        AM: turnoAM,
        PM: turnoPM
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener grupos de reportería:', error);
    res.status(500).json({ error: 'Error al obtener grupos de reportería' });
  }
});

// PATCH - Actualizar un espacio de salida específico CON VALIDACIÓN DE HORARIO
router.patch('/espacio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hora_salida, hora_llegada, conductor, periodista, ubicacion } = req.body;

    console.log(`📝 Actualizando espacio ${id}:`, req.body);

    // 🔒 VALIDACIÓN: Obtener información del empleado y su turno actual
    const espacioInfo = await pool.query(
      `SELECT e.*, p.grupo_reporteria, p.name, p.area, e.fecha
       FROM reporteria_espacios_salida e
       INNER JOIN personnel p ON e.personnel_id = p.id
       WHERE e.id = $1`,
      [id]
    );

    if (espacioInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Espacio de salida no encontrado' });
    }

    const espacio = espacioInfo.rows[0];
    const { grupo_reporteria, name, fecha } = espacio;

    // 🔒 VALIDAR que la hora_salida sea compatible con el turno del empleado
    if (hora_salida) {
      const esValido = validarHorarioPrograma(grupo_reporteria, hora_salida, fecha);
      if (!esValido) {
        const turnoInfo = getTurnoActual(grupo_reporteria, fecha);
        return res.status(400).json({
          error: 'Horario incompatible con turno del empleado',
          detalles: {
            empleado: name,
            turnoActual: turnoInfo.turno,
            horarioPermitido: turnoInfo.horario,
            horaIntentada: hora_salida,
            mensaje: turnoInfo.turno === 'AM'
              ? 'Este empleado está en turno MAÑANA (08:00-13:00). Solo puede asignarse a programas antes de las 13:00.'
              : 'Este empleado está en turno TARDE (13:00-20:00). Solo puede asignarse a programas desde las 13:00 en adelante.'
          }
        });
      }
    }

    // ✅ Si pasa la validación, actualizar
    const result = await pool.query(
      `UPDATE reporteria_espacios_salida
       SET hora_salida = $1,
           hora_llegada = $2,
           conductor = $3,
           periodista = $4,
           ubicacion = $5,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [hora_salida, hora_llegada, conductor, periodista, ubicacion, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Espacio de salida no encontrado' });
    }

    console.log(`✅ Espacio ${id} actualizado correctamente`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al actualizar espacio de salida:', error);
    res.status(500).json({ error: 'Error al actualizar espacio de salida' });
  }
});

// GET - Obtener disponibilidad por grupo según hora actual
router.get('/disponibilidad/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    const { allDay } = req.query; // Nuevo parámetro para Dashboard

    // Determinar si es fin de semana
    const fechaObj = new Date(fecha + 'T12:00:00');
    const diaSemana = fechaObj.getDay();
    const esFinDeSemana = diaSemana === 0 || diaSemana === 6;

    // Determinar turno actual basado en la hora
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const turnoActual = horaActual < 13 ? 'AM' : 'PM';

    console.log(`⏰ Hora actual: ${horaActual}:00, Turno: ${turnoActual}, Fin de semana: ${esFinDeSemana}, AllDay: ${allDay}`);

    // Intentar usar auto-shifts, pero tener un plan B consultando directamente
    let camarasConTurno = [];
    let asistentesConTurno = [];
    let shifts = [];

    try {
      const autoShiftsResponse = await fetch(`http://localhost:3000/api/schedule/auto-shifts/${fecha}`);
      shifts = await autoShiftsResponse.json();

      // Validar que shifts sea un array
      if (!Array.isArray(shifts)) {
        console.warn('⚠️  auto-shifts no retornó un array, usando plan B');
        shifts = [];
      }
    } catch (error) {
      console.warn('⚠️  Error al obtener auto-shifts, usando plan B:', error.message);
      shifts = [];
    }

    // Si auto-shifts falló o está vacío, consultar directamente la base de datos
    if (shifts.length === 0) {
      console.log('📋 Consultando personal directamente desde la base de datos...');

      const personalResult = await pool.query(`
        SELECT id as personnel_id, name, area
        FROM personnel
        WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
        AND active = true
        ORDER BY area, name
      `);

      // Simular estructura de shifts para compatibilidad
      shifts = personalResult.rows.map(p => ({
        personnel_id: p.personnel_id,
        name: p.name,
        area: p.area,
        turno_rotado: 'AM' // Default, en fin de semana no importa
      }));
    }

    if (esFinDeSemana || allDay === 'true') {
      // FIN DE SEMANA O DASHBOARD (allDay): TODO el personal de reportería del día
      camarasConTurno = shifts.filter(s => s.area === 'CAMARÓGRAFOS DE REPORTERÍA');
      asistentesConTurno = shifts.filter(s => s.area === 'ASISTENTES DE REPORTERÍA');
    } else {
      // ENTRE SEMANA (módulo asignaciones): Solo del turno actual
      camarasConTurno = shifts.filter(s =>
        s.area === 'CAMARÓGRAFOS DE REPORTERÍA' && s.turno_rotado === turnoActual
      );
      asistentesConTurno = shifts.filter(s =>
        s.area === 'ASISTENTES DE REPORTERÍA' && s.turno_rotado === turnoActual
      );
    }

    const totalCamarografosTurno = camarasConTurno.length;
    const totalAsistentesTurno = asistentesConTurno.length;

    // Obtener IDs de personal con turno
    const camarasIds = camarasConTurno.map(s => s.personnel_id);
    const asistentesIds = asistentesConTurno.map(s => s.personnel_id);

    // Contar camarógrafos ocupados (que tengan ubicación asignada en reporteria_espacios_salida)
    let ocupadosCamarografos = 0;
    if (camarasIds.length > 0) {
      const camarografosOcupadosResult = await pool.query(
        `SELECT COUNT(DISTINCT e.personnel_id) as ocupados
         FROM reporteria_espacios_salida e
         WHERE e.fecha = $1
           AND e.personnel_id = ANY($2::int[])
           AND e.ubicacion IS NOT NULL
           AND e.ubicacion != ''`,
        [fecha, camarasIds]
      );
      ocupadosCamarografos = parseInt(camarografosOcupadosResult.rows[0].ocupados);
    }

    // 🆕 RESTAR camarógrafos en despachos activos
    const camarasEnDespachosResult = await pool.query(
      `SELECT COUNT(DISTINCT cameraman_id) as en_despachos
       FROM press_dispatches
       WHERE date = $1
         AND status IN ('PROGRAMADO', 'EN_RUTA')
         AND cameraman_id IS NOT NULL`,
      [fecha]
    );
    const camarasEnDespachos = parseInt(camarasEnDespachosResult.rows[0].en_despachos);
    ocupadosCamarografos += camarasEnDespachos;

    // Contar asistentes ocupados (que tengan ubicación asignada en reporteria_espacios_salida)
    let ocupadosAsistentes = 0;
    if (asistentesIds.length > 0) {
      const asistentesOcupadosResult = await pool.query(
        `SELECT COUNT(DISTINCT e.personnel_id) as ocupados
         FROM reporteria_espacios_salida e
         WHERE e.fecha = $1
           AND e.personnel_id = ANY($2::int[])
           AND e.ubicacion IS NOT NULL
           AND e.ubicacion != ''`,
        [fecha, asistentesIds]
      );
      ocupadosAsistentes = parseInt(asistentesOcupadosResult.rows[0].ocupados);
    }

    // 🆕 RESTAR asistentes en despachos activos
    const asistentesEnDespachosResult = await pool.query(
      `SELECT COUNT(DISTINCT assistant_id) as en_despachos
       FROM press_dispatches
       WHERE date = $1
         AND status IN ('PROGRAMADO', 'EN_RUTA')
         AND assistant_id IS NOT NULL`,
      [fecha]
    );
    const asistentesEnDespachos = parseInt(asistentesEnDespachosResult.rows[0].en_despachos);
    ocupadosAsistentes += asistentesEnDespachos;

    const disponiblesCamarografos = totalCamarografosTurno - ocupadosCamarografos;
    const disponiblesAsistentes = totalAsistentesTurno - ocupadosAsistentes;

    const total = totalCamarografosTurno + totalAsistentesTurno;
    const disponibles = disponiblesCamarografos + disponiblesAsistentes;
    const ocupados = ocupadosCamarografos + ocupadosAsistentes;

    console.log(`📊 Disponibilidad para ${fecha} ${esFinDeSemana ? '(FIN DE SEMANA)' : `(Turno ${turnoActual})`}:`);
    console.log(`   Camarógrafos: ${disponiblesCamarografos}/${totalCamarografosTurno} disponibles`);
    console.log(`   Asistentes: ${disponiblesAsistentes}/${totalAsistentesTurno} disponibles`);

    // Calcular cuántos están en espacios vs despachos
    const camarasEnEspacios = ocupadosCamarografos - camarasEnDespachos;
    const asistentesEnEspacios = ocupadosAsistentes - asistentesEnDespachos;

    res.json({
      total,
      disponibles,
      ocupados,
      porcentaje: total > 0 ? Math.round((disponibles / total) * 100) : 0,
      // Datos agrupados por área (formato esperado por el frontend)
      camarografos: {
        total: totalCamarografosTurno,
        disponibles: disponiblesCamarografos,
        ocupados: ocupadosCamarografos,
        en_espacios: camarasEnEspacios,
        en_despachos: camarasEnDespachos
      },
      asistentes: {
        total: totalAsistentesTurno,
        disponibles: disponiblesAsistentes,
        ocupados: ocupadosAsistentes,
        en_espacios: asistentesEnEspacios,
        en_despachos: asistentesEnDespachos
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener disponibilidad:', error);
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
});

// DELETE - Limpiar un espacio de salida (poner en blanco)
router.delete('/espacio/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE reporteria_espacios_salida
       SET hora_salida = NULL,
           hora_llegada = NULL,
           conductor = NULL,
           periodista = NULL,
           ubicacion = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Espacio de salida no encontrado' });
    }

    console.log(`🗑️ Espacio ${id} limpiado correctamente`);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error al limpiar espacio de salida:', error);
    res.status(500).json({ error: 'Error al limpiar espacio de salida' });
  }
});

// GET - Detalle de Camarógrafos para el Dashboard
router.get('/detalle/camarografos/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    console.log(`📷 Obteniendo detalle de camarógrafos para ${fecha}`);

    // Obtener todos los camarógrafos activos
    const camarografosQuery = `
      SELECT
        p.id,
        p.name as nombre,
        p.area as cargo,
        p.grupo_reporteria,
        p.turno
      FROM personnel p
      WHERE p.area = 'CAMARÓGRAFOS DE REPORTERÍA'
        AND p.active = true
      ORDER BY p.name
    `;

    const result = await pool.query(camarografosQuery);
    const camarografos = result.rows;

    // 🔄 Obtener turnos en TIEMPO REAL desde auto-shifts
    const http = require('http');
    let autoShifts = [];
    try {
      const shiftsResponse = await new Promise((resolve, reject) => {
        http.get(`http://localhost:3000/api/schedule/auto-shifts/${fecha}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve([]);
            }
          });
        }).on('error', reject);
      });
      autoShifts = shiftsResponse || [];
    } catch (error) {
      console.log('   ⚠️ No se pudieron obtener turnos automáticos');
    }

    // Crear mapa de turnos
    const autoShiftsMap = {};
    autoShifts.forEach(shift => {
      if (shift.area === 'CAMARÓGRAFOS DE REPORTERÍA') {
        autoShiftsMap[shift.personnel_id] = shift;
      }
    });

    // Obtener asignaciones/espacios de salida para esta fecha
    const espaciosQuery = `
      SELECT
        personnel_id,
        numero_espacio,
        hora_salida,
        hora_llegada,
        periodista,
        ubicacion,
        conductor
      FROM reporteria_espacios_salida
      WHERE fecha = $1
    `;

    const espaciosResult = await pool.query(espaciosQuery, [fecha]);
    const espacios = espaciosResult.rows;

    // 🆕 TAMBIÉN buscar en press_dispatches para despachos activos
    const despachosQuery = `
      SELECT
        cameraman_id as personnel_id,
        departure_time as hora_salida,
        estimated_return as hora_llegada,
        destination as ubicacion,
        journalist_name as periodista,
        assistant_name as asistente,
        driver_name as conductor,
        vehicle_plate as vehiculo,
        liveu_code as liveu
      FROM press_dispatches
      WHERE date = $1
        AND status IN ('PROGRAMADO', 'EN_RUTA')
        AND cameraman_id IS NOT NULL
    `;
    const despachosResult = await pool.query(despachosQuery, [fecha]);
    const despachos = despachosResult.rows;

    // Enriquecer la información
    const detalle = camarografos.map(cam => {
      const espacioPersona = espacios.find(e => e.personnel_id === cam.id);
      const despachoPersona = despachos.find(d => d.personnel_id === cam.id);
      const autoShift = autoShiftsMap[cam.id];

      // Priorizar despacho activo sobre espacio de salida
      const asignacion = despachoPersona || espacioPersona;

      // Determinar estado basado en si tiene espacio de salida O despacho activo
      const estado = asignacion?.hora_salida ? 'EN_TERRENO' : 'EN_CANAL';

      // Obtener turno y hora de llamado del auto-shift
      let turnoNombre = 'N/A';
      let horaLlamado = 'N/A';

      if (autoShift) {
        const shiftStartHour = parseInt(autoShift.shift_start.split(':')[0]);
        turnoNombre = autoShift.turno_rotado === 'AM' ? 'MAÑANA' :
                      autoShift.turno_rotado === 'PM' ? 'TARDE' :
                      shiftStartHour < 12 ? 'MAÑANA' : 'TARDE';
        horaLlamado = autoShift.shift_start.substring(0, 5);
      }

      return {
        id: cam.id,
        nombre: cam.nombre,
        cargo: cam.cargo,
        turno: turnoNombre,
        hora_llamado: horaLlamado,
        estado: estado,
        despacho: asignacion?.hora_salida ? {
          ubicacion: asignacion.ubicacion,
          destino: asignacion.ubicacion,
          periodista: asignacion.periodista,
          asistente: asignacion.asistente,
          conductor: asignacion.conductor,
          hora_salida: asignacion.hora_salida,
          hora_llegada: asignacion.hora_llegada,
          vehiculo: asignacion.vehiculo,
          liveu: asignacion.liveu
        } : null
      };
    });

    // Filtrar solo los que tienen turno programado y ordenar por hora de llamado
    const detalleConTurno = detalle
      .filter(d => d.turno !== 'N/A')
      .sort((a, b) => {
        if (a.hora_llamado === 'N/A') return 1;
        if (b.hora_llamado === 'N/A') return -1;
        return a.hora_llamado.localeCompare(b.hora_llamado);
      });

    res.json(detalleConTurno);
  } catch (error) {
    console.error('❌ Error al obtener detalle de camarógrafos:', error);
    res.status(500).json({ error: 'Error al obtener detalle de camarógrafos' });
  }
});

// GET - Detalle de Asistentes para el Dashboard
router.get('/detalle/asistentes/:fecha', async (req, res) => {
  try {
    const { fecha } = req.params;
    console.log(`🎥 Obteniendo detalle de asistentes para ${fecha}`);

    // Obtener todos los asistentes activos
    const asistentesQuery = `
      SELECT
        p.id,
        p.name as nombre,
        p.area as cargo,
        p.grupo_reporteria,
        p.turno
      FROM personnel p
      WHERE p.area = 'ASISTENTES DE REPORTERÍA'
        AND p.active = true
      ORDER BY p.name
    `;

    const result = await pool.query(asistentesQuery);
    const asistentes = result.rows;

    // 🔄 Obtener turnos en TIEMPO REAL desde auto-shifts
    const http = require('http');
    let autoShifts = [];
    try {
      const shiftsResponse = await new Promise((resolve, reject) => {
        http.get(`http://localhost:3000/api/schedule/auto-shifts/${fecha}`, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve([]);
            }
          });
        }).on('error', reject);
      });
      autoShifts = shiftsResponse || [];
    } catch (error) {
      console.log('   ⚠️ No se pudieron obtener turnos automáticos');
    }

    // Crear mapa de turnos
    const autoShiftsMap = {};
    autoShifts.forEach(shift => {
      if (shift.area === 'ASISTENTES DE REPORTERÍA') {
        autoShiftsMap[shift.personnel_id] = shift;
      }
    });

    // Obtener asignaciones/espacios de salida para esta fecha
    const espaciosQuery = `
      SELECT
        personnel_id,
        numero_espacio,
        hora_salida,
        hora_llegada,
        periodista,
        ubicacion,
        conductor
      FROM reporteria_espacios_salida
      WHERE fecha = $1
    `;

    const espaciosResult = await pool.query(espaciosQuery, [fecha]);
    const espacios = espaciosResult.rows;

    // 🆕 TAMBIÉN buscar en press_dispatches para despachos activos
    const despachosQuery = `
      SELECT
        assistant_id as personnel_id,
        departure_time as hora_salida,
        estimated_return as hora_llegada,
        destination as ubicacion,
        journalist_name as periodista,
        cameraman_name as camarografo,
        driver_name as conductor,
        vehicle_plate as vehiculo,
        liveu_code as liveu
      FROM press_dispatches
      WHERE date = $1
        AND status IN ('PROGRAMADO', 'EN_RUTA')
        AND assistant_id IS NOT NULL
    `;
    const despachosResult = await pool.query(despachosQuery, [fecha]);
    const despachos = despachosResult.rows;

    // Enriquecer la información
    const detalle = asistentes.map(asist => {
      const espacioPersona = espacios.find(e => e.personnel_id === asist.id);
      const despachoPersona = despachos.find(d => d.personnel_id === asist.id);
      const autoShift = autoShiftsMap[asist.id];

      // Priorizar despacho activo sobre espacio de salida
      const asignacion = despachoPersona || espacioPersona;

      // Determinar estado basado en si tiene espacio de salida O despacho activo
      const estado = asignacion?.hora_salida ? 'EN_TERRENO' : 'EN_CANAL';

      // Obtener turno y hora de llamado del auto-shift
      let turnoNombre = 'N/A';
      let horaLlamado = 'N/A';

      if (autoShift) {
        const shiftStartHour = parseInt(autoShift.shift_start.split(':')[0]);
        turnoNombre = autoShift.turno_rotado === 'AM' ? 'MAÑANA' :
                      autoShift.turno_rotado === 'PM' ? 'TARDE' :
                      shiftStartHour < 12 ? 'MAÑANA' : 'TARDE';
        horaLlamado = autoShift.shift_start.substring(0, 5);
      }

      return {
        id: asist.id,
        nombre: asist.nombre,
        cargo: asist.cargo,
        turno: turnoNombre,
        hora_llamado: horaLlamado,
        estado: estado,
        despacho: asignacion?.hora_salida ? {
          ubicacion: asignacion.ubicacion,
          destino: asignacion.ubicacion,
          periodista: asignacion.periodista,
          camarografo: asignacion.camarografo,
          conductor: asignacion.conductor,
          hora_salida: asignacion.hora_salida,
          hora_llegada: asignacion.hora_llegada,
          vehiculo: asignacion.vehiculo,
          liveu: asignacion.liveu
        } : null
      };
    });

    // Filtrar solo los que tienen turno programado y ordenar por hora de llamado
    const detalleConTurno = detalle
      .filter(d => d.turno !== 'N/A')
      .sort((a, b) => {
        if (a.hora_llamado === 'N/A') return 1;
        if (b.hora_llamado === 'N/A') return -1;
        return a.hora_llamado.localeCompare(b.hora_llamado);
      });

    res.json(detalleConTurno);
  } catch (error) {
    console.error('❌ Error al obtener detalle de asistentes:', error);
    res.status(500).json({ error: 'Error al obtener detalle de asistentes' });
  }
});

module.exports = router;
