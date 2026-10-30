# Contrato del API (v1)

Fuente de verdad de lo que `services/LocalAPI/` simula y `services/ServerConnection/` consume. Es lo que implementa el backend. Cualquier cambio se hace **aquí primero**.

Todas las operaciones son asíncronas. Los datos viajan como JSON. Los errores tienen siempre la forma `{ codigo, mensaje }` (`services/ApiError.js`).

## Convenciones

- Todos los timestamps son ISO 8601 UTC, asignados por el **servidor**.
- Todo registro modificable lleva `version` (entero, empieza en 1, +1 en cada cambio). Se usa para detectar conflictos.
- `id`, `creadoEn`, `creadoPor` y `modificadoEn` los asigna el servidor; el cliente nunca los envía.
- Los textos se guardan sin espacios sobrantes al inicio ni al final. La clave oficial `matricula` va en mayúsculas.
- Un campo opcional vacío se guarda como `""`.
- La identidad y el rol salen del token en el servidor, nunca del cliente.
- **Un solo plantel por instalación:** el plantel es un registro único del sistema; el personal y los estudiantes le pertenecen sin referirlo. Registrar personal o estudiantes exige que el plantel esté configurado.

## Catálogos

`listarCatalogos()` → `{ [nombre]: Elemento[] }`. Son **datos**, no código: cada elemento trae `id`, `nombre` y los atributos que llevan reglas.

| Catálogo | Atributos | Uso |
|---|---|---|
| `generos` | | Personal y estudiantes. |
| `roles` | `maximo` (int | null), `asignacion` (`registro` \| `entra-id`) | Roles del personal. `maximo`: cuántas personas pueden tenerlo a la vez (`null` = sin límite); hoy Director, 1. `asignacion`: `registro` se asigna en Personal; `entra-id` **no** se asigna a personas registradas: lo trae el token de Microsoft Entra ID al iniciar sesión (hoy Administrador TI, decisión del usuario). |
| `programasEducativos` | | Programa educativo del grupo. |
| `tiempos` | | Duración del programa que cursa el estudiante. |
| `modalidades` | | Modalidad del grupo. |
| `semanasCiclo` | `numero` (1–8) | Semanas de trabajo de cada ciclo, en orden: Semana 1 … Semana 6, Periodo de exámenes (7), Cierre de ciclo (8). |
| `tiposReporte` | | Tipos de reporte disciplinario de la bitácora estudiantil. |
| `materias` | `programaEducativo` (id de `programasEducativos`), `clave` (ej. `P101`), `cuatrimestre` (1–9), `objetivo`, `temas` (`{ titulo, items[] }[]`), `actividadesDocente[]`, `actividadesIndependiente[]`, `evaluacion` (`{ concepto, porcentaje }[]`, porcentaje como texto) | Plan de estudios. El `id` es la clave en minúsculas (`p101`). La semilla es un archivo JSON del API (`planEstudios.json`; Licenciatura en Pedagogía, 52 materias en 9 cuatrimestres). Por ahora se evalúan todas las del programa; a futuro, cada grupo se inscribirá en 3 materias por ciclo y solo esas se mostrarán a sus estudiantes. |

## Modelo

### Plantel (registro único)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | UUID del servidor, asignado al crearlo. |
| `institucion` | string | Nombre de la institución, 1–150 (ej. «Instituto Comercial México»). Aparece en la boleta. |
| `nombre` | string | Nombre del plantel, 1–150. |
| `municipio` | string | 1–100. |
| `telefono` | string | Opcional, 10 dígitos. |
| `domicilio` | string | Opcional, máx. 250. |
| `version`, `creadoEn`, `creadoPor`, `modificadoEn` | | |

Decisión del usuario: el plantel solo lleva esos campos (se quitaron CCT, nivel educativo y turno, y sus catálogos). Al guardarlo se reemplaza con los datos completos; los campos anteriores se descartan.

### Grupo
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | UUID del servidor. |
| `nombre` | string | 1–100, se guarda en **mayúsculas**. **Único** (sin distinguir mayúsculas ni espacios sobrantes). |
| `programaEducativo` | string | `id` de `programasEducativos`. |
| `modalidad` | string | `id` de `modalidades`. |
| `activo` | boolean | Estado del grupo. Por omisión `true`; los grupos anteriores al campo se leen como `true`. Se cambia con `editarGrupo(id, version, { activo })`. |
| `version`, `creadoEn`, `creadoPor`, `modificadoEn` | | |

El grupo **no pertenece a un ciclo escolar** (decisión del usuario): son independientes. La relación vendrá de las materias que cursa cada grupo en cada ciclo (tabla transitiva en la base de datos real). Los estudiantes toman del grupo su programa y su modalidad.

### Personal (administrativo)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | UUID del servidor. |
| `nombre` | string | Nombre(s), 1–100. |
| `primerApellido` | string | Apellido paterno, 1–100. |
| `segundoApellido` | string | Apellido materno. Opcional, máx. 100. |
| `telefono` | string | Opcional, 10 dígitos. |
| `correo` | string | **Obligatorio y solo `@gmail.com`** (decisión del usuario: será la cuenta para iniciar sesión con Google). El usuario (lo que va antes del @) tiene de 6 a 30 caracteres: letras, números y puntos, sin empezar ni terminar en punto ni dos puntos seguidos. Se guarda en minúsculas y completo (`usuario@gmail.com`). Los registros anteriores sin correo de Gmail lo exigen al editarlos. |
| `genero` | string | `id` de `generos`. |
| `activo` | boolean | Estado de la persona. Por omisión `true` al registrarla; los anteriores al campo se leen como `true`. |
| `grupos` | string[] | `id`s de grupos existentes, sin repetidos; opcional. Solo el personal con el rol `docente` tiene grupos: sin ese rol se guarda `[]`. Registros anteriores al campo se leen como `[]`. |
| `roles` | string[] | `id`s de `roles` con `asignacion: 'registro'` (un rol `entra-id` da `VALIDACION`), sin repetidos; **al menos uno**. Un rol con `maximo` no puede tenerlo más personas de las indicadas (`ROL_OCUPADO`). Registros anteriores al campo se leen como `[]` (se exige al guardarlos). |
| `version`, `creadoEn`, `creadoPor`, `modificadoEn` | | |

### Estudiante
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | UUID del servidor. |
| `matricula` | string | **La asigna el servidor** al crear y **nunca cambia** (ni al corregir el nombre). Ver "Matrícula". |
| `nombre`, `primerApellido`, `segundoApellido` | string | Igual que en Personal. |
| `telefono`, `correo` | string | Igual que en Personal. |
| `genero` | string | `id` de `generos`. Registros anteriores al campo se leen como `""` (se exige al guardarlos). |
| `grupo` | string | `id` de un grupo existente. El programa educativo y la modalidad del estudiante son los de su grupo. |
| `tiempo` | string | `id` de `tiempos`. |
| `activo` | boolean | Estado del estudiante. Por omisión `true` al registrarlo; los anteriores al campo se leen como `true`. |
| `version`, `creadoEn`, `creadoPor`, `modificadoEn` | | |

**Normalización de nombres** (personal y estudiantes): el servidor normaliza `nombre`, `primerApellido` y `segundoApellido`: espacios simples, todo en minúscula y mayúscula inicial en cada palabra (también después de un guion), p. ej. `maría  JOSÉ` → `María José`.

**Matrícula:** dos primeras letras del apellido paterno + primera del apellido materno + primera del primer nombre + 6 dígitos aleatorios (ej. Ana López Ruiz → `LORA482913`). Sin acentos; la Ñ se escribe `X`; sin apellido materno se usa `X` (como en la CURP); un apellido paterno de una letra se completa con `X`. Es **única**: si los dígitos coinciden con una existente, el servidor genera otros.

### Ciclo escolar
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | `AAAA-N` (ej. `2026-1`): año y número del ciclo. Es la nomenclatura oficial y es **único**. |
| `anio` | int | Año del ciclo. |
| `numero` | int | 1 … 6. |
| `duracionMeses` | int | 2. |
| `fechaInicio` | string \| null | `AAAA-MM-DD`. Primer día de la Semana 1. `null` mientras el ciclo no se configura. Debe caer en `diaInicioSemana`. |
| `diaInicioSemana` | int \| null | 0 = domingo … 6 = sábado. Día en que empieza cada semana del ciclo. |
| `vacaciones` | `{ inicio, semanas }[]` | Periodos vacacionales de **semanas completas**: `inicio` (`AAAA-MM-DD`) debe ser el inicio de una semana del ciclo y `semanas` es un entero ≥ 1. **Recorren** las semanas de trabajo. |
| `asuetos` | string[] | Días de asueto (`AAAA-MM-DD`), dentro del ciclo, sin repetidos. **No recorren** las semanas. |
| `cerrado` | boolean | `true` cuando se **concluyó voluntariamente** con `concluirCiclo` (segundo paso obligatorio, aunque por fecha ya esté concluido). Libera la configuración del ciclo siguiente y deja el ciclo **inmutable**. Por omisión `false`. |
| `cerradoEn`, `cerradoPor` | string | Timestamp y usuario del cierre (servidor). |
| `version` | int | Empieza en 1; los ciclos anteriores al campo se leen con 1. |
| `creadoEn`, `creadoPor`, `modificadoEn` | | |

**Derivados al leer** (con el reloj del servidor; nunca se guardan):
| Campo | Notas |
|---|---|
| `semanas` | `{ numero, nombre, inicio, fin }[]`: las 8 semanas del catálogo `semanasCiclo`. La 1 empieza en `fechaInicio`; cada una dura 7 días y las vacaciones se saltan. `[]` sin configurar. |
| `periodosVacacionales` | `{ inicio, fin, semanas }[]` con su fecha de fin. |
| `fechaFin` | Último día de la semana 8 (Cierre de ciclo), o `null`. |
| `estado` | `sin-configurar`, `proximo` (hoy antes de `fechaInicio`), `en-curso` o `concluido` (hoy después de `fechaFin`). |
| `semanaActual` | Mientras está en curso: `{ numero, nombre }` de la semana de hoy, o `{ numero: null, nombre: 'Vacaciones' }`. Si no, `null`. |
| `asuetoHoy` | `true` si hoy es día de asueto. |

**Calendarización anual:** cada año tiene 3 cuatrimestres divididos en 2 módulos de 2 meses: **6 ciclos** (`2026-1` … `2026-6`). La regla (6 ciclos, 2 meses) es del servidor. Los ciclos se crean sin configurar; cada uno se configura (fecha de inicio, día de inicio de semana, vacaciones y asuetos) conforme va a comenzar (decisión del usuario, reemplazó a «ciclos sin fechas»). Dos ciclos configurados no pueden encimarse. **Cierre (decisión del usuario):** el `estado` por fecha es automático, pero para configurar un ciclo **todos los ciclos configurados anteriores deben estar `cerrado`**; cerrar es una acción voluntaria (`concluirCiclo`). A futuro: el cierre solo se ofrecerá en la semana 8 y solo el Administrador TI (Entra ID) podrá reabrir un ciclo.

### Evaluación
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | `<cicloId>:<estudianteId>`: hay **una evaluación por estudiante y ciclo**. |
| `estudianteId` | string | Estudiante existente. |
| `cicloId` | string | Ciclo existente. |
| `calificaciones` | `{ materia, calificacion }[]` | `materia`: `id` de `materias` **del programa del grupo del estudiante**, sin repetidos, en el orden del catálogo. `calificacion`: entero 5–10. **Al menos una.** |
| `observaciones` | string | Opcional, máx. 1000. |
| `promedio` | number | **Derivado al leer** (suma ÷ número de materias, sin redondear); nunca se guarda. |
| `version`, `creadoEn`, `creadoPor`, `modificadoEn` | | |

La boleta de calificaciones se arma en el cliente con estos datos (el tratamiento «Alumna»/«Alumno» sale del `genero` del estudiante; sin género, «Alumno(a)»; lista **todas** las materias del programa del grupo y las no capturadas salen como **NP**, que no cuenta en el promedio; el 5 se imprime en rojo) (`utils/boleta.js`); si llega a ser un documento que se guarde o envíe, la armará el servidor.

### Reporte disciplinario (bitácora estudiantil)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | UUID del servidor. |
| `estudianteId` | string | Estudiante existente. |
| `fecha` | string | `AAAA-MM-DD`. Obligatoria; no puede ser posterior a hoy (reloj del servidor). |
| `tipo` | string | `id` de `tiposReporte`. |
| `descripcion` | string | Obligatoria, máx. 2000. |
| `acciones` | string | Acciones tomadas. Opcional, máx. 1000. |
| `cicloId` | string \| null | Lo asigna el servidor: el ciclo configurado cuyas fechas contienen `fecha` (o `null`). |
| `creadoEn`, `creadoPor` | | Del servidor. |

Decisión del usuario: los reportes **no se editan ni se eliminan**; solo se agregan (si hubo un error, se levanta otro aclarándolo). A futuro, el Administrador TI podría anular.

## Operaciones

| Operación | Devuelve | Notas |
|---|---|---|
| `listarCatalogos()` | `{ [nombre]: Elemento[] }` | |
| `obtenerPlantel()` | `Plantel \| null` | `null` mientras no se haya configurado. |
| `guardarPlantel(version, datos)` | `Plantel` | Si no existe lo crea (`version` = `null`); si existe lo reemplaza con los `datos` completos y exige su `version` (`CONFLICTO`). |
| `listarGrupos()` | `Grupo[]` | Ordenados por nombre. |
| `crearGrupo(datos)` | `Grupo` | `PLANTEL_NO_CONFIGURADO` si aún no hay plantel. |
| `editarGrupo(id, version, cambios)` | `Grupo` | |
| `eliminarGrupo(id)` | `{ id }` | `EN_USO` si tiene estudiantes o personal asignado. |
| `listarPersonal()` | `Personal[]` | Ordenados por apellidos y nombre. |
| `crearPersonal(datos)` | `Personal` | `PLANTEL_NO_CONFIGURADO` si aún no hay plantel. |
| `editarPersonal(id, version, cambios)` | `Personal` | Solo los campos enviados. Valida `roles` igual que al crear (sin contarse a sí misma). |
| `eliminarPersonal(id)` | `{ id }` | |
| `listarEstudiantes()` | `Estudiante[]` | Ordenados por apellidos y nombre. |
| `crearEstudiante(datos)` | `Estudiante` | Asigna `matricula`. `PLANTEL_NO_CONFIGURADO` si aún no hay plantel. |
| `editarEstudiante(id, version, cambios)` | `Estudiante` | `matricula` no se puede enviar (`VALIDACION`). |
| `eliminarEstudiante(id)` | `{ id }` | `CON_EVALUACIONES` si tiene evaluaciones registradas. |
| `listarCiclos()` | `Ciclo[]` | Ordenados por año y número, con sus derivados. |
| `crearCiclosAnuales(anio)` | `Ciclo[]` | Crea los 6 ciclos de `anio` (entero, 2000–2100; si no, `VALIDACION`). Idempotente: solo crea los que falten. Devuelve **todos** los ciclos. |
| `configurarCiclo(id, version, datos)` | `Ciclo` | `datos`: `{ fechaInicio, diaInicioSemana, vacaciones, asuetos }` completos. Valida fechas, que `fechaInicio` caiga en `diaInicioSemana`, que cada vacación empiece al inicio de una semana del ciclo, que los asuetos estén dentro del ciclo y que no se encime con otro ciclo (`VALIDACION`). Exige `version` (`CONFLICTO`). Un ciclo `cerrado` no se puede configurar, y no se puede configurar uno nuevo mientras haya un ciclo configurado anterior sin cerrar (`VALIDACION`). |
| `concluirCiclo(id, version)` | `Ciclo` | Marca `cerrado`. Exige que el ciclo esté configurado y no cerrado (`VALIDACION`) y su `version` (`CONFLICTO`). |
| `listarReportes()` | `Reporte[]` | Del más reciente al más antiguo (`fecha`, luego `creadoEn`). |
| `crearReporte(datos)` | `Reporte` | `datos`: `{ estudianteId, fecha, tipo, descripcion, acciones }`. `NO_ENCONTRADO` si el estudiante no existe; `VALIDACION` si está inactivo. |
| `listarEvaluaciones()` | `Evaluacion[]` | Con `promedio`. |
| `guardarEvaluacion(estudianteId, cicloId, version, datos)` | `Evaluacion` | `datos`: `{ calificaciones, observaciones }`. Si no existe la crea (`version` = `null`); si existe la reemplaza y exige su `version` (`CONFLICTO`). `NO_ENCONTRADO` si el estudiante o el ciclo no existen. |

Al editar se valida el registro completo resultante.

## Errores

| Código | Cuándo |
|---|---|
| `VALIDACION` | Campo faltante, con formato inválido, con un `id` que no existe en su catálogo o un nombre de grupo repetido. |
| `NO_ENCONTRADO` | El registro no existe. |
| `CONFLICTO` | `version` distinta de la actual: alguien más lo cambió. El cliente recarga. |
| `PLANTEL_NO_CONFIGURADO` | Se intenta dar de alta personal o estudiantes sin plantel configurado. |
| `ROL_OCUPADO` | Se asigna un rol que ya alcanzó su `maximo` en otras personas. El mensaje dice quién lo tiene. |
| `EN_USO` | Se intenta eliminar un grupo con estudiantes o personal asignado. |
| `CON_EVALUACIONES` | Se intenta eliminar un estudiante que tiene evaluaciones. |
| `NO_AUTORIZADO` | El rol no permite escribir. |
| `NO_DISPONIBLE` | El almacenamiento no está disponible (en `LocalAPI`: otra pestaña con una versión anterior). |
| `NO_IMPLEMENTADO` | `ServerConnection` mientras no haya backend. |

## Pendiente (próximas versiones del contrato)

- **Exportar / importar JSON:** historias académicas, reportes y respaldos de registros. Los documentos oficiales los arma el servidor; el cliente solo los descarga o envía.
- **Datos de captura frecuente** (asistencias, tareas asignadas): pasan por el API como todo lo demás, con escritura **offline primero** (cola en `SesionIndexedDB` y estado `local` del `IndicadorSync` hasta sincronizar). Decisión del usuario (opción A).
