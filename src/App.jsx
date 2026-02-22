// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { ScheduleTable } from './components/Schedule/ScheduleTable';
import { ScheduleHistory } from './components/Schedule/ScheduleHistory';
import { WeekSelector } from './components/Calendar/WeekSelector';
import { PersonnelList } from './components/Personnel/PersonnelList';
import { NoveltyList } from './components/Novelties/NoveltyList';
import { NoveltiesModal } from './components/Novelties/NoveltiesModal';
import { ReportGenerator } from './components/Reports/ReportGenerator';
import { ProgramMappingView } from './components/ProgramMapping/ProgramMappingView';
import { Button } from './components/UI/Button';
import { Alert } from './components/UI/Alert';
import { LoadingOverlay } from './components/UI/Loading';
import { LoginPage } from './components/Auth/LoginPage';
import { AdminDashboard } from './components/Dashboard/AdminDashboard';
import { EmployeeDashboard } from './components/Dashboard/EmployeeDashboard';
import { AsignacionReporteria } from './components/Assignments/AsignacionReporteria';
import { AsignacionRealizadores } from './components/Assignments/AsignacionRealizadores';
import { PersonalLogistico } from './components/Personnel/PersonalLogistico';
import { RoutesManagement } from './components/Routes/RoutesManagement';
import FleetManagement from './components/Fleet/FleetManagement';
import MealManagement from './components/Meals/MealManagement';
import { ExclusiveGroupsModal } from './components/ExclusiveGroups/ExclusiveGroupsModal';
import { InstallPrompt } from './components/PWA/InstallPrompt';
import { usePersonnel } from './hooks/usePersonnel';
import { useSchedule } from './hooks/useSchedule';
import { useNovelties } from './hooks/useNovelties';
import { useWeekNavigation } from './hooks/useWeekNavigation';
import { useNotifications } from './hooks/useNotifications';
import { getProgramsByDayType } from './data/programs';
import { isWeekend } from './utils/dateUtils';
import './styles/pwa.css';
import { Zap, Calendar, Users, AlertCircle, FileText, Clock } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [showAlert, setShowAlert] = useState(null);
  const [showNoveltiesModal, setShowNoveltiesModal] = useState(false);
  const [showExclusiveGroupsModal, setShowExclusiveGroupsModal] = useState(false);
  const dataLoadedRef = useRef(false); // Bandera para evitar cargas duplicadas

  // Verificar si hay sesión guardada al cargar la app
  useEffect(() => {
    // Limpiar filtros problemáticos del localStorage (fix temporal)
    localStorage.removeItem('rtvc_disabled_programs');
    localStorage.removeItem('rtvc_program_dates');

    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (user, userToken) => {
    setCurrentUser(user);
    setToken(userToken);
    setIsAuthenticated(true);
    setActiveView('schedule'); // Ir al schedule al iniciar sesión (dashboard deshabilitado temporalmente)
  };

  // Hooks deben estar antes de cualquier return
  const { currentDate, goToNextWeek, goToPreviousWeek, goToWeek, goToToday } = useWeekNavigation();
  const { personnel, loading: loadingPersonnel, loadPersonnel, addPerson, updatePerson, deletePerson } = usePersonnel();
  const { schedule, loading: loadingSchedule, loadSchedule, generateSchedule, updateScheduleEntry } = useSchedule(currentDate);
  const { novelties, loadNovelties, addNovelty, updateNovelty, deleteNovelty } = useNovelties();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications(novelties, personnel);

  // Cargar datos UNA SOLA VEZ después del login
  useEffect(() => {
    if (isAuthenticated && !dataLoadedRef.current) {
      console.log('🔄 Cargando datos después del login...');
      dataLoadedRef.current = true; // Marcar como cargado
      // loadPersonnel(); // Ahora se carga automáticamente en usePersonnel
      loadNovelties();
      // loadSchedule se llamará automáticamente cuando sea necesario
    }
  }, [isAuthenticated]); // Solo ejecutar cuando cambia isAuthenticated

  const handleViewAllNovelties = () => {
    setShowNoveltiesModal(true);
  };

  const handleLogout = async () => {
    // Llamar al endpoint de logout usando ruta relativa
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error('Error al cerrar sesión:', err);
      }
    }

    // Limpiar localStorage y estado
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Si no está autenticado, mostrar página de login
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }
  
  const programs = getProgramsByDayType(isWeekend(currentDate));
  
  const handleGenerateSchedule = () => {
    if (personnel.length === 0) {
      setShowAlert({
        type: 'warning',
        title: 'Sin Personal',
        message: 'Debe agregar personal antes de generar la programación'
      });
      return;
    }
    
    generateSchedule(personnel, currentDate, novelties);
    setShowAlert({
      type: 'success',
      title: 'Programación Generada',
      message: 'La programación se ha generado exitosamente'
    });
  };
  
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        // Mostrar dashboard según el rol del usuario
        if (currentUser?.role === 'employee') {
          return (
            <EmployeeDashboard
              currentUser={currentUser}
              novelties={novelties}
              currentDate={currentDate}
            />
          );
        } else {
          return (
            <AdminDashboard
              personnel={personnel}
              novelties={novelties}
              currentDate={currentDate}
            />
          );
        }

      case 'schedule':
        return (
          <div className="space-y-6">
            <ScheduleTable
              personnel={personnel}
              selectedDate={currentDate}
              novelties={novelties}
              onExportPDF={() => alert('Exportar PDF en desarrollo')}
              showWeekSelector={true}
              weekSelectorProps={{
                selectedDate: currentDate,
                onDateSelect: goToWeek,
                onPrevWeek: goToPreviousWeek,
                onNextWeek: goToNextWeek,
                onToday: goToToday
              }}
            />
          </div>
        );
        
      case 'personnel':
        return (
          <PersonnelList
            personnel={personnel}
            onAdd={addPerson}
            onUpdate={updatePerson}
            onDelete={deletePerson}
          />
        );
        
      case 'novelties':
        return (
          <NoveltyList
            novelties={novelties}
            personnel={personnel}
            onAdd={addNovelty}
            onUpdate={updateNovelty}
            onDelete={deleteNovelty}
          />
        );
        
      case 'reports':
        return (
          <ReportGenerator
            schedule={schedule}
            personnel={personnel}
            novelties={novelties}
          />
        );

      case 'program-mapping':
        return <ProgramMappingView />;

      case 'history':
        return <ScheduleHistory onLoadDate={(date) => {
          setCurrentDate(date);
          setActiveView('schedule');
        }} />;

      case 'asignacion-reporteria':
        return <AsignacionReporteria currentDate={currentDate} />;

      case 'asignacion-realizadores':
        return <AsignacionRealizadores currentDate={currentDate} />;

      case 'personal-logistico':
        return <PersonalLogistico />;

      case 'routes-management':
        return <RoutesManagement />;

      case 'fleet-management':
        return <FleetManagement />;

      case 'meal-management':
        return <MealManagement />;

      case 'exclusive-groups':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 via-green-600 to-amber-500 rounded-xl p-6 text-white shadow-lg">
              <h2 className="text-2xl font-bold mb-2">Grupos Exclusivos</h2>
              <p className="text-white/80">
                Gestiona equipos de Master, Móviles y Puestos Fijos. El personal asignado a estos grupos
                queda bloqueado de la rotación general.
              </p>
              <button
                onClick={() => setShowExclusiveGroupsModal(true)}
                className="mt-4 px-6 py-3 bg-white text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-md"
              >
                Abrir Gestión de Grupos Exclusivos
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">📻</span>
                  </div>
                  <h3 className="font-bold text-blue-800">MASTER</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Equipos que operan un Master o Estudio. Quedan bloqueados de asignaciones externas.
                </p>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">🚐</span>
                  </div>
                  <h3 className="font-bold text-green-800">MÓVIL</h3>
                </div>
                <p className="text-sm text-green-700">
                  Equipos en unidad móvil con vehículo y conductor asignados. Capacidad descontada automáticamente.
                </p>
              </div>

              <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">📍</span>
                  </div>
                  <h3 className="font-bold text-amber-800">PUESTO FIJO</h3>
                </div>
                <p className="text-sm text-amber-700">
                  Personal en ubicaciones externas fijas como Congreso, Presidencia, Aeropuerto.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Vista no implementada</h3>
            <p className="text-gray-600">Esta vista estará disponible próximamente</p>
          </div>
        );
    }
  };
  
  return (
    <>
      <MainLayout
        activeView={activeView}
        onViewChange={setActiveView}
        currentUser={currentUser}
        onLogout={handleLogout}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onRemoveNotification={removeNotification}
        onViewAllNovelties={handleViewAllNovelties}
      >
        {showAlert && (
          <Alert
            type={showAlert.type}
            title={showAlert.title}
            message={showAlert.message}
            onClose={() => setShowAlert(null)}
            className="mb-6"
          />
        )}

        {renderView()}
      </MainLayout>

      {(loadingPersonnel || loadingSchedule) && (
        <LoadingOverlay text="Cargando datos..." />
      )}

      <NoveltiesModal
        isOpen={showNoveltiesModal}
        onClose={() => setShowNoveltiesModal(false)}
        novelties={novelties}
        personnel={personnel}
      />

      <ExclusiveGroupsModal
        isOpen={showExclusiveGroupsModal}
        onClose={() => setShowExclusiveGroupsModal(false)}
        selectedDate={currentDate.toISOString().split('T')[0]}
        onGroupAssigned={(result) => {
          console.log('Grupo asignado:', result);
          setShowAlert({
            type: result.alerts?.length > 0 ? 'warning' : 'success',
            title: result.alerts?.length > 0 ? 'Grupo Asignado con Alertas' : 'Grupo Asignado',
            message: result.message
          });
        }}
      />

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </>
  );
}

export default App;