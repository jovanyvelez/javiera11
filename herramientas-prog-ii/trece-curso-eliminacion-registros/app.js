/* ============================================================
   CLASE trece — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "Eliminación de registros: confirmaciones, DELETE
   parametrizado y control de errores"
   Lógica de navegación, cuestionarios, progreso y laboratorio
   de confirmación y borrado seguro.
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
  configurarBorrado();
  configurarTeclado();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-13-eliminacion';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura: borrar no tiene deshacer',
  'Confirmar antes de borrar',
  'El DELETE seguro',
  'Integridad y borrado lógico',
  'Intervalo',
  'Actividad: eliminar productos',
  'Errores y confirmaciones',
  'Taller: borrado robusto'
];

/* Constancia que se otorga al completar cada unidad. */
const BADGES_MODULO = {
  1: 'Confirmación',
  2: 'DELETE parametrizado',
  3: 'Integridad',
  5: 'Producto eliminado',
  6: 'Errores controlados',
  7: 'Borrado robusto'
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
    otorgarBadge('Borrado seguro');
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

/* ---------- LABORATORIO DE CONFIRMACIÓN Y BORRADO ---------- */
function configurarBorrado() {
  const root = document.querySelector('[data-del]');
  if (!root) return;

  const fila = root.querySelector('[data-del-fila]');
  const abrir = root.querySelector('[data-del-abrir]');
  const confirmacion = root.querySelector('[data-del-confirmacion]');
  const escenario = root.querySelector('[data-del-escenario]');
  const cancelar = root.querySelector('[data-del-cancelar]');
  const confirmar = root.querySelector('[data-del-confirmar]');
  const reiniciar = root.querySelector('[data-del-reiniciar]');
  const estado = root.querySelector('[data-del-estado]');
  const capa = root.querySelector('[data-del-capa]');
  const json = root.querySelector('[data-del-json]');
  const sql = root.querySelector('[data-del-sql]');
  const peticion = root.querySelector('[data-del-peticion]');

  function reiniciarPanel() {
    estado.className = 'lab-estado neutro';
    estado.textContent = 'Esperando una decisión…';
    capa.textContent = 'Capa: —';
    json.textContent = '{\n  "detail": "Aún no hay ninguna petición."\n}';
    sql.textContent = '-- El DELETE aparecerá aquí cuando confirmes.';
    peticion.textContent = 'Petición enviada: NO';
  }

  abrir.addEventListener('click', () => {
    confirmacion.hidden = false;
    estado.className = 'lab-estado neutro';
    estado.textContent = 'Confirmación abierta · todavía no se envió nada';
    capa.textContent = 'Capa: navegador';
    json.textContent = '{\n  "detail": "El usuario aún no confirmó."\n}';
    sql.textContent = '-- Todavía no se ejecutó ningún DELETE.';
    peticion.textContent = 'Petición enviada: NO';
  });

  cancelar.addEventListener('click', () => {
    confirmacion.hidden = true;
    estado.className = 'lab-estado neutro';
    estado.textContent = 'Cancelado · no se envió ninguna petición';
    capa.textContent = 'Capa: navegador';
    json.textContent = '{\n  "detail": "El usuario canceló la operación."\n}';
    sql.textContent = '-- No se ejecutó ningún DELETE.';
    peticion.textContent = 'Petición enviada: NO';
  });

  confirmar.addEventListener('click', () => {
    confirmacion.hidden = true;
    const caso = escenario.value;
    const sqlBase = `DELETE FROM productos
WHERE id = $1;

-- $1 = 5`;

    if (caso === 'normal') {
      estado.className = 'lab-estado ok';
      estado.textContent = 'HTTP 200 · producto eliminado';
      capa.textContent = 'Capa: PostgreSQL';
      json.textContent = JSON.stringify({ detail: 'Producto eliminado correctamente.' }, null, 2);
      sql.textContent = sqlBase + '\n\n-- DELETE 1';
      peticion.textContent = 'Petición enviada: DELETE /productos/5';
      fila.innerHTML = '<strong>Producto eliminado correctamente.</strong>';
      abrir.disabled = true;
      return;
    }

    if (caso === 'missing') {
      estado.className = 'lab-estado error';
      estado.textContent = 'HTTP 404 · producto no encontrado';
      capa.textContent = 'Capa: Aplicación';
      json.textContent = JSON.stringify({ detail: 'No se encontró el producto con id 5.' }, null, 2);
      sql.textContent = sqlBase + '\n\n-- DELETE 0';
      peticion.textContent = 'Petición enviada: DELETE /productos/5';
      return;
    }

    if (caso === 'fk') {
      estado.className = 'lab-estado error';
      estado.textContent = 'HTTP 409 · no se puede eliminar';
      capa.textContent = 'Capa: PostgreSQL';
      json.textContent = JSON.stringify({ detail: 'No se puede eliminar: el producto tiene pedidos asociados.' }, null, 2);
      sql.textContent = sqlBase + '\n\n-- RestrictViolationError · SQLSTATE 23001';
      peticion.textContent = 'Petición enviada: DELETE /productos/5';
      return;
    }

    estado.className = 'lab-estado error';
    estado.textContent = 'HTTP 500 · error interno';
    capa.textContent = 'Capa: PostgreSQL';
    json.textContent = JSON.stringify({ detail: 'Error al eliminar el producto.' }, null, 2);
    sql.textContent = sqlBase + '\n\n-- error de conexión o de SQL';
    peticion.textContent = 'Petición enviada: DELETE /productos/5';
  });

  reiniciar.addEventListener('click', () => {
    confirmacion.hidden = true;
    escenario.value = 'normal';
    abrir.disabled = false;
    fila.innerHTML = '<strong>Teclado mecánico</strong> · $189.900 · 12 unidades';
    reiniciarPanel();
  });

  reiniciarPanel();
}
