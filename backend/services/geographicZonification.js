// services/geographicZonification.js
// Servicio de zonificación geográfica sin necesidad de API de pago

/**
 * Diccionario de vectores geográficos para Bogotá y alrededores
 * Vector SUR: Bosa, Ciudad Bolívar, Soacha
 * Vector NORTE: Usaquén, Suba, Calle 170, Chía, Cajicá
 * Vector OCCIDENTE: Calle 80, Calle 13, Mosquera, Madrid, Facatativá
 */

// Subzonas para agrupar localidades cercanas (optimización de rutas cortas)
const SUBZONAS = {
  // SUR
  'SUR_OESTE': ['ciudad bolívar', 'ciudad bolivar', 'bolivar', 'bolívar', 'bosa'],
  'SUR_CENTRO': ['kennedy', 'tunjuelito', 'puente aranda'],
  'SUR_ESTE': ['rafael uribe uribe', 'rafael uribe', 'uribe uribe', 'san cristóbal', 'san cristobal'],
  'SUR_EXTREMO': ['usme', 'soacha'],

  // NORTE
  'NORTE_CENTRAL': ['barrios unidos', 'barrios unido', 'chapinero', 'teusaquillo'],
  'NORTE_OCCIDENTAL': ['suba'],
  'NORTE_ORIENTAL': ['usaquén', 'usaquen'],
  'NORTE_EXTERNO': ['chía', 'chia', 'cajicá', 'cajica'],

  // OCCIDENTE
  'OCCIDENTE_CERCA': ['fontibón', 'fontibon', 'engativá', 'engativa'],
  'OCCIDENTE_MEDIO': ['mosquera', 'funza'],
  'OCCIDENTE_LEJOS': ['madrid', 'facatativá', 'facatativa']
};

const ZONE_VECTORS = {
  SUR: {
    keywords: [
      'bosa',
      'ciudad bolivar',
      'ciudad bolívar',
      'bolivar',
      'bolívar',
      'soacha',
      'kennedy',
      'tunjuelito',
      'usme',
      'rafael uribe',
      'uribe uribe',
      'sur',
      'autopista sur',
      'san cristóbal',
      'san cristobal',
      'puente aranda',
      'calle 1',
      'calle 2',
      'calle 3',
      'calle 4',
      'calle 5',
      'calle 6',
      'calle 7',
      'calle 8'
    ],
    name: 'Sur',
    priority: 1
  },
  NORTE: {
    keywords: [
      'usaquen',
      'usaquén',
      'suba',
      'barrios unidos',
      'barrios unido',
      'chapinero',
      'teusaquillo',
      'calle 170',
      'calle 127',
      'calle 147',
      'calle 100',
      'chía',
      'chia',
      'cajicá',
      'cajica',
      'autopista norte',
      'norte',
      'cedritos',
      'toberín',
      'toberin',
      'calle 15',
      'calle 16',
      'calle 17',
      'calle 18',
      'calle 19',
      'calle 20'
    ],
    name: 'Norte',
    priority: 2
  },
  OCCIDENTE: {
    keywords: [
      'calle 80',
      'calle 13',
      'mosquera',
      'madrid',
      'faca',
      'facatativá',
      'facatativa',
      'funza',
      'fontibón',
      'fontibon',
      'engativá',
      'engativa',
      'occidente',
      'autopista medellín',
      'autopista medellin',
      'av 68',
      'avenida 68',
      'boyacá',
      'boyaca'
    ],
    name: 'Occidente',
    priority: 3
  }
};

/**
 * Clasifica una dirección en una zona geográfica basándose en palabras clave
 * @param {string} address - Dirección a clasificar
 * @returns {Object} - { zone: 'SUR'|'NORTE'|'OCCIDENTE'|'NO_CLASIFICADA', confidence: number, matchedKeywords: string[] }
 */
function classifyAddress(address) {
  if (!address || typeof address !== 'string') {
    return {
      zone: 'NO_CLASIFICADA',
      confidence: 0,
      matchedKeywords: [],
      zoneName: 'No Clasificada'
    };
  }

  // Normalizar dirección: minúsculas y eliminar tildes
  const normalizedAddress = address
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const matches = {};

  // Buscar coincidencias en cada zona
  for (const [zoneKey, zoneData] of Object.entries(ZONE_VECTORS)) {
    const matchedKeywords = zoneData.keywords.filter(keyword => {
      const normalizedKeyword = keyword
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return normalizedAddress.includes(normalizedKeyword);
    });

    if (matchedKeywords.length > 0) {
      matches[zoneKey] = {
        zone: zoneKey,
        zoneName: zoneData.name,
        matchedKeywords: matchedKeywords,
        confidence: matchedKeywords.length,
        priority: zoneData.priority
      };
    }
  }

  // Si no hay coincidencias
  if (Object.keys(matches).length === 0) {
    return {
      zone: 'NO_CLASIFICADA',
      confidence: 0,
      matchedKeywords: [],
      zoneName: 'No Clasificada'
    };
  }

  // Si hay múltiples coincidencias, priorizar por número de keywords coincidentes
  const bestMatch = Object.values(matches).reduce((best, current) => {
    if (current.confidence > best.confidence) return current;
    if (current.confidence === best.confidence && current.priority < best.priority) return current;
    return best;
  });

  return bestMatch;
}

/**
 * Agrupa un array de direcciones por zona geográfica
 * @param {Array} addresses - Array de objetos con { id, address, localidad, barrio, ... }
 * @returns {Object} - { SUR: [], NORTE: [], OCCIDENTE: [], NO_CLASIFICADA: [] }
 */
function groupAddressesByZone(addresses) {
  const groups = {
    SUR: [],
    NORTE: [],
    OCCIDENTE: [],
    NO_CLASIFICADA: []
  };

  addresses.forEach(item => {
    let classification;

    // PRIORIDAD 1: Clasificar por localidad (más confiable)
    if (item.localidad) {
      const localidadClassification = classifyAddress(item.localidad);
      if (localidadClassification.zone !== 'NO_CLASIFICADA') {
        classification = {
          ...localidadClassification,
          confidence: localidadClassification.confidence + 10, // Bonus por ser localidad
          matchedKeywords: ['localidad: ' + item.localidad, ...localidadClassification.matchedKeywords]
        };
      }
    }

    // PRIORIDAD 2: Si no se clasificó por localidad, intentar con barrio
    if (!classification && item.barrio) {
      const barrioClassification = classifyAddress(item.barrio);
      if (barrioClassification.zone !== 'NO_CLASIFICADA') {
        classification = {
          ...barrioClassification,
          confidence: barrioClassification.confidence + 5, // Bonus menor por ser barrio
          matchedKeywords: ['barrio: ' + item.barrio, ...barrioClassification.matchedKeywords]
        };
      }
    }

    // PRIORIDAD 3: Si aún no se clasificó, usar dirección
    if (!classification) {
      classification = classifyAddress(item.address);
    }

    groups[classification.zone].push({
      ...item,
      zone: classification.zone,
      zoneName: classification.zoneName,
      zoneConfidence: classification.confidence,
      matchedKeywords: classification.matchedKeywords
    });
  });

  return groups;
}

/**
 * Calcula distancia aproximada entre dos puntos usando coordenadas
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lon1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lon2 - Longitud punto 2
 * @returns {number} - Distancia en kilómetros
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Obtiene coordenadas aproximadas del centro de cada zona
 * @param {string} zone - Nombre de la zona
 * @returns {Object} - { lat, lng }
 */
function getZoneCenter(zone) {
  const centers = {
    SUR: { lat: 4.5772, lng: -74.2166 }, // Soacha
    NORTE: { lat: 4.7360, lng: -74.0319 }, // Usaquén
    OCCIDENTE: { lat: 4.6988, lng: -74.1470 }, // Fontibón
    NO_CLASIFICADA: { lat: 4.6097, lng: -74.0817 } // Centro Bogotá
  };
  return centers[zone] || centers.NO_CLASIFICADA;
}

/**
 * Ordena direcciones dentro de una zona por cercanía
 * Usa un algoritmo de vecino más cercano simplificado
 * @param {Array} addresses - Array de direcciones con coordenadas
 * @param {boolean} reverseOrder - Si es true, ordena de cerca a lejos (PM), si es false de lejos a cerca (AM)
 * @returns {Array} - Direcciones ordenadas
 */
// Ranking de distancia aproximada desde RTVC (en km estimados)
const LOCALITY_DISTANCE = {
  // NORTE (cercanos a lejanos)
  'barrios unidos': 3,
  'barrios unido': 3,
  'chapinero': 4,
  'teusaquillo': 2,
  'suba': 12,
  'usaquén': 10,
  'chía': 25,
  'chia': 25,
  'cajicá': 35,
  'cajica': 35,

  // OCCIDENTE (cercanos a lejanos)
  'fontibón': 10,
  'fontibon': 10,
  'engativá': 8,
  'engativa': 8,
  'mosquera': 18,
  'mosquera, cundinamarca': 18,
  'madrid': 25,
  'madrid cundinamarca': 25,
  'funza': 20,

  // SUR (cercanos a lejanos)
  'puente aranda': 5,
  'antonio nariño': 4,
  'antonio narino': 4,
  'tunjuelito': 8,
  'rafael uribe uribe': 7,
  'san cristóbal': 9,
  'san cristobal': 9,
  'kennedy': 9,
  'bosa': 14,
  'ciudad bolívar': 16,
  'ciudad bolivar': 16,
  'soacha': 20,
  'usme': 18
};

function sortAddressesByProximity(addresses, reverseOrder = false) {
  if (!addresses || addresses.length === 0) return [];
  if (addresses.length === 1) return addresses;

  // Si no tienen coordenadas, usar ranking de localidad
  if (!addresses[0].latitude || !addresses[0].longitude) {
    const sorted = [...addresses].sort((a, b) => {
      const locA = (a.localidad || a.barrio || '').toLowerCase();
      const locB = (b.localidad || b.barrio || '').toLowerCase();

      const distA = LOCALITY_DISTANCE[locA] || 50; // Desconocidas al final
      const distB = LOCALITY_DISTANCE[locB] || 50;

      // reverseOrder = true para PM (llevar): de cerca a lejos
      // reverseOrder = false para AM (recoger): de lejos a cerca
      return reverseOrder ? (distA - distB) : (distB - distA);
    });

    return sorted;
  }

  const sorted = [];
  const remaining = [...addresses];

  // Punto de inicio: centro de la zona o RTVC (4.6097, -74.0817)
  let currentLat = 4.6097;
  let currentLng = -74.0817;

  while (remaining.length > 0) {
    // Encontrar el punto más cercano al actual
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(
      currentLat,
      currentLng,
      remaining[0].latitude,
      remaining[0].longitude
    );

    for (let i = 1; i < remaining.length; i++) {
      const distance = calculateDistance(
        currentLat,
        currentLng,
        remaining[i].latitude,
        remaining[i].longitude
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    // Mover el punto más cercano a la lista ordenada
    const nearest = remaining.splice(nearestIndex, 1)[0];
    sorted.push(nearest);
    currentLat = nearest.latitude;
    currentLng = nearest.longitude;
  }

  // Para turno PM (17:00-22:00), invertir orden (más cerca primero)
  return reverseOrder ? sorted.reverse() : sorted;
}

/**
 * Valida que una dirección tenga las propiedades necesarias
 * @param {Object} address - Objeto de dirección
 * @returns {boolean}
 */
function isValidAddress(address) {
  return address &&
         typeof address === 'object' &&
         address.address &&
         typeof address.address === 'string';
}

/**
 * Genera estadísticas de zonificación
 * @param {Object} groupedAddresses - Direcciones agrupadas por zona
 * @returns {Object} - Estadísticas
 */
function getZonificationStats(groupedAddresses) {
  const stats = {
    total: 0,
    byZone: {},
    unclassified: 0,
    classificationRate: 0
  };

  for (const [zone, addresses] of Object.entries(groupedAddresses)) {
    const count = addresses.length;
    stats.total += count;
    stats.byZone[zone] = {
      count,
      percentage: 0
    };
    if (zone === 'NO_CLASIFICADA') {
      stats.unclassified = count;
    }
  }

  // Calcular porcentajes
  if (stats.total > 0) {
    for (const zone in stats.byZone) {
      stats.byZone[zone].percentage =
        ((stats.byZone[zone].count / stats.total) * 100).toFixed(1);
    }
    stats.classificationRate =
      (((stats.total - stats.unclassified) / stats.total) * 100).toFixed(1);
  }

  return stats;
}

/**
 * Detecta la subzona de una localidad
 * @param {string} localidad - Localidad a clasificar
 * @returns {string} - Subzona (ej: 'SUR_OESTE', 'NORTE_CENTRAL')
 */
function getSubzona(localidad) {
  if (!localidad) return null;

  const loc = localidad.toLowerCase();

  for (const [subzona, keywords] of Object.entries(SUBZONAS)) {
    if (keywords.some(keyword => loc.includes(keyword))) {
      return subzona;
    }
  }

  return null;
}

/**
 * Calcula tiempo aproximado de recorrido para una ruta
 * @param {Array} passengers - Array de pasajeros con localidad
 * @returns {number} - Tiempo estimado en minutos
 */
function calculateRouteTime(passengers) {
  if (!passengers || passengers.length === 0) return 0;

  const TIEMPO_POR_PARADA = 3; // 3 minutos por parada (recoger persona)
  const VELOCIDAD_PROMEDIO = 25; // km/h en Bogotá con tráfico

  let tiempoTotal = 0;

  // Tiempo de paradas
  tiempoTotal += passengers.length * TIEMPO_POR_PARADA;

  // Tiempo de recorrido entre localidades
  for (let i = 0; i < passengers.length - 1; i++) {
    const loc1 = (passengers[i].localidad || passengers[i].barrio || '').toLowerCase();
    const loc2 = (passengers[i + 1].localidad || passengers[i + 1].barrio || '').toLowerCase();

    const dist1 = LOCALITY_DISTANCE[loc1] || 10;
    const dist2 = LOCALITY_DISTANCE[loc2] || 10;

    // Distancia aproximada entre dos puntos
    const distanciaEntre = Math.abs(dist2 - dist1) * 0.8; // Factor de corrección
    const tiempoRecorrido = (distanciaEntre / VELOCIDAD_PROMEDIO) * 60; // Convertir a minutos

    tiempoTotal += tiempoRecorrido;
  }

  // Agregar tiempo desde/hacia RTVC
  const primeraLoc = (passengers[0].localidad || passengers[0].barrio || '').toLowerCase();
  const distanciaRTVC = LOCALITY_DISTANCE[primeraLoc] || 10;
  tiempoTotal += (distanciaRTVC / VELOCIDAD_PROMEDIO) * 60;

  return Math.round(tiempoTotal);
}

module.exports = {
  ZONE_VECTORS,
  SUBZONAS,
  classifyAddress,
  groupAddressesByZone,
  calculateDistance,
  getZoneCenter,
  sortAddressesByProximity,
  isValidAddress,
  getZonificationStats,
  getSubzona,
  calculateRouteTime
};
