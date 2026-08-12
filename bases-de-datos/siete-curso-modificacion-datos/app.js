/* ============================================================
   CLASE 7 — BASES DE DATOS (Inserción, modificación y eliminación)
   Lógica de navegación, quizzes, taller y mini-motor SQL (playground)
   El motor soporta: INSERT (multi-fila + RETURNING + ON CONFLICT),
   SELECT (WHERE con AND/OR, ORDER BY, LIMIT), UPDATE (multi-columna,
   expresiones tipo col = col * n, RETURNING), DELETE (RETURNING) y
   transacciones TCL (BEGIN / COMMIT / ROLLBACK).
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

const STORAGE_KEY = 'curso-bd-modificacion-datos';

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
    1: '➕ Inserter',
    2: '✏️ Updater',
    3: '🗑️ Deleter',
    4: '☕ Descansado',
    5: '🛡️ Transaccional',
    6: '🧪 Jugador DML',
    7: '📦 DML Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Modificación de Datos Dominada');
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
    const labels = ['Inicio', 'INSERT', 'UPDATE', 'DELETE', 'Descanso', 'TCL', 'Playground', 'Taller'];
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
        result.textContent = '✅ ¡Correcto! ROLLBACK descarta los cambios y deja la BD como estaba antes del BEGIN.';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ COMMIT guarda los cambios; ROLLBACK los descarta. La gracia de BEGIN/ROLLBACK es poder "deshacer" un UPDATE o DELETE destructivo.';
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
   Soporta INSERT (multi-fila, RETURNING, ON CONFLICT DO NOTHING/DO UPDATE),
   SELECT (WHERE con AND/OR, ORDER BY, LIMIT), UPDATE (multi-columna,
   expresiones tipo precio = precio * 1.1, RETURNING), DELETE (RETURNING)
   y transacciones (BEGIN / COMMIT / ROLLBACK).
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

  // Esquema simulado
  function bdInicial() {
    return {
      categorias: [
        { id: 1, nombre: 'Alimentos' },
        { id: 2, nombre: 'Accesorios' },
        { id: 3, nombre: 'Higiene' }
      ],
      productos: []
      // productos: { id, nombre, precio, stock, categoria_id, activo }
    };
  }

  let bd = bdInicial();
  let nextId = { productos: 1 };
  let selects = 0;
  let usadoReturning = false;
  let usoRollback = false;
  let usoOnConflict = false;

  // Transacciones: snapshot del estado al hacer BEGIN
  let enTransaccion = false;
  let snapshotBd = null;
  let snapshotNextId = null;

  // Columnas canónicas de cada tabla
  const esquema = {
    categorias: ['id', 'nombre'],
    productos: ['id', 'nombre', 'precio', 'stock', 'categoria_id', 'activo']
  };

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

  // Splitter de sentencias por ';' (respeta strings entre comillas simples)
  function splitSentencias(sql) {
    const sentencias = [];
    let actual = '';
    let inStr = false;
    for (let i = 0; i < sql.length; i++) {
      const ch = sql[i];
      if (ch === "'") inStr = !inStr;
      if (ch === ';' && !inStr) {
        const s = actual.trim();
        if (s) sentencias.push(s);
        actual = '';
      } else {
        actual += ch;
      }
    }
    const s = actual.trim();
    if (s) sentencias.push(s);
    return sentencias;
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

  // Divide "(v1, v2, v3)" en valores respetando strings con comas
  function parseValues(s) {
    s = s.trim();
    if (!s.startsWith('(') || !s.endsWith(')')) throw new Error('Se esperaba (valores) tras VALUES');
    const inner = s.slice(1, -1);
    const out = [];
    let cur = '';
    let inStr = false;
    for (let i = 0; i < inner.length; i++) {
      const ch = inner[i];
      if (ch === "'") { inStr = !inStr; cur += ch; }
      else if (ch === ',' && !inStr) { out.push(parseVal(cur)); cur = ''; }
      else cur += ch;
    }
    if (cur.trim()) out.push(parseVal(cur));
    return out;
  }

  // Divide una cadena por un separador a nivel "top" (respetando strings y paréntesis)
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

  // Evalúa una condición simple "col op val" contra una fila
  function evalCond(cond, fila) {
    cond = cond.trim();
    let m = cond.match(/^(\w+)\s+IS\s+NOT\s+NULL$/i);
    if (m) return fila[m[1].toLowerCase()] !== null && fila[m[1].toLowerCase()] !== undefined;
    m = cond.match(/^(\w+)\s+IS\s+NULL$/i);
    if (m) return fila[m[1].toLowerCase()] === null || fila[m[1].toLowerCase()] === undefined;
    m = cond.match(/^(\w+)\s*(=|<>|!=|>=|<=|>|<)\s*(.+)$/);
    if (!m) throw new Error(`WHERE no soportado en el playground: "${cond}". Usa "col = val", "col > val", "col IS NULL" o combina con AND/OR.`);
    const col = m[1].toLowerCase();
    const op = m[2];
    const val = parseVal(m[3].trim().replace(/;$/, ''));
    const fv = fila[col];
    switch (op) {
      case '=':  return fv == val;
      case '<>': case '!=': return fv != val;
      case '>':  return fv > val;
      case '<':  return fv < val;
      case '>=': return fv >= val;
      case '<=': return fv <= val;
    }
    return false;
  }

  // Evalúa un WHERE completo (soporta AND / OR con AND más prioritario)
  function evalWhere(part, fila) {
    const orParts = splitTop(part, /\s+OR\s+/i);
    return orParts.some(orP => {
      const andParts = splitTop(orP, /\s+AND\s+/i);
      return andParts.every(andP => evalCond(andP, fila));
    });
  }

  // Evalúa el lado derecho de un SET: literal, referencia a columna, o
  // expresión aritmética simple sobre la propia fila (col * 1.1, col + 5 ...)
  function evalExpr(expr, fila) {
    expr = expr.trim();
    // UPPER(...) / LOWER(...)
    let m = expr.match(/^UPPER\s*\(\s*(.+?)\s*\)$/i);
    if (m) return String(evalExpr(m[1], fila)).toUpperCase();
    m = expr.match(/^LOWER\s*\(\s*(.+?)\s*\)$/i);
    if (m) return String(evalExpr(m[1], fila)).toLowerCase();
    // COALESCE(a, b)
    m = expr.match(/^COALESCE\s*\(\s*(.+?)\s*,\s*(.+?)\s*\)$/i);
    if (m) { const a = evalExpr(m[1], fila); return (a === null || a === undefined) ? evalExpr(m[2], fila) : a; }
    // NOW()
    if (/^NOW\s*\(\s*\)$/i.test(expr)) return '2026-08-12';
    // excluded.col (referencia al valor entrante en ON CONFLICT DO UPDATE)
    m = expr.match(/^excluded\.(\w+)$/i);
    if (m && fila && fila.__excluded) return fila.__excluded[m[1].toLowerCase()];
    // expresión aritmética: term (op term)+
    m = expr.match(/^(\w+|'.*?'|-?\d+(\.\d+)?)\s*([\*\/\+\-])\s*(.+)$/);
    if (m) {
      const izq = evalExpr(m[1], fila);
      const der = evalExpr(m[4], fila);
      const op = m[3];
      if (typeof izq !== 'number' || typeof der !== 'number')
        throw new Error(`No puedo hacer aritmética con '${izq}' y '${der}'. Usa columnas numéricas (precio, stock).`);
      switch (op) {
        case '*': return Math.round(izq * der * 1e6) / 1e6;
        case '/': return der === 0 ? null : Math.round((izq / der) * 1e6) / 1e6;
        case '+': return Math.round((izq + der) * 1e6) / 1e6;
        case '-': return Math.round((izq - der) * 1e6) / 1e6;
      }
    }
    // referencia a columna de la fila
    if (/^[a-zA-Z_]\w*$/.test(expr)) {
      const v = fila[expr.toLowerCase()];
      if (v === undefined) throw new Error(`La columna "${expr}" no existe en esta fila`);
      return v;
    }
    // valor literal
    return parseVal(expr);
  }

  // Clona el estado de la BD (para transacciones)
  function clonarBd(b) {
    return {
      categorias: b.categorias.map(f => ({ ...f })),
      productos: b.productos.map(f => ({ ...f }))
    };
  }

  // Ejecuta una sentencia
  function ejecutar(sentencia) {
    const s = quitarComentarios(sentencia);
    if (!s) return info('— sentencia vacía —');
    const up = s.toUpperCase();

    // ---- Transacciones (TCL) ----
    if (up === 'BEGIN' || up === 'START TRANSACTION') {
      if (enTransaccion) throw new Error('Ya hay una transacción en curso (haz COMMIT o ROLLBACK antes).');
      enTransaccion = true;
      snapshotBd = clonarBd(bd);
      snapshotNextId = { ...nextId };
      return info('BEGIN');
    }
    if (up === 'COMMIT') {
      if (!enTransaccion) throw new Error('No hay transacción en curso. Usa BEGIN para iniciar una.');
      enTransaccion = false;
      snapshotBd = null;
      snapshotNextId = null;
      return info('COMMIT');
    }
    if (up === 'ROLLBACK') {
      if (!enTransaccion) throw new Error('No hay transacción en curso. Usa BEGIN para iniciar una.');
      bd = snapshotBd;
      nextId = snapshotNextId;
      enTransaccion = false;
      snapshotBd = null;
      snapshotNextId = null;
      usoRollback = true;
      return info('ROLLBACK');
    }

    // ---- INSERT INTO tabla (cols) VALUES (...), (...) [ON CONFLICT ...] [RETURNING ...] ----
    if (up.startsWith('INSERT INTO')) {
      let returningCols = null;
      let cuerpo = s;
      const mRet = s.match(/^(.+?)\s+RETURNING\s+(.+)$/i);
      if (mRet) {
        cuerpo = mRet[1];
        const rc = mRet[2].trim().replace(/;$/, '');
        returningCols = rc === '*' ? null : rc.split(',').map(c => c.trim().toLowerCase());
        usadoReturning = true;
      } else {
        cuerpo = s.replace(/;$/, '');
      }
      const m = cuerpo.match(/^INSERT\s+INTO\s+(\w+)\s*\(([^)]*)\)\s*VALUES\s*(.+)$/i);
      if (!m) throw new Error('Sintaxis INSERT no reconocida. Usa: INSERT INTO tabla (col1, col2) VALUES (v1, v2);');
      const tabla = m[1].toLowerCase();
      const cols = m[2].split(',').map(c => c.trim().toLowerCase());
      let valsPart = m[3].trim();
      // ¿hay ON CONFLICT?
      let onConflict = null;
      const mConf = valsPart.match(/^(.*?)\s+ON\s+CONFLICT\s*\(([^)]*)\)\s+(DO\s+NOTHING|DO\s+UPDATE\s+SET\s+.+)$/i);
      if (mConf) {
        valsPart = mConf[1];
        onConflict = {
          col: mConf[2].trim().toLowerCase(),
          doUpdate: /DO\s+UPDATE/i.test(mConf[3]),
          set: mConf[3].replace(/^DO\s+UPDATE\s+SET\s+/i, '').trim()
        };
        usoOnConflict = true;
      }
      // múltiples grupos (...) separados por comas (top-level)
      const grupos = [];
      {
        let cur = '', depth = 0, inStr = false;
        for (let i = 0; i < valsPart.length; i++) {
          const ch = valsPart[i];
          if (ch === "'") inStr = !inStr;
          if (!inStr) {
            if (ch === '(') { depth++; if (depth === 1) { cur = ''; continue; } }
            if (ch === ')') { depth--; if (depth === 0) { grupos.push(cur); cur = ''; continue; } }
          }
          cur += ch;
        }
        if (cur.trim()) grupos.push(cur);
      }
      if (!grupos.length) throw new Error('No se encontraron grupos de valores tras VALUES');
      if (tabla !== 'productos' && tabla !== 'categorias') throw new Error(`La tabla "${tabla}" no existe en el playground. Usa "productos" o "categorias".`);
      let insertadas = 0;
      const filasReturn = [];
      grupos.forEach(g => {
        const vals = parseValues('(' + g + ')');
        if (vals.length !== cols.length) throw new Error(`Número de columnas (${cols.length}) y valores (${vals.length}) no coinciden`);
        // construir fila entrante (excluded)
        const entrante = {};
        cols.forEach((c, i) => { if (c !== 'id') entrante[c] = vals[i]; });
        // ¿conflicto en onConflict.col?
        if (onConflict) {
          const existente = bd[tabla].find(f => f[onConflict.col] === entrante[onConflict.col]);
          if (existente) {
            if (onConflict.doUpdate) {
              existente.__excluded = entrante;
              const sets = splitTop(onConflict.set, /\s*,\s*/);
              sets.forEach(st => {
                const sm = st.match(/^(\w+)\s*=\s*(.+)$/);
                if (!sm) throw new Error(`SET del ON CONFLICT no reconocido: "${st}"`);
                existente[sm[1].toLowerCase()] = evalExpr(sm[2], existente);
              });
              delete existente.__excluded;
              insertadas++;
              filasReturn.push(existente);
            }
            // DO NOTHING: no inserta, no cuenta
            return;
          }
        }
        // inserción normal
        let fila;
        if (tabla === 'productos') {
          fila = { id: nextId.productos++, activo: true }; // activo por defecto
          Object.assign(fila, entrante);
          if (fila.categoria_id !== null && fila.categoria_id !== undefined) {
            if (!bd.categorias.find(c => c.id === fila.categoria_id))
              throw new Error(`Violación de FK: categoria_id=${fila.categoria_id} no existe en categorias (ids válidos: 1,2,3)`);
          }
          if ('precio' in fila && (typeof fila.precio !== 'number' || fila.precio <= 0))
            throw new Error('Violación de CHECK: precio debe ser un número mayor que 0');
          if ('stock' in fila && typeof fila.stock !== 'number')
            throw new Error('stock debe ser numérico');
          bd.productos.push(fila);
        } else {
          fila = { id: bd.categorias.length + 1 };
          Object.assign(fila, entrante);
          if (fila.nombre !== undefined && bd.categorias.find(c => c.nombre === fila.nombre))
            throw new Error(`Violación de UNIQUE: ya existe la categoria "${fila.nombre}"`);
          bd.categorias.push(fila);
        }
        insertadas++;
        filasReturn.push(fila);
      });
      if (returningCols) {
        return ok(renderTabla(returningCols, filasReturn)) + info(`INSERT 0 ${insertadas}`);
      }
      return info(`INSERT 0 ${insertadas}`);
    }

    // ---- SELECT ----
    if (up.startsWith('SELECT')) {
      const mSel = s.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/i);
      if (!mSel) throw new Error('Sintaxis SELECT no reconocida. Revisa el orden: SELECT cols FROM tabla [WHERE cond] [ORDER BY col [DESC]] [LIMIT n]');
      let [, colsPart, tabla, wherePart, orderCol, orderDir, limitPart] = mSel;
      selects++;
      tabla = tabla.toLowerCase();
      if (tabla !== 'productos' && tabla !== 'categorias') throw new Error(`La tabla "${tabla}" no existe. Usa "productos" o "categorias".`);
      let filas = bd[tabla].slice();

      if (wherePart) {
        filas = filas.filter(f => evalWhere(wherePart.replace(/;$/, ''), f));
      }

      if (orderCol) {
        orderCol = orderCol.toLowerCase();
        const dir = (orderDir || 'ASC').toUpperCase();
        filas.sort((a, b) => {
          if (a[orderCol] == null) return 1;
          if (b[orderCol] == null) return -1;
          if (a[orderCol] < b[orderCol]) return dir === 'DESC' ? 1 : -1;
          if (a[orderCol] > b[orderCol]) return dir === 'DESC' ? -1 : 1;
          return 0;
        });
      }
      if (limitPart) filas = filas.slice(0, parseInt(limitPart, 10));

      const colsTrim = colsPart.trim();
      let cols;
      if (colsTrim === '*') {
        cols = esquema[tabla].slice();
      } else if (/^count\(\*\)$/i.test(colsTrim)) {
        return ok(renderTabla(['count'], [{ count: filas.length }]));
      } else {
        cols = colsTrim.split(',').map(c => c.trim().toLowerCase());
        cols.forEach(c => {
          if (bd[tabla].length && !(c in bd[tabla][0])) {
            throw new Error(`La columna "${c}" no existe en la tabla "${tabla}"`);
          }
        });
      }
      return ok(renderTabla(cols, filas));
    }

    // ---- UPDATE tabla SET col1 = ..., col2 = ... [WHERE ...] [RETURNING ...] ----
    if (up.startsWith('UPDATE')) {
      let returningCols = null;
      let cuerpo = s;
      const mRet = s.match(/^(.+?)\s+RETURNING\s+(.+)$/i);
      if (mRet) {
        cuerpo = mRet[1];
        const rc = mRet[2].trim().replace(/;$/, '');
        returningCols = rc === '*' ? null : rc.split(',').map(c => c.trim().toLowerCase());
        usadoReturning = true;
      } else {
        cuerpo = s.replace(/;$/, '');
      }
      const m = cuerpo.match(/^UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
      if (!m) throw new Error('Sintaxis UPDATE no reconocida. Usa: UPDATE tabla SET col1 = val1, col2 = val2 WHERE cond;');
      let [, tabla, setPart, wherePart] = m;
      tabla = tabla.toLowerCase();
      if (tabla !== 'productos' && tabla !== 'categorias') throw new Error(`La tabla "${tabla}" no existe`);
      const sets = splitTop(setPart, /\s*,\s*/);
      const asignaciones = sets.map(st => {
        const sm = st.match(/^(\w+)\s*=\s*(.+)$/);
        if (!sm) throw new Error(`Asignación SET no reconocida: "${st}"`);
        return { col: sm[1].toLowerCase(), expr: sm[2].trim() };
      });
      let afectadas = 0;
      const filasReturn = [];
      bd[tabla].forEach(f => {
        const match = !wherePart ? true : evalWhere(wherePart.replace(/;$/, ''), f);
        if (match) {
          asignaciones.forEach(a => {
            if (a.col === 'id') throw new Error('No se puede modificar la columna "id" (clave primaria)');
            f[a.col] = evalExpr(a.expr, f);
          });
          if (tabla === 'productos' && 'precio' in f && (typeof f.precio !== 'number' || f.precio <= 0))
            throw new Error('Violación de CHECK tras el UPDATE: precio debe ser > 0');
          afectadas++;
          filasReturn.push(f);
        }
      });
      if (returningCols) {
        return ok(renderTabla(returningCols, filasReturn)) + info(`UPDATE ${afectadas}`);
      }
      return info(`UPDATE ${afectadas}`);
    }

    // ---- DELETE FROM tabla [WHERE ...] [RETURNING ...] ----
    if (up.startsWith('DELETE')) {
      let returningCols = null;
      let cuerpo = s;
      const mRet = s.match(/^(.+?)\s+RETURNING\s+(.+)$/i);
      if (mRet) {
        cuerpo = mRet[1];
        const rc = mRet[2].trim().replace(/;$/, '');
        returningCols = rc === '*' ? null : rc.split(',').map(c => c.trim().toLowerCase());
        usadoReturning = true;
      } else {
        cuerpo = s.replace(/;$/, '');
      }
      const m = cuerpo.match(/^DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
      if (!m) throw new Error('Sintaxis DELETE no reconocida. Usa: DELETE FROM tabla WHERE cond;');
      let [, tabla, wherePart] = m;
      tabla = tabla.toLowerCase();
      if (tabla !== 'productos' && tabla !== 'categorias') throw new Error(`La tabla "${tabla}" no existe`);
      if (!wherePart) {
        const n = bd[tabla].length;
        const borradas = bd[tabla].slice();
        bd[tabla] = [];
        if (tabla === 'productos') nextId.productos = 1;
        if (returningCols) return ok(renderTabla(returningCols, borradas)) + info(`DELETE ${n}`);
        return info(`DELETE ${n}`);
      }
      const wp = wherePart.replace(/;$/, '');
      const antes = bd[tabla].length;
      const borradas = [];
      bd[tabla] = bd[tabla].filter(f => {
        const match = evalWhere(wp, f);
        if (match) { borradas.push(f); return false; }
        return true;
      });
      const n = antes - bd[tabla].length;
      if (returningCols) return ok(renderTabla(returningCols, borradas)) + info(`DELETE ${n}`);
      return info(`DELETE ${n}`);
    }

    // ---- TRUNCATE TABLE tabla ----
    if (up.startsWith('TRUNCATE')) {
      const m = s.match(/^TRUNCATE\s+TABLE\s+(\w+)$/i);
      if (!m) throw new Error('Sintaxis TRUNCATE no reconocida. Usa: TRUNCATE TABLE tabla;');
      const tabla = m[1].toLowerCase();
      if (tabla !== 'productos' && tabla !== 'categorias') throw new Error(`La tabla "${tabla}" no existe`);
      bd[tabla] = [];
      if (tabla === 'productos') nextId.productos = 1;
      return info('TRUNCATE TABLE');
    }

    throw new Error(`Comando no soportado en el playground: "${s.slice(0, 40)}...". Soportados: INSERT, SELECT, UPDATE, DELETE, BEGIN, COMMIT, ROLLBACK, TRUNCATE.`);
  }

  // Verificación de retos (5 hitos)
  function verificarRetos() {
    const hitos = [
      { id: 'insert3', test: () => bd.productos.length >= 3, msg: 'Inserta 3 productos (multi-fila)' },
      { id: 'returning', test: () => usadoReturning, msg: 'Usa RETURNING para ver el id asignado al insertar' },
      { id: 'update-expr', test: () => bd.productos.find(p => p.id === 1 && p.precio === 49500), msg: "Sube el precio del producto id=1 un 10%: UPDATE productos SET precio = precio * 1.1 WHERE id = 1;" },
      { id: 'upsert', test: () => usoOnConflict && bd.productos.filter(p => p.nombre === 'Croquetas').length === 1, msg: "Re-inserta 'Croquetas' con ON CONFLICT (nombre) DO UPDATE (no debe duplicarse)" },
      { id: 'rollback', test: () => usoRollback && bd.productos.find(p => p.id === 1), msg: 'Haz BEGIN, un DELETE/UPDATE destructivo y ROLLBACK: el producto id=1 debe seguir existiendo' }
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
    if (!sql.trim()) { output.innerHTML = err('Escribe alguna sentencia SQL en el cuadro izquierdo.'); return; }
    const sentencias = splitSentencias(sql);
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
    nextId = { productos: 1 };
    selects = 0;
    usadoReturning = false;
    usoRollback = false;
    usoOnConflict = false;
    enTransaccion = false;
    snapshotBd = null;
    snapshotNextId = null;
    retos.length = 0;
    delete estado.talleres['playground-bonus'];
    guardarProgreso();
    output.innerHTML = info('↺ BD reiniciada. categorias tiene 3 filas; productos vacía.');
  }

  runBtn.addEventListener('click', run);
  if (resetBtn) resetBtn.addEventListener('click', reset);

  // Render inicial
  output.innerHTML = info('BD lista. categorias tiene 3 filas (Alimentos, Accesorios, Higiene); productos está vacía. Pulsa ▶ Ejecutar.');
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
      // 6 soluciones en el taller (inserts, updates, deletes, trans, returning, reflex)
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
    background: 'linear-gradient(135deg, #ef4444, #14b8a6)',
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