# 🏗️ Guía: Estructura de un proyecto por capas (conexión, lógica y diseño)

> Cómo organizar un monolito **FastAPI + Jinja2** en tres carpetas con una sola
> responsabilidad cada una: `nucleo/` (conexión), `dominio/` (lógica) y `presentacion/` (diseño).
> Por qué esa separación hace que el código se lea solo, cómo convertimos un proyecto
> plano en esa estructura **paso a paso**, y al final **la actividad que debes hacer**:
> crear la estructura base del sistema con tus propias manos.
>
> Acompaña la Clase 11 del módulo Herramientas de Programación II.

---

## 1. Un proyecto que funciona puede estar igual de roto por dentro

Tu proyecto `biblioteca/` arranca, se conecta a PostgreSQL, lista autores, crea, edita y
borra. Eso ya es un logro real. Pero llega el día en que te piden *«cambia la tarifa de
la multa»*… y descubres que esa fórmula vive en varios sitios. O que tu compañero nuevo
tardó cuarenta minutos en encontrar dónde estaba la regla.

Mira cómo se ve hoy por dentro:

```
biblioteca/
├── main.py            ←  22 líneas · arranca la app          (el punto de entrada)
├── database.py        ←  56 líneas · el pool de conexiones   (conexión)
├── dependencias.py    ←   8 líneas · un alias que todos importan (conexión)
├── esquemas.py        ←  13 líneas · validación de datos     (lógica)
├── repositorio.py     ← 116 líneas · TODO el SQL             (lógica)
├── vistas.py          ← 164 líneas · rutas + validación + SQL + plantillas ❌
├── ejercicios.py      ← 120 líneas · rutas de práctica       (diseño)
├── templates/         ← 18 plantillas .html                 (diseño)
└── docs/
```

**El problema no es el tamaño** (son menos de 500 líneas). El problema es que `vistas.py`
hace el trabajo de tres personas a la vez: declara la ruta, valida los datos, habla con
la base de datos y elige la plantilla. Y cuando un archivo hace de todo, no hay nombre
posible para él — y cuando no hay nombre, no hay lugar; y cuando no hay lugar, cada
cambio es una búsqueda a ciegas.

> **🔑 La primera regla de la estructura:** si no puedes decir qué hace un archivo
> **en una frase de cinco palabras**, ese archivo tiene varias responsabilidades.
> `repositorio.py` → «las consultas a la base de datos». Sí se puede.
> `vistas.py` → «las rutas… y el SQL… y los errores». No se puede.

**Tres preguntas que delatan el desorden** (respóndelas para tu proyecto hoy, y de nuevo
al terminar la actividad):

1. **¿Dónde va lo nuevo?** Si piden «agrega la página de préstamos», ¿qué archivo abres?
   Si tu respuesta es «depende…», todavía no hay estructura.
2. **¿Cuántos archivos toco si cambio algo?** «La multa pasa de $500 a $800». Si tienes
   que buscar el número por todo el proyecto, la regla está repetida.
3. **¿Puedo probarlo sin el resto?** «¿La multa quedó bien calculada?». Si para
   comprobarlo necesitas el servidor **y** PostgreSQL **y** el navegador, la lógica
   está amarrada a todo lo demás.

---

## 2. Separación de responsabilidades: conexión, lógica y diseño

Toda aplicación web hace tres trabajos distintos, y lo hace *mejor* si cada uno vive
en su propia carpeta:

| Capa | Carpeta | Responde a la pregunta… | Contiene |
|---|---|---|---|
| **1 · Conexión** | `nucleo/` | «¿De dónde vienen los datos y quién abre la puerta?» | configuración, variables de entorno, pool de conexiones |
| **2 · Lógica** | `dominio/` | «¿Qué reglas tiene el negocio?» | validación, multas, disponibilidad, SQL |
| **3 · Diseño** | `presentacion/` | «¿Qué ve el usuario en cada ruta?» | rutas, formularios, plantillas, CSS |

Cada capa tiene un **contrato**: lo que puede hacer y lo que no. El contrato es lo que
evita la mitad de las discusiones cuando dos personas trabajan juntas.

| Capa | ✅ Puede hacer | ❌ No puede hacer |
|---|---|---|
| **1 · Conexión** `nucleo/` | leer configuración, crear y cerrar el pool, entregar conexiones | saber qué es un autor, escribir SQL de la biblioteca, devolver HTML |
| **2 · Lógica** `dominio/` | validar datos, aplicar reglas, leer y escribir SQL | importar FastAPI o Jinja, abrir su propia conexión, devolver HTML |
| **3 · Diseño** `presentacion/` | declarar rutas, leer formularios, elegir plantilla | escribir SQL, guardar datos, decidir reglas del negocio |

> **🔑 La segunda regla:** las carpetas se nombran **por la responsabilidad, no por la
> tecnología**. No creamos `fastapi/` ni `asyncpg/`: el día que cambies de framework,
> esos nombres no significan nada. `nucleo/`, `dominio/` y `presentacion/` van a seguir
> significando lo mismo *dentro de diez años*.
>
> Prueba rápida: **si el nombre de la carpeta cambia cuando cambias de tecnología,
> es una mala carpeta.** (`carpeta_python/`, `carpeta_html/`, `utils/` — todos malos.)

---

## 3. La flecha que lo sostiene todo: las dependencias solo bajan

Las carpetas solas no son arquitectura. Lo que la convierte en arquitectura es una regla
de una línea: **cada capa solo puede importar hacia abajo, nunca hacia arriba.**

```
        presentacion/   ← rutas, plantillas, formularios
              ↓  puede usar a…
        dominio/         ← reglas, validación, SQL
              ↓  puede usar a…
        nucleo/          ← configuración y pool de conexiones
              ↓  (no importa a nadie)
```

- `presentacion/` puede importar de `dominio/` y de `nucleo/` (usa todo lo de abajo).
- `dominio/` puede importar de `nucleo/` (recibe la conexión; no sabe que hay interfaz).
- `nucleo/` no importa a nadie. **Es la única capa que se puede llevar a otro proyecto.**

¿Por qué importa? Porque cuando la flecha apunta para abajo, puedes **cambiar la base de
datos sin reescribir las reglas**, o cambiar las pantallas sin tocar el negocio. El día
que la flecha se rompe, un cambio en cualquier parte te obliga a tocar todas.

### El villano número uno: el import que sube

```python
# ❌ en nucleo/conexion.py — importando hacia ARRIBA
from presentacion.config import CONFIGURACION      # prohibido

# ✅ la solución es pasarlo por parámetro (se llama «inversión»)
async def conectar(url: str):
    """La capa de conexión no sabe de dónde salió la URL. Solo la usa."""
    ...

# …y en main.py, que sí puede ver todo, se hace la unión:
from nucleo.conexion import conectar
from nucleo.configuracion import CONFIGURACION
conectar(CONFIGURACION.base_datos)
```

### El villano número dos: el import circular

Ocurre cuando A importa a B y B importa a A. Python intenta cargarlos, y cuando llega al
segundo, el primero todavía no terminó de cargarse:

```
ImportError: cannot import name 'calcular_multa' from partially
initialized module 'dominio.servicios' (most likely due to a circular import)
```

Casi siempre significa que **una función está en la capa equivocada**: bájala a la capa
que le corresponde y el círculo desaparece solo. No busques el truco para esquivarlo;
pregúntate qué responsabilidad está haciendo esa capa, y muévela.

---

## 4. El árbol final (y qué es un paquete)

Este es el destino. Cada archivo nuevo que crees tiene su lugar aquí:

```
biblioteca/
├── main.py                      ← 20 líneas: solo arma las piezas
│
├── nucleo/                      ← CAPA 1 · CONEXIÓN
│   ├── __init__.py
│   ├── configuracion.py         ← lee las variables de entorno
│   └── conexion.py             ← el pool + la dependencia de FastAPI
│
├── dominio/                     ← CAPA 2 · LÓGICA
│   ├── __init__.py
│   ├── esquemas.py              ← modelos Pydantic (validación)
│   ├── servicios.py             ← NUEVO: aquí viven las reglas
│   └── repositorios.py          ← el único archivo con SQL
│
├── presentacion/                ← CAPA 3 · DISEÑO
│   ├── __init__.py
│   ├── rutas/
│   │   ├── __init__.py
│   │   ├── autores.py           ← un archivo por módulo de la biblioteca
│   │   └── ejercicios.py
│   ├── templates/               ← las 18 plantillas, sin cambios
│   └── static/                  ← CSS, imágenes, JavaScript
│
└── tests/                       ← probar la lógica sin servidor (opcional)
```

**¿Qué es el `__init__.py`?** El archivo que convierte una simple carpeta en algo que
Python puede importar como una unidad (un *paquete*). Sin él, `from dominio import
servicios` falla con `ModuleNotFoundError`. Su contenido es casi nada — una frase que
dice qué hay adentro:

```python
# nucleo/__init__.py
"""Capa 1 — Conexión. Configuración y pool de base de datos."""

# dominio/__init__.py
"""Capa 2 — Lógica. Reglas de la biblioteca, validación y repositorios."""

# presentacion/__init__.py
"""Capa 3 — Diseño. Rutas, plantillas y archivos estáticos."""
```

> **🔑 La tercera regla:** usa siempre **imports absolutos** (`from nucleo.conexion
> import get_conexion`) y con la barra `/`, que funciona igual en Windows, Mac y Linux.
> Al leerlos sabes de inmediato *dónde* vive cada cosa, sin contar puntos.

---

## 5. Paso a paso: del proyecto plano a las tres capas

Vamos a convertir `biblioteca/` sin reescribir el programa: **mover archivos y arreglar
imports**. Todo se hace en VS Code: carpetas y archivos con clic derecho en el panel
*Explorer* (Nueva carpeta / Nuevo archivo / arrastrar / `F2` para renombrar), y la
terminal integrada solo para dos cosas — arrancar el servidor y comprobar un import:

```
uvicorn main:app --reload        # arranca el servidor; déjalo corriendo

py -c "import main"              # comprueba los imports (Windows)
python3 -c "import main"         # comprueba los imports (Mac o Linux)

# si el servidor se queja de DATABASE_URL, ponla en esa misma terminal:
#   Windows:      $env:DATABASE_URL = "postgresql://…"
#   Mac o Linux:  export DATABASE_URL="postgresql://…"
```

Cada fase termina con una **prueba de fuego**. Si la prueba falla, *no sigas adelante*:
revertir es barato a tiempo y carísimo sobre una base rota.

### 5.0 · Respalda antes de tocar nada

Un `git commit` si trabajas con git, o una copia de la carpeta `biblioteca/` renombrada
`biblioteca-plana`. Para deshacer, borras la carpeta y renombras la copia.

> ⚠️ Cierra con `Ctrl+C` la terminal donde corre el servidor antes de borrar o mover
> carpetas: si no, Windows te dirá que el archivo «está siendo utilizado por otro proceso».

**Prueba de fuego:** levanta la app y recorre las pantallas que vas a comparar al final
(inicio, autores, crear, editar, borrar). Anótalas: la meta es que queden *exactamente
iguales* cuando termines.

### 5.1 · Crea el esqueleto (la estructura vacía, primero)

En el *Explorer*, clic derecho sobre `biblioteca/` → **Nueva carpeta**, y repite con:

```
nucleo   ·   dominio   ·   presentacion
```

Dentro de `presentacion/`, tres más:

```
rutas   ·   templates   ·   static
```

Y dentro de `nucleo/`, `dominio/`, `presentacion/` y `presentacion/rutas/`, crea un
archivo nuevo llamado `__init__.py` con la frase que le toca (sección 4).

**Prueba de fuego:** el *Explorer* muestra las tres capas con sus `__init__.py`. La app
todavía no arranca, y está bien: los archivos viejos siguen en su sitio.

### 5.2 · Capa 1 — `nucleo/` (configuración + conexión)

Dos archivos nuevos. El primero, el de configuración, es el único lugar del proyecto que
mira hacia afuera (las variables de entorno):

```python
# nucleo/configuracion.py
"""Capa 1 — Configuración: lo único que llega de afuera del código."""
import os


class Configuracion:
    """Se lee una sola vez, al arrancar. El resto del proyecto no toca os.environ."""
    base_datos: str = os.environ["DATABASE_URL"]   # la URL de Neon la trae el ambiente
    nombre_app: str = "Biblioteca"


CONFIGURACION = Configuracion()
```

El segundo es la **fusión de `database.py` y `dependencias.py`**: dos archivos con la
misma responsabilidad van en el mismo sitio, y ocho líneas no justifican un archivo
propio. El pool recibe la URL por parámetro — nunca la pide hacia arriba:

```python
# nucleo/conexion.py
"""Capa 1 — Conexión. Abre y cierra el pool; entrega conexiones a quien las pida."""
from typing import Annotated, AsyncGenerator

import asyncpg
from fastapi import Depends      # Depends es de la LIBRERÍA, no de nuestras capas


class Conexion:
    """Abre y cierra el pool. No sabe qué es un autor ni qué es una multa."""

    def __init__(self) -> None:
        self.pool: asyncpg.Pool | None = None

    async def conectar(self, url: str) -> None:
        if self.pool is not None:
            return                      # ya estaba abierto
        self.pool = await asyncpg.create_pool(dsn=url, min_size=1, max_size=10)

    async def cerrar(self) -> None:
        if self.pool is not None:
            await self.pool.close()
            self.pool = None


conexion = Conexion()                    # una sola instancia para toda la app


async def get_conexion() -> AsyncGenerator[asyncpg.Connection, None]:
    """Dependencia de FastAPI: cede una conexión del pool y la devuelve sola."""
    if conexion.pool is None:
        raise RuntimeError("El pool no está abierto.")
    async with conexion.pool.acquire() as conn:
        yield conn


# El alias que antes vivía en dependencias.py, ahora con su casa:
ConexionDep = Annotated[asyncpg.Connection, Depends(get_conexion)]
```

Después, en el *Explorer*: arrastra `database.py` y `dependencias.py` a `nucleo/`,
borra su contenido viejo y pega este. (Si prefieres conservar el histórico, fusiona el
código dentro de `nucleo/conexion.py` y borra los dos originales.)

**Prueba de fuego:** todavía no pasa nada — `main.py` sigue importando `database`. Eso
se arregla en el paso 5.5.

### 5.3 · Capa 2 — `dominio/` (esquemas, repositorios y servicios)

- Arrastra `esquemas.py` → `dominio/esquemas.py` (el archivo de siempre, nueva ubicación).
- Arrastra `repositorio.py` → `dominio/` y renómbralo con `F2` a `repositorios.py`.
  Este es **el único archivo del proyecto donde se escribe SQL**:

```python
# dominio/repositorios.py  (extracto — el resto de tus consultas va aquí)
"""Capa 2 — Acceso a datos: el único archivo del proyecto con SQL."""


async def obtener_autores(conn) -> list[dict]:
    rows = await conn.fetch(
        "SELECT id, nombre, pais, nacimiento FROM autores ORDER BY id"
    )
    return [dict(r) for r in rows]


async def existe_autor_con_nombre(conn, nombre: str) -> bool:
    """¿Ya existe un autor con ese nombre? La consulta más simple de todas."""
    return await conn.fetchval(
        "SELECT EXISTS(SELECT 1 FROM autores WHERE nombre = $1)", nombre
    )


async def crear_autor(conn, nombre: str, pais: str | None, nacimiento: int | None) -> dict:
    """INSERT INTO autores. Devuelve la fila ya guardada."""
    row = await conn.fetchrow(
        "INSERT INTO autores (nombre, pais, nacimiento) "
        "VALUES ($1, $2, $3) RETURNING *",
        nombre, pais, nacimiento,
    )
    return dict(row)
```

Y ahora el archivo nuevo, **el que faltaba**: `dominio/servicios.py`, el único lugar donde
una regla del negocio puede vivir sin que nadie tenga que buscarla. Recibe la conexión —
nunca la abre por su cuenta:

```python
# dominio/servicios.py
"""Reglas de la biblioteca.

Aquí vive lo que la biblioteca sabe hacer. No sabe de HTTP,
no sabe de plantillas y no abre conexiones: las recibe.
"""
from dominio import repositorios


class AutorDuplicado(Exception):
    """Regla violada: ya existe un autor con ese nombre."""


async def listar_autores(conn) -> list[dict]:
    """Todos los autores, de la más antigua a la más nueva."""
    return await repositorios.obtener_autores(conn)


async def registrar_autor(conn, nombre: str, pais: str | None, nacimiento: int | None) -> dict:
    """Crea un autor. REGLA: no se puede registrar dos veces el mismo nombre."""
    if await repositorios.existe_autor_con_nombre(conn, nombre):
        raise AutorDuplicado(nombre)                 # la regla vive aquí, en un solo sitio
    return await repositorios.crear_autor(conn, nombre, pais, nacimiento)
```

**Prueba de fuego:** busca `SELECT` en todo el proyecto (`Ctrl+Shift+F`): los resultados
deben aparecer **solo** en `dominio/repositorios.py`.

### 5.4 · Capa 3 — `presentacion/` (rutas, plantillas, estáticos)

- Arrastra la carpeta `templates/` → `presentacion/templates/` (las 18 plantillas,
  sin ningún cambio; solo cambia dónde las busca el servidor).
- Arrastra `vistas.py` → `presentacion/rutas/` y renómbralo a `autores.py`.
- Arrastra `ejercicios.py` → `presentacion/rutas/ejercicios.py`.

La ruta de «crear autor» deja de hacer todo y queda así — léela en voz alta y notarás
que suena a español:

```python
# presentacion/rutas/autores.py
"""Capa 3 — Rutas del módulo autores: recibe, delega y elige plantilla."""
from typing import Annotated

from fastapi import APIRouter, Form, Request
from fastapi.templating import Jinja2Templates
from pydantic import ValidationError

from dominio.esquemas import AutorCrear
from dominio.servicios import AutorDuplicado, listar_autores, registrar_autor
from nucleo.conexion import ConexionDep

templates = Jinja2Templates(directory="presentacion/templates")   # ojo a la carpeta nueva
router = APIRouter(prefix="/autores", tags=["autores"])


@router.post("/autores")
async def crear_autor(
    request: Request,
    conn: ConexionDep,
    nombre: Annotated[str | None, Form()] = None,
    pais: Annotated[str | None, Form()] = None,
    nacimiento: Annotated[int | None, Form()] = None,
):
    try:
        datos = AutorCrear(nombre=nombre, pais=pais, nacimiento=nacimiento)  # validar
    except ValidationError as e:
        return await mostrar_autores(request, conn, errores=e.errors(), status=422)

    try:
        await registrar_autor(conn, datos.nombre, datos.pais, datos.nacimiento)  # regla
    except AutorDuplicado:
        return await mostrar_autores(request, conn, errores={"nombre": "Ya existe"}, status=422)

    return await mostrar_autores(request, conn)                      # pintar


async def mostrar_autores(request, conn, errores=None, status=200):
    """Sirve la página completa y también el fragmento de htmx: misma plantilla."""
    autores = await listar_autores(conn)
    return templates.TemplateResponse(
        request=request,
        name="autores.html",
        context={"autores": autores, "errores": errores or {}},
        status_code=status,
    )
```

> Fíjate en lo que **ya no está**: el `SELECT`, la regla del nombre repetido, el armado
> del contexto a mano. La ruta **recibe, delega y elige plantilla**. Si esta función
> tuviera un `SELECT` adentro, la estructura estaría rota.

### 5.5 · `main.py`: el punto de entrada, antes y después

**Antes** — funciona, pero cada import dice «toma esto de la raíz», sin decir de qué
capa viene:

```python
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI

from database import db                    # ← ¿de dónde sale esto? ¿qué responsabilidad tiene?
from ejercicios import router as ejercicios_router
from vistas import router as vistas_router

DATABASE_URL = os.environ["DATABASE_URL"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect(DATABASE_URL)
    yield
    await db.close()

app = FastAPI(lifespan=lifespan)
app.include_router(vistas_router)
app.include_router(ejercicios_router)
```

**Después** — las mismas piezas, pero ahora cada línea **dice en qué capa vive lo que
trae**:

```python
# main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI

from nucleo.configuracion import CONFIGURACION          # capa 1
from nucleo.conexion import conexion                     # capa 1
from presentacion.rutas.autores import router as autores        # capa 3
from presentacion.rutas.ejercicios import router as ejercicios  # capa 3


@asynccontextmanager
async def lifespan(app: FastAPI):
    await conexion.conectar(CONFIGURACION.base_datos)    # main es quien une las piezas
    yield
    await conexion.cerrar()

app = FastAPI(lifespan=lifespan)
app.include_router(autores)
app.include_router(ejercicios)
```

`main.py` no creció: sigue siendo solo la lista de piezas. **Si algún día crece, es que
alguien metió lógica de negocio en el punto de entrada.**

### 5.6 · Arregla los imports (con el buscador, no a ojo)

Abre `Ctrl+Shift+F` en VS Code y busca cada patrón viejo; cada resultado es un import
que hay que cambiar:

| Busca… | …y cámbialo por |
|---|---|
| `from database` | `from nucleo.conexion` |
| `from dependencias` | `from nucleo.conexion` (el alias ahora vive ahí) |
| `from esquemas` | `from dominio.esquemas` |
| `from repositorio` | `from dominio import repositorios` |
| `from vistas` / `from ejercicios` | `from presentacion.rutas...` (solo en `main.py`) |

**Prueba de fuego:** desde la raíz del proyecto, `py -c "import main"` (Windows) o
`python3 -c "import main"` (Mac o Linux). Si no imprime nada y no lanza error, los
imports quedaron bien. Si lanza error, léelo **entero**: la última línea dice *por qué*
y las primeras dicen *en qué archivo*.

---

## 6. Mejorar la lectura del código

Esta es la recompensa de toda la estructura: el código se vuelve **legible**. Antes,
para entender qué pasaba al crear un autor tenías que leer 164 líneas mezcladas. Ahora
el recorrido tiene **seis paradas que se leen en orden**, y cada archivo ya dice en su
nombre de qué se trata.

### El recorrido de un clic («Guardar» en el formulario de autores)

1. **La plantilla** — `presentacion/templates/autores.html`. El formulario declara el
   destino (`hx-post="/autores"`). No sabe que existe una base de datos.
2. **La ruta** — `presentacion/rutas/autores.py`. Recibe, delega, elige plantilla. 16 líneas.
3. **El servicio** — `dominio/servicios.py`. Aquí está la regla: «no se puede registrar
   dos veces el mismo nombre». Se puede probar sin servidor.
4. **La conexión** — `nucleo/conexion.py`. FastAPI ejecutó `get_conexion()`, tomó una
   conexión del pool y la entregó. Nadie en el recorrido la creó ni la cerró.
5. **El repositorio** — `dominio/repositorios.py`. El único lugar con SQL. Recibe la
   conexión y devuelve datos planos, sin decidir nada.
6. **La plantilla de respuesta** — la ruta pide la lista y `templates` la pinta.

**Antes:** una función de 42 líneas con cuatro responsabilidades (validar, consultar,
armar contexto, elegir plantilla).
**Ahora:** una ruta de 16 líneas que se lee en voz alta + una regla que vive en su casa.

### El protocolo de cuatro pasos para leer cualquier proyecto

Cuando te sientes frente a un código que no escribiste tú:

1. **Lee `main.py` de arriba abajo.** Qué módulos existen y cómo se arman: con eso ya
   sabes el tamaño del proyecto.
2. **Busca los imports** (`Ctrl+Shift+F`, patrón `^from | ^import`): verás **la
   dirección de las flechas**. Si aparece `from presentacion` dentro de `dominio/`,
   ya encontraste un problema.
3. **Busca los verbos** (patrón `def | @router`): son las piezas y las puertas de
   entrada. Con la lista ya sabes qué se puede hacer y desde dónde.
4. **Sigue un dato real de principio a fin** (busca `Guardar`, primero en las
   plantillas y luego en los `.py`). Si puedes contarlo desde la base de datos hasta
   el HTML, entiendes el proyecto mejor que quien lo usa a diario.

### Las tres búsquedas que verifican la estructura

En el buscador de VS Code (`Ctrl+Shift+F`), activando el botón `.*` de expresiones
regulares:

```
^from presentacion|^import presentacion      → ① ningún import que suba de capa: CERO resultados

SELECT|INSERT|UPDATE|DELETE                  → ② SQL solo en dominio/repositorios.py

from database|from dependencias|from vistas|from repositorio   → ③ CERO imports viejos
```

Si las tres dan lo esperado, **la estructura es la que dice ser**. Esa verificación
vale más que cualquier diagrama: la hace el propio código, y la puedes repetir cuando
quieras.

---

## 7. 🎯 Actividad: crea la estructura base del sistema

**Esta actividad es el entregable de la guía: no es opcional.** El objetivo no es que
el proyecto quede bonito, sino que cualquier persona del equipo sepa —sin preguntar—
en qué archivo va una cosa nueva y dónde vive la que ya existe. **Y que la aplicación
quede exactamente igual para quien la usa**: si el usuario nota el cambio, la
reorganización se hizo mal.

> **Regla de oro:** cada fase tiene una prueba de fuego. Si la prueba falla, no sigas
> adelante. Revertir es rápido si fallaste a tiempo.

### Fase 1 · Respaldo (5 min)

`git commit`, o copia la carpeta `biblioteca/` y renombra la copia a
`biblioteca-plana`.

**Prueba de fuego:** levanta la app y recorre las pantallas: inicio, autores, libros,
crear, editar, borrar, ejercicios. Anótalas en una lista — con esas mismas pantallas
vas a comparar al final.

### Fase 2 · Dibuja el mapa (10 min, en papel)

Completa esta tabla **a mano** antes de tocar el proyecto. Si la saltas, terminas
moviendo archivos a ciegas.

| Archivo actual | Va a… | Nombre nuevo | Su responsabilidad, en una frase |
|---|---|---|---|
| `main.py` | queda arriba | `main.py` | ______ |
| `database.py` | Capa 1 | `nucleo/conexion.py` | ______ |
| `dependencias.py` | Capa 1 | se une a `nucleo/conexion.py` | ______ |
| `esquemas.py` | Capa 2 | `dominio/esquemas.py` | ______ |
| `repositorio.py` | Capa 2 | `dominio/repositorios.py` | ______ |
| `vistas.py` | Capa 3 | `presentacion/rutas/autores.py` | ______ |
| `ejercicios.py` | Capa 3 | `presentacion/rutas/ejercicios.py` | ______ |
| `templates/` | Capa 3 | `presentacion/templates/` | ______ |
| — todavía no existe — | Capa 2 | `dominio/servicios.py` | ______ |

**Prueba de fuego:** las nueve filas completas, cada una en menos de ocho palabras. Si
alguna frase empieza con «las cosas de…», todavía no está bien pensada.

### Fase 3 · El esqueleto (10 min)

Las tres capas, sus subcarpetas y los cuatro `__init__.py` con su frase — todo en el
*Explorer*, como en la sección 5.1.

**Prueba de fuego:** el *Explorer* muestra el árbol de la sección 4, y solo eso. La
app todavía no arranca: está bien, los archivos viejos siguen en su sitio.

### Fase 4 · Mueve y arregla los imports (20 min)

De abajo hacia arriba — capa 1, luego 2, luego 3 —, como en las secciones 5.2 a 5.6:
arrastra, renombra con `F2`, y cambia los imports viejos con el buscador.

**Prueba de fuego:** `py -c "import main"` desde la raíz no imprime nada.
Además: `uvicorn main:app --reload` arranca sin `ModuleNotFoundError`.

### Fase 5 · Crea `dominio/servicios.py` con UNA regla (10 min)

No muevas todas las reglas: mueve **una**, la que te parezca más clara (la del nombre
repetido es la más fácil), como en la sección 5.3.

**Prueba de fuego:** en la app funcionando, intenta crear dos autores con el mismo
nombre. El segundo debe mostrar el error — eso demuestra que la regla ya no vive en
la ruta.

### Fase 6 · Audita y documenta (15 min)

1. Corre las tres búsquedas de la sección 6 y comprueba los resultados esperados.
2. Recorre las pantallas de la fase 1: responden **igual que antes**.
3. Actualiza el `README.md` con la sección «Estructura del proyecto»: las tres capas,
   qué vive en cada una, y la regla de la flecha.

**Prueba de fuego final:** las tres búsquedas dan lo esperado, las pantallas responden
igual, y el `README` describe la estructura nueva.

### Lista de verificación del entregable

- [ ] Tengo forma de volver atrás (commit o `biblioteca-plana`).
- [ ] El mapa de los nueve archivos está completo, con una frase por responsabilidad.
- [ ] `nucleo/`, `dominio/` y `presentacion/` existen, con sus `__init__.py` y su frase.
- [ ] Los siete `.py` y `templates/` están en su capa, con sus nombres nuevos.
- [ ] `py -c "import main"` no falla.
- [ ] `dominio/servicios.py` existe y tiene una regla del negocio adentro.
- [ ] Ninguna capa importa hacia arriba (búsqueda ① en cero).
- [ ] El SQL vive en un solo archivo (búsqueda ② solo en `repositorios.py`).
- [ ] No quedó ningún import viejo (búsqueda ③ en cero).
- [ ] Las pantallas responden igual que en la fase 1.
- [ ] El `README.md` describe la estructura de tres capas.
- [ ] **Reto:** explica a alguien que no estuvo en la clase qué hay en cada carpeta
      y por qué — si le entiende en dos minutos, la estructura habla sola.

### Errores que van a aparecer

| Lo que ves | Qué significa | Qué hacer |
|---|---|---|
| `KeyError: 'DATABASE_URL'` | la variable de entorno no está puesta en esta terminal | Windows: `$env:DATABASE_URL = "postgresql://…"` · Mac/Linux: `export DATABASE_URL="postgresql://…"`, y vuelve a arrancar |
| `ModuleNotFoundError: No module named 'dominio'` | falta el `__init__.py`, o no estás en la raíz | crea el `__init__.py` y ejecuta desde la carpeta que contiene `main.py` |
| `ModuleNotFoundError: No module named 'database'` | quedó un import viejo | búscalo con `Ctrl+Shift+F` y cámbialo por `from nucleo.conexion` |
| `ImportError: … partially initialized module` | dos archivos se importan mutuamente | la función compartida está en la capa equivocada: muévela |
| `TemplateNotFound: autores.html` | la ruta de plantillas no coincide | `Jinja2Templates(directory="presentacion/templates")`, y ejecuta desde la raíz |
| Las rutas dan 404 | el router no se montó | revisa que `main.py` importe el router desde `presentacion.rutas...` |

---

## 8. Resumen: las cuatro reglas

1. **Una responsabilidad por carpeta, y el nombre la dice.** Si no puedes describir un
   archivo en una frase, tiene varias responsabilidades — y las carpetas se nombran por
   la responsabilidad, nunca por la tecnología.
2. **Las dependencias solo bajan.** `presentacion → dominio → nucleo`, nunca al revés.
   Si una capa necesita mirar hacia arriba, casi siempre la solución es pasárselo por
   parámetro… o mover la función a la capa que le corresponde.
3. **El `__init__.py` es la puerta.** Sin él, la carpeta no es un paquete y Python no
   la importa. Dentro, solo una frase que diga qué vive ahí.
4. **La estructura se mide por el próximo cambio, no por la estética.** Si un cambio te
   obliga a abrir cuatro archivos, la estructura está mal. Si te obliga a abrir uno,
   está bien — sin importar cuántas carpetas tenga el árbol.

> Un proyecto no se mide por lo que funciona, sino por **lo fácil que resulta
> cambiarlo**. Eso es exactamente lo que acabas de construir.