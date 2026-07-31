/* ============================================================
   CLASE 4 — BASES DE DATOS (Modelo Entidad-Relación)
   Lógica de navegación, simuladores, quizzes, mermaid y taller
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
const XP_POR_MATCH = 25;
const XP_TOTAL = 390;   // 8 módulos×30 + 5 quizzes×25 + 1 match×25 = 390

const STORAGE_KEY = 'curso-bd-modelo-er';

document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarTrivia();
  inicializarCardSim();
  inicializarMatchTipos();
  inicializarMermaid();
  configurarTaller();
  configurarTeclado();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
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
    1: '📐 ER Modeler',
    2: '🔑 Key Master',
    3: '🔄 Transformador',
    4: '☕ Descansado',
    5: '🔢 Tipo Correcto',
    6: '✨ Mermaid Adepto',
    7: '🛠️ ER Master'
  };
  if (badgesModulo[n]) otorgarBadge(badgesModulo[n]);

  if (estado.completados.size === TOTAL_MODULOS) {
    otorgarBadge('🏆 Modelo ER Dominado');
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
    const labels = ['Inicio', 'Modelo ER', 'Claves', 'ER→Relacional', 'Descanso', 'Tipos de datos', 'Mermaid', 'Taller'];
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

/* ---------- COPIAR CÓDIGO ---------- */
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

  const correcta = opts[0].dataset.tcorrecta;

  opts.forEach(op => {
    op.addEventListener('click', () => {
      const elegida = op.dataset.top;
      opts.forEach(o => { o.disabled = true; if (o.dataset.top === correcta) o.classList.add('correcta'); });
      if (elegida === correcta) {
        result.className = 'trivia-result visible ok';
        result.textContent = '✅ ¡Correcto! En una relación 1:N la FK va siempre en la tabla del lado "N" (pedidos). La regla de oro.';
      } else {
        op.classList.add('incorrecta');
        result.className = 'trivia-result visible';
        result.style.background = 'rgba(244, 63, 94, 0.12)';
        result.style.color = 'var(--rosa)';
        result.textContent = '❌ Piensa: ¿quién es el "1" (padre) y quién el "N" (hijos)? La FK vive en el lado N.';
      }
    });
  });
}

/* ---------- SIMULADOR DE CARDINALIDAD (Módulo 3) ---------- */
function inicializarCardSim() {
  const exp = document.getElementById('cardExplicacion');
  const tablas = document.getElementById('cardTablas');
  const botones = document.querySelectorAll('.card-btn');
  if (!exp || !tablas || !botones.length) return;

  const escenarios = {
    '1-1': {
      texto: '<strong>1 : 1</strong> — Uno a uno. Cada fila de A se relaciona con exactamente una fila de B, y viceversa. <strong>No hay tabla puente</strong>: se fusiona en una sola tabla o se pone la PK de una como FK (con <code>UNIQUE</code>) en la otra.',
      tablas: [
        { head: 'A (tabla única)', rows: [['a_id', 'pk'], ['b_id', 'fk-unique'], ['...']] },
      ],
      mensaje: 'Ejemplo: Usuario↔Carnet. Una sola tabla o FK con UNIQUE.'
    },
    '1-N': {
      texto: '<strong>1 : N</strong> — Uno a muchos. La <strong>FK vive en la tabla del lado N</strong>. No se crea tabla puente. Es la cardinalidad más común.',
      tablas: [
        { head: 'A (lado 1)', rows: [['a_id', 'pk'], ['...']] },
        { head: 'B (lado N) — ¡lleva la FK!', rows: [['b_id', 'pk'], ['a_id', 'fk'], ['...']] },
      ],
      mensaje: 'Ejemplo: Cliente 1:N Pedido. cliente_id va en pedidos.'
    },
    'N-M': {
      texto: '<strong>N : M</strong> — Muchos a muchos. Se <strong>crea una tabla puente</strong> con PK compuesta (las dos PK de las entidades). Los atributos de la relación van en la puente.',
      tablas: [
        { head: 'A', rows: [['a_id', 'pk'], ['...']] },
        { head: 'B', rows: [['b_id', 'pk'], ['...']] },
        { head: 'A_B (puente)', rows: [['a_id', 'fk'], ['b_id', 'fk'], ['PK (a_id,b_id)']] },
      ],
      mensaje: 'Ejemplo: Estudiante N:M Curso → tabla estudiante_curso.'
    }
  };

  function render(clave) {
    const e = escenarios[clave];
    if (!e) return;
    exp.innerHTML = e.texto;
    tablas.innerHTML = '';
    e.tablas.forEach(t => {
      const div = document.createElement('div');
      div.className = 'card-tabla-mock';
      const head = document.createElement('div');
      head.className = 'tm-head';
      head.textContent = t.head;
      div.appendChild(head);
      t.rows.forEach(r => {
        const row = document.createElement('div');
        row.className = 'tm-row';
        if (r[1] === 'pk') row.innerHTML = `<span class="tm-pk">${r[0]}</span> PK`;
        else if (r[1] === 'fk') row.innerHTML = `<span class="tm-fk">${r[0]}</span> FK → A(a_id)`;
        else if (r[1] === 'fk-unique') row.innerHTML = `<span class="tm-fk">${r[0]}</span> FK UNIQUE → B`;
        else row.innerHTML = `<span>${r[0]}</span>`;
        div.appendChild(row);
      });
      tablas.appendChild(div);
    });
    const msg = document.createElement('div');
    msg.style.cssText = 'grid-column:1/-1;color:var(--lima-claro);font-size:0.85rem;font-weight:700;margin-top:0.5rem;';
    msg.textContent = e.mensaje;
    tablas.appendChild(msg);
  }

  botones.forEach(btn => {
    btn.addEventListener('click', () => {
      botones.forEach(b => b.classList.remove('activa'));
      btn.classList.add('activa');
      render(btn.dataset.card);
    });
  });

  render('1-1');
}

/* ---------- MATCH DE TIPOS DE DATOS (Módulo 5) ---------- */
function inicializarMatchTipos() {
  const grid = document.getElementById('matchTiposGrid');
  const optsCont = document.getElementById('matchTiposOpts');
  const fb = document.getElementById('matchTiposFeedback');
  if (!grid || !optsCont) return;

  const columnas = [
    { id: 'edad',      campo: 'edad',      pista: 'Edad de un estudiante',           tipo: 'INTEGER' },
    { id: 'precio',    campo: 'precio',    pista: 'Precio de un libro',              tipo: 'DECIMAL(10,2)' },
    { id: 'titulo',    campo: 'titulo',    pista: 'Título de un libro',               tipo: 'VARCHAR(200)' },
    { id: 'fecha',     campo: 'fecha',     pista: 'Fecha de un préstamo',            tipo: 'DATE' },
    { id: 'activo',    campo: 'activo',    pista: '¿El usuario está activo?',        tipo: 'BOOLEAN' },
    { id: 'sinopsis',  campo: 'sinopsis',  pista: 'Descripción larga del libro',      tipo: 'TEXT' },
    { id: 'correo',    campo: 'correo',    pista: 'Correo del usuario',              tipo: 'VARCHAR(150)' },
    { id: 'hora',      campo: 'hora',      pista: 'Momento exacto de un evento',     tipo: 'TIMESTAMP' }
  ];

  const tipos = [...new Set(columnas.map(c => c.tipo))];
  let selected = null;

  // Restaurar estado si el match ya fue completado en sesiones previas
  const completadoPrevio = estado.completados.has(5);
  if (completadoPrevio) columnas.forEach(c => c.matched = true);
  let aciertos = columnas.filter(c => c.matched).length;

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderGrid() {
    grid.innerHTML = '';
    columnas.forEach(c => {
      const div = document.createElement('div');
      div.className = 'match-columna';
      if (c.matched) div.classList.add('matched');
      div.dataset.cid = c.id;
      div.innerHTML = `
        <div class="mc-campo">${c.campo}</div>
        <div class="mc-pista">${c.pista}</div>
        ${c.matched ? `<span class="mc-tipo">${c.tipo} ✓</span>` : ''}
      `;
      div.addEventListener('click', () => {
        if (c.matched) return;
        grid.querySelectorAll('.match-columna').forEach(m => m.classList.remove('selected'));
        div.classList.add('selected');
        selected = c.id;
      });
      grid.appendChild(div);
    });
  }

  function renderOpts() {
    optsCont.innerHTML = '';
    tipos.forEach(t => {
      const usado = columnas.find(c => c.tipo === t && c.matched);
      const btn = document.createElement('button');
      btn.className = 'match-tipos-opt';
      btn.textContent = t;
      if (usado) btn.classList.add('used');
      btn.addEventListener('click', () => {
        if (!selected || usado) return;
        const col = columnas.find(c => c.id === selected);
        if (col.tipo === t) {
          col.matched = true;
          aciertos++;
          if (aciertos === columnas.length) {
            fb.className = 'match-tipos-feedback visible ok';
            fb.textContent = '🏆 ¡Perfecto! 8/8 columnas emparejadas. Sabes elegir el tipo correcto por dominio.';
            fb.style.removeProperty('background');
            fb.style.removeProperty('color');
            addXP(XP_POR_MATCH);
            if (!estado.completados.has(5)) marcarCompletado(5);
          } else {
            fb.className = 'match-tipos-feedback visible ok';
            fb.style.removeProperty('background');
            fb.style.removeProperty('color');
            fb.textContent = `✅ ${col.campo} → ${t}  (${aciertos}/${columnas.length})`;
            setTimeout(() => fb.classList.remove('visible'), 1500);
          }
        } else {
          fb.className = 'match-tipos-feedback visible';
          fb.style.background = 'rgba(244, 63, 94, 0.12)';
          fb.style.color = 'var(--rosa)';
          fb.textContent = `❌ ${col.campo} no es ${t}. Piensa en el dominio del dato.`;
          setTimeout(() => fb.classList.remove('visible'), 1500);
        }
        selected = null;
        renderGrid();
        renderOpts();
      });
      optsCont.appendChild(btn);
    });
  }

  renderGrid();
  renderOpts();
}

/* ---------- CONSTRUCTOR MERMAID (Módulo 6) ---------- */
function inicializarMermaid() {
  const editor = document.getElementById('mermaidEditor');
  const preview = document.getElementById('mermaidPreview');
  const renderBtn = document.getElementById('mermaidRender');
  const chips = document.querySelectorAll('.mermaid-chip');
  if (!editor || !preview) return;

  if (window.mermaid) {
    try { window.mermaid.initialize({ startOnLoad: false, theme: 'dark', securityLevel: 'loose' }); }
    catch (e) {}
  }

  let renderId = 0;

  function renderMermaid() {
    if (!window.mermaid) {
      preview.innerHTML = '<div class="mermaid-err">⚠️ Mermaid no se cargó (revisa tu conexión).</div>';
      return;
    }
    const code = editor.value.trim();
    if (!code) {
      preview.innerHTML = '<div class="mermaid-err">Ecribe código Mermaid en el cuadro izquierdo.</div>';
      return;
    }
    const id = 'mmd-' + (renderId++);
    try {
      window.mermaid.render(id, code).then(({ svg }) => {
        preview.innerHTML = svg;
      }).catch(err => {
        preview.innerHTML = `<div class="mermaid-err">⚠️ Error de sintaxis:\n${err.message || err.str || String(err)}</div>`;
      });
    } catch (err) {
      preview.innerHTML = `<div class="mermaid-err">⚠️ Error: ${err.message || String(err)}</div>`;
    }
  }

  if (renderBtn) renderBtn.addEventListener('click', renderMermaid);

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      const snippet = chip.dataset.snippet.replace(/&#10;/g, '\n');
      const start = editor.selectionStart;
      const end = editor.selectionEnd;
      editor.value = editor.value.slice(0, start) + snippet + editor.value.slice(end);
      editor.selectionStart = editor.selectionEnd = start + snippet.length;
      editor.focus();
    });
  });

  // Render inicial tras un breve retardo para asegurar que mermaid cargó
  setTimeout(renderMermaid, 300);
}

/* ---------- TALLER (soluciones plegables) ---------- */
function configurarTaller() {
  document.querySelectorAll('.taller-sol-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.sol;
      const sol = document.getElementById(id);
      if (!sol) return;
      const visible = sol.classList.toggle('visible');
      btn.textContent = visible ? '🙈 Ocultar solución' : '👁️ Ver solución';
      if (visible && !estado.talleres[id]) {
        estado.talleres[id] = true;
        guardarProgreso();
      }
      if (visible && Object.keys(estado.talleres).length >= 5 && !estado.completados.has(7)) {
        marcarCompletado(7);
      }
    });
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
    background: 'linear-gradient(135deg, #ec4899, #06b6d4)',
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