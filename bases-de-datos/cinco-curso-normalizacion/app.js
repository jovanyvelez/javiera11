/* ============================================================
   CLASE 5 — BASES DE DATOS (Normalización)
   Lógica de navegación, simulador de formas normales, quizzes y taller
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
const XP_POR_SIM = 25;          // bonus por acertar los 3 casos del normalizador
const XP_TOTAL = 390;           // 8 módulos×30 + 5 quizzes×25 + 1 sim×25 = 390

const STORAGE_KEY = 'curso-bd-normalizacion';

document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarTrivia();
  inicializarCardSim();
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
    1: '🦹 Detective de Anomalías',
    2: '1️⃣ 1FN Aprendiz',
    3: '2️⃣ 2FN Maestro',
    4: '☕ Descansado',
    5: '3️⃣ 3FN Experto',
    6: '🧪 Normalizador',
    7: '📦 Maestro de la Normalización'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Normalización Dominada');
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
    const labels = ['Inicio', 'Anomalías', '1FN', '2FN', 'Descanso', '3FN', 'Normalizador', 'Taller'];
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
        result.textContent = '✅ ¡Correcto! cliente y fecha dependen sólo de pedido_id, una parte de la PK. Es dependencia parcial: 2FN.';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Piensa: ¿de qué depende cliente y fecha? Si dependen de una parte de la PK, es 2FN.';
      }
    });
  });
}

/* ---------- SIMULADOR "NORMALIZADOR" (Módulo 6) ----------
   Soporta varios casos .card-sim en una misma página. Cada caso
   tiene su propio .card-selector, .card-explicacion y .card-tablas.
   Los botones .card-btn tienen data-card="1fn|2fn|3fn".
   El caso se resuelve al pulsar la forma normal correcta; el
   escenario que corresponde a cada caso se define en ESCENARIOS.
*/
function inicializarCardSim() {
  const sims = document.querySelectorAll('.card-sim');
  if (!sims.length) return;

  // Definición de los tres casos (orden por id de contenedor)
  const ESCENARIOS = {
    // Caso 1: listas en celdas → 1FN
    'cardExplicacion1': {
      correcta: '1fn',
      explicacion: '<strong>1FN.</strong> La columna <code>asignaturas</code> contiene una lista "Matemáticas, Física, Química" dentro de una celda. Eso viola la atomicidad: 1FN exige una celda = un valor. <strong>Solución:</strong> una fila por (estudiante, asignatura), con PK compuesta <code>(estudiante_id, asignatura)</code>.',
      tablas: [
        { head: 'matriculas (1FN)', rows: [['estudiante_id', 'pk'], ['asignatura', 'pk'], ['nombre']] }
      ],
      mensaje: 'Caso 1 resuelto por 1FN: separar la lista en filas.'
    },
    // Caso 2: PK compuesta con dependencia parcial → 2FN
    'cardExplicacion2': {
      correcta: '2fn',
      explicacion: '<strong>2FN.</strong> La PK es <code>(pedido_id, producto_id)</code>, pero <code>cliente</code> y <code>fecha</code> dependen sólo de <code>pedido_id</code>, y <code>nombre_producto</code> depende sólo de <code>producto_id</code>. Son dependencias parciales. <strong>Solución:</strong> separar la cabecera del pedido y los productos en sus propias tablas.',
      tablas: [
        { head: 'pedidos (cabecera)', rows: [['id', 'pk'], ['cliente'], ['fecha']] },
        { head: 'productos', rows: [['id', 'pk'], ['nombre']] },
        { head: 'pedidos_items (puente)', rows: [['pedido_id', 'fk'], ['producto_id', 'fk'], ['cantidad'], ['PK (pedido_id, producto_id)']] }
      ],
      mensaje: 'Caso 2 resuelto por 2FN: separar cabecera, items y productos.'
    },
    // Caso 3: PK simple con dependencia transitiva → 3FN
    'cardExplicacion3': {
      correcta: '3fn',
      explicacion: '<strong>3FN.</strong> La PK es <code>cliente_id</code> (una sola columna, así que 2FN se cumple solo). Pero <code>codigo_postal</code> no depende de <code>cliente_id</code>, sino de <code>ciudad</code>. Es una dependencia transitiva: <code>cliente_id → ciudad → codigo_postal</code>. <strong>Solución:</strong> crear la tabla <code>ciudades(id, nombre, codigo_postal)</code> y dejar <code>ciudad_id</code> como FK en <code>clientes</code>.',
      tablas: [
        { head: 'ciudades', rows: [['id', 'pk'], ['nombre'], ['codigo_postal']] },
        { head: 'clientes', rows: [['id', 'pk'], ['nombre'], ['correo'], ['ciudad_id', 'fk']] }
      ],
      mensaje: 'Caso 3 resuelto por 3FN: separar la ciudad y su código postal.'
    }
  };

  // Estado de aciertos del normalizador (persistido en estado.talleres)
  const ACIERTOS_KEY = 'normalizador-aciertos';
  if (!estado.talleres[ACIERTOS_KEY]) estado.talleres[ACIERTOS_KEY] = [];
  const aciertos = estado.talleres[ACIERTOS_KEY];

  function persistir() {
    estado.talleres[ACIERTOS_KEY] = aciertos;
    guardarProgreso();
  }

  function renderCaso(sim, idCaso) {
    const esc = ESCENARIOS[idCaso];
    if (!esc) return;
    const exp = sim.querySelector('.card-explicacion');
    const tablas = sim.querySelector('.card-tablas');
    if (exp) {
      exp.innerHTML = esc.explicacion + (aciertos.includes(idCaso) ? ' <span style="color:var(--verde);font-weight:700;">✓</span>' : '');
    }
    if (tablas) {
      tablas.innerHTML = '';
      esc.tablas.forEach(t => {
        const div = document.createElement('div');
        div.className = 'card-tabla-mock';
        const head = document.createElement('div');
        head.className = 'tm-head';
        head.textContent = t.head;
        div.appendChild(head);
        t.rows.forEach(r => {
          const row = document.createElement('div');
          row.className = 'tm-row';
          if (r[1] === 'pk') row.innerHTML = `<span class="tm-pk">${r[0]}</span> PK`;
          else if (r[1] === 'fk') row.innerHTML = `<span class="tm-fk">${r[0]}</span> FK`;
          else row.innerHTML = `<span>${r[0]}</span>`;
          div.appendChild(row);
        });
        tablas.appendChild(div);
      });
      const msg = document.createElement('div');
      msg.style.cssText = 'grid-column:1/-1;color:var(--lima-claro);font-size:0.85rem;font-weight:700;margin-top:0.5rem;';
      msg.textContent = esc.mensaje;
      tablas.appendChild(msg);
    }
  }

  sims.forEach((sim, idx) => {
    // El id del contenedor de explicación es "cardExplicacionN" → idCaso = "cardExplicacionN"
    const expEl = sim.querySelector('.card-explicacion');
    const idCaso = expEl ? expEl.id : null;
    const botones = sim.querySelectorAll('.card-btn');

    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        const esc = ESCENARIOS[idCaso];
        if (!esc) return;
        // Caso ya resuelto: se bloquea para que un clic incorrecto
        // no borre la explicación ni las tablas de la solución.
        if (aciertos.includes(idCaso)) {
          renderCaso(sim, idCaso);
          return;
        }
        const correcta = esc.correcta;
        const elegida = btn.dataset.card;

        botones.forEach(b => b.classList.remove('activa'));
        btn.classList.add('activa');

        if (elegida === correcta) {
          btn.classList.add('correcta');
          if (!aciertos.includes(idCaso)) {
            aciertos.push(idCaso);
            persistir();
            // Si completa los 3 casos, otorga XP y marca módulo
            if (aciertos.length >= 3 && !estado.talleres['normalizador-bonus']) {
              estado.talleres['normalizador-bonus'] = true;
              addXP(XP_POR_SIM);
              mostrarToast(`🏆 ¡Normalizador completado! +${XP_POR_SIM} XP`);
              if (!estado.completados.has(6)) marcarCompletado(6);
            }
          }
          renderCaso(sim, idCaso);
        } else {
          btn.classList.add('incorrecta');
          const exp = sim.querySelector('.card-explicacion');
          if (exp) {
            exp.innerHTML = `❌ No. Vuelve a revisar: ¿qué tipo de dependencia está mal en esta tabla? (La correcta es <strong>${correcta.toUpperCase()}</strong>.)`;
          }
          // Limpiar tablas para que no muestren solución incorrecta
          const tablas = sim.querySelector('.card-tablas');
          if (tablas) tablas.innerHTML = '';
          setTimeout(() => btn.classList.remove('incorrecta'), 1200);
        }
      });
    });
  });
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
      // 6 soluciones en el taller (anom, 1fn, 2fn, 3fn, sql, reflex)
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
    background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
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