// src/utils/exportToPDF.js

export const generatePDF = async (schedule, options = {}) => {
  const {
    title = 'Programación RTVC',
    startDate,
    endDate,
    includeNovelties = true
  } = options;
  
  // Usar jsPDF para generar el PDF
  // Esta es una implementación básica que deberás expandir
  
  const html = generateScheduleHTML(schedule, {
    title,
    startDate,
    endDate,
    includeNovelties
  });
  
  // Abrir en nueva ventana para imprimir
  const printWindow = window.open('', '_blank');
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

const generateScheduleHTML = (schedule, options) => {
  const { title, startDate, endDate, includeNovelties } = options;
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          font-size: 12px;
        }
        h1 {
          text-align: center;
          color: #1F2937;
          margin-bottom: 10px;
        }
        .subtitle {
          text-align: center;
          color: #6B7280;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          page-break-inside: avoid;
        }
        th {
          background-color: #1F2937;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 8px;
          border: 1px solid #E5E7EB;
        }
        .area-header {
          background-color: #F3F4F6;
          font-weight: bold;
          color: #1F2937;
        }
        .novelty {
          background-color: #FEF3C7;
          color: #92400E;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
        }
        @media print {
          body { margin: 0; }
          table { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="subtitle">
        ${startDate ? `Del ${new Date(startDate).toLocaleDateString('es-CO')}` : ''}
        ${endDate ? ` al ${new Date(endDate).toLocaleDateString('es-CO')}` : ''}
      </p>
  `;
  
  Object.keys(schedule).forEach(date => {
    html += `
      <h2>${new Date(date).toLocaleDateString('es-CO', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}</h2>
      <table>
        <thead>
          <tr>
            <th>Área</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Turno</th>
            ${includeNovelties ? '<th>Novedad</th>' : ''}
          </tr>
        </thead>
        <tbody>
    `;
    
    Object.keys(schedule[date]).forEach(area => {
      html += `<tr><td colspan="${includeNovelties ? 5 : 4}" class="area-header">${area}</td></tr>`;
      
      schedule[date][area].forEach(entry => {
        html += `
          <tr>
            <td></td>
            <td>${entry.personnel.name}</td>
            <td>${entry.personnel.role}</td>
            <td>${entry.shift}</td>
            ${includeNovelties ? `<td>${entry.novelty ? `<span class="novelty">${entry.novelty.type}</span>` : ''}</td>` : ''}
          </tr>
        `;
      });
    });
    
    html += `
        </tbody>
      </table>
    `;
  });
  
  html += `
    </body>
    </html>
  `;
  
  return html;
};

export const downloadPDF = async (schedule, filename = 'programacion.pdf') => {
  // Implementación para descargar directamente
  // Requiere librería como jsPDF o html2pdf
  console.log('Descargando PDF:', filename);
};