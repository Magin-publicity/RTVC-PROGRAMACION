-- Migración: Actualización de datos de personal desde Excel
-- Fecha: 2026-03-16
-- Descripción: Actualiza 8 personas existentes y agrega 142 personas nuevas

BEGIN;

-- ============================================================
-- PARTE 1: Actualizar personas existentes (8 personas)
-- ============================================================

-- Actualizar Isabella Rojas (ID: 8)
UPDATE personnel SET cedula = '1000603271', phone = '305 8278577', email = 'iabellarojash48@gmail.com', eps = 'Capital Salud', arl = 'Positiva' WHERE id = 8;

-- Actualizar Alexander Paez (ID: 193)
UPDATE personnel SET cedula = '1023363382', phone = '304 6411744', email = 'alexpaarevalo@gmail.com ', eps = 'Compensar', arl = 'Positiva' WHERE id = 193;

-- Actualizar Tania Morales (ID: 258)
UPDATE personnel SET cedula = '1001065155', phone = '322 7504200', email = 'ta-nia2000@outlook.com', eps = 'Compensar', arl = 'Positiva' WHERE id = 258;

-- Actualizar Ronald Ortiz (ID: 24)
UPDATE personnel SET cedula = '1013685184', phone = '317 3572425', email = 'produccion.ronnye@icloud.com', eps = 'Compensar', arl = 'Positiva' WHERE id = 24;

-- Actualizar Ashlei Montero (ID: 30)
UPDATE personnel SET cedula = '1140914171', phone = '319 2536387‬', email = 'ashlimontero8@gmail.com', eps = 'Salud Total', arl = 'Positiva' WHERE id = 30;

-- Actualizar William Mosquera (ID: 60)
UPDATE personnel SET cedula = '19480248', phone = '310 7689239', email = 'wmvideos01@gmail.com ', eps = 'Nueva EPS', arl = 'Positiva' WHERE id = 60;

-- Actualizar Carlos Orlando Espinel (ID: 72)
UPDATE personnel SET cedula = '79500753', phone = '315 7896879', email = 'carlosorlandoespinel @hotmail.com', eps = 'Famisanar', arl = 'Positiva' WHERE id = 72;

-- Actualizar Rafael López (ID: 78)
UPDATE personnel SET cedula = '79426110', phone = '310 7954780', email = 'raf4lopez@gmail.com', eps = 'Sanitas', arl = 'Positiva' WHERE id = 78;

-- ============================================================
-- PARTE 2: Insertar personas nuevas (142 personas)
-- ============================================================

-- 1. William Eduardo Parra Jaimes
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('William Eduardo Parra Jaimes', '79307835', 'Director Noticias RTVC', '323 2830866', 'wparrareporterodelsur@gmail.com', 'Sanitas', 'Positiva', 'TÉCNICO', 'TÉCNICO', true);

-- 2. Yanett Liliana Manzano Ojeda
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Yanett Liliana Manzano Ojeda', '37322875', 'Editora Informativa', '311 5427929', 'yanismanzano@hotmail.com', 'Compensar', 'Positiva', 'EDITORES INFORMATIVOS', 'TÉCNICO', true);

-- 3. Claudia Emilia Bedoya Madrid
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Claudia Emilia Bedoya Madrid', '43043875', 'Editora Informativa', '300 2183613', 'claudiabedoyamadrid@hotmail.com', 'Sanitas', 'Positiva', 'EDITORES INFORMATIVOS', 'TÉCNICO', true);

-- 4. Dioda Aydee Gamboa Villate
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Dioda Aydee Gamboa Villate', '52393716', 'Editora Informativa', '3156801159', 'aydeegambov@gmail.com', 'AlianSalud', 'Positiva', 'EDITORES INFORMATIVOS', 'TÉCNICO', true);

-- 5. Rober Alexander Vivas Montealegre
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Rober Alexander Vivas Montealegre', '88246917', 'Jefe de Emisión - Calentao', '300 2127998', 'rvivas@contratista.rtvc.gov.co', 'Sanitas', 'Positiva', 'JEFES DE EMISIÓN', 'TÉCNICO', true);

-- 6. Éver Manuel Palomo Llorente
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Éver Manuel Palomo Llorente', '73144764', 'Jefe de Emisión - Medio Día', '317 5742145', 'everpalomoll@gmail.com', 'Capital Salud', 'Positiva', 'JEFES DE EMISIÓN', 'TÉCNICO', true);

-- 7. Wilson Adrián Bonilla
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Wilson Adrián Bonilla', '79471331', 'Jefe de Emisión - Central', '3144691771', 'wbonilla468@gmail.com', 'Sura', 'Positiva', 'JEFES DE EMISIÓN', 'TÉCNICO', true);

-- 8. Pablo César Guevara Gómez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Pablo César Guevara Gómez', '79859108', 'Jefe de Emisión - Última Edición', '310 3304069', 'pablocesarguevara@hotmail.com', 'Compensar', 'Positiva', 'JEFES DE EMISIÓN', 'TÉCNICO', true);

-- 9. Luis Sebastián Fajardo Serna
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Luis Sebastián Fajardo Serna', '1005890771', 'Productor ', '319 3513093‬', 'luisfasertv@gmail.com', 'Sanitas', 'Positiva', 'PRODUCTORES', 'TÉCNICO', true);

-- 10. Laura Johana Ávila Ospina
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Laura Johana Ávila Ospina', '1032468249', 'Productora Periodística - Calentao', '312 3577524', 'lauraavilaospina@gmail.com', 'Sanitas', 'Positiva', 'PRODUCTORES', 'TÉCNICO', true);

-- 11. Rocio Esmeralda Ruiz
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Rocio Esmeralda Ruiz', '53119337', 'Productora ', '311 2002743', 'rocioruiz_tv@hotmail.com', 'Sanitas', 'Positiva', 'PRODUCTORES', 'TÉCNICO', true);

-- 12. Alfonso Andrés Osorio Osuna
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Alfonso Andrés Osorio Osuna', '79779400', 'Productor General - Señal Colombia', '301 7868099', 'aosorio@contratista.rtvc.gov.co', 'Sanitas', 'Positiva', 'PRODUCTORES', 'TÉCNICO', true);

-- 13. Marilú Durán Ortiz
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Marilú Durán Ortiz', '52072341', 'Productora', '320 3485916‬', 'mduran@contratista.rtvc.gov.co', 'Famisanar', 'Positiva', 'PRODUCTORES', 'TÉCNICO', true);

-- 14. Claudia Juliana Coronel Castro
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Claudia Juliana Coronel Castro', '1102351237', 'Productora', '300 7244579‬', 'julianitacoronel@gmail.com', 'Sanitas', 'Positiva', 'PRODUCTORES', 'TÉCNICO', true);

-- 15. Luis Fernando Solano Romero
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Luis Fernando Solano Romero', '⁠1019045934', 'Productor', '312 5079044', 'lsolano@rtvcnoticias.com ', 'Sura', 'Positiva', 'PRODUCTORES', 'TÉCNICO', true);

-- 16. Juan Carlos Boada Vargas
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Juan Carlos Boada Vargas', '74302504', 'Productor', '310 2844546', 'juancarlosboadavargas@gmail.com', 'Nueva EPS', 'Positiva', 'PRODUCTORES', 'TÉCNICO', true);

-- 17. Zulma Sored Rodríguez Aguilar
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Zulma Sored Rodríguez Aguilar', '52100088', 'Productora Cultura y Tendencias', '300 6882670', 'zulmasored84@yahoo.es', 'Famisanar', 'Positiva', 'PRODUCTORES', 'TÉCNICO', true);

-- 18. Manuel Fernando García Arevalo
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Manuel Fernando García Arevalo', '79958915', 'Productor', '310 3259286', 'mfga24@gmail.com', 'Capital Salud', 'Positiva', 'PRODUCTORES', 'TÉCNICO', true);

-- 19. Nicolle Díaz
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Nicolle Díaz', '1007535232', 'Asistente de Producción', '316 2443001', 'nicolleromero2908@gmail.com', 'Sanitas', 'Positiva', 'ASISTENTES DE PRODUCCIÓN', 'TÉCNICO', true);

-- 20. Johan Sebastián Arango
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Johan Sebastián Arango', '1000588646', 'Asistente de Producción', '301 6555857', 'arangosoy@gmail.com', 'Famisanar', 'Positiva', 'ASISTENTES DE PRODUCCIÓN', 'TÉCNICO', true);

-- 21. Valentina María Vélez Gallego
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Valentina María Vélez Gallego', '1007529907', 'Asistente de Producción', '310 2685723', 'valentinam.velez2002@gmail.com', 'Sanitas', 'Positiva', 'ASISTENTES DE PRODUCCIÓN', 'TÉCNICO', true);

-- 22. Ángela Cabezas
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Ángela Cabezas', '1007749879', 'Asistente de Producción', '319 5103161', 'acabezas@contratista.rtvc.gov.co', 'Famisanar', 'Positiva', 'ASISTENTES DE PRODUCCIÓN', 'TÉCNICO', true);

-- 23. Maria Camila Carvajal
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Maria Camila Carvajal', '1144090499', 'Asistente de Producción', '316 6910616‬', 'mcarvajal@contratista.rtvc.gov.co', 'Salud Total', 'Positiva', 'ASISTENTES DE PRODUCCIÓN', 'TÉCNICO', true);

-- 24. Sara Valentina Daza Martínez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Sara Valentina Daza Martínez', '1031802345', 'Asistente de Producción', '‪320 6376186‬', 'dazasaravalentina25@gmail.com', 'Dusakawi EPS', 'Positiva', 'ASISTENTES DE PRODUCCIÓN', 'TÉCNICO', true);

-- 25. Juana Mercedes Ullune Ullune
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Juana Mercedes Ullune Ullune', '1193151936', 'Asistente de Producción', '320 4030704', 'jullune@contratista.rtvc.gov.co', 'EPS Mallamas', 'Positiva', 'ASISTENTES DE PRODUCCIÓN', 'TÉCNICO', true);

-- 26. Nelson Alejandro La Torre Villalba
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Nelson Alejandro La Torre Villalba', '1030541665', 'Director de Cámaras', '312 3499710', 'antelatorre@gmail.com', 'Sanitas', 'Positiva', 'DIRECTORES DE CÁMARA', 'TÉCNICO', true);

-- 27. Andrés Fernando Patiño Bolaños
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Andrés Fernando Patiño Bolaños', '76325092', 'Director de Cámaras', '320 2727912', 'afpatinob@gmail.com	', 'Sanitas', 'Positiva', 'DIRECTORES DE CÁMARA', 'TÉCNICO', true);

-- 28. Iván Camilo Hernández Cárdenas
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Iván Camilo Hernández Cárdenas', '1014216051', 'Director de Cámaras', '322 4561293', 'iva12her@gmail.com', 'Compensar', 'Positiva', 'DIRECTORES DE CÁMARA', 'TÉCNICO', true);

-- 29. Diego Felipe Gamboa Heredia
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Diego Felipe Gamboa Heredia', '1020723785', 'Director de Cámaras', '3003114148', 'diegofelipegh@hotmail.com', 'Salud Total', 'Positiva', 'DIRECTORES DE CÁMARA', 'TÉCNICO', true);

-- 30. Eduardo Contreras Ardila
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Eduardo Contreras Ardila', '80491010', 'Director de Cámaras', '311 2918366', 'concreatividad1@gmail.com', 'Sanitas', 'Positiva', 'DIRECTORES DE CÁMARA', 'TÉCNICO', true);

-- 31. Julián Andrés Jiménez Galeano
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Julián Andrés Jiménez Galeano', '80032462', 'Director de Cámaras', '311 2918366', 'concreatividad1@gmail.com', 'Sanitas', 'Positiva', 'DIRECTORES DE CÁMARA', 'TÉCNICO', true);

-- 32. William Hernán Aldana
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('William Hernán Aldana', '79632673', 'Operador de VTR', '311 4548378', 'wialba107@gmail.com', 'Compensar', 'Positiva', 'OPERADORES DE VTR', 'TÉCNICO', true);

-- 33. Alfredo Martínez Álvarez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Alfredo Martínez Álvarez', '79967414', 'Operador de VTR', '305 7712672', 'alfredomendezalvarez@hotmail.es ', 'Sura', 'Positiva', 'OPERADORES DE VTR', 'TÉCNICO', true);

-- 34. David Alejandro Córdoba 
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('David Alejandro Córdoba ', '80737131', 'Operador de VTR', '323 2300138', 'dalcor28@gmail.com', 'Sanitas', 'Positiva', 'OPERADORES DE VTR', 'TÉCNICO', true);

-- 35. Johan Henry Villarraga Villarraga
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Johan Henry Villarraga Villarraga', '80225345', 'Operador de VTR', '304 5610093', 'jhvv1979@hotmail.com', 'Sanitas', 'Positiva', 'OPERADORES DE VTR', 'TÉCNICO', true);

-- 36. Sofía Fajardo Durán
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Sofía Fajardo Durán', '1000272882', 'Operador de VMIX', '316 4921018', 'sofifajardodu@gmail.com', 'Sanitas', 'Positiva', 'OPERADORES DE VMIX', 'TÉCNICO', true);

-- 37. Vanessa Paola Castañeda Jiménez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Vanessa Paola Castañeda Jiménez', '1000326191', 'Operador de VMIX', '322 4745568‬', 'vanessacj54@gmail.com ', 'Salud Total', 'Positiva', 'OPERADORES DE VMIX', 'TÉCNICO', true);

-- 38. Leidy Tatiana Salazar Forero
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Leidy Tatiana Salazar Forero', '1000213291', 'Operador de Pantallas', '‪322 4048003‬', ' leidysalazar428@gmail.com', 'Compensar', 'Positiva', 'OPERADORES DE PANTALLAS', 'TÉCNICO', true);

-- 39. Paola Lisseth Borrero Castro
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Paola Lisseth Borrero Castro', '1015421918', 'Operador de Pantallas', '313 4441218', 'jeshualis@hotmail.com', 'Sanitas', 'Positiva', 'OPERADORES DE PANTALLAS', 'TÉCNICO', true);

-- 40. Dary Alejandra Segura Camero
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Dary Alejandra Segura Camero', '1000604605', 'Operador de Pantallas', '319 5344477‬', 'darysegura373@gmail.com', 'Salud Total', 'Positiva', 'OPERADORES DE PANTALLAS', 'TÉCNICO', true);

-- 41. María Claudia Suárez Sánchez 
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('María Claudia Suárez Sánchez ', '1033729810', 'Generadores de Caracteres', '314 4573688', 'mariasuarez9012@hotmail.com', 'Compensar', 'Positiva', 'GENERADORES DE CARACTERES', 'TÉCNICO', true);

-- 42. Diana Cristina Ospina Forero
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Diana Cristina Ospina Forero', '1014179837', 'Generadores de Caracteres', '312 5075288', 'dianis_cris@hotmail.com', 'Famisanar', 'Positiva', 'GENERADORES DE CARACTERES', 'TÉCNICO', true);

-- 43. María José Escobar Laverde
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('María José Escobar Laverde', '1010120083', 'Generadores de Caracteres', '300 4674496', 'mariaescobar1711@hotmail.com', 'Compensar', 'Positiva', 'GENERADORES DE CARACTERES', 'TÉCNICO', true);

-- 44. Santiago Ortiz Buitrago
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Santiago Ortiz Buitrago', '79723165', 'Generadores de Caracteres', '310 7892245', 'santtior@gmail.com', 'Compensar', 'Positiva', 'GENERADORES DE CARACTERES', 'TÉCNICO', true);

-- 45. Edwin Santiago Rico Durán
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Edwin Santiago Rico Durán', '1023931274', 'Generadores de Caracteres', '300 8928973', 'santiagorico1994@gmail.com', 'Compensar', 'Positiva', 'GENERADORES DE CARACTERES', 'TÉCNICO', true);

-- 46. Dayana Paola Rodríguez Torres
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Dayana Paola Rodríguez Torres', '1016013623', 'Generadores de Caracteres', '314 4651966', 'paola357@hotmail.com ', 'Sanitas', 'Positiva', 'GENERADORES DE CARACTERES', 'TÉCNICO', true);

-- 47. Huber Arturo Salazar Álvarez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Huber Arturo Salazar Álvarez', '80051442', 'Operador Consola de Sonido', '3108601024', 'huber1711@hotmail.com', 'Compensar', 'Positiva', 'OPERADORES CONSOLA DE SONIDO', 'TÉCNICO', true);

-- 48. Óscar Alejandro Bernal Zea
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Óscar Alejandro Bernal Zea', '1023957763', 'Operador Consola de Sonido', '316 4748529', 'alejitozea2014@gmail.com', 'Famisanar', 'Positiva', 'OPERADORES CONSOLA DE SONIDO', 'TÉCNICO', true);

-- 49. Jhon Jairo Valencia Zapata
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Jhon Jairo Valencia Zapata', '94417344', 'Operador Consola de Sonido', '313 2815936', 'negrojhon32@gmail.com', 'Sura', 'Positiva', 'OPERADORES CONSOLA DE SONIDO', 'TÉCNICO', true);

-- 50. Wilmar Andrés Matiz Rodas 
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Wilmar Andrés Matiz Rodas ', '7731960', 'Operador Consola de Sonido', '316 3322566', 'marwil767@gmail.com', 'Sanitas', 'Positiva', 'OPERADORES CONSOLA DE SONIDO', 'TÉCNICO', true);

-- 51. Harold Borrero Herrán
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Harold Borrero Herrán', '79967648', 'Operador Consola de Sonido', '301 2336955', 'hfarold@gmail.com ', 'Compensar', 'Positiva', 'OPERADORES CONSOLA DE SONIDO', 'TÉCNICO', true);

-- 52. Lenin Gutiérrez Guerrero
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Lenin Gutiérrez Guerrero', '80066966', 'Operador Consola de Sonido', '314 4122387', 'leningutierrezg@gmail.com', 'Compensar', 'Positiva', 'OPERADORES CONSOLA DE SONIDO', 'TÉCNICO', true);

-- 53. Wilson Alejandro Cano Gómez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Wilson Alejandro Cano Gómez', '80912133', 'Asistentes de Sonido', '315 3043037', 'canogomez12@gmail.com', 'Compensar', 'Positiva', 'ASISTENTES DE SONIDO', 'TÉCNICO', true);

-- 54. Jimmy Alberto Estupiñán Molano
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Jimmy Alberto Estupiñán Molano', '1061752472', 'Asistentes de Sonido', '320 2498067', 'jimmy16_@hotmail.com', 'Sanitas', 'Positiva', 'ASISTENTES DE SONIDO', 'TÉCNICO', true);

-- 55. Diana Marcela Vélez Garzón
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Diana Marcela Vélez Garzón', '52731633', 'Asistentes de Sonido', '321 3179894', 'marcev82@hotmail.com', 'Sanitas', 'Positiva', 'ASISTENTES DE SONIDO', 'TÉCNICO', true);

-- 56. Luis Gustavo Fonseca Rodríguez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Luis Gustavo Fonseca Rodríguez', '19370472', 'Asistentes de Sonido', '312 3405148', 'luisfonseca1@outlook.com', 'Famisanar', 'Positiva', 'ASISTENTES DE SONIDO', 'TÉCNICO', true);

-- 57. Jaime Rueda Pedraza
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Jaime Rueda Pedraza', '79301300', 'Asistentes de Sonido', '3204234898', 'jrueda.sound.tv@live.com', 'Sanitas', 'Positiva', 'ASISTENTES DE SONIDO', 'TÉCNICO', true);

-- 58. Lina Paola Rodríguez López
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Lina Paola Rodríguez López', '1029141951', 'Operador de Prompter', '319 7927190', 'rodriguezlinapaola26@gmail.com', 'Sanitas', 'Positiva', 'OPERADORES DE PROMPTER', 'TÉCNICO', true);

-- 59. Helbert Duván Díaz García
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Helbert Duván Díaz García', '1032468488', 'Operador de Prompter', '319 4340278', 'duvan_126@hotmail.com', 'Sanitas', 'Positiva', 'OPERADORES DE PROMPTER', 'TÉCNICO', true);

-- 60. Katherine Montoya González
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Katherine Montoya González', '1022378612', 'Operador de Prompter', '321 4405823', 'ana_kathe@hotmail.com', 'Sura', 'Positiva', 'OPERADORES DE PROMPTER', 'TÉCNICO', true);

-- 61. Kevin Alejandro Lerma Molano
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Kevin Alejandro Lerma Molano', '1030690279', 'Operador de Prompter', '322 7960612', 'kalerma88@gmail.com', 'Salud Total', 'Positiva', 'OPERADORES DE PROMPTER', 'TÉCNICO', true);

-- 62. Pedro Pablo Niño Martín
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Pedro Pablo Niño Martín', '80365274', 'Camarógrafo de Estudio', '310 6962437', 'pnino66@hotmail.com', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 63. Luis Miguel Bernal
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Luis Miguel Bernal', '1023870289', 'Camarógrafo de Estudio', '310 6098326', 'luismiguelbernal@yahoo.es', 'AlianSalud', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 64. Raúl Alfonso Ramírez Rodríguez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Raúl Alfonso Ramírez Rodríguez', '79296786', 'Camarógrafo de Estudio', '319 2590854', 'raulalfonsoramirez1@gmail.com', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 65. Samuel David Romero Araque
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Samuel David Romero Araque', '80741264', 'Camarógrafo de Estudio', '(407) 928-2581', 'samrom.dr@gmail.com', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 66. Óscar Javier González Mahecha
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Óscar Javier González Mahecha', '1018415465', 'Camarógrafo de Estudio', '315 6537916', 'oskarjavicamaro@gmail.com', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 67. Jorge Humberto Jaramillo Ríos
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Jorge Humberto Jaramillo Ríos', '79303190', 'Camarógrafo de Estudio', '311 2762535', 'millo1969@hotmail.com ', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 68. Juan Carlos Sacristán Ramírez 
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Juan Carlos Sacristán Ramírez ', '79871683', 'Camarógrafo de Estudio', '322 2039447', 'doralejuan1576@gmail.com', 'Salud Total', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 69. Jefferson Iván Pérez González
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Jefferson Iván Pérez González', '1010180824', 'Camarógrafo de Estudio', '313 8920302', 'jeivpego@hotmail.com', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 70. John Freddy Jiménez Rodríguez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('John Freddy Jiménez Rodríguez', '80763915', 'Camarógrafo de Estudio', '318 2899743', 'johnfredjiro@hotmail.com', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 71. Brallare Alexander Quiñones Prado
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Brallare Alexander Quiñones Prado', '1013616046', 'Camarógrafo de Estudio', '312 5015725', 'yayan1002@gmail.com', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 72. Sebastián Hernández Morales
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Sebastián Hernández Morales', '1026278335', 'Camarógrafo de Estudio', '300 3663927', 'herna9214@hotmail.com ', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 73. Carlos Alberto López Rodríguez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Carlos Alberto López Rodríguez', '79969650', 'Camarógrafo de Estudio', '300 6342465', 'carloslopeztv78@gmail.com', 'Famisanar', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 74. César Alberto Jiménez Niño
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('César Alberto Jiménez Niño', '80372993', 'Camarógrafo de Estudio', '(+1) 4033605284', 'albertojimenez_8@hotmail.com', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 75. Ángel Gustavo Zapata Ferro
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Ángel Gustavo Zapata Ferro', '19370198', 'Camarógrafo de Estudio', '316 7844677', 'gustavozapataferro1@gmail.com', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 76. John Alexander Loaiza López
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('John Alexander Loaiza López', '80125374', 'Camarógrafo de Estudio', '312 3754741', 'johnalexanderloaiza67@gmail.com', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 77. Jairo Ernesto Corchuelo Sarmiento
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Jairo Ernesto Corchuelo Sarmiento', '11427061', 'Camarógrafo de Estudio', '312 5283506', 'andala.12@hotmail.com', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 78. Carlos Andrés López Muñoz
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Carlos Andrés López Muñoz', '79811201', 'Camarógrafo de Estudio', '322 2445778', 'andjolop@gmail.com', 'Salud Total', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 79. Carlos Ernesto García Agudelo
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Carlos Ernesto García Agudelo', '80372069', 'Camarógrafo de Estudio', '314 5877358', 'cega7119@gmail.com', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 80. John Daminston Arevalo Mora
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('John Daminston Arevalo Mora', '79836879', 'Camarógrafo de Estudio', '310 6083387', 'damiston07@yahoo.es', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE ESTUDIO', 'TÉCNICO', true);

-- 81. Diego González Ferreira
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Diego González Ferreira', '1033685852', 'Asistente de Estudio', '311 2391706', 'diego_2391706@hotmail.com', 'Sanitas', 'Positiva', 'ASISTENTE DE ESTUDIO', 'TÉCNICO', true);

-- 82. Julio César Vega Casteo
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Julio César Vega Casteo', '79055672', 'Asistente de Estudio', '320 4845399', 'santaferiver@hotmail.com', 'Compensar', 'Positiva', 'ASISTENTE DE ESTUDIO', 'TÉCNICO', true);

-- 83. Rodolfo Saldaña Guayara
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Rodolfo Saldaña Guayara', '79646966', 'Asistente de Estudio', '320 4126522', 'rodolfoguayara321@gmail.com', 'Sura', 'Positiva', 'ASISTENTE DE ESTUDIO', 'TÉCNICO', true);

-- 84. José Ángel Peña Martínez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('José Ángel Peña Martínez', '93406957', 'Asistente de Estudio', '311 5219365', 'japena72@hotmail.com', 'Salud Total', 'Positiva', 'ASISTENTE DE ESTUDIO', 'TÉCNICO', true);

-- 85. Alejandra Cetina Contreras 
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Alejandra Cetina Contreras ', '1101179441', 'Coordinadora Corresponsales - Medio Día', '320 3443026', 'andreacetinacontreras@gmail.com', 'Sanitas', 'Positiva', 'COORDINADORES', 'TÉCNICO', true);

-- 86.  Geraldine Julieth Olaya Heano
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES (' Geraldine Julieth Olaya Heano', '1070013609', 'Coordinadora Regiones - Calentao', '310 2866281', 'geralolaya@gmail.com', 'Sanitas', 'Positiva', 'COORDINADORES', 'TÉCNICO', true);

-- 87. Jonathan Mauricio Contreras Contento
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Jonathan Mauricio Contreras Contento', '1233492752', 'Coordinador de Estudio', '321 3461805', 'jonathancontreras1233@gmail.com', 'Nueva EPS', 'Positiva', 'COORDINADORES', 'TÉCNICO', true);

-- 88. Jacson Camilio Urrego
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Jacson Camilio Urrego', '80722280', 'Asistentes de Escenografía', '310 2254315', 'jacsonurrego24@hotmail.com', 'Sanitas', 'Positiva', 'ASISTENTES DE ESCENOGRAFÍA', 'TÉCNICO', true);

-- 89. Néstor Hernan Peña Melendez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Néstor Hernan Peña Melendez', '7301031', 'Asistentes de Escenografía', '313 3451478', 'nestorhernan56@hotmail.com', 'Nueva EPS', 'Positiva', 'ASISTENTES DE ESCENOGRAFÍA', 'TÉCNICO', true);

-- 90. Jhon Aristides Forero Silva
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Jhon Aristides Forero Silva', '11235900', 'Asistentes de Escenografía', '322 2771949', 'jhonfsofia2@gmail.com ', 'Compensar', 'Positiva', 'ASISTENTES DE ESCENOGRAFÍA', 'TÉCNICO', true);

-- 91. Joaquín Alonso Luna Alfonso
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Joaquín Alonso Luna Alfonso', '91433539', 'Escenógrafo', '319 7100708', 'eggoproduccion@gmail.com', 'Salud Total', 'Positiva', 'ASISTENTES DE ESCENOGRAFÍA', 'TÉCNICO', true);

-- 92. Julio Édgar López
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Julio Édgar López', '3019465', 'Asistente de Luces', '310 2489761', 'julioedgar.lopez@gmail.com', 'Nueva EPS', 'Positiva', 'ASISTENTES DE LUCES', 'TÉCNICO', true);

-- 93. Jonathan Andrés Ramírez Sepulveda
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Jonathan Andrés Ramírez Sepulveda', '1121866160', 'Asistente de Luces', '3237710542', 'garetoched@gmail.com	', 'Famisanar', 'Positiva', 'ASISTENTES DE LUCES', 'TÉCNICO', true);

-- 94. Daniel Pinilla Calderón
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Daniel Pinilla Calderón', '1019148391', 'Asistente de Luces', '3219743661', 'daniel_pinilla@hotmail.com', 'AlianSalud', 'Positiva', 'ASISTENTES DE LUCES', 'TÉCNICO', true);

-- 95. Javier Manuel Galeano Daza
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Javier Manuel Galeano Daza', '80063104', 'Asistente de Luces', '314 2847098', 'jaivermgaleano@gmail.com', 'Sanitas', 'Positiva', 'ASISTENTES DE LUCES', 'TÉCNICO', true);

-- 96. Emmanuel Santiago Espinosa Wilches
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Emmanuel Santiago Espinosa Wilches', '1030650975', 'Asistente de Luces', '311 8563378', 'esewilches@hotmail.com ', 'Compensar', 'Positiva', 'ASISTENTES DE LUCES', 'TÉCNICO', true);

-- 97. Iván Eduardo Aristizábal Olarte
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Iván Eduardo Aristizábal Olarte', '80122215', 'Operador de Video', '312 5404387', 'imagenivan@gmail.com', 'Sanitas', 'Positiva', 'OPERADORES DE VIDEO', 'TÉCNICO', true);

-- 98. José Leonardo Castro Rojas
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('José Leonardo Castro Rojas', '80244421', 'Operador de Video', '316 7471729', 'leocactus2@gmail.com', 'Compensar', 'Positiva', 'OPERADORES DE VIDEO', 'TÉCNICO', true);

-- 99. Horacio Andrés Suárez Reyes
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Horacio Andrés Suárez Reyes', '80018825', 'Operador de Video', '315 4869449', 'suarezreyes@hotmail.com ', 'Compensar', 'Positiva', 'OPERADORES DE VIDEO', 'TÉCNICO', true);

-- 100. Pedro Pablo Torres Torres
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Pedro Pablo Torres Torres', '79525503', 'Operador de Video', '313 8844376', 'kefatt2@hotmail.com', 'Compensar', 'Positiva', 'OPERADORES DE VIDEO', 'TÉCNICO', true);

-- 101. Maria Angélica Rodríguez Gómez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Maria Angélica Rodríguez Gómez', '1000732797', 'Contribuciones', '312 4710079', 'ma.angelicarodriguezg@gmai.com', 'Sanitas', 'Positiva', 'CONTRIBUCIONES', 'TÉCNICO', true);

-- 102. Diana Carolina Benavides García 
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Diana Carolina Benavides García ', '53105453', 'Contribuciones', '‪313 4217091‬', 'djblondiek@hotmail.com', 'Sanitas', 'Positiva', 'CONTRIBUCIONES', 'TÉCNICO', true);

-- 103. Michel Enrique Torres Urrego
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Michel Enrique Torres Urrego', '80872971', 'Contribuciones', '319 2695045', 'michael20.torres@hotmail.com', 'Famisanar', 'Positiva', 'CONTRIBUCIONES', 'TÉCNICO', true);

-- 104. Daniel Yesid Cabra Zamora
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Daniel Yesid Cabra Zamora', '1016093551', 'Contribuciones', '3197281708', 'zamora2123@outlook.es', 'Salud Total', 'Positiva', 'CONTRIBUCIONES', 'TÉCNICO', true);

-- 105. Sergio Adrián Contreras Narváez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Sergio Adrián Contreras Narváez', '1010203533', 'Contribuciones', '350 3402935', 'sergiocn92@gmail.com', 'Compensar', 'Positiva', 'CONTRIBUCIONES', 'TÉCNICO', true);

-- 106. Álvaro Leonardo Díaz
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Álvaro Leonardo Díaz', '80234179', 'Camarógrafo de Reportería', '320 2695175', 'leonardo8022@hotmail.com', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 107. Víctor Alfonso Vargas Tuta
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Víctor Alfonso Vargas Tuta', '1014178429', 'Camarógrafo de Reportería', '318 2200948', 'victor.tuta@hotmail.com', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 108. Erick Giovanny Velásquez Barragán
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Erick Giovanny Velásquez Barragán', '80148073', 'Camarógrafo de Reportería', '305 3985138', 'ergiveba@hotmail.com ', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 109. Andrés Ramírez Torres
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Andrés Ramírez Torres', '79052536', 'Camarógrafo de Reportería', '‪302 4495054‬', 'trandres1967@gmail.com ', 'Famisanar', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 110. Édgar Alberto Castillo Sarmiento
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Édgar Alberto Castillo Sarmiento', '79363260', 'Camarógrafo de Reportería', '‪315 6179580‬', 'edcastillos190@gmail.com', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 111. Marco Tulio Solorzano
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Marco Tulio Solorzano', '79381870', 'Camarógrafo de Reportería', '320 8515001', 'marcotsolozano@hotmail.com ', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 112. José Ramiro Balaguera Pérez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('José Ramiro Balaguera Pérez', '2969753', 'Camarógrafo de Reportería', '350 2626435', 'simonr.j7@gmail.com ', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 113. Leonel Fernando Cifuentes Salinas
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Leonel Fernando Cifuentes Salinas', '1026262892', 'Camarógrafo de Reportería', '311 4698404', 'cifu_leo@hotmail.com', 'Sura', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 114. Didier Orlando Buitrago Moreno
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Didier Orlando Buitrago Moreno', '79831671', 'Camarógrafo de Reportería', '310 2282017', 'didor82@hotmail.com ', 'Famisanar', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 115. William José Ruiz Cabrera
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('William José Ruiz Cabrera', '79445239', 'Camarógrafo de Reportería', '313 8024275‬', 'w.ruizcamara68@gmail.com', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 116. Carlos Alfonso Wilches Garay
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Carlos Alfonso Wilches Garay', '79851161', 'Camarógrafo de Reportería', '‪310 6888812‬', 'cawg76@gmail.com', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 117. César Andrés Morales
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('César Andrés Morales', '79860772', 'Camarógrafo de Reportería', '310 5508527', 'ceanmobe@hotmail.com', 'Salud Total', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 118. Julián David Luna Huertas
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Julián David Luna Huertas', '1023881780', 'Camarógrafo de Reportería', '312 3065241', 'lunahuertas@hotmail.com ', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 119. Luis Enrique Muñoz Palacio
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Luis Enrique Muñoz Palacio', '79533940', 'Camarógrafo de Reportería', '‪300 4423890‬', 'enriko91@gmail.com', 'Compensar', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 120. William Fernando Uribe Cáceres
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('William Fernando Uribe Cáceres', '80192357', 'Camarógrafo de Reportería', '311 8545862', 'williamuribe6@gmail.com', 'Famisanar', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 121. John Herlendy Ruiz Buitrago
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('John Herlendy Ruiz Buitrago', '79694013', 'Camarógrafo de Reportería', '304 6366925', 'johnr013@hotmail.com', 'Salud Total', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 122. Floresmiro Luna Acosta
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Floresmiro Luna Acosta', '79415887', 'Camarógrafo de Reportería', '‪312 4006982‬', ' efeluna130@hotmail.com', 'Sanitas', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 123. Édgar Nieto Ramírez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Édgar Nieto Ramírez', '80017899', 'Camarógrafo de Reportería', '‪304 4552124‬', 'dpigornieto@gmail.com', 'Famisanar', 'Positiva', 'CAMARÓGRAFOS DE REPORTERÍA', 'TÉCNICO', true);

-- 124. David Eduardo Patarroyo Montañez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('David Eduardo Patarroyo Montañez', '79763229', 'Realizador', '‪301 6048095‬', 'dpaudiovisualesfilms@gmail.com', 'Famisanar', 'Positiva', 'REALIZADORES', 'TÉCNICO', true);

-- 125. Óscar David Ortega
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Óscar David Ortega', '1019090149', 'Realizador', '302 4870417', 'odoc.9090@gmail.com', 'Famisanar', 'Positiva', 'REALIZADORES', 'TÉCNICO', true);

-- 126. Guillermo Solarte Rosero
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Guillermo Solarte Rosero', '98397359', 'Realizador', '315 4494151', 'productortvcolombia@gmail.com ', 'Sanitas', 'Positiva', 'REALIZADORES', 'TÉCNICO', true);

-- 127. Wilmer Hernan Salamanca Alcala
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Wilmer Hernan Salamanca Alcala', '1033684074', 'Realizador', '311 4535184', 'wsalamancaa@gmail.com', 'Sanitas', 'Positiva', 'REALIZADORES', 'TÉCNICO', true);

-- 128. Laura Vargas Esteban
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Laura Vargas Esteban', '1019116878', 'Realizador', '‪300 2123766‬', 'lauraesteban2323@gmail.com', 'Compensar', 'Positiva', 'REALIZADORES', 'TÉCNICO', true);

-- 129. Alexander Valencia Martínez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Alexander Valencia Martínez', '80009312', 'Realizador', '3203446590', 'alexander.valencia79@gmail.com', 'Famisanar', 'Positiva', 'REALIZADORES', 'TÉCNICO', true);

-- 130. Santiago Torres Yaselaga
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Santiago Torres Yaselaga', '1000252752', 'Realizador', '302 4870417', 'santi.torres.yaselga@gmail.com', 'Famisanar', 'Positiva', 'REALIZADORES', 'TÉCNICO', true);

-- 131. Manuel de Jesús Díaz Polo 
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Manuel de Jesús Díaz Polo ', '1047399742', 'Realizador', '313 4542472', 'manueldiaz0611@gmail.com', 'Sura        ', 'Positiva', 'REALIZADORES', 'TÉCNICO', true);

-- 132. Walter Rodrigo Murillo Salgado
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Walter Rodrigo Murillo Salgado', '79538391', 'Asistentes de Reportería', '320 2952396', 'wmurillosalgado@gmail.com', 'Sanitas', 'Positiva', 'ASISTENTES DE REPORTERÍA', 'TÉCNICO', true);

-- 133. Bryan Jesús Rodríguez Franco
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Bryan Jesús Rodríguez Franco', '1032509490', 'Asistentes de Reportería', '‪312 5687732‬', 'bryanrodrig544@gmail.com ', 'Sura', 'Positiva', 'ASISTENTES DE REPORTERÍA', 'TÉCNICO', true);

-- 134. Bryan Stiven Munera Ramos
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Bryan Stiven Munera Ramos', '1141714858', 'Asistentes de Reportería', '3213892061', 'bryan.munerall@gmail.com', 'Compensar', 'Positiva', 'ASISTENTES DE REPORTERÍA', 'TÉCNICO', true);

-- 135. Pablo Hernando Preciado Dueñas
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Pablo Hernando Preciado Dueñas', '79614490', 'Asistentes de Reportería', '314 4616426', 'pablopreciado_@hotmail.com', 'Sanitas', 'Positiva', 'ASISTENTES DE REPORTERÍA', 'TÉCNICO', true);

-- 136. Richard Sneyder Beltrán Corredor
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Richard Sneyder Beltrán Corredor', '1073674905', 'Asistentes de Reportería', '321 483283', 'richardsneybc@hotmail.com', 'Compensar', 'Positiva', 'ASISTENTES DE REPORTERÍA', 'TÉCNICO', true);

-- 137. Johan Daniel Moreno Pereira
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Johan Daniel Moreno Pereira', '1019016030', 'Asistentes de Reportería', '311 2117045', 'danielcineytv@hotmail.com ', 'Salud Total', 'Positiva', 'ASISTENTES DE REPORTERÍA', 'TÉCNICO', true);

-- 138. José Guillermo Mesa Galindo
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('José Guillermo Mesa Galindo', '79418464', 'Asistentes de Reportería', '323 8033054', 'mesa24103@gmail.com', 'Compensar', 'Positiva', 'ASISTENTES DE REPORTERÍA', 'TÉCNICO', true);

-- 139. Mercedes Malagón Prieto
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Mercedes Malagón Prieto', '39797435', 'Vestuario', '313 3710571', 'mercedes.malagon12@gmail.com', 'Sanitas', 'Positiva', 'VESTUARIO', 'TÉCNICO', true);

-- 140. Dora Rincón León
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Dora Rincón León', '1056553401', 'Vestuario', '312 3510423', 'rinconleondoraidaly@gmail.com', 'Famisanar', 'Positiva', 'VESTUARIO', 'TÉCNICO', true);

-- 141. Mariluz Beltrán Beltrán
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Mariluz Beltrán Beltrán', '39529893', 'Vestuario', '3115046657', 'maryluzbeltranbeltran@gmail.com ', 'Compensar', 'Positiva', 'VESTUARIO', 'TÉCNICO', true);

-- 142. Carlos Andrés Acosta Jiménez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Carlos Andrés Acosta Jiménez', '1069486308', 'Vestuario', '304 6785914', 'carlosacostaaj@gmail.com', 'Compensar', 'Positiva', 'VESTUARIO', 'TÉCNICO', true);

COMMIT;

-- ============================================================
-- RESUMEN:
-- - Actualizaciones: 8 personas
-- - Inserciones: 142 personas
-- ============================================================