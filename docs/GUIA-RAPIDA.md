# Guía Rápida - Sistema RTVC

## 🚀 Inicio Rápido (5 minutos)

### 1. Instalar Dependencias

```bash
# Backend
cd backend
npm install

# Frontend (desde la raíz del proyecto)
cd ..
npm install
```

### 2. Configurar Base de Datos

```bash
# Asegúrate de tener PostgreSQL instalado y corriendo

# Crear base de datos
createdb -U postgres rtvc_scheduling

# O usando psql:
psql -U postgres
CREATE DATABASE rtvc_scheduling;
\q
```

### 3. Configurar Variables de Entorno

Edita `backend/.env`:

```env
DB_USER=postgres
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=rtvc_scheduling
PORT=3000
```

### 4. Inicializar Base de Datos

```bash
cd backend

# Crear tablas
psql -U postgres -d rtvc_scheduling -f database/schema.sql

# Cargar datos de prueba
psql -U postgres -d rtvc_scheduling -f database/seeds.sql
```

### 5. Ejecutar el Sistema

```bash
# Terminal 1: Backend
cd backend
npm start
# → Servidor corriendo en http://localhost:3000

# Terminal 2: Frontend
npm run dev
# → Aplicación corriendo en http://localhost:5173
```

### 6. Abrir en el Navegador

Abre: `http://localhost:5173`

---

## 📚 Conceptos Clave en 5 Minutos

### 1. Personal

- Personas que trabajan en RTVC
- Organizados por **áreas** (Productores, Directores, etc.)
- Tienen **roles** específicos
- Pueden estar **activos** o **inactivos**

### 2. Programación

- Sistema **automático** de asignación de turnos
- Rotación de **4 semanas** que se repite
- Diferentes horarios para:
  - **Entre semana**: Lunes a Viernes (9 programas)
  - **Fin de semana**: Sábado y Domingo (5 programas)

### 3. Novedades

- Eventos que afectan la disponibilidad del personal
- Tipos: Vacaciones, Incapacidad, Permiso, etc.
- Tienen rango de fechas (inicio - fin)
- **Prioridad** sobre asignaciones automáticas

### 4. Rotación de Turnos

```
Semana 1 → Semana 2 → Semana 3 → Semana 4 → Semana 1...
```

Cada persona rota automáticamente cada semana.

---

## 🎯 Tareas Comunes

### Ver la Programación de Hoy

1. Abre la aplicación
2. La vista por defecto es "Programación"
3. Automáticamente muestra el día de hoy

### Navegar a Otra Semana

- **Botón "←"**: Semana anterior
- **Botón "Hoy"**: Volver al día de hoy
- **Botón "→"**: Semana siguiente
- **Click en día**: Seleccionar día específico

### Agregar Personal

1. Click en menú lateral: **"Personal"**
2. Click en **"+ Agregar Personal"**
3. Llenar formulario:
   - Nombre
   - Rol (ej: Director de Cámara)
   - Área (ej: DIRECTORES DE CÁMARA)
   - Turno actual (opcional)
4. Click en **"Guardar"**

### Crear una Novedad

1. Click en menú lateral: **"Novedades"**
2. Click en **"+ Nueva Novedad"**
3. Llenar formulario:
   - Seleccionar personal
   - Tipo de novedad (Vacaciones, Permiso, etc.)
   - Fecha inicio
   - Fecha fin
   - Descripción
4. Click en **"Guardar"**

La programación se actualiza automáticamente.

### Exportar a PDF

1. En la vista de **"Programación"**
2. Click en botón **"PDF"** (arriba a la derecha)
3. Se descarga PDF con la programación del día

---

## 🔧 Scripts Útiles

### Backend

```bash
cd backend

# Verificar conexión a la base de datos
node scripts/utils/check-db.js

# Ver estructura de tablas
node scripts/utils/check-database-tables.js

# Verificar novedades
node scripts/utils/check-novelties.js

# Verificar rotación
node scripts/utils/verify-rotation.js
```

### Base de Datos

```bash
# Conectar a la base de datos
psql -U postgres -d rtvc_scheduling

# Ver todas las tablas
\dt

# Ver personal
SELECT * FROM personnel;

# Ver novedades activas
SELECT * FROM novelties WHERE end_date >= CURRENT_DATE;

# Ver patrones de rotación
SELECT * FROM rotation_patterns ORDER BY week_number, area;
```

---

## 📖 Estructura de Carpetas (Simplificada)

```
RTVC PROGRAMACION/
│
├── backend/              # Servidor
│   ├── database/         # SQL (schema, seeds)
│   ├── routes/           # Endpoints API
│   └── server.js         # Punto de entrada
│
├── src/                  # Frontend
│   ├── components/       # Componentes React
│   ├── hooks/            # Lógica reutilizable
│   └── App.jsx           # App principal
│
└── docs/                 # Documentación
    ├── ARQUITECTURA.md   # Arquitectura detallada
    ├── DIAGRAMAS.md      # Diagramas visuales
    └── GUIA-RAPIDA.md    # Esta guía
```

---

## 🐛 Solución de Problemas Comunes

### Error: "Cannot connect to database"

**Solución**:
1. Verifica que PostgreSQL esté corriendo:
   ```bash
   # Windows
   sc query postgresql-x64-18

   # Mac/Linux
   pg_isready
   ```
2. Verifica credenciales en `backend/.env`
3. Verifica que la base de datos exista:
   ```bash
   psql -U postgres -l | grep rtvc
   ```

### Error: "Port 3000 already in use"

**Solución**:
1. Mata el proceso en el puerto 3000:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F

   # Mac/Linux
   lsof -ti:3000 | xargs kill -9
   ```
2. O cambia el puerto en `backend/.env`

### La programación no se carga

**Solución**:
1. Abre la consola del navegador (F12)
2. Revisa errores en la pestaña "Console"
3. Verifica que el backend esté corriendo:
   ```bash
   curl http://localhost:3000/api/personnel
   ```
4. Verifica que haya datos:
   ```bash
   psql -U postgres -d rtvc_scheduling -c "SELECT COUNT(*) FROM personnel;"
   ```

### Las novedades aparecen un día antes/después

**Problema**: Zona horaria
**Solución**: Ya está corregido en la última versión. Asegúrate de tener los últimos cambios.

---

## 📊 Datos de Ejemplo

### Personal por Área

```
PRODUCTORES: 5 personas
ASISTENTES DE PRODUCCIÓN: 3 personas
DIRECTORES DE CÁMARA: 4 personas
VTR: 2 personas
OPERADORES DE VMIX: 2 personas
... (etc.)
```

### Programas Entre Semana

```
06:00 - Calentado
11:00 - Avance Informativo
12:00 - Emisión RTVC Noticias
15:30 - Avance Informativo
17:00 - Avance Informativo
18:00 - Avance Informativo
19:00 - Emisión Central
20:00 - Noches de Opinión
21:30 - Última Emisión
```

### Programas Fin de Semana

```
12:00 - Avance Informativo
12:30 - Emisión RTVC Noticias
13:30 - Avance Informativo
18:30 - Avance Informativo
19:00 - Emisión RTVC Noticias
```

---

## 🎓 Siguientes Pasos

1. **Lee la arquitectura completa**: `docs/ARQUITECTURA.md`
2. **Estudia los diagramas**: `docs/DIAGRAMAS.md`
3. **Revisa la API**: `docs/API.md`
4. **Experimenta** con la interfaz
5. **Modifica** el código y observa los cambios

---

## 💡 Tips Pro

### Atajos de Teclado
- `F12`: Abrir DevTools (ver consola, red, etc.)
- `Ctrl + Shift + R`: Recarga forzada (limpia caché)

### Desarrollo
- El frontend usa **Vite** con Hot Module Replacement (HMR)
  - Los cambios se reflejan instantáneamente
- El backend usa **nodemon** (si lo instalas)
  - Se reinicia automáticamente al guardar

### Debugging
- Agrega `console.log()` en el código
- Revisa la pestaña "Network" en DevTools para ver llamadas API
- Usa `debugger;` para pausar la ejecución

---

## 📞 Ayuda

Si tienes problemas:

1. Revisa los logs:
   - Backend: Terminal donde corre `npm start`
   - Frontend: Consola del navegador (F12)

2. Verifica la base de datos:
   ```bash
   node backend/scripts/utils/check-db.js
   ```

3. Lee la documentación completa en `docs/`

---

**¡Listo para empezar! 🚀**
