import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle } from 'lucide-react';

export const AvailabilityModal = ({ person, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    is_available: true,
    reason: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  const reasons = [
    'Viaje',
    'Sin contrato',
    'Incapacidad',
    'Vacaciones',
    'Licencia',
    'Permiso',
    'Suspensión',
    'Otro'
  ];

  useEffect(() => {
    // Cargar disponibilidad actual del empleado
    fetch(`/api/availability/${person.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.is_available !== null) {
          setFormData({
            is_available: data.is_available ?? true,
            reason: data.unavailability_reason || '',
            start_date: data.unavailability_start_date ? data.unavailability_start_date.split('T')[0] : '',
            end_date: data.unavailability_end_date ? data.unavailability_end_date.split('T')[0] : '',
            notes: data.notes || ''
          });
        }
      })
      .catch(err => console.error('Error cargando disponibilidad:', err));
  }, [person.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const endpoint = formData.is_available
        ? `/api/availability/${person.id}/available`
        : `/api/availability/${person.id}/unavailable`;

      const body = formData.is_available
        ? {}
        : {
            reason: formData.reason,
            start_date: formData.start_date,
            end_date: formData.end_date,
            notes: formData.notes
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        alert('Error al actualizar disponibilidad');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar disponibilidad');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Gestionar Disponibilidad
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="font-semibold text-gray-900">{person.name}</p>
          <p className="text-sm text-gray-600">{person.area}</p>
          <p className="text-sm text-gray-600">{person.role}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Estado de disponibilidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_available"
                  checked={formData.is_available}
                  onChange={() => setFormData({ ...formData, is_available: true })}
                  className="mr-2"
                />
                <span className="text-green-600 font-semibold">✓ Disponible</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="is_available"
                  checked={!formData.is_available}
                  onChange={() => setFormData({ ...formData, is_available: false })}
                  className="mr-2"
                />
                <span className="text-red-600 font-semibold">✗ No disponible</span>
              </label>
            </div>
          </div>

          {/* Campos adicionales si NO está disponible */}
          {!formData.is_available && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Razón *
                </label>
                <select
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={!formData.is_available}
                >
                  <option value="">Seleccionar razón...</option>
                  {reasons.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha inicio *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!formData.is_available}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha fin *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    min={formData.start_date}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!formData.is_available}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Información adicional..."
                />
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold">Los turnos se redistribuirán automáticamente</p>
                  <p>El personal disponible cubrirá los turnos de manera equitativa.</p>
                </div>
              </div>
            </>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
