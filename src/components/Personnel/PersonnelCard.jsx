// src/components/Personnel/PersonnelCard.jsx
import React from 'react';
import { Edit2, Trash2, Mail, Phone, Clock, Calendar, AlertTriangle } from 'lucide-react';
import { getShiftColor } from '../../data/shifts';
import { useContractValidation } from '../../hooks/useContractValidation';

export const PersonnelCard = ({ person, onEdit, onDelete, onManageAvailability }) => {
  const { getContractStatus, getStatusClasses, getStatusBadge } = useContractValidation([person]);

  const contractStatus = getContractStatus(person.id);
  const statusClasses = getStatusClasses(person.id);
  const statusBadge = getStatusBadge(person.id);

  const handleDelete = () => {
    if (window.confirm(`¿Está seguro de eliminar a ${person.name}?`)) {
      onDelete(person.id);
    }
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow ${statusClasses.border || 'border-gray-200'} ${statusClasses.bg}`}>
      {/* Badge de estado de contrato */}
      {statusBadge.show && (
        <div className={`mb-2 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${statusClasses.badge}`}>
          <AlertTriangle size={12} />
          {statusBadge.text}
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">{person.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{person.role}</p>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onManageAvailability(person)}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Gestionar Disponibilidad"
          >
            <Calendar size={16} />
          </button>
          <button
            onClick={() => onEdit(person)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {person.email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail size={14} />
            <span className="truncate">{person.email}</span>
          </div>
        )}

        {person.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone size={14} />
            <span>{person.phone}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-600" />
          <span
            className="text-xs px-2 py-1 rounded-full text-white font-medium"
            style={{ backgroundColor: getShiftColor(person.current_shift) }}
          >
            {person.current_shift ? `Turno ${person.current_shift}` : 'Turno'}
          </span>
        </div>

        {(person.contract_start || person.contract_end) && (
          <div className={`flex items-center gap-2 text-sm pt-2 border-t ${contractStatus.isExpired ? 'border-red-300 bg-red-50 -mx-4 -mb-4 px-4 pb-4 mt-2' : 'border-gray-200 text-gray-600'}`}>
            <Calendar size={14} />
            <span className="font-medium">Contrato:</span>
            {person.contract_start && (
              <span>{new Date(person.contract_start).toLocaleDateString('es-ES')}</span>
            )}
            {person.contract_start && person.contract_end && <span>-</span>}
            {person.contract_end && (
              <span className={contractStatus.isExpired ? 'font-bold text-red-700' : ''}>
                {new Date(person.contract_end).toLocaleDateString('es-ES')}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};