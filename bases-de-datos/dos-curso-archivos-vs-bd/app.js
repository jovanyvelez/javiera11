/* ============================================================
   CLASE 2 — BASES DE DATOS (Archivos vs BD)
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
  inicializarArchivosSim();
  inicializarSgbdAnatomy();
  inicializarMatchArchivoBd();
  configurarTeclado();
  actualizarUI();
});

const STORAGE_KEY = 'curso-bd-archivos-vs-bd';

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
    1: '📁 Maestro de Archivos',
    2: '🗄️ Conoce el SGBD',
    3: '⚖️ Comparador',
    4: '☕ Descansado',
    5: '✅ Analista de Ventajas',
    6: '🎯 Toma de Decisiones',
    7: '🛠️ Archivos vs BD Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Archivos vs BD Dominado');
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
    const labels = ['Inicio', 'Archivos', 'SGBD', 'Diferencias', 'Descanso', 'Ventajas', '¿Cuándo?', 'Taller'];
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
        result.textContent = '✅ ¡Correcto! Los archivos NO manejan concurrencia: esa es una ventaja exclusiva de las BD.';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Casi. La concurrencia es ventaja de las BD, no de los archivos. ¡A seguir!';
      }
    });
  });
}

/* ---------- TALLER (matching + order) ---------- */
const TALLER_RESP = {
  1: { '1a': '1A', '1b': '1B', '1c': '1C', '1d': '1D' },
  3: { '3a': '3B', '3b': '3A', '3c': '3D', '3d': '3C' }
};
const TALLER_ORDER = { 2: ['2datos', '2motor', '2sql', '2app', '2user'] };

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
      1: '¡Perfecto! Archivos=no instalación/portátil; BD=concurrencia/transacciones.',
      2: '¡Excelente! Orden: Datos → Motor → SQL → Aplicación → Usuario. Así se apila un SGBD.',
      3: '¡Muy bien! Redundancia=desincronización; Concurrencia=varios a la vez; Integridad=consistencia; Escalabilidad=millones de registros.'
    };
    const xpPorReto = { 1: 25, 2: 30, 3: 30 };
    fb.innerHTML = `✅ ${msgs[id]} <strong>+${xpPorReto[id]} XP</strong>`;
    if (!estado.talleres[id]) {
      estado.talleres[id] = true;
      addXP(xpPorReto[id]);
    }
    if (Object.keys(estado.talleres).length >= 4) {
      otorgarBadge('🛠️ Archivos vs BD Master Completado');
    }
  } else {
    fb.className = 'resultado-ws visible no';
    const hints = {
      1: 'Pista: no instalación y portátil = archivos; concurrencia y transacciones = BD.',
      2: 'Pista: de abajo a arriba: Datos → Motor → SQL → App → Usuario.',
      3: 'Pista: Redundancia=desincronización, Concurrencia=varios a la vez, Integridad=consistencia, Escalabilidad=millones.'
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
    const correctComp = 'archivos';
    const correctActions = ['pacientes', 'facturacion', 'config'];

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
      fb.innerHTML = `🏆 ¡DIAGNÓSTICO PERFECTO! Identificaste los archivos desconectados como causa raíz, migraste los datos críticos a BD, dejaste la config como archivo y descartaste "CSV suelto" y "seguir con Excel". Tu ticket de consultor está listo. <strong>+55 XP</strong>`;
      if (!estado.talleres['4']) {
        estado.talleres['4'] = true;
        addXP(55);
      }
      if (Object.keys(estado.talleres).length >= 4) {
        otorgarBadge('🛠️ Archivos vs BD Master Completado');
      }
    } else {
      fb.className = 'resultado-ws visible no';
      let hints = [];
      if (!compOk) hints.push('La causa raíz no son los doctores ni Excel: es el SISTEMA DE ARCHIVOS desconectado (redundancia, sin concurrencia, sin integridad).');
      if (!actionsOk) hints.push('Migrar a BD: pacientes+citas+facturación. Dejar como archivo: config. Descartar "CSV suelto" y "seguir con Excel".');
      if (!hasText) hints.push('Redacta tu recomendación con al menos 20 caracteres (relacional, datos relacionados, concurrencia).');
      fb.innerHTML = `❌ Revisa el diagnóstico. ${hints.join(' ')}`;
    }

    guardarProgreso();
  });
}

/* ---------- SIMULADOR: INVENTARIO EN ARCHIVOS (Módulo 1) ---------- */
function inicializarArchivosSim() {
  const changeBtn = document.getElementById('archChange');
  if (!changeBtn) return;

  const telCli1 = document.getElementById('telCli1');
  const telVent1 = document.getElementById('telVent1');
  const cardClientes = document.getElementById('archClientes');
  const cardVentas = document.getElementById('archVentas');
  const logEl = document.getElementById('archLog');

  let changed = false;

  const log = (cls, msg) => {
    const d = document.createElement('div');
    d.className = 'log-line';
    d.innerHTML = `<span class="t">[sistema]</span> <span class="${cls}">${msg}</span>`;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  };

  const reset = () => {
    changed = false;
    telCli1.textContent = '3156667788';
    telCli1.classList.remove('stale');
    telVent1.textContent = '3156667788';
    telVent1.classList.remove('stale');
    cardClientes.classList.remove('stale');
    cardClientes.classList.add('fresh');
    cardVentas.classList.remove('stale');
    cardVentas.classList.add('fresh');
    cardClientes.querySelector('.archivo-status').textContent = 'sin cambios';
    cardVentas.querySelector('.archivo-status').textContent = 'sin cambios';
    logEl.innerHTML = '<div class="log-line"><span class="t">[sistema]</span> 3 archivos cargados. El teléfono de María aparece en clientes.csv Y en ventas.csv (redundancia).</div>';
  };

  changeBtn.addEventListener('click', () => {
    if (changed) return;
    changed = true;

    // Solo clientes.csv se actualiza
    telCli1.textContent = '3120000000';
    cardClientes.classList.remove('fresh');
    cardClientes.classList.add('stale');
    cardClientes.querySelector('.archivo-status').textContent = 'actualizado';
    cardClientes.classList.remove('stale');
    cardClientes.classList.add('fresh');
    cardClientes.classList.add('flash');
    setTimeout(() => cardClientes.classList.remove('flash'), 500);

    // ventas.csv queda desactualizado
    telVent1.classList.add('stale');
    cardVentas.classList.remove('fresh');
    cardVentas.classList.add('stale');
    cardVentas.querySelector('.archivo-status').textContent = '⚠ desincronizado';

    log('ok', '✏️ clientes.csv actualizado: María → 3120000000');
    log('warn', '⚠️ ventas.csv NO se actualizó: sigue con el teléfono viejo. ¡Redundancia detectada!');
    addXP(5);
  });

  document.getElementById('archUpdateAll').addEventListener('click', () => {
    if (!changed) return;
    telVent1.textContent = '3120000000';
    telVent1.classList.remove('stale');
    cardVentas.classList.remove('stale');
    cardVentas.classList.add('fresh');
    cardVentas.querySelector('.archivo-status').textContent = 'actualizado';
    cardVentas.classList.add('flash');
    setTimeout(() => cardVentas.classList.remove('flash'), 500);
    log('ok', '🔄 ventas.csv actualizado. Ahora los 3 archivos coinciden.');
    addXP(5);
  });

  document.getElementById('archReset').addEventListener('click', reset);
}

/* ---------- INTERACTIVO: ANATOMÍA SGBD (Módulo 2) ---------- */
function inicializarSgbdAnatomy() {
  const layers = document.querySelectorAll('#sgbdDiagram .sgbd-layer');
  const detail = document.getElementById('sgbdDetail');
  if (!layers.length || !detail) return;

  const info = {
    motor: {
      title: '⚙️ Motor del SGBD',
      desc: 'El corazón: recibe las consultas (en SQL), las analiza, optimiza y ejecuta sobre los datos. Decide cómo buscar, qué índices usar y devuelve el resultado. Sin motor, no hay consultas.'
    },
    lenguaje: {
      title: '💬 Lenguaje (SQL)',
      desc: 'El lenguaje para hablar con el SGBD. SQL (Structured Query Language) es el estándar: SELECT para consultar, INSERT para añadir, UPDATE para cambiar, DELETE para borrar. Es lo que reemplaza a "abrir el archivo y buscar a mano".'
    },
    diccionario: {
      title: '📖 Diccionario de datos',
      desc: 'El catálogo interno: sabe qué tablas existen, qué columnas tienen, qué tipos de datos, qué relaciones hay. Es el "mapa" que el SGBD usa para entender la estructura. Un archivo CSV no tiene esto.'
    },
    transacciones: {
      title: '🔒 Gestor de transacciones',
      desc: 'Garantiza ACID: Atomicidad (todo o nada), Consistencia (reglas válidas), Aislamiento (transacciones no se pisan) y Durabilidad (no se pierde al apagar). Es lo que hace segura la banca electrónica.'
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

/* ---------- INTERACTIVO: MATCH ARCHIVO vs BD (Módulo 6) ---------- */
function inicializarMatchArchivoBd() {
  const grid = document.getElementById('matchGrid');
  const optsEl = document.getElementById('matchOptions');
  const fb = document.getElementById('matchFeedback');
  const instr = document.getElementById('matchInstr');
  if (!grid || !optsEl) return;

  const escenarios = [
    { id: 'e1', icon: '⚙️', name: 'Configuración de la app', so: 'archivo', answer: '📁 Archivo JSON' },
    { id: 'e2', icon: '📝', name: 'Lista de compras', so: 'archivo', answer: '📁 Archivo / Excel' },
    { id: 'e3', icon: '👥', name: 'Pacientes de una clínica', so: 'bd', answer: '🗄️ Base de datos' },
    { id: 'e4', icon: '🏦', name: 'Cuentas bancarias', so: 'bd', answer: '🗄️ Base de datos' },
    { id: 'e5', icon: '📦', name: 'Inventario de 50 productos', so: 'archivo', answer: '📁 Archivo / Excel' },
    { id: 'e6', icon: '🎬', name: 'Reproducciones de Netflix', so: 'bd', answer: '🗄️ Base de datos' },
    { id: 'e7', icon: '📄', name: 'Logs de un servidor', so: 'archivo', answer: '📁 Archivo (al inicio)' },
    { id: 'e8', icon: '🛒', name: 'Pedidos de Amazon', so: 'bd', answer: '🗄️ Base de datos' }
  ];
  const opciones = [
    { id: 'archivo', label: '📁 Archivo' },
    { id: 'bd', label: '🗄️ Base de datos' }
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
    if (instr) instr.textContent = selected ? `Escenario seleccionado. Toca Archivo o BD.` : 'Toca un escenario para seleccionarlo.';
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
            fb.textContent = '🏆 ¡Perfecto! 8/8 escenarios clasificados. Sabes cuándo usar archivo y cuándo BD.';
          }
        } else {
          const dev = grid.querySelector(`[data-eid="${selected}"]`);
          dev.style.borderColor = 'var(--rosa)';
          setTimeout(() => dev.style.borderColor = '', 600);
          fb.className = 'match-bd-feedback visible';
          fb.style.background = 'rgba(244, 63, 94, 0.12)';
          fb.style.color = 'var(--rosa)';
          fb.textContent = '❌ Ese enfoque no es el más adecuado. Piensa: ¿hay varios usuarios o integridad crítica?';
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
    background: 'linear-gradient(135deg, #f59e0b, #a855f7)',
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