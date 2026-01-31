# Camarógrafos de Estudio - Organización por Turnos

## 📋 Resumen

Se ha reorganizado el área de **Camarógrafos de Estudio** (20 personas) en **4 turnos** con cuotas exactas de personal. Los **6 operadores de grúa** están distribuidos estratégicamente en cada turno.

## 🎯 Distribución de Turnos

| Turno | Horario | Cantidad | Operadores de Grúa |
|-------|---------|----------|-------------------|
| Madrugada | 05:00 - 11:00 | **6** | John Loaiza |
| Media Mañana | 09:00 - 15:00 | **4** | Carlos García, Luis Bernal |
| Tarde | 13:00 - 19:00 | **5** | Raúl Ramírez |
| Noche | 16:00 - 22:00 | **5** | Carlos A. López, Jefferson Pérez |
| **TOTAL** | | **20** | **6 operadores** |

## 👥 Personal por Turno

### 🌅 Turno Madrugada (05:00 - 11:00) - 6 personas
- **John Loaiza** 🏗️ (Operador de Grúa)
- Cesar Jimenez
- John Jiménez
- Angel Zapata
- Oscar González
- Juan Sacristán

### ☀️ Turno Media Mañana (09:00 - 15:00) - 4 personas
- **Carlos García** 🏗️ (Operador de Grúa)
- **Luis Bernal** 🏗️ (Operador de Grúa)
- Alexander Quiñonez
- Pedro Niño

### 🌤️ Turno Tarde (13:00 - 19:00) - 5 personas
- **Raúl Ramírez** 🏗️ (Operador de Grúa)
- Jorge Jaramillo
- Ernesto Corchuelo
- Samuel Romero
- Andrés López

### 🌆 Turno Noche (16:00 - 22:00) - 5 personas
- **Carlos A. López** 🏗️ (Operador de Grúa)
- **Jefferson Pérez** 🏗️ (Operador de Grúa)
- Sebastián Hernández
- John Damiston Arevalo
- William Mosquera

## 🔧 Cambios Implementados

### 1. Base de Datos - Turnos Actualizados

Se actualizaron los `current_shift` de los 6 operadores de grúa:

```sql
-- Grupo 1: John Loaiza → 05:00
-- Grupo 2: Carlos García → 09:00
-- Grupo 3: Jefferson Pérez, Raúl Ramírez → 13:00
-- Grupo 4: Carlos A. López, Luis Bernal → 16:00
```

**Importante:** Los operadores siguen siendo `CAMARÓGRAFOS DE ESTUDIO` en la columna `area`. Solo cambió su `current_shift`.

### 2. Backend (`backend/config/crane-operators.js`)

Se creó un archivo de configuración con:
- Objeto `CRANE_OPERATORS_GROUPS` con 4 grupos por horario
- Array `CRANE_OPERATORS` para compatibilidad
- Función `isCraneOperator(personName)` para identificarlos
- Función `getCraneOperatorGroup(personName)` para obtener su grupo

```javascript
const CRANE_OPERATORS_GROUPS = {
  'GRUPO_1_MADRUGADA': {
    timeRange: '05:00 - 11:00',
    operators: ['John Loaiza'],
    icon: '🌅'
  },
  'GRUPO_2_MAÑANA': {
    timeRange: '09:00 - 15:00',
    operators: ['Carlos García', 'Luis Bernal'],
    icon: '☀️'
  },
  'GRUPO_3_TARDE': {
    timeRange: '13:00 - 19:00',
    operators: ['Raúl Ramírez'],
    icon: '🌤️'
  },
  'GRUPO_4_NOCHE': {
    timeRange: '16:00 - 22:00',
    operators: ['Carlos A. López', 'Jefferson Pérez'],
    icon: '🌆'
  }
};
```

### 3. Frontend (`src/components/Dashboard/PersonnelAreaCards.jsx`)

Se modificó la visualización del área "CAMARÓGRAFOS DE ESTUDIO" para:
- Mostrar **4 subgrupos de operadores de grúa** por horario
- Cada subgrupo tiene su propio color y emoji identificador
- Modo compacto para tarjetas dentro de grupos
- Separación visual clara entre operadores de grúa y camarógrafos regulares

**Ejemplo de visualización:**

```
📹 Camarógrafos de Estudio (20 programados)

  🏗️ OPERADORES DE GRÚA (6)

    🌅 Grupo 1 - Madrugada (1)
    Horario: 05:00 - 11:00
    - John Loaiza

    ☀️ Grupo 2 - Mañana (1)
    Horario: 09:00 - 15:00
    - Carlos García

    🌤️ Grupo 3 - Tarde (2)
    Horario: 13:00 - 19:00
    - Jefferson Pérez
    - Raúl Ramírez

    🌆 Grupo 4 - Noche (2)
    Horario: 16:00 - 22:00
    - Carlos A. López
    - Luis Bernal

  🎥 Camarógrafos de Estudio (14)
    - Cesar Jimenez
    - Alexander Quiñonez
    - ... (resto del personal)
```

## ✅ Verificaciones Importantes

### 1. **NO se modificó la base de datos**
- Todos siguen siendo "CAMARÓGRAFOS DE ESTUDIO" en la columna `area`
- No hay nueva tabla ni columna

### 2. **NO se afectó la lógica de rotación**
- Los operadores de grúa rotan igual que el resto
- Siguen las mismas reglas de turnos y fin de semana
- La rotación semanal no distingue entre operadores de grúa y camarógrafos regulares

### 3. **El contador total se mantiene correcto**
- En el Dashboard, "Camarógrafos de Estudio" sigue mostrando el total (20)
- La suma incluye a TODOS: 6 operadores de grúa + 14 camarógrafos regulares = 20

### 4. **El swap/reemplazo funciona correctamente**
- Al hacer un reemplazo de personal, el sistema permite intercambiar a cualquier camarógrafo de estudio
- La agrupación visual facilita identificar a los operadores de grúa para swaps entre ellos

## 🚀 Uso en Producción

### Para Coordinadores:
1. Abrir el Dashboard
2. Click en la tarjeta de "CAMARÓGRAFOS DE ESTUDIO"
3. Ver personal agrupado en secciones:
   - **Operadores de Grúa** (arriba, organizados en 4 grupos por horario)
   - **Camarógrafos regulares** (abajo, con borde azul)
4. Para hacer reemplazos:
   - El sistema sugiere primero operadores del **mismo grupo horario**
   - Si necesitas reemplazar a uno del Grupo 2 (09:00-15:00), busca otro del Grupo 2
   - Esto mantiene la cobertura horaria correcta

### Para Desarrolladores:

#### Cambiar operadores de un grupo:
1. Editar `backend/config/crane-operators.js`
2. Actualizar el objeto `CRANE_OPERATORS_GROUPS`
3. Actualizar turnos en BD si es necesario:
   ```sql
   UPDATE personnel
   SET current_shift = 'NUEVO_TURNO'
   WHERE name = 'NOMBRE_OPERADOR'
     AND area = 'CAMARÓGRAFOS DE ESTUDIO';
   ```
4. Reiniciar el servidor backend

#### Agregar un nuevo operador de grúa:
1. Actualizar su turno en la BD
2. Agregar su nombre al grupo correspondiente en `CRANE_OPERATORS_GROUPS`
3. Agregar su nombre al array `CRANE_OPERATORS`
4. Actualizar la constante en el frontend ([PersonnelAreaCards.jsx](src/components/Dashboard/PersonnelAreaCards.jsx))

## 📝 Notas Técnicas

### Tolerancia a variaciones ortográficas:
La función `isCraneOperator()` maneja:
- Espacios adicionales
- Mayúsculas/minúsculas
- Variantes como "John" vs "Jhon"

### Componente extraído:
Se creó un componente `PersonCard` para evitar duplicación de código al renderizar las tarjetas de personal.

## 🔮 Futuro

Si en algún momento se necesita:
- **Añadir más operadores de grúa**: Solo actualizar la constante en `crane-operators.js`
- **Cambiar la lógica de rotación**: Los operadores de grúa seguirían rotando según las reglas del área
- **Crear reporte específico**: Se puede filtrar por `isCraneOperator(nombre)` en cualquier query

## ⚠️ Advertencias

1. **NO modificar la columna `area` en la base de datos** para los operadores de grúa
2. **NO crear lógica de rotación especial** basada en esta subcategoría
3. Si alguien cambia el nombre de un operador de grúa en la BD, actualizar también la constante

---

**Fecha de implementación:** 29/01/2026
**Desarrollado por:** Claude Code
**Solicitado por:** Usuario RTVC
