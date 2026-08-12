/* ============================================================
   PÁGINA PRINCIPAL — LÓGICA INTERACTIVA
   Lee progreso de cada curso desde localStorage y lo muestra
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  mostrarFecha();
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
    'curso-bd-consultas-basicas': 6         // idem (clase 8)
  };

  let totalGlobal = 0;
  let completosGlobal = 0;

  document.querySelectorAll('.clase-card[data-storage]').forEach(card => {
    const key = card.dataset.storage;
    const totalMods = TOTALES_MODULOS[key] || 7;
    const pct = calcularProgresoCurso(key, totalMods);

    actualizarBarraClase(card, pct);

    totalGlobal += totalMods;
    completosGlobal += Math.round((pct / 100) * totalMods);
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

    // Cursos de Bases de Datos: m0 (inicio) y m4 (descanso) no cuentan;
    // sólo suman los módulos de contenido completables 1,2,3,5,6,7.
    const completablesBD = [1, 2, 3, 5, 6, 7];
    const completados = key.startsWith('curso-bd-')
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
  animarNumero(document.getElementById('stat-cursos'),  0, 5,  800);
  animarNumero(document.getElementById('stat-clases'), 0, 19, 900);
  // El cuarto (horas) tiene "+" al final
  const elHoras = document.getElementById('stat-horas');
  if (elHoras) {
    animarNumero(elHoras, 0, 58, 1000, valor => valor + '+');
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
  }
});

/* ---------- TOAST DE BIENVENIDA SI HAY PROGRESO ---------- */
window.addEventListener('load', () => {
  // Verifica si el usuario ha avanzado en alguna clase
  const keys = ['curso-csharp-funciones-7', 'curso-csharp-poo-10', 'curso-csharp-arreglos-11',
                'curso-csharp-funciones', 'curso-analisis-diseno', 'curso-requerimientos',
                'curso-elicitacion', 'curso-documentacion', 'curso-introduccion-diseno',
                 'curso-integrador', 'curso-prototipado-usabilidad', 'curso-bd-introduccion', 'curso-bd-archivos-vs-bd', 'curso-bd-asyncpg-fastapi', 'curso-bd-modelo-er', 'curso-bd-normalizacion', 'curso-bd-sql-basico', 'curso-bd-modificacion-datos', 'curso-bd-consultas-basicas'];

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
