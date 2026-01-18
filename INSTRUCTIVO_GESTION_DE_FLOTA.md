# 📋 INSTRUCTIVO: Gestión de Flota en Base y Reportería

## 📌 ¿Qué es y para qué sirve?

El módulo de **Gestión de Flota** te permite administrar los vehículos del canal que se usan para:
- **Rutas de la mañana (AM)**: Transportar personal de estudio
- **Reportería/Convergencia**: Despachar periodistas y camarógrafos durante el día

## 🎯 Objetivo Principal

Resolver el problema de **gestión diaria de vehículos** donde:
- Los conductores y placas pueden cambiar día a día
- Los vehículos que terminan rutas AM quedan disponibles para reportería
- Se necesita despachar periodistas a destinos variables de última hora
- Se requiere un dashboard para saber cuántos vehículos están despachados, dónde van y cuántos quedan en el canal

---

## 🚀 Cómo Acceder

1. Inicia sesión en el sistema
2. En el menú lateral izquierdo, busca el ícono de autobús 🚌
3. Haz clic en **"Gestión de Flota"**

---

## 📊 Dashboard Principal

Al entrar verás **4 tarjetas** con estadísticas en tiempo real:

### 🚗 Total Vehículos
Muestra cuántos vehículos activos tienes en la flota.

### ✅ En Canal
Vehículos disponibles en el canal (terminaron rutas AM y están listos para reportería).

### ⚡ En Ruta
Vehículos que están actualmente realizando rutas de transporte AM.

### 📍 Despachados
Vehículos que fueron despachados para reportería/prensa durante el día.

---

## 📑 Las 3 Pestañas del Módulo

---

## 1️⃣ PESTAÑA: Vehículos de Flota

### ¿Para qué sirve?
Aquí administras tu **catálogo de vehículos**: agregar nuevos, editar información o eliminar los que ya no usas.

### ¿Qué puedes hacer?

#### ➕ Agregar un Vehículo Nuevo
1. Haz clic en el botón **"+ Agregar Vehículo"** (esquina superior derecha)
2. Llena el formulario:
   - **Código del Vehículo*** (requerido): Ej: V-001, CAM-001, AUTO-001
   - **Tipo de Vehículo*** (requerido): Van, Camioneta, Automóvil, Bus, Microbus
   - **Capacidad*** (requerido): Número de pasajeros (1-50)
   - **Placa**: Ej: ABC123 (se convierte automáticamente a mayúsculas)
   - **Nombre del Conductor**: Nombre completo
   - **Teléfono del Conductor**: Ej: 3001234567
3. Haz clic en **"Crear Vehículo"**

#### ✏️ Editar un Vehículo
1. Busca la tarjeta del vehículo que quieres editar
2. Haz clic en el botón **"Editar"** (azul)
3. Modifica los campos que necesites:
   - **Puedes cambiar conductor, placa y teléfono diariamente** sin afectar el registro base
   - También puedes cambiar el estado: Disponible, En Ruta, Mantenimiento, Reportería
4. Haz clic en **"Guardar Cambios"**

#### 🗑️ Eliminar un Vehículo
1. Busca la tarjeta del vehículo que quieres eliminar
2. Haz clic en el botón **"Eliminar"** (rojo)
3. Confirma la acción
4. El vehículo se marca como inactivo (no se borra, se puede recuperar desde base de datos)

### 📋 Información que se muestra por vehículo:
- Código (Ej: V-001)
- Tipo (Van, Camioneta, etc.)
- Placa
- Capacidad de pasajeros
- Nombre del conductor
- Teléfono del conductor
- Estado con color:
  - 🟢 AVAILABLE (Disponible)
  - 🔵 IN_ROUTE (En Ruta)
  - 🔴 MAINTENANCE (Mantenimiento)
  - 🟣 REPORTING (Reportería)

---

## 2️⃣ PESTAÑA: Disponibilidad en Base

### ¿Para qué sirve?
Aquí marcas qué vehículos **terminaron sus rutas de la mañana** y quedaron disponibles en el canal para ser despachados en reportería.

### ¿Cuándo usarlo?
**Cada mañana**, después de que los vehículos completen sus rutas AM (aproximadamente 10:00-11:00 AM).

### ¿Cómo funciona?

#### ✅ Marcar Vehículos como Disponibles
1. Selecciona la **fecha** (por defecto es hoy)
2. Verás una lista de vehículos con **checkboxes**
3. **Selecciona los vehículos** que terminaron rutas AM y están en el canal
4. Los vehículos ya marcados como disponibles NO aparecen en la lista (para evitar duplicados)
5. Haz clic en **"Marcar como Disponibles (X)"** donde X es el número seleccionado
6. Los vehículos se registran con hora "10:00" por defecto (puedes cambiar esto en código)

#### 📋 Ver Vehículos Disponibles Hoy
Abajo verás tarjetas verdes con los vehículos que están disponibles:
- Código del vehículo
- Tipo
- Estado (DISPONIBLE)
- Hora desde que está disponible
- Conductor
- Teléfono

### 💡 Caso de Uso Real
**Ejemplo**: Tienes 5 vans que hicieron rutas de casa→canal en la mañana. A las 10:30 AM todas llegan al canal. Entras a esta pestaña, las seleccionas todas y las marcas como disponibles. Ahora están listas para ser despachadas en la pestaña de "Despachos de Prensa".

---

## 3️⃣ PESTAÑA: Despachos de Prensa

### ¿Para qué sirve?
Aquí creas y administras los **despachos de reportería**: asignar vehículos a periodistas con camarógrafos para coberturas durante el día.

### ¿Cuándo usarlo?
Durante todo el día cuando:
- Un periodista necesita ir a cubrir una noticia
- Hay un evento de última hora
- Necesitas enviar un equipo de prensa a un lugar específico

### ¿Cómo funciona?

#### ➕ Crear un Nuevo Despacho
1. Selecciona la **fecha** (por defecto es hoy)
2. Haz clic en **"+ Nuevo Despacho"** (esquina superior derecha)
3. Llena el formulario del modal:

   **Campos Requeridos (marcados con *):**
   - **Vehículo***: Selecciona de la lista (Ej: V-001 - Van (12 pax))
     - Al seleccionar, se autocompletarán conductor y placa
   - **Periodista***: Selecciona de la lista de 9 periodistas disponibles
   - **Destino***: Escribe la dirección completa (textarea)
   - **Hora de Salida***: Selecciona hora (formato 24h)

   **Campos Opcionales:**
   - **Camarógrafo**: Selecciona de la lista de 18 camarógrafos o deja "Sin camarógrafo"
   - **Conductor**: Se autocompleta, pero puedes modificarlo (por si cambió el conductor hoy)
   - **Placa del Vehículo**: Se autocompleta, pero puedes modificarlo (por si cambió la placa)
   - **Hora Estimada de Regreso**: Cuando esperas que vuelva
   - **Estado**: Programado, En Ruta, Finalizado, Cancelado
   - **Notas Adicionales**: Información extra, contactos, instrucciones

4. Haz clic en **"Crear Despacho"**

#### ✏️ Editar un Despacho
1. En la tabla, busca el despacho
2. Haz clic en **"Editar"** (link azul)
3. Modifica los campos necesarios
4. Haz clic en **"Guardar Cambios"**

**Casos comunes de edición:**
- Cambiar el estado a "EN_RUTA" cuando salen
- Cambiar el estado a "FINALIZADO" cuando regresan
- Actualizar hora real de regreso
- Cambiar destino si hay cambio de planes

#### 🗑️ Eliminar un Despacho
1. En la tabla, busca el despacho
2. Haz clic en **"Eliminar"** (link rojo)
3. Confirma la acción

#### 📊 Tabla de Despachos
La tabla muestra todos los despachos del día con estas columnas:
- **Vehículo**: Código (Ej: V-001)
- **Periodista**: Nombre completo
- **Camarógrafo**: Nombre completo o "-" si no hay
- **Conductor**: Nombre del conductor
- **Placa**: Placa del vehículo
- **Destino**: Dirección completa
- **Hora Salida**: Hora programada de salida
- **Estado**: Badge con color según estado
  - 🟡 PROGRAMADO
  - 🔵 EN_RUTA
  - 🟢 FINALIZADO
  - ⚫ CANCELADO
- **Acciones**: Botones Editar / Eliminar

---

## 🔄 Flujo de Trabajo Completo (Día Típico)

### 📅 Mañana (5:00 AM - 10:00 AM)
1. Los vehículos realizan rutas AM (casa → canal) para transportar personal de estudio
2. Estos vehículos tienen estado **"IN_ROUTE"**

### ☕ Media Mañana (10:00 AM - 11:00 AM)
1. Los vehículos llegan al canal
2. Entras a **"Disponibilidad en Base"**
3. Seleccionas los vehículos que quedaron en el canal
4. Los marcas como **"DISPONIBLES"**
5. Ahora están listos para reportería

### 🌞 Durante el Día (11:00 AM - 6:00 PM)
1. Llega una solicitud de cobertura
2. Entras a **"Despachos de Prensa"**
3. Creas un nuevo despacho:
   - Seleccionas vehículo disponible
   - Asignas periodista y camarógrafo
   - Defines destino y hora de salida
4. El despacho queda registrado con estado **"PROGRAMADO"**
5. Cuando el equipo sale, editas el estado a **"EN_RUTA"**
6. Cuando regresan, editas el estado a **"FINALIZADO"**

### 🌙 Fin del Día
1. Revisas en la tabla todos los despachos del día
2. Te aseguras de que todos estén en estado "FINALIZADO"
3. Puedes exportar o consultar el historial

---

## 💡 Características Especiales

### ✨ Autocompletado Inteligente
Cuando seleccionas un vehículo en el formulario de despacho:
- Se autocompleta el **nombre del conductor** del vehículo
- Se autocompleta la **placa** del vehículo
- **Puedes modificar estos campos** (útil si cambió conductor ese día)

### 🔄 Modificación Diaria sin Afectar Datos Base
- Puedes cambiar conductor, placa y teléfono en un despacho específico
- Esto **NO modifica** el vehículo en el catálogo base
- Solo afecta ese despacho en particular

### 📊 Dashboard en Tiempo Real
Las tarjetas de estadísticas se actualizan automáticamente:
- Cada vez que marcas vehículos como disponibles
- Cada vez que creas un despacho
- Reflejan el estado actual de la flota

---

## 🎓 Preguntas Frecuentes

### ❓ ¿Puedo usar un vehículo que no está marcado como disponible?
**Sí**, puedes seleccionar cualquier vehículo del catálogo en "Despachos de Prensa". La pestaña de "Disponibilidad" es para llevar control, pero no bloquea vehículos.

### ❓ ¿Qué pasa si elimino un vehículo que tiene despachos?
Los despachos anteriores se mantienen intactos. El vehículo solo se marca como inactivo (soft delete) y ya no aparecerá en nuevos despachos.

### ❓ ¿Puedo despachar sin camarógrafo?
**Sí**, el campo camarógrafo es opcional. Solo selecciona "Sin camarógrafo" en el dropdown.

### ❓ ¿Puedo ver despachos de días anteriores?
**Sí**, usa el selector de fecha en la pestaña "Despachos de Prensa" para cambiar la fecha y ver despachos de otros días.

### ❓ ¿Cómo sé qué vehículos están realmente disponibles?
Mira la tarjeta **"En Canal"** en el dashboard. También puedes ir a "Disponibilidad en Base" y ver las tarjetas verdes.

### ❓ ¿Puedo modificar el conductor de un vehículo solo para hoy?
**Sí**, tienes dos opciones:
1. **Opción A**: Edita el vehículo en "Vehículos de Flota" (modifica el catálogo base)
2. **Opción B**: Al crear el despacho, modifica el campo "Conductor" después de seleccionar el vehículo (solo para ese despacho)

---

## 🛠️ Datos Pre-cargados

El sistema viene con **10 vehículos de ejemplo**:

### 🚐 Vans (5)
- V-001 → Carlos Rodríguez, ABC-123, 12 pasajeros
- V-002 → Luis Martínez, DEF-456, 12 pasajeros
- V-003 → Pedro Sánchez, GHI-789, 12 pasajeros
- V-004 → Miguel Torres, JKL-012, 12 pasajeros
- V-005 → Andrés López, MNO-345, 12 pasajeros

### 🚙 Camionetas (4)
- CAM-001 → Jorge Ramírez, PQR-678, 5 pasajeros
- CAM-002 → Ricardo Gómez, STU-901, 5 pasajeros
- CAM-003 → Fernando Díaz, VWX-234, 5 pasajeros
- CAM-004 → Alberto Ruiz, YZA-567, 5 pasajeros

### 🚗 Automóvil (1)
- AUTO-001 → Santiago Castro, BCD-890, 4 pasajeros

### 👥 Personal Disponible
- **9 Periodistas** (Andrea Olaya, Carmen Mandinga, Carolay Morales, etc.)
- **18 Camarógrafos de Reportería** (Álvaro Díaz, Andrés Ramírez, Carlos Wilches, etc.)

---

## 🔗 Integración con Otros Módulos

### 🚌 Gestión de Rutas
- Los vehículos marcados como "IN_ROUTE" están haciendo rutas AM de transporte de personal
- Cuando terminan, se marcan como disponibles aquí

### 👥 Personal Logístico
- Los periodistas y camarógrafos vienen de la tabla `personnel` con áreas:
  - `PERIODISTAS`
  - `CAMARÓGRAFOS DE REPORTERÍA`

---

## 📞 Soporte

Si tienes problemas o dudas:
1. Verifica que backend esté corriendo en `http://localhost:3000`
2. Verifica que frontend esté corriendo en `http://localhost:5173`
3. Revisa la consola del navegador (F12) para ver errores
4. Revisa logs del backend en la terminal

---

## 🎯 Resumen Rápido

| Tarea | Dónde Hacerlo |
|-------|---------------|
| Agregar/Editar/Eliminar vehículos | 🚗 Pestaña: Vehículos de Flota |
| Marcar vehículos que terminaron rutas AM | ✅ Pestaña: Disponibilidad en Base |
| Crear despacho de reportería | 📍 Pestaña: Despachos de Prensa |
| Ver cuántos vehículos despachados | 📊 Dashboard (tarjeta "Despachados") |
| Ver cuántos vehículos en canal | 📊 Dashboard (tarjeta "En Canal") |

---

## ✅ Checklist de Uso Diario

- [ ] Marcar vehículos como disponibles después de rutas AM
- [ ] Crear despachos según solicitudes de reportería
- [ ] Actualizar estados de despachos (Programado → En Ruta → Finalizado)
- [ ] Revisar dashboard para saber disponibilidad
- [ ] Verificar que todos los despachos del día estén finalizados

---

**¡Listo! Ahora ya sabes cómo usar el módulo de Gestión de Flota** 🚀
