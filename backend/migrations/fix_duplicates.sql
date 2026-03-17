-- Actualizar originales con datos de los nuevos (duplicados)
BEGIN;

-- Andrea Olaya (139) <- Andrea Julieth Olaya Cobos (416)
UPDATE personnel SET
  eps = (SELECT eps FROM personnel WHERE id = 416),
  arl = (SELECT arl FROM personnel WHERE id = 416),
  cedula = (SELECT cedula FROM personnel WHERE id = 416),
  phone = (SELECT phone FROM personnel WHERE id = 416),
  email = (SELECT email FROM personnel WHERE id = 416)
WHERE id = 139;

-- Camila Bradford (148) <- Camila Andrea Brandford Gil (425)
UPDATE personnel SET
  eps = (SELECT eps FROM personnel WHERE id = 425),
  arl = (SELECT arl FROM personnel WHERE id = 425),
  cedula = (SELECT cedula FROM personnel WHERE id = 425),
  phone = (SELECT phone FROM personnel WHERE id = 425),
  email = (SELECT email FROM personnel WHERE id = 425)
WHERE id = 148;

-- Cristian Sandoval (142) <- Cristián Fabián Sandoval Galindo (423)
UPDATE personnel SET
  cedula = (SELECT cedula FROM personnel WHERE id = 423),
  phone = (SELECT phone FROM personnel WHERE id = 423),
  email = (SELECT email FROM personnel WHERE id = 423)
WHERE id = 142;

-- Danny Correa (143) <- Danny Carlos Correa López (414)
UPDATE personnel SET
  cedula = (SELECT cedula FROM personnel WHERE id = 414),
  phone = (SELECT phone FROM personnel WHERE id = 414),
  email = (SELECT email FROM personnel WHERE id = 414)
WHERE id = 143;

-- Leoniris Moya (149) <- Leoniris Elaines Moya Tapias (419)
UPDATE personnel SET
  cedula = (SELECT cedula FROM personnel WHERE id = 419),
  phone = (SELECT phone FROM personnel WHERE id = 419),
  email = (SELECT email FROM personnel WHERE id = 419)
WHERE id = 149;

-- Mauricio Pichot (147) <- Mauricio René Pichot Elles (441)
UPDATE personnel SET
  cedula = (SELECT cedula FROM personnel WHERE id = 441),
  phone = (SELECT phone FROM personnel WHERE id = 441),
  email = (SELECT email FROM personnel WHERE id = 441)
WHERE id = 147;

-- Eliminar duplicados
DELETE FROM personnel WHERE id IN (416, 425, 423, 414, 419, 441);

COMMIT;
