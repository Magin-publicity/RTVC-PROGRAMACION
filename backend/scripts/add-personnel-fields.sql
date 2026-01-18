-- Script para agregar campos de contacto y contrato al personal
-- Ejecutar en PostgreSQL

ALTER TABLE personnel
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS contract_start DATE,
ADD COLUMN IF NOT EXISTS contract_end DATE,
ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

-- Agregar comentarios a las columnas
COMMENT ON COLUMN personnel.email IS 'Correo electrónico del empleado';
COMMENT ON COLUMN personnel.contract_start IS 'Fecha de inicio del contrato';
COMMENT ON COLUMN personnel.contract_end IS 'Fecha de fin del contrato';
COMMENT ON COLUMN personnel.phone IS 'Teléfono o celular del empleado';
