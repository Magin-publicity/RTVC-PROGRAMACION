// src/components/Calendar/Calendar.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  formatDateLong, 
  getWeekDates, 
  getDayNameShort,
  isToday,
  isSameDay 
} from '../../utils/dateUtils';

export const Calendar = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const weekDates = getWeekDates(selectedDate);
  
  const goToPreviousMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };
  
  const goToNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };
  
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Días del mes anterior
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };
  
  const days = getDaysInMonth();
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {formatDateLong(currentMonth)}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Week Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>
      
      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => {
  if (day) {
    // Crear fecha a mediodía para evitar problemas de timezone
    const selectedDay = new Date(day);
    selectedDay.setHours(12, 0, 0, 0);
    onDateSelect(selectedDay);
  }
}}
            disabled={!day}
            className={`
              aspect-square flex items-center justify-center rounded-lg text-sm
              transition-colors
              ${!day ? 'invisible' : ''}
              ${isToday(day) ? 'bg-blue-600 text-white font-bold' : ''}
              ${isSameDay(day, selectedDate) && !isToday(day) ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
              ${day && !isToday(day) && !isSameDay(day, selectedDate) ? 'hover:bg-gray-100 text-gray-700' : ''}
            `}
          >
            {day && day.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
};