/* ============================================================
   CURSO DOCUMENTACIÓN — CLASE 4 — LÓGICA INTERACTIVA
============================================================ */

const TOTAL_MODULOS = 9;

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
  configurarSrsExplorador();
  configurarJuegoComponentes();
  configurarRevisionSrs();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    localStorage.setItem('curso-documentacion', JSON.stringify({
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      badges: [...estado.badges]
    }));
  } catch (e) {}
}

function cargarProgreso() {
  try {
    const d = JSON.parse(localStorage.getItem('curso-documentacion'));
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
  if (n === 1) otorgarBadge('📝 Defensor del Papel');
  if (n === 2) otorgarBadge('📘 Conocedor IEEE');
  if (n === 3) otorgarBadge('🎭 Narrador de Casos');
  if (n === 4) otorgarBadge('📋 Plantillador');
  if (n === 5) otorgarBadge('✍️ Constructor');
  if (n === 6) otorgarBadge('📑 Documentador SRS');
  if (n === 7) otorgarBadge('🔎 Revisor Crítico');

  if (estado.completados.size === TOTAL_MODULOS - 1) {
    otorgarBadge('🏆 Maestro Documentador');
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
  const completos = [...estado.completados].filter(x => x <= 7).length;
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

/* ---------- SRS EXPLORADOR (módulo 2) ---------- */
function configurarSrsExplorador() {
  document.querySelectorAll('.srs-seccion').forEach(sec => {
    const encab = sec.querySelector('.srs-encabezado');
    if (!encab) return;
    encab.addEventListener('click', () => {
      sec.classList.toggle('abierto');
    });
  });
}

/* ---------- JUEGO COMPONENTES CU (módulo 3) ---------- */
function configurarJuegoComponentes() {
  document.querySelectorAll('.juego-comp .item-comp').forEach(item => {
    const correcta = item.dataset.correcta;
    const botones = item.querySelectorAll('.btn-comp');
    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        if (item.dataset.respondido === 'true') return;
        item.dataset.respondido = 'true';
        const rta = btn.dataset.rta;
        if (rta === correcta) btn.classList.add('correcta');
        else {
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

/* ---------- CONSTRUCTOR CU (módulo 5) ---------- */
function generarCasoUso() {
  const id     = document.getElementById('cu-id').value.trim();
  const nombre = document.getElementById('cu-nombre').value.trim();
  const actor  = document.getElementById('cu-actor').value.trim();
  const desc   = document.getElementById('cu-desc').value.trim();
  const pre    = document.getElementById('cu-pre').value.trim();
  const post   = document.getElementById('cu-post').value.trim();
  const flujo  = document.getElementById('cu-flujo').value.trim();
  const excep  = document.getElementById('cu-excep').value.trim();
  const reglas = document.getElementById('cu-reglas').value.trim();
  const freq   = document.getElementById('cu-freq').value;
  const prio   = document.getElementById('cu-prio').value;

  const obligatorios = { id, nombre, actor, desc, pre, post, flujo };
  const faltantes = Object.keys(obligatorios).filter(k => !obligatorios[k]);

  const cont = document.getElementById('cu-resultado');
  if (!cont) return;

  if (faltantes.length > 0) {
    cont.innerHTML = `
      <h3>⚠️ Faltan campos obligatorios</h3>
      <p>Por favor completa al menos: ID, Nombre, Actor, Descripción, Precondiciones, Postcondiciones y Flujo principal.</p>
    `;
    cont.classList.add('visible');
    window.scrollTo({ top: cont.offsetTop - 100, behavior: 'smooth' });
    return;
  }

  // Generar texto formateado
  const doc = `═══════════════════════════════════════════════════
${id}: ${nombre}
═══════════════════════════════════════════════════

🎭 ACTOR PRINCIPAL:
${actor}

📝 DESCRIPCIÓN BREVE:
${desc}

✅ PRECONDICIONES:
${pre}

🎯 POSTCONDICIONES:
${post}

▶️ FLUJO PRINCIPAL:
${flujo}

⚠️ EXCEPCIONES:
${excep || '(no especificadas)'}

📜 REGLAS DE NEGOCIO:
${reglas || '(no especificadas)'}

📊 FRECUENCIA: ${freq}
⭐ PRIORIDAD: ${prio}

═══════════════════════════════════════════════════`;

  cont.innerHTML = `
    <h3>✨ ¡Caso de uso generado!</h3>
    <p>Aquí está tu caso de uso completo. Puedes copiarlo y usarlo:</p>
    <pre>${escapeHtml(doc)}</pre>
    <button class="btn-generar" onclick="copiarCasoUso()" style="margin-top: 1rem; width: auto; padding: 0.6rem 1.4rem;">📋 Copiar al portapapeles</button>
    <div id="copia-msg" style="text-align:center; margin-top:0.5rem; color: var(--verde); font-weight: 700; display: none;">✅ ¡Copiado!</div>
  `;
  cont.classList.add('visible');
  otorgarBadge('🛠️ Constructor CU');
  window.scrollTo({ top: cont.offsetTop - 100, behavior: 'smooth' });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function copiarCasoUso() {
  const pre = document.querySelector('#cu-resultado pre');
  if (!pre) return;
  const texto = pre.textContent;
  navigator.clipboard.writeText(texto).then(() => {
    const msg = document.getElementById('copia-msg');
    if (msg) {
      msg.style.display = 'block';
      setTimeout(() => { msg.style.display = 'none'; }, 2000);
    }
  }).catch(() => {
    alert('No se pudo copiar automáticamente. Selecciona el texto manualmente.');
  });
}

/* ---------- REVISIÓN CRUZADA (módulo 7) ---------- */
function configurarRevisionSrs() {
  document.querySelectorAll('.srs-revisar .renglon-srs').forEach(ren => {
    ren.addEventListener('click', () => {
      if (ren.dataset.evaluado === 'true') return;
      ren.classList.toggle('marcado');
    });
  });
}

const erroresExplicacion = {
  'ambiguo': '🔍 <strong>Ambigüedad:</strong> "rápido" y "bonito" no son medibles. Falta métrica.',
  'no-atomico': '💥 <strong>No atómico:</strong> hay 3 ideas en un solo requerimiento (cancelar + reportes + SMS).',
  'contradiccion': '⚖️ <strong>Contradicción:</strong> entra en conflicto con buenas prácticas o con otro RNF.',
  'tecnico': '🤖 <strong>Demasiado técnico:</strong> describe la implementación, no el requerimiento.',
  'no-medible': '🔢 <strong>No medible:</strong> "muy seguro" no se puede probar. Falta especificar QUÉ medidas.'
};

function evaluarRevision() {
  const renglones = document.querySelectorAll('.srs-revisar .renglon-srs');
  let aciertos = 0;
  let falsosPositivos = 0;
  let faltantes = 0;
  let totalErrores = 0;

  renglones.forEach(ren => {
    const esError = ren.classList.contains('error');
    const marcado = ren.classList.contains('marcado');

    ren.classList.remove('marcado');
    ren.dataset.evaluado = 'true';

    if (esError) totalErrores++;

    if (esError && marcado) {
      ren.classList.add('acierto');
      aciertos++;
    } else if (!esError && marcado) {
      ren.classList.add('fallo');
      falsosPositivos++;
    } else if (esError && !marcado) {
      ren.classList.add('faltante');
      faltantes++;
    }
  });

  const res = document.getElementById('resultado-rev');
  if (!res) return;

  const pct = Math.round((aciertos / totalErrores) * 100);
  let titulo, msg;

  if (aciertos === totalErrores && falsosPositivos === 0) {
    titulo = '🏆 ¡REVISOR EXPERTO!';
    msg = 'Identificaste todos los errores sin falsos positivos. Tu ojo está afinado.';
    otorgarBadge('🦅 Ojo de Halcón');
  } else if (aciertos >= totalErrores * 0.7 && falsosPositivos <= 1) {
    titulo = '👍 BUEN REVISOR';
    msg = `Identificaste ${aciertos} de ${totalErrores} errores. ${falsosPositivos > 0 ? 'Marcaste ' + falsosPositivos + ' renglón correcto como erróneo.' : ''} Vas por buen camino.`;
  } else if (aciertos >= totalErrores * 0.4) {
    titulo = '⚠️ NECESITAS PRÁCTICA';
    msg = `Solo identificaste ${aciertos} de ${totalErrores} errores. Revisa el checklist del módulo y vuelve a intentar con otro documento.`;
  } else {
    titulo = '🔁 INTENTA OTRA VEZ';
    msg = `Identificaste muy pocos errores (${aciertos}/${totalErrores}). Es normal en una primera revisión. Estudia los tipos de error y vuelve a leer.`;
  }

  // Lista de errores que había
  const erroresEncontrados = [...document.querySelectorAll('.srs-revisar .renglon-srs.error')];
  let detalleErrores = '<h4 style="margin-top: 1rem;">📋 Errores que había en el documento:</h4><ul>';
  erroresEncontrados.forEach(ren => {
    const tipo = ren.dataset.error;
    const lineaCorta = ren.textContent.trim().substring(0, 70) + '...';
    detalleErrores += `<li><em>${escapeHtml(lineaCorta)}</em><br>${erroresExplicacion[tipo] || ''}</li>`;
  });
  detalleErrores += '</ul>';

  res.innerHTML = `
    <h4>${titulo}</h4>
    <div class="puntaje-rev">${aciertos} / ${totalErrores}</div>
    <p>${msg}</p>
    <p><strong>Falsos positivos:</strong> ${falsosPositivos} · <strong>Errores no detectados:</strong> ${faltantes}</p>
    ${detalleErrores}
  `;
  res.classList.add('visible');
  window.scrollTo({ top: res.offsetTop - 100, behavior: 'smooth' });
  guardarProgreso();
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
    background: 'linear-gradient(135deg, #6366f1, #f59e0b)',
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
