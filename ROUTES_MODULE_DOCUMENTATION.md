# Módulo de Gestión de Rutas y Reportería - RTVC

## Resumen Ejecutivo

Se ha implementado exitosamente el **Módulo de Gestión de Rutas y Reportería** como una capa administrativa independiente que NO afecta la programación técnica existente.

**Fecha de implementación:** 2026-01-10
**Backup previo creado:** `backup_BEFORE_ROUTES_MODULE_2026-01-11_22-27-55.json`

---

## Componentes Implementados

### 1. Base de Datos (7 tablas nuevas)

#### Tablas Principales:
- **`daily_transport_assignments`**: Asignaciones diarias de transporte por empleado
- **`optimized_routes`**: Rutas optimizadas con agrupación de pasajeros
- **`fleet_vehicles`**: Vehículos disponibles en la flota
- **`address_geocoding_cache`**: Cache de direcciones geocodificadas (evita llamadas repetidas a Google API)
- **`distance_matrix_cache`**: Cache de distancias y tiempos entre puntos
- **`route_alerts`**: Alertas generadas automáticamente por el sistema
- **`routes_configuration`**: Configuración del módulo

#### Vista Materializada:
- **`v_daily_routes`**: Vista que combina rutas con sus pasajeros en formato JSON

**Archivo:** `backend/database/migrations/create_routes_module.sql`

### 2. Servicios Backend (3 servicios)

#### a) Google Maps Service (`backend/services/googleMapsService.js`)
**Funcionalidades:**
- Geocodificación de direcciones con cache inteligente (30 días)
- Cálculo de distancias y tiempos con Google Distance Matrix API
- Determinación automática de zonas geográficas (Norte, Sur, Occidente, etc.)
- Validación de direcciones
- Sistema de cache para reducir costos de API

**Configuración requerida:**
```sql
UPDATE routes_configuration
SET config_value = 'TU_API_KEY_AQUI'
WHERE config_key = 'GOOGLE_API_KEY';
```

#### b) Route Optimization Service (`backend/services/routeOptimizationService.js`)
**Funcionalidades:**
- Optimización automática de rutas por zona geográfica
- Agrupación inteligente de pasajeros (máx 4 por vehículo)
- Ordenamiento por distancia:
  - **AM**: Recoger del más lejano al más cercano → RTVC
  - **PM**: Entregar del más cercano al más lejano desde RTVC
- Generación automática de alertas:
  - Direcciones inválidas (CRITICAL)
  - Vehículos insuficientes (CRITICAL)
  - Rutas > 60 minutos (WARNING)
- Cálculo de vehículos necesarios

**Parámetros configurables:**
- `MAX_PASSENGERS_PER_VEHICLE`: 4 (por defecto)
- `MAX_ROUTE_DURATION_MINUTES`: 60 (por defecto)
- `RTVC_ADDRESS`: Cra 45 # 26-33, Bogotá, Colombia

#### c) Export Service (`backend/services/exportService.js`)
**Formatos de exportación:**
1. **WhatsApp**: Texto formateado con emojis, listo para copiar/pegar
2. **PDF**: Datos estructurados JSON para generación de PDF
3. **Reporte Simple**: Texto plano para impresión

**Ejemplo de formato WhatsApp:**
```
*REQUERIMIENTO - Lunes 10 de Enero de 2026*
━━━━━━━━━━━━━━━━━━━━━━

🚐 *RUTAS DE TRANSPORTE*

📍 *Ruta 1* - SUR
🚗 Vehículo: VAN-001
👤 Conductor: Juan Pérez
👥 Pasajeros (4):
   1. Carlos Rodríguez - EL CALENTAO
      📍 Calle 12 Sur # 45-67, Bogotá
   2. María González
      📍 Carrera 30 # 10-20, Bogotá
   ...
```

### 3. API Endpoints (20 endpoints)

**Base URL:** `http://localhost:3000/api/routes`

#### Asignaciones de Transporte
- `GET /assignments/:date/:shiftType` - Obtener asignaciones
- `POST /assignments/initialize` - Cargar personal desde programación técnica
- `PUT /assignments/:id` - Actualizar asignación (cambiar RUTA/PROPIO)
- `POST /assignments/express` - Agregar pasajero express temporal
- `DELETE /assignments/:id` - Eliminar asignación

#### Optimización de Rutas
- `POST /optimize` - Ejecutar optimización de rutas
- `GET /optimized/:date/:shiftType` - Obtener rutas optimizadas
- `GET /calculate-vehicles/:date/:shiftType` - Calcular vehículos necesarios

#### Gestión de Flota
- `GET /fleet` - Listar vehículos
- `POST /fleet` - Crear vehículo
- `PUT /fleet/:id` - Actualizar vehículo
- `PUT /fleet/:id/assign` - Asignar vehículo a ruta

#### Alertas
- `GET /alerts/:date` - Obtener alertas del día
- `PUT /alerts/:id/resolve` - Marcar alerta como resuelta

#### Configuración
- `GET /config` - Obtener configuración
- `PUT /config/:key` - Actualizar parámetro

#### Exportación
- `GET /export/whatsapp/:date/:shiftType` - Generar formato WhatsApp
- `GET /export/pdf/:date/:shiftType` - Generar datos para PDF
- `GET /export/report/:date/:shiftType` - Generar reporte texto

#### Reset
- `POST /reset/:date` - Resetear día completo

**Archivo:** `backend/routes/routes.js`

### 4. Interfaz de Usuario

**Ubicación:** Menú lateral → "Gestión de Rutas" (icono de ruta)

**Componente Principal:** `src/components/Routes/RoutesManagement.jsx`

#### Características de la UI:
1. **Selector de Fecha y Turno**
   - Selección de fecha con calendario
   - Toggle AM (05:00) / PM (22:00)

2. **Botones de Acción**
   - **Cargar Personal**: Inicializa asignaciones desde programación técnica
   - **Optimizar Rutas**: Ejecuta el algoritmo de optimización
   - **WhatsApp**: Copia formato al portapapeles
   - **PDF**: Genera datos para PDF (en desarrollo)

3. **Alertas Visuales**
   - Panel rojo con alertas críticas
   - Máximo 5 alertas mostradas
   - Click para ver detalles

4. **Tarjetas de Estadísticas**
   - Total Personal
   - En Ruta (🚐)
   - Transporte Propio (🚗)
   - Rutas Creadas
   - Alertas Activas

5. **Pestañas Principales**

   **a) Asignaciones**
   - Lista completa de personal del día
   - Toggle manual RUTA ↔ PROPIO por persona
   - Indicador de pasajeros express
   - Visualización de dirección
   - Número de orden en ruta

   **b) Rutas Optimizadas**
   - Visualización por ruta con pasajeros
   - Orden de recogida/entrega
   - Vehículo asignado
   - Duración estimada
   - Distancia total

   **c) Flota**
   - Lista de vehículos disponibles
   - Estado: Disponible / En Ruta / Mantenimiento / Reportería
   - Información del conductor
   - Capacidad del vehículo

6. **Zona de Peligro**
   - Botón "Resetear Día Completo"
   - Confirmación doble
   - Elimina TODAS las asignaciones y rutas

---

## Flujo de Trabajo Típico

### Escenario: Programar Rutas para el Turno AM del día siguiente

1. **Cargar Personal** (08:00 AM - día anterior)
   - Navegar a "Gestión de Rutas"
   - Seleccionar fecha del día siguiente
   - Seleccionar "AM (05:00)"
   - Click en "Cargar Personal"
   - Sistema importa personal programado en turno 5:00

2. **Revisar y Ajustar Asignaciones** (08:15 AM)
   - Ver lista de personal en tab "Asignaciones"
   - Identificar personal con transporte propio
   - Click en botón "🚐 Ruta" para cambiar a "🚗 Propio"
   - Agregar pasajeros express si es necesario

3. **Optimizar Rutas** (08:30 AM)
   - Click en "Optimizar Rutas"
   - Sistema:
     - Geocodifica direcciones
     - Agrupa por zona geográfica
     - Calcula distancias
     - Crea rutas optimizadas
     - Genera alertas si hay problemas

4. **Revisar Rutas** (08:35 AM)
   - Tab "Rutas Optimizadas"
   - Verificar agrupación por zona
   - Revisar orden de recogida
   - Asignar vehículos manualmente

5. **Resolver Alertas** (08:40 AM)
   - Revisar alertas rojas
   - Corregir direcciones inválidas
   - Agregar vehículos si es necesario
   - Re-optimizar si se hicieron cambios

6. **Exportar y Comunicar** (08:45 AM)
   - Click en "WhatsApp"
   - Pegar en grupos de conductores
   - Generar PDF para archivo
   - Descargar reporte para impresión

7. **Día Siguiente - Ejecución** (05:00 AM)
   - Conductores siguen orden de recogida
   - Actualizar estado de vehículos a "En Ruta"
   - Marcar incidencias como alertas

8. **Al Final del Día** (opcional)
   - Si se necesita resetear: Click en "Resetear Día Completo"
   - Confirmación doble para evitar errores

---

## Características Avanzadas

### 1. Sistema de Cache Inteligente

**Geocoding Cache:**
- Válido por 30 días
- Evita llamadas repetidas para direcciones conocidas
- Ahorro estimado: 90% de llamadas a Google Geocoding API

**Distance Matrix Cache:**
- Válido por 7 días
- Almacena distancias entre pares de direcciones
- Ahorro estimado: 80% de llamadas a Google Distance Matrix API

### 2. Detección Automática de Zonas

El sistema divide Bogotá en zonas basándose en coordenadas:
- **NORTE**: Latitud > 4.66
- **SUR**: Latitud < 4.56
- **OCCIDENTE**: Longitud < -74.13
- **ORIENTE**: Longitud > -74.03
- **CENTRO**: Resto

### 3. Algoritmo de Optimización

**Para Turno AM (Recogida):**
```
1. Agrupar por zona
2. Dentro de cada zona:
   - Calcular distancia de cada dirección a RTVC
   - Ordenar de MÁS LEJANO a MÁS CERCANO
   - Asignar orden de recogida (1, 2, 3, 4...)
3. Crear vehículo por cada 4 pasajeros
4. Calcular duración total de ruta
```

**Para Turno PM (Entrega):**
```
1. Agrupar por zona
2. Dentro de cada zona:
   - Calcular distancia de RTVC a cada dirección
   - Ordenar de MÁS CERCANO a MÁS LEJANO
   - Asignar orden de entrega (1, 2, 3, 4...)
3. Crear vehículo por cada 4 pasajeros
4. Calcular duración total de ruta
```

### 4. Sistema de Alertas Automáticas

| Tipo de Alerta | Severidad | Condición |
|----------------|-----------|-----------|
| INVALID_ADDRESS | CRITICAL | Dirección no se pudo geocodificar |
| INSUFFICIENT_VEHICLES | CRITICAL | Vehículos disponibles < vehículos necesarios |
| ROUTE_TOO_LONG | WARNING | Duración estimada > 60 minutos |
| REST_VIOLATION | WARNING | Personal asignado en periodo de descanso |
| OVERCAPACITY | WARNING | Más de 4 pasajeros en un vehículo |

---

## Configuración y Parámetros

### Configuración en Base de Datos

```sql
SELECT * FROM routes_configuration ORDER BY config_key;
```

| Clave | Valor Por Defecto | Descripción |
|-------|-------------------|-------------|
| MAX_PASSENGERS_PER_VEHICLE | 4 | Máximo pasajeros por vehículo |
| MAX_ROUTE_DURATION_MINUTES | 60 | Duración máxima de ruta |
| GOOGLE_API_KEY | (vacío) | API Key de Google Maps |
| AM_SHIFT_START | 05:00 | Hora inicio turno AM |
| PM_SHIFT_END | 22:00 | Hora fin turno PM |
| RTVC_ADDRESS | Cra 45 # 26-33, Bogotá | Dirección de RTVC |
| AUTO_RESET_ENABLED | true | Reset automático diario |

### Actualizar Configuración

**Desde SQL:**
```sql
UPDATE routes_configuration
SET config_value = 'NUEVO_VALOR'
WHERE config_key = 'CLAVE';
```

**Desde API:**
```bash
curl -X PUT http://localhost:3000/api/routes/config/MAX_PASSENGERS_PER_VEHICLE \
  -H "Content-Type: application/json" \
  -d '{"value": "5"}'
```

---

## Seguridad y Separación de Datos

### Independencia Total de Programación Técnica

El módulo de rutas es **completamente independiente** de la programación técnica:

1. **Tablas separadas**: No modifica ninguna tabla de programación existente
2. **Importación unidireccional**: Solo LECTURA de `personnel` y `shift_assignments`
3. **Sin impacto**: Cambios en rutas NO afectan programación técnica
4. **Reversible**: Se puede resetear cualquier día sin afectar otros días

### Protección de Datos

- Backups automáticos antes de operaciones críticas
- Transacciones ACID para operaciones múltiples
- Triggers para actualización automática de timestamps
- Índices para rendimiento óptimo

---

## Costos de Google Maps API

### Estimación de Costos Mensuales

**Asumiendo:**
- 50 empleados/día con transporte
- 2 turnos/día (AM y PM)
- 22 días laborables/mes

**Sin cache:**
- Geocoding: 50 empleados × 2 turnos × 22 días = 2,200 llamadas/mes
- Distance Matrix: 50 × 2 × 22 = 2,200 llamadas/mes
- **Total llamadas:** 4,400/mes
- **Costo estimado:** $22 USD/mes

**Con cache (90% ahorro):**
- Geocoding: 220 llamadas/mes (nuevas direcciones)
- Distance Matrix: 440 llamadas/mes
- **Total llamadas:** 660/mes
- **Costo estimado:** $3.30 USD/mes

**Recomendación:** El cache reduce costos en 85%, justificando ampliamente su uso.

---

## Mantenimiento y Monitoreo

### Queries Útiles de Monitoreo

**1. Ver asignaciones del día:**
```sql
SELECT
  personnel_name,
  transport_mode,
  direccion,
  route_id,
  pickup_order
FROM daily_transport_assignments
WHERE date = '2026-01-11' AND shift_type = 'AM'
ORDER BY route_id, pickup_order;
```

**2. Ver rutas optimizadas:**
```sql
SELECT * FROM v_daily_routes
WHERE date = '2026-01-11' AND shift_type = 'AM'
ORDER BY route_number;
```

**3. Ver alertas activas:**
```sql
SELECT
  alert_type,
  severity,
  message,
  created_at
FROM route_alerts
WHERE NOT resolved
ORDER BY severity DESC, created_at DESC;
```

**4. Estadísticas de cache:**
```sql
-- Efectividad de geocoding cache
SELECT
  COUNT(*) as total_addresses,
  SUM(CASE WHEN is_valid THEN 1 ELSE 0 END) as valid_addresses,
  ROUND(AVG(CASE WHEN is_valid THEN 100 ELSE 0 END), 2) as success_rate
FROM address_geocoding_cache;

-- Distancias más consultadas
SELECT
  origin_address,
  destination_address,
  COUNT(*) as usage_count
FROM distance_matrix_cache
GROUP BY origin_address, destination_address
ORDER BY usage_count DESC
LIMIT 10;
```

**5. Vehículos disponibles:**
```sql
SELECT
  vehicle_code,
  status,
  driver_name
FROM fleet_vehicles
WHERE is_active = true
ORDER BY status, vehicle_code;
```

### Limpieza de Cache (Mantenimiento)

**Eliminar cache antiguo de geocoding (>30 días):**
```sql
DELETE FROM address_geocoding_cache
WHERE last_verified < NOW() - INTERVAL '30 days';
```

**Eliminar cache antiguo de distancias (>7 días):**
```sql
DELETE FROM distance_matrix_cache
WHERE last_updated < NOW() - INTERVAL '7 days';
```

**Marcar alertas viejas como resueltas:**
```sql
UPDATE route_alerts
SET resolved = true, resolved_at = NOW()
WHERE date < CURRENT_DATE - INTERVAL '7 days'
AND NOT resolved;
```

---

## Troubleshooting

### Problema: "No se pueden geocodificar direcciones"

**Causa:** API Key de Google no configurada o inválida

**Solución:**
```sql
UPDATE routes_configuration
SET config_value = 'TU_API_KEY_VALIDA'
WHERE config_key = 'GOOGLE_API_KEY';
```

Reiniciar backend para cargar nueva configuración.

### Problema: "Error al optimizar rutas"

**Causa 1:** Personal sin direcciones

**Solución:**
1. Ir a "Asignaciones"
2. Identificar personal con "Sin dirección" en rojo
3. Actualizar direcciones en "Personal" o "Personal Logístico"
4. Re-ejecutar optimización

**Causa 2:** Vehículos insuficientes

**Solución:**
1. Tab "Flota"
2. Agregar más vehículos
3. Marcar vehículos como "AVAILABLE"

### Problema: "Rutas muy largas (>60 min)"

**Causa:** Pasajeros muy dispersos geográficamente

**Soluciones:**
- Aumentar MAX_ROUTE_DURATION_MINUTES en configuración
- Agregar más vehículos para reducir pasajeros/vehículo
- Cambiar algunos pasajeros a "Transporte Propio"

### Problema: "No aparece personal al cargar"

**Causa:** Personal no está en programación técnica para ese día/turno

**Solución:**
1. Verificar programación en vista "Programación"
2. Asegurar que hay personal asignado al turno correcto (5:00 o 22:00)
3. Si es personal logístico, agregar manualmente como "Express"

---

## Próximas Mejoras (Roadmap)

### Fase 2 (Próximos 30 días)
- [ ] Generación real de PDF con jsPDF o similar
- [ ] Integración con WhatsApp Business API para envío automático
- [ ] Notificaciones push a conductores
- [ ] Tracking GPS en tiempo real

### Fase 3 (Próximos 60 días)
- [ ] Historial de rutas ejecutadas
- [ ] Reportes de puntualidad
- [ ] Optimización con Machine Learning (predecir tiempos reales)
- [ ] App móvil para conductores

### Fase 4 (Próximos 90 días)
- [ ] Integración con Waze/Google Maps para rutas en vivo
- [ ] Cálculo de costos de combustible
- [ ] Reportes de eficiencia de rutas
- [ ] Dashboard analítico con gráficas

---

## Contacto y Soporte

**Desarrollado por:** Claude (Anthropic)
**Fecha:** 2026-01-10
**Versión:** 1.0.0

Para soporte técnico, consultar:
- Documentación de Google Maps API: https://developers.google.com/maps/documentation
- PostgreSQL Docs: https://www.postgresql.org/docs/
- React Docs: https://react.dev

---

## Changelog

### v1.0.0 (2026-01-10)
- Implementación inicial completa
- 7 tablas de base de datos
- 3 servicios backend
- 20 endpoints API
- UI completa con 3 tabs
- Sistema de cache inteligente
- Algoritmo de optimización por zonas
- Alertas automáticas
- Exportación WhatsApp y PDF
- Integración con programación técnica
- Reset diario
