/* ============================================================
   CURSO DE REQUERIMIENTOS NIVEL 2 — LÓGICA INTERACTIVA
============================================================ */

const TOTAL_MODULOS = 8;

const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  badges: new Set(),
  juegos: {}  // resultados de minijuegos
};

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarQuizzes();
  configurarJuegoBuenoMalo();
  configurarJuegoClasificarRNF();
  configurarJuegoAtributos();
  configurarJuegoFNF();
  configurarSeleccionMultiple();
  configurarTecnicas();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    localStorage.setItem('curso-requerimientos', JSON.stringify({
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      badges: [...estado.badges],
      juegos: estado.juegos
    }));
  } catch (e) {}
}

function cargarProgreso() {
  try {
    const d = JSON.parse(localStorage.getItem('curso-requerimientos'));
    if (!d) return;
    estado.moduloActual = d.moduloActual || 0;
    estado.completados = new Set(d.completados || []);
    estado.quizzes = d.quizzes || {};
    estado.badges = new Set(d.badges || []);
    estado.juegos = d.juegos || {};
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

/* ---------- COMPLETADOS ---------- */
function marcarCompletado(n) {
  if (estado.completados.has(n)) return;
  estado.completados.add(n);

  if (n === 0) otorgarBadge('🚀 Iniciado');
  if (n === 1) otorgarBadge('🧠 Profundizad@');
  if (n === 2) otorgarBadge('🔧 Funcionalist@');
  if (n === 3) otorgarBadge('⚙️ NF Master');
  if (n === 4) otorgarBadge('💎 Conocedor de Calidad');
  if (n === 5) otorgarBadge('🧩 Analist@ Practicante');
  if (n === 6) otorgarBadge('📝 Narrador de Historias');

  if (estado.completados.size === TOTAL_MODULOS - 1) {
    otorgarBadge('🏆 Capturador de Requerimientos');
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
  const total = TOTAL_MODULOS - 1;
  const completos = [...estado.completados].filter(x => x <= 6).length;
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

  const res = quiz.querySelector('.resultado-quiz');
  if (res) {
    res.classList.add('visible');
    if (aciertos === total) {
      res.classList.add('exito');
      res.textContent = `🎉 ¡Perfecto! ${aciertos}/${total}. Lo dominas 💪`;
      otorgarBadge(`✨ Quiz ${idQuiz} Perfecto`);
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

/* ---------- JUEGO BUENO/MALO (Módulo 2) ---------- */
function configurarJuegoBuenoMalo() {
  document.querySelectorAll('.juego-clasificar .item-rf').forEach(item => {
    const correcta = item.dataset.correcta;
    const botones = item.querySelectorAll('.btn-rf');
    const explic = item.querySelector('.explic-rf');

    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        if (item.dataset.respondido === 'true') return;
        item.dataset.respondido = 'true';

        const rta = btn.dataset.rta;
        if (rta === correcta) {
          btn.classList.add('correcta');
        } else {
          btn.classList.add('incorrecta');
          botones.forEach(b => {
            if (b.dataset.rta === correcta) b.classList.add('correcta');
          });
        }
        botones.forEach(b => b.disabled = true);
        if (explic) explic.classList.add('visible');
      });
    });
  });
}

/* ---------- JUEGO CLASIFICAR RNF (Módulo 3) ---------- */
function configurarJuegoClasificarRNF() {
  document.querySelectorAll('.juego-clasificar-rnf .item-clas').forEach(item => {
    const correcta = item.dataset.categoria;
    const botones = item.querySelectorAll('.btn-clas');
    const explic = item.querySelector('.explic-clas');

    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        if (item.dataset.respondido === 'true') return;
        item.dataset.respondido = 'true';

        const cat = btn.dataset.cat;
        if (cat === correcta) {
          btn.classList.add('correcta');
          if (explic) {
            explic.textContent = '✅ ¡Correcto! Esta es una métrica clara de la categoría.';
            explic.classList.add('visible');
          }
        } else {
          btn.classList.add('incorrecta');
          botones.forEach(b => {
            if (b.dataset.cat === correcta) b.classList.add('correcta');
          });
          if (explic) {
            explic.textContent = `❌ La categoría correcta era: ${correcta}.`;
            explic.classList.add('visible');
          }
        }
        botones.forEach(b => b.disabled = true);
      });
    });
  });
}

/* ---------- JUEGO ATRIBUTOS (Módulo 4) ---------- */
const explicAtributos = {
  seguridad: '🔒 La seguridad es crítica cuando hay dinero o información sensible en juego.',
  usabilidad: '👍 Cuando los usuarios no son técnicos, la usabilidad es lo más importante.',
  confiabilidad: '🛡️ En sistemas de emergencia, fallar NO es opción. La confiabilidad es vital.',
  eficiencia: '⚡ En sistemas en tiempo real, cada milisegundo cuenta.',
  portabilidad: '📦 Cuando el sistema debe correr en muchos ambientes distintos, portabilidad es clave.',
  mantenibilidad: '🔧 En sistemas que evolucionan rápido, la mantenibilidad determina la velocidad de mejora.',
  compatibilidad: '🔗 Cuando hay que integrarse con otros sistemas, la compatibilidad es decisiva.'
};

function configurarJuegoAtributos() {
  document.querySelectorAll('.juego-atributo .item-atr').forEach(item => {
    const correcta = item.dataset.correcta;
    const botones = item.querySelectorAll('.btn-atr');
    const explic = item.querySelector('.explic-atr');

    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        if (item.dataset.respondido === 'true') return;
        item.dataset.respondido = 'true';

        const rta = btn.dataset.rta;
        if (rta === correcta) {
          btn.classList.add('correcta');
          if (explic) {
            explic.textContent = '✅ ' + (explicAtributos[correcta] || 'Correcto.');
            explic.classList.add('visible');
          }
        } else {
          btn.classList.add('incorrecta');
          botones.forEach(b => {
            if (b.dataset.rta === correcta) b.classList.add('correcta');
          });
          if (explic) {
            explic.textContent = '❌ La respuesta correcta era ' + correcta + '. ' + (explicAtributos[correcta] || '');
            explic.classList.add('visible');
          }
        }
        botones.forEach(b => b.disabled = true);
      });
    });
  });
}

/* ---------- JUEGO F/NF (Módulo 5 paso 4) ---------- */
function configurarJuegoFNF() {
  document.querySelectorAll('.juego-fnf .item-fnf').forEach(item => {
    const correcta = item.dataset.correcta;
    const botones = item.querySelectorAll('.btn-fnf');

    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        if (item.dataset.respondido === 'true') return;
        item.dataset.respondido = 'true';

        const rta = btn.dataset.rta;
        if (rta === correcta) {
          btn.classList.add('correcta');
        } else {
          btn.classList.add('incorrecta');
          botones.forEach(b => {
            if (b.dataset.rta === correcta) b.classList.add('correcta');
          });
        }
        botones.forEach(b => b.disabled = true);
      });
    });
  });
}

/* ---------- SELECCIÓN MÚLTIPLE (Módulo 5 pasos 1 y 5) ---------- */
function configurarSeleccionMultiple() {
  document.querySelectorAll('.opt-multi, .opt-3').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      btn.classList.toggle('activo');
    });
  });
}

function validarPaso(numPaso) {
  const cont = document.getElementById('paso' + numPaso + '-' + (numPaso === 1 ? 'stk' : 'atr'));
  if (!cont) return;
  const opciones = cont.querySelectorAll('.opt-multi, .opt-3');

  let aciertos = 0;
  let falsosPositivos = 0;
  let faltantes = 0;

  opciones.forEach(op => {
    const esCorrecta = op.dataset.correcta === 'true';
    const elegida = op.classList.contains('activo');

    op.classList.remove('activo');

    if (esCorrecta && elegida) {
      op.classList.add('bien');
      aciertos++;
    } else if (!esCorrecta && elegida) {
      op.classList.add('mal');
      falsosPositivos++;
    } else if (esCorrecta && !elegida) {
      op.classList.add('falto');
      faltantes++;
    }

    op.disabled = true;
  });

  // Retroalimentación
  const retro = document.getElementById('retro-paso-' + numPaso);
  if (!retro) return;

  retro.classList.add('visible');

  if (numPaso === 1) {
    // Paso 1: stakeholders. Todos los marcados como correctos son válidos
    const totalCorrectos = [...opciones].filter(o => o.dataset.correcta === 'true').length;
    let msg = `<strong>Resultado:</strong> identificaste ${aciertos} de ${totalCorrectos} stakeholders.`;
    if (falsosPositivos > 0) msg += ` Marcaste ${falsosPositivos} que no aportan al sistema.`;
    if (faltantes > 0)        msg += ` Te faltaron ${faltantes}.`;
    if (aciertos === totalCorrectos && falsosPositivos === 0) {
      msg += ' 🏆 ¡Perfecto! Identificaste a todos los stakeholders relevantes.';
      otorgarBadge('🎯 Detector de Stakeholders');
    } else {
      msg += '<br>💡 Tip: incluye a quien USE, a quien PAGUE, a quien GESTIONE y a quien se BENEFICIE indirectamente del sistema.';
    }
    retro.innerHTML = msg;
  } else if (numPaso === 5) {
    let msg = `<strong>Resultado:</strong> seleccionaste ${aciertos} atributos críticos correctos de 3.`;
    if (aciertos === 3 && falsosPositivos === 0) {
      msg += '<br>🎯 ¡Excelente! Para SchoolEats <strong>seguridad</strong> (pagos), <strong>usabilidad</strong> (estudiantes no técnicos) y <strong>confiabilidad</strong> (no puede caerse en hora de almuerzo) son los más críticos.';
      otorgarBadge('💎 Priorizador Experto');
    } else {
      msg += '<br>💡 Los 3 más críticos son: <strong>Confiabilidad</strong> (no puede caerse en hora pico), <strong>Usabilidad</strong> (estudiantes deben usarla sin tutorial) y <strong>Seguridad</strong> (datos de pagos y menores de edad).';
    }
    retro.innerHTML = msg;
  }

  guardarProgreso();
}

/* ---------- TÉCNICAS DE ELICITACIÓN (Módulo 5 paso 2) ---------- */
function configurarTecnicas() {
  document.querySelectorAll('.btn-tec').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      // Solo bloquear botones del mismo stakeholder
      const stk = btn.dataset.stk;
      const fila = btn.closest('.fila-tecnica');
      const todosDelStk = fila ? fila.querySelectorAll('.btn-tec') : [btn];

      const esCorrecta = btn.classList.contains('correcta-tec');

      if (esCorrecta) {
        btn.classList.add('correcta');
      } else {
        btn.classList.add('incorrecta');
        // Mostrar cuál era la correcta
        todosDelStk.forEach(b => {
          if (b.classList.contains('correcta-tec')) b.classList.add('correcta');
        });
      }
      todosDelStk.forEach(b => b.disabled = true);
    });
  });
}

/* ---------- CONSTRUCTOR DE HISTORIAS (Módulo 6) ---------- */
function construirHistoria() {
  const quien = document.getElementById('cons-quien').value;
  const que   = document.getElementById('cons-que').value;
  const para  = document.getElementById('cons-para').value;
  const cont  = document.getElementById('resultado-historia');

  if (!quien || !que || !para) {
    cont.innerHTML = '⚠️ <strong>Falta completar:</strong> selecciona una opción en cada campo.';
    cont.classList.add('visible');
    return;
  }

  cont.innerHTML =
    '<strong>Como</strong> ' + quien + ',<br>' +
    '<strong>quiero</strong> ' + que + ',<br>' +
    '<strong>para</strong> ' + para + '.';
  cont.classList.add('visible');

  otorgarBadge('🛠️ Constructor de Historias');
}

/* ---------- SOLUCIONES Y UTILIDADES ---------- */
function toggleSolucion(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('visible');
}

function reiniciarCurso() {
  if (!confirm('¿Volver al inicio? Tu progreso se conserva.')) return;
  irAModulo(0);
}

function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: 'linear-gradient(135deg, #10b981, #fbbf24)',
    color: '#1a1a1a',
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

/* ---------- ATAJOS ---------- */
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
