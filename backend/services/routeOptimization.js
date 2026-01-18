// services/routeOptimization.js
// Motor de optimización de rutas sin API de pago

const {
  groupAddressesByZone,
  sortAddressesByProximity,
  calculateDistance,
  getZonificationStats,
  getSubzona,
  calculateRouteTime
} = require('./geographicZonification');

const MAX_PASSENGERS_PER_VEHICLE = 4;
const MAX_ROUTE_DURATION_MINUTES = 60;
const AVERAGE_SPEED_KM_H = 30; // Velocidad promedio en Bogotá

/**
 * Optimiza rutas para un turno específico
 * @param {Array} personnel - Array de personal con direcciones
 * @param {string} shiftType - 'AM' (05:00) o 'PM' (17:00-22:00)
 * @param {Array} availableVehicles - Vehículos disponibles (OPCIONAL - puede ser [])
 * @returns {Object} - Rutas optimizadas
 */
function optimizeRoutes(personnel, shiftType, availableVehicles = []) {
  // Filtrar solo personal que necesita ruta (estado 'RUTA')
  const personnelNeedingRoute = personnel.filter(p => {
    const mode = (p.transport_state || p.transport_mode || '').toUpperCase();
    return mode === 'RUTA';
  });

  if (personnelNeedingRoute.length === 0) {
    return {
      routes: [],
      stats: {
        totalPersonnel: 0,
        personnelWithRoute: 0,
        personnelOwn: personnel.filter(p => {
          const mode = (p.transport_state || p.transport_mode || '').toUpperCase();
          return mode === 'PROPIO';
        }).length,
        totalVehicles: 0,
        unclassifiedAddresses: [],
        zonification: {}
      }
    };
  }

  // Convertir personal a formato de direcciones
  const addresses = personnelNeedingRoute.map(p => ({
    id: p.id,
    personnelId: p.id,
    name: p.name,
    address: p.address,
    barrio: p.barrio,
    localidad: p.localidad,
    latitude: p.latitude,
    longitude: p.longitude,
    phone: p.phone,
    transport_state: p.transport_state
  }));

  // Agrupar por zona geográfica
  const groupedByZone = groupAddressesByZone(addresses);
  const zonificationStats = getZonificationStats(groupedByZone);

  // Generar rutas por zona
  const routes = [];
  let routeNumber = 1;

  // Orden de zonificación basado en el turno
  // AM (05:00): Recoger de lejos a cerca (Sur -> Norte -> Occidente)
  // PM (17:00-22:00): Llevar de cerca a lejos (Occidente -> Norte -> Sur)
  const zoneOrder = shiftType === 'AM'
    ? ['SUR', 'NORTE', 'OCCIDENTE']
    : ['OCCIDENTE', 'NORTE', 'SUR'];

  for (const zone of zoneOrder) {
    const zoneAddresses = groupedByZone[zone];

    if (zoneAddresses.length === 0) continue;

    // OPTIMIZACIÓN POR SUBZONAS: Agrupar por subzonas (localidades cercanas)
    // Esto reduce distancias manteniendo rutas cortas
    const bySubzona = {};
    zoneAddresses.forEach(addr => {
      const subzona = getSubzona(addr.localidad || addr.barrio) || 'OTROS';
      if (!bySubzona[subzona]) {
        bySubzona[subzona] = [];
      }
      bySubzona[subzona].push(addr);
    });

    // Crear rutas por subzona priorizando trayectos cortos
    const vehicleGroups = [];
    const MAX_PASSENGERS_CORTO = 3;
    const MIN_PASSENGERS = 2; // Mínimo 2 personas por ruta

    // Primero: procesar subzonas grandes (>=3 personas)
    const subzonaEntries = Object.entries(bySubzona).sort((a, b) => b[1].length - a[1].length);
    const smallSubzonas = []; // Subzonas pequeñas para combinar

    subzonaEntries.forEach(([subzona, addresses]) => {
      const sorted = sortAddressesByProximity(addresses, shiftType === 'PM');

      if (sorted.length >= 3) {
        // Subzona grande: dividir inteligentemente para evitar rutas de 1 persona
        const remainder = sorted.length % MAX_PASSENGERS_CORTO;

        if (remainder === 1 && sorted.length > 3) {
          // Si sobra 1, hacer la penúltima ruta de 2 y la última de 2
          // Ej: 4 personas = [2, 2] en lugar de [3, 1]
          const mainGroups = Math.floor((sorted.length - 4) / MAX_PASSENGERS_CORTO);
          let idx = 0;

          // Crear rutas normales de 3
          for (let i = 0; i < mainGroups; i++) {
            vehicleGroups.push(sorted.slice(idx, idx + MAX_PASSENGERS_CORTO));
            idx += MAX_PASSENGERS_CORTO;
          }

          // Últimas 4 personas: dividir en 2 + 2
          if (sorted.length >= 4) {
            vehicleGroups.push(sorted.slice(idx, idx + 2));
            vehicleGroups.push(sorted.slice(idx + 2));
          } else {
            vehicleGroups.push(sorted.slice(idx));
          }
        } else {
          // División normal
          for (let i = 0; i < sorted.length; i += MAX_PASSENGERS_CORTO) {
            vehicleGroups.push(sorted.slice(i, i + MAX_PASSENGERS_CORTO));
          }
        }
      } else {
        // Subzona pequeña: guardar para combinar
        smallSubzonas.push(...sorted);
      }
    });

    // Combinar subzonas pequeñas en rutas de 2-3 personas
    for (let i = 0; i < smallSubzonas.length; i += MAX_PASSENGERS_CORTO) {
      const group = smallSubzonas.slice(i, i + MAX_PASSENGERS_CORTO);
      if (group.length >= MIN_PASSENGERS || i + MAX_PASSENGERS_CORTO >= smallSubzonas.length) {
        // Solo agregar si tiene al menos 2 personas, o si es el último grupo
        vehicleGroups.push(group);
      }
    }

    // Crear rutas para cada vehículo (SIN asignar vehículo aún)
    vehicleGroups.forEach((group, index) => {
      const route = {
        routeNumber,
        zone,
        zoneName: group[0].zoneName,
        // Vehículo se asignará DESPUÉS manualmente
        vehicle: null,
        vehicleAssigned: false,
        passengers: group.map((p, idx) => ({
          order: idx + 1,
          personnelId: p.personnelId,
          name: p.name,
          address: p.address,
          barrio: p.barrio,
          localidad: p.localidad,
          phone: p.phone,
          latitude: p.latitude,
          longitude: p.longitude
        })),
        stats: calculateRouteStats(group, shiftType),
        shiftType
      };

      routes.push(route);
      routeNumber++;
    });
  }

  // Direcciones no clasificadas (alerta)
  const unclassifiedAddresses = groupedByZone.NO_CLASIFICADA.map(a => ({
    personnelId: a.personnelId,
    name: a.name,
    address: a.address
  }));

  return {
    routes,
    stats: {
      totalPersonnel: personnel.length,
      personnelWithRoute: personnelNeedingRoute.length,
      personnelOwn: personnel.filter(p => p.transport_state === 'Propio' || p.transport_state === 'propio').length,
      totalVehicles: routes.length,
      unclassifiedAddresses,
      zonification: zonificationStats
    }
  };
}

/**
 * Calcula estadísticas de una ruta
 * @param {Array} passengers - Pasajeros de la ruta
 * @param {string} shiftType - Tipo de turno
 * @returns {Object} - Estadísticas
 */
function calculateRouteStats(passengers, shiftType) {
  if (!passengers || passengers.length === 0) {
    return {
      totalDistance: 0,
      estimatedDuration: 0,
      passengerCount: 0
    };
  }

  // Calcular distancia total aproximada
  let totalDistance = 0;

  // Punto inicial: RTVC
  const rtvcLat = 4.6097;
  const rtvcLng = -74.0817;

  if (passengers[0].latitude && passengers[0].longitude) {
    // Distancia RTVC al primer punto
    totalDistance += calculateDistance(
      rtvcLat,
      rtvcLng,
      passengers[0].latitude,
      passengers[0].longitude
    );

    // Distancias entre puntos consecutivos
    for (let i = 0; i < passengers.length - 1; i++) {
      if (passengers[i].latitude && passengers[i + 1].latitude) {
        totalDistance += calculateDistance(
          passengers[i].latitude,
          passengers[i].longitude,
          passengers[i + 1].latitude,
          passengers[i + 1].longitude
        );
      }
    }

    // Distancia del último punto a RTVC
    const lastPassenger = passengers[passengers.length - 1];
    if (lastPassenger.latitude) {
      totalDistance += calculateDistance(
        lastPassenger.latitude,
        lastPassenger.longitude,
        rtvcLat,
        rtvcLng
      );
    }
  }

  // Calcular duración estimada con la nueva función más precisa
  const estimatedDuration = calculateRouteTime(passengers);

  return {
    totalDistance: Math.round(totalDistance * 100) / 100, // Redondear a 2 decimales
    estimatedDuration,
    passengerCount: passengers.length,
    exceedsMaxDuration: estimatedDuration > MAX_ROUTE_DURATION_MINUTES
  };
}

/**
 * Recalcula rutas cuando cambia el estado de transporte de personal
 * @param {Array} personnel - Personal completo
 * @param {string} shiftType - Tipo de turno
 * @param {Array} availableVehicles - Vehículos disponibles
 * @returns {Object} - Rutas recalculadas
 */
function recalculateRoutes(personnel, shiftType, availableVehicles) {
  return optimizeRoutes(personnel, shiftType, availableVehicles);
}

/**
 * Valida que las rutas no excedan restricciones
 * @param {Array} routes - Rutas generadas
 * @returns {Object} - Validación con warnings
 */
function validateRoutes(routes) {
  const warnings = [];
  const errors = [];

  routes.forEach(route => {
    // Validar número de pasajeros
    if (route.passengers.length > MAX_PASSENGERS_PER_VEHICLE) {
      errors.push({
        routeNumber: route.routeNumber,
        type: 'MAX_PASSENGERS_EXCEEDED',
        message: `Ruta ${route.routeNumber} tiene ${route.passengers.length} pasajeros (máx ${MAX_PASSENGERS_PER_VEHICLE})`
      });
    }

    // Validar duración
    if (route.stats.exceedsMaxDuration) {
      warnings.push({
        routeNumber: route.routeNumber,
        type: 'DURATION_WARNING',
        message: `Ruta ${route.routeNumber} supera ${MAX_ROUTE_DURATION_MINUTES} minutos (${route.stats.estimatedDuration} min estimados)`
      });
    }

    // Validar que tenga vehículo asignado
    if (!route.vehicle) {
      warnings.push({
        routeNumber: route.routeNumber,
        type: 'NO_VEHICLE_ASSIGNED',
        message: `Ruta ${route.routeNumber} no tiene vehículo asignado`
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Verifica si personal trabajó turno nocturno y necesita alerta de descanso
 * @param {Object} person - Objeto de personal
 * @param {string} currentShiftType - Turno actual ('AM' o 'PM')
 * @param {string} previousShiftType - Turno anterior
 * @returns {boolean}
 */
function checkRestAlert(person, currentShiftType, previousShiftType) {
  // Alerta si trabajó PM (17:00-22:00) y ahora entra AM (05:00)
  // Eso significa solo 7 horas de descanso máximo
  if (previousShiftType === 'PM' && currentShiftType === 'AM') {
    return true;
  }
  return false;
}

/**
 * Genera resumen ejecutivo de las rutas
 * @param {Object} optimizationResult - Resultado de optimizeRoutes
 * @returns {string} - Resumen en texto
 */
function generateRouteSummary(optimizationResult) {
  const { routes, stats } = optimizationResult;

  let summary = `📊 RESUMEN DE RUTAS\n`;
  summary += `${'='.repeat(50)}\n\n`;
  summary += `👥 Personal Total: ${stats.totalPersonnel}\n`;
  summary += `🚐 Personal en Ruta: ${stats.personnelWithRoute}\n`;
  summary += `🚗 Personal Propio: ${stats.personnelOwn}\n`;
  summary += `🚐 Vehículos Necesarios: ${stats.totalVehicles}\n\n`;

  if (stats.zonification && stats.zonification.byZone) {
    summary += `📍 ZONIFICACIÓN:\n`;
    for (const [zone, data] of Object.entries(stats.zonification.byZone)) {
      if (data.count > 0) {
        summary += `   ${zone}: ${data.count} personas (${data.percentage}%)\n`;
      }
    }
    summary += `\n`;
  }

  if (stats.unclassifiedAddresses && stats.unclassifiedAddresses.length > 0) {
    summary += `⚠️  ALERTAS:\n`;
    summary += `   ${stats.unclassifiedAddresses.length} direcciones NO CLASIFICADAS\n\n`;
  }

  routes.forEach(route => {
    summary += `🚐 RUTA ${route.routeNumber} - ${route.zoneName}\n`;
    if (route.vehicle) {
      summary += `   Vehículo: ${route.vehicle.plate} (${route.vehicle.type})\n`;
      if (route.vehicle.driver) {
        summary += `   Conductor: ${route.vehicle.driver}\n`;
      }
    }
    summary += `   Pasajeros: ${route.passengers.length}\n`;
    summary += `   Distancia: ${route.stats.totalDistance} km\n`;
    summary += `   Duración estimada: ${route.stats.estimatedDuration} min\n`;
    route.passengers.forEach(p => {
      summary += `     ${p.order}. ${p.name} - ${p.address}\n`;
    });
    summary += `\n`;
  });

  return summary;
}

module.exports = {
  optimizeRoutes,
  recalculateRoutes,
  calculateRouteStats,
  validateRoutes,
  checkRestAlert,
  generateRouteSummary,
  MAX_PASSENGERS_PER_VEHICLE,
  MAX_ROUTE_DURATION_MINUTES
};
