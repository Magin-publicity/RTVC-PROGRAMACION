import React from 'react';
import { Calendar, Clock, AlertCircle, User, Briefcase } from 'lucide-react';

export const EmployeeDashboard = ({ currentUser, novelties, currentDate }) => {
  // Filtrar novedades del usuario actual
  const myNovelties = novelties.filter(n => n.personnel_id === currentUser.personnel_id);

  // Novedades activas hoy
  const todayNovelties = myNovelties.filter(n => {
    const today = currentDate.toISOString().split('T')[0];
    if (n.start_date && n.end_date) {
      return today >= n.start_date.split('T')[0] && today <= n.end_date.split('T')[0];
    }
    return n.date?.split('T')[0] === today;
  });

  return (
    <div className="space-y-6">
      {/* Header con bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Bienvenido, {currentUser.personnel_name || currentUser.username}
            </h1>
            <p className="text-blue-100 mt-2">{currentUser.area} - {currentUser.personnel_role}</p>
            <p className="text-blue-200 text-sm mt-1">
              {currentDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de información */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Calendar size={24} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Mi Turno Hoy</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">--:-- a --:--</p>
          <p className="text-sm text-gray-600 mt-2">Revisa la programación para ver tu turno</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <AlertCircle size={24} className="text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Novedades Activas</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{todayNovelties.length}</p>
          <p className="text-sm text-gray-600 mt-2">
            {todayNovelties.length === 0 ? 'Sin novedades hoy' : 'Tienes novedades activas'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Briefcase size={24} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Mi Área</h3>
          </div>
          <p className="text-xl font-bold text-gray-900">{currentUser.area}</p>
          <p className="text-sm text-gray-600 mt-2">{currentUser.personnel_role}</p>
        </div>
      </div>

      {/* Mis novedades */}
      {myNovelties.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Mis Novedades</h3>
          <div className="space-y-3">
            {myNovelties.slice(0, 5).map((novelty) => (
              <div
                key={novelty.id}
                className={`p-4 rounded-lg border-2 ${
                  todayNovelties.includes(novelty)
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{novelty.type}</p>
                    {novelty.description && (
                      <p className="text-sm text-gray-600 mt-1">{novelty.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {novelty.start_date && novelty.end_date && novelty.start_date !== novelty.end_date ? (
                      <div>
                        <p className="text-xs text-gray-500">Desde</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(novelty.start_date).toLocaleDateString('es-ES')}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Hasta</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(novelty.end_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-gray-500">Fecha</p>
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(novelty.date || novelty.start_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acceso rápido a programación */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
            <Calendar size={32} className="text-blue-600 mb-3" />
            <p className="text-lg font-medium text-gray-900">Ver Mi Programación</p>
            <p className="text-sm text-gray-600 mt-1">Consulta tus turnos y horarios asignados</p>
          </button>
          <button className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left">
            <Clock size={32} className="text-blue-600 mb-3" />
            <p className="text-lg font-medium text-gray-900">Historial</p>
            <p className="text-sm text-gray-600 mt-1">Revisa tus turnos anteriores</p>
          </button>
        </div>
      </div>
    </div>
  );
};
