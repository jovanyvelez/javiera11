/* ============================================================
   CURSO PROTOTIPADO Y USABILIDAD — CLASE 7 — LÓGICA INTERACTIVA
   Tema: "La interfaz cobra vida" — teal + magenta
============================================================ */

const TOTAL_MODULOS = 8;

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
  configurarTallerPapel();
  configurarDemoDigital();
  configurarPrototipoApp();
  configurarLaboratorio();
  configurarFeria();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    localStorage.setItem('curso-prototipado-usabilidad', JSON.stringify({
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      badges: [...estado.badges]
    }));
  } catch (e) {}
}

function cargarProgreso() {
  try {
    const d = JSON.parse(localStorage.getItem('curso-prototipado-usabilidad'));
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
  if (n === 1) otorgarBadge('🧭 Cartógrafo Digital');
  if (n === 2) otorgarBadge('✂️ Arquitecto de Papel');
  if (n === 3) otorgarBadge('🛠️ Explorador de Herramientas');
  if (n === 4) otorgarBadge('📱 Creador de Prototipos');
  if (n === 5) otorgarBadge('🗣️ Escucha Activa');
  if (n === 6) otorgarBadge('🎪 Anfitrión de Feria');

  if (estado.completados.size === TOTAL_MODULOS - 1) {
    otorgarBadge('🏆 Maestro del Prototipado');
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
   ✂️ TALLER DE PAPEL — MÓDULO 2
   4 tarjetas-pantalla que el estudiante etiqueta
============================================================ */
function configurarTallerPapel() {
  const cont = document.getElementById('taller-papel');
  if (!cont) return;

  const pantallas = [
    { id: 'p1', titulo: 'Pantalla 1', placeholder: '¿Qué ve el usuario primero?' },
    { id: 'p2', titulo: 'Pantalla 2', placeholder: '¿A dónde va con un clic?' },
    { id: 'p3', titulo: 'Pantalla 3', placeholder: '¿Qué decisión importante se toma aquí?' },
    { id: 'p4', titulo: 'Pantalla 4', placeholder: '¿Qué confirma o agradece al final?' }
  ];

  const OPCIONES = ['', '🏠 Inicio', '🔍 Buscar', '📋 Detalle', '👤 Perfil', '✅ Confirmar', '❌ Error', '💬 Chat'];

  cont.innerHTML = `
    <p class="taller-intro">Tienes <strong>4 tarjetas en blanco</strong>. Ponle a cada una un nombre de pantalla y describe brevemente qué contendría. (Si tienes papel a la mano, dibújalo mientras piensas).</p>
    <div class="taller-grid">
      ${pantallas.map(p => `
        <div class="plantilla-tarjeta" data-pantalla="${p.id}">
          <div class="pt-header">
            <span class="pt-num">${p.id.toUpperCase()}</span>
            <h4>${p.titulo}</h4>
          </div>
          <select class="pt-rol" data-campo="rol">
            ${OPCIONES.map(o => `<option value="${o}">${o || '— Elige un rol —'}</option>`).join('')}
          </select>
          <textarea class="pt-desc" data-campo="desc" rows="3" placeholder="${p.placeholder}"></textarea>
        </div>
      `).join('')}
    </div>
    <div class="taller-acciones">
      <button class="btn-taller" id="btn-taller-listo">✂️ Listo, validé mi prototipo en papel</button>
      <p class="taller-feedback" id="taller-feedback"></p>
    </div>
  `;

  const btn = document.getElementById('btn-taller-listo');
  const fb = document.getElementById('taller-feedback');

  btn.addEventListener('click', () => {
    const tarjetas = cont.querySelectorAll('.plantilla-tarjeta');
    let llenas = 0;
    tarjetas.forEach(t => {
      const rol = t.querySelector('[data-campo="rol"]').value;
      const desc = t.querySelector('[data-campo="desc"]').value.trim();
      t.classList.toggle('completa', rol && desc.length > 5);
      if (rol && desc.length > 5) llenas++;
    });

    if (llenas >= 3) {
      fb.textContent = `✅ ${llenas}/4 pantallas con rol + idea clara. ¡Prototipo en papel listo!`;
      fb.className = 'taller-feedback ok';
      if (!estado.badges.has('🖐️ Tocador de Papel')) {
        setTimeout(() => otorgarBadge('🖐️ Tocador de Papel'), 300);
      }
    } else if (llenas >= 1) {
      fb.textContent = `👀 ${llenas}/4 pantallas listas. Necesitas al menos 3 con rol + descripción.`;
      fb.className = 'taller-feedback warn';
    } else {
      fb.textContent = `🖐️ Empieza eligiendo un rol para la primera pantalla.`;
      fb.className = 'taller-feedback warn';
    }
  });
}

/* ============================================================
   🛠️ DEMO DIGITAL — MÓDULO 3
   3 pasos animados: Excalidraw → Figma → Marvel
============================================================ */
function configurarDemoDigital() {
  const cont = document.getElementById('demo-digital');
  if (!cont) return;

  const pasos = [
    {
      num: 1,
      emoji: '✏️',
      titulo: 'Excalidraw',
      tiempo: '15 min',
      desc: 'Dibuja en una pizarra colaborativa. Conectas cajitas con flechas y ya tienes un mapa navegable.',
      tip: 'Ideal para lluvia de ideas con tu equipo. Gratis, sin login.'
    },
    {
      num: 2,
      emoji: '🎨',
      titulo: 'Figma (cuenta estudiante)',
      tiempo: '30-45 min',
      desc: 'Creas Frames (cada uno es una pantalla), y los "Prototype" con líneas que simulan clics. Queda casi como app real.',
      tip: 'Figma es gratis con tu correo del colegio.'
    },
    {
      num: 3,
      emoji: '🚀',
      titulo: 'Marvel / Proto.io',
      tiempo: '20 min',
      desc: 'Subes capturas de tus pantallas y conectas hotspots. Generan un link compartible para probar desde el celular.',
      tip: 'Útil para mostrarle a tu cliente o profesor sin instalar nada.'
    }
  ];

  cont.innerHTML = `
    <div class="demo-pantalla" id="demo-pantalla">
      ${pasos.map((p, i) => `
        <div class="demo-paso${i === 0 ? ' activo' : ''}" data-paso="${p.num}">
          <div class="demo-emoji">${p.emoji}</div>
          <h4>${p.titulo}</h4>
          <span class="demo-tiempo">⏱️ ${p.tiempo}</span>
          <p>${p.desc}</p>
          <p class="demo-tip">💡 <em>${p.tip}</em></p>
        </div>
      `).join('')}
    </div>
    <div class="demo-controles">
      <button class="btn-demo" id="btn-demo-prev" disabled>← Anterior</button>
      <span class="demo-contador"><span id="demo-pos">1</span> / 3</span>
      <button class="btn-demo" id="btn-demo-next">Siguiente →</button>
    </div>
  `;

  const pasosEls = cont.querySelectorAll('.demo-paso');
  const posEl = document.getElementById('demo-pos');
  const prev = document.getElementById('btn-demo-prev');
  const next = document.getElementById('btn-demo-next');
  let pos = 0;

  function render() {
    pasosEls.forEach((el, i) => el.classList.toggle('activo', i === pos));
    posEl.textContent = pos + 1;
    prev.disabled = pos === 0;
    next.disabled = pos === pasos.length - 1;
    next.textContent = pos === pasos.length - 1 ? '✓ Listo' : 'Siguiente →';
  }

  prev.addEventListener('click', () => { if (pos > 0) { pos--; render(); } });
  next.addEventListener('click', () => {
    if (pos < pasos.length - 1) { pos++; render(); }
  });

  render();
}

/* ============================================================
   📱 PROTOTIPO APP — MÓDULO 4
   Click en zonas navega entre 5 pantallas. Pantalla 4 da insignia.
============================================================ */
function configurarPrototipoApp() {
  const proto = document.getElementById('proto-app');
  if (!proto) return;

  proto.addEventListener('click', (e) => {
    const target = e.target.closest('[data-ir]');
    if (!target) return;
    const dest = target.dataset.ir;
    proto.querySelectorAll('.proto-screen').forEach(s => s.classList.remove('activo'));
    const nueva = proto.querySelector(`.proto-screen[data-pantalla="${dest}"]`);
    if (nueva) nueva.classList.add('activo');

    proto.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (dest === '4' && !estado.badges.has('🔗 Conector de Pantallas')) {
      setTimeout(() => otorgarBadge('🔗 Conector de Pantallas'), 200);
    }
  });
}

/* ============================================================
   🕵️ LABORATORIO DE USABILIDAD — MÓDULO 6 (bloque 1)
   A/B role toggle + 3 tareas + lista de hallazgos
============================================================ */
function configurarLaboratorio() {
  const lab = document.getElementById('laboratorio');
  if (!lab) return;

  const tareas = [
    '🎯 Tarea 1: "Encuentra el horario de tu día favorito en la biblioteca"',
    '🎯 Tarea 2: "Pide prestado un libro de matemáticas"',
    '🎯 Tarea 3: "Cambia tu contraseña"'
  ];

  const hallazgos = [];

  function renderHallazgos() {
    const grid = lab.querySelector('#hallazgos-grid');
    if (!grid) return;
    if (hallazgos.length === 0) {
      grid.innerHTML = '<p class="hallazgo-vacio">📝 Aún no hay hallazgos. Cuando el usuario se trabe, anota qué pasó.</p>';
    } else {
      grid.innerHTML = hallazgos.map((h, i) => `
        <div class="hallazgo-item" data-estado="${h.estado}">
          <span class="hallazgo-num">#${i + 1}</span>
          <span class="hallazgo-tarea">${h.tarea}</span>
          <span class="hallazgo-estado">${h.estadoEmoji} ${h.estado}</span>
          <p class="hallazgo-nota">"${h.nota}"</p>
        </div>
      `).join('');
    }
    const cnt = lab.querySelector('#hallazgos-count');
    if (cnt) cnt.textContent = hallazgos.length;
  }

  function timer(segundos, displayEl, onFin) {
    let t = segundos;
    displayEl.textContent = Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2);
    const i = setInterval(() => {
      t--;
      displayEl.textContent = Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2);
      if (t <= 0) {
        clearInterval(i);
        displayEl.textContent = '⏰ 0:00';
        if (onFin) onFin();
      }
    }, 1000);
    return () => clearInterval(i);
  }

  lab.innerHTML = `
    <div class="lab-rol" data-rol="A">
      <h4>🎭 Roles (alternen en cada ronda de 8 min)</h4>
      <div class="lab-roles-botones">
        <button class="rol-toggle activo" data-rol="A">🅰️ Diseñador (observa)</button>
        <button class="rol-toggle" data-rol="B">🅱️ Usuario (piensa en voz alta)</button>
      </div>
    </div>

    <div class="lab-timer-cont">
      <h4>⏱️ Cronómetro (8 min por ronda)</h4>
      <div class="lab-timer-display" id="lab-timer">8:00</div>
      <div class="lab-timer-controles">
        <button class="btn-timer" id="btn-timer-start">▶ Empezar</button>
        <button class="btn-timer" id="btn-timer-reset">↺ Reiniciar</button>
      </div>
    </div>

    <div class="lab-tareas">
      <h4>📋 Tareas para el usuario</h4>
      <ol>
        ${tareas.map(t => `<li>${t}</li>`).join('')}
      </ol>
    </div>

    <div class="lab-hallazgos">
      <h4>📝 Hallazgos (<span id="hallazgos-count">0</span>)</h4>
      <div class="hallazgos-grid" id="hallazgos-grid"></div>
      <div class="hallazgo-form">
        <select class="hallazgo-tarea-sel">
          <option value="">— Tarea observada —</option>
          ${tareas.map((_, i) => `<option value="${i}">Tarea ${i + 1}</option>`).join('')}
        </select>
        <select class="hallazgo-estado-sel">
          <option value="">— Tipo de hallazgo —</option>
          <option value="confusión">😕 Confusión</option>
          <option value="éxito">✅ Éxito</option>
          <option value="error">❌ Error / bug</option>
          <option value="sugerencia">💡 Sugerencia</option>
        </select>
        <input type="text" class="hallazgo-nota-in" placeholder="Describe brevemente qué pasó (mín. 10 letras)…" />
        <button class="btn-hallazgo" id="btn-hallazgo-add">+ Anotar hallazgo</button>
      </div>
      <p class="lab-feedback" id="lab-feedback"></p>
    </div>
  `;

  // Roles
  lab.querySelectorAll('.rol-toggle').forEach(b => {
    b.addEventListener('click', () => {
      lab.querySelectorAll('.rol-toggle').forEach(x => x.classList.remove('activo'));
      b.classList.add('activo');
      lab.querySelector('.lab-rol').dataset.rol = b.dataset.rol;
    });
  });

  // Timer
  const display = lab.querySelector('#lab-timer');
  let stop = null;
  lab.querySelector('#btn-timer-start').addEventListener('click', (e) => {
    if (stop) {
      stop();
      stop = null;
      e.target.textContent = '▶ Empezar';
    } else {
      stop = timer(8 * 60, display, () => {
        mostrarToast('⏰ Tiempo. Rotar roles.');
        e.target.textContent = '▶ Empezar';
      });
      e.target.textContent = '⏸ Pausar';
    }
  });
  lab.querySelector('#btn-timer-reset').addEventListener('click', () => {
    if (stop) { stop(); stop = null; }
    display.textContent = '8:00';
    lab.querySelector('#btn-timer-start').textContent = '▶ Empezar';
  });

  // Hallazgos
  const fb = lab.querySelector('#lab-feedback');
  lab.querySelector('#btn-hallazgo-add').addEventListener('click', () => {
    const tareaSel = lab.querySelector('.hallazgo-tarea-sel');
    const estadoSel = lab.querySelector('.hallazgo-estado-sel');
    const notaIn = lab.querySelector('.hallazgo-nota-in');
    const tareaIdx = tareaSel.value;
    const estado = estadoSel.value;
    const nota = notaIn.value.trim();

    if (!tareaIdx) { fb.textContent = '🎯 Elige la tarea observada.'; fb.className = 'lab-feedback warn'; return; }
    if (!estado) { fb.textContent = '🏷️ Elige el tipo de hallazgo.'; fb.className = 'lab-feedback warn'; return; }
    if (nota.length < 10) { fb.textContent = '✏️ La nota es muy corta (mín. 10 letras).'; fb.className = 'lab-feedback warn'; return; }

    hallazgos.push({
      tarea: tareas[parseInt(tareaIdx, 10)],
      estado: estado,
      estadoEmoji: estadoSel.options[estadoSel.selectedIndex].text.split(' ')[0],
      nota: nota
    });
    renderHallazgos();

    tareaSel.value = '';
    estadoSel.value = '';
    notaIn.value = '';

    if (hallazgos.length >= 3 && !estado.badges.has('🕵️ Detective de Usabilidad')) {
      fb.textContent = `🎉 ¡${hallazgos.length} hallazgos! Detective de Usabilidad.`;
      fb.className = 'lab-feedback ok';
      setTimeout(() => otorgarBadge('🕵️ Detective de Usabilidad'), 300);
    } else {
      fb.textContent = `📝 Hallazgo #${hallazgos.length} anotado.`;
      fb.className = 'lab-feedback ok';
    }
  });

  renderHallazgos();
}

/* ============================================================
   🎪 FERIA DE EXPOSICIÓN — MÓDULO 6 (bloque 2)
   4 estaciones. Dar + recibir feedback para insignia.
============================================================ */
function configurarFeria() {
  const feria = document.getElementById('feria');
  if (!feria) return;

  const estaciones = [
    { id: 1, equipo: 'Equipo A', emoji: '📚', tema: 'App de la biblioteca' },
    { id: 2, equipo: 'Equipo B', emoji: '🍽️', tema: 'Cafetería del colegio' },
    { id: 3, equipo: 'Equipo C', emoji: '🚲', tema: 'Bicicletas compartidas' },
    { id: 4, equipo: 'Equipo D', emoji: '🎵', tema: 'Música en el salón' }
  ];

  let dados = 0;
  let recibidos = 0;

  function render() {
    const cont = feria.querySelector('#feria-estaciones');
    cont.innerHTML = estaciones.map(e => `
      <div class="feria-estacion" data-estacion="${e.id}">
        <div class="fe-emoji">${e.emoji}</div>
        <h4>${e.equipo}</h4>
        <p class="fe-tema">${e.tema}</p>
        <div class="fe-acciones">
          <button class="btn-fe-dar" data-accion="dar" data-id="${e.id}">💬 Dar feedback</button>
          <button class="btn-fe-recibir" data-accion="recibir" data-id="${e.id}">📥 Recibir feedback</button>
        </div>
        <p class="fe-feedback" id="fe-feedback-${e.id}"></p>
      </div>
    `).join('');

    const cnt = feria.querySelector('#feria-count');
    cnt.textContent = `${dados} dados · ${recibidos} recibidos`;
  }

  feria.innerHTML = `
    <h3>🎪 Recorre 4 estaciones (5 min por equipo)</h3>
    <p class="feria-contador" id="feria-count">0 dados · 0 recibidos</p>
    <div class="feria-grid" id="feria-estaciones"></div>
    <p class="feria-feedback" id="feria-feedback-final"></p>
  `;

  render();

  feria.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-accion]');
    if (!btn) return;
    const id = btn.dataset.id;
    const accion = btn.dataset.accion;
    const fb = feria.querySelector(`#fe-feedback-${id}`);

    if (accion === 'dar') {
      const tipo = prompt('¿Qué tipo de feedback das?\n★ = Lo que me gustó\n⚠ = Lo que cambiaría\n💡 = Lo que agregaría\n\nEscribe ★, ⚠ o 💡:');
      if (tipo !== '★' && tipo !== '⚠' && tipo !== '💡') {
        fb.textContent = '👀 Escribe exactamente ★, ⚠ o 💡.';
        return;
      }
      const msg = prompt('Tu feedback en una frase:');
      if (!msg) return;
      const iconos = { '★': '🌟', '⚠': '🛠️', '💡': '💡' };
      fb.innerHTML = `<span class="fe-ok">${iconos[tipo]} Dado:</span> "${msg}"`;
      fb.className = 'fe-feedback ok';
      dados++;
    } else {
      const msg = prompt('¿Qué feedback recibiste? (en una frase)');
      if (!msg) return;
      fb.innerHTML = `<span class="fe-ok">📥 Recibido:</span> "${msg}"`;
      fb.className = 'fe-feedback ok';
      recibidos++;
    }

    const cnt = feria.querySelector('#feria-count');
    cnt.textContent = `${dados} dados · ${recibidos} recibidos`;

    const final = feria.querySelector('#feria-feedback-final');
    if (dados >= 1 && recibidos >= 1 && !estado.badges.has('🤝 Crítico Constructivo')) {
      final.textContent = '🤝 ¡Crítico Constructivo! Diste y recibiste feedback.';
      final.className = 'feria-feedback ok';
      setTimeout(() => otorgarBadge('🤝 Crítico Constructivo'), 300);
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
    background: 'linear-gradient(135deg, #0d9488, #ec4899)',
    color: '#042f2e',
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
