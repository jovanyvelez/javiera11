/* ============================================================
   CLASE 3 — BASES DE DATOS (asyncpg + FastAPI)
   Lógica de navegación, simuladores, quizzes y taller
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
const XP_TOTAL = 640;

document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarTaller();
  configurarDiagnostico();
  configurarTrivia();
  inicializarDriverSim();
  inicializarPoolAnatomy();
  inicializarMatchPractica();
  configurarTeclado();
  actualizarUI();
});

const STORAGE_KEY = 'curso-bd-asyncpg-fastapi';

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
    1: '⚡ Conoce asyncpg',
    2: '🏊 Pool Master',
    3: '🔗 Domina get_db',
    4: '☕ Descansado',
    5: '🚀 Lifespan Pro',
    6: '✨ Buenas Prácticas',
    7: '🛠️ Async PG Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 asyncpg + FastAPI Dominado');
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
    const labels = ['Inicio', 'asyncpg', 'Pool', 'get_db', 'Descanso', 'FastAPI', 'Buenas prácticas', 'Taller'];
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

/* ---------- TRIVIA (descanso) ---------- */
function configurarTrivia() {
  const opts = document.querySelectorAll('#triviaOpts .trivia-opt');
  const result = document.getElementById('triviaResult');
  if (!opts.length || !result) return;

  opts.forEach(op => {
    op.addEventListener('click', () => {
      const correcta = op.dataset.tcorrecta;
      const elegida = op.dataset.top;
      opts.forEach(o => { o.disabled = true; if (o.dataset.top === correcta) o.classList.add('correcta'); });
      if (elegida === correcta) {
        result.className = 'trivia-result visible ok';
        result.textContent = '✅ ¡Correcto! Con min_size=10 el pool abre 10 conexiones al arrancar. El max_size=20 solo se alcanza si hay pico de demanda.';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. Al arrancar hay min_size=10 conexiones. El max_size=20 es el tope, no el inicio. ¡A seguir!';
      }
    });
  });
}

/* ---------- TALLER (matching + order) ---------- */
const TALLER_RESP = {
  1: { '1a': '1B', '1b': '1A', '1c': '1D', '1d': '1C' },
  3: { '3a': '3B', '3b': '3D', '3c': '3A', '3d': '3C' }
};
const TALLER_ORDER = { 2: ['2cliente', '2depends', '2acquire', '2fetch', '2release'] };

const seleccionMatch = {};
const parejasMatch = {};

function configurarTaller() {
  document.querySelectorAll('[data-ws-match]').forEach(block => {
    const id = block.dataset.wsMatch;
    if (id === '4') return;
    parejasMatch[id] = [];
    seleccionMatch[id] = {};

    block.querySelectorAll('[data-role="left"] .ws-chip').forEach(chip => {
      chip.addEventListener('click', () => seleccionarMatchChip(id, chip, 'left'));
    });
    block.querySelectorAll('[data-role="right"] .ws-chip').forEach(chip => {
      chip.addEventListener('click', () => seleccionarMatchChip(id, chip, 'right'));
    });
  });

  configurarOrden(2);

  document.querySelectorAll('[data-check-ws]').forEach(btn => {
    if (btn.id === 'diagValidate') return;
    btn.addEventListener('click', () => validarReto(btn.dataset.checkWs));
  });
}

function seleccionarMatchChip(id, chip, lado) {
  if (chip.classList.contains('correct')) return;
  seleccionMatch[id][lado] = chip.dataset.mid;
  const block = chip.closest('.ws-block');
  block.querySelectorAll(`[data-role="${lado}"] .ws-chip`).forEach(c => c.classList.remove('selected'));
  chip.classList.add('selected');

  if (seleccionMatch[id].left && seleccionMatch[id].right) {
    parejasMatch[id].push({ left: seleccionMatch[id].left, right: seleccionMatch[id].right });
    block.querySelectorAll('.ws-chip.selected').forEach(c => {
      c.classList.remove('selected');
      c.classList.add('paired-temp');
      c.style.opacity = '0.5';
    });
    seleccionMatch[id] = {};
  }
}

function validarReto(id) {
  const fb = document.getElementById(`ws-fb-${id}`);
  if (!fb) return;
  let allOk = true;

  if (TALLER_RESP[id]) {
    const block = document.querySelector(`[data-ws-match="${id}"]`);
    const correctMap = TALLER_RESP[id];
    parejasMatch[id].forEach(p => {
      const expectedRight = correctMap[p.left];
      const leftChip = block.querySelector(`[data-mid="${p.left}"]`);
      const rightChip = block.querySelector(`[data-mid="${p.right}"]`);
      leftChip.classList.remove('correct', 'wrong', 'paired-temp');
      rightChip.classList.remove('correct', 'wrong', 'paired-temp');
      leftChip.style.opacity = '';
      rightChip.style.opacity = '';
      if (expectedRight === p.right) {
        leftChip.classList.add('correct');
        rightChip.classList.add('correct');
      } else {
        leftChip.classList.add('wrong');
        rightChip.classList.add('wrong');
        allOk = false;
      }
    });
    const totalEsperado = Object.keys(correctMap).length;
    if (parejasMatch[id].length !== totalEsperado) allOk = false;
  }

  if (TALLER_ORDER[id]) {
    const cont = document.getElementById('wsOrder2');
    const items = cont.querySelectorAll('.ws-order-item');
    const expected = TALLER_ORDER[id];
    items.forEach((it, i) => {
      const oid = it.dataset.oid;
      it.classList.remove('correct', 'wrong');
      it.querySelector('.ord-num').textContent = i + 1;
      if (oid === expected[i]) it.classList.add('correct');
      else { it.classList.add('wrong'); allOk = false; }
    });
  }

  fb.classList.add('visible');
  if (allOk) {
    fb.className = 'resultado-ws visible ok';
    const msgs = {
      1: '¡Perfecto! asyncpg=driver asíncrono; Pool=conexiones reutilizadas; get_db=dependencia con yield; Lifespan=arrancar/apagar.',
      2: '¡Excelente! Flujo: Cliente → Depends → acquire → fetch (await) → release al pool.',
      3: '¡Muy bien! Annotated=tipos reutilizables; APIRouter=rutas organizadas; response_model=valida/filtra; DbDep=reutiliza Depends.'
    };
    const xpPorReto = { 1: 25, 2: 30, 3: 30 };
    fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
    if (!estado.talleres[id]) {
      estado.talleres[id] = true;
      addXP(xpPorReto[id]);
    }
    if (Object.keys(estado.talleres).length >= 4) {
      otorgarBadge('🛠️ Async PG Master Completado');
    }
  } else {
    fb.className = 'resultado-ws visible no';
    const hints = {
      1: 'Pista: asyncpg=driver asíncrono; Pool=reutiliza conexiones; get_db=Depends con yield; Lifespan=ciclo de vida de la app.',
      2: 'Pista: del cliente al pool: Cliente → Depends → acquire → fetch → release.',
      3: 'Pista: Annotated=tipos; APIRouter=organiza rutas; response_model=valida respuesta; DbDep=reutiliza la dependencia.'
    };
    fb.innerHTML = `❌ Algunas respuestas son incorrectas. ${hints[id]}`;
  }

  guardarProgreso();
}

/* Ordenar por drag + flechas */
function configurarOrden(id) {
  const cont = document.getElementById('wsOrder2');
  if (!cont) return;
  const items = cont.querySelectorAll('.ws-order-item');
  let dragSrc = null;

  items.forEach(it => {
    it.addEventListener('dragstart', e => {
      dragSrc = it;
      it.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    it.addEventListener('dragend', () => { it.classList.remove('dragging'); renumerarOrden(); });
    it.addEventListener('dragover', e => {
      e.preventDefault();
      const after = getDragAfterElement(cont, e.clientY);
      if (after == null) cont.appendChild(dragSrc);
      else cont.insertBefore(dragSrc, after);
    });
  });

  document.querySelectorAll('[data-ws-up]').forEach(btn => btn.addEventListener('click', () => moverOrden(-1)));
  document.querySelectorAll('[data-ws-down]').forEach(btn => btn.addEventListener('click', () => moverOrden(1)));
}

function getDragAfterElement(container, y) {
  const els = [...container.querySelectorAll('.ws-order-item:not(.dragging)')];
  return els.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: -Infinity }).element;
}

function moverOrden(dir) {
  const cont = document.getElementById('wsOrder2');
  const selected = cont.querySelector('.ws-order-item.selected');
  if (!selected) {
    const first = cont.querySelector('.ws-order-item');
    if (first) first.classList.add('selected');
    return;
  }
  const items = [...cont.children];
  const i = items.indexOf(selected);
  const j = i + dir;
  if (j < 0 || j >= items.length) return;
  if (dir < 0) cont.insertBefore(selected, items[j]);
  else cont.insertBefore(selected, items[j].nextSibling);
  renumerarOrden();
}

document.addEventListener('click', e => {
  const it = e.target.closest('.ws-order-item');
  if (it && it.closest('#wsOrder2')) {
    document.querySelectorAll('#wsOrder2 .ws-order-item').forEach(x => x.classList.remove('selected'));
    it.classList.add('selected');
    renumerarOrden();
  }
});

function renumerarOrden() {
  const cont = document.getElementById('wsOrder2');
  if (!cont) return;
  cont.querySelectorAll('.ws-order-item').forEach((it, i) => {
    it.querySelector('.ord-num').textContent = i + 1;
  });
}

/* ---------- DIAGNÓSTICO (Jefe Final) ---------- */
function configurarDiagnostico() {
  const validateBtn = document.getElementById('diagValidate');
  if (!validateBtn) return;

  let compSelected = null;
  const compOpts = document.querySelectorAll('#diagComp .ticket-opt');
  compOpts.forEach(o => {
    o.addEventListener('click', () => {
      compOpts.forEach(x => x.classList.remove('selected'));
      o.classList.add('selected');
      compSelected = o.dataset.dval;
    });
  });

  let actionsSelected = new Set();
  const actionOpts = document.querySelectorAll('#diagActions .ticket-opt');
  actionOpts.forEach(o => {
    o.addEventListener('click', () => {
      o.classList.toggle('selected');
      const v = o.dataset.aval;
      if (o.classList.contains('selected')) actionsSelected.add(v);
      else actionsSelected.delete(v);
    });
  });

  validateBtn.addEventListener('click', () => {
    const fb = document.getElementById('ws-fb-4');
    const correctComp = 'syncpool';
    const correctActions = ['asyncpg', 'pool', 'depends'];

    let compOk = compSelected === correctComp;
    let actionsOk = actionsSelected.size === correctActions.length &&
                    correctActions.every(a => actionsSelected.has(a));
    const hasText = document.getElementById('diagText').value.trim().length >= 20;

    compOpts.forEach(o => {
      o.classList.remove('correct', 'wrong');
      if (o.dataset.dval === correctComp) o.classList.add('correct');
      else if (o.classList.contains('selected') && o.dataset.dval !== correctComp) o.classList.add('wrong');
    });
    actionOpts.forEach(o => {
      o.classList.remove('correct', 'wrong');
      if (correctActions.includes(o.dataset.aval)) o.classList.add('correct');
      else if (o.classList.contains('selected') && !correctActions.includes(o.dataset.aval)) o.classList.add('wrong');
    });

    fb.classList.add('visible');
    const allOk = compOk && actionsOk && hasText;

    if (allOk) {
      fb.className = 'resultado-ws visible ok';
      fb.innerHTML = `🏆 ¡DIAGNÓSTICO PERFECTO! Identificaste psycopg2 síncrono + conexión por request como causa raíz, propusiste asyncpg + pool + Depends y descartaste "comprar CPU" y "reducir usuarios". Tu ticket de detective de backend está listo. <strong>+55 XP</strong>`;
      if (!estado.talleres['4']) {
        estado.talleres['4'] = true;
        addXP(55);
      }
      if (Object.keys(estado.talleres).length >= 4) {
        otorgarBadge('🛠️ Async PG Master Completado');
      }
    } else {
      fb.className = 'resultado-ws visible no';
      let hints = [];
      if (!compOk) hints.push('La causa raíz no es la CPU ni FastAPI: es psycopg2 SÍNCRONO abriendo/cerrando conexión por request (bloquea el event loop y satura Postgres).');
      if (!actionsOk) hints.push('Cambios correctos: asyncpg + pool + Depends(get_db). Descartar "comprar CPU" y "reducir usuarios".');
      if (!hasText) hints.push('Redacta tu explicación con al menos 20 caracteres (pool reutiliza, asyncpg no bloquea).');
      fb.innerHTML = `❌ Revisa el diagnóstico. ${hints.join(' ')}`;
    }

    guardarProgreso();
  });
}

/* ---------- SIMULADOR: DRIVER SYNC vs ASYNC (Módulo 1) ---------- */
function inicializarDriverSim() {
  const runBtn = document.getElementById('driverRun');
  if (!runBtn) return;

  const sync = document.getElementById('driverSync');
  const asyncEl = document.getElementById('driverAsync');
  const result = document.getElementById('driverResult');

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const reset = () => {
    [sync, asyncEl].forEach(el => el.classList.remove('done', 'searching', 'selected'));
    document.getElementById('dmTimeSync').textContent = '—';
    document.getElementById('dmTimeAsync').textContent = '—';
    document.getElementById('dmStatusSync').textContent = 'En espera';
    document.getElementById('dmStatusAsync').textContent = 'En espera';
    result.classList.remove('visible');
  };

  runBtn.addEventListener('click', async () => {
    runBtn.disabled = true;
    reset();

    // Sync: atiende de a uno, bloquea
    sync.classList.add('searching');
    document.getElementById('dmStatusSync').textContent = 'Bloqueando el event loop…';
    await sleep(2500);
    sync.classList.remove('searching');
    sync.classList.add('done');
    document.getElementById('dmTimeSync').textContent = '3';
    document.getElementById('dmStatusSync').textContent = 'Atendidos (1 a la vez)';

    // Async: atiende todos a la vez
    asyncEl.classList.add('searching');
    document.getElementById('dmStatusAsync').textContent = 'Concurrente (event loop libre)…';
    await sleep(600);
    asyncEl.classList.remove('searching');
    asyncEl.classList.add('done');
    document.getElementById('dmTimeAsync').textContent = '20';
    document.getElementById('dmStatusAsync').textContent = 'Atendidos (en paralelo)';

    result.classList.add('visible');
    result.innerHTML = `
      <div class="br-line"><span class="k">🐢 psycopg2 (síncrono):</span> <span class="v">3 usuarios</span> — bloquea 50 ms por request, los demás esperan</div>
      <div class="br-line"><span class="k">⚡ asyncpg (asíncrono):</span> <span class="v">20 usuarios</span> — cede el control con await mientras la BD responde</div>
      <div class="br-winner">🏆 asyncpg atendió ~6× más usuarios en el mismo tiempo sin bloquear el event loop.</div>
    `;
    runBtn.disabled = false;
    addXP(10);
  });

  document.getElementById('driverReset').addEventListener('click', reset);
}

/* ---------- INTERACTIVO: ANATOMÍA DEL POOL (Módulo 2) ---------- */
function inicializarPoolAnatomy() {
  const layers = document.querySelectorAll('#poolDiagram .pool-layer');
  const detail = document.getElementById('poolDetail');
  if (!layers.length || !detail) return;

  const info = {
    min_size: {
      title: '📉 min_size — conexiones mínimas',
      desc: 'Número de conexiones que el pool abre y mantiene desde el arranque. Con min_size=10 hay 10 conexiones listas para responder de inmediato, sin esperar a que se abran. Si no hay requests, esas 10 siguen abiertas esperando.'
    },
    max_size: {
      title: '📈 max_size — conexiones máximas',
      desc: 'Tope de conexiones simultáneas. Si los 10 de min_size están ocupados y llega más demanda, el pool abre más hasta max_size=20. Si se supera, los requests esperan a que alguien libere una. Protege a PostgreSQL de recibir 1000 conexiones a la vez.'
    },
    max_queries: {
      title: '🔄 max_queries — reinicio por uso',
      desc: 'Tras X consultas (50000), el pool cierra y reabre la conexión. Esto libera memoria que PostgreSQL acumula por sesión (caches, cursores, temporales). Evita que una conexión "vieja" se vuelva lenta o consuma recursos de más.'
    },
    max_inactive: {
      title: '⏲️ max_inactive_connection_lifetime — cierre por inactividad',
      desc: 'Si una conexión lleva 300 s sin usarse, el pool la cierra. Evita mantener conexiones zombis que PostgreSQL cuenta contra su tope de max_connections. Balance entre tenerlas listas y no desperdiciar recursos.'
    }
  };

  layers.forEach(layer => {
    layer.addEventListener('click', () => {
      layers.forEach(l => l.classList.remove('active'));
      layer.classList.add('active');
      const comp = layer.dataset.comp;
      const i = info[comp];
      if (i) {
        detail.innerHTML = `<h4>${i.title}</h4><p>${i.desc}</p>`;
      }
      addXP(2);
    });
  });
}

/* ---------- INTERACTIVO: MATCH BUENAS PRÁCTICAS (Módulo 6) ---------- */
function inicializarMatchPractica() {
  const grid = document.getElementById('matchGrid');
  const optsEl = document.getElementById('matchOptions');
  const fb = document.getElementById('matchFeedback');
  const instr = document.getElementById('matchInstr');
  if (!grid || !optsEl) return;

  const escenarios = [
    { id: 'e1', icon: '🏷️', name: 'Annotated[T, Depends()]', so: 'buena', answer: '✅ Buena práctica' },
    { id: 'e2', icon: '🔗', name: 'Depends sin Annotated', so: 'mala', answer: '❌ Evitar' },
    { id: 'e3', icon: '🧩', name: 'APIRouter(prefix="/autores")', so: 'buena', answer: '✅ Buena práctica' },
    { id: 'e4', icon: '📂', name: 'Todo en main.py de 1000 líneas', so: 'mala', answer: '❌ Evitar' },
    { id: 'e5', icon: '🛡️', name: 'response_model=MiModelo', so: 'buena', answer: '✅ Buena práctica' },
    { id: 'e6', icon: '🔓', name: 'Devolver dict sin validar', so: 'mala', answer: '❌ Evitar' },
    { id: 'e7', icon: '♻️', name: 'DbDep = Annotated[Conn, Depends]', so: 'buena', answer: '✅ Buena práctica' },
    { id: 'e8', icon: '🔁', name: 'Abrir pool dentro del endpoint', so: 'mala', answer: '❌ Evitar' }
  ];
  const opciones = [
    { id: 'buena', label: '✅ Buena práctica' },
    { id: 'mala', label: '❌ Evitar' }
  ];

  let selected = null;
  let aciertos = 0;

  const render = () => {
    grid.innerHTML = escenarios.map(e => {
      const matched = e.matched;
      return `<div class="match-device-bd ${selected === e.id ? 'selected' : ''} ${matched ? 'matched' : ''}" data-eid="${e.id}">
        <span class="d-icon">${e.icon}</span>
        <span class="d-name">${e.name}</span>
        ${matched ? `<span class="d-answer">${e.answer}</span>` : ''}
      </div>`;
    }).join('');
    optsEl.innerHTML = opciones.map(o =>
      `<button class="match-bd-opt ${o.used ? 'used' : ''}" data-oid="${o.id}">${o.label}</button>`
    ).join('');
    if (instr) instr.textContent = selected ? `Fragmento seleccionado. Toca Buena práctica o Evitar.` : 'Toca un fragmento para seleccionarlo.';
    bind();
  };

  const bind = () => {
    grid.querySelectorAll('.match-device-bd:not(.matched)').forEach(d => {
      d.addEventListener('click', () => { selected = d.dataset.eid; render(); });
    });
    optsEl.querySelectorAll('.match-bd-opt:not(.used)').forEach(o => {
      o.addEventListener('click', () => {
        if (!selected) return;
        const e = escenarios.find(x => x.id === selected);
        if (e.so === o.dataset.oid) {
          e.matched = true;
          aciertos++;
          addXP(5);
          if (aciertos === escenarios.length) {
            fb.className = 'match-bd-feedback visible ok';
            fb.textContent = '🏆 ¡Perfecto! 8/8 fragmentos clasificados. Sabes distinguir una buena práctica de un antipatrón.';
          }
        } else {
          const dev = grid.querySelector(`[data-eid="${selected}"]`);
          dev.style.borderColor = 'var(--rosa)';
          setTimeout(() => dev.style.borderColor = '', 600);
          fb.className = 'match-bd-feedback visible';
          fb.style.background = 'rgba(244, 63, 94, 0.12)';
          fb.style.color = 'var(--rosa)';
          fb.textContent = '❌ Piensa: ¿respeta los tipos, organiza el código y valida la respuesta?';
          setTimeout(() => fb.classList.remove('visible'), 1500);
        }
        selected = null;
        render();
      });
    });
  };

  document.getElementById('matchReset').addEventListener('click', () => {
    escenarios.forEach(e => e.matched = false);
    selected = null; aciertos = 0;
    fb.classList.remove('visible');
    render();
  });

  render();
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
    background: 'linear-gradient(135deg, #84cc16, #6366f1)',
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