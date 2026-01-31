# 🎥 GRUPOS DE ROTACIÓN - CAMARÓGRAFOS DE ESTUDIO

**Sistema de Grupos Implementado:** 30 de enero de 2026

---

## 📋 ESTRUCTURA DE GRUPOS

Los 20 Camarógrafos de Estudio están organizados en **4 grupos fijos (A, B, C, D)** de 5 personas cada uno.

Cada grupo incluye:
- 1 Operador de Grúa 🏗️ (líder técnico del grupo)
- 4 Camarógrafos de Estudio

Los grupos rotan **de forma independiente**, manteniendo su cohesión como equipo.

---

## 🔴 GRUPO A

**Operador de Grúa:** John Loaiza 🏗️

### Integrantes:
1. **John Loaiza** 🏗️ (Turno: 05:00)
2. Angel Zapata (Turno: 05:00)
3. Oscar González (Turno: 05:00)
4. Ernesto Corchuelo (Turno: 13:00)
5. Carlos A. López (Turno: 16:00)

---

## 🔵 GRUPO B

**Sin operador de grúa asignado** (Grupo operativo estándar)

### Integrantes:
1. Cesar Jimenez (Turno: 05:00)
2. Alexander Quiñonez (Turno: 09:00)
3. Jorge Jaramillo (Turno: 13:00)
4. John Damiston Arevalo (Turno: 16:00)
5. Sebastián Hernández (Turno: 16:00)

---

## 🟢 GRUPO C

**Operadores de Grúa:** Luis Bernal 🏗️ y Jefferson Pérez 🏗️ (Co-líderes)

### Integrantes:
1. **Luis Bernal** 🏗️ (Turno: 09:00)
2. **Jefferson Pérez** 🏗️ (Turno: 16:00)
3. John Jiménez (Turno: 05:00)
4. Pedro Niño (Turno: 09:00)
5. Raul Ramírez (Turno: 13:00)

---

## 🟡 GRUPO D

**Operador de Grúa:** Carlos García 🏗️

### Integrantes:
1. **Carlos García** 🏗️ (Turno: 09:00)
2. Juan Sacristán (Turno: 05:00)
3. Andrés López (Turno: 13:00)
4. Samuel Romero (Turno: 13:00)
5. William Mosquera (Turno: 16:00)

---

## 📊 DISTRIBUCIÓN POR TURNOS (Rotación Semanal)

**IMPORTANTE**: Los grupos rotan semanalmente. La distribución mostrada abajo es para la **Semana 1** como ejemplo. En las semanas siguientes, cada grupo completo se mueve al siguiente turno.

### Ejemplo: Semana 1

#### 🌅 Turno Madrugada (05:00-11:00) - Grupo A (5 personas)
- John Loaiza 🏗️ (Operador de Grúa)
- Angel Zapata
- Oscar González
- Ernesto Corchuelo
- Carlos A. López

#### ☀️ Turno Media Mañana (09:00-15:00) - Grupo B (5 personas)
- Cesar Jimenez
- Alexander Quiñonez
- Jorge Jaramillo
- John Damiston Arevalo
- Sebastián Hernández

#### 🌤️ Turno Tarde (13:00-19:00) - Grupo C (5 personas)
- Luis Bernal 🏗️ (Operador de Grúa)
- Jefferson Pérez 🏗️ (Operador de Grúa)
- John Jiménez
- Pedro Niño
- Raul Ramírez

#### 🌆 Turno Noche (16:00-22:00) - Grupo D (5 personas)
- Carlos García 🏗️ (Operador de Grúa)
- Juan Sacristán
- Andrés López
- Samuel Romero
- William Mosquera

**Nota**: En la Semana 2, el Grupo A estará en turno 09:00, Grupo B en 13:00, Grupo C en 16:00, y Grupo D en 05:00, y así sucesivamente.

---

## 🔄 CÓMO FUNCIONA LA ROTACIÓN

### Rotación Semanal por Grupos
Los 4 grupos (A, B, C, D) rotan **SEMANALMENTE** entre los 4 turnos. Cada grupo COMPLETO se mueve al siguiente turno cada semana:

**Ejemplo de rotación:**
- **Semana 1**: Grupo A=05:00, Grupo B=09:00, Grupo C=13:00, Grupo D=16:00
- **Semana 2**: Grupo A=09:00, Grupo B=13:00, Grupo C=16:00, Grupo D=05:00
- **Semana 3**: Grupo A=13:00, Grupo B=16:00, Grupo C=05:00, Grupo D=09:00
- **Semana 4**: Grupo A=16:00, Grupo B=05:00, Grupo C=09:00, Grupo D=13:00
- **Semana 5**: Vuelve al ciclo (igual a Semana 1)

### Ventajas de la Rotación por Grupos
Los grupos se mantienen como **unidades cohesionadas** que rotan juntas:
- ✅ Facilita la coordinación operativa
- ✅ Mantiene operador de grúa como líder técnico del grupo
- ✅ Permite seguimiento de desempeño por equipo
- ✅ Simplifica comunicación y logística
- ✅ Todos los grupos pasan por todos los turnos equitativamente

### Base de Datos
El campo `grupo` en la tabla `personnel` identifica a qué grupo pertenece cada camarógrafo:
- **Grupo A**: Liderado por John Loaiza (operador de grúa)
- **Grupo B**: Sin operador de grúa específico
- **Grupo C**: Liderado por Luis Bernal y Jefferson Pérez (operadores de grúa)
- **Grupo D**: Liderado por Carlos García (operador de grúa)

---

## 🏗️ OPERADORES DE GRÚA POR GRUPO

| Grupo | Operador de Grúa | Turno Actual | Color |
|-------|------------------|--------------|-------|
| A | John Loaiza | 05:00 | 🔴 Rojo |
| B | Sin asignar | - | 🔵 Azul |
| C | Luis Bernal & Jefferson Pérez | 09:00 & 16:00 | 🟢 Verde |
| D | Carlos García | 09:00 | 🟡 Amarillo |

---

## 📁 ARCHIVOS RELACIONADOS

- **Base de datos**: Campo `grupo` en tabla `personnel`
- **Backend**: `backend/config/crane-operators.js` - Configuración de grupos
- **Scripts**: `backend/scripts/asignar-grupos-camaras.js` - Script de asignación
- **Lógica de rotación**: `backend/routes/schedule.js` - Asignación de turnos

---

## ✅ BENEFICIOS DEL SISTEMA DE GRUPOS

1. **Cohesión de equipo**: Los grupos trabajan juntos regularmente
2. **Liderazgo técnico**: Cada grupo tiene un operador de grúa experimentado
3. **Flexibilidad**: Los grupos pueden rotar independientemente
4. **Trazabilidad**: Fácil seguimiento del desempeño por grupo
5. **Coordinación**: Mejor comunicación dentro de cada grupo
6. **Balance**: 5 personas por grupo para distribución equitativa

---

## 📝 NOTAS IMPORTANTES

- Los grupos son **permanentes** y no cambian con la rotación de turnos
- Cada persona mantiene su `current_shift` individual en la base de datos
- Los enroques pueden realizarse dentro o entre grupos según necesidad operativa
- El operador de grúa es el referente técnico de cada grupo
- Los 4 grupos garantizan cobertura en todos los turnos del día

---

**Última actualización:** 30 de enero de 2026
**Sistema implementado por:** Claude Code (Anthropic)
