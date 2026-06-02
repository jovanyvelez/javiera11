/* ============================================================
   CURSO DE FUNCIONES EN C# — LÓGICA INTERACTIVA
============================================================ */

const TOTAL_MODULOS = 8; // 0..7

/* ---------- ESTADO DEL CURSO ---------- */
const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {}, // {1: {aciertos: 2, total: 3}, ...}
  badges: new Set()
};

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarQuizzes();
  resaltarCodigo();
  actualizarUI();
});

/* ---------- PERSISTENCIA (localStorage) ---------- */
function guardarProgreso() {
  try {
    const datos = {
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      badges: [...estado.badges]
    };
    localStorage.setItem('curso-csharp-funciones', JSON.stringify(datos));
  } catch (e) { /* sin storage, no pasa nada */ }
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem('curso-csharp-funciones'));
    if (!datos) return;
    estado.moduloActual = datos.moduloActual || 0;
    estado.completados = new Set(datos.completados || []);
    estado.quizzes = datos.quizzes || {};
    estado.badges = new Set(datos.badges || []);
  } catch (e) { /* ignorar */ }
}

/* ---------- NAVEGACIÓN ENTRE MÓDULOS ---------- */
function configurarNavegacion() {
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.modulo, 10);
      irAModulo(m);
    });
  });
}

function configurarBotonesInternos() {
  document.querySelectorAll('.btn-anterior, .btn-siguiente').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.ir, 10);
      // Al avanzar, marca el módulo actual como completado
      if (btn.classList.contains('btn-siguiente')) {
        marcarCompletado(estado.moduloActual);
      }
      irAModulo(m);
    });
  });
}

function irAModulo(n) {
  if (n < 0 || n >= TOTAL_MODULOS) return;
  estado.moduloActual = n;

  // Ocultar todos los módulos
  document.querySelectorAll('.modulo').forEach(m => m.classList.remove('activo'));
  // Mostrar el módulo activo
  const mod = document.querySelector(`.modulo[data-modulo="${n}"]`);
  if (mod) mod.classList.add('activo');

  // Actualizar botones del menú
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    btn.classList.toggle('activo', parseInt(btn.dataset.modulo, 10) === n);
  });

  // Scroll arriba
  window.scrollTo({ top: 0, behavior: 'smooth' });

  actualizarUI();
  guardarProgreso();
}

/* ---------- MARCAR COMPLETADOS ---------- */
function marcarCompletado(n) {
  if (estado.completados.has(n)) return;
  estado.completados.add(n);

  // Badges por hitos
  if (n === 0)               otorgarBadge('🚀 Iniciado');
  if (n === 1)               otorgarBadge('🧠 Curioso');
  if (n === 3)               otorgarBadge('📤 Retornador');
  if (n === 4)               otorgarBadge('🔄 Maestro Ref/Out');
  if (n === 5)               otorgarBadge('🧮 Matemático');
  if (n === 6)               otorgarBadge('🧩 Pensador Modular');

  if (estado.completados.size === TOTAL_MODULOS - 1) {
    otorgarBadge('🏆 Graduado en Funciones');
  }
}

function otorgarBadge(nombre) {
  if (estado.badges.has(nombre)) return;
  estado.badges.add(nombre);
  mostrarToast(`🎉 ¡Insignia desbloqueada: ${nombre}!`);
  actualizarUI();
}

/* ---------- ACTUALIZAR UI ---------- */
function actualizarUI() {
  // Porcentaje y barra
  const total = TOTAL_MODULOS - 1; // módulos a completar (0..6)
  const completos = [...estado.completados].filter(x => x <= 6).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) mAct.textContent = 'Módulo ' + estado.moduloActual;

  // Badges del header
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

  // Marcar botones de módulos completados
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    const m = parseInt(btn.dataset.modulo, 10);
    btn.classList.toggle('completado', estado.completados.has(m));
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
            // Mostrar también cuál era la correcta (con clase distinta)
            opciones.forEach(o => {
              if (o.dataset.op === correcta) o.classList.add('correcta');
            });
          }

          // Bloquear todas las opciones
          opciones.forEach(o => o.disabled = true);

          // Verificar si todo el quiz está respondido
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

  // Contar aciertos usando el atributo data-acierto
  let aciertos = 0;
  preguntas.forEach(p => {
    if (p.dataset.acierto === 'true') aciertos++;
  });

  const total = preguntas.length;
  estado.quizzes[idQuiz] = { aciertos, total };

  // Mostrar resultado
  const res = quiz.querySelector('.resultado-quiz');
  if (res) {
    res.classList.add('visible');
    if (aciertos === total) {
      res.classList.add('exito');
      res.textContent = `🎉 ¡Perfecto! ${aciertos}/${total}. Eres un crack 💪`;
      otorgarBadge(`✨ Quiz ${idQuiz} Perfecto`);
    } else if (aciertos >= total / 2) {
      res.classList.add('parcial');
      res.textContent = `👍 ${aciertos}/${total} correctas. ¡Buen intento! Revisa lo que no te salió.`;
    } else {
      res.classList.add('parcial');
      res.textContent = `🤔 ${aciertos}/${total}. Te invitamos a releer el módulo y volver a intentar.`;
    }
  }

  guardarProgreso();
}

/* ---------- MOSTRAR / OCULTAR SOLUCIONES ---------- */
function toggleSolucion(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('visible');
}

/* ---------- REINICIAR CURSO ---------- */
function reiniciarCurso() {
  if (!confirm('¿Quieres volver al inicio? Tu progreso se conserva.')) return;
  irAModulo(0);
}

/* ---------- TOAST DE NOTIFICACIÓN ---------- */
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: 'linear-gradient(135deg, #fdcb6e, #e17055)',
    color: '#000',
    padding: '0.9rem 1.4rem',
    borderRadius: '30px',
    fontWeight: '700',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    zIndex: '1000',
    transition: 'all 0.4s ease',
    opacity: '0',
    transform: 'translateY(20px)'
  });
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ---------- COLOREADO DE CÓDIGO (tokenizador, NO regex anidado) ---------- */
function resaltarCodigo() {
  const palabrasClave = new Set([
    'public', 'static', 'void', 'int', 'double', 'string', 'bool', 'char',
    'long', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
    'break', 'continue', 'class', 'using', 'true', 'false', 'ref', 'out',
    'new', 'null', 'default'
  ]);
  const tiposClase = new Set(['Console', 'Math', 'Convert']);

  // Escapa caracteres especiales HTML
  const esc = (c) => {
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '&') return '&amp;';
    return c;
  };
  const escStr = (s) => {
    let r = '';
    for (const c of s) r += esc(c);
    return r;
  };

  const esDigito  = (c) => c >= '0' && c <= '9';
  const esLetra   = (c) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  const esLetraNum = (c) => esLetra(c) || esDigito(c);

  function tokenizar(codigo) {
    let out = '';
    let i = 0;
    const n = codigo.length;

    while (i < n) {
      const c = codigo[i];

      // Comentario de línea //
      if (c === '/' && codigo[i + 1] === '/') {
        let fin = codigo.indexOf('\n', i);
        if (fin === -1) fin = n;
        out += '<span class="c-com">' + escStr(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // String literal "..."
      if (c === '"') {
        let fin = i + 1;
        while (fin < n && codigo[fin] !== '"' && codigo[fin] !== '\n') {
          if (codigo[fin] === '\\' && fin + 1 < n) fin++; // saltar escape
          fin++;
        }
        if (fin < n && codigo[fin] === '"') fin++;
        out += '<span class="c-str">' + escStr(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // Carácter literal '...'
      if (c === "'") {
        let fin = i + 1;
        while (fin < n && codigo[fin] !== "'" && codigo[fin] !== '\n') {
          if (codigo[fin] === '\\' && fin + 1 < n) fin++;
          fin++;
        }
        if (fin < n && codigo[fin] === "'") fin++;
        out += '<span class="c-str">' + escStr(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // Número
      if (esDigito(c)) {
        let fin = i;
        while (fin < n && (esDigito(codigo[fin]) || codigo[fin] === '.')) fin++;
        out += '<span class="c-num">' + codigo.slice(i, fin) + '</span>';
        i = fin;
        continue;
      }

      // Identificador / palabra clave
      if (esLetra(c)) {
        let fin = i;
        while (fin < n && esLetraNum(codigo[fin])) fin++;
        const palabra = codigo.slice(i, fin);
        if (palabrasClave.has(palabra)) {
          out += '<span class="c-kw">' + palabra + '</span>';
        } else if (tiposClase.has(palabra)) {
          out += '<span class="c-cls">' + palabra + '</span>';
        } else {
          out += palabra;
        }
        i = fin;
        continue;
      }

      // Cualquier otro carácter (operadores, llaves, etc.) — se escapa
      out += esc(c);
      i++;
    }
    return out;
  }

  document.querySelectorAll('.bloque-codigo pre, .solucion pre').forEach(pre => {
    // Usar textContent garantiza que partimos del texto real,
    // sin restos de HTML que pudieran corromper el resultado.
    const codigo = pre.textContent;
    pre.innerHTML = tokenizar(codigo);
  });

  // Inyectar estilos del coloreado
  const style = document.createElement('style');
  style.textContent = `
    .c-kw  { color: #c084fc; font-weight: 600; }
    .c-str { color: #fdcb6e; }
    .c-num { color: #00cec9; }
    .c-com { color: #6c7080; font-style: italic; }
    .c-cls { color: #4fc3f7; font-weight: 600; }
  `;
  document.head.appendChild(style);
}

/* ---------- ATAJOS DE TECLADO ---------- */
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'ArrowRight') {
    if (estado.moduloActual < TOTAL_MODULOS - 1) {
      marcarCompletado(estado.moduloActual);
      irAModulo(estado.moduloActual + 1);
    }
  } else if (e.key === 'ArrowLeft') {
    if (estado.moduloActual > 0) {
      irAModulo(estado.moduloActual - 1);
    }
  }
});
