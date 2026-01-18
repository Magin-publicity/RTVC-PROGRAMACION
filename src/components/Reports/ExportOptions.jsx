// src/components/Reports/ExportOptions.jsx
import React from 'react';
import { Button } from '../UI/Button';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export const ExportOptions = ({ onExportExcel, onExportPDF, onExportCSV }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Opciones de Exportación</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={onExportExcel}
          variant="success"
          icon={<FileSpreadsheet size={20} />}
          className="w-full justify-center"
        >
          Excel (.xlsx)
        </Button>
        
        <Button
          onClick={onExportPDF}
          variant="danger"
          icon={<FileText size={20} />}
          className="w-full justify-center"
        >
          PDF
        </Button>
        
        <Button
          onClick={onExportCSV}
          variant="secondary"
          icon={<Download size={20} />}
          className="w-full justify-center"
        >
          CSV
        </Button>
      </div>
    </div>
  );
};