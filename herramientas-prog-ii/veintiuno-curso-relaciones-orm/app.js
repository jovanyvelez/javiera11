/* ============================================================
   CLASE veintiuno — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "El contrato de la API: modelos de entrada y de
   salida, response_model y actualización parcial"
   Lógica de navegación, cuestionarios, progreso y laboratorio
   del tablero de relaciones.
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
  configurarTablero();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-21-relaciones';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura y programa',
  'El atributo que habla',
  'El espejo: back_populates',
  'Crear, leer y cortar una relación',
  'Intervalo',
  'Ejercicio: las cuatro operaciones',
  'Ejercicio: el borrado en cascada',
  'Taller: el modelo que se relaciona',
];

/* Constancia que se otorga al completar cada unidad. */
const BADGES_MODULO = {
  1:'El atributo que habla',
  2:'El espejo',
  3:'La relación completa',
  5:'Relaciones con el ORM',
  6:'El borrado en cascada',
  7:'Modelo relacionado',
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
    otorgarBadge('Relaciones completas');
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
/* ---------- DATOS DEL TABLERO (clase 21) ---------- */
const TABLERO = {
  rotuloPadre: 'Editorial',
  rotuloEspejo: 'editorial.libros (el lado inverso)',
  sinVinculo: '— ninguna: el objeto no apunta a ninguna editorial —',
  notaClase: 'ok',
  hijos: [
    { id: 'l1', titulo: 'El amor en los tiempos del cólera', meta: '1985' },
    { id: 'l2', titulo: 'Cien años de soledad', meta: '1967' },
    { id: 'l3', titulo: 'La sombra del viento', meta: '2001' },
    { id: 'l4', titulo: 'Pedro Páramo', meta: '1955' }
  ],
  padres: [
    { id: 'planeta', nombre: 'Planeta' },
    { id: 'oceano', nombre: 'Océano' }
  ],
  vinculos: { l1: ['planeta'], l2: ['planeta'], l3: ['oceano'], l4: [] },
  acciones: [
    {
      etiqueta: 'Mover de editorial',
      clase: 'principal',
      fn: (id) => {
        const actual = (TABLERO.vinculos[id] || [])[0];
        TABLERO.vinculos[id] = [actual === 'planeta' ? 'oceano' : 'planeta'];
      }
    },
    {
      etiqueta: 'Cortar la relación',
      clase: 'quitar',
      noDisponible: (hijo) => (TABLERO.vinculos[hijo.id] || []).length === 0,
      fn: (id) => { TABLERO.vinculos[id] = []; }
    }
  ],
  nota: (hijo, vinculos) => vinculos.length
    ? 'Mover el libro actualizó los dos lados a la vez: el libro apunta a la editorial nueva, y la editorial nueva muestra el libro entre los suyos. Eso es back_populates.'
    : 'Al cortar la relación, el libro se queda en la base de datos y desaparece del lado de la editorial. Ninguna fila se borró.'
};

/* ============================================================
   LABORATORIO — EL TABLERO DE RELACIONES
   Una misma pieza, tres datos: el tablero muestra quién está
   conectado con quién y qué cambia al mover o cortar el enlace.
============================================================ */
function configurarTablero() {
  const raiz = document.querySelector('[data-tablero]');
  if (!raiz) return;

  const izq = raiz.querySelector('[data-tablero-izq]');
  const der = raiz.querySelector('[data-tablero-der]');
  let elegido = 0;

  function nodo(etiqueta, clase, texto) {
    const el = document.createElement('span');
    el.className = clase;
    el.textContent = texto;
    if (etiqueta) el.dataset.rot = etiqueta;
    return el;
  }

  function pintar() {
    /* --- izquierda: los hijos --- */
    izq.textContent = '';
    TABLERO.hijos.forEach((hijo, i) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'tablero-item' + (i === elegido ? ' activo' : '');
      const titulo = document.createElement('span');
      titulo.textContent = hijo.titulo;
      const sub = document.createElement('span');
      sub.className = 'sub';
      sub.textContent = hijo.meta;
      boton.append(titulo, sub);
      boton.addEventListener('click', () => { elegido = i; pintar(); });
      izq.appendChild(boton);
    });

    const hijo = TABLERO.hijos[elegido];
    const conectados = TABLERO.vinculos[hijo.id] || [];

    /* --- derecha: con quién está conectado --- */
    der.textContent = '';

    const bloquePadre = document.createElement('div');
    bloquePadre.className = 'tablero-padre';
    const rot = document.createElement('span');
    rot.className = 'rot';
    rot.textContent = TABLERO.rotuloPadre + ' de «' + hijo.titulo + '»';
    bloquePadre.appendChild(rot);
    if (conectados.length === 0) {
      const nom = document.createElement('span');
      nom.className = 'nom vacio';
      nom.textContent = TABLERO.sinVinculo;
      bloquePadre.appendChild(nom);
    } else {
      conectados.forEach(id => {
        const padre = TABLERO.padres.find(p => p.id === id);
        const nom = document.createElement('span');
        nom.className = 'nom';
        nom.textContent = padre ? padre.nombre : id;
        bloquePadre.appendChild(nom);
        const salto = document.createElement('br');
        bloquePadre.appendChild(salto);
      });
    }
    der.appendChild(bloquePadre);

    /* --- el espejo: los hijos del primer conectado --- */
    const bloqueHijos = document.createElement('div');
    bloqueHijos.className = 'tablero-hijos';
    const rot2 = document.createElement('span');
    rot2.className = 'rot';
    rot2.textContent = TABLERO.rotuloEspejo;
    bloqueHijos.appendChild(rot2);
    const lista = document.createElement('ul');
    if (conectados.length > 0) {
      const id = conectados[0];
      TABLERO.hijos.forEach(h => {
        if ((TABLERO.vinculos[h.id] || []).indexOf(id) !== -1) {
          const li = document.createElement('li');
          li.textContent = h.titulo;
          if (h.id === hijo.id) li.classList.add('destacado');
          lista.appendChild(li);
        }
      });
    }
    bloqueHijos.appendChild(lista);
    der.appendChild(bloqueHijos);

    /* --- acciones --- */
    const acciones = document.createElement('div');
    acciones.className = 'tablero-acciones';
    TABLERO.acciones.forEach(accion => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'tablero-boton ' + (accion.clase || '');
      boton.textContent = accion.etiqueta;
      boton.disabled = accion.noDisponible ? accion.noDisponible(hijo) : false;
      boton.addEventListener('click', () => { accion.fn(hijo.id); pintar(); });
      acciones.appendChild(boton);
    });
    der.appendChild(acciones);

    /* --- la nota que explica lo que pasó --- */
    const nota = document.createElement('div');
    nota.className = 'tablero-nota ' + TABLERO.notaClase;
    nota.textContent = TABLERO.nota(hijo, TABLERO.vinculos[hijo.id] || []);
    der.appendChild(nota);
  }

  pintar();
}
