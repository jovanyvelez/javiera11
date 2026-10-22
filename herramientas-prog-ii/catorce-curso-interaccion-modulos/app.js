/* ============================================================
   CLASE catorce — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "Interacción entre módulos del sistema. Flujo de
   acciones: listar, editar, guardar, volver."
   Navegación, cuestionarios, soluciones y trazador interactivo
   del flujo de acciones (botón → ruta → repositorio → pieza).
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
  configurarTrazador();
  configurarTeclado();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-14-interaccion';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura: el sistema que no conversa',
  'Los módulos del sistema',
  'El flujo de acciones',
  'Contratos entre módulos',
  'Intervalo',
  'Actividad: trazar el flujo',
  'Volver, cancelar y estados',
  'Taller: flujo de una entidad'
];

const BADGES_MODULO = {
  1: 'Mapa de módulos',
  2: 'Flujo bajo control',
  3: 'Contratos claros',
  5: 'Flujo trazado',
  6: 'Volver sin perderse',
  7: 'Entidad completa'
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
    otorgarBadge('Sistema conversador');
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

/* ---------- TRAZADOR DE FLUJO ----------
   Cada acción del sistema se descompone en su cadena:
   botón → atributos htmx → ruta → repositorio → pieza.
   El trazador la muestra al hacer clic, como un diagrama vivo.
--------------------------------------------- */
const FLUJOS = {
  listar: {
    accion: 'Listar',
    boton: 'GET /autores (al abrir la página)',
    htmx: 'Sin htmx: el navegador pide la URL completa.',
    ruta: 'vistas.py → listar_autores_vista()',
    repo: 'obtener_autores() → SELECT id, nombre, pais, nacimiento FROM autores ORDER BY id',
    pieza: 'autores.html — página completa: menú + formulario + tabla',
    nota: 'Es la única acción que entrega la página entera. Todo lo demás entrega piezas.',
    estados: ['página vacía → tabla llena']
  },
  editar: {
    accion: 'Editar',
    boton: 'Botón «Editar» de una fila',
    htmx: 'hx-get="/autores/{id}/editar" · hx-target="closest tr" · hx-swap="outerHTML"',
    ruta: 'vistas.py → editar_autor_vista(id)',
    repo: 'obtener_autor(id) → SELECT … FROM autores WHERE id = $1',
    pieza: 'fila_editar_autor.html — la misma fila, ahora con inputs',
    nota: 'La pieza se transforma. No se crea una página nueva: se pide la otra versión de la misma pieza.',
    estados: ['fila normal → fila en edición']
  },
  guardar: {
    accion: 'Guardar',
    boton: 'Botón «Guardar» de la fila en edición',
    htmx: 'hx-put="/autores/{id}" · hx-include="closest tr" · hx-target="closest tr" · hx-swap="outerHTML"',
    ruta: 'vistas.py → actualizar_autor_vista(id)',
    repo: 'actualizar_autor(id, datos) → UPDATE … RETURNING *',
    pieza: 'fila_autor.html — la pieza vuelve a su estado normal, con los datos nuevos',
    nota: 'hx-include="closest tr" es el detalle que casi siempre se olvida: sin él, el PUT llega vacío.',
    estados: ['fila en edición → fila normal (datos nuevos)', 'error de validación → fila en edición con errores']
  },
  volver: {
    accion: 'Volver / Cancelar',
    boton: 'Botón «Cancelar» o «Cerrar»',
    htmx: 'hx-get="/autores/{id}/cancelar" · hx-target="closest tr" · hx-swap="outerHTML"',
    ruta: 'vistas.py → cancelar_autor_vista(id)',
    repo: 'obtener_autor(id) — solo lee; no escribe nada',
    pieza: 'fila_autor.html — la pieza normal, sin tocar la base',
    nota: 'Volver no es «deshacer». Es pedir otra vez la pieza normal. La base nunca cambió.',
    estados: ['fila en edición → fila normal', 'fila expandida → fila normal']
  },
  crear: {
    accion: 'Crear',
    boton: 'Formulario «Crear autor»',
    htmx: 'hx-post="/autores" · hx-target="#autores" · hx-swap="outerHTML" · hx-select="#autores"',
    ruta: 'vistas.py → crear_autor_vista()',
    repo: 'crear_autor() → INSERT … RETURNING * · y luego obtener_autores()',
    pieza: 'autores.html (solo el trozo #autores) — formulario limpio + tabla actualizada',
    nota: 'Éxito o error, la respuesta es la misma sección. Si falla la validación, status 422 y los errores en cada campo.',
    estados: ['éxito → sección con el autor nuevo', 'error 422 → sección con errores y lo escrito']
  },
  borrar: {
    accion: 'Borrar',
    boton: 'Botón «Borrar» de una fila',
    htmx: 'hx-delete="/autores/{id}" · hx-target="#tabla-autores" · hx-swap="outerHTML" · hx-confirm="…"',
    ruta: 'vistas.py → eliminar_autor_vista(id)',
    repo: 'eliminar_autor(id) → DELETE FROM autores WHERE id = $1',
    pieza: 'tabla_autores.html — el puzle entero, sin esa pieza',
    nota: 'Al borrar cambia el número de piezas: por eso se devuelve la tabla completa, no una fila vacía.',
    estados: ['tabla con N filas → tabla con N−1 filas']
  }
};

function configurarTrazador() {
  const root = document.querySelector('[data-trazador]');
  if (!root) return;

  const botones = root.querySelectorAll('[data-flujo]');
  botones.forEach(btn => {
    btn.addEventListener('click', () => {
      botones.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      mostrarFlujo(root, btn.dataset.flujo);
    });
  });

  if (botones.length) {
    botones[0].classList.add('activo');
    mostrarFlujo(root, botones[0].dataset.flujo);
  }
}

function mostrarFlujo(root, clave) {
  const dato = FLUJOS[clave];
  if (!dato) return;

  const set = (sel, texto) => {
    const el = root.querySelector(sel);
    if (el) el.textContent = texto;
  };

  set('[data-flujo-accion]', dato.accion);
  set('[data-flujo-boton]', dato.boton);
  set('[data-flujo-htmx]', dato.htmx);
  set('[data-flujo-ruta]', dato.ruta);
  set('[data-flujo-repo]', dato.repo);
  set('[data-flujo-pieza]', dato.pieza);
  set('[data-flujo-nota]', dato.nota);

  const lista = root.querySelector('[data-flujo-estados]');
  if (lista) {
    lista.innerHTML = '';
    dato.estados.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      lista.appendChild(li);
    });
  }
}
