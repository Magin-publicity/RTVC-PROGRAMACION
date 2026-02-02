-- Migración 012: Crear vista fleet_dispatches con lógica de disponibilidad mejorada
-- Fecha: 2026-01-31
-- Descripción: Vista materializada que expande despachos a relación personal-dispatch con lógica de retorno

-- Eliminar vista si existe
DROP VIEW IF EXISTS fleet_dispatches CASCADE;

-- Crear vista que expande la relación many-to-many de personal
CREATE VIEW fleet_dispatches AS
SELECT
  pd.id,
  pd.date,
  pd.fecha_inicio,
  pd.fecha_fin,
  pd.vehicle_id,
  pd.departure_time,
  pd.estimated_return,
  pd.destination,
  pd.status,
  pd.conductor_retorna,
  pd.hora_retorno_conductor,
  pdp.personnel_id,
  pdp.role,
  -- Determinar si el recurso está disponible considerando retorno de conductor
  CASE
    -- Si es conductor/vehículo Y conductor_retorna = true
    WHEN pdp.role = 'DRIVER' AND pd.conductor_retorna = true THEN
      -- Solo bloqueado hasta hora_retorno_conductor
      CURRENT_TIME < pd.hora_retorno_conductor
    ELSE
      -- Personal (camarógrafos, asistentes) bloqueado durante todo el rango
      true
  END as esta_bloqueado
FROM press_dispatches pd
LEFT JOIN press_dispatch_personnel pdp ON pd.id = pdp.dispatch_id
WHERE pd.status IN ('PROGRAMADO', 'EN_RUTA');

COMMENT ON VIEW fleet_dispatches IS 'Vista que expande despachos a nivel de personal individual con lógica de retorno de conductor';
