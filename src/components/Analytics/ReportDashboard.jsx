// src/components/Analytics/ReportDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { Button } from '../UI/Button';
import html2pdf from 'html2pdf.js';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Truck,
  Utensils,
  Wifi,
  Users,
  FileText
} from 'lucide-react';

export const ReportDashboard = ({ weekData, startDate, endDate, onClose }) => {
  const [report, setReport] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  useEffect(() => {
    generateReport();
  }, [weekData, startDate, endDate]);

  const generateReport = () => {
    setLoading(true);
    try {
      const newReport = analyticsService.generateWeeklyReport(weekData, startDate, endDate);
      analyticsService.saveWeeklyReport(newReport);
      const comp = analyticsService.compareWithPreviousWeek(newReport);

      setReport(newReport);
      setComparison(comp);
    } catch (error) {
      console.error('Error generando reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthClose = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const confirmed = window.confirm(
      `¿Cerrar el mes ${month}/${year}?\n\n` +
      'Esto generará un archivo .json con todos los reportes semanales ' +
      'y limpiará el almacenamiento para el próximo mes.\n\n' +
      '¿Desea continuar?'
    );

    if (!confirmed) return;

    const result = await analyticsService.closeMonth(year, month);

    if (result.success) {
      alert(
        `✅ Mes cerrado exitosamente\n\n` +
        `Archivo: ${result.fileName}\n` +
        `Semanas procesadas: ${result.weeksProcessed}\n\n` +
        `El archivo ha sido descargado.`
      );
      onClose();
    } else {
      alert(`❌ Error al cerrar mes: ${result.error}`);
    }
  };

  const handleExportPDF = async () => {
    if (!reportRef.current || !report) return;

    const formattedStartDate = new Date(startDate).toLocaleDateString('es-ES').replace(/\//g, '-');
    const formattedEndDate = new Date(endDate).toLocaleDateString('es-ES').replace(/\//g, '-');
    const filename = `Reporte_Semanal_RTVC_${formattedStartDate}_a_${formattedEndDate}.pdf`;

    // Aplicar clase temporal para PDF
    document.body.classList.add('pdf-generating-analytics');

    const opt = {
      margin: [6, 6, 6, 6],
      filename: filename,
      image: { type: 'jpeg', quality: 0.92 },
      html2canvas: {
        scale: 1.4,
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      pagebreak: {
        mode: ['avoid-all'],
        avoid: ['.kpi-card', '.efficiency-card']
      }
    };

    try {
      await html2pdf().set(opt).from(reportRef.current).save();
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor intente nuevamente.');
    } finally {
      document.body.classList.remove('pdf-generating-analytics');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Generando reporte...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-500">Error al generar reporte</div>
      </div>
    );
  }

  const getTrendIcon = (change) => {
    if (!change) return <Minus className="text-gray-400" size={16} />;
    if (change.percentage > 0) return <TrendingUp className="text-green-600" size={16} />;
    if (change.percentage < 0) return <TrendingDown className="text-red-600" size={16} />;
    return <Minus className="text-gray-400" size={16} />;
  };

  const getTrendColor = (change) => {
    if (!change) return 'text-gray-600';
    if (change.percentage > 0) return 'text-green-600';
    if (change.percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg no-print">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                📊 Reporte Inteligente Semanal
              </h2>
              <p className="text-blue-100 mt-1">
                Semana {report.period.week} • {new Date(startDate).toLocaleDateString('es-ES')} - {new Date(endDate).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExportPDF}
                variant="success"
                size="sm"
                icon={<FileText size={16} />}
              >
                Exportar PDF
              </Button>
              <Button
                onClick={handleMonthClose}
                variant="secondary"
                size="sm"
                icon={<Download size={16} />}
              >
                Cerrar Mes
              </Button>
              <button
                onClick={onClose}
                className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6" ref={reportRef}>
          {/* Header para PDF (oculto en vista normal) */}
          <div className="hidden print-only mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Reporte Inteligente Semanal RTVC</h1>
            <p className="text-gray-600">
              Semana {report.period.week} • {new Date(startDate).toLocaleDateString('es-ES')} - {new Date(endDate).toLocaleDateString('es-ES')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Generado: {new Date(report.timestamp).toLocaleString('es-ES')}
            </p>
          </div>

          {/* Score de Eficiencia General */}
          <div className="efficiency-card bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Eficiencia General del Sistema</h3>
                <p className="text-sm text-gray-600">Promedio de todos los indicadores</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-600">
                  {report.kpis.efficiency.overallScore}%
                </div>
                {comparison.hasComparison && (
                  <div className={`text-sm flex items-center gap-1 justify-end mt-1 ${getTrendColor(comparison.changes.efficiency)}`}>
                    {getTrendIcon(comparison.changes.efficiency)}
                    {comparison.changes.efficiency.percentage > 0 ? '+' : ''}
                    {comparison.changes.efficiency.percentage}% vs semana anterior
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Grid de KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KPI 1: Balance de Flotas */}
            <KPICard
              title="Balance de Flotas"
              icon={<Truck className="text-blue-600" size={24} />}
              color="blue"
            >
              <div className="space-y-3">
                <MetricRow
                  label="Despachos Totales"
                  value={report.kpis.fleet.totalDispatches}
                  change={comparison.hasComparison ? comparison.changes.dispatches : null}
                />
                <MetricRow
                  label="Vehículos Utilizados"
                  value={report.kpis.fleet.vehiclesUsed}
                />
                {report.kpis.fleet.mostUsedVehicle && (
                  <div className="bg-blue-50 rounded p-3 mt-2">
                    <div className="text-sm font-semibold text-blue-900">Vehículo Más Usado</div>
                    <div className="text-lg font-bold text-blue-700">
                      {report.kpis.fleet.mostUsedVehicle.plate}
                    </div>
                    <div className="text-xs text-blue-600">
                      {report.kpis.fleet.mostUsedVehicle.dispatches} despachos •
                      Promedio: {report.kpis.fleet.mostUsedVehicle.avgPassengers} pasajeros
                    </div>
                  </div>
                )}
              </div>
            </KPICard>

            {/* KPI 2: Consumo de Alimentos */}
            <KPICard
              title="Consumo de Alimentos"
              icon={<Utensils className="text-green-600" size={24} />}
              color="green"
            >
              <div className="space-y-3">
                <MetricRow
                  label="Servicios Totales"
                  value={report.kpis.meals.total}
                  change={comparison.hasComparison ? comparison.changes.meals : null}
                />
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="bg-green-50 rounded p-2">
                    <div className="text-green-600 font-semibold">{report.kpis.meals.delivered}</div>
                    <div className="text-xs text-gray-600">Entregados</div>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <div className="text-red-600 font-semibold">{report.kpis.meals.cancelled}</div>
                    <div className="text-xs text-gray-600">Cancelados</div>
                  </div>
                  <div className="bg-yellow-50 rounded p-2">
                    <div className="text-yellow-600 font-semibold">{report.kpis.meals.pending}</div>
                    <div className="text-xs text-gray-600">Pendientes</div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-green-50 rounded p-3">
                  <span className="text-sm font-semibold text-green-900">Eficiencia</span>
                  <span className="text-lg font-bold text-green-600">
                    {report.kpis.meals.efficiency}%
                  </span>
                </div>
              </div>
            </KPICard>

            {/* KPI 3: Uso de Equipos */}
            <KPICard
              title="Uso de Equipos"
              icon={<Wifi className="text-purple-600" size={24} />}
              color="purple"
            >
              <div className="space-y-3">
                <MetricRow
                  label="Transmisiones Totales"
                  value={report.kpis.equipment.totalTransmissions}
                />
                <MetricRow
                  label="Horas Totales"
                  value={`${report.kpis.equipment.totalHours} hrs`}
                />
                <div className="bg-purple-50 rounded p-3">
                  <div className="text-sm text-purple-900">Promedio por Transmisión</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {report.kpis.equipment.avgHoursPerTransmission} hrs
                  </div>
                </div>
              </div>
            </KPICard>

            {/* KPI 4: Excepciones de Personal */}
            <KPICard
              title="Alertas de Personal"
              icon={<AlertCircle className={report.kpis.exceptions.total > 0 ? "text-red-600" : "text-green-600"} size={24} />}
              color={report.kpis.exceptions.total > 0 ? "red" : "green"}
            >
              <div className="space-y-3">
                <MetricRow
                  label="Excepciones Detectadas"
                  value={report.kpis.exceptions.total}
                  change={comparison.hasComparison ? comparison.changes.exceptions : null}
                />
                {report.kpis.exceptions.total > 0 ? (
                  <>
                    <div className="bg-red-50 rounded p-3">
                      <div className="text-sm font-semibold text-red-900 mb-2">Turnos Incorrectos</div>
                      <div className="text-2xl font-bold text-red-600">
                        {report.kpis.exceptions.byType.wrongShift}
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        Personal despachado fuera de su turno
                      </div>
                    </div>
                    {report.kpis.exceptions.details.length > 0 && (
                      <div className="text-xs text-gray-600 bg-gray-50 rounded p-2 max-h-24 overflow-y-auto">
                        {report.kpis.exceptions.details.slice(0, 3).map((exc, idx) => (
                          <div key={idx} className="mb-1">
                            ⚠️ {exc.personnel} - Esperado: {exc.expectedShift}, Real: {exc.actualShift}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-green-50 rounded p-4 text-center">
                    <CheckCircle className="text-green-600 mx-auto mb-2" size={32} />
                    <div className="text-green-800 font-semibold">Sin excepciones</div>
                    <div className="text-xs text-green-600">Todos los turnos correctos</div>
                  </div>
                )}
              </div>
            </KPICard>
          </div>

          {/* Desglose de Servicios de Alimentación */}
          {report.kpis.meals.serviceBreakdown && (
            <div className="service-breakdown mt-6 bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Utensils size={18} />
                Desglose por Servicio
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <ServiceBreakdown
                  label="Desayuno"
                  value={report.kpis.meals.serviceBreakdown.DESAYUNO}
                  icon="🌅"
                />
                <ServiceBreakdown
                  label="Almuerzo"
                  value={report.kpis.meals.serviceBreakdown.ALMUERZO}
                  icon="☀️"
                />
                <ServiceBreakdown
                  label="Cena"
                  value={report.kpis.meals.serviceBreakdown.CENA}
                  icon="🌙"
                />
              </div>
            </div>
          )}

          {/* Footer con timestamp */}
          <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
            Reporte generado el {new Date(report.timestamp).toLocaleString('es-ES')}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Tarjeta KPI
const KPICard = ({ title, icon, color, children }) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    purple: 'border-purple-200 bg-purple-50',
    red: 'border-red-200 bg-red-50'
  };

  return (
    <div className={`kpi-card rounded-lg border-2 ${colorClasses[color]} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>
      {children}
    </div>
  );
};

// Componente de Fila de Métrica
const MetricRow = ({ label, value, change }) => {
  const getTrendIcon = (change) => {
    if (!change) return null;
    if (change.percentage > 0) return <TrendingUp className="text-green-600" size={14} />;
    if (change.percentage < 0) return <TrendingDown className="text-red-600" size={14} />;
    return <Minus className="text-gray-400" size={14} />;
  };

  const getTrendColor = (change) => {
    if (!change) return 'text-gray-600';
    if (change.percentage > 0) return 'text-green-600';
    if (change.percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-bold text-gray-900">{value}</span>
        {change && (
          <div className={`text-xs flex items-center gap-1 ${getTrendColor(change)}`}>
            {getTrendIcon(change)}
            {change.percentage > 0 ? '+' : ''}{change.percentage}%
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Desglose de Servicio
const ServiceBreakdown = ({ label, value, icon }) => {
  return (
    <div className="bg-white rounded p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
};
