/* ============================================================
   CLASE seis B — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "Objetos en Python: clases, instancias, métodos,
   validación y el puente hacia Pydantic y los ORM"
   Lógica de navegación, cuestionarios, progreso y laboratorio
   de objetos con estado, métodos y validación.
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
  configurarObjetos();
  configurarTeclado();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-6b-objetos';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura: datos que saben',
  'Clase y objeto',
  'Métodos y estado',
  'Validar el objeto',
  'Intervalo',
  'Herencia, Pydantic y ORM',
  'Errores de diseño',
  'Taller: modelo de dominio'
];

/* Constancia que se otorga al completar cada unidad. */
const BADGES_MODULO = {
  1: 'Primer objeto',
  2: 'Estado y métodos',
  3: 'Invariantes',
  5: 'Puente a Pydantic',
  6: 'Diseño limpio',
  7: 'Modelo de dominio'
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
    otorgarBadge('Objetos listos');
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

/* ---------- LABORATORIO DE OBJETOS ---------- */
function configurarObjetos() {
  const root = document.querySelector('[data-obj]');
  if (!root) return;

  class Producto {
    constructor(nombre, precio, cantidad) {
      if (typeof nombre !== 'string' || nombre.trim() === '') {
        throw new Error('El nombre no puede estar vacío.');
      }
      const precioNum = Number(precio);
      const cantidadNum = Number(cantidad);
      if (!Number.isFinite(precioNum) || precioNum <= 0) {
        throw new Error('El precio debe ser un número mayor que cero.');
      }
      if (!Number.isInteger(cantidadNum) || cantidadNum < 0) {
        throw new Error('La cantidad debe ser un entero mayor o igual que cero.');
      }
      this.nombre = nombre.trim();
      this.precio = precioNum;
      this.cantidad = cantidadNum;
    }

    valor_total() {
      return this.precio * this.cantidad;
    }

    aplicar_descuento(porcentaje) {
      const p = Number(porcentaje);
      if (!Number.isFinite(p) || p < 0 || p > 100) {
        throw new Error('El descuento debe estar entre 0 y 100.');
      }
      this.precio = Math.round(this.precio * (1 - p / 100));
      return this.precio;
    }

    vender(unidades) {
      const u = Number(unidades);
      if (!Number.isInteger(u) || u <= 0) {
        throw new Error('Las unidades deben ser un entero positivo.');
      }
      if (u > this.cantidad) {
        throw new Error(`No hay stock suficiente: quedan ${this.cantidad} unidades.`);
      }
      this.cantidad -= u;
      return this.cantidad;
    }

    reponer(unidades) {
      const u = Number(unidades);
      if (!Number.isInteger(u) || u <= 0) {
        throw new Error('Las unidades deben ser un entero positivo.');
      }
      this.cantidad += u;
      return this.cantidad;
    }

    toString() {
      return `Producto("${this.nombre}", ${this.precio}, ${this.cantidad})`;
    }
  }

  const form = root.querySelector('[data-obj-form]');
  const nombre = root.querySelector('[data-obj-nombre]');
  const precio = root.querySelector('[data-obj-precio]');
  const cantidad = root.querySelector('[data-obj-cantidad]');
  const repr = root.querySelector('[data-obj-repr]');
  const estado = root.querySelector('[data-obj-estado]');
  const json = root.querySelector('[data-obj-json]');
  const historial = root.querySelector('[data-obj-historial]');
  const lista = root.querySelector('[data-obj-lista]');
  const acciones = root.querySelectorAll('[data-obj-accion]');

  let objetos = [];
  let actual = -1;
  let eventos = [];

  function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function log(texto) {
    eventos.unshift(texto);
    eventos = eventos.slice(0, 6);
  }

  function actualizar(mensaje = '', tipo = '') {
    const producto = actual >= 0 ? objetos[actual] : null;
    repr.textContent = producto ? producto.toString() : 'Producto(...)';
    estado.className = 'obj-estado ' + tipo;
    estado.textContent = mensaje || (producto
      ? 'Objeto listo. Llama a un método y observa cómo cambia su estado.'
      : 'Todavía no hay ningún objeto. Crea el primero.');

    json.textContent = producto
      ? JSON.stringify({
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: producto.cantidad,
          valor_total: producto.valor_total()
        }, null, 2)
      : '{\n  "detail": "Crea un objeto para ver su estado."\n}';

    historial.textContent = eventos.length ? eventos.join('\n') : '-- sin operaciones todavía';
  }

  function renderLista() {
    lista.innerHTML = objetos.length
      ? objetos.map((p, i) => `<button type="button" class="obj-chip ${i === actual ? 'activo' : ''}" data-obj-select="${i}">${escapar(p.toString())}</button>`).join('')
      : '<span class="obj-vacio">La lista de objetos está vacía.</span>';

    acciones.forEach((b) => { b.disabled = actual < 0; });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      const producto = new Producto(nombre.value, precio.value, cantidad.value);
      objetos.push(producto);
      actual = objetos.length - 1;
      log(`Producto(...) → ${producto.toString()}`);
      renderLista();
      actualizar('Objeto creado. Cada instancia tiene sus propios atributos.', 'ok');
    } catch (error) {
      actualizar(error.message, 'error');
    }
  });

  root.addEventListener('click', (e) => {
    const select = e.target.closest('[data-obj-select]');
    const accion = e.target.closest('[data-obj-accion]');
    const ejemplo = e.target.closest('[data-obj-ejemplo]');
    const reiniciar = e.target.closest('[data-obj-reiniciar]');

    if (select) {
      actual = Number(select.dataset.objSelect);
      renderLista();
      actualizar(`Seleccionaste ${objetos[actual].toString()}.`, 'ok');
      return;
    }

    if (ejemplo) {
      nombre.value = '';
      precio.value = '-1';
      cantidad.value = '-2';
      actualizar('Los valores del ejemplo son inválidos. Pulsa «Crear objeto» para ver el error.', '');
      return;
    }

    if (reiniciar) {
      objetos = [];
      actual = -1;
      eventos = [];
      nombre.value = 'Teclado mecánico';
      precio.value = '189900';
      cantidad.value = '12';
      renderLista();
      actualizar();
      return;
    }

    if (!accion || actual < 0) return;

    try {
      const producto = objetos[actual];
      if (accion.dataset.objAccion === 'descuento') {
        const nuevo = producto.aplicar_descuento(10);
        log(`aplicar_descuento(10) → precio ${nuevo}`);
        actualizar('Se aplicó un descuento del 10 %. El objeto cambió su propio precio.', 'ok');
      } else if (accion.dataset.objAccion === 'vender') {
        const quedan = producto.vender(1);
        log(`vender(1) → quedan ${quedan}`);
        actualizar(`Se vendió una unidad. Quedan ${quedan}.`, 'ok');
      } else if (accion.dataset.objAccion === 'reponer') {
        const quedan = producto.reponer(5);
        log(`reponer(5) → quedan ${quedan}`);
        actualizar(`Se repusieron cinco unidades. Quedan ${quedan}.`, 'ok');
      }
      renderLista();
    } catch (error) {
      actualizar(error.message, 'error');
      historial.textContent = eventos.length ? eventos.join('\n') : '-- sin operaciones todavía';
    }
  });

  renderLista();
  actualizar();
}
