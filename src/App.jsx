// src/App.jsx
import React, { useState, useEffect } from 'react';
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

  // Verificar si hay sesión guardada al cargar la app
  useEffect(() => {
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
    setActiveView('dashboard'); // Ir al dashboard al iniciar sesión
  };

  // Hooks deben estar antes de cualquier return
  const { currentDate, goToNextWeek, goToPreviousWeek, goToWeek, goToToday } = useWeekNavigation();
  const { personnel, loading: loadingPersonnel, addPerson, updatePerson, deletePerson } = usePersonnel();
  const { schedule, loading: loadingSchedule, generateSchedule, updateScheduleEntry } = useSchedule(currentDate);
  const { novelties, addNovelty, updateNovelty, deleteNovelty } = useNovelties();
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications(novelties, personnel);

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
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Programación Semanal</h2>
                <p className="text-gray-600 mt-1">Gestione la programación del personal</p>
              </div>

              <Button
                onClick={handleGenerateSchedule}
                icon={<Zap size={20} />}
                variant="success"
              >
                Generar Programación
              </Button>
            </div>

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

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </>
  );
}

export default App;