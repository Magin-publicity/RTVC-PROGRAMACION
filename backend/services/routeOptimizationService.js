const { Pool } = require('pg');
const googleMapsService = require('./googleMapsService');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

class RouteOptimizationService {
  constructor() {
    this.MAX_PASSENGERS_PER_VEHICLE = 4;
    this.MAX_ROUTE_DURATION_MINUTES = 60;
    this.RTVC_ADDRESS = 'Cra 45 # 26-33, Bogotá, Colombia';
    this.loadConfiguration();
  }

  async loadConfiguration() {
    try {
      const config = await pool.query('SELECT * FROM routes_configuration');
      config.rows.forEach(row => {
        switch (row.config_key) {
          case 'MAX_PASSENGERS_PER_VEHICLE':
            this.MAX_PASSENGERS_PER_VEHICLE = parseInt(row.config_value);
            break;
          case 'MAX_ROUTE_DURATION_MINUTES':
            this.MAX_ROUTE_DURATION_MINUTES = parseInt(row.config_value);
            break;
          case 'RTVC_ADDRESS':
            this.RTVC_ADDRESS = row.config_value;
            break;
        }
      });
    } catch (error) {
      console.error('Error loading route configuration:', error);
    }
  }

  /**
   * Optimiza rutas para un día y turno específico
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @param {string} shiftType - 'AM' o 'PM'
   * @returns {Promise<Array>} Array de rutas optimizadas
   */
  async optimizeRoutes(date, shiftType) {
    console.log(`\n🚀 Optimizando rutas para ${date} - Turno ${shiftType}`);

    try {
      // 1. Obtener todas las asignaciones confirmadas que requieren transporte
      const assignments = await pool.query(
        `SELECT * FROM daily_transport_assignments
         WHERE date = $1 AND shift_type = $2 AND transport_mode = 'RUTA'
         AND direccion IS NOT NULL AND direccion != ''
         ORDER BY personnel_name`,
        [date, shiftType]
      );

      if (assignments.rows.length === 0) {
        console.log('No hay pasajeros que requieran transporte en ruta');
        return [];
      }

      console.log(`📊 Total de pasajeros a transportar: ${assignments.rows.length}`);

      // 2. Geocodificar todas las direcciones
      const passengersList = await this.geocodePassengers(assignments.rows);

      // 3. Validar direcciones y generar alertas
      await this.validateAddresses(passengersList, date, shiftType);

      // 4. Agrupar por zona geográfica
      const groupedByZone = this.groupByZone(passengersList);

      console.log('\n📍 Distribución por zonas:');
      Object.keys(groupedByZone).forEach(zone => {
        console.log(`   ${zone}: ${groupedByZone[zone].length} pasajeros`);
      });

      // 5. Crear rutas optimizadas para cada zona
      const routes = [];
      let routeNumber = 1;

      for (const zone of Object.keys(groupedByZone)) {
        const passengers = groupedByZone[zone];
        const zoneRoutes = await this.createOptimizedRoutesForZone(
          passengers,
          zone,
          shiftType,
          routeNumber,
          date
        );
        routes.push(...zoneRoutes);
        routeNumber += zoneRoutes.length;
      }

      console.log(`\n✅ Total de rutas creadas: ${routes.length}`);

      // 6. Guardar rutas en la base de datos
      await this.saveRoutesToDatabase(routes, date, shiftType);

      return routes;
    } catch (error) {
      console.error('Error optimizando rutas:', error);
      throw error;
    }
  }

  /**
   * Geocodifica las direcciones de todos los pasajeros
   */
  async geocodePassengers(passengers) {
    const geocodedPassengers = [];

    for (const passenger of passengers) {
      try {
        const geocoded = await googleMapsService.geocodeAddress(passenger.direccion);
        geocodedPassengers.push({
          ...passenger,
          geocoded: geocoded,
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          zone: geocoded.zone
        });
      } catch (error) {
        console.warn(`⚠️  No se pudo geocodificar: ${passenger.direccion} (${passenger.personnel_name})`);
        geocodedPassengers.push({
          ...passenger,
          geocoded: null,
          latitude: null,
          longitude: null,
          zone: 'UNKNOWN'
        });
      }
    }

    return geocodedPassengers;
  }

  /**
   * Valida direcciones y genera alertas para direcciones inválidas
   */
  async validateAddresses(passengers, date, shiftType) {
    for (const passenger of passengers) {
      if (!passenger.geocoded || !passenger.geocoded.is_valid) {
        await pool.query(
          `INSERT INTO route_alerts
           (date, shift_type, alert_type, severity, message, personnel_id, resolved)
           VALUES ($1, $2, 'INVALID_ADDRESS', 'CRITICAL', $3, $4, false)`,
          [
            date,
            shiftType,
            `Dirección inválida para ${passenger.personnel_name}: "${passenger.direccion}"`,
            passenger.personnel_id
          ]
        );
      }
    }
  }

  /**
   * Agrupa pasajeros por zona geográfica
   */
  groupByZone(passengers) {
    const grouped = {};

    passengers.forEach(passenger => {
      const zone = passenger.zone || 'UNKNOWN';
      if (!grouped[zone]) {
        grouped[zone] = [];
      }
      grouped[zone].push(passenger);
    });

    return grouped;
  }

  /**
   * Crea rutas optimizadas para una zona específica
   */
  async createOptimizedRoutesForZone(passengers, zone, shiftType, startingRouteNumber, date) {
    const routes = [];
    const validPassengers = passengers.filter(p => p.latitude && p.longitude);

    if (validPassengers.length === 0) {
      return routes;
    }

    // Dividir en vehículos (máximo 4 pasajeros por vehículo)
    const vehicleGroups = [];
    for (let i = 0; i < validPassengers.length; i += this.MAX_PASSENGERS_PER_VEHICLE) {
      vehicleGroups.push(validPassengers.slice(i, i + this.MAX_PASSENGERS_PER_VEHICLE));
    }

    console.log(`\n🚐 Zona ${zone}: ${vehicleGroups.length} vehículo(s) necesario(s)`);

    // Crear ruta para cada vehículo
    for (let i = 0; i < vehicleGroups.length; i++) {
      const group = vehicleGroups[i];
      const routeNumber = startingRouteNumber + i;

      try {
        const optimizedRoute = await this.optimizeSingleRoute(
          group,
          zone,
          shiftType,
          routeNumber,
          date
        );

        routes.push(optimizedRoute);
      } catch (error) {
        console.error(`Error optimizando ruta ${routeNumber}:`, error);
      }
    }

    return routes;
  }

  /**
   * Optimiza una ruta individual usando Google Distance Matrix
   */
  async optimizeSingleRoute(passengers, zone, shiftType, routeNumber, date) {
    console.log(`   📍 Ruta ${routeNumber}: ${passengers.length} pasajero(s)`);

    // Calcular distancias desde/hacia RTVC
    const addresses = passengers.map(p => p.direccion);

    try {
      // Para turno AM: desde las casas a RTVC (recoger del más lejano al más cercano)
      // Para turno PM: desde RTVC a las casas (entregar del más cercano al más lejano)

      const origins = shiftType === 'AM' ? addresses : [this.RTVC_ADDRESS];
      const destinations = shiftType === 'AM' ? [this.RTVC_ADDRESS] : addresses;

      const distanceMatrix = await googleMapsService.getDistanceMatrix(origins, destinations);

      // Ordenar pasajeros por distancia
      const passengersWithDistance = passengers.map((p, index) => {
        const distanceData = distanceMatrix.find(d =>
          (shiftType === 'AM' && d.origin === p.direccion) ||
          (shiftType === 'PM' && d.destination === p.direccion)
        );

        return {
          ...p,
          distance_km: distanceData?.distance_km || 0,
          duration_minutes: distanceData?.duration_minutes || 0
        };
      });

      // AM: ordenar de más lejano a más cercano
      // PM: ordenar de más cercano a más lejano
      passengersWithDistance.sort((a, b) =>
        shiftType === 'AM'
          ? b.distance_km - a.distance_km
          : a.distance_km - b.distance_km
      );

      // Asignar orden de recogida
      passengersWithDistance.forEach((p, index) => {
        p.pickup_order = index + 1;
      });

      // Calcular totales
      const totalDistance = passengersWithDistance.reduce((sum, p) => sum + p.distance_km, 0);
      const totalDuration = passengersWithDistance.reduce((sum, p) => sum + p.duration_minutes, 0);

      // Verificar si la ruta excede el tiempo máximo
      if (totalDuration > this.MAX_ROUTE_DURATION_MINUTES) {
        await pool.query(
          `INSERT INTO route_alerts
           (date, shift_type, alert_type, severity, message, resolved)
           VALUES ($1, $2, 'ROUTE_TOO_LONG', 'WARNING', $3, false)`,
          [
            date,
            shiftType,
            `Ruta ${routeNumber} excede ${this.MAX_ROUTE_DURATION_MINUTES} minutos: ${totalDuration} min estimados`
          ]
        );
      }

      console.log(`      ✓ Distancia total: ${totalDistance.toFixed(2)} km`);
      console.log(`      ✓ Duración estimada: ${totalDuration} min`);

      return {
        route_number: routeNumber,
        zone,
        passengers: passengersWithDistance,
        total_passengers: passengersWithDistance.length,
        total_distance_km: totalDistance,
        estimated_duration_minutes: totalDuration,
        status: 'PENDING'
      };
    } catch (error) {
      console.error(`Error calculando distancias para ruta ${routeNumber}:`, error);

      // Crear ruta básica sin optimización
      passengers.forEach((p, index) => {
        p.pickup_order = index + 1;
      });

      return {
        route_number: routeNumber,
        zone,
        passengers,
        total_passengers: passengers.length,
        total_distance_km: 0,
        estimated_duration_minutes: 0,
        status: 'PENDING'
      };
    }
  }

  /**
   * Guarda rutas optimizadas en la base de datos
   */
  async saveRoutesToDatabase(routes, date, shiftType) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Eliminar rutas existentes para esta fecha y turno
      await client.query(
        'DELETE FROM optimized_routes WHERE date = $1 AND shift_type = $2',
        [date, shiftType]
      );

      // Insertar nuevas rutas
      for (const route of routes) {
        const routeResult = await client.query(
          `INSERT INTO optimized_routes
           (date, shift_type, route_number, zone, total_passengers, total_distance_km,
            estimated_duration_minutes, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING id`,
          [
            date,
            shiftType,
            route.route_number,
            route.zone,
            route.total_passengers,
            route.total_distance_km,
            route.estimated_duration_minutes,
            route.status
          ]
        );

        const routeId = routeResult.rows[0].id;

        // Actualizar asignaciones con route_id y pickup_order
        for (const passenger of route.passengers) {
          await client.query(
            `UPDATE daily_transport_assignments
             SET route_id = $1, pickup_order = $2, estimated_time = NULL
             WHERE id = $3`,
            [routeId, passenger.pickup_order, passenger.id]
          );
        }
      }

      await client.query('COMMIT');
      console.log('\n💾 Rutas guardadas en la base de datos');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error guardando rutas:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Calcula cuántos vehículos se necesitan para un día y turno
   */
  async calculateRequiredVehicles(date, shiftType) {
    const result = await pool.query(
      `SELECT COUNT(*) as total
       FROM daily_transport_assignments
       WHERE date = $1 AND shift_type = $2 AND transport_mode = 'RUTA'`,
      [date, shiftType]
    );

    const totalPassengers = parseInt(result.rows[0].total);
    const requiredVehicles = Math.ceil(totalPassengers / this.MAX_PASSENGERS_PER_VEHICLE);

    // Verificar vehículos disponibles
    const availableResult = await pool.query(
      `SELECT COUNT(*) as available FROM fleet_vehicles WHERE status = 'AVAILABLE' AND is_active = true`
    );

    const availableVehicles = parseInt(availableResult.rows[0].available);

    if (requiredVehicles > availableVehicles) {
      await pool.query(
        `INSERT INTO route_alerts
         (date, shift_type, alert_type, severity, message, resolved)
         VALUES ($1, $2, 'INSUFFICIENT_VEHICLES', 'CRITICAL', $3, false)`,
        [
          date,
          shiftType,
          `Se necesitan ${requiredVehicles} vehículos pero solo hay ${availableVehicles} disponibles`
        ]
      );
    }

    return {
      total_passengers: totalPassengers,
      required_vehicles: requiredVehicles,
      available_vehicles: availableVehicles,
      sufficient: requiredVehicles <= availableVehicles
    };
  }
}

module.exports = new RouteOptimizationService();
