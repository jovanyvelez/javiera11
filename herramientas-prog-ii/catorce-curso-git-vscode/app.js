/* ============================================================
   CLASE catorce — HERRAMIENTAS DE PROGRAMACIÓN II
   Git en VS Code: el mismo Git, con botones (Source Control,
   diffs, staging, ramas, conflictos CodeLens, historial)
   Navegación, quizzes, traductor de clics y checklist del taller
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

const STORAGE_KEY = 'curso-herr-14-git-vscode';

document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarTeclado();
  configurarTraductor();
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

  const badgesModulo = {0: '🚀 Editor listo', 1: '🌿 Panel dominado', 2: '👁️ Diffs y staging', 3: '📊 Barra de estado', 4: '☕ Descansado', 5: '⚔️ Conflictos resueltos', 6: '🕰️ Historial visible', 7: '🛠️ Taller con botones'};
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  const completables = [1, 2, 3, 5, 6, 7];
  if (completables.every(m => estado.completados.has(m))) {
    otorgarBadge('🏆 Git con botones');
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
    const labels = ['Inicio', 'Panel SCM', 'Diffs y staging', 'Barra de estado', 'Descanso', 'Conflictos', 'Historial', 'Taller'];
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

/* ---------- TRADUCTOR DE CLICS (módulo 2) ----------
   Se muestra una acción de la interfaz de VS Code y hay que
   elegir el comando de Git que ese clic ejecuta por debajo. */
const TRADUCTOR_ITEMS = [
  {
    ui: 'Panel SCM · pasas el cursor sobre un archivo en CHANGES y haces clic en el signo + ("Stage Changes")',
    resp: ['git add nombre-archivo', 'git commit -m "..."', 'git restore nombre-archivo', 'git push'],
    pista: 'El + manda ese archivo a la posing: es literalmente git add.'
  },
  {
    ui: 'Panel SCM · el archivo ya está en STAGED CHANGES y haces clic en el signo − ("Unstage Changes")',
    resp: ['git restore --staged nombre-archivo', 'git restore nombre-archivo', 'git add .', 'git commit --amend'],
    pista: 'Lo saca de la posing SIN perder los cambios: el backspace elegante de la clase 12.'
  },
  {
    ui: 'Panel SCM · escribes el mensaje en la caja y presionas el botón ✓ "Commit"',
    resp: ['git commit -m "tu mensaje"', 'git add .', 'git push', 'git switch -c main'],
    pista: 'La caja de texto es el -m; el botón ✓ es Enter: la foto con su etiqueta.'
  },
  {
    ui: 'Panel SCM · haces clic en el ícono 🗑️ de un archivo modificado ("Discard Changes") y aceptas la confirmación',
    resp: ['git restore nombre-archivo', 'git restore --staged nombre-archivo', 'git revert HEAD', 'git pull'],
    pista: 'Ojo: es la que NO tiene deshacer. Descarta los cambios para siempre — por eso pide confirmación.'
  },
  {
    ui: 'Barra de estado · haces clic en el nombre de la rama (main) y eliges "+ Create new branch…"',
    resp: ['git switch -c nombre-rama', 'git merge nombre-rama', 'git branch -d nombre-rama', 'git log --oneline'],
    pista: 'Crea el universo paralelo Y te deja parado en él: exactamente el switch -c de la clase 12.'
  },
  {
    ui: 'Barra de estado · haces clic en el icono ↻ con 1↑ ("Synchronize Changes")',
    resp: ['git pull y luego git push', 'solo git push', 'git clone', 'git reset --hard'],
    pista: 'Sincronizar es el ciclo completo: primero baja lo nuevo de la nube, después sube tus commits.'
  },
  {
    ui: 'Barra de estado · aparece el botón "Publish Branch" en una rama nueva sin upstream y haces clic',
    resp: ['git push -u origin nombre-rama', 'git remote add origin URL', 'git branch -M main', 'git switch main'],
    pista: 'Publica la rama en la nube y la conecta para siempre: el -u de la clase 13, sin escribirlo.'
  }
];

function configurarTraductor() {
  const cont = document.querySelector('[data-traductor]');
  if (!cont) return;

  const contadorEl = cont.querySelector('[data-tr-contador]');
  const aciertosEl = cont.querySelector('[data-tr-aciertos]');
  const situacionEl = cont.querySelector('[data-tr-situacion]');
  const opcionesEl = cont.querySelector('[data-tr-opciones]');
  const resEl = cont.querySelector('[data-tr-res]');
  const avanzarBtn = cont.querySelector('[data-tr-avanzar]');
  if (!situacionEl || !opcionesEl || !resEl) return;

  let actual = 0;
  let aciertos = 0;
  const respondidas = new Set();

  function mostrar(i) {
    actual = i;
    const item = TRADUCTOR_ITEMS[i];
    resEl.classList.remove('visible', 'ok', 'no');
    resEl.textContent = '';
    if (avanzarBtn) avanzarBtn.classList.remove('visible');

    if (contadorEl) contadorEl.textContent = `${i + 1} / ${TRADUCTOR_ITEMS.length}`;
    situacionEl.innerHTML = `<span class="tr-ui">🖥️ ${item.ui}</span>¿Qué comando ejecuta VS Code por debajo?`;

    /* Baraja las opciones para que la correcta no esté siempre en la misma posición. */
    const orden = item.resp.map((_, idx) => idx);
    for (let k = orden.length - 1; k > 0; k--) {
      const j = Math.floor(Math.random() * (k + 1));
      [orden[k], orden[j]] = [orden[j], orden[k]];
    }

    opcionesEl.innerHTML = '';
    orden.forEach(idx => {
      const btn = document.createElement('button');
      btn.className = 'tr-opt';
      btn.textContent = item.resp[idx];
      if (idx === 0) btn.dataset.trOk = 'true';
      btn.disabled = respondidas.has(i);
      btn.addEventListener('click', () => responder(btn));
      opcionesEl.appendChild(btn);
    });
  }

  function responder(btn) {
    const item = TRADUCTOR_ITEMS[actual];
    respondidas.add(actual);

    const botones = opcionesEl.querySelectorAll('.tr-opt');
    botones.forEach(b => b.disabled = true);

    const correcto = btn.dataset.trOk === 'true';
    const correctaBtn = opcionesEl.querySelector('.tr-opt[data-tr-ok]');

    if (correcto) {
      btn.classList.add('ok');
      aciertos++;
      resEl.classList.add('visible', 'ok');
      resEl.textContent = `✅ Correcto. ${item.pista}`;
      mostrarToast(`🎯 ${aciertos} de ${actual + 1} aciertos en el traductor`);
    } else {
      btn.classList.add('no');
      if (correctaBtn) correctaBtn.classList.add('ok');
      resEl.classList.add('visible', 'no');
      resEl.textContent = `❌ Ese clic ejecuta otro comando. ${item.pista}`;
    }

    if (aciertosEl) aciertosEl.textContent = String(aciertos);

    if (actual === TRADUCTOR_ITEMS.length - 1) {
      if (avanzarBtn) {
        avanzarBtn.textContent = `↺ Reintentar (${aciertos}/${TRADUCTOR_ITEMS.length})`;
        avanzarBtn.classList.add('visible');
      }
      if (aciertos === TRADUCTOR_ITEMS.length && !cont.dataset.premiado) {
        cont.dataset.premiado = 'true';
        addXP(10);
        otorgarBadge('🎯 Traductor de clics');
      }
    } else if (avanzarBtn) {
      avanzarBtn.textContent = 'Siguiente situación →';
      avanzarBtn.classList.add('visible');
    }
  }

  if (avanzarBtn) {
    avanzarBtn.addEventListener('click', () => {
      if (actual === TRADUCTOR_ITEMS.length - 1) {
        aciertos = 0;
        respondidas.clear();
        if (aciertosEl) aciertosEl.textContent = '0';
        mostrar(0);
      } else {
        mostrar(actual + 1);
      }
    });
  }

  if (aciertosEl) aciertosEl.textContent = '0';
  mostrar(0);
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
    background: 'linear-gradient(135deg, #007acc, #4dd0ff)',
    color: '#04141f', padding: '0.9rem 1.4rem', borderRadius: '30px',
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