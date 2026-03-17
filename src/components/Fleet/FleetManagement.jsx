import React, { useState, useEffect } from 'react';
import { generateFleetDispatchMessage, copyToClipboard, shareViaWhatsApp } from '../../utils/whatsappShare';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function FleetManagement() {
  const [activeTab, setActiveTab] = useState('vehicles'); // vehicles, availability, dispatches
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Estados para vehículos
  const [vehicles, setVehicles] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);

  // Estados para disponibilidad
  const [availability, setAvailability] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  // Estados para despachos
  const [dispatches, setDispatches] = useState([]);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState(null);

  // Estados para personal
  const [journalists, setJournalists] = useState([]);
  const [cameramen, setCameramen] = useState([]);
  const [assistants, setAssistants] = useState([]);
  const [directors, setDirectors] = useState([]);

  // Estados para personal en turno (priorizado)
  const [personnelOnDuty, setPersonnelOnDuty] = useState({
    journalists: [],
    cameramen: [],
    assistants: [],
    directors: []
  });

  // Estados para LiveU
  const [liveuEquipment, setLiveuEquipment] = useState([]);

  // Estados para estadísticas
  const [stats, setStats] = useState({
    totalVehicles: 0,
    available: 0,
    inRoute: 0,
    dispatched: 0,
  });

  useEffect(() => {
    loadVehicles();
    loadJournalists();
    loadCameramen();
    loadAssistants();
    loadDirectors();
  }, []);

  useEffect(() => {
    if (activeTab === 'availability') {
      loadAvailability();
    } else if (activeTab === 'dispatches') {
      loadDispatches();
      loadPersonnelOnDuty();
      loadLiveuEquipment();
    }
  }, [activeTab, selectedDate]);

  useEffect(() => {
    calculateStats();
  }, [vehicles, availability, dispatches]);

  const loadVehicles = async () => {
    try {
      const response = await fetch(`${API_URL}/fleet/vehicles`);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error cargando vehículos:', error);
    }
  };

  const loadAvailability = async () => {
    try {
      const response = await fetch(`${API_URL}/fleet/availability/${selectedDate}`);
      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
    }
  };

  const loadDispatches = async () => {
    try {
      const response = await fetch(`${API_URL}/fleet/dispatches/${selectedDate}`);
      const data = await response.json();
      setDispatches(data);
    } catch (error) {
      console.error('Error cargando despachos:', error);
    }
  };

  const loadJournalists = async () => {
    try {
      const response = await fetch(`${API_URL}/fleet/journalists`);
      const data = await response.json();
      setJournalists(data);
    } catch (error) {
      console.error('Error cargando periodistas:', error);
    }
  };

  const loadCameramen = async () => {
    try {
      const response = await fetch(`${API_URL}/fleet/cameramen`);
      const data = await response.json();
      setCameramen(data);
    } catch (error) {
      console.error('Error cargando camarógrafos:', error);
    }
  };

  const loadAssistants = async () => {
    try {
      const response = await fetch(`${API_URL}/fleet/assistants`);
      const data = await response.json();
      setAssistants(data);
    } catch (error) {
      console.error('Error cargando asistentes:', error);
    }
  };

  const loadDirectors = async () => {
    try {
      const response = await fetch(`${API_URL}/fleet/directors`);
      const data = await response.json();
      setDirectors(data);
    } catch (error) {
      console.error('Error cargando realizadores:', error);
    }
  };

  const loadPersonnelOnDuty = async () => {
    try {
      const response = await fetch(`${API_URL}/logistics/personnel-on-duty/${selectedDate}`);
      const data = await response.json();
      setPersonnelOnDuty(data);
      console.log(`📋 Personal en turno cargado para ${selectedDate}:`, data);
    } catch (error) {
      console.error('Error cargando personal en turno:', error);
    }
  };

  const loadLiveuEquipment = async () => {
    try {
      const response = await fetch(`${API_URL}/logistics/liveu/available/${selectedDate}`);
      const data = await response.json();
      setLiveuEquipment(data);
      console.log(`📡 LiveU disponibles: ${data.length}`);
    } catch (error) {
      console.error('Error cargando equipos LiveU:', error);
    }
  };

  const calculateStats = () => {
    const total = vehicles.length;
    const avail = availability.filter(a => a.status === 'DISPONIBLE').length;
    const inRoute = dispatches.filter(d => d.status === 'EN_RUTA' || d.status === 'PROGRAMADO').length;
    const dispatched = dispatches.filter(d => d.status === 'COMPLETADO').length;

    setStats({
      totalVehicles: total,
      available: avail,
      inRoute,
      dispatched,
    });
  };

  const handleSaveVehicle = async (vehicleData) => {
    try {
      // El backend espera camelCase, enviar directamente vehicleData
      const url = editingVehicle
        ? `${API_URL}/fleet/vehicles/${editingVehicle.id}`
        : `${API_URL}/fleet/vehicles`;

      const method = editingVehicle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData),
      });

      if (response.ok) {
        await loadVehicles();
        setShowVehicleModal(false);
        setEditingVehicle(null);
      } else {
        const errorData = await response.json();
        console.error('Error del servidor:', errorData);
        alert(`Error al guardar vehículo: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error guardando vehículo:', error);
      alert('Error al guardar vehículo');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!confirm('¿Está seguro de eliminar este vehículo?')) return;

    try {
      const response = await fetch(`${API_URL}/fleet/vehicles/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadVehicles();
      }
    } catch (error) {
      console.error('Error eliminando vehículo:', error);
      alert('Error al eliminar vehículo');
    }
  };

  const handleMarkAvailable = async () => {
    if (selectedVehicles.length === 0) {
      alert('Seleccione al menos un vehículo');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/fleet/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          vehicleIds: selectedVehicles,
          availableFrom: '10:00',
        }),
      });

      if (response.ok) {
        await loadAvailability();
        setSelectedVehicles([]);
      }
    } catch (error) {
      console.error('Error marcando disponibilidad:', error);
      alert('Error al marcar disponibilidad');
    }
  };

  const handleRemoveAvailability = async (availabilityId) => {
    if (!confirm('¿Está seguro de eliminar este vehículo de la lista de disponibles?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/fleet/availability/${availabilityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadAvailability();
      }
    } catch (error) {
      console.error('Error eliminando disponibilidad:', error);
      alert('Error al eliminar disponibilidad');
    }
  };

  const handleSaveDispatch = async (dispatchData) => {
    try {
      const url = editingDispatch
        ? `${API_URL}/fleet/dispatches/${editingDispatch.id}`
        : `${API_URL}/fleet/dispatches`;

      const method = editingDispatch ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...dispatchData, date: selectedDate }),
      });

      if (response.ok) {
        await loadDispatches();
        setShowDispatchModal(false);
        setEditingDispatch(null);
      }
    } catch (error) {
      console.error('Error guardando despacho:', error);
      alert('Error al guardar despacho');
    }
  };

  const handleDeleteDispatch = async (id) => {
    if (!confirm('¿Está seguro de eliminar este despacho?')) return;

    try {
      const response = await fetch(`${API_URL}/fleet/dispatches/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadDispatches();
      }
    } catch (error) {
      console.error('Error eliminando despacho:', error);
      alert('Error al eliminar despacho');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestión de Flota</h1>
        <p className="text-gray-600">Administre vehículos, disponibilidad y despachos de prensa</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Total Vehículos</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalVehicles}</p>
            </div>
            <div className="text-blue-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">En Canal</p>
              <p className="text-3xl font-bold text-gray-800">{stats.available}</p>
            </div>
            <div className="text-green-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">En Ruta</p>
              <p className="text-3xl font-bold text-gray-800">{stats.inRoute}</p>
            </div>
            <div className="text-yellow-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Despachados</p>
              <p className="text-3xl font-bold text-gray-800">{stats.dispatched}</p>
            </div>
            <div className="text-purple-500">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'vehicles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🚗 Vehículos de Flota
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'availability'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ✅ Disponibilidad en Base
            </button>
            <button
              onClick={() => setActiveTab('dispatches')}
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'dispatches'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📍 Despachos de Prensa
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'vehicles' && (
            <VehiclesTab
              vehicles={vehicles}
              onEdit={(v) => { setEditingVehicle(v); setShowVehicleModal(true); }}
              onDelete={handleDeleteVehicle}
              onAdd={() => { setEditingVehicle(null); setShowVehicleModal(true); }}
            />
          )}

          {activeTab === 'availability' && (
            <AvailabilityTab
              date={selectedDate}
              onDateChange={setSelectedDate}
              vehicles={vehicles}
              availability={availability}
              selectedVehicles={selectedVehicles}
              onSelectVehicle={setSelectedVehicles}
              onMarkAvailable={handleMarkAvailable}
              onRemove={handleRemoveAvailability}
            />
          )}

          {activeTab === 'dispatches' && (
            <DispatchesTab
              date={selectedDate}
              onDateChange={setSelectedDate}
              dispatches={dispatches}
              onAdd={() => { setEditingDispatch(null); setShowDispatchModal(true); }}
              onEdit={(d) => { setEditingDispatch(d); setShowDispatchModal(true); }}
              onDelete={handleDeleteDispatch}
            />
          )}
        </div>
      </div>

      {/* Modales */}
      {showVehicleModal && (
        <VehicleModal
          vehicle={editingVehicle}
          onSave={handleSaveVehicle}
          onClose={() => { setShowVehicleModal(false); setEditingVehicle(null); }}
        />
      )}

      {showDispatchModal && (
        <DispatchModal
          dispatch={editingDispatch}
          vehicles={vehicles}
          availability={availability}
          journalists={journalists}
          cameramen={cameramen}
          assistants={assistants}
          directors={directors}
          personnelOnDuty={personnelOnDuty}
          liveuEquipment={liveuEquipment}
          activeDispatches={dispatches.filter(d => d.status === 'PROGRAMADO' || d.status === 'EN_RUTA')}
          onSave={handleSaveDispatch}
          onClose={() => { setShowDispatchModal(false); setEditingDispatch(null); }}
        />
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTES
// ============================================================================

function VehiclesTab({ vehicles, onEdit, onDelete, onAdd }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Vehículos de la Flota</h2>
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>+</span>
          <span>Agregar Vehículo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">{vehicle.vehicle_code}</h3>
                <p className="text-sm text-gray-600">{vehicle.vehicle_type}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                vehicle.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                vehicle.status === 'IN_ROUTE' ? 'bg-blue-100 text-blue-800' :
                vehicle.status === 'MAINTENANCE' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {vehicle.status}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center text-sm">
                <span className="text-gray-600 w-24">Placa:</span>
                <span className="font-medium">{vehicle.plate || 'N/A'}</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-600 w-24">Capacidad:</span>
                <span className="font-medium">{vehicle.capacity} pasajeros</span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-600 w-24">Conductor:</span>
                <span className="font-medium">{vehicle.driver_name || 'N/A'}</span>
              </div>
              {vehicle.driver_phone && (
                <div className="flex items-center text-sm">
                  <span className="text-gray-600 w-24">Teléfono:</span>
                  <span className="font-medium">{vehicle.driver_phone}</span>
                </div>
              )}
              {(vehicle.shift_start || vehicle.shift_end) && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">🕐 Turno:</span>
                    <span className="font-medium text-blue-600">
                      {vehicle.shift_start || '--:--'} - {vehicle.shift_end || '--:--'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(vehicle)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(vehicle.id)}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No hay vehículos registrados</p>
          <p className="text-sm">Agregue vehículos para comenzar</p>
        </div>
      )}
    </div>
  );
}

function AvailabilityTab({ date, onDateChange, vehicles, availability, selectedVehicles, onSelectVehicle, onMarkAvailable, onRemove }) {
  const availableIds = new Set(availability.map(a => a.vehicle_id));
  const availableForSelection = vehicles.filter(v => !availableIds.has(v.id));

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Marcar Vehículos Disponibles en Base</h3>
        <p className="text-sm text-gray-600 mb-4">
          Seleccione los vehículos que terminan rutas AM y quedan disponibles para reportería/convergencia
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
          {availableForSelection.map((vehicle) => (
            <label
              key={vehicle.id}
              className={`p-3 border-2 rounded-lg cursor-pointer transition ${
                selectedVehicles.includes(vehicle.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedVehicles.includes(vehicle.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onSelectVehicle([...selectedVehicles, vehicle.id]);
                  } else {
                    onSelectVehicle(selectedVehicles.filter(id => id !== vehicle.id));
                  }
                }}
                className="mr-2"
              />
              <span className="font-medium">{vehicle.vehicle_code}</span>
              <br />
              <span className="text-xs text-gray-600">{vehicle.vehicle_type}</span>
            </label>
          ))}
        </div>

        <button
          onClick={onMarkAvailable}
          disabled={selectedVehicles.length === 0}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Marcar como Disponibles ({selectedVehicles.length})
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Vehículos Disponibles Hoy</h3>
        {availability.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availability.map((item) => (
              <div key={item.id} className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold">{item.vehicle_code}</h4>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.vehicle_type}</p>
                <p className="text-sm">
                  <span className="text-gray-600">Disponible desde:</span> {item.available_from}
                </p>
                <p className="text-sm">
                  <span className="text-gray-600">Conductor:</span> {item.driver_name}
                </p>
                {item.driver_phone && (
                  <p className="text-sm">
                    <span className="text-gray-600">Tel:</span> {item.driver_phone}
                  </p>
                )}
                <button
                  onClick={() => onRemove(item.id)}
                  className="mt-3 w-full px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium transition"
                >
                  Eliminar de Disponibles
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No hay vehículos marcados como disponibles para esta fecha</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DispatchesTab({ date, onDateChange, dispatches, onAdd, onEdit, onDelete }) {
  // Función para copiar mensaje de despacho
  const handleCopyDispatchMessage = async (dispatch) => {
    const message = generateFleetDispatchMessage({
      destination: dispatch.destination,
      journalist: dispatch.journalist_name,
      cameraman: dispatch.cameraman_name,
      assistant: dispatch.assistant_name,
      director: dispatch.director_name,
      liveu_unit: dispatch.liveu_code,
      vehicle_plate: dispatch.vehicle_plate,
      driver_name: dispatch.driver_name,
      departure_time: dispatch.departure_time,
      program_name: dispatch.program_name || 'RTVC',
      notes: dispatch.notes
    });

    const success = await copyToClipboard(message);
    if (success) {
      alert('✅ Mensaje copiado al portapapeles');
    } else {
      alert('❌ Error al copiar. Por favor intente nuevamente.');
    }
  };

  // Función para compartir por WhatsApp
  const handleShareDispatchWhatsApp = (dispatch) => {
    const message = generateFleetDispatchMessage({
      destination: dispatch.destination,
      journalist: dispatch.journalist_name,
      cameraman: dispatch.cameraman_name,
      assistant: dispatch.assistant_name,
      director: dispatch.director_name,
      liveu_unit: dispatch.liveu_code,
      vehicle_plate: dispatch.vehicle_plate,
      driver_name: dispatch.driver_name,
      departure_time: dispatch.departure_time,
      program_name: dispatch.program_name || 'RTVC',
      notes: dispatch.notes
    });

    shareViaWhatsApp(message);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-2">
        <div className="flex-shrink-0">
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <button
          onClick={onAdd}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-sm whitespace-nowrap min-w-[120px]"
        >
          <span>+</span>
          <span className="dispatch-button-text">Nuevo Despacho</span>
        </button>
      </div>

      {dispatches.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periodista</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camarógrafo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asistente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Realizador</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LiveU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conductor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destino</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora Salida</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dispatches.map((dispatch) => (
                <tr key={dispatch.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dispatch.vehicle_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dispatch.journalist_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dispatch.cameraman_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dispatch.assistant_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dispatch.director_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dispatch.liveu_code ? `📡 ${dispatch.liveu_code}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dispatch.driver_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dispatch.vehicle_plate}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {dispatch.destino || dispatch.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dispatch.fecha_inicio === dispatch.fecha_fin
                      ? dispatch.fecha_inicio
                      : `${dispatch.fecha_inicio} → ${dispatch.fecha_fin}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {dispatch.departure_time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      dispatch.status === 'PROGRAMADO' ? 'bg-yellow-100 text-yellow-800' :
                      dispatch.status === 'EN_RUTA' ? 'bg-blue-100 text-blue-800' :
                      dispatch.status === 'FINALIZADO' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {dispatch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleCopyDispatchMessage(dispatch)}
                        className="text-green-600 hover:text-green-900"
                        title="Copiar mensaje"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => handleShareDispatchWhatsApp(dispatch)}
                        className="text-green-600 hover:text-green-900"
                        title="Compartir por WhatsApp"
                      >
                        📱
                      </button>
                      <button
                        onClick={() => onEdit(dispatch)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete(dispatch.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No hay despachos para esta fecha</p>
          <p className="text-sm">Cree un nuevo despacho para comenzar</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODALES
// ============================================================================

function VehicleModal({ vehicle, onSave, onClose }) {
  const [formData, setFormData] = useState({
    vehicleCode: vehicle?.vehicle_code || '',
    vehicleType: vehicle?.vehicle_type || 'Van',
    capacity: vehicle?.capacity || 12,
    driverName: vehicle?.driver_name || '',
    driverPhone: vehicle?.driver_phone || '',
    plate: vehicle?.plate || '',
    status: vehicle?.status || 'AVAILABLE',
    shiftStart: vehicle?.shift_start || '',
    shiftEnd: vehicle?.shift_end || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.vehicleCode || !formData.vehicleType || !formData.capacity) {
      alert('Código, tipo y capacidad son campos requeridos');
      return;
    }

    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Código del Vehículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código del Vehículo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.vehicleCode}
                onChange={(e) => setFormData({ ...formData, vehicleCode: e.target.value })}
                placeholder="Ej: V-001, CAM-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Tipo de Vehículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Vehículo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.vehicleType}
                onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="Van">Van</option>
                <option value="Camioneta">Camioneta</option>
                <option value="Automóvil">Automóvil</option>
                <option value="Bus">Bus</option>
                <option value="Microbus">Microbus</option>
              </select>
            </div>

            {/* Capacidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacidad (Pasajeros) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Placa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placa
              </label>
              <input
                type="text"
                value={formData.plate}
                onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                placeholder="Ej: ABC123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Nombre del Conductor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Conductor
              </label>
              <input
                type="text"
                value={formData.driverName}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                placeholder="Nombre completo"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Teléfono del Conductor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono del Conductor
              </label>
              <input
                type="tel"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                placeholder="Ej: 3001234567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Hora de Ingreso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Ingreso
              </label>
              <input
                type="time"
                value={formData.shiftStart}
                onChange={(e) => setFormData({ ...formData, shiftStart: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Hora en que el conductor inicia turno</p>
            </div>

            {/* Hora de Salida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Salida
              </label>
              <input
                type="time"
                value={formData.shiftEnd}
                onChange={(e) => setFormData({ ...formData, shiftEnd: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Hora en que el conductor finaliza turno</p>
            </div>

            {/* Estado (solo al editar) */}
            {vehicle && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="IN_ROUTE">En Ruta</option>
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="REPORTING">Reportería</option>
                </select>
              </div>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {vehicle ? 'Guardar Cambios' : 'Crear Vehículo'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DispatchModal({ dispatch, vehicles, availability, journalists, cameramen, assistants, directors, personnelOnDuty, liveuEquipment, activeDispatches = [], onSave, onClose }) {
  const [formData, setFormData] = useState({
    vehicleId: dispatch?.vehicle_id || '',
    journalistId: dispatch?.journalist_id || '',
    journalistName: dispatch?.journalist_name || '',
    cameramanIds: dispatch?.cameraman_ids || (dispatch?.cameraman_id ? [dispatch.cameraman_id] : []), // Array de IDs
    assistantIds: dispatch?.assistant_ids || (dispatch?.assistant_id ? [dispatch.assistant_id] : []), // Array de IDs
    directorIds: dispatch?.director_ids || (dispatch?.director_id ? [dispatch.director_id] : []), // Array de IDs
    liveuIds: dispatch?.liveu_ids || (dispatch?.liveu_id ? [dispatch.liveu_id] : []), // Array de IDs
    driverName: dispatch?.driver_name || '',
    driverPhone: dispatch?.driver_phone || '',
    vehiclePlate: dispatch?.vehicle_plate || '',
    destination: dispatch?.destination || '',
    departureTime: dispatch?.departure_time || '09:00',
    estimatedReturn: dispatch?.estimated_return || '',
    fechaInicio: dispatch?.fecha_inicio || new Date().toISOString().split('T')[0],
    fechaFin: dispatch?.fecha_fin || new Date().toISOString().split('T')[0],
    conductorRetorna: dispatch?.conductor_retorna || false,
    notes: dispatch?.notes || '',
    status: dispatch?.status || 'PROGRAMADO',
  });


  // IDs de recursos ya en uso en despachos activos (excluir el despacho actual si es edición)
  const currentDispatchId = dispatch?.id;
  const usedVehicleIds = new Set(activeDispatches.filter(d => d.id !== currentDispatchId).map(d => d.vehicle_id));

  // Considerar tanto IDs individuales como arrays de IDs
  const usedCameramanIds = new Set(
    activeDispatches
      .filter(d => d.id !== currentDispatchId)
      .flatMap(d => {
        if (d.cameraman_ids && Array.isArray(d.cameraman_ids)) return d.cameraman_ids;
        if (d.cameraman_id) return [d.cameraman_id];
        return [];
      })
  );
  const usedAssistantIds = new Set(
    activeDispatches
      .filter(d => d.id !== currentDispatchId)
      .flatMap(d => {
        if (d.assistant_ids && Array.isArray(d.assistant_ids)) return d.assistant_ids;
        if (d.assistant_id) return [d.assistant_id];
        return [];
      })
  );
  const usedDirectorIds = new Set(
    activeDispatches.filter(d => d.id !== currentDispatchId && d.director_id).map(d => d.director_id)
  );
  const usedLiveuIds = new Set(activeDispatches.filter(d => d.id !== currentDispatchId && d.liveu_id).map(d => d.liveu_id));
  const usedJournalistIds = new Set(
    activeDispatches.filter(d => d.id !== currentDispatchId && d.journalist_id).map(d => d.journalist_id)
  );

  // Función para verificar si un vehículo está en su horario de turno
  const isVehicleInShift = (vehicle) => {
    if (!vehicle.shift_start || !vehicle.shift_end) return true; // Si no tiene horarios, está disponible siempre

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const shiftStart = vehicle.shift_start.substring(0, 5); // HH:MM
    const shiftEnd = vehicle.shift_end.substring(0, 5); // HH:MM

    // Si el turno cruza medianoche (ej: 15:00 - 03:00)
    if (shiftStart > shiftEnd) {
      return currentTime >= shiftStart || currentTime <= shiftEnd;
    }

    // Turno normal (ej: 06:00 - 18:00)
    return currentTime >= shiftStart && currentTime <= shiftEnd;
  };

  // Filtrar vehículos disponibles (solo los marcados como disponibles del día Y no en uso Y dentro de su horario)
  const availableVehicleIds = new Set(availability.map(a => a.vehicle_id));
  const availableVehicles = vehicles.filter(v =>
    availableVehicleIds.has(v.id) &&
    !usedVehicleIds.has(v.id) &&
    isVehicleInShift(v)
  );

  // Función para combinar personal: primero EN TURNO AM, luego EN TURNO PM, luego otros
  // También filtrar los que ya están en uso o bloqueados por viaje
  const mergePersonnelWithShifts = (onDutyList, allList, usedIds) => {
    const onDutyIds = new Set(onDutyList.map(p => p.id));
    const others = allList.filter(p => !onDutyIds.has(p.id) && !usedIds.has(p.id) && !p.is_blocked);

    // Separar en turno por AM y PM BASÁNDOSE EN LA PROGRAMACIÓN DEL DÍA (p.call_time)
    // Si tiene call_time entre 00:00-11:59 es AM, si es 12:00-23:59 es PM
    const onDutyAM = onDutyList.filter(p => {
      if (usedIds.has(p.id) || p.is_blocked) return false;

      // Primero verificar el campo turno que viene de la programación
      if (p.turno === 'AM' || p.turno === 'MAÑANA') return true;

      // Si no tiene turno, verificar por call_time (hora de llamado de la programación)
      if (p.call_time) {
        const hour = parseInt(p.call_time.substring(0, 2));
        return hour >= 0 && hour < 12;
      }

      return false;
    });

    const onDutyPM = onDutyList.filter(p => {
      if (usedIds.has(p.id) || p.is_blocked) return false;

      // Primero verificar el campo turno que viene de la programación
      if (p.turno === 'PM' || p.turno === 'TARDE') return true;

      // Si no tiene turno, verificar por call_time (hora de llamado de la programación)
      if (p.call_time) {
        const hour = parseInt(p.call_time.substring(0, 2));
        return hour >= 12 && hour < 24;
      }

      return false;
    });

    const onDutyOther = onDutyList.filter(p => !usedIds.has(p.id) && !p.is_blocked && !onDutyAM.includes(p) && !onDutyPM.includes(p));

    // Marcar los que están en uso o bloqueados
    const inUse = allList.filter(p => usedIds.has(p.id));
    const blocked = onDutyList.filter(p => p.is_blocked && !usedIds.has(p.id));

    return {
      onDutyAM,
      onDutyPM,
      onDutyOther,
      others,
      inUse,
      blocked // Nuevo: personal bloqueado por viaje
    };
  };

  const journalistsCombined = mergePersonnelWithShifts(personnelOnDuty?.journalists || [], journalists, usedJournalistIds);
  const cameramenCombined = mergePersonnelWithShifts(personnelOnDuty?.cameramen || [], cameramen, usedCameramanIds);
  const assistantsCombined = mergePersonnelWithShifts(personnelOnDuty?.assistants || [], assistants, usedAssistantIds);
  const directorsCombined = mergePersonnelWithShifts(personnelOnDuty?.directors || [], directors, usedDirectorIds);

  // Filtrar LiveU disponibles
  const availableLiveu = liveuEquipment.filter(l => !usedLiveuIds.has(l.id));

  // Cuando se selecciona un vehículo, autocompletar conductor, placa y teléfono
  const handleVehicleChange = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
    if (vehicle) {
      setFormData({
        ...formData,
        vehicleId: vehicle.id,
        driverName: vehicle.driver_name || '',
        vehiclePlate: vehicle.plate || '',
        driverPhone: vehicle.driver_phone || '',
      });
    }
  };

  // Helper para obtener todos los disponibles de una categoría
  const getAllAvailable = (combined) => [
    ...combined.onDutyAM,
    ...combined.onDutyPM,
    ...combined.onDutyOther,
    ...combined.others
  ];

  // Cuando se selecciona un periodista, autocompletar nombre
  const handleJournalistChange = (journalistId) => {
    const journalist = getAllAvailable(journalistsCombined).find(j => j.id === parseInt(journalistId));
    if (journalist) {
      setFormData({
        ...formData,
        journalistId: journalist.id,
        journalistName: journalist.full_name,
      });
    }
  };

  // Cuando se selecciona un camarógrafo, autocompletar nombre
  const handleCameramanChange = (cameramanId) => {
    const cameraman = getAllAvailable(cameramenCombined).find(c => c.id === parseInt(cameramanId));
    if (cameraman) {
      setFormData({
        ...formData,
        cameramanId: cameraman.id,
        cameramanName: cameraman.full_name,
      });
    } else {
      setFormData({
        ...formData,
        cameramanId: '',
        cameramanName: '',
      });
    }
  };

  // Cuando se selecciona un asistente, autocompletar nombre
  const handleAssistantChange = (assistantId) => {
    const assistant = getAllAvailable(assistantsCombined).find(a => a.id === parseInt(assistantId));
    if (assistant) {
      setFormData({
        ...formData,
        assistantId: assistant.id,
        assistantName: assistant.full_name,
      });
    } else {
      setFormData({
        ...formData,
        assistantId: '',
        assistantName: '',
      });
    }
  };

  // Cuando se selecciona un realizador, autocompletar nombre
  const handleDirectorChange = (directorId) => {
    const director = getAllAvailable(directorsCombined).find(d => d.id === parseInt(directorId));
    if (director) {
      setFormData({
        ...formData,
        directorId: director.id,
        directorName: director.full_name,
      });
    } else {
      setFormData({
        ...formData,
        directorId: '',
        directorName: '',
      });
    }
  };

  // Cuando se selecciona un LiveU, autocompletar código
  const handleLiveuChange = (liveuId) => {
    const liveu = liveuEquipment.find(l => l.id === parseInt(liveuId));
    if (liveu) {
      setFormData({
        ...formData,
        liveuId: liveu.id,
        liveuCode: liveu.equipment_code,
      });
    } else {
      setFormData({
        ...formData,
        liveuId: '',
        liveuCode: '',
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.vehicleId || !formData.destination || !formData.departureTime || !formData.fechaInicio || !formData.fechaFin) {
      alert('Vehículo, destino, hora de salida y fechas son campos requeridos');
      return;
    }

    // Validar que fecha_fin >= fecha_inicio
    if (formData.fechaFin < formData.fechaInicio) {
      alert('La fecha de fin no puede ser anterior a la fecha de inicio');
      return;
    }

    // Convertir cadenas vacías a null para campos opcionales
    const cleanedData = {
      ...formData,
      journalistId: formData.journalistId || null,
      cameramanIds: formData.cameramanIds.length > 0 ? formData.cameramanIds : [],
      assistantIds: formData.assistantIds.length > 0 ? formData.assistantIds : [],
      directorId: formData.directorId || null,
      liveuId: formData.liveuId || null,
    };

    onSave(cleanedData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {dispatch ? 'Editar Despacho' : 'Nuevo Despacho de Prensa'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehículo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehículo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccione un vehículo</option>
                {availableVehicles.length > 0 && (
                  <optgroup label="✅ DISPONIBLES">
                    {availableVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicle_code} - {vehicle.vehicle_type} ({vehicle.capacity} pax)
                      </option>
                    ))}
                  </optgroup>
                )}
                {usedVehicleIds.size > 0 && vehicles.filter(v => usedVehicleIds.has(v.id)).length > 0 && (
                  <optgroup label="🔒 EN USO (Bloqueados)">
                    {vehicles.filter(v => usedVehicleIds.has(v.id)).map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id} disabled>
                        {vehicle.vehicle_code} - EN DESPACHO ACTIVO
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Periodista */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periodista (Opcional)
              </label>
              <select
                value={formData.journalistId}
                onChange={(e) => handleJournalistChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin periodista</option>
                {journalistsCombined.onDutyAM.length > 0 && (
                  <optgroup label="🌅 EN TURNO AM (Prioridad)">
                    {journalistsCombined.onDutyAM.map((journalist) => (
                      <option key={journalist.id} value={journalist.id}>
                        {journalist.full_name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {journalistsCombined.onDutyPM.length > 0 && (
                  <optgroup label="🌆 EN TURNO PM (Prioridad)">
                    {journalistsCombined.onDutyPM.map((journalist) => (
                      <option key={journalist.id} value={journalist.id}>
                        {journalist.full_name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {journalistsCombined.onDutyOther.length > 0 && (
                  <optgroup label="🟢 EN TURNO (Otros)">
                    {journalistsCombined.onDutyOther.map((journalist) => (
                      <option key={journalist.id} value={journalist.id}>
                        {journalist.full_name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {journalistsCombined.others.length > 0 && (
                  <optgroup label="⚪ Otros (Eventuales)">
                    {journalistsCombined.others.map((journalist) => (
                      <option key={journalist.id} value={journalist.id}>
                        {journalist.full_name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {journalistsCombined.inUse.length > 0 && (
                  <optgroup label="🔒 EN USO (Bloqueados)">
                    {journalistsCombined.inUse.map((journalist) => (
                      <option key={journalist.id} value={journalist.id} disabled>
                        {journalist.full_name} - EN DESPACHO ACTIVO
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <p className="text-xs text-gray-500 mt-1">🌅 AM / 🌆 PM según rotación del día | 🔒 Bloqueados en despachos activos</p>
            </div>

            {/* Camarógrafos (multiselección) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Camarógrafos (Multiselección)
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                {cameramenCombined.onDutyAM.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">🌅 EN TURNO AM</p>
                    {cameramenCombined.onDutyAM.map((cameraman) => (
                      <label key={cameraman.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.cameramanIds.includes(cameraman.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...formData.cameramanIds, cameraman.id]
                              : formData.cameramanIds.filter(id => id !== cameraman.id);
                            setFormData({ ...formData, cameramanIds: newIds });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{cameraman.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {cameramenCombined.onDutyPM.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">🌆 EN TURNO PM</p>
                    {cameramenCombined.onDutyPM.map((cameraman) => (
                      <label key={cameraman.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.cameramanIds.includes(cameraman.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...formData.cameramanIds, cameraman.id]
                              : formData.cameramanIds.filter(id => id !== cameraman.id);
                            setFormData({ ...formData, cameramanIds: newIds });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{cameraman.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {cameramenCombined.others.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">⚪ Otros Disponibles</p>
                    {cameramenCombined.others.map((cameraman) => (
                      <label key={cameraman.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.cameramanIds.includes(cameraman.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...formData.cameramanIds, cameraman.id]
                              : formData.cameramanIds.filter(id => id !== cameraman.id);
                            setFormData({ ...formData, cameramanIds: newIds });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{cameraman.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {cameramenCombined.blocked && cameramenCombined.blocked.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">✈️ VIAJANDO (Bloqueados)</p>
                    {cameramenCombined.blocked.map((cameraman) => (
                      <label key={cameraman.id} className="flex items-center gap-2 py-1 opacity-50 cursor-not-allowed">
                        <input
                          type="checkbox"
                          disabled
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{cameraman.full_name} - {cameraman.novelty_tipo}</span>
                      </label>
                    ))}
                  </div>
                )}
                {formData.cameramanIds.length === 0 && cameramenCombined.onDutyAM.length === 0 && cameramenCombined.onDutyPM.length === 0 && cameramenCombined.others.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Ningún camarógrafo seleccionado</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Seleccionados: {formData.cameramanIds.length}
              </p>
            </div>

            {/* Asistentes de Reportería (multiselección) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asistentes de Reportería (Multiselección)
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                {assistantsCombined.onDutyAM.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">🌅 EN TURNO AM</p>
                    {assistantsCombined.onDutyAM.map((assistant) => (
                      <label key={assistant.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assistantIds.includes(assistant.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...formData.assistantIds, assistant.id]
                              : formData.assistantIds.filter(id => id !== assistant.id);
                            setFormData({ ...formData, assistantIds: newIds });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{assistant.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {assistantsCombined.onDutyPM.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">🌆 EN TURNO PM</p>
                    {assistantsCombined.onDutyPM.map((assistant) => (
                      <label key={assistant.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assistantIds.includes(assistant.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...formData.assistantIds, assistant.id]
                              : formData.assistantIds.filter(id => id !== assistant.id);
                            setFormData({ ...formData, assistantIds: newIds });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{assistant.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {assistantsCombined.others.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">⚪ Otros Disponibles</p>
                    {assistantsCombined.others.map((assistant) => (
                      <label key={assistant.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assistantIds.includes(assistant.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...formData.assistantIds, assistant.id]
                              : formData.assistantIds.filter(id => id !== assistant.id);
                            setFormData({ ...formData, assistantIds: newIds });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{assistant.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {assistantsCombined.blocked && assistantsCombined.blocked.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">✈️ VIAJANDO (Bloqueados)</p>
                    {assistantsCombined.blocked.map((assistant) => (
                      <label key={assistant.id} className="flex items-center gap-2 py-1 opacity-50 cursor-not-allowed">
                        <input
                          type="checkbox"
                          disabled
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{assistant.full_name} - {assistant.novelty_tipo}</span>
                      </label>
                    ))}
                  </div>
                )}
                {formData.assistantIds.length === 0 && assistantsCombined.onDutyAM.length === 0 && assistantsCombined.onDutyPM.length === 0 && assistantsCombined.others.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Ningún asistente seleccionado</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Seleccionados: {formData.assistantIds.length}
              </p>
            </div>

            {/* Realizadores (opcional, multiselección) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Realizadores (Opcional, puedes seleccionar varios)
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                {directorsCombined.onDutyAM.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">🌅 EN TURNO AM</p>
                    {directorsCombined.onDutyAM.map((director) => (
                      <label key={director.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.directorIds.includes(director.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...formData.directorIds, director.id]
                              : formData.directorIds.filter(id => id !== director.id);
                            setFormData({ ...formData, directorIds: newIds });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{director.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {directorsCombined.onDutyPM.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">🌆 EN TURNO PM</p>
                    {directorsCombined.onDutyPM.map((director) => (
                      <label key={director.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.directorIds.includes(director.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...formData.directorIds, director.id]
                              : formData.directorIds.filter(id => id !== director.id);
                            setFormData({ ...formData, directorIds: newIds });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{director.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {directorsCombined.onDutyOther.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">🟢 EN TURNO (Otros)</p>
                    {directorsCombined.onDutyOther.map((director) => (
                      <label key={director.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.directorIds.includes(director.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...formData.directorIds, director.id]
                              : formData.directorIds.filter(id => id !== director.id);
                            setFormData({ ...formData, directorIds: newIds });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{director.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {directorsCombined.others.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">⚪ Eventuales</p>
                    {directorsCombined.others.map((director) => (
                      <label key={director.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.directorIds.includes(director.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...formData.directorIds, director.id]
                              : formData.directorIds.filter(id => id !== director.id);
                            setFormData({ ...formData, directorIds: newIds });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{director.full_name}</span>
                      </label>
                    ))}
                  </div>
                )}
                {directorsCombined.inUse.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">🔒 EN USO</p>
                    {directorsCombined.inUse.map((director) => (
                      <label key={director.id} className="flex items-center gap-2 py-1 opacity-50 cursor-not-allowed">
                        <input
                          type="checkbox"
                          disabled
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{director.full_name} - EN DESPACHO</span>
                      </label>
                    ))}
                  </div>
                )}
                {directorsCombined.onDutyAM.length === 0 && directorsCombined.onDutyPM.length === 0 && directorsCombined.onDutyOther.length === 0 && directorsCombined.others.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Ningún realizador disponible</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Seleccionados: {formData.directorIds.length}
              </p>
            </div>

            {/* LiveU Equipment (multiselección) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipos LiveU (Opcional, puedes seleccionar varios)
              </label>
              <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                {availableLiveu.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-600 mb-1">✅ DISPONIBLES</p>
                    {availableLiveu.map((liveu) => (
                      <label key={liveu.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.liveuIds.includes(liveu.id)}
                          onChange={(e) => {
                            const newIds = e.target.checked
                              ? [...formData.liveuIds, liveu.id]
                              : formData.liveuIds.filter(id => id !== liveu.id);
                            setFormData({ ...formData, liveuIds: newIds });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">📡 {liveu.equipment_code}</span>
                      </label>
                    ))}
                  </div>
                )}
                {usedLiveuIds.size > 0 && liveuEquipment.filter(l => usedLiveuIds.has(l.id)).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">🔒 EN USO</p>
                    {liveuEquipment.filter(l => usedLiveuIds.has(l.id)).map((liveu) => (
                      <label key={liveu.id} className="flex items-center gap-2 py-1 opacity-50 cursor-not-allowed">
                        <input
                          type="checkbox"
                          disabled
                          className="w-4 h-4"
                        />
                        <span className="text-sm">📡 {liveu.equipment_code} - EN DESPACHO</span>
                      </label>
                    ))}
                  </div>
                )}
                {availableLiveu.length === 0 && usedLiveuIds.size === 0 && (
                  <p className="text-sm text-gray-500 italic">Ningún equipo LiveU disponible</p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Seleccionados: {formData.liveuIds.length} | Disponibles: {availableLiveu.length} de {liveuEquipment.length}
              </p>
            </div>

            {/* Placa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placa del Vehículo
              </label>
              <input
                type="text"
                value={formData.vehiclePlate}
                onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value.toUpperCase() })}
                placeholder="Placa"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Se autocompletó del vehículo seleccionado</p>
            </div>

            {/* Teléfono del Conductor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono del Conductor
              </label>
              <input
                type="tel"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                placeholder="Teléfono"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">Se autocompletó del vehículo seleccionado</p>
            </div>

            {/* Hora de Salida */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora de Salida <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Hora Estimada de Regreso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora Estimada de Regreso
              </label>
              <input
                type="time"
                value={formData.estimatedReturn}
                onChange={(e) => setFormData({ ...formData, estimatedReturn: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fecha de Inicio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Inicio <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => {
                  const newFechaInicio = e.target.value;
                  setFormData({
                    ...formData,
                    fechaInicio: newFechaInicio,
                    // Si la fecha de fin es anterior a la nueva fecha de inicio, actualizarla
                    fechaFin: newFechaInicio > formData.fechaFin ? newFechaInicio : formData.fechaFin
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Fecha de Fin */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                min={formData.fechaInicio}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="PROGRAMADO">Programado</option>
                <option value="EN_RUTA">En Ruta</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            {/* Switch: Conductor Retorna */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <input
                type="checkbox"
                id="conductorRetorna"
                checked={formData.conductorRetorna}
                onChange={(e) => setFormData({ ...formData, conductorRetorna: e.target.checked })}
                className="w-5 h-5 text-blue-600"
              />
              <label htmlFor="conductorRetorna" className="text-sm font-medium text-gray-700 cursor-pointer">
                🚗 ¿Conductor y vehículo retornan al canal?
                <p className="text-xs text-gray-600 mt-1">
                  Si se marca, el conductor y vehículo quedarán disponibles tras 1 hora de la salida
                </p>
              </label>
            </div>
          </div>

          {/* Destino (textarea completo) */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destino <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              placeholder="Dirección completa del destino..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Notas adicionales */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Información adicional, contactos, instrucciones especiales..."
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {dispatch ? 'Guardar Cambios' : 'Crear Despacho'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
