import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { classifyPersonnel, getResourceForPersonnel } from './personnelClassification';

export const generateSchedulePDF = (personnel, programs, assignments, callTimes, selectedDate, programMappings = {}, novelties = [], assignmentNotes = {}, endTimes = {}, manualAssignments = {}) => {
  // 🔍 DEBUG: Ver qué datos recibe el PDF
  console.log('📄 [PDF] Datos recibidos:');
  console.log('  - Programs:', programs.length, programs.map(p => ({ id: p.id, name: p.name })));
  console.log('  - Assignments:', Object.keys(assignments).length, 'asignaciones');
  console.log('  - Assignment Notes:', Object.keys(assignmentNotes).length, 'notas');
  console.log('  - Program Mappings:', Object.keys(programMappings).length, 'mapeos');
  console.log('  - Manual Assignments:', Object.keys(manualAssignments).length, 'asignaciones manuales');

  // Función para convertir tiempo a minutos
  const timeToMinutes = (time) => {
    if (!time || time === '--:--') return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  // Función para verificar si un programa debe mostrarse (IGUAL QUE LA PANTALLA)
  const shouldShowProgram = (personnelId, programId, program) => {
    const key = `${personnelId}_${programId}`;

    // Si es asignación manual, siempre mostrarla
    if (manualAssignments[key]) {
      return true;
    }

    // Obtener callTime del trabajador
    const workerCallTime = callTimes[personnelId];
    if (!workerCallTime || workerCallTime === '--:--') {
      return true; // Si no tiene callTime, mostrar todos
    }

    // Obtener hora de inicio del programa
    const programTime = program.defaultTime || program.time || '';
    const programStartTime = programTime.split('-')[0].trim();

    if (!programStartTime) return true;

    // Comparar tiempos
    const callMinutes = timeToMinutes(workerCallTime);
    const programMinutes = timeToMinutes(programStartTime);

    // Solo mostrar si el programa empieza en o después del llamado
    return programMinutes >= callMinutes;
  };

  // Verificar asignaciones de Andrés Patiño, Henry Villarraga y Ronald Ortiz
  const andresPatino = personnel.find(p => p.name.includes('Andrés Patiño'));
  const henryVillarraga = personnel.find(p => p.name.includes('Henry Villarraga'));
  const ronaldOrtiz = personnel.find(p => p.name.includes('Ronald Ortiz'));

  if (andresPatino) {
    console.log(`  - Andrés Patiño (ID: ${andresPatino.id}) asignaciones:`);
    Object.keys(assignments).filter(k => k.startsWith(`${andresPatino.id}_`)).forEach(key => {
      const programId = key.split('_')[1];
      const program = programs.find(p => p.id == programId);
      const value = assignments[key];
      const shouldShow = program ? shouldShowProgram(andresPatino.id, program.id, program) : false;
      const willShow = value === true && shouldShow;
      console.log(`    ${key} (${program?.name || 'unknown'}): value=${value}, shouldShow=${shouldShow} → ${willShow ? '✅ SE MOSTRARÁ' : '❌ NO SE MOSTRARÁ'}`);
    });
  }

  if (henryVillarraga) {
    console.log(`  - Henry Villarraga (ID: ${henryVillarraga.id}) asignaciones:`);
    Object.keys(assignments).filter(k => k.startsWith(`${henryVillarraga.id}_`)).forEach(key => {
      const programId = key.split('_')[1];
      const program = programs.find(p => p.id == programId);
      const value = assignments[key];
      const shouldShow = program ? shouldShowProgram(henryVillarraga.id, program.id, program) : false;
      const willShow = value === true && shouldShow;
      console.log(`    ${key} (${program?.name || 'unknown'}): value=${value}, shouldShow=${shouldShow} → ${willShow ? '✅ SE MOSTRARÁ' : '❌ NO SE MOSTRARÁ'}`);
    });
  }

  if (ronaldOrtiz) {
    console.log(`  - Ronald Ortiz (ID: ${ronaldOrtiz.id}) asignaciones:`);
    Object.keys(assignments).filter(k => k.startsWith(`${ronaldOrtiz.id}_`)).forEach(key => {
      const programId = key.split('_')[1];
      const program = programs.find(p => p.id == programId);
      const value = assignments[key];
      const shouldShow = program ? shouldShowProgram(ronaldOrtiz.id, program.id, program) : false;
      const willShow = value === true && shouldShow;
      console.log(`    ${key} (${program?.name || 'unknown'}): value=${value}, shouldShow=${shouldShow} → ${willShow ? '✅ SE MOSTRARÁ' : '❌ NO SE MOSTRARÁ'}`);
    });
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3'
  });

  // Colores EXACTOS de la interfaz
  const colors = {
    blue900: [30, 58, 138],    // bg-blue-900 - título principal
    blue800: [30, 64, 175],     // bg-blue-800 - headers de área
    blue700: [29, 78, 216],     // bg-blue-700 - headers de columnas
    white: [255, 255, 255],
    black: [0, 0, 0],
    corporateOrange: [255, 108, 0],  // RGB(255, 108, 0) - Naranja corporativo para asignaciones
    travelGreen: [0, 251, 58],       // RGB(0, 251, 58) - Verde para viajes
    noveltyRed: [239, 68, 68]        // #EF4444 - Rojo para otras novedades
  };

  // Título
  const formatDate = (date) => {
    const days = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                    'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName} ${day} ${month} DE ${year}`;
  };

  // Fondo azul para el título (bg-blue-900)
  doc.setFillColor(...colors.blue900);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), 20, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...colors.white);
  doc.text(`COORDINACIÓN PARA EL CUMPLIMIENTO DE ACTIVIDADES DE RTVC ${formatDate(selectedDate)}`,
           doc.internal.pageSize.getWidth() / 2, 12, { align: 'center' });

  // MISMO ORDEN QUE LA INTERFAZ (ScheduleTable.jsx)
  const areaOrder = [
    'PRODUCCIÓN',
    'PRODUCTORES',
    'ASISTENTES DE PRODUCCIÓN',
    'DIRECTORES DE CÁMARA',
    'VTR',
    'VIMIX',
    'OPERADORES DE VMIX',
    'OPERADORES DE VIMIX',
    'OPERADORES DE PANTALLAS',
    'GENERADORES DE CARACTERES',
    'OPERADORES DE SONIDO',
    'ASISTENTES DE SONIDO',
    'OPERADORES DE PROMPTER',
    'OPERADORES DE TELEPROMPTER',
    'CAMARÓGRAFOS DE ESTUDIO',
    'ASISTENTES DE ESTUDIO',
    'COORDINADOR ESTUDIO',
    'ESCENOGRAFÍA',
    'ASISTENTES DE LUCES',
    'OPERADORES DE VIDEO',
    'REALIZADORES',
    'CAMARÓGRAFOS DE REPORTERÍA',
    'ASISTENTES DE REPORTERÍA',
    'VESTUARIO',
    'MAQUILLAJE',
  ];

  // Roles de producción permitidos (excluir productores jefes/gerentes)
  const allowedProductionRoles = [
    'Productor de Emisión',
    'Produccion',
    'Asistente de producción',
    'Asistente de Producción',
  ];

  // Función para normalizar nombres de áreas (quitar tildes, espacios extras)
  const normalizeArea = (area) => {
    if (!area) return '';
    return area
      .toUpperCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Quitar tildes
  };

  // Crear mapa normalizado de áreas permitidas
  const normalizedAreaOrder = areaOrder.map(normalizeArea);

  // Filtrar solo el personal de áreas de producción (IGUAL QUE LA PANTALLA)
  const personnelByDept = personnel.reduce((acc, person) => {
    const normalizedPersonArea = normalizeArea(person.area);

    // Solo incluir si el área está en areaOrder
    if (normalizedAreaOrder.includes(normalizedPersonArea)) {
      // Usar el nombre original del área para agrupar
      const areaKey = person.area;

      // Si es PRODUCCIÓN, PRODUCTORES o ASISTENTES DE PRODUCCIÓN, filtrar por roles permitidos
      const isProductionArea =
        normalizedPersonArea === 'PRODUCCION' ||
        normalizedPersonArea === 'PRODUCTORES' ||
        normalizedPersonArea === 'ASISTENTES DE PRODUCCION';

      if (isProductionArea) {
        if (allowedProductionRoles.includes(person.role)) {
          if (!acc[areaKey]) acc[areaKey] = [];
          acc[areaKey].push(person);
        }
      } else {
        // Para otras áreas, incluir todo el personal
        if (!acc[areaKey]) acc[areaKey] = [];
        acc[areaKey].push(person);
      }
    }
    return acc;
  }, {});

  // Orden hardcodeado del personal (DEBE COINCIDIR CON ScheduleTable.jsx)
  const personnelOrder = {
    'PRODUCCIÓN': ['Luis Fajardo', 'Laura Ávila', 'Rocio Ruiz', 'Marilú Durán', 'Juliana Coronel', 'Luis Solano', 'Juan Carlos Boada', 'Nicolle Diaz', 'Angela Cabezas', 'Isabella Rojas', 'Valentina Vélez', 'Camila Carvajal', 'Sebastián Arango', 'Alexander Paez', 'Sara Daza', 'Juana Ullune'],
    'PRODUCTORES': ['Luis Fajardo', 'Laura Ávila', 'Rocio Ruiz', 'Marilú Durán', 'Juliana Coronel', 'Luis Solano', 'Juan Carlos Boada'],
    'ASISTENTES DE PRODUCCIÓN': ['Nicolle Diaz', 'Angela Cabezas', 'Isabella Rojas', 'Valentina Vélez', 'Camila Carvajal', 'Sebastián Arango', 'Alexander Paez', 'Sara Daza', 'Juana Ullune'],
    'DIRECTORES DE CÁMARA': ['Andrés Patiño', 'Camilo Hernández', 'Diego Gamboa', 'Eduardo Contreras', 'Julián Jiménez', 'Alejandro La Torre'],
    'VTR': ['Alfredo Méndez', 'David Córdoba', 'Henry Villarraga', 'William Aldana'],
    'VIMIX': ['Sofía Fajardo', 'Ronald Ortiz', 'Vanesa Castañeda', 'Tania Morales'],
    'OPERADORES DE VMIX': ['Sofía Fajardo', 'Ronald Ortiz', 'Vanesa Castañeda', 'Tania Morales'],
    'OPERADORES DE VIMIX': ['Sofía Fajardo', 'Ronald Ortiz', 'Vanesa Castañeda', 'Tania Morales'],
    'OPERADORES DE PANTALLAS': ['Paola Borrero', 'Dary Segura', 'Leidy Salazar', 'Ashlei Montero'],
    'GENERADORES DE CARACTERES': ['Diana Ospina', 'Maria Jose Escobar', 'Santiago Ortiz', 'Santiago Rico', 'Dayana Rodríguez', 'María Suárez'],
    'OPERADORES DE SONIDO': ['Oscar Bernal', 'John Valencia', 'Wilmar Matiz', 'Harold Barrero', 'Lenin Gutiérrez', 'Huber Salazar'],
    'ASISTENTES DE SONIDO': ['Jimmy Estupiñán', 'Marcela Vélez', 'Luis Fonseca', 'Jaime Rueda', 'Wilson Cano'],
    'OPERADORES DE PROMPTER': ['Duván Díaz', 'Katherine Montoya', 'Kevin Alejandro Lerma', 'Lina Rodríguez'],
    'OPERADORES DE TELEPROMPTER': ['Duván Díaz', 'Katherine Montoya', 'Kevin Alejandro Lerma', 'Lina Rodríguez'],
    'CAMARÓGRAFOS DE ESTUDIO': ['Jorge Jaramillo', 'Juan Sacristán', 'Jefferson Pérez', 'John Jiménez', 'Alexander Quiñonez', 'Sebastián Hernández', 'Carlos López', 'Carlos A. López', 'Cesar Jimenez', 'Ángel Zapata', 'Angel Zapata', 'John Loaiza', 'Ernesto Corchuelo', 'Carlos García', 'Carlos Garcia', 'John Daminston', 'John Daminston Arevalo', 'William Mosquera', 'Pedro Niño', 'Pedro Nino', 'Luis Bernal', 'Raul Ramírez', 'Raul Ramirez', 'Samuel Romero', 'Oscar González', 'Oscar Gonzalez'],
    'ASISTENTES DE ESTUDIO': ['Diego González', 'Julio Vega', 'Rodolfo Saldaña', 'José Peña', 'Carlos Orlando Espinel'],
    'COORDINADOR ESTUDIO': ['Jonathan Contreras'],
    'ESCENOGRAFÍA': ['Rafael López', 'Néstor Peña', 'John Forero', 'Jacson Urrego', 'Joaquín Alonso'],
    'ASISTENTES DE LUCES': ['Daniel Pinilla', 'Jaiver Galeano', 'Santiago Espinosa', 'Jhonatan Andres Ramirez', 'Julio López'],
    'OPERADORES DE VIDEO': ['Leonardo Castro', 'Horacio Suárez', 'Pedro Torres', 'Iván Aristizábal'],
    'REALIZADORES': ['William Ruiz', 'Carlos Wilches', 'Cesar Morales', 'Julián Luna', 'Enrique Muñoz', 'William Uribe', 'John Buitrago', 'Floresmiro Luna', 'Edgar Nieto', 'Álvaro Díaz', 'Victor Vargas', 'Erick Velásquez', 'Andrés Ramírez', 'Edgar Castillo', 'Marco Solorzano', 'Ramiro Balaguera', 'Leonel Cifuentes', 'Didier Buitrago', 'Laura Vargas', 'Alexander Valencia', 'Santiago Torres', 'David Patarroyo', 'Óscar Ortega', 'Guillermo Solarte', 'Wílmer Salamanca', 'Manuel Díaz'],
    'CAMARÓGRAFOS DE REPORTERÍA': ['William Ruiz', 'Carlos Wilches', 'Cesar Morales', 'Julián Luna', 'Enrique Muñoz', 'William Uribe', 'John Buitrago', 'Floresmiro Luna', 'Edgar Nieto', 'Álvaro Díaz', 'Victor Vargas', 'Erick Velásquez', 'Andrés Ramírez', 'Edgar Castillo', 'Marco Solorzano', 'Ramiro Balaguera', 'Leonel Cifuentes', 'Didier Buitrago'],
    'ASISTENTES DE REPORTERÍA': ['Richard Beltran', 'Johan Daniel Moreno', 'Walter Murillo', 'Pablo Preciado', 'Bryan Rodríguez', 'Brayan Munera', 'José Mesa'],
    'VESTUARIO': ['Mariluz Beltrán', 'Dora Rincón', 'Yineth Tovar', 'Mercedes Malagón', 'Carlos Acosta'],
    'MAQUILLAJE': ['Catalina Acevedo', 'María Espinosa', 'Lady Ortiz', 'Ana Villalba']
  };

  // Función para obtener índice de orden de una persona
  const getPersonnelSortIndex = (person, area) => {
    // 1. Primero verificar si hay un orden personalizado (manual) en localStorage
    try {
      const customOrders = localStorage.getItem('rtvc_personnel_custom_order');
      if (customOrders) {
        const orders = JSON.parse(customOrders);
        const customOrder = orders[area];
        if (customOrder && customOrder.length > 0) {
          const index = customOrder.findIndex(name => name.toLowerCase() === person.name.toLowerCase());
          if (index !== -1) return index;
        }
      }
    } catch (error) {
      console.error('Error al leer orden personalizado:', error);
    }

    // 2. Si no hay orden personalizado, usar el orden hardcodeado
    // Buscar usando normalización (IGUAL QUE ScheduleTable.jsx)
    const normalizedArea = normalizeArea(area);
    const orderList = personnelOrder[area] || personnelOrder[Object.keys(personnelOrder).find(key => normalizeArea(key) === normalizedArea)];

    if (!orderList) return 9999;
    const index = orderList.findIndex(name => name.toLowerCase() === person.name.toLowerCase());
    return index === -1 ? 9999 : index;
  };

  // Ordenar áreas según areaOrder (usando normalización para comparar)
  const sortedDepts = Object.entries(personnelByDept).sort((a, b) => {
    const normalizedA = normalizeArea(a[0]);
    const normalizedB = normalizeArea(b[0]);

    // Buscar el índice en el array normalizado
    const indexA = normalizedAreaOrder.indexOf(normalizedA);
    const indexB = normalizedAreaOrder.indexOf(normalizedB);

    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  // CRÍTICO: Ordenar el personal dentro de cada área según el orden definido
  sortedDepts.forEach(([area, persons]) => {
    persons.sort((a, b) => {
      const indexA = getPersonnelSortIndex(a, area);
      const indexB = getPersonnelSortIndex(b, area);
      return indexA - indexB;
    });
  });

  // Convertir colores hex a RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [128, 128, 128];
  };

  // Función auxiliar para verificar si una persona tiene novedad en la fecha seleccionada
  const hasNoveltyOnDate = (personId) => {
    const todayStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    return novelties?.find(n => {
      if (Number(n.personnel_id) !== Number(personId)) return false;

      if (n.start_date && n.end_date) {
        const startStr = n.start_date.split('T')[0];
        const endStr = n.end_date.split('T')[0];
        return todayStr >= startStr && todayStr <= endStr;
      }

      if (n.date) {
        return n.date.split('T')[0] === todayStr;
      }

      return false;
    });
  };

  // Variable para rastrear la posición Y actual
  let currentY = 25;

  sortedDepts.forEach(([dept, deptPersonnel]) => {
    // Preparar datos para esta área específica
    const areaTableData = [];

    // Fila de encabezado de departamento (bg-blue-800)
    areaTableData.push([
      { content: dept, colSpan: 3 + programs.length, styles: {
        fillColor: colors.blue800,
        textColor: colors.white,
        fontStyle: 'bold',
        halign: 'left',
        fontSize: 9
      }}
    ]);

    // Encabezado de columnas para esta área (NOMBRE, ACTIVIDAD, HORA LLAMADO)
    const columnHeaderRow = [
      { content: 'NOMBRE', styles: { fillColor: colors.blue700, textColor: colors.white, fontStyle: 'bold', halign: 'center', fontSize: 8 }},
      { content: 'ACTIVIDAD', styles: { fillColor: colors.blue700, textColor: colors.white, fontStyle: 'bold', halign: 'center', fontSize: 8 }},
      { content: 'HORA\nLLAMADO', styles: { fillColor: colors.blue700, textColor: colors.white, fontStyle: 'bold', halign: 'center', fontSize: 8 }}
    ];

    // Agregar encabezados de programas con sus colores
    programs.forEach(program => {
      const rgb = program.color ? hexToRgb(program.color) : colors.blue700;
      columnHeaderRow.push({
        content: `${program.name}\n${program.defaultTime || program.time || '--:--'}`,
        styles: {
          fillColor: rgb,
          textColor: colors.white,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 7
        }
      });
    });

    areaTableData.push(columnHeaderRow);

    // NO ordenar - mantener el mismo orden que la interfaz
    // Filas de personal
    deptPersonnel.forEach(person => {
      // Verificar si la persona tiene novedad para determinar la hora de llamado
      const novelty = hasNoveltyOnDate(person.id);
      const hasNoContract = novelty && novelty.type === 'SIN_CONTRATO';

      const row = [
        person.name,
        person.role,
        hasNoContract ? '' : (callTimes[person.id] || person.current_shift || '')
      ];

      // Agregar celdas de programas
      programs.forEach(program => {
        const key = `${person.id}_${program.id}`;

        if (novelty) {
          // Si hay novedad, mostrarla con metadata para colorear después
          if (novelty.type === 'SIN_CONTRATO') {
            row.push('');
          } else {
            const noveltyText = novelty.description || novelty.type;
            row.push({
              content: noveltyText,
              styles: {
                fillColor: novelty.type === 'VIAJE' ? colors.travelGreen : colors.noveltyRed,
                textColor: colors.black,
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 6
              }
            });
          }
        } else if (assignments[key] === true) {  // 🚨 CRÍTICO: SOLO procesar si es explícitamente true (eliminar asignaciones con false)
          // 🔍 FILTRO POR CALLTIME: Verificar si este programa debe mostrarse (IGUAL QUE LA PANTALLA)
          const shouldShow = shouldShowProgram(person.id, program.id, program);

          if (!shouldShow) {
            // No mostrar esta asignación aunque exista en assignments
            row.push('');
          } else {
            // Determinar el texto de la celda (IGUAL QUE LA PANTALLA)
            let cellText;

          // Si hay nota personalizada, usarla
          if (assignmentNotes[key]) {
            cellText = assignmentNotes[key];
          } else {
            // Clasificar al personal según su cargo
            const personnelGroup = classifyPersonnel(person.role);

            // Obtener el mapeo del programa
            const programMapping = programMappings[program.id];

            // Obtener el recurso según el grupo del personal
            const resource = getResourceForPersonnel(programMapping, personnelGroup);

            // Construir el texto de la celda - solo mostrar el recurso
            if (resource) {
              cellText = resource;
            } else {
              // Si no hay recurso asignado, mostrar el nombre del programa
              cellText = program.name;
            }
          }

            // Usar objeto con metadata para colorear después con naranja corporativo
            row.push({
              content: cellText,
              styles: {
                fillColor: colors.corporateOrange,
                textColor: colors.white,
                fontStyle: 'bold',
                halign: 'center',
                fontSize: 6
              }
            });
          }
        } else {
          row.push('');
        }
      });

      areaTableData.push(row);
    });

    // Renderizar tabla para esta área (cada área es una tabla separada)
    autoTable(doc, {
      body: areaTableData,
      startY: currentY,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold', halign: 'left' },     // NOMBRE
        1: { cellWidth: 30, fontSize: 7, halign: 'left' },           // ACTIVIDAD
        2: { cellWidth: 15, halign: 'center', fontSize: 7 }          // HORA LLAMADO
      },
      // Esto hace que la tabla completa se mueva a la siguiente página si no cabe
      pageBreak: 'avoid'
    });

    // Actualizar la posición Y para la próxima tabla
    currentY = doc.lastAutoTable.finalY + 2; // +2mm de espacio entre áreas
  });

  // Descargar
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.getDate()).padStart(2, '0');
  doc.save(`Programacion_RTVC_${year}-${month}-${day}.pdf`);
};
