// src/components/Assignments/AsignacionRealizadores.jsx
import React, { useState, useEffect } from 'react';
import { Video, MapPin, Clock, AlertCircle, Plus, Save, Trash2, X } from 'lucide-react';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import {
  getAsignacionesRealizadoresByFecha,
  createAsignacionRealizador,
  updateAsignacionRealizador,
  deleteAsignacionRealizador,
} from '../../services/asignacionesService';

export const AsignacionRealizadores = ({ currentDate }) => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPersonal, setSelectedPersonal] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [despachos, setDespachos] = useState([]);

  // Formatear fecha sin conversión de zona horaria
  const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

  // Determinar turno según la hora actual (solo para mostrar)
  const getTurnoActual = () => {
    const horaActual = new Date().getHours();
    // Mañana: 8:00 - 13:00, Tarde: 13:00 - 20:00
    return horaActual >= 8 && horaActual < 13 ? 'mañana' : 'tarde';
  };

  const turnoActual = getTurnoActual();

  // Cargar personal de realizadores (SIN filtrar por turno)
  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/personnel');
        const data = await response.json();
        // Filtrar solo realizadores, sin importar el turno
        const realizadores = data.filter(p => p.area === 'REALIZADORES');
        setPersonal(realizadores);
      } catch (error) {
        console.error('Error al cargar personal:', error);
      }
    };
    fetchPersonal();
  }, []);

  // Cargar disponibilidad (incluye despachos)
  useEffect(() => {
    const fetchDisponibilidad = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/asignaciones-realizadores/disponibilidad/${fecha}`);
        const data = await response.json();
        setDisponibilidad(data);
      } catch (error) {
        console.error('Error al cargar disponibilidad:', error);
      }
    };
    fetchDisponibilidad();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchDisponibilidad, 30000);
    return () => clearInterval(interval);
  }, [fecha]);

  // Cargar despachos activos de flotas
  useEffect(() => {
    const fetchDespachos = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/fleet/dispatches/${fecha}`);
        const data = await response.json();
        // Filtrar solo despachos activos (PROGRAMADO o EN_RUTA) con realizador
        const despachosActivos = data.filter(d =>
          (d.status === 'PROGRAMADO' || d.status === 'EN_RUTA') && d.director_id
        );
        setDespachos(despachosActivos);
      } catch (error) {
        console.error('Error al cargar despachos:', error);
      }
    };
    fetchDespachos();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchDespachos, 30000);
    return () => clearInterval(interval);
  }, [fecha]);

  // Cargar asignaciones del día
  useEffect(() => {
    loadAsignaciones();
  }, [fecha]);

  const loadAsignaciones = async () => {
    setLoading(true);
    try {
      console.log('📅 Fecha que se enviará al backend:', fecha);
      const data = await getAsignacionesRealizadoresByFecha(fecha);
      console.log('📦 Datos recibidos del backend:', data);
      console.log('📦 Tipo de datos:', Array.isArray(data) ? 'Array' : typeof data);
      setAsignaciones(data);
    } catch (error) {
      console.error('❌ Error al cargar asignaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agregar nueva asignación
  const handleAddAsignacion = async (personalId, numeroSalida) => {
    try {
      const newAsignacion = {
        id_personal: personalId,
        fecha,
        numero_salida: numeroSalida,
        hora_salida: '08:00',
        destino: 'Por definir',
        producto: 'Por definir',
        estatus: 'En Canal',
        fuera_ciudad: false,
        dias_bloqueado: 0,
        fecha_retorno: null,
        notas: ''
      };

      console.log('Creando asignación:', newAsignacion);
      const result = await createAsignacionRealizador(newAsignacion);
      console.log('Asignación creada:', result);
      loadAsignaciones();
    } catch (error) {
      console.error('Error completo al crear asignación:', error);
      alert(`Error al crear asignación: ${error.message}`);
    }
  };

  // Actualizar asignación
  const handleUpdateAsignacion = async (id, field, value) => {
    try {
      await updateAsignacionRealizador(id, { [field]: value });
      loadAsignaciones();
    } catch (error) {
      console.error('Error al actualizar asignación:', error);
      alert('Error al actualizar asignación');
    }
  };

  // Eliminar asignación
  const handleDeleteAsignacion = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta asignación?')) return;

    try {
      await deleteAsignacionRealizador(id);
      loadAsignaciones();
    } catch (error) {
      console.error('Error al eliminar asignación:', error);
      alert('Error al eliminar asignación');
    }
  };

  // Obtener asignaciones de un personal específico (incluyendo despachos)
  const getAsignacionesPersonal = (personalId) => {
    const asignacionesNormales = [];

    // Obtener asignaciones manuales
    if (Array.isArray(asignaciones)) {
      const personalAsignaciones = asignaciones.find(a => a?.id_personal === personalId);
      if (personalAsignaciones && personalAsignaciones.asignaciones) {
        asignacionesNormales.push(...personalAsignaciones.asignaciones);
      }
    }

    // Buscar si este realizador está en un despacho activo
    const despachoPersonal = despachos.find(d => d.director_id === personalId);

    if (despachoPersonal) {
      // Convertir despacho a formato de asignación (solo lectura)
      const asignacionDespacho = {
        id: `despacho-${despachoPersonal.id}`,
        numero_salida: 1, // Siempre mostrar en salida 1
        hora_salida: despachoPersonal.departure_time?.substring(0, 5) || '',
        destino: despachoPersonal.destination || '',
        producto: `🚗 DESPACHO FLOTA - ${despachoPersonal.vehicle_plate || ''}`,
        estatus: despachoPersonal.status === 'PROGRAMADO' ? 'En Canal' : 'En Trayecto',
        fuera_ciudad: false,
        notas: `Vehículo: ${despachoPersonal.vehicle_plate || 'N/A'} | Periodista: ${despachoPersonal.journalist_name || 'N/A'}`,
        es_despacho: true, // Flag para identificar que es un despacho
        despacho_original: despachoPersonal
      };

      // Agregar al inicio de la lista
      asignacionesNormales.unshift(asignacionDespacho);
    }

    return asignacionesNormales;
  };

  // Componente de celda editable
  const EditableCell = ({ asignacion, field, type = 'text' }) => {
    // Si es un despacho, mostrar solo lectura con fondo diferente
    if (asignacion.es_despacho) {
      const value = asignacion[field] || '';
      return (
        <div className="w-full p-2 bg-blue-50 rounded text-sm min-h-[2.5rem] flex items-center border border-blue-200">
          <span className="text-blue-900 font-medium">{value}</span>
        </div>
      );
    }

    // Para hora_salida, convertir "08:00:00" a "08:00"
    const getInitialValue = () => {
      const fieldValue = asignacion[field];
      if (field === 'hora_salida' && fieldValue) {
        return fieldValue.substring(0, 5); // "08:00:00" -> "08:00"
      }
      return fieldValue || '';
    };

    const [value, setValue] = useState(getInitialValue());
    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
      if (value !== getInitialValue()) {
        handleUpdateAsignacion(asignacion.id, field, value);
      }
      setIsEditing(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        setValue(asignacion[field] || '');
        setIsEditing(false);
      }
    };

    if (type === 'select') {
      return (
        <select
          value={asignacion[field]}
          onChange={(e) => handleUpdateAsignacion(asignacion.id, field, e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="En Canal">En Canal</option>
          <option value="En Trayecto">En Trayecto</option>
          <option value="En Locación">En Locación</option>
        </select>
      );
    }

    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={asignacion[field] || false}
          onChange={(e) => handleUpdateAsignacion(asignacion.id, field, e.target.checked)}
          className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
        />
      );
    }

    if (isEditing) {
      return (
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full p-2 border border-purple-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      );
    }

    return (
      <div
        onClick={() => setIsEditing(true)}
        className="w-full p-2 cursor-pointer hover:bg-gray-50 rounded text-sm min-h-[2.5rem]"
      >
        {asignacion[field] || <span className="text-gray-400">Click para editar</span>}
      </div>
    );
  };

  // Componente de fila de asignación
  const AsignacionRow = ({ asignacion, numeroSalida }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case 'En Canal': return 'bg-green-100 text-green-800';
        case 'En Trayecto': return 'bg-yellow-100 text-yellow-800';
        case 'En Locación': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    if (!asignacion) {
      return (
        <tr className="border-b hover:bg-gray-50">
          <td className="px-4 py-3 text-center text-gray-500" colSpan="8">
            Sin asignación
          </td>
        </tr>
      );
    }

    // Resaltar fila si es despacho
    const rowClass = asignacion.es_despacho
      ? "border-b bg-blue-50 border-blue-200"
      : "border-b hover:bg-gray-50";

    return (
      <tr className={rowClass}>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
            asignacion.es_despacho ? 'bg-blue-200 text-blue-900' : 'bg-purple-100 text-purple-800'
          }`}>
            {asignacion.es_despacho ? '🚗' : numeroSalida}
          </span>
        </td>
        <td className="px-4 py-3">
          <EditableCell asignacion={asignacion} field="hora_salida" type="time" />
        </td>
        <td className="px-4 py-3">
          <EditableCell asignacion={asignacion} field="destino" />
        </td>
        <td className="px-4 py-3">
          <EditableCell asignacion={asignacion} field="producto" />
        </td>
        <td className="px-4 py-3">
          <EditableCell asignacion={asignacion} field="estatus" type="select" />
        </td>
        <td className="px-4 py-3 text-center">
          <EditableCell asignacion={asignacion} field="fuera_ciudad" type="checkbox" />
        </td>
        <td className="px-4 py-3">
          <EditableCell asignacion={asignacion} field="notas" />
        </td>
        <td className="px-4 py-3 text-center">
          {asignacion.es_despacho ? (
            <span className="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-100 rounded">
              DESPACHO FLOTA
            </span>
          ) : (
            <button
              onClick={() => handleDeleteAsignacion(asignacion.id)}
              className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50"
              title="Eliminar asignación"
            >
              <Trash2 size={18} />
            </button>
          )}
        </td>
      </tr>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando asignaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Video className="text-purple-600" size={28} />
            Asignación Realizadores
          </h2>
          <p className="text-gray-600 mt-1">
            Gestión del flujo de realizadores - {currentDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg px-4 py-2">
          <p className="text-sm text-gray-600">Turno Actual</p>
          <p className="text-lg font-bold text-purple-700 capitalize">{turnoActual}</p>
          <p className="text-xs text-gray-500">
            {turnoActual === 'mañana' ? '8:00 - 13:00' : '13:00 - 20:00'}
          </p>
        </div>
      </div>

      {/* Tarjetas de disponibilidad */}
      {disponibilidad && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Realizadores Disponibles */}
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Realizadores</p>
                <p className={`text-3xl font-bold mt-2 ${
                  disponibilidad.disponibles === 0 ? 'text-red-600 animate-pulse' : 'text-gray-900'
                }`}>
                  {disponibilidad.disponibles || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  de {disponibilidad.total || 0} En Canal
                </p>
              </div>
              <Video className="text-purple-500" size={40} />
            </div>
          </div>

          {/* Ocupados */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-4 border border-purple-200">
            <p className="text-sm text-gray-600 mb-2">Realizadores Ocupados</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">En Asignaciones:</span>
                <span className="font-semibold text-gray-900">{disponibilidad.en_asignaciones || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">En Despachos:</span>
                <span className="font-semibold text-gray-900">{disponibilidad.en_despachos || 0}</span>
              </div>
              <div className="flex justify-between border-t border-purple-300 pt-1 mt-1">
                <span className="text-gray-700 font-medium">Total:</span>
                <span className="font-bold text-purple-600">{disponibilidad.ocupados || 0}</span>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-4 text-white">
            <p className="text-sm opacity-90 mb-2">Estado del Sistema</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Actualización automática</span>
              </div>
              <div className="text-xs opacity-75 mt-2">
                Los datos se actualizan cada 30 segundos incluyendo despachos activos de flotas
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de asignaciones */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {personal.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Video size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg">No hay realizadores registrados</p>
          </div>
        ) : (
          personal.map((persona) => {
            const asignacionesPersona = getAsignacionesPersonal(persona.id);

            return (
              <div key={persona.id} className="border-b last:border-b-0">
                {/* Cabecera del personal */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div className="text-white">
                      <h3 className="text-lg font-bold">{persona.name}</h3>
                      <p className="text-purple-100 text-sm">{persona.area}</p>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map((num) => {
                        const tieneAsignacion = asignacionesPersona.some(a => parseInt(a.numero_salida) === num);
                        return (
                          <button
                            key={num}
                            onClick={() => handleAddAsignacion(persona.id, num)}
                            disabled={tieneAsignacion}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                              tieneAsignacion
                                ? 'bg-purple-800 text-purple-300 cursor-not-allowed opacity-50'
                                : 'bg-white text-purple-600 hover:bg-purple-50'
                            }`}
                            title={tieneAsignacion ? 'Ya tiene esta salida asignada' : `Agregar salida ${num}`}
                          >
                            <Plus size={18} className="inline mr-1" />
                            Salida {num}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Tabla de salidas */}
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                        Salida
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                        <Clock size={14} className="inline mr-1" />
                        Hora
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <MapPin size={14} className="inline mr-1" />
                        Destino/Locación
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Producto/Programa
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">
                        Estatus
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                        Fuera Ciudad
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Notas
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((numeroSalida) => {
                      const asignacion = asignacionesPersona.find(a => parseInt(a.numero_salida) === numeroSalida);
                      console.log(`Buscando salida ${numeroSalida}, encontrado:`, asignacion);
                      return (
                        <AsignacionRow
                          key={numeroSalida}
                          asignacion={asignacion}
                          numeroSalida={numeroSalida}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </div>

      {/* Leyenda de estatus */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Leyenda de Estatus:</h4>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-700">En Canal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-sm text-gray-700">En Trayecto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
            <span className="text-sm text-gray-700">En Locación</span>
          </div>
        </div>
      </div>
    </div>
  );
};
