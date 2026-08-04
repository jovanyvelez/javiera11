/* ============================================================
   CLASE 6 — BASES DE DATOS (SQL Básico: DDL + DML)
   Lógica de navegación, quizzes, taller y mini-motor SQL (playground)
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
const XP_TOTAL = 390;   // 8 módulos×30 + 5 quizzes×25 + 1 playground×25 = 390

const STORAGE_KEY = 'curso-bd-sql-basico';

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
    1: '📜 SQL Hablante',
    2: '🏗️ Constructor de BD',
    3: '📋 Maestro de Tablas',
    4: '☕ Descansado',
    5: '📝 Manipulador de Datos',
    6: '🧪 Jugador SQL',
    7: '📦 SQL Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 SQL Básico Dominado');
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
    const labels = ['Inicio', 'SQL', 'DDL', 'CREATE', 'Descanso', 'DML', 'Playground', 'Taller'];
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
        result.textContent = '✅ ¡Correcto! INSERT modifica filas, no estructura. Es DML.';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ DDL construye estructura (CREATE/DROP/ALTER). DML manipula filas (INSERT/SELECT/UPDATE/DELETE).';
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
   Simula una BD con dos tablas: ciudades(id, nombre) y
   clientes(id, nombre, correo, ciudad_id). Soporta INSERT,
   SELECT *, SELECT col1, col2, SELECT ... WHERE ...,
   SELECT ... GROUP BY, SELECT ... ORDER BY ... [ASC|DESC],
   SELECT ... LIMIT n, UPDATE ... SET ... WHERE ..., DELETE ... WHERE ....
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
      ciudades: [
        { id: 1, nombre: 'Medellín' },
        { id: 2, nombre: 'Bogotá' },
        { id: 3, nombre: 'Cali' }
      ],
      clientes: []
      // clientes: { id, nombre, correo, ciudad_id }
    };
  }

  let bd = bdInicial();
  let nextId = { clientes: 1 };
  let selects = 0; // nº de SELECT ejecutados (para verificar los retos)

  // Columnas canónicas de cada tabla (para SELECT * y mostrar NULL en celdas vacías)
  const esquema = {
    ciudades: ['id', 'nombre'],
    clientes: ['id', 'nombre', 'correo', 'ciudad_id']
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
    return `<div style="color:var(--cian);font-weight:700;margin-bottom:0.5rem;">${escapeHtml(msg)}</div>`;
  }

  // Splitter de sentencias por ';' (muy simple, ignora ; dentro de strings)
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

  // Quita comentarios -- ... de una línea
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

  // Ejecuta una sentencia
  function ejecutar(sentencia) {
    const s = quitarComentarios(sentencia);
    if (!s) return info('— sentencia vacía —');
    const up = s.toUpperCase();

    // INSERT INTO tabla (cols) VALUES (...), (...);
    if (up.startsWith('INSERT INTO')) {
      const m = s.match(/^INSERT\s+INTO\s+(\w+)\s*\(([^)]*)\)\s*VALUES\s*(.+)$/i);
      if (!m) throw new Error('Sintaxis INSERT no reconocida. Usa: INSERT INTO tabla (col1, col2) VALUES (v1, v2);');
      const tabla = m[1].toLowerCase();
      const cols = m[2].split(',').map(c => c.trim().toLowerCase());
      const valsPart = m[3].trim().replace(/;$/, '');
      // soportar múltiples (...) separados por comas
      const grupos = [];
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
      if (!grupos.length) throw new Error('No se encontraron grupos de valores tras VALUES');
      if (tabla !== 'clientes' && tabla !== 'ciudades') throw new Error(`La tabla "${tabla}" no existe en el playground. Usa "clientes" o "ciudades".`);
      let insertadas = 0;
      grupos.forEach(g => {
        const vals = parseValues('(' + g + ')');
        if (vals.length !== cols.length) throw new Error(`Número de columnas (${cols.length}) y valores (${vals.length}) no coinciden`);
        if (tabla === 'clientes') {
          const fila = { id: nextId.clientes++ };
          cols.forEach((c, i) => { if (c !== 'id') fila[c] = vals[i]; });
          // Validación FK suave: ciudad_id puede ser null o 1..3
          if (fila.ciudad_id !== null && fila.ciudad_id !== undefined) {
            if (!bd.ciudades.find(ci => ci.id === fila.ciudad_id)) {
              throw new Error(`Violación de FK: ciudad_id=${fila.ciudad_id} no existe en ciudades (ids válidos: 1,2,3)`);
            }
          }
          bd.clientes.push(fila);
        } else {
          const fila = { id: bd.ciudades.length + 1 };
          cols.forEach((c, i) => { if (c !== 'id') fila[c] = vals[i]; });
          bd.ciudades.push(fila);
        }
        insertadas++;
      });
      return info(`INSERT 0 ${insertadas}`);
    }

    // SELECT
    if (up.startsWith('SELECT')) {
      const mSel = s.match(/^SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+GROUP\s+BY\s+(\w+))?(?:\s+ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/i);
      if (!mSel) throw new Error('Sintaxis SELECT no reconocida. Revisa el orden: SELECT cols FROM tabla [WHERE cond] [GROUP BY col] [ORDER BY col [DESC]] [LIMIT n]');
      let [, colsPart, tabla, wherePart, groupCol, orderCol, orderDir, limitPart] = mSel;
      selects++;
      tabla = tabla.toLowerCase();
      if (tabla !== 'clientes' && tabla !== 'ciudades') throw new Error(`La tabla "${tabla}" no existe. Usa "clientes" o "ciudades".`);
      let filas = bd[tabla].slice();

      // WHERE simple: columna op valor ( =, <>, !=, >, <, >=, <=, IS NULL )
      if (wherePart) {
        const wm = wherePart.match(/^(\w+)\s+(IS\s+NULL|IS\s+NOT\s+NULL|=|<>|!=|>=|<=|>|<)\s*(.*)$/i);
        if (!wm) throw new Error(`WHERE no soportado en el playground: "${wherePart}". Usa "col = val", "col > val" o "col IS NULL".`);
        let [, wcol, wop, wval] = wm;
        wcol = wcol.toLowerCase();
        const opUp = wop.toUpperCase();
        if (opUp === 'IS NULL') {
          filas = filas.filter(f => f[wcol] === null || f[wcol] === undefined);
        } else if (opUp === 'IS NOT NULL') {
          filas = filas.filter(f => f[wcol] !== null && f[wcol] !== undefined);
        } else {
          const val = parseVal(wval.replace(/;$/, ''));
          filas = filas.filter(f => {
            const fv = f[wcol];
            switch (opUp) {
              case '=':  return fv == val;
              case '<>': case '!=': return fv != val;
              case '>':  return fv > val;
              case '<':  return fv < val;
              case '>=': return fv >= val;
              case '<=': return fv <= val;
            }
            return false;
          });
        }
      }

      // GROUP BY: devuelve (col, COUNT(*))
      if (groupCol) {
        groupCol = groupCol.toLowerCase();
        const grupos = {};
        filas.forEach(f => {
          const k = f[groupCol] === undefined || f[groupCol] === null ? null : f[groupCol];
          grupos[k] = (grupos[k] || 0) + 1;
        });
        let filasOut = Object.keys(grupos).map(k => ({ [groupCol]: k === 'null' ? null : k, count: grupos[k] }));
        // ORDER BY y LIMIT también valen sobre el resultado agrupado
        if (orderCol) {
          orderCol = orderCol.toLowerCase();
          const dir = (orderDir || 'ASC').toUpperCase();
          filasOut.sort((a, b) => {
            if (a[orderCol] == null) return 1;
            if (b[orderCol] == null) return -1;
            if (a[orderCol] < b[orderCol]) return dir === 'DESC' ? 1 : -1;
            if (a[orderCol] > b[orderCol]) return dir === 'DESC' ? -1 : 1;
            return 0;
          });
        }
        if (limitPart) filasOut = filasOut.slice(0, parseInt(limitPart, 10));
        return ok(renderTabla([groupCol, 'count'], filasOut));
      }

      // ORDER BY
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

      // LIMIT (se aplica tras ORDER BY, como en SQL real)
      if (limitPart) filas = filas.slice(0, parseInt(limitPart, 10));

      // Columnas a mostrar
      const colsTrim = colsPart.trim();
      let cols;
      if (colsTrim === '*') {
        cols = esquema[tabla].slice();
      } else if (/^count\(\*\)$/i.test(colsTrim)) {
        return ok(renderTabla(['count'], [{ count: filas.length }]));
      } else {
        cols = colsTrim.split(',').map(c => c.trim().toLowerCase());
        // validar que existen
        cols.forEach(c => {
          if (bd[tabla].length && !(c in bd[tabla][0])) {
            throw new Error(`La columna "${c}" no existe en la tabla "${tabla}"`);
          }
        });
      }
      return ok(renderTabla(cols, filas));
    }

    // UPDATE tabla SET col = val WHERE cond
    if (up.startsWith('UPDATE')) {
      const m = s.match(/^UPDATE\s+(\w+)\s+SET\s+(\w+)\s*=\s*(.+?)(?:\s+WHERE\s+(.+?))?$/i);
      if (!m) throw new Error('Sintaxis UPDATE no reconocida. Usa: UPDATE tabla SET col = val WHERE cond;');
      let [, tabla, col, valPart, wherePart] = m;
      tabla = tabla.toLowerCase();
      col = col.toLowerCase();
      if (tabla !== 'clientes' && tabla !== 'ciudades') throw new Error(`La tabla "${tabla}" no existe`);
      const val = parseVal(valPart.trim().replace(/;$/, ''));
      let afectadas = 0;
      bd[tabla].forEach(f => {
        if (!wherePart) { f[col] = val; afectadas++; return; }
        const wm = wherePart.match(/^(\w+)\s*(=|<>|!=|>=|<=|>|<)\s*(.+)$/);
        if (!wm) return;
        const [, wc, wo, wv] = wm;
        const wcol = wc.toLowerCase();
        const wval = parseVal(wv.trim().replace(/;$/, ''));
        let match = false;
        switch (wo) {
          case '=': match = f[wcol] == wval; break;
          case '<>': case '!=': match = f[wcol] != wval; break;
          case '>': match = f[wcol] > wval; break;
          case '<': match = f[wcol] < wval; break;
          case '>=': match = f[wcol] >= wval; break;
          case '<=': match = f[wcol] <= wval; break;
        }
        if (match) { f[col] = val; afectadas++; }
      });
      return info(`UPDATE ${afectadas}`);
    }

    // DELETE FROM tabla WHERE cond
    if (up.startsWith('DELETE')) {
      const m = s.match(/^DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?$/i);
      if (!m) throw new Error('Sintaxis DELETE no reconocida. Usa: DELETE FROM tabla WHERE cond;');
      let [, tabla, wherePart] = m;
      tabla = tabla.toLowerCase();
      if (tabla !== 'clientes' && tabla !== 'ciudades') throw new Error(`La tabla "${tabla}" no existe`);
      if (!wherePart) {
        const n = bd[tabla].length;
        bd[tabla] = [];
        if (tabla === 'clientes') nextId.clientes = 1;
        return info(`DELETE ${n}`);
      }
      const wm = wherePart.match(/^(\w+)\s*(=|<>|!=|>=|<=|>|<)\s*(.+)$/);
      if (!wm) throw new Error(`WHERE no soportado: "${wherePart}"`);
      const [, wc, wo, wv] = wm;
      const wcol = wc.toLowerCase();
      const wval = parseVal(wv.trim().replace(/;$/, ''));
      const antes = bd[tabla].length;
      bd[tabla] = bd[tabla].filter(f => {
        let match = false;
        switch (wo) {
          case '=': match = f[wcol] == wval; break;
          case '<>': case '!=': match = f[wcol] != wval; break;
          case '>': match = f[wcol] > wval; break;
          case '<': match = f[wcol] < wval; break;
          case '>=': match = f[wcol] >= wval; break;
          case '<=': match = f[wcol] <= wval; break;
        }
        return !match; // nos quedamos con los que NO matchean (los que se borran son los que sí)
      });
      const borradas = antes - bd[tabla].length;
      return info(`DELETE ${borradas}`);
    }

    throw new Error(`Comando no soportado en el playground: "${s.slice(0, 40)}...". Soportados: INSERT, SELECT, UPDATE, DELETE.`);
  }

  // Verificación de retos (5 hitos)
  function verificarRetos() {
    const hitos = [
      { id: 'insert3', test: () => bd.clientes.length >= 3, msg: 'Inserta 3 clientes (Ana, Beto, Carla)' },
      { id: 'select-all', test: () => retos.includes('insert3') && selects >= 1, msg: "Haz SELECT * FROM clientes;" },
      { id: 'update-ana', test: () => bd.clientes.find(c => c.id === 1 && c.correo === 'ana.nueva@x.co'), msg: "Actualiza el correo de Ana (id=1) a 'ana.nueva@x.co'" },
      { id: 'delete-beto', test: () => !bd.clientes.find(c => c.id === 2), msg: 'Borra a Beto (id=2) con DELETE FROM clientes WHERE id = 2;' },
      { id: 'select-final', test: () => selects >= 2 && bd.clientes.length === 2 && bd.clientes.find(c => c.nombre === 'Ana Torres') && bd.clientes.find(c => c.nombre === 'Carla Díaz'), msg: 'Verifica con SELECT * que quedan Ana y Carla (2 filas)' }
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
    nextId = { clientes: 1 };
    selects = 0;
    retos.length = 0;
    delete estado.talleres['playground-bonus'];
    guardarProgreso();
    output.innerHTML = info('↺ BD reiniciada. ciudades tiene 3 filas; clientes vacía.');
  }

  runBtn.addEventListener('click', run);
  if (resetBtn) resetBtn.addEventListener('click', reset);

  // Render inicial
  output.innerHTML = info('BD lista. ciudades tiene 3 filas (Medellín, Bogotá, Cali); clientes está vacía. Pulsa ▶ Ejecutar.');
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
      // 6 soluciones en el taller (bd, tablas, inserts, selects, upddel, reflex)
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