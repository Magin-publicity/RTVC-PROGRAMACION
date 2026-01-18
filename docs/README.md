# Documentación del Sistema RTVC

Bienvenido a la documentación completa del Sistema de Programación RTVC.

## 📖 Índice de Documentación

### 🚀 Para Empezar

1. **[Guía Rápida](GUIA-RAPIDA.md)**
   - Instalación en 5 minutos
   - Conceptos clave
   - Tareas comunes
   - Solución de problemas
   - **👉 Empieza aquí si eres nuevo**

### 🏗️ Arquitectura y Diseño

2. **[Arquitectura del Sistema](ARQUITECTURA.md)**
   - Visión general del sistema
   - Estructura completa del proyecto
   - Stack tecnológico
   - Arquitectura backend (MVC)
   - Arquitectura frontend (React)
   - Modelo de base de datos
   - Flujo de datos
   - Componentes principales
   - Consideraciones técnicas

3. **[Diagramas Visuales](DIAGRAMAS.md)**
   - Diagrama de arquitectura general
   - Flujo de carga de programación
   - Ciclo de rotación de 4 semanas
   - Modelo de base de datos relacional
   - Flujo de creación de novedad
   - Comparación: Entre semana vs Fin de semana
   - Manejo de zonas horarias

### 🔌 API y Desarrollo

4. **[API Reference](API.md)**
   - Endpoints de Personal
   - Endpoints de Programación
   - Endpoints de Novedades
   - Endpoints de Reportes
   - Ejemplos de requests/responses
   - Códigos de error

5. **[Guía de Despliegue](DEPLOYMENT.md)**
   - Configuración de producción
   - Variables de entorno
   - Optimización de performance
   - Monitoreo y logs
   - Backup de base de datos

### 📚 Recursos Adicionales

6. **[Personnel Structure](personnel_structure.txt)**
   - Estructura de la tabla personnel
   - Índices y constraints
   - Triggers

---

## 🎯 Rutas de Aprendizaje

### Para Desarrolladores Frontend

1. Lee: [Guía Rápida](GUIA-RAPIDA.md) → Sección "Frontend"
2. Estudia: [Arquitectura](ARQUITECTURA.md) → Sección "Arquitectura Frontend"
3. Revisa: [Diagramas](DIAGRAMAS.md) → "Flujo de Datos"
4. Explora el código en: `src/components/`

**Archivos clave**:
- `src/App.jsx` - Componente principal
- `src/components/Schedule/ScheduleTable.jsx` - Tabla de programación
- `src/hooks/useSchedule.js` - Lógica de horarios
- `src/services/scheduleService.js` - Cliente API

### Para Desarrolladores Backend

1. Lee: [Guía Rápida](GUIA-RAPIDA.md) → Sección "Backend"
2. Estudia: [Arquitectura](ARQUITECTURA.md) → Sección "Arquitectura Backend"
3. Revisa: [API Reference](API.md)
4. Explora el código en: `backend/`

**Archivos clave**:
- `backend/server.js` - Punto de entrada
- `backend/routes/schedule.js` - Rutas de programación
- `backend/controllers/scheduleController.js` - Lógica de turnos
- `backend/database/schema.sql` - Estructura de BD

### Para Database Admins

1. Lee: [Personnel Structure](personnel_structure.txt)
2. Estudia: [Arquitectura](ARQUITECTURA.md) → Sección "Base de Datos"
3. Revisa: [Diagramas](DIAGRAMAS.md) → "Modelo de Base de Datos"
4. Explora: `backend/database/schema.sql`

**Scripts útiles**:
```bash
backend/scripts/utils/check-db.js
backend/scripts/utils/check-database-tables.js
```

### Para DevOps

1. Lee: [Guía de Despliegue](DEPLOYMENT.md)
2. Estudia: [Arquitectura](ARQUITECTURA.md) → "Stack Tecnológico"
3. Configura variables de entorno
4. Configura PostgreSQL en producción

---

## 🔍 Búsqueda Rápida

### ¿Cómo funciona...?

| Pregunta | Documento | Sección |
|----------|-----------|---------|
| ¿Cómo funciona la rotación de turnos? | [Arquitectura](ARQUITECTURA.md) | "Flujo de Rotación de Turnos" |
| | [Diagramas](DIAGRAMAS.md) | "Ciclo de Rotación de 4 Semanas" |
| ¿Cómo se calculan los turnos automáticos? | [Arquitectura](ARQUITECTURA.md) | "Flujo de Datos" |
| | [Diagramas](DIAGRAMAS.md) | "Flujo de Carga de Programación" |
| ¿Cómo funcionan las novedades? | [Arquitectura](ARQUITECTURA.md) | "Flujo de Creación de Novedad" |
| | [Diagramas](DIAGRAMAS.md) | "Flujo de Creación de Novedad" |
| ¿Qué diferencia hay entre semana y fin de semana? | [Diagramas](DIAGRAMAS.md) | "Entre Semana vs Fin de Semana" |
| ¿Cómo se manejan las zonas horarias? | [Arquitectura](ARQUITECTURA.md) | "Manejo de Zonas Horarias" |
| | [Diagramas](DIAGRAMAS.md) | "Manejo de Zonas Horarias" |

### ¿Dónde está...?

| Buscando | Ubicación |
|----------|-----------|
| Endpoints de la API | [API.md](API.md) |
| Estructura de carpetas | [Arquitectura](ARQUITECTURA.md) - "Estructura del Proyecto" |
| Modelo de datos | [Arquitectura](ARQUITECTURA.md) - "Base de Datos" |
| Scripts de utilidad | `backend/scripts/README.md` |
| Componentes React | `src/components/` |
| Hooks personalizados | `src/hooks/` |

---

## 💡 Conceptos Importantes

### 1. Rotación de 4 Semanas

El sistema trabaja con un ciclo repetitivo de 4 semanas:

```
Semana 1 → Semana 2 → Semana 3 → Semana 4 → Semana 1...
```

Cada semana, el personal rota automáticamente a diferentes turnos.

**Documentación**: [Diagramas - Ciclo de Rotación](DIAGRAMAS.md#3-ciclo-de-rotación-de-4-semanas)

### 2. Fin de Semana vs Entre Semana

El sistema tiene dos modos de operación:

- **Entre Semana (L-V)**: 9 programas, turnos variables, personal completo
- **Fin de Semana (S-D)**: 5 programas, 2 turnos fijos, 2 personas por área

**Documentación**: [Diagramas - Comparación](DIAGRAMAS.md#6-comparación-entre-semana-vs-fin-de-semana)

### 3. Novedades

Las novedades tienen **prioridad absoluta** sobre asignaciones automáticas.

Si una persona tiene una novedad activa:
- Aparece en **rojo** en la programación
- NO se asigna automáticamente a programas
- Se muestra la descripción de la novedad

**Documentación**: [Arquitectura - Prioridad de Novedades](ARQUITECTURA.md#4-prioridad-de-novedades)

### 4. Zona Horaria

⚠️ **IMPORTANTE**: El sistema maneja fechas en zona horaria **local** (no UTC).

**Nunca usar**: `toISOString()` para obtener fechas
**Usar siempre**: `getFullYear()`, `getMonth()`, `getDate()`

**Documentación**: [Diagramas - Manejo de Zonas Horarias](DIAGRAMAS.md#7-manejo-de-zonas-horarias-importante)

---

## 🛠️ Mantenimiento de la Documentación

### Actualizar Documentación

Si modificas el código, asegúrate de actualizar:

1. **[ARQUITECTURA.md](ARQUITECTURA.md)** - Si cambias la estructura o flujos
2. **[DIAGRAMAS.md](DIAGRAMAS.md)** - Si cambias el flujo de datos
3. **[API.md](API.md)** - Si agregas/modificas endpoints
4. **[GUIA-RAPIDA.md](GUIA-RAPIDA.md)** - Si cambias comandos o pasos

### Verificar Documentación

Antes de hacer commit, verifica:

- ✅ Los enlaces funcionan
- ✅ Los ejemplos de código son correctos
- ✅ Los diagramas están actualizados
- ✅ Las rutas de archivos son correctas

---

## 📞 Contacto

¿Tienes preguntas sobre la documentación?

- Abre un issue en el repositorio
- Contacta al equipo de desarrollo

---

## 📅 Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | Dic 2025 | Documentación inicial completa |
| | | - Arquitectura del sistema |
| | | - Diagramas de flujo |
| | | - Guía rápida |
| | | - API reference |

---

**Última actualización**: Diciembre 2025
