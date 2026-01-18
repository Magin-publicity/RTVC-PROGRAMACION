import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { classifyPersonnel, getResourceForPersonnel } from './personnelClassification';

export const generateSchedulePDF = (personnel, programs, assignments, callTimes, selectedDate, programMappings = {}) => {
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
    orange: [249, 115, 22]      // bg-orange-500 - ASIGNADO (naranja brillante como la interfaz)
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

  // MISMO ORDEN QUE LA INTERFAZ
  const areaOrder = [
    'PRODUCTORES',
    'ASISTENTES DE PRODUCCIÓN',
    'DIRECTORES DE CÁMARA',
    'VTR',
    'OPERADORES DE VMIX',
    'OPERADORES DE PANTALLAS',
    'GENERADORES DE CARACTERES',
    'OPERADORES DE SONIDO',
    'ASISTENTES DE SONIDO',
    'OPERADORES DE PROMPTER',
    'CAMARÓGRAFOS DE ESTUDIO',
    'ASISTENTES DE ESTUDIO',
    'COORDINADOR ESTUDIO',
    'ESCENOGRAFÍA',
    'ASISTENTES DE LUCES',
    'OPERADORES DE VIDEO',
    'CONTRIBUCIONES',
    'REALIZADORES',
    'CAMARÓGRAFOS DE REPORTERÍA',
    'ASISTENTES DE REPORTERÍA',
    'VESTUARIO',
    'MAQUILLAJE',
  ];

  const personnelByDept = personnel.reduce((acc, person) => {
    if (!acc[person.area]) acc[person.area] = [];
    acc[person.area].push(person);
    return acc;
  }, {});

  const sortedDepts = Object.entries(personnelByDept).sort((a, b) => {
    const indexA = areaOrder.indexOf(a[0]);
    const indexB = areaOrder.indexOf(b[0]);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
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

  // Preparar datos con separadores por departamento
  const tableData = [];

  sortedDepts.forEach(([dept, deptPersonnel]) => {
    // Fila de encabezado de departamento (bg-blue-800)
    tableData.push([
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

    tableData.push(columnHeaderRow);

    // ORDENAR PERSONAL POR HORA DE LLAMADO (igual que la interfaz)
    const sortedByTime = [...deptPersonnel].sort((a, b) => {
      const timeA = callTimes[a.id] || '99:99';
      const timeB = callTimes[b.id] || '99:99';
      return timeA.localeCompare(timeB);
    });

    // Filas de personal
    sortedByTime.forEach(person => {
      const row = [
        person.name,
        person.role,
        callTimes[person.id] || person.current_shift || ''
      ];

      // Agregar celdas de programas
      programs.forEach(program => {
        const key = `${person.id}_${program.id}`;
        if (assignments[key]) {
          // Obtener el grupo del personal para determinar si va a Master o Estudio
          const personnelGroup = classifyPersonnel(person.role);

          // Obtener el mapeo del programa
          const programMapping = programMappings[program.id];

          // Obtener el nombre del recurso (Master X o Estudio Y)
          const resource = getResourceForPersonnel(programMapping, personnelGroup);

          // Usar el recurso si existe, sino mostrar "ASIGNADO"
          row.push(resource || 'ASIGNADO');
        } else {
          row.push('');
        }
      });

      tableData.push(row);
    });
  });

  // Tabla sin encabezado global (cada área tiene su propio encabezado)
  autoTable(doc, {
    body: tableData,
    startY: 25,
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
      0: { cellWidth: 35, fontStyle: 'bold', halign: 'left' },
      1: { cellWidth: 30, fontSize: 7, halign: 'left' },
      2: { cellWidth: 15, halign: 'center', fontSize: 7 }
    },
    didParseCell: function(data) {
      // Colorear celdas de asignaciones con el color del programa
      if (data.column.index >= 3) {
        const cellText = data.cell.text[0];
        if (cellText && cellText !== '') {
          // El índice de columna 3+ corresponde a programas
          const programIndex = data.column.index - 3;
          const program = programs[programIndex];

          // Usar el color del programa si existe, sino usar naranja por defecto
          const programColor = program && program.color ? hexToRgb(program.color) : colors.orange;

          data.cell.styles.fillColor = programColor;
          data.cell.styles.textColor = colors.white;
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
          data.cell.styles.fontSize = 6;
        }
      }
    }
  });

  // Descargar
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.getDate()).padStart(2, '0');
  doc.save(`Programacion_RTVC_${year}-${month}-${day}.pdf`);
};
