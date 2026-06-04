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
├── Algoritmos con C#/
│   ├── siete-curso-funciones-csharp/   ← Class 7
│   ├── diez-curso-poo-csharp/          ← Class 10
│   └── doce-curso-funciones-csharp/    ← Class 12
└── analisis-diseno/
    ├── uno-curso-analisis-diseno/      ← Class 1
    ├── dos-curso-requerimientos/       ← Class 2
    ├── tres-curso-elicitacion/         ← Class 3
    └── cuatro-curso-documentacion/     ← Class 4
```

**Folder naming convention:** `<numero-en-letras>-curso-<tema>/`. The number prefix is the class number within its course (`uno`, `dos`, …, `doce`). Stick to this when adding new classes.

**⚠️ The folder `Algoritmos con C#` contains a space AND a `#`.** In any `<a href>` to a file inside it, **always URL-encode** as `Algoritmos%20con%20C%23/...`. Without the `%23`, the browser treats `#` as a fragment separator and the link breaks silently.

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
| `Algoritmos con C#/siete-curso-funciones-csharp/`         | `curso-csharp-funciones-7`   |
| `Algoritmos con C#/diez-curso-poo-csharp/`                | `curso-csharp-poo-10`        |
| `Algoritmos con C#/doce-curso-funciones-csharp/`         | `curso-csharp-funciones`     |
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
<a href="Algoritmos%20con%20C%23/siete-curso-funciones-csharp/index.html"
   class="clase-card csharp" data-storage="curso-csharp-funciones-7">
```

- The card **class** picks the color theme. `csharp` covers all three C# classes; the AD course uses `ad-1` … `ad-4` (one per class). When adding a course, choose a fresh single class (or a numbered family) and define the corresponding palette variables in `estilos.css`.
- The `data-storage` attribute **must match the course's `localStorage` key exactly** — the hub reads `card.dataset.storage` to look up progress in `TOTALES_MODULOS`.

The hub renders four animated stat counters. When you add a class you must also update any that change:

| Counter         | Element id            | What it counts                          |
| --------------- | --------------------- | --------------------------------------- |
| Minicursos      | `stat-cursos`         | number of distinct course roots         |
| Clases          | `stat-clases`         | number of available `clase-card`s       |
| Horas           | `stat-horas`          | total estimated hours                   |
| Tu progreso     | `stat-progreso`       | computed live from `localStorage`       |

The hub also binds number-key shortcuts (`1`…`7`) that open the matching class — add a new branch to its `keydown` handler alongside the existing ones.

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
5. Update the hub's `TOTALES_MODULOS` map in `/app.js` and bump any of the stat counters (`stat-cursos`, `stat-clases`, `stat-horas`) whose values changed in `/index.html`. If you added the 8th class, also wire its keyboard shortcut in the hub's `keydown` handler.
6. Run the three sanity checks above on the new files.

## Known gotcha

The simplistic regex-based C# syntax highlighter that originally lived in `Algoritmos con C#/.../app.js` had a bug where the keyword `class` would match inside already-injected `<span class="…">` markup, producing corrupt HTML that leaked into copied code. The current version uses a single-pass character tokenizer instead — **never reintroduce regex-on-innerHTML highlighting**.
