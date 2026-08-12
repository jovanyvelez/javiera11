/* ============================================================
   CLASE 8 — BASES DE DATOS (Consultas básicas: SELECT, WHERE,
   operadores LIKE / BETWEEN / IN / IS NULL, ORDER BY)
   Lógica de navegación, quizzes, taller y mini-motor SQL (playground).
   El motor soporta: SELECT con columnas (o * o COUNT(*) o DISTINCT),
   WHERE con operadores de comparación (=, <>, !=, >, <, >=, <=),
   LIKE (con % y _), BETWEEN ... AND ..., IN (...), IS NULL, IS NOT NULL,
   combinaciones con AND / OR / NOT (con precedencia NOT > AND > OR),
   ORDER BY col [ASC|DESC] (multicolumna), LIMIT n.
   Es intencionalmente minimalista; su único objetivo es pedagógico.
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
const XP_TOTAL = 390;   // 6 módulos completables×30 + 5 quizzes×25 + 1 playground×25 = 390

const STORAGE_KEY = 'curso-bd-consultas-basicas';

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
}

function marcarCompletado(n) {
  if (estado.completados.has(n)) return;
  estado.completados.add(n);
  estado.xp = Math.min(XP_TOTAL, estado.xp + XP_POR_MODULO);

  const badgesModulo = {
    0: '🚀 Iniciado',
    1: '🔍 Selector',
    2: '🎯 Filtrador',
    3: '🧮 Operador',
    4: '☕ Descansado',
    5: '📊 Ordenador',
    6: '🧪 Jugador SQL',
    7: '📦 Consultor Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Consultas Básicas Dominadas');
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
    const labels = ['Inicio', 'SELECT', 'WHERE', 'Operadores', 'Descanso', 'ORDER BY', 'Playground', 'Taller'];
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
        result.textContent = '✅ ¡Correcto! ORDER BY precio DESC muestra los más caros primero; ASC (por defecto) los muestra de menor a mayor.';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ DESC ordena de mayor a menor (descendente); ASC de menor a mayor (ascendente). Para ver los productos más caros primero usa ORDER BY precio DESC.';
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

/* ---------- PLAYGROUND SQL (mini-motor en JS) ----------
   Simula una BD con dos tablas: categorias(id, nombre) y
   productos(id, nombre, precio, stock, categoria_id, activo).
   Soporta SELECT con columnas (o * o COUNT(*) o DISTINCT col),
   WHERE con operadores de comparación, LIKE (%, _), BETWEEN,
   IN (...), IS NULL, IS NOT NULL, combinaciones AND/OR/NOT
   (precedencia NOT > AND > OR), ORDER BY multicolumna y LIMIT.
   No soporta JOIN ni subconsultas (no se necesitan para los retos).
   Es intencionalmente minimalista; su único objetivo es pedagógico.
*/
function inicializarPlayground() {
  const editor = document.getElementById('sqlEditor');
  const output = document.getElementById('sqlOutput');
  const runBtn = document.getElementById('sqlRun');
  const resetBtn = document.getElementById('sqlReset');
  if (!editor || !output || !runBtn) return;

  // Estado de los retos completados (persistido)
  const RETOS_KEY = 'playground-retos';
  if (!estado.talleres[RETOS_KEY]) estado.talleres[RETOS_KEY] = [];
  const retos = estado.talleres[RETOS_KEY];

  // Esquema simulado (datos pre-cargados para que las consultas tengan sentido)
  function bdInicial() {
    return {
      categorias: [
        { id: 1, nombre: 'Alimentos' },
        { id: 2, nombre: 'Accesorios' },
        { id: 3, nombre: 'Higiene' },
        { id: 4, nombre: 'Juguetes' }
      ],
      productos: [
        { id: 1, nombre: 'Croquetas Perro 3kg',   precio: 45000, stock: 12, categoria_id: 1, activo: true },
        { id: 2, nombre: 'Comida Gato 1.5kg',     precio: 32000, stock: 20, categoria_id: 1, activo: true },
        { id: 3, nombre: 'Collar Antipulgas',     precio: 18000, stock: 30, categoria_id: 2, activo: true },
        { id: 4, nombre: 'Correa Retráctil',      precio: 28000, stock:  0, categoria_id: 2, activo: false },
        { id: 5, nombre: 'Champú Mascota 500ml',  precio: 22000, stock:  8, categoria_id: 3, activo: true },
        { id: 6, nombre: 'Pelota de Goma',        precio:  9000, stock: 40, categoria_id: 4, activo: true },
        { id: 7, nombre: 'Cama Perro Mediana',    precio: 75000, stock:  5, categoria_id: 2, activo: true },
        { id: 8, nombre: 'Croquetas Gato 5kg',    precio: 68000, stock: 10, categoria_id: 1, activo: true },
        { id: 9, nombre: 'Ratón de Juguete',      precio:  5000, stock: 50, categoria_id: 4, activo: true },
        { id: 10, nombre: 'Cepillo para Gato',    precio: 15000, stock: 15, categoria_id: 3, activo: true }
      ]
    };
  }

  let bd = bdInicial();

  // Columnas canónicas de cada tabla
  const esquema = {
    categorias: ['id', 'nombre'],
    productos: ['id', 'nombre', 'precio', 'stock', 'categoria_id', 'activo']
  };

  // Trackeo de hitos (para los 5 retos)
  let usoLike = false;
  let usoBetween = false;
  let usoOrderBy = false;
  let usoCount = false;
  let usoAndOr = false;

  // Render del output
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

  function ok(html) {
    return `<div style="color:var(--verde);font-weight:700;margin-bottom:0.5rem;">✓ OK</div>${html}`;
  }

  function err(msg) {
    return `<div style="color:var(--rosa);font-weight:700;margin-bottom:0.5rem;">⚠️ Error:</div><div style="color:var(--texto-suave);font-family:JetBrains Mono,monospace;font-size:0.85rem;">${escapeHtml(msg)}</div>`;
  }

  function info(msg) {
    return `<div style="color:var(--lima);font-weight:700;margin-bottom:0.5rem;">${escapeHtml(msg)}</div>`;
  }

  // Quita comentarios -- ... de una línea y normaliza espacios
  function quitarComentarios(s) {
    return s.split('\n').map(l => {
      const idx = l.indexOf('--');
      return idx >= 0 ? l.slice(0, idx) : l;
    }).join(' ').replace(/\s+/g, ' ').trim();
  }

  // Mini-parser de valores: 'string', número, NULL, TRUE, FALSE
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

  // Divide una cadena por un separador a nivel "top" (respeta strings y paréntesis)
  function splitTop(str, sepRe) {
    const parts = [];
    let cur = '';
    let inStr = false;
    let depth = 0;
    let i = 0;
    while (i < str.length) {
      const ch = str[i];
      if (ch === "'") { inStr = !inStr; cur += ch; i++; continue; }
      if (!inStr) {
        if (ch === '(') { depth++; cur += ch; i++; continue; }
        if (ch === ')') { depth--; cur += ch; i++; continue; }
        if (depth === 0) {
          const rest = str.slice(i);
          const m = rest.match(sepRe);
          if (m && m.index === 0) {
            parts.push(cur.trim());
            cur = '';
            i += m[0].length;
            continue;
          }
        }
      }
      cur += ch;
      i++;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
  }

  // ---------- TOKENIZER para el parser de WHERE ----------
  // Convierte una cadena de condición en una lista de tokens.
  // Tipos: 'str', 'num', 'ident', 'op', 'kw', 'lparen', 'rparen', 'comma'
  function tokenizarWhere(s) {
    const tokens = [];
    let i = 0;
    const n = s.length;
    const keywords = { AND: 'AND', OR: 'OR', NOT: 'NOT', LIKE: 'LIKE',
                       BETWEEN: 'BETWEEN', IN: 'IN', IS: 'IS', NULL: 'NULL', TRUE: 'TRUE', FALSE: 'FALSE' };
    while (i < n) {
      const ch = s[i];
      if (ch === ' ' || ch === '\t') { i++; continue; }
      if (ch === '(') { tokens.push({ t: 'lparen' }); i++; continue; }
      if (ch === ')') { tokens.push({ t: 'rparen' }); i++; continue; }
      if (ch === ',') { tokens.push({ t: 'comma' }); i++; continue; }
      if (ch === "'") {
        // string hasta la siguiente comilla simple
        let j = i + 1;
        while (j < n && s[j] !== "'") j++;
        if (j >= n) throw new Error('String sin cerrar en el WHERE (falta la comilla simple final).');
        tokens.push({ t: 'str', v: s.slice(i + 1, j) });
        i = j + 1;
        continue;
      }
      // operadores de comparación (2 o 1 char)
      const two = s.slice(i, i + 2);
      if (two === '>=' || two === '<=' || two === '<>' || two === '!=') {
        tokens.push({ t: 'op', v: two }); i += 2; continue;
      }
      if (ch === '>' || ch === '<' || ch === '=') {
        tokens.push({ t: 'op', v: ch }); i++; continue;
      }
      // número (entero o decimal)
      const numM = s.slice(i).match(/^(-?\d+\.\d+)/) || s.slice(i).match(/^(-?\d+)/);
      if (numM) {
        tokens.push({ t: 'num', v: numM[1] });
        i += numM[1].length;
        continue;
      }
      // identificador o keyword (letras, _, dígitos; empieza por letra o _)
      const idM = s.slice(i).match(/^[A-Za-z_][A-Za-z0-9_\.]*/);
      if (idM) {
        const word = idM[0];
        const up = word.toUpperCase();
        if (keywords[up]) {
          tokens.push({ t: 'kw', v: up });
        } else {
          tokens.push({ t: 'ident', v: word.toLowerCase() });
        }
        i += word.length;
        continue;
      }
      throw new Error(`Carácter no reconocido en el WHERE: "${ch}".`);
    }
    return tokens;
  }

  // ---------- PARSER recursivo descendente para WHERE ----------
  // Gramática (precedencia NOT > AND > OR):
  //   expr      := orExpr
  //   orExpr    := andExpr ( OR andExpr )*
  //   andExpr   := notExpr ( AND notExpr )*
  //   notExpr   := NOT notExpr | primary
  //   primary   := '(' expr ')' | condicion
  //   condicion := ident op valor
  //              | ident LIKE 'patrón'
  //              | ident BETWEEN valor AND valor
  //              | ident IN '(' valor (',' valor)* ')'
  //              | ident IS NULL
  //              | ident IS NOT NULL
  const pos = { p: 0 };
  let toks = [];

  function peek() { return toks[pos.p]; }
  function next() { return toks[pos.p++]; }
  function expect(type, val) {
    const tk = next();
    if (!tk || tk.t !== type || (val !== undefined && tk.v !== val)) {
      throw new Error(`Se esperaba ${val || type} pero se encontró ${tk ? (tk.v || tk.t) : 'fin de la condición'}.`);
    }
    return tk;
  }
  function atKw(word) {
    const tk = peek();
    return tk && tk.t === 'kw' && tk.v === word;
  }

  // Nodo del AST: { type: 'or'|'and'|'not'|'cmp'|'like'|'between'|'in'|'isnull', ... }
  function parseExpr() { return parseOr(); }

  function parseOr() {
    let node = parseAnd();
    while (atKw('OR')) {
      next(); // consume OR
      const right = parseAnd();
      node = { type: 'or', left: node, right };
    }
    return node;
  }

  function parseAnd() {
    let node = parseNot();
    while (atKw('AND')) {
      next(); // consume AND
      const right = parseNot();
      node = { type: 'and', left: node, right };
    }
    return node;
  }

  function parseNot() {
    if (atKw('NOT')) {
      next();
      return { type: 'not', operand: parseNot() };
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const tk = peek();
    if (tk && tk.t === 'lparen') {
      next(); // consume '('
      const e = parseExpr();
      expect('rparen');
      return e;
    }
    return parseCondicion();
  }

  // Lee un "valor" de la derecha: str, num, NULL, TRUE, FALSE, o ident (para BETWEEN/IN/comparación)
  function parseValorToken() {
    const tk = next();
    if (!tk) throw new Error('Se esperaba un valor pero se encontró fin de la condición.');
    if (tk.t === 'str') return { kind: 'lit', v: tk.v };
    if (tk.t === 'num') return { kind: 'lit', v: parseVal(tk.v) };
    if (tk.t === 'kw') {
      if (tk.v === 'NULL') return { kind: 'lit', v: null };
      if (tk.v === 'TRUE') return { kind: 'lit', v: true };
      if (tk.v === 'FALSE') return { kind: 'lit', v: false };
      throw new Error(`Palabra clave inesperada como valor: ${tk.v}.`);
    }
    if (tk.t === 'ident') return { kind: 'lit', v: tk.v };
    throw new Error(`Se esperaba un valor pero se encontró "${tk.v || tk.t}".`);
  }

  function parseCondicion() {
    const colTk = next();
    if (!colTk || colTk.t !== 'ident') {
      throw new Error(`Se esperaba un nombre de columna pero se encontró "${colTk ? (colTk.v || colTk.t) : 'fin'}".`);
    }
    const col = colTk.v;
    const tk = peek();
    if (!tk) throw new Error(`Condición incompleta después de "${col}".`);

    // IS NULL / IS NOT NULL
    if (tk.t === 'kw' && tk.v === 'IS') {
      next(); // consume IS
      if (atKw('NOT')) { next(); expect('kw', 'NULL'); return { type: 'isnull', col, neg: true }; }
      expect('kw', 'NULL');
      return { type: 'isnull', col, neg: false };
    }
    // LIKE 'patrón'
    if (tk.t === 'kw' && tk.v === 'LIKE') {
      next(); // consume LIKE
      const pat = next();
      if (!pat || pat.t !== 'str') throw new Error('LIKE debe ir seguido de un patrón entre comillas simples, p. ej. LIKE \'%a%\'.');
      return { type: 'like', col, pattern: pat.v };
    }
    // BETWEEN valor AND valor
    if (tk.t === 'kw' && tk.v === 'BETWEEN') {
      next(); // consume BETWEEN
      const lo = parseValorToken();
      expect('kw', 'AND');
      const hi = parseValorToken();
      return { type: 'between', col, lo: lo.v, hi: hi.v };
    }
    // IN (val, val, ...)
    if (tk.t === 'kw' && tk.v === 'IN') {
      next(); // consume IN
      expect('lparen');
      const vals = [];
      vals.push(parseValorToken().v);
      while (peek() && peek().t === 'comma') {
        next(); // consume ','
        vals.push(parseValorToken().v);
      }
      expect('rparen');
      return { type: 'in', col, vals };
    }
    // comparación: ident op valor
    if (tk.t === 'op') {
      next(); // consume op
      const val = parseValorToken();
      return { type: 'cmp', col, op: tk.v, val: val.v };
    }
    throw new Error(`Operador no reconocido después de "${col}". Se esperaba =, <>, !=, >, <, >=, <=, LIKE, BETWEEN, IN o IS.`);
  }

  // ---------- EVALUADOR del AST de WHERE contra una fila ----------
  function evalAst(node, fila) {
    switch (node.type) {
      case 'or':  return evalAst(node.left, fila) || evalAst(node.right, fila);
      case 'and': return evalAst(node.left, fila) && evalAst(node.right, fila);
      case 'not': return !evalAst(node.operand, fila);
      case 'isnull': {
        const v = fila[node.col];
        return node.neg ? (v !== null && v !== undefined) : (v === null || v === undefined);
      }
      case 'like': {
        const v = fila[node.col];
        if (v === null || v === undefined) return false;
        return likeMatch(String(v), node.pattern);
      }
      case 'between': {
        const v = fila[node.col];
        if (v === null || v === undefined) return false;
        return v >= node.lo && v <= node.hi;
      }
      case 'in': {
        const v = fila[node.col];
        return node.vals.includes(v);
      }
      case 'cmp': {
        const v = fila[node.col];
        const val = node.val;
        if (v === null || v === undefined) return false;
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

  // Implementa LIKE de SQL: % = secuencia cualquiera, _ = un carácter.
  function likeMatch(str, pattern) {
    // Convierte el patrón a una RegExp de JS escapando todo salvo % y _
    let re = '';
    for (let i = 0; i < pattern.length; i++) {
      const ch = pattern[i];
      if (ch === '%') re += '.*';
      else if (ch === '_') re += '.';
      else re += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    return new RegExp('^' + re + '$', 'i').test(str);
  }

  // Ejecuta una sentencia (sólo SELECT; otros DML no se soportan en este playground)
  function ejecutar(sentencia) {
    const s = quitarComentarios(sentencia);
    if (!s) return info('— sentencia vacía —');
    const up = s.toUpperCase();

    if (!up.startsWith('SELECT')) {
      throw new Error(`Comando no soportado en el playground: "${s.slice(0, 40)}...". Este playground sólo admite SELECT (es una clase de consultas).`);
    }

    // SELECT [DISTINCT] cols FROM tabla [WHERE cond] [ORDER BY col [ASC|DESC](, ...)*] [LIMIT n]
    // Extraemos las partes con un escáner robusto que respeta strings y paréntesis.
    let rest = s.replace(/^SELECT\s+/i, '');

    // DISTINCT
    let distinct = false;
    const mDist = rest.match(/^DISTINCT\s+/i);
    if (mDist) { distinct = true; rest = rest.slice(mDist[0].length); }

    // Encuentra la posición (a nivel top, fuera de strings y paréntesis) de la
    // primera ocurrencia de una palabra clave dada (con boundary de palabra).
    // Devuelve el índice del carácter donde empieza la palabra, o -1.
    function indexOfKw(str, kwRe) {
      let inStr = false, depth = 0;
      let i = 0;
      while (i < str.length) {
        const ch = str[i];
        if (ch === "'") { inStr = !inStr; i++; continue; }
        if (!inStr) {
          if (ch === '(') { depth++; i++; continue; }
          if (ch === ')') { depth--; i++; continue; }
          if (depth === 0) {
            const m = str.slice(i).match(kwRe);
            if (m && m.index === 0) return i;
          }
        }
        i++;
      }
      return -1;
    }

    // FROM: la columna va hasta el primer " FROM " top-level
    const fromIdx = indexOfKw(rest, /\s+FROM\s+/i);
    if (fromIdx < 0) throw new Error('Sintaxis SELECT no reconocida. Revisa: SELECT cols FROM tabla [WHERE ...] [ORDER BY ...] [LIMIT n];');
    let colsPart = rest.slice(0, fromIdx).trim();
    let tail = rest.slice(fromIdx).replace(/^\s+FROM\s+/i, '');
    // tabla = primera palabra
    const mTabla = tail.match(/^(\w+)/);
    if (!mTabla) throw new Error('Se esperaba un nombre de tabla después de FROM.');
    const tabla = mTabla[1].toLowerCase();
    tail = tail.slice(mTabla[1].length);

    if (tabla !== 'productos' && tabla !== 'categorias') {
      throw new Error(`La tabla "${tabla}" no existe en el playground. Usa "productos" o "categorias".`);
    }

    // Trackeo de retos
    if (/^COUNT\s*\(\s*\*\s*\)$/i.test(colsPart)) usoCount = true;

    // WHERE: primera aparición top-level de " WHERE "
    let wherePart = null;
    const whereIdx = indexOfKw(tail, /\s+WHERE\s+/i);
    if (whereIdx >= 0) {
      // todo desde después de WHERE hasta el final (luego cortamos ORDER BY / LIMIT)
      wherePart = tail.slice(whereIdx).replace(/^\s+WHERE\s+/i, '');
      tail = '';
    }

    // ORDER BY: cortar desde donde empieza ORDER BY (top-level)
    let orderCols = null;
    if (wherePart) {
      const obIdx = indexOfKw(wherePart, /\s+ORDER\s+BY\s+/i);
      if (obIdx >= 0) {
        const orderStr = wherePart.slice(obIdx).replace(/^\s+ORDER\s+BY\s+/i, '');
        wherePart = wherePart.slice(0, obIdx);
        // de orderStr cortar LIMIT
        const limIdx = indexOfKw(orderStr, /\s+LIMIT\s+/i);
        let orderOnly = orderStr;
        let limitStr = null;
        if (limIdx >= 0) {
          limitStr = orderStr.slice(limIdx).replace(/^\s+LIMIT\s+/i, '');
          orderOnly = orderStr.slice(0, limIdx);
        }
        orderOnly = orderOnly.replace(/;$/, '').trim();
        if (orderOnly) {
          usoOrderBy = true;
          orderCols = splitTop(orderOnly, /\s*,\s*/).map(spec => {
            const m = spec.match(/^(\w+)\s+(ASC|DESC)$/i);
            if (m) return { col: m[1].toLowerCase(), dir: m[2].toUpperCase() };
            return { col: spec.toLowerCase(), dir: 'ASC' };
          });
        }
        if (limitStr) {
          const lm = limitStr.match(/^(\d+)/);
          if (lm) { /* limitN abajo */ }
        }
        // guardar LIMIT encontrado aquí
        if (limitStr) {
          const lm = limitStr.match(/^(\d+)/);
          if (lm) tail = 'LIMIT ' + lm[1]; // lo procesa el bloque de abajo
        }
      }
    } else {
      // no hay WHERE; ORDER BY puede estar en tail
      const obIdx = indexOfKw(tail, /\s+ORDER\s+BY\s+/i);
      if (obIdx >= 0) {
        const orderStr = tail.slice(obIdx).replace(/^\s+ORDER\s+BY\s+/i, '');
        tail = tail.slice(0, obIdx);
        const limIdx = indexOfKw(orderStr, /\s+LIMIT\s+/i);
        let orderOnly = orderStr;
        let limitStr = null;
        if (limIdx >= 0) {
          limitStr = orderStr.slice(limIdx).replace(/^\s+LIMIT\s+/i, '');
          orderOnly = orderStr.slice(0, limIdx);
        }
        orderOnly = orderOnly.replace(/;$/, '').trim();
        if (orderOnly) {
          usoOrderBy = true;
          orderCols = splitTop(orderOnly, /\s*,\s*/).map(spec => {
            const m = spec.match(/^(\w+)\s+(ASC|DESC)$/i);
            if (m) return { col: m[1].toLowerCase(), dir: m[2].toUpperCase() };
            return { col: spec.toLowerCase(), dir: 'ASC' };
          });
        }
        if (limitStr) tail = 'LIMIT ' + limitStr.match(/^(\d+)/)[1];
      }
    }

    // Limpiar wherePart de ; final
    if (wherePart) wherePart = wherePart.replace(/;$/, '').trim();

    // LIMIT (en tail)
    let limitN = null;
    const mLimit = tail.match(/^\s*LIMIT\s+(\d+)/i);
    if (mLimit) {
      limitN = parseInt(mLimit[1], 10);
      tail = tail.slice(mLimit[0].length);
    }

    // Debe quedar basura?
    const leftover = tail.replace(/;|\s/g, '');
    if (leftover) throw new Error(`Texto no reconocido al final de la sentencia: "${tail.trim()}".`);

    // Trackeo: revisar si el WHERE usa LIKE / BETWEEN / AND / OR
    if (wherePart) {
      if (/\bLIKE\b/i.test(wherePart)) usoLike = true;
      if (/\bBETWEEN\b/i.test(wherePart)) usoBetween = true;
      if (/\bAND\b/i.test(wherePart) || /\bOR\b/i.test(wherePart)) usoAndOr = true;
    }

    // Filas de trabajo
    let filas = bd[tabla].slice();

    // Aplicar WHERE (parser)
    if (wherePart) {
      toks = tokenizarWhere(wherePart);
      pos.p = 0;
      const ast = parseExpr();
      if (pos.p < toks.length) {
        throw new Error(`Condición WHERE no procesada completamente. Sobró: "${toks.slice(pos.p).map(t => t.v || t.t).join(' ')}".`);
      }
      filas = filas.filter(f => evalAst(ast, f));
    }

    // Aplicar ORDER BY (estable: compara en orden de columnas)
    if (orderCols) {
      filas.sort((a, b) => {
        for (const oc of orderCols) {
          const av = a[oc.col], bv = b[oc.col];
          if (av == null && bv == null) continue;
          if (av == null) return oc.dir === 'DESC' ? -1 : 1;
          if (bv == null) return oc.dir === 'DESC' ? 1 : -1;
          if (av < bv) return oc.dir === 'DESC' ? 1 : -1;
          if (av > bv) return oc.dir === 'DESC' ? -1 : 1;
        }
        return 0;
      });
    }

    // Aplicar LIMIT
    if (limitN !== null) filas = filas.slice(0, limitN);

    // Resolver columnas del SELECT
    const colsTrim = colsPart.replace(/;$/, '').trim();
    let cols;
    if (colsTrim === '*') {
      cols = esquema[tabla].slice();
    } else if (/^COUNT\s*\(\s*\*\s*\)$/i.test(colsTrim)) {
      return ok(renderTabla(['count'], [{ count: filas.length }]));
    } else if (/^COUNT\s*\(\s*\w+\s*\)$/i.test(colsTrim)) {
      const cm = colsTrim.match(/^COUNT\s*\(\s*(\w+)\s*\)$/i);
      const c = cm[1].toLowerCase();
      const n = filas.filter(f => f[c] !== null && f[c] !== undefined).length;
      return ok(renderTabla(['count'], [{ count: n }]));
    } else {
      cols = splitTop(colsTrim, /\s*,\s*/).map(c => c.toLowerCase());
      // validar columnas
      cols.forEach(c => {
        if (!(esquema[tabla].includes(c))) {
          throw new Error(`La columna "${c}" no existe en la tabla "${tabla}". Columnas válidas: ${esquema[tabla].join(', ')}.`);
        }
      });
    }

    // DISTINCT: elimina duplicados sobre las columnas pedidas
    if (distinct) {
      const seen = new Set();
      filas = filas.filter(f => {
        const key = cols.map(c => f[c]).join('\u0000');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return ok(renderTabla(cols, filas));
  }

  // Verificación de retos (5 hitos)
  function verificarRetos() {
    const hitos = [
      { id: 'select-count', test: () => usoCount, msg: 'Usa SELECT COUNT(*) FROM productos; para contar las filas' },
      { id: 'where-like', test: () => usoLike, msg: "Usa LIKE con un patrón (p. ej. WHERE nombre LIKE '%a%')" },
      { id: 'where-between', test: () => usoBetween, msg: 'Usa BETWEEN para filtrar por rango (p. ej. WHERE precio BETWEEN 10000 AND 30000)' },
      { id: 'order-by', test: () => usoOrderBy, msg: 'Usa ORDER BY ... DESC para ordenar (p. ej. ORDER BY precio DESC)' },
      { id: 'where-complex', test: () => usoAndOr, msg: 'Combina dos condiciones con AND u OR en el WHERE' }
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
    if (!sql.trim()) { output.innerHTML = err('Escribe alguna sentencia SELECT en el cuadro izquierdo.'); return; }
    // split por ; respetando strings
    const sentencias = [];
    let actual = '', inStr = false;
    for (let i = 0; i < sql.length; i++) {
      const ch = sql[i];
      if (ch === "'") inStr = !inStr;
      if (ch === ';' && !inStr) {
        const st = actual.trim();
        if (st) sentencias.push(st);
        actual = '';
      } else {
        actual += ch;
      }
    }
    const st = actual.trim();
    if (st) sentencias.push(st);

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
    verificarRetos();
  }

  function reset() {
    bd = bdInicial();
    usoLike = false;
    usoBetween = false;
    usoOrderBy = false;
    usoCount = false;
    usoAndOr = false;
    retos.length = 0;
    delete estado.talleres['playground-bonus'];
    guardarProgreso();
    output.innerHTML = info('↺ BD reiniciada. categorias tiene 4 filas; productos tiene 10 filas.');
  }

  runBtn.addEventListener('click', run);
  if (resetBtn) resetBtn.addEventListener('click', reset);

  // Render inicial
  output.innerHTML = info('BD lista. categorias tiene 4 filas (Alimentos, Accesorios, Higiene, Juguetes); productos tiene 10 filas. Pulsa ▶ Ejecutar.');
}

/* ---------- TALLER (soluciones plegables) ---------- */
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
      // 6 soluciones en el taller
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
    background: 'linear-gradient(135deg, #06b6d4, #f59e0b)',
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