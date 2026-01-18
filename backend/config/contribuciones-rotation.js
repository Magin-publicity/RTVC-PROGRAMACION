// Configuración de rotación semanal para CONTRIBUCIONES
// 3 turnos rotativos:
// - Turno 1: 05:00 - 11:00
// - Turno 2: 11:00 - 17:00
// - Turno 3: 17:00 - 22:00

const CONTRIBUCIONES_ROTATION = {
  shifts: [
    { id: 1, start: '05:00', end: '11:00', label: '05:00-11:00' },
    { id: 2, start: '11:00', end: '17:00', label: '11:00-17:00' },
    { id: 3, start: '17:00', end: '22:00', label: '17:00-22:00' }
  ],
  personnel: [
    { id: 91, name: 'Adrian Contreras' },
    { id: 93, name: 'Carolina Benavides' },
    { id: 92, name: 'Michael Torres' }
  ],
  // Orden de rotación: cada semana rota al siguiente turno
  // Semana 1: Adrian->Turno1, Carolina->Turno2, Michael->Turno3
  // Semana 2: Adrian->Turno2, Carolina->Turno3, Michael->Turno1
  // Semana 3: Adrian->Turno3, Carolina->Turno1, Michael->Turno2
  // Semana 4: Adrian->Turno1, Carolina->Turno2, Michael->Turno3 (se repite)
  getShiftForWeek(personIndex, weekNumber) {
    // weekNumber: 1-4 (ciclo de 4 semanas)
    // personIndex: 0, 1, 2
    const shiftIndex = (personIndex + weekNumber - 1) % 3;
    return this.shifts[shiftIndex];
  }
};

module.exports = { CONTRIBUCIONES_ROTATION };
