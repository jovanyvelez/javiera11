/* ============================================================
   CURSO DE ANÁLISIS Y DISEÑO — LÓGICA INTERACTIVA
============================================================ */

const TOTAL_MODULOS = 8; // 0..7

/* ---------- ESTADO ---------- */
const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  badges: new Set(),
  escenarios: {}    // { 'modulo5-escIdx': 'correcto'|'incorrecto' }
};

/* ---------- DETALLE DE FASES (para el mapa) ---------- */
const fasesInfo = {
  1: {
    titulo: '📋 1. Análisis de Requerimientos',
    cuerpo: 'Se conversa con los usuarios y clientes para entender qué necesitan. Se hacen entrevistas, encuestas y se documenta TODO lo que el sistema debe hacer y las restricciones. Es la fase MÁS importante: si aquí algo sale mal, todo lo demás también.',
    resultado: 'Resultado: Documento de Especificación de Requerimientos.'
  },
  2: {
    titulo: '📐 2. Diseño',
    cuerpo: 'Se planea CÓMO se va a construir el sistema. Se deciden los módulos, cómo se comunican, qué base de datos se usa, cómo se ve la interfaz. Es como dibujar los planos de una casa.',
    resultado: 'Resultado: Diagramas, prototipos, arquitectura.'
  },
  3: {
    titulo: '💻 3. Implementación',
    cuerpo: 'Los programadores escriben el código siguiendo los diseños. Es la fase más "visible" pero, sorpresa: solo representa una pequeña parte del esfuerzo total del proyecto.',
    resultado: 'Resultado: Software construido (aún sin probar a fondo).'
  },
  4: {
    titulo: '🧪 4. Pruebas',
    cuerpo: 'Se verifica que el sistema haga lo que prometió y no tenga errores. Se prueban casos normales, casos extremos y hasta casos malintencionados.',
    resultado: 'Resultado: Reporte de pruebas con errores corregidos.'
  },
  5: {
    titulo: '🚀 5. Despliegue',
    cuerpo: 'Se entrega y pone en marcha el sistema en el ambiente real del cliente. Se capacita a los usuarios, se migran datos, se asegura que todo funcione.',
    resultado: 'Resultado: Sistema en producción siendo usado por gente real.'
  },
  6: {
    titulo: '🔧 6. Mantenimiento',
    cuerpo: 'La fase más larga (puede durar años). Se corrigen errores que aparecen con el uso, se agregan nuevas funciones y se adapta el sistema a cambios del entorno.',
    resultado: 'Resultado: Versiones evolutivas del software.'
  }
};

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarQuizzes();
  configurarMapaFases();
  configurarEscenarios();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    const datos = {
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      badges: [...estado.badges],
      escenarios: estado.escenarios
    };
    localStorage.setItem('curso-analisis-diseno', JSON.stringify(datos));
  } catch (e) {}
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem('curso-analisis-diseno'));
    if (!datos) return;
    estado.moduloActual = datos.moduloActual || 0;
    estado.completados = new Set(datos.completados || []);
    estado.quizzes = datos.quizzes || {};
    estado.badges = new Set(datos.badges || []);
    estado.escenarios = datos.escenarios || {};
  } catch (e) {}
}

/* ---------- NAVEGACIÓN ---------- */
function configurarNavegacion() {
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.modulo, 10);
      irAModulo(m);
    });
  });
}

function configurarBotonesInternos() {
  document.querySelectorAll('.btn-anterior, .btn-siguiente').forEach(btn => {
    btn.addEventListener('click', () => {
      const m = parseInt(btn.dataset.ir, 10);
      if (btn.classList.contains('btn-siguiente')) {
        marcarCompletado(estado.moduloActual);
      }
      irAModulo(m);
    });
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

/* ---------- COMPLETADOS Y BADGES ---------- */
function marcarCompletado(n) {
  if (estado.completados.has(n)) return;
  estado.completados.add(n);

  if (n === 0) otorgarBadge('🚀 Iniciado');
  if (n === 1) otorgarBadge('🧠 Visionario');
  if (n === 2) otorgarBadge('🗺️ Cartógrafo');
  if (n === 3) otorgarBadge('📏 Tradicional');
  if (n === 4) otorgarBadge('⚡ Ágil');
  if (n === 5) otorgarBadge('🧩 Estratega');
  if (n === 6) otorgarBadge('📖 Lector');

  if (estado.completados.size === TOTAL_MODULOS - 1) {
    otorgarBadge('🏆 Arquitect@ Certificad@');
  }
}

function otorgarBadge(nombre) {
  if (estado.badges.has(nombre)) return;
  estado.badges.add(nombre);
  mostrarToast(`🎉 ¡Insignia desbloqueada: ${nombre}!`);
  actualizarUI();
}

/* ---------- UI ---------- */
function actualizarUI() {
  const total = TOTAL_MODULOS - 1;
  const completos = [...estado.completados].filter(x => x <= 6).length;
  const pct = Math.round((completos / total) * 100);

  const barra = document.getElementById('barra');
  if (barra) barra.style.width = pct + '%';

  const ptxt = document.getElementById('porcentaje');
  if (ptxt) ptxt.textContent = pct + '%';

  const mAct = document.getElementById('modulo-actual');
  if (mAct) mAct.textContent = 'Módulo ' + estado.moduloActual;

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

  document.querySelectorAll('.btn-modulo').forEach(btn => {
    const m = parseInt(btn.dataset.modulo, 10);
    btn.classList.toggle('completado', estado.completados.has(m));
  });
}

/* ---------- QUIZZES ---------- */
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
      res.textContent = `🎉 ¡Perfecto! ${aciertos}/${total}. Eres un crack 💪`;
      otorgarBadge(`✨ Quiz ${idQuiz} Perfecto`);
    } else if (aciertos >= total / 2) {
      res.classList.add('parcial');
      res.textContent = `👍 ${aciertos}/${total} correctas. ¡Buen intento! Revisa lo que no te salió.`;
    } else {
      res.classList.add('parcial');
      res.textContent = `🤔 ${aciertos}/${total}. Te invitamos a releer el módulo y volver a intentar.`;
    }
  }

  guardarProgreso();
}

/* ---------- MAPA CONCEPTUAL: clic en fases ---------- */
function configurarMapaFases() {
  const detalle = document.getElementById('detalle-fase');
  document.querySelectorAll('.fase-nodo').forEach(nodo => {
    nodo.addEventListener('click', () => {
      const id = nodo.dataset.fase;
      const info = fasesInfo[id];
      if (!info || !detalle) return;

      // Marcar el nodo seleccionado
      document.querySelectorAll('.fase-nodo').forEach(n => n.classList.remove('activa'));
      nodo.classList.add('activa');

      // Pintar el detalle
      detalle.innerHTML = `
        <h4>${info.titulo}</h4>
        <p>${info.cuerpo}</p>
        <p><strong style="color: var(--dorado);">${info.resultado}</strong></p>
      `;
    });
  });
}

/* ---------- ESCENARIOS DEL TALLER ---------- */
function configurarEscenarios() {
  const escenarios = document.querySelectorAll('.escenario');
  escenarios.forEach((esc, idx) => {
    const correcta = esc.dataset.correcta;
    const opciones = esc.querySelectorAll('.opcion-esc');
    const retro = esc.querySelector('.retro-esc');

    opciones.forEach(op => {
      op.addEventListener('click', () => {
        if (esc.dataset.respondido === 'true') return;
        esc.dataset.respondido = 'true';

        const eleccion = op.dataset.elec;
        const acierto = eleccion === correcta;

        if (acierto) {
          op.classList.add('correcta');
          retro.classList.add('bien', 'visible');
          retro.textContent = generarRetroBien(correcta, idx);
        } else {
          op.classList.add('incorrecta');
          opciones.forEach(o => {
            if (o.dataset.elec === correcta) o.classList.add('correcta');
          });
          retro.classList.add('mal', 'visible');
          retro.textContent = generarRetroMal(correcta, idx);
        }

        opciones.forEach(o => o.disabled = true);
        estado.escenarios['esc-' + idx] = acierto ? 'bien' : 'mal';

        verificarJuegoCompleto();
        guardarProgreso();
      });
    });
  });
}

function generarRetroBien(correcta, idx) {
  const razones = {
    estructurada: [
      '✅ ¡Correcto! Cuando hay vidas en juego y los requerimientos están bien definidos, una metodología estructurada (con su rigor y documentación) es la opción adecuada.',
      '✅ ¡Excelente! En sistemas médicos hay regulaciones estrictas y CERO tolerancia al error. La metodología estructurada da la trazabilidad y pruebas exhaustivas que se necesitan.',
      '✅ ¡Perfecto! Cuando la ley define los requerimientos y no pueden cambiar, una metodología estructurada permite cumplir cada punto de forma verificable.'
    ],
    agil: [
      '✅ ¡Correcto! En startups donde se experimenta y aprende del usuario, lo ágil permite lanzar rápido, medir y ajustar.',
      '✅ ¡Bien hecho! Para juegos donde se prueban mecánicas y se itera según las descargas, lo ágil es ideal: lanzar pronto, medir y mejorar.',
      '✅ ¡Excelente! Cuando hay incertidumbre y se necesita aprender del mercado, lo ágil te da flexibilidad para pivotar.'
    ]
  };
  const arr = razones[correcta];
  return arr[idx % arr.length];
}

function generarRetroMal(correcta, idx) {
  if (correcta === 'estructurada') {
    return '❌ En este caso la respuesta era ESTRUCTURADA. Cuando hay vidas, regulaciones o requerimientos no negociables, la flexibilidad ágil puede ser un riesgo. Se necesita planificación rigurosa.';
  } else {
    return '❌ En este caso la respuesta era ÁGIL. Cuando hay incertidumbre o se quiere experimentar con usuarios, la rigidez estructurada haría perder oportunidades de aprender y adaptarse.';
  }
}

function verificarJuegoCompleto() {
  const total = document.querySelectorAll('.escenario').length;
  const respondidos = Object.keys(estado.escenarios).length;
  if (respondidos < total) return;

  const aciertos = Object.values(estado.escenarios).filter(v => v === 'bien').length;
  const resultado = document.getElementById('resultado-juego');
  if (!resultado) return;

  resultado.classList.add('visible');
  let mensaje = '';
  if (aciertos === total) {
    mensaje = `🏆 ¡PERFECTO! ${aciertos}/${total}. Tienes ojo de arquitect@. ¡Sabes cuándo aplicar cada metodología!`;
    otorgarBadge('🎯 Decisor Experto');
  } else if (aciertos >= total * 0.7) {
    mensaje = `👏 Muy bien: ${aciertos}/${total}. Tienes buen criterio. Revisa los escenarios que fallaste para afinar.`;
  } else {
    mensaje = `🤔 ${aciertos}/${total}. Vuelve a la tabla comparativa y revisa los escenarios que fallaste.`;
  }
  resultado.textContent = mensaje;
}

/* ---------- SOLUCIONES ---------- */
function toggleSolucion(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('visible');
}

/* ---------- REINICIAR ---------- */
function reiniciarCurso() {
  if (!confirm('¿Quieres volver al inicio? Tu progreso se conserva.')) return;
  irAModulo(0);
}

/* ---------- TOAST ---------- */
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: 'linear-gradient(135deg, #fbbf24, #f97316)',
    color: '#1a1a1a',
    padding: '0.9rem 1.4rem',
    borderRadius: '30px',
    fontWeight: '700',
    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
    zIndex: '1000',
    transition: 'all 0.4s ease',
    opacity: '0',
    transform: 'translateY(20px)'
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ---------- ATAJOS DE TECLADO ---------- */
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'ArrowRight') {
    if (estado.moduloActual < TOTAL_MODULOS - 1) {
      marcarCompletado(estado.moduloActual);
      irAModulo(estado.moduloActual + 1);
    }
  } else if (e.key === 'ArrowLeft') {
    if (estado.moduloActual > 0) irAModulo(estado.moduloActual - 1);
  }
});
