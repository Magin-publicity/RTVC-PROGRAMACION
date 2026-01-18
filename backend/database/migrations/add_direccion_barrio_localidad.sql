-- Migración: Agregar campos de dirección, barrio y localidad al personal
-- Fecha: 2026-01-08

-- Agregar columna direccion
ALTER TABLE personnel
ADD COLUMN IF NOT EXISTS direccion VARCHAR(500);

-- Agregar columna barrio
ALTER TABLE personnel
ADD COLUMN IF NOT EXISTS barrio VARCHAR(150);

-- Agregar columna localidad
ALTER TABLE personnel
ADD COLUMN IF NOT EXISTS localidad VARCHAR(150);

-- Comentarios para documentación
COMMENT ON COLUMN personnel.direccion IS 'Dirección de residencia del empleado';
COMMENT ON COLUMN personnel.barrio IS 'Barrio de residencia del empleado';
COMMENT ON COLUMN personnel.localidad IS 'Localidad o ciudad de residencia del empleado';
