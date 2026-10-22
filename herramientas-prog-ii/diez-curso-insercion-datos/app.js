/* ============================================================
   CLASE diez — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "Inserción de datos desde formularios: validaciones
   previas y control de errores"
   Lógica de navegación, cuestionarios, progreso y laboratorio
   de inserción con las tres capas de validación.
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
  configurarInsercion();
  configurarTeclado();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-10-insercion';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura: la app Escritores',
  'El formulario y el POST',
  'Validaciones previas',
  'Inserción segura',
  'Intervalo',
  'Actividad: insertar autores',
  'Control de errores',
  'Taller: inserción robusta'
];

/* Constancia que se otorga al completar cada unidad. */
const BADGES_MODULO = {
  1: 'El formulario y el POST',
  2: 'Validación Pydantic',
  3: 'Inserción segura',
  5: 'Autor insertado',
  6: 'Errores controlados',
  7: 'Inserción robusta'
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
    otorgarBadge('Datos íntegros');
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

/* ---------- LABORATORIO DE INSERCIÓN ---------- */
function configurarInsercion() {
  const form = document.querySelector('[data-ins-form]');
  if (!form) return;

  const estado = document.querySelector('[data-ins-estado]');
  const capa = document.querySelector('[data-ins-capa]');
  const json = document.querySelector('[data-ins-json]');
  const sql = document.querySelector('[data-ins-sql]');
  const valido = document.querySelector('[data-ins-ejemplo-valido]');
  const invalido = document.querySelector('[data-ins-ejemplo-invalido]');
  const limpiar = document.querySelector('[data-ins-limpiar]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(form).entries());
    const resultado = validarAutor(datos, form);
    mostrarInsercion(estado, capa, json, sql, resultado);
  });

  if (valido) {
    valido.addEventListener('click', () => {
      form.elements.nombre.value = 'Gabriel García Márquez';
      form.elements.pais.value = 'Colombia';
      form.elements.nacimiento.value = '1927';
      form.elements.duplicado.checked = false;
      form.requestSubmit();
    });
  }

  if (invalido) {
    invalido.addEventListener('click', () => {
      form.elements.nombre.value = 'A';
      form.elements.pais.value = 'Colombia';
      form.elements.nacimiento.value = '3000';
      form.elements.duplicado.checked = false;
      form.requestSubmit();
    });
  }

  if (limpiar) {
    limpiar.addEventListener('click', () => {
      form.reset();
      estado.className = 'lab-estado neutro';
      estado.textContent = 'Esperando una inserción…';
      capa.textContent = 'Capa: —';
      json.textContent = '{\n  "detail": "Aún no hay ninguna petición."\n}';
      sql.textContent = '-- La consulta aparecerá aquí cuando insertes un autor.';
    });
  }
}

function validarAutor(datos, form) {
  const nombre = String(datos.nombre || '').trim();
  const pais = String(datos.pais || '').trim();
  const nacimientoTexto = String(datos.nacimiento || '').trim();
  const duplicado = form.elements.duplicado.checked;
  const anioActual = new Date().getFullYear();
  const errores = [];

  if (nombre.length < 2) {
    errores.push(errorInsercion('string_too_short', 'nombre', 'El nombre debe tener al menos 2 caracteres.', nombre));
  } else if (nombre.length > 80) {
    errores.push(errorInsercion('string_too_long', 'nombre', 'El nombre no puede superar los 80 caracteres.', nombre));
  }

  if (pais.length > 60) {
    errores.push(errorInsercion('string_too_long', 'pais', 'El país no puede superar los 60 caracteres.', pais));
  }

  let nacimiento = null;
  if (nacimientoTexto !== '') {
    const numero = Number(nacimientoTexto);
    if (!Number.isInteger(numero)) {
      errores.push(errorInsercion('int_parsing', 'nacimiento', 'El año debe ser un número entero.', nacimientoTexto));
    } else if (numero < 1000) {
      errores.push(errorInsercion('greater_than_equal', 'nacimiento', 'El año no puede ser anterior a 1000.', nacimientoTexto));
    } else if (numero > anioActual) {
      errores.push(errorInsercion('less_than_equal', 'nacimiento', 'El año no puede estar en el futuro.', nacimientoTexto));
    } else {
      nacimiento = numero;
    }
  }

  if (errores.length > 0) {
    return {
      status: 422,
      capa: 'Pydantic',
      body: { detail: errores },
      sql: '-- No se ejecutó: la validación detuvo la petición antes del INSERT.'
    };
  }

  const sqlInsert = `INSERT INTO autores (nombre, pais, nacimiento)
VALUES ($1, $2, $3)
RETURNING id, nombre, pais, nacimiento;

-- $1 = '${nombre.replace(/'/g, "''")}'
-- $2 = ${pais ? `'${pais.replace(/'/g, "''")}'` : 'NULL'}
-- $3 = ${nacimiento === null ? 'NULL' : nacimiento}`;

  if (duplicado) {
    return {
      status: 409,
      capa: 'PostgreSQL',
      body: { detail: 'Ya existe un autor con ese nombre.' },
      sql: sqlInsert + '\n\n-- UniqueViolationError · SQLSTATE 23505'
    };
  }

  return {
    status: 201,
    capa: 'PostgreSQL',
    body: {
      id: 116,
      nombre,
      pais: pais || null,
      nacimiento
    },
    sql: sqlInsert + '\n\n-- INSERT 0 1 · el id 116 lo generó la base de datos'
  };
}

function errorInsercion(tipo, campo, mensaje, valor) {
  return {
    type: tipo,
    loc: ['body', campo],
    msg: mensaje,
    input: String(valor)
  };
}

function mostrarInsercion(estado, capa, json, sql, resultado) {
  estado.className = 'lab-estado ' + (resultado.status === 201 ? 'ok' : 'error');
  estado.textContent = resultado.status === 201
    ? 'HTTP 201 · autor insertado'
    : resultado.status === 409
      ? 'HTTP 409 · nombre duplicado'
      : 'HTTP 422 · dato rechazado por Pydantic';

  capa.textContent = 'Capa: ' + resultado.capa;
  json.textContent = JSON.stringify(resultado.body, null, 2);
  sql.textContent = resultado.sql;
}
