/* ============================================================
   CLASE diecisiete — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "GitHub: publica tu código. Remoto, push/pull, README,
   Pull Requests e issues, y tu perfil como portafolio."
   Navegación, cuestionarios, soluciones, viaje del commit y
   checklist del taller.
============================================================ */

const TOTAL_MODULOS = 8;

const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  badges: new Set(),
  checklist: {}
};

document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarCopiarCodigo();
  configurarQuizzes();
  configurarSoluciones();
  configurarViaje();
  configurarChecklist();
  configurarTeclado();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-17-github';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura: tu código en la nube',
  'Git vs GitHub y el remoto',
  'El primer push y el ciclo',
  'README, licencia y perfil',
  'Intervalo',
  'Actividad: publicar la biblioteca',
  'Colaborar: PR e issues',
  'Taller: tu portafolio en GitHub'
];

const BADGES_MODULO = {
  1: 'Remoto conectado',
  2: 'Primer push',
  3: 'Vitrina lista',
  5: 'Biblioteca publicada',
  6: 'Colaboración con PR',
  7: 'Portafolio en GitHub'
};

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    const datos = {
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      badges: [...estado.badges],
      checklist: estado.checklist
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
    estado.checklist = datos.checklist || {};
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
    otorgarBadge('Código en la nube');
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
  estado.checklist = {};
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

/* ---------- VIAJE DEL COMMIT ----------
   Seis paradas del disco a la nube y de vuelta.
   Cada parada muestra qué pasa, un comando y por qué importa.
--------------------------------------------- */
const PARADAS = [
  {
    n: '1',
    titulo: 'En tu compu — Git local',
    que: 'Tu proyecto y la carpeta .git/ con el historial: commits, ramas, mensajes. Todo lo de la clase 16 ya ocurrió aquí. Todavía nadie más puede verlo.',
    comando: 'git log --oneline\n# 9f3c2b1 (HEAD -> main) Corregir título del README\n# 4a8e7d2 Agregar página de préstamos\n# c1d9f3e Primer commit: proyecto biblioteca',
    porque: 'El viaje siempre empieza con un commit local. Sin fotos en el álbum no hay nada que subir.'
  },
  {
    n: '2',
    titulo: 'La dirección — el remote',
    que: 'Le dices a Git que hay otra copia del álbum en esta URL, y le pones el apodo origin. Es guardar un contacto: se hace una vez y queda en la configuración del repo.',
    comando: 'git remote add origin https://github.com/tuusuario/biblioteca.git\ngit remote -v\n# origin  https://github.com/tuusuario/biblioteca.git (push)\n# origin  https://github.com/tuusuario/biblioteca.git (pull)',
    porque: '«origin» es solo el apodo tradicional. Podrías llamarlo «mi-nube»; el mundo dice origin, y conviene seguirlo.'
  },
  {
    n: '3',
    titulo: 'El viaje — git push',
    que: 'Empacas los commits que la nube no tiene y los envías a origin. La primera vez, GitHub te pide identificarte en el navegador.',
    comando: 'git push -u origin main\n# Enumerating objects: 42, done.\n# Writing objects: 100% (42/42), 21.3 KiB, done.\n# * [new branch]      main -> main\n# branch \'main\' set up to track \'origin/main\'.',
    porque: 'La -u (upstream) conecta tu main local con el origin/main de la nube. Después basta con git push a secas.'
  },
  {
    n: '4',
    titulo: 'GitHub lo muestra',
    que: 'Abres la URL y ves tu mismo álbum en la web: archivos con colores, historial, autora y fecha. Cualquier persona del planeta puede verlo, clonarlo o proponer cambios.',
    comando: 'https://github.com/tuusuario/biblioteca\n# 📁 dominio/  📁 nucleo/  📄 main.py  📄 README.md\n# 9f3c2b1  Corregir título del README   · hace 2 minutos',
    porque: 'El respaldo ya existe: si tu compu se muere, archivos e historial viven en la nube.'
  },
  {
    n: '5',
    titulo: 'Otras personas entran — clone y pull',
    que: 'Tu compañera ejecuta git clone y obtiene el proyecto completo con todo el historial — un álbum vivo, no un zip. Si ya lo tenía, git pull le trae solo lo nuevo.',
    comando: 'git clone https://github.com/tuusuario/biblioteca.git\n# Cloning into \'biblioteca\'...\n# Receiving objects: 100% (42/42), done.\n\ngit pull\n# Already up to date.',
    porque: 'Por eso Git es «distribuido»: hay copias completas que se sincronizan entre iguales. GitHub es la copia más popular del vecindario.'
  },
  {
    n: '6',
    titulo: 'El círculo se cierra',
    que: 'La rutina diaria de toda persona que programa: al empezar, pull; durante el día, editar + add + commit; al terminar, push. Tres verbos, en orden, todos los días.',
    comando: '#   ┌──► git pull      (bajar lo nuevo)\n#   │        │\n#   │        ▼\n#   │   editar + git add + git commit\n#   │        │\n#   │        ▼\n#   └──  git push     (subir tus fotos nuevas)',
    porque: 'Y cuando dos personas suben a la vez aparece el rechazo amable (fetch first): pull primero, push después.'
  }
];

function configurarViaje() {
  const root = document.querySelector('[data-viaje]');
  if (!root) return;

  const botones = root.querySelectorAll('[data-parada]');
  botones.forEach(btn => {
    btn.addEventListener('click', () => {
      botones.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      mostrarParada(root, parseInt(btn.dataset.parada, 10));
    });
  });

  if (botones.length) {
    botones[0].classList.add('activo');
    mostrarParada(root, 1);
  }
}

function mostrarParada(root, n) {
  const dato = PARADAS.find(p => p.n === String(n));
  if (!dato) return;

  const set = (sel, texto) => {
    const el = root.querySelector(sel);
    if (el) el.textContent = texto;
  };

  set('[data-parada-titulo]', 'Parada ' + dato.n + ' · ' + dato.titulo);
  set('[data-parada-que]', dato.que);
  set('[data-parada-comando]', dato.comando);
  set('[data-parada-porque]', dato.porque);

  const meta = root.querySelector('[data-parada-meta]');
  if (meta) meta.textContent = 'Parada ' + dato.n + ' de ' + PARADAS.length;
}

/* ---------- CHECKLIST DEL TALLER ----------
   Se guarda en el estado de la clase para poder cerrar
   el navegador y volver sin perder el avance.
--------------------------------------------- */
function configurarChecklist() {
  const root = document.querySelector('[data-checklist]');
  if (!root) return;

  const casillas = root.querySelectorAll('input[type="checkbox"]');
  casillas.forEach((casilla, i) => {
    if (estado.checklist && estado.checklist[i]) casilla.checked = true;
    casilla.addEventListener('change', () => {
      if (!estado.checklist) estado.checklist = {};
      estado.checklist[i] = casilla.checked;
      guardarProgreso();
      actualizarChecklist(root, casillas);
    });
  });

  actualizarChecklist(root, casillas);
}

function actualizarChecklist(root, casillas) {
  const total = casillas.length;
  const listas = [...casillas].filter(c => c.checked).length;
  const pct = total ? Math.round((listas / total) * 100) : 0;

  const barra = root.querySelector('[data-checklist-barra]');
  if (barra) barra.style.width = pct + '%';

  const texto = root.querySelector('[data-checklist-texto]');
  if (texto) texto.textContent = listas + ' / ' + total + ' · ' + pct + '%';
}
