// src/components/TravelEvents/TravelEventForm.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../UI/Button';

const TravelEventForm = ({ initialData, personnel, liveUEquipment, onSubmit, onCancel }) => {
  // Helper para convertir fechas a formato YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    if (typeof date === 'string' && date.includes('-')) {
      // Si ya es string en formato correcto, tomar solo la parte de fecha
      return date.split('T')[0];
    }
    // Si es Date object, convertir
    return new Date(date).toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    start_date: formatDate(initialData?.start_date),
    end_date: formatDate(initialData?.end_date),
    event_name: initialData?.event_name || '',
    event_type: initialData?.event_type || 'VIAJE_LOCAL',
    destination: initialData?.destination || '',
    departure_time: initialData?.departure_time || '',
    estimated_return: initialData?.estimated_return || '',
    description: initialData?.description || '',
    status: initialData?.status || 'PROGRAMADO'
  });

  const [selectedPersonnel, setSelectedPersonnel] = useState(
    initialData?.personnel || []
  );

  const [selectedEquipment, setSelectedEquipment] = useState(
    initialData?.equipment || []
  );

  const [errors, setErrors] = useState({});

  // Resetear formulario cuando cambia initialData
  useEffect(() => {
    setFormData({
      start_date: formatDate(initialData?.start_date),
      end_date: formatDate(initialData?.end_date),
      event_name: initialData?.event_name || '',
      event_type: initialData?.event_type || 'VIAJE_LOCAL',
      destination: initialData?.destination || '',
      departure_time: initialData?.departure_time || '',
      estimated_return: initialData?.estimated_return || '',
      description: initialData?.description || '',
      status: initialData?.status || 'PROGRAMADO'
    });
    setSelectedPersonnel(initialData?.personnel || []);
    setSelectedEquipment(initialData?.equipment || []);
    setErrors({});
  }, [initialData]);

  // NUEVO: Estado para personal en otras comisiones
  const [personnelInOtherEvents, setPersonnelInOtherEvents] = useState([]);

  // NUEVO: Cargar personal que ya está en otras comisiones
  useEffect(() => {
    const loadPersonnelInOtherEvents = async () => {
      try {
        const dateToCheck = formData.start_date || new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/travel-events/personnel-in-event/${dateToCheck}`);
        const data = await response.json();
        // Excluir el personal de la comisión actual si estamos editando
        const filtered = initialData?.id
          ? data.filter(id => !initialData.personnel?.some(p => p.personnel_id === id))
          : data;
        setPersonnelInOtherEvents(filtered || []);
        console.log('🚫 Personal en otras comisiones:', filtered);
      } catch (error) {
        console.error('Error al cargar personal en otras comisiones:', error);
        setPersonnelInOtherEvents([]);
      }
    };

    loadPersonnelInOtherEvents();
  }, [formData.start_date, initialData?.id]);

  const eventTypes = [
    { value: 'VIAJE_FUERA_CIUDAD', label: '🚗 Viaje Fuera de la Ciudad' },
    { value: 'VIAJE_LOCAL', label: '🏙️ Viaje Local' },
    { value: 'EVENTO', label: '🎉 Evento' }
  ];

  const statusOptions = [
    { value: 'PROGRAMADO', label: '📅 Programado' },
    { value: 'EN_CURSO', label: '🚀 En Curso' },
    { value: 'FINALIZADO', label: '✅ Finalizado' },
    { value: 'CANCELADO', label: '❌ Cancelado' }
  ];

  const validate = () => {
    const newErrors = {};

    if (!formData.event_name.trim()) {
      newErrors.event_name = 'El nombre del evento es requerido';
    }

    if (!formData.destination.trim()) {
      newErrors.destination = 'El destino es requerido';
    }

    if (selectedPersonnel.length === 0) {
      newErrors.personnel = 'Debe agregar al menos un integrante al equipo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        personnel: selectedPersonnel,
        equipment: selectedEquipment
      });
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addPersonnel = (personnelId) => {
    const person = personnel.find(p => p.id === parseInt(personnelId));
    if (!person) return;

    const exists = selectedPersonnel.find(p => p.personnel_id === person.id);
    if (exists) return;

    setSelectedPersonnel([...selectedPersonnel, {
      personnel_id: person.id,
      personnel_name: person.name,
      role: person.role,
      area: person.area,
      notes: ''
    }]);

    if (errors.personnel) {
      setErrors(prev => ({ ...prev, personnel: '' }));
    }
  };

  const removePersonnel = (personnelId) => {
    setSelectedPersonnel(selectedPersonnel.filter(p => p.personnel_id !== personnelId));
  };

  const updatePersonnelNotes = (personnelId, notes) => {
    setSelectedPersonnel(selectedPersonnel.map(p =>
      p.personnel_id === personnelId ? { ...p, notes } : p
    ));
  };

  const addEquipment = (type, reference) => {
    if (!type || !reference) return;

    const exists = selectedEquipment.find(e =>
      e.equipment_type === type && e.equipment_reference === reference
    );
    if (exists) return;

    setSelectedEquipment([...selectedEquipment, {
      equipment_type: type,
      equipment_reference: reference,
      liveu_id: type === 'LIVEU' ? getLiveUId(reference) : null,
      notes: ''
    }]);
  };

  const removeEquipment = (index) => {
    setSelectedEquipment(selectedEquipment.filter((_, i) => i !== index));
  };

  const getLiveUId = (code) => {
    const liveu = liveUEquipment?.find(l => l.equipment_code === code);
    return liveu?.id || null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Básica */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Información Básica</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Fin <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              min={formData.start_date}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Salida <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.event_type}
              onChange={(e) => handleChange('event_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {eventTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Evento/Viaje <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.event_name}
              onChange={(e) => handleChange('event_name', e.target.value)}
              placeholder="Ej: Cobertura Elecciones, Festival de Música, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.event_name && <p className="mt-1 text-sm text-red-500">{errors.event_name}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destino <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
              placeholder="Ej: Cali, Plaza de Bolívar, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.destination && <p className="mt-1 text-sm text-red-500">{errors.destination}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora de Salida
            </label>
            <input
              type="time"
              value={formData.departure_time}
              onChange={(e) => handleChange('departure_time', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora Estimada de Regreso
            </label>
            <input
              type="time"
              value={formData.estimated_return}
              onChange={(e) => handleChange('estimated_return', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              placeholder="Detalles adicionales del viaje o evento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Personal */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Personal Asignado</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agregar Personal <span className="text-red-500">*</span>
          </label>
          <select
            onChange={(e) => {
              addPersonnel(e.target.value);
              e.target.value = '';
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar...</option>
            {Object.entries(
              personnel.reduce((acc, person) => {
                if (!acc[person.area]) acc[person.area] = [];
                acc[person.area].push(person);
                return acc;
              }, {})
            ).map(([area, people]) => (
              <optgroup key={area} label={area}>
                {people.map(person => {
                  const isInOtherEvent = personnelInOtherEvents.includes(person.id);
                  const isAlreadySelected = selectedPersonnel.some(p => p.personnel_id === person.id);
                  return (
                    <option
                      key={person.id}
                      value={person.id}
                      disabled={isInOtherEvent || isAlreadySelected}
                    >
                      {person.name} - {person.role}
                      {isInOtherEvent ? ' 🚫 (En comisión)' : ''}
                      {isAlreadySelected ? ' ✓' : ''}
                    </option>
                  );
                })}
              </optgroup>
            ))}
          </select>
          {errors.personnel && <p className="mt-1 text-sm text-red-500">{errors.personnel}</p>}
        </div>

        {selectedPersonnel.length > 0 && (
          <div className="space-y-2">
            {selectedPersonnel.map((person) => (
              <div key={person.personnel_id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{person.personnel_name}</div>
                  <div className="text-sm text-gray-600">{person.role} - {person.area}</div>
                  <input
                    type="text"
                    value={person.notes}
                    onChange={(e) => updatePersonnelNotes(person.personnel_id, e.target.value)}
                    placeholder="Notas adicionales (opcional)"
                    className="mt-2 w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePersonnel(person.personnel_id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Equipos */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Equipos Asignados</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agregar Equipo LiveU
          </label>
          <div className="flex gap-2">
            <select
              id="liveu-select"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar LiveU...</option>
              {Array.isArray(liveUEquipment) && liveUEquipment.map(liveu => (
                <option
                  key={liveu.id}
                  value={liveu.equipment_code}
                  disabled={liveu.in_travel_event || liveu.in_dispatch || liveu.status === 'EN_MANTENIMIENTO' || liveu.status === 'FUERA_DE_SERVICIO'}
                >
                  {liveu.in_travel_event || liveu.in_dispatch ? '🚫' : '📡'} {liveu.equipment_code} {liveu.serial_number ? `(${liveu.serial_number})` : ''}
                  {liveu.in_travel_event ? ' - En comisión' : ''}
                  {liveu.in_dispatch ? ' - En despacho' : ''}
                  {liveu.status === 'EN_MANTENIMIENTO' ? ' - En mantenimiento' : ''}
                  {liveu.status === 'FUERA_DE_SERVICIO' ? ' - Fuera de servicio' : ''}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const code = document.getElementById('liveu-select').value;
                if (code) {
                  addEquipment('LIVEU', code);
                  document.getElementById('liveu-select').value = '';
                }
              }}
            >
              Agregar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Otro Tipo de Equipo
            </label>
            <select
              id="equipment-type"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar tipo...</option>
              <option value="CAMARA">📹 Cámara</option>
              <option value="MICROFONO">🎤 Micrófono</option>
              <option value="TRIPODE">📐 Trípode</option>
              <option value="ILUMINACION">💡 Iluminación</option>
              <option value="OTROS">📦 Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Referencia
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="equipment-reference"
                placeholder="Ej: CAM-005, MIC-003"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const type = document.getElementById('equipment-type').value;
                  const reference = document.getElementById('equipment-reference').value;
                  if (type && reference) {
                    addEquipment(type, reference);
                    document.getElementById('equipment-type').value = '';
                    document.getElementById('equipment-reference').value = '';
                  }
                }}
              >
                Agregar
              </Button>
            </div>
          </div>
        </div>

        {selectedEquipment.length > 0 && (
          <div className="space-y-2">
            {selectedEquipment.map((equipment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div>
                  <span className="font-medium text-gray-900">
                    {equipment.equipment_type === 'LIVEU' && '📡'}
                    {equipment.equipment_type === 'CAMARA' && '📹'}
                    {equipment.equipment_type === 'MICROFONO' && '🎤'}
                    {equipment.equipment_type === 'TRIPODE' && '📐'}
                    {equipment.equipment_type === 'ILUMINACION' && '💡'}
                    {equipment.equipment_type === 'OTROS' && '📦'}
                    {' '}{equipment.equipment_type}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    {equipment.equipment_reference}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeEquipment(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {initialData ? 'Actualizar Comisión' : 'Crear Comisión'}
        </Button>
      </div>
    </form>
  );
};

export default TravelEventForm;
