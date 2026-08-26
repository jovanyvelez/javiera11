/* ============================================================
   PÁGINA PRINCIPAL — LÓGICA INTERACTIVA
   Lee progreso de cada curso desde localStorage y lo muestra
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  mostrarFecha();
  configurarAcordeon();
  cargarProgresoPorClase();
  animarStats();
});

/* ---------- FECHA EN HEADER ---------- */
function mostrarFecha() {
  const el = document.getElementById('fecha-hub');
  if (!el) return;

  const hoy = new Date();
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const d = dias[hoy.getDay()];
  const dia = hoy.getDate();
  const m = meses[hoy.getMonth()];
  const a = hoy.getFullYear();

  el.textContent = `${d}, ${dia} de ${m} de ${a}`;
}

/* ---------- ACORDEÓN DE CURSOS ---------- */
function configurarAcordeon() {
  const bloques = document.querySelectorAll('.curso-bloque');

  bloques.forEach((bloque, idx) => {
    const encabezado = bloque.querySelector('.curso-encabezado');
    const grid = bloque.querySelector('.cuadricula-clases');

    // Calcula y fija la altura "natural" del grid para animar max-height
    if (grid) {
      grid.style.maxHeight = grid.scrollHeight + 'px';
    }

    // Colapsa todos por defecto excepto el primero (que queda abierto de bienvenida)
    if (idx !== 0) {
      bloque.classList.add('colapsado');
    }

    // Inyecta chevron y contenedor de progreso % en el encabezado
    const meta = encabezado.querySelector('.curso-meta');
    if (meta && !encabezado.querySelector('.chevron-curso')) {
      const pct = document.createElement('span');
      pct.className = 'curso-progreso-pct';
      pct.textContent = '0%';
      meta.insertBefore(pct, meta.firstChild);

      const chev = document.createElement('span');
      chev.className = 'chevron-curso';
      chev.textContent = '▾';
      chev.setAttribute('aria-hidden', 'true');
      encabezado.appendChild(chev);
    }

    // Toggle al click
    encabezado.addEventListener('click', () => {
      const colapsado = bloque.classList.toggle('colapsado');
      if (!colapsado && grid) {
        // Recalcula altura por si el contenido cambió (progreso cargado, etc.)
        grid.style.maxHeight = grid.scrollHeight + 'px';
      }
    });

    // Accesibilidad: Enter / Espacio
    encabezado.setAttribute('tabindex', '0');
    encabezado.setAttribute('role', 'button');
    encabezado.setAttribute('aria-expanded', idx === 0 ? 'true' : 'false');
    encabezado.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        encabezado.click();
      }
    });
  });

  // Sincroniza aria-expanded al colapsar/expandir
  const observer = new MutationObserver(() => {
    bloques.forEach(b => {
      const e = b.querySelector('.curso-encabezado');
      if (e) e.setAttribute('aria-expanded', b.classList.contains('colapsado') ? 'false' : 'true');
    });
  });
  bloques.forEach(b => observer.observe(b, { attributes: true, attributeFilter: ['class'] }));

  // Recalcula alturas cuando cambian tamaños (p.ej. al cargar progreso)
  window.addEventListener('resize', () => {
    document.querySelectorAll('.curso-bloque:not(.colapsado) .cuadricula-clases').forEach(grid => {
      grid.style.maxHeight = grid.scrollHeight + 'px';
    });
  });
}

/* ---------- LEER PROGRESO DE CADA CURSO ---------- */
function cargarProgresoPorClase() {
  // Total de módulos por clase (para calcular porcentaje correctamente)
  const TOTALES_MODULOS = {
    'curso-csharp-funciones':   7,   // 0..6 (m7 es opcional/final)
    'curso-csharp-funciones-7': 8,   // 0..7 (m8 es opcional/final)
    'curso-csharp-poo-10':      9,   // 0..8 (m9 es opcional/final)
    'curso-csharp-arreglos-11': 8,   // 0..7 (m8 es opcional/final)
    'curso-analisis-diseno':    7,
    'curso-requerimientos':     7,
    'curso-elicitacion':        8,
    'curso-documentacion':      8,
    'curso-introduccion-diseno': 6,   // 0..5 (m6 es opcional/final)
    'curso-integrador':          6,   // 0..5 (m6 es opcional/final)
    'curso-prototipado-usabilidad': 7,  // 0..6 (m7 es opcional/final)
    'curso-bd-introduccion': 6,         // 0..7 (m0 inicio y m4 descanso no cuentan; completables 1,2,3,5,6,7)
    'curso-bd-archivos-vs-bd': 6,        // idem
    'curso-bd-asyncpg-fastapi': 6,       // idem
    'curso-bd-modelo-er': 6,              // idem (clase 4)
    'curso-bd-normalizacion': 6,          // idem (clase 5)
    'curso-bd-sql-basico': 6,              // idem (clase 6)
    'curso-bd-modificacion-datos': 6,       // idem (clase 7)
    'curso-bd-consultas-basicas': 6,         // idem (clase 8)
    'curso-bd-ejemplo-final': 6,             // idem (clase 9)
    'curso-herr-1': 6,                        // 0..7 (m0 inicio y m4 descanso no cuentan)
    'curso-herr-2': 6,
    'curso-herr-3': 6,
    'curso-herr-4': 6,
    'curso-herr-5': 6,
    'curso-herr-6': 6,
    'curso-herr-7': 6,
    'curso-herr-8': 6
  };

  let totalGlobal = 0;
  let completosGlobal = 0;

  // Progreso agregado por curso (para el chip del encabezado)
  const porCurso = {};

  document.querySelectorAll('.clase-card[data-storage]').forEach(card => {
    const key = card.dataset.storage;
    const totalMods = TOTALES_MODULOS[key] || 7;
    const pct = calcularProgresoCurso(key, totalMods);

    actualizarBarraClase(card, pct);

    totalGlobal += totalMods;
    completosGlobal += Math.round((pct / 100) * totalMods);

    // Suma al curso correspondiente (data-curso del bloque padre)
    const bloque = card.closest('.curso-bloque');
    if (bloque) {
      const id = bloque.dataset.curso;
      if (!porCurso[id]) porCurso[id] = { sum: 0, n: 0 };
      porCurso[id].sum += pct;
      porCurso[id].n += 1;
    }
  });

  // Actualiza el chip de progreso en cada encabezado
  document.querySelectorAll('.curso-bloque').forEach(bloque => {
    const id = bloque.dataset.curso;
    const datos = porCurso[id];
    const chip = bloque.querySelector('.curso-progreso-pct');
    if (!chip || !datos) return;
    const promedio = Math.round(datos.sum / datos.n);
    chip.textContent = promedio + '%';
    chip.classList.toggle('completo', promedio === 100);
  });

  // Recalcula alturas de grids abiertos por si el texto cambió de tamaño
  document.querySelectorAll('.curso-bloque:not(.colapsado) .cuadricula-clases').forEach(grid => {
    grid.style.maxHeight = grid.scrollHeight + 'px';
  });

  // Actualizar el progreso global del dashboard
  const pctGlobal = totalGlobal > 0 ? Math.round((completosGlobal / totalGlobal) * 100) : 0;
  const elProg = document.getElementById('stat-progreso');
  if (elProg) {
    animarNumero(elProg, 0, pctGlobal, 1000, valor => valor + '%');
  }
}

function calcularProgresoCurso(key, totalMods) {
  try {
    const datos = JSON.parse(localStorage.getItem(key));
    if (!datos || !datos.completados) return 0;

    // Cursos de Bases de Datos y Herramientas: m0 (inicio) y m4 (descanso) no cuentan;
    // sólo suman los módulos de contenido completables 1,2,3,5,6,7.
    const completablesBD = [1, 2, 3, 5, 6, 7];
    const completados = (key.startsWith('curso-bd-') || key.startsWith('curso-herr-'))
      ? (datos.completados || []).filter(m => completablesBD.includes(m))
      : (datos.completados || []).filter(m => m <= totalMods - 1);
    return Math.round((completados.length / totalMods) * 100);
  } catch (e) {
    return 0;
  }
}

function actualizarBarraClase(card, pct) {
  const barra = card.querySelector('.progreso-mini-rellenar');
  const texto = card.querySelector('.progreso-texto strong');

  if (barra) {
    // Pequeño retardo para animar
    setTimeout(() => { barra.style.width = pct + '%'; }, 200);
  }
  if (texto) {
    texto.textContent = pct + '%';
  }

  // Si está al 100%, agregar estrella
  if (pct === 100) {
    const badge = card.querySelector('.clase-badge');
    if (badge && !badge.textContent.includes('★')) {
      badge.innerHTML += ' ★';
    }
  }
}

/* ---------- ANIMACIÓN DE NÚMEROS EN STATS ---------- */
function animarStats() {
  // Los 3 primeros son fijos
  animarNumero(document.getElementById('stat-cursos'),  0, 6,  800);
  animarNumero(document.getElementById('stat-clases'), 0, 28, 900);
  // El cuarto (horas) tiene "+" al final
  const elHoras = document.getElementById('stat-horas');
  if (elHoras) {
    animarNumero(elHoras, 0, 92, 1000, valor => valor + '+');
  }
  // El de progreso ya se actualiza en cargarProgresoPorClase
}

function animarNumero(el, desde, hasta, duracion, formato) {
  if (!el) return;
  const inicio = performance.now();
  formato = formato || (v => v.toString());

  function paso(t) {
    const prog = Math.min((t - inicio) / duracion, 1);
    // Easing: ease-out cubic
    const eased = 1 - Math.pow(1 - prog, 3);
    const valor = Math.round(desde + (hasta - desde) * eased);
    el.textContent = formato(valor);
    if (prog < 1) {
      requestAnimationFrame(paso);
    }
  }

  requestAnimationFrame(paso);
}

/* ---------- INTERSECCIÓN: ANIMA CUANDO ENTRAN EN PANTALLA ---------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'aparece 0.6s ease both';
    }
  });
}, { threshold: 0.1 });

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.curso-bloque, .proximamente, .info-extra').forEach(el => {
    observer.observe(el);
  });
});

/* ---------- TECLADO: NÚMERO PARA SALTAR A CURSO ---------- */
document.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

  // Atajos numéricos
  if (e.key === '1') {
    const card = document.querySelector('a.clase-card[data-storage="curso-csharp-funciones-7"]');
    if (card) card.click();
  } else if (e.key === '2') {
    const card = document.querySelector('a.clase-card[data-storage="curso-csharp-poo-10"]');
    if (card) card.click();
  } else if (e.key === '3') {
    const card = document.querySelector('a.clase-card[data-storage="curso-csharp-arreglos-11"]');
    if (card) card.click();
  } else if (e.key === '4') {
    const card = document.querySelector('a.clase-card[data-storage="curso-csharp-funciones"]');
    if (card) card.click();
  } else if (e.key === '5') {
    const card = document.querySelector('.clase-card.ad-1');
    if (card) card.click();
  } else if (e.key === '6') {
    const card = document.querySelector('.clase-card.ad-2');
    if (card) card.click();
  } else if (e.key === '7') {
    const card = document.querySelector('.clase-card.ad-3');
    if (card) card.click();
  } else if (e.key === '8') {
    const card = document.querySelector('.clase-card.ad-4');
    if (card) card.click();
  } else if (e.key === '9') {
    const card = document.querySelector('.clase-card.ad-5');
    if (card) card.click();
  } else if (e.key === '0') {
    const card = document.querySelector('.clase-card.ad-6');
    if (card) card.click();
  } else if (e.key === 'p' || e.key === 'P') {
    const card = document.querySelector('.clase-card.ad-7');
    if (card) card.click();
  } else if (e.key === 'b' || e.key === 'B') {
    const card = document.querySelector('.clase-card.bd-1');
    if (card) card.click();
  } else if (e.key === 'n' || e.key === 'N') {
    const card = document.querySelector('.clase-card.bd-2');
    if (card) card.click();
  } else if (e.key === 'm' || e.key === 'M') {
    const card = document.querySelector('.clase-card.bd-3');
    if (card) card.click();
  } else if (e.key === 'j' || e.key === 'J') {
    const card = document.querySelector('.clase-card.bd-4');
    if (card) card.click();
  } else if (e.key === 'v' || e.key === 'V') {
    const card = document.querySelector('.clase-card.bd-5');
    if (card) card.click();
  } else if (e.key === 'x' || e.key === 'X') {
    const card = document.querySelector('.clase-card.bd-6');
    if (card) card.click();
  } else if (e.key === 'c' || e.key === 'C') {
    const card = document.querySelector('.clase-card.bd-7');
    if (card) card.click();
  } else if (e.key === 'g' || e.key === 'G') {
    const card = document.querySelector('.clase-card.bd-8');
    if (card) card.click();
  } else if (e.key === 'd' || e.key === 'D') {
    const card = document.querySelector('.clase-card.bd-9');
    if (card) card.click();
  } else if (e.key === 'h' || e.key === 'H') {
    const card = document.querySelector('.clase-card.herr-1');
    if (card) card.click();
  } else if (e.key === 't' || e.key === 'T') {
    const card = document.querySelector('.clase-card.herr-2');
    if (card) card.click();
  } else if (e.key === 'q' || e.key === 'Q') {
    const card = document.querySelector('.clase-card.herr-3');
    if (card) card.click();
  } else if (e.key === 'w' || e.key === 'W') {
    const card = document.querySelector('.clase-card.herr-4');
    if (card) card.click();
  } else if (e.key === 'e' || e.key === 'E') {
    const card = document.querySelector('.clase-card.herr-5');
    if (card) card.click();
  } else if (e.key === 'r' || e.key === 'R') {
    const card = document.querySelector('.clase-card.herr-6');
    if (card) card.click();
  } else if (e.key === 'y' || e.key === 'Y') {
    const card = document.querySelector('.clase-card.herr-7');
    if (card) card.click();
  } else if (e.key === 'u' || e.key === 'U') {
    const card = document.querySelector('.clase-card.herr-8');
    if (card) card.click();
  }
});

/* ---------- TOAST DE BIENVENIDA SI HAY PROGRESO ---------- */
window.addEventListener('load', () => {
  // Verifica si el usuario ha avanzado en alguna clase
  const keys = ['curso-csharp-funciones-7', 'curso-csharp-poo-10', 'curso-csharp-arreglos-11',
                'curso-csharp-funciones', 'curso-analisis-diseno', 'curso-requerimientos',
                'curso-elicitacion', 'curso-documentacion', 'curso-introduccion-diseno',
                 'curso-integrador', 'curso-prototipado-usabilidad', 'curso-bd-introduccion', 'curso-bd-archivos-vs-bd', 'curso-bd-asyncpg-fastapi', 'curso-bd-modelo-er', 'curso-bd-normalizacion', 'curso-bd-sql-basico', 'curso-bd-modificacion-datos', 'curso-bd-consultas-basicas', 'curso-bd-ejemplo-final', 'curso-herr-1', 'curso-herr-2', 'curso-herr-3', 'curso-herr-4', 'curso-herr-5', 'curso-herr-6', 'curso-herr-7', 'curso-herr-8'];

  let tienePrograma = false;
  let ultimaClase = null;

  keys.forEach(k => {
    try {
      const d = JSON.parse(localStorage.getItem(k));
      if (d && d.completados && d.completados.length > 0) {
        tienePrograma = true;
        ultimaClase = k;
      }
    } catch (e) {}
  });

  if (tienePrograma) {
    setTimeout(() => {
      mostrarToast('👋 ¡Bienvenid@ de vuelta! Tu progreso está guardado.');
    }, 600);
  } else {
    setTimeout(() => {
      mostrarToast('💡 Tip: usa las teclas 1-9 y 0 para saltar rápido a una clase.');
    }, 1200);
  }
});

/* ---------- TOAST GENÉRICO ---------- */
function mostrarToast(mensaje) {
  const toast = document.createElement('div');
  toast.textContent = mensaje;
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
    color: '#fff',
    padding: '0.9rem 1.4rem',
    borderRadius: '30px',
    fontWeight: '700',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
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
  }, 4000);
}
