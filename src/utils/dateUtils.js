// src/utils/dateUtils.js

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateLong = (date) => {
  if (!date) return '';
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString('es-CO', options);
};

export const formatDateShort = (date) => {
  if (!date) return '';

  let dateObj;
  // Si es un string con formato ISO (YYYY-MM-DD), parsearlo sin timezone
  if (typeof date === 'string' && date.includes('-')) {
    const dateStr = date.split('T')[0];
    const [year, month, day] = dateStr.split('-').map(Number);
    dateObj = new Date(year, month - 1, day);
  } else {
    dateObj = new Date(date);
  }

  const options = {
    month: 'short',
    day: 'numeric'
  };
  return dateObj.toLocaleDateString('es-CO', options);
};

export const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
};

export const getWeekDates = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    dates.push(current);
  }
  return dates;
};

export const getWeekStartEnd = (date) => {
  const dates = getWeekDates(date);
  return {
    start: dates[0],
    end: dates[6]
  };
};

export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6;
};

export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addWeeks = (date, weeks) => {
  return addDays(date, weeks * 7);
};

export const getDayName = (date) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[new Date(date).getDay()];
};

export const getDayNameShort = (date) => {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[new Date(date).getDay()];
};

export const getMonthName = (date) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[new Date(date).getMonth()];
};

export const isToday = (date) => {
  return isSameDay(date, new Date());
};

export const isPast = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

export const isFuture = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate) return '';

  // Si no hay fecha de fin o son la misma fecha
  if (!endDate || startDate === endDate) {
    return formatDateShort(startDate);
  }

  // Parsear fechas correctamente para comparación
  let start, end;
  if (typeof startDate === 'string' && startDate.includes('-')) {
    const startStr = startDate.split('T')[0];
    const [year, month, day] = startStr.split('-').map(Number);
    start = new Date(year, month - 1, day);
  } else {
    start = new Date(startDate);
  }

  if (typeof endDate === 'string' && endDate.includes('-')) {
    const endStr = endDate.split('T')[0];
    const [year, month, day] = endStr.split('-').map(Number);
    end = new Date(year, month - 1, day);
  } else {
    end = new Date(endDate);
  }

  // Si son el mismo día
  if (isSameDay(start, end)) {
    return formatDateShort(startDate);
  }

  // Si hay rango de fechas
  return `${formatDateShort(startDate)} - ${formatDateShort(endDate)}`;
};