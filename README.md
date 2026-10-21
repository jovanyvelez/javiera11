# 🎓 Currículo 2026 — Tecnología e Informática · Grado Once

> Una serie de **minicursos interactivos** diseñados para enseñar tecnología e informática a jóvenes de 15 a 17 años. Sin servidores, sin instalaciones, sin frameworks complicados: solo **abre el navegador y aprende**.

---

## ✨ ¿Qué es esto?

Este repositorio es un **currículo completo de aprendizaje autodirigido** para estudiantes de grado once. Cada minicurso:

- ⏱️ Dura aproximadamente **3 horas y 45 minutos** de estudio.
- 🎮 Combina **teoría, ejemplos prácticos y actividades interactivas** (quizzes, juegos de roles, simulaciones, constructores).
- 🏆 Tiene **sistema de progreso e insignias** que motiva a avanzar.
- 🎨 Posee **identidad visual propia** con paletas de color únicas por temática.
- 💾 **Guarda automáticamente tu avance** en el navegador.

Está pensado, escrito y diseñado para que un estudiante pueda recorrerlo solo, sin perder en ningún momento las ganas de continuar.

---

## 📚 Cursos disponibles

### ⚡ Curso 1 — Algoritmos en C#

Ruta completa de **10 clases** construida con **Visual Studio Code + .NET 10 (C# 14)**. Cada clase dura ~3 h 45 min, incluye taller final y sigue los subtemas de la guía de la asignatura (código TL007).

| Clase | Tema | Estado |
|-------|------|--------|
| **Clase 1** | VS Code + .NET 10: instalar C# Dev Kit y el SDK, crear y ejecutar el primer proyecto, terminal, depurador con F5 | ✅ Disponible |
| **Clase 2** | Tipos de variables: int, double, decimal, char, string, bool, var, tipos nullable y conversiones | ✅ Disponible |
| **Clase 3** | Operadores aritméticos, de comparación y lógicos + precedencia, asignación compuesta y trampas | ✅ Disponible |
| **Clase 4** | Condicionales: if, else, else if, switch clásico, switch expression y patrones modernos | ✅ Disponible |
| **Clase 5** | Ciclos: while, do-while, for, foreach, break/continue y ciclos anidados | ✅ Disponible |
| **Clase 6** | Acumuladores, contadores y banderas: inicializar, recorrer, acumular y decidir | ✅ Disponible |
| **Clase 7** | Vectores y matrices: arreglos 1D/2D, recorridos, búsquedas, List\<T\>, LINQ | ✅ Disponible |
| **Clase 8** | Funciones: parámetros, retorno, paso por valor vs. referencia, sobrecarga y recursión | ✅ Disponible |
| **Clase 9** | Menús de consola con funciones: while + switch, modularización, validación de entrada | ✅ Disponible |
| **Clase 10** | POO: clases, objetos, atributos, métodos, constructores, herencia y composición | ✅ Disponible |

### 📐 Curso 2 — Análisis y Diseño de Software

| Clase | Tema | Estado |
|-------|------|--------|
| **Clase 1** | Análisis y diseño · Ciclo de vida del software · Metodologías ágiles vs. estructuradas | ✅ Disponible |
| **Clase 2** | Requerimientos funcionales y no funcionales · Atributos de calidad ISO 25010 · Historias de usuario | ✅ Disponible |
| **Clase 3** | Elicitación de requerimientos · Entrevistas, encuestas y observación · Juego de roles cliente-analista | ✅ Disponible |
| **Clase 4** | Documentación de requerimientos · Casos de uso · Estándar IEEE 830 · Revisión cruzada | ✅ Disponible |

### 🔮 Otros cursos

- 🗄️ **Bases de Datos** (9 clases) — Modelo entidad-relación, SQL, normalización, consultas.
- 🛠️ **Herramientas de Programación II** (14 clases) — Python, FastAPI, Git y GitHub.

---

## 🚀 Cómo usarlo

### Para estudiantes

1. Descarga o clona el repositorio.
2. Abre el archivo `index.html` de la raíz en cualquier navegador moderno (Chrome, Firefox, Edge, Safari).
3. ¡Empieza el viaje! Desde la página principal puedes acceder a cualquier clase.

> 💡 **Tip:** tu progreso se guarda localmente en el navegador. Si vuelves desde el mismo computador y navegador, retomarás donde quedaste.

### Para docentes

- Puedes usar este material como **base para tus clases**: proyéctalo o pide a los estudiantes que lo recorran en casa.
- Cada curso incluye una **ruta sugerida** con módulos en orden, pero los estudiantes pueden saltar libremente.
- Las actividades prácticas (talleres, juegos, retos finales) son ideales para **trabajar en parejas o grupos**.

---

## 🏗️ Arquitectura del proyecto

```
once/
├── 🎓 index.html, estilos.css, app.js     ← Página principal (hub)
│
├── ⚡ Algoritmos con C#/                    ← 10 clases (C# 14 / .NET 10)
│   ├── uno-curso-entorno-csharp/           ← Clase 1: VS Code + .NET 10
│   ├── dos-curso-variables-csharp/         ← Clase 2: tipos de variables
│   ├── tres-curso-operadores-csharp/       ← Clase 3: operadores
│   ├── cuatro-curso-condicionales-csharp/  ← Clase 4: condicionales
│   ├── cinco-curso-ciclos-csharp/          ← Clase 5: ciclos
│   ├── seis-curso-acumuladores-csharp/     ← Clase 6: acumuladores
│   ├── siete-curso-arreglos-csharp/        ← Clase 7: vectores y matrices
│   ├── ocho-curso-funciones-csharp/        ← Clase 8: funciones
│   ├── nueve-curso-menus-csharp/           ← Clase 9: menús
│   └── diez-curso-poo-csharp/              ← Clase 10: POO
│
├── 📐 analisis-diseno/                     ← 7 clases
├── 🗄️ bases-de-datos/                      ← 9 clases
└── 🛠️ herramientas-prog-ii/                ← 14 clases
```

### Filosofía: "tres archivos por curso"

Cada curso es **completamente autocontenido** en tres archivos:

| Archivo | Función |
|---------|---------|
| `index.html` | Todo el contenido textual del curso, dividido en módulos |
| `estilos.css` | Diseño visual con la paleta de colores propia del curso |
| `app.js` | Navegación, progreso, quizzes y actividades interactivas |

No hay frameworks, ni librerías externas, ni paso de compilación. Si quieres, puedes **abrir un curso desde una memoria USB** y funcionará igual.

---

## 🎨 Características pedagógicas

Cada minicurso fue diseñado con principios claros:

- **Lenguaje sencillo pero técnico:** explicaciones cercanas, sin abandonar el rigor.
- **Analogías cotidianas:** ejemplos con pizzerías, panaderías, biblioteca del colegio, app de comida...
- **Talleres prácticos:** no solo leer — el estudiante construye, decide, elige.
- **Quizzes con retroalimentación inmediata:** verde/rojo, explicación de cada error.
- **Sistema de insignias:** desbloqueables al completar módulos y actividades.
- **Barra de progreso visible:** siempre sabes dónde estás del curso.
- **Casos simulados realistas:** problemas tomados de contextos escolares y profesionales.

---

## 🌈 Identidad visual

Cada curso tiene una paleta diferente para que sean fáciles de distinguir:

| Curso | Tema visual | Colores principales |
|-------|-------------|---------------------|
| Algoritmos en C# (clases 1‑10) | Código y energía | Violeta · Cian · Esmeralda · Ámbar · Rosa · Morado |
| Análisis y Diseño (Clase 1) | Plano arquitectónico | Azul profundo · Dorado |
| Requerimientos (Clase 2) | Documentación técnica | Esmeralda · Ámbar |
| Elicitación (Clase 3) | Detective / Investigación | Violeta · Dorado · Rosa |
| Documentación (Clase 4) | Documento oficial | Índigo · Bronce · Crema |

---

## 🛠️ Tecnología

- **HTML5** para la estructura.
- **CSS3** con variables, grids y animaciones.
- **JavaScript** (ES6+) sin librerías externas.
- **localStorage** para guardar progreso.

**Sin** Node, **sin** npm, **sin** servidor, **sin** dependencias. Todo corre directamente en el navegador.

### Verificar cambios en el código

El proyecto no usa pruebas automatizadas formales. Para validar que un curso modificado siga funcionando:

```bash
# Validar HTML (etiquetas balanceadas)
python3 -c "
import html.parser
class V(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.errors=[]
        self.void={'br','hr','img','meta','link','input'}
    def handle_starttag(self,t,a):
        if t not in self.void: self.stack.append(t)
    def handle_endtag(self,t):
        if not self.stack or self.stack[-1]!=t: self.errors.append(t)
        else: self.stack.pop()
v=V();
with open('ruta/index.html') as f: v.feed(f.read())
print('Abiertas:', v.stack, '· Errores:', v.errors)
"

# Validar sintaxis JS
node -c ruta/app.js

# Validar balance de llaves CSS
python3 -c "c=open('ruta/estilos.css').read(); print(c.count('{'), c.count('}'))"
```

Además, en las clases de **C#** se compila cada bloque de código con el SDK de .NET 10 (C# 14) para que ningún ejemplo roto llegue al estudiante:

```bash
python3 /tmp/opencode/gen/check_cs.py "Algoritmos con C#"/*/index.html
# → RESUMEN: N compilan, M fragmentos dependientes, 0 fallan
```

---

## 🤝 Cómo agregar una nueva clase

Si eres docente y quieres expandir el currículo:

1. Crea una carpeta con el patrón `<numero-en-letras>-curso-<tema>/` (por ejemplo `cinco-curso-modelado-bpmn/`).
2. Copia los tres archivos (`index.html`, `estilos.css`, `app.js`) de la clase más reciente como base.
3. Ajusta:
   - El número de módulos (`TOTAL_MODULOS` en `app.js`).
   - La clave de `localStorage` (única por curso).
   - Los nombres de las insignias.
   - La paleta de colores en `estilos.css`.
4. Agrega la nueva tarjeta en `index.html` de la raíz.
5. Actualiza el contador de clases en la página principal.

Para detalles técnicos finos, revisa el archivo `CLAUDE.md` en la raíz del repositorio.

---

## 📂 Estado actual

- ✅ **40 clases interactivas** completamente funcionales
- ⏱️ **~140 horas** de material de estudio
- 🎯 **4 cursos activos**: Algoritmos en C# (10), Análisis y Diseño (7), Bases de Datos (9) y Herramientas de Programación II (14)

---

## 🎯 Público objetivo

| Aspecto | Detalle |
|---------|---------|
| Grado | 11° (Once) |
| Edad | 15 a 17 años |
| Idioma | Español |
| Nivel previo | No requiere experiencia previa en programación o ingeniería |
| Modalidad | Autoestudio guiado, ideal para trabajo individual o en parejas |

---

## 💭 Filosofía del proyecto

> *"Antes de hacer, hay que pensar. Antes de pensar, hay que entender. Antes de entender, hay que escuchar."*

Este currículo cree firmemente que **enseñar programación NO es enseñar a escribir código**: es enseñar a pensar, a comunicar, a analizar problemas. Por eso casi todo el material se centra en **habilidades transferibles**, no en sintaxis ni en herramientas particulares.

Si un estudiante termina estos cursos sabiendo más sobre análisis, diseño, documentación y elicitación que sobre un lenguaje específico, **habremos cumplido el objetivo**.

---

## 📜 Licencia y uso

Material educativo creado para estudiantes de grado once. Eres libre de usarlo, adaptarlo y compartirlo con fines educativos.

---

<div align="center">

**Hecho con ❤️ para los estudiantes de grado once**

*Currículo 2026 · Tecnología e Informática*

</div>
