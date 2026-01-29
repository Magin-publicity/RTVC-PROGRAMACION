// src/components/Layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertCircle, FileText, Settings, Home, MapPin, Clock, Camera, Video, Truck, Route, Bus, Utensils, Menu, X, Download, Plane } from 'lucide-react';

export const Sidebar = ({ activeView, onViewChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Detectar si la app ya está instalada
  useEffect(() => {
    // Verificar si está en modo standalone (ya instalada)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                        window.navigator.standalone ||
                        document.referrer.includes('android-app://');

    setIsInstalled(isStandalone);

    // Capturar el evento de instalación
    const handleBeforeInstallPrompt = (e) => {
      console.log('📱 Evento beforeinstallprompt capturado');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar cuando la app se instala
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA instalada correctamente');
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Manejar instalación
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('La aplicación ya está instalada o tu navegador no soporta instalación PWA.');
      return;
    }

    console.log('📱 Mostrando prompt de instalación...');
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`📱 Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

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
    { id: 'travel-events', label: 'VIAJES & EVENTOS', icon: Plane },
    { id: 'novelties', label: 'Novedades', icon: AlertCircle },
    { id: 'reports', label: 'Reportes', icon: FileText },
    { id: 'settings', label: 'Configuración', icon: Settings },
    { id: 'asignacion-reporteria', label: 'Asignación Reportería/Asistentes', icon: Camera },
    { id: 'asignacion-realizadores', label: 'Asignación Realizadores', icon: Video }
  ];

  const handleMenuClick = (itemId) => {
    onViewChange(itemId);
    // Cerrar el menú en móviles después de seleccionar
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botón hamburguesa - solo visible en móviles */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-blue-600 text-white p-3 rounded-lg shadow-lg hover:bg-blue-700 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay oscuro en móviles cuando el menú está abierto */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        w-64 bg-white shadow-lg h-screen fixed top-0 left-0 overflow-y-auto z-40 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <nav className="p-4 pt-16 md:pt-4">
          {/* Botón de Instalación PWA - Solo visible si no está instalada */}
          {!isInstalled && deferredPrompt && (
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg">
              <button
                onClick={handleInstallClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-all min-h-[44px] shadow-md"
              >
                <Download size={20} />
                <span className="font-bold">Instalar App RTVC</span>
              </button>
              <p className="text-xs text-white text-center mt-2">
                Instala la app para acceso rápido y uso sin conexión
              </p>
            </div>
          )}

          {/* Badge de "Ya Instalada" */}
          {isInstalled && (
            <div className="mb-4 p-3 bg-green-50 border-2 border-green-500 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">App Instalada ✓</span>
              </div>
            </div>
          )}

          <ul className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors min-h-[44px]
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
    </>
  );
};