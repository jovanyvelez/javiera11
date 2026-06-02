/* ============================================================
   CURSO ELICITACIÓN — CLASE 3 — LÓGICA INTERACTIVA
============================================================ */

const TOTAL_MODULOS = 9;

const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  badges: new Set(),
  juegoRoles: { turno: 0, puntos: 0, descubrimientos: [] }
};

/* ---------- GUION DEL JUEGO DE ROLES ---------- */
/* Caso: Panadería Doña Carolina */
const GUION = [
  {
    intro: '👩‍🍳 <strong>Carolina:</strong> "Mira mijo, yo no sé mucho de computadores, pero mi hijo dice que necesito una app. Yo solo sé que esto se me está saliendo de las manos. ¿Por dónde empezamos?"',
    opciones: [
      {
        texto: '"¿Qué es lo que más le preocupa hoy de cómo lleva el negocio?"',
        puntos: 2,
        tipo: 'bueno',
        feedback: '✅ ¡Excelente! Empezaste con una pregunta abierta que explora el problema sin asumir nada. Carolina se siente escuchada.',
        respuesta: '"Pues mire, llevo el inventario en un cuaderno y se me olvida pedir harina. Los muchachos no saben qué se vende más. Y los clientes que fían… apunto en una libreta que ya está toda llena. Cada vez es más caos."',
        descubre: 'Problema central: gestión manual desbordada (inventario, ventas, créditos).'
      },
      {
        texto: '"¿Quiere base de datos PostgreSQL o MySQL?"',
        puntos: 0,
        tipo: 'malo',
        feedback: '❌ ¡Demasiado técnico, demasiado pronto! Carolina no sabe qué es eso. La pregunta no aporta y la hace sentir tonta.',
        respuesta: '"Mijo… yo lo único que sé es que vendo pan. Esas cosas que dice usted no las entiendo. ¿Eso me ayudaría?"',
        descubre: 'Lección: el cliente no técnico se desconecta cuando usas jerga.'
      },
      {
        texto: '"¿Cuántos panes vende al día?"',
        puntos: 1,
        tipo: 'regular',
        feedback: '⚠️ Es una pregunta cerrada útil… pero PREMATURA. Aún no entiendes el problema y ya pides cifras. Habría sido mejor explorar primero.',
        respuesta: '"Pues unos 300 panes diarios, más o menos. Pero hay días que se quedan, otros que se acaban temprano. Eso también es parte del problema."',
        descubre: 'Dato: ~300 panes/día. Hay variabilidad en la demanda.'
      }
    ]
  },
  {
    intro: '👩‍🍳 <strong>Carolina:</strong> "Lo del cuaderno, ¿le sirve si se lo muestro? Es que ahí tengo todo." <em>(saca un cuaderno grueso y manchado, con páginas dobladas)</em>',
    opciones: [
      {
        texto: '"¡Por supuesto! Me encantaría verlo. ¿Me podría explicar cómo lo usa día a día?"',
        puntos: 2,
        tipo: 'bueno',
        feedback: '✅ ¡Combinaste observación con entrevista! Pediste ver el documento Y entender cómo se usa. Eso es oro.',
        respuesta: '"Mire, aquí anoto en la mañana qué pidió el panadero. Aquí los productos que vendí. Aquí (otra página) lo que se quedó. Y aquí (libreta aparte) quién me debe. A veces se me olvida pasar de una hoja a otra y me hago un lío."',
        descubre: 'Documentos: cuaderno principal (entradas/salidas) + libreta de créditos. Se mezclan los registros.'
      },
      {
        texto: '"No es necesario verlo. Cuénteme nomás cómo es."',
        puntos: 0,
        tipo: 'malo',
        feedback: '❌ ¡Perdiste una oportunidad gigante! Lo que Carolina TE DICE de su cuaderno no es lo mismo que lo que verás al MIRARLO. La observación de documentos es vital.',
        respuesta: '"Bueno… pues anoto todo. No sé qué más decirle. Es solo un cuaderno."',
        descubre: 'Lección: nunca rechaces ver los documentos reales del cliente.'
      },
      {
        texto: '"Ese cuaderno está obsoleto. Lo que necesita es Excel."',
        puntos: 0,
        tipo: 'malo',
        feedback: '❌ ¡Estás dando soluciones antes de entender el problema! Y además juzgaste el método de Carolina. Mal por partida doble.',
        respuesta: '"Mijo, yo no sé usar Excel. Por eso lo llamé a usted, para que me ayude. Si me va a decir que use otro cuaderno digital, mejor no."',
        descubre: 'Lección: no asumas soluciones. Escucha primero.'
      }
    ]
  },
  {
    intro: '👩‍🍳 <strong>Carolina:</strong> <em>(después de mostrarte el cuaderno, donde ves anotaciones tachadas, números poco claros y manchas de harina)</em> "¿Ve lo que le digo? Por la noche, cuando reviso, ya ni yo me entiendo."',
    opciones: [
      {
        texto: '"¿Quién más, además de usted, escribe en este cuaderno?"',
        puntos: 2,
        tipo: 'bueno',
        feedback: '✅ ¡Brillante! Estás descubriendo más actores en el proceso. Si hay varias personas escribiendo, hay más complejidad.',
        respuesta: '"Pues los muchachos. Tengo dos panaderos y una cajera. A veces todos anotamos en distintos lados. Por eso a veces no cuadran las cuentas."',
        descubre: 'Stakeholders adicionales: 2 panaderos + 1 cajera. El proceso es multi-usuario.'
      },
      {
        texto: '"¿Le gustaría que el sistema sea en la nube?"',
        puntos: 0,
        tipo: 'malo',
        feedback: '❌ Otra pregunta técnica que no aporta nada. Concéntrate en entender, no en proponer.',
        respuesta: '"¿Nube? ¿Eso es cuando llueve? Mijo, hábleme cristiano."',
        descubre: 'Lección: evita conceptos técnicos al elicitar a usuarios no técnicos.'
      },
      {
        texto: '"¿Cuánto le cuesta cada error o descuadre al mes?"',
        puntos: 1,
        tipo: 'regular',
        feedback: '⚠️ La pregunta es relevante (impacto económico), pero tal vez demasiado directa antes de ganarte la confianza. Funciona, pero no es el momento óptimo.',
        respuesta: '"Uy, no sé exactamente. Tal vez unos $200 mil al mes en harina que se daña porque pedí mal, o créditos que se me olvidan cobrar. Quizás más."',
        descubre: 'Impacto económico: pérdidas de ~$200K/mes por errores manuales.'
      }
    ]
  },
  {
    intro: '👩‍🍳 <strong>Carolina:</strong> "Mire, yo lo que sueño es algo que sea simple, ¿sabe? Que no tenga que aprender un montón de cosas raras."',
    opciones: [
      {
        texto: '"Cuénteme. ¿Cómo se imagina usted que sería usar esa app?"',
        puntos: 2,
        tipo: 'bueno',
        feedback: '✅ ¡Perfecto! Le pediste describir su solución ideal SIN sugerir nada. Su respuesta te dará oro sobre la experiencia de usuario que espera.',
        respuesta: '"Yo me imagino algo como mi WhatsApp. Que entro, veo lo del día, anoto rapidito y ya. Sin tantos clics ni cosas. Y que también pueda ver desde mi casa cómo va el negocio cuando estoy enferma."',
        descubre: 'Requerimiento de usabilidad: similar a WhatsApp. Necesidad de acceso remoto.'
      },
      {
        texto: '"Tranquila, le ponemos un menú con muchas opciones."',
        puntos: 0,
        tipo: 'malo',
        feedback: '❌ Justo lo opuesto a lo que ella pidió. Y peor: contradijiste lo que dijo.',
        respuesta: '"Pero entonces va a ser complicado… eso es lo que NO quiero."',
        descubre: 'Lección: ESCUCHA y construye sobre lo que el cliente dice, no contra él.'
      },
      {
        texto: '"Entiendo, le haremos un sistema fácil." (y sigues con otra pregunta)',
        puntos: 1,
        tipo: 'regular',
        feedback: '⚠️ Dijiste "le haremos algo fácil" sin saber qué significa fácil PARA ella. "Fácil" es ambiguo. Mejor haberle pedido un ejemplo.',
        respuesta: '"Bueno…" <em>(no parece convencida)</em>',
        descubre: 'Lección: "fácil" significa cosas distintas para personas distintas. Siempre pide concretar.'
      }
    ]
  },
  {
    intro: '👩‍🍳 <strong>Carolina:</strong> "Otra cosa: mi sobrino dijo que toda esa información debe estar segura, porque hay datos de los que me deben. Yo no sé qué tan importante es eso."',
    opciones: [
      {
        texto: '"¿Le ha pasado alguna vez que alguien vio información que no debía?"',
        puntos: 2,
        tipo: 'bueno',
        feedback: '✅ ¡Excelente pregunta de sondeo! Estás buscando experiencias reales sobre el tema de seguridad antes de asumir.',
        respuesta: '"Sí, una vez un panadero estaba mirando la libreta y comentó con otro cliente quién debía cuánto. Eso fue feo, perdí dos clientes. Por eso ahora la guardo bajo llave en el cajón."',
        descubre: 'Necesidad de seguridad: información de créditos solo accesible para Carolina (control de roles/permisos).'
      },
      {
        texto: '"La seguridad es muy importante, le pondremos cifrado AES-256 y autenticación de dos factores."',
        puntos: 0,
        tipo: 'malo',
        feedback: '❌ Recitaste términos técnicos. Carolina no entendió nada y tú no descubriste lo que ella realmente necesita.',
        respuesta: '"Ay mijo, ¿eso qué es? Yo lo único que quiero es que mis empleados no vean cuánto me deben los clientes. Nada más."',
        descubre: 'Lección: NO impongas soluciones técnicas. Descubre la necesidad real.'
      },
      {
        texto: '"No se preocupe, todos los sistemas modernos son seguros."',
        puntos: 0,
        tipo: 'malo',
        feedback: '❌ Eso es FALSO y además minimiza una preocupación real del cliente. Pésima respuesta.',
        respuesta: '"Pues yo en las noticias veo que roban hasta a los bancos. ¿Entonces sí debo preocuparme o no?"',
        descubre: 'Lección: nunca minimices una preocupación del cliente.'
      }
    ]
  },
  {
    intro: '👩‍🍳 <strong>Carolina:</strong> "Hemos hablado un montón. ¿Hay algo más que necesite saber?"',
    opciones: [
      {
        texto: '"Sí, ¿podría resumirle yo lo que entendí, para asegurar que vamos bien?"',
        puntos: 2,
        tipo: 'bueno',
        feedback: '✅ ¡La mejor jugada al cerrar! Resumir y validar es señal de buen analista. Detecta malentendidos antes de que sean costosos.',
        respuesta: '"Por supuesto, dígame qué entendió."',
        descubre: 'Práctica clave: validar entendimiento antes de cerrar la entrevista.'
      },
      {
        texto: '"No, listo. Le mando el sistema en 2 semanas."',
        puntos: 0,
        tipo: 'malo',
        feedback: '❌ ¡Pésimo! No validaste nada, no agendaste seguimiento, y prometiste plazos sin análisis. Recipe para el desastre.',
        respuesta: '"¿Tan rápido? Pues bueno…" <em>(con cara de duda)</em>',
        descubre: 'Lección: no comprometas plazos en la primera entrevista, valida primero.'
      },
      {
        texto: '"¿Cuándo podríamos vernos para una segunda sesión y revisar avances?"',
        puntos: 1,
        tipo: 'regular',
        feedback: '⚠️ Buena idea agendar la siguiente sesión, pero antes de cerrar SIEMPRE valida lo que entendiste hoy.',
        respuesta: '"Cuando quiera, aquí estoy de lunes a sábado."',
        descubre: 'Plan: hay disponibilidad para entrevistas adicionales.'
      }
    ]
  }
];

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarQuizzes();
  configurarJuegoPreguntas();
  configurarJuegoMalaPregunta();
  configurarMatcher();
  configurarMatrizViabilidad();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    localStorage.setItem('curso-elicitacion', JSON.stringify({
      moduloActual: estado.moduloActual,
      completados: [...estado.completados],
      quizzes: estado.quizzes,
      badges: [...estado.badges]
    }));
  } catch (e) {}
}

function cargarProgreso() {
  try {
    const d = JSON.parse(localStorage.getItem('curso-elicitacion'));
    if (!d) return;
    estado.moduloActual = d.moduloActual || 0;
    estado.completados = new Set(d.completados || []);
    estado.quizzes = d.quizzes || {};
    estado.badges = new Set(d.badges || []);
  } catch (e) {}
}

/* ---------- NAVEGACIÓN ---------- */
function configurarNavegacion() {
  document.querySelectorAll('.btn-modulo').forEach(btn => {
    btn.addEventListener('click', () => {
      irAModulo(parseInt(btn.dataset.modulo, 10));
    });
  });
}

function configurarBotonesInternos() {
  document.querySelectorAll('.btn-anterior, .btn-siguiente').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.classList.contains('btn-siguiente')) {
        marcarCompletado(estado.moduloActual);
      }
      irAModulo(parseInt(btn.dataset.ir, 10));
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
  if (n === 1) otorgarBadge('🕵️ Mentalidad de Detective');
  if (n === 2) otorgarBadge('💬 Entrevistador');
  if (n === 3) otorgarBadge('📊 Encuestador');
  if (n === 4) otorgarBadge('👀 Observador');
  if (n === 5) otorgarBadge('🎭 Negociador con Clientes');
  if (n === 6) otorgarBadge('📋 Levantador de Info');
  if (n === 7) otorgarBadge('⚖️ Evaluador de Viabilidad');

  if (estado.completados.size === TOTAL_MODULOS - 1) {
    otorgarBadge('🏆 Elicitador Maestro');
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
  const completos = [...estado.completados].filter(x => x <= 7).length;
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
      res.textContent = `🎉 ¡Perfecto! ${aciertos}/${total}.`;
      otorgarBadge(`✨ Quiz ${idQuiz} Perfecto`);
    } else if (aciertos >= total / 2) {
      res.classList.add('parcial');
      res.textContent = `👍 ${aciertos}/${total}. ¡Buen intento!`;
    } else {
      res.classList.add('parcial');
      res.textContent = `🤔 ${aciertos}/${total}. Te invitamos a releer.`;
    }
  }
  guardarProgreso();
}

/* ---------- JUEGO PREGUNTAS (módulo 2) ---------- */
function configurarJuegoPreguntas() {
  document.querySelectorAll('.juego-preg .item-preg').forEach(item => {
    const correcta = item.dataset.correcta;
    const botones = item.querySelectorAll('.btn-preg');
    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        if (item.dataset.respondido === 'true') return;
        item.dataset.respondido = 'true';
        const rta = btn.dataset.rta;
        if (rta === correcta) btn.classList.add('correcta');
        else {
          btn.classList.add('incorrecta');
          botones.forEach(b => {
            if (b.dataset.rta === correcta) b.classList.add('correcta');
          });
        }
        botones.forEach(b => b.disabled = true);
      });
    });
  });
}

/* ---------- JUEGO MALA PREGUNTA (módulo 3) ---------- */
function configurarJuegoMalaPregunta() {
  document.querySelectorAll('.juego-mala-pregunta .item-mp').forEach(item => {
    const correcta = item.dataset.correcta;
    const botones = item.querySelectorAll('.btn-mp');
    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        if (item.dataset.respondido === 'true') return;
        item.dataset.respondido = 'true';
        const rta = btn.dataset.rta;
        if (rta === correcta) btn.classList.add('correcta');
        else {
          btn.classList.add('incorrecta');
          botones.forEach(b => {
            if (b.dataset.rta === correcta) b.classList.add('correcta');
          });
        }
        botones.forEach(b => b.disabled = true);
      });
    });
  });
}

/* ---------- MATCHER (módulo 6) ---------- */
function configurarMatcher() {
  document.querySelectorAll('.matcher .match-item').forEach(item => {
    const correcta = item.dataset.correcta;
    const botones = item.querySelectorAll('.btn-match');
    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        if (item.dataset.respondido === 'true') return;
        item.dataset.respondido = 'true';
        const rta = btn.dataset.rta;
        if (rta === correcta) btn.classList.add('correcta');
        else {
          btn.classList.add('incorrecta');
          botones.forEach(b => {
            if (b.dataset.rta === correcta) b.classList.add('correcta');
          });
        }
        botones.forEach(b => b.disabled = true);
      });
    });
  });
}

/* ---------- JUEGO DE ROLES ---------- */
function iniciarJuegoRoles() {
  estado.juegoRoles = { turno: 0, puntos: 0, descubrimientos: [] };
  const cont = document.getElementById('juego-roles');
  const dlg = document.getElementById('dialogo-juego');
  const res = document.getElementById('resultado-juego-roles');
  if (cont) cont.style.display = 'none';
  if (dlg) dlg.style.display = 'block';
  if (res) res.style.display = 'none';
  pintarTurno();
}

function pintarTurno() {
  const dlg = document.getElementById('dialogo-juego');
  if (!dlg) return;

  const turno = estado.juegoRoles.turno;
  const escena = GUION[turno];
  if (!escena) {
    mostrarResultadoJuego();
    return;
  }

  let html = `
    <div class="turno-info">
      <span class="turno-num">Turno ${turno + 1} de ${GUION.length}</span>
      <span class="puntos-actuales">⭐ ${estado.juegoRoles.puntos} pts</span>
    </div>
    <div class="burbuja-cliente">${escena.intro}</div>
    <p style="margin: 1rem 0 0.5rem; font-weight: 700; color: var(--cyan);">🤔 ¿Qué le preguntas?</p>
    <div class="opciones-juego">
  `;

  escena.opciones.forEach((op, idx) => {
    html += `<button class="btn-opc-juego" onclick="elegirOpcion(${idx})">${op.texto}</button>`;
  });

  html += '</div>';
  dlg.innerHTML = html;
}

function elegirOpcion(idx) {
  const turno = estado.juegoRoles.turno;
  const escena = GUION[turno];
  const opcion = escena.opciones[idx];

  estado.juegoRoles.puntos += opcion.puntos;
  if (opcion.puntos > 0) {
    estado.juegoRoles.descubrimientos.push(opcion.descubre);
  }

  const dlg = document.getElementById('dialogo-juego');
  if (!dlg) return;

  const html = `
    <div class="turno-info">
      <span class="turno-num">Turno ${turno + 1} de ${GUION.length}</span>
      <span class="puntos-actuales">⭐ ${estado.juegoRoles.puntos} pts</span>
    </div>
    <div class="burbuja-cliente">${escena.intro}</div>
    <div class="burbuja-analista"><strong>Tú:</strong> ${opcion.texto}</div>
    <div class="burbuja-cliente">${opcion.respuesta}</div>
    <div class="feedback-juego ${opcion.tipo}">${opcion.feedback}<br><br><strong>💡 Hallazgo:</strong> ${opcion.descubre}</div>
    <button class="btn-sig-turno" onclick="siguienteTurno()">${turno + 1 < GUION.length ? '➡️ Siguiente turno' : '🏁 Ver resultado final'}</button>
  `;
  dlg.innerHTML = html;
}

function siguienteTurno() {
  estado.juegoRoles.turno++;
  if (estado.juegoRoles.turno >= GUION.length) {
    mostrarResultadoJuego();
  } else {
    pintarTurno();
    window.scrollTo({ top: document.getElementById('dialogo-juego').offsetTop - 100, behavior: 'smooth' });
  }
}

function mostrarResultadoJuego() {
  const dlg = document.getElementById('dialogo-juego');
  const res = document.getElementById('resultado-juego-roles');
  if (!res) return;

  if (dlg) dlg.style.display = 'none';

  const max = GUION.length * 2;
  const pts = estado.juegoRoles.puntos;
  const pct = Math.round((pts / max) * 100);

  let evaluacion = '';
  let titulo = '';
  if (pct >= 85) {
    titulo = '🏆 ¡ANALISTA SOBRESALIENTE!';
    evaluacion = 'Hiciste preguntas abiertas, validaste, observaste documentos y mostraste empatía. Carolina se siente comprendida y tienes información de alta calidad para diseñar la solución.';
    otorgarBadge('🌟 Maestro Entrevistador');
  } else if (pct >= 60) {
    titulo = '👍 ANALISTA COMPETENTE';
    evaluacion = 'Cometiste algunos errores, pero en general llevaste bien la entrevista. Identificaste varios requerimientos importantes. Trabaja en evitar tecnicismos y validar más al cliente.';
  } else if (pct >= 30) {
    titulo = '⚠️ NECESITAS PRÁCTICA';
    evaluacion = 'Tu entrevista tuvo problemas serios: jergas técnicas, asunciones o falta de profundización. Carolina seguramente se sintió incomprendida. Vuelve a leer el módulo 2 sobre entrevistas.';
  } else {
    titulo = '🔁 INTENTA DE NUEVO';
    evaluacion = 'Casi todas tus elecciones fueron contraproducentes. Es normal en un primer intento. Lee el módulo 2 con calma y vuelve a jugar.';
  }

  const desc = [...new Set(estado.juegoRoles.descubrimientos)];

  res.innerHTML = `
    <h3>${titulo}</h3>
    <div class="puntaje-final">${pts} / ${max} pts (${pct}%)</div>
    <p>${evaluacion}</p>
    <div class="descubrimientos">
      <h4>📋 Hallazgos que descubriste en esta entrevista:</h4>
      <ul>${desc.map(d => `<li>${d}</li>`).join('')}</ul>
    </div>
    <button class="btn-iniciar-juego" onclick="iniciarJuegoRoles()" style="margin-top: 1rem;">🔁 Volver a jugar</button>
  `;
  res.style.display = 'block';
  window.scrollTo({ top: res.offsetTop - 100, behavior: 'smooth' });
}

/* ---------- MATRIZ DE VIABILIDAD ---------- */
function configurarMatrizViabilidad() {
  document.querySelectorAll('.dim-opciones').forEach(grupo => {
    const botones = grupo.querySelectorAll('.btn-dim');
    botones.forEach(btn => {
      btn.addEventListener('click', () => {
        if (grupo.dataset.bloqueado === 'true') return;
        botones.forEach(b => b.classList.remove('elegido'));
        btn.classList.add('elegido');
        grupo.dataset.elegido = btn.dataset.nivel;
      });
    });
  });
}

function evaluarViabilidad() {
  const grupos = document.querySelectorAll('.dim-opciones');
  let aciertos = 0;
  const total = grupos.length;
  let todasContestadas = true;

  grupos.forEach(grupo => {
    const elegido = grupo.dataset.elegido;
    if (!elegido) { todasContestadas = false; return; }

    const correcta = grupo.dataset.correcta;
    const botones = grupo.querySelectorAll('.btn-dim');

    botones.forEach(btn => {
      btn.disabled = true;
      btn.classList.remove('elegido');
    });

    if (elegido === correcta) {
      const btn = grupo.querySelector(`.btn-dim[data-nivel="${elegido}"]`);
      if (btn) btn.classList.add('acierto');
      aciertos++;
    } else {
      const btnFallo = grupo.querySelector(`.btn-dim[data-nivel="${elegido}"]`);
      if (btnFallo) btnFallo.classList.add('fallo');
      const btnAcierto = grupo.querySelector(`.btn-dim[data-nivel="${correcta}"]`);
      if (btnAcierto) btnAcierto.classList.add('acierto');
    }

    grupo.dataset.bloqueado = 'true';
  });

  if (!todasContestadas) {
    alert('⚠️ Por favor evalúa las 5 dimensiones antes de validar.');
    grupos.forEach(g => {
      g.querySelectorAll('.btn-dim').forEach(b => b.disabled = false);
      g.dataset.bloqueado = 'false';
    });
    return;
  }

  const retro = document.getElementById('retro-viab');
  if (!retro) return;

  let veredicto = '';
  if (aciertos === total) {
    veredicto = '🏆 <strong>¡PERFECTO!</strong> Identificaste correctamente las 5 dimensiones de viabilidad.';
    otorgarBadge('⚖️ Evaluador Perfecto');
  } else if (aciertos >= 3) {
    veredicto = '👍 <strong>Bien hecho.</strong> Acertaste ' + aciertos + ' de 5 dimensiones.';
  } else {
    veredicto = '🤔 Acertaste ' + aciertos + ' de 5. Repasa la teoría de las 5 dimensiones.';
  }

  retro.innerHTML = `
    <p>${veredicto}</p>
    <h4 style="color: var(--dorado); margin-top: 0.8rem;">📝 Análisis correcto del requerimiento:</h4>
    <ul>
      <li><strong>🛠️ Técnica: 🟢 Alta</strong> — Una app móvil sencilla con esas funciones es totalmente factible con tecnologías estándar.</li>
      <li><strong>💰 Económica: 🟢 Alta</strong> — 3 millones COP es presupuesto razonable para una app sencilla como esta.</li>
      <li><strong>👥 Operativa: 🟡 Media</strong> — Doña Carolina puede tener dificultades de adopción inicial (no es técnica). Hay que invertir en capacitación.</li>
      <li><strong>📜 Legal: 🟢 Alta</strong> — No hay implicaciones legales especiales más allá del manejo de datos de los deudores (consentimiento básico).</li>
      <li><strong>⏱️ Temporal: 🟢 Alta</strong> — 3 meses es suficiente para una app de este alcance, con tiempo para pruebas y ajustes.</li>
    </ul>
    <p style="margin-top: 0.8rem;"><strong>Conclusión:</strong> el requerimiento <strong>es viable</strong>, con un punto amarillo en adopción del usuario que debe trabajarse con capacitación y diseño muy simple.</p>
  `;
  retro.classList.add('visible');
  window.scrollTo({ top: retro.offsetTop - 100, behavior: 'smooth' });
  guardarProgreso();
}

/* ---------- UTILIDADES ---------- */
function reiniciarCurso() {
  if (!confirm('¿Volver al inicio? Tu progreso se conserva.')) return;
  irAModulo(0);
}

function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: 'linear-gradient(135deg, #a855f7, #facc15)',
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

/* ---------- ATAJOS ---------- */
document.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(e.target.tagName)) return;
  if (e.key === 'ArrowRight') {
    if (estado.moduloActual < TOTAL_MODULOS - 1) {
      marcarCompletado(estado.moduloActual);
      irAModulo(estado.moduloActual + 1);
    }
  } else if (e.key === 'ArrowLeft') {
    if (estado.moduloActual > 0) irAModulo(estado.moduloActual - 1);
  }
});
