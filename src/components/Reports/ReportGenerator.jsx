// src/components/Reports/ReportGenerator.jsx
import React, { useState } from 'react';
import { Button } from '../UI/Button';
import { Select } from '../UI/Select';
import { DatePicker } from '../Calendar/DatePicker';
import { ReportPreview } from './ReportPreview';
import { Download, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { exportToExcel } from '../../utils/exportToExcel';
import { generatePDF } from '../../utils/exportToPDF';
import { getWeekDates } from '../../utils/dateUtils';

export const ReportGenerator = ({ schedule, personnel, novelties }) => {
  const [reportType, setReportType] = useState('weekly');
  const [startDate, setStartDate] = useState(new Date());
  const [selectedArea, setSelectedArea] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  const reportTypes = [
    { value: 'weekly', label: 'Reporte Semanal' },
    { value: 'daily', label: 'Reporte Diario' },
    { value: 'area', label: 'Reporte por Área' },
    { value: 'summary', label: 'Resumen Ejecutivo' }
  ];
  
  const handleGenerateReport = () => {
    setShowPreview(true);
  };
  
  const handleExportExcel = () => {
    const filename = `reporte_${reportType}_${startDate.toISOString().split('T')[0]}.xlsx`;
    exportToExcel(schedule, filename);
  };
  
  const handleExportPDF = () => {
    const weekDates = getWeekDates(startDate);
    generatePDF(schedule, {
      title: 'Programación RTVC',
      startDate: weekDates[0],
      endDate: weekDates[6],
      includeNovelties: true
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Generador de Reportes</h2>
        <p className="text-gray-600 mt-1">Genere y exporte reportes de programación</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Select
            label="Tipo de Reporte"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            options={reportTypes}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={startDate.toISOString().split('T')[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleGenerateReport}
            icon={<FileText size={20} />}
          >
            Generar Vista Previa
          </Button>
          
          <Button
            onClick={handleExportExcel}
            variant="success"
            icon={<Download size={20} />}
          >
            Exportar Excel
          </Button>
          
          <Button
            onClick={handleExportPDF}
            variant="secondary"
            icon={<Download size={20} />}
          >
            Exportar PDF
          </Button>
        </div>
      </div>
      
      {showPreview && (
        <ReportPreview
          schedule={schedule}
          startDate={startDate}
          reportType={reportType}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};