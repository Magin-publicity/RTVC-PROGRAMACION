-- Actualizacion de datos de personal existente
BEGIN;

-- Juan Carlos Boada (ID: 5)
UPDATE personnel SET cedula = '74302504', phone = '310 2844546', email = 'juancarlosboadavargas@gmail.com', eps = 'Nueva EPS', arl = 'Positiva' WHERE id = 5;
-- Maria Jose Escobar (ID: 31)
UPDATE personnel SET cedula = '1010120083', phone = '300 4674496', email = 'mariaescobar1711@hotmail.com', eps = 'Compensar', arl = 'Positiva' WHERE id = 31;
-- Kevin Alejandro Lerma (ID: 50)
UPDATE personnel SET cedula = '1030690279', phone = '322 7960612', email = 'kalerma88@gmail.com', eps = 'Salud Total', arl = 'Positiva' WHERE id = 50;
-- Carlos Alberto Quiroz Rubio (ID: 211)
UPDATE personnel SET cedula = '79969650', phone = '300 6342465', email = 'carloslopeztv78@gmail.com', eps = 'Famisanar', arl = 'Positiva' WHERE id = 211;
-- John Daminston A (ID: 61)
UPDATE personnel SET cedula = '79836879', phone = '310 6083387', email = 'damiston07@yahoo.es', eps = 'Compensar', arl = 'Positiva' WHERE id = 61;
-- Carlos Orlando Espinel (ID: 72)
UPDATE personnel SET cedula = '79500753', phone = '315 7896879', email = 'carlosorlandoespinel @hotmail.com', eps = 'Famisanar', arl = 'Positiva' WHERE id = 72;

COMMIT;