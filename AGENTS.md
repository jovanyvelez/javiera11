# AGENTS.md

Self-contained interactive web minicourses teaching programming and software engineering to 11th-grade students (ages 15–17), in Spanish. Plain HTML + CSS + vanilla JS — **no build step, no dependencies, no server**. Open any `index.html` in a browser and it just works.

## Setup commands

Nothing to install: no package manager, no lockfile, no CI.

- Preview the hub: open `index.html` at the repo root in a browser
- Preview one class: open `<course-root>/<class-folder>/index.html`
- Optional server (not required): `python3 -m http.server 8000`
- Sanity checks need only `python3` and `node`
- C# sample compilation needs the .NET 10 SDK (`dotnet --version` → 10.x)

## Project layout

- `index.html`, `estilos.css`, `app.js` — root hub: links every class, reads each course's `localStorage` to render progress
- `Algoritmos con C#/` — 10 classes (VS Code + .NET 10, C# 14), follows subject guide TL007
- `analisis-diseno/` — 7 classes (analysis & design of software)
- `bases-de-datos/` — 9 classes (ER modeling, SQL, FastAPI + asyncpg)
- `herramientas-prog-ii/` — 14 classes (Python, FastAPI, Git, GitHub)
- Every class folder holds exactly three files: `index.html`, `estilos.css`, `app.js`
- `1_Herramientas Algoritmicas II Grado 11.pdf` — the guide the C# course follows subtheme by subtheme
- `guia-*.md`, `ejemplo.md` — supporting reference docs
- `CLAUDE.md` — deeper task notes (present in the working copy, gitignored); consult it for anything it covers

## Code style

- Copy-paste between courses is **intentional** (each course must stay self-contained) — apply a cross-course fix to every `app.js` individually.
- JS: ES6+, no frameworks/libraries/CDN, 2-space indent, `const`/`let`. Teaching copy, comments and UI strings in Spanish; JS identifiers in English.
- Each course's `app.js` opens with `const TOTAL_MODULOS`, `const STORAGE_KEY`, `const ETIQUETAS`, `const BADGES_MODULO` — keep that order.
- CSS: dark theme + neon accents driven by CSS variables (`--cs-N-a`/`--cs-N-b` for the C# family, `--ad-N-*` for analysis & design). Define a new palette in the course's `estilos.css` **and** in the hub's `estilos.css` so card and course match.
- HTML modules are `<section class="modulo" data-modulo="N">`; interactivity is wired through `data-*` attributes only (`data-modulo`, `data-ir`, `data-quiz`, `data-correcta`, `data-op`, `data-storage`).

## Architecture invariants

Breaking any of these silently breaks the hub's progress tracking.

- **Storage key ↔ hub link.** A class's `STORAGE_KEY` must equal the hub card's `data-storage` attribute in `/index.html`. On mismatch, that class's progress simply never shows.
- **Two duplicated key lists.** `/app.js` keeps `TOTALES_MODULOS` (modules counted per course) *and* a `keys` array (welcome-back toast) listing every course key. Update **both** when adding a class.
- **Module counting.** `TOTAL_MODULOS` counts *all* `<section class="modulo">` blocks; the last one is usually optional, and completion logic uses `TOTAL_MODULOS - 1` as "last required module". In the C# course, modules are `0` inicio, `1‑3` content, `4` descanso, `5‑6` content, `7` taller, and only `1,2,3,5,6,7` count toward progress.
- **URL encoding.** `Algoritmos con C#/` contains a space and a `#`: always link as `Algoritmos%20con%20C%23/...`, otherwise the browser truncates the path at `#`.
- **C# code blocks.** Code inside `<pre><code>` is plain text colored at runtime by `resaltarCodigo()`. Never hand-write `<span>` markup inside it, and escape `<`, `>`, `&` as `&lt;`, `&gt;`, `&amp;` (otherwise `List<T>` is swallowed as an unknown tag). Mark non-C# blocks `data-lang="text"` and intentionally broken ones `data-lang="csharp-error"`.
- **Never highlight with regex into `innerHTML`.** The tokenizer is a single-pass character tokenizer for a reason — a regex version matched the keyword `class` inside injected markup and leaked corrupt HTML into copied code.
- **Shared function contract.** Every course implements the same core functions: `irAModulo(n)`, `marcarCompletado(n)`, `otorgarBadge(name)`, `actualizarUI()`, `guardarProgreso()`, `cargarProgreso()`, `configurarQuizzes()`, `verificarQuizCompleto()`, `mostrarToast()`, `reiniciarCurso()`, `toggleSolucion(id)`. Arrow-key navigation (`←`/`→`) is wired in every course.

## Testing instructions

No test suite, no linter, no CI. Every course was validated with these three one-liners — run them on every file you touch:

```bash
# 1) HTML tag balance — expect: Open: [] Errors: []
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
v=V()
with open('ruta/index.html') as f: v.feed(f.read())
print('Open:', v.stack, 'Errors:', v.errors)
"

# 2) JS syntax — expect: no output
node -c ruta/app.js

# 3) CSS brace balance — expect: two equal numbers
python3 -c "c=open('ruta/estilos.css').read(); print(c.count('{'), c.count('}'))"
```

**C# samples (C# classes only).** Every `<pre><code>` block must compile with .NET 10 / C# 14. The helper scripts live *outside* the repo, in `/tmp/opencode/gen/` (`check_cs.py`, `fix_escape.py`, `qa.py`), and may be missing after a reboot — recreate or adapt them if absent:

```bash
python3 /tmp/opencode/gen/fix_escape.py "Algoritmos con C#"/*/index.html
python3 /tmp/opencode/gen/check_cs.py "Algoritmos con C#"/*/index.html
# → "N compilan, M fragmentos dependientes, 0 fallan"
```

`check_cs.py` reports a block as *fragmento dependiente* when it fails only with `CS0246`/`CS0103`/`CS5001` (it uses a class declared in another block of the same lesson) — that is intentional, not a failure.

## Adding a class

1. Create `<course-root>/<numero-en-letras>-curso-<tema>/` (`uno`, `dos`, … `catorce`).
2. Copy `index.html`, `estilos.css`, `app.js` from the most similar existing class.
3. Set `TOTAL_MODULOS`, a unique `STORAGE_KEY`, badge names, and the palette.
4. Add `<a class="clase-card …" data-storage="…">` to `/index.html` with the URL-encoded path and its theme class.
5. Update `TOTALES_MODULOS` **and** the `keys` array in `/app.js`; bump the affected `stat-clases` / `stat-horas` counters in `/index.html`; wire the keyboard shortcut in the hub `keydown` handler (C# classes use <kbd>Shift</kbd>+<kbd>1</kbd>…<kbd>0</kbd>, read via `event.code`).
6. Run the three sanity checks, plus the C# compile check for C# classes.

## PR & commit conventions

- Branch from `main`; never commit directly to `main`.
- Commit messages are Spanish and describe the change, e.g. `Herr Algoritmos en C#: rehacer el curso con 10 clases (guía TL007)`, `Herr clase14: Git en VS Code (panel SCM, diffs y staging fino)`. Keep the `<Área>: <qué se hizo>` shape — the history has no conventional-commit prefixes.
- Open the PR with `gh pr create` once the checks pass (remote: `git@github.com:jovanyvelez/javiera11.git`).

## Security

- No credentials anywhere; this repo needs none. Never commit secrets or tokens.
- `localStorage` holds only the student's own progress — never log it or transmit it.
- Keep generated artifacts, build output and binaries out of the repo; `.gitignore` currently lists `CLAUDE.md` and `.gitignore` itself.
- Content is educational material for minors: keep examples age-appropriate and safe.
