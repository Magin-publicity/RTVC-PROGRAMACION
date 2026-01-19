// src/components/Meals/MealManagement.jsx
// Módulo de Gestión de Alimentación (Desayunos, Almuerzos, Cenas)

import React, { useState, useEffect } from 'react';
import { Coffee, Utensils, Moon, Plus, X, Download, MessageCircle, RefreshCw, Upload, Check, Users, Send } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { generateMealRequestMessage, shareViaWhatsApp } from '../../utils/whatsappShare';

const API_URL = '/api';

// Lista fija de cargos/posiciones disponibles (basada en áreas reales + Excel)
const CARGOS_DISPONIBLES = [
  'ALMACEN',
  'ASISTENTES DE ESTUDIO',
  'ASISTENTES DE LUCES',
  'ASISTENTES DE PRODUCCIÓN',
  'ASISTENTES DE REPORTERÍA',
  'ASISTENTES DE SONIDO',
  'CAMARÓGRAFOS DE ESTUDIO',
  'CAMARÓGRAFOS DE REPORTERÍA',
  'CAPILLA',
  'CONTRIBUCIONES',
  'COORDINADOR ESTUDIO',
  'DIRECTORES',
  'DIRECTORES DE CÁMARA',
  'DIGITAL',
  'EDITORES',
  'EMISIÓN',
  'ESCENOGRAFÍA',
  'GENERADORES DE CARACTERES',
  'GRAFICACIÓN',
  'INGENIEROS',
  'INGENIEROS EMISION',
  'INGESTA',
  'MAQUILLAJE',
  'OPERADORES DE PANTALLAS',
  'OPERADORES DE PROMPTER',
  'OPERADORES DE SONIDO',
  'OPERADORES DE VIDEO',
  'OPERADORES DE VMIX',
  'PERIODISTAS',
  'PRESENTADORES',
  'PRODUCTORES',
  'REALIZADORES',
  'TÉCNICOS',
  'VESTUARIO',
  'VTR',
  'ADMINISTRATIVO',
  'OTROS'
].sort();

export default function MealManagement() {
  const [selectedService, setSelectedService] = useState('ALMUERZO'); // Default: Almuerzo
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total_requests: 0, confirmed: 0, pending: 0 });
  const [programName, setProgramName] = useState(''); // Nombre del programa editable

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRequest, setNewRequest] = useState({
    personnel_name: '',
    cargo: '',
    is_guest: false,
    status: 'POR_CONFIRMAR'
  });

  // Logistic personnel states
  const [showLogisticModal, setShowLogisticModal] = useState(false);
  const [logisticPersonnel, setLogisticPersonnel] = useState([]);
  const [selectedLogistic, setSelectedLogistic] = useState([]);

  // ========================================
  // CARGA INICIAL
  // ========================================

  useEffect(() => {
    loadServices();
    // Cargar el nombre del programa guardado para hoy
    const savedProgramName = localStorage.getItem(`program_name_${new Date().toISOString().split('T')[0]}`);
    if (savedProgramName) {
      setProgramName(savedProgramName);
    }
  }, []);

  useEffect(() => {
    if (selectedService && selectedDate) {
      loadRequests();
      loadStats();
      // Cargar el nombre del programa guardado para esta fecha
      const savedProgramName = localStorage.getItem(`program_name_${selectedDate}`);
      setProgramName(savedProgramName || '');
    }
  }, [selectedService, selectedDate]);

  // Guardar el nombre del programa cuando cambie
  useEffect(() => {
    if (programName) {
      localStorage.setItem(`program_name_${selectedDate}`, programName);
    }
  }, [programName, selectedDate]);

  const loadServices = async () => {
    try {
      const response = await fetch(`${API_URL}/meals/services`);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    try {
      const serviceId = services.find(s => s.service_name === selectedService)?.id;
      if (!serviceId) return;

      const response = await fetch(`${API_URL}/meals/requests/${serviceId}/${selectedDate}`);
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const serviceId = services.find(s => s.service_name === selectedService)?.id;
      if (!serviceId) return;

      const response = await fetch(`${API_URL}/meals/stats/${serviceId}/${selectedDate}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // ========================================
  // ACCIONES CRUD
  // ========================================

  const handleAddRequest = async () => {
    if (!newRequest.personnel_name || !newRequest.cargo) {
      alert('Por favor complete nombre y cargo');
      return;
    }

    try {
      const serviceId = services.find(s => s.service_name === selectedService)?.id;
      if (!serviceId) return;

      const response = await fetch(`${API_URL}/meals/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          service_date: selectedDate,
          personnel_id: null, // NULL para permitir edición manual
          personnel_name: newRequest.personnel_name,
          cargo: newRequest.cargo,
          status: newRequest.status,
          is_guest: newRequest.is_guest
        })
      });

      if (response.ok) {
        // 📊 INTEGRACIÓN ANALYTICS: Registrar comida
        try {
          await analyticsService.recordMeal({
            date: selectedDate,
            mealType: selectedService, // Desayuno, Almuerzo, Cena
            personnelName: newRequest.personnel_name,
            cargo: newRequest.cargo,
            isGuest: newRequest.is_guest,
            status: newRequest.status
          });
          console.log('✅ [Analytics] Comida registrada en Analytics');
        } catch (analyticsError) {
          console.error('⚠️ [Analytics] Error registrando en Analytics:', analyticsError);
          // No interrumpir el flujo principal si falla Analytics
        }

        setShowAddModal(false);
        setNewRequest({ personnel_name: '', cargo: '', is_guest: false, status: 'POR_CONFIRMAR' });
        loadRequests();
        loadStats();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al agregar solicitud');
      }
    } catch (error) {
      console.error('Error agregando solicitud:', error);
      alert('Error al agregar solicitud');
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/meals/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        loadRequests();
        loadStats();
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
    }
  };

  // ========================================
  // CONFIRMAR TODOS
  // ========================================

  const handleConfirmAll = async () => {
    if (requests.length === 0) {
      alert('No hay solicitudes para confirmar');
      return;
    }

    const pendingRequests = requests.filter(r => r.status === 'POR_CONFIRMAR');

    if (pendingRequests.length === 0) {
      alert('Todas las solicitudes ya están confirmadas');
      return;
    }

    if (!confirm(`¿Confirmar todas las ${pendingRequests.length} solicitudes pendientes?`)) {
      return;
    }

    try {
      // Actualizar todas en paralelo
      const promises = pendingRequests.map(request =>
        fetch(`${API_URL}/meals/requests/${request.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'CONFIRMADO' })
        })
      );

      await Promise.all(promises);
      loadRequests();
      loadStats();
      alert(`Se confirmaron ${pendingRequests.length} solicitudes exitosamente`);
    } catch (error) {
      console.error('Error confirmando todas las solicitudes:', error);
      alert('Error al confirmar solicitudes');
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!confirm('¿Está seguro de eliminar esta solicitud?')) return;

    try {
      const response = await fetch(`${API_URL}/meals/requests/${requestId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        loadRequests();
        loadStats();
        alert('Solicitud eliminada exitosamente');
      } else {
        const errorData = await response.json();
        alert(`Error al eliminar: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error eliminando solicitud:', error);
      alert(`Error de conexión al eliminar: ${error.message}\n\nVerifica que el servidor esté corriendo en ${API_URL}`);
    }
  };

  // ========================================
  // CARGA DESDE PROGRAMACIÓN
  // ========================================

  const handleLoadFromSchedule = async () => {
    if (!confirm(`¿Cargar personal programado para ${selectedService} desde el horario?`)) return;

    try {
      const service = services.find(s => s.service_name === selectedService);
      if (!service) return;

      const response = await fetch(`${API_URL}/meals/requests/load-from-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: service.id,
          service_date: selectedDate,
          time_reference: service.service_time
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.loaded_count === 0) {
          alert(`⚠️ No se cargó ninguna persona.\n\n${result.error || 'No hay personal programado para esta fecha y horario.'}\n\nIntenta con otra fecha o agrega personas manualmente.`);
        } else {
          alert(`✅ Se cargaron ${result.loaded_count} personas desde la programación\n\n📊 Total turnos del día: ${result.total_shifts}\n🎯 Turnos relevantes para ${selectedService}: ${result.relevant_shifts}`);
          loadRequests();
          loadStats();
        }
      } else {
        const errorData = await response.json();
        alert(`❌ Error al cargar personal:\n\n${errorData.error}\n\nPor favor intenta con otra fecha que tenga programación.`);
      }
    } catch (error) {
      console.error('Error cargando desde programación:', error);
      alert('Error al cargar desde programación');
    }
  };

  // ========================================
  // PERSONAL LOGÍSTICO
  // ========================================

  const loadLogisticPersonnel = async () => {
    try {
      const response = await fetch(`${API_URL}/meals/logistic-personnel`);
      if (!response.ok) throw new Error('Error al cargar personal logístico');
      const data = await response.json();
      setLogisticPersonnel(data);
    } catch (error) {
      console.error('Error cargando personal logístico:', error);
      alert('Error al cargar personal logístico');
    }
  };

  const handleOpenLogisticModal = async () => {
    setShowLogisticModal(true);
    await loadLogisticPersonnel();
  };

  const handleToggleLogisticPerson = (personId) => {
    setSelectedLogistic(prev =>
      prev.includes(personId)
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const handleAddLogisticPersonnel = async () => {
    if (selectedLogistic.length === 0) {
      alert('Selecciona al menos una persona');
      return;
    }

    setLoading(true);
    try {
      const serviceId = services.find(s => s.service_name === selectedService)?.id;
      if (!serviceId) return;

      const response = await fetch(`${API_URL}/meals/add-logistic-personnel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          service_date: selectedDate,
          personnel_ids: selectedLogistic
        })
      });

      if (!response.ok) throw new Error('Error al agregar personal logístico');

      const result = await response.json();
      alert(result.message);
      setShowLogisticModal(false);
      setSelectedLogistic([]);
      await loadRequests();
      await loadStats();
    } catch (error) {
      console.error('Error agregando personal logístico:', error);
      alert('Error al agregar personal logístico');
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RESET
  // ========================================

  const handleReset = async () => {
    const confirmText = `¿RESET COMPLETO?\n\nEsto eliminará TODAS las ${requests.length} solicitudes de ${selectedService} para ${selectedDate}.\n\n¿Está absolutamente seguro?`;

    if (!confirm(confirmText)) return;

    try {
      const serviceId = services.find(s => s.service_name === selectedService)?.id;
      if (!serviceId) return;

      const response = await fetch(`${API_URL}/meals/requests/reset/${serviceId}/${selectedDate}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Reset completado: ${result.deleted_count} solicitudes eliminadas`);
        loadRequests();
        loadStats();
      }
    } catch (error) {
      console.error('Error en reset:', error);
      alert('Error al realizar reset');
    }
  };

  // ========================================
  // GENERAR PDF
  // ========================================

  const handleGeneratePDF = async () => {
    if (!window.html2pdf) {
      alert('Error: html2pdf.js no está cargado. Recargue la página.');
      return;
    }

    if (requests.length === 0) {
      alert('No hay solicitudes para generar PDF');
      return;
    }

    const element = document.getElementById('meals-pdf-content');
    if (!element) {
      alert('Error: No se encontró el contenedor del PDF...');
      return;
    }

    // Agregar clase para activar estilos del PDF
    document.body.classList.add('pdf-generating');

    // Formatear fecha para el nombre del archivo
    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}-${month}-${year}`;

    // Configurar opciones del PDF
    const opt = {
      margin: [8, 8, 8, 8],
      filename: `${selectedService}_${formattedDate}_RTVC.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 1.5,
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: '.no-break'
      }
    };

    try {
      await window.html2pdf().set(opt).from(element).save();
      alert(`PDF generado exitosamente: ${selectedService}_${formattedDate}_RTVC.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar PDF: ' + error.message);
    } finally {
      // Remover clase de estilos del PDF
      document.body.classList.remove('pdf-generating');
    }
  };

  // ========================================
  // GENERAR MENSAJE WHATSAPP
  // ========================================

  const handleGenerateWhatsApp = async () => {
    try {
      const serviceId = services.find(s => s.service_name === selectedService)?.id;
      if (!serviceId) return;

      const response = await fetch(`${API_URL}/meals/whatsapp-message/${serviceId}/${selectedDate}`);
      const data = await response.json();

      // Copiar al portapapeles
      navigator.clipboard.writeText(data.message);
      alert(`Mensaje de WhatsApp copiado al portapapeles:\n\n${data.message}`);
    } catch (error) {
      console.error('Error generando mensaje WhatsApp:', error);
      alert('Error al generar mensaje WhatsApp');
    }
  };

  // ========================================
  // RENDERIZADO
  // ========================================

  const getServiceIcon = (serviceName) => {
    switch (serviceName) {
      case 'DESAYUNO': return <Coffee className="text-amber-600" size={20} />;
      case 'ALMUERZO': return <Utensils className="text-green-600" size={20} />;
      case 'CENA': return <Moon className="text-indigo-600" size={20} />;
      default: return <Utensils size={20} />;
    }
  };

  const getServiceColor = (serviceName) => {
    switch (serviceName) {
      case 'DESAYUNO': return 'border-amber-500 bg-amber-50';
      case 'ALMUERZO': return 'border-green-500 bg-green-50';
      case 'CENA': return 'border-indigo-500 bg-indigo-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Alimentación</h2>
          <p className="text-gray-600 mt-1">Administre desayunos, almuerzos y cenas del personal</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Nombre del Programa</label>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="Ej: El Calentao"
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Selector de Servicio */}
      <div className="grid grid-cols-3 gap-4">
        {services.map(service => (
          <button
            key={service.id}
            onClick={() => setSelectedService(service.service_name)}
            className={`p-4 rounded-lg border-2 transition ${
              selectedService === service.service_name
                ? getServiceColor(service.service_name) + ' border-2'
                : 'border-gray-200 bg-white hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              {getServiceIcon(service.service_name)}
              <div className="text-left">
                <p className="font-semibold text-gray-900">{service.service_name}</p>
                <p className="text-sm text-gray-600">{service.service_time}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total Solicitudes</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{stats.total_requests || 0}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-medium">Confirmados</p>
          <p className="text-3xl font-bold text-green-900 mt-1">{stats.confirmed || 0}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
          <p className="text-sm text-amber-600 font-medium">Por Confirmar</p>
          <p className="text-3xl font-bold text-amber-900 mt-1">{stats.pending || 0}</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} />
            Agregar Persona
          </button>
          <button
            onClick={handleLoadFromSchedule}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Upload size={18} />
            Cargar desde Programación
          </button>
          <button
            onClick={handleOpenLogisticModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <Users size={18} />
            Personal Logístico
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleGeneratePDF}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition min-h-[44px]"
          >
            <Download size={18} />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <button
            onClick={handleGenerateWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition min-h-[44px]"
          >
            <MessageCircle size={18} />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
          <button
            onClick={() => {
              // Compartir resumen completo por WhatsApp
              const confirmedRequests = requests.filter(r => r.status === 'CONFIRMADO');
              if (confirmedRequests.length === 0) {
                alert('No hay solicitudes confirmadas para compartir');
                return;
              }

              const totalMessage = `🍽️ *RESUMEN ${selectedService.toUpperCase()}*\n\n` +
                `📅 Fecha: ${new Date(selectedDate).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n` +
                `📺 Programa: ${programName || 'RTVC'}\n\n` +
                `✅ *Total Confirmados: ${confirmedRequests.length}*\n\n` +
                `👥 *Lista de Personal:*\n` +
                confirmedRequests.map((req, idx) =>
                  `${idx + 1}. ${req.personnel_name} - ${req.cargo}${req.is_guest ? ' (INVITADO)' : ''}`
                ).join('\n') +
                `\n\n⏱️ ${new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}\n` +
                `_Enviado desde RTVC Programación_`;

              shareViaWhatsApp(totalMessage);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition min-h-[44px]"
          >
            <Send size={18} />
            <span className="hidden sm:inline">Compartir Resumen</span>
            <span className="sm:hidden">Compartir</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition min-h-[44px]"
          >
            <RefreshCw size={18} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Tabla de Solicitudes */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cargo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <div className="flex items-center gap-2">
                    <span>Estado</span>
                    {requests.filter(r => r.status === 'POR_CONFIRMAR').length > 0 && (
                      <button
                        onClick={handleConfirmAll}
                        className="ml-2 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition flex items-center gap-1"
                        title="Confirmar todas las solicitudes pendientes"
                      >
                        <Check size={12} />
                        Confirmar Todos
                      </button>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    Cargando...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No hay solicitudes para {selectedService} el {selectedDate}
                  </td>
                </tr>
              ) : (
                requests.map((request, index) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{request.personnel_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{request.cargo || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleUpdateStatus(
                          request.id,
                          request.status === 'POR_CONFIRMAR' ? 'CONFIRMADO' : 'POR_CONFIRMAR'
                        )}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                          request.status === 'CONFIRMADO'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {request.status === 'CONFIRMADO' ? (
                          <span className="flex items-center gap-1">
                            <Check size={14} /> Confirmado
                          </span>
                        ) : (
                          'Por Confirmar'
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.is_guest
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {request.is_guest ? 'Invitado' : 'Personal'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        <X size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total al final */}
        {requests.length > 0 && (
          <div className="bg-gray-100 px-4 py-3 border-t border-gray-300">
            <p className="text-sm font-semibold text-gray-700">
              TOTAL: {requests.length} {requests.length === 1 ? 'porción' : 'porciones'}
            </p>
          </div>
        )}
      </div>

      {/* Contenedor oculto para PDF */}
      <div id="meals-pdf-content" style={{ position: 'absolute', left: '-9999px', top: 0, width: '650px' }}>
        {/* Encabezado del PDF */}
        <div className="pdf-header" style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '5px', border: '2px solid black', padding: '5px', margin: 0 }}>
            REQUERIMIENTO DE ALIMENTACIÓN - {selectedService}
          </h1>
          <table style={{ width: '100%', fontSize: '11px', marginBottom: '8px', marginTop: '5px', border: '1px solid black', tableLayout: 'fixed' }}>
            <tbody>
              <tr>
                <td style={{ textAlign: 'left', padding: '5px 8px', borderRight: '1px solid black', width: '50%' }}>
                  <strong>Programa:</strong> {programName || '__________________________'}
                </td>
                <td style={{ textAlign: 'left', padding: '5px 8px', width: '50%' }}>
                  <strong>Fecha:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-CO', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabla de lista de firmas */}
        <table className="meal-table no-break" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', tableLayout: 'fixed' }}>
          <thead>
            <tr style={{ backgroundColor: '#e5e7eb' }}>
              <th style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', width: '30px' }}>
                #
              </th>
              <th style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'left', fontWeight: 'bold', width: '260px' }}>
                NOMBRE
              </th>
              <th style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'left', fontWeight: 'bold', width: '210px' }}>
                CARGO
              </th>
              <th style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', width: '150px' }}>
                FIRMA
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => (
              <tr key={request.id} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                <td style={{ border: '1px solid black', padding: '6px 4px', textAlign: 'center', fontSize: '11px' }}>
                  {index + 1}
                </td>
                <td style={{ border: '1px solid black', padding: '6px 4px', wordWrap: 'break-word', overflow: 'hidden', fontSize: '11px' }}>
                  {request.personnel_name}
                </td>
                <td style={{ border: '1px solid black', padding: '6px 4px', wordWrap: 'break-word', overflow: 'hidden', fontSize: '11px' }}>
                  {request.cargo || '-'}
                </td>
                <td style={{ border: '1px solid black', padding: '6px 4px', minHeight: '20px' }}>
                  {/* Espacio vacío para firma */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total al final */}
        <div style={{ marginTop: '8px', padding: '5px', backgroundColor: '#f3f4f6', border: '1px solid #9ca3af', fontWeight: 'bold', fontSize: '10px' }}>
          TOTAL: {requests.length} {requests.length === 1 ? 'PORCIÓN' : 'PORCIONES'}
        </div>
      </div>

      {/* Modal: Agregar Persona */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Agregar Persona</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={newRequest.personnel_name}
                  onChange={(e) => setNewRequest({ ...newRequest, personnel_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cargo/Posición *
                </label>
                <select
                  value={newRequest.cargo}
                  onChange={(e) => setNewRequest({ ...newRequest, cargo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione un cargo</option>
                  {CARGOS_DISPONIBLES.map(cargo => (
                    <option key={cargo} value={cargo}>{cargo}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_guest"
                  checked={newRequest.is_guest}
                  onChange={(e) => setNewRequest({ ...newRequest, is_guest: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="is_guest" className="text-sm text-gray-700">
                  Persona externa / invitado
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddRequest}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Personal Logístico */}
      {showLogisticModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Seleccionar Personal Logístico ({selectedLogistic.length} seleccionados)
              </h3>
              <button onClick={() => setShowLogisticModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">Cargando personal...</div>
            ) : (
              <div className="space-y-4">
                {logisticPersonnel.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No hay personal logístico disponible</div>
                ) : (
                  <>
                    {/* Agrupado por área */}
                    {['PERIODISTAS', 'PRODUCTORES', 'PRESENTADORES', 'INGENIEROS', 'INGENIEROS EMISION', 'DIRECTORES', 'ALMACEN', 'ADMINISTRATIVO'].map(area => {
                      const personnel = logisticPersonnel.filter(p => p.area === area);
                      if (personnel.length === 0) return null;

                      return (
                        <div key={area} className="border rounded-lg p-4">
                          <h4 className="font-semibold text-gray-700 mb-3">{area} ({personnel.length})</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {personnel.map(person => (
                              <div key={person.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`logistic-${person.id}`}
                                  checked={selectedLogistic.includes(person.id)}
                                  onChange={() => handleToggleLogisticPerson(person.id)}
                                  className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                />
                                <label htmlFor={`logistic-${person.id}`} className="text-sm text-gray-700 cursor-pointer">
                                  {person.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}

                <div className="flex gap-3 mt-6 pt-4 border-t">
                  <button
                    onClick={() => setShowLogisticModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddLogisticPersonnel}
                    disabled={selectedLogistic.length === 0 || loading}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Agregar {selectedLogistic.length > 0 && `(${selectedLogistic.length})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
