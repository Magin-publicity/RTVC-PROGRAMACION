// src/data/shifts.js

export const SHIFTS = [
  { id: 1, time: '5:00', label: 'Turno Madrugada', color: '#1E3A8A' },
  { id: 2, time: '6:00', label: 'Turno Mañana Temprano', color: '#1E40AF' },
  { id: 3, time: '7:00', label: 'Turno Mañana', color: '#1D4ED8' },
  { id: 4, time: '8:00', label: 'Turno Media Mañana', color: '#2563EB' },
  { id: 5, time: '9:00', label: 'Turno Medio Día Temprano', color: '#3B82F6' },
  { id: 6, time: '10:00', label: 'Turno Medio Día', color: '#60A5FA' },
  { id: 7, time: '11:00', label: 'Turno Medio Día Tarde', color: '#93C5FD' },
  { id: 8, time: '12:00', label: 'Turno Tarde Temprano', color: '#FBBF24' },
  { id: 9, time: '13:00', label: 'Turno Tarde', color: '#F59E0B' },
  { id: 10, time: '14:00', label: 'Turno Tarde Media', color: '#D97706' },
  { id: 11, time: '15:00', label: 'Turno Tarde', color: '#B45309' },
  { id: 12, time: '15:30', label: 'Turno Tarde Especial', color: '#92400E' },
  { id: 13, time: '16:00', label: 'Turno Noche Temprano', color: '#EF4444' },
  { id: 14, time: '17:00', label: 'Turno Noche', color: '#DC2626' },
  { id: 15, time: '18:00', label: 'Turno Noche Tarde', color: '#B91C1C' }
];

export const SHIFT_ROTATION_ORDER = [
  '5:00', '8:00', '11:00', '14:00', '17:00'
];

export const getNextShift = (currentShift) => {
  const index = SHIFT_ROTATION_ORDER.indexOf(currentShift);
  if (index === -1) return SHIFT_ROTATION_ORDER[0];
  return SHIFT_ROTATION_ORDER[(index + 1) % SHIFT_ROTATION_ORDER.length];
};

export const getPreviousShift = (currentShift) => {
  const index = SHIFT_ROTATION_ORDER.indexOf(currentShift);
  if (index === -1) return SHIFT_ROTATION_ORDER[0];
  return SHIFT_ROTATION_ORDER[(index - 1 + SHIFT_ROTATION_ORDER.length) % SHIFT_ROTATION_ORDER.length];
};

export const calculateWeekShift = (baseShift, weekNumber) => {
  const index = SHIFT_ROTATION_ORDER.indexOf(baseShift);
  if (index === -1) return baseShift;
  const newIndex = (index + weekNumber) % SHIFT_ROTATION_ORDER.length;
  return SHIFT_ROTATION_ORDER[newIndex];
};

export const getShiftColor = (shiftTime) => {
  const shift = SHIFTS.find(s => s.time === shiftTime);
  return shift ? shift.color : '#6B7280';
};

export const getShiftLabel = (shiftTime) => {
  const shift = SHIFTS.find(s => s.time === shiftTime);
  return shift ? shift.label : shiftTime;
};

export const isMainRotationShift = (shiftTime) => {
  return SHIFT_ROTATION_ORDER.includes(shiftTime);
};