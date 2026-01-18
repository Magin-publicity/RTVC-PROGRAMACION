-- ========================================
-- MIGRACIÓN: Agregar campo program_name a meal_requests
-- ========================================
-- Fecha: 2026-01-17
-- Propósito: Almacenar el nombre del programa al que está asignado el personal
-- ========================================

-- Agregar columna program_name a meal_requests
ALTER TABLE meal_requests
ADD COLUMN IF NOT EXISTS program_name VARCHAR(150);

-- Comentario en la columna
COMMENT ON COLUMN meal_requests.program_name IS 'Nombre del programa al que está asignado el personal (desde tabla programas o personal_asignado)';
