// src/components/Schedule/ScheduleRow.jsx
import React, { useState } from 'react';
import { ScheduleCell } from './ScheduleCell';
import { Edit2, User } from 'lucide-react';
import { getShiftColor } from '../../data/shifts';
import { getNoveltyIcon, getNoveltyColor, getNoveltyBgColor } from '../../data/novelties';

export const ScheduleRow = ({ entry, programs, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { personnel, shift, novelty, available, status = 'normal' } = entry;

  const shiftColor = getShiftColor(shift);

  // Determinar mensaje de estado
  const getStatusMessage = () => {
    if (status === 'sin_llamado') {
      return 'Sin llamado';
    }
    if (status === 'viaje') {
      return 'En viaje';
    }
    return null;
  };

  const statusMessage = getStatusMessage();
  
  return (
    <div className={`
      bg-white border rounded-lg p-4 hover:shadow-md transition-shadow
      ${!available ? 'opacity-60' : ''}
    `}>
      <div className="flex items-center justify-between">
        {/* Personnel Info */}
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: shiftColor }}
          >
            <User size={20} />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">
                {personnel.name}
              </h4>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {personnel.role}
              </span>
            </div>
            
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-600">
                Turno: <span className="font-medium">{shift}</span>
              </span>

              {statusMessage && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 font-medium">
                  {statusMessage}
                </span>
              )}

              {novelty && (
                <span
                  className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  style={{
                    backgroundColor: getNoveltyBgColor(novelty.type),
                    color: getNoveltyColor(novelty.type)
                  }}
                >
                  <span>{getNoveltyIcon(novelty.type)}</span>
                  <span>{novelty.type}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit2 size={18} />
        </button>
      </div>
      
      {/* Program Assignments */}
      {isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {programs.map(program => (
              <ScheduleCell
                key={program.id}
                program={program}
                isAssigned={false}
                onToggle={() => {}}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};