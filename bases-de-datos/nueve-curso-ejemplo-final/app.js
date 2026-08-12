/* ============================================================
   CLASE 9 — BASES DE DATOS (Ejemplo final del módulo:
   Torneos deportivos del colegio — caso integrador)
   Lógica de navegación, quizzes, taller y mini-motor SQL (playground).
   El motor soporta: SELECT con columnas (o * o COUNT(*) o col.tabla),
   FROM tabla [alias], INNER JOIN tabla [alias] ON condicion,
   WHERE (parser recursivo: =, <>, !=, >, <, >=, <=, LIKE, BETWEEN,
   IN, IS NULL, IS NOT NULL, AND/OR/NOT con precedencia),
   ORDER BY multicolumna, LIMIT.
   Diseñado para listar partidos con nombres de equipos y deportes.
   ============================================================ */

const TOTAL_MODULOS = 8;

const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  talleres: {},
  badges: new Set(),
  xp: 0
};

const XP_POR_MODULO = 30;
const XP_POR_QUIZ_PERFECTO = 25;
const XP_POR_PLAYGROUND = 25;
const XP_TOTAL = 390;

const STORAGE_KEY = 'curso-bd-ejemplo-final';

document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarTrivia();
  inicializarPlayground();
  inicializarChips();
  configurarTaller();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    const datos = {
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      talleres: estado.talleres,
      badges: [...estado.badges],
      xp: estado.xp
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
  } catch (e) {}
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!datos) return;
    estado.moduloActual = datos.moduloActual || 0;
    estado.completados = new Set(datos.completados || []);
    estado.quizzes = datos.quizzes || {};
    estado.talleres = datos.talleres || {};
    estado.badges = new Set(datos.badges || []);
    estado.xp = datos.xp || 0;
  } catch (e) {}
}

/* ---------- NAVEGACIÓN ---------- */
function configurarNavegacion() {
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    btn.addEventListener('click', () => irAModulo(parseInt(btn.dataset.modulo, 10)));
  });
}

function configurarBotonesInternos() {
  document.querySelectorAll('.btn-anterior, .btn-siguiente').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.ir, 10);
      if (btn.classList.contains('btn-siguiente')) marcarCompletado(estado.moduloActual);
      irAModulo(m);
    });
  });
  document.querySelectorAll('[data-reiniciar]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Quieres volver al inicio? Tu progreso se conserva.')) irAModulo(0);
    });
  });
}

function irAModulo(n) {
  if (n < 0 || n >= TOTAL_MODULOS) return;
  estado.moduloActual = n;
  document.querySelectorAll('.modulo').forEach(m => m.classList.remove('activo'));
  const mod = document.querySelector(`.modulo[data-modulo="${n}"]`);
  if (mod) mod.classList.add('activo');
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    btn.classList.toggle('activo', parseInt(btn.dataset.modulo, 10) === n);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
  actualizarUI();
  guardarProgreso();
  // Re-renderizar diagramas Mermaid del módulo recién visible.
  // Mermaid no puede medir elementos con display:none, así que si el
  // diagrama estaba oculto al cargar la página, sus coordenadas SVG
  // quedan en NaN. Re-ejecutamos el render cuando el módulo es visible.
  if (mod && mod.querySelector('.mermaid') && window.mermaid) {
    setTimeout(() => {
      const mermaidDivs = mod.querySelectorAll('.mermaid');
      mermaidDivs.forEach(div => {
        const src = div.getAttribute('data-diagram');
        if (!src) return;
        // Si el SVG tiene NaN o no hay SVG, re-renderizar desde la fuente original
        if (div.innerHTML.includes('NaN') || !div.innerHTML.includes('<svg') || div.innerHTML.includes('aria-roledescription="error"')) {
          div.removeAttribute('data-processed');
          div.innerHTML = src;
          try { window.mermaid.run({ nodes: [div] }); }
          catch (e) {}
        }
      });
    }, 100);
  }
}

function marcarCompletado(n) {
  if (estado.completados.has(n)) return;
  estado.completados.add(n);
  estado.xp = Math.min(XP_TOTAL, estado.xp + XP_POR_MODULO);

  const badgesModulo = {
    0: '🚀 Iniciado',
    1: '🗺️ Modelador',
    2: '🏗️ Constructor',
    3: '📝 Poblador',
    4: '☕ Descansado',
    5: '🔍 Consultor',
    6: '🧪 Jugador Final',
    7: '🏆 Maestro BD'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🎓 Módulo BD Completado');
  }

  mostrarToast(`🎉 ¡+${XP_POR_MODULO} XP! Módulo ${n} completado`);
  guardarProgreso();
}

function otorgarBadge(nombre) {
  if (estado.badges.has(nombre)) return;
  estado.badges.add(nombre);
  mostrarToast(`🎖️ Insignia: ${nombre}`);
  actualizarUI();
}

function addXP(cantidad) {
  estado.xp = Math.min(XP_TOTAL, estado.xp + cantidad);
  guardarProgreso();
  actualizarUI();
}

function actualizarUI() {
  const completables = [1, 2, 3, 5, 6, 7];
  const total = completables.length;
  const completos = completables.filter(m => estado.completados.has(m)).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) {
    const labels = ['Inicio', 'MER', 'DDL', 'DML', 'Descanso', 'DQL', 'Playground', 'Taller'];
    mAct.textContent = labels[estado.moduloActual] || ('Módulo ' + estado.moduloActual);
  }

  const xpEl = document.getElementById('xp-display');
  if (xpEl) xpEl.textContent = `${estado.xp} / ${XP_TOTAL} XP`;

  const badgesCont = document.getElementById('badges');
  if (badgesCont) {
    badgesCont.innerHTML = '';
    estado.badges.forEach(b => {
      const span = document.createElement('span');
      span.className = 'badge';
      span.textContent = b;
      badgesCont.appendChild(span);
    });
  }

  document.querySelectorAll('.btn-modulo').forEach(btn => {
    const m = parseInt(btn.dataset.modulo, 10);
    btn.classList.toggle('completado', estado.completados.has(m));
  });
}

/* ---------- COPIAR CÓDIGO ---------- */
function configurarCopiarCodigo() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.closest('.code-wrap').querySelector('code, pre').innerText;
      navigator.clipboard.writeText(code).then(() => {
        const original = btn.textContent;
        btn.textContent = '✅ Copiado';
        btn.classList.add('ok');
        setTimeout(() => { btn.textContent = original; btn.classList.remove('ok'); }, 1800);
      });
    });
  });
}

/* ---------- QUIZZES ---------- */
function configurarQuizzes() {
  document.querySelectorAll('.quiz').forEach(quiz => {
    const idQuiz = quiz.dataset.quiz;
    const preguntas = quiz.querySelectorAll('.pregunta');

    preguntas.forEach(pregunta => {
      const correcta = pregunta.dataset.correcta;
      const opciones = pregunta.querySelectorAll('.opcion');

      opciones.forEach(op => {
        op.addEventListener('click', () => {
          if (pregunta.dataset.respondida === 'true') return;
          pregunta.dataset.respondida = 'true';

          const elegida = op.dataset.op;
          if (elegida === correcta) {
            op.classList.add('correcta');
            pregunta.dataset.acierto = 'true';
          } else {
            op.classList.add('incorrecta');
            pregunta.dataset.acierto = 'false';
            opciones.forEach(o => {
              if (o.dataset.op === correcta) o.classList.add('correcta');
            });
          }

          opciones.forEach(o => o.disabled = true);
          verificarQuizCompleto(quiz, idQuiz);
        });
      });
    });
  });
}

function verificarQuizCompleto(quiz, idQuiz) {
  const preguntas = quiz.querySelectorAll('.pregunta');
  const respondidas = quiz.querySelectorAll('.pregunta[data-respondida="true"]');
  if (preguntas.length !== respondidas.length) return;

  let aciertos = 0;
  preguntas.forEach(p => { if (p.dataset.acierto === 'true') aciertos++; });
  const total = preguntas.length;
  estado.quizzes[idQuiz] = { aciertos, total };

  if (aciertos === total && !quiz.dataset.recompensado) {
    quiz.dataset.recompensado = 'true';
    addXP(XP_POR_QUIZ_PERFECTO);
  }

  const res = quiz.querySelector('.resultado-quiz');
  if (res) {
    res.classList.add('visible');
    if (aciertos === total) {
      res.classList.add('exito');
      res.innerHTML = `🎉 ¡Perfecto! ${aciertos}/${total}. (+${XP_POR_QUIZ_PERFECTO} XP)`;
    } else if (aciertos >= total / 2) {
      res.classList.add('parcial');
      res.textContent = `👍 ${aciertos}/${total} correctas. ¡Buen intento!`;
    } else {
      res.classList.add('parcial');
      res.textContent = `🤔 ${aciertos}/${total}. Te invitamos a releer el módulo.`;
    }
  }

  guardarProgreso();
}

/* ---------- TRIVIA (descanso) ---------- */
function configurarTrivia() {
  const opts = document.querySelectorAll('#triviaOpts .trivia-opt');
  const result = document.getElementById('triviaResult');
  if (!opts.length || !result) return;

  const correcta = opts[0].dataset.tcorrecta;

  opts.forEach(op => {
    op.addEventListener('click', () => {
      const elegida = op.dataset.top;
      opts.forEach(o => { o.disabled = true; if (o.dataset.top === correcta) o.classList.add('correcta'); });
      if (elegida === correcta) {
        result.className = 'trivia-result visible ok';
        result.textContent = '✅ ¡Correcto! Un partido finalizado tiene marcador (goles_a, goles_b) y estado "finalizado"; uno programado tiene estado "programado" y los goles van en NULL.';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ La diferencia está en el estado y el marcador: "finalizado" tiene goles asignados, "programado" los tiene en NULL hasta que se juegue.';
      }
    });
  });
}

/* ---------- CHIPS DEL PLAYGROUND ---------- */
function inicializarChips() {
  const editor = document.getElementById('sqlEditor');
  if (!editor) return;
  document.querySelectorAll('.mermaid-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const snippet = chip.dataset.snippet.replace(/&#10;/g, '\n');
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.slice(0, start) + snippet + editor.value.slice(end);
      editor.selectionStart = editor.selectionEnd = start + snippet.length;
      editor.focus();
    });
  });
}

/* ---------- PLAYGROUND SQL (mini-motor con JOIN) ----------
   Simula la BD de torneos deportivos del colegio con 5 tablas:
   deportes(id, nombre), torneos(id, nombre, deporte_id, categoria),
   equipos(id, nombre, torneo_id), jugadores(id, nombre, fecha_nac, equipo_id),
   partidos(id, torneo_id, fecha, hora, equipo_a_id, equipo_b_id,
            goles_a, goles_b, estado).
   Soporta SELECT con JOIN (INNER JOIN ... ON), WHERE completo
   (parser recursivo), ORDER BY, LIMIT, COUNT(*).
   Es intencionalmente minimalista; su único objetivo es pedagógico.
*/
function inicializarPlayground() {
  const editor = document.getElementById('sqlEditor');
  const output = document.getElementById('sqlOutput');
  const runBtn = document.getElementById('sqlRun');
  const resetBtn = document.getElementById('sqlReset');
  if (!editor || !output || !runBtn) return;

  const RETOS_KEY = 'playground-retos';
  if (!estado.talleres[RETOS_KEY]) estado.talleres[RETOS_KEY] = [];
  const retos = estado.talleres[RETOS_KEY];

  function bdInicial() {
    return {
      deportes: [
        { id: 1, nombre: 'Fútbol' },
        { id: 2, nombre: 'Baloncesto' }
      ],
      torneos: [
        { id: 1, nombre: 'Copa Interclases 2026', deporte_id: 1, categoria: 'Junior' },
        { id: 2, nombre: 'Liga Veteranos 2026',   deporte_id: 1, categoria: 'Veteranos' },
        { id: 3, nombre: 'Torneo Baloncesto Junior', deporte_id: 2, categoria: 'Junior' }
      ],
      equipos: [
        { id: 1, nombre: 'Los Tigres',    torneo_id: 1 },
        { id: 2, nombre: 'Las Águilas',   torneo_id: 1 },
        { id: 3, nombre: 'Los Leones',    torneo_id: 1 },
        { id: 4, nombre: 'Los Halcones',  torneo_id: 2 },
        { id: 5, nombre: 'Las Panteras',  torneo_id: 2 },
        { id: 6, nombre: 'Los Tiburones', torneo_id: 3 }
      ],
      jugadores: [
        { id: 1,  nombre: 'Juan Gómez',     fecha_nac: '2013-05-14', equipo_id: 1 },
        { id: 2,  nombre: 'Pedro Pérez',    fecha_nac: '2013-08-22', equipo_id: 1 },
        { id: 3,  nombre: 'María López',    fecha_nac: '2013-11-03', equipo_id: 1 },
        { id: 4,  nombre: 'Carlos Ruiz',    fecha_nac: '2013-02-18', equipo_id: 2 },
        { id: 5,  nombre: 'Ana Torres',     fecha_nac: '2013-07-30', equipo_id: 2 },
        { id: 6,  nombre: 'Luis Mesa',      fecha_nac: '2013-09-12', equipo_id: 2 },
        { id: 7,  nombre: 'Sofía Vargas',   fecha_nac: '2013-04-25', equipo_id: 3 },
        { id: 8,  nombre: 'Diego Castro',   fecha_nac: '2013-12-08', equipo_id: 3 },
        { id: 9,  nombre: 'Valeria Gómez',  fecha_nac: '2008-03-15', equipo_id: 4 },
        { id: 10, nombre: 'Sebastián Ríos', fecha_nac: '2008-06-21', equipo_id: 4 },
        { id: 11, nombre: 'Camila Rojas',   fecha_nac: '2008-01-10', equipo_id: 5 },
        { id: 12, nombre: 'Mateo Quintero', fecha_nac: '2008-11-05', equipo_id: 5 },
        { id: 13, nombre: 'Lucía Cardona',  fecha_nac: '2013-10-19', equipo_id: 6 },
        { id: 14, nombre: 'Tomás Ortega',   fecha_nac: '2013-03-07', equipo_id: 6 },
        { id: 15, nombre: 'Isabela Múnera', fecha_nac: '2013-08-28', equipo_id: 6 }
      ],
      partidos: [
        // Partidos intra-colegio: dos equipos del colegio se enfrentan.
        // No hay local/visitante: todos juegan en el mismo escenario.
        { id: 1, torneo_id: 1, fecha: '2026-09-15', hora: '15:00', equipo_a_id: 1, equipo_b_id: 2, goles_a: 3, goles_b: 1, estado: 'finalizado' },
        { id: 2, torneo_id: 1, fecha: '2026-09-22', hora: '15:00', equipo_a_id: 3, equipo_b_id: 1, goles_a: 2, goles_b: 2, estado: 'finalizado' },
        { id: 3, torneo_id: 1, fecha: '2026-09-29', hora: '15:00', equipo_a_id: 2, equipo_b_id: 3, goles_a: 1, goles_b: 4, estado: 'finalizado' },
        { id: 4, torneo_id: 1, fecha: '2026-10-06', hora: '15:00', equipo_a_id: 1, equipo_b_id: 3, goles_a: null, goles_b: null, estado: 'programado' },
        { id: 5, torneo_id: 2, fecha: '2026-09-18', hora: '16:00', equipo_a_id: 4, equipo_b_id: 5, goles_a: 2, goles_b: 0, estado: 'finalizado' },
        { id: 6, torneo_id: 2, fecha: '2026-09-25', hora: '16:00', equipo_a_id: 5, equipo_b_id: 4, goles_a: 1, goles_b: 1, estado: 'finalizado' },
        { id: 7, torneo_id: 2, fecha: '2026-10-09', hora: '16:00', equipo_a_id: 4, equipo_b_id: 5, goles_a: null, goles_b: null, estado: 'programado' },
        { id: 8, torneo_id: 3, fecha: '2026-10-13', hora: '14:00', equipo_a_id: 6, equipo_b_id: 6, goles_a: null, goles_b: null, estado: 'programado' }
      ]
    };
  }

  let bd = bdInicial();

  const esquema = {
    deportes: ['id', 'nombre'],
    torneos: ['id', 'nombre', 'deporte_id', 'categoria'],
    equipos: ['id', 'nombre', 'torneo_id'],
    jugadores: ['id', 'nombre', 'fecha_nac', 'equipo_id'],
    partidos: ['id', 'torneo_id', 'fecha', 'hora', 'equipo_a_id', 'equipo_b_id', 'goles_a', 'goles_b', 'estado']
  };

  // Trackeo de hitos
  let usoJoin = false;
  let usoCount = false;
  let usoWhere = false;
  let usoOrderBy = false;
  let usoMultiTabla = false;

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function renderTabla(columnas, filas) {
    if (!filas.length) return '<div style="color:var(--texto-suave);font-style:italic;">(0 filas)</div>';
    let html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.82rem;font-family:JetBrains Mono,monospace;">';
    html += '<thead><tr>' + columnas.map(c => `<th style="padding:0.4rem 0.6rem;border-bottom:2px solid var(--tarjeta-borde);color:var(--cian);text-align:left;">${escapeHtml(c)}</th>`).join('') + '</tr></thead>';
    html += '<tbody>';
    filas.forEach(fila => {
      html += '<tr>' + columnas.map(c => {
        const v = fila[c];
        return `<td style="padding:0.35rem 0.6rem;border-bottom:1px solid rgba(255,255,255,0.05);">${escapeHtml(v === null || v === undefined ? 'NULL' : v)}</td>`;
      }).join('') + '</tr>';
    });
    html += '</tbody></table></div>';
    return html;
  }

  function ok(html) { return `<div style="color:var(--verde);font-weight:700;margin-bottom:0.5rem;">✓ OK</div>${html}`; }
  function err(msg) { return `<div style="color:var(--rosa);font-weight:700;margin-bottom:0.5rem;">⚠️ Error:</div><div style="color:var(--texto-suave);font-family:JetBrains Mono,monospace;font-size:0.85rem;">${escapeHtml(msg)}</div>`; }
  function info(msg) { return `<div style="color:var(--lima);font-weight:700;margin-bottom:0.5rem;">${escapeHtml(msg)}</div>`; }

  function quitarComentarios(s) {
    return s.split('\n').map(l => { const idx = l.indexOf('--'); return idx >= 0 ? l.slice(0, idx) : l; }).join(' ').replace(/\s+/g, ' ').trim();
  }

  function parseVal(tok) {
    tok = tok.trim();
    if (/^'.*'$/.test(tok)) return tok.slice(1, -1);
    if (/^-?\d+$/.test(tok)) return parseInt(tok, 10);
    if (/^-?\d+\.\d+$/.test(tok)) return parseFloat(tok);
    if (tok.toUpperCase() === 'NULL') return null;
    if (tok.toUpperCase() === 'TRUE') return true;
    if (tok.toUpperCase() === 'FALSE') return false;
    throw new Error(`Valor no reconocido: ${tok}`);
  }

  function splitTop(str, sepRe) {
    const parts = []; let cur = ''; let inStr = false; let depth = 0; let i = 0;
    while (i < str.length) {
      const ch = str[i];
      if (ch === "'") { inStr = !inStr; cur += ch; i++; continue; }
      if (!inStr) {
        if (ch === '(') { depth++; cur += ch; i++; continue; }
        if (ch === ')') { depth--; cur += ch; i++; continue; }
        if (depth === 0) { const rest = str.slice(i); const m = rest.match(sepRe); if (m && m.index === 0) { parts.push(cur.trim()); cur = ''; i += m[0].length; continue; } }
      }
      cur += ch; i++;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
  }

  // ---------- TOKENIZER para WHERE ----------
  function tokenizarWhere(s) {
    const tokens = []; let i = 0; const n = s.length;
    const keywords = { AND: 'AND', OR: 'OR', NOT: 'NOT', LIKE: 'LIKE', BETWEEN: 'BETWEEN', IN: 'IN', IS: 'IS', NULL: 'NULL', TRUE: 'TRUE', FALSE: 'FALSE' };
    while (i < n) {
      const ch = s[i];
      if (ch === ' ' || ch === '\t') { i++; continue; }
      if (ch === '(') { tokens.push({ t: 'lparen' }); i++; continue; }
      if (ch === ')') { tokens.push({ t: 'rparen' }); i++; continue; }
      if (ch === ',') { tokens.push({ t: 'comma' }); i++; continue; }
      if (ch === "'") {
        let j = i + 1; while (j < n && s[j] !== "'") j++;
        if (j >= n) throw new Error('String sin cerrar en el WHERE.');
        tokens.push({ t: 'str', v: s.slice(i + 1, j) }); i = j + 1; continue;
      }
      const two = s.slice(i, i + 2);
      if (two === '>=' || two === '<=' || two === '<>' || two === '!=') { tokens.push({ t: 'op', v: two }); i += 2; continue; }
      if (ch === '>' || ch === '<' || ch === '=') { tokens.push({ t: 'op', v: ch }); i++; continue; }
      const numM = s.slice(i).match(/^(-?\d+\.\d+)/) || s.slice(i).match(/^(-?\d+)/);
      if (numM) { tokens.push({ t: 'num', v: numM[1] }); i += numM[1].length; continue; }
      const idM = s.slice(i).match(/^[A-Za-z_][A-Za-z0-9_\.]*/);
      if (idM) {
        const word = idM[0]; const up = word.toUpperCase();
        if (keywords[up]) { tokens.push({ t: 'kw', v: up }); }
        else { tokens.push({ t: 'ident', v: word.toLowerCase() }); }
        i += word.length; continue;
      }
      throw new Error(`Carácter no reconocido en el WHERE: "${ch}".`);
    }
    return tokens;
  }

  // ---------- PARSER recursivo descendente para WHERE ----------
  const pos = { p: 0 }; let toks = [];
  function peek() { return toks[pos.p]; }
  function next() { return toks[pos.p++]; }
  function expect(type, val) {
    const tk = next();
    if (!tk || tk.t !== type || (val !== undefined && tk.v !== val))
      throw new Error(`Se esperaba ${val || type} pero se encontró ${tk ? (tk.v || tk.t) : 'fin'}.`);
    return tk;
  }
  function atKw(word) { const tk = peek(); return tk && tk.t === 'kw' && tk.v === word; }

  function parseExpr() { return parseOr(); }
  function parseOr() { let node = parseAnd(); while (atKw('OR')) { next(); const right = parseAnd(); node = { type: 'or', left: node, right }; } return node; }
  function parseAnd() { let node = parseNot(); while (atKw('AND')) { next(); const right = parseNot(); node = { type: 'and', left: node, right }; } return node; }
  function parseNot() { if (atKw('NOT')) { next(); return { type: 'not', operand: parseNot() }; } return parsePrimary(); }
  function parsePrimary() {
    const tk = peek();
    if (tk && tk.t === 'lparen') { next(); const e = parseExpr(); expect('rparen'); return e; }
    return parseCondicion();
  }
  function parseValorToken() {
    const tk = next();
    if (!tk) throw new Error('Se esperaba un valor.');
    if (tk.t === 'str') return { kind: 'lit', v: tk.v };
    if (tk.t === 'num') return { kind: 'lit', v: parseVal(tk.v) };
    if (tk.t === 'kw') {
      if (tk.v === 'NULL') return { kind: 'lit', v: null };
      if (tk.v === 'TRUE') return { kind: 'lit', v: true };
      if (tk.v === 'FALSE') return { kind: 'lit', v: false };
      throw new Error(`Palabra clave inesperada como valor: ${tk.v}.`);
    }
    // ident en el lado derecho: es una referencia a columna (no un literal)
    if (tk.t === 'ident') return { kind: 'col', v: tk.v };
    throw new Error(`Se esperaba un valor pero se encontró "${tk.v || tk.t}".`);
  }
  function parseCondicion() {
    const colTk = next();
    if (!colTk || colTk.t !== 'ident') throw new Error(`Se esperaba una columna pero se encontró "${colTk ? (colTk.v || colTk.t) : 'fin'}".`);
    const col = colTk.v;
    const tk = peek();
    if (!tk) throw new Error(`Condición incompleta después de "${col}".`);
    if (tk.t === 'kw' && tk.v === 'IS') {
      next(); if (atKw('NOT')) { next(); expect('kw', 'NULL'); return { type: 'isnull', col, neg: true }; }
      expect('kw', 'NULL'); return { type: 'isnull', col, neg: false };
    }
    if (tk.t === 'kw' && tk.v === 'LIKE') {
      next(); const pat = next();
      if (!pat || pat.t !== 'str') throw new Error('LIKE debe ir seguido de un patrón entre comillas.');
      return { type: 'like', col, pattern: pat.v };
    }
    if (tk.t === 'kw' && tk.v === 'BETWEEN') {
      next(); const lo = parseValorToken(); expect('kw', 'AND'); const hi = parseValorToken();
      return { type: 'between', col, lo: lo.v, hi: hi.v };
    }
    if (tk.t === 'kw' && tk.v === 'IN') {
      next(); expect('lparen'); const vals = []; vals.push(parseValorToken().v);
      while (peek() && peek().t === 'comma') { next(); vals.push(parseValorToken().v); }
      expect('rparen'); return { type: 'in', col, vals };
    }
    if (tk.t === 'op') {
      next(); const val = parseValorToken();
      return { type: 'cmp', col, op: tk.v, val: val.v, valKind: val.kind };
    }
    throw new Error(`Operador no reconocido después de "${col}".`);
  }

  // ---------- EVALUADOR del AST de WHERE ----------
  // "ctx" mapea nombres de columna (con o sin prefijo de tabla) a valores.
  function evalAst(node, ctx) {
    switch (node.type) {
      case 'or':  return evalAst(node.left, ctx) || evalAst(node.right, ctx);
      case 'and': return evalAst(node.left, ctx) && evalAst(node.right, ctx);
      case 'not': return !evalAst(node.operand, ctx);
      case 'isnull': {
        const v = ctxVal(node.col, ctx);
        return node.neg ? (v !== null && v !== undefined) : (v === null || v === undefined);
      }
      case 'like': {
        const v = ctxVal(node.col, ctx);
        if (v === null || v === undefined) return false;
        return likeMatch(String(v), node.pattern);
      }
      case 'between': {
        const v = ctxVal(node.col, ctx);
        if (v === null || v === undefined) return false;
        return v >= node.lo && v <= node.hi;
      }
      case 'in': {
        const v = ctxVal(node.col, ctx);
        return node.vals.includes(v);
      }
      case 'cmp': {
        const v = ctxVal(node.col, ctx);
        // Si el valor es una referencia a columna, resolverla contra la fila
        const val = node.valKind === 'col' ? ctxVal(node.val, ctx) : node.val;
        if (v === null || v === undefined) return false;
        if (val === null || val === undefined) return false;
        switch (node.op) {
          case '=':  return v == val;
          case '<>': case '!=': return v != val;
          case '>':  return v > val;
          case '<':  return v < val;
          case '>=': return v >= val;
          case '<=': return v <= val;
        }
        return false;
      }
    }
    return false;
  }

  // Resuelve un nombre de columna contra el contexto de la fila combinada.
  // Soporta "col" y "tabla.col".
  function ctxVal(col, ctx) {
    if (col in ctx) return ctx[col];
    // buscar sin prefijo: si hay "tabla.col", intentar con la parte final
    if (col.includes('.')) {
      const [, simple] = col.split('.');
      if (simple in ctx) return ctx[simple];
    } else {
      // buscar cualquier clave que termine en ".col"
      for (const k of Object.keys(ctx)) {
        if (k.endsWith('.' + col)) return ctx[k];
      }
    }
    return undefined;
  }

  function likeMatch(str, pattern) {
    let re = '';
    for (let i = 0; i < pattern.length; i++) {
      const ch = pattern[i];
      if (ch === '%') re += '.*';
      else if (ch === '_') re += '.';
      else re += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    return new RegExp('^' + re + '$', 'i').test(str);
  }

  // ---------- Ejecuta una sentencia SELECT ----------
  function ejecutar(sentencia) {
    const s = quitarComentarios(sentencia);
    if (!s) return info('— sentencia vacía —');
    const up = s.toUpperCase();

    if (!up.startsWith('SELECT')) {
      throw new Error(`Comando no soportado: "${s.slice(0, 40)}...". Este playground solo admite SELECT.`);
    }

    // indexOfKw: encuentra palabra clave top-level (respeta strings y paréntesis)
    function indexOfKw(str, kwRe) {
      let inStr = false, depth = 0, i = 0;
      while (i < str.length) {
        const ch = str[i];
        if (ch === "'") { inStr = !inStr; i++; continue; }
        if (!inStr) {
          if (ch === '(') { depth++; i++; continue; }
          if (ch === ')') { depth--; i++; continue; }
          if (depth === 0) { const m = str.slice(i).match(kwRe); if (m && m.index === 0) return i; }
        }
        i++;
      }
      return -1;
    }

    let rest = s.replace(/^SELECT\s+/i, '');

    // FROM: columna hasta el primer " FROM " top-level
    const fromIdx = indexOfKw(rest, /\s+FROM\s+/i);
    if (fromIdx < 0) throw new Error('Sintaxis SELECT no reconocida. Revisa: SELECT cols FROM tabla [JOIN ... ON ...] [WHERE ...] [ORDER BY ...] [LIMIT n];');
    let colsPart = rest.slice(0, fromIdx).trim();
    let tail = rest.slice(fromIdx).replace(/^\s+FROM\s+/i, '');

    // Tabla principal + alias
    const mTabla = tail.match(/^(\w+)(\s+(?:AS\s+)?(?!WHERE|JOIN|INNER|ON|ORDER|LIMIT|GROUP|HAVING|AND|OR|NOT|SELECT|FROM)(\w+))?/i);
    if (!mTabla) throw new Error('Se esperaba un nombre de tabla después de FROM.');
    const tablaPrincipal = mTabla[1].toLowerCase();
    const aliasPrincipal = (mTabla[3] || mTabla[1]).toLowerCase();
    tail = tail.slice(mTabla[0].length);

    if (!(tablaPrincipal in bd)) throw new Error(`La tabla "${tablaPrincipal}" no existe. Tablas: ${Object.keys(bd).join(', ')}.`);

    // JOINs
    const joins = [];
    while (true) {
      const jIdx = indexOfKw(tail, /\s+INNER\s+JOIN\s+/i) >= 0 ? indexOfKw(tail, /\s+INNER\s+JOIN\s+/i)
                 : indexOfKw(tail, /\s+JOIN\s+/i);
      if (jIdx < 0) break;
      usoJoin = true;
      usoMultiTabla = true;
      // extraer el JOIN
      let joinRest = tail.slice(jIdx).replace(/^\s+(INNER\s+)?JOIN\s+/i, '');
      tail = tail.slice(0, jIdx);
      // tabla + alias
      const mJ = joinRest.match(/^(\w+)(\s+(?:AS\s+)?(?!WHERE|JOIN|INNER|ON|ORDER|LIMIT|GROUP|HAVING|AND|OR|NOT|SELECT|FROM)(\w+))?/i);
      if (!mJ) throw new Error('Se esperaba tabla después de JOIN.');
      const jTabla = mJ[1].toLowerCase();
      const jAlias = (mJ[3] || mJ[1]).toLowerCase();
      joinRest = joinRest.slice(mJ[0].length);
      if (!(jTabla in bd)) throw new Error(`La tabla "${jTabla}" no existe.`);
      // ON
      const mOn = joinRest.match(/^\s+ON\s+(.+?)(\s+(?:INNER\s+)?JOIN\s+.*|\s+WHERE\s+.*|\s+ORDER\s+BY\s+.*|\s+LIMIT\s+\d+.*)?$/i);
      if (!mOn) throw new Error('Se esperaba ON después de JOIN.');
      const onCond = mOn[1].trim();
      // el resto del join (si hay más JOINs) se vuelve a procesar
      const restAfterOn = mOn[2] || '';
      // poner el resto de vuelta en tail para siguiente iteración
      tail = tail + restAfterOn;
      // parsear ON como condición
      toks = tokenizarWhere(onCond); pos.p = 0;
      const onAst = parseExpr();
      joins.push({ tabla: jTabla, alias: jAlias, onAst });
    }

    // WHERE
    let wherePart = null;
    const whereIdx = indexOfKw(tail, /\s+WHERE\s+/i);
    if (whereIdx >= 0) {
      wherePart = tail.slice(whereIdx).replace(/^\s+WHERE\s+/i, '');
      tail = tail.slice(0, whereIdx);
      usoWhere = true;
      // cortar ORDER BY / LIMIT del wherePart
      const obIdx = indexOfKw(wherePart, /\s+ORDER\s+BY\s+/i);
      if (obIdx >= 0) { tail = tail + wherePart.slice(obIdx); wherePart = wherePart.slice(0, obIdx); }
      else {
        const limIdx = indexOfKw(wherePart, /\s+LIMIT\s+/i);
        if (limIdx >= 0) { tail = tail + wherePart.slice(limIdx); wherePart = wherePart.slice(0, limIdx); }
      }
      wherePart = wherePart.replace(/;$/, '').trim();
    }

    // ORDER BY
    let orderCols = null;
    const obIdx = indexOfKw(tail, /\s+ORDER\s+BY\s+/i);
    if (obIdx >= 0) {
      usoOrderBy = true;
      let orderStr = tail.slice(obIdx).replace(/^\s+ORDER\s+BY\s+/i, '');
      tail = tail.slice(0, obIdx);
      const limIdx = indexOfKw(orderStr, /\s+LIMIT\s+/i);
      if (limIdx >= 0) { tail = tail + orderStr.slice(limIdx); orderStr = orderStr.slice(0, limIdx); }
      orderStr = orderStr.replace(/;$/, '').trim();
      if (orderStr) {
        orderCols = splitTop(orderStr, /\s*,\s*/).map(spec => {
          const m = spec.match(/^([\w.]+)\s+(ASC|DESC)$/i);
          if (m) return { col: m[1].toLowerCase(), dir: m[2].toUpperCase() };
          return { col: spec.toLowerCase(), dir: 'ASC' };
        });
      }
    }

    // LIMIT
    let limitN = null;
    const mLimit = tail.match(/\s+LIMIT\s+(\d+)/i);
    if (mLimit) { limitN = parseInt(mLimit[1], 10); tail = tail.replace(/\s+LIMIT\s+\d+/i, ''); }

    const leftover = tail.replace(/;|\s/g, '');
    if (leftover) throw new Error(`Texto no reconocido: "${tail.trim()}".`);

    if (/^COUNT\s*\(\s*\*\s*\)$/i.test(colsPart)) usoCount = true;

    // ---- Construir filas combinadas (producto cartesiano + filtros JOIN) ----
    // Empezar con la tabla principal
    let filas = bd[tablaPrincipal].map(f => {
      const ctx = {};
      for (const k in f) {
        ctx[k] = f[k];
        ctx[aliasPrincipal + '.' + k] = f[k];
      }
      return ctx;
    });

    // Aplicar cada JOIN
    for (const join of joins) {
      const nuevasFilas = [];
      for (const fila of filas) {
        for (const jf of bd[join.tabla]) {
          const ctxCopia = { ...fila };
          for (const k in jf) {
            ctxCopia[k] = jf[k];
            ctxCopia[join.alias + '.' + k] = jf[k];
          }
          if (evalAst(join.onAst, ctxCopia)) nuevasFilas.push(ctxCopia);
        }
      }
      filas = nuevasFilas;
    }

    // Aplicar WHERE
    if (wherePart) {
      toks = tokenizarWhere(wherePart); pos.p = 0;
      const ast = parseExpr();
      if (pos.p < toks.length) throw new Error(`WHERE no procesado completamente. Sobró: "${toks.slice(pos.p).map(t => t.v || t.t).join(' ')}".`);
      filas = filas.filter(f => evalAst(ast, f));
    }

    // ORDER BY
    if (orderCols) {
      filas.sort((a, b) => {
        for (const oc of orderCols) {
          const av = ctxVal(oc.col, a), bv = ctxVal(oc.col, b);
          if (av == null && bv == null) continue;
          if (av == null) return oc.dir === 'DESC' ? -1 : 1;
          if (bv == null) return oc.dir === 'DESC' ? 1 : -1;
          if (av < bv) return oc.dir === 'DESC' ? 1 : -1;
          if (av > bv) return oc.dir === 'DESC' ? -1 : 1;
        }
        return 0;
      });
    }

    // LIMIT
    if (limitN !== null) filas = filas.slice(0, limitN);

    // Resolver columnas
    const colsTrim = colsPart.replace(/;$/, '').trim();
    let cols;
    if (colsTrim === '*') {
      // con JOIN, * muestra todas las columnas de todas las tablas (con prefijo)
      cols = [];
      [tablaPrincipal, ...joins.map(j => j.tabla)].forEach(t => {
        esquema[t].forEach(c => cols.push(c));
      });
    } else if (/^COUNT\s*\(\s*\*\s*\)$/i.test(colsTrim)) {
      return ok(renderTabla(['count'], [{ count: filas.length }]));
    } else {
      // Cada columna puede ser: "col", "tabla.col", "col AS alias", "tabla.col AS alias"
      const colSpecs = splitTop(colsTrim, /\s*,\s*/).map(c => {
        const mAs = c.match(/^(.+?)\s+AS\s+(\w+)$/i);
        const expr = (mAs ? mAs[1] : c).trim();
        const alias = (mAs ? mAs[2] : (expr.includes('.') ? expr.split('.')[1] : expr)).toLowerCase();
        return { expr: expr.toLowerCase(), alias };
      });
      cols = colSpecs.map(cs => cs.alias);
      // Transformar cada fila: sustituir el valor por el de la expresión
      filas = filas.map(f => {
        const nf = {};
        colSpecs.forEach(cs => {
          nf[cs.alias] = ctxVal(cs.expr, f);
        });
        return nf;
      });
    }

    // Renderizar
    return ok(renderTabla(cols, filas));
  }

  function verificarRetos() {
    const hitos = [
      { id: 'select-simple', test: () => true, msg: 'Ejecuta tu primer SELECT' },
      { id: 'join-equipos', test: () => usoJoin, msg: 'Usa JOIN para cruzar partidos con equipos' },
      { id: 'count-partidos', test: () => usoCount, msg: 'Usa COUNT(*) para contar partidos' },
      { id: 'where-estado', test: () => usoWhere, msg: 'Usa WHERE para filtrar por estado o categoría' },
      { id: 'order-fecha', test: () => usoOrderBy, msg: 'Usa ORDER BY para ordenar por fecha' }
    ];
    hitos.forEach(h => {
      if (!retos.includes(h.id) && h.test()) {
        retos.push(h.id);
        mostrarToast(`✓ Reto completado: ${h.msg}`);
        guardarProgreso();
      }
    });
    if (retos.length >= 5 && !estado.talleres['playground-bonus']) {
      estado.talleres['playground-bonus'] = true;
      addXP(XP_POR_PLAYGROUND);
      mostrarToast(`🏆 ¡Playground completado! +${XP_POR_PLAYGROUND} XP`);
      if (!estado.completados.has(6)) marcarCompletado(6);
      output.insertAdjacentHTML('beforeend', '<div style="margin-top:1rem;padding:0.8rem;background:rgba(16,185,129,0.12);border:1px solid var(--verde);border-radius:8px;color:var(--verde);font-weight:700;text-align:center;">🏆 ¡Playground completado! Los 5 retos están listos. (+' + XP_POR_PLAYGROUND + ' XP)</div>');
    }
  }

  function run() {
    const sql = editor.value;
    if (!sql.trim()) { output.innerHTML = err('Escribe una sentencia SELECT.'); return; }
    const sentencias = []; let actual = '', inStr = false;
    for (let i = 0; i < sql.length; i++) {
      const ch = sql[i];
      if (ch === "'") inStr = !inStr;
      if (ch === ';' && !inStr) { const st = actual.trim(); if (st) sentencias.push(st); actual = ''; }
      else actual += ch;
    }
    const st = actual.trim(); if (st) sentencias.push(st);

    let out = '';
    sentencias.forEach(sent => {
      try {
        const r = ejecutar(sent);
        out += `<div style="margin-bottom:0.8rem;padding-bottom:0.8rem;border-bottom:1px dashed var(--tarjeta-borde);">${r}</div>`;
      } catch (e) {
        out += `<div style="margin-bottom:0.8rem;padding-bottom:0.8rem;border-bottom:1px dashed var(--tarjeta-borde);">${err(e.message)}</div>`;
      }
    });
    output.innerHTML = out || err('No se ejecutó ninguna sentencia.');
    // marcar reto 'select-simple' siempre que se ejecute algo
    if (!retos.includes('select-simple')) { retos.push('select-simple'); guardarProgreso(); }
    verificarRetos();
  }

  function reset() {
    bd = bdInicial();
    usoJoin = false; usoCount = false; usoWhere = false; usoOrderBy = false; usoMultiTabla = false;
    retos.length = 0;
    delete estado.talleres['playground-bonus'];
    guardarProgreso();
    output.innerHTML = info('↺ BD reiniciada. 5 tablas con datos de torneos deportivos del colegio.');
  }

  runBtn.addEventListener('click', run);
  if (resetBtn) resetBtn.addEventListener('click', reset);

  output.innerHTML = info('BD lista. Tablas: deportes (2), torneos (3), equipos (6), jugadores (15), partidos (8). Pulsa ▶ Ejecutar.');
}

/* ---------- TALLER ---------- */
function configurarTaller() {
  document.querySelectorAll('.taller-sol-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.sol;
      const sol = document.getElementById(id);
      if (!sol) return;
      const visible = sol.classList.toggle('visible');
      btn.textContent = visible ? '🙈 Ocultar solución' : '👁️ Ver solución';
      if (visible && !estado.talleres[id]) {
        estado.talleres[id] = true;
        guardarProgreso();
      }
      const solucionesAbiertas = Object.keys(estado.talleres).filter(k => k.startsWith('sol-')).length;
      if (visible && solucionesAbiertas >= 6 && !estado.completados.has(7)) {
        marcarCompletado(7);
      }
    });
  });
}

/* ---------- ATAJOS DE TECLADO ---------- */
function configurarTeclado() {
  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.key === 'ArrowRight') {
      if (estado.moduloActual < TOTAL_MODULOS - 1) {
        marcarCompletado(estado.moduloActual);
        irAModulo(estado.moduloActual + 1);
      }
    } else if (e.key === 'ArrowLeft') {
      if (estado.moduloActual > 0) irAModulo(estado.moduloActual - 1);
    }
  });
}

/* ---------- TOAST ---------- */
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed', bottom: '30px', right: '30px',
    background: 'linear-gradient(135deg, #16a34a, #f59e0b)',
    color: '#fff', padding: '0.9rem 1.4rem', borderRadius: '30px',
    fontWeight: '700', boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    zIndex: '1000', transition: 'all 0.4s ease',
    opacity: '0', transform: 'translateY(20px)',
    maxWidth: '90%', fontSize: '0.92rem'
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}