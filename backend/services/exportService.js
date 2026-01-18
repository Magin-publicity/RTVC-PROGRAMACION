const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'rtvc_scheduling',
  password: 'Padres2023',
  port: 5432
});

class ExportService {
  /**
   * Genera formato WhatsApp para rutas de un día específico
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @param {string} shiftType - 'AM' o 'PM'
   * @returns {Promise<string>} Texto formateado para WhatsApp
   */
  async generateWhatsAppFormat(date, shiftType) {
    try {
      // Obtener rutas optimizadas con pasajeros
      const routesResult = await pool.query(
        'SELECT * FROM v_daily_routes WHERE date = $1 AND shift_type = $2 ORDER BY route_number',
        [date, shiftType]
      );

      if (routesResult.rows.length === 0) {
        return `No hay rutas programadas para ${date} - Turno ${shiftType}`;
      }

      const routes = routesResult.rows;

      // Obtener personal con transporte propio
      const ownTransportResult = await pool.query(
        `SELECT personnel_name, program_title
         FROM daily_transport_assignments
         WHERE date = $1 AND shift_type = $2 AND transport_mode = 'PROPIO'
         ORDER BY personnel_name`,
        [date, shiftType]
      );

      const formattedDate = this.formatDate(date);
      const titlePrefix = shiftType === 'AM' ? 'REQUERIMIENTO' : 'ÚLTIMA EMISIÓN';

      let message = '';
      message += `*${titlePrefix} - ${formattedDate}*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

      // Rutas
      message += `🚐 *RUTAS DE TRANSPORTE*\n\n`;

      routes.forEach(route => {
        message += `📍 *Ruta ${route.route_number}* - ${route.zone}\n`;

        // Información del vehículo asignado
        if (route.vehicle_plate) {
          message += `🚗 Vehículo: ${route.vehicle_plate}`;
          if (route.vehicle_type) {
            message += ` (${route.vehicle_type})`;
          }
          message += `\n`;
        }

        if (route.driver_name) {
          message += `👤 Conductor: ${route.driver_name}`;
          if (route.driver_phone) {
            message += ` | 📱 ${route.driver_phone}`;
          }
          message += `\n`;
        }

        // Alerta si no tiene vehículo asignado
        if (!route.vehicle_plate) {
          message += `⚠️ *Sin vehículo asignado*\n`;
        }

        if (route.passengers && Array.isArray(route.passengers)) {
          message += `👥 Pasajeros (${route.total_passengers}):\n`;

          route.passengers
            .filter(p => p.name) // Filtrar pasajeros válidos
            .forEach((passenger, index) => {
              const order = passenger.pickup_order || index + 1;
              const name = passenger.name;
              const address = passenger.address || 'Sin dirección';
              const program = passenger.program_title ? ` - ${passenger.program_title}` : '';

              message += `   ${order}. ${name}${program}\n`;
              message += `      📍 ${address}\n`;
            });
        }

        if (route.estimated_duration_minutes) {
          message += `⏱️ Duración estimada: ${route.estimated_duration_minutes} min\n`;
        }

        message += `\n`;
      });

      // Personal con transporte propio
      if (ownTransportResult.rows.length > 0) {
        message += `🚗 *TRANSPORTE PROPIO*\n\n`;

        ownTransportResult.rows.forEach(person => {
          const program = person.program_title ? ` - ${person.program_title}` : '';
          message += `   • ${person.personnel_name}${program}\n`;
        });

        message += `\n`;
      }

      // Resumen
      const totalInRoutes = routes.reduce((sum, r) => sum + r.total_passengers, 0);
      const totalOwnTransport = ownTransportResult.rows.length;
      const totalPersonnel = totalInRoutes + totalOwnTransport;

      message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
      message += `📊 *RESUMEN*\n`;
      message += `   • Total rutas: ${routes.length}\n`;
      message += `   • Personal en ruta: ${totalInRoutes}\n`;
      message += `   • Transporte propio: ${totalOwnTransport}\n`;
      message += `   • Total personal: ${totalPersonnel}\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;
      message += `_Generado automáticamente por Sistema RTVC_`;

      return message;
    } catch (error) {
      console.error('Error generando formato WhatsApp:', error);
      throw error;
    }
  }

  /**
   * Genera datos estructurados para generar PDF
   * @param {string} date - Fecha en formato YYYY-MM-DD
   * @param {string} shiftType - 'AM' o 'PM'
   * @returns {Promise<Object>} Datos estructurados para PDF
   */
  async generatePDFData(date, shiftType) {
    try {
      // Obtener rutas optimizadas
      const routesResult = await pool.query(
        'SELECT * FROM v_daily_routes WHERE date = $1 AND shift_type = $2 ORDER BY route_number',
        [date, shiftType]
      );

      // Obtener personal con transporte propio
      const ownTransportResult = await pool.query(
        `SELECT personnel_name, personnel_role, personnel_area, program_title
         FROM daily_transport_assignments
         WHERE date = $1 AND shift_type = $2 AND transport_mode = 'PROPIO'
         ORDER BY personnel_name`,
        [date, shiftType]
      );

      // Obtener alertas activas
      const alertsResult = await pool.query(
        `SELECT * FROM route_alerts
         WHERE date = $1 AND shift_type = $2 AND NOT resolved
         ORDER BY severity DESC, created_at DESC`,
        [date, shiftType]
      );

      const routes = routesResult.rows.map(route => ({
        route_number: route.route_number,
        zone: route.zone,
        vehicle_code: route.vehicle_code,
        driver_name: route.driver_name,
        driver_phone: route.driver_phone,
        total_passengers: route.total_passengers,
        total_distance_km: parseFloat(route.total_distance_km || 0),
        estimated_duration_minutes: route.estimated_duration_minutes,
        status: route.status,
        passengers: Array.isArray(route.passengers) ? route.passengers.filter(p => p.name) : []
      }));

      const ownTransport = ownTransportResult.rows;
      const alerts = alertsResult.rows;

      const totalInRoutes = routes.reduce((sum, r) => sum + r.total_passengers, 0);
      const totalOwnTransport = ownTransport.length;
      const totalPersonnel = totalInRoutes + totalOwnTransport;

      return {
        date: this.formatDate(date),
        shiftType,
        title: shiftType === 'AM' ? 'REQUERIMIENTO EL CALENTAO' : 'ÚLTIMA EMISIÓN',
        routes,
        ownTransport,
        alerts,
        summary: {
          total_routes: routes.length,
          total_in_routes: totalInRoutes,
          total_own_transport: totalOwnTransport,
          total_personnel: totalPersonnel,
          total_distance_km: routes.reduce((sum, r) => sum + r.total_distance_km, 0),
          total_duration_minutes: routes.reduce((sum, r) => sum + r.estimated_duration_minutes, 0)
        },
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generando datos para PDF:', error);
      throw error;
    }
  }

  /**
   * Genera formato de tabla simple para reporte de rutas
   */
  async generateSimpleReport(date, shiftType) {
    try {
      const routesResult = await pool.query(
        'SELECT * FROM v_daily_routes WHERE date = $1 AND shift_type = $2 ORDER BY route_number',
        [date, shiftType]
      );

      const routes = routesResult.rows;

      let report = `REPORTE DE RUTAS - ${this.formatDate(date)} - Turno ${shiftType}\n`;
      report += `${'='.repeat(80)}\n\n`;

      routes.forEach(route => {
        report += `RUTA ${route.route_number} - ${route.zone}\n`;
        report += `${'-'.repeat(80)}\n`;

        if (route.vehicle_code) {
          report += `Vehículo: ${route.vehicle_code}`;
          if (route.driver_name) {
            report += ` | Conductor: ${route.driver_name}`;
            if (route.driver_phone) {
              report += ` (${route.driver_phone})`;
            }
          }
          report += `\n`;
        }

        report += `Pasajeros: ${route.total_passengers} | `;
        report += `Distancia: ${parseFloat(route.total_distance_km || 0).toFixed(2)} km | `;
        report += `Duración: ${route.estimated_duration_minutes} min\n\n`;

        if (route.passengers && Array.isArray(route.passengers)) {
          report += `ORDEN | NOMBRE                          | DIRECCIÓN\n`;
          report += `${'-'.repeat(80)}\n`;

          route.passengers
            .filter(p => p.name)
            .forEach(passenger => {
              const order = String(passenger.pickup_order || '').padEnd(5);
              const name = String(passenger.name || '').padEnd(32);
              const address = String(passenger.address || 'Sin dirección').substring(0, 38);
              report += `${order} | ${name} | ${address}\n`;
            });
        }

        report += `\n\n`;
      });

      return report;
    } catch (error) {
      console.error('Error generando reporte simple:', error);
      throw error;
    }
  }

  /**
   * Formatea una fecha YYYY-MM-DD a formato legible en español
   */
  formatDate(dateString) {
    const date = new Date(dateString + 'T12:00:00');
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName} ${day} de ${month} de ${year}`;
  }
}

module.exports = new ExportService();
