/* ============================================================
   CURSO EL CASO COMPLETO — CLASE 6 — LÓGICA INTERACTIVA
============================================================ */

const TOTAL_MODULOS = 7;

const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  badges: new Set()
};

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarQuizzes();
  configurarTimeline();
  configurarSintesis();
  configurarTeamBuilder();
  configurarChecklist();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    localStorage.setItem('curso-integrador', JSON.stringify({
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      badges: [...estado.badges]
    }));
  } catch (e) {}
}

function cargarProgreso() {
  try {
    const d = JSON.parse(localStorage.getItem('curso-integrador'));
    if (!d) return;
    estado.moduloActual = d.moduloActual || 0;
    estado.completados = new Set(d.completados || []);
    estado.quizzes = d.quizzes || {};
    estado.badges = new Set(d.badges || []);
  } catch (e) {}
}

/* ---------- NAVEGACIÓN ---------- */
function configurarNavegacion() {
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    btn.addEventListener('click', () => {
      irAModulo(parseInt(btn.dataset.modulo, 10));
    });
  });
}

function configurarBotonesInternos() {
  document.querySelectorAll('.btn-anterior, .btn-siguiente').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('btn-siguiente')) {
        marcarCompletado(estado.moduloActual);
      }
      irAModulo(parseInt(btn.dataset.ir, 10));
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

/* ---------- COMPLETADOS / BADGES ---------- */
function marcarCompletado(n) {
  if (estado.completados.has(n)) return;
  estado.completados.add(n);

  if (n === 0) otorgarBadge('🚀 Iniciado');
  if (n === 1) otorgarBadge('🧩 Integrador');
  if (n === 2) otorgarBadge('🤔 Decisor');
  if (n === 3) otorgarBadge('👥 Team Builder');
  if (n === 4) otorgarBadge('📋 Plantillero');
  if (n === 5) otorgarBadge('🎤 Presentador');

  if (estado.completados.size === TOTAL_MODULOS - 1) {
    otorgarBadge('🏆 Maestro Integrador');
  }
}

function otorgarBadge(nombre) {
  if (estado.badges.has(nombre)) return;
  estado.badges.add(nombre);
  mostrarToast(`🎉 ¡Insignia desbloqueada: ${nombre}!`);
  actualizarUI();
}

/* ---------- UI ---------- */
function actualizarUI() {
  const total = TOTAL_MODULOS - 1; // excluye el cierre
  const completos = [...estado.completados].filter(x => x <= 5).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) mAct.textContent = 'Módulo ' + estado.moduloActual;

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

/* ---------- QUIZZES (compartido) ---------- */
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

  const res = quiz.querySelector('.resultado-quiz');
  if (res) {
    res.classList.add('visible');
    if (aciertos === total) {
      res.classList.add('exito');
      res.textContent = `🎉 ¡Perfecto! ${aciertos}/${total}.`;
      otorgarBadge(`✨ Quiz ${idQuiz} Perfecto`);
    } else if (aciertos >= total / 2) {
      res.classList.add('parcial');
      res.textContent = `👍 ${aciertos}/${total} correctas.`;
    } else {
      res.classList.add('parcial');
      res.textContent = `🤔 ${aciertos}/${total}. Te invitamos a releer.`;
    }
  }
  guardarProgreso();
}

/* ============================================================
   ⚡ TIMELINE — MÓDULO 1 (MOMENTO WOW)
   Detecta qué fase está visible y actualiza la línea del tiempo
============================================================ */
function configurarTimeline() {
  const sticky = document.getElementById('timeline-sticky');
  if (!sticky) return;

  const nodes = sticky.querySelectorAll('.timeline-node');
  const progress = document.getElementById('timeline-progress');
  const hint = document.getElementById('timeline-hint');
  const fasesBloque = document.querySelectorAll('[data-fase-bloque]');

  // El observer detecta qué fase está visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const fase = parseInt(entry.target.dataset.faseBloque, 10);
      if (!fase) return;

      // Marcar esta fase y todas las anteriores como completadas
      nodes.forEach(n => {
        const nf = parseInt(n.dataset.fase, 10);
        n.classList.toggle('completado', nf < fase);
        n.classList.toggle('activo', nf === fase);
      });

      // Actualizar la barra de progreso
      const pct = (fase / 5) * 90; // 90% para que no llegue al borde
      if (progress) progress.style.width = pct + '%';

      // Marcar el bloque actual
      fasesBloque.forEach(b => b.classList.remove('activo'));
      entry.target.classList.add('activo');

      // Cuando llega a la fase 5, disparar celebración
      if (fase === 5) {
        nodes.forEach(n => n.classList.add('celebracion'));
        if (hint) hint.textContent = '🎉 ¡5 fases! Mira la línea: completaste el viaje completo.';
        if (!estado.badges.has('🧩 Integrador')) {
          setTimeout(() => otorgarBadge('🧩 Integrador'), 600);
        }
      } else if (hint) {
        const labels = ['', 'Análisis', 'Requerimientos', 'Elicitación', 'Documentación', 'Diseño'];
        hint.textContent = `Fase ${fase}/5: ${labels[fase]}. Sigue desplazándote.`;
      }
    });
  }, { threshold: 0.4, rootMargin: '-100px 0px -100px 0px' });

  fasesBloque.forEach(b => observer.observe(b));
}

/* ============================================================
   SÍNTESIS VISUAL — DRAG-GAME (MÓDULO 1)
============================================================ */
function configurarSintesis() {
  const game = document.getElementById('sintesis-game');
  if (!game) return;

  const cards = game.querySelectorAll('.sintesis-card');
  const slots = game.querySelectorAll('.sintesis-slot');
  let correctas = 0;
  const total = cards.length;

  cards.forEach(c => {
    c.addEventListener('dragstart', e => {
      c.classList.add('dragging');
      e.dataTransfer.setData('text/plain', c.dataset.artefacto);
    });
    c.addEventListener('dragend', () => c.classList.remove('dragging'));
  });

  slots.forEach(slot => {
    slot.addEventListener('dragover', e => {
      e.preventDefault();
      slot.classList.add('over');
    });
    slot.addEventListener('dragleave', () => slot.classList.remove('over'));
    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('over');
      const art = e.dataTransfer.getData('text/plain');
      const esperada = slot.dataset.espera;
      const card = game.querySelector(`.sintesis-card[data-artefacto="${art}"]`);
      if (!card || card.classList.contains('colocada')) return;

      if (art === esperada) {
        slot.classList.add('correcto');
        slot.querySelector('.ss-label').textContent = '✓ ' + card.textContent;
        card.classList.add('colocada');
        correctas++;
        if (correctas === total) {
          mostrarToast('🎉 ¡Las 5 fases en orden! Insignia: Integrador.');
          if (!estado.badges.has('🧩 Integrador')) {
            setTimeout(() => otorgarBadge('🧩 Integrador'), 400);
          }
        }
      } else {
        slot.classList.add('incorrecto');
        slot.querySelector('.ss-label').textContent = '✗ Mmm… esa no va aquí';
        setTimeout(() => {
          slot.classList.remove('incorrecto');
          // Restaurar el label original
          const labels = ['', '', '🔍 Análisis', '💬 Elicitación', '📋 Requerimientos', '📜 Documentación', '🎨 Diseño'];
          slot.querySelector('.ss-label').textContent = labels[parseInt(esperada === 'metodologia' ? 1 : esperada === 'entrevista' ? 2 : esperada === 'rf' ? 3 : esperada === 'srs' ? 4 : 5)];
        }, 1800);
      }
    });
  });
}

/* ============================================================
   TEAM BUILDER — MÓDULO 3
============================================================ */
function configurarTeamBuilder() {
  const builder = document.getElementById('team-builder');
  if (!builder) return;

  const rolesBtns = builder.querySelectorAll('.rol-btn');
  const slotsEl = document.getElementById('equipo-slots');
  const countEl = document.getElementById('equipo-count');
  const fbEl = document.getElementById('equipo-feedback');
  const MAX = 5;
  const MIN = 3;

  const equipo = []; // {rol, nombre}

  function render() {
    slotsEl.innerHTML = '';
    if (equipo.length === 0) {
      const p = document.createElement('p');
      p.className = 'equipo-vacio';
      p.textContent = 'Aún no agregaste a nadie. Haz clic en un rol para empezar.';
      slotsEl.appendChild(p);
    } else {
      equipo.forEach((m, i) => {
        const span = document.createElement('span');
        span.className = 'equipo-miembro';
        span.innerHTML = `${m.nombre} <span class="quitar" data-i="${i}">×</span>`;
        slotsEl.appendChild(span);
      });
    }
    countEl.textContent = equipo.length;

    // Habilitar / deshabilitar botones
    rolesBtns.forEach(b => {
      const yaEsta = equipo.some(m => m.rol === b.dataset.rol);
      b.disabled = yaEsta || equipo.length >= MAX;
      b.classList.toggle('seleccionado', yaEsta);
    });

    // Quitar handlers
    slotsEl.querySelectorAll('.quitar').forEach(q => {
      q.addEventListener('click', () => {
        const i = parseInt(q.dataset.i, 10);
        equipo.splice(i, 1);
        render();
        validar();
      });
    });

    validar();
  }

  function validar() {
    if (equipo.length === 0) {
      fbEl.textContent = '';
      fbEl.className = 'equipo-feedback';
      return;
    }
    const tieneAnalista = equipo.some(m => m.rol === 'analista');
    const tieneDisenador = equipo.some(m => m.rol === 'disenador');

    if (equipo.length < MIN) {
      fbEl.textContent = `👥 Faltan ${MIN - equipo.length} miembro(s). Mínimo ${MIN}.`;
      fbEl.className = 'equipo-feedback warn';
    } else if (equipo.length > MAX) {
      fbEl.textContent = '⚠️ Máximo 5 miembros.';
      fbEl.className = 'equipo-feedback bad';
    } else if (!tieneAnalista) {
      fbEl.textContent = '🤔 Tu equipo necesita al menos un Analista (para elicitar).';
      fbEl.className = 'equipo-feedback warn';
    } else if (!tieneDisenador) {
      fbEl.textContent = '🎨 Tu equipo necesita al menos un Diseñador (para wireframes).';
      fbEl.className = 'equipo-feedback warn';
    } else {
      fbEl.textContent = '✅ ¡Equipo completo y balanceado! Listos para empezar.';
      fbEl.className = 'equipo-feedback ok';
      if (!estado.badges.has('👥 Team Builder')) {
        otorgarBadge('👥 Team Builder');
      }
    }
  }

  rolesBtns.forEach(b => {
    b.addEventListener('click', () => {
      if (b.disabled) return;
      if (equipo.length >= MAX) return;
      equipo.push({ rol: b.dataset.rol, nombre: b.dataset.nombre });
      render();
    });
  });

  render();
}

/* ============================================================
   CHECKLIST — MÓDULO 4
============================================================ */
function configurarChecklist() {
  document.querySelectorAll('.checklist .check-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
      const total = document.querySelectorAll('.checklist .check-item').length;
      const checked = document.querySelectorAll('.checklist .check-item.checked').length;
      if (checked === total) {
        if (!estado.badges.has('📋 Plantillero')) {
          setTimeout(() => otorgarBadge('📋 Plantillero'), 300);
        }
      }
    });
  });
}

/* ---------- REINICIAR ---------- */
function reiniciarCurso() {
  if (!confirm('¿Volver al inicio? Tu progreso se conserva.')) return;
  irAModulo(0);
}

/* ---------- TOAST ---------- */
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: 'linear-gradient(135deg, #16a34a, #f97316)',
    color: '#052e16',
    padding: '0.9rem 1.4rem',
    borderRadius: '30px',
    fontWeight: '700',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    zIndex: '1000',
    transition: 'all 0.4s ease',
    opacity: '0',
    transform: 'translateY(20px)',
    maxWidth: '90%',
    fontSize: '0.92rem'
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

/* ---------- ATAJOS DE TECLADO ---------- */
document.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) return;
  if (e.key === 'ArrowRight') {
    if (estado.moduloActual < TOTAL_MODULOS - 1) {
      marcarCompletado(estado.moduloActual);
      irAModulo(estado.moduloActual + 1);
    }
  } else if (e.key === 'ArrowLeft') {
    if (estado.moduloActual > 0) irAModulo(estado.moduloActual - 1);
  }
});
