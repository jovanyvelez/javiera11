/* ============================================================
   CURSO INTRODUCCIÓN AL DISEÑO — CLASE 5 — LÓGICA INTERACTIVA
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
  configurarSlider();
  configurarStickyNotes();
  configurarChallengeTimer();
  configurarToolMatch();
  configurarDiagramGame();
  configurarPrototipo();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    localStorage.setItem('curso-introduccion-diseno', JSON.stringify({
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      badges: [...estado.badges]
    }));
  } catch (e) {}
}

function cargarProgreso() {
  try {
    const d = JSON.parse(localStorage.getItem('curso-introduccion-diseno'));
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
  if (n === 1) otorgarBadge('🧠 Pensador del Diseño');
  if (n === 2) otorgarBadge('✏️ Bocetador');
  if (n === 3) otorgarBadge('🛠️ Explorador Digital');
  if (n === 4) otorgarBadge('🏗️ Modelador');
  if (n === 5) otorgarBadge('📱 Prototipador');

  if (estado.completados.size === TOTAL_MODULOS - 1) {
    otorgarBadge('🏆 Maestro del Diseño');
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
   ⚡ SLIDER ANTES/DESPUÉS — MÓDULO 1
============================================================ */
function configurarSlider() {
  const slider = document.getElementById('slider-app');
  if (!slider) return;

  const divider = document.getElementById('slider-divider');
  const bienLado = slider.querySelector('.slider-bien');
  const tip = document.getElementById('slider-tip');
  let dragging = false;
  let arrastrado = 0;
  let rafId = null;
  let posPendiente = 0.5;

  function setPos(pct) {
    posPendiente = pct;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const p = Math.max(0.05, Math.min(0.95, posPendiente));
      divider.style.left = (p * 100) + '%';
      bienLado.style.width = ((1 - p) * 100) + '%';
    });
  }

  function getPctFromEvent(e) {
    const rect = slider.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    return x / rect.width;
  }

  function startDrag(e) {
    dragging = true;
    setPos(getPctFromEvent(e));
    e.preventDefault();
  }

  function moveDrag(e) {
    if (!dragging) return;
    setPos(getPctFromEvent(e));
    arrastrado++;
    if (arrastrado === 12 && tip) {
      tip.textContent = '✨ Pista: fíjate cómo el lado derecho usa solo 2 colores y 1 botón principal.';
    } else if (arrastrado === 30 && tip) {
      tip.textContent = '👀 ¿Ves cómo el lado izquierdo grita con 5 colores y compite por tu atención?';
    } else if (arrastrado === 60 && tip) {
      tip.textContent = '🎯 Eso es diseñar: dejar que la acción importante sea la más visible, no la más chillona.';
      otorgarBadge('👁️ Ojo de Diseñador');
    }
  }

  function endDrag() { dragging = false; }

  divider.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('mouseup', endDrag);

  divider.addEventListener('touchstart', startDrag, { passive: false });
  document.addEventListener('touchmove', moveDrag, { passive: false });
  document.addEventListener('touchend', endDrag);

  // Click on the slider also moves the divider
  slider.addEventListener('click', (e) => {
    if (e.target === divider || divider.contains(e.target)) return;
    setPos(getPctFromEvent(e));
    arrastrado++;
  });

  // initial position
  setPos(0.5);
}

/* ============================================================
   STICKY NOTES — 3 PREGUNTAS (MÓDULO 1)
============================================================ */
function configurarStickyNotes() {
  const game = document.getElementById('sticky-game');
  if (!game) return;

  const stickies = game.querySelectorAll('.sticky');
  const dropzones = game.querySelectorAll('.dropzone');
  let correctas = 0;
  const total = stickies.length;

  stickies.forEach(s => {
    s.addEventListener('dragstart', e => {
      s.classList.add('dragging');
      e.dataTransfer.setData('text/plain', s.dataset.preg);
      e.dataTransfer.effectAllowed = 'move';
    });
    s.addEventListener('dragend', () => {
      s.classList.remove('dragging');
    });
  });

  dropzones.forEach(dz => {
    dz.addEventListener('dragover', e => {
      e.preventDefault();
      dz.classList.add('over');
    });
    dz.addEventListener('dragleave', () => {
      dz.classList.remove('over');
    });
    dz.addEventListener('drop', e => {
      e.preventDefault();
      dz.classList.remove('over');
      const preg = e.dataTransfer.getData('text/plain');
      const aceptada = dz.dataset.acepta;
      const sticky = game.querySelector(`.sticky[data-preg="${preg}"]`);
      if (!sticky || sticky.classList.contains('colocada')) return;

      if (preg === aceptada) {
        dz.classList.add('correcta');
        dz.querySelector('.dz-label').textContent = sticky.textContent + ' ✓';
        sticky.classList.add('colocada');
        correctas++;
        if (correctas === total) {
          mostrarToast('🎉 ¡Las 3 preguntas en su sitio! Insignia: Detective del Brief.');
          otorgarBadge('🕵️ Detective del Brief');
        }
      } else {
        dz.classList.add('incorrecta');
        dz.querySelector('.dz-label').textContent = '✗ Mmm, no encaja aquí. Devuélvelo a la bandeja.';
        setTimeout(() => {
          dz.classList.remove('incorrecta');
          dz.querySelector('.dz-label').textContent = `Suelta aquí: ${aceptada === 'quien' ? '¿Quién lo va a usar?' : aceptada === 'que' ? '¿Qué intenta lograr?' : '¿Qué se lo impide?'}`;
        }, 1800);
      }
    });
  });
}

/* ============================================================
   CHALLENGE TIMER — MÓDULO 2
============================================================ */
function configurarChallengeTimer() {
  const wrap = document.getElementById('challenge-pantalla');
  if (!wrap) return;

  const challenges = [
    {
      titulo: 'Pantalla de inicio de sesión',
      desc: 'Una pantalla donde un usuario ingresa su usuario y contraseña para entrar a la app del colegio.',
      pista: 'Un campo de texto, un campo de contraseña, un botón de "Entrar" y un enlace para recuperar la contraseña. ¿Qué pondrías en la parte de arriba? ¿Y abajo?'
    },
    {
      titulo: 'Carrito de compras',
      desc: 'El usuario ya agregó 3 productos. Necesita ver el total, modificar cantidades, y proceder a pagar.',
      pista: 'Lista de productos con cantidad modificable, subtotal por producto, total, y un botón grande de "Pagar" en la parte inferior.'
    },
    {
      titulo: 'Reproductor de música',
      desc: 'Una pantalla donde el usuario ve qué canción está sonando y puede pausar, cambiar, o retroceder.',
      pista: 'Portada del álbum, nombre de la canción, barra de progreso, y los 3 controles básicos: anterior, play/pausa, siguiente.'
    }
  ];

  let idx = 0;
  let tiempo = 60;
  let intervalo = null;
  let corriendo = false;

  const numEl   = document.getElementById('challenge-num');
  const titEl   = document.getElementById('challenge-titulo');
  const descEl  = document.getElementById('challenge-desc');
  const btnEmp  = document.getElementById('btn-empezar');
  const btnList = document.getElementById('btn-listo');
  const btnSig  = document.getElementById('btn-siguiente-ch');
  const fbEl    = document.getElementById('challenge-feedback');
  const derEl   = document.getElementById('challenge-derrota');

  function render() {
    numEl.textContent  = `${idx + 1} / ${challenges.length}`;
    titEl.textContent  = challenges[idx].titulo;
    descEl.textContent = challenges[idx].desc;
    derEl.classList.remove('visible');
    derEl.innerHTML = '';
    fbEl.textContent = '';
    fbEl.className = 'challenge-feedback';
    btnEmp.disabled = false;
    btnList.disabled = true;
    btnSig.disabled = idx === challenges.length - 1;
    btnEmp.textContent = '▶ Empezar (60s)';
    tiempo = 60;
    corriendo = false;
    if (intervalo) { clearInterval(intervalo); intervalo = null; }
  }

  function empezar() {
    if (corriendo) return;
    corriendo = true;
    tiempo = 60;
    btnEmp.disabled = true;
    btnList.disabled = false;
    btnEmp.textContent = `⏱ ${tiempo}s`;

    intervalo = setInterval(() => {
      tiempo--;
      btnEmp.textContent = `⏱ ${tiempo}s`;
      if (tiempo <= 0) {
        clearInterval(intervalo);
        intervalo = null;
        corriendo = false;
        btnEmp.textContent = '⏱ 0s';
        listo();
      }
    }, 1000);
  }

  function listo() {
    if (intervalo) { clearInterval(intervalo); intervalo = null; }
    corriendo = false;
    btnList.disabled = true;
    btnEmp.disabled = true;
    btnSig.disabled = false;

    const usado = 60 - tiempo;
    const ch = challenges[idx];
    let msg, cls;
    if (usado <= 35) {
      msg = `✅ ¡Increíble! Lo hiciste en ${usado}s. Eres un sketchman natural.`;
      cls = 'ok';
    } else if (usado <= 55) {
      msg = `👍 Bien, ${usado}s. Tiempo suficiente para una primera versión.`;
      cls = 'ok';
    } else {
      msg = `😅 ${usado}s, no alcanzaste. No te preocupes: la próxima vez肯定会 mejor.`;
      cls = 'warn';
    }
    fbEl.textContent = msg;
    fbEl.className = `challenge-feedback ${cls}`;

    derEl.classList.add('visible');
    derEl.innerHTML = `<strong>💡 Pistas para mejorar tu boceto:</strong><ul><li>${ch.pista}</li><li>Recuerda: 1 botón principal bien grande > 5 botones pequeños compitiendo.</li><li>Si pudieras agregar un solo icono, ¿cuál sería?</li></ul>`;
  }

  function siguiente() {
    if (idx < challenges.length - 1) {
      idx++;
      render();
    } else {
      render();
      fbEl.textContent = '🎉 ¡Completaste los 3 challenges!';
      fbEl.className = 'challenge-feedback ok';
      btnSig.disabled = true;
      btnEmp.disabled = true;
      btnList.disabled = true;
      otorgarBadge('⏱️ Speed-Sketcher');
    }
  }

  btnEmp.addEventListener('click', empezar);
  btnList.addEventListener('click', listo);
  btnSig.addEventListener('click', siguiente);

  render();
}

/* ============================================================
   TOOL MATCH — MÓDULO 3
============================================================ */
function configurarToolMatch() {
  document.querySelectorAll('.tool-caso').forEach(caso => {
    const correcta = caso.dataset.correcta;
    const btns = caso.querySelectorAll('.tool-btn');
    let respondida = false;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (respondida) return;
        respondida = true;
        btns.forEach(b => b.disabled = true);

        if (btn.dataset.rta === correcta) {
          caso.classList.add('correcto');
          btn.classList.add('elegida');
        } else {
          caso.classList.add('incorrecto');
          btn.classList.add('equivocada');
          // Resalta la correcta en verde
          btns.forEach(b => {
            if (b.dataset.rta === correcta) b.classList.add('elegida');
          });
        }
      });
    });
  });
}

/* ============================================================
   DIAGRAM GAME — MÓDULO 4
============================================================ */
function configurarDiagramGame() {
  const game = document.getElementById('diagram-game');
  if (!game) return;

  const pieces = game.querySelectorAll('.diagram-piece');
  const slots = game.querySelectorAll('.diagram-slot');
  const btnVal = document.getElementById('btn-validar-diagrama');
  const fbEl = document.getElementById('diagram-feedback');
  let totalColocadas = 0;

  pieces.forEach(p => {
    p.addEventListener('dragstart', e => {
      p.classList.add('dragging');
      e.dataTransfer.setData('text/plain', p.dataset.id);
    });
    p.addEventListener('dragend', () => p.classList.remove('dragging'));
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
      const id = e.dataTransfer.getData('text/plain');
      const pieza = game.querySelector(`.diagram-piece[data-id="${id}"]`);
      if (!pieza) return;

      // Limpia el slot anterior si esta pieza ya estaba en otro
      const yaColocada = pieza.classList.contains('colocada');
      if (yaColocada) {
        // Quítala del slot anterior
        slots.forEach(s => {
          if (s !== slot && s.querySelector('.diagram-piece')) {
            const p = s.querySelector('.diagram-piece');
            if (p === pieza) {
              s.innerHTML = `<span class="slot-num">${s.dataset.pos}</span><span class="slot-label">${s.querySelector('.slot-label') ? s.querySelector('.slot-label').textContent : ''}</span>`;
            }
          }
        });
      }

      // Coloca la pieza en este slot
      slot.innerHTML = '';
      slot.appendChild(pieza);
      pieza.classList.add('colocada');
      pieza.setAttribute('draggable', 'false');
      // Re-habilita el drag visual
      pieza.style.cursor = 'default';
    });
  });

  // Permitir devolver piezas a la bandeja haciendo doble-click
  game.querySelector('.diagram-tray').addEventListener('dblclick', e => {
    const pieza = e.target.closest('.diagram-piece');
    if (!pieza || !pieza.classList.contains('colocada')) return;
    // devolver a la bandeja
    pieza.classList.remove('colocada');
    pieza.setAttribute('draggable', 'true');
    pieza.style.cursor = 'grab';
    game.querySelector('.diagram-tray').appendChild(pieza);
    // limpiar slot
    slots.forEach(s => {
      if (s.contains(pieza) === false && s.children.length === 1) {
        // slot vacío
      }
    });
  });

  btnVal.addEventListener('click', () => {
    let correctas = 0;
    slots.forEach(s => {
      const pieza = s.querySelector('.diagram-piece');
      s.classList.remove('correcto', 'incorrecto');
      if (!pieza) {
        s.classList.add('incorrecto');
        return;
      }
      if (pieza.dataset.id === s.dataset.espera) {
        s.classList.add('correcto');
        correctas++;
      } else {
        s.classList.add('incorrecto');
      }
    });

    if (correctas === slots.length) {
      fbEl.textContent = '🎉 ¡Perfecto! Tu diagrama cuenta la historia completa.';
      fbEl.className = 'diagram-feedback ok';
      otorgarBadge('🧩 Arquitecto del Día');
    } else {
      fbEl.textContent = `🤔 ${correctas}/${slots.length} correctas. Pista: el slot 1 es por donde el usuario entra, el 4 es donde se guardan las cosas.`;
      fbEl.className = 'diagram-feedback warn';
    }
  });
}

/* ============================================================
   PROTOTIPO CLICK-THROUGH — MÓDULO 5
============================================================ */
function configurarPrototipo() {
  const phone = document.getElementById('proto-phone');
  if (!phone) return;

  phone.addEventListener('click', e => {
    const target = e.target.closest('[data-ir]');
    if (!target) return;
    const n = target.dataset.ir;
    phone.querySelectorAll('.proto-screen').forEach(s => s.classList.remove('activo'));
    const next = phone.querySelector(`.proto-screen[data-pantalla="${n}"]`);
    if (next) next.classList.add('activo');
    if (n === '3') {
      // llegó al final
      setTimeout(() => otorgarBadge('🖱️ Explorador de Prototipos'), 600);
    }
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
    background: 'linear-gradient(135deg, #ff6b6b, #feca57)',
    color: '#1a1a1a',
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
