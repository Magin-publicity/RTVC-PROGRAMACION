const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { WEEKEND_PERSONNEL_NUMBERED } = require('../config/weekend-rotation-numbered');
const {
  WEEKEND_ROTATION_BASE_DATE,
  WEEKDAY_ROTATION_BASE_DATE,
  validateWeekendBaseDate,
  validateWeekdayBaseDate,
  calculateWeekendCount,
  calculateWeeksDiff
} = require('../config/rotation-constants');


// Obtener la semana de rotación actual
router.get('/rotation-week', async (req, res) => {
  try {
    const result = await pool.query('SELECT current_week, week_start_date FROM rotation_config ORDER BY id DESC LIMIT 1');
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting rotation week:', error);
    res.status(500).json({ error: 'Error al obtener semana de rotación' });
  }
});

// Actualizar la semana de rotación
router.post('/rotation-week', async (req, res) => {
  try {
    const { current_week, week_start_date } = req.body;
    await pool.query(
      'UPDATE rotation_config SET current_week = $1, week_start_date = $2, updated_at = CURRENT_TIMESTAMP',
      [current_week, week_start_date]
    );
    res.json({ message: 'Semana de rotación actualizada' });
  } catch (error) {
    console.error('Error updating rotation week:', error);
    res.status(500).json({ error: 'Error al actualizar semana de rotación' });
  }
});

// Obtener turnos automáticos para una fecha específica
router.get('/auto-shifts/:date', async (req, res) => {
  try {
    const { date } = req.params;
    // Agregar 'T12:00:00' para evitar problemas de zona horaria
    const selectedDate = new Date(date + 'T12:00:00');

    // Verificar si es fin de semana (sábado = 6, domingo = 0)
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // ⚠️⚠️⚠️ CRÍTICO - ROTACIÓN DE FIN DE SEMANA ⚠️⚠️⚠️
      // NO MODIFICAR: Este código está sincronizado con /api/schedule/daily/:date
      // Ambos endpoints DEBEN usar la misma fecha base (WEEKEND_ROTATION_BASE_DATE)
      // Si cambias esto, la rotación de CONTRIBUCIONES se romperá

      // Sistema de rotación numerado para fin de semana
      // Validar que la fecha base no haya sido modificada
      validateWeekendBaseDate(WEEKEND_ROTATION_BASE_DATE);

      const baseDate = new Date(WEEKEND_ROTATION_BASE_DATE);
      const weekendCount = calculateWeekendCount(selectedDate);

      console.log(`📅 Fecha: ${date} es fin de semana (día ${dayOfWeek}), Rotación #${weekendCount}`);

      // Obtener todo el personal activo y disponible
      const personnelResult = await pool.query(`
        SELECT id, name, area FROM personnel
        WHERE active = true
        AND (
          is_available = true
          OR is_available IS NULL
          OR (unavailability_start_date IS NOT NULL AND unavailability_end_date IS NOT NULL
              AND NOT ($1::date BETWEEN unavailability_start_date AND unavailability_end_date))
        )
      `, [date]);

      const personnelMap = {};
      personnelResult.rows.forEach(person => {
        personnelMap[person.name] = person;
      });

      const shifts = [];

      // Procesar cada área
      Object.keys(WEEKEND_PERSONNEL_NUMBERED).forEach(area => {
        const areaPersonnel = WEEKEND_PERSONNEL_NUMBERED[area];

        // 🎥 LÓGICA ESPECIAL PARA CAMARÓGRAFOS DE ESTUDIO EN FIN DE SEMANA
        // Rotación por GRUPOS de 4 personas que ALTERNAN entre AM y PM
        // Ejemplo: Grupo A semana 0 en AM → semana 1 en PM → semana 2 en AM...
        if (area === 'CAMARÓGRAFOS DE ESTUDIO') {
          console.log(`📹 CAMARÓGRAFOS DE ESTUDIO (fin de semana): Rotación por grupos de 4 (alternando AM/PM)`);

          // Todo el personal de camarógrafos (sin separar por turno preferido)
          const allCameras = areaPersonnel;
          console.log(`   Total personal: ${allCameras.length} personas`);
          console.log(`   Rotación #${weekendCount}`);

          // Dividir en grupos de 4
          const numGroups = Math.ceil(allCameras.length / 4);
          console.log(`   Total grupos: ${numGroups}`);

          // Determinar qué 2 grupos trabajan esta semana
          // Cada par de grupos trabaja juntos en una semana
          const pairIndex = weekendCount % numGroups; // Qué par de grupos trabaja
          const groupIndexA = (pairIndex * 2) % numGroups;
          const groupIndexB = (pairIndex * 2 + 1) % numGroups;

          console.log(`   Grupos trabajando: Grupo ${groupIndexA} y Grupo ${groupIndexB}`);

          // Determinar si cada grupo trabaja AM o PM
          // Contar cuántas veces ha trabajado cada grupo hasta ahora
          const timesWorkedA = Math.floor(weekendCount / numGroups) * 2 + (pairIndex * 2 < numGroups * 2 ? 1 : 0);
          const timesWorkedB = timesWorkedA; // Trabajan juntos siempre

          // El primer grupo siempre AM, el segundo siempre PM ESTA SEMANA
          // Pero alternan en la próxima vez que trabajen
          const groupAShift = (timesWorkedA % 2 === 0) ? 'AM' : 'PM';
          const groupBShift = (timesWorkedA % 2 === 0) ? 'PM' : 'AM';

          console.log(`   Grupo ${groupIndexA} → ${groupAShift} (ciclo ${timesWorkedA})`);
          console.log(`   Grupo ${groupIndexB} → ${groupBShift} (ciclo ${timesWorkedB})`);

          // Asignar Grupo A
          const startIdxA = groupIndexA * 4;
          const shiftA = groupAShift === 'AM' ? { start: '08:00:00', end: '16:00:00', label: '08:00-16:00' } : { start: '14:00:00', end: '22:00:00', label: '14:00-22:00' };

          for (let i = 0; i < 4 && (startIdxA + i) < allCameras.length; i++) {
            const personConfig = allCameras[startIdxA + i];
            const person = personnelMap[personConfig.name];

            if (person) {
              shifts.push({
                personnel_id: person.id,
                name: person.name,
                area: person.area,
                shift_start: shiftA.start,
                shift_end: shiftA.end,
                week_number: 0,
                original_shift: shiftA.label,
                is_weekend: true,
                rotation_number: personConfig.number
              });
              console.log(`   ✅ Grupo ${groupIndexA} (${groupAShift}) #${personConfig.number} ${person.name} → ${shiftA.label}`);
            }
          }

          // Asignar Grupo B
          const startIdxB = groupIndexB * 4;
          const shiftB = groupBShift === 'AM' ? { start: '08:00:00', end: '16:00:00', label: '08:00-16:00' } : { start: '14:00:00', end: '22:00:00', label: '14:00-22:00' };

          for (let i = 0; i < 4 && (startIdxB + i) < allCameras.length; i++) {
            const personConfig = allCameras[startIdxB + i];
            const person = personnelMap[personConfig.name];

            if (person) {
              shifts.push({
                personnel_id: person.id,
                name: person.name,
                area: person.area,
                shift_start: shiftB.start,
                shift_end: shiftB.end,
                week_number: 0,
                original_shift: shiftB.label,
                is_weekend: true,
                rotation_number: personConfig.number
              });
              console.log(`   ✅ Grupo ${groupIndexB} (${groupBShift}) #${personConfig.number} ${person.name} → ${shiftB.label}`);
            }
          }

          return; // Salir para no usar la lógica estándar
        }

        // 🔧 LÓGICA ESPECIAL PARA REPORTERÍA EN FIN DE SEMANA CON ROTACIÓN
        if (area === 'CAMARÓGRAFOS DE REPORTERÍA') {
          console.log(`📹 ${area}: Asignando 4 AM + 4 PM con rotación #${weekendCount}`);

          // Total: 18 personas, cada fin de semana rotan 8 (4 AM + 4 PM)
          const totalPersonnel = areaPersonnel.length;
          console.log(`   Total personal en pool: ${totalPersonnel}`);

          // Calcular índice de inicio: avanza 8 posiciones cada fin de semana
          const startIndex = (weekendCount * 8) % totalPersonnel;

          console.log(`   Índice de inicio: ${startIndex}`);

          // Tomar 8 personas consecutivas del pool
          // Las primeras 4 siempre van a AM, las siguientes 4 siempre van a PM
          const toAssign = [];
          for (let i = 0; i < 8; i++) {
            const idx = (startIndex + i) % totalPersonnel;
            const personConfig = areaPersonnel[idx];

            // Determinar turno fijo según posición en el bloque de 8
            // Primeros 4 → AM, Siguientes 4 → PM (sin alternar)
            const shift = i < 4 ? '08:00-14:00' : '14:00-20:00';

            toAssign.push({
              ...personConfig,
              assignedShift: shift
            });
          }

          let amAssigned = 0;
          let pmAssigned = 0;

          toAssign.forEach(personConfig => {
            const person = personnelMap[personConfig.name];
            if (person && personConfig.hasContract !== false) {
              const [startTime, endTime] = personConfig.assignedShift.split('-');
              shifts.push({
                personnel_id: person.id,
                name: person.name,
                area: person.area,
                shift_start: startTime + ':00',
                shift_end: endTime + ':00',
                week_number: 0,
                original_shift: personConfig.assignedShift,
                is_weekend: true,
                rotation_number: personConfig.number
              });
              console.log(`   ✅ #${personConfig.number} ${person.name} → ${personConfig.assignedShift}`);

              if (personConfig.assignedShift === '08:00-14:00') {
                amAssigned++;
              } else {
                pmAssigned++;
              }
            } else if (!person) {
              console.warn(`   ⚠️ Personal no encontrado: ${personConfig.name} (#${personConfig.number})`);
            }
          });

          console.log(`   ✅ Total asignado REAL: ${amAssigned} AM + ${pmAssigned} PM = ${amAssigned + pmAssigned}`);

          if (amAssigned < 4 || pmAssigned < 4) {
            console.warn(`   ⚠️ FALTA PERSONAL: Se asignaron ${amAssigned}/4 AM y ${pmAssigned}/4 PM`);
          }

          return; // Salir del área
        }

        if (area === 'ASISTENTES DE REPORTERÍA') {
          console.log(`📹 ${area}: Asignando 2 AM + 2 PM con rotación #${weekendCount}`);

          // Total: 8 personas, cada fin de semana rotan 4 (2 AM + 2 PM)
          const totalPersonnel = areaPersonnel.length;
          console.log(`   Total personal en pool: ${totalPersonnel}`);

          // Calcular índice de inicio: avanza 4 posiciones cada fin de semana
          const startIndex = (weekendCount * 4) % totalPersonnel;

          // Determinar si deben alternar turnos: cada 2 semanas cambian AM↔PM
          // Dividir weekendCount por 2 (ciclos completos) para saber cuántas veces han rotado
          const cycleNumber = Math.floor(weekendCount / 2);
          const shouldSwap = cycleNumber % 2 === 1;

          console.log(`   Índice de inicio: ${startIndex}, Ciclo: ${cycleNumber}, Alternar: ${shouldSwap}`);

          // Tomar 4 personas consecutivas del pool
          const toAssign = [];
          for (let i = 0; i < 4; i++) {
            const idx = (startIndex + i) % totalPersonnel;
            const personConfig = areaPersonnel[idx];

            // Determinar turno base: primeros 2 → AM, siguientes 2 → PM
            let shift;
            if (shouldSwap) {
              // Intercambiar: primeros 2 → PM, siguientes 2 → AM
              shift = i < 2 ? '14:00-20:00' : '08:00-14:00';
            } else {
              // Normal: primeros 2 → AM, siguientes 2 → PM
              shift = i < 2 ? '08:00-14:00' : '14:00-20:00';
            }

            toAssign.push({
              ...personConfig,
              assignedShift: shift
            });
          }

          let amAssigned = 0;
          let pmAssigned = 0;

          toAssign.forEach(personConfig => {
            const person = personnelMap[personConfig.name];
            if (person && personConfig.hasContract !== false) {
              const [startTime, endTime] = personConfig.assignedShift.split('-');
              shifts.push({
                personnel_id: person.id,
                name: person.name,
                area: person.area,
                shift_start: startTime + ':00',
                shift_end: endTime + ':00',
                week_number: 0,
                original_shift: personConfig.assignedShift,
                is_weekend: true,
                rotation_number: personConfig.number
              });
              console.log(`   ✅ #${personConfig.number} ${person.name} → ${personConfig.assignedShift}`);

              if (personConfig.assignedShift === '08:00-14:00') {
                amAssigned++;
              } else {
                pmAssigned++;
              }
            } else if (!person) {
              console.warn(`   ⚠️ Personal no encontrado: ${personConfig.name} (#${personConfig.number})`);
            }
          });

          console.log(`   ✅ Total asignado REAL: ${amAssigned} AM + ${pmAssigned} PM = ${amAssigned + pmAssigned}`);

          if (amAssigned < 2 || pmAssigned < 2) {
            console.warn(`   ⚠️ FALTA PERSONAL: Se asignaron ${amAssigned}/2 AM y ${pmAssigned}/2 PM`);
          }

          return; // Salir del área
        }

        // ⚠️⚠️⚠️ CRÍTICO - NO MODIFICAR ESTA SECCIÓN ⚠️⚠️⚠️
        // 🔧 LÓGICA ESPECIAL PARA CONTRIBUCIONES EN FIN DE SEMANA CON ROTACIÓN DE 3 SEMANAS
        //
        // Esta lógica implementa una rotación de 3 semanas donde:
        // - Solo 2 de 3 personas trabajan cada fin de semana
        // - 1 persona descansa (NO aparece en turnos ni asignaciones)
        // - Turnos: T1 (08:00-14:00) y T2 (14:00-20:00)
        //
        // PATRÓN DE ROTACIÓN (basado en weekendCount % 3):
        // - rotationWeek = 0: Adrian T1, Carolina T2, Michael descansa
        // - rotationWeek = 1: Michael T1, Adrian T2, Carolina descansa
        // - rotationWeek = 2: Carolina T1, Michael T2, Adrian descansa
        //
        // IMPORTANTE: Esta lógica está sincronizada con el cálculo de callTimes
        // en /api/schedule/daily/:date (líneas 1309-1383). Si modificas esto,
        // DEBES modificar también el otro endpoint o la rotación se romperá.
        // ⚠️⚠️⚠️ FIN DE SECCIÓN CRÍTICA ⚠️⚠️⚠️

        if (area === 'CONTRIBUCIONES') {
          console.log(`📹 ${area}: Rotación de 3 semanas (2 trabajan, 1 descansa) #${weekendCount}`);

          // Personal: Adrian (#3), Michael (#1), Carolina (#2)
          // weekendCount % 3 determina el patrón
          const rotationWeek = weekendCount % 3;

          let t1Person, t2Person;

          if (rotationWeek === 0) {
            // Semana 1: Adrian T1, Carolina T2, Michael descansa
            t1Person = areaPersonnel.find(p => p.number === 3); // Adrian
            t2Person = areaPersonnel.find(p => p.number === 2); // Carolina
            console.log(`   Patrón: Adrian (T1) + Carolina (T2), Michael descansa`);
          } else if (rotationWeek === 1) {
            // Semana 2: Michael T1, Adrian T2, Carolina descansa
            t1Person = areaPersonnel.find(p => p.number === 1); // Michael
            t2Person = areaPersonnel.find(p => p.number === 3); // Adrian
            console.log(`   Patrón: Michael (T1) + Adrian (T2), Carolina descansa`);
          } else {
            // Semana 3: Carolina T1, Michael T2, Adrian descansa
            t1Person = areaPersonnel.find(p => p.number === 2); // Carolina
            t2Person = areaPersonnel.find(p => p.number === 1); // Michael
            console.log(`   Patrón: Carolina (T1) + Michael (T2), Adrian descansa`);
          }

          // Asignar T1 (08:00-14:00)
          if (t1Person) {
            const person = personnelMap[t1Person.name];
            if (person) {
              shifts.push({
                personnel_id: person.id,
                name: person.name,
                area: person.area,
                shift_start: '08:00:00',
                shift_end: '14:00:00',
                week_number: 0,
                original_shift: '08:00-14:00',
                is_weekend: true,
                rotation_number: t1Person.number
              });
              console.log(`   ✅ T1: #${t1Person.number} ${person.name} → 08:00-14:00`);
            }
          }

          // Asignar T2 (14:00-20:00)
          if (t2Person) {
            const person = personnelMap[t2Person.name];
            if (person) {
              shifts.push({
                personnel_id: person.id,
                name: person.name,
                area: person.area,
                shift_start: '14:00:00',
                shift_end: '20:00:00',
                week_number: 0,
                original_shift: '14:00-20:00',
                is_weekend: true,
                rotation_number: t2Person.number
              });
              console.log(`   ✅ T2: #${t2Person.number} ${person.name} → 14:00-20:00`);
            }
          }

          return; // Salir del área
        }

        // Determinar cuántas personas necesitamos por área
        let peopleNeeded = 2; // Por defecto 2 personas

        // Para áreas con 2 personas: rotación consecutiva con turnos alternados
        if (peopleNeeded === 2) {
          // PRIMERO: Filtrar solo personas disponibles
          const availablePersonnel = areaPersonnel.filter(pc => {
            const person = personnelMap[pc.name];
            return person && pc.hasContract !== false;
          });

          if (availablePersonnel.length < 2) {
            console.warn(`⚠️ ${area}: Solo ${availablePersonnel.length} personas disponibles, se necesitan 2`);
            return;
          }

          // Determinar si el área DISPONIBLE es PAR o IMPAR
          const isEvenArea = availablePersonnel.length % 2 === 0;

          // Calcular rotación sobre personas DISPONIBLES
          let startIndex;
          if (isEvenArea) {
            // ÁREAS PARES: avanza 2 posiciones cada semana
            startIndex = (weekendCount * 2) % availablePersonnel.length;
          } else {
            // ÁREAS IMPARES: patrón A+B, C+D, E+A, B+C, D+E
            // Fórmula: (semana * 2) % total
            startIndex = (weekendCount * 2) % availablePersonnel.length;
          }

          let assigned = 0;
          let currentIndex = startIndex;
          const attemptedIndices = new Set();

          // Asignar 2 personas desde el array filtrado
          for (let i = 0; i < 2; i++) {
            const idx = (startIndex + i) % availablePersonnel.length;
            const personConfig = availablePersonnel[idx];
            const person = personnelMap[personConfig.name];

            let shift;

            if (isEvenArea) {
              // ÁREAS PARES: calcular cuántas veces esta pareja ha trabajado
              const pairWorkCount = Math.floor(weekendCount / (availablePersonnel.length / 2));
              const shouldAlternate = pairWorkCount % 2 === 1;

              // Usar el turno base de la configuración
              const baseShift = personConfig.shift;

              // Alternar si la pareja ya trabajó un ciclo completo
              if (shouldAlternate) {
                shift = baseShift === '08:00-16:00' ? '14:00-22:00' : '08:00-16:00';
              } else {
                shift = baseShift;
              }
            } else {
              // ÁREAS IMPARES: calcular cuántas veces esta persona ha trabajado
              let timesWorked = 0;
              for (let w = 0; w < weekendCount; w++) {
                const wStart = (w * 2) % availablePersonnel.length;
                const wEnd = (w * 2 + 1) % availablePersonnel.length;
                if (wStart === idx || wEnd === idx) {
                  timesWorked++;
                }
              }

              // Alternar turno cada vez que trabaja
              const shouldAlternate = timesWorked % 2 === 1;

              if (shouldAlternate) {
                shift = i === 0 ? '14:00-22:00' : '08:00-16:00';
              } else {
                shift = i === 0 ? '08:00-16:00' : '14:00-22:00';
              }
            }

            const [startTime, endTime] = shift.split('-');

            shifts.push({
              personnel_id: person.id,
              name: person.name,
              area: person.area,
              shift_start: startTime + ':00',
              shift_end: endTime + ':00',
              week_number: 0,
              original_shift: shift,
              is_weekend: true,
              rotation_number: personConfig.number
            });

            console.log(`✅ ${area}: #${personConfig.number} ${person.name} → ${shift}`);
          }
        } else {
          // Para áreas con 3 o 4 personas o más (reportería)
          console.log(`📹 ${area}: Asignando ${peopleNeeded} personas en rotación #${weekendCount}`);

          const startIndex = (weekendCount * peopleNeeded) % areaPersonnel.length;
          let assigned = 0;
          let currentIndex = startIndex;
          const attemptedIndices = new Set();

          while (assigned < peopleNeeded && attemptedIndices.size < areaPersonnel.length) {
            attemptedIndices.add(currentIndex);
            const personConfig = areaPersonnel[currentIndex];
            const person = personnelMap[personConfig.name];

            if (person && personConfig.hasContract !== false) {
              const [startTime, endTime] = personConfig.shift.split('-');
              shifts.push({
                personnel_id: person.id,
                name: person.name,
                area: person.area,
                shift_start: startTime + ':00',
                shift_end: endTime + ':00',
                week_number: 0,
                original_shift: personConfig.shift,
                is_weekend: true,
                rotation_number: personConfig.number
              });
              console.log(`   ✅ #${personConfig.number} ${person.name} → ${personConfig.shift}`);
              assigned++;
            } else if (!person) {
              console.warn(`   ⚠️ Personal no encontrado: ${personConfig.name} (#${personConfig.number}) en ${area}`);
            } else if (personConfig.hasContract === false) {
              console.log(`   ⏭️ Saltando ${personConfig.name} (#${personConfig.number}) - Sin contrato`);
            }

            currentIndex = (currentIndex + 1) % areaPersonnel.length;
          }

          if (assigned < peopleNeeded) {
            console.warn(`   ⚠️ ${area}: Solo se pudieron asignar ${assigned} de ${peopleNeeded} personas necesarias`);
          }

          console.log(`   ✅ Total asignado para ${area}: ${assigned} personas`);
        }
      });

      console.log(`✅ Asignados ${shifts.length} turnos de fin de semana (Rotación #${weekendCount})`);
      return res.json(shifts);
    }

    // Calcular la semana de rotación basándose en el inicio de la semana (lunes)
    // Encontrar el lunes de la semana actual
    const dayOfWeekNum = selectedDate.getDay();
    const daysFromMonday = dayOfWeekNum === 0 ? 6 : dayOfWeekNum - 1; // Si es domingo (0), son 6 días desde lunes
    const mondayOfWeek = new Date(selectedDate);
    mondayOfWeek.setDate(selectedDate.getDate() - daysFromMonday);

    // ⚠️⚠️⚠️ CRÍTICO - ROTACIÓN DE ENTRE SEMANA ⚠️⚠️⚠️
    // NO MODIFICAR: Esta fecha base es usada para calcular la rotación de turnos
    // de lunes a viernes. Si cambias esto, TODA la rotación de entre semana se romperá.
    //
    // La rotación funciona así:
    // - Fecha base: 4 de noviembre 2025 (Lunes, Semana 0)
    // - weeksDiff calcula cuántas semanas han pasado desde la base
    // - Ciclo de 4 semanas para patrones de rotación
    // - Ciclo diferente (según área) para rotación de personal
    //
    // IMPORTANTE: NO cambiar la fecha base sin actualizar WEEKDAY_ROTATION_BASE_DATE
    // en rotation-constants.js
    // ⚠️⚠️⚠️ FIN DE SECCIÓN CRÍTICA ⚠️⚠️⚠️

    // Validar que la fecha base no haya sido modificada
    validateWeekdayBaseDate(WEEKDAY_ROTATION_BASE_DATE);

    const baseMonday = new Date(WEEKDAY_ROTATION_BASE_DATE);
    const weeksDiff = calculateWeeksDiff(mondayOfWeek);

    // Ciclo de 4 semanas: semana 1, 2, 3, 4, luego vuelve a 1
    const currentWeek = ((weeksDiff % 4) + 4) % 4 + 1;

    const mondayStr = `${mondayOfWeek.getFullYear()}-${String(mondayOfWeek.getMonth() + 1).padStart(2, '0')}-${String(mondayOfWeek.getDate()).padStart(2, '0')}`;
    console.log(`📅 Fecha: ${date}, Lunes de esta semana: ${mondayStr}, Semana de rotación: ${currentWeek}`);
    
    // Obtener todo el personal disponible
    // Filtra por: active=true Y (is_available=true O fecha fuera del rango de no disponibilidad)
    const personnelResult = await pool.query(`
      SELECT * FROM personnel
      WHERE active = true
      AND (
        is_available = true
        OR is_available IS NULL
        OR (unavailability_start_date IS NOT NULL AND unavailability_end_date IS NOT NULL
            AND NOT ($1::date BETWEEN unavailability_start_date AND unavailability_end_date))
      )
      ORDER BY area, name
    `, [date]);
    
    // Obtener patrones de rotación para la semana calculada
    const patternsResult = await pool.query(
      'SELECT * FROM rotation_patterns WHERE week_number = $1 ORDER BY area, shift_start',
      [currentWeek]
    );
    
    // Agrupar patrones por área
    const patternsByArea = {};
    patternsResult.rows.forEach(pattern => {
      if (!patternsByArea[pattern.area]) {
        patternsByArea[pattern.area] = [];
      }
      patternsByArea[pattern.area].push(pattern);
    });
    
    // Asignar turnos al personal
    const shifts = [];
    const personnelByArea = {};
    
    // Agrupar personal por área
    personnelResult.rows.forEach(person => {
      if (!personnelByArea[person.area]) {
        personnelByArea[person.area] = [];
      }
      personnelByArea[person.area].push(person);
    });
    
    // ⚠️⚠️⚠️ CRÍTICO - LÓGICAS ESPECIALES DE ROTACIÓN POR ÁREA ⚠️⚠️⚠️
    // Las siguientes secciones implementan lógicas especiales de rotación para diferentes
    // tipos de áreas. NO MODIFICAR sin entender completamente cómo funciona cada rotación.
    //
    // TIPOS DE ROTACIÓN IMPLEMENTADOS:
    // 1. Áreas con 5 personas: Plantilla de 5 turnos fijos que rotan semanalmente
    // 2. Áreas con 6 personas: Plantilla de 6 turnos fijos que rotan semanalmente
    // 3. Reportería (Camarógrafos/Asistentes): Grupos fijos con rotación AM/PM semanal
    // 4. Otras áreas: Rotación basada en patrones de la base de datos
    //
    // ⚠️ Cambiar estas lógicas romperá la rotación de múltiples áreas ⚠️
    // ⚠️⚠️⚠️ FIN DE ADVERTENCIA CRÍTICA ⚠️⚠️⚠️

    // Obtener novedades del día para filtrar personal disponible
    const noveltiesResult = await pool.query(
      `SELECT * FROM novelties WHERE $1::date BETWEEN start_date AND end_date`,
      [date]
    );
    const noveltiesMap = {};
    noveltiesResult.rows.forEach(n => {
      noveltiesMap[n.personnel_id] = n;
    });

    // Asignar turnos según patrones con rotación y redistribución equitativa
    Object.keys(personnelByArea).forEach(area => {
      const patterns = patternsByArea[area] || [];
      const people = personnelByArea[area];

      if (patterns.length === 0) return;

      // 🎥 CRÍTICO - LÓGICA ESPECIAL PARA CAMARÓGRAFOS DE ESTUDIO (ENTRE SEMANA)
      // Distribución progresiva con sacrificio de Redacción para proteger Estudio 1
      // Reglas de distribución basadas en cantidad de personal disponible
      if (area === 'CAMARÓGRAFOS DE ESTUDIO') {
        console.log(`📹 CAMARÓGRAFOS DE ESTUDIO (entre semana): Aplicando reglas de distribución progresiva`);

        // Filtrar personal disponible (excluir novedades bloqueantes)
        const availablePeople = people.filter(person => {
          const novelty = noveltiesMap[person.id];
          if (!novelty) return true; // Sin novedad = disponible

          // Novedades bloqueantes
          const blockingTypes = ['VIAJE', 'VIAJE MÓVIL', 'LIBRE', 'SIN_CONTRATO', 'INCAPACIDAD'];
          return !blockingTypes.includes(novelty.type);
        });

        const numAvailable = availablePeople.length;
        console.log(`   Personal total: ${people.length}, Disponible: ${numAvailable}`);

        // Definir distribución según reglas progresivas
        let distribucion = null;

        if (numAvailable >= 20) {
          // 20 Cámaras (Full): T1(6: 4 Est/2 Red), T2(6: 4 Est/2 Red), T3(4: 4 Est), T4(4: 4 Est)
          distribucion = [
            { id: 'T1', start: '05:00:00', end: '11:00:00', label: '05:00', cupos: 6, estudio: 4, redaccion: 2 },
            { id: 'T2', start: '09:00:00', end: '15:00:00', label: '09:00', cupos: 6, estudio: 4, redaccion: 2 },
            { id: 'T3', start: '13:00:00', end: '19:00:00', label: '13:00', cupos: 4, estudio: 4, redaccion: 0 },
            { id: 'T4', start: '16:00:00', end: '22:00:00', label: '16:00', cupos: 4, estudio: 4, redaccion: 0 }
          ];
          console.log(`   📊 Distribución: 20+ cámaras (Full) - T1(6), T2(6), T3(4), T4(4)`);
        } else if (numAvailable === 19) {
          // 19 Cámaras: T2 baja a 5 (4 Est / 1 Red)
          distribucion = [
            { id: 'T1', start: '05:00:00', end: '11:00:00', label: '05:00', cupos: 6, estudio: 4, redaccion: 2 },
            { id: 'T2', start: '09:00:00', end: '15:00:00', label: '09:00', cupos: 5, estudio: 4, redaccion: 1 },
            { id: 'T3', start: '13:00:00', end: '19:00:00', label: '13:00', cupos: 4, estudio: 4, redaccion: 0 },
            { id: 'T4', start: '16:00:00', end: '22:00:00', label: '16:00', cupos: 4, estudio: 4, redaccion: 0 }
          ];
          console.log(`   📊 Distribución: 19 cámaras - T1(6), T2(5), T3(4), T4(4)`);
        } else if (numAvailable === 18) {
          // 18 Cámaras: T1 y T2 bajan a 5 cada uno (4 Est / 1 Red cada uno)
          distribucion = [
            { id: 'T1', start: '05:00:00', end: '11:00:00', label: '05:00', cupos: 5, estudio: 4, redaccion: 1 },
            { id: 'T2', start: '09:00:00', end: '15:00:00', label: '09:00', cupos: 5, estudio: 4, redaccion: 1 },
            { id: 'T3', start: '13:00:00', end: '19:00:00', label: '13:00', cupos: 4, estudio: 4, redaccion: 0 },
            { id: 'T4', start: '16:00:00', end: '22:00:00', label: '16:00', cupos: 4, estudio: 4, redaccion: 0 }
          ];
          console.log(`   📊 Distribución: 18 cámaras - T1(5), T2(5), T3(4), T4(4)`);
        } else if (numAvailable === 17) {
          // 17 Cámaras: T1(5), T2(4: 0 Redacción), T3(4), T4(4). Redacción se sacrifica en T2
          distribucion = [
            { id: 'T1', start: '05:00:00', end: '11:00:00', label: '05:00', cupos: 5, estudio: 4, redaccion: 1 },
            { id: 'T2', start: '09:00:00', end: '15:00:00', label: '09:00', cupos: 4, estudio: 4, redaccion: 0 },
            { id: 'T3', start: '13:00:00', end: '19:00:00', label: '13:00', cupos: 4, estudio: 4, redaccion: 0 },
            { id: 'T4', start: '16:00:00', end: '22:00:00', label: '16:00', cupos: 4, estudio: 4, redaccion: 0 }
          ];
          console.log(`   📊 Distribución: 17 cámaras - T1(5), T2(4-Solo Estudio), T3(4), T4(4)`);
        } else if (numAvailable === 16) {
          // 16 Cámaras (Móvil): T1(6), T2(5: 1 Red), T3/T4 fusionados(5)
          distribucion = [
            { id: 'T1', start: '05:00:00', end: '11:00:00', label: '05:00', cupos: 6, estudio: 4, redaccion: 2 },
            { id: 'T2', start: '09:00:00', end: '15:00:00', label: '09:00', cupos: 5, estudio: 4, redaccion: 1 },
            { id: 'T3', start: '13:00:00', end: '22:00:00', label: '13:00', cupos: 5, estudio: 4, redaccion: 1 }
          ];
          console.log(`   📊 Distribución: 16 cámaras (Móvil) - T1(6), T2(5), T3 extendido(5)`);
        } else {
          // Menos de 16: Priorizar Estudio 1 (4 cupos) en todos los turnos, Redacción con 0
          const cuposPorTurno = Math.floor(numAvailable / 4); // Distribuir equitativamente
          const resto = numAvailable % 4;

          distribucion = [
            { id: 'T1', start: '05:00:00', end: '11:00:00', label: '05:00', cupos: Math.min(cuposPorTurno + (resto > 0 ? 1 : 0), 4), estudio: 4, redaccion: 0 },
            { id: 'T2', start: '09:00:00', end: '15:00:00', label: '09:00', cupos: Math.min(cuposPorTurno + (resto > 1 ? 1 : 0), 4), estudio: 4, redaccion: 0 },
            { id: 'T3', start: '13:00:00', end: '19:00:00', label: '13:00', cupos: Math.min(cuposPorTurno + (resto > 2 ? 1 : 0), 4), estudio: 4, redaccion: 0 },
            { id: 'T4', start: '16:00:00', end: '22:00:00', label: '16:00', cupos: Math.min(cuposPorTurno, 4), estudio: 4, redaccion: 0 }
          ].filter(t => t.cupos > 0); // Eliminar turnos sin cupos

          console.log(`   📊 Distribución: ${numAvailable} cámaras (Crítico) - Priorizando Estudio 1, Redacción en 0`);
        }

        // 🔄 ROTACIÓN SEMANAL DE GRUPOS COMPLETOS
        // Las personas rotan entre los turnos cada semana, manteniendo el orden alfabético
        const sortedPeople = availablePeople.slice().sort((a, b) => a.name.localeCompare(b.name));

        // Identificar turnos únicos desde distribucion (compactar)
        const turnosUnicos = [];
        distribucion.forEach(turno => {
          const existe = turnosUnicos.find(t => t.id === turno.id);
          if (!existe) {
            turnosUnicos.push(turno);
          }
        });

        console.log(`   🔄 Rotación semanal: weeksDiff = ${weeksDiff} (offset de turnos)`);
        console.log(`   📊 Turnos únicos detectados: ${turnosUnicos.length} (${turnosUnicos.map(t => t.id).join(', ')})`);

        // Rotar el array de turnos según weeksDiff
        const turnosRotados = turnosUnicos.map((_, index) => {
          const rotatedIndex = (index + weeksDiff) % turnosUnicos.length;
          return turnosUnicos[rotatedIndex];
        });

        console.log(`   📍 Turnos rotados: ${turnosRotados.map(t => `${t.id}(${t.cupos})`).join(' → ')}`);

        // Asignar personas a los turnos rotados manteniendo el orden alfabético
        let personIndex = 0;
        turnosRotados.forEach((turno, turnoIndex) => {
          console.log(`   Posición ${turnoIndex + 1} → Turno ${turno.id} ${turno.label} (${turno.cupos} cupos)`);

          // Asignar las siguientes N personas a este turno
          for (let i = 0; i < turno.cupos && personIndex < sortedPeople.length; i++) {
            const person = sortedPeople[personIndex];
            personIndex++;

            shifts.push({
              personnel_id: person.id,
              name: person.name,
              area: person.area,
              shift_start: turno.start,
              shift_end: turno.end,
              week_number: currentWeek,
              original_shift: turno.label,
              turno_descripcion: `${turno.id} - Estudio/Redacción`
            });

            console.log(`      ✅ ${person.name} → ${turno.id} ${turno.label}`);
          }
        });

        return; // Salir para no usar la lógica estándar
      }

      // ⚠️ CRÍTICO - NO MODIFICAR: LÓGICA ESPECIAL PARA ÁREAS CON 2 PERSONAS
      // Plantilla mínima con 2 personas que cubren apertura y cierre
      if (people.length === 2) {
        console.log(`📺 ${area}: Plantilla de 2 turnos (personal mínimo)`);

        const turnos = [
          { id: 'T1', start: '05:00:00', end: '13:00:00', label: '05:00', description: 'Apertura (Extendido)' },
          { id: 'T2', start: '13:00:00', end: '22:00:00', label: '13:00', description: 'Cierre (Extendido)' }
        ];

        const sortedPeople = people.slice().sort((a, b) => a.name.localeCompare(b.name));
        console.log(`   Semana ${currentWeek}, weeksDiff: ${weeksDiff}`);
        console.log(`   Rotación: 2 personas alternando apertura/cierre`);

        for (let personIndex = 0; personIndex < sortedPeople.length; personIndex++) {
          const person = sortedPeople[personIndex];
          const turnoIndex = (personIndex + weeksDiff) % 2;
          const turno = turnos[turnoIndex];

          shifts.push({
            personnel_id: person.id,
            name: person.name,
            area: person.area,
            shift_start: turno.start,
            shift_end: turno.end,
            week_number: currentWeek,
            original_shift: turno.label,
            turno_descripcion: `${turno.id} - ${turno.description}`
          });

          console.log(`      ✅ ${person.name} → ${turno.id} ${turno.label} (${turno.description})`);
        }

        return;
      }

      // ⚠️ CRÍTICO - NO MODIFICAR: LÓGICA ESPECIAL PARA ÁREAS CON 3 PERSONAS
      // Plantilla con 3 personas que cubren apertura, mediodía y cierre
      if (people.length === 3) {
        console.log(`📺 ${area}: Plantilla de 3 turnos con cobertura extendida`);

        const turnos = [
          { id: 'T1', start: '05:00:00', end: '11:00:00', label: '05:00', description: 'Apertura' },
          { id: 'T2', start: '11:00:00', end: '17:00:00', label: '11:00', description: 'Mediodía' },
          { id: 'T3', start: '16:00:00', end: '22:00:00', label: '16:00', description: 'Cierre' }
        ];

        const sortedPeople = people.slice().sort((a, b) => a.name.localeCompare(b.name));
        console.log(`   Semana ${currentWeek}, weeksDiff: ${weeksDiff}`);
        console.log(`   Rotación: 3 personas rotando por apertura/mediodía/cierre`);

        for (let personIndex = 0; personIndex < sortedPeople.length; personIndex++) {
          const person = sortedPeople[personIndex];
          const turnoIndex = (personIndex + weeksDiff) % 3;
          const turno = turnos[turnoIndex];

          shifts.push({
            personnel_id: person.id,
            name: person.name,
            area: person.area,
            shift_start: turno.start,
            shift_end: turno.end,
            week_number: currentWeek,
            original_shift: turno.label,
            turno_descripcion: `${turno.id} - ${turno.description}`
          });

          console.log(`      ✅ ${person.name} → ${turno.id} ${turno.label} (${turno.description})`);
        }

        return;
      }

      // ⚠️ CRÍTICO - NO MODIFICAR: LÓGICA ESPECIAL PARA ÁREAS CON 4 PERSONAS
      // Plantilla con 4 personas que garantiza relevo en Master 5
      if (people.length === 4) {
        console.log(`📺 ${area}: Plantilla de 4 turnos con relevos en Master 5`);

        const turnos = [
          { id: 'T1', start: '05:00:00', end: '11:00:00', label: '05:00', description: 'Apertura M5 solo' },
          { id: 'T2', start: '09:00:00', end: '15:00:00', label: '09:00', description: 'Reemplaza M5 a las 10:00' },
          { id: 'T3', start: '13:00:00', end: '19:00:00', label: '13:00', description: 'Reemplaza M5 a las 13:00' },
          { id: 'T4', start: '16:00:00', end: '22:00:00', label: '16:00', description: 'Cierre M5' }
        ];

        const sortedPeople = people.slice().sort((a, b) => a.name.localeCompare(b.name));
        console.log(`   Semana ${currentWeek}, weeksDiff: ${weeksDiff}`);
        console.log(`   Rotación: 4 personas con relevo Master 5 en horas de entrega`);

        for (let personIndex = 0; personIndex < sortedPeople.length; personIndex++) {
          const person = sortedPeople[personIndex];
          const turnoIndex = (personIndex + weeksDiff) % 4;
          const turno = turnos[turnoIndex];

          shifts.push({
            personnel_id: person.id,
            name: person.name,
            area: person.area,
            shift_start: turno.start,
            shift_end: turno.end,
            week_number: currentWeek,
            original_shift: turno.label,
            turno_descripcion: `${turno.id} - ${turno.description}`
          });

          console.log(`      ✅ ${person.name} → ${turno.id} ${turno.label} (${turno.description})`);
        }

        return;
      }

      // ⚠️ CRÍTICO - NO MODIFICAR: LÓGICA ESPECIAL PARA ÁREAS CON 5 PERSONAS
      // Esta lógica implementa una plantilla de 5 turnos fijos que rotan semanalmente
      // Cada persona avanza un turno cada semana (persona 0 en turno 0 semana 0, turno 1 semana 1, etc.)
      // AHORA usa people.length (personas DISPONIBLES) en vez de allPeople.length
      if (people.length === 5) {
        console.log(`📺 ${area}: Plantilla de 5 turnos con relevos automáticos`);

        // Plantilla de 5 turnos que rotan semanalmente
        const turnos = [
          { id: 'T1', start: '05:00:00', end: '09:00:00', label: '05:00', description: 'Apertura' },
          { id: 'T2', start: '09:00:00', end: '13:00:00', label: '09:00', description: 'Mañana' },
          { id: 'T3', start: '13:00:00', end: '17:00:00', label: '13:00', description: 'Tarde' },
          { id: 'T4', start: '16:00:00', end: '20:00:00', label: '16:00', description: 'Cierre' },
          { id: 'T5', start: '18:00:00', end: '22:00:00', label: '18:00', description: 'Cierre Total' }
        ];

        // Ordenar personas por nombre para mantener consistencia
        const sortedPeople = people.slice().sort((a, b) => a.name.localeCompare(b.name));

        console.log(`   Semana ${currentWeek}, weeksDiff: ${weeksDiff}`);
        console.log(`   Rotación: Cada persona avanza un turno cada semana`);

        // Asignar cada persona a su turno correspondiente según la rotación
        for (let personIndex = 0; personIndex < sortedPeople.length; personIndex++) {
          const person = sortedPeople[personIndex];
          const turnoIndex = (personIndex + weeksDiff) % 5;
          const turno = turnos[turnoIndex];

          shifts.push({
            personnel_id: person.id,
            name: person.name,
            area: person.area,
            shift_start: turno.start,
            shift_end: turno.end,
            week_number: currentWeek,
            original_shift: turno.label,
            turno_descripcion: `${turno.id} - ${turno.description}`
          });

          console.log(`      ✅ ${person.name} → ${turno.id} ${turno.label} (${turno.description})`);
        }

        return; // Salir para que no use la lógica de patrones
      }

      // ⚠️ CRÍTICO - NO MODIFICAR: LÓGICA ESPECIAL PARA ÁREAS CON 6 PERSONAS
      // Esta lógica implementa una plantilla de 6 turnos fijos que rotan semanalmente
      // Cada persona avanza un turno cada semana (similar a áreas con 5 personas)
      if (people.length === 6) {
        console.log(`📺 ${area}: Plantilla de 6 turnos con relevos automáticos`);

        // Plantilla de 6 turnos que rotan semanalmente
        const turnos = [
          { id: 'T1', start: '05:00:00', end: '09:00:00', label: '05:00', description: 'Apertura' },
          { id: 'T2', start: '09:00:00', end: '13:00:00', label: '09:00', description: 'Mañana' },
          { id: 'T3', start: '11:00:00', end: '15:00:00', label: '11:00', description: 'Refuerzo Mediodía' },
          { id: 'T4', start: '13:00:00', end: '17:00:00', label: '13:00', description: 'Tarde' },
          { id: 'T5', start: '15:00:00', end: '19:00:00', label: '15:00', description: 'Cierre Másters' },
          { id: 'T6', start: '18:00:00', end: '22:00:00', label: '18:00', description: 'Cierre Total' }
        ];

        // Ordenar personas por nombre para mantener consistencia
        const sortedPeople = people.slice().sort((a, b) => a.name.localeCompare(b.name));

        console.log(`   Semana ${currentWeek}, weeksDiff: ${weeksDiff}`);
        console.log(`   Rotación: Cada persona avanza un turno cada semana`);

        // Asignar cada persona a su turno correspondiente según la rotación
        for (let personIndex = 0; personIndex < sortedPeople.length; personIndex++) {
          const person = sortedPeople[personIndex];
          const turnoIndex = (personIndex + weeksDiff) % 6;
          const turno = turnos[turnoIndex];

          shifts.push({
            personnel_id: person.id,
            name: person.name,
            area: person.area,
            shift_start: turno.start,
            shift_end: turno.end,
            week_number: currentWeek,
            original_shift: turno.label,
            turno_descripcion: `${turno.id} - ${turno.description}`
          });

          console.log(`      ✅ ${person.name} → ${turno.id} ${turno.label} (${turno.description})`);
        }

        return; // Salir para que no use la lógica de patrones
      }

      // 🎬 CRÍTICO - LÓGICA ESPECIAL PARA REPORTERÍA CON SISTEMA DE DUPLAS
      // Sistema de duplas de relevo: Un camarógrafo del T1 (06:00-13:00) tiene un relevo
      // anclado en el T2 (13:00-20:00) por compatibilidad de equipo
      if (area === 'CAMARÓGRAFOS DE REPORTERÍA') {
        console.log(`📹 ${area}: Sistema de duplas con relevo T1 → T2`);

        // 📋 DUPLAS DE CÁMARAS PORTÁTILES - 12 DUPLAS = 24 PERSONAS
        // Cada dupla tiene: T1 (06:00-13:00) ↔ T2 (13:00-20:00)
        // Colores de la tabla: Verde=Propias destacadas, Azul=RTVC, Amarillo=Propias X3/SONY
        const DUPLAS_REPORTERIA = [
          // Dupla 1 (Verde): Cámaras Propias
          { t1: 'Erick Velásquez', t2: 'Cesar Morales', equipo: 'Cámara RTVC', tipo: 'propias' },
          // Duplas 2-5 (Azul): Cámaras RTVC
          { t1: 'William Ruiz', t2: 'Álvaro Díaz', equipo: 'Cámara RTVC', tipo: 'rtvc' },
          { t1: 'Carlos Wilches', t2: 'Victor Vargas', equipo: 'Cámara RTVC', tipo: 'rtvc' },
          { t1: 'Enrique Muñoz', t2: 'Edgar Castillo', equipo: 'Cámara RTVC', tipo: 'rtvc' },
          { t1: 'John Ruiz B', t2: 'Ramiro Balaguera', equipo: 'Cámara RTVC', tipo: 'rtvc' },
          // Dupla 6 (Amarillo): X3 - Leonel Cifuentes (T1) no está en base de datos
          { t1: 'Floresmiro Luna', t2: 'Leonel Cifuentes', equipo: 'X3', tipo: 'propias' },
          // Dupla 7 (Verde/Amarillo): SONY 300
          { t1: 'Edgar Nieto', t2: 'Didier Buitrago', equipo: 'SONY 300', tipo: 'propias' },
          // Dupla 8 (Amarillo): X3
          { t1: 'Julián Luna', t2: 'Andrés Ramírez', equipo: 'X3', tipo: 'propias' },
          // Dupla 9 (Amarillo): SONY 300
          { t1: 'William Uribe', t2: 'Marco Solórzano', equipo: 'SONY 300', tipo: 'propias' }
        ];

        console.log(`   📋 Total duplas definidas: ${DUPLAS_REPORTERIA.length} (${DUPLAS_REPORTERIA.length * 2} personas)`);

        // Crear mapa de personas por nombre para acceso rápido
        const personnelByName = {};
        people.forEach(person => {
          personnelByName[person.name] = person;
        });

        // Función para verificar si una persona tiene novedad bloqueante
        const hasBlockingNovelty = (person) => {
          if (!person) return false;
          const novelty = noveltiesMap[person.id];
          if (!novelty) return false;
          const blockingTypes = ['VIAJE', 'VIAJE MÓVIL', 'LIBRE', 'SIN_CONTRATO', 'INCAPACIDAD'];
          return blockingTypes.includes(novelty.type);
        };

        // Asignar TODAS las duplas (disponibles o no)
        let duplasCompletas = 0;
        let duplasIncompletas = 0;

        DUPLAS_REPORTERIA.forEach((dupla, index) => {
          const t1Person = personnelByName[dupla.t1];
          const t2Person = personnelByName[dupla.t2];

          const t1Available = t1Person && !hasBlockingNovelty(t1Person);
          const t2Available = t2Person && !hasBlockingNovelty(t2Person);

          // SIEMPRE asignar T1 si la persona existe en la base de datos
          if (t1Person) {
            shifts.push({
              personnel_id: t1Person.id,
              name: t1Person.name,
              area: t1Person.area,
              shift_start: '06:00:00',
              shift_end: '13:00:00',
              week_number: currentWeek,
              original_shift: 'T1',
              dupla_equipo: dupla.equipo,
              dupla_relevo: dupla.t2,
              has_novelty: !t1Available
            });
          }

          // SIEMPRE asignar T2 si la persona existe en la base de datos
          if (t2Person) {
            shifts.push({
              personnel_id: t2Person.id,
              name: t2Person.name,
              area: t2Person.area,
              shift_start: '13:00:00',
              shift_end: '20:00:00',
              week_number: currentWeek,
              original_shift: 'T2',
              dupla_equipo: dupla.equipo,
              dupla_relevo: dupla.t1,
              has_novelty: !t2Available
            });
          }

          // Logging según estado de la dupla
          if (t1Available && t2Available) {
            console.log(`   ✅ Dupla ${index + 1} (${dupla.equipo}): ${dupla.t1} (T1) ↔ ${dupla.t2} (T2)`);
            duplasCompletas++;
          } else if (t1Available && !t2Available) {
            console.log(`   ⚠️ Dupla ${index + 1} (${dupla.equipo}): ${dupla.t1} (T1) ✓ | ${dupla.t2} (T2) ✗ NOVEDAD`);
            duplasIncompletas++;
          } else if (!t1Available && t2Available) {
            console.log(`   ⚠️ Dupla ${index + 1} (${dupla.equipo}): ${dupla.t1} (T1) ✗ NOVEDAD | ${dupla.t2} (T2) ✓`);
            duplasIncompletas++;
          } else {
            console.log(`   ❌ Dupla ${index + 1} (${dupla.equipo}): ${dupla.t1} (T1) ✗ | ${dupla.t2} (T2) ✗ AMBOS CON NOVEDAD`);
            duplasIncompletas++;
          }
        });

        console.log(`   📊 Duplas completas: ${duplasCompletas}/${DUPLAS_REPORTERIA.length}`);
        console.log(`   📊 Duplas con novedades: ${duplasIncompletas}/${DUPLAS_REPORTERIA.length}`);
        return; // Salir para no usar la lógica estándar
      }

      // 🎬 LÓGICA PARA ASISTENTES DE REPORTERÍA (mantener sistema de grupos)
      if (area === 'ASISTENTES DE REPORTERÍA') {
        console.log(`📹 ${area}: Usando sistema de grupos fijos con rotación semanal`);

        // Determinar si debemos alternar los grupos esta semana
        const debeRotar = weeksDiff % 2 === 1;
        console.log(`   📅 Semana ${currentWeek}, weeksDiff: ${weeksDiff}, Rotar: ${debeRotar ? 'SÍ' : 'NO'}`);

        people.forEach(person => {
          const grupoOriginal = person.grupo_reporteria;
          let turnoActual;

          if (debeRotar) {
            turnoActual = grupoOriginal === 'GRUPO_A' ? 'PM' : 'AM';
          } else {
            turnoActual = grupoOriginal === 'GRUPO_A' ? 'AM' : 'PM';
          }

          if (turnoActual === 'AM') {
            shifts.push({
              personnel_id: person.id,
              name: person.name,
              area: person.area,
              shift_start: '06:00:00',
              shift_end: '13:00:00',
              week_number: currentWeek,
              original_shift: grupoOriginal,
              grupo_reporteria: grupoOriginal,
              turno_rotado: turnoActual
            });
          } else {
            shifts.push({
              personnel_id: person.id,
              name: person.name,
              area: person.area,
              shift_start: '13:00:00',
              shift_end: '20:00:00',
              week_number: currentWeek,
              original_shift: grupoOriginal,
              grupo_reporteria: grupoOriginal,
              turno_rotado: turnoActual
            });
          }
        });

        return; // Salir para que no use la lógica de patrones
      }

      // 🔄 LÓGICA NORMAL PARA TODAS LAS ÁREAS (incluyendo CONTRIBUCIONES)
      // Si hay menos personas que patrones, necesitamos redistribuir equitativamente
      if (people.length < patterns.length) {
        console.log(`⚠️ ${area}: Solo ${people.length} personas disponibles para ${patterns.length} turnos - redistribuyendo equitativamente`);

        // Asignar cada persona a múltiples turnos de manera equitativa
        patterns.forEach((pattern, patternIndex) => {
          // Calcular qué persona debe cubrir este turno usando rotación
          const personIndex = (patternIndex + weeksDiff) % people.length;
          const person = people[personIndex];

          shifts.push({
            personnel_id: person.id,
            name: person.name,
            area: person.area,
            shift_start: pattern.shift_start,
            shift_end: pattern.shift_end,
            week_number: currentWeek,
            original_shift: null,
            is_covering: true // Indicador de que está cubriendo por falta de personal
          });
        });
      } else {
        // Lógica normal: hay suficiente personal
        people.forEach((person, personIndex) => {
          // Distribuir las personas entre los turnos disponibles
          // Cada persona tiene un índice base (personIndex) que se rota cada semana
          const baseShiftIndex = personIndex % patterns.length;

          // Rotar el turno cada semana
          const rotatedShiftIndex = (baseShiftIndex + weeksDiff) % patterns.length;
          const pattern = patterns[rotatedShiftIndex];

          if (pattern) {
            shifts.push({
              personnel_id: person.id,
              name: person.name,
              area: person.area,
              shift_start: pattern.shift_start,
              shift_end: pattern.shift_end,
              week_number: currentWeek,
              original_shift: null
            });
          }
        });
      }
    });
    
    res.json(shifts);
  } catch (error) {
    console.error('Error getting auto shifts:', error);
    res.status(500).json({ error: 'Error al obtener turnos automáticos' });
  }
});

// ⭐⭐⭐ NUEVO ENDPOINT: Obtener calendario completo con asignaciones y novedades ⭐⭐⭐
router.get('/calendar', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Se requieren start_date y end_date' });
    }

    console.log(`📅 Obteniendo calendario desde ${start_date} hasta ${end_date}`);

    // 1. Obtener horarios (schedules)
    let assignments = [];
    try {
      const schedulesResult = await pool.query(
        `SELECT s.*, p.name as personnel_name, p.area, p.role
         FROM schedules s
         LEFT JOIN personnel p ON s.personnel_id = p.id
         WHERE s.date >= $1 AND s.date <= $2
         ORDER BY s.date, p.name`,
        [start_date, end_date]
      );
      assignments = schedulesResult.rows;
      console.log(`✅ Encontrados ${assignments.length} horarios para el período solicitado`);
    } catch (err) {
      console.log('ℹ️  Error obteniendo schedules:', err.message);
    }

    // 2. ⭐ Obtener novedades (ESTO ES LO IMPORTANTE)
    // Buscar novedades que tengan un rango de fechas que se solape con el período solicitado
    const noveltiesResult = await pool.query(
      `SELECT
         n.id,
         n.personnel_id,
         n.date,
         n.start_date,
         n.end_date,
         n.type,
         n.description,
         n.created_at,
         p.name as personnel_name,
         p.area as personnel_area,
         p.role as personnel_role
       FROM novelties n
       LEFT JOIN personnel p ON n.personnel_id = p.id
       WHERE (
         (n.start_date IS NOT NULL AND n.start_date <= $2 AND n.end_date >= $1)
         OR
         (n.start_date IS NULL AND n.date >= $1 AND n.date <= $2)
       )
       ORDER BY n.start_date, n.date, p.name`,
      [start_date, end_date]
    );

    const novelties = noveltiesResult.rows;

    console.log(`✅ Encontradas ${novelties.length} novedades para el período solicitado`);

    // 3. Organizar los datos por fecha
    const calendar = {};

    // Procesar asignaciones
    assignments.forEach(assignment => {
      const dateStr = assignment.date.toISOString().split('T')[0];
      if (!calendar[dateStr]) {
        calendar[dateStr] = { assignments: [], novelties: [] };
      }
      calendar[dateStr].assignments.push(assignment);
    });

    // Procesar novedades - expandir rangos de fechas a días individuales
    novelties.forEach(novelty => {
      // Si tiene start_date y end_date, expandir a todos los días del rango
      if (novelty.start_date && novelty.end_date) {
        // Convertir las fechas a formato YYYY-MM-DD directamente desde la base de datos
        const startDateStr = novelty.start_date.toISOString().split('T')[0];
        const endDateStr = novelty.end_date.toISOString().split('T')[0];

        // Crear fechas con hora del mediodía para evitar problemas de zona horaria
        const startDate = new Date(startDateStr + 'T12:00:00');
        const endDate = new Date(endDateStr + 'T12:00:00');

        // Iterar sobre cada día en el rango
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          if (!calendar[dateStr]) {
            calendar[dateStr] = { assignments: [], novelties: [] };
          }
          calendar[dateStr].novelties.push({
            id: novelty.id,
            personnel_id: novelty.personnel_id,
            personnel_name: novelty.personnel_name || 'Personal no encontrado',
            personnel_area: novelty.personnel_area,
            personnel_role: novelty.personnel_role,
            type: novelty.type,
            description: novelty.description,
            start_date: novelty.start_date,
            end_date: novelty.end_date,
            created_at: novelty.created_at
          });
          // Avanzar al siguiente día
          currentDate.setDate(currentDate.getDate() + 1);
        }
      } else if (novelty.date) {
        // Formato antiguo: solo date
        const dateStr = novelty.date.toISOString().split('T')[0];
        if (!calendar[dateStr]) {
          calendar[dateStr] = { assignments: [], novelties: [] };
        }
        calendar[dateStr].novelties.push({
          id: novelty.id,
          personnel_id: novelty.personnel_id,
          personnel_name: novelty.personnel_name || 'Personal no encontrado',
          personnel_area: novelty.personnel_area,
          personnel_role: novelty.personnel_role,
          type: novelty.type,
          description: novelty.description,
          created_at: novelty.created_at
        });
      }
    });

    // Log de resumen
    const datesWithNovelties = Object.keys(calendar).filter(date => calendar[date].novelties.length > 0);
    if (datesWithNovelties.length > 0) {
      console.log(`📋 Fechas con novedades: ${datesWithNovelties.join(', ')}`);
    }

    res.json(calendar);

  } catch (error) {
    console.error('❌ Error obteniendo calendario:', error);
    res.status(500).json({ 
      error: 'Error al obtener calendario',
      details: error.message 
    });
  }
});

// ⭐ GUARDAR PROGRAMACIÓN DIARIA (Grid completo)
router.post('/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const { assignments, callTimes, manualCallTimes, manualAssignments, programs, shifts } = req.body;

    console.log(`💾 Guardando programación para ${date}`);
    console.log(`   📋 Programas: ${programs?.length || 0}`);
    console.log(`   ✅ Asignaciones: ${Object.keys(assignments || {}).length}`);
    console.log(`   ⏰ CallTimes: ${Object.keys(callTimes || {}).length}`);
    console.log(`   🔒 CallTimes manuales: ${Object.keys(manualCallTimes || {}).length}`);
    console.log(`   🔒 Asignaciones manuales: ${Object.keys(manualAssignments || {}).length}`);
    console.log(`   🔧 Turnos: ${shifts?.length || 0}`);

    // Guardar en daily_schedules usando UPSERT (sin filtrar - respeta cambios manuales del usuario)
    await pool.query(
      `INSERT INTO daily_schedules (date, assignments_data, programs_data, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (date)
       DO UPDATE SET
         assignments_data = $2,
         programs_data = $3,
         updated_at = CURRENT_TIMESTAMP`,
      [date, JSON.stringify(assignments), JSON.stringify({ programs, shifts, callTimes, manualCallTimes, manualAssignments })]
    );

    console.log(`✅ Programación guardada exitosamente para ${date}`);

    // 🔄 ESPEJO SEMANAL COMPLETO (TODAS LAS ASIGNACIONES)
    // ⚠️ IMPORTANTE: Solo se ejecuta si es lunes Y los días martes-viernes NO EXISTEN
    // Si ya existen, NO se sobrescriben (respeta modificaciones manuales)
    const fechaObj = new Date(date + 'T12:00:00');
    const diaSemana = fechaObj.getDay(); // 0=domingo, 1=lunes, ..., 5=viernes

    // Si es lunes (1), copiar TODAS las asignaciones a martes-viernes QUE NO EXISTAN
    if (diaSemana === 1) {
      console.log(`📅 Es lunes - Verificando si necesita espejo semanal...`);

      // Copiar a martes (2), miércoles (3), jueves (4), viernes (5)
      for (let dia = 2; dia <= 5; dia++) {
        const targetDate = new Date(fechaObj);
        targetDate.setDate(targetDate.getDate() + (dia - 1));
        const targetDateStr = targetDate.toISOString().split('T')[0];

        // 🔒 VERIFICAR SI YA EXISTE - NO sobrescribir si ya existe
        const existingResult = await pool.query(
          'SELECT date FROM daily_schedules WHERE date = $1',
          [targetDateStr]
        );

        if (existingResult.rows.length > 0) {
          console.log(`   ⏭️  ${targetDateStr} ya existe - NO se sobrescribe (respeta modificaciones manuales)`);
          continue; // Saltar este día
        }

        console.log(`   📋 ${targetDateStr} NO existe - Copiando del lunes...`);

        // 🔥 COPIAR TODAS LAS ASIGNACIONES
        const allAssignments = { ...assignments };

        // Guardar SOLO si NO existe (INSERT sin conflicto)
        await pool.query(
          `INSERT INTO daily_schedules (date, assignments_data, programs_data, updated_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
          [targetDateStr, JSON.stringify(allAssignments), JSON.stringify({ programs, shifts, callTimes })]
        );

        console.log(`   ✅ Creado ${targetDateStr}: ${Object.keys(allAssignments).length} asignaciones`);
      }
    }

    res.json({
      success: true,
      message: `Programación del ${date} guardada exitosamente`,
      date,
      assignmentsCount: Object.keys(assignments || {}).length
    });

  } catch (error) {
    console.error('❌ Error guardando programación diaria:', error);
    res.status(500).json({
      error: 'Error al guardar programación diaria',
      details: error.message
    });
  }
});

// ⭐ OBTENER PROGRAMACIÓN DIARIA (Grid completo)
router.get('/daily/:date', async (req, res) => {
  try {
    const { date } = req.params;

    console.log(`📂 Obteniendo programación para ${date}`);

    // Consultar programación diaria guardada
    const result = await pool.query(
      'SELECT * FROM daily_schedules WHERE date = $1',
      [date]
    );

    // Consultar llamados de reportería de la tabla schedules
    const reporteriaResult = await pool.query(
      `SELECT id, program, shift_time, location, notes
       FROM schedules
       WHERE date = $1
       AND program LIKE '%Reportería%'
       ORDER BY shift_time`,
      [date]
    );

    console.log(`📋 Encontrados ${reporteriaResult.rows.length} llamados de reportería para ${date}`);

    // Función para convertir hora AM/PM a formato 24h
    const convertTo24Hour = (time12h) => {
      const [time, period] = time12h.trim().split(' ');
      let [hours, minutes] = time.split(':');
      hours = parseInt(hours);

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }

      return `${String(hours).padStart(2, '0')}:${minutes}`;
    };

    if (result.rows.length === 0) {
      console.log(`📄 No hay programación guardada para ${date}`);

      // 📅 HERENCIA SEMANAL DE REPORTERÍA: Buscar el LUNES de esta semana
      const fechaObj = new Date(date + 'T12:00:00');
      const diaSemana = fechaObj.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado

      // Calcular el lunes de esta semana
      const diasHastaLunes = diaSemana === 0 ? -6 : 1 - diaSemana; // Si es domingo, retroceder 6 días
      const lunesDate = new Date(fechaObj);
      lunesDate.setDate(lunesDate.getDate() + diasHastaLunes);
      const lunesStr = lunesDate.toISOString().split('T')[0];

      console.log(`   📋 Buscando programación del LUNES ${lunesStr} para heredar reportería...`);

      const lunesResult = await pool.query(
        'SELECT * FROM daily_schedules WHERE date = $1',
        [lunesStr]
      );

      let assignmentsFromMonday = {};

      if (lunesResult.rows.length > 0) {
        const lunesAssignments = lunesResult.rows[0].assignments_data || {};

        // Obtener personal de reportería
        const reporteriaPersonnel = await pool.query(`
          SELECT id FROM personnel
          WHERE area IN ('CAMARÓGRAFOS DE REPORTERÍA', 'ASISTENTES DE REPORTERÍA')
            AND active = true
        `);

        const reporteriaIds = reporteriaPersonnel.rows.map(p => p.id.toString());

        // Copiar solo asignaciones de reportería del LUNES
        Object.keys(lunesAssignments).forEach(key => {
          const personnelId = key.split('_')[0];
          if (reporteriaIds.includes(personnelId)) {
            assignmentsFromMonday[key] = lunesAssignments[key];
          }
        });

        console.log(`   ✅ Heredadas ${Object.keys(assignmentsFromMonday).length} asignaciones de reportería del lunes ${lunesStr}`);
      }

      // Si hay llamados de reportería, incluirlos como programs
      const reporteriaPrograms = reporteriaResult.rows.map(call => {
        const startTime = call.shift_time.split(' - ')[0];
        const time24h = convertTo24Hour(startTime);

        return {
          id: `reporteria_${call.id}`,
          name: call.program,
          defaultTime: time24h,
          time: call.shift_time,
          color: call.program.includes('Camarógrafos') ? '#9C27B0' : '#3F51B5',
          location: call.location,
          notes: call.notes,
          isReporteria: true
        };
      });

      return res.json({
        found: false,
        date,
        assignments: assignmentsFromMonday,
        programs: reporteriaPrograms,
        shifts: [],
        reporteriaCalls: reporteriaResult.rows,
        inheritedFromMonday: lunesStr
      });
    }

    const schedule = result.rows[0];
    const programsData = schedule.programs_data || {};

    // Agregar llamados de reportería a los programas existentes
    const reporteriaPrograms = reporteriaResult.rows.map(call => {
      const startTime = call.shift_time.split(' - ')[0];
      const time24h = convertTo24Hour(startTime);

      return {
        id: `reporteria_${call.id}`,
        name: call.program,
        defaultTime: time24h,
        time: call.shift_time,
        color: call.program.includes('Camarógrafos') ? '#9C27B0' : '#3F51B5',
        location: call.location,
        notes: call.notes,
        isReporteria: true
      };
    });

    const allPrograms = [...(programsData.programs || []), ...reporteriaPrograms];

    // 🔧 USAR ASIGNACIONES GUARDADAS DIRECTAMENTE (sin herencia automática)
    // La herencia se aplica solo al crear/generar un nuevo día, no al cargar
    const finalAssignments = { ...(schedule.assignments_data || {}) };

    // 🔧 USAR DIRECTAMENTE LOS CALLTIMES GUARDADOS (sin corrección automática)
    const callTimes = { ...(programsData.callTimes || {}) };
    const manualCallTimes = { ...(programsData.manualCallTimes || {}) }; // 🚨 PILAR 1: Cargar marcadores de manuales
    const manualAssignments = { ...(programsData.manualAssignments || {}) }; // 🚨 PILAR 3: Cargar marcadores de asignaciones manuales

    console.log('✅ Usando callTimes guardados de la base de datos (sin corrección automática)');
    console.log(`🔒 CallTimes manuales: ${Object.keys(manualCallTimes).length}`);
    console.log(`🔒 Asignaciones manuales: ${Object.keys(manualAssignments).length}`);

    // 🎥 Calcular callTimes para CAMARÓGRAFOS DE ESTUDIO en FIN DE SEMANA
    const selectedDate = new Date(date + 'T12:00:00');
    const dayOfWeekNum = selectedDate.getDay();

    if (dayOfWeekNum === 0 || dayOfWeekNum === 6) {
      console.log('🎥 Calculando callTimes de CAMARÓGRAFOS DE ESTUDIO (fin de semana)...');

      // Calcular weekendCount
      const baseDate = new Date('2025-12-13T12:00:00');
      const daysDiff = Math.floor((selectedDate - baseDate) / (1000 * 60 * 60 * 24));
      const weekendCount = Math.floor(daysDiff / 7);

      // Obtener personal de camarógrafos de estudio
      const camarasPersonnel = await pool.query(`
        SELECT id, name
        FROM personnel
        WHERE area = 'CAMARÓGRAFOS DE ESTUDIO'
          AND active = true
        ORDER BY name
      `);

      // Obtener shifts generados para este fin de semana
      const shiftsData = programsData.shifts || [];
      const camarasShifts = shiftsData.filter(s => s.area === 'CAMARÓGRAFOS DE ESTUDIO');

      if (camarasShifts.length > 0) {
        camarasShifts.forEach(shift => {
          const personId = shift.personnel_id.toString();

          // 🚨 PILAR 1: SOLO calcular si NO es manual
          if (manualCallTimes[personId]) {
            console.log(`   🔒 ${shift.name}: ${callTimes[personId]} (MANUAL - protegido)`);
            return; // No tocar callTimes manuales
          }

          const callTime = shift.shift_start.substring(0, 5); // "08:00:00" → "08:00"
          callTimes[personId] = callTime;
          console.log(`   ✅ ${shift.name}: ${callTime} (${shift.original_shift})`);
        });
      } else {
        console.log(`   ⚠️ No se encontraron shifts de camarógrafos de estudio para este fin de semana`);
      }

      // ⚠️⚠️⚠️ CRÍTICO - NO MODIFICAR ESTA SECCIÓN ⚠️⚠️⚠️
      // 🔧 Calcular callTimes para CONTRIBUCIONES en FIN DE SEMANA
      //
      // Esta lógica calcula los callTimes (horarios de llegada) para CONTRIBUCIONES
      // en fines de semana siguiendo la rotación de 3 semanas.
      //
      // IMPORTANTE: Esta lógica está sincronizada con la generación de turnos
      // en /api/schedule/auto-shifts/:date (líneas 315-398). Ambos endpoints
      // DEBEN usar la misma fecha base (WEEKEND_ROTATION_BASE_DATE) y el mismo
      // patrón de rotación o el sistema se romperá.
      //
      // PATRÓN DE ROTACIÓN (basado en weekendCount % 3):
      // - rotationWeek = 0: Adrian 08:00, Carolina 14:00, Michael descansa
      // - rotationWeek = 1: Michael 08:00, Adrian 14:00, Carolina descansa
      // - rotationWeek = 2: Carolina 08:00, Michael 14:00, Adrian descansa
      //
      // La persona que descansa NO recibe callTime y NO aparece en el schedule.
      // ⚠️⚠️⚠️ FIN DE SECCIÓN CRÍTICA ⚠️⚠️⚠️

      console.log('🔧 Calculando callTimes de CONTRIBUCIONES (fin de semana)...');

      // Obtener personal de CONTRIBUCIONES
      const contribucionesPersonnel = await pool.query(`
        SELECT id, name
        FROM personnel
        WHERE area = 'CONTRIBUCIONES'
          AND active = true
        ORDER BY name
      `);

      // PRIMERO: ELIMINAR SOLO callTimes automáticos de CONTRIBUCIONES
      // NO tocar callTimes manuales (ley suprema)
      contribucionesPersonnel.rows.forEach(p => {
        const personId = p.id.toString();

        // 🚨 PILAR 1: NO eliminar callTimes manuales
        if (manualCallTimes[personId]) {
          console.log(`   🔒 ${p.name} tiene callTime MANUAL (${callTimes[personId]}) - protegido`);
          return; // No tocar
        }

        if (callTimes[personId]) {
          delete callTimes[personId];
          console.log(`   🗑️ Eliminado callTime automático previo de ${p.name}`);
        }
      });

      // Crear mapa de nombres a IDs
      const contribMap = {};
      contribucionesPersonnel.rows.forEach(p => {
        contribMap[p.name] = p.id.toString();
      });

      // ⚠️ CRÍTICO: Usar WEEKEND_ROTATION_BASE_DATE para mantener sincronización
      validateWeekendBaseDate(WEEKEND_ROTATION_BASE_DATE);
      const contribBaseDate = new Date(WEEKEND_ROTATION_BASE_DATE);
      const contribWeekendCount = calculateWeekendCount(selectedDate);
      const rotationWeek = contribWeekendCount % 3;

      console.log(`   📅 Fecha: ${date}, weekendCount: ${contribWeekendCount}, rotationWeek: ${rotationWeek}`);

      let t1Name, t1CallTime, t2Name, t2CallTime, descansaName;

      if (rotationWeek === 0) {
        // Fin de semana 1: Adrian T1 (08:00), Carolina T2 (14:00), Michael descansa
        t1Name = 'Adrian Contreras';
        t1CallTime = '08:00';
        t2Name = 'Carolina Benavides';
        t2CallTime = '14:00';
        descansaName = 'Michael Torres';
        console.log(`   Patrón semana ${rotationWeek}: Adrian (08:00) + Carolina (14:00), Michael descansa`);
      } else if (rotationWeek === 1) {
        // Fin de semana 2: Michael T1 (08:00), Adrian T2 (14:00), Carolina descansa
        t1Name = 'Michael Torres';
        t1CallTime = '08:00';
        t2Name = 'Adrian Contreras';
        t2CallTime = '14:00';
        descansaName = 'Carolina Benavides';
        console.log(`   Patrón semana ${rotationWeek}: Michael (08:00) + Adrian (14:00), Carolina descansa`);
      } else {
        // Fin de semana 3: Carolina T1 (08:00), Michael T2 (14:00), Adrian descansa
        t1Name = 'Carolina Benavides';
        t1CallTime = '08:00';
        t2Name = 'Michael Torres';
        t2CallTime = '14:00';
        descansaName = 'Adrian Contreras';
        console.log(`   Patrón semana ${rotationWeek}: Carolina (08:00) + Michael (14:00), Adrian descansa`);
      }

      // Asignar callTimes SOLO a los 2 que trabajan (si no son manuales)
      if (contribMap[t1Name]) {
        const personId = contribMap[t1Name];

        // 🚨 PILAR 1: NO sobrescribir callTimes manuales
        if (manualCallTimes[personId]) {
          console.log(`   🔒 CONTRIBUCIONES: ${t1Name} tiene callTime MANUAL (${callTimes[personId]}) - protegido`);
        } else {
          callTimes[personId] = t1CallTime;
          console.log(`   ✅ CONTRIBUCIONES: ${t1Name} → ${t1CallTime}`);
        }
      }
      if (contribMap[t2Name]) {
        const personId = contribMap[t2Name];

        // 🚨 PILAR 1: NO sobrescribir callTimes manuales
        if (manualCallTimes[personId]) {
          console.log(`   🔒 CONTRIBUCIONES: ${t2Name} tiene callTime MANUAL (${callTimes[personId]}) - protegido`);
        } else {
          callTimes[personId] = t2CallTime;
          console.log(`   ✅ CONTRIBUCIONES: ${t2Name} → ${t2CallTime}`);
        }
      }
      console.log(`   💤 CONTRIBUCIONES: ${descansaName} → DESCANSA (sin callTime)`);
    }

    // 🔧 NO SOBRESCRIBIR callTimes con shifts
    // Los callTimes guardados en programsData.callTimes son la verdad absoluta
    // Los shifts solo se usan para GENERAR callTimes al crear un día nuevo
    // NO deben sobrescribir callTimes ya guardados con cambios manuales
    console.log('✅ NO sobrescribiendo callTimes con shifts - usando callTimes guardados directamente');

    // 🔧 NO GENERAR ASIGNACIONES AUTOMÁTICAS EN EL BACKEND
    // El frontend ya lo hace correctamente con la lógica de solapamiento inteligente
    // Solo devolver las asignaciones guardadas tal cual
    const mergedAssignments = finalAssignments;

    console.log(`✅ Programación encontrada para ${date}`);
    console.log(`   📊 Asignaciones: ${Object.keys(mergedAssignments).length}`);
    console.log(`   ⏰ CallTimes: ${Object.keys(callTimes).length}`);
    console.log(`   📺 Programas: ${allPrograms.length} (${reporteriaPrograms.length} de reportería)`);
    console.log(`   🕐 Guardado en: ${schedule.updated_at}`);

    res.json({
      found: true,
      date,
      assignments: mergedAssignments,
      callTimes: callTimes,
      manualCallTimes: manualCallTimes, // 🚨 PILAR 1: Devolver marcadores de manuales
      manualAssignments: manualAssignments, // 🚨 PILAR 3: Devolver marcadores de asignaciones manuales
      programs: allPrograms,
      savedAt: schedule.updated_at,
      reporteriaCalls: reporteriaResult.rows
    });

  } catch (error) {
    console.error('❌ Error obteniendo programación diaria:', error);
    res.status(500).json({
      error: 'Error al obtener programación diaria',
      details: error.message
    });
  }
});

// DELETE - Eliminar un programa de todos los daily_schedules
router.delete('/remove-program/:programId', async (req, res) => {
  try {
    const { programId } = req.params;
    const programIdNum = parseInt(programId);

    console.log(`🗑️ Eliminando programa ID ${programIdNum} de todos los schedules...`);

    // Obtener todos los daily_schedules
    const result = await pool.query('SELECT date, programs_data FROM daily_schedules');

    let schedulesUpdated = 0;
    let programsRemoved = 0;

    for (const row of result.rows) {
      const programsData = row.programs_data || {};
      const programs = programsData.programs || [];

      // Filtrar el programa eliminado
      const filteredPrograms = programs.filter(p => p.id !== programIdNum);

      // Si se eliminó algún programa, actualizar
      if (filteredPrograms.length < programs.length) {
        programsRemoved += (programs.length - filteredPrograms.length);

        // Actualizar programs_data
        const updatedProgramsData = {
          ...programsData,
          programs: filteredPrograms
        };

        await pool.query(
          'UPDATE daily_schedules SET programs_data = $1, updated_at = CURRENT_TIMESTAMP WHERE date = $2',
          [JSON.stringify(updatedProgramsData), row.date]
        );

        schedulesUpdated++;
      }
    }

    console.log(`✅ Programa ${programIdNum} eliminado de ${schedulesUpdated} schedules (${programsRemoved} instancias)`);

    res.json({
      success: true,
      message: `Programa eliminado de ${schedulesUpdated} programaciones`,
      schedulesUpdated,
      programsRemoved
    });

  } catch (error) {
    console.error('❌ Error eliminando programa de schedules:', error);
    res.status(500).json({
      error: 'Error al eliminar programa de schedules',
      details: error.message
    });
  }
});

// POST - Regenerar SOLO turnos preservando programas y asignaciones
router.post('/regenerar-turnos', async (req, res) => {
  try {
    const { mes, anio } = req.body;

    if (!mes || !anio) {
      return res.status(400).json({
        error: 'Mes y año son requeridos',
        ejemplo: { mes: 1, anio: 2026 }
      });
    }

    // Calcular primer y último día del mes
    const primerDia = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(anio, mes, 0).getDate();
    const ultimoDiaStr = `${anio}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

    console.log(`🔄 Regenerando SOLO turnos (preservando programas) para ${primerDia} a ${ultimoDiaStr}...`);

    let diasActualizados = 0;

    // Procesar cada día del mes
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const fecha = `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

      // Verificar si existe registro para este día
      const existingResult = await pool.query(
        'SELECT date, assignments_data, programs_data FROM daily_schedules WHERE date = $1',
        [fecha]
      );

      if (existingResult.rows.length > 0) {
        // YA EXISTE - HARD DELETE de asignaciones automáticas
        const existingData = existingResult.rows[0];
        const existingAssignments = existingData.assignments_data || {};
        const existingPrograms = existingData.programs_data || {};

        console.log(`   🔄 ${fecha}: Regenerando turnos (${Object.keys(existingPrograms.programs || []).length} programas preservados)...`);

        // 🔥 HARD DELETE: Borrar TODAS las asignaciones automáticas de la BD
        // Solo preservaremos las manuales en memoria
        console.log(`   🔥 [HARD DELETE] Borrando assignments_data del día ${fecha} de la base de datos...`);
        await pool.query(
          `UPDATE daily_schedules
           SET assignments_data = '{}'::jsonb
           WHERE date = $1`,
          [fecha]
        );
        console.log(`   ✅ [HARD DELETE] Base de datos limpiada para ${fecha}`);

        // Generar nuevos turnos llamando internamente al endpoint auto-shifts
        // Simular la llamada HTTP usando el mismo código
        const selectedDate = new Date(fecha + 'T12:00:00');
        const dayOfWeek = selectedDate.getDay();

        let newShifts = [];

        // Llamar a la lógica de auto-shifts (reutilizando el código existente)
        try {
          // Hacer una llamada interna al endpoint
          const http = require('http');
          const shiftsData = await new Promise((resolve, reject) => {
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
          newShifts = shiftsData || [];
        } catch (error) {
          console.warn(`   ⚠️ No se pudieron generar turnos automáticos para ${fecha}: ${error.message}`);
          continue;
        }

        // Generar callTimes desde los nuevos turnos
        const newCallTimes = {};
        newShifts.forEach(shift => {
          newCallTimes[shift.personnel_id] = shift.shift_start.substring(0, 5);
        });

        // 🚨 PILAR 1: PRESERVAR callTimes MANUALES (ley suprema)
        // Los callTimes marcados como manuales NO se tocan NUNCA
        const existingCallTimes = existingPrograms.callTimes || {};
        const existingManualCallTimes = existingPrograms.manualCallTimes || {};

        const mergedCallTimes = {};
        let manualesRespetados = 0;
        let nuevosAgregados = 0;
        let automaticosActualizados = 0;

        // Para cada persona en los nuevos turnos
        newShifts.forEach(shift => {
          const personnelId = shift.personnel_id.toString();
          const newCallTime = shift.shift_start.substring(0, 5);

          if (existingManualCallTimes[personnelId]) {
            // 🔒 MANUAL: Respetar el callTime manual del usuario (ley suprema)
            mergedCallTimes[personnelId] = existingCallTimes[personnelId];
            manualesRespetados++;
          } else if (existingCallTimes[personnelId]) {
            // 🔄 AUTOMÁTICO EXISTENTE: Actualizar al nuevo turno
            mergedCallTimes[personnelId] = newCallTime;
            automaticosActualizados++;
          } else {
            // ➕ NUEVO: Agregar callTime para personal nuevo
            mergedCallTimes[personnelId] = newCallTime;
            nuevosAgregados++;
          }
        });

        console.log(`   🔒 CallTimes: ${manualesRespetados} manuales respetados, ${automaticosActualizados} automáticos actualizados, ${nuevosAgregados} nuevos agregados`);

        // 🚨 PILAR 3: RECALCULAR ASIGNACIONES AUTOMÁTICAS después de cambios de personal
        // Obtener asignaciones manuales existentes (las que el usuario marcó explícitamente)
        const existingManualAssignments = existingPrograms.manualAssignments || {};

        console.log(`   🧹 LIMPIEZA: ${Object.keys(existingAssignments).length} asignaciones totales, ${Object.keys(existingManualAssignments).length} manuales a preservar`);

        // Función auxiliar para convertir tiempo a minutos
        const timeToMinutes = (time) => {
          const [h, m] = time.split(':').map(Number);
          return h * 60 + m;
        };

        // 🔥 LIMPIEZA TOTAL: Empezar desde cero (solo manuales sobreviven)
        const recalculatedAssignments = {};
        const programs = existingPrograms.programs || [];

        let manualesPreservadas = 0;
        let automaticasRecalculadas = 0;
        let automaticasEliminadas = 0;

        // PASO 1: Contar cuántas automáticas vamos a eliminar
        Object.keys(existingAssignments).forEach(key => {
          if (!existingManualAssignments[key]) {
            automaticasEliminadas++;
          }
        });

        console.log(`   🔥 Eliminando ${automaticasEliminadas} asignaciones automáticas antiguas`);

        // PASO 2: Preservar SOLO las asignaciones manuales del usuario
        Object.keys(existingManualAssignments).forEach(key => {
          if (existingManualAssignments[key]) {
            recalculatedAssignments[key] = existingAssignments[key];
            manualesPreservadas++;
          }
        });

        // PASO 3: Recalcular asignaciones automáticas usando solapamiento inteligente
        // 🚨 IMPORTANTE: Usar mergedCallTimes (que incluye manuales) NO shiftStart
        newShifts.forEach(shift => {
          const personnelId = shift.personnel_id.toString();

          // 🔑 USAR CALLTIME (manual si existe, automático si no)
          const callTime = mergedCallTimes[personnelId] || shift.shift_start.substring(0, 5);
          const shiftEnd = shift.shift_end.substring(0, 5);
          const callMinutes = timeToMinutes(callTime);
          const shiftEndMinutes = timeToMinutes(shiftEnd);

          // Log si estamos usando callTime manual
          if (existingManualCallTimes[personnelId]) {
            console.log(`   🔒 ${shift.name}: Usando callTime MANUAL ${callTime} (no shift ${shift.shift_start.substring(0, 5)})`);
          }

          programs.forEach(program => {
            const key = `${personnelId}_${program.id}`;

            // Si es manual, ya la preservamos arriba
            if (existingManualAssignments[key]) {
              return;
            }

            // Obtener tiempo del programa
            const programTime = program.defaultTime || program.time || '';
            const timeParts = programTime.split('-');
            const programStartTime = timeParts[0].trim();

            let programEndTime;
            if (timeParts.length > 1) {
              programEndTime = timeParts[1].trim();
            } else {
              // Si no tiene rango, asumir 1 hora de duración
              const [h, m] = programStartTime.split(':').map(Number);
              const endM = h * 60 + m + 60;
              programEndTime = `${String(Math.floor(endM / 60)).padStart(2, '0')}:${String(endM % 60).padStart(2, '0')}`;
            }

            const programStartMinutes = timeToMinutes(programStartTime);
            const programEndMinutes = timeToMinutes(programEndTime);

            // 🚨 LÓGICA DE SOLAPAMIENTO DE COBERTURA (Regla del Usuario)
            // REGLA: Un programa DEBE asignarse si el trabajador está presente en CUALQUIER MOMENTO de la emisión
            // FÓRMULA: (programStartMinutes < shiftEndMinutes) && (programEndMinutes > callMinutes)
            //
            // Ejemplos correctos:
            // - Programa 05:00-10:00, Turno 09:00-17:00 → SÍ asignar (trabajador cubre de 09:00 a 10:00)
            // - Programa 12:00-14:00, Turno 13:00-19:00 → SÍ asignar (trabajador cubre de 13:00 a 14:00)
            // - Programa 18:00-20:00, Turno 08:00-16:00 → NO asignar (trabajador no está presente)
            //
            // NO rechazamos programas que empezaron antes del llamado, el trabajador los puede continuar
            const hasOverlap = (programStartMinutes < shiftEndMinutes) && (programEndMinutes > callMinutes);

            if (hasOverlap) {
              recalculatedAssignments[key] = true;
              automaticasRecalculadas++;
            }
          });
        });

        console.log(`   🔄 Asignaciones recalculadas: ${manualesPreservadas} manuales preservadas, ${automaticasRecalculadas} automáticas regeneradas`);

        // Crear programs_data actualizado: MANTENER programs y callTimes manuales, ACTUALIZAR shifts
        const updatedProgramsData = {
          programs: existingPrograms.programs || [], // ✅ PRESERVAR programas existentes
          shifts: newShifts, // 🔄 NUEVOS turnos
          callTimes: mergedCallTimes, // ✅ PRESERVAR callTimes manuales + actualizar automáticos
          manualCallTimes: existingManualCallTimes, // ✅ PRESERVAR marcadores de callTimes manuales
          manualAssignments: existingManualAssignments // ✅ PRESERVAR marcadores de asignaciones manuales
        };

        // Actualizar programs_data Y assignments_data con asignaciones recalculadas
        await pool.query(
          `UPDATE daily_schedules
           SET programs_data = $1, assignments_data = $2, updated_at = CURRENT_TIMESTAMP
           WHERE date = $3`,
          [JSON.stringify(updatedProgramsData), JSON.stringify(recalculatedAssignments), fecha]
        );

        diasActualizados++;
        console.log(`   ✅ ${fecha}: ${newShifts.length} turnos regenerados, ${automaticasRecalculadas} asignaciones recalculadas, ${manualesPreservadas} asignaciones manuales preservadas`);
      } else {
        // NO EXISTE - Se generará automáticamente al cargar el día
        console.log(`   ⏭️  ${fecha}: No existe registro, se generará al cargar`);
      }
    }

    console.log(`✅ REGENERACIÓN COMPLETA: ${diasActualizados} días actualizados con nuevos turnos y asignaciones recalculadas.`);

    res.json({
      success: true,
      clearCache: true, // 🔥 Flag para forzar refresco del frontend
      message: `Turnos y asignaciones regenerados para ${mes}/${anio}`,
      diasActualizados: diasActualizados,
      periodo: `${primerDia} a ${ultimoDiaStr}`,
      nota: '🚨 HARD DELETE + RECÁLCULO: Base de datos limpiada y asignaciones regeneradas con filtro de reloj. Las asignaciones manuales fueron preservadas.'
    });

  } catch (error) {
    console.error('❌ Error regenerando turnos:', error);
    res.status(500).json({
      error: 'Error al regenerar turnos',
      details: error.message
    });
  }
});

// ⭐⭐⭐ NUEVO: Personal por área para el Dashboard ⭐⭐⭐
// GET - Obtener resumen de personal por área para una fecha específica
router.get('/personnel-by-area/:date', async (req, res) => {
  try {
    const { date } = req.params;

    console.log(`📊 Obteniendo personal por área para ${date}`);

    // 1. Obtener todos los turnos programados para este día
    const shiftsResult = await pool.query(`
      SELECT
        p.area,
        p.id as personnel_id,
        p.name,
        p.active
      FROM personnel p
      WHERE p.active = true
      ORDER BY p.area, p.name
    `);

    // 2. Obtener programación del día (call times)
    const scheduleResult = await pool.query(
      'SELECT assignments_data, programs_data FROM daily_schedules WHERE date = $1',
      [date]
    );

    const programsData = scheduleResult.rows[0]?.programs_data || {};
    const callTimes = programsData.callTimes || {};

    // 3. Obtener novedades activas del día
    const noveltiesResult = await pool.query(`
      SELECT personnel_id, type, description
      FROM novelties
      WHERE (
        (start_date IS NOT NULL AND end_date IS NOT NULL AND $1::date BETWEEN start_date AND end_date)
        OR (date IS NOT NULL AND date = $1)
      )
    `, [date]);

    const noveltiesMap = {};
    noveltiesResult.rows.forEach(n => {
      noveltiesMap[n.personnel_id] = n;
    });

    // 4. Obtener despachos activos del día (si existe la tabla)
    let dispatchesMap = {};
    try {
      const dispatchesResult = await pool.query(`
        SELECT
          fd.personnel_id,
          fd.destination,
          fd.departure_time,
          v.license_plate
        FROM fleet_dispatches fd
        LEFT JOIN fleet_vehicles v ON fd.vehicle_id = v.id
        WHERE (
            (fd.fecha_inicio IS NOT NULL AND fd.fecha_fin IS NOT NULL AND $1::date BETWEEN fd.fecha_inicio AND fd.fecha_fin)
            OR (fd.fecha_inicio IS NULL AND fd.date = $1)
          )
          AND fd.status IN ('PROGRAMADO', 'EN_RUTA')
      `, [date]);

      dispatchesResult.rows.forEach(d => {
        dispatchesMap[d.personnel_id] = d;
      });
    } catch (error) {
      // Tabla fleet_dispatches no existe aún, continuar sin despachos
      console.log('ℹ️  Tabla fleet_dispatches no disponible, continuando sin información de despachos');
    }

    // 5. Agrupar por área y calcular estadísticas
    const areaStats = {};

    shiftsResult.rows.forEach(person => {
      const area = person.area || 'Sin área';

      if (!areaStats[area]) {
        areaStats[area] = {
          area_name: area,
          total_programados: 0,
          disponibles_en_canal: 0,
          en_terreno: 0,
          en_despacho: 0,
          en_novedad: 0
        };
      }

      areaStats[area].total_programados++;

      // Determinar estado
      const enNovedad = !!noveltiesMap[person.personnel_id];
      const enDespacho = !!dispatchesMap[person.personnel_id];
      const tieneHoraLlamado = !!callTimes[person.personnel_id];

      if (enDespacho) {
        areaStats[area].en_despacho++;
        areaStats[area].en_terreno++;
      } else if (enNovedad) {
        const novelty = noveltiesMap[person.personnel_id];
        if (novelty.type.toLowerCase().includes('viaje')) {
          areaStats[area].en_terreno++;
        }
        areaStats[area].en_novedad++;
      } else if (tieneHoraLlamado) {
        // Si tiene hora de llamado y no está en despacho/novedad, está en canal
        const currentHour = new Date().getHours();
        const currentMinutes = new Date().getMinutes();
        const currentTime = currentHour * 60 + currentMinutes;

        const callTimeStr = String(callTimes[person.personnel_id] || '00:00');
        const [callHour, callMinutes] = callTimeStr.split(':').map(Number);
        const callTimeMinutes = callHour * 60 + callMinutes;

        if (currentTime >= callTimeMinutes) {
          // Ya pasó su hora de llamado, debería estar en canal
          areaStats[area].disponibles_en_canal++;
        }
      }
    });

    // Convertir a array y ordenar por total programados
    const result = Object.values(areaStats).sort((a, b) => b.total_programados - a.total_programados);

    console.log(`✅ Estadísticas calculadas para ${Object.keys(areaStats).length} áreas`);

    res.json(result);

  } catch (error) {
    console.error('❌ Error obteniendo personal por área:', error);
    res.status(500).json({
      error: 'Error al obtener personal por área',
      details: error.message
    });
  }
});

// GET - Obtener detalles del personal de un área específica para una fecha
router.get('/area-personnel-details/:date/:areaName', async (req, res) => {
  try {
    const { date, areaName } = req.params;
    const decodedAreaName = decodeURIComponent(areaName);

    console.log(`👥 Obteniendo detalles de personal para ${decodedAreaName} en ${date}`);

    // 1. Obtener personal del área
    const personnelResult = await pool.query(`
      SELECT
        id,
        name,
        area,
        role,
        active,
        grupo_reporteria
      FROM personnel
      WHERE area = $1 AND active = true
      ORDER BY name
    `, [decodedAreaName]);

    // 2. Obtener turnos en TIEMPO REAL llamando a la lógica de auto-shifts internamente
    // Esto garantiza que siempre mostremos el turno correcto según la rotación actual
    const http = require('http');
    let autoShifts = [];

    try {
      const shiftsResponse = await new Promise((resolve, reject) => {
        http.get(`http://localhost:3000/api/schedule/auto-shifts/${date}`, (res) => {
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
      console.log(`   📊 Obtenidos ${autoShifts.length} turnos automáticos para ${date}`);
    } catch (error) {
      console.log('   ⚠️ No se pudieron obtener turnos automáticos, usando datos guardados');
    }

    // Crear mapa de turnos por personnel_id
    const autoShiftsMap = {};
    autoShifts.forEach(shift => {
      autoShiftsMap[shift.personnel_id] = shift;
    });

    // 3. Obtener programación del día (call times guardados)
    const scheduleResult = await pool.query(
      'SELECT assignments_data, programs_data FROM daily_schedules WHERE date = $1',
      [date]
    );

    const programsData = scheduleResult.rows[0]?.programs_data || {};
    const savedCallTimes = programsData.callTimes || {};

    // 4. Obtener novedades activas
    const noveltiesResult = await pool.query(`
      SELECT personnel_id, type, description
      FROM novelties
      WHERE personnel_id = ANY($1::int[])
        AND (
          (start_date IS NOT NULL AND end_date IS NOT NULL AND $2::date BETWEEN start_date AND end_date)
          OR (date IS NOT NULL AND date = $2)
        )
    `, [personnelResult.rows.map(p => p.id), date]);

    const noveltiesMap = {};
    noveltiesResult.rows.forEach(n => {
      noveltiesMap[n.personnel_id] = n;
    });

    // 5. Obtener despachos activos (con lógica de retorno de conductor)
    let dispatchesMap = {};
    try {
      const dispatchesResult = await pool.query(`
        SELECT DISTINCT
          pdp.personnel_id,
          pd.destination,
          pd.departure_time,
          pd.conductor_retorna,
          pd.hora_retorno_conductor,
          v.license_plate,
          pdp.role
        FROM press_dispatches pd
        JOIN press_dispatch_personnel pdp ON pd.id = pdp.dispatch_id
        LEFT JOIN fleet_vehicles v ON pd.vehicle_id = v.id
        WHERE pdp.personnel_id = ANY($1::int[])
          AND $2::date BETWEEN pd.fecha_inicio AND pd.fecha_fin
          AND pd.status IN ('PROGRAMADO', 'EN_RUTA')
      `, [personnelResult.rows.map(p => p.id), date]);

      dispatchesResult.rows.forEach(d => {
        dispatchesMap[d.personnel_id] = d;
      });
      console.log(`   🚗 Obtenidos ${dispatchesResult.rows.length} despachos de personal`);
    } catch (error) {
      console.log('ℹ️  Error al obtener despachos:', error.message);
    }


    // 6. Función para determinar el nombre del turno según la hora
    const getTurnoNombre = (shiftStart) => {
      if (!shiftStart) return null;
      const hour = parseInt(shiftStart.split(':')[0]);
      if (hour >= 5 && hour < 12) return 'MAÑANA';
      if (hour >= 12 && hour < 18) return 'TARDE';
      return 'NOCHE';
    };

    // 7. Construir respuesta detallada
    const detailedPersonnel = personnelResult.rows.map(person => {
      const autoShift = autoShiftsMap[person.id];
      const novelty = noveltiesMap[person.id];
      const dispatch = dispatchesMap[person.id];

      // Usar hora de llamado del turno automático, o del guardado como fallback
      let callTime = savedCallTimes[person.id];
      let turnoNombre = null;
      let turnoHorario = null;

      if (autoShift) {
        // Extraer hora de inicio del turno (sin segundos)
        const shiftStartTime = autoShift.shift_start.substring(0, 5);
        const shiftEndTime = autoShift.shift_end.substring(0, 5);

        // Si no hay callTime guardado, usar la hora de inicio del turno
        if (!callTime) {
          callTime = shiftStartTime;
        }

        turnoNombre = getTurnoNombre(autoShift.shift_start);
        turnoHorario = `${shiftStartTime} - ${shiftEndTime}`;

        // Para reportería, usar turno_rotado si está disponible
        if (autoShift.turno_rotado) {
          turnoNombre = autoShift.turno_rotado === 'AM' ? 'MAÑANA' : 'TARDE';
        }
      }

      // Determinar estado en canal
      const currentHour = new Date().getHours();
      const currentMinutes = new Date().getMinutes();
      const currentTime = currentHour * 60 + currentMinutes;

      let enCanal = false;
      if (callTime && !dispatch && !novelty) {
        const callTimeStr = String(callTime || '00:00');
        const [callHour, callMinutes] = callTimeStr.split(':').map(Number);
        const callTimeMinutes = callHour * 60 + callMinutes;
        enCanal = currentTime >= callTimeMinutes;
      }

      return {
        id: person.id,
        nombre: person.name,
        area: person.area,
        role: person.role || decodedAreaName,
        hora_llamado: callTime || null,
        turno: turnoNombre,
        turno_horario: turnoHorario,
        en_canal: enCanal,
        en_despacho: !!dispatch,
        en_viaje: (novelty?.type.toLowerCase().includes('viaje')) || false,
        en_terreno: (() => {
          if (!dispatch) return false;

          // Si el conductor retorna y ya pasó la hora de retorno, verificar el rol
          if (dispatch.conductor_retorna && dispatch.hora_retorno_conductor && dispatch.role === 'DRIVER') {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            // Si ya pasó la hora de retorno, el conductor NO está en terreno
            if (currentTime >= dispatch.hora_retorno_conductor) {
              return false;
            }
          }

          return true; // Sigue en terreno
        })(),
        despacho_info: dispatch ? {
          destino: dispatch.destination,
          vehiculo: dispatch.license_plate,
          hora_salida: dispatch.departure_time
        } : null,
        novedad_info: novelty ? {
          tipo: novelty.type,
          descripcion: novelty.description
        } : null
      };
    });

    // Filtrar solo personal que tiene turno programado para este día
    const personnelWithShifts = detailedPersonnel.filter(p => p.turno !== null);

    // Ordenar por hora de llamado (AM a PM)
    const sortedPersonnel = personnelWithShifts.sort((a, b) => {
      if (a.hora_llamado && b.hora_llamado) {
        const [aHour, aMin] = a.hora_llamado.split(':').map(Number);
        const [bHour, bMin] = b.hora_llamado.split(':').map(Number);
        return (aHour * 60 + aMin) - (bHour * 60 + bMin);
      }
      if (a.hora_llamado) return -1;
      if (b.hora_llamado) return 1;
      return a.nombre.localeCompare(b.nombre);
    });

    console.log(`✅ Detalles obtenidos para ${sortedPersonnel.length} personas de ${decodedAreaName} con turno programado`);

    res.json(sortedPersonnel);

  } catch (error) {
    console.error('❌ Error obteniendo detalles del área:', error);
    res.status(500).json({
      error: 'Error al obtener detalles del área',
      details: error.message
    });
  }
});

module.exports = router;