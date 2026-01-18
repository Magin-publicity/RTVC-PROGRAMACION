const pool = require('../config/database');

// Datos extraídos de las imágenes
const contractorData = [
  // DIRECTORES DE CÁMARA
  { name: 'Julián Andrés Jiménez Galeano', phone: '315 6932435', email: 'julianjimenezg24@hotmail.com', contract_number: '2198-2025', contract_end: '2025-12-06', role: 'Director' },
  { name: 'Iván Camilo Hernández Cárdenas', phone: '322 4561293', email: 'iva12her@gmail.com', contract_number: '2431-2025', contract_end: '2025-12-08', role: 'Director' },
  { name: 'Eduardo Contreras Ardila', phone: '311 2918366', email: 'concreatividad1@gmail.com', contract_number: '1697-2025', contract_end: '2025-12-08', role: 'Director' },
  { name: 'Alejandro La Torre Villalba', phone: '3123499710', email: 'antelatorre@gmail.com', contract_number: '2565-2025', contract_end: '2025-12-11', role: 'Director' },
  { name: 'Andrés Fernando Patiño Bolaños', phone: '320 2727912', email: 'afpatinob@gmail.com', contract_number: '2476-2025', contract_end: '2025-12-14', role: 'Director' },
  { name: 'Diego Felipe Gamboa Heredia', phone: '3003114148', email: 'diegofelipegh@hotmail.com', contract_number: '1927-2025', contract_end: '2025-12-19', role: 'Director' },

  // VTR
  { name: 'Johan Henry Villarraga Villarraga', phone: '304 5610093', email: 'jhvv1979@hotmail.com', contract_number: '1708-2025', contract_end: '2025-12-09', role: 'VTR' },
  { name: 'William Hernán Aldana', phone: '311 4548378', email: 'wialba107@gmail.com', contract_number: '2668-2025', contract_end: '2025-12-13', role: 'VTR' },
  { name: 'Dava Alejandro Córdoba', phone: '323 2300138', email: 'daicor23@gmail.com', contract_number: '1487-2025', contract_end: '2025-12-14', role: 'VTR' },
  { name: 'Alfredo Méndez Álvarez', phone: '305 7712672', email: 'alfredomendezalvarez@hotmail.es', contract_number: '1413-2025', contract_end: '2025-12-16', role: 'VTR' },
  { name: 'Juan Pablo Zorrilla Guevara', phone: '317 3188712', email: 'juanpablozg@gmail.com', contract_number: '2013-2025', contract_end: '2025-12-28', role: 'VTR' },

  // GENERADORES DE CARACTERES
  { name: 'Dayanna Paola Rodríguez Torres', phone: '314 4651966', email: 'Paolart29@hotmail.com', contract_number: '', contract_end: '2025-12-11', role: 'Generador de Caracteres' },
  { name: 'Santiago Ortiz', phone: '310 7892245', email: 'santitor@gmail.com', contract_number: '1727-2025', contract_end: '2025-12-10', role: 'Generador de Caracteres' },
  { name: 'María Claudia Suárez Sánchez', phone: '314 4573688', email: 'mariasuarez9012@hotmail.com', contract_number: '2178-2025', contract_end: '2025-12-12', role: 'Generador de Caracteres' },
  { name: 'Diana Carolina Chaparro Forero', phone: '312 5075288', email: 'dianis_cf5@hotmail.com', contract_number: '2308-2025', contract_end: '2025-12-14', role: 'Generador de Caracteres' },
  { name: 'Edwin Santiago Rico Durán', phone: '300 8928973', email: 'santiagorico1994@gmail.com', contract_number: '1303-2025', contract_end: '2025-12-16', role: 'Generador de Caracteres' },
  { name: 'Maria Jose Escobar', phone: '3004674496', email: 'mariaescobar1711@hotmail.com', contract_number: '2260-2025', contract_end: '2025-11-25', role: 'Generador de Caracteres' },

  // OPERADORES Y ASISTENTES DE AUDIO
  { name: 'Lenin Gutierrez Carrero', phone: '314 4122387', email: 'leningutierrez@hotmail.com', contract_number: '1470-2025', contract_end: '2025-12-10', role: 'Operador de Sonido' },
  { name: 'Luis Gustavo Fonseca Rodríguez', phone: '312 3405148', email: 'Luisfonseca1@outlook.com', contract_number: '1365-2025', contract_end: '2025-12-18', role: 'Asistente de Sonido' },
  { name: 'Jimmy Alberto Estupiñán Molano', phone: '320 2498067', email: 'jimmy16_@hotmail.com', contract_number: '1501-2025', contract_end: '2025-12-18', role: 'Asistente de Sonido' },
  { name: 'Jaime Rueda pedraza', phone: '3204234898', email: 'jrueda.sound.tv@live.com', contract_number: '1938-2025', contract_end: '2025-12-19', role: 'Asistente de Sonido' },
  { name: 'Wilmar Andrés Matiz Rodas', phone: '316 3322566', email: 'marwil767@gmail.com', contract_number: '1942-2025', contract_end: '2025-12-20', role: 'Operador de Sonido' },
  { name: 'Óscar Bernal', phone: '316 4748529', email: '', contract_number: '', contract_end: '2025-12-21', role: 'Operador de Sonido' },
  { name: 'Harold Barrero Herrán', phone: '301 2336955', email: 'hfarold@gmail.com', contract_number: '1717-2025', contract_end: '2025-12-23', role: 'Operador de Sonido' },
  { name: 'Wilson Alejandro Cano Gómez', phone: '315 3043037', email: 'Canogomez12@gmail.com', contract_number: '1978-2025', contract_end: '2025-12-26', role: 'Asistente de Sonido' },
  { name: 'Marcela Vélez', phone: '321 3179894', email: 'marcev82@hotmail.com', contract_number: '2538- 2025', contract_end: '2025-12-27', role: 'Asistente de Sonido' },

  // OPERADORES DE TELEPROMPTER, PANTALLAS Y VMIX
  { name: 'Kevin Fonseca', phone: '3205941075', email: 'kevin.fonseca@rtvc.gov.co', contract_number: '', contract_end: '2025-12-08', role: 'Teleprompter' },
  { name: 'Sofía Fajardo Durán', phone: '316 4921018', email: 'sofiafajardu@gmail.com', contract_number: '402-2025', contract_end: '2025-12-09', role: 'VMix' },
  { name: 'Lina Paola Rodríguez López', phone: '319 7927190', email: 'rodriguezlinapaola26@gmail.com', contract_number: '1702-2025', contract_end: '2025-12-10', role: 'Teleprompter' },
  { name: 'Vanessa Paola Castañeda Jiménez', phone: '322 4745568', email: 'vanessacj54@gmail.com', contract_number: '1709-2025', contract_end: '2025-12-10', role: 'VMix' },
  { name: 'Paola Lisseth Borrero Castro', phone: '313 4441218', email: 'Jeshuaca@hotmail.com', contract_number: '2140-2025', contract_end: '2025-12-15', role: 'Pantallas' },
  { name: 'Leidy Tatiana Salazar Forero', phone: '322 4048003', email: 'Leidysalazar428@gmail.com', contract_number: '1408-2025', contract_end: '2025-12-16', role: 'Pantallas' },
  { name: 'Dary Alejandra Segura Camero', phone: '319 5344477', email: 'darysegura373@gmail.com', contract_number: '1859-2025', contract_end: '2025-12-17', role: 'Pantallas' },
  { name: 'Ashli Montero', phone: '3192536387', email: '', contract_number: '', contract_end: '', role: 'Pantallas' },
  { name: 'Kevin Alejandro Lerma Molano', phone: '322 7960612', email: 'Kalerma88@gmail.com', contract_number: '2326-2025', contract_end: '2025-12-19', role: 'Teleprompter' },
  { name: 'Helbertt Duván Díaz García', phone: '319 4340278', email: '', contract_number: '1570-2025', contract_end: '2025-12-21', role: 'Teleprompter' },
  { name: 'Katherine Montoya Gonzalez', phone: '321 4405823', email: 'ana_kattie@hotmail.com', contract_number: '1933-2025', contract_end: '2025-12-23', role: 'Teleprompter' },

  // CAMARÓGRAFOS, REALIZADORES, ASISTENTES (de la imagen grande)
  { name: 'Wilmer Salamanca', phone: '311 4535184', email: 'Wsalamancaa@gmail.com', contract_number: '2357-2025', contract_end: '2025-12-09', role: 'Camarógrafo' },
  { name: 'José Ángel Peña Martínez', phone: '311 5219365', email: 'japena72@hotmail.com', contract_number: '2100-2025', contract_end: '2025-12-04', role: 'Asistente de Cámara' },
  { name: 'Edgar Nieto Ramírez', phone: '304 4552124', email: 'dnignietoa@gmail.com', contract_number: '1728-2025', contract_end: '2025-12-09', role: 'Camarógrafo' },
  { name: 'Marco Tulio Solórzano', phone: '320 8515001', email: 'marcolsolozano@hotmail.com', contract_number: '1731-2025', contract_end: '2025-12-09', role: 'Camarógrafo' },
  { name: 'William Fernando Uribe Cáceres', phone: '311 8545862', email: 'williamuribec@gmail.com', contract_number: '2192-2025', contract_end: '2025-12-09', role: 'Camarógrafo' },
  { name: 'Julian David Luna Huertas', phone: '312 3065241', email: 'lunahuertas@hotmail.com', contract_number: '1721-2025', contract_end: '2025-12-10', role: 'Camarógrafo' },
  { name: 'Álvaro Díaz', phone: '320 2695175', email: 'leonardo8022@hotmail.com', contract_number: '2458-2025', contract_end: '2025-12-10', role: 'Camarógrafo' },
  { name: 'Guillermo Solarte Rosero', phone: '315 4494151', email: 'productortvcolombia@gmail.com', contract_number: '1809-2025', contract_end: '2025-12-10', role: 'Camarógrafo' },
  { name: 'Pablo Hernando Preciado Dueñas', phone: '314 4616426', email: 'Pablopreciado_@hotmail.com', contract_number: '1748-2025', contract_end: '2025-12-11', role: 'Asistente de Cámara' },
  { name: 'Erick Giovanny Velásquez Barragán', phone: '305 3985138', email: 'Ergiveba@hotmail.com', contract_number: '1742-2025', contract_end: '2025-12-11', role: 'Camarógrafo' },
  { name: 'Jhonatan Andres Ramirez Sepulveda', phone: '3237710542', email: 'garetochad@gmail.com', contract_number: '2205-2025', contract_end: '2025-12-12', role: 'Asistente de Cámara' },
  { name: 'Edgar Alberto Castillo Sarmiento', phone: '315 6179580', email: 'edcastillos190@gmail.com', contract_number: '1533-2025', contract_end: '2025-12-12', role: 'Camarógrafo' },
  { name: 'John Heriendy Ruiz Buitrago', phone: '304 6366925', email: 'Johnr013@hotmail.com', contract_number: '1769-2025', contract_end: '2025-12-12', role: 'Camarógrafo' },
  { name: 'Leonel Fernando Cifuentes Salinas', phone: '311 4698404', email: 'Cifu_leo@hotmail.com', contract_number: '2204-2025', contract_end: '2025-12-12', role: 'Camarógrafo' },
  { name: 'Victor Alfonso Vargas', phone: '318 2200948', email: 'victor.lafa@hotmail.com', contract_number: '1489-2025', contract_end: '2025-12-14', role: 'Camarógrafo' },
  { name: 'Bryan Stiven Múnera Ramos', phone: '3213892061', email: 'bryan.munerall@gmail.com', contract_number: '2488-2025', contract_end: '2025-12-16', role: 'Asistente de Cámara' },
  { name: 'Walter Rodrigo Murillo Salgado', phone: '320 2952396', email: 'wmurillosalgado@gmail.com', contract_number: '1878-2025', contract_end: '2025-12-17', role: 'Asistente de Cámara' },
  { name: 'Didier Orlando Muriago Moreno', phone: '310 2282017', email: 'didier2@hotmail.com', contract_number: '1838-2025', contract_end: '2025-12-17', role: 'Camarógrafo' },
  { name: 'Bryan Jesús Rodríguez Franco', phone: '312 5687732', email: 'bryanrodriq544@gmail.com', contract_number: '1853-2025', contract_end: '2025-12-17', role: 'Asistente de Cámara' },
  { name: 'Laura Vargas Esteban', phone: '300 2123766', email: 'Lauraesteban2323@gmail.com', contract_number: '2023-2025', contract_end: '2025-12-17', role: 'Camarógrafo' },
  { name: 'William José Ruiz Cabrera', phone: '313 8024275', email: 'w.ruizcamara68@gmail.com', contract_number: '1910-2025', contract_end: '2025-12-18', role: 'Camarógrafo' },
  { name: 'José Ramiro Balaguera Pérez', phone: '350 2026435', email: 'simonr.j7@gmail.com', contract_number: '1385-2025', contract_end: '2025-12-18', role: 'Camarógrafo' },
  { name: 'José Guillermo Mesa Galindo', phone: '323 8033054', email: 'mesa24103@gmail.com', contract_number: '1360-2025', contract_end: '2025-12-18', role: 'Asistente de Reporteros' },
  { name: 'Oscar David Ortega Cante', phone: '320 4447175', email: 'odoc.9090@gmail.com', contract_number: '1363-2025', contract_end: '2025-12-18', role: 'Camarógrafo' },
  { name: 'Floresmiro Luna Acosta', phone: '312 4006982', email: 'efeluna130@hotmail.com', contract_number: '1515-2025', contract_end: '2025-12-21', role: 'Camarógrafo' },
  { name: 'Alexander Valencia Martínez', phone: '3203446590', email: 'alexander.valencia79@gmmail.com', contract_number: '', contract_end: '2025-12-21', role: 'Camarógrafo' },
  { name: 'César Andrés Morales', phone: '310 5508527', email: 'ceanmobe@hotmail.com', contract_number: '1263-2025', contract_end: '2025-12-23', role: 'Camarógrafo' },
  { name: 'Johan Daniel Moreno Pereira', phone: '311 2117045', email: 'danicineroiv@hotmail.com', contract_number: '2429-2025', contract_end: '2025-12-26', role: 'Asistente de Cámara' },
  { name: 'Andrés Ramírez Torres', phone: '302 4495054', email: 'trandres1967@gmail.com', contract_number: '1497-2025', contract_end: '2025-12-28', role: 'Camarógrafo' },
  { name: 'Luis Enrique Muñoz Palacio', phone: '300 4423890', email: 'enriko91@gmail.com', contract_number: '1247-2025', contract_end: '2025-12-30', role: 'Camarógrafo' },
  { name: 'Carlos Alfonso Wilches Garay', phone: '310 6888812', email: 'cawg76@gmail.com', contract_number: '1733-2025', contract_end: '2025-12-30', role: 'Camarógrafo' },
  { name: 'David Eduardo Patarroyo Montañez', phone: '301 6048095', email: 'dpaudiovisualesfilms@gmail.com', contract_number: '2105-2025', contract_end: '2025-12-31', role: 'Camarógrafo' },

  // VIDEO, LUCES Y FOTOGRAFÍA
  { name: 'José Leonardo Castro Rojas', phone: '316 7471729', email: '', contract_number: '2529-2025', contract_end: '2025-12-11', role: 'Operador de Video' },
  { name: 'Rubén Darío Wilches Garay', phone: '311 2269572', email: 'rdwrgu@gmail.com', contract_number: '1750-2025', contract_end: '2025-12-11', role: 'Director de Fotografía' },
  { name: 'Emmanuel Santiago Espinosa Wilches', phone: '311 6563378', email: 'esewilches@hotmail.com', contract_number: '2224-2025', contract_end: '2025-12-14', role: 'Asistente de Luces' },
  { name: 'Iván Artistizabal', phone: '312 5404387', email: 'imagenivan@gmail.com', contract_number: '2481-2025', contract_end: '2025-12-15', role: 'Operador de Video' },
  { name: 'Horacio Andrés Suárez Reyes', phone: '315 4869449', email: 'suarezreyes@hotmail.com', contract_number: '1442-2025', contract_end: '2025-12-15', role: 'Operador de Video' },
  { name: 'Pedro Pablo Torres Torres', phone: '313 8841376', email: 'kefalt2@hotmail.com', contract_number: '1712-2025', contract_end: '2025-12-16', role: 'Operador de Video' },
  { name: 'Santiago Torres Yaselga', phone: '302 4870417', email: 'santi.torres.yaselga@gmail.com', contract_number: '1425-2025', contract_end: '2025-12-16', role: 'Asistente de Luces' },
  { name: 'Julio Edgar Lopez', phone: '310 2489761', email: 'Julioedgar.lopez@Gmail.com', contract_number: '1318-2025', contract_end: '2025-12-16', role: 'Asistente de Luces' },
  { name: 'Javier Manuel Galeano Daza', phone: '314 2847098', email: 'jaivermgaleano@gmail.com', contract_number: '1384-2025', contract_end: '2025-12-18', role: 'Asistente de Luces' },
  { name: 'Maicol Villalobos', phone: '312 5730892', email: 'villalobosmaiccol@gmail.com', contract_number: '1509-2025', contract_end: '2025-10-21', role: 'Asistente de Luces' },

  // VESTUARIO Y MAQUILLAJE
  { name: 'Dora Rincón León', phone: '312 3510423', email: 'rinconleondoraidaly@gmail.com', contract_number: '1345-2025', contract_end: '', role: 'Vestuarista' },
  { name: 'Ana Herminda Villalba', phone: '310 3170898', email: 'anavillalba5@hotmail.com', contract_number: '1371-2025', contract_end: '', role: 'Maquilladora' },
  { name: 'María Fernanda Espinosa', phone: '320 3810201', email: 'mafee93@hotmail.com', contract_number: '1409-2025', contract_end: '', role: 'Maquilladora' },
  { name: 'Bibiana González', phone: '3195499648', email: 'Gonzalezrbibiana@gmail.com', contract_number: '', contract_end: '2025-11-13', role: 'Maquilladora' },
  { name: 'Mercedes Malagón Prieto', phone: '313 3710571', email: 'mercedes.malagon12@gmail.com', contract_number: '1511-2025', contract_end: '2025-11-20', role: 'Vestuarista' },
  { name: 'Ymeth Darmely Tovar Vargas', phone: '312 3458438', email: 'dartovar@hotmail.com', contract_number: '', contract_end: '2025-12-07', role: 'Vestuarista' },
  { name: 'Catalina Acevedo', phone: '313 8696554', email: 'cata.acevedo52@gmail.com', contract_number: '', contract_end: '2025-12-10', role: 'Maquilladora' },
  { name: 'Carlos Andrés Acosta Jiménez', phone: '304 6785914', email: 'Carlosacostaaj@gmail.com', contract_number: '1338-2025', contract_end: '2025-12-10', role: 'Vestuarista' },
  { name: 'Mariluz Beltrán Beltrán', phone: '319 3369490', email: 'maryluzbeltranbelran@gmail.com', contract_number: '1930-2025', contract_end: '2025-12-20', role: 'Vestuarista' },
  { name: 'Lady Andrea Ortiz Cristo', phone: '316 0555018', email: 'ortitzcrisandrea@gmail.com', contract_number: '1954-2025', contract_end: '2025-12-24', role: 'Maquilladora' },

  // CONTRIBUCIONES, ARCHIVO Y GRAFICACIÓN
  { name: 'Diana Carolina Benavides García', phone: '313 4217091', email: 'dibonidiek@hotmail.com', contract_number: '1052-2025', contract_end: '', role: 'Contribuciones' },
  { name: 'Sergio Adrián Contreras Narváez', phone: '350 3402935', email: 'sergiocn92@gmail.com', contract_number: '1300-2025', contract_end: '', role: 'Contribuciones' },
  { name: 'Michel Enrique Torres Urrego', phone: '319 2695045', email: 'michael20.torres@hotmail.com', contract_number: '', contract_end: '2025-12-22', role: 'Contribuciones' },
  { name: 'Pedro Antonio Díaz Cifuentes', phone: '312 3347722', email: 'peddia@hotmail.com', contract_number: '1983-2025', contract_end: '2025-09-25', role: 'Operador de Sonido' },
];

async function updatePersonnel() {
  try {
    console.log('Conectando a la base de datos...');

    // Obtener todo el personal actual
    const currentPersonnel = await pool.query('SELECT * FROM personnel ORDER BY name');
    console.log(`\nTotal de personal en la base de datos: ${currentPersonnel.rows.length}`);

    let updatedCount = 0;
    let notFoundCount = 0;
    const notFoundList = [];
    const updateLog = [];

    // Función para normalizar nombres (quitar acentos y convertir a minúsculas)
    function normalizeName(name) {
      return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
    }

    // Función para convertir fecha en español a formato YYYY-MM-DD
    function parseSpanishDate(dateStr) {
      if (!dateStr) return null;

      const monthMap = {
        'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
        'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
        'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12',
        'december': '12'
      };

      // Formato: "9 de diciembre de 2025" o "2025-12-09"
      if (dateStr.includes('-')) {
        return dateStr;
      }

      const parts = dateStr.toLowerCase().match(/(\d+)\s+de\s+(\w+)\s+de\s+(\d{4})/);
      if (parts) {
        const day = parts[1].padStart(2, '0');
        const month = monthMap[parts[2]];
        const year = parts[3];
        return `${year}-${month}-${day}`;
      }

      return null;
    }

    console.log('\n=== ACTUALIZANDO INFORMACIÓN DEL PERSONAL ===\n');

    for (const contractor of contractorData) {
      const normalizedContractorName = normalizeName(contractor.name);

      // Buscar coincidencia en la base de datos (exacta o parcial)
      const match = currentPersonnel.rows.find(person => {
        const normalizedPersonName = normalizeName(person.name);

        // Coincidencia exacta
        if (normalizedPersonName === normalizedContractorName) {
          return true;
        }

        // Coincidencia parcial: el nombre de la BD está contenido al inicio del nombre del CSV
        // Ejemplo: "Alejandro La Torre" (BD) coincide con "Alejandro La Torre Villalba" (CSV)
        if (normalizedContractorName.startsWith(normalizedPersonName + ' ')) {
          return true;
        }

        const contractorParts = normalizedContractorName.split(' ');
        const personParts = normalizedPersonName.split(' ');

        // Coincidencia por primeros dos nombres
        if (contractorParts.length >= 2 && personParts.length >= 2) {
          if (contractorParts[0] === personParts[0] &&
              contractorParts[1] === personParts[1]) {
            return true;
          }
        }

        // Coincidencia por primer nombre + último apellido
        // Ejemplo: "Diego Felipe Gamboa Heredia" (CSV) coincide con "Diego Gamboa" (BD)
        if (contractorParts.length >= 2 && personParts.length >= 2) {
          const contractorFirstName = contractorParts[0];
          const contractorLastName = contractorParts[contractorParts.length - 1];
          const contractorSecondLastName = contractorParts[contractorParts.length - 2];

          const personFirstName = personParts[0];
          const personLastName = personParts[personParts.length - 1];

          // Coincidir primer nombre + último apellido
          if (contractorFirstName === personFirstName &&
              (contractorLastName === personLastName || contractorSecondLastName === personLastName)) {
            return true;
          }
        }

        return false;
      });

      if (match) {
        // Preparar datos para actualización
        const phone = contractor.phone?.replace(/\s/g, '') || match.phone;
        const email = contractor.email || match.email;
        const contractEnd = parseSpanishDate(contractor.contract_end) || match.contract_end;

        // Actualizar el registro
        await pool.query(
          `UPDATE personnel
           SET email = $1, phone = $2, contract_end = $3, updated_at = NOW()
           WHERE id = $4`,
          [email, phone, contractEnd, match.id]
        );

        updatedCount++;
        updateLog.push({
          name: contractor.name,
          email,
          phone,
          contract_end: contractEnd,
          contract_number: contractor.contract_number
        });

        console.log(`✓ ${contractor.name}`);
        console.log(`  Email: ${email}`);
        console.log(`  Teléfono: ${phone}`);
        console.log(`  Fin de contrato: ${contractEnd || 'N/A'}`);
        console.log(`  N° Contrato: ${contractor.contract_number || 'N/A'}\n`);

      } else {
        notFoundCount++;
        notFoundList.push(contractor.name);
        console.log(`✗ NO ENCONTRADO: ${contractor.name}`);
      }
    }

    console.log('\n=== RESUMEN DE ACTUALIZACIÓN ===');
    console.log(`Total de registros en CSV: ${contractorData.length}`);
    console.log(`Actualizados exitosamente: ${updatedCount}`);
    console.log(`No encontrados en la base de datos: ${notFoundCount}`);

    if (notFoundList.length > 0) {
      console.log('\n=== PERSONAL NO ENCONTRADO EN LA BASE DE DATOS ===');
      notFoundList.forEach(name => console.log(`- ${name}`));
    }

    console.log('\n¡Actualización completada!');
    process.exit(0);

  } catch (error) {
    console.error('Error durante la actualización:', error);
    process.exit(1);
  }
}

updatePersonnel();
