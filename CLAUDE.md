# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A self-contained curriculum of interactive mini-courses for 11th-grade students (ages 15-17) at a Colombian school. Pure HTML + CSS + JavaScript — **no build step, no dependencies, no server**. Open any `index.html` in a browser and it just works.

Each course is designed for ~3 h 45 min of self-paced study, in Spanish, with playful pedagogical design.

## Running and previewing

- **Preview anything:** open the HTML file directly in a browser. There is no dev server.
- **Hub entry point:** `/index.html` (links to every course; reads each course's `localStorage` to show progress).
- **Individual course:** open the course's own `index.html` to test in isolation.

## Verifying changes (no tests, no linter)

The repo has no test suite or formal tooling. Sanity checks are done with one-liners:

```bash
# HTML tag balance (using Python's stdlib parser)
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
with open('path/to/index.html') as f: v.feed(f.read())
print('Open:', v.stack, 'Errors:', v.errors)
"

# JS syntax
node -c path/to/app.js

# CSS brace balance
python3 -c "c=open('path/to/estilos.css').read(); print(c.count('{'), c.count('}'))"
```

Run these whenever you modify an HTML/CSS/JS file in any course. Each course was verified with these three checks at creation.

## Repository layout

```
once/
├── index.html, estilos.css, app.js     ← Hub (curriculum landing page)
├── Algoritmos con C#/                  ← 10 clases (TL007 · C# 14 / .NET 10)
│   ├── uno-curso-entorno-csharp/       ← Class 1: VS Code + .NET 10
│   ├── dos-curso-variables-csharp/     ← Class 2: tipos de variables
│   ├── tres-curso-operadores-csharp/   ← Class 3: operadores y precedencia
│   ├── cuatro-curso-condicionales-csharp/ ← Class 4: if / else / switch
│   ├── cinco-curso-ciclos-csharp/      ← Class 5: for / while / foreach
│   ├── seis-curso-acumuladores-csharp/ ← Class 6: contadores, acumuladores, banderas
│   ├── siete-curso-arreglos-csharp/    ← Class 7: vectores y matrices
│   ├── ocho-curso-funciones-csharp/    ← Class 8: funciones, valor vs referencia
│   ├── nueve-curso-menus-csharp/       ← Class 9: menús con funciones
│   └── diez-curso-poo-csharp/          ← Class 10: POO (clases, objetos, constructores)
├── analisis-diseno/
│   ├── uno-curso-analisis-diseno/      ← Class 1
│   ├── dos-curso-requerimientos/       ← Class 2
│   ├── tres-curso-elicitacion/         ← Class 3
│   └── cuatro-curso-documentacion/     ← Class 4
├── bases-de-datos/                     ← 9 clases
└── herramientas-prog-ii/               ← 14 clases
```

**Folder naming convention:** `<numero-en-letras>-curso-<tema>/`. The number prefix is the class number within its course (`uno`, `dos`, …, `doce`). Stick to this when adding new classes.

**⚠️ The folder `Algoritmos con C#` contains a space AND a `#`.** In any `<a href>` to a file inside it, **always URL-encode** as `Algoritmos%20con%20C%23/...`. Without the `%23`, the browser treats `#` as a fragment separator and the link breaks silently.

### The C# course (subject guide TL007)

The 10 classes follow the PDF subject guide `1_Herramientas Algoritmicas II Grado 11.pdf` **subtem by subtem**:

| Guide theme / subtheme | Class |
| ----------------------- | ----- |
| 6.1 Definición de lenguaje, estructura y función · Manejo de una herramienta de programación | 1 |
| 6.1 Tipos de variables | 2 |
| 6.1 Tipos y precedencia de operadores aritméticos, lógicos y de comparación | 3 |
| 6.1 Sentencias de control condicionales (if, else, else if, switch) | 4 |
| 6.1 Sentencias "for" y "while" | 5 |
| 6.1 Acumuladores, contadores y banderas | 6 |
| 6.2 Estructuras tipo vectores y matrices | 7 |
| 6.2 Funciones, parámetros de entrada y retorno · Paso por valor y por referencia | 8 |
| 6.2 Creación de menús con aplicación de funciones | 9 |
| 6.2 Paradigma POO, clases y objetos · Atributos, métodos y constructores · Instanciación y acceso | 10 |

Every C# class has **8 modules**: `0` inicio, `1‑3` content, `4` descanso, `5‑6` content, `7` taller. Only `1, 2, 3, 5, 6, 7` count for progress (same rule as the `curso-bd-*` / `curso-herr-*` keys).

## Architecture: the "course-as-trio" pattern

Every course (and the hub) is exactly **three files** with the same names:

| File          | Role                                                       |
| ------------- | ---------------------------------------------------------- |
| `index.html`  | All module content, in `<section class="modulo">` blocks   |
| `estilos.css` | Theme + layout; each course has its own color palette      |
| `app.js`      | Navigation, progress, quizzes, interactive activities      |

All courses share the same `app.js` skeleton (intentional copy-paste, not a library — keeps each course self-contained and trivially deployable as a single folder). When fixing a bug across courses, **apply the fix to each `app.js` individually**.

### Shared state model (every course `app.js`)

```js
const TOTAL_MODULOS = N;                    // number of <section.modulo> in this course
const estado = {
  moduloActual: 0,
  completados: new Set(),                   // module indices finished
  quizzes: {},                              // {quizId: {aciertos, total}}
  badges: new Set()                         // achievement names earned
};
```

State is persisted to `localStorage` under a course-specific key:

| Course                                                    | `localStorage` key           |
| --------------------------------------------------------- | ---------------------------- |
| `Algoritmos con C#/uno-curso-entorno-csharp/`             | `curso-csharp-1`             |
| `Algoritmos con C#/dos-curso-variables-csharp/`           | `curso-csharp-2`             |
| `Algoritmos con C#/tres-curso-operadores-csharp/`         | `curso-csharp-3`             |
| `Algoritmos con C#/cuatro-curso-condicionales-csharp/`    | `curso-csharp-4`             |
| `Algoritmos con C#/cinco-curso-ciclos-csharp/`            | `curso-csharp-5`             |
| `Algoritmos con C#/seis-curso-acumuladores-csharp/`       | `curso-csharp-6`             |
| `Algoritmos con C#/siete-curso-arreglos-csharp/`          | `curso-csharp-7`             |
| `Algoritmos con C#/ocho-curso-funciones-csharp/`          | `curso-csharp-8`             |
| `Algoritmos con C#/nueve-curso-menus-csharp/`             | `curso-csharp-9`             |
| `Algoritmos con C#/diez-curso-poo-csharp/`                | `curso-csharp-10`            |
| `analisis-diseno/uno-curso-analisis-diseno/`              | `curso-analisis-diseno`      |
| `analisis-diseno/dos-curso-requerimientos/`               | `curso-requerimientos`       |
| `analisis-diseno/tres-curso-elicitacion/`                 | `curso-elicitacion`          |
| `analisis-diseno/cuatro-curso-documentacion/`             | `curso-documentacion`        |

A course's `TOTAL_MODULOS` counts *all* `<section class="modulo">` blocks 0-indexed; the last index is conventionally the optional/final-review module, and completion logic uses `TOTAL_MODULOS - 1` as the "last required" module. The hub's `app.js` reads every key above to compute global progress — **if you add a new course or change a key, update the `TOTALES_MODULOS` map in `/app.js`**.

### Shared functions across all courses

Every course implements the same core functions with identical signatures: `irAModulo(n)`, `marcarCompletado(n)`, `otorgarBadge(name)`, `actualizarUI()`, `guardarProgreso()`, `cargarProgreso()`, `configurarQuizzes()`, `verificarQuizCompleto()`, `mostrarToast()`, `reiniciarCurso()`, `toggleSolucion(id)`. Keyboard navigation (`←` / `→` arrows) is wired in every course.

### Shared HTML conventions (data attributes)

- `<section class="modulo" data-modulo="N">` — module N of the course
- `<button class="btn-modulo" data-modulo="N">` — nav menu button
- `<button class="btn-anterior|btn-siguiente" data-ir="N">` — prev/next buttons
- `<div class="quiz" data-quiz="N">` — quiz N
- `<div class="pregunta" data-correcta="b">` — question with correct answer key
- `<button class="opcion" data-op="a|b|c|d">` — quiz option

Custom interactive activities (role-play in class 3, SRS review in class 4, etc.) add their own `data-*` attributes, all read by functions inside that course's `app.js`.

### Hub integration (the cards on `/index.html`)

Every class card on the hub is a plain `<a>` with two extra hooks:

```html
<a href="Algoritmos%20con%20C%23/uno-curso-entorno-csharp/index.html"
   class="clase-card cs-1" data-storage="curso-csharp-1">
```

- The card **class** picks the color theme. The C# course uses the numbered family `cs-1` … `cs-10` (one palette per class, defined as `--cs-N-a` / `--cs-N-b` in `/estilos.css`); the AD course uses `ad-1` … `ad-7`. When adding a course, choose a fresh single class (or a numbered family) and define the corresponding palette variables in `estilos.css`.
- The `data-storage` attribute **must match the course's `localStorage` key exactly** — the hub reads `card.dataset.storage` to look up progress in `TOTALES_MODULOS`.

The hub renders four animated stat counters. When you add a class you must also update any that change:

| Counter         | Element id            | What it counts                          |
| --------------- | --------------------- | --------------------------------------- |
| Minicursos      | `stat-cursos`         | number of distinct course roots         |
| Clases          | `stat-clases`         | number of available `clase-card`s       |
| Horas           | `stat-horas`          | total estimated hours                   |
| Tu progreso     | `stat-progreso`       | computed live from `localStorage`       |

The hub also binds keyboard shortcuts that open the matching class — add a new branch to its `keydown` handler alongside the existing ones. Note the existing handler uses two selector styles: csharp cards are looked up by `[data-storage="…"]`, while AD/BD/HERR cards are looked up by class (`.clase-card.ad-1`, etc.). The 10 C# classes are bound to <kbd>Shift</kbd>+<kbd>1</kbd>…<kbd>0</kbd> (read through `event.code`, because `event.key` returns `!`, `@`, … when Shift is held); plain digits stay with the AD course and letters with BD/HERR.

### Code blocks in the C# classes

The C# courses ship a **C#/Bash tokenizer** in their `app.js` (`resaltarCodigo()`), so the code inside `<pre><code>` is written **as plain text** and colored at runtime with VS Code Dark+ colors (`.c-kw`, `.c-typ`, `.c-cls`, `.c-fn`, `.c-str`, `.c-num`, `.c-com`, `.c-cmd`, `.c-opt`). Rules:

- **Never hand-write `<span>` markup inside a C# code block** — the tokenizer would escape it.
- **Escape `<`, `>` and `&` inside `<pre>`** (`&lt;`, `&gt;`, `&amp;`) or the browser will swallow `List<T>` as an unknown tag.
- Mark terminal snippets with `data-lang="bash"`, XML/JSON with `data-lang="text"`, and code that is *intentionally wrong* with `data-lang="csharp-error"` (the compile checker ignores those).
- Every C# block must compile with the .NET 10 SDK (C# 14). Verify with the helper scripts below.


### Visual identity per course

Each course has a deliberately distinct color theme so students can tell them apart at a glance. **When adding a new course, pick a fresh palette** and add the corresponding `--<theme>-a` / `--<theme>-b` variables to `/estilos.css` (and per-course CSS files where needed) so the hub card and the course itself stay visually consistent.

## Audience constraints (drive every design decision)

- **Spanish language**, informal but technically correct register
- **Ages 15–17**, no prior software-engineering background assumed
- **No over-engineering** — three flat files per course is intentional
- **Lúdico** (playful) visual design: dark themes with neon accents, badges, animations, mascot-like emojis
- Each course must be **completable in ~3 h 45 min** of focused self-study, broken into 7–9 modules of 20–40 min each

## Adding a new class

1. Create folder `analisis-diseno/<numero>-curso-<tema>/` (or under a new course root).
2. Copy `index.html`, `estilos.css`, `app.js` from the most recent similar class as a starting point.
3. Adjust `TOTAL_MODULOS`, the `localStorage` key, the badge names, and the color palette.
4. Add a `<a class="clase-card ...">` entry to `/index.html` (the hub) with the correct URL-encoded path, theme class, and matching `data-storage` attribute.
5. Update the hub's `TOTALES_MODULOS` map in `/app.js` and bump any of the stat counters (`stat-cursos`, `stat-clases`, `stat-horas`) whose values changed in `/index.html`. Wire the new class's keyboard shortcut in the hub's `keydown` handler. Also add the new key to the `keys` array used by the welcome-back toast handler (it has to be kept in sync with `TOTALES_MODULOS` separately — both lists currently duplicate the full set of course keys).
6. Run the three sanity checks above on the new files. For the C# classes also run the C# compile check (see below) and the escape fixer.

## Verifying the C# code samples

The C# classes contain real, runnable code. The .NET 10 SDK (C# 14) is used to compile every `<pre>` block of every class, so a typo in a sample never reaches a student:

```bash
# 1) Escapar < > & dentro de los bloques <pre><code> (idempotente)
python3 /tmp/opencode/gen/fix_escape.py "Algoritmos con C#"/*/index.html

# 2) Compilar cada bloque C# con Roslyn (salida: "N compilan, M fragmentos dependientes, 0 fallan")
python3 /tmp/opencode/gen/check_cs.py "Algoritmos con C#"/*/index.html

# 3) QA estructural de las 10 clases (HTML balanceado, 8 módulos, quizzes, CSS, etc.)
python3 /tmp/opencode/gen/qa.py
```

`check_cs.py` classifies a block as **fragmento dependiente** when it only fails with `CS0246`/`CS0103`/`CS5001` (i.e. it uses a class declared in another block of the same lesson) — that is intentional in the lessons and is not a failure.

## Known gotcha

The simplistic regex-based C# syntax highlighter that originally lived in `Algoritmos con C#/.../app.js` had a bug where the keyword `class` would match inside already-injected `<span class="…">` markup, producing corrupt HTML that leaked into copied code. The current version uses a single-pass character tokenizer instead — **never reintroduce regex-on-innerHTML highlighting**.
