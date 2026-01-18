// src/components/ProgramMapping/DroppableResourceZone.jsx
import React, { useState } from 'react';
import { Monitor, Tv } from 'lucide-react';

export const DroppableResourceZone = ({
  resourceType, // 'estudio' o 'master'
  resourceNumber,
  programs,
  onDrop,
  onRemoveProgram
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const programData = e.dataTransfer.getData('program');
    if (programData) {
      const program = JSON.parse(programData);
      onDrop(program, resourceType, resourceNumber);
    }
  };

  const Icon = resourceType === 'estudio' ? Tv : Monitor;
  const bgColor = resourceType === 'estudio' ? 'bg-green-50' : 'bg-blue-50';
  const borderColor = resourceType === 'estudio' ? 'border-green-200' : 'border-blue-200';
  const hoverBorderColor = isDragOver
    ? (resourceType === 'estudio' ? 'border-green-400' : 'border-blue-400')
    : borderColor;
  const textColor = resourceType === 'estudio' ? 'text-green-700' : 'text-blue-700';
  const resourceName = resourceType === 'estudio'
    ? `Estudio ${resourceNumber}`
    : `Master ${resourceNumber}`;

  const assignedPrograms = programs.filter(p => {
    if (resourceType === 'estudio') {
      return p.id_estudio === resourceNumber;
    } else {
      return p.id_master === resourceNumber;
    }
  });

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`${bgColor} border-2 ${hoverBorderColor} rounded-lg p-4 transition-all ${
        isDragOver ? 'scale-105 shadow-lg' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={textColor} size={20} />
        <h4 className={`font-semibold ${textColor}`}>
          {resourceName}
        </h4>
        <span className="ml-auto text-xs text-gray-500">
          {assignedPrograms.length} programa{assignedPrograms.length !== 1 ? 's' : ''}
        </span>
      </div>

      {assignedPrograms.length === 0 ? (
        <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded">
          Arrastra un programa aquí
        </div>
      ) : (
        <div className="space-y-2">
          {assignedPrograms.map(program => (
            <div
              key={program.id}
              className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded group hover:border-gray-300"
            >
              <div
                className="w-3 h-3 rounded flex-shrink-0"
                style={{ backgroundColor: program.color || '#6B7280' }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {program.nombre}
                </div>
                <div className="text-xs text-gray-500">
                  {program.horario_inicio} - {program.horario_fin}
                </div>
              </div>
              <button
                onClick={() => onRemoveProgram(program, resourceType)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50 transition-all"
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}

      {isDragOver && (
        <div className="absolute inset-0 bg-white bg-opacity-50 border-2 border-dashed border-blue-400 rounded-lg pointer-events-none" />
      )}
    </div>
  );
};
