// src/utils/exportToExcel.js

export const exportToExcel = (schedule, filename = 'programacion.xlsx') => {
  // Convertir schedule a formato de hoja de cálculo
  const data = [];
  
  // Headers
  data.push(['Fecha', 'Día', 'Área', 'Nombre', 'Rol', 'Turno', 'Novedad', 'Descripción']);
  
  Object.keys(schedule).forEach(date => {
    const dateObj = new Date(date);
    const dayName = dateObj.toLocaleDateString('es-CO', { weekday: 'long' });
    
    Object.keys(schedule[date]).forEach(area => {
      schedule[date][area].forEach(entry => {
        data.push([
          date,
          dayName,
          area,
          entry.personnel.name,
          entry.personnel.role,
          entry.shift,
          entry.novelty ? entry.novelty.type : '',
          entry.novelty ? entry.novelty.description : ''
        ]);
      });
    });
  });
  
  // Convertir a CSV
  const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  // Descargar
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename.replace('.xlsx', '.csv'));
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportByArea = (schedule, area, filename) => {
  const filteredSchedule = {};
  
  Object.keys(schedule).forEach(date => {
    if (schedule[date][area]) {
      filteredSchedule[date] = {
        [area]: schedule[date][area]
      };
    }
  });
  
  exportToExcel(filteredSchedule, filename || `programacion_${area}.xlsx`);
};

export const exportByDate = (schedule, date, filename) => {
  if (!schedule[date]) {
    console.error('Fecha no encontrada en el horario');
    return;
  }
  
  const dateSchedule = {
    [date]: schedule[date]
  };
  
  exportToExcel(dateSchedule, filename || `programacion_${date}.xlsx`);
};

export const exportSummary = (schedule, filename = 'resumen.xlsx') => {
  const summary = {};
  
  Object.keys(schedule).forEach(date => {
    Object.keys(schedule[date]).forEach(area => {
      if (!summary[area]) {
        summary[area] = {
          total: 0,
          byShift: {},
          withNovelties: 0
        };
      }
      
      schedule[date][area].forEach(entry => {
        summary[area].total++;
        
        if (!summary[area].byShift[entry.shift]) {
          summary[area].byShift[entry.shift] = 0;
        }
        summary[area].byShift[entry.shift]++;
        
        if (entry.novelty) {
          summary[area].withNovelties++;
        }
      });
    });
  });
  
  // Convertir resumen a formato de exportación
  const data = [['Área', 'Total Asignaciones', 'Con Novedades', 'Por Turno']];
  
  Object.keys(summary).forEach(area => {
    const shifts = Object.keys(summary[area].byShift)
      .map(shift => `${shift}: ${summary[area].byShift[shift]}`)
      .join(', ');
      
    data.push([
      area,
      summary[area].total,
      summary[area].withNovelties,
      shifts
    ]);
  });
  
  const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename.replace('.xlsx', '.csv'));
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};