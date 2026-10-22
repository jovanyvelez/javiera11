/* ============================================================
   CLASE ocho — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "Conexión a bases de datos: configurar el acceso desde
   el backend, validar la conexión y diagnosticar errores"
   Lógica de navegación, cuestionarios, progreso y diagnóstico
   interactivo de errores de conexión.
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
  configurarDiagnostico();
  configurarTeclado();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-8-conexion-bd';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura: la app que olvida',
  'PostgreSQL y el driver',
  'El pool de conexiones',
  'Lifespan y dependencia',
  'Intervalo',
  'Actividad: conectar la API',
  'Errores comunes',
  'Taller: capa de datos robusta'
];

/* Constancia que se otorga al completar cada unidad. */
const BADGES_MODULO = {
  1: 'El driver asyncpg',
  2: 'Pool de conexiones',
  3: 'Lifespan y dependencia',
  5: 'API conectada',
  6: 'Diagnóstico de errores',
  7: 'Capa de datos robusta'
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
    otorgarBadge('Conexión estable');
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

/* ---------- DIAGNÓSTICO DE ERRORES DE CONEXIÓN ---------- */
const DIAGNOSTICOS = {
  password: {
    tipo: 'Autenticación',
    excepcion: 'asyncpg.exceptions.InvalidPasswordError',
    sqlstate: '28P01',
    significado: 'El usuario existe, pero la contraseña no coincide. El servidor rechazó la autenticación antes de abrir la conexión.',
    pista: 'Revisa la contraseña en DATABASE_URL. Si tiene @, :, / o #, codifícala con %40, %3A, %2F o %23. Comprueba también que estás usando la contraseña del usuario correcto.'
  },
  database: {
    tipo: 'Configuración',
    excepcion: 'asyncpg.exceptions.InvalidCatalogNameError',
    sqlstate: '3D000',
    significado: 'El usuario y la contraseña son correctos, pero la base de datos indicada en la URL no existe.',
    pista: 'Comprueba el último segmento de la DSN: postgresql://club:clave@localhost:5432/club. Créala con createdb club o con CREATE DATABASE club; y ejecuta el esquema.'
  },
  refused: {
    tipo: 'Red',
    excepcion: 'ConnectionRefusedError (OSError)',
    sqlstate: '—',
    significado: 'Nadie está escuchando en el host y el puerto indicados. La petición ni siquiera llegó a PostgreSQL.',
    pista: 'Comprueba que el contenedor o el servicio está arriba (docker compose ps, pg_isready) y que el puerto es 5432 o el que publicaste. Dentro de Docker, localhost es el contenedor, no tu máquina: usa el nombre del servicio (db).'
  },
  dns: {
    tipo: 'Red',
    excepcion: 'socket.gaierror',
    sqlstate: '—',
    significado: 'El nombre del host no se pudo resolver. La URL apunta a un nombre que no existe o que no es visible desde este entorno.',
    pista: 'Revisa el host de la DSN. Si es un servicio de Docker Compose, debe llamarse igual que el servicio; si es un servidor remoto, comprueba que el DNS responde (ping, nslookup).'
  },
  timeout: {
    tipo: 'Red',
    excepcion: 'TimeoutError / asyncio.TimeoutError',
    sqlstate: '—',
    significado: 'La conexión se quedó esperando y superó el tiempo máximo. Puede ser un firewall, una red lenta o un servidor saturado.',
    pista: 'Sube timeout solo si la red es lenta de verdad. Revisa firewall, VPN y la carga del servidor. Para consultas lentas, ajusta command_timeout y revisa los índices.'
  },
  pool: {
    tipo: 'Pool',
    excepcion: 'PoolNotReadyError / TimeoutError al adquirir',
    sqlstate: '—',
    significado: 'El pool no se creó, o todas sus conexiones están ocupadas y la espera superó el límite de acquire().',
    pista: 'Comprueba que el lifespan abrió el pool antes de atender. Si está lleno, busca conexiones que no se devuelven: usa async with y no retengas una conexión durante una llamada externa. Ajusta max_size solo con evidencia.'
  },
  relation: {
    tipo: 'SQL',
    excepcion: 'asyncpg.exceptions.UndefinedTableError',
    sqlstate: '42P01',
    significado: 'La conexión funciona, pero la tabla que consulta el SQL no existe en esa base de datos.',
    pista: 'Ejecuta el esquema en la base correcta (psql "$DATABASE_URL" -f sql/schema.sql). Recuerda que cada base de datos tiene sus propias tablas; no es lo mismo club que postgres.'
  },
  unique: {
    tipo: 'SQL',
    excepcion: 'asyncpg.exceptions.UniqueViolationError',
    sqlstate: '23505',
    significado: 'El dato cumple el tipo, pero rompe una restricción UNIQUE: ya existe una fila con ese valor.',
    pista: 'No es un error de conexión: es una regla del negocio. Captúralo y responde 409 Conflict con un mensaje claro, o usa ON CONFLICT si el diseño lo permite.'
  },
  canceled: {
    tipo: 'SQL',
    excepcion: 'asyncpg.exceptions.QueryCanceledError',
    sqlstate: '57014',
    significado: 'La consulta superó command_timeout y el servidor la canceló. La conexión sigue viva, pero el trabajo no terminó.',
    pista: 'Revisa el plan con EXPLAIN ANALYZE, añade índices o reduce el rango. Si la consulta es legítimamente larga, súbela a una tarea en segundo plano.'
  }
};

function configurarDiagnostico() {
  const root = document.querySelector('[data-diag]');
  if (!root) return;

  const botones = root.querySelectorAll('[data-diag-op]');
  botones.forEach(btn => {
    btn.addEventListener('click', () => {
      botones.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      mostrarDiagnostico(root, DIAGNOSTICOS[btn.dataset.diagOp]);
    });
  });

  if (botones.length) {
    botones[0].classList.add('activo');
    mostrarDiagnostico(root, DIAGNOSTICOS[botones[0].dataset.diagOp]);
  }
}

function mostrarDiagnostico(root, dato) {
  if (!dato) return;
  const estado = root.querySelector('[data-diag-estado]');
  const excepcion = root.querySelector('[data-diag-excepcion]');
  const sqlstate = root.querySelector('[data-diag-sqlstate]');
  const significado = root.querySelector('[data-diag-significado]');
  const pista = root.querySelector('[data-diag-fix]');

  if (estado) {
    estado.className = 'diag-estado error';
    estado.textContent = dato.tipo + ' · error detectado';
  }
  if (excepcion) excepcion.textContent = dato.excepcion;
  if (sqlstate) sqlstate.textContent = dato.sqlstate;
  if (significado) significado.textContent = dato.significado;
  if (pista) pista.textContent = dato.pista;
}
