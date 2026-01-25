import { useState, useEffect } from 'react';
import {
  Camera, Video, Users, Mic, Sparkles, Clapperboard,
  Eye, Package, Shirt, Headphones, Laptop, Radio,
  MapPin, UserCircle, Clock, Truck, Plane, ChevronRight, X
} from 'lucide-react';

// Mapeo de áreas a iconos y colores
const AREA_CONFIG = {
  'CAMARÓGRAFOS DE ESTUDIO': {
    icon: Camera,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-600',
    badgeColor: 'bg-blue-500'
  },
  'CAMARÓGRAFOS DE REPORTERÍA': {
    icon: Video,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-600',
    badgeColor: 'bg-purple-500'
  },
  'ASISTENTES DE REPORTERÍA': {
    icon: Users,
    color: 'cyan',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-300',
    iconColor: 'text-cyan-600',
    badgeColor: 'bg-cyan-500'
  },
  'REALIZADORES': {
    icon: Clapperboard,
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    iconColor: 'text-indigo-600',
    badgeColor: 'bg-indigo-500'
  },
  'GENERADORES DE CARACTERES': {
    icon: Laptop,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    iconColor: 'text-green-600',
    badgeColor: 'bg-green-500'
  },
  'ESCENOGRAFÍA': {
    icon: Package,
    color: 'amber',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    iconColor: 'text-amber-600',
    badgeColor: 'bg-amber-500'
  },
  'PRODUCTORES': {
    icon: Sparkles,
    color: 'pink',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    iconColor: 'text-pink-600',
    badgeColor: 'bg-pink-500'
  },
  'DIRECTORES DE CÁMARA': {
    icon: Eye,
    color: 'violet',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-300',
    iconColor: 'text-violet-600',
    badgeColor: 'bg-violet-500'
  },
  'MAQUILLAJE': {
    icon: Sparkles,
    color: 'rose',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-300',
    iconColor: 'text-rose-600',
    badgeColor: 'bg-rose-500'
  },
  'ASISTENTES DE PRODUCCIÓN': {
    icon: UserCircle,
    color: 'teal',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-300',
    iconColor: 'text-teal-600',
    badgeColor: 'bg-teal-500'
  },
  'VESTUARIO': {
    icon: Shirt,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    iconColor: 'text-orange-600',
    badgeColor: 'bg-orange-500'
  },
  'ASISTENTES DE ESTUDIO': {
    icon: Users,
    color: 'lime',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-300',
    iconColor: 'text-lime-600',
    badgeColor: 'bg-lime-500'
  },
  'ASISTENTES DE SONIDO': {
    icon: Headphones,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    iconColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-500'
  },
  'VTR': {
    icon: Radio,
    color: 'sky',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-300',
    iconColor: 'text-sky-600',
    badgeColor: 'bg-sky-500'
  },
  // Áreas por defecto
  'default': {
    icon: Users,
    color: 'gray',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    iconColor: 'text-gray-600',
    badgeColor: 'bg-gray-500'
  }
};

export const PersonnelAreaCards = ({ currentDate }) => {
  const [areaData, setAreaData] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [detailedPersonnel, setDetailedPersonnel] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos de personal por área para el día actual
  useEffect(() => {
    const loadAreaData = async () => {
      setLoading(true);
      try {
        const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

        console.log('📊 Cargando datos de personal por área para:', fecha);

        const response = await fetch(`/api/schedule/personnel-by-area/${fecha}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Datos recibidos:', data);
          setAreaData(data);
        } else {
          console.error('❌ Error al cargar datos:', response.status);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos de personal por área:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAreaData();
    // Actualizar cada 30 segundos
    const interval = setInterval(loadAreaData, 30000);
    return () => clearInterval(interval);
  }, [currentDate]);

  // Cargar detalles del personal de un área específica
  const loadAreaDetails = async (areaName) => {
    try {
      const fecha = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;

      const response = await fetch(`/api/schedule/area-personnel-details/${fecha}/${encodeURIComponent(areaName)}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDetailedPersonnel(data);
        setSelectedArea(areaName);
      }
    } catch (error) {
      console.error('❌ Error al cargar detalles del área:', error);
    }
  };

  const getAreaConfig = (areaName) => {
    return AREA_CONFIG[areaName] || AREA_CONFIG['default'];
  };

  const getStatusIcon = (person) => {
    if (person.en_despacho) return { icon: Truck, text: 'En Despacho', color: 'text-blue-600' };
    if (person.en_viaje) return { icon: Plane, text: 'En Viaje', color: 'text-purple-600' };
    if (person.en_terreno) return { icon: MapPin, text: 'En Terreno', color: 'text-orange-600' };
    if (person.en_canal) return { icon: UserCircle, text: 'En Canal', color: 'text-green-600' };
    return { icon: Clock, text: 'Pendiente', color: 'text-gray-500' };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Personal por Área</h3>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Personal por Área - Vista Rápida</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
            Click en tarjeta para ver detalles
          </span>
        </div>

        {/* Grid de tarjetas con scroll horizontal */}
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4 min-w-max lg:min-w-0">
            {areaData.map((area) => {
              const config = getAreaConfig(area.area_name);
              const Icon = config.icon;
              const disponiblesPercent = area.total_programados > 0
                ? 100  // Siempre 100% si hay personal programado
                : 0;

              return (
                <div
                  key={area.area_name}
                  onClick={() => loadAreaDetails(area.area_name)}
                  className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`${config.iconColor} p-2 rounded-lg bg-white bg-opacity-60`}>
                      <Icon size={24} />
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]">
                    {area.area_name}
                  </h4>

                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className={`text-2xl font-bold ${
                        area.total_programados === 0 ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {area.total_programados}
                      </span>
                      <span className="text-xs text-gray-600">
                        de {area.total_programados} disponibles
                      </span>
                    </div>

                    {/* Barra de progreso */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${config.badgeColor} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${disponiblesPercent}%` }}
                      ></div>
                    </div>

                    {/* Indicadores de estado */}
                    <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                      {area.en_terreno > 0 && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-orange-500" />
                          {area.en_terreno}
                        </span>
                      )}
                      {area.en_despacho > 0 && (
                        <span className="flex items-center gap-1">
                          <Truck size={12} className="text-blue-500" />
                          {area.en_despacho}
                        </span>
                      )}
                      {area.en_novedad > 0 && (
                        <span className="flex items-center gap-1 text-red-600">
                          ⚠️ {area.en_novedad}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal/Panel lateral con detalles */}
      {selectedArea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-lg shadow-2xl w-full sm:max-w-3xl max-h-[90vh] overflow-hidden animate-slide-up">
            {/* Header */}
            <div className={`${getAreaConfig(selectedArea).bgColor} border-b-4 ${getAreaConfig(selectedArea).borderColor} px-6 py-4 sticky top-0 z-10`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = getAreaConfig(selectedArea).icon;
                    return <Icon size={28} className={getAreaConfig(selectedArea).iconColor} />;
                  })()}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Detalle de {selectedArea.split(' ').pop()}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {detailedPersonnel.filter(p => p.en_canal || !p.en_terreno).length} disponibles | {detailedPersonnel.filter(p => p.en_terreno).length} en terreno
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedArea(null)}
                  className="text-gray-600 hover:bg-white hover:bg-opacity-50 rounded-full p-2 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {detailedPersonnel.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Users size={48} className="mx-auto text-gray-300 mb-2" />
                  <p>No hay personal programado para esta área hoy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {detailedPersonnel.map((person) => {
                    const status = getStatusIcon(person);
                    const StatusIcon = status.icon;
                    const llamadoPasado = person.hora_llamado && new Date(`${currentDate.toISOString().split('T')[0]}T${person.hora_llamado}`) < new Date();

                    return (
                      <div
                        key={person.id}
                        className={`border-2 rounded-lg p-4 transition-all ${
                          person.en_canal
                            ? 'border-green-300 bg-green-50'
                            : llamadoPasado
                            ? 'border-yellow-300 bg-yellow-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                              {person.nombre}
                              {llamadoPasado && !person.en_canal && (
                                <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" title="Hora de llamado ya pasó"></span>
                              )}
                              {person.en_canal && (
                                <span className="w-3 h-3 bg-green-500 rounded-full" title="En canal"></span>
                              )}
                            </h3>
                            {person.role && (
                              <p className="text-sm text-gray-600">{person.role}</p>
                            )}
                          </div>
                          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                            person.en_canal ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            <StatusIcon size={14} />
                            {status.text}
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mt-2">
                          <div className="flex items-center justify-between">
                            {person.turno && (
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  person.turno === 'MAÑANA' ? 'bg-amber-100 text-amber-700' :
                                  person.turno === 'TARDE' ? 'bg-blue-100 text-blue-700' :
                                  'bg-purple-100 text-purple-700'
                                }`}>
                                  {person.turno}
                                </span>
                                {person.turno_horario && (
                                  <span className="text-xs text-gray-500">
                                    {person.turno_horario}
                                  </span>
                                )}
                              </div>
                            )}

                            {person.hora_llamado && (
                              <div className="flex items-center gap-1">
                                <Clock size={14} className={llamadoPasado ? 'text-orange-500' : 'text-gray-500'} />
                                <span className={`font-bold ${llamadoPasado ? 'text-orange-600' : 'text-gray-700'}`}>
                                  Llamado: {person.hora_llamado}
                                </span>
                                {llamadoPasado && !person.en_canal && (
                                  <span className="text-xs text-orange-500">(pendiente)</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Información de despacho/viaje */}
                        {person.en_despacho && person.despacho_info && (
                          <div className="mt-3 bg-blue-100 border border-blue-300 rounded-lg p-3">
                            <p className="text-xs font-bold text-blue-900 mb-1">
                              <Truck size={14} className="inline mr-1" />
                              En Despacho
                            </p>
                            <div className="text-xs text-gray-700 space-y-1">
                              <p><strong>Destino:</strong> {person.despacho_info.destino}</p>
                              <p><strong>Vehículo:</strong> {person.despacho_info.vehiculo}</p>
                              {person.despacho_info.hora_salida && (
                                <p><strong>Salida:</strong> {person.despacho_info.hora_salida}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {person.en_viaje && person.novedad_info && (
                          <div className="mt-3 bg-purple-100 border border-purple-300 rounded-lg p-3">
                            <p className="text-xs font-bold text-purple-900 mb-1">
                              <Plane size={14} className="inline mr-1" />
                              En Viaje / Novedad
                            </p>
                            <p className="text-xs text-gray-700">
                              {person.novedad_info.descripcion}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Estilos de animación */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};
