# 🗄️ Guía: Modelo de Usuarios con Roles y Subtipos (colegio)

> Modelo relacional para una app escolar en **PostgreSQL**: identidad común en `usuarios`,
> tipos declarados en `roles`, y extensiones por subtipo (`profesores`, `alumnos`, `directivas`).
> Incluye DDL completo, registro en transacción y login autenticado por rol.

---

## 1. La decisión de diseño

**El patrón (híbrido):** `usuarios` guarda lo común a todos (nombre, email, password),
`roles` declara el tipo de usuario, y los datos exclusivos de cada tipo viven en tablas de
extensión que apuntan a `usuarios`.

Regla de decisión:

- Si el 80%+ de las columnas son iguales → una tabla con roles.
- Si cada tipo tiene datos muy distintos → tablas separadas.
- Si ambas cosas → **supertipo + subtipos (este modelo)**. Para un colegio es el más defendible.

**La FK va del subtipo hacia el supertipo, nunca al revés.** `usuarios` no apunta a
`profesores` ni a `alumnos`; son los subtipos los que apuntan a `usuarios`. Una columna no
puede ser FK a dos tablas a la vez, y en `usuarios` ese campo tendría que ser `NULL` para
casi todos (un alumno no es profesor) — justo las anomalías que la normalización evita.

---

## 2. Script DDL completo (en orden de dependencias)

```sql
-- 1. SUPERTIPO: identidad + credenciales (lo común a todos)
CREATE TABLE usuarios (
  id            SERIAL PRIMARY KEY,
  nombre        TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password      TEXT NOT NULL          -- sin hash solo mientras aprenden; en producción: password_hash
);

-- 2. ROLES: catálogo de tipos
CREATE TABLE roles (
  id     SERIAL PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL          -- 'profesor', 'alumno', 'directiva'
);

-- 3. N:M: un usuario puede tener uno o varios roles
CREATE TABLE usuario_roles (
  usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  rol_id     INT NOT NULL REFERENCES roles(id)     ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, rol_id)     -- misma pareja no se repite
);

-- 4. SUBTIPOS: extensión de usuarios (PK = FK, garantiza 1:1)
CREATE TABLE profesores (
  usuario_id INT PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  area       TEXT,
  titulo     TEXT
);

CREATE TABLE alumnos (
  usuario_id   INT PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  grado        TEXT,
  acudiente_id INT REFERENCES usuarios(id)   -- el acudiente también es usuario
);

CREATE TABLE directivas (
  usuario_id INT PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  cargo      TEXT NOT NULL               -- 'rector', 'coordinador', 'secretaria'
);

-- 5. CURSOS: la FK apunta al SUBTIPO, no a usuarios
CREATE TABLE cursos (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  profesor_id INT NOT NULL REFERENCES profesores(usuario_id)
);

-- 6. SEMILLA de roles (la ejecutas una vez)
INSERT INTO roles (nombre) VALUES ('profesor'), ('alumno'), ('directiva');
```

**Orden de creación:** `usuarios` → `roles`/`usuario_roles` → `profesores`/`alumnos`/`directivas`
→ `cursos` (que apunta a `profesores`).

---

## 3. El "ajá": PK = FK en los subtipos

```sql
usuario_id INT PRIMARY KEY REFERENCES usuarios(id)
```

`usuario_id` en el subtipo es **PK y FK simultáneamente**:

- La **PK** garantiza **1:1**: un usuario tiene máximo una fila de profesor.
- La **FK** garantiza que exista en `usuarios`.

La cadena de dependencia queda: `usuarios ← profesores`, `usuarios ← alumnos`,
`cursos.profesor_id → profesores.usuario_id`.

**Para saber si un usuario es profesor** no miras una columna de `usuarios`, haces JOIN:

```sql
SELECT u.* FROM usuarios u
JOIN profesores p ON p.usuario_id = u.id;   -- los profesores
```

---

## 4. Registrar un usuario (transacción en 3 pasos)

La app inserta en una sola transacción (todo o nada):

```sql
BEGIN;
INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id;
INSERT INTO usuario_roles (usuario_id, rol_id)
  VALUES ($nuevo_id, (SELECT id FROM roles WHERE nombre = $4));
INSERT INTO profesores (usuario_id, area, titulo) VALUES ($nuevo_id, $5, $6);  -- solo si es profe
COMMIT;
```

Si el usuario es alumno o directiva, el tercer insert cambia de tabla de subtipo.

---

## 5. Login autenticado por rol (opción 3)

El login por email/password retorna el usuario **y su rol** en una sola consulta — el rol
declarado define el tipo, y si mañana agregas "directiva" no tocas el query de login:

```sql
SELECT u.id, u.nombre, r.nombre AS rol
FROM usuarios u
JOIN usuario_roles ur ON ur.usuario_id = u.id
JOIN roles r          ON r.id = ur.rol_id
WHERE u.email = $1 AND u.password = $2;
```

- Si `rol = 'profesor'` → panel de profesores; `'alumno'` → panel del alumno.
- El rol se guarda en la sesión/JWT (`rol: "profesor"`) y las rutas protegidas dependen de
  eso: un `Depends` de FastAPI que valide el rol (inyección + reutilización).
- **Usuario con varios roles** (profe y acudiente): la consulta devuelve varias filas —
  filtras con `WHERE r.nombre = $2` o traes todas.

Alternativas equivalentes (por si se necesita solo un tipo):

```sql
-- JOIN con los subtipos y COALESCE (una consulta, responde todo):
SELECT u.id, u.nombre,
       (p.usuario_id IS NOT NULL) AS es_profesor,
       (a.usuario_id IS NOT NULL) AS es_alumno
FROM usuarios u
LEFT JOIN profesores p ON p.usuario_id = u.id
LEFT JOIN alumnos     a ON a.usuario_id = u.id
WHERE u.email = $1 AND u.password = $2;

-- EXISTS puntual:
SELECT EXISTS(SELECT 1 FROM profesores WHERE usuario_id = $1);
```

---

## 6. Por qué `cursos` apunta al subtipo y no a `usuarios`

```sql
profesor_id INT NOT NULL REFERENCES profesores(usuario_id)
```

- `profesores.usuario_id` es PK de esa tabla → la FK **garantiza en la BD** que quien
  imparte el curso es realmente un profesor. Si apuntara a `usuarios.id`, cualquier alumno
  podría ser asignado como docente y la BD no podría impedirlo.
- La cadena queda: `usuarios ─1:1─ profesores ─1:N─ cursos`.

Si un curso puede tener **varios profesores** (co-docencia), tabla intermedia:

```sql
CREATE TABLE curso_profesores (
  curso_id    INT REFERENCES cursos(id),
  profesor_id INT REFERENCES profesores(usuario_id),
  PRIMARY KEY (curso_id, profesor_id)
);
```

En el diagrama Mermaid: `USUARIOS ||--|| PROFESORES` y `PROFESORES ||--o{ CURSOS` —
mismo esquema conceptual: la identidad del profesor vive en `usuarios`, y la relación de
cursos se ancla al subtipo.

---

## 7. Notas prácticas

- **`ON DELETE CASCADE`** en subtipos y `usuario_roles`: borrar un usuario limpia todo su
  rastro sin huérfanos.
- La PK compuesta `(usuario_id, rol_id)` ya evita duplicados; si quieres exigir "exactamente
  un rol principal", eso se valida en la app, no en el esquema.
- **Nunca hashear**: en producción la columna se llama `password_hash` y guarda el hash
  (bcrypt/argon2), jamás el texto plano.
- En producción el login debería validar el hash (p. ej. `passlib`) en Python, no comparar
  la contraseña en el WHERE del SQL.