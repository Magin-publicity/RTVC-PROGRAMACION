# Scripts del Backend

Esta carpeta contiene scripts de utilidad para gestionar la base de datos y el sistema.

## Estructura

### Scripts Principales (raíz)

- **setup-db.js** - Configura la base de datos inicial
- **seed-data.js** - Carga datos de prueba en la base de datos
- **load-seeds.js** - Carga los seeds desde archivos SQL
- **create-all.js** - Crea todas las tablas necesarias
- **create-rotation-tables.js** - Crea tablas de rotación de turnos
- **create-real-rotation-patterns.js** - Crea patrones de rotación reales
- **insert-sample-data.js** - Inserta datos de ejemplo
- **remove-all-shifts.js** - Elimina todos los turnos

### /utils - Scripts de Verificación y Pruebas

Scripts para verificar el estado de la base de datos y hacer pruebas:

- **check-db.js** - Verifica la conexión a la base de datos
- **check-database-tables.js** - Verifica las tablas de la base de datos
- **check-novelties.js** - Verifica las novedades
- **check-personnel-structure.js** - Verifica la estructura de personal
- **test-schedules.js** - Prueba la generación de horarios
- **test-novelty-daterange.js** - Prueba rangos de fechas en novedades
- **verify-rotation.js** - Verifica la rotación de turnos

### /migrations - Scripts de Migración y Corrección

Scripts para migrar datos y corregir problemas:

- **migrate-novelties-daterange.js** - Migra novedades a formato de rango de fechas
- **fix-all-tables.js** - Corrige todas las tablas
- **fix-personnel-schema.js** - Corrige el esquema de personal
- **separate-audio-areas.js** - Separa áreas de audio
- **separate-production.js** - Separa producción
- **separate-vmix-pantallas.js** - Separa VMix y pantallas

## Uso

Para ejecutar cualquier script:

```bash
cd backend
node scripts/<nombre-del-script>.js
```

Para scripts en subcarpetas:

```bash
node scripts/utils/<nombre-del-script>.js
node scripts/migrations/<nombre-del-script>.js
```
