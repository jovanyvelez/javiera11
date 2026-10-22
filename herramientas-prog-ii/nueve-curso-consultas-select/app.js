/* ============================================================
   CLASE nueve — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "Consulta de datos con sentencias SELECT. Visualización
   de resultados en el navegador."
   Lógica de navegación, cuestionarios, progreso, soluciones
   plegables y un playground de SELECT con tabla en vivo.
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
  configurarPlayground();
  configurarTeclado();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-9-consultas-select';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura: la tienda que no sabe',
  'SELECT: elegir qué mostrar',
  'WHERE: filtrar con criterio',
  'Ordenar, limitar y resumir',
  'Intervalo',
  'Actividad: de la consulta a la ruta',
  'Del JSON al navegador',
  'Taller: catálogo consultable'
];

/* Constancia que se otorga al completar cada unidad. */
const BADGES_MODULO = {
  1: 'Columnas bajo control',
  2: 'Filtros con criterio',
  3: 'Orden y resumen',
  5: 'Ruta consultora',
  6: 'Tabla en el navegador',
  7: 'Catálogo consultable'
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
    otorgarBadge('Consultas que se ven');
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

/* ---------- PLAYGROUND DE SELECT ----------
   Tabla simulada de productos del club. Cada botón ejecuta
   una consulta equivalente y pinta el resultado como lo haría
   el navegador: primero el JSON, después la tabla HTML.
--------------------------------------------- */
const PRODUCTOS_DEMO = [
  { id: 1, nombre: 'Sensor ultrasónico', categoria: 'sensores', precio: 42000, stock: 18, activo: true },
  { id: 2, nombre: 'Sensor de temperatura', categoria: 'sensores', precio: 28000, stock: 4, activo: true },
  { id: 3, nombre: 'Kit robot seguidor', categoria: 'kits', precio: 185000, stock: 2, activo: true },
  { id: 4, nombre: 'Motorreductor DC', categoria: 'motores', precio: 36000, stock: 11, activo: true },
  { id: 5, nombre: 'Placa Arduino Uno', categoria: 'placas', precio: 95000, stock: 0, activo: false },
  { id: 6, nombre: 'Sensor ultrasónico', categoria: 'sensores', precio: 42000, stock: 18, activo: true },
  { id: 7, nombre: 'Batería LiPo 11.1V', categoria: 'energia', precio: 78000, stock: 6, activo: true },
  { id: 8, nombre: 'Motorreductor DC', categoria: 'motores', precio: 36000, stock: 11, activo: true },
  { id: 9, nombre: 'Rueda de goma 65mm', categoria: 'motores', precio: 12000, stock: 30, activo: true },
  { id: 10, nombre: 'Placa ESP32', categoria: 'placas', precio: 62000, stock: 9, activo: true }
];

const CONSULTAS_DEMO = {
  todas: {
    sql: 'SELECT id, nombre, categoria, precio, stock\nFROM productos\nORDER BY id;',
    titulo: 'Todas las filas y cinco columnas',
    filas: () => PRODUCTOS_DEMO.map(p => ({ id: p.id, nombre: p.nombre, categoria: p.categoria, precio: p.precio, stock: p.stock }))
  },
  baratos: {
    sql: "SELECT nombre, precio, stock\nFROM productos\nWHERE precio < 50000\nORDER BY precio;",
    titulo: 'Filtro WHERE: precio menor que 50 000',
    filas: () => PRODUCTOS_DEMO
      .filter(p => p.precio < 50000)
      .map(p => ({ nombre: p.nombre, precio: p.precio, stock: p.stock }))
      .sort((a, b) => a.precio - b.precio)
  },
  distinct: {
    sql: 'SELECT DISTINCT categoria\nFROM productos\nORDER BY categoria;',
    titulo: 'DISTINCT: categorías sin repetir',
    filas: () => {
      const vistas = new Set();
      const out = [];
      PRODUCTOS_DEMO.forEach(p => {
        if (!vistas.has(p.categoria)) {
          vistas.add(p.categoria);
          out.push({ categoria: p.categoria });
        }
      });
      return out.sort((a, b) => a.categoria.localeCompare(b.categoria));
    }
  },
  resumen: {
    sql: 'SELECT categoria,\n       COUNT(*) AS unidades,\n       ROUND(AVG(precio)) AS precio_medio\nFROM productos\nGROUP BY categoria\nORDER BY unidades DESC;',
    titulo: 'GROUP BY: resumen por categoría',
    filas: () => {
      const grupos = {};
      PRODUCTOS_DEMO.forEach(p => {
        if (!grupos[p.categoria]) grupos[p.categoria] = { categoria: p.categoria, unidades: 0, suma: 0 };
        grupos[p.categoria].unidades += 1;
        grupos[p.categoria].suma += p.precio;
      });
      return Object.values(grupos)
        .map(g => ({ categoria: g.categoria, unidades: g.unidades, precio_medio: Math.round(g.suma / g.unidades) }))
        .sort((a, b) => b.unidades - a.unidades || a.categoria.localeCompare(b.categoria));
    }
  },
  limite: {
    sql: 'SELECT nombre, precio\nFROM productos\nORDER BY precio DESC\nLIMIT 3;',
    titulo: 'ORDER BY + LIMIT: los tres más caros',
    filas: () => PRODUCTOS_DEMO
      .map(p => ({ nombre: p.nombre, precio: p.precio }))
      .sort((a, b) => b.precio - a.precio)
      .slice(0, 3)
  },
  vacio: {
    sql: "SELECT id, nombre\nFROM productos\nWHERE categoria = 'drones';",
    titulo: 'Resultado vacío: la consulta funciona, no hay filas',
    filas: () => []
  }
};

function configurarPlayground() {
  const root = document.querySelector('[data-playground]');
  if (!root) return;

  const botones = root.querySelectorAll('[data-consulta]');
  botones.forEach(btn => {
    btn.addEventListener('click', () => {
      botones.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      ejecutarConsultaDemo(root, btn.dataset.consulta);
    });
  });

  if (botones.length) {
    botones[0].classList.add('activo');
    ejecutarConsultaDemo(root, botones[0].dataset.consulta);
  }
}

function ejecutarConsultaDemo(root, clave) {
  const dato = CONSULTAS_DEMO[clave];
  if (!dato) return;

  const sqlEl = root.querySelector('[data-playground-sql]');
  const jsonEl = root.querySelector('[data-playground-json]');
  const tablaEl = root.querySelector('[data-playground-tabla]');
  const metaEl = root.querySelector('[data-playground-meta]');
  const vacioEl = root.querySelector('[data-playground-vacio]');

  const filas = dato.filas();
  const columnas = filas.length ? Object.keys(filas[0]) : [];

  if (sqlEl) sqlEl.textContent = dato.sql;
  if (metaEl) metaEl.textContent = dato.titulo;

  if (jsonEl) {
    jsonEl.textContent = filas.length
      ? JSON.stringify(filas, null, 2)
      : '[]';
  }

  if (vacioEl) vacioEl.classList.toggle('oculto', filas.length > 0);

  if (!tablaEl) return;
  tablaEl.innerHTML = '';

  if (!filas.length) {
    tablaEl.classList.add('oculto');
    return;
  }
  tablaEl.classList.remove('oculto');

  const thead = document.createElement('thead');
  const trH = document.createElement('tr');
  columnas.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c;
    trH.appendChild(th);
  });
  thead.appendChild(trH);
  tablaEl.appendChild(thead);

  const tbody = document.createElement('tbody');
  filas.forEach(fila => {
    const tr = document.createElement('tr');
    columnas.forEach(c => {
      const td = document.createElement('td');
      td.textContent = fila[c] === null || fila[c] === undefined ? 'NULL' : String(fila[c]);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  tablaEl.appendChild(tbody);
}
