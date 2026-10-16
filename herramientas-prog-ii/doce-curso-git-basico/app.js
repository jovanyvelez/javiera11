/* ============================================================
   CLASE doce — HERRAMIENTAS DE PROGRAMACIÓN II
   Git básico (init, add, commit, log, ramas, deshacer) — Git 2.56
   Navegación, quizzes, checklist del taller y laboratorio de estados
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

const XP_POR_MODULO = 30;
const XP_POR_QUIZ_PERFECTO = 25;
const XP_TOTAL = 640;

const STORAGE_KEY = 'curso-herr-12-git';

document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarTeclado();
  configurarLaboratorio();
  configurarChecklists();
  actualizarUI();
});

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

  const badgesModulo = {0: '🚀 Repo iniciado', 1: '📸 Máquina del tiempo', 2: '🔄 Estados dominados', 3: '🧹 .gitignore listo', 4: '☕ Descansado', 5: '🌿 Ramas', 6: '⏪ Deshacer sin miedo', 7: '🛠️ Taller Git'};
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  const completables = [1, 2, 3, 5, 6, 7];
  if (completables.every(m => estado.completados.has(m))) {
    otorgarBadge('🏆 Git Dominado');
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
    const labels = ['Inicio', '¿Qué es Git?', 'El commit', 'Historial e ignore', 'Descanso', 'Ramas', 'Deshacer', 'Taller'];
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

/* ---------- LABORATORIO DE ESTADOS (módulo 2) ----------
   Simula la vida de app.py entre los tres estados de Git:
   directorio de trabajo → staging area → repositorio. */
function configurarLaboratorio() {
  const lab = document.querySelector('[data-lab]');
  if (!lab) return;

  const zonaWd = lab.querySelector('[data-lab-files="wd"]');
  const zonaSt = lab.querySelector('[data-lab-files="st"]');
  const zonaRp = lab.querySelector('[data-lab-files="rp"]');
  const statusEl = lab.querySelector('[data-lab-status]');
  const contadorEl = lab.querySelector('[data-lab-commits]');
  if (!zonaWd || !zonaSt || !zonaRp || !statusEl) return;

  /* Estado simulado de app.py */
  const sim = { limpio: true, staged: false, commits: 0, shas: [] };

  function sha() {
    let s = '';
    for (let i = 0; i < 7; i++) s += '0123456789abcdef'[Math.floor(Math.random() * 16)];
    return s;
  }

  function render() {
    /* Zona 1: directorio de trabajo */
    zonaWd.innerHTML = '';
    if (!sim.limpio) {
      zonaWd.innerHTML = '<span class="lab-file mod">app.py ← modificaciones sin preparar</span>';
    } else if (!sim.staged) {
      zonaWd.innerHTML = '<span class="lab-file">app.py</span>';
    } else {
      zonaWd.innerHTML = '<span class="lab-file">app.py</span>';
    }

    /* Zona 2: staging */
    zonaSt.innerHTML = sim.staged
      ? '<span class="lab-file staged">app.py ← listo para la foto</span>'
      : '<span class="lab-commit">— vacía —</span>';

    /* Zona 3: repositorio */
    zonaRp.innerHTML = '';
    if (sim.shas.length === 0) {
      zonaRp.innerHTML = '<span class="lab-commit">— sin commits todavía —</span>';
    } else {
      sim.shas.slice().reverse().forEach(s => {
        const el = document.createElement('span');
        el.className = 'lab-file committed';
        el.textContent = s;
        zonaRp.appendChild(el);
      });
    }
    if (contadorEl) contadorEl.textContent = sim.commits;

    /* El "git status" de toda la vida */
    let lineas = [];
    if (sim.staged && !sim.limpio) {
      lineas.push('Cambios para el próximo commit:');
      lineas.push('        modificado:   app.py   (lo que está en staging)');
      lineas.push('Cambios SIN preparar para el commit:');
      lineas.push('        modificado:   app.py   (lo que seguiste editando)');
    } else if (sim.staged) {
      lineas.push('Cambios para el próximo commit:');
      lineas.push('        modificado:   app.py');
    } else if (!sim.limpio) {
      lineas.push('Cambios SIN preparar para el commit:');
      lineas.push('        modificado:   app.py');
      lineas.push('(usa "git add app.py" para preparar la foto)');
    } else {
      lineas.push('nothing to commit, working tree clean');
    }
    statusEl.innerHTML = `<span class="ramita">En la rama main</span>\n` + (lineas.slice(-1)[0] === 'nothing to commit, working tree clean'
      ? `<span class="okmsg">nothing to commit, working tree clean</span>`
      : lineas.join('\n'));
  }

  function accion(nombre) {
    switch (nombre) {
      case 'editar':
        if (!sim.limpio) { mostrarToast('✏️ app.py ya tenía modificaciones sin preparar'); return; }
        sim.limpio = false;
        mostrarToast('✏️ Editaste app.py (guardaste en el editor)');
        break;
      case 'add':
        if (sim.limpio && !sim.staged) { mostrarToast('🤔 Nada nuevo que agregar a la foto'); return; }
        sim.staged = true;
        mostrarToast('📸 git add: app.py pasó al staging area');
        break;
      case 'commit':
        if (!sim.staged) { mostrarToast('🤔 Staging vacío: no hay nada para fotografiar'); return; }
        sim.commits++;
        sim.shas.push(sha());
        sim.staged = false;
        sim.limpio = true;
        mostrarToast(`🗄️ Commit creado (${sim.commits} en el álbum)`);
        break;
      case 'restore-staged':
        if (!sim.staged) { mostrarToast('🤔 app.py no estaba en staging'); return; }
        sim.staged = false;
        if (!sim.limpio) { /* sigue modificado, ahora solo en WD */ }
        mostrarToast('↩️ git restore --staged: app.py vuelve del staging');
        break;
      case 'restore':
        if (sim.limpio) { mostrarToast('✨ app.py ya estaba limpio: nada que descartar'); return; }
        sim.limpio = true;
        mostrarToast('⏪ git restore: descartaste las modificaciones (adiós, cambios)');
        break;
      case 'reset':
        sim.limpio = true; sim.staged = false; sim.commits = 0; sim.shas = [];
        mostrarToast('↺ Laboratorio reiniciado');
        break;
    }
    render();
  }

  lab.querySelectorAll('[data-lab-btn]').forEach(btn => {
    btn.addEventListener('click', () => accion(btn.dataset.labBtn));
  });

  render();
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
            otorgarBadge('🏆 Taller entregado');
            mostrarToast('✓ ¡Taller verificado por completo!');
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
    position: 'fixed', bottom: '30px', right: '30px',
    background: 'linear-gradient(135deg, #f05033, #ffc857)',
    color: '#160a06', padding: '0.9rem 1.4rem', borderRadius: '30px',
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