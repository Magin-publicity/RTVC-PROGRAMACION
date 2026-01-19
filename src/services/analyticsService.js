// src/services/analyticsService.js

const STORAGE_KEY_WEEKLY_REPORTS = 'rtvc_weekly_reports';
const STORAGE_KEY_MONTHLY_ARCHIVE = 'rtvc_monthly_archive';

/**
 * Servicio de Analítica y Reportes Inteligentes para RTVC
 * Genera KPIs y métricas consolidadas en lugar de listados largos
 */
export const analyticsService = {
  /**
   * Procesa datos de la semana y genera un reporte de KPIs
   * @param {Object} weekData - Datos de la semana con rutas, alimentación, equipos
   * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
   * @param {string} endDate - Fecha fin (YYYY-MM-DD)
   * @returns {Object} - Reporte semanal con KPIs
   */
  generateWeeklyReport(weekData, startDate, endDate) {
    const report = {
      period: {
        start: startDate,
        end: endDate,
        week: this._getWeekNumber(new Date(startDate))
      },
      timestamp: new Date().toISOString(),
      kpis: {}
    };

    // KPI 1: Balance de Flotas
    report.kpis.fleet = this._calculateFleetMetrics(weekData.routes || []);

    // KPI 2: Consumo de Alimentos
    report.kpis.meals = this._calculateMealMetrics(weekData.meals || []);

    // KPI 3: Uso de Equipos
    report.kpis.equipment = this._calculateEquipmentMetrics(weekData.equipment || []);

    // KPI 4: Excepciones de Personal
    report.kpis.exceptions = this._detectPersonnelExceptions(weekData.routes || []);

    // KPI 5: Eficiencia General
    report.kpis.efficiency = this._calculateEfficiency(report.kpis);

    return report;
  },

  /**
   * Calcula métricas de flota
   */
  _calculateFleetMetrics(routes) {
    const vehicleUsage = {};
    let totalDispatches = 0;

    routes.forEach(route => {
      if (route.vehicle_plate) {
        totalDispatches++;
        if (!vehicleUsage[route.vehicle_plate]) {
          vehicleUsage[route.vehicle_plate] = {
            plate: route.vehicle_plate,
            dispatches: 0,
            passengers: 0,
            zones: new Set()
          };
        }
        vehicleUsage[route.vehicle_plate].dispatches++;
        vehicleUsage[route.vehicle_plate].passengers += route.total_passengers || 0;
        vehicleUsage[route.vehicle_plate].zones.add(route.zone);
      }
    });

    // Convertir Set a array para serialización
    Object.values(vehicleUsage).forEach(vehicle => {
      vehicle.zones = Array.from(vehicle.zones);
    });

    // Encontrar vehículo con más uso
    const mostUsedVehicle = Object.values(vehicleUsage).sort(
      (a, b) => b.dispatches - a.dispatches
    )[0] || null;

    return {
      totalDispatches,
      vehiclesUsed: Object.keys(vehicleUsage).length,
      mostUsedVehicle: mostUsedVehicle ? {
        plate: mostUsedVehicle.plate,
        dispatches: mostUsedVehicle.dispatches,
        avgPassengers: (mostUsedVehicle.passengers / mostUsedVehicle.dispatches).toFixed(1)
      } : null,
      vehicleDetails: Object.values(vehicleUsage)
    };
  },

  /**
   * Calcula métricas de alimentación
   */
  _calculateMealMetrics(meals) {
    let delivered = 0;
    let cancelled = 0;
    let pending = 0;
    const serviceBreakdown = {
      DESAYUNO: 0,
      ALMUERZO: 0,
      CENA: 0
    };

    meals.forEach(meal => {
      if (meal.status === 'CONFIRMADO') {
        delivered++;
      } else if (meal.status === 'CANCELADO') {
        cancelled++;
      } else {
        pending++;
      }

      if (serviceBreakdown.hasOwnProperty(meal.service_type)) {
        serviceBreakdown[meal.service_type]++;
      }
    });

    const total = delivered + cancelled + pending;
    const efficiency = total > 0 ? ((delivered / total) * 100).toFixed(1) : 0;

    return {
      total,
      delivered,
      cancelled,
      pending,
      efficiency: parseFloat(efficiency),
      serviceBreakdown
    };
  },

  /**
   * Calcula métricas de uso de equipos
   */
  _calculateEquipmentMetrics(equipment) {
    let totalHours = 0;
    let transmissions = 0;
    const equipmentByType = {};

    equipment.forEach(item => {
      if (item.hours) {
        totalHours += item.hours;
        transmissions++;
      }

      if (!equipmentByType[item.type]) {
        equipmentByType[item.type] = {
          count: 0,
          totalHours: 0
        };
      }
      equipmentByType[item.type].count++;
      equipmentByType[item.type].totalHours += item.hours || 0;
    });

    const avgHours = transmissions > 0 ? (totalHours / transmissions).toFixed(2) : 0;

    return {
      totalTransmissions: transmissions,
      totalHours,
      avgHoursPerTransmission: parseFloat(avgHours),
      equipmentByType
    };
  },

  /**
   * Detecta excepciones de personal (turnos incorrectos)
   */
  _detectPersonnelExceptions(routes) {
    const exceptions = [];
    const exceptionsByType = {
      wrongShift: 0,
      lateDispatch: 0,
      other: 0
    };

    routes.forEach(route => {
      // Detectar personal despachado fuera de su turno
      if (route.passengers) {
        route.passengers.forEach(passenger => {
          // Verificar si el turno del pasajero no coincide con el turno de la ruta
          if (passenger.expected_shift && passenger.expected_shift !== route.shift_type) {
            exceptions.push({
              type: 'wrongShift',
              personnel: passenger.name,
              expectedShift: passenger.expected_shift,
              actualShift: route.shift_type,
              date: route.date,
              route: route.route_number
            });
            exceptionsByType.wrongShift++;
          }
        });
      }
    });

    return {
      total: exceptions.length,
      details: exceptions,
      byType: exceptionsByType
    };
  },

  /**
   * Calcula eficiencia general del sistema
   */
  _calculateEfficiency(kpis) {
    const scores = [];

    // Eficiencia de alimentación
    if (kpis.meals.efficiency) {
      scores.push(kpis.meals.efficiency);
    }

    // Eficiencia de flota (basada en uso de vehículos)
    if (kpis.fleet.totalDispatches > 0) {
      const fleetScore = Math.min(100, (kpis.fleet.totalDispatches / kpis.fleet.vehiclesUsed) * 10);
      scores.push(fleetScore);
    }

    // Eficiencia de personal (menos excepciones = mayor eficiencia)
    const totalRoutes = kpis.fleet.totalDispatches;
    if (totalRoutes > 0) {
      const personnelScore = ((totalRoutes - kpis.exceptions.total) / totalRoutes) * 100;
      scores.push(personnelScore);
    }

    const overallScore = scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : 0;

    return {
      overallScore: parseFloat(overallScore),
      components: {
        meals: kpis.meals.efficiency,
        fleet: scores[1] || 0,
        personnel: scores[2] || 0
      }
    };
  },

  /**
   * Guarda el reporte semanal en localStorage
   */
  saveWeeklyReport(report) {
    try {
      const reports = this.getAllWeeklyReports();
      reports.push(report);
      localStorage.setItem(STORAGE_KEY_WEEKLY_REPORTS, JSON.stringify(reports));
      return true;
    } catch (error) {
      console.error('Error guardando reporte semanal:', error);
      return false;
    }
  },

  /**
   * Obtiene todos los reportes semanales
   */
  getAllWeeklyReports() {
    try {
      const data = localStorage.getItem(STORAGE_KEY_WEEKLY_REPORTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error obteniendo reportes semanales:', error);
      return [];
    }
  },

  /**
   * Obtiene el último reporte semanal
   */
  getLastWeeklyReport() {
    const reports = this.getAllWeeklyReports();
    return reports.length > 0 ? reports[reports.length - 1] : null;
  },

  /**
   * Compara con la semana anterior
   */
  compareWithPreviousWeek(currentReport) {
    const reports = this.getAllWeeklyReports();
    if (reports.length < 2) {
      return { hasComparison: false };
    }

    const previousReport = reports[reports.length - 2];

    return {
      hasComparison: true,
      changes: {
        dispatches: this._calculateChange(
          currentReport.kpis.fleet.totalDispatches,
          previousReport.kpis.fleet.totalDispatches
        ),
        meals: this._calculateChange(
          currentReport.kpis.meals.total,
          previousReport.kpis.meals.total
        ),
        efficiency: this._calculateChange(
          currentReport.kpis.efficiency.overallScore,
          previousReport.kpis.efficiency.overallScore
        ),
        exceptions: this._calculateChange(
          currentReport.kpis.exceptions.total,
          previousReport.kpis.exceptions.total,
          true // Invertido: menos excepciones es mejor
        )
      }
    };
  },

  /**
   * Calcula cambio porcentual
   */
  _calculateChange(current, previous, inverted = false) {
    if (!previous || previous === 0) {
      return { value: 0, percentage: 0, trend: '➡️' };
    }

    const change = current - previous;
    const percentage = ((change / previous) * 100).toFixed(1);

    let trend;
    if (inverted) {
      trend = change < 0 ? '📈' : change > 0 ? '📉' : '➡️';
    } else {
      trend = change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
    }

    return {
      value: change,
      percentage: parseFloat(percentage),
      trend
    };
  },

  /**
   * CIERRE DE MES: Genera archivo consolidado y limpia storage
   */
  async closeMonth(year, month) {
    try {
      // Obtener todos los reportes del mes
      const allReports = this.getAllWeeklyReports();
      const monthReports = allReports.filter(report => {
        const reportDate = new Date(report.period.start);
        return reportDate.getFullYear() === year && reportDate.getMonth() === month - 1;
      });

      if (monthReports.length === 0) {
        throw new Error('No hay reportes para este mes');
      }

      // Generar resumen mensual
      const monthlyReport = this._generateMonthlyReport(monthReports, year, month);

      // Crear archivo JSON para descarga
      const fileName = `RTVC_Reporte_${year}-${String(month).padStart(2, '0')}.json`;
      const jsonData = JSON.stringify(monthlyReport, null, 2);

      // Descargar archivo
      this._downloadJSON(jsonData, fileName);

      // Archivar en storage histórico
      this._archiveMonthlyReport(monthlyReport);

      // Limpiar reportes semanales del mes cerrado
      const remainingReports = allReports.filter(report => {
        const reportDate = new Date(report.period.start);
        return !(reportDate.getFullYear() === year && reportDate.getMonth() === month - 1);
      });
      localStorage.setItem(STORAGE_KEY_WEEKLY_REPORTS, JSON.stringify(remainingReports));

      return {
        success: true,
        fileName,
        weeksProcessed: monthReports.length,
        report: monthlyReport
      };
    } catch (error) {
      console.error('Error en cierre de mes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Genera reporte mensual consolidado
   */
  _generateMonthlyReport(weekReports, year, month) {
    const monthName = new Date(year, month - 1).toLocaleDateString('es-ES', { month: 'long' });

    return {
      period: {
        year,
        month,
        monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        weeksIncluded: weekReports.length
      },
      generatedAt: new Date().toISOString(),
      summary: {
        fleet: this._consolidateFleetMetrics(weekReports),
        meals: this._consolidateMealMetrics(weekReports),
        equipment: this._consolidateEquipmentMetrics(weekReports),
        exceptions: this._consolidateExceptions(weekReports),
        efficiency: this._consolidateEfficiency(weekReports)
      },
      weeklyDetails: weekReports
    };
  },

  /**
   * Consolida métricas de flota del mes
   */
  _consolidateFleetMetrics(weekReports) {
    let totalDispatches = 0;
    const vehicleUsage = {};

    weekReports.forEach(report => {
      totalDispatches += report.kpis.fleet.totalDispatches;

      if (report.kpis.fleet.vehicleDetails) {
        report.kpis.fleet.vehicleDetails.forEach(vehicle => {
          if (!vehicleUsage[vehicle.plate]) {
            vehicleUsage[vehicle.plate] = 0;
          }
          vehicleUsage[vehicle.plate] += vehicle.dispatches;
        });
      }
    });

    const mostUsedVehicle = Object.entries(vehicleUsage).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      totalDispatches,
      avgDispatchesPerWeek: (totalDispatches / weekReports.length).toFixed(1),
      vehiclesUsed: Object.keys(vehicleUsage).length,
      mostUsedVehicle: mostUsedVehicle ? {
        plate: mostUsedVehicle[0],
        dispatches: mostUsedVehicle[1]
      } : null
    };
  },

  /**
   * Consolida métricas de alimentación del mes
   */
  _consolidateMealMetrics(weekReports) {
    let totalDelivered = 0;
    let totalCancelled = 0;
    let totalPending = 0;

    weekReports.forEach(report => {
      totalDelivered += report.kpis.meals.delivered;
      totalCancelled += report.kpis.meals.cancelled;
      totalPending += report.kpis.meals.pending;
    });

    const total = totalDelivered + totalCancelled + totalPending;
    const efficiency = total > 0 ? ((totalDelivered / total) * 100).toFixed(1) : 0;

    return {
      total,
      delivered: totalDelivered,
      cancelled: totalCancelled,
      pending: totalPending,
      efficiency: parseFloat(efficiency),
      avgPerWeek: (total / weekReports.length).toFixed(0)
    };
  },

  /**
   * Consolida métricas de equipos del mes
   */
  _consolidateEquipmentMetrics(weekReports) {
    let totalHours = 0;
    let totalTransmissions = 0;

    weekReports.forEach(report => {
      totalHours += report.kpis.equipment.totalHours || 0;
      totalTransmissions += report.kpis.equipment.totalTransmissions || 0;
    });

    return {
      totalTransmissions,
      totalHours,
      avgHoursPerTransmission: totalTransmissions > 0
        ? (totalHours / totalTransmissions).toFixed(2)
        : 0
    };
  },

  /**
   * Consolida excepciones del mes
   */
  _consolidateExceptions(weekReports) {
    let totalExceptions = 0;
    const exceptionsByType = {
      wrongShift: 0,
      lateDispatch: 0,
      other: 0
    };

    weekReports.forEach(report => {
      totalExceptions += report.kpis.exceptions.total;
      Object.keys(exceptionsByType).forEach(type => {
        exceptionsByType[type] += report.kpis.exceptions.byType[type] || 0;
      });
    });

    return {
      total: totalExceptions,
      byType: exceptionsByType,
      avgPerWeek: (totalExceptions / weekReports.length).toFixed(1)
    };
  },

  /**
   * Consolida eficiencia del mes
   */
  _consolidateEfficiency(weekReports) {
    const scores = weekReports.map(r => r.kpis.efficiency.overallScore);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    return {
      avgScore: parseFloat(avgScore.toFixed(1)),
      minScore: Math.min(...scores),
      maxScore: Math.max(...scores)
    };
  },

  /**
   * Descarga JSON
   */
  _downloadJSON(jsonData, fileName) {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Archiva reporte mensual en storage histórico
   */
  _archiveMonthlyReport(monthlyReport) {
    try {
      const archive = JSON.parse(localStorage.getItem(STORAGE_KEY_MONTHLY_ARCHIVE) || '[]');
      archive.push(monthlyReport);
      localStorage.setItem(STORAGE_KEY_MONTHLY_ARCHIVE, JSON.stringify(archive));
    } catch (error) {
      console.error('Error archivando reporte mensual:', error);
    }
  },

  /**
   * Obtiene archivo mensual histórico
   */
  getMonthlyArchive() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_MONTHLY_ARCHIVE) || '[]');
    } catch (error) {
      console.error('Error obteniendo archivo mensual:', error);
      return [];
    }
  },

  /**
   * Obtiene número de semana del año
   */
  _getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
};
