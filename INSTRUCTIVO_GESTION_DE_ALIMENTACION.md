# 📋 INSTRUCTIVO: Gestión de Alimentación

## 📌 ¿Qué es y para qué sirve?

El módulo de **Gestión de Alimentación** te permite administrar y controlar los servicios de comida del personal del canal:
- **Desayunos** (Personal de madrugada)
- **Almuerzos** (Personal del mediodía)
- **Cenas** (Personal de tarde/noche)

## 🎯 Objetivo Principal

Resolver la gestión diaria de servicios alimenticios donde:
- Se necesita saber cuántas porciones pedir al proveedor cada día
- El personal programado puede variar según horarios y turnos
- Se requiere control de confirmaciones para evitar desperdicios
- Se necesita generar PDFs y enviar órdenes vía WhatsApp
- Permitir agregar invitados o personal externo de forma flexible

---

## 🚀 Cómo Acceder

1. Inicia sesión en el sistema
2. En el menú lateral izquierdo, busca el ícono de cubiertos 🍴
3. Haz clic en **"Gestión de Alimentación"**

---

## 📊 Vista Principal

Al entrar verás **3 secciones principales**:

### 1️⃣ Selector de Servicio

Tres botones grandes para seleccionar el tipo de servicio:
- ☕ **DESAYUNO** (06:00) - Fondo ámbar
- 🍽️ **ALMUERZO** (12:00) - Fondo verde
- 🌙 **CENA** (18:00) - Fondo índigo

Haz clic en cualquiera para cambiar el servicio activo.

### 2️⃣ Estadísticas en Tiempo Real

Tres tarjetas con información del servicio seleccionado para la fecha actual:

- **Total Solicitudes** (Azul): Cuántas personas en total
- **Confirmados** (Verde): Cuántas porciones confirmadas
- **Por Confirmar** (Ámbar): Cuántas porciones pendientes de confirmar

### 3️⃣ Tabla de Solicitudes

Lista detallada con:
- **#**: Número correlativo automático
- **Nombre**: Nombre completo de la persona
- **Cargo**: Posición o área (Graficación, Editores, etc.)
- **Estado**: Badge clickeable (Por Confirmar / Confirmado)
- **Tipo**: Personal o Invitado
- **Acciones**: Botón X para eliminar

---

## 🔧 Funcionalidades Principales

### ➕ Agregar Persona Manualmente

**Cuándo usarlo:** Para agregar invitados, personal externo o casos especiales.

**Pasos:**

1. Haz clic en **"+ Agregar Persona"** (botón azul superior izquierdo)
2. En el modal, completa:
   - **Nombre Completo** (requerido): Ej: "María González"
   - **Cargo/Posición** (requerido): Selecciona del dropdown
     - Opciones: Graficación, Editores, Capilla, Ingesta, Almacén, Emisión, Digital, Producción, Técnicos, Realizadores, Camarógrafos, Periodistas, Administrativo, Otros
   - **Checkbox "Persona externa/invitado"**: Marca si es alguien que no pertenece a la planta
3. Haz clic en **"Agregar"**

**Resultado:** La persona aparece en la tabla con estado "Por Confirmar"

---

### 📥 Cargar desde Programación

**Cuándo usarlo:** Al inicio del día para importar automáticamente el personal programado.

**Cómo funciona:**

El sistema busca en la programación del día todas las personas que tienen turno cerca del horario del servicio (±2 horas). Por ejemplo:
- **DESAYUNO (06:00)**: Trae personal programado entre 04:00 - 08:00
- **ALMUERZO (12:00)**: Trae personal programado entre 10:00 - 14:00
- **CENA (18:00)**: Trae personal programado entre 16:00 - 20:00

**Pasos:**

1. Selecciona el servicio deseado (Desayuno, Almuerzo o Cena)
2. Verifica que la fecha sea correcta
3. Haz clic en **"Cargar desde Programación"** (botón verde)
4. Confirma la acción en el diálogo
5. El sistema muestra: "Se cargaron X personas desde la programación"

**Importante:**
- No duplica personas ya agregadas (maneja conflictos)
- Solo trae personal activo
- El cargo se toma del área del personal en la base de datos

---

### ✅ Confirmar/Desconfirmar Solicitudes

**Cuándo usarlo:** Para marcar qué personas efectivamente recibirán el servicio.

**Pasos:**

1. Localiza la persona en la tabla
2. Haz clic en el badge de **"Por Confirmar"** (ámbar)
3. El estado cambia automáticamente a **"Confirmado"** (verde con ✓)
4. Puedes volver a hacer clic para desconfirmar

**Resultado:** Las estadísticas se actualizan en tiempo real.

---

### 🗑️ Eliminar Solicitud

**Cuándo usarlo:** Cuando una persona cancela o no va a asistir ese día.

**Pasos:**

1. Localiza la persona en la tabla
2. Haz clic en el botón **X** rojo en la columna "Acciones"
3. Confirma la eliminación
4. La fila desaparece y las estadísticas se actualizan

---

### 📄 Generar PDF

**Cuándo usarlo:** Para imprimir o enviar al proveedor la lista de porciones.

**Formato del PDF:**
- Título con servicio y fecha
- Tabla con # | Nombre | Cargo | Tipo
- TOTAL de porciones al final
- Fecha y hora de generación

**Pasos:**

1. Asegúrate de tener solicitudes en la lista
2. Haz clic en **"PDF"** (botón índigo)
3. El PDF se genera y descarga automáticamente
4. Nombre del archivo: `ALMUERZO_20260112.pdf` (ejemplo)

**Resultado:** El PDF se descarga en formato idéntico al Excel de referencia.

---

### 💬 Generar Mensaje WhatsApp

**Cuándo usarlo:** Para enviar rápidamente la orden al proveedor.

**Pasos:**

1. Haz clic en **"WhatsApp"** (botón verde)
2. El sistema consulta cuántas porciones **confirmadas** hay
3. Se genera y copia automáticamente un mensaje como:

```
Hola! 👋

Para el *almuerzo* del día *sábado, 11 de enero de 2026* necesitamos:

🍽️ *25 porciones*

Gracias!
```

4. Pega el mensaje (Ctrl+V) en WhatsApp y envía

**Importante:** Solo cuenta solicitudes con estado "CONFIRMADO", no las pendientes.

---

### 🔄 Reset (Limpiar Todo)

**Cuándo usarlo:** Al finalizar el día o cuando necesites empezar de cero.

**¡ADVERTENCIA!** Esta acción es irreversible y borra TODAS las solicitudes del servicio en esa fecha.

**Pasos:**

1. Haz clic en **"Reset"** (botón rojo)
2. Lee cuidadosamente el diálogo de confirmación:
   ```
   ¿RESET COMPLETO?

   Esto eliminará TODAS las 15 solicitudes de ALMUERZO para 2026-01-12.

   ¿Está absolutamente seguro?
   ```
3. Haz clic en **"Aceptar"** solo si estás seguro
4. El sistema muestra: "Reset completado: X solicitudes eliminadas"
5. La tabla queda vacía

**Recomendación:** Usa Reset al inicio del día siguiente para limpiar datos del día anterior.

---

## 🔄 Flujo de Trabajo Completo (Día Típico)

### 📅 Mañana (06:00 AM)

**Servicio: DESAYUNO**

1. Entra a **Gestión de Alimentación**
2. Selecciona **DESAYUNO**
3. Verifica la fecha de hoy
4. Haz clic en **"Cargar desde Programación"**
5. Revisa la lista automática
6. Agrega manualmente invitados si hay
7. Confirma cada solicitud haciendo clic en "Por Confirmar"
8. Genera el **PDF** para tener registro
9. Genera el **mensaje WhatsApp** y envía al proveedor
10. Espera confirmación del proveedor

**Resultado:** El proveedor sabe cuántos desayunos preparar.

---

### 🌞 Mediodía (11:30 AM)

**Servicio: ALMUERZO**

1. Selecciona **ALMUERZO**
2. Haz clic en **"Cargar desde Programación"**
3. El sistema trae personal con turnos 10:00-14:00
4. Agrega invitados o personal extra si es necesario
5. Confirma las solicitudes
6. Genera PDF
7. Envía WhatsApp al proveedor con el total confirmado

---

### 🌙 Tarde (05:00 PM)

**Servicio: CENA**

1. Selecciona **CENA**
2. Carga desde programación (turnos 16:00-20:00)
3. Agrega/elimina según sea necesario
4. Confirma
5. PDF + WhatsApp al proveedor

---

### 🌃 Fin del Día (10:00 PM)

**Limpieza:**

1. **OPCIONAL:** Antes de irte, puedes hacer **Reset** en los 3 servicios para el día actual
2. Esto deja el sistema limpio para el día siguiente
3. O bien, déjalos como están para tener historial

---

## 💡 Características Especiales

### ✨ Numeración Automática

La columna **#** se calcula automáticamente:
- Siempre empieza en 1
- Se ajusta si eliminas filas
- Útil para verificar el total rápidamente

### 🎨 Badges de Estado Clickeables

Los badges de estado no son solo visuales:
- **Hacer clic** en ellos cambia el estado
- No necesitas modal ni formulario
- Cambio instantáneo con un clic

### 🔍 Tipos de Personal

- **Personal** (azul): Empleados de planta del canal
- **Invitado** (morado): Externos, visitas, contratistas temporales

### 📊 Total Dinámico

En el footer de la tabla se muestra:
```
TOTAL: 25 porciones
```
O si es solo 1:
```
TOTAL: 1 porción
```

---

## 📝 Lista de Cargos Disponibles

El dropdown de cargos tiene estas opciones fijas:

1. **Graficación** - Personal de gráficos y diseño
2. **Editores** - Editores de video/audio
3. **Capilla** - Personal de capilla de redacción
4. **Ingesta** - Operadores de ingesta
5. **Almacén** - Personal de almacén
6. **Emisión** - Operadores de emisión
7. **Digital** - Equipo digital/web
8. **Producción** - Productores y asistentes
9. **Técnicos** - Técnicos generales
10. **Realizadores** - Realizadores
11. **Camarógrafos** - Camarógrafos
12. **Periodistas** - Periodistas
13. **Administrativo** - Personal administrativo
14. **Otros** - Categoría general

---

## 🎓 Preguntas Frecuentes

### ❓ ¿Puedo cargar desde programación varias veces el mismo día?

**Sí**, pero el sistema evita duplicados. Si una persona ya está en la lista, no la vuelve a agregar.

---

### ❓ ¿Qué pasa si agrego a alguien manualmente y luego cargo desde programación?

El sistema **NO lo duplica**. La restricción UNIQUE en la base de datos previene registros dobles.

---

### ❓ ¿El PDF incluye personas "Por Confirmar"?

**Sí**, el PDF incluye TODAS las solicitudes, sin importar el estado. Esto te permite tener un registro completo.

---

### ❓ ¿El WhatsApp solo cuenta confirmados?

**Sí**, el mensaje de WhatsApp **solo cuenta solicitudes con estado "CONFIRMADO"**. Las que están "Por Confirmar" no se incluyen en el total.

---

### ❓ ¿Puedo ver solicitudes de días anteriores?

**Sí**, usa el selector de fecha en la parte superior derecha. Cambia la fecha y verás las solicitudes de ese día.

---

### ❓ ¿Se puede recuperar un registro eliminado?

**No**, cuando haces clic en **X** para eliminar, el registro se borra permanentemente de la base de datos. No es soft delete.

---

### ❓ ¿Se puede recuperar después de un Reset?

**No**, el Reset es irreversible. Por eso el sistema te pide doble confirmación antes de ejecutarlo.

---

### ❓ ¿Qué diferencia hay entre "Por Confirmar" y "Confirmado"?

- **Por Confirmar** (ámbar): La persona está en la lista pero aún no se ha verificado que vaya a asistir
- **Confirmado** (verde ✓): Se verificó que la persona SÍ va a recibir el servicio

Solo los **Confirmados** se cuentan para el WhatsApp al proveedor.

---

### ❓ ¿Puedo editar el nombre o cargo después de agregar?

**No directamente** en esta versión. Si necesitas cambiar datos:
1. Elimina la solicitud con **X**
2. Agrégala de nuevo con los datos correctos

---

### ❓ ¿El sistema guarda historial?

**Sí**, los datos quedan en la base de datos. Puedes consultar cualquier fecha anterior usando el selector de fecha.

---

## 🔗 Integración con Otros Módulos

### 📅 Gestión de Programación

El botón **"Cargar desde Programación"** se conecta con la tabla `schedules`:
- Lee horarios programados (`schedule_time`)
- Busca en un rango de ±2 horas del servicio
- Trae solo personal activo (`is_active = true`)

### 👥 Personal

Los cargos se sincronizan con el área del personal en la tabla `personnel`:
- Al cargar desde programación, el cargo viene del campo `area`
- Puedes agregar manualmente con cualquier cargo de la lista fija

---

## 📞 Soporte

Si tienes problemas o dudas:

1. Verifica que backend esté corriendo en `http://localhost:3000`
2. Verifica que frontend esté corriendo en `http://localhost:5173`
3. Revisa la consola del navegador (F12) para ver errores
4. Revisa logs del backend en la terminal

---

## 🎯 Resumen Rápido

| Tarea | Cómo Hacerlo |
|-------|--------------|
| Agregar persona manualmente | + Agregar Persona |
| Importar personal del día | Cargar desde Programación |
| Confirmar solicitud | Click en badge "Por Confirmar" |
| Eliminar solicitud | Click en X |
| Generar PDF para imprimir | Botón PDF |
| Enviar orden al proveedor | Botón WhatsApp → pegar mensaje |
| Limpiar todo el servicio | Botón Reset |
| Ver otro día | Cambiar fecha con selector |
| Cambiar de servicio | Click en Desayuno/Almuerzo/Cena |

---

## ✅ Checklist de Uso Diario

### Mañana:
- [ ] Seleccionar DESAYUNO
- [ ] Cargar desde programación
- [ ] Agregar invitados si hay
- [ ] Confirmar todas las solicitudes
- [ ] Generar PDF
- [ ] Enviar WhatsApp al proveedor

### Mediodía:
- [ ] Seleccionar ALMUERZO
- [ ] Cargar desde programación
- [ ] Confirmar solicitudes
- [ ] Enviar WhatsApp

### Tarde:
- [ ] Seleccionar CENA
- [ ] Cargar desde programación
- [ ] Confirmar solicitudes
- [ ] Enviar WhatsApp

### Fin del día:
- [ ] (Opcional) Reset de los 3 servicios

---

## 🚀 Ejemplo Completo

**Escenario:** Es lunes 12 de enero de 2026, 11:30 AM. Necesitas gestionar el almuerzo.

1. Entras a **Gestión de Alimentación**
2. Seleccionas **ALMUERZO** (botón verde)
3. La fecha ya está en "2026-01-12" (hoy)
4. Haces clic en **"Cargar desde Programación"**
5. El sistema importa 18 personas con turnos 10:00-14:00
6. Ves que falta un invitado externo
7. Haces clic en **"+ Agregar Persona"**
8. Llenas:
   - Nombre: "Dr. Carlos Méndez"
   - Cargo: Otros
   - ✓ Persona externa/invitado
9. Haces clic en **"Agregar"**
10. Ahora tienes 19 solicitudes, todas "Por Confirmar"
11. Vas confirmando una por una haciendo clic en cada badge
12. Todas quedan en verde con ✓
13. Las estadísticas muestran: **19 Confirmados**
14. Haces clic en **"PDF"**
15. Se descarga `ALMUERZO_20260112.pdf`
16. Haces clic en **"WhatsApp"**
17. Se copia al portapapeles:
    ```
    Hola! 👋

    Para el *almuerzo* del día *lunes, 12 de enero de 2026* necesitamos:

    🍽️ *19 porciones*

    Gracias!
    ```
18. Abres WhatsApp y pegas el mensaje (Ctrl+V)
19. Envías al proveedor
20. ✅ Listo!

---

**¡Listo! Ahora ya sabes cómo usar el módulo de Gestión de Alimentación** 🚀
