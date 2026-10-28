# Contrato del API (v1)

Fuente de verdad de lo que `services/LocalAPI/` simula y `services/ServerConnection/` consume. Es lo que implementa el backend. Cualquier cambio se hace **aquí primero**.

Todas las operaciones son asíncronas. Los datos viajan como JSON. Los errores tienen siempre la forma `{ codigo, mensaje }` (`services/ApiError.js`).

## Convenciones

- Todos los timestamps son ISO 8601 UTC, asignados por el **servidor**.
- Todo registro modificable lleva `version` (entero, empieza en 1, +1 en cada cambio). Se usa para detectar conflictos.
- `id`, `creadoEn`, `creadoPor` y `modificadoEn` los asigna el servidor; el cliente nunca los envía.
- Los textos se guardan sin espacios sobrantes al inicio ni al final. Las claves oficiales (`cct`, `matricula`) van en mayúsculas.
- Un campo opcional vacío se guarda como `""`.
- La identidad y el rol salen del token en el servidor, nunca del cliente.
- **Un solo plantel por instalación:** el plantel es un registro único del sistema; el personal y los estudiantes le pertenecen sin referirlo. Registrar personal o estudiantes exige que el plantel esté configurado.

## Catálogos

`listarCatalogos()` → `{ [nombre]: Elemento[] }`. Son **datos**, no código: cada elemento trae `id`, `nombre` y los atributos que llevan reglas.

| Catálogo | Atributos | Uso |
|---|---|---|
| `nivelesEducativos` | | Nivel del plantel. |
| `turnos` | | Turno del plantel. |
| `generos` | | Personal. |
| `roles` | `maximo` (int | null) | Roles del personal. `maximo`: cuántas personas pueden tenerlo a la vez (`null` = sin límite). Hoy: Administrador TI y Director, 1. |
| `programasEducativos` | | Programa educativo del estudiante. |
| `tiempos` | | Duración del programa que cursa el estudiante. |
| `modalidades` | | Modalidad del estudiante. |

## Modelo

### Plantel (registro único)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | UUID del servidor, asignado al crearlo. |
| `cct` | string | Clave de Centro de Trabajo. Formato `^\d{2}[A-Z]{3}\d{4}[A-Z]$` (ej. `09DPR1234X`). |
| `nombre` | string | 1–150. |
| `nivel` | string | `id` de `nivelesEducativos`. |
| `turno` | string | `id` de `turnos`. |
| `municipio` | string | 1–100. |
| `domicilio` | string | Opcional, máx. 250. |
| `telefono` | string | Opcional, 10 dígitos. |
| `version`, `creadoEn`, `creadoPor`, `modificadoEn` | | |

### Personal (administrativo)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | UUID del servidor. |
| `nombre` | string | Nombre(s), 1–100. |
| `primerApellido` | string | Apellido paterno, 1–100. |
| `segundoApellido` | string | Apellido materno. Opcional, máx. 100. |
| `telefono` | string | Opcional, 10 dígitos. |
| `correo` | string | Opcional, correo válido, máx. 150. |
| `genero` | string | `id` de `generos`. |
| `roles` | string[] | `id`s de `roles`, sin repetidos; **al menos uno**. Un rol con `maximo` no puede tenerlo más personas de las indicadas (`ROL_OCUPADO`). Registros anteriores al campo se leen como `[]` (se exige al guardarlos). |
| `version`, `creadoEn`, `creadoPor`, `modificadoEn` | | |

### Estudiante
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | UUID del servidor. |
| `matricula` | string | **La asigna el servidor** al crear y **nunca cambia** (ni al corregir el nombre). Ver "Matrícula". |
| `nombre`, `primerApellido`, `segundoApellido` | string | Igual que en Personal. |
| `telefono`, `correo` | string | Igual que en Personal. |
| `programaEducativo` | string | `id` de `programasEducativos`. |
| `tiempo` | string | `id` de `tiempos`. |
| `modalidad` | string | `id` de `modalidades`. |
| `version`, `creadoEn`, `creadoPor`, `modificadoEn` | | |

**Normalización de nombres** (personal y estudiantes): el servidor normaliza `nombre`, `primerApellido` y `segundoApellido`: espacios simples, todo en minúscula y mayúscula inicial en cada palabra (también después de un guion), p. ej. `maría  JOSÉ` → `María José`.

**Matrícula:** dos primeras letras del apellido paterno + primera del apellido materno + primera del primer nombre + 6 dígitos aleatorios (ej. Ana López Ruiz → `LORA482913`). Sin acentos; la Ñ se escribe `X`; sin apellido materno se usa `X` (como en la CURP); un apellido paterno de una letra se completa con `X`. Es **única**: si los dígitos coinciden con una existente, el servidor genera otros.

### Ciclo escolar
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | `AAAA-N` (ej. `2026-1`): año y número del ciclo. Es la nomenclatura oficial y es **único**. |
| `anio` | int | Año del ciclo. |
| `numero` | int | 1 … 6. |
| `duracionMeses` | int | 2. Los ciclos **no tienen fechas** (el calendario cambia con frecuencia, decisión del usuario): solo se sabe que cada uno dura dos meses. |
| `creadoEn`, `creadoPor` | | |

**Calendarización anual:** cada año tiene 3 cuatrimestres divididos en 2 módulos de 2 meses: **6 ciclos** (`2026-1` … `2026-6`). La regla (6 ciclos, 2 meses) es del servidor.

## Operaciones

| Operación | Devuelve | Notas |
|---|---|---|
| `listarCatalogos()` | `{ [nombre]: Elemento[] }` | |
| `obtenerPlantel()` | `Plantel \| null` | `null` mientras no se haya configurado. |
| `guardarPlantel(version, datos)` | `Plantel` | Si no existe lo crea (`version` = `null`); si existe lo reemplaza con los `datos` completos y exige su `version` (`CONFLICTO`). |
| `listarPersonal()` | `Personal[]` | Ordenados por apellidos y nombre. |
| `crearPersonal(datos)` | `Personal` | `PLANTEL_NO_CONFIGURADO` si aún no hay plantel. |
| `editarPersonal(id, version, cambios)` | `Personal` | Solo los campos enviados. Valida `roles` igual que al crear (sin contarse a sí misma). |
| `eliminarPersonal(id)` | `{ id }` | |
| `listarEstudiantes()` | `Estudiante[]` | Ordenados por apellidos y nombre. |
| `crearEstudiante(datos)` | `Estudiante` | Asigna `matricula`. `PLANTEL_NO_CONFIGURADO` si aún no hay plantel. |
| `editarEstudiante(id, version, cambios)` | `Estudiante` | `matricula` no se puede enviar (`VALIDACION`). |
| `eliminarEstudiante(id)` | `{ id }` | |
| `listarCiclos()` | `Ciclo[]` | Ordenados por año y número. |
| `crearCiclosAnuales(anio)` | `Ciclo[]` | Crea los 6 ciclos de `anio` (entero, 2000–2100; si no, `VALIDACION`). Idempotente: solo crea los que falten. Devuelve **todos** los ciclos. |

Al editar se valida el registro completo resultante.

## Errores

| Código | Cuándo |
|---|---|
| `VALIDACION` | Campo faltante, con formato inválido o con un `id` que no existe en su catálogo. |
| `NO_ENCONTRADO` | El registro no existe. |
| `CONFLICTO` | `version` distinta de la actual: alguien más lo cambió. El cliente recarga. |
| `PLANTEL_NO_CONFIGURADO` | Se intenta dar de alta personal o estudiantes sin plantel configurado. |
| `ROL_OCUPADO` | Se asigna un rol que ya alcanzó su `maximo` en otras personas. El mensaje dice quién lo tiene. |
| `NO_AUTORIZADO` | El rol no permite escribir. |
| `NO_DISPONIBLE` | El almacenamiento no está disponible (en `LocalAPI`: otra pestaña con una versión anterior). |
| `NO_IMPLEMENTADO` | `ServerConnection` mientras no haya backend. |

## Pendiente (próximas versiones del contrato)

- **Exportar / importar JSON:** historias académicas, reportes y respaldos de registros. Los documentos oficiales los arma el servidor; el cliente solo los descarga o envía.
- **Datos de captura frecuente** (asistencias, tareas asignadas): pasan por el API como todo lo demás, con escritura **offline primero** (cola en `SesionIndexedDB` y estado `local` del `IndicadorSync` hasta sincronizar). Decisión del usuario (opción A).
