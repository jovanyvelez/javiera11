/* ============================================================
   CLASE 10 — POO EN C# · LÓGICA INTERACTIVA
   Incluye el simulador de objetos (Estudiante, Auto, Libro)
   que replica el comportamiento de las clases escritas en C#.
============================================================ */

const TOTAL_MODULOS = 10; // 0..9

const estado = {
  moduloActual: 0,
  completados: new Set(),
  quizzes: {},
  badges: new Set()
};

/* ---------- INICIO ---------- */
document.addEventListener('DOMContentLoaded', () => {
  cargarProgreso();
  configurarNavegacion();
  configurarBotonesInternos();
  configurarQuizzes();
  configurarSimulador();
  resaltarCodigo();
  actualizarUI();
});

/* ---------- PERSISTENCIA ---------- */
function guardarProgreso() {
  try {
    localStorage.setItem('curso-csharp-poo-10', JSON.stringify({
      moduloActual: estado.moduloActual,
      completados:  [...estado.completados],
      quizzes:      estado.quizzes,
      badges:       [...estado.badges]
    }));
  } catch (e) { /* sin storage */ }
}

function cargarProgreso() {
  try {
    const datos = JSON.parse(localStorage.getItem('curso-csharp-poo-10'));
    if (!datos) return;
    estado.moduloActual = datos.moduloActual || 0;
    estado.completados  = new Set(datos.completados || []);
    estado.quizzes      = datos.quizzes || {};
    estado.badges       = new Set(datos.badges || []);
  } catch (e) { /* ignorar */ }
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

/* ---------- MARCAR COMPLETADOS ---------- */
function marcarCompletado(n) {
  if (estado.completados.has(n)) return;
  estado.completados.add(n);

  if (n === 0)  otorgarBadge('🚀 Iniciado');
  if (n === 1)  otorgarBadge('🧠 Pensador POO');
  if (n === 2)  otorgarBadge('📐 Arquitecto');
  if (n === 3)  otorgarBadge('🎨 Artista de Datos');
  if (n === 4)  otorgarBadge('⚙️ Maestro de Acciones');
  if (n === 5)  otorgarBadge('🎂 Partero de Objetos');
  if (n === 6)  otorgarBadge('🧪 Constructor');
  if (n === 7)  otorgarBadge('🎭 Director de Objetos');
  if (n === 8)  otorgarBadge('🪞 Crítico');

  if (estado.completados.size === TOTAL_MODULOS - 1) {
    otorgarBadge('🏆 Maestro de la POO');
  }

  guardarProgreso();
}

function otorgarBadge(nombre) {
  if (estado.badges.has(nombre)) return;
  estado.badges.add(nombre);
  mostrarToast(`🎉 ¡Insignia desbloqueada: ${nombre}!`);
  actualizarUI();
}

/* ---------- ACTUALIZAR UI ---------- */
function actualizarUI() {
  const total = TOTAL_MODULOS - 1; // 0..8
  const completos = [...estado.completados].filter(x => x >= 1 && x <= total).length;
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
            opciones.forEach(o => { if (o.dataset.op === correcta) o.classList.add('correcta'); });
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
      res.textContent = `👍 ${aciertos}/${total} correctas. ¡Buen intento! Revisa lo que fallaste.`;
    } else {
      res.classList.add('parcial');
      res.textContent = `🤔 ${aciertos}/${total}. Te invitamos a releer el módulo y volver a intentar.`;
    }
  }

  guardarProgreso();
}

/* ============================================================
   SIMULADOR DE OBJETOS (Módulo 7)
   Implementación JS de las 3 clases C#: Estudiante, Auto, Libro
   El usuario interactúa creando instancias y llamando métodos.
============================================================ */

// "Clases" en JS (sintaxis equivalente a las clases C# del taller)
class Estudiante {
  constructor(nombre, edad, grado) {
    this.nombre = nombre;
    this.edad   = edad;
    this.grado  = grado;
    this.nota1  = 0;
    this.nota2  = 0;
    this.nota3  = 0;
  }
  ponerNota(cual, valor) {
    if (cual === 1)      this.nota1 = valor;
    else if (cual === 2) this.nota2 = valor;
    else if (cual === 3) this.nota3 = valor;
    else return `❌ Nota "${cual}" no válida. Usa 1, 2 o 3.`;
    return `📝 Nota ${cual} puesta: ${valor.toFixed(1)}`;
  }
  calcularPromedio() {
    return (this.nota1 + this.nota2 + this.nota3) / 3;
  }
  obtenerEstado() {
    const p = this.calcularPromedio();
    if (p >= 4.5) return '🌟 Excelente';
    if (p >= 4.0) return '🎉 Sobresaliente';
    if (p >= 3.0) return '👍 Aprobado';
    return '📚 Necesita refuerzo';
  }
  presentarse() {
    const p = this.calcularPromedio();
    return `👋 Hola, soy ${this.nombre}, tengo ${this.edad} años y voy en ${this.grado}.\n` +
           `   Mi promedio es ${p.toFixed(2)} (${this.obtenerEstado()})`;
  }
}

class Auto {
  constructor(marca, color) {
    this.marca     = marca;
    this.color     = color;
    this.velocidad = 0;
    this.encendido = false;
  }
  encender() {
    if (this.encendido) return '💡 Ya estaba encendido';
    this.encendido = true;
    return `🔑 ¡Brum brum! ${this.marca} encendido.`;
  }
  apagar() {
    if (this.velocidad > 0) return '⚠️ Detén el auto primero';
    this.encendido = false;
    return `🔇 ${this.marca} apagado.`;
  }
  acelerar(cuanto) {
    if (!this.encendido) return '❌ Enciende el auto antes de acelerar';
    this.velocidad += cuanto;
    return `💨 ${this.marca} ahora va a ${this.velocidad} km/h`;
  }
  frenar(cuanto) {
    this.velocidad -= cuanto;
    if (this.velocidad < 0) this.velocidad = 0;
    return `🛑 ${this.marca} frenó a ${this.velocidad} km/h`;
  }
  tocarBocina() {
    return `📣 ¡PIP PIP! (${this.marca} ${this.color})`;
  }
}

class Libro {
  constructor(titulo, autor, paginas) {
    this.titulo  = titulo;
    this.autor   = autor;
    this.paginas = paginas;
    this.leidas  = 0;
  }
  leer(cantidad) {
    if (this.leidas + cantidad > this.paginas) {
      cantidad = this.paginas - this.leidas;
    }
    this.leidas += cantidad;
    if (cantidad > 0) return `📖 Has leído ${cantidad} páginas de "${this.titulo}"`;
    return '✅ Ya terminaste el libro';
  }
  obtenerProgreso() {
    return (this.leidas * 100.0) / this.paginas;
  }
  estaTerminado() {
    return this.leidas >= this.paginas;
  }
  mostrarInfo() {
    const p = this.obtenerProgreso();
    let extra = this.estaTerminado()
      ? '\n   ✅ ¡Terminado!'
      : `\n   ⏳ Te faltan ${this.paginas - this.leidas} páginas`;
    return `📕 ${this.titulo} — ${this.autor}\n` +
           `   Progreso: ${this.leidas}/${this.paginas} (${p.toFixed(1)}%)` + extra;
  }
}

// Estado del simulador
const sim = {
  estudiante: null,
  auto: null,
  libro: null,
  log: []
};

function logSim(mensaje, tipo = 'ok') {
  sim.log.push({ mensaje, tipo });
  const salida = document.getElementById('consola-salida');
  if (salida) {
    if (salida.querySelector('.hint')) salida.innerHTML = '';
    const line = document.createElement('p');
    line.className = 'log-line ' + tipo;
    // Soporta saltos de línea en el mensaje
    line.innerHTML = mensaje.replace(/\n/g, '<br>');
    salida.appendChild(line);
    salida.scrollTop = salida.scrollHeight;
  }
}

function renderAtributos(panelId, attrsId, obj, attrList) {
  const cont = document.getElementById(attrsId);
  if (!cont) return;
  cont.innerHTML = '';
  attrList.forEach(({ key, label, fmt }) => {
    const chip = document.createElement('span');
    chip.className = 'atributo-chip';
    let val = obj[key];
    if (fmt) val = fmt(val);
    chip.innerHTML = `<strong>${label}:</strong> ${val}`;
    cont.appendChild(chip);
  });
}

function configurarSimulador() {
  // ----- Tabs -----
  document.querySelectorAll('.tab-sim').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.tab-sim').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === target));
    });
  });

  // ----- ESTUDIANTE -----
  document.getElementById('est-crear').addEventListener('click', () => {
    const nombre = document.getElementById('est-nombre').value || 'Sin nombre';
    const edad   = parseInt(document.getElementById('est-edad').value, 10) || 16;
    const grado  = document.getElementById('est-grado').value || '10°';
    sim.estudiante = new Estudiante(nombre, edad, grado);
    logSim(`✨ Estudiante creado: ${nombre}, ${edad} años, ${grado}°`);
    document.getElementById('est-estado').style.display = 'block';
    renderAtributos('est', 'est-atributos', sim.estudiante, [
      { key: 'nombre', label: 'Nombre' },
      { key: 'edad',   label: 'Edad' },
      { key: 'grado',  label: 'Grado' },
      { key: 'nota1',  label: 'Nota 1', fmt: v => v.toFixed(1) },
      { key: 'nota2',  label: 'Nota 2', fmt: v => v.toFixed(1) },
      { key: 'nota3',  label: 'Nota 3', fmt: v => v.toFixed(1) },
      { key: 'promedio', label: 'Promedio', fmt: v => v.toFixed(2) }
    ], true);
  });

  document.getElementById('est-poner').addEventListener('click', () => {
    if (!sim.estudiante) return logSim('❌ Primero crea un estudiante', 'error');
    const cual  = parseInt(document.getElementById('est-cual').value, 10);
    const valor = parseFloat(document.getElementById('est-valor').value);
    logSim(sim.estudiante.ponerNota(cual, valor));
    renderAtributos('est', 'est-atributos', sim.estudiante, [
      { key: 'nombre', label: 'Nombre' },
      { key: 'edad',   label: 'Edad' },
      { key: 'grado',  label: 'Grado' },
      { key: 'nota1',  label: 'Nota 1', fmt: v => v.toFixed(1) },
      { key: 'nota2',  label: 'Nota 2', fmt: v => v.toFixed(1) },
      { key: 'nota3',  label: 'Nota 3', fmt: v => v.toFixed(1) },
      { key: 'promedio', label: 'Promedio', fmt: v => v.toFixed(2) }
    ], true);
  });

  document.getElementById('est-presentarse').addEventListener('click', () => {
    if (!sim.estudiante) return logSim('❌ Primero crea un estudiante', 'error');
    logSim(sim.estudiante.presentarse());
  });

  // ----- AUTO -----
  document.getElementById('auto-crear').addEventListener('click', () => {
    const marca = document.getElementById('auto-marca').value || 'Genérico';
    const color = document.getElementById('auto-color').value || 'Blanco';
    sim.auto = new Auto(marca, color);
    logSim(`✨ Auto creado: ${marca} ${color}`);
    document.getElementById('auto-estado').style.display = 'block';
    renderAtributos('auto', 'auto-atributos', sim.auto, [
      { key: 'marca',     label: 'Marca' },
      { key: 'color',     label: 'Color' },
      { key: 'velocidad', label: 'Velocidad', fmt: v => v + ' km/h' },
      { key: 'encendido', label: 'Encendido', fmt: v => v ? '✅' : '❌' }
    ]);
  });

  document.getElementById('auto-encender').addEventListener('click', () => {
    if (!sim.auto) return logSim('❌ Primero crea un auto', 'error');
    logSim(sim.auto.encender());
    renderAtributos('auto', 'auto-atributos', sim.auto, [
      { key: 'marca',     label: 'Marca' },
      { key: 'color',     label: 'Color' },
      { key: 'velocidad', label: 'Velocidad', fmt: v => v + ' km/h' },
      { key: 'encendido', label: 'Encendido', fmt: v => v ? '✅' : '❌' }
    ]);
  });

  document.getElementById('auto-acelerar').addEventListener('click', () => {
    if (!sim.auto) return logSim('❌ Primero crea un auto', 'error');
    const cuanto = parseInt(document.getElementById('auto-cuanto').value, 10) || 10;
    logSim(sim.auto.acelerar(cuanto));
    renderAtributos('auto', 'auto-atributos', sim.auto, [
      { key: 'marca',     label: 'Marca' },
      { key: 'color',     label: 'Color' },
      { key: 'velocidad', label: 'Velocidad', fmt: v => v + ' km/h' },
      { key: 'encendido', label: 'Encendido', fmt: v => v ? '✅' : '❌' }
    ]);
  });

  document.getElementById('auto-frenar').addEventListener('click', () => {
    if (!sim.auto) return logSim('❌ Primero crea un auto', 'error');
    const cuanto = parseInt(document.getElementById('auto-freno').value, 10) || 10;
    logSim(sim.auto.frenar(cuanto));
    renderAtributos('auto', 'auto-atributos', sim.auto, [
      { key: 'marca',     label: 'Marca' },
      { key: 'color',     label: 'Color' },
      { key: 'velocidad', label: 'Velocidad', fmt: v => v + ' km/h' },
      { key: 'encendido', label: 'Encendido', fmt: v => v ? '✅' : '❌' }
    ]);
  });

  document.getElementById('auto-bocina').addEventListener('click', () => {
    if (!sim.auto) return logSim('❌ Primero crea un auto', 'error');
    logSim(sim.auto.tocarBocina());
  });

  document.getElementById('auto-apagar').addEventListener('click', () => {
    if (!sim.auto) return logSim('❌ Primero crea un auto', 'error');
    logSim(sim.auto.apagar());
    renderAtributos('auto', 'auto-atributos', sim.auto, [
      { key: 'marca',     label: 'Marca' },
      { key: 'color',     label: 'Color' },
      { key: 'velocidad', label: 'Velocidad', fmt: v => v + ' km/h' },
      { key: 'encendido', label: 'Encendido', fmt: v => v ? '✅' : '❌' }
    ]);
  });

  // ----- LIBRO -----
  document.getElementById('lib-crear').addEventListener('click', () => {
    const titulo  = document.getElementById('lib-titulo').value  || 'Sin título';
    const autor   = document.getElementById('lib-autor').value   || 'Anónimo';
    const paginas = parseInt(document.getElementById('lib-paginas').value, 10) || 100;
    sim.libro = new Libro(titulo, autor, paginas);
    logSim(`✨ Libro creado: "${titulo}" de ${autor} (${paginas} páginas)`);
    document.getElementById('lib-estado').style.display = 'block';
    renderAtributos('lib', 'lib-atributos', sim.libro, [
      { key: 'titulo',  label: 'Título' },
      { key: 'autor',   label: 'Autor' },
      { key: 'paginas', label: 'Páginas' },
      { key: 'leidas',  label: 'Leídas' },
      { key: 'progreso', label: 'Progreso', fmt: v => v.toFixed(1) + '%' }
    ]);
  });

  document.getElementById('lib-leer').addEventListener('click', () => {
    if (!sim.libro) return logSim('❌ Primero crea un libro', 'error');
    const cantidad = parseInt(document.getElementById('lib-cantidad').value, 10) || 10;
    logSim(sim.libro.leer(cantidad));
    renderAtributos('lib', 'lib-atributos', sim.libro, [
      { key: 'titulo',  label: 'Título' },
      { key: 'autor',   label: 'Autor' },
      { key: 'paginas', label: 'Páginas' },
      { key: 'leidas',  label: 'Leídas' },
      { key: 'progreso', label: 'Progreso', fmt: v => v.toFixed(1) + '%' }
    ]);
  });

  document.getElementById('lib-info').addEventListener('click', () => {
    if (!sim.libro) return logSim('❌ Primero crea un libro', 'error');
    logSim(sim.libro.mostrarInfo());
  });

  // Badge por interactuar con el simulador
  if (!estado.badges.has('🎭 Director de Objetos')) {
    // se otorga al completar el módulo 7 (en marcarCompletado)
  }
}

/* ---------- MOSTRAR / OCULTAR SOLUCIONES ---------- */
function toggleSolucion(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('visible');
}

/* ---------- REINICIAR CURSO ---------- */
function reiniciarCurso() {
  if (!confirm('¿Quieres volver al inicio? Tu progreso se conserva en el navegador.')) return;
  irAModulo(0);
}

/* ---------- TOAST DE NOTIFICACIÓN ---------- */
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: 'linear-gradient(135deg, #ff6b35, #ffb627)',
    color: '#1a0f0a',
    padding: '0.9rem 1.4rem',
    borderRadius: '30px',
    fontWeight: '800',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
    zIndex: '1000',
    transition: 'all 0.4s ease',
    opacity: '0',
    transform: 'translateY(20px)',
    maxWidth: '90%',
    fontSize: '0.92rem'
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
  }, 3500);
}

/* ============================================================
   RESALTADOR DE CÓDIGO (tokenizer, NO regex sobre innerHTML)
============================================================ */
function resaltarCodigo() {
  const palabrasClave = new Set([
    'public', 'static', 'void', 'int', 'double', 'string', 'bool', 'char',
    'long', 'return', 'if', 'else', 'for', 'while', 'do', 'switch', 'case',
    'break', 'continue', 'class', 'using', 'true', 'false', 'new', 'null',
    'default', 'this', 'in', 'ref', 'out', 'namespace', 'var', 'const'
  ]);
  const tiposClase = new Set(['Console', 'Math', 'Convert', 'String', 'Auto', 'Libro', 'Estudiante', 'Mascota', 'CuentaBancaria']);

  const esc = (c) => {
    if (c === '<') return '&lt;';
    if (c === '>') return '&gt;';
    if (c === '&') return '&amp;';
    return c;
  };
  const escStr = (s) => {
    let r = '';
    for (const c of s) r += esc(c);
    return r;
  };

  const esDigito  = (c) => c >= '0' && c <= '9';
  const esLetra   = (c) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  const esLetraNum = (c) => esLetra(c) || esDigito(c);

  function tokenizar(codigo) {
    let out = '';
    let i = 0;
    const n = codigo.length;

    while (i < n) {
      const c = codigo[i];

      if (c === '/' && codigo[i + 1] === '/') {
        let fin = codigo.indexOf('\n', i);
        if (fin === -1) fin = n;
        out += '<span class="c-com">' + escStr(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      if (c === '"') {
        let fin = i + 1;
        while (fin < n && codigo[fin] !== '"' && codigo[fin] !== '\n') {
          if (codigo[fin] === '\\' && fin + 1 < n) fin++;
          fin++;
        }
        if (fin < n && codigo[fin] === '"') fin++;
        out += '<span class="c-str">' + escStr(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      if (c === "'") {
        let fin = i + 1;
        while (fin < n && codigo[fin] !== "'" && codigo[fin] !== '\n') {
          if (codigo[fin] === '\\' && fin + 1 < n) fin++;
          fin++;
        }
        if (fin < n && codigo[fin] === "'") fin++;
        out += '<span class="c-str">' + escStr(codigo.slice(i, fin)) + '</span>';
        i = fin;
        continue;
      }

      if (esDigito(c)) {
        let fin = i;
        while (fin < n && (esDigito(codigo[fin]) || codigo[fin] === '.')) fin++;
        out += '<span class="c-num">' + codigo.slice(i, fin) + '</span>';
        i = fin;
        continue;
      }

      if (esLetra(c)) {
        let fin = i;
        while (fin < n && esLetraNum(codigo[fin])) fin++;
        const palabra = codigo.slice(i, fin);
        if (palabrasClave.has(palabra)) {
          out += '<span class="c-kw">' + palabra + '</span>';
        } else if (tiposClase.has(palabra)) {
          out += '<span class="c-cls">' + palabra + '</span>';
        } else {
          out += palabra;
        }
        i = fin;
        continue;
      }

      out += esc(c);
      i++;
    }
    return out;
  }

  document.querySelectorAll('.bloque-codigo pre, .solucion pre, .caja-resultado pre').forEach(pre => {
    const codigo = pre.textContent;
    pre.innerHTML = tokenizar(codigo);
  });

  const style = document.createElement('style');
  style.textContent = `
    .c-kw  { color: #ff6b35; font-weight: 700; }
    .c-str { color: #ffb627; }
    .c-num { color: #06d6a0; }
    .c-com { color: #7a5d4a; font-style: italic; }
    .c-cls { color: #06d6a0; font-weight: 700; }
  `;
  document.head.appendChild(style);
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
    if (estado.moduloActual > 0) {
      irAModulo(estado.moduloActual - 1);
    }
  }
});
