Actúa como un Arquitecto de Bases de Datos Relacionales y Desarrollador Senior de SQL. 

Necesito que diseñes y construyas el modelo de base de datos relacional para la aplicación de administración de torneos deportivos de un colegio en Medellín, Colombia.

### 1. Contexto del Proyecto
El colegio organiza torneos interclases e intercolegiados de múltiples disciplinas (Fútbol, Baloncesto, Voleibol, etc.). Se requiere una base de datos robusta para respaldar la aplicación móvil/web del colegio.

### 2. Reglas de Negocio Específicas
* **Deportes y Torneos:** Se pueden crear múltiples torneos para diferentes deportes.
* **Categorías:** Cada torneo maneja exactamente tres categorías de edad:
  - Infantil: 9 a 12 años.
  - Junior: 13 a 14 años.
  - Veteranos: Mayores de 15 años (>= 15).
* **Equipos y Jugadores:** Un jugador pertenece a un equipo. La fecha de nacimiento del jugador debe validar a qué categoría pertenece.
* **Partidos y Programación:** Se deben registrar partidos programados (fecha, hora, lugar/cancha, equipo local, equipo visitante) y partidos finalizados con sus respectivos marcadores/resultados.

### 3. Entregables Requeridos

#### A. Modelo Entidad-Relación (MER)
- Descripción clara de las entidades, atributos, llaves primarias (PK) y llaves foráneas (FK).
- Diagrama en sintaxis Mermaid.js para visualizar el modelo relacional.

#### B. Script DDL (Creación de la Estructura en SQL)
- Código SQL estándar (compatible con PostgreSQL o SQLITE) para la creación de tablas.
- Definición de restricciones de integridad (`PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`).
- Uso de restricciones `CHECK` para validar estados de partidos, tipos de deportes y rangos de edades/fechas según las categorías.

#### C. Script DML (Datos de Prueba)
- Inserción de datos ficticios contextualizados en Medellín (nombres de equipos locales, jugadores, colegios rivales, etc.).
- Incluir al menos: 2 Deportes, 2 Torneos, 6 Equipos, 18 Jugadores, 4 Partidos Programados y 6 Partidos Finalizados con resultados.

#### D. Consultas SQL (DQL) Requeridas
Escribe las siguientes consultas SQL optimizadas y comentadas:
1. **Creación/Registro:** Sentencias de ejemplo para registrar un nuevo torneo, inscribir un equipo y asociar jugadores a un equipo.
2. **Consulta de Partidos Programados:** Listar los próximos partidos pendientes con fecha, hora, deporte, categoría y nombres de los equipos enfrentados.
3. **Consulta de Histórico de Resultados:** Listar los partidos ya jugados con sus marcadores finales, ordenados por fecha descendente.
4. **Tabla de Posiciones y Estadísticas de Equipos:** Una vista (`VIEW`) o consulta que calcule por equipo:
   - Partidos Jugados (PJ)
   - Partidos Ganados (PG)
   - Partidos Empatados (PE)
   - Partidos Perdidos (PP)
   - Goles/Puntos a Favor (GF)
   - Goles/Puntos en Contra (GC)
   - Diferencia de Puntos/Goles (DG)
   - Puntos Totales acumulados

Estructura el resultado paso a paso con explicaciones claras para cada script.
