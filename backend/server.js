const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Configurar Socket.io con CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://10.66.0.165:5173',
  'http://10.225.95.165:5173',
  process.env.FRONTEND_URL,
  'https://*.vercel.app' // Permitir todos los dominios de Vercel
].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Permitir requests sin origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Verificar si el origin está en la lista o es un dominio de Vercel
      if (allowedOrigins.some(allowed =>
          origin === allowed ||
          origin.includes('vercel.app')
      )) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  }
});

// Hacer io accesible en las rutas
app.set('io', io);

// Middleware CORS para Express
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed =>
        origin === allowed ||
        origin.includes('vercel.app')
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`);

  // Unirse a una sala por fecha
  socket.on('join-date', (date) => {
    socket.join(`date-${date}`);
    console.log(`📅 Cliente ${socket.id} se unió a date-${date}`);
  });

  // Salir de una sala por fecha
  socket.on('leave-date', (date) => {
    socket.leave(`date-${date}`);
    console.log(`📅 Cliente ${socket.id} salió de date-${date}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

// Rutas
const personnelRoutes = require('./routes/personnel');
const noveltyRoutes = require('./routes/novelty');
const scheduleRoutes = require('./routes/schedule');
const reportRoutes = require('./routes/report');
const availabilityRoutes = require('./routes/availability');
const { router: authRoutes } = require('./routes/auth');
const studiosRoutes = require('./routes/studios');
const mastersRoutes = require('./routes/masters');
const programsRoutes = require('./routes/programs');
const assignmentsRoutes = require('./routes/assignments');
const asignacionesReporteriaRoutes = require('./routes/asignacionesReporteria');
const asignacionesRealizadoresRoutes = require('./routes/asignacionesRealizadores');
const reporteriaEspaciosRoutes = require('./routes/reporteriaEspacios');
const contractsRoutes = require('./routes/contracts');
const routesRoutes = require('./routes/routes');
const fleetRoutes = require('./routes/fleet');
const mealsRoutes = require('./routes/meals');
const logisticsRoutes = require('./routes/logistics');

app.use('/api/auth', authRoutes);
app.use('/api/personnel', personnelRoutes);
app.use('/api/novelties', noveltyRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/studios', studiosRoutes);
app.use('/api/masters', mastersRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/assignments', assignmentsRoutes);
app.use('/api/asignaciones-reporteria', asignacionesReporteriaRoutes);
app.use('/api/asignaciones-realizadores', asignacionesRealizadoresRoutes);
app.use('/api/reporteria-espacios', reporteriaEspaciosRoutes);
app.use('/api/contracts', contractsRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/fleet', fleetRoutes);
app.use('/api/meals', mealsRoutes);
app.use('/api/logistics', logisticsRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Escuchar en todas las interfaces

server.listen(PORT, HOST, () => {
  console.log(`✅ Servidor HTTP corriendo en puerto ${PORT}`);
  console.log(`🌐 Accesible en:`);
  console.log(`   - Local:   http://localhost:${PORT}`);
  console.log(`   - Network: http://[TU_IP]:${PORT}`);
  console.log(`🔌 WebSocket servidor listo`);
});

module.exports = { app, io, server };
