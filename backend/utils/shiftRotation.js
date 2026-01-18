// backend/utils/shiftRotation.js

const shiftRotation = {
  SHIFT_TYPES: {
    MORNING: '6:00 AM - 2:00 PM',
    AFTERNOON: '2:00 PM - 10:00 PM',
    NIGHT: '10:00 PM - 6:00 AM',
    FULL_DAY: '6:00 AM - 6:00 PM',
    OFF: 'Descanso'
  },

  ROTATION_PATTERNS: {
    STANDARD: ['MORNING', 'AFTERNOON', 'NIGHT', 'OFF'],
    DAY_ONLY: ['MORNING', 'AFTERNOON', 'OFF'],
    CONTINUOUS: ['MORNING', 'AFTERNOON', 'NIGHT']
  },

  generateRotation(startDate, days, pattern = 'STANDARD') {
    const rotation = [];
    const patternArray = this.ROTATION_PATTERNS[pattern];

    for (let i = 0; i < days; i++) {
      const shiftType = patternArray[i % patternArray.length];
      rotation.push({
        day: i + 1,
        shift: this.SHIFT_TYPES[shiftType],
        type: shiftType
      });
    }

    return rotation;
  },

  getNextShift(currentShift, pattern = 'STANDARD') {
    const patternArray = this.ROTATION_PATTERNS[pattern];
    const currentIndex = patternArray.indexOf(currentShift);
    const nextIndex = (currentIndex + 1) % patternArray.length;
    return patternArray[nextIndex];
  },

  validateShift(shiftTime) {
    return Object.values(this.SHIFT_TYPES).includes(shiftTime);
  },

  getShiftHours(shiftType) {
    const hours = {
      MORNING: 8,
      AFTERNOON: 8,
      NIGHT: 8,
      FULL_DAY: 12,
      OFF: 0
    };
    return hours[shiftType] || 0;
  }
};

module.exports = shiftRotation;
