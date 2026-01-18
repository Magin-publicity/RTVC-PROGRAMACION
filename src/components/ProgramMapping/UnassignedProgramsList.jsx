// src/components/ProgramMapping/UnassignedProgramsList.jsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

export const UnassignedProgramsList = ({ programs, onDragStart }) => {
  const unassignedPrograms = programs.filter(
    program => !program.id_estudio && !program.id_master
  );

  if (unassignedPrograms.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-700">
          ✓ Todos los programas tienen recursos asignados
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="text-orange-500" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">
          Programas sin Asignar ({unassignedPrograms.length})
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Arrastra estos programas a un Estudio o Master para asignarlos
      </p>

      <div className="space-y-2">
        {unassignedPrograms.map(program => (
          <div
            key={program.id}
            draggable
            onDragStart={(e) => onDragStart(e, program)}
            className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-gray-100 hover:border-gray-300 transition-colors"
          >
            <div
              className="w-4 h-4 rounded flex-shrink-0"
              style={{ backgroundColor: program.color || '#6B7280' }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {program.nombre}
              </div>
              <div className="text-xs text-gray-500">
                {program.horario_inicio} - {program.horario_fin}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
