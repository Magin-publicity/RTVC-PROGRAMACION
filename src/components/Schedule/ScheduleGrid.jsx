// src/components/Schedule/ScheduleGrid.jsx
import React from 'react';
import { ScheduleRow } from './ScheduleRow';
import { ProgramHeader } from './ProgramHeader';
import { Loading } from '../UI/Loading';
import { Alert } from '../UI/Alert';
import { getAllDepartments } from '../../data/departments';

export const ScheduleGrid = ({ schedule, programs, selectedDate, loading, onUpdateEntry }) => {
  if (loading) {
    return <Loading size="lg" text="Cargando programación..." />;
  }
  
  if (!schedule || Object.keys(schedule).length === 0) {
    return (
      <Alert
        type="info"
        title="Sin programación"
        message="No hay programación disponible para esta fecha. Genera una nueva programación."
      />
    );
  }
  
  const departments = getAllDepartments();
  const dateStr = selectedDate.toISOString().split('T')[0];
  const daySchedule = schedule[dateStr];
  
  if (!daySchedule) {
    return (
      <Alert
        type="warning"
        title="Sin datos"
        message="No hay datos de programación para esta fecha."
      />
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Programs Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <ProgramHeader programs={programs} />
      </div>
      
      {/* Schedule by Department */}
      <div className="divide-y divide-gray-200">
        {departments.map(department => {
          const deptSchedule = daySchedule[department.name];
          
          if (!deptSchedule || deptSchedule.length === 0) {
            return null;
          }
          
          return (
            <div key={department.id} className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{department.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {department.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {deptSchedule.length} persona{deptSchedule.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {deptSchedule.map((entry, index) => (
                  <ScheduleRow
                    key={`${entry.personnel.id}-${index}`}
                    entry={entry}
                    programs={programs}
                    onUpdate={(updates) => onUpdateEntry(dateStr, department.name, entry.personnel.id, updates)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};