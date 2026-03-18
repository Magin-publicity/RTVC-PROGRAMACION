-- Actualización completa de datos de personal
-- Fuente: INGRESOS EQUIPO TÉCNICO PRODUCCIÓN TV
-- Incluye: cédula, teléfono, correo, EPS, ARL, salario, fecha contrato

BEGIN;

-- Juan Carlos Boada <- Juan Carlos Boada Vargas
UPDATE personnel SET phone = '310 2844546', email = 'juancarlosboadavargas@gmail.com', eps = 'Nueva EPS', arl = 'Positiva', salario = 9000000, contract_end = '2026-04-30' WHERE id = 5;
-- Laura Avila <- Laura Johana Ávila Ospina
UPDATE personnel SET phone = '312 3577524', email = 'lauraavilaospina@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 4590000, contract_end = '2026-07-26' WHERE id = 261;
-- Luis Solano <- Luis Fernando Solano Romero
UPDATE personnel SET phone = '312 5079044', email = 'lsolano@rtvcnoticias.com', eps = 'Sura', arl = 'Positiva', salario = 6400000, contract_end = '2026-06-12' WHERE id = 4;
-- Luis Fajardo <- Luis Sebastián Fajardo Serna
UPDATE personnel SET phone = '3193513093', email = 'luisfasertv@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 8000000, contract_end = '2026-06-16' WHERE id = 1;
-- Marilú Durán <- Marilú Durán Ortiz
UPDATE personnel SET phone = '3203485916', email = 'mduran@contratista.rtvc.gov.co', eps = 'Famisanar', arl = 'Positiva', salario = 7850000, contract_end = '2026-07-26' WHERE id = 3;
-- Rocio Ruiz <- Rocio Esmeralda Ruiz Montilla
UPDATE personnel SET phone = '311 2002743', email = 'rocioruiz_tv@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 7300000, contract_end = '2026-06-12' WHERE id = 2;
-- Angela Cabezas <- Ángela Paola Cabezas Medina
UPDATE personnel SET phone = '319 5103161', email = 'acabezas@contratista.rtvc.gov.co', eps = 'Famisanar', arl = 'Positiva', salario = 4300000, contract_end = '2026-07-21' WHERE id = 11;
-- Alexander Paez <- Alexander Paez Arevalo
UPDATE personnel SET phone = '304 6411744', email = 'alexpaarevalo@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 4429000, contract_end = '2026-07-21' WHERE id = 193;
-- Isabella Rojas <- Isabella Rojas Herrera
UPDATE personnel SET phone = '305 8278577', email = 'iabellarojash48@gmail.com', eps = 'Capital Salud', arl = 'Positiva', salario = 4429000, contract_end = '2026-07-21' WHERE id = 8;
-- Juana Ullune <- Juana Mercedes Ullune Ullune
UPDATE personnel SET phone = '320 4030704', email = 'jullune@contratista.rtvc.gov.co', eps = 'EPS Mallamas', arl = 'Positiva', salario = 3020000, contract_end = '2026-07-26' WHERE id = 268;
-- Nicolle Diaz <- Nicolle Solanyie Romero Díaz
UPDATE personnel SET phone = '316 2443001', email = 'nicolleromero2908@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 4429000, contract_end = '2026-07-19' WHERE id = 10;
-- Sara Daza  <- Sara Valentina Daza Martínez
UPDATE personnel SET phone = '3206376186', email = 'dazasaravalentina25@gmail.com', eps = 'Dusakawi EPS', arl = 'Positiva', salario = 3020000, contract_end = '2026-07-21' WHERE id = 267;
-- Valentina velez <- Valentina María Vélez Gallego
UPDATE personnel SET phone = '310 2685723', email = 'valentinam.velez2002@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 4000000, contract_end = '2026-07-28' WHERE id = 259;
-- Andrés Patiño <- Andrés Fernando Patiño Bolaños
UPDATE personnel SET phone = '320 2727912', email = 'afpatinob@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 6900000, contract_end = '2026-06-12' WHERE id = 16;
-- Diego Gamboa <- Diego Felipe Gamboa Heredia
UPDATE personnel SET phone = '3003114148', email = 'diegofelipegh@hotmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 6900000, contract_end = '2026-06-30' WHERE id = 14;
-- Eduardo Contreras <- Eduardo Contreras Ardila
UPDATE personnel SET phone = '311 2918366', email = 'concreatividad1@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 6900000, contract_end = '2026-06-11' WHERE id = 13;
-- Julián Jiménez <- Julián Andrés Jiménez Galeano
UPDATE personnel SET phone = '311 2918366', email = 'concreatividad1@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 6900000, contract_end = '2026-07-24' WHERE id = 197;
-- Alfredo Méndez <- Alfredo Mendez Álvarez
UPDATE personnel SET cedula = '79967414', phone = '305 7712672', email = 'alfredomendezalvarez@hotmail.es', eps = 'Sura', arl = 'Positiva', salario = 4120000, contract_end = '2026-04-22' WHERE id = 19;
-- David Córdoba <- David Alejandro Córdoba
UPDATE personnel SET phone = '323 2300138', email = 'dalcor28@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 4120000, contract_end = '2026-07-23' WHERE id = 18;
-- William Aldana <- William Hernán Aldana Barriga
UPDATE personnel SET phone = '311 4548378', email = 'wialba107@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 4120000, contract_end = '2026-04-17' WHERE id = 22;
-- Ronald Ortiz <- Ronald Iván Ortiz Peláez
UPDATE personnel SET phone = '317 3572425', email = 'produccion.ronnye@icloud.com', eps = 'Compensar', arl = 'Positiva', salario = 2884000, contract_end = '2026-04-29' WHERE id = 24;
-- Sofía Fajardo <- Sofía Fajardo Durán
UPDATE personnel SET phone = '316 4921018', email = 'sofifajardodu@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 2884000, contract_end = '2026-04-26' WHERE id = 23;
-- Tania Morales <- Tania Gisela Morales Rodríguez
UPDATE personnel SET phone = '322 7504200', email = 'ta-nia2000@outlook.com', eps = 'Compensar', arl = 'Positiva', salario = 3020000, contract_end = '2026-07-28' WHERE id = 258;
-- Ashlei Montero <- Ashlei Montero
UPDATE personnel SET phone = '3192536387', email = 'ashlimontero8@gmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 2000000 WHERE id = 30;
-- Dary Segura <- Dary Alejandra Segura Camero
UPDATE personnel SET phone = '3195344477', email = 'darysegura373@gmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 2800000, contract_end = '2026-07-22' WHERE id = 27;
-- Leidy Salazar <- Leidy Tatiana Salazar Forero
UPDATE personnel SET phone = '3224048003', email = 'leidysalazar428@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 2884000, contract_end = '2026-04-24' WHERE id = 28;
-- Paola Borrero <- Paola Lisseth Borrero Castro
UPDATE personnel SET phone = '313 4441218', email = 'jeshualis@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 3020000, contract_end = '2026-07-26' WHERE id = 29;
-- Dayana Rodríguez <- Dayanna Paola Rodríguez Torres
UPDATE personnel SET phone = '314 4651966', email = 'paola357@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 4250000, contract_end = '2026-06-30' WHERE id = 36;
-- Diana Ospina <- Diana Cristina Ospina Forero
UPDATE personnel SET phone = '312 5075288', email = 'dianis_cris@hotmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 4377500, contract_end = '2026-07-26' WHERE id = 32;
-- Maria Jose Escobar <- María José Escobar Laverde
UPDATE personnel SET phone = '300 4674496', email = 'mariaescobar1711@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 4377500, contract_end = '2026-06-30' WHERE id = 31;
-- María Suárez <- María Claudia Suárez Sánchez
UPDATE personnel SET phone = '314 4573688', email = 'mariasuarez9012@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 4377500, contract_end = '2026-06-22' WHERE id = 35;
-- Santiago Ortiz <- Santiago Ortiz Buitrago
UPDATE personnel SET phone = '310 7892245', email = 'santtior@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 4377500, contract_end = '2026-06-19' WHERE id = 34;
-- Huber Salazar <- Huber Arturo Salazar Álvarez
UPDATE personnel SET phone = '3108601024', email = 'huber1711@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 4120000, contract_end = '2026-07-30' WHERE id = 266;
-- Lenin Gutiérrez <- Lenin Gutiérrez Guerrero
UPDATE personnel SET phone = '314 4122387', email = 'leningutierrezg@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 4120000, contract_end = '2026-04-18' WHERE id = 38;
-- Oscar Bernal <- Óscar Alejandro Bernal Zea
UPDATE personnel SET phone = '316 4748529', email = 'alejitozea2014@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 4120000, contract_end = '2026-04-30' WHERE id = 37;
-- Wilmar Matiz <- Wilmar Andrés Matiz Rodas
UPDATE personnel SET phone = '316 3322566', email = 'marwil767@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 4120000, contract_end = '2026-06-24' WHERE id = 41;
-- Jaime Rueda <- Jaime Rueda Pedraza
UPDATE personnel SET phone = '3204234898', email = 'jrueda.sound.tv@live.com', eps = 'Sanitas', arl = 'Positiva', salario = 2884000, contract_end = '2026-06-23' WHERE id = 42;
-- Jimmy Estupiñán <- Jimmy Alberto Estupiñán Molano
UPDATE personnel SET phone = '320 2498067', email = 'jimmy16_@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 2884000 WHERE id = 46;
-- Luis Fonseca <- Luis Gustavo Fonseca Rodríguez
UPDATE personnel SET phone = '312 3405148', email = 'luisfonseca1@outlook.com', eps = 'Famisanar', arl = 'Positiva', salario = 2884000, contract_end = '2026-04-24' WHERE id = 45;
-- Wilson Cano <- Wilson Alejandro Cano Gómez
UPDATE personnel SET phone = '315 3043037', email = 'canogomez12@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 2884000, contract_end = '2026-06-29' WHERE id = 44;
-- Katherine Montoya <- Katherine Montoya González
UPDATE personnel SET phone = '321 4405823', email = 'ana_kathe@hotmail.com', eps = 'Sura', arl = 'Positiva', salario = 2994262, contract_end = '2026-06-29' WHERE id = 49;
-- Kevin Alejandro Lerma <- Kevin Alejandro Lerma Molano
UPDATE personnel SET phone = '322 7960612', email = 'kalerma88@gmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 3000000, contract_end = '2026-07-19' WHERE id = 50;
-- Lina Rodríguez <- Lina Paola Rodríguez López
UPDATE personnel SET phone = '319 7927190', email = 'rodriguezlinapaola26@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 2781000, contract_end = '2026-04-22' WHERE id = 47;
-- Angel Zapata <- Ángel Gustavo Zapata Ferro
UPDATE personnel SET phone = '316 7844677', email = 'gustavozapataferro1@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 5150000, contract_end = '2026-04-29' WHERE id = 56;
-- Carlos Alberto Quiroz Rubio <- Carlos Alberto López Rodríguez
UPDATE personnel SET phone = '300 6342465', email = 'carloslopeztv78@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 5150000, contract_end = '2026-06-21' WHERE id = 211;
-- Carlos A. López <- Carlos Andrés López Muñoz
UPDATE personnel SET cedula = '79811201', phone = '322 2445778', email = 'andjolop@gmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 5150000, contract_end = '2026-04-23' WHERE id = 68;
-- Carlos García <- Carlos Ernesto García Agudelo
UPDATE personnel SET phone = '314 5877358', email = 'cega7119@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-21' WHERE id = 66;
-- Cesar Jimenez <- César Alberto Jiménez Niño
UPDATE personnel SET phone = '(+1) 4033605284', email = 'albertojimenez_8@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-23' WHERE id = 53;
-- Jefferson Pérez <- Jefferson Iván Pérez González
UPDATE personnel SET phone = '313 8920302', email = 'jeivpego@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-21' WHERE id = 59;
-- John Loaiza <- John Alexander Loaiza López
UPDATE personnel SET phone = '312 3754741', email = 'johnalexanderloaiza67@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-21' WHERE id = 55;
-- John Daminston A <- John Daminston Arevalo Mora
UPDATE personnel SET phone = '310 6083387', email = 'damiston07@yahoo.es', eps = 'Compensar', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-21' WHERE id = 61;
-- John Jiménez <- John Freddy Jiménez Rodríguez
UPDATE personnel SET phone = '318 2899743', email = 'johnfredjiro@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-26' WHERE id = 54;
-- Jorge Jaramillo <- Jorge Humberto Jaramillo Ríos
UPDATE personnel SET phone = '311 2762535', email = 'millo1969@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-26' WHERE id = 65;
-- Luis Bernal <- Luis Miguel Bernal
UPDATE personnel SET phone = '310 6098326', email = 'luismiguelbernal@yahoo.es', eps = 'AlianSalud', arl = 'Positiva', salario = 5150000, contract_end = '2026-04-22' WHERE id = 63;
-- Oscar González <- Óscar Javier González Mahecha
UPDATE personnel SET phone = '315 6537916', email = 'oskarjavicamaro@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-19' WHERE id = 51;
-- Pedro Niño <- Pedro Pablo Niño Martín
UPDATE personnel SET phone = '310 6962437', email = 'pnino66@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-19' WHERE id = 58;
-- Raul Ramírez <- Raúl Alfonso Ramírez Rodríguez
UPDATE personnel SET phone = '319 2590854', email = 'raulalfonsoramirez1@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 5150000, contract_end = '2026-05-21' WHERE id = 70;
-- Samuel Romero <- Samuel David Romero Araque
UPDATE personnel SET phone = '(407) 928-2581', email = 'samrom.dr@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-24' WHERE id = 62;
-- Sebastián Hernández <- Sebastián Hernández Morales
UPDATE personnel SET phone = '300 3663927', email = 'herna9214@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-26' WHERE id = 69;
-- William Mosquera <- Héctor William Mosquera Cortés
UPDATE personnel SET phone = '310 7689239', email = 'wmvideos01@gmail.com', eps = 'Nueva EPS', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-21' WHERE id = 60;
-- Carlos Orlando Espinel <- Carlos Orlando Espinel
UPDATE personnel SET phone = '315 7896879', email = 'carlosorlandoespinel @hotmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 4944000, contract_end = '2026-06-29' WHERE id = 72;
-- Diego González <- Diego González Ferreira
UPDATE personnel SET phone = '311 2391706', email = 'diego_2391706@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 2884000, contract_end = '2026-06-26' WHERE id = 73;
-- José Peña <- José Ángel Peña Martínez
UPDATE personnel SET phone = '311 5219365', email = 'japena72@hotmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 4590000, contract_end = '2026-07-26' WHERE id = 71;
-- Julio Vega <- Julio César Vega Castro
UPDATE personnel SET phone = '320 4845399', email = 'santaferiver@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 3020000, contract_end = '2026-07-26' WHERE id = 75;
-- Rodolfo Saldaña <- Rodolfo Saldaña Guayara
UPDATE personnel SET phone = '320 4126522', email = 'rodolfoguayara321@gmail.com', eps = 'Sura', arl = 'Positiva', salario = 2884000, contract_end = '2026-06-15' WHERE id = 74;
-- Jonathan Contreras <- Jonathan Mauricio Contreras Contento
UPDATE personnel SET phone = '321 3461805', email = 'jonathancontreras1233@gmail.com', eps = 'Nueva EPS', arl = 'Positiva', salario = 3020000, contract_end = '2026-07-29' WHERE id = 76;
-- Joaquín Alonso <- Joaquín Alonso Luna Alfonso
UPDATE personnel SET phone = '319 7100708', email = 'eggoproduccion@gmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 5356000, contract_end = '2026-06-26' WHERE id = 82;
-- Néstor Peña <- Néstor Hernan Peña Melendez
UPDATE personnel SET phone = '313 3451478', email = 'nestorhernan56@hotmail.com', eps = 'Nueva EPS', arl = 'Positiva', salario = 4604100, contract_end = '2026-06-26' WHERE id = 79;
-- Rafael López <- Rafael López
UPDATE personnel SET phone = '310 7954780', email = 'raf4lopez@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 3020000, contract_end = '2026-07-20' WHERE id = 78;
-- Daniel Pinilla <- Daniel Pinilla Calderón
UPDATE personnel SET phone = '3219743661', email = 'daniel_pinilla@hotmail.com', eps = 'AlianSalud', arl = 'Positiva', salario = 2617333, contract_end = '2026-08-07' WHERE id = 198;
-- Julio López <- Julio Édgar López
UPDATE personnel SET phone = '310 2489761', email = 'julioedgar.lopez@gmail.com', eps = 'Nueva EPS', arl = 'Positiva', salario = 3502000, contract_end = '2026-04-30' WHERE id = 86;
-- Horacio Suárez <- Horacio Andrés Suárez Reyes
UPDATE personnel SET phone = '315 4869449', email = 'suarezreyes@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 4377500, contract_end = '2026-06-30' WHERE id = 90;
-- Iván Aristizábal <- Iván Eduardo Aristizábal Olarte
UPDATE personnel SET phone = '312 5404387', email = 'imagenivan@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 4377500, contract_end = '2026-04-23' WHERE id = 88;
-- Pedro Torres <- Pedro Pablo Torres Torres
UPDATE personnel SET phone = '313 8844376', email = 'kefatt2@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 4326000, contract_end = '2026-05-23' WHERE id = 89;
-- Daniel Cabra <- Daniel Yesid Cabra Zamora
UPDATE personnel SET phone = '3197281708', email = 'zamora2123@outlook.es', eps = 'Salud Total', arl = 'Positiva', salario = 4173866, contract_end = '2026-07-29' WHERE id = 270;
-- Álvaro Díaz <- Álvaro Leonardo Díaz
UPDATE personnel SET phone = '320 2695175', email = 'leonardo8022@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 5150000, contract_end = '2026-04-16' WHERE id = 94;
-- Andrés Ramírez <- Andrés Ramírez Torres
UPDATE personnel SET phone = '3024495054', email = 'trandres1967@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 7600000, contract_end = '2026-04-22' WHERE id = 97;
-- Carlos Wilches <- Carlos Alfonso Wilches Garay
UPDATE personnel SET phone = '3106888812', email = 'cawg76@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 5150000 WHERE id = 104;
-- Cesar Morales <- César Andrés Morales
UPDATE personnel SET phone = '310 5508527', email = 'ceanmobe@hotmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 5150000, contract_end = '2026-06-26' WHERE id = 105;
-- Didier Buitrago <- Didier Orlando Buitrago Moreno
UPDATE personnel SET phone = '310 2282017', email = 'didor82@hotmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 7600000, contract_end = '2026-07-20' WHERE id = 102;
-- Edgar Castillo <- Édgar Alberto Castillo Sarmiento
UPDATE personnel SET phone = '3156179580', email = 'edcastillos190@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-19' WHERE id = 98;
-- Edgar Nieto <- Édgar Nieto Ramírez
UPDATE personnel SET phone = '3044552124', email = 'dpigornieto@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 5150000, contract_end = '2026-04-30' WHERE id = 111;
-- Erick Velásquez <- Erick Giovanny Velásquez Barragán
UPDATE personnel SET phone = '305 3985138', email = 'ergiveba@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 5150000, contract_end = '2026-07-23' WHERE id = 96;
-- Floresmiro Luna <- Floresmiro Luna Acosta
UPDATE personnel SET phone = '3124006982', email = 'efeluna130@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 7600000, contract_end = '2026-04-22' WHERE id = 110;
-- John Ruiz B <- John Herlendy Ruiz Buitrago
UPDATE personnel SET phone = '304 6366925', email = 'johnr013@hotmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 5150000, contract_end = '2026-06-18' WHERE id = 109;
-- Julián Luna <- Julián David Luna Huertas
UPDATE personnel SET phone = '312 3065241', email = 'lunahuertas@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 7600000, contract_end = '2026-07-26' WHERE id = 106;
-- Leonel Cifuentes <- Leonel Fernando Cifuentes Salinas
UPDATE personnel SET phone = '311 4698404', email = 'cifu_leo@hotmail.com', eps = 'Sura', arl = 'Positiva', salario = 7600000, contract_end = '2026-06-22' WHERE id = 101;
-- Marco Solórzano <- Marco Tulio Solorzano
UPDATE personnel SET phone = '320 8515001', email = 'marcotsolozano@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 7600000, contract_end = '2026-04-19' WHERE id = 99;
-- Victor Vargas <- Víctor Alfonso Vargas Tuta
UPDATE personnel SET phone = '318 2200948', email = 'victor.tuta@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 5150000, contract_end = '2026-04-17' WHERE id = 95;
-- William Uribe <- William Fernando Uribe Cáceres
UPDATE personnel SET phone = '311 8545862', email = 'williamuribe6@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 7600000, contract_end = '2026-06-30' WHERE id = 108;
-- William Ruiz <- William José Ruiz Cabrera
UPDATE personnel SET phone = '3138024275', email = 'w.ruizcamara68@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 5150000, contract_end = '2026-06-24' WHERE id = 103;
-- Alexander Valencia <- Alexander Valencia Martínez
UPDATE personnel SET phone = '3203446590', email = 'alexander.valencia79@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 7900000, contract_end = '2026-07-19' WHERE id = 114;
-- David Patarroyo <- David Eduardo Patarroyo Montañez
UPDATE personnel SET phone = '3016048095', email = 'dpaudiovisualesfilms@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 7600000, contract_end = '2026-07-22' WHERE id = 117;
-- Guillermo Solarte <- Guillermo Solarte Rosero
UPDATE personnel SET phone = '315 4494151', email = 'productortvcolombia@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 8100000, contract_end = '2026-06-18' WHERE id = 115;
-- Laura Vargas <- Laura Vargas Esteban
UPDATE personnel SET phone = '3002123766', email = 'lauraesteban2323@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 7500000, contract_end = '2026-06-26' WHERE id = 113;
-- Manuel Díaz <- Manuel de Jesús Díaz Polo
UPDATE personnel SET phone = '313 4542472', email = 'manueldiaz0611@gmail.com', eps = 'Sura', arl = 'Positiva', salario = 7250000, contract_end = '2026-07-30' WHERE id = 271;
-- Óscar Ortega <- Óscar David Ortega
UPDATE personnel SET phone = '302 4870417', email = 'odoc.9090@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 8100000, contract_end = '2026-06-29' WHERE id = 112;
-- Santiago Torres <- Santiago Torres Yaselaga
UPDATE personnel SET phone = '302 4870417', email = 'santi.torres.yaselga@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 5200000, contract_end = '2026-07-26' WHERE id = 85;
-- Wílmer Salamanca <- Wilmer Hernan Salamanca Alcala
UPDATE personnel SET phone = '311 4535184', email = 'wsalamancaa@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 7900000, contract_end = '2026-06-12' WHERE id = 116;
-- Johan Moreno <- Johan Daniel Moreno Pereira
UPDATE personnel SET phone = '311 2117045', email = 'danielcineytv@hotmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 2884000, contract_end = '2026-04-29' WHERE id = 123;
-- José Mesa <- José Guillermo Mesa Galindo
UPDATE personnel SET phone = '323 8033054', email = 'mesa24103@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 3000000, contract_end = '2026-07-22' WHERE id = 125;
-- Pablo Preciado <- Pablo Hernando Preciado Dueñas
UPDATE personnel SET phone = '314 4616426', email = 'pablopreciado_@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 2884000, contract_end = '2026-06-26' WHERE id = 121;
-- Richard Beltrán <- Richard Sneyder Beltrán Corredor
UPDATE personnel SET phone = '321 483283', email = 'richardsneybc@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 3020000, contract_end = '2026-07-28' WHERE id = 199;
-- Walter Murillo <- Walter Rodrigo Murillo Salgado
UPDATE personnel SET phone = '320 2952396', email = 'wmurillosalgado@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 2884000, contract_end = '2026-04-29' WHERE id = 122;
-- Carlos Acosta <- Carlos Andrés Acosta Jiménez
UPDATE personnel SET phone = '304 6785914', email = 'carlosacostaaj@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 4377500, contract_end = '2026-06-18' WHERE id = 129;
-- Dora Rincón <- Dora Idaly Rincón León
UPDATE personnel SET phone = '312 3510423', email = 'rinconleondoraidaly@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 4326000, contract_end = '2026-06-29' WHERE id = 127;
-- Mariluz Beltrán <- Mariluz Beltrán Beltrán
UPDATE personnel SET phone = '3115046657', email = 'maryluzbeltranbeltran@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 2884000, contract_end = '2026-06-01' WHERE id = 130;
-- Mercedes Malagón <- Mercedes Malagón Prieto
UPDATE personnel SET phone = '313 3710571', email = 'mercedes.malagon12@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 4326000, contract_end = '2026-08-03' WHERE id = 128;
-- Yineth Tovar <- Yineth Damely Tovar Vargas
UPDATE personnel SET phone = '312 3458438', email = 'dartovar@hotmail.com', eps = 'Nueva EPS', arl = 'Positiva', salario = 2884000, contract_end = '2026-04-17' WHERE id = 126;
-- Ana Villalba <- Ana Herminda Villalba
UPDATE personnel SET phone = '310 3170898', email = 'anavillalba1960@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 4944000, contract_end = '2026-06-26' WHERE id = 135;
-- Lady Ortiz <- Lady Andrea Ortiz Cristo
UPDATE personnel SET phone = '316 0555018', email = 'ortizcrisandrea@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 4429000, contract_end = '2026-07-19' WHERE id = 131;
-- María Espinosa <- María Fernanda Espinosa
UPDATE personnel SET phone = '320 3810201', email = 'mafee93@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 4429000, contract_end = '2026-07-22' WHERE id = 133;
-- Danny Correa <- Danny Carlos Correa López
UPDATE personnel SET phone = '312 7410843', email = 'dannycarloscorrea@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 7500000 WHERE id = 143;
-- Karen Tatiana Malpica Duarte <- Karen Tatiana Malpica Duarte
UPDATE personnel SET phone = '318 4375277', email = 'karen.redaccion@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 8000000 WHERE id = 415;
-- Andrea Olaya <- Andrea Julieth Olaya Cobos
UPDATE personnel SET phone = '314 7181884', email = 'andre.olaya11@hotmail.com', eps = 'Compensar', arl = 'Positiva', salario = 8000000 WHERE id = 139;
-- Nathalie Gómez González <- Nathalie Gómez González
UPDATE personnel SET phone = '300 3298087', email = 'nathalie.gomez.gonzalez@gmail.com', eps = 'Sura', arl = 'Positiva', salario = 5407500 WHERE id = 417;
-- Camila Andrea Sarmiento Medez <- Camila Andrea Sarmiento Medez
UPDATE personnel SET phone = '320 8534282', email = 'camisarmiento9@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 9000000 WHERE id = 418;
-- Leoniris Moya <- Leoniris Elaines Moya Tapias
UPDATE personnel SET phone = '301 2367194', email = 'leonirismoya@hotmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 12000000 WHERE id = 149;
-- Isabella Palacios Barrios <- Isabella Palacios Barrios
UPDATE personnel SET phone = '300 4447367', email = 'peytonpaba@gmail.com', eps = 'Sura', arl = 'Positiva', salario = 4000000 WHERE id = 420;
-- Paula Andrea Molano Rodríguez <- Paula Andrea Molano Rodríguez
UPDATE personnel SET phone = '322 2902799', email = 'paulaandreamol16@gmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 5407500 WHERE id = 421;
-- Wilson Adolfo Moreno Tovar <- Wilson Adolfo Moreno Tovar
UPDATE personnel SET phone = '304 3936873', email = 'wilsonmoreno9@hotmail.com', eps = 'Sura', arl = 'Positiva', salario = 9280197 WHERE id = 422;
-- Cristian Sandoval <- Cristián Fabián Sandoval Galindo
UPDATE personnel SET phone = '301 51229166', email = 'csandovalg@contratista.rtvc.gov.co', eps = 'Compensar', arl = 'Positiva', salario = 6458581 WHERE id = 142;
-- Mireya Mosquera Muñetón <- Mireya Mosquera Muñetón
UPDATE personnel SET phone = '3113286344', email = 'mmmuneton@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 7850000 WHERE id = 424;
-- Camila Bradford <- Camila Andrea Brandford Gil
UPDATE personnel SET phone = '322 2411713', email = 'camilbrd8@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 8000000 WHERE id = 148;
-- Juan Sebastián Cano Álvarez <- Juan Sebastián Cano Álvarez
UPDATE personnel SET phone = '311 2304886', email = 'juancano87@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 5407500 WHERE id = 426;
-- Carol Yesenia Rodríguez Gutiérrez <- Carol Yesenia Rodríguez Gutiérrez
UPDATE personnel SET phone = '3126762143', email = 'caritol2406@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 7000000 WHERE id = 427;
-- Carlos Alberto Ruíz Rodríguez <- Carlos Alberto Ruíz Rodríguez
UPDATE personnel SET phone = '310 7755432', email = 'caruiz@contratista.rtvc.gov.co', eps = 'Famisanar', arl = 'Positiva', salario = 14700000 WHERE id = 428;
-- Eduvilia María Uriana Pushaina <- Eduvilia María Uriana Pushaina
UPDATE personnel SET phone = '317 4669934', email = 'eduviliamaria18@gmail.com', eps = 'Dukasawi EPS', arl = 'Positiva', salario = 7588333 WHERE id = 429;
-- Catalina Botero Orozco <- Catalina Botero Orozco
UPDATE personnel SET phone = '300 8546101', email = 'catalinabotero96@gmail.com', eps = 'Sura', arl = 'Positiva', salario = 10800000 WHERE id = 430;
-- Vladimir Alberto Narváez Arteaga <- Vladimir Alberto Narváez Arteaga
UPDATE personnel SET phone = '318 7594383', email = 'vladimirvfdg@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 6000000 WHERE id = 431;
-- Laura María Galindo Morales <- Laura María Galindo Morales
UPDATE personnel SET phone = '300 5664281', email = 'lauramgm@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 10600000 WHERE id = 432;
-- Cristián Arturo Galindo Supelano <- Cristián Arturo Galindo Supelano
UPDATE personnel SET phone = '311 2102354', email = 'cristian_921013@live.com', eps = 'Sanitas', arl = 'Positiva', salario = 7500000 WHERE id = 433;
-- Sonalys Borregales Blanco <- Sonalys Borregales Blanco
UPDATE personnel SET phone = '3134411207', email = 'sonalysborregales@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 7500000 WHERE id = 434;
-- Astrid Vaneza Celis Orozco <- Astrid Vaneza Celis Orozco
UPDATE personnel SET phone = '322 2241065', email = 'celisorozcov@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 5665000 WHERE id = 435;
-- José Alberto Borbón Reyes <- José Alberto Borbón Reyes
UPDATE personnel SET phone = '311 5446653', email = 'borbonreyesjose@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 9280000 WHERE id = 436;
-- Diego Alexander Urrea Torres <- Diego Alexander Urrea Torres
UPDATE personnel SET phone = '304 5337925', email = 'durrea@rtvcnoticias.com', eps = 'Sanitas', arl = 'Positiva', salario = 5407500 WHERE id = 437;
-- Laura Crisitna Barbosa Cifuentes <- Laura Crisitna Barbosa Cifuentes
UPDATE personnel SET phone = '3150518026', email = 'lauracifuentescontacto@gmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 4800000 WHERE id = 438;
-- María Fernanda Soto Cerchiaro <- María Fernanda Soto Cerchiaro
UPDATE personnel SET phone = '300 8786473', email = 'mafe_sotocerchiaro@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 8000000 WHERE id = 439;
-- Deisy Giovana Almendra Calambas <- Deisy Giovana Almendra Calambas
UPDATE personnel SET phone = '323 4470093', email = 'deiis94@yahoo.es', eps = 'Emssanar EPS', arl = 'Positiva', salario = 7600000 WHERE id = 440;
-- Mauricio Pichot <- Mauricio René Pichot Elles
UPDATE personnel SET phone = '311 4900769', email = 'mrpichot1@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 12000000 WHERE id = 147;
-- Nasmiyer Evein Anzola Santos <- Nasmiyer Evein Anzola Santos
UPDATE personnel SET phone = '313 4067433', email = 'evelinperiodista@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 8000000 WHERE id = 442;
-- Vilma Jay López <- Vilma Jay López
UPDATE personnel SET phone = '316 5356422', email = 'vilamjay@gmail.com', eps = 'Nueva EPS', arl = 'Positiva', salario = 10800000 WHERE id = 443;
-- Omaira Morales <- Omaira Morales Arboleda
UPDATE personnel SET phone = '300 4025945', email = 'omorales@contratista.rtvc.gov.co', eps = 'Compensar', arl = 'Positiva', salario = 13000000 WHERE id = 150;
-- Diana Maritza Matabajoy Moreno <- Diana Maritza Matabajoy Moreno
UPDATE personnel SET phone = '317 6853342', email = 'dianamatabajoy@gmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 7178400 WHERE id = 444;
-- Jorge Esteban Galeano Cuatindoy <- Jorge Esteban Galeano Cuatindoy
UPDATE personnel SET phone = '315 2428881', email = 'cuatindoy@gmail.com', eps = 'Famisanar', arl = 'Positiva', salario = 7300000 WHERE id = 445;
-- Yennifer Tatiana Buitrago Pinzón <- Yennifer Tatiana Buitrago Pinzón
UPDATE personnel SET phone = '319 4299743', email = 'buitragopinzontatiana@gmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 5407500 WHERE id = 446;
-- Juan Sebastián Ramírez Salcedo <- Juan Sebastián Ramírez Salcedo
UPDATE personnel SET phone = '301 2082017', email = 'juansebastianramirezsalcedo@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 6860000 WHERE id = 447;
-- Gelitza Rocío Jiménez Cerquera <- Gelitza Rocío Jiménez Cerquera
UPDATE personnel SET phone = '350 5295107', email = 'gelitzajc@gmail.com', eps = 'Nueva EPS', arl = 'Positiva', salario = 7000000 WHERE id = 448;
-- Juan Carlos Salamanca Quintero <- Juan Carlos Salamanca Quintero
UPDATE personnel SET phone = '310 3663994', email = 'juansalamanda1992@gmail.com', eps = 'Salud Total', arl = 'Positiva', salario = 5562000 WHERE id = 449;
-- Martha Cecilia Rentería Mengaño <- Martha Cecilia Rentería Mengaño
UPDATE personnel SET phone = '321 4786838', email = 'famar7@gmail.com', eps = 'Nueva EPS', arl = 'Positiva', salario = 9666667 WHERE id = 450;
-- Óscar Alonso Sierra <- Óscar Alonso Sierra
UPDATE personnel SET phone = '310 7856332', email = 'osierra@rtvcnoticias.com', eps = 'Nueva EPS', arl = 'Positiva', salario = 9000000 WHERE id = 451;
-- Denisse Youderly Suárez Ureña <- Denisse Youderly Suárez Ureña
UPDATE personnel SET phone = '314 3364859', email = 'deniseesuarez@gmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 8000000 WHERE id = 452;
-- Geraldine Rozo Amortegui <- Geraldine Rozo Amortegui
UPDATE personnel SET phone = '320 8327345', email = 'geraldinerozo23@gmail.com', eps = 'Compensar', arl = 'Positiva', salario = 6000000 WHERE id = 453;
-- Daniel Alejandro Páez Ocampo <- Daniel Alejandro Páez Ocampo
UPDATE personnel SET phone = '312 7364954', email = 'dax0200@gmail.com', eps = 'Nueva EPS', arl = 'Positiva', salario = 5407500 WHERE id = 454;
-- José Jorge Jiménez Rincón <- José Jorge Jiménez Rincón
UPDATE personnel SET phone = '3114027029', email = 'jjjr_88@hotmail.com', eps = 'Sanitas', arl = 'Positiva', salario = 6300000 WHERE id = 455;

COMMIT;

-- Total actualizaciones: 155