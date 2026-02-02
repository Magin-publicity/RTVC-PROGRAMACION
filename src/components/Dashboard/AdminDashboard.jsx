import { useState, useEffect, useRef } from 'react';
import { Users, Calendar, AlertCircle, TrendingUp, CheckCircle, Camera, Video, AlertTriangle, Bus, X } from 'lucide-react';
import { getDepartmentByRole } from '../../data/departments';
import { getDisponibilidadRealizadores } from '../../services/asignacionesService';
import { formatDateRange } from '../../utils/dateUtils';
import { useContractValidation } from '../../hooks/useContractValidation';
import { PersonnelAreaCards } from './PersonnelAreaCards';

export const AdminDashboard = ({ personnel, novelties, currentDate }) => {
  const [disponibilidadRealizadores, setDisponibilidadRealizadores] = useState(null);
  const [disponibilidadCamarografos, setDisponibilidadCamarografos] = useState(null);
  const [disponibilidadAsistentes, setDisponibilidadAsistentes] = useState(null);
  const [fleetStats, setFleetStats] = useState(null);
  const [liveuStats, setLiveuStats] = useState(null);
  const [showLiveuModal, setShowLiveuModal] = useState(false);
  const [liveuEquipment, setLiveuEquipment] = useState([]);
  const [liveuDetalle, setLiveuDetalle] = useState([]);
  const [showAddLiveuForm, setShowAddLiveuForm] = useState(false);
  const [editingLiveu, setEditingLiveu] = useState(null);

  // Nuevos estados para modales de personal
  const [showCamarografosModal, setShowCamarografosModal] = useState(false);
  const [showRealizadoresModal, setShowRealizadoresModal] = useState(false);
  const [showAsistentesModal, setShowAsistentesModal] = useState(false);
  const [showFlotaModal, setShowFlotaModal] = useState(false);
  const [showQuickStatusModal, setShowQuickStatusModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [targetStatus, setTargetStatus] = useState(null);
  const [statusObservation, setStatusObservation] = useState('');
  const [camarografosDetalle, setCamarografosDetalle] = useState([]);
  const [realizadoresDetalle, setRealizadoresDetalle] = useState([]);
  const [asistentesDetalle, setAsistentesDetalle] = useState([]);
  const [flotaDetalle, setFlotaDetalle] = useState([]);
  const dataLoadedRef = useRef(false); // Bandera para evitar cargas duplicadas

  // Hook de validación de contratos
  const { contractStatus } = useContractValidation(personnel);

  // Convertir fecha a string para usarla como dependencia estable
  const fechaStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

  // Cargar disponibilidad en tiempo real
  useEffect(() => {
    // Cargar solo una vez usando la bandera
    if (dataLoadedRef.current) {
      return;
    }
    dataLoadedRef.current = true;

    const loadDisponibilidad = async () => {
      const fecha = fechaStr;

      // NUEVO: Cargar disponibilidad de reportería con datos separados por área
      try {
        console.log('🔍 Solicitando disponibilidad para fecha:', fecha);
        const response = await fetch(`/api/reporteria-espacios/disponibilidad/${fecha}?allDay=true`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        console.log('📡 Respuesta recibida, status:', response.status);
        const data = await response.json();

        console.log('📊 Disponibilidad reportería RAW:', JSON.stringify(data, null, 2));

        // ✅ CORREGIDO: Usar estructura anidada correcta (igual que AsignacionReporteria)
        const camarografosData = {
          total: data.camarografos?.total || 0,
          disponibles: data.camarografos?.disponibles || 0,
          ocupados: data.camarografos?.ocupados || 0
        };

        const asistentesData = {
          total: data.asistentes?.total || 0,
          disponibles: data.asistentes?.disponibles || 0,
          ocupados: data.asistentes?.ocupados || 0
        };

        console.log('🎯 Seteando camarógrafos:', JSON.stringify(camarografosData, null, 2));
        console.log('🎯 Seteando asistentes:', JSON.stringify(asistentesData, null, 2));

        setDisponibilidadCamarografos(camarografosData);
        setDisponibilidadAsistentes(asistentesData);

        console.log('✅ Estados actualizados correctamente');
      } catch (error) {
        console.error('❌ Error al cargar disponibilidad reportería:', error);
      }

      // Cargar disponibilidad de realizadores
      try {
        let realizadoresData = await getDisponibilidadRealizadores(fecha);
        setDisponibilidadRealizadores(realizadoresData);
      } catch (error) {
        console.error('Error al cargar disponibilidad realizadores:', error);
      }

      // NUEVO: Cargar estadísticas de flota
      try {
        console.log('🚐 Consultando flota para fecha:', fecha);

        // Obtener TODOS los vehículos activos
        const vehiclesResponse = await fetch(`/api/fleet/vehicles?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const allVehicles = await vehiclesResponse.json();
        const totalVehicles = allVehicles.filter(v => v.is_active && v.status === 'DISPONIBLE').length;
        console.log('📋 Total vehículos activos:', totalVehicles);

        // Obtener despachos del día
        const dispatchesResponse = await fetch(`/api/fleet/dispatches/${fecha}?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const dispatchesData = await dispatchesResponse.json();
        console.log('📋 Dispatches data:', dispatchesData);

        // Filtrar despachos que aún están activos (considerar hora de retorno)
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const activeDispatches = dispatchesData.filter(d => {
          if (d.status !== 'EN_RUTA' && d.status !== 'PROGRAMADO') return false;

          // Si el conductor retorna y ya pasó la hora, el vehículo ya no está despachado
          if (d.conductor_retorna && d.hora_retorno_conductor && currentTime >= d.hora_retorno_conductor) {
            return false;
          }

          return true;
        });

        const dispatched = activeDispatches.length;

        setFleetStats({
          enCanal: totalVehicles - dispatched, // Total vehículos menos los despachados
          despachados: dispatched,
          total: totalVehicles
        });

        console.log('🚐 Estadísticas de flota:', { fecha, totalVehicles, dispatched, dispatchesCount: dispatchesData.length });
      } catch (error) {
        console.error('❌ Error al cargar estadísticas de flota:', error);
        setFleetStats({
          enCanal: 0,
          despachados: 0,
          total: 0
        });
      }

      // NUEVO: Cargar estadísticas de LiveU para la fecha actual del dashboard
      try {
        console.log('📡 Consultando equipos LiveU...');
        const liveuResponse = await fetch(`/api/logistics/liveu/stats?date=${fecha}&t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const liveuData = await liveuResponse.json();
        console.log('📡 Estadísticas LiveU:', liveuData);
        setLiveuStats(liveuData);
      } catch (error) {
        console.error('❌ Error al cargar estadísticas LiveU:', error);
        setLiveuStats({
          disponibles: 0,
          en_terreno: 0,
          en_reparacion: 0,
          total: 0
        });
      }

      // Cargar todos los equipos LiveU para el modal (con información de despachos)
      try {
        const allLiveuResponse = await fetch(`/api/logistics/liveu/detalle/${fecha}?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const allLiveuData = await allLiveuResponse.json();
        setLiveuEquipment(allLiveuData);
      } catch (error) {
        console.error('❌ Error al cargar equipos LiveU completos:', error);
        setLiveuEquipment([]);
      }
    };

    loadDisponibilidad();
    // Actualizar cada 30 segundos - DESHABILITADO TEMPORALMENTE para evitar bucles
    // const interval = setInterval(loadDisponibilidad, 30000);
    // return () => clearInterval(interval);
  }, [fechaStr]); // Usar fechaStr en lugar de currentDate para evitar re-renders innecesarios

  // Función para recargar datos de LiveU
  const reloadLiveuData = async () => {
    try {
      const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const allLiveuResponse = await fetch(`/api/logistics/liveu/detalle/${fecha}?t=${Date.now()}`);
      const allLiveuData = await allLiveuResponse.json();
      setLiveuEquipment(allLiveuData);

      const liveuStatsResponse = await fetch(`/api/logistics/liveu/stats?date=${fecha}&t=${Date.now()}`);
      const liveuStatsData = await liveuStatsResponse.json();
      setLiveuStats(liveuStatsData);
    } catch (error) {
      console.error('Error recargando datos LiveU:', error);
    }
  };

  // Función para actualizar estado de LiveU
  const handleUpdateLiveuStatus = async (liveuId, newStatus, notes = '') => {
    try {
      const response = await fetch(`/api/logistics/liveu/${liveuId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      if (response.ok) {
        await reloadLiveuData();
        alert('Estado del equipo LiveU actualizado correctamente');
      } else {
        alert('Error al actualizar el estado del equipo LiveU');
      }
    } catch (error) {
      console.error('Error al actualizar LiveU:', error);
      alert('Error al actualizar el estado del equipo LiveU');
    }
  };

  // Función para agregar nuevo equipo LiveU
  const handleAddLiveu = async (equipmentCode, serialNumber) => {
    try {
      const response = await fetch(`/api/logistics/liveu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipment_code: equipmentCode,
          serial_number: serialNumber,
          status: 'DISPONIBLE'
        }),
      });

      if (response.ok) {
        await reloadLiveuData();
        setShowAddLiveuForm(false);
        alert('Equipo LiveU agregado correctamente');
      } else {
        const error = await response.json();
        alert(`Error al agregar equipo: ${error.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al agregar LiveU:', error);
      alert('Error al agregar equipo LiveU');
    }
  };

  // Función para editar equipo LiveU
  const handleEditLiveu = async (liveuId, equipmentCode, serialNumber) => {
    try {
      const response = await fetch(`/api/logistics/liveu/${liveuId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipment_code: equipmentCode,
          serial_number: serialNumber
        }),
      });

      if (response.ok) {
        await reloadLiveuData();
        setEditingLiveu(null);
        alert('Equipo LiveU actualizado correctamente');
      } else {
        alert('Error al actualizar equipo LiveU');
      }
    } catch (error) {
      console.error('Error al editar LiveU:', error);
      alert('Error al editar equipo LiveU');
    }
  };

  // Función para cambio rápido de estado de vehículo
  const handleQuickStatusChange = (vehiculo, status) => {
    setSelectedVehicle(vehiculo);
    setTargetStatus(status);
    setStatusObservation('');
    setShowQuickStatusModal(true);
  };

  // Función para confirmar cambio de estado
  const confirmQuickStatusChange = async () => {
    if (!selectedVehicle || !targetStatus) return;

    try {
      const response = await fetch(`/api/fleet/vehicles/${selectedVehicle.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: targetStatus,
          notes: statusObservation || 'Cambio rápido de estado desde dashboard'
        }),
      });

      if (response.ok) {
        // Recargar datos de flota
        const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

        // Recargar estadísticas
        const statsResponse = await fetch(`/api/fleet/stats?date=${fecha}&t=${Date.now()}`);
        const statsData = await statsResponse.json();
        setFleetStats(statsData);

        // Recargar vehículos
        const vehiclesResponse = await fetch(`/api/fleet/vehicles?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        const vehiclesData = await vehiclesResponse.json();
        setFleetVehicles(vehiclesData);

        // Cerrar modales
        setShowQuickStatusModal(false);
        setSelectedVehicle(null);
        setTargetStatus(null);
        setStatusObservation('');

        alert('Estado del vehículo actualizado correctamente');
      } else {
        const error = await response.json();
        alert(`Error al actualizar estado: ${error.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al cambiar estado del vehículo:', error);
      alert('Error al actualizar estado del vehículo');
    }
  };

  // Función para eliminar equipo LiveU
  const handleDeleteLiveu = async (liveuId, equipmentCode) => {
    if (!confirm(`¿Está seguro de eliminar el equipo ${equipmentCode}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/logistics/liveu/${liveuId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await reloadLiveuData();
        alert('Equipo LiveU eliminado correctamente');
      } else {
        const error = await response.json();
        alert(`Error al eliminar equipo: ${error.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al eliminar LiveU:', error);
      alert('Error al eliminar equipo LiveU');
    }
  };

  // Funciones para cargar detalle del personal
  const loadCamarografosDetalle = async () => {
    try {
      const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const response = await fetch(`/api/reporteria-espacios/detalle/camarografos/${fecha}?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      setCamarografosDetalle(data);
      setShowCamarografosModal(true);
    } catch (error) {
      console.error('Error al cargar detalle de camarógrafos:', error);
      setCamarografosDetalle([]);
      setShowCamarografosModal(true);
    }
  };

  const loadRealizadoresDetalle = async () => {
    try {
      const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const response = await fetch(`/api/asignaciones-realizadores/detalle/${fecha}?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      setRealizadoresDetalle(data);
      setShowRealizadoresModal(true);
    } catch (error) {
      console.error('Error al cargar detalle de realizadores:', error);
      setRealizadoresDetalle([]);
      setShowRealizadoresModal(true);
    }
  };

  const loadAsistentesDetalle = async () => {
    try {
      const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const response = await fetch(`/api/reporteria-espacios/detalle/asistentes/${fecha}?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      setAsistentesDetalle(data);
      setShowAsistentesModal(true);
    } catch (error) {
      console.error('Error al cargar detalle de asistentes:', error);
      setAsistentesDetalle([]);
      setShowAsistentesModal(true);
    }
  };

  const loadFlotaDetalle = async () => {
    try {
      const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const response = await fetch(`/api/fleet/detalle/${fecha}?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      setFlotaDetalle(data);
      setShowFlotaModal(true);
    } catch (error) {
      console.error('Error al cargar detalle de flota:', error);
      setFlotaDetalle([]);
      setShowFlotaModal(true);
    }
  };

  const loadLiveuDetalle = async () => {
    try {
      const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const response = await fetch(`/api/logistics/liveu/detalle/${fecha}?t=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await response.json();
      setLiveuDetalle(data);
      setShowLiveuModal(true);
    } catch (error) {
      console.error('Error al cargar detalle de LiveU:', error);
      setLiveuDetalle([]);
      setShowLiveuModal(true);
    }
  };

  // Calcular estadísticas
  const totalPersonnel = personnel.length;
  const activePersonnel = personnel.filter(p => p.active).length;

  // Filtrar solo novedades activas (no expiradas)
  // IMPORTANTE: Las fechas de fin se consideran inclusivas (todo el día hasta 23:59:59)
  const todayNovelties = novelties.filter(n => {
    // CRÍTICO: Usar fecha LOCAL, no UTC, para evitar problemas de zona horaria
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;

    if (n.start_date && n.end_date) {
      const startDateStr = n.start_date.split('T')[0];
      const endDateStr = n.end_date.split('T')[0];
      // Comparar solo fechas (strings), así "2026-01-10" es válido todo el día 10
      return todayStr >= startDateStr && todayStr <= endDateStr;
    }
    if (n.start_date && !n.end_date) {
      return todayStr >= n.start_date.split('T')[0];
    }
    if (n.date) {
      return n.date.split('T')[0] === todayStr;
    }
    return false;
  }).length;

  // Agrupar personal por área/departamento
  const personnelByArea = personnel.reduce((acc, person) => {
    // Intentar obtener el departamento por el rol
    const department = getDepartmentByRole(person.role);
    const areaName = department ? department.name : (person.area || 'Sin área');
    acc[areaName] = (acc[areaName] || 0) + 1;
    return acc;
  }, {});

  // Novedades recientes - mostrar las últimas 10, incluyendo las recién expiradas
  // Para "Novedades Recientes" mostramos las últimas independientemente de si están activas
  // NUEVO: Agrupar novelties por persona + descripción para evitar duplicados visuales
  const groupedNovelties = novelties.reduce((acc, novelty) => {
    const key = `${novelty.personnel_id}-${novelty.description || 'sin-desc'}`;

    if (!acc[key]) {
      acc[key] = novelty;
    } else {
      // Si ya existe, mantener la que tenga start_date más reciente
      const existingDate = new Date(acc[key].start_date || acc[key].date || acc[key].created_at);
      const currentDate = new Date(novelty.start_date || novelty.date || novelty.created_at);
      if (currentDate > existingDate) {
        acc[key] = novelty;
      }
    }

    return acc;
  }, {});

  const recentNovelties = Object.values(groupedNovelties)
    .sort((a, b) => {
      // Ordenar por fecha más reciente primero
      const dateA = new Date(a.start_date || a.date || a.created_at);
      const dateB = new Date(b.start_date || b.date || b.created_at);
      return dateB - dateA;
    })
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600 mt-2">Resumen general del sistema de programación</p>
      </div>

      {/* Tarjetas de estadísticas */}
      {/* PRIMERA FILA: DISPONIBILIDAD TÉCNICA (CRÍTICO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* 1. Disponibilidad Camarógrafos */}
        <div
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg hover:border-2 hover:border-green-400 transition-all"
          onClick={loadCamarografosDetalle}
          title="Click para ver detalle de camarógrafos"
        >
          <div className="flex items-center justify-between">
            <div className="w-full">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                Disponibilidad Camarógrafos
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Click para detalle</span>
              </p>
              {(() => {
                console.log('🖼️ RENDER Camarógrafos - Estado:', disponibilidadCamarografos);
                return null;
              })()}
              {disponibilidadCamarografos ? (
                <>
                  <p className={`text-3xl font-bold mt-2 transition-all ${
                    disponibilidadCamarografos.disponibles === 0
                      ? 'text-red-600 animate-pulse'
                      : 'text-gray-900'
                  }`}>
                    {disponibilidadCamarografos.disponibles}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    de {disponibilidadCamarografos.total} En Canal
                  </p>
                  {disponibilidadCamarografos.grupoActivo && (
                    <p className="text-xs font-semibold text-blue-600 mt-2 bg-blue-50 px-2 py-1 rounded inline-block">
                      {disponibilidadCamarografos.grupoActivo === 'GRUPO_A' ? '🌅' : '🌆'} {disponibilidadCamarografos.grupoActivo.replace('_', ' ')} {disponibilidadCamarografos.horarioGrupo}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-400 mt-2">...</p>
              )}
            </div>
            <div className={`p-3 rounded-full transition-all ${
              disponibilidadCamarografos?.disponibles === 0
                ? 'bg-red-100 animate-pulse'
                : 'bg-green-100'
            }`}>
              <Camera size={32} className={
                disponibilidadCamarografos?.disponibles === 0
                  ? 'text-red-600'
                  : 'text-green-600'
              } />
            </div>
          </div>
        </div>

        {/* 2. Disponibilidad Realizadores */}
        <div
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg hover:border-2 hover:border-purple-400 transition-all"
          onClick={loadRealizadoresDetalle}
          title="Click para ver detalle de realizadores"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 flex items-center gap-2">
                Disponibilidad Realizadores
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Click para detalle</span>
              </p>
              {disponibilidadRealizadores ? (
                <>
                  <p className={`text-3xl font-bold mt-2 transition-all ${
                    disponibilidadRealizadores.disponibles === 0
                      ? 'text-red-600 animate-pulse'
                      : 'text-gray-900'
                  }`}>
                    {disponibilidadRealizadores.disponibles}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    de {disponibilidadRealizadores.total} En Canal
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-400 mt-2">...</p>
              )}
            </div>
            <div className={`p-3 rounded-full transition-all ${
              disponibilidadRealizadores?.disponibles === 0
                ? 'bg-red-100 animate-pulse'
                : 'bg-purple-100'
            }`}>
              <Video size={32} className={
                disponibilidadRealizadores?.disponibles === 0
                  ? 'text-red-600'
                  : 'text-purple-600'
              } />
            </div>
          </div>
        </div>

        {/* 3. Disponibilidad Asistentes */}
        <div
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg hover:border-2 hover:border-cyan-400 transition-all"
          onClick={loadAsistentesDetalle}
          title="Click para ver detalle de asistentes"
        >
          <div className="flex items-center justify-between">
            <div className="w-full">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                Disponibilidad Asistentes
                <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">Click para detalle</span>
              </p>
              {(() => {
                console.log('🖼️ RENDER Asistentes - Estado:', disponibilidadAsistentes);
                return null;
              })()}
              {disponibilidadAsistentes ? (
                <>
                  <p className={`text-3xl font-bold mt-2 transition-all ${
                    disponibilidadAsistentes.disponibles === 0
                      ? 'text-red-600 animate-pulse'
                      : 'text-gray-900'
                  }`}>
                    {disponibilidadAsistentes.disponibles}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    de {disponibilidadAsistentes.total} En Canal
                  </p>
                  {disponibilidadAsistentes.grupoActivo && (
                    <p className="text-xs font-semibold text-cyan-600 mt-2 bg-cyan-50 px-2 py-1 rounded inline-block">
                      {disponibilidadAsistentes.grupoActivo === 'GRUPO_A' ? '🌅' : '🌆'} {disponibilidadAsistentes.grupoActivo.replace('_', ' ')} {disponibilidadAsistentes.horarioGrupo}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-400 mt-2">...</p>
              )}
            </div>
            <div className={`p-3 rounded-full transition-all ${
              disponibilidadAsistentes?.disponibles === 0
                ? 'bg-red-100 animate-pulse'
                : 'bg-cyan-100'
            }`}>
              <Camera size={32} className={
                disponibilidadAsistentes?.disponibles === 0
                  ? 'text-red-600'
                  : 'text-cyan-600'
              } />
            </div>
          </div>
        </div>

        {/* 4. Equipos LiveU */}
        <div
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg hover:border-2 hover:border-blue-400 transition-all"
          onClick={() => setShowLiveuModal(true)}
          title="Click para gestionar equipos LiveU"
        >
          <div className="flex items-center justify-between">
            <div className="w-full">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                Equipos LiveU
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Click para gestionar</span>
              </p>
              {liveuStats ? (
                <>
                  <p className={`text-3xl font-bold mt-2 transition-all ${
                    liveuStats.disponibles === 0
                      ? 'text-red-600 animate-pulse'
                      : 'text-green-600'
                  }`}>
                    {liveuStats.disponibles}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    de {liveuStats.total} Disponibles
                  </p>
                  <div className="text-xs mt-2 space-y-1">
                    <p className="text-blue-600">🔵 {liveuStats.en_terreno} En Terreno</p>
                    {liveuStats.en_reparacion > 0 && (
                      <p className="text-red-600">🔴 {liveuStats.en_reparacion} Reparación</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-400 mt-2">...</p>
              )}
            </div>
            <div className={`p-3 rounded-full transition-all ${
              liveuStats?.disponibles === 0
                ? 'bg-red-100 animate-pulse'
                : 'bg-green-100'
            }`}>
              <span className="text-4xl">📡</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEGUNDA FILA: LOGÍSTICA Y NOVEDADES (SOPORTE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* 5. Flota en Canal */}
        <div
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg hover:border-2 hover:border-indigo-400 transition-all"
          onClick={loadFlotaDetalle}
          title="Click para ver detalle de vehículos"
        >
          <div className="flex items-center justify-between">
            <div className="w-full">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                Flota en Canal
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Click para detalle</span>
              </p>
              {fleetStats ? (
                <>
                  <p className={`text-3xl font-bold mt-2 transition-all ${
                    fleetStats.enCanal === 0
                      ? 'text-red-600 animate-pulse'
                      : 'text-gray-900'
                  }`}>
                    {fleetStats.enCanal}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    de {fleetStats.total} En Canal
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-400 mt-2">...</p>
              )}
            </div>
            <div className={`p-3 rounded-full transition-all ${
              fleetStats?.enCanal === 0
                ? 'bg-red-100 animate-pulse'
                : 'bg-indigo-100'
            }`}>
              <Bus size={32} className={
                fleetStats?.enCanal === 0
                  ? 'text-red-600'
                  : 'text-indigo-600'
              } />
            </div>
          </div>
        </div>

        {/* 6. Novedades Hoy */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Novedades Hoy</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{todayNovelties}</p>
              <p className="text-sm text-gray-500 mt-1">Activas</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertCircle size={32} className="text-orange-600" />
            </div>
          </div>
        </div>

        {/* 7. Áreas */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Áreas</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{Object.keys(personnelByArea).length}</p>
              <p className="text-sm text-gray-500 mt-1">Departamentos</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp size={32} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* 8. Personal Total */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Personal Total</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalPersonnel}</p>
              <p className="text-sm text-green-600 mt-1">{activePersonnel} activos</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users size={32} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* TERCERA FILA: INFORMACIÓN ADICIONAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* 9. Programación - Fecha Actual */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Programación</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </p>
              <p className="text-sm text-gray-500 mt-1">Fecha actual</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar size={32} className="text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Widget de Contratos Próximos a Vencer */}
      {(contractStatus.totalExpiringSoon > 0 || contractStatus.totalExpired > 0) && (
        <div className="bg-gradient-to-r from-yellow-50 to-red-50 border-2 border-yellow-400 rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <AlertTriangle size={28} className="text-yellow-700" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">⚠️ Gestión de Contratos</h3>
                <p className="text-sm text-gray-600 mt-1">Requiere atención inmediata</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-red-600">{contractStatus.totalExpired + contractStatus.totalExpiringSoon}</p>
              <p className="text-xs text-gray-600 uppercase tracking-wide">Alertas activas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {contractStatus.totalExpired > 0 && (
              <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-red-800">Contratos Vencidos</span>
                  <span className="bg-red-600 text-white text-lg font-bold px-3 py-1 rounded-full">
                    {contractStatus.totalExpired}
                  </span>
                </div>
                <div className="space-y-2 mt-3 max-h-40 overflow-y-auto">
                  {contractStatus.expired.map(person => (
                    <div key={person.id} className="bg-white bg-opacity-70 rounded p-2 text-sm">
                      <p className="font-semibold text-gray-900">{person.name}</p>
                      <p className="text-xs text-gray-600">{person.role}</p>
                      <p className="text-xs text-red-700 font-medium mt-1">
                        Vencido hace {Math.abs(person.daysUntilExpiry)} día{Math.abs(person.daysUntilExpiry) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contractStatus.totalExpiringSoon > 0 && (
              <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-yellow-800">Vencen en 8 días o menos</span>
                  <span className="bg-yellow-600 text-white text-lg font-bold px-3 py-1 rounded-full">
                    {contractStatus.totalExpiringSoon}
                  </span>
                </div>
                <div className="space-y-2 mt-3 max-h-40 overflow-y-auto">
                  {contractStatus.expiringSoon.map(person => (
                    <div key={person.id} className="bg-white bg-opacity-70 rounded p-2 text-sm">
                      <p className="font-semibold text-gray-900">{person.name}</p>
                      <p className="text-xs text-gray-600">{person.role}</p>
                      <p className="text-xs text-yellow-700 font-medium mt-1">
                        Vence en {person.daysUntilExpiry} día{person.daysUntilExpiry !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white bg-opacity-50 rounded-lg p-3 border border-gray-300">
            <p className="text-sm text-gray-700">
              <strong>Acción requerida:</strong> Los empleados con contratos vencidos no serán asignados automáticamente.
              Puede asignarlos manualmente en caso de emergencia (requiere confirmación).
            </p>
          </div>
        </div>
      )}

      {/* Novedades recientes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Novedades Recientes</h3>
        <div className="space-y-3">
          {recentNovelties.length > 0 ? (
            recentNovelties.map((novelty) => {
              const person = personnel.find(p => p.id === novelty.personnel_id);

              // Verificar si la novedad está activa o expirada
              // IMPORTANTE: Las fechas de fin se consideran inclusivas (todo el día hasta 23:59:59)
              // CRÍTICO: Usar fecha LOCAL, no UTC, para evitar problemas de zona horaria
              const year = currentDate.getFullYear();
              const month = String(currentDate.getMonth() + 1).padStart(2, '0');
              const day = String(currentDate.getDate()).padStart(2, '0');
              const todayStr = `${year}-${month}-${day}`;

              let isActive = true;
              if (novelty.start_date && novelty.end_date) {
                const startDateStr = novelty.start_date.split('T')[0];
                const endDateStr = novelty.end_date.split('T')[0];
                // La novedad está activa si hoy está entre el inicio y el fin (ambos inclusivos)
                isActive = todayStr >= startDateStr && todayStr <= endDateStr;
              } else if (novelty.date) {
                isActive = novelty.date.split('T')[0] === todayStr;
              }

              return (
                <div key={novelty.id} className={`flex items-start gap-3 p-3 rounded-lg ${isActive ? 'bg-orange-50 border border-orange-200' : 'bg-gray-50 border border-gray-200 opacity-70'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-orange-100' : 'bg-gray-200'}`}>
                    <AlertCircle size={16} className={isActive ? 'text-orange-600' : 'text-gray-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                      {person?.name || 'Personal no encontrado'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {novelty.type}
                      {!isActive && <span className="ml-2 text-gray-400">(Finalizada)</span>}
                    </p>
                    {novelty.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{novelty.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatDateRange(novelty.start_date || novelty.date, novelty.end_date)}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle size={48} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm">No hay novedades recientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Nuevo componente de Personal por Área con tarjetas interactivas */}
      <PersonnelAreaCards currentDate={currentDate} />

      {/* Modal de Gestión de Equipos LiveU */}
      {showLiveuModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    📡 Gestión de Equipos LiveU
                  </h2>
                  <p className="text-sm text-blue-100 mt-1">
                    {liveuStats?.disponibles} disponibles | {liveuStats?.en_terreno} en terreno | {liveuStats?.en_reparacion} en reparación
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddLiveuForm(true)}
                    className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2"
                  >
                    ➕ Agregar Equipo
                  </button>
                  <button
                    onClick={() => setShowLiveuModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
              {/* Formulario para agregar nuevo equipo */}
              {showAddLiveuForm && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-3">➕ Agregar Nuevo Equipo LiveU</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const equipmentCode = formData.get('equipment_code');
                      const serialNumber = formData.get('serial_number');
                      handleAddLiveu(equipmentCode, serialNumber);
                      e.target.reset();
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Código de Equipo *
                        </label>
                        <input
                          type="text"
                          name="equipment_code"
                          required
                          placeholder="Ej: LU-012"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Número de Serie
                        </label>
                        <input
                          type="text"
                          name="serial_number"
                          placeholder="Ej: SN-123456"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-all"
                      >
                        ✅ Guardar Equipo
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddLiveuForm(false)}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all"
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {liveuEquipment.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl block mb-4">📡</span>
                  <p className="text-lg">No hay equipos LiveU registrados</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {liveuEquipment.map((liveu) => {
                    const statusColors = {
                      'DISPONIBLE': 'bg-green-50 border-green-300',
                      'EN_TERRENO': 'bg-blue-50 border-blue-300',
                      'REPARACION': 'bg-red-50 border-red-300'
                    };

                    const statusBadge = {
                      'DISPONIBLE': 'bg-green-500 text-white',
                      'EN_TERRENO': 'bg-blue-500 text-white',
                      'REPARACION': 'bg-red-500 text-white'
                    };

                    const statusText = {
                      'DISPONIBLE': 'Disponible',
                      'EN_TERRENO': 'En Terreno',
                      'REPARACION': 'En Reparación'
                    };

                    return (
                      <div
                        key={liveu.id}
                        className={`border-2 rounded-lg p-4 ${statusColors[liveu.status] || 'bg-gray-50 border-gray-300'}`}
                      >
                        {/* Si está en modo edición para este equipo, mostrar formulario */}
                        {editingLiveu?.id === liveu.id ? (
                          <div className="bg-white rounded-lg p-3 border-2 border-blue-400">
                            <h4 className="text-sm font-bold text-blue-900 mb-3">✏️ Editar Equipo</h4>
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                const equipmentCode = formData.get('equipment_code');
                                const serialNumber = formData.get('serial_number');
                                handleEditLiveu(liveu.id, equipmentCode, serialNumber);
                              }}
                            >
                              <div className="space-y-2 mb-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Código de Equipo *
                                  </label>
                                  <input
                                    type="text"
                                    name="equipment_code"
                                    defaultValue={liveu.equipment_code}
                                    required
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Número de Serie
                                  </label>
                                  <input
                                    type="text"
                                    name="serial_number"
                                    defaultValue={liveu.serial_number || ''}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-3 rounded transition-all"
                                >
                                  ✅ Guardar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingLiveu(null)}
                                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-xs font-medium py-1.5 px-3 rounded transition-all"
                                >
                                  ❌ Cancelar
                                </button>
                              </div>
                            </form>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">
                                  📡 {liveu.equipment_code}
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                  {liveu.serial_number || 'Sin número de serie'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge[liveu.status]}`}>
                                  {statusText[liveu.status] || liveu.status}
                                </span>
                                {!liveu.despacho && (
                                  <>
                                    <button
                                      onClick={() => setEditingLiveu(liveu)}
                                      className="text-blue-600 hover:bg-blue-100 p-1.5 rounded transition-all"
                                      title="Editar equipo"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => handleDeleteLiveu(liveu.id, liveu.equipment_code)}
                                      className="text-red-600 hover:bg-red-100 p-1.5 rounded transition-all"
                                      title="Eliminar equipo"
                                    >
                                      🗑️
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Información de despacho activo */}
                            {liveu.despacho && (
                              <div className="bg-white bg-opacity-70 rounded-lg p-3 mb-3 border border-blue-200">
                                <p className="text-xs font-semibold text-blue-900 mb-2">🚗 En Despacho Activo:</p>
                                <div className="space-y-1">
                                  <p className="text-xs text-gray-700">
                                    <strong>Periodista:</strong> {liveu.despacho.periodista || 'No asignado'}
                                  </p>
                                  <p className="text-xs text-gray-700">
                                    <strong>Camarógrafo:</strong> {liveu.despacho.camarografo || 'No asignado'}
                                  </p>
                                  <p className="text-xs text-gray-700">
                                    <strong>Realizador:</strong> {liveu.despacho.realizador || 'No asignado'}
                                  </p>
                                  <p className="text-xs text-gray-700">
                                    <strong>Vehículo:</strong> {liveu.despacho.placa_vehiculo || 'No asignado'}
                                  </p>
                                  <p className="text-xs text-gray-700">
                                    <strong>Destino:</strong> {liveu.despacho.destino}
                                  </p>
                                  <p className="text-xs text-gray-700">
                                    <strong>Salida:</strong> {liveu.despacho.hora_salida?.substring(0, 5)}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Notas */}
                            {liveu.notes && (
                              <div className="bg-white bg-opacity-50 rounded p-2 mb-3">
                                <p className="text-xs text-gray-600">
                                  <strong>Notas:</strong> {liveu.notes}
                                </p>
                              </div>
                            )}

                            {/* Botones de acción */}
                            <div className="flex gap-2">
                              {liveu.status !== 'DISPONIBLE' && !liveu.despacho && (
                                <button
                                  onClick={() => handleUpdateLiveuStatus(liveu.id, 'DISPONIBLE')}
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded transition-all"
                                >
                                  ✅ Marcar Disponible
                                </button>
                              )}
                              {liveu.status !== 'EN_TERRENO' && !liveu.despacho && (
                                <button
                                  onClick={() => handleUpdateLiveuStatus(liveu.id, 'EN_TERRENO')}
                                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded transition-all"
                                >
                                  📍 Marcar En Terreno
                                </button>
                              )}
                              {liveu.status !== 'REPARACION' && !liveu.despacho && (
                                <button
                                  onClick={() => {
                                    const notas = prompt('Ingrese notas sobre la reparación (opcional):');
                                    handleUpdateLiveuStatus(liveu.id, 'REPARACION', notas || '');
                                  }}
                                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 px-3 rounded transition-all"
                                >
                                  🔧 Marcar Reparación
                                </button>
                              )}
                              {liveu.despacho && (
                                <div className="flex-1 bg-gray-300 text-gray-600 text-xs font-medium py-2 px-3 rounded text-center">
                                  🔒 En uso (despacho activo)
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                💡 Los equipos en despachos activos no pueden cambiar de estado manualmente
              </p>
              <button
                onClick={() => setShowLiveuModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Camarógrafos */}
      {showCamarografosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh]" style={{ overflow: 'visible' }}>
            {/* Header del Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    📷 Detalle de Camarógrafos
                  </h2>
                  <p className="text-sm text-green-100 mt-1">
                    {disponibilidadCamarografos?.disponibles} disponibles | {disponibilidadCamarografos?.ocupados} en terreno
                  </p>
                </div>
                <button
                  onClick={() => setShowCamarografosModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="modal-detail-container">
              {camarografosDetalle.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl block mb-4">📷</span>
                  <p className="text-lg">No hay camarógrafos asignados para hoy</p>
                </div>
              ) : (
                <div className="modal-cards-grid">
                  {camarografosDetalle.map((persona) => {
                    // Determinar clase CSS de turno
                    const turnoClass = persona.turno === 'MAÑANA' ? 'turno-manana' :
                                      persona.turno === 'TARDE' ? 'turno-tarde' :
                                      persona.turno === 'NOCHE' ? 'turno-noche' :
                                      'turno-default';

                    const turnoBadge = {
                      'MAÑANA': 'bg-amber-500 text-white',
                      'TARDE': 'bg-blue-500 text-white',
                      'NOCHE': 'bg-purple-500 text-white'
                    };

                    const estadoBadge = {
                      'EN_CANAL': 'bg-green-500 text-white',
                      'EN_TERRENO': 'bg-orange-500 text-white',
                      'EN_COMISION': 'bg-purple-500 text-white'
                    };

                    const estadoText = {
                      'EN_CANAL': 'En Canal',
                      'EN_TERRENO': 'En Terreno',
                      'EN_COMISION': 'En Comisión'
                    };

                    return (
                      <div
                        key={persona.id}
                        className={`modal-personnel-card ${turnoClass}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {persona.nombre}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Camarógrafo de Reportería
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${turnoBadge[persona.turno] || 'bg-gray-400 text-white'}`}>
                              {persona.turno || 'N/A'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[persona.estado]}`}>
                              {estadoText[persona.estado] || persona.estado}
                            </span>
                          </div>
                        </div>

                        {/* Información de turno y llamado */}
                        <div className="bg-white bg-opacity-70 rounded p-3 mb-2">
                          <p className="text-sm text-gray-700">
                            <strong>Llamado:</strong> {persona.hora_llamado || 'N/A'}
                          </p>
                        </div>

                        {/* Información de despacho si está en terreno */}
                        {persona.estado === 'EN_TERRENO' && persona.despacho && (
                          <div className="bg-white bg-opacity-70 rounded p-3 border-l-4 border-orange-500">
                            <p className="text-xs font-semibold text-orange-900 mb-2">En Despacho Activo:</p>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-700">
                                <strong>Periodista:</strong> {persona.despacho.periodista || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Asistente:</strong> {persona.despacho.asistente || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Conductor:</strong> {persona.despacho.conductor || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Vehículo:</strong> {persona.despacho.vehiculo || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>LiveU:</strong> {persona.despacho.liveu || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Destino:</strong> {persona.despacho.ubicacion || persona.despacho.destino}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Salida:</strong> {persona.despacho.hora_salida?.substring(0, 5)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowCamarografosModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Realizadores */}
      {showRealizadoresModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh]" style={{ overflow: 'visible' }}>
            {/* Header del Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    🎬 Detalle de Realizadores
                  </h2>
                  <p className="text-sm text-purple-100 mt-1">
                    {disponibilidadRealizadores?.disponibles} disponibles | {disponibilidadRealizadores?.ocupados || 0} ocupados
                  </p>
                </div>
                <button
                  onClick={() => setShowRealizadoresModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="modal-detail-container">
              {realizadoresDetalle.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl block mb-4">🎬</span>
                  <p className="text-lg">No hay realizadores asignados para hoy</p>
                </div>
              ) : (
                <div className="modal-cards-grid">
                  {realizadoresDetalle.map((persona) => {
                    // Determinar clase CSS de turno
                    const turnoClass = persona.turno === 'MAÑANA' ? 'turno-manana' :
                                      persona.turno === 'TARDE' ? 'turno-tarde' :
                                      persona.turno === 'NOCHE' ? 'turno-noche' :
                                      'turno-default';

                    const turnoBadge = {
                      'MAÑANA': 'bg-amber-500 text-white',
                      'TARDE': 'bg-blue-500 text-white',
                      'NOCHE': 'bg-purple-500 text-white'
                    };

                    const estadoBadge = {
                      'EN_CANAL': 'bg-green-500 text-white',
                      'EN_TERRENO': 'bg-orange-500 text-white',
                      'EN_COMISION': 'bg-purple-500 text-white'
                    };

                    const estadoText = {
                      'EN_CANAL': 'En Canal',
                      'EN_TERRENO': 'En Terreno',
                      'EN_COMISION': 'En Comisión'
                    };

                    return (
                      <div
                        key={persona.id}
                        className={`modal-personnel-card ${turnoClass}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {persona.nombre}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Realizador
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${turnoBadge[persona.turno] || 'bg-gray-400 text-white'}`}>
                              {persona.turno || 'N/A'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[persona.estado]}`}>
                              {estadoText[persona.estado] || persona.estado}
                            </span>
                          </div>
                        </div>

                        {/* Información de turno y llamado */}
                        <div className="bg-white bg-opacity-70 rounded p-3 mb-2">
                          <p className="text-sm text-gray-700">
                            <strong>Llamado:</strong> {persona.hora_llamado || 'N/A'}
                          </p>
                        </div>

                        {/* Información de despacho si está en terreno */}
                        {persona.estado === 'EN_TERRENO' && persona.despacho && (
                          <div className="bg-white bg-opacity-70 rounded p-3 border-l-4 border-orange-500">
                            <p className="text-xs font-semibold text-orange-900 mb-2">En Despacho Activo:</p>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-700">
                                <strong>Periodista:</strong> {persona.despacho.periodista || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Camarógrafo:</strong> {persona.despacho.camarografo || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Asistente:</strong> {persona.despacho.asistente || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Conductor:</strong> {persona.despacho.conductor || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Vehículo:</strong> {persona.despacho.vehiculo || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>LiveU:</strong> {persona.despacho.liveu || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Destino:</strong> {persona.despacho.destino}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Salida:</strong> {persona.despacho.hora_salida?.substring(0, 5)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowRealizadoresModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Asistentes */}
      {showAsistentesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh]" style={{ overflow: 'visible' }}>
            {/* Header del Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    🎥 Detalle de Asistentes
                  </h2>
                  <p className="text-sm text-cyan-100 mt-1">
                    {disponibilidadAsistentes?.disponibles} disponibles | {disponibilidadAsistentes?.ocupados} en terreno
                  </p>
                </div>
                <button
                  onClick={() => setShowAsistentesModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="modal-detail-container">
              {asistentesDetalle.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl block mb-4">🎥</span>
                  <p className="text-lg">No hay asistentes asignados para hoy</p>
                </div>
              ) : (
                <div className="modal-cards-grid">
                  {asistentesDetalle.map((persona) => {
                    // Determinar clase CSS de turno
                    const turnoClass = persona.turno === 'MAÑANA' ? 'turno-manana' :
                                      persona.turno === 'TARDE' ? 'turno-tarde' :
                                      persona.turno === 'NOCHE' ? 'turno-noche' :
                                      'turno-default';

                    const turnoBadge = {
                      'MAÑANA': 'bg-amber-500 text-white',
                      'TARDE': 'bg-blue-500 text-white',
                      'NOCHE': 'bg-purple-500 text-white'
                    };

                    const estadoBadge = {
                      'EN_CANAL': 'bg-green-500 text-white',
                      'EN_TERRENO': 'bg-orange-500 text-white',
                      'EN_COMISION': 'bg-purple-500 text-white'
                    };

                    const estadoText = {
                      'EN_CANAL': 'En Canal',
                      'EN_TERRENO': 'En Terreno',
                      'EN_COMISION': 'En Comisión'
                    };

                    return (
                      <div
                        key={persona.id}
                        className={`modal-personnel-card ${turnoClass}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {persona.nombre}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Asistente de Reportería
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${turnoBadge[persona.turno] || 'bg-gray-400 text-white'}`}>
                              {persona.turno || 'N/A'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoBadge[persona.estado]}`}>
                              {estadoText[persona.estado] || persona.estado}
                            </span>
                          </div>
                        </div>

                        {/* Información de turno y llamado */}
                        <div className="bg-white bg-opacity-70 rounded p-3 mb-2">
                          <p className="text-sm text-gray-700">
                            <strong>Llamado:</strong> {persona.hora_llamado || 'N/A'}
                          </p>
                        </div>

                        {/* Información de despacho si está en terreno */}
                        {persona.estado === 'EN_TERRENO' && persona.despacho && (
                          <div className="bg-white bg-opacity-70 rounded p-3 border-l-4 border-orange-500">
                            <p className="text-xs font-semibold text-orange-900 mb-2">En Despacho Activo:</p>
                            <div className="space-y-1">
                              <p className="text-xs text-gray-700">
                                <strong>Periodista:</strong> {persona.despacho.periodista || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Camarógrafo:</strong> {persona.despacho.camarografo || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Conductor:</strong> {persona.despacho.conductor || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Vehículo:</strong> {persona.despacho.vehiculo || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>LiveU:</strong> {persona.despacho.liveu || 'No asignado'}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Destino:</strong> {persona.despacho.ubicacion || persona.despacho.destino}
                              </p>
                              <p className="text-xs text-gray-700">
                                <strong>Salida:</strong> {persona.despacho.hora_salida?.substring(0, 5)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowAsistentesModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Flota */}
      {showFlotaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[85vh]" style={{ overflow: 'visible' }}>
            {/* Header del Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    🚐 Detalle de Flota
                  </h2>
                  <p className="text-sm text-indigo-100 mt-1">
                    {fleetStats?.enCanal} en canal | {fleetStats?.despachados} despachados de {fleetStats?.total} disponibles
                  </p>
                </div>
                <button
                  onClick={() => setShowFlotaModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
              {flotaDetalle.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-6xl block mb-4">🚐</span>
                  <p className="text-lg">No hay vehículos disponibles</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {flotaDetalle.map((vehiculo) => {
                    const estadoColors = {
                      'DISPONIBLE': 'bg-green-50 border-green-300',
                      'EN_RUTA': 'bg-orange-50 border-orange-300',
                      'MANTENIMIENTO': 'bg-red-50 border-red-300',
                      'FUERA_DE_SERVICIO': 'bg-gray-50 border-gray-300'
                    };

                    const estadoBadge = {
                      'DISPONIBLE': 'bg-green-500 text-white',
                      'EN_RUTA': 'bg-orange-500 text-white',
                      'MANTENIMIENTO': 'bg-red-500 text-white',
                      'FUERA_DE_SERVICIO': 'bg-gray-500 text-white'
                    };

                    const estadoText = {
                      'DISPONIBLE': '🟢 En Canal',
                      'EN_RUTA': '🟠 En Ruta',
                      'MANTENIMIENTO': '🔴 Mantenimiento',
                      'FUERA_DE_SERVICIO': '⚫ Fuera de Servicio'
                    };

                    return (
                      <div
                        key={vehiculo.id}
                        className={`border-2 rounded-lg p-4 ${estadoColors[vehiculo.status] || 'bg-gray-50 border-gray-300'}`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {vehiculo.plate_number}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {vehiculo.type} - {vehiculo.brand} {vehiculo.model}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${estadoBadge[vehiculo.status]}`}>
                            {estadoText[vehiculo.status] || vehiculo.status}
                          </span>
                        </div>

                        {/* Información del vehículo */}
                        <div className="bg-white bg-opacity-70 rounded p-3 mb-2">
                          <p className="text-sm text-gray-700">
                            <strong>Capacidad:</strong> {vehiculo.capacity || 'N/A'} pasajeros
                          </p>
                          {vehiculo.last_maintenance && (
                            <p className="text-sm text-gray-700">
                              <strong>Último mantenimiento:</strong> {new Date(vehiculo.last_maintenance).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>

                        {/* Información de despacho si está en ruta */}
                        {vehiculo.status === 'EN_RUTA' && vehiculo.despacho && (
                          <div className="bg-white bg-opacity-70 rounded p-3 border-l-4 border-orange-500">
                            <p className="text-xs font-semibold text-orange-900 mb-1">🚗 Despacho Activo:</p>
                            <p className="text-sm text-gray-700">
                              <strong>Periodista:</strong> {vehiculo.despacho.periodista || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Destino:</strong> {vehiculo.despacho.destino || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-700">
                              <strong>Salida:</strong> {vehiculo.despacho.hora_salida?.substring(0, 5) || 'N/A'}
                            </p>
                          </div>
                        )}

                        {/* Notas de mantenimiento */}
                        {vehiculo.status === 'MANTENIMIENTO' && vehiculo.notes && (
                          <div className="bg-white bg-opacity-70 rounded p-3 border-l-4 border-red-500">
                            <p className="text-xs font-semibold text-red-900 mb-1">🔧 En Mantenimiento:</p>
                            <p className="text-sm text-gray-700">{vehiculo.notes}</p>
                          </div>
                        )}

                        {/* Acciones Rápidas */}
                        <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                          {vehiculo.status === 'DISPONIBLE' && (
                            <button
                              onClick={() => handleQuickStatusChange(vehiculo, 'EN_RUTA')}
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium py-2 px-3 rounded transition-all"
                            >
                              🚗 Marcar En Ruta
                            </button>
                          )}
                          {vehiculo.status === 'EN_RUTA' && (
                            <button
                              onClick={() => handleQuickStatusChange(vehiculo, 'DISPONIBLE')}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded transition-all"
                            >
                              ✅ Volver a Canal
                            </button>
                          )}
                          {vehiculo.status === 'DISPONIBLE' && (
                            <button
                              onClick={() => handleQuickStatusChange(vehiculo, 'MANTENIMIENTO')}
                              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 px-3 rounded transition-all"
                            >
                              🔧 Mantenimiento
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer del Modal */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowFlotaModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Observación para Cambio Rápido de Estado */}
      {showQuickStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-lg font-bold">
                {targetStatus === 'EN_RUTA' && '🚗 Marcar Vehículo En Ruta'}
                {targetStatus === 'DISPONIBLE' && '✅ Volver Vehículo a Canal'}
                {targetStatus === 'MANTENIMIENTO' && '🔧 Enviar a Mantenimiento'}
              </h3>
              <p className="text-sm text-blue-100 mt-1">
                {selectedVehicle?.plate} - {selectedVehicle?.driver_name}
              </p>
            </div>

            {/* Body */}
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observación {targetStatus === 'EN_RUTA' ? '(requerida)' : '(opcional)'}
              </label>
              <textarea
                value={statusObservation}
                onChange={(e) => setStatusObservation(e.target.value)}
                placeholder={
                  targetStatus === 'EN_RUTA'
                    ? 'Ej: Comisión urgente a Tunja - Cobertura emergencia'
                    : targetStatus === 'MANTENIMIENTO'
                    ? 'Ej: Cambio de aceite programado'
                    : 'Observación opcional'
                }
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="4"
              />

              {targetStatus === 'EN_RUTA' && (
                <p className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                  ⚠️ <strong>Nota:</strong> Este cambio manual no crea un despacho oficial.
                  Use el módulo de Despachos para registro completo con destino y hora de retorno.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowQuickStatusModal(false);
                  setSelectedVehicle(null);
                  setTargetStatus(null);
                  setStatusObservation('');
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={confirmQuickStatusChange}
                disabled={targetStatus === 'EN_RUTA' && !statusObservation.trim()}
                className={`font-medium py-2 px-4 rounded-lg transition-all ${
                  targetStatus === 'EN_RUTA' && !statusObservation.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : targetStatus === 'EN_RUTA'
                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                    : targetStatus === 'MANTENIMIENTO'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
