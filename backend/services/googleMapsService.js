const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

class GoogleMapsService {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
    this.initApiKey();
  }

  async initApiKey() {
    try {
      const result = await pool.query(
        "SELECT config_value FROM routes_configuration WHERE config_key = 'GOOGLE_API_KEY'"
      );
      this.apiKey = result.rows[0]?.config_value || '';
    } catch (error) {
      console.error('Error loading Google API key:', error);
    }
  }

  /**
   * Geocodifica una dirección usando Google Geocoding API
   * Almacena el resultado en cache para reutilización
   */
  async geocodeAddress(address) {
    if (!address || address.trim() === '') {
      throw new Error('Dirección inválida');
    }

    // Verificar cache primero
    try {
      const cached = await pool.query(
        'SELECT * FROM address_geocoding_cache WHERE address = $1',
        [address.trim()]
      );

      if (cached.rows.length > 0) {
        const data = cached.rows[0];
        // Si el cache tiene menos de 30 días, usarlo
        const cacheAge = Date.now() - new Date(data.last_verified).getTime();
        if (cacheAge < 30 * 24 * 60 * 60 * 1000) {
          return {
            formatted_address: data.formatted_address,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            zone: data.zone,
            is_valid: data.is_valid,
            from_cache: true
          };
        }
      }
    } catch (error) {
      console.error('Error checking geocoding cache:', error);
    }

    // Si no hay cache o está desactualizado, llamar a la API
    if (!this.apiKey) {
      throw new Error('Google API Key no configurada');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          address: `${address}, Bogotá, Colombia`,
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        // Guardar como dirección inválida
        await this.saveCachedGeocoding(address, null, null, null, null, false);
        throw new Error(`No se pudo geocodificar la dirección: ${address}`);
      }

      const result = response.data.results[0];
      const location = result.geometry.location;
      const formattedAddress = result.formatted_address;

      // Determinar zona geográfica basada en coordenadas
      const zone = this.determineZone(location.lat, location.lng);

      // Guardar en cache
      await this.saveCachedGeocoding(
        address,
        formattedAddress,
        location.lat,
        location.lng,
        zone,
        true
      );

      return {
        formatted_address: formattedAddress,
        latitude: location.lat,
        longitude: location.lng,
        zone,
        is_valid: true,
        from_cache: false
      };
    } catch (error) {
      console.error('Error geocoding address:', error.message);
      throw error;
    }
  }

  /**
   * Calcula distancia y tiempo entre dos direcciones usando Distance Matrix API
   * Almacena el resultado en cache
   */
  async getDistanceMatrix(origins, destinations) {
    if (!Array.isArray(origins) || !Array.isArray(destinations)) {
      throw new Error('Origins y destinations deben ser arrays');
    }

    // Verificar cache para cada par origen-destino
    const results = [];
    const uncachedPairs = [];

    for (let i = 0; i < origins.length; i++) {
      for (let j = 0; j < destinations.length; j++) {
        const origin = origins[i];
        const destination = destinations[j];

        const cached = await pool.query(
          'SELECT * FROM distance_matrix_cache WHERE origin_address = $1 AND destination_address = $2',
          [origin, destination]
        );

        if (cached.rows.length > 0) {
          const data = cached.rows[0];
          // Cache válido por 7 días
          const cacheAge = Date.now() - new Date(data.last_updated).getTime();
          if (cacheAge < 7 * 24 * 60 * 60 * 1000) {
            results.push({
              origin,
              destination,
              distance_km: parseFloat(data.distance_km),
              duration_minutes: data.duration_minutes,
              from_cache: true
            });
            continue;
          }
        }

        uncachedPairs.push({ origin, destination, originIndex: i, destIndex: j });
      }
    }

    // Si hay pares sin cache, llamar a la API
    if (uncachedPairs.length > 0) {
      if (!this.apiKey) {
        throw new Error('Google API Key no configurada');
      }

      try {
        const uniqueOrigins = [...new Set(uncachedPairs.map(p => p.origin))];
        const uniqueDestinations = [...new Set(uncachedPairs.map(p => p.destination))];

        const response = await axios.get(`${this.baseUrl}/distancematrix/json`, {
          params: {
            origins: uniqueOrigins.join('|'),
            destinations: uniqueDestinations.join('|'),
            mode: 'driving',
            language: 'es',
            key: this.apiKey
          }
        });

        if (response.data.status !== 'OK') {
          throw new Error(`Error en Distance Matrix API: ${response.data.status}`);
        }

        // Procesar resultados
        for (let i = 0; i < response.data.rows.length; i++) {
          for (let j = 0; j < response.data.rows[i].elements.length; j++) {
            const element = response.data.rows[i].elements[j];
            const origin = uniqueOrigins[i];
            const destination = uniqueDestinations[j];

            if (element.status === 'OK') {
              const distanceKm = element.distance.value / 1000;
              const durationMinutes = Math.ceil(element.duration.value / 60);

              // Guardar en cache
              await this.saveCachedDistance(origin, destination, distanceKm, durationMinutes);

              results.push({
                origin,
                destination,
                distance_km: distanceKm,
                duration_minutes: durationMinutes,
                from_cache: false
              });
            }
          }
        }
      } catch (error) {
        console.error('Error calling Distance Matrix API:', error.message);
        throw error;
      }
    }

    return results;
  }

  /**
   * Determina la zona geográfica de Bogotá basada en coordenadas
   */
  determineZone(lat, lng) {
    // Coordenadas aproximadas del centro de Bogotá
    const centerLat = 4.6097;
    const centerLng = -74.0817;

    // Determinar zona basada en posición relativa al centro
    if (lat < centerLat - 0.05) {
      return 'SUR';
    } else if (lat > centerLat + 0.05) {
      return 'NORTE';
    } else if (lng < centerLng - 0.05) {
      return 'OCCIDENTE';
    } else if (lng > centerLng + 0.05) {
      return 'ORIENTE';
    } else {
      return 'CENTRO';
    }
  }

  /**
   * Guarda geocodificación en cache
   */
  async saveCachedGeocoding(address, formattedAddress, lat, lng, zone, isValid) {
    try {
      await pool.query(
        `INSERT INTO address_geocoding_cache
         (address, formatted_address, latitude, longitude, zone, is_valid, last_verified)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (address)
         DO UPDATE SET
           formatted_address = $2,
           latitude = $3,
           longitude = $4,
           zone = $5,
           is_valid = $6,
           last_verified = NOW()`,
        [address, formattedAddress, lat, lng, zone, isValid]
      );
    } catch (error) {
      console.error('Error saving geocoding cache:', error);
    }
  }

  /**
   * Guarda distancia en cache
   */
  async saveCachedDistance(origin, destination, distanceKm, durationMinutes) {
    try {
      await pool.query(
        `INSERT INTO distance_matrix_cache
         (origin_address, destination_address, distance_km, duration_minutes, last_updated)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (origin_address, destination_address)
         DO UPDATE SET
           distance_km = $3,
           duration_minutes = $4,
           last_updated = NOW()`,
        [origin, destination, distanceKm, durationMinutes]
      );
    } catch (error) {
      console.error('Error saving distance cache:', error);
    }
  }

  /**
   * Valida que una dirección existe y es válida
   */
  async validateAddress(address) {
    try {
      const result = await this.geocodeAddress(address);
      return {
        is_valid: result.is_valid,
        formatted_address: result.formatted_address,
        zone: result.zone
      };
    } catch (error) {
      return {
        is_valid: false,
        error: error.message
      };
    }
  }
}

module.exports = new GoogleMapsService();
