# 📋 GUÍA DE USO: MÓDULO DE GESTIÓN DE RUTAS Y REPORTERÍA RTVC

## 📌 Índice
1. [Introducción](#introducción)
2. [Flujo de Trabajo Completo](#flujo-de-trabajo-completo)
3. [Funciones Principales](#funciones-principales)
4. [Características Técnicas](#características-técnicas)
5. [Solución de Problemas](#solución-de-problemas)
6. [Casos de Uso](#casos-de-uso)

---

## 🎯 Introducción

El Módulo de Gestión de Rutas y Reportería es un sistema completo que optimiza el transporte de personal técnico de RTVC para los turnos de:
- **Turno AM (05:00)**: "EL CALENTAO" - Requerimiento
- **Turno PM (17:00-22:00)**: "ÚLTIMA EMISIÓN"

### ✨ Características Principales
- ✅ Sincronización automática con sistema de rotación de turnos
- ✅ Optimización inteligente de rutas **SIN API de pago** (zonificación geográfica)
- ✅ Control manual de estado de transporte (Ruta/Propio)
- ✅ Recálculo automático al cambiar estados
- ✅ Exportación a PDF y WhatsApp
- ✅ Sistema de alertas (direcciones no clasificadas, descanso insuficiente)

---

## 🔄 Flujo de Trabajo Completo

### PASO 1: Acceder al Módulo
1. Inicie sesión en el sistema RTVC
2. Navegue a **"Rutas"** en el menú principal
3. Verá la interfaz de Gestión de Rutas y Reportería

---

### PASO 2: Seleccionar Fecha y Turno

**Controles superiores:**
```
┌─────────────────────────────────────────────┐
│  📅 Fecha: [2026-01-13]  🌅 Turno: [AM ▼]  │
└─────────────────────────────────────────────┘
```

1. **Fecha**: Seleccione el día para el cual necesita organizar las rutas
2. **Turno**:
   - **AM (05:00)**: Personal que entra a las 05:00 - 10:00
   - **PM (22:00)**: Personal que entra a las 17:00 - 22:00

> ⚠️ **IMPORTANTE**: El sistema sincroniza automáticamente con el sistema de rotación semanal. NO modifique los turnos manualmente.

---

### PASO 3: Inicializar Logística del Día

**Botón:** `🚐 Cargar Personal`

**¿Qué hace?**
- Escanea la programación técnica del día seleccionado
- Carga automáticamente todo el personal asignado al turno
- Extrae direcciones de la base de datos de personal
- Crea asignaciones de transporte iniciales (todas en modo "RUTA")

**Procedimiento:**
1. Haga clic en **"Cargar Personal"**
2. Confirme la acción en el diálogo
3. Espere el mensaje: _"Inicializadas XX asignaciones para [fecha] - [turno]"_

**Resultado:**
```
✅ 59 asignaciones creadas para 2026-01-13 - AM
```

---

### PASO 4: Revisar y Ajustar Asignaciones

**Tab:** `👥 Asignaciones (XX)`

Verá una tabla con todas las personas cargadas:

```
┌──────────────┬────────────┬─────────────────────┬──────────────┬──────┐
│ Nombre       │ Rol/Área   │ Dirección           │ Modo         │ Ruta │
├──────────────┼────────────┼─────────────────────┼──────────────┼──────┤
│ Juan Pérez   │ Técnico    │ Calle 45 #12-34,    │ 🚐 Ruta      │ -    │
│              │ Producción │ Bosa                │              │      │
└──────────────┴────────────┴─────────────────────┴──────────────┴──────┘
```

### Cambiar Modo de Transporte (RUTA ↔ PROPIO)

**Botón en la columna "Modo Transporte":**
- `🚐 Ruta`: Persona necesita transporte de RTVC
- `🚗 Propio`: Persona llega con su propio transporte

**Procedimiento:**
1. Haga clic en el botón `🚐 Ruta` o `🚗 Propio` de la persona
2. El sistema cambia automáticamente el estado
3. **Aparecerá un mensaje preguntando:**
   ```
   ¿Desea recalcular las rutas automáticamente?

   El modo de transporte cambió, se recomienda
   recalcular las rutas para optimizar.
   ```
4. Elija:
   - **Sí**: Recalcula rutas inmediatamente (recomendado)
   - **No**: Espera para hacer más cambios antes de recalcular

> 💡 **TIP**: Si va a cambiar varios estados, diga "No" hasta el último cambio, luego recalcule manualmente con el botón "Optimizar Rutas".

---

### PASO 5: Optimizar Rutas

**Botón:** `⚡ Optimizar Rutas`

**¿Qué hace el motor de optimización?**

#### 🗺️ Zonificación Geográfica (Sin API de pago)
El sistema clasifica automáticamente cada dirección en 3 zonas:

**ZONA SUR:**
- Keywords: Bosa, Ciudad Bolívar, Soacha, Kennedy, Tunjuelito, Usme, etc.
- Ejemplo: "Carrera 6 #15-30, Soacha" → **SUR**

**ZONA NORTE:**
- Keywords: Usaquén, Suba, Calle 170, Chía, Cajicá, Cedritos, etc.
- Ejemplo: "Calle 170 #54-32, Usaquén" → **NORTE**

**ZONA OCCIDENTE:**
- Keywords: Calle 80, Calle 13, Mosquera, Madrid, Facatativá, Fontibón, etc.
- Ejemplo: "Avenida Calle 80 #45-67" → **OCCIDENTE**

#### 📊 Reglas de Optimización

1. **Agrupación por Zona**: Máximo 4 pasajeros por vehículo (Van/Duster)
2. **Orden de Recogida:**
   - **Turno AM (05:00)**: De **MÁS LEJOS a MÁS CERCA** (finaliza en RTVC)
   - **Turno PM (17:00-22:00)**: De **MÁS CERCA a MÁS LEJOS** (comienza desde RTVC)

3. **Límite de Tiempo**: Máximo 60 minutos por ruta
4. **Priorización de Zonas:**
   - AM: Sur → Norte → Occidente
   - PM: Occidente → Norte → Sur

**Procedimiento:**
1. Haga clic en **"⚡ Optimizar Rutas"**
2. El sistema:
   - Clasifica todas las direcciones por zona
   - Agrupa en vehículos de máximo 4 personas
   - Ordena el recorrido según el turno
   - Calcula distancia y duración estimada
   - Genera alertas si detecta problemas

3. Espere el mensaje: _"✅ Optimización completada: X ruta(s) creada(s)"_

**Resultado:**
```
✅ Optimización completada: 15 ruta(s) creada(s)

📊 RESUMEN DE RUTAS
==================================================
👥 Personal Total: 59
🚐 Personal en Ruta: 48
🚗 Personal Propio: 11
🚐 Vehículos Necesarios: 15

📍 ZONIFICACIÓN:
   SUR: 22 personas (45.8%)
   NORTE: 18 personas (37.5%)
   OCCIDENTE: 8 personas (16.7%)
```

---

### PASO 6: Revisar Rutas Generadas

**Tab:** `🚐 Rutas Optimizadas (XX)`

Verá cada ruta con su información completa:

```
╔═══════════════════════════════════════════════╗
║  🚐 RUTA 1 - SUR                              ║
║  Vehículo: VAN-001 | Conductor: Carlos López  ║
║  📊 4 pasajeros | 15.2 km | ~35 min           ║
╠═══════════════════════════════════════════════╣
║  1️⃣ Juan Pérez                                ║
║     📍 Carrera 6 #15-30, Soacha               ║
║  2️⃣ María García                              ║
║     📍 Calle 45 Sur #23-12, Bosa              ║
║  3️⃣ Pedro Martínez                            ║
║     📍 Diagonal 48 Sur #10-45, Kennedy        ║
║  4️⃣ Ana Rodríguez                             ║
║     📍 Carrera 50 #38-20 Sur                  ║
╚═══════════════════════════════════════════════╝
```

**Orden de números:**
- **Turno AM**: El #1 es el más lejano, el último (#4) el más cercano a RTVC
- **Turno PM**: El #1 es el más cercano a RTVC, el último (#4) el más lejano

---

### PASO 7: Gestionar Alertas

**Panel de Alertas (aparece automáticamente si hay problemas):**

```
⚠️  Alertas Activas (2)
┌────────────────────────────────────────────────┐
│ ⚠️  Dirección no clasificada:                  │
│     "Vereda El Carmen" - Laura Gómez           │
│                                                │
│ ⚠️  Dirección no clasificada:                  │
│     "Sin dirección registrada" - Luis Torres   │
└────────────────────────────────────────────────┘
```

**Tipos de Alertas:**

1. **🔴 Dirección No Clasificada** (Severidad: ALTA)
   - La dirección no coincide con ninguna zona (Sur/Norte/Occidente)
   - **Acción**: Revisar y actualizar la dirección del personal

2. **⚠️ Alerta de Descanso Insuficiente**
   - Personal que trabajó PM (22:00) y debe entrar AM (05:00)
   - Solo 7 horas de descanso
   - **Acción**: Considerar cambiar a transporte propio o verificar disponibilidad

**¿Cómo resolver alertas de direcciones?**

1. Vaya al módulo de **Personal**
2. Busque a la persona alertada
3. Actualice su dirección con información más específica
4. Incluya palabras clave de zona: "Bosa", "Suba", "Calle 80", etc.
5. Regrese a Rutas y haga clic en **"⚡ Optimizar Rutas"** nuevamente

---

### PASO 8: Agregar Pasajero Express (Temporal)

**Caso de Uso**: Personal invitado o técnico temporal que no está en la base de datos.

**Procedimiento:**
1. _(Funcionalidad pendiente de agregar botón en interfaz)_
2. Por ahora use el endpoint API directamente:

```http
POST http://localhost:3000/api/routes/assignments/express
Content-Type: application/json

{
  "date": "2026-01-13",
  "shiftType": "AM",
  "name": "Invitado Carlos Ruiz",
  "direccion": "Calle 80 #45-67, Bogotá",
  "program_title": "Programa Especial"
}
```

3. Luego recalcule rutas con **"⚡ Optimizar Rutas"**

---

### PASO 9: Exportar Formato WhatsApp

**Botón:** `📤 WhatsApp`

**Procedimiento:**
1. Haga clic en **"📤 WhatsApp"**
2. El formato se copia automáticamente al portapapeles
3. Abra WhatsApp
4. Seleccione el chat de conductores o grupo de logística
5. Pegue (Ctrl+V) el mensaje
6. Envíe

**Formato generado:**

```
📋 *RUTAS RTVC*
📅 Lunes 13 de Enero de 2026
⏰ Turno AM (05:00 - 10:00)
══════════════════════════════

🚐 *RUTA 1 - SUR*
🚗 Vehículo: VAN-001
👤 Conductor: Carlos López
📱 3001234567
📊 4 pasajero(s) | 15.2km | ~35min

*Orden de Recogida:*
1. *Juan Pérez*
   📍 Carrera 6 #15-30, Soacha
   🏘️ Soacha Centro

2. *María García*
   📍 Calle 45 Sur #23-12, Bosa
   🏘️ Bosa Central

...

─────────────────────────────

✅ *Total: 15 ruta(s)*

_Generado por Sistema RTVC_
```

---

### PASO 10: Exportar PDF Oficial

**Botón:** `📥 PDF`

**Procedimiento:**
1. Haga clic en **"📥 PDF"**
2. _(Actualmente en desarrollo - ver consola del navegador para datos)_
3. Se descargará un PDF con formato oficial RTVC
4. El PDF incluye:
   - Encabezado oficial RTVC
   - Fecha y turno
   - Resumen ejecutivo
   - Detalle de cada ruta con orden de recogida
   - Firmas de conductores y coordinadores

---

### PASO 11: Finalizar Día / Limpiar Datos

**Botón:** `🔄 Resetear Día Completo` (Zona de Peligro)

⚠️ **ADVERTENCIA**: Esta acción es **IRREVERSIBLE**

**¿Cuándo usar?**
- Al inicio de un nuevo día de operaciones
- Para limpiar datos de prueba
- Si necesita reiniciar completamente la logística del día

**¿Qué elimina?**
- ✖️ Todas las asignaciones de transporte del día
- ✖️ Todas las rutas optimizadas
- ✖️ Alertas relacionadas
- ✅ Libera todos los vehículos (estado → AVAILABLE)

**Procedimiento:**
1. Desplácese hasta la **"Zona de Peligro"** al final de la página
2. Haga clic en **"🔄 Resetear Día Completo"**
3. Confirme la acción en el diálogo de advertencia
4. Espere el mensaje: _"Reset completado para [fecha]"_

> 💡 **TIP**: El sistema de rotación NO se ve afectado. Solo limpia los datos de rutas/transporte.

---

## 🔧 Funciones Principales

### Tab: Asignaciones

**Vista Principal:**
- Listado completo de personal cargado
- Columnas: Nombre, Rol/Área, Dirección, Modo Transporte, Ruta #
- Botones de toggle para cambiar RUTA ↔ PROPIO
- Indicador "Express" para pasajeros temporales

**Acciones:**
- Click en `🚐 Ruta` → Cambia a `🚗 Propio`
- Click en `🚗 Propio` → Cambia a `🚐 Ruta`
- Confirmación de recálculo automático

---

### Tab: Rutas Optimizadas

**Vista de Rutas:**
- Tarjetas expandibles por ruta
- Información de vehículo y conductor
- Estadísticas: pasajeros, distancia, duración
- Orden numérico de recogida
- Direcciones completas

**Indicadores:**
- ✅ Verde: Ruta completada
- 🔵 Azul: Ruta en progreso
- ⚠️ Amarillo: Advertencia (excede tiempo límite)

---

### Tab: Flota

**Gestión de Vehículos:**
- Listado de vehículos disponibles
- Estados:
  - 🟢 **Disponible**: Listo para asignar
  - 🔵 **En Ruta**: Asignado a una ruta activa
  - 🟡 **Mantenimiento**: No disponible
  - 🟣 **Reportería**: En uso administrativo

**Información mostrada:**
- Código de vehículo (VAN-001, DUS-002, etc.)
- Tipo (Van, Duster, etc.)
- Capacidad (4 personas)
- Conductor asignado y teléfono

---

## 🎯 Características Técnicas

### Zonificación Geográfica

**Vector SUR:**
Keywords: `bosa`, `ciudad bolivar`, `soacha`, `kennedy`, `tunjuelito`, `usme`, `rafael uribe`, `sur`, `autopista sur`, `calle 1-8`

**Vector NORTE:**
Keywords: `usaquen`, `suba`, `calle 170`, `calle 127`, `chia`, `cajica`, `autopista norte`, `cedritos`, `toberin`, `calle 15-20`

**Vector OCCIDENTE:**
Keywords: `calle 80`, `calle 13`, `mosquera`, `madrid`, `facatativa`, `funza`, `fontibon`, `engativa`, `av 68`, `boyaca`

### Algoritmo de Optimización

1. **Clasificación**: Cada dirección se normaliza y compara con keywords
2. **Agrupación**: Máximo 4 pasajeros por vehículo
3. **Ordenamiento**:
   - Usa algoritmo de "vecino más cercano" simplificado
   - AM: Punto inicial = zona más lejana → RTVC
   - PM: Punto inicial = RTVC → zona más lejana
4. **Validación**: Verifica límite de 60 min y genera alertas

### Límites y Restricciones

- ✅ Máximo 4 pasajeros por vehículo
- ✅ Máximo 60 minutos por ruta (advertencia si excede)
- ✅ Velocidad promedio asumida: 30 km/h en Bogotá
- ⚠️ Sin soporte para múltiples paradas intermedias (directo)

---

## 🔍 Solución de Problemas

### Problema 1: "No hay programación automatizada para [fecha]"

**Causa**: El sistema de rotación semanal no tiene datos para esa fecha.

**Solución:**
1. Vaya al módulo de **Programación**
2. Genere la programación automática para esa semana
3. Regrese a Rutas e intente nuevamente con **"Cargar Personal"**

---

### Problema 2: Muchas alertas de "Dirección no clasificada"

**Causa**: Direcciones demasiado genéricas o sin palabras clave de zona.

**Solución:**
1. Actualice las direcciones en el módulo de **Personal**
2. Agregue referencias claras:
   - ✅ BIEN: "Carrera 6 #15-30, **Soacha**"
   - ✖️ MAL: "Carrera 6 #15-30"
3. Use nombres de barrio/localidad conocidos
4. Recalcule rutas

---

### Problema 3: Ruta excede 60 minutos

**Causa**: Demasiados pasajeros en zonas muy dispersas.

**Solución Automática**: El sistema ya lo detecta y genera advertencia.

**Solución Manual**:
1. Cambie algunos pasajeros a "Transporte Propio"
2. Recalcule rutas para redistribuir
3. Considere usar más vehículos

---

### Problema 4: No se generan rutas después de optimizar

**Causas posibles:**
1. Todos los pasajeros están en modo "PROPIO"
2. No hay vehículos disponibles en la flota
3. Error en el servidor

**Solución:**
1. Verifique que haya personas en modo "RUTA"
2. Vaya al tab **Flota** y verifique vehículos disponibles
3. Revise la consola del navegador (F12) para errores
4. Verifique que el backend esté corriendo en puerto 3000

---

### Problema 5: Exportación a WhatsApp no funciona

**Causa**: Problema con el portapapeles del navegador.

**Solución:**
1. Otorgue permisos de portapapeles al navegador
2. Use Chrome/Edge (mejor compatibilidad)
3. Si falla, use el endpoint manual:
   ```
   GET http://localhost:3000/api/routes/export/whatsapp/[FECHA]/[TURNO]
   ```
4. Copie el contenido manualmente

---

## 📚 Casos de Uso

### Caso 1: Día Normal de Operaciones

**Escenario**: Lunes 13 de enero, turno AM

**Procedimiento:**
1. Seleccionar fecha: `2026-01-13`
2. Seleccionar turno: `AM`
3. Clic en `Cargar Personal` → 59 personas cargadas
4. Revisar asignaciones, cambiar 8 personas a "Propio"
5. Clic en `Optimizar Rutas` → 13 rutas generadas
6. Revisar alertas (2 direcciones no clasificadas)
7. Actualizar direcciones en módulo Personal
8. Recalcular rutas → 0 alertas
9. Exportar a WhatsApp y enviar a conductores
10. Exportar PDF para archivo

---

### Caso 2: Cambio de Último Minuto

**Escenario**: Una persona avisa que llegará en transporte propio

**Procedimiento:**
1. Buscar a la persona en el tab Asignaciones
2. Clic en `🚐 Ruta` → Cambia a `🚗 Propio`
3. Confirmar recálculo automático → SÍ
4. Esperar nueva optimización
5. Exportar nuevamente a WhatsApp con rutas actualizadas

---

### Caso 3: Invitado Especial

**Escenario**: Llega un técnico invitado para un programa especial

**Procedimiento:**
1. _(Pendiente implementar botón)_ Usar API directamente:
   ```http
   POST /api/routes/assignments/express
   {
     "date": "2026-01-13",
     "shiftType": "AM",
     "name": "Carlos Invitado",
     "direccion": "Calle 80 #100-25",
     "program_title": "Programa Especial"
   }
   ```
2. Refrescar página
3. Clic en `Optimizar Rutas`
4. Verificar que el invitado aparece en una ruta de zona Occidente

---

### Caso 4: Resetear Datos de Prueba

**Escenario**: Terminó pruebas y necesita limpiar datos

**Procedimiento:**
1. Scroll hasta "Zona de Peligro"
2. Clic en `Resetear Día Completo`
3. Confirmar advertencia
4. Todos los datos del día eliminados
5. Sistema listo para nueva carga

---

## ✅ Checklist Diario

### Inicio del Día (Turno AM - 05:00)
- [ ] Seleccionar fecha y turno AM
- [ ] Cargar personal del turno
- [ ] Revisar y ajustar estados RUTA/PROPIO
- [ ] Optimizar rutas
- [ ] Resolver alertas de direcciones
- [ ] Exportar a WhatsApp y enviar a conductores
- [ ] Exportar PDF para archivo

### Tarde (Turno PM - 17:00-22:00)
- [ ] Cambiar a turno PM
- [ ] Cargar personal del turno
- [ ] Revisar novedades y ausencias
- [ ] Ajustar estados según disponibilidad
- [ ] Optimizar rutas
- [ ] Exportar a WhatsApp
- [ ] Exportar PDF

### Fin del Día
- [ ] Verificar que todas las rutas se completaron
- [ ] Archivar PDFs generados
- [ ] _(Opcional)_ Resetear día si necesita limpieza

---

## 🆘 Soporte

### Contacto Técnico
- **Sistema**: RTVC Programación
- **Módulo**: Gestión de Rutas y Reportería
- **Backend**: Puerto 3000
- **Frontend**: Puerto 5173 (Vite)

### Logs y Debugging
- Backend: Ver consola del servidor Node.js
- Frontend: Presionar F12 en navegador → Console
- Base de datos: PostgreSQL en puerto 5432

---

## 📝 Notas Importantes

1. ✅ El sistema **NO modifica** la programación técnica ni los turnos automatizados
2. ✅ Todos los cambios son solo para logística de transporte
3. ✅ Las rutas se recalculan en tiempo real al cambiar estados
4. ⚠️ Resetear día es IRREVERSIBLE - usar con precaución
5. 💡 Las direcciones deben tener palabras clave claras para clasificación correcta
6. 📊 El sistema asume velocidad promedio de 30 km/h en Bogotá
7. 🚐 Máximo 4 pasajeros por vehículo (Van/Duster)

---

## 🔄 Actualizaciones Futuras

### Pendientes de Implementar:
- [ ] Botón UI para agregar pasajero express
- [ ] Generación real de PDF (actualmente en desarrollo)
- [ ] Edición manual de orden de recogida
- [ ] Historial de rutas pasadas
- [ ] Integración con sistema de tracking GPS
- [ ] Notificaciones automáticas a conductores
- [ ] Cambio temporal de dirección (sin modificar base de datos)

---

**Fin de la Guía** | Versión 1.0 | Enero 2026
