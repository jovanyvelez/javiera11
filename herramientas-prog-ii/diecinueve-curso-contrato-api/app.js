/* ============================================================
   CLASE diecinueve — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "El contrato de la API: modelos de entrada y de
   salida, response_model y actualización parcial"
   Lógica de navegación, cuestionarios, progreso y laboratorio
   de los cuatro modelos.
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
  configurarModelos();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-19-contrato';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura y programa',
  'Un modelo, cuatro modelos',
  'El id lo pone la base de datos',
  'Los campos que no se devuelven',
  'Intervalo',
  'Ejercicio: el PATCH',
  'Ejercicio: la API documentada',
  'Taller: la API pública del catálogo'
];

/* Constancia que se otorga al completar cada unidad. */
const BADGES_MODULO = {
  1: 'Un modelo, cuatro modelos',
  2: 'El id de la base de datos',
  3: 'El campo que no se filtra',
  5: 'Actualización parcial',
  6: 'La API documentada',
  7: 'El contrato de la API'
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
    otorgarBadge('Contrato completo');
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
   LABORATORIO — LOS CUATRO MODELOS
   Para cada modelo: qué guarda la base de datos, qué acepta
   el cliente y qué ve el cliente.
============================================================ */
const MODELOS_API = [
  {
    id: 'base',
    nombre: 'ProductoBase',
    tipo: 'modelo de datos · los campos compartidos',
    guarda: ['nombre', 'precio', 'cantidad', 'descripcion'],
    recibe: [],
    ve: [],
    json: '—',
    veredicto: 'No es un modelo de tabla ni de entrada ni de salida: es la base de la que heredan los otros. Sirve para no escribir los mismos campos cinco veces.'
  },
  {
    id: 'tabla',
    nombre: 'Producto',
    tipo: 'modelo de tabla · table=True',
    guarda: ['id', 'nombre', 'precio', 'cantidad', 'descripcion', 'costo_proveedor'],
    recibe: ['id', 'nombre', 'precio', 'cantidad', 'descripcion', 'costo_proveedor'],
    ve: ['id', 'nombre', 'precio', 'cantidad', 'descripcion', 'costo_proveedor'],
    json: '{\n  "id": 1,\n  "nombre": "Audífonos Bluetooth",\n  "precio": 129900.0,\n  "cantidad": 14,\n  "descripcion": "30 h de batería",\n  "costo_proveedor": 80000.0\n}',
    veredicto: '⚠ Con un solo modelo, el cliente decide el id y ve el costo_proveedor. Esta es la API de la clase 18, y por eso el siguiente modelo es indispensable.'
  },
  {
    id: 'public',
    nombre: 'ProductoPublic',
    tipo: 'modelo de datos · lo que ve el cliente',
    guarda: [],
    recibe: [],
    ve: ['id', 'nombre', 'precio', 'cantidad', 'descripcion'],
    json: '{\n  "id": 1,\n  "nombre": "Audífonos Bluetooth",\n  "precio": 129900.0,\n  "cantidad": 14,\n  "descripcion": "30 h de batería"\n}',
    veredicto: '✓ El costo_proveedor se queda dentro. El cliente nunca ve lo que a la tienda le cuesta el producto.'
  },
  {
    id: 'create',
    nombre: 'ProductoCreate',
    tipo: 'modelo de datos · lo que acepta el cliente al crear',
    guarda: [],
    recibe: ['nombre', 'precio', 'cantidad', 'descripcion', 'costo_proveedor'],
    ve: [],
    json: '{\n  "nombre": "Audífonos Bluetooth",\n  "precio": 129900.0,\n  "cantidad": 14,\n  "descripcion": "30 h de batería",\n  "costo_proveedor": 80000.0\n}',
    veredicto: '✓ No hay campo id: el identificador lo pone la base de datos. En el modelo de la clase 18, el cliente podía mandar id=99 y sobrescribir un producto que ya existía.'
  },
  {
    id: 'update',
    nombre: 'ProductoUpdate',
    tipo: 'modelo de datos · lo que acepta el cliente al editar',
    guarda: [],
    recibe: ['nombre', 'precio', 'cantidad', 'descripcion'],
    ve: [],
    json: '{\n  "precio": 99900.0\n}',
    veredicto: '✓ Todos los campos son opcionales: el cliente manda solo lo que quiere cambiar. Con exclude_unset, lo que no se manda no se toca.'
  }
];

function configurarModelos() {
  const raiz = document.querySelector('[data-modelos]');
  if (!raiz) return;

  const lista = raiz.querySelector('[data-modelos-lista]');
  const detalle = raiz.querySelector('[data-modelos-detalle]');

  let elegido = 'public';

  function pintarLista() {
    lista.textContent = '';
    MODELOS_API.forEach(m => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'modelo-boton' + (m.id === elegido ? ' activo' : '');
      boton.dataset.modelo = m.id;

      const nombre = document.createElement('span');
      nombre.textContent = m.nombre;
      const tipo = document.createElement('span');
      tipo.className = 'tipo';
      tipo.textContent = m.tipo;

      boton.append(nombre, tipo);
      boton.addEventListener('click', () => {
        elegido = m.id;
        pintarLista();
        pintarDetalle();
      });
      lista.appendChild(boton);
    });
  }

  function pintarDetalle() {
    const m = MODELOS_API.find(x => x.id === elegido);
    detalle.textContent = '';

    const tabla = document.createElement('table');
    tabla.className = 'campos-tabla';

    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    ['campo', 'se guarda', 'lo recibe', 'lo ve'].forEach(t => {
      const th = document.createElement('th');
      th.textContent = t;
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    tabla.appendChild(thead);

    const tbody = document.createElement('tbody');
    const todos = new Set([...m.guarda, ...m.recibe, ...m.ve]);
    if (todos.size === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 4;
      td.className = 'na';
      td.textContent = '— este modelo no define campos propios —';
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      [...todos].forEach(campo => {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.textContent = campo;
        tr.appendChild(td);
        [['guarda', m.guarda], ['recibe', m.recibe], ['ve', m.ve]].forEach(([clase, lista]) => {
          const celda = document.createElement('td');
          if (lista.includes(campo)) {
            celda.textContent = 'sí';
            celda.className = 'si';
          } else {
            celda.textContent = 'no';
            celda.className = 'no';
          }
          tr.appendChild(celda);
        });
        tbody.appendChild(tr);
      });
    }
    tabla.appendChild(tbody);
    detalle.appendChild(tabla);

    const json = document.createElement('pre');
    json.className = 'json-modelo';
    json.textContent = m.json;
    detalle.appendChild(json);

    const veredicto = document.createElement('div');
    veredicto.className = 'veredicto-modelo ' + (m.id === 'tabla' ? 'aviso' : (m.id === 'base' ? '' : 'ok'));
    veredicto.textContent = m.veredicto;
    detalle.appendChild(veredicto);
  }

  pintarLista();
  pintarDetalle();
}
