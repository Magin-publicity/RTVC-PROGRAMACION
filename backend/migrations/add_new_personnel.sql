-- Agregar personal nuevo desde Excel
-- Total: 67 personas

BEGIN;

-- William Eduardo Parra Jaimes (TÉCNICO)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('William Eduardo Parra Jaimes', '79307835', 'Director Noticias RTVC', '323 2830866', 'wparrareporterodelsur@gmail.com', 'Sanitas', 'Positiva', 17000000, '2026-07-28', 'DIRECCIÓN', 'LOGISTICO', true);

-- Claudia Emilia Bedoya Madrid (EDITORES INFORMATIVOS)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Claudia Emilia Bedoya Madrid', '43043875', 'Editora Informativa', '300 2183613', 'claudiabedoyamadrid@hotmail.com', 'Sanitas', 'Positiva', 10000000, '2026-07-19', 'EDITORES INFORMATIVOS', 'LOGISTICO', true);

-- Dioda Aydee Gamboa Villate (EDITORES INFORMATIVOS)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Dioda Aydee Gamboa Villate', '52393716', 'Editora Informativa', '3156801159', 'aydeegambov@gmail.com', 'AlianSalud', 'Positiva', 7000000, '2026-07-19', 'EDITORES INFORMATIVOS', 'LOGISTICO', true);

-- Yanett Liliana Manzano Ojeda (EDITORES INFORMATIVOS)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Yanett Liliana Manzano Ojeda', '37322875', 'Editora Informativa', '311 5427929', 'yanismanzano@hotmail.com', 'Compensar', 'Positiva', 9280197, '2025-12-15', 'EDITORES INFORMATIVOS', 'LOGISTICO', true);

-- Éver Manuel Palomo Llorente (JEFES DE EMISIÓN)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Éver Manuel Palomo Llorente', '73144764', 'Jefe de Emisión - Medio Día', '317 5742145', 'everpalomoll@gmail.com', 'Capital Salud', 'Positiva', 11000000, '2026-04-22', 'JEFES DE EMISIÓN', 'LOGISTICO', true);

-- Pablo César Guevara Gómez (JEFES DE EMISIÓN)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Pablo César Guevara Gómez', '79859108', 'Jefe de Emisión - Última Edición', '310 3304069', 'pablocesarguevara@hotmail.com', 'Compensar', 'Positiva', 10500000, '2026-07-26', 'JEFES DE EMISIÓN', 'LOGISTICO', true);

-- Rober Alexander Vivas Montealegre (JEFES DE EMISIÓN)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Rober Alexander Vivas Montealegre', '88246917', 'Jefe de Emisión - Calentao', '300 2127998', 'rvivas@contratista.rtvc.gov.co', 'Sanitas', 'Positiva', 8800000, '2026-04-22', 'JEFES DE EMISIÓN', 'LOGISTICO', true);

-- Wilson Adrián Bonilla (JEFES DE EMISIÓN)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Wilson Adrián Bonilla', '79471331', 'Jefe de Emisión - Central', '3144691771', 'wbonilla468@gmail.com', 'Sura', 'Positiva', 9200000, '2026-04-26', 'JEFES DE EMISIÓN', 'LOGISTICO', true);

-- Alfonso Andrés Osorio Osuna (PRODUCTORES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Alfonso Andrés Osorio Osuna', '79779400', 'Productor General - Señal Colombia', '301 7868099', 'aosorio@contratista.rtvc.gov.co', 'Sanitas', 'Positiva', 12000000, '2026-04-12', 'PRODUCTORES', 'LOGISTICO', true);

-- Claudia Juliana Coronel Castro (PRODUCTORES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Claudia Juliana Coronel Castro', '1102351237', 'Productora', '3007244579', 'julianitacoronel@gmail.com', 'Sanitas', 'Positiva', 6077000, '2026-04-30', 'PRODUCTORES', 'LOGISTICO', true);

-- Manuel Fernando García Arevalo (PRODUCTORES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Manuel Fernando García Arevalo', '79958915', 'Productor', '310 3259286', 'mfga24@gmail.com', 'Capital Salud', 'Positiva', 5356000, '2026-06-23', 'PRODUCTORES', 'LOGISTICO', true);

-- Zulma Sored Rodríguez Aguilar (PRODUCTORES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Zulma Sored Rodríguez Aguilar', '52100088', 'Productora Cultura y Tendencias', '300 6882670', 'zulmasored84@yahoo.es', 'Famisanar', 'Positiva', 7000000, '2026-07-26', 'PRODUCTORES', 'LOGISTICO', true);

-- Johan Sebastián Arango Mesa (ASISTENTES DE PRODUCCIÓN)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Johan Sebastián Arango Mesa', '1000588646', 'Asistente de Producción', '301 6555857', 'arangosoy@gmail.com', 'Famisanar', 'Positiva', 4429000, '2026-06-15', 'ASISTENTES DE PRODUCCIÓN', 'LOGISTICO', true);

-- Maria Camila Carvajal Trujillo (ASISTENTES DE PRODUCCIÓN)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Maria Camila Carvajal Trujillo', '1144090499', 'Asistente de Producción', '3166910616', 'mcarvajal@contratista.rtvc.gov.co', 'Salud Total', 'Positiva', 6102750, '2026-06-26', 'ASISTENTES DE PRODUCCIÓN', 'LOGISTICO', true);

-- Iván Camilo Hernández Cárdenas (DIRECTORES DE CÁMARA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Iván Camilo Hernández Cárdenas', '1014216051', 'Director de Cámaras', '322 4561293', 'iva12her@gmail.com', 'Compensar', 'Positiva', 6900000, '2026-07-24', 'DIRECTORES DE CÁMARA', 'LOGISTICO', true);

-- Nelson Alejandro La Torre Villalba (DIRECTORES DE CÁMARA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Nelson Alejandro La Torre Villalba', '1030541665', 'Director de Cámaras', '312 3499710', 'antelatorre@gmail.com', 'Sanitas', 'Positiva', 6900000, '2026-05-30', 'DIRECTORES DE CÁMARA', 'LOGISTICO', true);

-- Johan Henry Villarraga Villarraga (OPERADORES DE VTR)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Johan Henry Villarraga Villarraga', '80225345', 'Operador de VTR', '304 5610093', 'jhvv1979@hotmail.com', 'Sanitas', 'Positiva', 4120000, '2026-06-30', 'VTR', 'LOGISTICO', true);

-- Vanessa Paola Castañeda Jiménez (OPERADORES DE VMIX)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Vanessa Paola Castañeda Jiménez', '1000326191', 'Operador de VMIX', '3224745568', 'vanessacj54@gmail.com', 'Salud Total', 'Positiva', 2884000, '2026-06-30', 'OPERADORES DE VMIX', 'LOGISTICO', true);

-- Edwin Santiago Rico Durán (GENERADORES DE CARACTERES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Edwin Santiago Rico Durán', '1023931274', 'Generadores de Caracteres', '300 8928973', 'santiagorico1994@gmail.com', 'Compensar', 'Positiva', 4377500, '2026-06-30', 'GENERADORES DE CARACTERES', 'LOGISTICO', true);

-- Harold Borrero Herrán (OPERADORES CONSOLA DE SONIDO)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Harold Borrero Herrán', '79967648', 'Operador Consola de Sonido', '301 2336955', 'hfarold@gmail.com', 'Compensar', 'Positiva', 4120000, '2026-07-26', 'OPERADORES DE SONIDO', 'LOGISTICO', true);

-- Jhon Jairo Valencia Zapata (OPERADORES CONSOLA DE SONIDO)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Jhon Jairo Valencia Zapata', '94417344', 'Operador Consola de Sonido', '313 2815936', 'negrojhon32@gmail.com', 'Sura', 'Positiva', 4120000, '2026-06-29', 'OPERADORES DE SONIDO', 'LOGISTICO', true);

-- Diana Marcela Vélez Garzón (ASISTENTES DE SONIDO)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Diana Marcela Vélez Garzón', '52731633', 'Asistentes de Sonido', '321 3179894', 'marcev82@hotmail.com', 'Sanitas', 'Positiva', 3000000, '2026-07-21', 'ASISTENTES DE SONIDO', 'LOGISTICO', true);

-- Helbert Duván Díaz García (OPERADORES DE PROMPTER)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Helbert Duván Díaz García', '1032468488', 'Operador de Prompter', '319 4340278', 'duvan_126@hotmail.com', 'Sanitas', 'Positiva', 2994262, '2026-06-23', 'OPERADORES DE PROMPTER', 'LOGISTICO', true);

-- Brallare Alexander Quiñones Prado (CAMARÓGRAFOS DE ESTUDIO)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Brallare Alexander Quiñones Prado', '1013616046', 'Camarógrafo de Estudio', '312 5015725', 'yayan1002@gmail.com', 'Sanitas', 'Positiva', 5150000, '2026-04-19', 'CAMARÓGRAFOS DE ESTUDIO', 'LOGISTICO', true);

-- Jairo Ernesto Corchuelo Sarmiento (CAMARÓGRAFOS DE ESTUDIO)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Jairo Ernesto Corchuelo Sarmiento', '11427061', 'Camarógrafo de Estudio', '312 5283506', 'andala.12@hotmail.com', 'Compensar', 'Positiva', 5150000, '2026-04-30', 'CAMARÓGRAFOS DE ESTUDIO', 'LOGISTICO', true);

-- Alejandra Cetina Contreras (COORDINADORES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Alejandra Cetina Contreras', '1101179441', 'Coordinadora Corresponsales - Medio Día', '320 3443026', 'andreacetinacontreras@gmail.com', 'Sanitas', 'Positiva', 11081721, NULL, 'COORDINADORES', 'LOGISTICO', true);

-- Geraldine Julieth Olaya Heano (COORDINADORES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Geraldine Julieth Olaya Heano', '1070013609', 'Coordinadora Regiones - Calentao', '310 2866281', 'geralolaya@gmail.com', 'Sanitas', 'Positiva', 6283333, '2026-07-30', 'COORDINADORES', 'LOGISTICO', true);

-- Jacson Camilio Urrego (ASISTENTES DE ESCENOGRAFÍA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Jacson Camilio Urrego', '80722280', 'Asistentes de Escenografía', '310 2254315', 'jacsonurrego24@hotmail.com', 'Sanitas', 'Positiva', 2884000, '2026-06-23', 'ESCENOGRAFÍA', 'LOGISTICO', true);

-- Jhon Aristides Forero Silva (ASISTENTES DE ESCENOGRAFÍA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Jhon Aristides Forero Silva', '11235900', 'Asistentes de Escenografía', '322 2771949', 'jhonfsofia2@gmail.com', 'Compensar', 'Positiva', 2987000, '2026-06-15', 'ESCENOGRAFÍA', 'LOGISTICO', true);

-- Emmanuel Santiago Espinosa Wilches (ASISTENTES DE LUCES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Emmanuel Santiago Espinosa Wilches', '1030650975', 'Asistente de Luces', '311 8563378', 'esewilches@hotmail.com', 'Compensar', 'Positiva', 4120000, '2026-04-22', 'ASISTENTES DE LUCES', 'LOGISTICO', true);

-- Javier Manuel Galeano Daza (ASISTENTES DE LUCES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Javier Manuel Galeano Daza', '80063104', 'Asistente de Luces', '314 2847098', 'jaivermgaleano@gmail.com', 'Sanitas', 'Positiva', 3502000, '2026-04-29', 'ASISTENTES DE LUCES', 'LOGISTICO', true);

-- Jonathan Andrés Ramírez Sepulveda (ASISTENTES DE LUCES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Jonathan Andrés Ramírez Sepulveda', '1121866160', 'Asistente de Luces', '3237710542', 'garetoched@gmail.com', 'Famisanar', 'Positiva', 2884000, '2026-06-26', 'ASISTENTES DE LUCES', 'LOGISTICO', true);

-- José Leonardo Castro Rojas (OPERADORES DE VIDEO)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('José Leonardo Castro Rojas', '80244421', 'Operador de Video', '316 7471729', 'leocactus2@gmail.com', 'Compensar', 'Positiva', 4250000, '2026-06-26', 'OPERADORES DE VIDEO', 'LOGISTICO', true);

-- Diana Carolina Benavides García (CONTRIBUCIONES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Diana Carolina Benavides García', '53105453', 'Contribuciones', '3134217091', 'djblondiek@hotmail.com', 'Sanitas', 'Positiva', 4400000, NULL, 'CONTRIBUCIONES', 'LOGISTICO', true);

-- Maria Angélica Rodríguez Gómez (CONTRIBUCIONES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Maria Angélica Rodríguez Gómez', '1000732797', 'Contribuciones', '312 4710079', 'ma.angelicarodriguezg@gmai.com', 'Sanitas', 'Positiva', 2571621, '2026-07-27', 'CONTRIBUCIONES', 'LOGISTICO', true);

-- Michel Enrique Torres Urrego (CONTRIBUCIONES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Michel Enrique Torres Urrego', '80872971', 'Contribuciones', '319 2695045', 'michael20.torres@hotmail.com', 'Famisanar', 'Positiva', 4472000, '2026-06-24', 'CONTRIBUCIONES', 'LOGISTICO', true);

-- Sergio Adrián Contreras Narváez (CONTRIBUCIONES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Sergio Adrián Contreras Narváez', '1010203533', 'Contribuciones', '350 3402935', 'sergiocn92@gmail.com', 'Compensar', 'Positiva', 4472000, '2026-06-24', 'CONTRIBUCIONES', 'LOGISTICO', true);

-- José Ramiro Balaguera Pérez (CAMARÓGRAFOS DE REPORTERÍA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('José Ramiro Balaguera Pérez', '2969753', 'Camarógrafo de Reportería', '350 2626435', 'simonr.j7@gmail.com', 'Sanitas', 'Positiva', 5150000, NULL, 'CAMARÓGRAFOS DE REPORTERÍA', 'LOGISTICO', true);

-- Luis Enrique Muñoz Palacio (CAMARÓGRAFOS DE REPORTERÍA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Luis Enrique Muñoz Palacio', '79533940', 'Camarógrafo de Reportería', '3004423890', 'enriko91@gmail.com', 'Compensar', 'Positiva', 5150000, '2026-06-30', 'CAMARÓGRAFOS DE REPORTERÍA', 'LOGISTICO', true);

-- Bryan Jesús Rodríguez Franco (ASISTENTES DE REPORTERÍA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Bryan Jesús Rodríguez Franco', '1032509490', 'Asistentes de Reportería', '3125687732', 'bryanrodrig544@gmail.com', 'Sura', 'Positiva', 2884000, '2026-06-26', 'ASISTENTES DE REPORTERÍA', 'LOGISTICO', true);

-- Bryan Stiven Munera Ramos (ASISTENTES DE REPORTERÍA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Bryan Stiven Munera Ramos', '1141714858', 'Asistentes de Reportería', '3213892061', 'bryan.munerall@gmail.com', 'Compensar', 'Positiva', 2884000, '2026-06-21', 'ASISTENTES DE REPORTERÍA', 'LOGISTICO', true);

-- Mireya Catalina Acevedo (MAQUILLAJE)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Mireya Catalina Acevedo', '39679825', 'Maquillaje', '313 8696554', 'cata.acevedo52@gmail.com', 'Famisanar', 'Positiva', 4429000, '2026-07-26', 'MAQUILLAJE', 'LOGISTICO', true);

-- María Alexandra Marín (Alexa Rochi) (PERIODISTAS)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('María Alexandra Marín (Alexa Rochi)', '1114059268', 'Periodista', '321 7711276', 'alexarochi14@gmail.com', 'Nueva EPS', 'Positiva', 7603053, NULL, 'PERIODISTAS', 'LOGISTICO', true);

-- Linda Carolay Morales Pérez (PERIODISTAS)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Linda Carolay Morales Pérez', '53049601', 'Periodista', '311 2692106', 'caromorales85@gmail.com', 'Famisanar', 'Positiva', 7500000, NULL, 'PERIODISTAS', 'LOGISTICO', true);

-- Sandy Patricia Almeida Del Toro (PERIODISTAS)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Sandy Patricia Almeida Del Toro', '1082931352', 'Presentadora', '301 2318837', 'sandyalmeida19@gmail.com', 'Salud Total', 'Positiva', 12000000, NULL, 'PERIODISTAS', 'LOGISTICO', true);

-- Miguel Andrés Daza González (PERIODISTAS)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Miguel Andrés Daza González', '80177958', 'Periodista', '312 4279761', 'mogiandres8@gmail.com', 'Sanitas', 'Positiva', 5407500, NULL, 'PERIODISTAS', 'LOGISTICO', true);

-- Alejandra Santacruz (PERIODISTAS)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Alejandra Santacruz', '1085329375', 'Periodista', '3162222233', NULL, NULL, 'Positiva', NULL, NULL, 'PERIODISTAS', 'LOGISTICO', true);

-- Jonathan Andrés Sánchez Chinchilla (PERIODISTAS)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Jonathan Andrés Sánchez Chinchilla', '1018416387', 'Presentador', '3162407888', 'onasachi@hotmail.com', 'Sanitas', 'Positiva', 7000000, NULL, 'PERIODISTAS', 'LOGISTICO', true);

-- Marianne Yajaira Perea Asprilla (PERIODISTAS)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Marianne Yajaira Perea Asprilla', '1028003566', 'Presentadora', '311 7463654', 'yajaperea.tv@gmail.com', 'Salud Total', 'Positiva', 10800000, NULL, 'PERIODISTAS', 'LOGISTICO', true);

-- David Andrés Trujillo Yepes (CORRESPONSALES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('David Andrés Trujillo Yepes', '1039462883', 'Periodista', '312 8856851', 'trujilloyepes@gmail.com', 'Sura', 'Positiva', 6300000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Ricardo León Jaramillo Jaramillo (CORRESPONSALES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Ricardo León Jaramillo Jaramillo', '98672227', 'Camarógrafo', '300 4433947', 'jaramilloricardo470@gmail.com', 'Sura', 'Positiva', 7000000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Daniel Cañas Tangarife (CORRESPONSALES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Daniel Cañas Tangarife', '1036648808', 'Periodista', '316 3611550', 'daniel.1093cata@gmail.com', 'Salud Total', 'Positiva', 6272700, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Juan Fernando Villa Campillo (CORRESPONSALES)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Juan Fernando Villa Campillo', '71775579', 'Camarógrafo', '311 7381903', 'explorandorutas@yahoo.es', 'Sura', 'Positiva', 6766667, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Edwin de La Oz Arteaga (CORRESPONSALES - CALI)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Edwin de La Oz Arteaga', '79937609', 'Camarógrafo', '314 3256581', 'camaratv.edwin@gmail.com', 'Sanitas', 'Positiva', 7000000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Daniela Henao Piedrahita (CORRESPONSALES - CALI)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Daniela Henao Piedrahita', '1115093267', 'Periodista', '311 2514677', 'henaopiedrahitadaniela@gmail.com', 'S.O.S', 'Positiva', 6400000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Alex Mauricio Villegas Tabares (CORRESPONSALES - CALI)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Alex Mauricio Villegas Tabares', '1017199495', 'Camarógrafo', '302 4082750', 'alexvillegastabares@gmail.com', 'Sura', 'Positiva', 7000000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Angélica María Cassiani Barrios (CORRESPONSALES - CARTAGENA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Angélica María Cassiani Barrios', '1047457818', 'Periodista', '300 4388296', 'cassianibarriosangelicamaria@gmail.com', 'EPS Mutual', 'Positiva', 6300000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Leonel Alberto Tarra Pimienta (CORRESPONSALES - CARTAGENA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Leonel Alberto Tarra Pimienta', '1047368084', 'Camarógrafo', '301 2720620', 'pimientaagenciaaudiovisual@gmail.com', 'Sura', 'Positiva', 7000000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Sayni Elisa Agámez Serna (CORRESPONSALES - BARRANQUILLA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Sayni Elisa Agámez Serna', '1001919718', 'Periodista', '320 2385991', 'sayniagamezser@gmail.com', 'Nueva EPS', 'Positiva', 6489000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Lewis Alexander Forest Díaz (CORRESPONSALES - BARRANQUILLA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Lewis Alexander Forest Díaz', '1140892512', 'Camarógrafo', '3236630610', 'lewisforestdiaz@gmail.com', 'Salud Total', 'Positiva', 7000000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Vanessa Carolina Miranda Caro (CORRESPONSALES - BARRANQUILLA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Vanessa Carolina Miranda Caro', '1042459596', 'Periodista', '315 5229211', 'vanessacarolinamirandacaro@gmail.com', 'Nueva EPS', 'Positiva', 6300000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Disney Bonilla Lozada (CORRESPONSALES - BARRANQUILLA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Disney Bonilla Lozada', '1108998191', 'Camarógrafo', '3506512000', 'bonilladisney@gmail.com', 'Salud Total', 'Positiva', 7000000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Johanna Liseth Niño Sanabria (CORRESPONSALES - BUCARAMANGA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Johanna Liseth Niño Sanabria', '1095941578', 'Periodista', '317 8876411', 'johanino21@gmail.com', 'Salud Total', 'Positiva', 6450000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- José Eduardo Benítez Beltrán (CORRESPONSALES - BUCARAMANGA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('José Eduardo Benítez Beltrán', '1098703707', 'Camarógrafo', '300 2218347-319 2702584', 'josebenitez.productor@gmail.com', 'Sura', 'Positiva', 7000000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Ruth Gelvez (CORRESPONSALES - BUCARAMANGA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Ruth Gelvez', '1095912933', 'Periodista', '318 6097749', 'ruthjgelvez@gmail.com', 'Salud Mía', 'Positiva', 6500000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Freddy Pernía Villamizar (CORRESPONSALES - BUCARAMANGA)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Freddy Pernía Villamizar', '88230011', 'Camarógrafo', '320 8593904', 'chatopernia@hotmail.com', 'Coosalud Movilidad', 'Positiva', 7000000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

-- Iván Gerardo Cruz Acevedo (CORRESPONSALES - WASHINGTON D.C)
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, salario, contract_end, area, tipo_personal, active)
VALUES ('Iván Gerardo Cruz Acevedo', '79486201', 'Periodista', '311 5934648', 'igcruz@rtvcnoticias.com', 'Compensar', 'Positiva', 13000000, NULL, 'CORRESPONSALES', 'LOGISTICO', true);

COMMIT;

-- Total insertados: 67