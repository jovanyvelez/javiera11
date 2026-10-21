/* ============================================================
   CLASE 9 · Menús de consola con funciones · while + switch + modularización + validación
   Herramientas Algoritmicas II · Algoritmos en C#
   Lógica de navegación, progreso, quizzes, copiar código y tokenizador
   ============================================================ */

/* ---------- CONFIGURACIÓN DE LA CLASE ---------- */
const TOTAL_MODULOS = 8;
const STORAGE_KEY = 'curso-csharp-9';
const XP_POR_MODULO = 30;
const XP_POR_QUIZ_PERFECTO = 25;
const XP_TOTAL = 640;

/* Módulos que cuentan para el progreso (0 = inicio, 4 = descanso) */
const MODULOS_COMPLETABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = ["Inicio", "Diseñar un menú", "while + switch", "Modularizar con funciones", "Descanso", "Validar la entrada", "Menú + arreglos", "Taller final"];
const BADGES_MODULO = {"0": "🚀 Iniciado", "1": "🎛️ Menú", "2": "🔁 while + switch", "3": "🧩 Modularización", "4": "☕ Descansado", "5": "🛡️ Validación", "6": "🏗️ Menú + arreglos", "7": "🏆 Menús Dominados"};
const BADGE_FINAL = '🏆 Aplicación de Consola Dominada';

const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  badges: new Set(),
  xp: 0
};

document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarSoluciones();
  configurarQuizzes();
  configurarTeclado();
  resaltarCodigo();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      badges: [...estado.badges],
      xp: estado.xp
    }));
  } catch (e) {}
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!datos) return;
    estado.moduloActual = datos.moduloActual || 0;
    estado.completados = new Set(datos.completados || []);
    estado.quizzes = datos.quizzes || {};
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
  document.querySelectorAll('.btn-anterior, .btn-siguiente, .btn-final').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.ir, 10);
      if (btn.classList.contains('btn-siguiente') || btn.classList.contains('btn-final')) {
        marcarCompletado(estado.moduloActual);
      }
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

  if (BADGES_MODULO[n]) otorgarBadge(BADGES_MODULO[n]);

  if (MODULOS_COMPLETABLES.every(m => estado.completados.has(m))) {
    otorgarBadge(BADGE_FINAL);
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
  const completables = MODULOS_COMPLETABLES;
  const completos = completables.filter(m => estado.completados.has(m)).length;
  const pct = Math.round((completos / completables.length) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) mAct.textContent = ETIQUETAS[estado.moduloActual] || ('Módulo ' + estado.moduloActual);

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

/* ---------- SOLUCIONES OCULTAS ---------- */
function configurarSoluciones() {
  document.querySelectorAll('[data-solucion]').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.dataset.solucion);
      if (!panel) return;
      const visible = panel.classList.toggle('visible');
      btn.textContent = visible ? '🙈 Ocultar solución' : '👁️ Ver solución';
      btn.classList.toggle('ok', visible);
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
    background: 'linear-gradient(135deg, var(--a), var(--b))',
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

/* ============================================================
   COLOREADO DE CÓDIGO — TOKENIZADOR DE UN SOLO PASO
   (nunca regex sobre innerHTML: rompe el HTML generado)
   ============================================================ */
function resaltarCodigo() {
  const KEYWORDS = new Set([
    'abstract', 'as', 'async', 'await', 'base', 'bool', 'break', 'byte', 'case', 'catch',
    'char', 'checked', 'class', 'const', 'continue', 'decimal', 'default', 'delegate', 'do',
    'double', 'dynamic', 'else', 'enum', 'equals', 'event', 'explicit', 'extern', 'false',
    'field', 'finally', 'fixed', 'float', 'for', 'foreach', 'from', 'get', 'global', 'goto',
    'group', 'if', 'implicit', 'in', 'init', 'int', 'interface', 'internal', 'into', 'is',
    'join', 'let', 'lock', 'long', 'namespace', 'new', 'nint', 'not', 'null', 'object', 'on',
    'operator', 'or', 'orderby', 'out', 'override', 'params', 'partial', 'private', 'protected',
    'public', 'readonly', 'record', 'ref', 'required', 'return', 'sbyte', 'sealed', 'select',
    'set', 'short', 'sizeof', 'stackalloc', 'static', 'string', 'struct', 'switch', 'this',
    'throw', 'true', 'try', 'typeof', 'uint', 'ulong', 'unchecked', 'unsafe', 'ushort', 'using',
    'var', 'virtual', 'void', 'volatile', 'when', 'where', 'while', 'with', 'yield'
  ]);

  const TIPOS = new Set([
    'bool', 'byte', 'char', 'decimal', 'double', 'float', 'int', 'long', 'object', 'sbyte',
    'short', 'string', 'uint', 'ulong', 'ushort', 'void'
  ]);

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const esDigito = (c) => c >= '0' && c <= '9';
  const esLetra = (c) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  const esLetraNum = (c) => esLetra(c) || esDigito(c);

  /* --- C# --- */
  function tokenizarCSharp(codigo) {
    let out = '';
    let i = 0;
    const n = codigo.length;

    while (i < n) {
      const c = codigo[i];

      // Comentario de línea //
      if (c === '/' && codigo[i + 1] === '/') {
        let fin = codigo.indexOf('\n', i);
        if (fin === -1) fin = n;
        out += '<span class="c-com">' + esc(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // Comentario de bloque /* */
      if (c === '/' && codigo[i + 1] === '*') {
        let fin = codigo.indexOf('*/', i + 2);
        fin = fin === -1 ? n : fin + 2;
        out += '<span class="c-com">' + esc(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // String sin formato "..."
      if (c === '"' && codigo[i + 1] !== '"' && codigo[i - 1] !== '@' && codigo[i - 1] !== '$') {
        let fin = i + 1;
        while (fin < n && codigo[fin] !== '"' && codigo[fin] !== '\n') {
          if (codigo[fin] === '\\' && fin + 1 < n) fin++;
          fin++;
        }
        if (fin < n && codigo[fin] === '"') fin++;
        out += '<span class="c-str">' + esc(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // String crudo """..."""
      if (c === '"' && codigo[i + 1] === '"' && codigo[i + 2] === '"') {
        let fin = codigo.indexOf('"""', i + 3);
        fin = fin === -1 ? n : fin + 3;
        out += '<span class="c-str">' + esc(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // String verbatim @"..." y string interpolado $"..."
      if ((c === '@' || c === '$') && codigo[i + 1] === '"') {
        let fin = i + 2;
        while (fin < n) {
          if (codigo[fin] === '"') {
            if (codigo[fin + 1] === '"') { fin += 2; continue; }
            fin++;
            break;
          }
          fin++;
        }
        out += '<span class="c-str">' + esc(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // Carácter literal 'x'
      if (c === "'") {
        let fin = i + 1;
        while (fin < n && codigo[fin] !== "'" && codigo[fin] !== '\n') {
          if (codigo[fin] === '\\' && fin + 1 < n) fin++;
          fin++;
        }
        if (fin < n && codigo[fin] === "'") fin++;
        out += '<span class="c-str">' + esc(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // Número
      if (esDigito(c)) {
        let fin = i;
        while (fin < n && (esDigito(codigo[fin]) || codigo[fin] === '.' || codigo[fin] === '_' ||
               codigo[fin] === 'm' || codigo[fin] === 'M' || codigo[fin] === 'd' || codigo[fin] === 'D' ||
               codigo[fin] === 'f' || codigo[fin] === 'F')) fin++;
        out += '<span class="c-num">' + esc(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // Identificador / palabra clave
      if (esLetra(c)) {
        let fin = i;
        while (fin < n && esLetraNum(codigo[fin])) fin++;
        const palabra = codigo.slice(i, fin);

        let previo = i - 1;
        while (previo >= 0 && /\s/.test(codigo[previo])) previo--;
        const esMiembro = codigo[previo] === '.';

        if (KEYWORDS.has(palabra)) {
          out += '<span class="c-kw">' + palabra + '</span>';
        } else if (TIPOS.has(palabra)) {
          out += '<span class="c-typ">' + palabra + '</span>';
        } else if (esMiembro) {
          out += '<span class="c-fn">' + palabra + '</span>';
        } else if (/^[A-Z]/.test(palabra)) {
          out += '<span class="c-cls">' + palabra + '</span>';
        } else {
          out += palabra;
        }
        i = fin;
        continue;
      }

      out += esc(c);
      i++;
    }
    return out;
  }

  /* --- Bash / terminal --- */
  function tokenizarBash(codigo) {
    let out = '';
    let i = 0;
    const n = codigo.length;
    const esDigito = (c) => c >= '0' && c <= '9';
    const esLetra = (c) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '-';

    while (i < n) {
      const c = codigo[i];

      // Comentario #
      if (c === '#') {
        let fin = codigo.indexOf('\n', i);
        if (fin === -1) fin = n;
        out += '<span class="c-com">' + esc(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // Cadena
      if (c === '"' || c === "'") {
        const cierre = c;
        let fin = i + 1;
        while (fin < n && codigo[fin] !== cierre && codigo[fin] !== '\n') fin++;
        if (fin < n && codigo[fin] === cierre) fin++;
        out += '<span class="c-str">' + esc(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // Opción --algo o -a
      if (c === '-' && codigo[i + 1] !== '-' && /[a-zA-Z]/.test(codigo[i + 1] || '')) {
        let fin = i + 1;
        while (fin < n && esLetra(codigo[fin])) fin++;
        out += '<span class="c-opt">' + esc(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // Palabra
      if (esLetra(c) && !esDigito(c)) {
        let fin = i;
        while (fin < n && (esLetra(codigo[fin]) || esDigito(codigo[fin]) || codigo[fin] === '.')) fin++;
        const palabra = codigo.slice(i, fin);
        const esComando = ['dotnet', 'code', 'cd', 'mkdir', 'ls', 'cat', 'git', 'rm', 'clear']
          .includes(palabra.split('.')[0]);
        if (palabra.startsWith('--')) {
          out += '<span class="c-opt">' + esc(palabra) + '</span>';
        } else if (esComando) {
          out += '<span class="c-cmd">' + esc(palabra) + '</span>';
        } else {
          out += esc(palabra);
        }
        i = fin;
        continue;
      }

      out += esc(c);
      i++;
    }
    return out;
  }

  document.querySelectorAll('.code-wrap pre, .code-live').forEach(pre => {
    const lang = (pre.dataset.lang || 'csharp').toLowerCase();
    const destino = pre.querySelector('code') || pre;
    const codigo = destino.textContent;
    if (!codigo.trim()) return;
    destino.innerHTML = lang === 'bash' || lang === 'sh' || lang === 'terminal'
      ? tokenizarBash(codigo)
      : tokenizarCSharp(codigo);
  });
}
