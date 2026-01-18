// src/components/Calendar/DatePicker.jsx
import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { Modal } from '../UI/Modal';
import { Calendar } from './Calendar';

export const DatePicker = ({ value, onChange, label, placeholder = 'Seleccionar fecha' }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  
  const handleDateSelect = (date) => {
    onChange(date);
    setShowCalendar(false);
  };
  
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setShowCalendar(true)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value ? formatDate(value) : placeholder}
        </span>
        <CalendarIcon size={20} className="text-gray-400" />
      </button>
      
      <Modal
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        title="Seleccionar Fecha"
        size="md"
      >
        <Calendar
          selectedDate={value || new Date()}
          onDateSelect={handleDateSelect}
        />
      </Modal>
    </div>
  );
};