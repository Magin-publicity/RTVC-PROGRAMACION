# 📊 Guía de Integración del Sistema de Analítica RTVC

## Resumen

El nuevo sistema de analítica transforma reportes largos en **KPIs visuales** y genera **cierres de mes automáticos** con descarga de archivos JSON.

---

## Archivos Creados

1. **`src/services/analyticsService.js`** - Servicio de procesamiento de datos y generación de reportes
2. **`src/components/Analytics/ReportDashboard.jsx`** - Componente visual de dashboard de KPIs

---

## Integración Paso a Paso

### Paso 1: Importar el Componente de Reporte

En cualquier componente donde quieras mostrar reportes (por ejemplo, en tu Dashboard principal o en un módulo de reportes):

```javascript
import { ReportDashboard } from './components/Analytics/ReportDashboard';
import { useState } from 'react';
```

### Paso 2: Agregar Estado para Controlar el Modal

```javascript
const [showReport, setShowReport] = useState(false);
const [reportData, setReportData] = useState(null);
```

### Paso 3: Preparar los Datos para el Reporte

Cuando el usuario solicite ver el reporte, prepara los datos de la semana:

```javascript
const handleGenerateReport = async () => {
  // Definir rango de fechas (ejemplo: última semana)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  // Recopilar datos de todas las fuentes
  const weekData = {
    routes: await getRoutesData(startDate, endDate),      // Tus datos de rutas
    meals: await getMealsData(startDate, endDate),        // Tus datos de alimentación
    equipment: await getEquipmentData(startDate, endDate) // Tus datos de equipos
  };

  setReportData({
    weekData,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  });

  setShowReport(true);
};
```

### Paso 4: Renderizar el Componente

```javascript
return (
  <div>
    {/* Tu contenido existente */}

    <Button onClick={handleGenerateReport}>
      📊 Ver Reporte Semanal
    </Button>

    {/* Modal de Reporte */}
    {showReport && reportData && (
      <ReportDashboard
        weekData={reportData.weekData}
        startDate={reportData.startDate}
        endDate={reportData.endDate}
        onClose={() => setShowReport(false)}
      />
    )}
  </div>
);
```

---

## Ejemplo Completo de Integración

### Opción A: Integración en Dashboard Principal

```javascript
// src/App.jsx o src/Dashboard.jsx
import React, { useState } from 'react';
import { ReportDashboard } from './components/Analytics/ReportDashboard';
import { Button } from './components/UI/Button';

export const Dashboard = () => {
  const [showReport, setShowReport] = useState(false);

  const handleShowReport = async () => {
    // Obtener datos de la última semana
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];

    // Preparar datos simulados (reemplaza con tus datos reales)
    const weekData = {
      routes: [
        {
          route_id: 1,
          vehicle_plate: 'ABC-123',
          total_passengers: 5,
          zone: 'SUR',
          shift_type: 'AM',
          date: '2026-01-15'
        }
        // ... más rutas
      ],
      meals: [
        {
          id: 1,
          service_type: 'DESAYUNO',
          status: 'CONFIRMADO',
          date: '2026-01-15'
        }
        // ... más servicios
      ],
      equipment: [
        {
          id: 1,
          type: 'LiveU',
          hours: 4.5,
          date: '2026-01-15'
        }
        // ... más equipos
      ]
    };

    setShowReport({ weekData, startDate, endDate });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard RTVC</h1>

      <Button
        onClick={handleShowReport}
        variant="primary"
      >
        📊 Ver Reporte Semanal
      </Button>

      {showReport && (
        <ReportDashboard
          weekData={showReport.weekData}
          startDate={showReport.startDate}
          endDate={showReport.endDate}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};
```

### Opción B: Integración con tus Servicios Existentes

Si ya tienes servicios como `routesService.js` o `mealsService.js`:

```javascript
// En tu componente
import { routesService } from './services/routesService';
import { mealsService } from './services/mealsService';
import { ReportDashboard } from './components/Analytics/ReportDashboard';

const handleGenerateWeeklyReport = async () => {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  try {
    // Obtener datos reales de tus servicios
    const routes = await routesService.getByDateRange(startDate, endDate);
    const meals = await mealsService.getByDateRange(startDate, endDate);

    // Preparar estructura esperada
    const weekData = {
      routes: routes.map(r => ({
        route_id: r.id,
        vehicle_plate: r.vehicle_plate,
        total_passengers: r.passengers?.length || 0,
        zone: r.zone,
        shift_type: r.shift,
        date: r.date,
        passengers: r.passengers?.map(p => ({
          name: p.name,
          expected_shift: p.shift // Si tienes esta info
        }))
      })),
      meals: meals.map(m => ({
        id: m.id,
        service_type: m.service,
        status: m.status,
        date: m.date
      })),
      equipment: [] // Agregar si tienes datos de equipos
    };

    setReportData({ weekData, startDate, endDate });
    setShowReport(true);
  } catch (error) {
    console.error('Error generando reporte:', error);
    alert('Error al generar reporte');
  }
};
```

---

## Funcionalidad de Cierre de Mes

El componente incluye un botón **"Cerrar Mes"** que:

1. ✅ Consolida todos los reportes semanales del mes
2. ✅ Genera un archivo JSON con el resumen completo
3. ✅ Descarga automáticamente el archivo
4. ✅ Limpia el localStorage para el siguiente mes
5. ✅ Archiva el resumen en histórico

### Uso:

```javascript
// El usuario solo necesita hacer clic en "Cerrar Mes" en el dashboard
// El sistema automáticamente:
// 1. Pregunta confirmación
// 2. Genera el JSON consolidado
// 3. Descarga el archivo: RTVC_Reporte_2026-01.json
// 4. Limpia reportes antiguos
```

---

## Estructura de Datos Esperada

### Rutas (`weekData.routes`)

```javascript
[
  {
    route_id: 1,
    vehicle_plate: "ABC-123",
    total_passengers: 5,
    zone: "SUR",
    shift_type: "AM",
    date: "2026-01-15",
    passengers: [
      {
        name: "Juan Pérez",
        expected_shift: "AM" // Opcional, para detectar excepciones
      }
    ]
  }
]
```

### Alimentación (`weekData.meals`)

```javascript
[
  {
    id: 1,
    service_type: "DESAYUNO", // "DESAYUNO", "ALMUERZO", "CENA"
    status: "CONFIRMADO",      // "CONFIRMADO", "CANCELADO", "PENDIENTE"
    date: "2026-01-15"
  }
]
```

### Equipos (`weekData.equipment`)

```javascript
[
  {
    id: 1,
    type: "LiveU",
    hours: 4.5,
    date: "2026-01-15"
  }
]
```

---

## KPIs Generados Automáticamente

El sistema calcula:

### 1. **Balance de Flotas** 🚛
- Total de despachos
- Vehículos utilizados
- Vehículo más usado (placa + número de usos)
- Promedio de pasajeros por vehículo

### 2. **Consumo de Alimentos** 🍽️
- Total de servicios
- Desglose: Entregados / Cancelados / Pendientes
- Eficiencia (% de entregados)
- Breakdown por servicio (Desayuno/Almuerzo/Cena)

### 3. **Uso de Equipos** 📡
- Total de transmisiones
- Horas totales de uso
- Promedio de horas por transmisión

### 4. **Excepciones de Personal** ⚠️
- Personal despachado fuera de su turno
- Detalles de cada excepción
- Total de alertas

### 5. **Eficiencia General** 📊
- Score consolidado (0-100%)
- Comparación con semana anterior
- Tendencias (📈/📉/➡️)

---

## Comparación con Semana Anterior

El sistema automáticamente compara con la semana anterior y muestra:

- **📈 Tendencia positiva**: Valores aumentaron
- **📉 Tendencia negativa**: Valores disminuyeron
- **➡️ Sin cambio**: Valores iguales
- **Porcentaje de cambio**: +5%, -3%, etc.

---

## Uso Directo del Servicio (Sin UI)

Si solo necesitas los datos sin interfaz visual:

```javascript
import { analyticsService } from './services/analyticsService';

// Generar reporte
const report = analyticsService.generateWeeklyReport(weekData, startDate, endDate);

// Guardar reporte
analyticsService.saveWeeklyReport(report);

// Comparar con semana anterior
const comparison = analyticsService.compareWithPreviousWeek(report);

// Cerrar mes
const result = await analyticsService.closeMonth(2026, 1);
console.log(result.fileName); // "RTVC_Reporte_2026-01.json"

// Ver archivo mensual histórico
const archive = analyticsService.getMonthlyArchive();
```

---

## Personalización

### Cambiar Colores del Dashboard

En `ReportDashboard.jsx`, modifica:

```javascript
const colorClasses = {
  blue: 'border-blue-200 bg-blue-50',
  green: 'border-green-200 bg-green-50',
  // Agrega tus colores personalizados
};
```

### Agregar Nuevos KPIs

En `analyticsService.js`, agrega tu función de cálculo:

```javascript
_calculateCustomMetric(data) {
  // Tu lógica aquí
  return {
    total: 100,
    average: 50
  };
}
```

Y agrégala al reporte:

```javascript
report.kpis.customMetric = this._calculateCustomMetric(weekData.custom || []);
```

---

## Ejemplo de Archivo JSON Generado

Al cerrar el mes, se descarga un archivo como:

```json
{
  "period": {
    "year": 2026,
    "month": 1,
    "monthName": "Enero",
    "weeksIncluded": 4
  },
  "generatedAt": "2026-01-31T12:00:00.000Z",
  "summary": {
    "fleet": {
      "totalDispatches": 98,
      "avgDispatchesPerWeek": "24.5",
      "vehiclesUsed": 5,
      "mostUsedVehicle": {
        "plate": "ABC-123",
        "dispatches": 45
      }
    },
    "meals": {
      "total": 310,
      "delivered": 304,
      "cancelled": 6,
      "efficiency": 98.1
    }
  }
}
```

---

## Soporte y Troubleshooting

### Problema: No aparece el reporte

**Solución**: Verifica que `weekData` tenga la estructura correcta:

```javascript
console.log(weekData);
// Debe tener: { routes: [...], meals: [...], equipment: [...] }
```

### Problema: Comparación no funciona

**Solución**: Necesitas al menos 2 reportes guardados. El primero no tendrá comparación.

### Problema: Cierre de mes no descarga archivo

**Solución**: Verifica que el navegador permita descargas. Revisa la consola para errores.

---

## Próximos Pasos

1. ✅ Integra el componente en tu dashboard
2. ✅ Conecta con tus servicios de datos existentes
3. ✅ Prueba con datos de muestra
4. ✅ Ajusta los KPIs según tus necesidades
5. ✅ Genera tu primer cierre de mes

---

**¡Listo!** 🎉 Ahora tienes un sistema de analítica profesional con KPIs visuales y gestión automática de reportes mensuales.
