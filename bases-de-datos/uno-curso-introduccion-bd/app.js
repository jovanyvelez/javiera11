/* ============================================================
   CLASE 1 — BASES DE DATOS (Introducción)
   Lógica de navegación, simuladores, quizzes y taller
============================================================ */

const TOTAL_MODULOS = 8; // 0..7 (incluye módulo de descanso)

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
  inicializarBuscaDato();
  inicializarTimeline();
  inicializarClasificadorBD();
  configurarTeclado();
  actualizarUI();
});

const STORAGE_KEY = 'curso-bd-introduccion';

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
    1: '📦 Explorador de Datos',
    2: '🧩 Estructurador',
    3: '📜 Historiador BD',
    4: '☕ Descansado',
    5: '⚖️ Comparador',
    6: '🗃️ Clasificador de Tipos',
    7: '🛠️ BD Explorer'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 BD Dominado');
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
    const labels = ['Inicio', '¿Qué es?', 'Estructurar', 'Historia', 'Descanso', 'Manuales vs BD', 'Tipos de BD', 'Taller'];
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
        result.textContent = '✅ ¡Correcto! Se envían más de 100.000 millones de mensajes por día. Sin BD, imposible.';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. La cifra es de más de 100.000 millones de mensajes diarios. ¡A seguir!';
      }
    });
  });
}

/* ---------- TALLER (matching + order) ---------- */
const TALLER_RESP = {
  1: { '1a': '1B', '1b': '1D', '1c': '1C', '1d': '1A' },
  3: { '3a': '3A', '3b': '3B', '3c': '3C', '3d': '3D' }
};
const TALLER_ORDER = { 2: ['2fichas', '2rel', '2sql', '2nosql', '2nube'] };

const seleccionMatch = {};
const parejasMatch = {};

function configurarTaller() {
  document.querySelectorAll('[data-ws-match]').forEach(block => {
    const id = block.dataset.wsMatch;
    if (id === '4') return; // el reto 4 es el diagnóstico
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
      1: '¡Perfecto! BD=colección organizada; Integridad=consistencia; Concurrencia=varios a la vez; Persistencia=no se pierde.',
      2: '¡Excelente! Orden: Fichas (1890) → Relacional (1970) → SQL/Oracle (80s) → NoSQL (2000s) → Nube (2010s).',
      3: '¡Muy bien! MySQL=relacional, MongoDB=documental, Redis=clave-valor, Neo4j=grafos.'
    };
    const xpPorReto = { 1: 25, 2: 30, 3: 30 };
    fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
    if (!estado.talleres[id]) {
      estado.talleres[id] = true;
      addXP(xpPorReto[id]);
    }
    if (Object.keys(estado.talleres).length >= 4) {
      otorgarBadge('🛠️ BD Explorer Completado');
    }
  } else {
    fb.className = 'resultado-ws visible no';
    const hints = {
      1: 'Pista: BD=colección organizada; Integridad=sin contradicciones; Concurrencia=varios a la vez; Persistencia=no se pierde.',
      2: 'Pista: orden cronológico: fichas (1890) → relacional (1970) → SQL (80s) → NoSQL (2000s) → nube (2010s).',
      3: 'Pista: MySQL=relacional, MongoDB=documental, Redis=clave-valor, Neo4j=grafos.'
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
    const correctComp = 'manual';
    const correctActions = ['busqueda', 'concurrencia', 'integridad'];

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
      fb.innerHTML = `🏆 ¡DIAGNÓSTICO PERFECTO! Identificaste el sistema manual como causa raíz, seleccionaste los 3 beneficios correctos (búsqueda + concurrencia + integridad) y descartaste las opciones absurdas. Tu ticket de consultor está listo. <strong>+55 XP</strong>`;
      if (!estado.talleres['4']) {
        estado.talleres['4'] = true;
        addXP(55);
      }
      if (Object.keys(estado.talleres).length >= 4) {
        otorgarBadge('🛠️ BD Explorer Completado');
      }
    } else {
      fb.className = 'resultado-ws visible no';
      let hints = [];
      if (!compOk) hints.push('La causa raíz no es el número de libros ni los estudiantes: es el SISTEMA MANUAL en cuadernos.');
      if (!actionsOk) hints.push('Beneficios correctos: búsqueda + concurrencia + integridad. Descarta "comprar sillas" y "cuadernos más grandes".');
      if (!hasText) hints.push('Redacta tu recomendación con al menos 20 caracteres (sugiere relacional y por qué).');
      fb.innerHTML = `❌ Revisa el diagnóstico. ${hints.join(' ')}`;
    }

    guardarProgreso();
  });
}

/* ---------- SIMULADOR: BUSCA EL DATO (Módulo 1) ---------- */
function inicializarBuscaDato() {
  const runBtn = document.getElementById('buscaRun');
  if (!runBtn) return;

  const libreta = document.getElementById('buscaLibreta');
  const excel = document.getElementById('buscaExcel');
  const bd = document.getElementById('buscaBD');
  const result = document.getElementById('buscaResult');

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const reset = () => {
    [libreta, excel, bd].forEach(el => el.classList.remove('done', 'searching', 'selected'));
    document.getElementById('bmTimeLibreta').textContent = '—';
    document.getElementById('bmTimeExcel').textContent = '—';
    document.getElementById('bmTimeBD').textContent = '—';
    document.getElementById('bmStatusLibreta').textContent = 'Sin buscar';
    document.getElementById('bmStatusExcel').textContent = 'Sin buscar';
    document.getElementById('bmStatusBD').textContent = 'Sin buscar';
    result.classList.remove('visible');
  };

  runBtn.addEventListener('click', async () => {
    runBtn.disabled = true;
    reset();

    // Libreta: lento
    libreta.classList.add('searching');
    document.getElementById('bmStatusLibreta').textContent = 'Buscando página por página…';
    await sleep(2500);
    libreta.classList.remove('searching');
    libreta.classList.add('done');
    document.getElementById('bmTimeLibreta').textContent = '180';
    document.getElementById('bmStatusLibreta').textContent = 'Encontrado (a mano)';

    // Excel: medio
    excel.classList.add('searching');
    document.getElementById('bmStatusExcel').textContent = 'Recorriendo filas…';
    await sleep(1200);
    excel.classList.remove('searching');
    excel.classList.add('done');
    document.getElementById('bmTimeExcel').textContent = '8';
    document.getElementById('bmStatusExcel').textContent = 'Encontrado (Ctrl+B)';

    // BD: instantáneo
    bd.classList.add('searching');
    document.getElementById('bmStatusBD').textContent = 'Consultando índice…';
    await sleep(400);
    bd.classList.remove('searching');
    bd.classList.add('done');
    document.getElementById('bmTimeBD').textContent = '3';
    document.getElementById('bmStatusBD').textContent = 'Encontrado (SQL)';

    result.classList.add('visible');
    result.innerHTML = `
      <div class="br-line"><span class="k">📓 Libreta (50.000 contactos):</span> <span class="v">180 segundos</span> — búsqueda manual</div>
      <div class="br-line"><span class="k">📊 Excel (50.000 filas):</span> <span class="v">8 segundos</span> — Ctrl+B</div>
      <div class="br-line"><span class="k">🗄️ Base de datos (50.000 registros):</span> <span class="v">3 milisegundos</span> — consulta indexada</div>
      <div class="br-winner">🏆 La BD fue ~60× más rápida que Excel y ~60.000× más rápida que la libreta.</div>
    `;
    runBtn.disabled = false;
    addXP(10);
  });

  document.getElementById('buscaReset').addEventListener('click', reset);
}

/* ---------- LÍNEA DE TIEMPO (Módulo 3) ---------- */
function inicializarTimeline() {
  const items = document.querySelectorAll('.tl-item');
  if (!items.length) return;
  items.forEach(it => {
    it.addEventListener('click', () => {
      it.classList.toggle('expanded');
      addXP(1);
    });
  });
  if (items[0]) items[0].classList.add('expanded');
}

/* ---------- CLASIFICADOR TIPOS DE BD (Módulo 6) ---------- */
function inicializarClasificadorBD() {
  const bank = document.getElementById('bdBank');
  const grid = document.getElementById('tiposGrid');
  if (!bank || !grid) return;

  const items = [
    { id: 'i1', label: 'MySQL', bucket: 'rel' },
    { id: 'i2', label: 'PostgreSQL', bucket: 'rel' },
    { id: 'i3', label: 'MongoDB', bucket: 'doc' },
    { id: 'i4', label: 'CouchDB', bucket: 'doc' },
    { id: 'i5', label: 'Redis', bucket: 'kv' },
    { id: 'i6', label: 'Memcached', bucket: 'kv' },
    { id: 'i7', label: 'Neo4j', bucket: 'graph' },
    { id: 'i8', label: 'ArangoDB', bucket: 'graph' }
  ];

  let colocados = {};

  const render = () => {
    bank.innerHTML = items.map(it =>
      `<div class="bd-item ${colocados[it.id] ? 'placed' : ''}" data-id="${it.id}" data-bucket="${it.bucket}" draggable="true">${colocados[it.id] ? '✓ ' : ''}${it.label}</div>`
    ).join('');

    grid.querySelectorAll('.tipo-bucket').forEach(bucket => {
      const bid = bucket.dataset.bucket;
      const itemsHere = Object.entries(colocados).filter(([_, b]) => b === bid);
      bucket.querySelector('.bucket-items').innerHTML = itemsHere.map(([iid]) => {
        const it = items.find(x => x.id === iid);
        return `<div class="bucket-chip">${it.label} <span class="x" data-remove="${iid}">✕</span></div>`;
      }).join('');
    });

    bind();
  };

  const bind = () => {
    bank.querySelectorAll('.bd-item:not(.placed)').forEach(d => {
      d.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', d.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
      });
    });
    grid.querySelectorAll('.tipo-bucket').forEach(bucket => {
      bucket.addEventListener('dragover', e => { e.preventDefault(); bucket.classList.add('over'); });
      bucket.addEventListener('dragleave', () => bucket.classList.remove('over'));
      bucket.addEventListener('drop', e => {
        e.preventDefault();
        bucket.classList.remove('over');
        const id = e.dataTransfer.getData('text/plain');
        const it = items.find(x => x.id === id);
        if (!it || colocados[id]) return;
        colocados[id] = bucket.dataset.bucket;
        if (it.bucket === bucket.dataset.bucket) bucket.classList.add('correcta');
        render();
        addXP(1);
      });
    });
    grid.querySelectorAll('.x').forEach(x => {
      x.addEventListener('click', () => { delete colocados[x.dataset.remove]; render(); });
    });
  };

  // soporte táctil: click item → click bucket
  let selected = null;
  bank.addEventListener('click', e => {
    const d = e.target.closest('.bd-item:not(.placed)');
    if (!d) return;
    selected = d.dataset.id;
    bank.querySelectorAll('.bd-item').forEach(x => x.style.borderColor = '');
    d.style.borderColor = 'var(--esmeralda)';
  });
  grid.addEventListener('click', e => {
    const bucket = e.target.closest('.tipo-bucket');
    if (!bucket || !selected) return;
    const it = items.find(x => x.id === selected);
    if (!it || colocados[selected]) return;
    colocados[selected] = bucket.dataset.bucket;
    if (it.bucket === bucket.dataset.bucket) bucket.classList.add('correcta');
    selected = null;
    render();
    addXP(1);
  });

  document.getElementById('bdReset').addEventListener('click', () => {
    colocados = {};
    grid.querySelectorAll('.tipo-bucket').forEach(b => b.classList.remove('correcta'));
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
    background: 'linear-gradient(135deg, #10b981, #06b6d4)',
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