-- Script para eliminar todas las tablas relacionadas con travel_events
-- Parte de la limpieza del módulo de Viajes y Eventos que no funcionó

-- Eliminar tablas en orden correcto (dependencias primero)
DROP TABLE IF EXISTS travel_event_equipment CASCADE;
DROP TABLE IF EXISTS travel_event_personnel CASCADE;
DROP TABLE IF EXISTS travel_events CASCADE;

-- Verificar que las tablas fueron eliminadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'travel_%';
