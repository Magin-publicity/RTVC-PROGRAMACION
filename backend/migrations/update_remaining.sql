-- Actualizar personal restante con datos del Excel
BEGIN;

-- CONTRIBUCIONES
-- Adrian Contreras <- Sergio Adrián Contreras Narváez
UPDATE personnel SET
  cedula = '1023941251',
  phone = '321 4619007',
  email = 'sergiocn92@gmail.com',
  eps = 'Compensar',
  arl = 'Positiva'
WHERE id = 91 AND name = 'Adrian Contreras';

-- Carolina Benavides <- Diana Carolina Benavides García
UPDATE personnel SET
  cedula = '52493044',
  phone = '310 3153041',
  email = 'dcarolinab2017@gmail.com',
  eps = 'Sanitas',
  arl = 'Positiva'
WHERE id = 93 AND name = 'Carolina Benavides';

-- DIRECTORES DE CÁMARA
-- Alejandro La Torre <- Nelson Alejandro La Torre Villalba
UPDATE personnel SET
  cedula = '79966936',
  phone = '312 3499710',
  email = 'antelatorre@gmail.com',
  eps = 'Sanitas',
  arl = 'Positiva'
WHERE id = 12 AND name = 'Alejandro La Torre';

-- Camilo Hernández <- Iván Camilo Hernández Cárdenas
UPDATE personnel SET
  cedula = '80239896',
  phone = '320 2700627',
  email = 'camilo021@hotmail.com',
  eps = 'Compensar',
  arl = 'Positiva'
WHERE id = 15 AND name = 'Camilo Hernández';

COMMIT;
