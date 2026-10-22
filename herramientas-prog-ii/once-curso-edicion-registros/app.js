/* ============================================================
   CLASE once — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "Edición de registros almacenados: carga de datos en
   formularios y actualización de valores"
   Lógica de navegación, cuestionarios, progreso y laboratorio
   del editor de registros (simulador de la U del CRUD).
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
  configurarEditor();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-11-edicion';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura y programa',
  'El viaje de una edición',
  'Cargar los datos en el formulario',
  'Validar sin perder lo escrito',
  'Intervalo',
  'Ejercicio: las consultas del repositorio',
  'Ejercicio: las tres rutas de edición',
  'Taller: el catálogo que sí se puede corregir'
];

/* Constancia que se otorga al completar cada unidad. */
const BADGES_MODULO = {
  1: 'El viaje de una edición',
  2: 'Carga en el formulario',
  3: 'Validación sin pérdida',
  5: 'Consultas parametrizadas',
  6: 'Rutas de edición',
  7: 'CRUD en marcha'
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
    otorgarBadge('Edición completa');
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
   LABORATORIO DEL EDITOR DE REGISTROS
   Simula la "U" del CRUD sobre un catálogo en memoria:
   cargar el formulario con lo guardado y devolver el registro
   actualizado. Las reglas de validación son las mismas que
   aplica el esquema de Pydantic en el servidor.
============================================================ */
const PRODUCTOS_LAB = [
  { id: 1, nombre: 'Audífonos Bluetooth', precio: 129900, cantidad: 14, descripcion: 'Cancelación de ruido y 30 h de batería' },
  { id: 2, nombre: 'Mouse ergonómico', precio: 45900, cantidad: 32, descripcion: '' },
  { id: 3, nombre: 'Teclado mecánico', precio: 189900, cantidad: 7, descripcion: 'Switches rojos y teclado en español' }
];

const MENSAJES_LAB = {
  nombre: 'El nombre es obligatorio y no puede pasar de 100 caracteres.',
  precio: 'El precio debe ser un número mayor que cero.',
  cantidad: 'La cantidad debe ser un número entero que no sea negativo.'
};

/* Los precios se ven como en la base de datos: NUMERIC con dos decimales. */
function formatearPrecio(valor) {
  return '$' + Number(valor).toLocaleString('es-CO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function configurarEditor() {
  const raiz = document.querySelector('[data-editor]');
  if (!raiz) return;

  const cuerpoTabla = raiz.querySelector('[data-ed-tabla]');
  const form = raiz.querySelector('[data-ed-form]');
  const aviso = raiz.querySelector('[data-ed-aviso]');
  const consola = raiz.querySelector('[data-ed-consola]');
  const btnCancelar = raiz.querySelector('[data-ed-cancelar]');
  const btnReiniciar = raiz.querySelector('[data-ed-reiniciar]');

  let productos = PRODUCTOS_LAB.map(p => ({ ...p }));
  let editando = null;
  let errores = {};

  /* ---------- pintado del catálogo ---------- */
  function pintarCatalogo() {
    cuerpoTabla.textContent = '';
    productos.forEach(p => {
      const fila = document.createElement('tr');
      if (p.id === editando) fila.className = 'editando';

      const celdaId = document.createElement('td');
      celdaId.className = 'num';
      celdaId.textContent = '#' + p.id;

      const celdaNombre = document.createElement('td');
      celdaNombre.textContent = p.nombre;

      const celdaPrecio = document.createElement('td');
      celdaPrecio.className = 'num';
      celdaPrecio.textContent = formatearPrecio(p.precio);

      const celdaCantidad = document.createElement('td');
      celdaCantidad.className = 'num';
      celdaCantidad.textContent = String(p.cantidad);

      const celdaAccion = document.createElement('td');
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'editor-boton';
      boton.textContent = p.id === editando ? 'Editando…' : 'Editar';
      boton.addEventListener('click', () => empezarEdicion(p.id));
      celdaAccion.appendChild(boton);

      fila.append(celdaId, celdaNombre, celdaPrecio, celdaCantidad, celdaAccion);
      cuerpoTabla.appendChild(fila);
    });
  }

  /* ---------- pintado de la consola del servidor ---------- */
  function paso(clase, metodo, codigo, extra) {
    const div = document.createElement('div');
    div.className = 'editor-paso ' + (clase || '');
    const m = document.createElement('span');
    m.className = 'metodo';
    m.textContent = metodo;
    const c = document.createElement('span');
    c.className = 'codigo';
    c.textContent = codigo;
    div.append(m, c);
    if (extra) {
      const e = document.createElement('span');
      e.className = 'nota';
      e.textContent = extra;
      div.appendChild(e);
    }
    consola.appendChild(div);
  }

  function limpiarConsola(mensaje) {
    consola.textContent = '';
    const vacio = document.createElement('div');
    vacio.className = 'editor-vacio';
    vacio.textContent = mensaje || 'El servidor está esperando una petición…';
    consola.appendChild(vacio);
  }

  /* ---------- validación (las mismas reglas del esquema) ---------- */
  function validar(datos) {
    const err = {};
    const nombre = String(datos.nombre || '').trim();
    const precioCrudo = String(datos.precio || '').trim();
    const cantidadCruda = String(datos.cantidad || '').trim();

    if (!nombre || nombre.length > 100) {
      err.nombre = MENSAJES_LAB.nombre;
    }

    const precio = Number(precioCrudo);
    if (precioCrudo === '' || Number.isNaN(precio) || precio <= 0) {
      err.precio = MENSAJES_LAB.precio;
    }

    const cantidad = Number(cantidadCruda);
    if (cantidadCruda === '' || !Number.isInteger(cantidad) || cantidad < 0) {
      err.cantidad = MENSAJES_LAB.cantidad;
    }

    return err;
  }

  function mostrarErrores() {
    ['nombre', 'precio', 'cantidad'].forEach(campo => {
      const input = form.elements[campo];
      const caja = form.querySelector('[data-ed-error="' + campo + '"]');
      if (!input || !caja) return;
      if (errores[campo]) {
        input.classList.add('invalido');
        caja.textContent = errores[campo];
      } else {
        input.classList.remove('invalido');
        caja.textContent = '';
      }
    });
  }

  /* ---------- paso 1: cargar el formulario ---------- */
  function empezarEdicion(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    editando = id;
    errores = {};

    limpiarConsola();
    paso('', 'GET', '/productos/' + id + '/editar → 200 OK',
      'el servidor busca el registro y lo manda en la plantilla');
    paso('', '', 'formulario cargado con los valores guardados',
      'nombre="' + producto.nombre + '", precio=' + producto.precio + ', cantidad=' + producto.cantidad);

    form.elements.nombre.value = producto.nombre;
    form.elements.precio.value = String(producto.precio);
    form.elements.cantidad.value = String(producto.cantidad);
    form.elements.descripcion.value = producto.descripcion;
    mostrarErrores();

    form.classList.add('visible');
    aviso.style.display = 'none';
    pintarCatalogo();
    form.elements.nombre.focus();
  }

  /* ---------- paso 2: guardar ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (editando === null) return;

    const datos = {
      nombre: form.elements.nombre.value,
      precio: form.elements.precio.value,
      cantidad: form.elements.cantidad.value,
      descripcion: form.elements.descripcion.value
    };

    limpiarConsola();
    paso('', 'POST', '/productos/' + editando,
      'cuerpo: nombre="' + datos.nombre + '" precio="' + datos.precio +
      '" cantidad="' + datos.cantidad + '"');

    errores = validar(datos);

    if (Object.keys(errores).length > 0) {
      paso('error', '', '422 Unprocessable Entity',
        'el servidor rechazó el envío: ' + Object.keys(errores).join(', '));
      paso('error', '', 'la base de datos no se tocó',
        'el formulario vuelve a mostrarse con lo que escribiste');
      mostrarErrores();
      return;
    }

    const producto = productos.find(p => p.id === editando);
    producto.nombre = String(datos.nombre).trim();
    producto.precio = Number(datos.precio);
    producto.cantidad = Number(datos.cantidad);
    producto.descripcion = String(datos.descripcion || '');

    const sql = 'UPDATE productos\n  SET nombre = $2, precio = $3,\n      cantidad = $4, descripcion = $5\nWHERE id = $1';
    const lineaSql = document.createElement('span');
    lineaSql.className = 'sql';
    lineaSql.textContent = sql;

    paso('', '', 'consulta preparada y enviada con sus parámetros');
    const divSql = document.createElement('div');
    divSql.className = 'editor-paso';
    divSql.appendChild(lineaSql);
    consola.appendChild(divSql);

    paso('', '', 'parámetros: $1=' + producto.id + ', $2="' + producto.nombre +
      '", $3=' + producto.precio + ', $4=' + producto.cantidad + ', $5="' + producto.descripcion + '"');

    paso('ok', '', 'UPDATE 1',
      'el registro guardado ahora es: ' + producto.nombre + ' — ' +
      formatearPrecio(producto.precio) + ' — ' + producto.cantidad + ' uds');

    errores = {};
    mostrarErrores();
    pintarCatalogo();
  });

  /* ---------- paso 3: cancelar ---------- */
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      if (editando === null) return;
      limpiarConsola();
      paso('', 'GET', '/productos/' + editando + '/cancelar → 200 OK',
        'vuelve la fila original: no se modificó nada');
      editando = null;
      errores = {};
      form.classList.remove('visible');
      aviso.style.display = '';
      pintarCatalogo();
    });
  }

  if (btnReiniciar) {
    btnReiniciar.addEventListener('click', () => {
      productos = PRODUCTOS_LAB.map(p => ({ ...p }));
      editando = null;
      errores = {};
      form.reset();
      form.classList.remove('visible');
      aviso.style.display = '';
      mostrarErrores();
      limpiarConsola();
      pintarCatalogo();
    });
  }

  /* ---------- estado inicial ---------- */
  limpiarConsola();
  pintarCatalogo();
}
