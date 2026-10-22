/* ============================================================
   CLASE quince — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "Estructuración general del sistema CRUD: organización
   básica por carpetas y archivos"
   Lógica de navegación, cuestionarios, progreso y laboratorio
   del organizador de archivos.
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
  configurarOrganizador();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-15-estructura';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura y programa',
  'El APIRouter: un router por archivo',
  'Qué archivo va en cada carpeta',
  'Unir las piezas con include_router',
  'Intervalo',
  'Ejercicio: partir main.py en routers',
  'Ejercicio: prefijos y dependencias',
  'Taller: el proyecto estructurado'
];

/* Constancia que se otorga al completar cada unidad. */
const BADGES_MODULO = {
  1: 'El APIRouter',
  2: 'Carpetas con sentido',
  3: 'include_router',
  5: 'Routers por archivo',
  6: 'Prefijos y dependencias',
  7: 'Proyecto estructurado'
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
    otorgarBadge('Proyecto estructurado');
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
   LABORATORIO DEL ORGANIZADOR DE ARCHIVOS
   Reparte los bloques de un main.py gigante entre las carpetas
   del proyecto estructurado. Cada bloque tiene una casa
   correcta: el archivo donde debe vivir según su responsabilidad.
============================================================ */
const CARPETAS_PROYECTO = [
  { id: 'main', etiqueta: 'app/main.py', nota: 'la app: crea FastAPI e incluye los routers' },
  { id: 'config', etiqueta: 'app/config.py', nota: 'la configuración que lee el entorno' },
  { id: 'database', etiqueta: 'app/database.py', nota: 'el pool de conexiones a PostgreSQL' },
  { id: 'esquemas', etiqueta: 'app/esquemas.py', nota: 'los modelos de Pydantic' },
  { id: 'repositorio', etiqueta: 'app/repositorio.py', nota: 'las consultas SQL' },
  { id: 'dependencias', etiqueta: 'app/dependencias.py', nota: 'las dependencias compartidas' },
  { id: 'routers', etiqueta: 'app/routers/productos.py', nota: 'las rutas del router de productos' }
];

const BLOQUES_ESTRUCTURA = [
  {
    id: 'app',
    titulo: 'La aplicación y sus routers',
    destino: 'main',
    codigo: 'app = FastAPI(title="TechStore")\napp.include_router(productos.router)'
  },
  {
    id: 'config',
    titulo: 'La cadena de conexión',
    destino: 'config',
    codigo: 'DATABASE_URL = os.environ["DATABASE_URL"]'
  },
  {
    id: 'pool',
    titulo: 'El pool de conexiones',
    destino: 'database',
    codigo: 'pool = await asyncpg.create_pool(dsn=DATABASE_URL)'
  },
  {
    id: 'modelo',
    titulo: 'El modelo de datos',
    destino: 'esquemas',
    codigo: 'class ProductoActualizar(BaseModel):\n    nombre: str = Field(min_length=1, max_length=100)'
  },
  {
    id: 'consulta',
    titulo: 'La consulta de lectura',
    destino: 'repositorio',
    codigo: 'async def obtener_productos(conn) -> list[dict]:\n    filas = await conn.fetch("SELECT id, nombre FROM productos")'
  },
  {
    id: 'dependencia',
    titulo: 'La dependencia que cede una conexión',
    destino: 'dependencias',
    codigo: 'async def get_connection():\n    async with db.pool.acquire() as conn:\n        yield conn'
  },
  {
    id: 'router',
    titulo: 'El router y su primera ruta',
    destino: 'routers',
    codigo: 'router = APIRouter()\n\n@router.get("/productos")\nasync def listar_productos(conn: ConnectionDep): ...'
  },
  {
    id: 'respuesta',
    titulo: 'La respuesta con la plantilla',
    destino: 'routers',
    codigo: 'return templates.TemplateResponse(\n    request=request, name="productos.html", context={"productos": productos}\n)'
  }
];

function configurarOrganizador() {
  const raiz = document.querySelector('[data-organizador]');
  if (!raiz) return;

  const zonaBloques = raiz.querySelector('[data-org-bloques]');
  const zonaArbol = raiz.querySelector('[data-org-arbol]');
  const veredicto = raiz.querySelector('[data-org-veredicto]');
  const btnComprobar = raiz.querySelector('[data-org-comprobar]');
  const btnReiniciar = raiz.querySelector('[data-org-reiniciar]');

  /* destino elegido por cada bloque */
  const asignaciones = {};
  BLOQUES_ESTRUCTURA.forEach(b => { asignaciones[b.id] = null; });

  function pintarBloques() {
    zonaBloques.textContent = '';
    BLOQUES_ESTRUCTURA.forEach(bloque => {
      const caja = document.createElement('div');
      caja.className = 'org-bloque';
      caja.dataset.bloque = bloque.id;

      const titulo = document.createElement('h5');
      titulo.textContent = bloque.titulo;
      caja.appendChild(titulo);

      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = bloque.codigo;
      pre.appendChild(code);
      caja.appendChild(pre);

      const destinos = document.createElement('div');
      destinos.className = 'org-destinos';
      CARPETAS_PROYECTO.forEach(carpeta => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'org-destino';
        boton.dataset.carpeta = carpeta.id;
        boton.textContent = carpeta.etiqueta.replace('app/', '');
        if (asignaciones[bloque.id] === carpeta.id) boton.classList.add('elegido');
        boton.addEventListener('click', () => {
          asignaciones[bloque.id] = carpeta.id;
          limpiarVeredicto();
          pintarSeleccion();
          pintarArbol();
        });
        destinos.appendChild(boton);
      });
      caja.appendChild(destinos);

      zonaBloques.appendChild(caja);
    });
  }

  /* Actualiza solo la marca visual: no se reconstruye el DOM al elegir. */
  function pintarSeleccion() {
    zonaBloques.querySelectorAll('.org-bloque').forEach(caja => {
      const id = caja.dataset.bloque;
      caja.querySelectorAll('.org-destino').forEach(b => {
        b.classList.toggle('elegido', b.dataset.carpeta === asignaciones[id]);
      });
    });
  }

  function pintarArbol() {
    zonaArbol.textContent = '';
    const raizArbol = document.createElement('div');
    raizArbol.innerHTML = '<span class="org-carpeta">tienda/</span>';
    zonaArbol.appendChild(raizArbol);

    CARPETAS_PROYECTO.forEach(carpeta => {
      const linea = document.createElement('div');
      linea.innerHTML = '├── <span class="org-archivo">' + carpeta.etiqueta.replace('app/', '') + '</span>';
      zonaArbol.appendChild(linea);

      const asignados = BLOQUES_ESTRUCTURA.filter(b => asignaciones[b.id] === carpeta.id);
      const lista = document.createElement('ul');
      lista.className = 'org-contenido';
      if (asignados.length === 0) {
        const li = document.createElement('li');
        li.className = 'org-vacio-carpeta';
        li.textContent = 'vacío';
        lista.appendChild(li);
      } else {
        asignados.forEach(b => {
          const li = document.createElement('li');
          li.textContent = b.titulo;
          lista.appendChild(li);
        });
      }
      zonaArbol.appendChild(lista);
    });
  }

  function limpiarVeredicto() {
    veredicto.className = 'org-veredicto';
    veredicto.textContent = 'Pulsa «Comprobar» cuando hayas repartido los ocho bloques.';
    zonaBloques.querySelectorAll('.org-bloque').forEach(b => {
      b.classList.remove('aceptado', 'rechazado');
    });
    zonaBloques.querySelectorAll('.org-destino').forEach(d => {
      d.classList.remove('correcto', 'incorrecto');
    });
  }

  function comprobar() {
    let aciertos = 0;
    BLOQUES_ESTRUCTURA.forEach(bloque => {
      const caja = zonaBloques.querySelector('[data-bloque="' + bloque.id + '"]');
      const elegida = asignaciones[bloque.id];
      const botones = caja.querySelectorAll('.org-destino');
      botones.forEach(b => {
        b.classList.remove('correcto', 'incorrecto');
        if (b.dataset.carpeta === bloque.destino) b.classList.add('correcto');
        else if (b.dataset.carpeta === elegida) b.classList.add('incorrecto');
      });
      if (elegida === bloque.destino) {
        aciertos++;
        caja.classList.add('aceptado');
        caja.classList.remove('rechazado');
      } else {
        caja.classList.add('rechazado');
        caja.classList.remove('aceptado');
      }
    });

    veredicto.className = 'org-veredicto ' + (aciertos === BLOQUES_ESTRUCTURA.length ? 'ok' : 'mal');
    if (aciertos === BLOQUES_ESTRUCTURA.length) {
      veredicto.textContent = 'Perfecto: los ' + BLOQUES_ESTRUCTURA.length +
        ' bloques están en su archivo. El proyecto ya tiene estructura.';
    } else {
      veredicto.textContent = aciertos + ' de ' + BLOQUES_ESTRUCTURA.length +
        ' bloques bien colocados. En verde, el archivo correcto de cada bloque; en rojo, el que elegiste.';
    }
    pintarArbol();
  }

  if (btnComprobar) btnComprobar.addEventListener('click', comprobar);
  if (btnReiniciar) {
    btnReiniciar.addEventListener('click', () => {
      BLOQUES_ESTRUCTURA.forEach(b => { asignaciones[b.id] = null; });
      limpiarVeredicto();
      pintarBloques();
      pintarArbol();
    });
  }

  limpiarVeredicto();
  pintarBloques();
  pintarArbol();
}
