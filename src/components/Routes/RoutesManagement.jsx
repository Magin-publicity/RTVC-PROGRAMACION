// src/components/Routes/RoutesManagement.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import { Select } from '../UI/Select';
import {
  Calendar,
  Route,
  Truck,
  Users,
  User,
  MapPin,
  AlertCircle,
  AlertTriangle,
  Download,
  Send,
  RefreshCw,
  Zap,
  Car,
  Navigation
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { generateVehicleDispatchMessage, shareViaWhatsApp } from '../../utils/whatsappShare';
import { MessageCircle } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import { RouteGroupsModal } from './RouteGroupsModal';

const API_URL = '/api';

export const RoutesManagement = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [shiftType, setShiftType] = useState('AM');
  const [assignments, setAssignments] = useState([]);
  const [optimizedRoutes, setOptimizedRoutes] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments', 'routes', 'fleet'
  const [assignVehicleModal, setAssignVehicleModal] = useState(null); // { routeId, routeNumber, zone }
  const [expressPassengerModal, setExpressPassengerModal] = useState(false);
  const [expressForm, setExpressForm] = useState({
    name: '',
    direccion: '',
    phone: '',
    barrio: '',
    localidad: ''
  });
  const [logisticModal, setLogisticModal] = useState(false);
  const [logisticPersonnel, setLogisticPersonnel] = useState([]);
  const [selectedLogistic, setSelectedLogistic] = useState([]);
  const [programTitle, setProgramTitle] = useState('El Calentao');
  const [groupsModal, setGroupsModal] = useState(false);

  function getTodayDate() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  useEffect(() => {
    if (selectedDate && shiftType) {
      loadData();
    }
  }, [selectedDate, shiftType]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadAssignments(),
        loadOptimizedRoutes(),
        loadAlerts(),
        loadVehicles()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const response = await fetch(`${API_URL}/routes/assignments/${selectedDate}/${shiftType}`);
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error cargando asignaciones:', error);
    }
  };

  const loadOptimizedRoutes = async () => {
    try {
      const response = await fetch(`${API_URL}/routes/optimized/${selectedDate}/${shiftType}`);
      const data = await response.json();
      setOptimizedRoutes(data);
    } catch (error) {
      console.error('Error cargando rutas:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/routes/alerts/${selectedDate}?resolved=false`);
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error cargando alertas:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const response = await fetch(`${API_URL}/routes/fleet`);
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error('Error cargando vehículos:', error);
    }
  };

  const handleInitializeAssignments = async () => {
    if (!confirm(`¿Inicializar asignaciones para ${selectedDate} - ${shiftType}?\n\nEsto cargará el personal programado desde la programación técnica.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/routes/assignments/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, shiftType })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al inicializar');
      }

      const result = await response.json();
      alert(result.message);
      await loadAssignments();
      await loadAlerts(); // Recargar alertas después de inicializar
    } catch (error) {
      console.error('Error inicializando asignaciones:', error);
      alert(error.message || 'Error al inicializar asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpressPassenger = async () => {
    if (!expressForm.name || !expressForm.direccion) {
      alert('Por favor complete al menos Nombre y Dirección');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/routes/assignments/express`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          shiftType,
          program_title: programTitle,
          ...expressForm
        })
      });

      if (!response.ok) throw new Error('Error al agregar pasajero express');

      alert('Pasajero Express agregado correctamente');
      setExpressPassengerModal(false);
      setExpressForm({ name: '', direccion: '', phone: '', barrio: '', localidad: '' });
      await loadAssignments();
    } catch (error) {
      console.error('Error agregando pasajero express:', error);
      alert('Error al agregar pasajero express');
    } finally {
      setLoading(false);
    }
  };

  const loadLogisticPersonnel = async () => {
    try {
      const response = await fetch(`${API_URL}/routes/logistic-personnel`);
      if (!response.ok) throw new Error('Error al cargar personal logístico');
      const data = await response.json();
      setLogisticPersonnel(data);
    } catch (error) {
      console.error('Error cargando personal logístico:', error);
      alert('Error al cargar personal logístico');
    }
  };

  const handleOpenLogisticModal = async () => {
    setLogisticModal(true);
    setSelectedLogistic([]);
    await loadLogisticPersonnel();
  };

  const toggleLogisticSelection = (personnelId) => {
    setSelectedLogistic(prev => {
      if (prev.includes(personnelId)) {
        return prev.filter(id => id !== personnelId);
      } else {
        return [...prev, personnelId];
      }
    });
  };

  const handleAddLogisticPersonnel = async () => {
    if (selectedLogistic.length === 0) {
      alert('Por favor seleccione al menos una persona');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/routes/assignments/logistic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          shiftType,
          personnelIds: selectedLogistic,
          program_title: programTitle
        })
      });

      if (!response.ok) throw new Error('Error al agregar personal logístico');

      const result = await response.json();
      alert(result.message);
      setLogisticModal(false);
      setSelectedLogistic([]);
      await loadAssignments();
    } catch (error) {
      console.error('Error agregando personal logístico:', error);
      alert('Error al agregar personal logístico');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadGroupPersonnel = async (group) => {
    if (!group) {
      setGroupsModal(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/routes/assignments/logistic`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          shiftType,
          personnelIds: group.personnel_ids,
          program_title: programTitle
        })
      });

      if (!response.ok) throw new Error('Error al cargar personal desde plantilla');

      const result = await response.json();
      alert(`Personal del grupo "${group.name}" cargado correctamente (${group.personnel_ids.length} personas)`);
      setGroupsModal(false);
      await loadAssignments();
    } catch (error) {
      console.error('Error cargando personal desde plantilla:', error);
      alert('Error al cargar personal desde plantilla');
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeRoutes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/routes/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, shiftType })
      });

      if (!response.ok) throw new Error('Error al optimizar');

      const result = await response.json();
      alert(result.message);
      await loadData();
    } catch (error) {
      console.error('Error optimizando rutas:', error);
      alert('Error al optimizar rutas');
    } finally {
      setLoading(false);
    }
  };

  const handleExportWhatsApp = async () => {
    try {
      const response = await fetch(`${API_URL}/routes/export/whatsapp/${selectedDate}/${shiftType}`);
      const data = await response.json();

      // Copiar al portapapeles
      await navigator.clipboard.writeText(data.content);
      alert('Formato WhatsApp copiado al portapapeles');
    } catch (error) {
      console.error('Error exportando WhatsApp:', error);
      alert('Error al generar formato WhatsApp');
    }
  };

  const handleExportPDF = async () => {
    if (!window.html2pdf) {
      alert('Error: html2pdf.js no está cargado. Recargue la página.');
      return;
    }

    const element = document.getElementById('routes-pdf-content');
    if (!element) {
      alert('Error: No se encontró el contenedor de rutas. Asegúrese de estar en la pestaña "Rutas Optimizadas".');
      return;
    }

    // Agregar clase para activar estilos compactos del PDF
    document.body.classList.add('pdf-generating');

    // Formatear la fecha para el nombre del archivo
    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}-${month}-${year}`;

    // Configurar opciones del PDF optimizado para 2 rutas por página
    const opt = {
      margin: [8, 10, 8, 10],
      filename: `Rutas_RTVC_${formattedDate}_Llamado_${shiftType}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: {
        scale: 1.55,
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'landscape',
        compress: true
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        after: '.page-break-after'
      }
    };

    try {
      await window.html2pdf().set(opt).from(element).save();
      alert(`PDF generado exitosamente: Rutas_RTVC_${formattedDate}_Llamado_${shiftType}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar PDF: ' + error.message);
    } finally {
      // Remover clase de estilos compactos del PDF
      document.body.classList.remove('pdf-generating');
    }
  };

  const handleExportExcel = () => {
    if (optimizedRoutes.length === 0) {
      alert('No hay rutas para exportar');
      return;
    }

    // Formatear la fecha
    const [year, month, day] = selectedDate.split('-');
    const formattedDate = `${day}/${month}/${year}`;

    // Obtener nombre del día de la semana
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dateObj = new Date(selectedDate + 'T12:00:00');
    const diaSemana = diasSemana[dateObj.getDay()];
    const fechaLarga = `${diaSemana}, ${day} de ${meses[parseInt(month) - 1]} de ${year}`;

    // Determinar turno para mostrar
    const turnoDisplay = shiftType === 'AM' ? 'MAÑANA (06:00)' : shiftType === 'PM' ? 'NOCTURNO (22:00)' : shiftType;

    // Estilos comunes
    const greenHeaderStyle = {
      fill: { fgColor: { rgb: "22C55E" } },
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const grayHeaderStyle = {
      fill: { fgColor: { rgb: "E5E7EB" } },
      font: { bold: true, color: { rgb: "374151" }, sz: 10 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "9CA3AF" } },
        bottom: { style: "thin", color: { rgb: "9CA3AF" } },
        left: { style: "thin", color: { rgb: "9CA3AF" } },
        right: { style: "thin", color: { rgb: "9CA3AF" } }
      }
    };

    const cellStyle = {
      font: { sz: 10 },
      alignment: { vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } }
      }
    };

    const blueInfoStyle = {
      fill: { fgColor: { rgb: "DBEAFE" } },
      font: { sz: 9, color: { rgb: "1E40AF" } },
      alignment: { vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "93C5FD" } },
        bottom: { style: "thin", color: { rgb: "93C5FD" } },
        left: { style: "thin", color: { rgb: "93C5FD" } },
        right: { style: "thin", color: { rgb: "93C5FD" } }
      }
    };

    const yellowWarningStyle = {
      fill: { fgColor: { rgb: "FEF3C7" } },
      font: { bold: true, sz: 10, color: { rgb: "92400E" } },
      alignment: { vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "FCD34D" } },
        bottom: { style: "thin", color: { rgb: "FCD34D" } },
        left: { style: "thin", color: { rgb: "FCD34D" } },
        right: { style: "thin", color: { rgb: "FCD34D" } }
      }
    };

    const greenVehicleStyle = {
      fill: { fgColor: { rgb: "DCFCE7" } },
      font: { sz: 11, bold: true, color: { rgb: "047857" } },
      alignment: { vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "86EFAC" } },
        bottom: { style: "thin", color: { rgb: "86EFAC" } },
        left: { style: "thin", color: { rgb: "86EFAC" } },
        right: { style: "thin", color: { rgb: "86EFAC" } }
      }
    };

    // Estilos para el encabezado oficial
    const mainTitleStyle = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const sectionHeaderStyle = {
      fill: { fgColor: { rgb: "D3D3D3" } },
      font: { bold: true, sz: 10 },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const dataRowStyle = {
      font: { sz: 10 },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const justifiedTextStyle = {
      font: { sz: 10 },
      alignment: { horizontal: "justify", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const programNameStyle = {
      font: { bold: true, sz: 11 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const eventInfoStyle = {
      font: { sz: 10 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const greenBannerStyle = {
      fill: { fgColor: { rgb: "22C55E" } },
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 },
      alignment: { horizontal: "center", vertical: "center" }
    };

    const tableAssignmentHeaderStyle = {
      fill: { fgColor: { rgb: "4B5563" } },
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 10 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };

    const assignmentCellStyle = {
      font: { sz: 10 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } }
      }
    };

    // Crear workbook
    const wb = XLSX.utils.book_new();
    const wsData = [];
    const merges = [];
    const rowStyles = {}; // Para rastrear estilos por fila

    let currentRow = 0;

    // === ENCABEZADO RTVC ===
    // Fila 1: Título principal y fecha
    wsData.push(['', '', 'REQUERIMIENTO DE SERVICIO DE TRANSPORTE', '', '', '', '', 'FECHA DE LA SOLICITUD:', formattedDate]);
    merges.push({ s: { r: currentRow, c: 2 }, e: { r: currentRow, c: 6 } });
    merges.push({ s: { r: currentRow, c: 7 }, e: { r: currentRow, c: 7 } });
    rowStyles[currentRow] = 'mainTitle';
    currentRow++;

    // Fila 2: Sección 1 - Encabezado
    wsData.push(['', '1. INFORMACIÓN DEL PROCESO SOLICITANTE Y DESIGNADO RESPONSABLE DEL EVENTO', '', '', '', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'sectionHeader';
    currentRow++;

    // Fila 3: Nombre del solicitante
    wsData.push(['', 'NOMBRE DEL SOLICITANTE DEL ÁREA:', '', '', 'LUIS SOLANO', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 3 } });
    merges.push({ s: { r: currentRow, c: 4 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'dataRow';
    currentRow++;

    // Fila 4: Email y Cargo
    wsData.push(['', 'EMAIL:', '', 'lsolano@rtvc.gov.co', '', 'CARGO:', '', 'PRODUCCIÓN', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
    merges.push({ s: { r: currentRow, c: 3 }, e: { r: currentRow, c: 4 } });
    merges.push({ s: { r: currentRow, c: 5 }, e: { r: currentRow, c: 6 } });
    merges.push({ s: { r: currentRow, c: 7 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'dataRow';
    currentRow++;

    // Fila 5: Sección 2 - Objeto de la solicitud
    wsData.push(['', '2. OBJETO DE LA SOLICITUD:', '', '', '', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'sectionHeader';
    currentRow++;

    // Fila 6: Descripción del transporte
    const horaInicio = shiftType === 'AM' ? '09:30 PM' : '09:30 PM';
    const horaFin = shiftType === 'AM' ? '10:00' : '10:00';
    const dias = shiftType === 'AM' ? 'LUNES A VIERNES' : 'LUNES A VIERNES';
    wsData.push(['', `TRANSPORTE PARA EL PERSONAL DEL NOTICIERO DE LA NOCHE, QUE VA EN DIRECTO DE ${dias} DE ${horaInicio} A ${horaFin}. INFORMATIVO`, '', '', '', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'justifiedText';
    currentRow++;

    // Fila 7: Sección 3 - Información general
    wsData.push(['', '3. INFORMACIÓN GENERAL DEL EVENTO', '', '', '', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'sectionHeader';
    currentRow++;

    // Fila 8: Programa
    wsData.push(['', programTitle, '', '', '', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'programName';
    currentRow++;

    // Fila 9: Fecha
    wsData.push(['', fechaLarga, '', '', '', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'eventInfo';
    currentRow++;

    // Fila 10: Hora
    wsData.push(['', turnoDisplay, '', '', '', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'eventInfo';
    currentRow++;

    // Fila 11: Ubicación
    wsData.push(['', 'BOGOTÁ - CUNDINAMARCA', '', '', '', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'eventInfo';
    currentRow++;

    // Fila 12: Dirección
    wsData.push(['', 'RTVC CARRERA 45 # 26 33', '', '', '', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'eventInfo';
    currentRow++;

    // Fila 13: Banner verde con nombre del programa
    wsData.push(['', programTitle.toUpperCase(), '', '', '', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'greenBanner';
    currentRow++;

    wsData.push(['']); // Línea vacía
    currentRow++;

    // === RUTAS ===
    const routeHeaderRows = [];
    const vehicleRows = [];
    const warningRows = [];
    const recorridoRows = [];
    const tableHeaderRows = [];
    const passengerRows = [];
    let assignmentHeaderRow = -1;
    const assignmentRows = [];

    optimizedRoutes.forEach((route) => {
      // Calcular recorrido de la ruta
      const localidades = route.passengers ?
        [...new Set(route.passengers.map(p => p.localidad || p.barrio).filter(Boolean))] : [];
      const recorrido = localidades.join(' → ');
      const passengerCount = route.total_passengers || route.passengers?.filter(p => p.name).length || 0;

      // Encabezado de ruta (verde)
      wsData.push([
        `RUTA ${route.route_number}`,
        `Zona: ${route.zone}`,
        '',
        '',
        '',
        '',
        `${passengerCount} pasajeros`,
        '',
        `${route.estimated_duration_minutes || 0} min`
      ]);
      merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 5 } });
      routeHeaderRows.push(currentRow);
      currentRow++;

      // Info del vehículo o advertencia
      if (route.vehicle_plate) {
        wsData.push([
          `Vehículo: ${route.vehicle_plate}`,
          '',
          route.driver_name ? `Conductor: ${route.driver_name}` : '',
          '',
          route.driver_phone ? `Tel: ${route.driver_phone}` : '',
          '', '', '', ''
        ]);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 1 } });
        merges.push({ s: { r: currentRow, c: 2 }, e: { r: currentRow, c: 3 } });
        vehicleRows.push(currentRow);
      } else {
        wsData.push(['Sin vehículo asignado', '', '', '', '', '', '', '', '']);
        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 8 } });
        warningRows.push(currentRow);
      }
      currentRow++;

      // Recorrido (azul)
      wsData.push([`Recorrido de la Ruta: ${recorrido}`, '', '', '', '', '', '', '', '']);
      merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow, c: 8 } });
      recorridoRows.push(currentRow);
      currentRow++;

      // Encabezados de tabla de pasajeros (gris)
      wsData.push(['#', 'Pasajero', '', 'Dirección', '', '', 'Localidad', 'Teléfono', '']);
      merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
      merges.push({ s: { r: currentRow, c: 3 }, e: { r: currentRow, c: 5 } });
      tableHeaderRows.push(currentRow);
      currentRow++;

      // Pasajeros
      if (route.passengers && Array.isArray(route.passengers)) {
        route.passengers.filter(p => p.name).forEach((passenger, idx) => {
          wsData.push([
            idx + 1,
            passenger.name || '',
            '',
            passenger.address || passenger.direccion || '',
            '',
            '',
            passenger.localidad || passenger.barrio || '',
            passenger.phone || '',
            ''
          ]);
          merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 2 } });
          merges.push({ s: { r: currentRow, c: 3 }, e: { r: currentRow, c: 5 } });
          passengerRows.push(currentRow);
          currentRow++;
        });
      }

      // Espacio entre rutas
      wsData.push(['']);
      currentRow++;
    });

    // === SECCIÓN PARA TRANSPORTE ===
    wsData.push(['']); // Línea vacía
    currentRow++;

    wsData.push(['', '=== PARA SER COMPLETADO POR EL DEPARTAMENTO DE TRANSPORTE ===', '', '', '', '', '', '', '']);
    merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow, c: 8 } });
    rowStyles[currentRow] = 'sectionHeader';
    currentRow++;

    wsData.push(['']); // Línea vacía
    currentRow++;

    // Encabezados de tabla de asignación
    wsData.push(['', 'RUTA', 'ZONA', 'PASAJEROS', 'VEHÍCULO ASIGNADO', 'PLACA', 'CONDUCTOR', 'TELÉFONO', 'OBSERVACIONES']);
    assignmentHeaderRow = currentRow;
    currentRow++;

    // Filas para completar por transporte
    optimizedRoutes.forEach(route => {
      wsData.push([
        '',
        `Ruta ${route.route_number}`,
        route.zone,
        route.total_passengers || route.passengers?.filter(p => p.name).length || 0,
        route.vehicle_plate || '',
        '',
        route.driver_name || '',
        route.driver_phone || '',
        ''
      ]);
      assignmentRows.push(currentRow);
      currentRow++;
    });

    // Crear worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Aplicar merges
    ws['!merges'] = merges;

    // Aplicar estilos a las celdas
    const range = XLSX.utils.decode_range(ws['!ref']);

    for (let R = range.s.r; R <= range.e.r; R++) {
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cellAddress]) {
          ws[cellAddress] = { v: '', t: 's' };
        }

        // Aplicar estilos según el tipo de fila
        if (routeHeaderRows.includes(R)) {
          ws[cellAddress].s = greenHeaderStyle;
        } else if (tableHeaderRows.includes(R)) {
          ws[cellAddress].s = grayHeaderStyle;
        } else if (vehicleRows.includes(R)) {
          ws[cellAddress].s = greenVehicleStyle;
        } else if (warningRows.includes(R)) {
          ws[cellAddress].s = yellowWarningStyle;
        } else if (recorridoRows.includes(R)) {
          ws[cellAddress].s = blueInfoStyle;
        } else if (passengerRows.includes(R)) {
          ws[cellAddress].s = cellStyle;
        } else if (rowStyles[R] === 'mainTitle') {
          ws[cellAddress].s = mainTitleStyle;
        } else if (rowStyles[R] === 'sectionHeader') {
          ws[cellAddress].s = sectionHeaderStyle;
        } else if (rowStyles[R] === 'dataRow') {
          ws[cellAddress].s = dataRowStyle;
        } else if (rowStyles[R] === 'justifiedText') {
          ws[cellAddress].s = justifiedTextStyle;
        } else if (rowStyles[R] === 'programName') {
          ws[cellAddress].s = programNameStyle;
        } else if (rowStyles[R] === 'eventInfo') {
          ws[cellAddress].s = eventInfoStyle;
        } else if (rowStyles[R] === 'greenBanner') {
          ws[cellAddress].s = greenBannerStyle;
        } else if (R === assignmentHeaderRow) {
          ws[cellAddress].s = tableAssignmentHeaderStyle;
        } else if (assignmentRows.includes(R)) {
          ws[cellAddress].s = assignmentCellStyle;
        }
      }
    }

    // Configurar anchos de columnas
    ws['!cols'] = [
      { wch: 8 },   // A - #
      { wch: 22 },  // B - Pasajero
      { wch: 8 },   // C
      { wch: 35 },  // D - Dirección
      { wch: 8 },   // E
      { wch: 8 },   // F
      { wch: 15 },  // G - Localidad
      { wch: 14 },  // H - Teléfono
      { wch: 10 }   // I - Duración
    ];

    // Configurar altura de filas
    ws['!rows'] = [];
    for (let i = 0; i <= currentRow; i++) {
      if (routeHeaderRows.includes(i)) {
        ws['!rows'][i] = { hpt: 25 };
      } else if (vehicleRows.includes(i)) {
        ws['!rows'][i] = { hpt: 28 }; // Mayor altura para info del vehículo
      } else if (rowStyles[i] === 'mainTitle') {
        ws['!rows'][i] = { hpt: 22 };
      } else if (rowStyles[i] === 'greenBanner') {
        ws['!rows'][i] = { hpt: 30 };
      } else if (rowStyles[i] === 'sectionHeader') {
        ws['!rows'][i] = { hpt: 20 };
      } else if (rowStyles[i] === 'justifiedText') {
        ws['!rows'][i] = { hpt: 35 }; // Mayor altura para texto justificado
      } else if (i === assignmentHeaderRow) {
        ws['!rows'][i] = { hpt: 22 };
      } else {
        ws['!rows'][i] = { hpt: 18 };
      }
    }

    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Rutas');

    // Generar archivo
    const fileName = `Rutas_RTVC_${day}-${month}-${year}_${shiftType}.xlsx`;
    XLSX.writeFile(wb, fileName);

    alert(`Excel generado: ${fileName}`);
  };

  const handleToggleTransportMode = async (assignment) => {
    const newMode = assignment.transport_mode === 'RUTA' ? 'PROPIO' : 'RUTA';

    try {
      const response = await fetch(`${API_URL}/routes/assignments/${assignment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assignment,
          transport_mode: newMode
        })
      });

      if (!response.ok) throw new Error('Error al actualizar');

      const result = await response.json();

      // Recargar asignaciones
      await loadAssignments();

      // Si el cambio requiere recálculo, preguntar al usuario
      if (result.recalculationNeeded) {
        const shouldRecalculate = confirm(
          '¿Desea recalcular las rutas automáticamente?\n\n' +
          'El modo de transporte cambió, se recomienda recalcular las rutas para optimizar.'
        );

        if (shouldRecalculate) {
          await handleOptimizeRoutes();
        }
      }
    } catch (error) {
      console.error('Error actualizando modo de transporte:', error);
      alert('Error al actualizar modo de transporte');
    }
  };

  const handleResetDay = async () => {
    if (!confirm(`¿RESETEAR todo para ${selectedDate}?\n\nEsto eliminará:\n- Todas las asignaciones\n- Todas las rutas optimizadas\n- Liberará vehículos\n\nEsta acción NO se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/routes/reset/${selectedDate}`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Error al resetear');

      const result = await response.json();
      alert(result.message);
      await loadData();
    } catch (error) {
      console.error('Error reseteando día:', error);
      alert('Error al resetear día');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignVehicle = async (vehicleData) => {
    try {
      const response = await fetch(`${API_URL}/routes/optimized/${assignVehicleModal.routeId}/assign-vehicle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData)
      });

      if (!response.ok) throw new Error('Error al asignar vehículo');

      const result = await response.json();

      // 📊 INTEGRACIÓN ANALYTICS: Registrar despacho de vehículo
      try {
        await analyticsService.recordVehicleDispatch({
          date: selectedDate,
          shift: shiftType,
          vehicleId: vehicleData.vehicle_id,
          vehiclePlate: vehicleData.vehicle_plate,
          driverName: vehicleData.driver_name,
          routeNumber: assignVehicleModal.routeNumber,
          zone: assignVehicleModal.zone,
          passengersCount: result.passengersCount || 0,
          program: programTitle
        });
        console.log('✅ [Analytics] Despacho registrado en Analytics');
      } catch (analyticsError) {
        console.error('⚠️ [Analytics] Error registrando en Analytics:', analyticsError);
        // No interrumpir el flujo principal si falla Analytics
      }

      alert(result.message);
      setAssignVehicleModal(null);
      await loadOptimizedRoutes();
    } catch (error) {
      console.error('Error asignando vehículo:', error);
      alert('Error al asignar vehículo');
    }
  };

  const handleUnassignVehicle = async (routeId) => {
    if (!confirm('¿Quitar la asignación de vehículo de esta ruta?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/routes/optimized/${routeId}/unassign-vehicle`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Error al desasignar vehículo');

      const result = await response.json();
      alert(result.message);
      await loadOptimizedRoutes();
    } catch (error) {
      console.error('Error desasignando vehículo:', error);
      alert('Error al desasignar vehículo');
    }
  };

  const handleMovePassenger = async (personnelId, targetRouteNumber) => {
    try {
      const response = await fetch(`${API_URL}/routes/move-passenger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personnelId,
          targetRouteNumber,
          date: selectedDate,
          shiftType
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al mover pasajero');
      }

      const result = await response.json();
      await loadOptimizedRoutes(); // Recargar rutas actualizadas
    } catch (error) {
      console.error('Error moviendo pasajero:', error);
      alert('Error al mover pasajero: ' + error.message);
    }
  };

  // Estadísticas
  const stats = {
    total: assignments.length,
    enRuta: assignments.filter(a => a.transport_mode === 'RUTA').length,
    propio: assignments.filter(a => a.transport_mode === 'PROPIO').length,
    rutas: optimizedRoutes.length,
    alertas: alerts.filter(a => !a.resolved).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Route className="text-blue-600" size={32} />
            Gestión de Rutas y Reportería
          </h2>
          <p className="text-gray-600 mt-1">
            Sistema de transporte y optimización de rutas
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
            icon={<Download size={20} />}
            disabled={optimizedRoutes.length === 0}
          >
            Excel
          </Button>
          <Button
            onClick={handleExportWhatsApp}
            variant="success"
            icon={<Send size={20} />}
            disabled={optimizedRoutes.length === 0}
          >
            WhatsApp
          </Button>
          <Button
            onClick={handleExportPDF}
            variant="primary"
            icon={<Download size={20} />}
            disabled={optimizedRoutes.length === 0}
          >
            PDF
          </Button>
        </div>
      </div>

      {/* Controles de fecha y turno */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Input
            label="Fecha"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            icon={<Calendar size={20} className="text-gray-400" />}
          />

          <Select
            label="Turno"
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value)}
            options={[
              { value: 'AM', label: '🌅 AM (05:00)' },
              { value: 'PM', label: '🌙 PM (22:00)' }
            ]}
          />

          <Input
            label="Título del Programa"
            type="text"
            value={programTitle}
            onChange={(e) => setProgramTitle(e.target.value)}
            placeholder="El Calentao"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex items-end">
            <Button
              onClick={handleInitializeAssignments}
              variant="primary"
              icon={<Users size={20} />}
              disabled={loading}
              className="w-full"
            >
              Cargar Personal
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => setGroupsModal(true)}
              variant="primary"
              icon={<Users size={20} />}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Plantillas
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              onClick={() => setExpressPassengerModal(true)}
              variant="secondary"
              icon={<Users size={20} />}
              disabled={loading}
              className="w-full"
            >
              + Pasajero Express
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleOpenLogisticModal}
              variant="secondary"
              icon={<Users size={20} />}
              disabled={loading}
              className="w-full"
            >
              + Personal Logístico
            </Button>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleOptimizeRoutes}
              variant="success"
              icon={<Zap size={20} />}
              disabled={loading || assignments.length === 0}
              className="w-full"
            >
              Optimizar Rutas
            </Button>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
            <AlertCircle size={20} />
            Alertas Activas ({alerts.length})
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="text-sm text-red-700 bg-white rounded p-2">
                {alert.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          icon={<Users size={24} />}
          label="Total Personal"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={<Truck size={24} />}
          label="En Ruta"
          value={stats.enRuta}
          color="green"
        />
        <StatCard
          icon={<Car size={24} />}
          label="Transporte Propio"
          value={stats.propio}
          color="purple"
        />
        <StatCard
          icon={<Route size={24} />}
          label="Rutas Creadas"
          value={stats.rutas}
          color="indigo"
        />
        <StatCard
          icon={<AlertCircle size={24} />}
          label="Alertas"
          value={stats.alertas}
          color={stats.alertas > 0 ? 'red' : 'gray'}
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 p-4">
            <TabButton
              active={activeTab === 'assignments'}
              onClick={() => setActiveTab('assignments')}
              icon={<Users size={20} />}
              label={`Asignaciones (${assignments.length})`}
            />
            <TabButton
              active={activeTab === 'routes'}
              onClick={() => setActiveTab('routes')}
              icon={<Route size={20} />}
              label={`Rutas Optimizadas (${optimizedRoutes.length})`}
            />
            <TabButton
              active={activeTab === 'fleet'}
              onClick={() => setActiveTab('fleet')}
              icon={<Truck size={20} />}
              label={`Flota (${vehicles.length})`}
            />
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Cargando datos...</div>
            </div>
          ) : (
            <>
              {activeTab === 'assignments' && (
                <AssignmentsTab
                  assignments={assignments}
                  onToggleTransportMode={handleToggleTransportMode}
                />
              )}

              {activeTab === 'routes' && (
                <RoutesTab
                  routes={optimizedRoutes}
                  selectedDate={selectedDate}
                  shiftType={shiftType}
                  programTitle={programTitle}
                  onAssignVehicle={(routeId, routeNumber, zone) =>
                    setAssignVehicleModal({ routeId, routeNumber, zone })
                  }
                  onUnassignVehicle={handleUnassignVehicle}
                  onMovePassenger={handleMovePassenger}
                />
              )}

              {activeTab === 'fleet' && (
                <FleetTab vehicles={vehicles} onRefresh={loadVehicles} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Zona de peligro */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-2">Zona de Peligro</h3>
        <p className="text-sm text-red-700 mb-3">
          Resetear eliminará TODAS las asignaciones y rutas para este día.
        </p>
        <Button
          onClick={handleResetDay}
          variant="danger"
          icon={<RefreshCw size={20} />}
          disabled={loading}
        >
          Resetear Día Completo
        </Button>
      </div>

      {/* Modal de Pasajero Express */}
      {expressPassengerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Añadir Pasajero Express</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={expressForm.name}
                  onChange={(e) => setExpressForm({ ...expressForm, name: e.target.value })}
                  placeholder="Nombre del invitado"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección Completa *
                </label>
                <input
                  type="text"
                  value={expressForm.direccion}
                  onChange={(e) => setExpressForm({ ...expressForm, direccion: e.target.value })}
                  placeholder="Calle 123 #45-67"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Barrio
                </label>
                <input
                  type="text"
                  value={expressForm.barrio}
                  onChange={(e) => setExpressForm({ ...expressForm, barrio: e.target.value })}
                  placeholder="Nombre del barrio"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localidad
                </label>
                <input
                  type="text"
                  value={expressForm.localidad}
                  onChange={(e) => setExpressForm({ ...expressForm, localidad: e.target.value })}
                  placeholder="Ej: Kennedy, Suba, Mosquera"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={expressForm.phone}
                  onChange={(e) => setExpressForm({ ...expressForm, phone: e.target.value })}
                  placeholder="300-123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => {
                    setExpressPassengerModal(false);
                    setExpressForm({ name: '', direccion: '', phone: '', barrio: '', localidad: '' });
                  }}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddExpressPassenger}
                  variant="primary"
                  className="flex-1"
                  disabled={!expressForm.name || !expressForm.direccion}
                >
                  Añadir
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Personal Logístico */}
      {logisticModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Seleccionar Personal Logístico ({selectedLogistic.length} seleccionados)
            </h3>

            {loading ? (
              <div className="text-center py-8">Cargando personal...</div>
            ) : (
              <div className="space-y-2 mb-6">
                {logisticPersonnel.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">No hay personal logístico disponible</div>
                ) : (
                  <>
                    {/* Agrupado por área */}
                    {['PERIODISTAS', 'PRODUCTORES', 'PRESENTADORES', 'INGENIEROS', 'INGENIEROS EMISION', 'INGENIEROS MASTER', 'DIRECTORES', 'ALMACEN', 'ARCHIVO', 'GRAFICADOR', 'EDITOR'].map(area => {
                      const personnel = logisticPersonnel.filter(p => p.area === area);
                      if (personnel.length === 0) return null;

                      return (
                        <div key={area} className="mb-4">
                          <div className="font-semibold text-gray-700 mb-2 bg-gray-100 px-3 py-1 rounded">
                            {area} ({personnel.length})
                          </div>
                          <div className="space-y-1">
                            {personnel.map(person => (
                              <div
                                key={person.id}
                                onClick={() => toggleLogisticSelection(person.id)}
                                className={`cursor-pointer p-3 rounded border transition-colors ${
                                  selectedLogistic.includes(person.id)
                                    ? 'bg-blue-50 border-blue-300'
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">{person.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {person.localidad || person.barrio || 'Sin localidad'} • {person.direccion || 'Sin dirección'}
                                    </div>
                                  </div>
                                  <div>
                                    {selectedLogistic.includes(person.id) && (
                                      <span className="text-blue-600 font-bold">✓</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button
                onClick={() => {
                  setLogisticModal(false);
                  setSelectedLogistic([]);
                }}
                variant="secondary"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddLogisticPersonnel}
                variant="primary"
                className="flex-1"
                disabled={selectedLogistic.length === 0}
              >
                Añadir ({selectedLogistic.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de asignación de vehículo */}
      {assignVehicleModal && (
        <AssignVehicleModal
          routeInfo={assignVehicleModal}
          vehicles={vehicles}
          onClose={() => setAssignVehicleModal(null)}
          onSubmit={handleAssignVehicle}
        />
      )}

      {/* Modal de Grupos de Rutas (Plantillas) */}
      <RouteGroupsModal
        isOpen={groupsModal}
        onClose={handleLoadGroupPersonnel}
        shiftType={shiftType}
      />

    </div>
  );
};

// Componente de Tarjeta de Estadística
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-100 text-gray-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-2`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

// Componente de Botón de Tab
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
      active
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {icon}
    {label}
  </button>
);

// Tab de Asignaciones
const AssignmentsTab = ({ assignments, onToggleTransportMode }) => {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay asignaciones para esta fecha y turno.
        <br />
        Use el botón "Cargar Personal" para inicializar.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-100 rounded font-semibold text-sm text-gray-700">
        <div className="col-span-3">Nombre</div>
        <div className="col-span-2">Rol/Área</div>
        <div className="col-span-4">Dirección</div>
        <div className="col-span-2">Modo Transporte</div>
        <div className="col-span-1">Ruta</div>
      </div>

      {assignments.map(assignment => (
        <div
          key={assignment.id}
          className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors items-center"
        >
          <div className="col-span-3 font-medium text-gray-900">
            {assignment.personnel_name}
            {assignment.is_express && (
              <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                Express
              </span>
            )}
          </div>
          <div className="col-span-2 text-sm text-gray-600">
            {assignment.personnel_role}
            <br />
            <span className="text-xs">{assignment.personnel_area}</span>
          </div>
          <div className="col-span-4 text-sm text-gray-600">
            {assignment.direccion || <span className="text-red-500">Sin dirección</span>}
          </div>
          <div className="col-span-2">
            <button
              onClick={() => onToggleTransportMode(assignment)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                assignment.transport_mode === 'RUTA'
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
              }`}
            >
              {assignment.transport_mode === 'RUTA' ? '🚐 Ruta' : '🚗 Propio'}
            </button>
          </div>
          <div className="col-span-1 text-center text-sm text-gray-600">
            {assignment.route_id ? `#${assignment.pickup_order}` : '-'}
          </div>
        </div>
      ))}
    </div>
  );
};

// Tab de Rutas Optimizadas
const RoutesTab = ({ routes, selectedDate, shiftType, programTitle, onAssignVehicle, onUnassignVehicle, onMovePassenger }) => {
  if (routes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No hay rutas optimizadas.
        <br />
        Use el botón "Optimizar Rutas" para generar rutas.
      </div>
    );
  }

  // Formatear fecha para mostrar
  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${days[date.getDay()]}, ${day} de ${months[date.getMonth()]} de ${year}`;
  };

  return (
    <div id="routes-pdf-content" className="space-y-4">
      {/* Encabezado oficial RTVC */}
      <div className="pdf-header border border-black mb-4">
        <table className="w-full border-b border-black text-xs">
          <tbody>
            <tr>
              <td className="border-r border-black text-center p-2" style={{width: '12%'}}>
                <div className="font-bold text-lg">RTVC</div>
                <div className="text-xs">Medios Públicos</div>
              </td>
              <td className="text-center p-3" style={{width: '76%'}}>
                <h1 className="font-bold text-base">REQUERIMIENTO DE SERVICIO DE TRANSPORTE</h1>
              </td>
              <td className="border-l border-black text-center p-2" style={{width: '12%'}}>
                <div className="font-bold text-xs">FECHA:</div>
                <div className="text-sm">{new Date().toLocaleDateString('es-CO')}</div>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="border-b border-black bg-gray-50 p-2">
          <table className="w-full text-xs">
            <tbody>
              <tr>
                <td className="font-bold px-1" style={{width: '12%'}}>PROGRAMA:</td>
                <td className="px-1" style={{width: '38%'}}>{programTitle || 'No especificado'}</td>
                <td className="font-bold px-1" style={{width: '12%'}}>FECHA:</td>
                <td className="px-1" style={{width: '38%'}}>{formatDate(selectedDate)}</td>
              </tr>
              <tr>
                <td className="font-bold px-1">TURNO:</td>
                <td className="px-1">{shiftType === 'AM' ? 'MATUTINO (05:00)' : 'NOCTURNO (22:00)'}</td>
                <td className="font-bold px-1">DESTINO:</td>
                <td className="px-1">RTVC CARRERA 45 # 26 33</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-green-600 text-white text-center font-bold py-2 text-sm">
          {programTitle || 'TRANSPORTE DE PERSONAL'}
        </div>
      </div>

      {/* Rutas */}
      {routes.map((route, index) => (
        <div
          key={route.route_id}
          className={`route-card bg-white border-2 border-gray-200 rounded-lg overflow-hidden shadow-sm ${index % 2 === 1 && index < routes.length - 1 ? 'page-break-after' : ''}`}
        >
          {/* Header de Ruta */}
          <div className="bg-green-600 text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MapPin size={20} />
              <span className="font-bold text-lg">RUTA {route.route_number}</span>
              <span className="text-sm opacity-90">Zona: {route.zone}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span>👥 {route.total_passengers} pasajeros</span>
              <span>⏱️ {route.estimated_duration_minutes} min</span>
            </div>
          </div>

          {/* Información del Vehículo */}
          {route.vehicle_plate ? (
            <div className="bg-green-50 p-4 border-b border-gray-200">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                  <div className="flex items-center gap-2">
                    <Truck size={18} className="text-green-600" />
                    <div>
                      <div className="text-xs text-gray-600">Vehículo Asignado</div>
                      <div className="font-bold text-gray-900">{route.vehicle_plate}</div>
                    </div>
                  </div>
                  {route.driver_name && (
                    <div className="flex items-center gap-2">
                      <User size={18} className="text-green-600" />
                      <div>
                        <div className="text-xs text-gray-600">Conductor</div>
                        <div className="font-medium text-gray-900">
                          {route.driver_name}
                          {route.driver_phone && ` • ${route.driver_phone}`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => {
                      const destinations = route.passengers?.filter(p => p.name).map(p => ({
                        address: p.direccion,
                        neighborhood: p.barrio,
                        passengerName: p.name
                      })) || [];

                      const message = generateVehicleDispatchMessage({
                        date: selectedDate,
                        shift: shiftType,
                        vehiclePlate: route.vehicle_plate,
                        driverName: route.driver_name,
                        routeNumber: route.route_number,
                        zone: route.zone,
                        passengersCount: route.total_passengers,
                        program: programTitle,
                        destinations
                      });

                      shareViaWhatsApp(message);
                    }}
                    variant="success"
                    size="sm"
                    icon={<MessageCircle size={16} />}
                    className="min-h-[44px] text-base md:text-sm"
                  >
                    <span className="hidden sm:inline">Compartir WhatsApp</span>
                    <span className="sm:hidden">WhatsApp</span>
                  </Button>
                  <Button
                    onClick={() => onUnassignVehicle(route.route_id)}
                    variant="danger"
                    size="sm"
                    className="min-h-[44px]"
                  >
                    <span className="hidden sm:inline">Quitar Vehículo</span>
                    <span className="sm:hidden">Quitar</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle size={18} />
                <span className="font-semibold">Sin vehículo asignado</span>
              </div>
              <Button
                onClick={() => onAssignVehicle(route.route_id, route.route_number, route.zone)}
                variant="primary"
                size="sm"
                icon={<Truck size={16} />}
              >
                Asignar Vehículo
              </Button>
            </div>
          )}

          {/* Recorrido de la Ruta */}
          {route.passengers && Array.isArray(route.passengers) && (
            <div className="bg-blue-50 p-3 border-b border-gray-200">
              <div className="flex items-start gap-2">
                <Navigation size={16} className="text-blue-600 mt-1" />
                <div>
                  <div className="text-xs font-semibold text-blue-900 mb-1">Recorrido de la Ruta:</div>
                  <div className="text-sm text-blue-800">
                    {[...new Set(route.passengers.map(p => p.localidad || p.barrio).filter(Boolean))].join(' → ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Pasajeros */}
          {route.passengers && Array.isArray(route.passengers) && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-400 px-4 py-2 text-left text-xs font-semibold text-gray-700" style={{width: '5%'}}>#</th>
                    <th className="border border-gray-400 px-4 py-2 text-left text-xs font-semibold text-gray-700" style={{width: '25%'}}>Pasajero</th>
                    <th className="border border-gray-400 px-4 py-2 text-left text-xs font-semibold text-gray-700" style={{width: '40%'}}>Dirección</th>
                    <th className="border border-gray-400 px-4 py-2 text-left text-xs font-semibold text-gray-700" style={{width: '18%'}}>Localidad</th>
                    <th className="border border-gray-400 px-4 py-2 text-center text-xs font-semibold text-gray-700" style={{width: '12%'}}>Mover a</th>
                  </tr>
                </thead>
                <tbody>
                  {route.passengers.filter(p => p.name).map((passenger, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-400 px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                          {passenger.pickup_order || idx + 1}
                        </span>
                      </td>
                      <td className="border border-gray-400 px-4 py-3 font-medium text-gray-900">{passenger.name}</td>
                      <td className="border border-gray-400 px-4 py-3 text-sm text-gray-700">{passenger.address}</td>
                      <td className="border border-gray-400 px-4 py-3 text-sm text-gray-600">
                        {passenger.localidad || passenger.barrio || '-'}
                      </td>
                      <td className="border border-gray-400 px-4 py-3 text-center">
                        <select
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          value={route.route_number}
                          onChange={(e) => onMovePassenger(passenger.personnelId, parseInt(e.target.value))}
                        >
                          <option value={route.route_number}>Ruta {route.route_number}</option>
                          {routes.filter(r => r.route_number !== route.route_number).map(r => (
                            <option key={r.route_number} value={r.route_number}>
                              → Ruta {r.route_number}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Tab de Flota
const FleetTab = ({ vehicles, onRefresh }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Vehículos Disponibles</h3>
        <Button onClick={onRefresh} variant="secondary" icon={<RefreshCw size={16} />}>
          Actualizar
        </Button>
      </div>

      <div className="space-y-2">
        {vehicles.map(vehicle => (
          <div
            key={vehicle.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div>
              <div className="font-medium text-gray-900">{vehicle.vehicle_code}</div>
              <div className="text-sm text-gray-600">
                {vehicle.vehicle_type} | Capacidad: {vehicle.capacity} personas
              </div>
              {vehicle.driver_name && (
                <div className="text-sm text-gray-600">
                  Conductor: {vehicle.driver_name}
                </div>
              )}
            </div>
            <div>
              <StatusBadge status={vehicle.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusConfig = {
    AVAILABLE: { label: 'Disponible', color: 'bg-green-100 text-green-800' },
    IN_ROUTE: { label: 'En Ruta', color: 'bg-blue-100 text-blue-800' },
    MAINTENANCE: { label: 'Mantenimiento', color: 'bg-yellow-100 text-yellow-800' },
    REPORTING: { label: 'Reportería', color: 'bg-purple-100 text-purple-800' }
  };

  const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

// Modal para asignar vehículo
const AssignVehicleModal = ({ routeInfo, vehicles, onClose, onSubmit }) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [formData, setFormData] = useState({
    vehicle_plate: '',
    driver_name: '',
    driver_phone: '',
    vehicle_type: 'Van'
  });

  // Filtrar solo vehículos disponibles
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');

  // Manejar selección de vehículo
  const handleVehicleSelect = (e) => {
    const vehicleId = e.target.value;
    setSelectedVehicleId(vehicleId);

    if (vehicleId) {
      const vehicle = vehicles.find(v => v.id === parseInt(vehicleId));
      if (vehicle) {
        setFormData({
          vehicle_plate: vehicle.plate || vehicle.vehicle_code, // Usar plate si existe, sino vehicle_code
          driver_name: vehicle.driver_name || '',
          driver_phone: vehicle.driver_phone || '',
          vehicle_type: vehicle.vehicle_type
        });
      }
    } else {
      setFormData({
        vehicle_plate: '',
        driver_name: '',
        driver_phone: '',
        vehicle_type: 'Van'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.vehicle_plate || !formData.driver_name) {
      alert('Placa y conductor son obligatorios');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Asignar Vehículo - Ruta {routeInfo.routeNumber}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Zona: {routeInfo.zone}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Vehículo Disponible *
            </label>
            <select
              value={selectedVehicleId}
              onChange={handleVehicleSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Seleccione un vehículo --</option>
              {availableVehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_code} (Capacidad: {vehicle.capacity})
                </option>
              ))}
            </select>
            {availableVehicles.length === 0 && (
              <p className="text-sm text-red-600 mt-1">
                No hay vehículos disponibles en este momento
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placa del Vehículo *
            </label>
            <input
              type="text"
              value={formData.vehicle_plate}
              onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value.toUpperCase() })}
              placeholder="ABC-123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
              required
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Vehículo
            </label>
            <input
              type="text"
              value={formData.vehicle_type}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Conductor *
            </label>
            <input
              type="text"
              value={formData.driver_name}
              onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
              placeholder="Juan Pérez"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono del Conductor
            </label>
            <input
              type="tel"
              value={formData.driver_phone}
              onChange={(e) => setFormData({ ...formData, driver_phone: e.target.value })}
              placeholder="300-123-4567"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={availableVehicles.length === 0}
            >
              Asignar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
