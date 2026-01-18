// src/components/Assignments/AsignacionReporteria.jsx
import React, { useState, useEffect } from 'react';
import { Camera, Users, MapPin, Clock, AlertCircle, Plus, Save, Trash2, X, Car } from 'lucide-react';
import {
  getAsignacionesReporteriaByFecha,
  createAsignacionReporteria,
  updateAsignacionReporteria,
  deleteAsignacionReporteria,
} from '../../services/asignacionesService';

export const AsignacionReporteria = ({ currentDate }) => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [camarografos, setCamarografos] = useState([]);
  const [asistentes, setAsistentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('camarografos'); // 'camarografos' o 'asistentes'
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [despachos, setDespachos] = useState([]);

  // Formatear fecha sin conversión de zona horaria
  const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

  // Cargar personal de reportería CON TURNOS del día
  useEffect(() => {
    const fetchPersonalConTurnos = async () => {
      try {
        // Obtener shifts automáticos del día (incluye rotación de grupos)
        const response = await fetch(`http://localhost:3000/api/schedule/auto-shifts/${fecha}`);
        const shifts = await response.json();

        // Filtrar solo personal de reportería que tiene turno HOY
        const camaras = shifts.filter(s => s.area === 'CAMARÓGRAFOS DE REPORTERÍA');
        const asis = shifts.filter(s => s.area === 'ASISTENTES DE REPORTERÍA');

        // Mapear a formato esperado (personnel_id, name, area)
        const camarasData = camaras.map(s => ({
          id: s.personnel_id,
          name: s.name,
          area: s.area,
          shift_start: s.shift_start,
          shift_end: s.shift_end,
          grupo_reporteria: s.grupo_reporteria,
          turno_rotado: s.turno_rotado
        }));

        const asistentesData = asis.map(s => ({
          id: s.personnel_id,
          name: s.name,
          area: s.area,
          shift_start: s.shift_start,
          shift_end: s.shift_end,
          grupo_reporteria: s.grupo_reporteria,
          turno_rotado: s.turno_rotado
        }));

        // Ordenar por turno: AM primero, luego PM
        const sortByTurno = (a, b) => {
          if (a.turno_rotado === 'AM' && b.turno_rotado === 'PM') return -1;
          if (a.turno_rotado === 'PM' && b.turno_rotado === 'AM') return 1;
          return a.name.localeCompare(b.name); // Si mismo turno, ordenar alfabéticamente
        };

        setCamarografos(camarasData.sort(sortByTurno));
        setAsistentes(asistentesData.sort(sortByTurno));
      } catch (error) {
        console.error('Error al cargar personal con turnos:', error);
      }
    };
    fetchPersonalConTurnos();
  }, [fecha]);

  // Cargar disponibilidad (incluye despachos)
  useEffect(() => {
    const fetchDisponibilidad = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/reporteria-espacios/disponibilidad/${fecha}`);
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
        // Filtrar solo despachos activos (PROGRAMADO o EN_RUTA) con personal de reportería
        const despachosActivos = data.filter(d =>
          (d.status === 'PROGRAMADO' || d.status === 'EN_RUTA') && (d.cameraman_id || d.assistant_id)
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
      console.log('📅 Cargando asignaciones para fecha:', fecha);
      const data = await getAsignacionesReporteriaByFecha(fecha);
      console.log('📦 Datos recibidos:', data);
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
      await createAsignacionReporteria(newAsignacion);
      loadAsignaciones();
    } catch (error) {
      console.error('Error al crear asignación:', error);
      alert(`Error al crear asignación: ${error.message}`);
    }
  };

  // Actualizar asignación
  const handleUpdateAsignacion = async (id, field, value) => {
    try {
      await updateAsignacionReporteria(id, { [field]: value });
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
      await deleteAsignacionReporteria(id);
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

    // Buscar si este camarógrafo o asistente está en un despacho activo
    const despachoPersonal = despachos.find(d =>
      d.cameraman_id === personalId || d.assistant_id === personalId
    );

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
  const EditableCell = ({ asignacion, field, type = 'text', placeholder = 'Click para editar' }) => {
    // Si es un despacho, mostrar solo lectura con fondo diferente
    if (asignacion.es_despacho) {
      const value = asignacion[field] || '';
      return (
        <div className="w-full p-2 bg-blue-50 rounded text-sm min-h-[2.5rem] flex items-center border border-blue-200">
          <span className="text-blue-900 font-medium">{value}</span>
        </div>
      );
    }

    const getInitialValue = () => {
      const fieldValue = asignacion[field];
      if ((field === 'hora_salida' || field === 'hora_llegada') && fieldValue) {
        return fieldValue.substring(0, 5); // "08:00:00" -> "08:00"
      }
      return fieldValue || '';
    };

    const [value, setValue] = useState(getInitialValue());
    const [isEditing, setIsEditing] = useState(false);

    // Sincronizar valor cuando cambia el asignacion
    useEffect(() => {
      setValue(getInitialValue());
    }, [asignacion[field]]);

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
        setValue(getInitialValue());
        setIsEditing(false);
      }
    };

    // Select (estatus)
    if (type === 'select') {
      return (
        <select
          value={asignacion[field]}
          onChange={(e) => handleUpdateAsignacion(asignacion.id, field, e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="En Canal">En Canal</option>
          <option value="En Trayecto">En Trayecto</option>
          <option value="En Locación">En Locación</option>
        </select>
      );
    }

    // Checkbox (fuera_ciudad)
    if (type === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={asignacion[field] || false}
          onChange={(e) => handleUpdateAsignacion(asignacion.id, field, e.target.checked)}
          className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
        />
      );
    }

    // Editable input
    if (isEditing) {
      return (
        <input
          type={type}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full p-2 border-2 border-blue-500 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
        />
      );
    }

    return (
      <div
        onClick={() => setIsEditing(true)}
        className="w-full p-2 cursor-pointer hover:bg-gray-50 rounded text-sm min-h-[2.5rem] flex items-center"
        title="Click para editar"
      >
        {asignacion[field] || <span className="text-gray-400">{placeholder}</span>}
      </div>
    );
  };

  // Componente de fila de asignación
  const AsignacionRow = ({ asignacion, numeroSalida }) => {
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
            asignacion.es_despacho ? 'bg-blue-200 text-blue-900' : 'bg-orange-100 text-orange-800'
          }`}>
            {asignacion.es_despacho ? '🚗' : numeroSalida}
          </span>
        </td>
        <td className="px-4 py-3">
          <EditableCell asignacion={asignacion} field="hora_salida" type="time" />
        </td>
        <td className="px-4 py-3">
          <EditableCell asignacion={asignacion} field="destino" placeholder="Destino/Locación" />
        </td>
        <td className="px-4 py-3">
          <EditableCell asignacion={asignacion} field="producto" placeholder="Producto/Programa" />
        </td>
        <td className="px-4 py-3">
          <EditableCell asignacion={asignacion} field="estatus" type="select" />
        </td>
        <td className="px-4 py-3 text-center">
          <EditableCell asignacion={asignacion} field="fuera_ciudad" type="checkbox" />
        </td>
        <td className="px-4 py-3">
          <EditableCell asignacion={asignacion} field="notas" placeholder="Notas adicionales" />
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

  // Renderizar tabla de personal
  const renderPersonalTable = (personalList, colorClass) => {
    if (personalList.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Camera size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg">No hay personal registrado</p>
        </div>
      );
    }

    return personalList.map((persona) => {
      const asignacionesPersona = getAsignacionesPersonal(persona.id);

      // Determinar colores según turno AM/PM
      const esAM = persona.turno_rotado === 'AM';
      const gradientClass = esAM
        ? (colorClass === 'orange' ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-indigo-600')
        : (colorClass === 'orange' ? 'from-orange-600 to-red-600' : 'from-indigo-600 to-purple-700');

      const textColorClass = esAM
        ? (colorClass === 'orange' ? 'text-amber-100' : 'text-blue-100')
        : (colorClass === 'orange' ? 'text-orange-100' : 'text-indigo-100');

      return (
        <div key={persona.id} className="border-b last:border-b-0">
          {/* Cabecera del personal */}
          <div className={`bg-gradient-to-r ${gradientClass} px-6 py-4`}>
            <div className="flex justify-between items-center">
              <div className="text-white">
                <h3 className="text-lg font-bold">{persona.name}</h3>
                <p className={`${textColorClass} text-sm`}>
                  {persona.area}
                </p>
                {persona.shift_start && persona.shift_end && (
                  <p className="text-white text-xs mt-1 opacity-90">
                    <Clock size={12} className="inline mr-1" />
                    Turno: {persona.shift_start.substring(0, 5)} - {persona.shift_end.substring(0, 5)}
                    <span className="ml-1 px-2 py-0.5 bg-white bg-opacity-20 rounded font-semibold">
                      {persona.turno_rotado}
                    </span>
                  </p>
                )}
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
                          ? `${colorClass === 'orange' ? 'bg-orange-800 text-orange-300' : 'bg-indigo-800 text-indigo-300'} cursor-not-allowed opacity-50`
                          : 'bg-white hover:bg-gray-50 ' + (colorClass === 'orange' ? 'text-orange-600' : 'text-indigo-600')
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
            <thead className={colorClass === 'orange' ? 'bg-amber-50' : 'bg-indigo-50'}>
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
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
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
            <Camera className="text-orange-600" size={28} />
            Asignación Manual de Reportería
          </h2>
          <p className="text-gray-600 mt-1">
            Gestión diaria de espacios de salida - {currentDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Tarjetas de disponibilidad */}
      {disponibilidad && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Camarógrafos */}
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Camarógrafos</p>
                <p className={`text-3xl font-bold mt-2 ${
                  disponibilidad.camarografos?.disponibles === 0 ? 'text-red-600 animate-pulse' : 'text-gray-900'
                }`}>
                  {disponibilidad.camarografos?.disponibles || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  de {disponibilidad.camarografos?.total || 0} En Canal
                </p>
              </div>
              <Camera className="text-orange-500" size={40} />
            </div>
          </div>

          {/* Asistentes */}
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Asistentes</p>
                <p className={`text-3xl font-bold mt-2 ${
                  disponibilidad.asistentes?.disponibles === 0 ? 'text-red-600 animate-pulse' : 'text-gray-900'
                }`}>
                  {disponibilidad.asistentes?.disponibles || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  de {disponibilidad.asistentes?.total || 0} En Canal
                </p>
              </div>
              <Users className="text-indigo-500" size={40} />
            </div>
          </div>

          {/* Ocupados Camarógrafos */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md p-4 border border-orange-200">
            <p className="text-sm text-gray-600 mb-2">Camarógrafos Ocupados</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">En Espacios:</span>
                <span className="font-semibold text-gray-900">{disponibilidad.camarografos?.en_espacios || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">En Despachos:</span>
                <span className="font-semibold text-gray-900">{disponibilidad.camarografos?.en_despachos || 0}</span>
              </div>
              <div className="flex justify-between border-t border-orange-300 pt-1 mt-1">
                <span className="text-gray-700 font-medium">Total:</span>
                <span className="font-bold text-orange-600">{disponibilidad.camarografos?.ocupados || 0}</span>
              </div>
            </div>
          </div>

          {/* Ocupados Asistentes */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-md p-4 border border-indigo-200">
            <p className="text-sm text-gray-600 mb-2">Asistentes Ocupados</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">En Espacios:</span>
                <span className="font-semibold text-gray-900">{disponibilidad.asistentes?.en_espacios || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">En Despachos:</span>
                <span className="font-semibold text-gray-900">{disponibilidad.asistentes?.en_despachos || 0}</span>
              </div>
              <div className="flex justify-between border-t border-indigo-300 pt-1 mt-1">
                <span className="text-gray-700 font-medium">Total:</span>
                <span className="font-bold text-indigo-600">{disponibilidad.asistentes?.ocupados || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('camarografos')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'camarografos'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Camera size={18} className="inline mr-2" />
            Camarógrafos de Reportería
          </button>
          <button
            onClick={() => setActiveTab('asistentes')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'asistentes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users size={18} className="inline mr-2" />
            Asistentes de Reportería
          </button>
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {activeTab === 'camarografos' && renderPersonalTable(camarografos, 'orange')}
        {activeTab === 'asistentes' && renderPersonalTable(asistentes, 'indigo')}
      </div>

      {/* Leyenda informativa */}
      <div className="bg-blue-50 border-l-4 border-blue-600 rounded-r-lg p-4">
        <h4 className="font-bold text-base text-blue-900 mb-2">ℹ️ Información Importante</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Esta vista permite gestionar manualmente los espacios de salida día a día</li>
          <li>• Los cambios aquí NO afectan la rotación automática ni los horarios en la programación principal</li>
          <li>• Cada persona tiene hasta 3 salidas disponibles por día</li>
          <li>• <strong>Haga clic en cualquier campo</strong> para editarlo directamente</li>
          <li>• Los cambios se guardan automáticamente al salir del campo o presionar Enter</li>
          <li>• Presione Escape para cancelar la edición</li>
        </ul>
      </div>
    </div>
  );
};

export default AsignacionReporteria;
