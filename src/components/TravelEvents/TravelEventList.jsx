// src/components/TravelEvents/TravelEventList.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import TravelEventModal from './TravelEventModal';
import { API_BASE_URL } from '../../config/api';

const TravelEventList = ({ selectedDate, personnel }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [liveUEquipment, setLiveUEquipment] = useState([]);

  useEffect(() => {
    loadEvents();
    loadLiveUEquipment();
  }, [selectedDate]);

  // Recargar LiveU cuando se abre el modal en modo edición
  useEffect(() => {
    if (isModalOpen && selectedEvent) {
      // Si estamos editando, excluir el evento actual para permitir sus equipos
      loadLiveUEquipment(selectedEvent.id);
    } else if (isModalOpen) {
      // Si es nuevo, no excluir nada
      loadLiveUEquipment();
    }
  }, [isModalOpen, selectedEvent]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/travel-events/date/${selectedDate}`
      );
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error al cargar comisiones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLiveUEquipment = async (excludeEventId = null) => {
    try {
      // Usar el nuevo endpoint que marca LiveU disponibles por fecha
      // Si estamos editando, excluir el evento actual para permitir mantener sus equipos
      let url = `${API_BASE_URL}/travel-events/liveu/available/${selectedDate}`;
      if (excludeEventId) {
        url += `?excludeEventId=${excludeEventId}`;
      }
      const response = await fetch(url);

      if (!response.ok) {
        console.error('Error en respuesta del servidor:', response.status, response.statusText);
        setLiveUEquipment([]);
        return;
      }

      const data = await response.json();
      setLiveUEquipment(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar equipos LiveU:', error);
      setLiveUEquipment([]);
    }
  };

  const handleSave = async (eventData) => {
    try {
      const method = selectedEvent ? 'PUT' : 'POST';
      const url = selectedEvent
        ? `${API_BASE_URL}/travel-events/${selectedEvent.id}`
        : `${API_BASE_URL}/travel-events`;

      console.log('💾 Guardando comisión:', {
        method,
        url,
        selectedEvent: selectedEvent?.id || 'null',
        eventData
      });

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData)
      });

      if (!response.ok) throw new Error('Error al guardar comisión');

      await loadEvents();
      setIsModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error al guardar comisión:', error);
      alert('Error al guardar la comisión');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta comisión?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/travel-events/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al eliminar comisión');

      await loadEvents();
    } catch (error) {
      console.error('Error al eliminar comisión:', error);
      alert('Error al eliminar la comisión');
    }
  };

  const getEventTypeLabel = (type) => {
    const types = {
      'VIAJE_FUERA_CIUDAD': '🚗 Viaje Fuera de la Ciudad',
      'VIAJE_LOCAL': '🏙️ Viaje Local',
      'EVENTO': '🎉 Evento'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'PROGRAMADO': 'bg-blue-100 text-blue-800',
      'EN_CURSO': 'bg-green-100 text-green-800',
      'FINALIZADO': 'bg-gray-100 text-gray-800',
      'CANCELADO': 'bg-red-100 text-red-800'
    };
    const labels = {
      'PROGRAMADO': '📅 Programado',
      'EN_CURSO': '🚀 En Curso',
      'FINALIZADO': '✅ Finalizado',
      'CANCELADO': '❌ Cancelado'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          🚗 Gestión de VIAJES & EVENTOS
        </h2>
        <Button
          onClick={() => {
            setSelectedEvent(null);
            setIsModalOpen(true);
          }}
          variant="primary"
        >
          ➕ Nueva Comisión
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">
          Cargando comisiones...
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay comisiones programadas para esta fecha
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {event.event_name}
                    </h3>
                    {getStatusBadge(event.status)}
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>{getEventTypeLabel(event.event_type)}</div>
                    <div>📍 {event.destination}</div>
                    <div>📅 Desde: {new Date(event.start_date).toLocaleDateString('es-ES')} - Hasta: {new Date(event.end_date).toLocaleDateString('es-ES')}</div>
                    {event.departure_time && (
                      <div>
                        🕐 Salida: {event.departure_time}
                        {event.estimated_return && ` | Regreso: ${event.estimated_return}`}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedEvent(event);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {event.description && (
                <p className="text-sm text-gray-600 mb-4">{event.description}</p>
              )}

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Personal */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      👥 Personal ({event.personnel_count || 0})
                    </h4>
                    {event.personnel && event.personnel.length > 0 ? (
                      <div className="space-y-1">
                        {event.personnel.map((person, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {person.name} - {person.role}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Sin personal asignado</div>
                    )}
                  </div>

                  {/* Equipos */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      📦 Equipos ({event.equipment_count || 0})
                    </h4>
                    {event.equipment && event.equipment.length > 0 ? (
                      <div className="space-y-1">
                        {event.equipment.map((equip, index) => (
                          <div key={index} className="text-sm text-gray-600">
                            • {equip.equipment_type}: {equip.reference}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Sin equipos asignados</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <TravelEventModal
          key={selectedEvent?.id || 'new'}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          personnel={personnel}
          liveUEquipment={liveUEquipment}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default TravelEventList;
