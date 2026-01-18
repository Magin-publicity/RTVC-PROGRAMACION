// src/components/Schedule/ScheduleCell.jsx
import React from 'react';

export const ScheduleCell = ({ program, isAssigned, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`
        p-2 rounded-lg text-xs text-left transition-all
        ${isAssigned 
          ? 'bg-green-100 border-2 border-green-500 text-green-800 font-semibold' 
          : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
        }
      `}
    >
      <div className="font-medium">{program.name}</div>
      <div className="text-xs opacity-75 mt-1">{program.time}</div>
    </button>
  );
};