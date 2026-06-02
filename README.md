# 🎓 Currículo 2026 — Tecnología e Informática · Grado Once

> Una serie de **minicursos interactivos** diseñados para enseñar tecnología e informática a jóvenes de 15 a 17 años. Sin servidores, sin instalaciones, sin frameworks complicados: solo **abre el navegador y aprende**.

---

## ✨ ¿Qué es esto?

Este repositorio es un **currículo completo de aprendizaje autodirigido** para estudiantes de grado once. Cada minicurso:

- ⏱️ Dura aproximadamente **3 horas y 45 minutos** de estudio.
- 🎮 Combina **teoría, ejemplos prácticos y actividades interactivas** (quizzes, juegos de roles, simulaciones, constructores).
- 🏆 Tiene **sistema de progreso e insignias** que motiva a avanzar.
- 🎨 Posee **identidad visual propia** con paletas de color únicas por temática.
- 💾 **Guarda automáticamente tu avance** en el navegador.

Está pensado, escrito y diseñado para que un estudiante pueda recorrerlo solo, sin perder en ningún momento las ganas de continuar.

---

## 📚 Cursos disponibles

### ⚡ Curso 1 — Algoritmos en C#

| Clase | Tema | Estado |
|-------|------|--------|
| **Clase 12** | Funciones en C# (definición, parámetros, retorno, valor vs. referencia, talleres matemáticos y algoritmos modulares) | ✅ Disponible |
| *Otras clases* | A lo largo del año se irán añadiendo | 🔜 En desarrollo |

### 📐 Curso 2 — Análisis y Diseño de Software

| Clase | Tema | Estado |
|-------|------|--------|
| **Clase 1** | Análisis y diseño · Ciclo de vida del software · Metodologías ágiles vs. estructuradas | ✅ Disponible |
| **Clase 2** | Requerimientos funcionales y no funcionales · Atributos de calidad ISO 25010 · Historias de usuario | ✅ Disponible |
| **Clase 3** | Elicitación de requerimientos · Entrevistas, encuestas y observación · Juego de roles cliente-analista | ✅ Disponible |
| **Clase 4** | Documentación de requerimientos · Casos de uso · Estándar IEEE 830 · Revisión cruzada | ✅ Disponible |

### 🔮 Cursos por venir

- 🗄️ **Bases de Datos** — Modelo entidad-relación, SQL, normalización, consultas.
- 🛠️ **Herramientas de Programación II** — Git, depuración, frameworks modernos.

---

## 🚀 Cómo usarlo

### Para estudiantes

1. Descarga o clona el repositorio.
2. Abre el archivo `index.html` de la raíz en cualquier navegador moderno (Chrome, Firefox, Edge, Safari).
3. ¡Empieza el viaje! Desde la página principal puedes acceder a cualquier clase.

> 💡 **Tip:** tu progreso se guarda localmente en el navegador. Si vuelves desde el mismo computador y navegador, retomarás donde quedaste.

### Para docentes

- Puedes usar este material como **base para tus clases**: proyéctalo o pide a los estudiantes que lo recorran en casa.
- Cada curso incluye una **ruta sugerida** con módulos en orden, pero los estudiantes pueden saltar libremente.
- Las actividades prácticas (talleres, juegos, retos finales) son ideales para **trabajar en parejas o grupos**.

---

## 🏗️ Arquitectura del proyecto

```
once/
├── 🎓 index.html, estilos.css, app.js     ← Página principal (hub)
│
├── ⚡ Algoritmos con C#/
│   └── doce-curso-funciones-csharp/       ← Clase 12: Funciones
│
└── 📐 analisis-diseno/
    ├── uno-curso-analisis-diseno/         ← Clase 1
    ├── dos-curso-requerimientos/          ← Clase 2
    ├── tres-curso-elicitacion/            ← Clase 3
    └── cuatro-curso-documentacion/        ← Clase 4
```

### Filosofía: "tres archivos por curso"

Cada curso es **completamente autocontenido** en tres archivos:

| Archivo | Función |
|---------|---------|
| `index.html` | Todo el contenido textual del curso, dividido en módulos |
| `estilos.css` | Diseño visual con la paleta de colores propia del curso |
| `app.js` | Navegación, progreso, quizzes y actividades interactivas |

No hay frameworks, ni librerías externas, ni paso de compilación. Si quieres, puedes **abrir un curso desde una memoria USB** y funcionará igual.

---

## 🎨 Características pedagógicas

Cada minicurso fue diseñado con principios claros:

- **Lenguaje sencillo pero técnico:** explicaciones cercanas, sin abandonar el rigor.
- **Analogías cotidianas:** ejemplos con pizzerías, panaderías, biblioteca del colegio, app de comida...
- **Talleres prácticos:** no solo leer — el estudiante construye, decide, elige.
- **Quizzes con retroalimentación inmediata:** verde/rojo, explicación de cada error.
- **Sistema de insignias:** desbloqueables al completar módulos y actividades.
- **Barra de progreso visible:** siempre sabes dónde estás del curso.
- **Casos simulados realistas:** problemas tomados de contextos escolares y profesionales.

---

## 🌈 Identidad visual

Cada curso tiene una paleta diferente para que sean fáciles de distinguir:

| Curso | Tema visual | Colores principales |
|-------|-------------|---------------------|
| Algoritmos en C# | Energía y código | Morado · Rosa · Cyan |
| Análisis y Diseño (Clase 1) | Plano arquitectónico | Azul profundo · Dorado |
| Requerimientos (Clase 2) | Documentación técnica | Esmeralda · Ámbar |
| Elicitación (Clase 3) | Detective / Investigación | Violeta · Dorado · Rosa |
| Documentación (Clase 4) | Documento oficial | Índigo · Bronce · Crema |

---

## 🛠️ Tecnología

- **HTML5** para la estructura.
- **CSS3** con variables, grids y animaciones.
- **JavaScript** (ES6+) sin librerías externas.
- **localStorage** para guardar progreso.

**Sin** Node, **sin** npm, **sin** servidor, **sin** dependencias. Todo corre directamente en el navegador.

### Verificar cambios en el código

El proyecto no usa pruebas automatizadas formales. Para validar que un curso modificado siga funcionando:

```bash
# Validar HTML (etiquetas balanceadas)
python3 -c "
import html.parser
class V(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(); self.stack=[]; self.errors=[]
        self.void={'br','hr','img','meta','link','input'}
    def handle_starttag(self,t,a):
        if t not in self.void: self.stack.append(t)
    def handle_endtag(self,t):
        if not self.stack or self.stack[-1]!=t: self.errors.append(t)
        else: self.stack.pop()
v=V();
with open('ruta/index.html') as f: v.feed(f.read())
print('Abiertas:', v.stack, '· Errores:', v.errors)
"

# Validar sintaxis JS
node -c ruta/app.js

# Validar balance de llaves CSS
python3 -c "c=open('ruta/estilos.css').read(); print(c.count('{'), c.count('}'))"
```

---

## 🤝 Cómo agregar una nueva clase

Si eres docente y quieres expandir el currículo:

1. Crea una carpeta con el patrón `<numero-en-letras>-curso-<tema>/` (por ejemplo `cinco-curso-modelado-bpmn/`).
2. Copia los tres archivos (`index.html`, `estilos.css`, `app.js`) de la clase más reciente como base.
3. Ajusta:
   - El número de módulos (`TOTAL_MODULOS` en `app.js`).
   - La clave de `localStorage` (única por curso).
   - Los nombres de las insignias.
   - La paleta de colores en `estilos.css`.
4. Agrega la nueva tarjeta en `index.html` de la raíz.
5. Actualiza el contador de clases en la página principal.

Para detalles técnicos finos, revisa el archivo `CLAUDE.md` en la raíz del repositorio.

---

## 📂 Estado actual

- ✅ **5 clases interactivas** completamente funcionales
- ⏱️ **~18 horas** de material de estudio
- 🎯 **2 cursos activos** + **2 cursos en desarrollo**

---

## 🎯 Público objetivo

| Aspecto | Detalle |
|---------|---------|
| Grado | 11° (Once) |
| Edad | 15 a 17 años |
| Idioma | Español |
| Nivel previo | No requiere experiencia previa en programación o ingeniería |
| Modalidad | Autoestudio guiado, ideal para trabajo individual o en parejas |

---

## 💭 Filosofía del proyecto

> *"Antes de hacer, hay que pensar. Antes de pensar, hay que entender. Antes de entender, hay que escuchar."*

Este currículo cree firmemente que **enseñar programación NO es enseñar a escribir código**: es enseñar a pensar, a comunicar, a analizar problemas. Por eso casi todo el material se centra en **habilidades transferibles**, no en sintaxis ni en herramientas particulares.

Si un estudiante termina estos cursos sabiendo más sobre análisis, diseño, documentación y elicitación que sobre un lenguaje específico, **habremos cumplido el objetivo**.

---

## 📜 Licencia y uso

Material educativo creado para estudiantes de grado once. Eres libre de usarlo, adaptarlo y compartirlo con fines educativos.

---

<div align="center">

**Hecho con ❤️ para los estudiantes de grado once**

*Currículo 2026 · Tecnología e Informática*

</div>
