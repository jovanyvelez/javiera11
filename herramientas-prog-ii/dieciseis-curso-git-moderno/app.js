/* ============================================================
   CLASE dieciséis — HERRAMIENTAS DE PROGRAMACIÓN II
   Tema: "Git moderno en el día a día: iniciar, stage, commits,
   ramas, merge y deshacer sin miedo"
   Lógica de navegación, cuestionarios, progreso, simulador de
   staging y laboratorio de decisiones para deshacer.
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
  configurarStaging();
  configurarDeshacer();
  configurarTeclado();
  actualizarUI();
});

const STORAGE_KEY = 'curso-herr-16-git-moderno';

/* Unidades que cuentan para el avance (0 = apertura, 4 = intervalo). */
const UNIDADES_EVALUABLES = [1, 2, 3, 5, 6, 7];

const ETIQUETAS = [
  'Apertura: la máquina del tiempo',
  'Iniciar el repo y main',
  'Stage y commits',
  'Ramas y merge',
  'Intervalo',
  'Deshacer sin miedo',
  'Errores y rutina diaria',
  'Taller: tu historial'
];

/* Constancia que se otorga al completar cada unidad. */
const BADGES_MODULO = {
  1: 'Repo en main',
  2: 'Commits con sentido',
  3: 'Ramas y merge',
  5: 'Deshacer controlado',
  6: 'Rutina diaria',
  7: 'Historial robusto'
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
    otorgarBadge('Git diario');
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

/* ---------- SIMULADOR DE STAGING ---------- */
function configurarStaging() {
  const root = document.querySelector('[data-stage]');
  if (!root) return;

  const contenedor = root.querySelector('[data-stage-archivos]');
  const salida = root.querySelector('[data-stage-salida]');
  const comando = root.querySelector('[data-stage-comando]');
  const mensaje = root.querySelector('[data-stage-mensaje]');
  const log = root.querySelector('[data-stage-log]');

  const inicial = [
    { nombre: 'app.py', estado: 'modificado', nuevo: false, diff: 'def saludar():\n    return "Hola"' },
    { nombre: 'estilos.css', estado: 'staged', nuevo: false, diff: 'button {\n  color: #22d3ee;\n}' },
    { nombre: 'README.md', estado: 'untracked', nuevo: true, diff: '# Proyecto\n\nUna práctica de Git.' }
  ];
  let archivos = inicial.map((a) => ({ ...a }));
  let commits = [];
  let ultimoComando = 'git status';

  function etiqueta(estado) {
    return {
      modificado: 'modificado',
      staged: 'en staging',
      untracked: 'sin seguimiento',
      'sin-cambios': 'confirmado'
    }[estado] || estado;
  }

  function render() {
    contenedor.innerHTML = archivos.map((a) => {
      const puedeAgregar = a.estado === 'modificado' || a.estado === 'untracked';
      const puedeQuitar = a.estado === 'staged';
      return `
        <div class="stage-archivo" data-estado="${a.estado}">
          <div class="stage-archivo-cabecera">
            <span class="stage-nombre">${a.nombre}</span>
            <span class="stage-badge ${a.estado}">${etiqueta(a.estado)}</span>
          </div>
          <div class="stage-diff">${a.estado === 'sin-cambios' ? 'Incluido en el último commit.' : a.diff.replace(/\n/g, '<br>')}</div>
          <div class="stage-acciones">
            <button class="stage-btn" data-stage-add="${a.nombre}" ${puedeAgregar ? '' : 'disabled'}>git add ${a.nombre}</button>
            <button class="stage-btn" data-stage-unstage="${a.nombre}" ${puedeQuitar ? '' : 'disabled'}>git restore --staged ${a.nombre}</button>
          </div>
        </div>
      `;
    }).join('');

    const preparados = archivos.filter((a) => a.estado === 'staged');
    const modificados = archivos.filter((a) => a.estado === 'modificado');
    const nuevos = archivos.filter((a) => a.estado === 'untracked');
    let texto = 'On branch main\n';

    if (preparados.length === 0 && modificados.length === 0 && nuevos.length === 0) {
      texto += '\nnothing to commit, working tree clean';
    } else {
      if (preparados.length > 0) {
        texto += '\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n';
        preparados.forEach((a) => {
          texto += `        ${a.nuevo ? 'new file' : 'modified'}:   ${a.nombre}\n`;
        });
      }
      if (modificados.length > 0) {
        texto += '\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n';
        modificados.forEach((a) => {
          texto += `        modified:   ${a.nombre}\n`;
        });
      }
      if (nuevos.length > 0) {
        texto += '\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n';
        nuevos.forEach((a) => {
          texto += `        ${a.nombre}\n`;
        });
      }
    }

    salida.textContent = texto;
    comando.textContent = '$ ' + ultimoComando;
    log.textContent = commits.length > 0
      ? commits.map((c) => `${c.hash}  ${c.mensaje}`).join('\n')
      : '-- todavía no hay commits';
  }

  root.addEventListener('click', (e) => {
    const agregar = e.target.closest('[data-stage-add]');
    const quitar = e.target.closest('[data-stage-unstage]');
    const confirmar = e.target.closest('[data-stage-commit]');
    const reiniciar = e.target.closest('[data-stage-reset]');

    if (agregar) {
      const archivo = archivos.find((a) => a.nombre === agregar.dataset.stageAdd);
      if (!archivo || archivo.estado === 'staged' || archivo.estado === 'sin-cambios') return;
      archivo.estado = 'staged';
      ultimoComando = `git add ${archivo.nombre}`;
      render();
      return;
    }

    if (quitar) {
      const archivo = archivos.find((a) => a.nombre === quitar.dataset.stageUnstage);
      if (!archivo || archivo.estado !== 'staged') return;
      archivo.estado = archivo.nuevo ? 'untracked' : 'modificado';
      ultimoComando = `git restore --staged ${archivo.nombre}`;
      render();
      return;
    }

    if (confirmar) {
      const texto = mensaje.value.trim();
      const preparados = archivos.filter((a) => a.estado === 'staged');
      ultimoComando = `git commit -m "${texto || '...'}"`;

      if (preparados.length === 0) {
        salida.textContent = 'On branch main\nnothing added to commit but untracked files present';
        comando.textContent = '$ ' + ultimoComando;
        return;
      }
      if (texto === '') {
        salida.textContent = 'Aborting commit due to empty commit message.';
        comando.textContent = '$ ' + ultimoComando;
        return;
      }

      const hash = Math.random().toString(16).slice(2, 9);
      commits.unshift({ hash, mensaje: texto });
      preparados.forEach((a) => { a.estado = 'sin-cambios'; });
      mensaje.value = '';
      render();
      salida.textContent += `\n\n[main ${hash}] ${texto}\n ${preparados.length} file(s) changed`;
      return;
    }

    if (reiniciar) {
      archivos = inicial.map((a) => ({ ...a }));
      commits = [];
      mensaje.value = '';
      ultimoComando = 'git status';
      render();
    }
  });

  render();
}

/* ---------- LABORATORIO PARA DESHACER ---------- */
function configurarDeshacer() {
  const root = document.querySelector('[data-undo]');
  if (!root) return;

  const casos = {
    restore: {
      titulo: 'Dañé app.py y quiero volver a la última foto',
      comando: 'git restore app.py',
      explica: 'Toma la versión de app.py que está en el último commit y la escribe encima de tu archivo. Los cambios sin guardar desaparecen.',
      riesgo: 'Ojo: los cambios que no habías confirmado se pierden para siempre. Úsalo solo si estás seguro de que quieres descartarlos.',
      terminal: '$ git restore app.py\n# app.py vuelve a como estaba en el último commit\n$ git status\nnothing to commit, working tree clean'
    },
    unstage: {
      titulo: 'Agregué al staging algo que no era',
      comando: 'git restore --staged app.py',
      explica: 'Saca app.py del área de preparación, pero conserva tu cambio en la carpeta. El archivo sigue modificado; solo deja de estar listo para el commit.',
      riesgo: 'No borra tu trabajo. Es el backspace del staging: el archivo vuelve a “Changes not staged for commit”.',
      terminal: '$ git restore --staged app.py\n$ git status\nChanges not staged for commit:\n        modified:   app.py'
    },
    amend: {
      titulo: 'El commit quedó con un mensaje feo',
      comando: 'git commit --amend -m "nuevo mensaje"',
      explica: 'Reemplaza el último commit por uno nuevo con el mismo contenido y otro mensaje. Cambia el hash del commit.',
      riesgo: 'No lo uses si el commit ya lo descargaron otras personas: estarías reescribiendo historia compartida. Si ya lo subiste, usa git revert o coordina con el equipo.',
      terminal: '$ git commit --amend -m "validar el correo antes de guardar"\n[main 7c1e9ab] validar el correo antes de guardar\n Date: ...\n 1 file changed, 4 insertions(+)'
    },
    soft: {
      titulo: 'Me sobró el último commit (aún no lo compartí)',
      comando: 'git reset --soft HEAD~1',
      explica: 'Mueve la rama un commit hacia atrás y deja los cambios de ese commit en el staging, intactos. El commit desaparece del historial, pero el trabajo no.',
      riesgo: 'Solo es seguro si el commit no lo tiene nadie más. No uses --hard aquí: --hard sí borra los cambios de la carpeta.',
      terminal: '$ git reset --soft HEAD~1\n$ git status\nChanges to be committed:\n        modified:   app.py'
    },
    revert: {
      titulo: 'Hay que deshacer un commit que ya compartieron',
      comando: 'git revert a1b2c3d',
      explica: 'Crea un commit NUEVO que aplica los cambios inversos del commit indicado. El commit original sigue en el historial y nadie pierde su trabajo.',
      riesgo: 'Puede pedirte resolver conflictos si los archivos cambiaron después. Es la opción correcta para ramas compartidas; no reescribe historia.',
      terminal: '$ git revert a1b2c3d\n[main 9f2d1c4] Revert "cambiar el precio del teclado"\n 1 file changed, 2 insertions(+), 2 deletions(-)'
    },
    reflog: {
      titulo: 'Hice algo horrible y no sé qué',
      comando: 'git reflog',
      explica: 'Muestra todo lo que movió HEAD: commits, cambios de rama, resets. Encuentras el hash o HEAD@{n} donde estabas y vuelves a él.',
      riesgo: 'El reflog es local y no es eterno. Para volver sin destruir lo actual, crea una rama de rescate con git switch -c rescate HEAD@{1}; git reset --hard también funciona, pero descarta lo que tengas sin confirmar.',
      terminal: '$ git reflog\n9f2d1c4 HEAD@{0}: reset: moving to HEAD~1\na1b2c3d HEAD@{1}: commit: agregar el botón de guardar\n7e4f2a1 HEAD@{2}: commit: crear la pantalla de inicio\n\n$ git switch -c rescate HEAD@{1}\nSwitched to a new branch \'rescate\''
    }
  };

  const botones = root.querySelectorAll('[data-undo-caso]');
  const titulo = root.querySelector('[data-undo-titulo]');
  const comando = root.querySelector('[data-undo-comando]');
  const explica = root.querySelector('[data-undo-explica]');
  const riesgo = root.querySelector('[data-undo-riesgo]');
  const terminal = root.querySelector('[data-undo-terminal]');

  function mostrar(clave) {
    const caso = casos[clave];
    if (!caso) return;
    botones.forEach((b) => {
      b.classList.remove('activo');
      b.setAttribute('aria-pressed', 'false');
    });
    const activo = Array.from(botones).find((b) => b.dataset.undoCaso === clave);
    if (activo) {
      activo.classList.add('activo');
      activo.setAttribute('aria-pressed', 'true');
    }
    titulo.textContent = caso.titulo;
    comando.textContent = '$ ' + caso.comando;
    explica.textContent = caso.explica;
    riesgo.innerHTML = '<strong>Riesgo:</strong> ' + caso.riesgo;
    terminal.textContent = caso.terminal;
  }

  botones.forEach((b) => {
    b.addEventListener('click', () => mostrar(b.dataset.undoCaso));
  });

  mostrar('restore');
}
