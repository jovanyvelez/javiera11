/* ============================================================
   CLASE dieciocho — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "El modelo que es la tabla: SQLModel y el motor
   de la base de datos"
   Lógica de navegación, cuestionarios, progreso y laboratorio
   de la máquina de la sesión.
============================================================ */

const TOTAL_MODULOS = 8;

const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  badges: new Set()
};

document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarSoluciones();
  configurarTeclado();
  configurarSesion();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-18-orm';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura y Parte 0',
  'El modelo que es la tabla',
  'El motor y las tablas',
  'La sesión: la unidad de trabajo',
  'Intervalo',
  'Ejercicio: el CRUD con ORM',
  'Ejercicio: la app que responde',
  'Taller: el catálogo con ORM'
];

/* Constancia que se otorga al completar cada unidad. */
const BADGES_MODULO = {
  1: 'El modelo que es tabla',
  2: 'El motor y las tablas',
  3: 'La unidad de trabajo',
  5: 'CRUD con ORM',
  6: 'La app que responde',
  7: 'El catálogo con ORM'
};

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    const datos = {
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      badges: [...estado.badges]
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
    estado.badges = new Set(datos.badges || []);
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
    btn.addEventListener('click', () => reiniciarCurso());
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

  if (BADGES_MODULO[n]) otorgarBadge(BADGES_MODULO[n]);

  if (UNIDADES_EVALUABLES.every(u => estado.completados.has(u))) {
    otorgarBadge('El modelo es la tabla');
  }

  guardarProgreso();
  actualizarUI();
}

function otorgarBadge(nombre) {
  if (estado.badges.has(nombre)) return;
  estado.badges.add(nombre);
  mostrarToast('Constancia obtenida: ' + nombre);
  actualizarUI();
}

function actualizarUI() {
  const total = UNIDADES_EVALUABLES.length;
  const completos = UNIDADES_EVALUABLES.filter(m => estado.completados.has(m)).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + ' %';

  const mAct = document.getElementById('unidad-actual');
  if (mAct) {
    const n = estado.moduloActual;
    mAct.textContent = 'Unidad ' + n + ' · ' + (ETIQUETAS[n] || '');
  }

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

  const vacio = document.querySelector('.constancias-vacio');
  if (vacio) vacio.classList.toggle('oculto', estado.badges.size > 0);

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
        btn.textContent = 'Copiado';
        btn.classList.add('ok');
        setTimeout(() => { btn.textContent = original; btn.classList.remove('ok'); }, 1800);
      });
    });
  });
}

/* ---------- CUESTIONARIOS ---------- */
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
      res.textContent = 'Dominado: ' + aciertos + '/' + total + '. La unidad está comprensible.';
    } else if (aciertos >= total / 2) {
      res.classList.add('parcial');
      res.textContent = 'Comprensión parcial: ' + aciertos + '/' + total + '. Conviene releer los recuadros señalados.';
    } else {
      res.classList.add('parcial');
      res.textContent = 'Insuficiente: ' + aciertos + '/' + total + '. Se recomienda volver a la unidad y rehacer el cuestionario.';
    }
  }

  guardarProgreso();
}

/* ---------- SOLUCIONES PLEGABLES ---------- */
function configurarSoluciones() {
  document.querySelectorAll('[data-solucion]').forEach(btn => {
    btn.addEventListener('click', () => toggleSolucion(btn.dataset.solucion));
  });
}

function toggleSolucion(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const visible = el.classList.toggle('visible');
  document.querySelectorAll('[data-solucion="' + id + '"]').forEach(btn => {
    if (!btn.dataset.textoOriginal) btn.dataset.textoOriginal = btn.textContent;
    btn.textContent = visible ? 'Ocultar la respuesta' : btn.dataset.textoOriginal;
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

/* ---------- REINICIO ---------- */
function reiniciarCurso() {
  if (!confirm('¿Quieres borrar tu avance de esta clase? Se borrarán las unidades completadas y las constancias.')) return;
  estado.moduloActual = 0;
  estado.completados.clear();
  estado.quizzes = {};
  estado.badges.clear();
  guardarProgreso();
  irAModulo(0);
  mostrarToast('Avance reiniciado.');
}

/* ---------- TOAST ---------- */
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ============================================================
   LABORATORIO — LA MÁQUINA DE LA SESIÓN
   Recorre una petición paso a paso. En cualquier momento se
   puede inyectar un fallo antes del commit: la sesión se
   deshace y no queda nada a medias.
============================================================ */
const PASOS_SESION = [
  {
    codigo: 'session.add(producto)',
    nota: 'El objeto entra en la sesión. Todavía no está en la base de datos.',
    estado: 'pendiente en la sesión'
  },
  {
    codigo: 'session.commit()',
    nota: 'El momento de la verdad: lo que había en la sesión se escribe en la base de datos.',
    estado: 'guardado en la base de datos'
  },
  {
    codigo: 'session.refresh(producto)',
    nota: 'Se relee el objeto desde la base de datos. Ahora ya tiene su id.',
    estado: 'el objeto ya tiene su id'
  },
  {
    codigo: 'with Session(engine) as session: ...',
    nota: 'La petición termina y la sesión se cierra. Si algo falla antes, se deshace sola.',
    estado: 'sesión cerrada'
  }
];

function configurarSesion() {
  const raiz = document.querySelector('[data-sesion]');
  if (!raiz) return;

  const zonaPasos = raiz.querySelector('[data-sesion-pasos]');
  const panel = raiz.querySelector('[data-sesion-estado]');
  const barra = raiz.querySelector('[data-sesion-barra]');
  const btnAvanzar = raiz.querySelector('[data-sesion-avanzar]');
  const btnFallar = raiz.querySelector('[data-sesion-fallar]');
  const btnReiniciar = raiz.querySelector('[data-sesion-reiniciar]');

  let indice = 0;
  let fallida = false;

  function pintarPasos() {
    zonaPasos.textContent = '';
    PASOS_SESION.forEach((paso, i) => {
      const fila = document.createElement('div');
      fila.className = 'paso-sesion';
      if (fallida && i >= indice) fila.classList.add('fallido');
      else if (i < indice) fila.classList.add('hecho');
      else if (i === indice) fila.classList.add('activo');

      const marca = document.createElement('span');
      marca.className = 'marca';
      marca.textContent = fallida && i >= indice ? '✕' : (i < indice ? '✓' : String(i + 1));

      const cuerpo = document.createElement('div');
      cuerpo.className = 'cuerpo';

      const cod = document.createElement('span');
      cod.className = 'codigo-paso';
      cod.textContent = paso.codigo;

      const nota = document.createElement('span');
      nota.className = 'nota-paso';
      nota.textContent = paso.nota;

      cuerpo.append(cod, nota);
      fila.append(marca, cuerpo);
      zonaPasos.appendChild(fila);
    });
  }

  function pintarEstado() {
    panel.textContent = '';

    const lineas = [];
    if (fallida) {
      lineas.push(['estado de la sesión', 'deshecha (rollback)', 'mal']);
      lineas.push(['en la base de datos', 'nada: el producto no se guardó', 'aviso']);
      lineas.push(['qué se habría visto al responder', 'un error 500, y el formulario perdido', 'mal']);
    } else if (indice === 0) {
      lineas.push(['estado de la sesión', 'abierta, todavía vacía', '']);
      lineas.push(['en la base de datos', 'nada todavía', '']);
    } else if (indice === 1) {
      lineas.push(['estado de la sesión', 'con un producto pendiente', 'aviso']);
      lineas.push(['en la base de datos', 'todavía nada: falta el commit', 'aviso']);
    } else if (indice === 2) {
      lineas.push(['estado de la sesión', 'confirmada', 'ok']);
      lineas.push(['en la base de datos', 'el producto, con su id generado', 'ok']);
    } else if (indice === 3) {
      lineas.push(['estado de la sesión', 'confirmada', 'ok']);
      lineas.push(['en la base de datos', 'el producto, con su id generado', 'ok']);
    } else {
      lineas.push(['estado de la sesión', 'cerrada', 'ok']);
      lineas.push(['en la base de datos', 'el producto, con su id generado', 'ok']);
    }

    lineas.forEach(([clave, valor, clase]) => {
      const div = document.createElement('div');
      div.className = 'sesion-linea';
      const k = document.createElement('span');
      k.className = 'clave';
      k.textContent = clave + ': ';
      const v = document.createElement('span');
      v.className = 'valor ' + (clase || '');
      v.textContent = valor;
      div.append(k, v);
      panel.appendChild(div);
    });

    if (barra) {
      const relleno = barra.querySelector('span');
      if (relleno) relleno.style.width = (indice / PASOS_SESION.length * 100) + '%';
    }
    if (btnAvanzar) btnAvanzar.disabled = indice >= PASOS_SESION.length;
    if (btnFallar) btnFallar.disabled = fallida || indice >= PASOS_SESION.length;
  }

  function reiniciar() {
    indice = 0;
    fallida = false;
    pintarPasos();
    pintarEstado();
  }

  if (btnAvanzar) {
    btnAvanzar.addEventListener('click', () => {
      if (indice < PASOS_SESION.length) indice++;
      pintarPasos();
      pintarEstado();
    });
  }

  if (btnFallar) {
    btnFallar.addEventListener('click', () => {
      fallida = true;
      pintarPasos();
      pintarEstado();
    });
  }

  if (btnReiniciar) {
    btnReiniciar.addEventListener('click', reiniciar);
  }

  reiniciar();
}
