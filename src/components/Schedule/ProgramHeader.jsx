// src/components/Schedule/ProgramHeader.jsx
import React from 'react';

export const ProgramHeader = ({ programs }) => {
  return (
    <div className="space-y-2">
      <h3 className="font-bold text-gray-900 mb-3">Programación del Día</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {programs.map(program => (
          <div
            key={program.id}
            className="p-3 rounded-lg bg-white border border-gray-200"
          >
            <div className="font-semibold text-sm text-gray-900 mb-1">
              {program.name}
            </div>
            <div className="text-xs text-gray-600">
              {program.time}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {program.location}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};