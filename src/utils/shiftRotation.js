// src/utils/shiftRotation.js
import { SHIFT_ROTATION_ORDER, calculateWeekShift } from '../data/shifts';
import { getWeekNumber } from './dateUtils';

export const rotateShiftsForWeek = (personnel, targetDate) => {
  const weekNum = getWeekNumber(targetDate);
  
  return personnel.map(person => ({
    ...person,
    weekShift: calculateWeekShift(person.current_shift, weekNum)
  }));
};

export const rotateShiftsForNextWeek = (personnel) => {
  return personnel.map(person => ({
    ...person,
    current_shift: getNextShift(person.current_shift)
  }));
};

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

export const getShiftForDate = (person, date) => {
  const weekNum = getWeekNumber(date);
  return calculateWeekShift(person.current_shift, weekNum);
};

export const updateShiftRotations = (personnel, weeksToRotate) => {
  return personnel.map(person => {
    let newShift = person.current_shift;
    for (let i = 0; i < weeksToRotate; i++) {
      newShift = getNextShift(newShift);
    }
    return {
      ...person,
      current_shift: newShift
    };
  });
};

export const resetShiftRotations = (personnel, baseShifts) => {
  return personnel.map(person => {
    const baseShift = baseShifts[person.id];
    return {
      ...person,
      current_shift: baseShift || person.current_shift
    };
  });
};

export const getRotationCycle = (startShift) => {
  const index = SHIFT_ROTATION_ORDER.indexOf(startShift);
  if (index === -1) return SHIFT_ROTATION_ORDER;
  
  const cycle = [];
  for (let i = 0; i < SHIFT_ROTATION_ORDER.length; i++) {
    const shiftIndex = (index + i) % SHIFT_ROTATION_ORDER.length;
    cycle.push(SHIFT_ROTATION_ORDER[shiftIndex]);
  }
  return cycle;
};

export const validateShiftRotation = (personnel) => {
  const errors = [];
  
  personnel.forEach(person => {
    if (!SHIFT_ROTATION_ORDER.includes(person.current_shift)) {
      errors.push({
        person: person.name,
        shift: person.current_shift,
        message: `El turno ${person.current_shift} no está en el ciclo de rotación`
      });
    }
  });
  
  return { valid: errors.length === 0, errors };
};