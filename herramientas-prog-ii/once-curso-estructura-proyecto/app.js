/* ============================================================
   CLASE once — HERRAMIENTAS DE PROGRAMACIÓN II
   Estructura de carpetas y archivos (tres capas)
   Esqueleto de navegación y quizzes + interacciones propias
   ⚠️ Copia del esqueleto compartido: si cambias algo aquí,
   evalúa si el resto de cursos necesita el mismo fix.
  ============================================================ */

const TOTAL_MODULOS = 8;

const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  badges: new Set(),
  xp: 0,
  checklist: {}
};

const STORAGE_KEY = 'curso-herr-11-estructura';

/* Cada módulo completado y cada quiz perfecto suma un criterio verificado. */
const XP_POR_MODULO = 1;
const XP_POR_QUIZ_PERFECTO = 1;
const XP_TOTAL = 10;

/* Módulos que cuentan para el progreso: el 0 es apertura y el 4 es descanso. */
const MODULOS_COMPLETABLES = [1, 2, 3, 5, 6, 7];

document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarTeclado();
  configurarArboles();
  configurarRecorridos();
  configurarChecklists();
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
      xp: estado.xp,
      checklist: estado.checklist
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
    estado.checklist = datos.checklist || {};
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
      if (confirm('¿Volver al inicio del documento? Tu progreso se conserva.')) irAModulo(0);
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

  const insignias = {
    0: 'Diagnóstico hecho',
    1: 'Síntoma identificado',
    2: 'Módulos y paquetes',
    3: 'Tres capas definidas',
    4: 'Descanso',
    5: 'Flecha de dependencia',
    6: 'Código legible',
    7: 'Estructura construida'
  };
  if (insignias[n]) otorgarBadge(insignias[n]);

  if (MODULOS_COMPLETABLES.every(m => estado.completados.has(m))) {
    otorgarBadge('Arquitectura verificada');
  }

  mostrarToast(`Bloque ${n} completado · +${XP_POR_MODULO} criterio`);
  guardarProgreso();
}

function otorgarBadge(nombre) {
  if (estado.badges.has(nombre)) return;
  estado.badges.add(nombre);
  mostrarToast(`Insignia: ${nombre}`);
  actualizarUI();
}

function addXP(cantidad) {
  estado.xp = Math.min(XP_TOTAL, estado.xp + cantidad);
  guardarProgreso();
  actualizarUI();
}

function actualizarUI() {
  const total = MODULOS_COMPLETABLES.length;
  const hechos = MODULOS_COMPLETABLES.filter(m => estado.completados.has(m)).length;
  const pct = Math.round((hechos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) {
    const etiquetas = [
      'Punto de partida', 'El síntoma', 'Carpetas e imports', 'Las tres capas',
      'Descanso', 'Flecha de dependencia', 'Leer el código', 'Taller'
    ];
    const n = String(estado.moduloActual).padStart(2, '0');
    mAct.textContent = `Bloque ${n} · ${etiquetas[estado.moduloActual] || ''}`;
  }

  const xpEl = document.getElementById('xp-display');
  if (xpEl) xpEl.textContent = `${estado.xp} / ${XP_TOTAL}`;

  const cont = document.getElementById('badges');
  if (cont) {
    cont.innerHTML = '';
    estado.badges.forEach(b => {
      const span = document.createElement('span');
      span.className = 'badge';
      span.textContent = b;
      cont.appendChild(span);
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
      const code = btn.closest('.code-wrap').querySelector('pre');
      if (!code) return;
      navigator.clipboard.writeText(code.innerText).then(() => {
        const original = btn.textContent;
        btn.textContent = '✓ copiado';
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
    quiz.querySelectorAll('.pregunta').forEach(pregunta => {
      const correcta = pregunta.dataset.correcta;
      const opciones = pregunta.querySelectorAll('.opcion');

      opciones.forEach(op => {
        op.addEventListener('click', () => {
          if (pregunta.dataset.respondida === 'true') return;
          pregunta.dataset.respondida = 'true';

          if (op.dataset.op === correcta) {
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
      res.textContent = `Perfecto: ${aciertos} de ${total}. Criterio verificado.`;
    } else if (aciertos >= total / 2) {
      res.classList.add('parcial');
      res.textContent = `${aciertos} de ${total}. Buen intento: vuelve al punto del bloque que fallaste.`;
    } else {
      res.classList.add('parcial');
      res.textContent = `${aciertos} de ${total}. Relee el bloque antes de seguir.`;
    }
  }

  guardarProgreso();
}

/* ---------- EXPLORADOR DE ÁRBOL (módulos 0 y 3) ---------- */
function configurarArboles() {
  document.querySelectorAll('[data-arbol]').forEach(arbol => {
    const panel = arbol.querySelector('.arbol-panel');
    const filas = arbol.querySelectorAll('.fl');

    filas.forEach(fila => {
      fila.addEventListener('click', () => {
        if (fila.classList.contains('padre')) return;
        filas.forEach(f => f.classList.remove('sel'));
        fila.classList.add('sel');
        panel.innerHTML = construirPanel(fila);
      });
    });

    // La primera fila informative del árbol queda seleccionada al cargar.
    const inicial = arbol.querySelector('.fl:not(.padre)');
    if (inicial) inicial.click();
  });
}

function construirPanel(fila) {
  const capas = {
    '0': ['ensamblaje', 'var(--tinta-3)'],
    '1': ['capa 1 · conexión', 'var(--c1)'],
    '2': ['capa 2 · lógica', 'var(--c2)'],
    '3': ['capa 3 · diseño', 'var(--c3)']
  };
  const [etiqueta, color] = capas[fila.dataset.capa] || capas['0'];

  const partes = [];
  partes.push(`<div class="ap-avatar" aria-hidden="true">◈</div>`);
  partes.push(`<div class="ap-ruta">${escaparHTML(fila.dataset.nombre || '')}</div>`);
  partes.push(`<div class="ap-rol" style="color:${color}">${etiqueta} · ${escaparHTML(fila.dataset.rol || '—')}</div>`);
  partes.push(`<p class="ap-resp">${escaparHTML(fila.dataset.resp || '')}</p>`);
  if (fila.dataset.dato) {
    partes.push(`<div class="ap-dato">${escaparHTML(fila.dataset.dato)}</div>`);
  }
  if (fila.dataset.pista) {
    partes.push(`<p class="ap-pista">${escaparHTML(fila.dataset.pista)}</p>`);
  }
  return partes.join('');
}

function escaparHTML(txt) {
  return String(txt)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ---------- RECORRIDO GUIADO (módulo 6) ---------- */
function configurarRecorridos() {
  document.querySelectorAll('[data-recorrido]').forEach(rec => {
    const pasos = rec.querySelectorAll('.rec-paso');
    const botones = rec.querySelectorAll('.rec-pass');
    const contador = rec.querySelector('[data-rec-contador]');
    const btnPrev = rec.querySelector('[data-rec-prev]');
    const btnNext = rec.querySelector('[data-rec-next]');
    let actual = 0;

    function mostrar(i) {
      actual = Math.max(0, Math.min(pasos.length - 1, i));
      pasos.forEach((p, n) => p.classList.toggle('activo', n === actual));
      botones.forEach((b, n) => b.classList.toggle('activo', n === actual));
      if (contador) contador.textContent = String(actual + 1);
      if (btnPrev) btnPrev.disabled = actual === 0;
      if (btnNext) btnNext.disabled = actual === pasos.length - 1;
    }

    botones.forEach(b => {
      b.addEventListener('click', () => mostrar(parseInt(b.dataset.paso, 10)));
    });
    if (btnPrev) btnPrev.addEventListener('click', () => mostrar(actual - 1));
    if (btnNext) btnNext.addEventListener('click', () => mostrar(actual + 1));

    mostrar(0);
  });
}

/* ---------- CHECKLIST DEL TALLER (módulo 7) ---------- */
function configurarChecklists() {
  document.querySelectorAll('[data-checklist]').forEach(lista => {
    const items = lista.querySelectorAll('input[type="checkbox"]');
    const hechos = lista.querySelector('[data-cl-hechos]');
    const total = lista.querySelector('[data-cl-total]');
    const pct = lista.querySelector('[data-cl-pct]');
    const reset = lista.querySelector('[data-cl-reset]');

    if (total) total.textContent = items.length;

    function refrescar() {
      let n = 0;
      items.forEach(chk => {
        chk.checked = !!estado.checklist[chk.dataset.check];
        if (chk.checked) n++;
      });
      if (hechos) hechos.textContent = n;
      if (pct) pct.textContent = Math.round((n / items.length) * 100) + '%';
    }

    items.forEach(chk => {
      chk.addEventListener('change', () => {
        estado.checklist[chk.dataset.check] = chk.checked;
        if (chk.checked) {
          const n = Object.values(estado.checklist).filter(Boolean).length;
          if (n === items.length) {
            otorgarBadge('Taller entregado');
            mostrarToast('✓ Estructura verificada por completo');
          }
        }
        guardarProgreso();
        refrescar();
      });
    });

    if (reset) {
      reset.addEventListener('click', () => {
        if (!confirm('¿Desmarcar toda la lista de verificación?')) return;
        items.forEach(chk => { estado.checklist[chk.dataset.check] = false; });
        guardarProgreso();
        refrescar();
      });
    }

    refrescar();
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
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    background: '#16191f',
    color: '#fbfaf6',
    padding: '0.7rem 1.1rem',
    borderRadius: '2px',
    borderLeft: '4px solid #1d4ed8',
    fontWeight: '600',
    fontSize: '0.85rem',
    fontFamily: "'JetBrains Mono', monospace",
    boxShadow: '0 10px 30px rgba(22,25,31,.25)',
    zIndex: '1000',
    transition: 'all .3s ease',
    opacity: '0',
    transform: 'translateY(14px)',
    maxWidth: '90%'
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(14px)';
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}
