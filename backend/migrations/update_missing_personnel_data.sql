-- Actualización masiva de datos faltantes de personal
-- Archivo fuente: C:\Users\JUANP\Downloads\BASE DE DATOS.xlsx
-- Fecha: 2026-03-19
-- Total de actualizaciones: 29 registros

BEGIN;

-- Sebastián Arango (ID: 9) <- Johan Sebastián Arango Mesa
UPDATE personnel SET cedula = '1000588646', email = 'arangosoy@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 4429000 WHERE id = 9;

-- Alejandro La Torre (ID: 12) <- Nelson Alejandro La Torre Villalba
UPDATE personnel SET salario = 6900000 WHERE id = 12;

-- Camilo Hernández (ID: 15) <- Iván Camilo Hernández Cárdenas
UPDATE personnel SET salario = 6900000 WHERE id = 15;

-- Henry Villarraga (ID: 21) <- Johan Henry Villarraga Villarraga
UPDATE personnel SET cedula = '80225345', eps = 'Sanitas', arl = 'Positiva', salario = 4120000 WHERE id = 21;

-- Santiago Rico (ID: 33) <- Edwin Santiago Rico Durán
UPDATE personnel SET cedula = '1023931274', eps = 'Compensar', arl = 'Positiva', salario = 4377500 WHERE id = 33;

-- Marcela Vélez (ID: 43) <- Diana Marcela Vélez Garzón
UPDATE personnel SET cedula = '52731633', eps = 'Sanitas', arl = 'Positiva', salario = 3000000 WHERE id = 43;

-- Duván Díaz (ID: 48) <- Helbert Duván Díaz García
UPDATE personnel SET cedula = '1032468488', email = 'duvan_126@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 2994262 WHERE id = 48;

-- Juan Sacristán (ID: 52) <- Juan Carlos Sacristán Ramírez
UPDATE personnel SET cedula = '79871683', eps = 'Salud Total', arl = 'Positiva', salario = 5150000 WHERE id = 52;

-- Ernesto Corchuelo (ID: 64) <- Jairo Ernesto Corchuelo Sarmiento
UPDATE personnel SET cedula = '11427061', eps = 'Compensar', arl = 'Positiva', salario = 5150000 WHERE id = 64;

-- Andrés López (ID: 67) <- Carlos Andrés López Muñoz
UPDATE personnel SET cedula = '79811201', eps = 'Salud Total', arl = 'Positiva', salario = 5150000 WHERE id = 67;

-- Santiago Espinosa (ID: 83) <- Emmanuel Santiago Espinosa Wilches
UPDATE personnel SET cedula = '1030650975', eps = 'Compensar', arl = 'Positiva', salario = 4120000 WHERE id = 83;

-- Leonardo Castro (ID: 87) <- José Leonardo Castro Rojas
UPDATE personnel SET cedula = '80244421', email = 'leocactus2@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 4250000 WHERE id = 87;

-- Adrian Contreras (ID: 91) <- Sergio Adrián Contreras Narváez
UPDATE personnel SET salario = 4472000 WHERE id = 91;

-- Michael Torres (ID: 92) <- Michael Enrique Torres Urrego
UPDATE personnel SET cedula = '80872971', eps = 'Famisanar', arl = 'Positiva', salario = 4472000 WHERE id = 92;

-- Carolina Benavides (ID: 93) <- Diana Carolina Benavides García
UPDATE personnel SET salario = 4400000 WHERE id = 93;

-- Ramiro Balaguera (ID: 100) <- José Ramiro Balaguera Pérez
UPDATE personnel SET cedula = '2969753', eps = 'Sanitas', arl = 'Positiva', salario = 5150000 WHERE id = 100;

-- Enrique Muñoz (ID: 107) <- Luis Enrique Muñoz Palacio
UPDATE personnel SET cedula = '79533940', eps = 'Compensar', arl = 'Positiva', salario = 5150000 WHERE id = 107;

-- Jhonatan Andres Ramirez (ID: 124) <- Jonathan Andrés Ramírez Sepulveda
UPDATE personnel SET cedula = '1121866160', eps = 'Famisanar', arl = 'Positiva', salario = 2884000 WHERE id = 124;

-- Catalina Acevedo (ID: 132) <-  Mireya Catalina Acevedo
UPDATE personnel SET cedula = '39679825', eps = 'Famisanar', arl = 'Positiva', salario = 4429000 WHERE id = 132;

-- Carolay Morales (ID: 141) <- Linda Carolay Morales Pérez
UPDATE personnel SET cedula = '53049601', email = 'caromorales85@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 7500000 WHERE id = 141;

-- Yajaira Perea (ID: 151) <- Marianne Yajaira Perea Asprilla
UPDATE personnel SET cedula = '1028003566', email = 'yajaperea.tv@gmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 10800000 WHERE id = 151;

-- Andrés Osorio (ID: 155) <- Alfonso Andrés Osorio Osuna
UPDATE personnel SET cedula = '79779400', email = 'aosorio@contratista.rtvc.gov.co', eps = 'Sanitas', arl = 'Positiva', salario = 12000000 WHERE id = 155;

-- Richard Beltrán (ID: 182) <- Richard Sneyder Beltrán Corredor
UPDATE personnel SET cedula = '1073674905', email = 'richardsneybc@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 3020000 WHERE id = 182;

-- Angelica Rodriguez (ID: 200) <- Maria Angélica Rodríguez Gómez
UPDATE personnel SET salario = 2571621 WHERE id = 200;

-- Alfonso Ramírez (ID: 217) <- Raúl Alfonso Ramírez Rodríguez
UPDATE personnel SET cedula = '79296786', email = 'raulalfonsoramirez1@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 5150000 WHERE id = 217;

-- Guillermo Solarte (ID: 239) <- Guillermo Solarte Rosero
UPDATE personnel SET cedula = '98397359', phone = '315 4494151', email = 'productortvcolombia@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 8100000 WHERE id = 239;

-- Juliana Coronel (ID: 262) <- Claudia Juliana Coronel Castro
UPDATE personnel SET cedula = '1102351237', phone = '300 7244579‬', email = 'julianitacoronel@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 6077000 WHERE id = 262;

-- Camila Carvajal (ID: 269) <- Maria Camila Carvajal Trujillo
UPDATE personnel SET cedula = '1144090499', phone = '316 6910616‬', email = 'mcarvajal@contratista.rtvc.gov.co', eps = 'Salud Total', arl = 'Positiva', salario = 6102750 WHERE id = 269;

-- Heidy Tatiana López Casallas (ID: 456) <- Heidy Tatiana López Casallas
UPDATE personnel SET salario = 5150000 WHERE id = 456;

COMMIT;
