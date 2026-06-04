/* ============================================================
   CLASE 11 — ARREGLOS EN C# · LÓGICA INTERACTIVA
============================================================ */

const TOTAL_MODULOS = 9; // 0..8 (módulo 8 es el cierre)

/* ---------- ESTADO DEL CURSO ---------- */
const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},          // {idQuiz: {aciertos, total}}
  badges: new Set()
};

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarQuizzes();
  configurarSimuladorArreglo();
  resaltarCodigo();
  actualizarUI();
});

/* ---------- PERSISTENCIA (localStorage) ---------- */
function guardarProgreso() {
  try {
    const datos = {
      moduloActual: estado.moduloActual,
      completados:  [...estado.completados],
      quizzes:      estado.quizzes,
      badges:       [...estado.badges]
    };
    localStorage.setItem('curso-csharp-arreglos-11', JSON.stringify(datos));
  } catch (e) { /* sin storage, no pasa nada */ }
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem('curso-csharp-arreglos-11'));
    if (!datos) return;
    estado.moduloActual = datos.moduloActual || 0;
    estado.completados  = new Set(datos.completados || []);
    estado.quizzes      = datos.quizzes || {};
    estado.badges       = new Set(datos.badges || []);
  } catch (e) { /* ignorar */ }
}

/* ---------- NAVEGACIÓN ENTRE MÓDULOS ---------- */
function configurarNavegacion() {
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.modulo, 10);
      irAModulo(m);
    });
  });
}

function configurarBotonesInternos() {
  document.querySelectorAll('.btn-anterior, .btn-siguiente').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.ir, 10);
      if (btn.classList.contains('btn-siguiente')) {
        marcarCompletado(estado.moduloActual);
      }
      irAModulo(m);
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

/* ---------- MARCAR COMPLETADOS ---------- */
function marcarCompletado(n) {
  if (estado.completados.has(n)) return;
  estado.completados.add(n);

  // Insignias por hito
  if (n === 0)  otorgarBadge('🚀 Iniciado');
  if (n === 1)  otorgarBadge('🤔 Curioso');
  if (n === 2)  otorgarBadge('🏗️ Constructor');
  if (n === 3)  otorgarBadge('🧭 Piloto de Índices');
  if (n === 4)  otorgarBadge('🔁 Maestro del for');
  if (n === 5)  otorgarBadge('🔂 Explorador foreach');
  if (n === 6)  otorgarBadge('🧪 Tallerista');
  if (n === 7)  otorgarBadge('📊 Estadístico');

  if (estado.completados.size === TOTAL_MODULOS - 1) {
    otorgarBadge('🏆 Campeón de Arreglos');
  }

  guardarProgreso();
}

function otorgarBadge(nombre) {
  if (estado.badges.has(nombre)) return;
  estado.badges.add(nombre);
  mostrarToast(`🎉 ¡Insignia desbloqueada: ${nombre}!`);
  actualizarUI();
}

/* ---------- ACTUALIZAR UI ---------- */
function actualizarUI() {
  // Porcentaje y barra (módulos 1..7 completados = 100%)
  const total = TOTAL_MODULOS - 1;
  const completos = [...estado.completados].filter(x => x >= 1 && x <= total).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) mAct.textContent = 'Módulo ' + estado.moduloActual;

  // Badges del header
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

  // Marcar botones de módulos completados
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
  preguntas.forEach(p => {
    if (p.dataset.acierto === 'true') aciertos++;
  });

  const total = preguntas.length;
  estado.quizzes[idQuiz] = { aciertos, total };

  const res = quiz.querySelector('.resultado-quiz');
  if (res) {
    res.classList.add('visible');
    if (aciertos === total) {
      res.classList.add('exito');
      res.textContent = `🎉 ¡Perfecto! ${aciertos}/${total}. Eres un crack 💪`;
      if (idQuiz === 'final') {
        otorgarBadge('🏅 Quiz Final Perfecto');
      } else {
        otorgarBadge(`✨ Quiz ${idQuiz} Perfecto`);
      }
    } else if (aciertos >= total / 2) {
      res.classList.add('parcial');
      res.textContent = `👍 ${aciertos}/${total} correctas. ¡Buen intento! Revisa lo que fallaste.`;
    } else {
      res.classList.add('parcial');
      res.textContent = `🤔 ${aciertos}/${total}. Te invitamos a releer el módulo y volver a intentar.`;
    }
  }

  guardarProgreso();
}

/* ---------- SIMULADOR DE ARREGLO (Módulo 3) ---------- */
function configurarSimuladorArreglo() {
  const grid = document.getElementById('arreglo-grid');
  if (!grid) return;

  const TAM = 5;  // int[] datos = new int[5];
  const datos = new Array(TAM).fill(0);

  // Construimos las 5 celdas visuales
  for (let i = 0; i < TAM; i++) {
    const celda = document.createElement('div');
    celda.className = 'celda-interactiva';
    celda.dataset.idx = i;
    celda.innerHTML = `
      <div class="celda-indice">${i}</div>
      <div class="celda-valor">${datos[i]}</div>
    `;
    // Click en la celda = seleccionar para escribir
    celda.addEventListener('click', () => {
      document.querySelectorAll('.celda-interactiva').forEach(c => c.classList.remove('highlight'));
      celda.classList.add('highlight');
      document.getElementById('idx-escribir').value = i;
      escribirConsola(`Seleccioaste el cajón ${i}. Escribe un valor y presiona "Asignar".`, 'ok');
    });
    grid.appendChild(celda);
  }

  const idxEscribir = document.getElementById('idx-escribir');
  const valEscribir = document.getElementById('val-escribir');
  const btnEscribir = document.getElementById('btn-escribir');
  const idxLeer     = document.getElementById('idx-leer');
  const btnLeer     = document.getElementById('btn-leer');

  // Función auxiliar para pintar las celdas
  function pintar() {
    const celdas = grid.querySelectorAll('.celda-interactiva');
    celdas.forEach((c, i) => {
      c.querySelector('.celda-valor').textContent = datos[i];
    });
  }

  function escribirConsola(texto, tipo) {
    const msj = document.querySelector('#consola-arreglo .msj');
    if (!msj) return;
    msj.textContent = texto;
    msj.className = 'msj' + (tipo ? ' ' + tipo : '');
  }

  // Acción: ASIGNAR valor
  btnEscribir.addEventListener('click', () => {
    const idx = parseInt(idxEscribir.value, 10);
    const val = parseInt(valEscribir.value, 10);

    if (isNaN(idx)) {
      escribirConsola('⚠️ El índice no es un número válido.', 'error');
      return;
    }
    if (isNaN(val)) {
      escribirConsola('⚠️ El valor no es un número válido.', 'error');
      return;
    }
    if (idx < 0 || idx >= TAM) {
      escribirConsola(
        `💥 IndexOutOfRangeException: el cajón datos[${idx}] no existe. ` +
        `Los índices válidos son 0 a ${TAM - 1}.`,
        'error'
      );
      // Animar "shake" en todas las celdas (visual feedback)
      grid.querySelectorAll('.celda-interactiva').forEach(c => {
        c.classList.add('error');
        setTimeout(() => c.classList.remove('error'), 600);
      });
      return;
    }

    datos[idx] = val;
    pintar();
    escribirConsola(`✅ datos[${idx}] = ${val}  →  cajón ${idx} ahora vale ${val}.`, 'ok');

    // Resaltar la celda que se acaba de modificar
    grid.querySelectorAll('.celda-interactiva').forEach(c => c.classList.remove('highlight'));
    grid.children[idx].classList.add('highlight');
  });

  // Acción: LEER valor
  btnLeer.addEventListener('click', () => {
    const idx = parseInt(idxLeer.value, 10);

    if (isNaN(idx)) {
      escribirConsola('⚠️ El índice no es un número válido.', 'error');
      return;
    }
    if (idx < 0 || idx >= TAM) {
      escribirConsola(
        `💥 IndexOutOfRangeException: el cajón datos[${idx}] no existe. ` +
        `El arreglo tiene ${TAM} cajones (índices 0 a ${TAM - 1}).`,
        'error'
      );
      grid.querySelectorAll('.celda-interactiva').forEach(c => {
        c.classList.add('error');
        setTimeout(() => c.classList.remove('error'), 600);
      });
      return;
    }

    const valor = datos[idx];
    escribirConsola(`📖 datos[${idx}] = ${valor}  →  el cajón ${idx} vale ${valor}.`, 'ok');

    grid.querySelectorAll('.celda-interactiva').forEach(c => c.classList.remove('highlight'));
    grid.children[idx].classList.add('highlight');
  });
}

/* ---------- MOSTRAR / OCULTAR SOLUCIONES ---------- */
function toggleSolucion(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('visible');
}

/* ---------- REINICIAR CURSO ---------- */
function reiniciarCurso() {
  if (!confirm('¿Quieres volver al inicio? Tu progreso se conserva en el navegador.')) return;
  irAModulo(0);
}

/* ---------- TOAST DE NOTIFICACIÓN ---------- */
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: 'linear-gradient(135deg, #00d9ff, #ffb700)',
    color: '#04201a',
    padding: '0.9rem 1.4rem',
    borderRadius: '30px',
    fontWeight: '800',
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
  }, 3500);
}

/* ============================================================
   COLOREADO DE CÓDIGO — TOKENIZADOR (NO regex sobre innerHTML)
   Mismo enfoque que la clase 7: un solo paso, carácter por carácter.
============================================================ */
function resaltarCodigo() {
  const palabrasClave = new Set([
    'public', 'static', 'void', 'int', 'double', 'string', 'bool', 'char',
    'long', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
    'break', 'continue', 'class', 'using', 'true', 'false', 'ref', 'out',
    'new', 'null', 'default', 'in', 'foreach', 'in'
  ]);
  const tiposClase = new Set(['Console', 'Math', 'Convert', 'String']);

  // Escape de caracteres HTML
  const esc = (c) => {
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '&') return '&amp;';
    return c;
  };
  const escStr = (s) => {
    let r = '';
    for (const c of s) r += esc(c);
    return r;
  };

  const esDigito  = (c) => c >= '0' && c <= '9';
  const esLetra   = (c) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  const esLetraNum = (c) => esLetra(c) || esDigito(c);

  function tokenizar(codigo) {
    let out = '';
    let i = 0;
    const n = codigo.length;

    while (i < n) {
      const c = codigo[i];

      // Comentario de línea //
      if (c === '/' && codigo[i + 1] === '/') {
        let fin = codigo.indexOf('\n', i);
        if (fin === -1) fin = n;
        out += '<span class="c-com">' + escStr(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // String literal "..."
      if (c === '"') {
        let fin = i + 1;
        while (fin < n && codigo[fin] !== '"' && codigo[fin] !== '\n') {
          if (codigo[fin] === '\\' && fin + 1 < n) fin++;
          fin++;
        }
        if (fin < n && codigo[fin] === '"') fin++;
        out += '<span class="c-str">' + escStr(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // Carácter literal '...'
      if (c === "'") {
        let fin = i + 1;
        while (fin < n && codigo[fin] !== "'" && codigo[fin] !== '\n') {
          if (codigo[fin] === '\\' && fin + 1 < n) fin++;
          fin++;
        }
        if (fin < n && codigo[fin] === "'") fin++;
        out += '<span class="c-str">' + escStr(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      // Número
      if (esDigito(c)) {
        let fin = i;
        while (fin < n && (esDigito(codigo[fin]) || codigo[fin] === '.')) fin++;
        out += '<span class="c-num">' + codigo.slice(i, fin) + '</span>';
        i = fin;
        continue;
      }

      // Identificador / palabra clave
      if (esLetra(c)) {
        let fin = i;
        while (fin < n && esLetraNum(codigo[fin])) fin++;
        const palabra = codigo.slice(i, fin);
        if (palabrasClave.has(palabra)) {
          out += '<span class="c-kw">' + palabra + '</span>';
        } else if (tiposClase.has(palabra)) {
          out += '<span class="c-cls">' + palabra + '</span>';
        } else {
          out += palabra;
        }
        i = fin;
        continue;
      }

      // Cualquier otro carácter
      out += esc(c);
      i++;
    }
    return out;
  }

  // Aplica a todos los bloques de código y soluciones
  document.querySelectorAll('.bloque-codigo pre, .solucion pre, .caja-resultado pre').forEach(pre => {
    const codigo = pre.textContent;
    pre.innerHTML = tokenizar(codigo);
  });

  // Inyectar estilos del coloreado
  const style = document.createElement('style');
  style.textContent = `
    .c-kw  { color: #00d9ff; font-weight: 700; }
    .c-str { color: #ffd666; }
    .c-num { color: #ff80aa; }
    .c-com { color: #5a8090; font-style: italic; }
    .c-cls { color: #b4ff39; font-weight: 700; }
  `;
  document.head.appendChild(style);
}

/* ---------- ATAJOS DE TECLADO ---------- */
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'ArrowRight') {
    if (estado.moduloActual < TOTAL_MODULOS - 1) {
      marcarCompletado(estado.moduloActual);
      irAModulo(estado.moduloActual + 1);
    }
  } else if (e.key === 'ArrowLeft') {
    if (estado.moduloActual > 0) {
      irAModulo(estado.moduloActual - 1);
    }
  }
});
