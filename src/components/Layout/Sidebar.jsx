// src/components/Layout/Sidebar.jsx
import React from 'react';
import { Calendar, Users, AlertCircle, FileText, Settings, Home, MapPin, Clock, Camera, Video, Truck, Route, Bus, Utensils } from 'lucide-react';

export const Sidebar = ({ activeView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'schedule', label: 'Programación', icon: Calendar },
    { id: 'history', label: 'Historial', icon: Clock },
    { id: 'program-mapping', label: 'Mapeo de Programas', icon: MapPin },
    { id: 'personnel', label: 'Personal', icon: Users },
    { id: 'personal-logistico', label: 'Personal Logístico', icon: Truck },
    { id: 'routes-management', label: 'Gestión de Rutas', icon: Route },
    { id: 'fleet-management', label: 'Gestión de Flota', icon: Bus },
    { id: 'meal-management', label: 'Gestión de Alimentación', icon: Utensils },
    { id: 'novelties', label: 'Novedades', icon: AlertCircle },
    { id: 'reports', label: 'Reportes', icon: FileText },
    { id: 'settings', label: 'Configuración', icon: Settings },
    { id: 'asignacion-reporteria', label: 'Asignación Reportería/Asistentes', icon: Camera },
    { id: 'asignacion-realizadores', label: 'Asignación Realizadores', icon: Video }
  ];
  
  return (
    <aside className="w-64 bg-white shadow-lg h-screen fixed top-0 left-0 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};