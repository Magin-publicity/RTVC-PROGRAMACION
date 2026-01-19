// src/utils/sampleAnalyticsData.js

/**
 * Datos de muestra para probar el sistema de analítica
 * Reemplaza estos datos con llamadas reales a tus servicios
 */

export const getSampleWeekData = (startDate, endDate) => {
  return {
    routes: [
      {
        route_id: 1,
        vehicle_plate: 'BCD-890',
        total_passengers: 3,
        zone: 'SUR',
        shift_type: 'AM',
        date: startDate,
        passengers: [
          { name: 'Andres Vargas', expected_shift: 'AM' },
          { name: 'Kevin Alejandro Lerma', expected_shift: 'AM' },
          { name: 'Maria Jose Escobar', expected_shift: 'AM' }
        ]
      },
      {
        route_id: 2,
        vehicle_plate: 'PQR-678',
        total_passengers: 3,
        zone: 'SUR',
        shift_type: 'AM',
        date: startDate,
        passengers: [
          { name: 'Oscar González', expected_shift: 'AM' },
          { name: 'Jaime Rueda', expected_shift: 'AM' },
          { name: 'Alejandro La Torre', expected_shift: 'PM' } // Excepción: turno incorrecto
        ]
      },
      {
        route_id: 3,
        vehicle_plate: 'BCD-890',
        total_passengers: 3,
        zone: 'SUR',
        shift_type: 'AM',
        date: new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0],
        passengers: [
          { name: 'Carlos Orlando Espinel', expected_shift: 'AM' },
          { name: 'John Forero', expected_shift: 'AM' },
          { name: 'Leonardo Castro', expected_shift: 'AM' }
        ]
      },
      {
        route_id: 4,
        vehicle_plate: 'XYZ-123',
        total_passengers: 3,
        zone: 'SUR',
        shift_type: 'AM',
        date: new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0],
        passengers: [
          { name: 'Luis Betancourt', expected_shift: 'AM' },
          { name: 'Angela Cabezas', expected_shift: 'AM' },
          { name: 'John Loaiza', expected_shift: 'AM' }
        ]
      },
      {
        route_id: 5,
        vehicle_plate: 'PQR-678',
        total_passengers: 2,
        zone: 'SUR',
        shift_type: 'AM',
        date: new Date(new Date(startDate).getTime() + 172800000).toISOString().split('T')[0],
        passengers: [
          { name: 'Leidy Salazar', expected_shift: 'AM' },
          { name: 'Henry Villarraga', expected_shift: 'AM' }
        ]
      },
      {
        route_id: 6,
        vehicle_plate: 'ABC-456',
        total_passengers: 3,
        zone: 'NORTE',
        shift_type: 'AM',
        date: new Date(new Date(startDate).getTime() + 259200000).toISOString().split('T')[0],
        passengers: [
          { name: 'Andrés Osorio', expected_shift: 'AM' },
          { name: 'Carmen Mandinga', expected_shift: 'AM' },
          { name: 'Camila Bradford', expected_shift: 'AM' }
        ]
      },
      {
        route_id: 7,
        vehicle_plate: 'BCD-890',
        total_passengers: 2,
        zone: 'NORTE',
        shift_type: 'PM',
        date: new Date(new Date(startDate).getTime() + 345600000).toISOString().split('T')[0],
        passengers: [
          { name: 'Jairo Gómez', expected_shift: 'PM' },
          { name: 'Luis Fajardo', expected_shift: 'PM' }
        ]
      },
      {
        route_id: 8,
        vehicle_plate: 'XYZ-123',
        total_passengers: 2,
        zone: 'NORTE',
        shift_type: 'PM',
        date: new Date(new Date(startDate).getTime() + 432000000).toISOString().split('T')[0],
        passengers: [
          { name: 'Carolay Morales', expected_shift: 'PM' },
          { name: 'Sofia Fajardo', expected_shift: 'PM' }
        ]
      },
      {
        route_id: 9,
        vehicle_plate: 'ABC-456',
        total_passengers: 3,
        zone: 'NORTE',
        shift_type: 'PM',
        date: new Date(new Date(startDate).getTime() + 518400000).toISOString().split('T')[0],
        passengers: [
          { name: 'Leoniris Moya', expected_shift: 'PM' },
          { name: 'Michael Torres', expected_shift: 'PM' },
          { name: 'Guillermo Solarte', expected_shift: 'AM' } // Excepción: turno incorrecto
        ]
      },
      {
        route_id: 10,
        vehicle_plate: 'PQR-678',
        total_passengers: 3,
        zone: 'OCCIDENTE',
        shift_type: 'PM',
        date: new Date(new Date(startDate).getTime() + 604800000).toISOString().split('T')[0],
        passengers: [
          { name: 'Johanna Contreras', expected_shift: 'PM' },
          { name: 'Ana Villalba', expected_shift: 'PM' },
          { name: 'Angel Zapata', expected_shift: 'PM' }
        ]
      }
    ],

    meals: [
      // Día 1
      { id: 1, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: startDate },
      { id: 2, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: startDate },
      { id: 3, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: startDate },
      { id: 4, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: startDate },
      { id: 5, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: startDate },
      { id: 6, service_type: 'ALMUERZO', status: 'CONFIRMADO', date: startDate },
      { id: 7, service_type: 'ALMUERZO', status: 'CONFIRMADO', date: startDate },
      { id: 8, service_type: 'ALMUERZO', status: 'CONFIRMADO', date: startDate },
      { id: 9, service_type: 'ALMUERZO', status: 'CANCELADO', date: startDate },
      { id: 10, service_type: 'CENA', status: 'CONFIRMADO', date: startDate },

      // Día 2
      { id: 11, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] },
      { id: 12, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] },
      { id: 13, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] },
      { id: 14, service_type: 'ALMUERZO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] },
      { id: 15, service_type: 'ALMUERZO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] },
      { id: 16, service_type: 'ALMUERZO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] },
      { id: 17, service_type: 'CENA', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] },
      { id: 18, service_type: 'CENA', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] },

      // Día 3
      { id: 19, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 172800000).toISOString().split('T')[0] },
      { id: 20, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 172800000).toISOString().split('T')[0] },
      { id: 21, service_type: 'ALMUERZO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 172800000).toISOString().split('T')[0] },
      { id: 22, service_type: 'ALMUERZO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 172800000).toISOString().split('T')[0] },
      { id: 23, service_type: 'ALMUERZO', status: 'PENDIENTE', date: new Date(new Date(startDate).getTime() + 172800000).toISOString().split('T')[0] },
      { id: 24, service_type: 'CENA', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 172800000).toISOString().split('T')[0] },

      // Día 4
      { id: 25, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 259200000).toISOString().split('T')[0] },
      { id: 26, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 259200000).toISOString().split('T')[0] },
      { id: 27, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 259200000).toISOString().split('T')[0] },
      { id: 28, service_type: 'ALMUERZO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 259200000).toISOString().split('T')[0] },
      { id: 29, service_type: 'ALMUERZO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 259200000).toISOString().split('T')[0] },
      { id: 30, service_type: 'CENA', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 259200000).toISOString().split('T')[0] },
      { id: 31, service_type: 'CENA', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 259200000).toISOString().split('T')[0] },

      // Día 5
      { id: 32, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 345600000).toISOString().split('T')[0] },
      { id: 33, service_type: 'DESAYUNO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 345600000).toISOString().split('T')[0] },
      { id: 34, service_type: 'ALMUERZO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 345600000).toISOString().split('T')[0] },
      { id: 35, service_type: 'ALMUERZO', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 345600000).toISOString().split('T')[0] },
      { id: 36, service_type: 'CENA', status: 'CONFIRMADO', date: new Date(new Date(startDate).getTime() + 345600000).toISOString().split('T')[0] },
      { id: 37, service_type: 'CENA', status: 'CANCELADO', date: new Date(new Date(startDate).getTime() + 345600000).toISOString().split('T')[0] }
    ],

    equipment: [
      { id: 1, type: 'LiveU', hours: 4.5, date: startDate },
      { id: 2, type: 'LiveU', hours: 6.2, date: startDate },
      { id: 3, type: 'Cámara', hours: 8.0, date: startDate },
      { id: 4, type: 'LiveU', hours: 3.8, date: new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] },
      { id: 5, type: 'LiveU', hours: 5.5, date: new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] },
      { id: 6, type: 'Cámara', hours: 7.2, date: new Date(new Date(startDate).getTime() + 172800000).toISOString().split('T')[0] },
      { id: 7, type: 'LiveU', hours: 4.0, date: new Date(new Date(startDate).getTime() + 259200000).toISOString().split('T')[0] },
      { id: 8, type: 'LiveU', hours: 6.8, date: new Date(new Date(startDate).getTime() + 345600000).toISOString().split('T')[0] },
      { id: 9, type: 'Cámara', hours: 9.5, date: new Date(new Date(startDate).getTime() + 432000000).toISOString().split('T')[0] },
      { id: 10, type: 'LiveU', hours: 5.2, date: new Date(new Date(startDate).getTime() + 518400000).toISOString().split('T')[0] }
    ]
  };
};
