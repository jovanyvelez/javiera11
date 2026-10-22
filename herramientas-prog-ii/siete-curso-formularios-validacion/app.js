/* ============================================================
   CLASE siete — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "Envío y recepción de datos desde formularios.
   Validación del input del usuario"
   Lógica de navegación, cuestionarios, progreso y laboratorio
   de validación del formulario de contacto.
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
  configurarLaboratorio();
  configurarTeclado();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-7-formularios';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura y programa',
  'El viaje del dato',
  'Captura con HTML',
  'Validación en el backend',
  'Intervalo',
  'Actividad: formulario de contacto',
  'Errores que se entienden',
  'Taller: contacto en producción'
];

/* Constancia que se otorga al completar cada unidad. */
const BADGES_MODULO = {
  1: 'El viaje del dato',
  2: 'Formulario accesible',
  3: 'Validación Pydantic',
  5: 'Contacto funcional',
  6: 'Errores claros',
  7: 'Contacto en producción'
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
    otorgarBadge('Frontera segura');
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

/* ---------- LABORATORIO DE VALIDACIÓN ---------- */
function configurarLaboratorio() {
  const form = document.querySelector('[data-lab-form]');
  if (!form) return;

  const estadoEl = document.querySelector('[data-lab-estado]');
  const jsonEl = document.querySelector('[data-lab-json]');
  const limpiar = document.querySelector('[data-lab-limpiar]');
  const ejemplo = document.querySelector('[data-lab-ejemplo]');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const datos = Object.fromEntries(new FormData(form).entries());
    const errores = validarContacto(datos, form);

    if (errores.length > 0) {
      mostrarResultadoLab(estadoEl, jsonEl, 'error', 422, { detail: errores });
      return;
    }

    mostrarResultadoLab(estadoEl, jsonEl, 'ok', 200, {
      estado: 'recibido',
      nombre: String(datos.nombre).trim(),
      asunto: datos.asunto
    });
  });

  if (limpiar) {
    limpiar.addEventListener('click', () => {
      form.reset();
      estadoEl.className = 'lab-estado neutro';
      estadoEl.textContent = 'Esperando un envío…';
      jsonEl.textContent = '{\n  "detail": "Aún no hay ninguna petición."\n}';
    });
  }

  if (ejemplo) {
    ejemplo.addEventListener('click', () => {
      form.elements.nombre.value = 'Al';
      form.elements.correo.value = 'ana@';
      form.elements.asunto.value = '';
      form.elements.mensaje.value = 'Hola';
      form.elements.acepta.checked = false;
      form.elements.sitio.value = '';
      form.requestSubmit();
    });
  }
}

function validarContacto(datos, form) {
  const errores = [];
  const nombre = String(datos.nombre || '').trim();
  const correo = String(datos.correo || '').trim();
  const asunto = String(datos.asunto || '').trim();
  const mensaje = String(datos.mensaje || '').trim();
  const sitio = String(datos.sitio || '').trim();

  if (!nombre) {
    errores.push(errorLab('missing', 'nombre', 'Este campo es obligatorio.', ''));
  } else if (nombre.length < 3) {
    errores.push(errorLab('string_too_short', 'nombre', 'El nombre debe tener al menos 3 caracteres.', nombre));
  } else if (nombre.length > 60) {
    errores.push(errorLab('string_too_long', 'nombre', 'El nombre no puede superar los 60 caracteres.', nombre));
  }

  if (!correo) {
    errores.push(errorLab('missing', 'correo', 'Este campo es obligatorio.', ''));
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    errores.push(errorLab('value_error', 'correo', 'Escribe un correo válido, por ejemplo ana@colegio.edu.co.', correo));
  }

  if (!asunto) {
    errores.push(errorLab('missing', 'asunto', 'Elige un asunto.', ''));
  } else if (!['consulta', 'soporte', 'sugerencia'].includes(asunto)) {
    errores.push(errorLab('literal_error', 'asunto', 'Elige una de las opciones disponibles.', asunto));
  }

  if (!mensaje) {
    errores.push(errorLab('missing', 'mensaje', 'Este campo es obligatorio.', ''));
  } else if (mensaje.length < 20) {
    errores.push(errorLab('string_too_short', 'mensaje', 'El mensaje debe tener al menos 20 caracteres.', mensaje));
  } else if (mensaje.length > 800) {
    errores.push(errorLab('string_too_long', 'mensaje', 'El mensaje no puede superar los 800 caracteres.', mensaje));
  }

  if (!form.elements.acepta.checked) {
    errores.push(errorLab('missing', 'acepta', 'Debes aceptar para enviar el mensaje.', ''));
  }

  if (sitio) {
    errores.push(errorLab('value_error', 'sitio', 'El formulario no pasó la comprobación antispam.', sitio));
  }

  return errores;
}

function errorLab(tipo, campo, mensaje, valor) {
  return {
    type: tipo,
    loc: ['body', campo],
    msg: mensaje,
    input: recortarValor(valor)
  };
}

function recortarValor(valor) {
  const texto = String(valor);
  return texto.length > 120 ? texto.slice(0, 117) + '…' : texto;
}

function mostrarResultadoLab(estadoEl, jsonEl, clase, codigo, cuerpo) {
  estadoEl.className = 'lab-estado ' + clase;
  estadoEl.textContent = codigo === 200
    ? 'HTTP 200 · validación superada (el servidor real responde 303)'
    : 'HTTP 422 · el servidor rechazó el envío';
  jsonEl.textContent = JSON.stringify(cuerpo, null, 2);
}
