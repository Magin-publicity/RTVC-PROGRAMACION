// src/utils/mealPdfGenerator.js
// Generador de PDF para listados de alimentación
// Formato idéntico al Excel de referencia

import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Genera un PDF con el listado de solicitudes de comida
 * Formato: Idéntico al Excel "REFRIGERIO PM 15 DICIEMBRE"
 *
 * @param {Object} data - Datos para el PDF
 * @param {string} data.serviceName - Nombre del servicio (DESAYUNO, ALMUERZO, CENA)
 * @param {string} data.date - Fecha del servicio (YYYY-MM-DD)
 * @param {Array} data.requests - Array de solicitudes
 * @param {number} data.total - Total de porciones
 */
export function generateMealPDF(data) {
  const { serviceName, date, requests, total } = data;

  // Formatear fecha para el título
  const dateObj = new Date(date + 'T00:00:00');
  const dateFormatted = dateObj.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toUpperCase();

  // Crear documento PDF (Carta: 215.9mm x 279.4mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  // ========================================
  // ENCABEZADO
  // ========================================

  // Título principal
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const title = `${serviceName} - ${dateFormatted}`;
  const titleWidth = doc.getTextWidth(title);
  const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
  doc.text(title, titleX, 20);

  // Línea separadora
  doc.setLineWidth(0.5);
  doc.line(20, 25, doc.internal.pageSize.width - 20, 25);

  // ========================================
  // TABLA DE SOLICITUDES
  // ========================================

  // Preparar datos para la tabla
  const tableData = requests.map((request, index) => [
    index + 1, // Número
    request.personnel_name,
    request.cargo || '-',
    request.is_guest ? 'Invitado' : 'Personal'
  ]);

  // Configuración de la tabla (formato similar al Excel)
  doc.autoTable({
    startY: 30,
    head: [['#', 'NOMBRE', 'CARGO', 'TIPO']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185], // Azul
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 10,
      textColor: 50
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 }, // Número
      1: { halign: 'left', cellWidth: 80 },    // Nombre
      2: { halign: 'left', cellWidth: 50 },    // Cargo
      3: { halign: 'center', cellWidth: 30 }   // Tipo
    },
    margin: { left: 20, right: 20 },
    didDrawPage: (data) => {
      // Footer con número de página
      const pageCount = doc.internal.getNumberOfPages();
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Página ${pageNumber} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
  });

  // ========================================
  // TOTAL AL FINAL
  // ========================================

  const finalY = doc.lastAutoTable.finalY + 10;

  // Recuadro para el total (similar al Excel)
  doc.setFillColor(240, 240, 240); // Gris claro
  doc.rect(20, finalY, doc.internal.pageSize.width - 40, 12, 'F');

  // Borde del recuadro
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.rect(20, finalY, doc.internal.pageSize.width - 40, 12, 'S');

  // Texto del total
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const totalText = `TOTAL: ${total} ${total === 1 ? 'PORCIÓN' : 'PORCIONES'}`;
  doc.text(totalText, 25, finalY + 8);

  // ========================================
  // INFORMACIÓN ADICIONAL
  // ========================================

  const infoY = finalY + 20;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);

  const generatedDate = new Date().toLocaleString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  doc.text(`Generado el: ${generatedDate}`, 20, infoY);
  doc.text('Sistema de Gestión RTVC', 20, infoY + 5);

  // ========================================
  // GUARDAR PDF
  // ========================================

  // Nombre del archivo
  const fileName = `${serviceName}_${date.replace(/-/g, '')}.pdf`;
  doc.save(fileName);

  console.log(`✅ PDF generado: ${fileName}`);
  return fileName;
}

/**
 * Genera un PDF solo con los confirmados (para enviar al proveedor)
 */
export function generateConfirmedMealPDF(data) {
  // Filtrar solo confirmados
  const confirmedRequests = data.requests.filter(r => r.status === 'CONFIRMADO');

  return generateMealPDF({
    ...data,
    requests: confirmedRequests,
    total: confirmedRequests.length,
    serviceName: `${data.serviceName} - CONFIRMADOS`
  });
}

/**
 * Vista previa de datos para debugging
 */
export function previewMealData(data) {
  console.group('📄 Vista Previa PDF');
  console.log('Servicio:', data.serviceName);
  console.log('Fecha:', data.date);
  console.log('Total solicitudes:', data.requests.length);
  console.log('Total porciones:', data.total);
  console.table(data.requests.map((r, i) => ({
    '#': i + 1,
    Nombre: r.personnel_name,
    Cargo: r.cargo,
    Estado: r.status,
    Tipo: r.is_guest ? 'Invitado' : 'Personal'
  })));
  console.groupEnd();
}
