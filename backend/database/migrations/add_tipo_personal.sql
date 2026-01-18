-- Agregar campo tipo_personal a la tabla personnel
-- Este campo diferencia entre personal TECNICO (programación) y LOGISTICO (rutas/refrigerios)

-- Paso 1: Agregar la columna
ALTER TABLE personnel
ADD COLUMN IF NOT EXISTS tipo_personal VARCHAR(20) DEFAULT 'TECNICO';

-- Paso 2: Marcar todo el personal existente como TECNICO
UPDATE personnel
SET tipo_personal = 'TECNICO'
WHERE tipo_personal IS NULL;

-- Paso 3: Crear índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_personnel_tipo_personal ON personnel(tipo_personal);

-- Verificar
SELECT
  tipo_personal,
  COUNT(*) as total
FROM personnel
GROUP BY tipo_personal;
