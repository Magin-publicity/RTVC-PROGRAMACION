// src/components/Calendar/WeekSelector.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { 
  formatDateShort, 
  getDayNameShort, 
  getWeekDates,
  isToday,
  isSameDay 
} from '../../utils/dateUtils';

export const WeekSelector = ({ selectedDate, onDateSelect, onPrevWeek, onNextWeek, onToday }) => {
  const weekDates = getWeekDates(selectedDate);
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mb-6 sticky top-[72px] z-40 border-b-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrevWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Semana anterior"
        >
          <ChevronLeft size={20} />
        </button>
        
        <button
          onClick={onToday}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <CalendarIcon size={16} />
          Hoy
        </button>
        
        <button
          onClick={onNextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Semana siguiente"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentDay = isToday(date);
          
          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`
                p-3 rounded-lg text-center transition-all
                ${isSelected && isCurrentDay ? 'bg-purple-600 text-white font-bold shadow-lg ring-4 ring-purple-300' : ''}
                ${isSelected && !isCurrentDay ? 'bg-green-500 text-white font-bold shadow-md ring-2 ring-green-600' : ''}
                ${!isSelected && isCurrentDay ? 'bg-blue-600 text-white font-bold shadow-lg' : ''}
                ${!isSelected && !isCurrentDay ? 'bg-gray-50 hover:bg-gray-100 text-gray-700' : ''}
              `}
            >
              <div className="text-xs mb-1">
                {getDayNameShort(date)}
              </div>
              <div className="text-lg font-bold">
                {date.getDate()}
              </div>
              <div className="text-xs opacity-75">
                {formatDateShort(date)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};