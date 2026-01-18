// src/components/Reports/ReportPreview.jsx
import React from 'react';
import { Modal } from '../UI/Modal';
import { formatDateLong, getWeekDates } from '../../utils/dateUtils';
import { getAllDepartments } from '../../data/departments';

export const ReportPreview = ({ schedule, startDate, reportType, onClose }) => {
  const weekDates = getWeekDates(startDate);
  const departments = getAllDepartments();
  
  const renderWeeklyReport = () => {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Reporte Semanal</h2>
          <p className="text-gray-600 mt-2">
            Del {formatDateLong(weekDates[0])} al {formatDateLong(weekDates[6])}
          </p>
        </div>
        
        {weekDates.map(date => {
          const dateStr = date.toISOString().split('T')[0];
          const daySchedule = schedule[dateStr];
          
          if (!daySchedule) return null;
          
          return (
            <div key={dateStr} className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {formatDateLong(date)}
              </h3>
              
              {departments.map(dept => {
                const deptSchedule = daySchedule[dept.name];
                if (!deptSchedule || deptSchedule.length === 0) return null;
                
                return (
                  <div key={dept.id} className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      {dept.icon} {dept.name}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {deptSchedule.map((entry, idx) => (
                        <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                          <div className="font-medium">{entry.personnel.name}</div>
                          <div className="text-gray-600">Turno: {entry.shift}</div>
                          {entry.novelty && (
                            <div className="text-xs text-orange-600 mt-1">
                              {entry.novelty.type}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Vista Previa del Reporte"
      size="xl"
    >
      <div className="max-h-[70vh] overflow-y-auto">
        {reportType === 'weekly' && renderWeeklyReport()}
      </div>
    </Modal>
  );
};