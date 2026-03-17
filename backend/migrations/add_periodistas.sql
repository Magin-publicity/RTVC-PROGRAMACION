-- Agregar y actualizar periodistas
BEGIN;

-- ACTUALIZACIONES
-- Omaira Morales <- Omaira Morales Arboleda
UPDATE personnel SET cedula = '52557481', phone = '300 4025945', email = 'omorales@contratista.rtvc.gov.co', eps = 'Compensar', arl = 'Positiva' WHERE id = 150;

-- NUEVOS PERIODISTAS
-- Danny Carlos Correa López
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Danny Carlos Correa López', '1067871928', 'Periodista', '312 7410843', 'dannycarloscorrea@gmail.com', 'Compensar', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Karen Tatiana Malpica Duarte
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Karen Tatiana Malpica Duarte', '1014248590', 'Periodista', '318 4375277', 'karen.redaccion@gmail.com', 'Compensar', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Andrea Julieth Olaya Cobos
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Andrea Julieth Olaya Cobos', '1022347474', 'Periodista', '314 7181884', 'andre.olaya11@hotmail.com', 'Compensar', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Nathalie Gómez González
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Nathalie Gómez González', '1143858478', 'Periodista', '300 3298087', 'nathalie.gomez.gonzalez@gmail.com', 'Sura', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Camila Andrea Sarmiento Medez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Camila Andrea Sarmiento Medez', '1026576635', 'Periodista', '320 8534282', 'camisarmiento9@gmail.com', 'Sanitas', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Leoniris Elaines Moya Tapias
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Leoniris Elaines Moya Tapias', '26946477', 'Presentadora', '301 2367194', 'leonirismoya@hotmail.com', 'Salud Total', 'Positiva', 'PRESENTADORES', 'PERIODISTA', true);
-- Isabella Palacios Barrios
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Isabella Palacios Barrios', '1001132002', 'Presentadora', '300 4447367', 'peytonpaba@gmail.com', 'Sura', 'Positiva', 'PRESENTADORES', 'PERIODISTA', true);
-- Paula Andrea Molano Rodríguez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Paula Andrea Molano Rodríguez', '1024586100', 'Periodista', '322 2902799', 'paulaandreamol16@gmail.com', 'Salud Total', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Wilson Adolfo Moreno Tovar
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Wilson Adolfo Moreno Tovar', '79459566', 'Periodista', '304 3936873', 'wilsonmoreno9@hotmail.com', 'Sura', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Cristián Fabián Sandoval Galindo
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Cristián Fabián Sandoval Galindo', '1013623038', 'Periodista', '301 51229166', 'csandovalg@contratista.rtvc.gov.co', 'Compensar', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Mireya Mosquera Muñetón
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Mireya Mosquera Muñetón', '43220488', 'Presentadora', '3113286344', 'mmmuneton@gmail.com', 'Sanitas', 'Positiva', 'PRESENTADORES', 'PERIODISTA', true);
-- Camila Andrea Brandford Gil
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Camila Andrea Brandford Gil', '1010194340', 'Presentadora', '322 2411713', 'camilbrd8@gmail.com', 'Compensar', 'Positiva', 'PRESENTADORES', 'PERIODISTA', true);
-- Juan Sebastián Cano Álvarez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Juan Sebastián Cano Álvarez', '1018411209', 'Presentador', '311 2304886', 'juancano87@hotmail.com', 'Sanitas', 'Positiva', 'PRESENTADORES', 'PERIODISTA', true);
-- Carol Yesenia Rodríguez Gutiérrez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Carol Yesenia Rodríguez Gutiérrez', '1018467590', 'Periodista', '3126762143', 'caritol2406@hotmail.com', 'Sanitas', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Carlos Alberto Ruíz Rodríguez
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Carlos Alberto Ruíz Rodríguez', '19149934', 'Periodista', '310 7755432', 'caruiz@contratista.rtvc.gov.co', 'Famisanar', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Eduvilia María Uriana Pushaina
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Eduvilia María Uriana Pushaina', '1120747617', 'Presentadora', '317 4669934', 'eduviliamaria18@gmail.com', 'Dukasawi EPS', 'Positiva', 'PRESENTADORES', 'PERIODISTA', true);
-- Catalina Botero Orozco
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Catalina Botero Orozco', '1037647305', 'Presentadora', '300 8546101', 'catalinabotero96@gmail.com', 'Sura', 'Positiva', 'PRESENTADORES', 'PERIODISTA', true);
-- Vladimir Alberto Narváez Arteaga
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Vladimir Alberto Narváez Arteaga', '1085346264', 'Periodista', '318 7594383', 'vladimirvfdg@gmail.com', 'Sanitas', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Laura María Galindo Morales
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Laura María Galindo Morales', '1032394030', 'Presentadora', '300 5664281', 'lauramgm@gmail.com', 'Compensar', 'Positiva', 'PRESENTADORES', 'PERIODISTA', true);
-- Cristián Arturo Galindo Supelano
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Cristián Arturo Galindo Supelano', '1022378594', 'Periodista', '311 2102354', 'cristian_921013@live.com', 'Sanitas', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Sonalys Borregales Blanco
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Sonalys Borregales Blanco', '1176742', 'Presentadora', '3134411207', 'sonalysborregales@gmail.com', 'Compensar', 'Positiva', 'PRESENTADORES', 'PERIODISTA', true);
-- Astrid Vaneza Celis Orozco
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Astrid Vaneza Celis Orozco', '1080935446', 'Periodista', '322 2241065', 'celisorozcov@gmail.com', 'Compensar', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- José Alberto Borbón Reyes
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('José Alberto Borbón Reyes', '80392730', 'Periodista', '311 5446653', 'borbonreyesjose@gmail.com', 'Compensar', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Diego Alexander Urrea Torres
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Diego Alexander Urrea Torres', '1098407910', 'Periodista', '304 5337925', 'durrea@rtvcnoticias.com', 'Sanitas', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Laura Crisitna Barbosa Cifuentes
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Laura Crisitna Barbosa Cifuentes', '1110597097', 'Periodista', '3150518026', 'lauracifuentescontacto@gmail.com', 'Salud Total', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- María Fernanda Soto Cerchiaro
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('María Fernanda Soto Cerchiaro', '1065822763', 'Presentadora', '300 8786473', 'mafe_sotocerchiaro@hotmail.com', 'Sanitas', 'Positiva', 'PRESENTADORES', 'PERIODISTA', true);
-- Deisy Giovana Almendra Calambas
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Deisy Giovana Almendra Calambas', '1064436091', 'Periodista', '323 4470093', 'deiis94@yahoo.es', 'Emssanar EPS', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Mauricio René Pichot Elles
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Mauricio René Pichot Elles', '73122163', 'Periodista', '311 4900769', 'mrpichot1@gmail.com', 'Famisanar', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Nasmiyer Evein Anzola Santos
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Nasmiyer Evein Anzola Santos', '52788851', 'Periodista', '313 4067433', 'evelinperiodista@gmail.com', 'Famisanar', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Vilma Jay López
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Vilma Jay López', '1143324192', 'Presentadora', '316 5356422', 'vilamjay@gmail.com', 'Nueva EPS', 'Positiva', 'PRESENTADORES', 'PERIODISTA', true);
-- Diana Maritza Matabajoy Moreno
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Diana Maritza Matabajoy Moreno', '40341206', 'Periodista', '317 6853342', 'dianamatabajoy@gmail.com', 'Salud Total', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Jorge Esteban Galeano Cuatindoy
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Jorge Esteban Galeano Cuatindoy', '10547756', 'Periodista', '315 2428881', 'cuatindoy@gmail.com', 'Famisanar', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Yennifer Tatiana Buitrago Pinzón
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Yennifer Tatiana Buitrago Pinzón', '1010135677', 'Periodista', '319 4299743', 'buitragopinzontatiana@gmail.com', 'Salud Total', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Juan Sebastián Ramírez Salcedo
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Juan Sebastián Ramírez Salcedo', '1001063400', 'Periodista', '301 2082017', 'juansebastianramirezsalcedo@gmail.com', 'Compensar', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Gelitza Rocío Jiménez Cerquera
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Gelitza Rocío Jiménez Cerquera', '1030639650', 'Periodista', '350 5295107', 'gelitzajc@gmail.com', 'Nueva EPS', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Juan Carlos Salamanca Quintero
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Juan Carlos Salamanca Quintero', '1120868934', 'Periodista', '310 3663994', 'juansalamanda1992@gmail.com', 'Salud Total', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Martha Cecilia Rentería Mengaño
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Martha Cecilia Rentería Mengaño', '1119580222', 'Periodista', '321 4786838', 'famar7@gmail.com', 'Nueva EPS', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Óscar Alonso Sierra
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Óscar Alonso Sierra', '9534675', 'Periodista', '310 7856332', 'osierra@rtvcnoticias.com', 'Nueva EPS', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Denisse Youderly Suárez Ureña
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Denisse Youderly Suárez Ureña', '1018415462', 'Periodista', '314 3364859', 'deniseesuarez@gmail.com', 'Sanitas', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Geraldine Rozo Amortegui
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Geraldine Rozo Amortegui', '1018511937', 'Periodista', '320 8327345', 'geraldinerozo23@gmail.com', 'Compensar', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- Daniel Alejandro Páez Ocampo
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('Daniel Alejandro Páez Ocampo', '1004871279', 'Periodista', '312 7364954', 'dax0200@gmail.com', 'Nueva EPS', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);
-- José Jorge Jiménez Rincón
INSERT INTO personnel (name, cedula, role, phone, email, eps, arl, area, tipo_personal, active) VALUES ('José Jorge Jiménez Rincón', '1107049866', 'Periodista', '3114027029', 'jjjr_88@hotmail.com', 'Sanitas', 'Positiva', 'PERIODISTAS', 'PERIODISTA', true);

COMMIT;