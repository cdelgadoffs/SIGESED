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
| `roles` | `maximo` (int | null), `asignacion` (`registro` \| `entra-id`) | Roles del personal. `maximo`: cuántas personas pueden tenerlo a la vez (`null` = sin límite); hoy Director, 1. `asignacion`: `registro` se asigna en Personal; `entra-id` **no** se asigna a personas registradas: lo trae el token de Microsoft Entra ID al iniciar sesión (hoy Administrador TI, decisión del usuario). `permisos` (`{ [módulo \| '*']: 'ninguno' \| 'ver' \| 'propio' \| 'editar' }`, decisión del usuario; el módulo explícito gana a `'*'` dentro del mismo rol y entre roles gana el nivel más alto): Administrador TI y Coordinador educativo `{ '*': 'editar' }`; Director, Administrador escolar y Secretario `{ '*': 'ver', inicio: 'ninguno', planEstudios: 'ninguno' }` (Inicio y Plan de estudios solo para el coordinador y TI, por ahora); Docente `{ horarios: 'ver', evaluaciones: 'propio', bitacora: 'editar' }`. Bitácora (decisión del usuario): la editan Coordinador, Administrador escolar (`bitacora: 'editar'`) y Docente; Director y Secretario `bitacora: 'ninguno'`. `propio`: edita solo lo suyo; hoy en `guardarEvaluacion`, el servidor conserva las calificaciones de las materias que no imparte (las del docente de la inscripción) y rechaza con `PERMISO_DENEGADO` si no toca ninguna suya. Módulos: `inicio`, `matricula`, `horarios`, `evaluaciones`, `kardex`, `bitacora`, `cursos`, `planEstudios`, `asistencia`, `planTrabajo`, `panelControl`. |
| `programasEducativos` | | Programa educativo del grupo. |
| `tiempos` | | Duración del programa que cursa el estudiante. |
| `modalidades` | `horario` (`entre-semana` \| `sabado` \| `null`) | Modalidad del grupo. `horario` dice cómo se arma el horario de sus materias en la inscripción del ciclo: `entre-semana` (Semanal: día de lunes a viernes y horas), `sabado` (Sabatino: solo horas; el día es sábado) y `null` (Online: sin horario, solo materias y docentes). |
| `horasClase` | `modalidad` (id de `modalidades`), `numero` (1… o `null` en el receso), `inicio`, `fin` (`HH:MM`), `descanso` (boolean) | Horas de clase de cada modalidad, en orden (decisión del usuario). Semanal: 1ª 8:00–9:00, 2ª 9:00–9:50, Receso 9:50–10:10, 3ª 10:10–11:00, 4ª 11:00–12:00, 5ª 12:00–13:00. Sabatino: las mismas y 6ª 13:00–14:00. Online no tiene. El receso no se asigna a materias. |
| `semanasCiclo` | `numero` (1–8) | Semanas de trabajo de cada ciclo, en orden: Semana 1 … Semana 6, Periodo de exámenes (7), Cierre de ciclo (8). |
| `tiposReporte` | | Tipos de reporte disciplinario de la bitácora estudiantil. |
| `materias` | `programaEducativo` (id de `programasEducativos`), `clave` (ej. `P101`), `cuatrimestre` (1–9), `objetivo`, `temas` (`{ titulo, items[] }[]`), `actividadesDocente[]`, `actividadesIndependiente[]`, `evaluacion` (`{ concepto, porcentaje }[]`, porcentaje como texto) | Plan de estudios. El `id` es la clave en minúsculas (`p101`). La semilla es un archivo JSON del API (`planEstudios.json`; Licenciatura en Pedagogía, 52 materias en 9 cuatrimestres). Cada grupo se inscribe en 3 materias por ciclo (ver «Inscripción») y solo esas se evalúan y salen en la boleta de sus estudiantes. |

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

| `iniciado` | boolean | `true` cuando se **inició voluntariamente** con `iniciarCiclo`. Desde entonces el calendario y las inscripciones del ciclo quedan **fijos** (a futuro solo el Administrador TI podrá corregir). Por omisión `false`. |
| `iniciadoEn`, `iniciadoPor` | string | Timestamp y usuario del inicio (servidor). |

**Derivados al leer** (con el reloj del servidor; nunca se guardan):
| Campo | Notas |
|---|---|
| `semanas` | `{ numero, nombre, inicio, fin }[]`: las 8 semanas del catálogo `semanasCiclo`. La 1 empieza en `fechaInicio`; cada una dura 7 días y las vacaciones se saltan. `[]` sin configurar. |
| `periodosVacacionales` | `{ inicio, fin, semanas }[]` con su fecha de fin. |
| `fechaFin` | Último día de la semana 8 (Cierre de ciclo), o `null`. |
| `estado` | `sin-configurar`, `proximo` (hoy antes de `fechaInicio`), `en-curso` o `concluido` (hoy después de `fechaFin`). |
| `semanaActual` | Mientras está en curso: `{ numero, nombre }` de la semana de hoy, o `{ numero: null, nombre: 'Vacaciones' }`. Si no, `null`. |
| `asuetoHoy` | `true` si hoy es día de asueto. |
| `pendientesInicio` | `{ paso, grupoId, mensaje }[]`: lo que falta para poder iniciar el ciclo. `paso`: `calendario`, `grupos` (no hay grupos activos) o `grupo` (con su `grupoId`; en los otros, `null`). Vacío si el ciclo está completo, iniciado o cerrado. Pendientes: calendario sin configurar o con la fecha de inicio ya alcanzada, ningún grupo activo, y por cada **grupo activo**: menos de 3 materias inscritas, materia sin docente o con un docente inactivo o sin el rol `docente`, y (si su modalidad lleva horario) materia sin horas de clase (lleva 1 o 2; decisión del usuario). |

**Calendarización anual:** cada año tiene 3 cuatrimestres divididos en 2 módulos de 2 meses: **6 ciclos** (`2026-1` … `2026-6`). La regla (6 ciclos, 2 meses) es del servidor. Los ciclos se crean sin configurar; cada uno se configura (fecha de inicio, día de inicio de semana, vacaciones y asuetos) conforme va a comenzar (decisión del usuario, reemplazó a «ciclos sin fechas»). Dos ciclos configurados no pueden encimarse. **Cierre (decisión del usuario):** el `estado` por fecha es automático, pero para configurar un ciclo **todos los ciclos configurados anteriores deben estar `cerrado`**; cerrar es una acción voluntaria (`concluirCiclo`). A futuro: el cierre solo se ofrecerá en la semana 8 y solo el Administrador TI (Entra ID) podrá reabrir un ciclo.

### Inscripción (grupo en un ciclo)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | `<cicloId>:<grupoId>`: hay **una inscripción por grupo y ciclo**. |
| `cicloId` | string | Ciclo existente, ni iniciado ni cerrado. |
| `grupoId` | string | Grupo existente y **activo**. |
| `materias` | `{ materia, docenteId, horario }[]` | Máximo **3**, sin repetir materia. `materia`: `id` de `materias` del programa del grupo (cualquiera; puede repetir una que sus estudiantes ya cursaron). `docenteId`: persona activa con el rol `docente`, o `null` mientras no se asigna. `horario`: `{ dia, hora }[]` (`dia` 0 domingo … 6 sábado; `hora`: `id` de `horasClase` de la modalidad del grupo, sin receso), sin repetir día y hora. Una materia ocupa **máximo 2 horas** (seguidas o en distintos días; decisión del usuario). Según `modalidades.horario`: `entre-semana`, `dia` de 1 a 5; `sabado`, el servidor fija `dia` = 6; `null`, se guarda `[]`. |
| `version`, `creadoEn`, `creadoPor`, `modificadoEn` | | |

Se puede guardar incompleta (menos de 3 materias, sin docente o sin horario): lo que falta aparece en `pendientesInicio` del ciclo. Reglas del servidor: un grupo no puede tener dos materias a la misma hora y un docente no puede estar en dos grupos a la misma hora en el mismo ciclo, comparando las horas reales de `horasClase` (`VALIDACION`). El docente queda ligado al grupo por la inscripción (ya no por el registro de personal).

### Evaluación
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | `<cicloId>:<estudianteId>`: hay **una evaluación por estudiante y ciclo**. |
| `estudianteId` | string | Estudiante existente. |
| `cicloId` | string | Ciclo existente. |
| `calificaciones` | `{ materia, calificacion }[]` | `materia`: `id` de una materia **inscrita por el grupo del estudiante en ese ciclo**, sin repetidos, en el orden del catálogo. `calificacion`: entero 5–10. **Al menos una.** |
| `observaciones` | string | Opcional, máx. 1000. |
| `promedio` | number | **Derivado al leer**, sin redondear; nunca se guarda. Se divide entre **todas las materias inscritas** por el grupo del estudiante en el ciclo, menos las que el estudiante **ya tenía acreditadas** fuera de este ciclo (no se califican aquí; la boleta las muestra como «Registrada en kárdex»), y cada materia inscrita sin calificación (NP) **cuenta como 0** (decisión del usuario). |
| `version`, `creadoEn`, `creadoPor`, `modificadoEn` | | |

La boleta de calificaciones se arma en el cliente con estos datos (el tratamiento «Alumna»/«Alumno» sale del `genero` del estudiante; sin género, «Alumno(a)»; lista las materias **inscritas** por el grupo del estudiante en el ciclo las ya acreditadas fuera del ciclo salen como «Registrada en kárdex» sin contar en el promedio y las no capturadas salen como **NP**, que cuenta como 0 en el promedio; el 5 se imprime en rojo) (`utils/boleta.js`); si llega a ser un documento que se guarde o envíe, la armará el servidor.

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

### Calificación de kárdex (captura manual)
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | UUID del servidor. |
| `estudianteId` | string | Estudiante existente. |
| `materia` | string | `id` de `materias` del programa del grupo del estudiante. **Una por estudiante y materia** (`VALIDACION` si se repite: se edita la existente). |
| `calificacion` | number | Entero 5–10. |
| `observaciones` | string | Opcional, máx. 500. |
| `version`, `creadoEn`, `creadoPor`, `modificadoEn` | | |

**Materia acreditada** (decisión del usuario): una materia con calificación de 7 o más, capturada o de la evaluación de un ciclo iniciado, no se vuelve a registrar para ese estudiante (`MATERIA_ACREDITADA`), sin importar el grupo. Con NP o reprobada (5 o 6) sí: se recursa y el registro nuevo la reemplaza en el kárdex.

Historial académico capturado a mano (decisión del usuario: traslada los datos de SGKardex). El cuatrimestre no se guarda: es el de la materia en el plan de estudios.

### Kárdex (derivado al leer)
| Campo | Tipo | Notas |
|---|---|---|
| `estudianteId` | string | |
| `cuatrimestres` | `{ numero, materias, promedio }[]` | Del 1 al 9, solo los que tienen calificaciones. `materias`: `{ materia, calificacion, observaciones, origen, registroId, cicloId }` en el orden del catálogo, **una por materia**; `origen` es `captura` (calificación de kárdex, `registroId` su `id`) o `ciclo` (evaluación de un ciclo **iniciado**, `cicloId`). `calificacion` es `null` (**NP**) para una materia inscrita por el grupo en un ciclo con evaluación guardada del estudiante que quedó sin calificar (salvo que ya estuviera acreditada). Si una materia tiene varios registros, queda el más reciente con calificación (capturas primero, luego ciclos en orden); NP solo si no hay ninguno con calificación. |
| `promedioGeneral` | number \| null | Suma ÷ número de materias (NP cuenta 0; sin redondear); `null` sin materias. |
| `totalMaterias` | number | |

Nunca se guarda: lo calcula el servidor con las calificaciones de kárdex, las evaluaciones y los cursos extracurriculares.

**Recuperación por curso extracurricular:** si el estudiante quedó **acreditado** como alumno obligatorio en un curso con `materia`, la fila de esa materia (si está reprobada o en NP) suma 2 puntos (NP parte de 5; máximo 10), lleva `observaciones: 'RECUPERADA'` y `recuperadaEn` (id del curso). Con eso la materia cuenta como acreditada (`MATERIA_ACREDITADA` en capturas y evaluaciones posteriores).

### Curso extracurricular
| Campo | Tipo | Notas |
|---|---|---|
| `id` | string | Servidor. |
| `nombre` | string | Obligatorio, máx. 120, único en el ciclo (sin distinguir mayúsculas ni espacios). |
| `docenteId` | string | Persona activa con rol Docente. |
| `materia` | string \| null | Materia que recupera; `null` = curso voluntario. |
| `horaInicio` | string | `HH:MM`, por omisión `10:00`; dura **3 horas** y termina el mismo día. |
| `cicloId` | string | Lo asigna el servidor: el ciclo **en curso e iniciado** (si no hay, `VALIDACION`). Se imparte en la semana 8 (Cierre de ciclo). |
| `voluntarios` | string[] | Estudiantes inscritos a mano (activos, que no sean obligatorios). |
| `acreditados` | string[] | Inscritos (obligatorios o voluntarios) que acreditaron. |
| `version`, `creadoEn`, `creadoPor`, `modificadoEn` | | Servidor. |
| `obligatorios` | string[] | **Derivado:** estudiantes activos cuyo kárdex (sin contar este curso) tiene `materia` reprobada (5 o 6) o en NP. |
| `semana` | `{ inicio, fin }` \| null | **Derivado:** la semana 8 del ciclo. |
| `horaFin` | string | **Derivado:** `horaInicio` + 3 h. |

Con el ciclo del curso cerrado, el curso ya no se modifica (`VALIDACION`).

## Operaciones

| Operación | Devuelve | Notas |
|---|---|---|
| `iniciarSesionEntra(token)` | `Sesion` | `token`: token de acceso de Microsoft Entra ID (ámbito `api://<cliente>/acceso`). El servidor **debe** validar firma (llaves públicas del inquilino), emisor (`tid` del inquilino), audiencia (`api://<cliente>`), vigencia y que el claim `roles` incluya un rol con `asignacion: 'entra-id'` (`NO_AUTORIZADO` / `PERMISO_DENEGADO`). Devuelve `{ usuario, nombre, correo, roles, proveedor: 'entra-id' }`. `LocalAPI` solo lee los claims (no puede verificar la firma). |
| `iniciarSesionGoogle(credencial)` | `Sesion` | `credencial`: token de identidad (JWT) de Google Identity Services. El servidor **debe** validar firma (llaves públicas de Google), emisor (`accounts.google.com`), audiencia (ID de cliente de SIGESED), vigencia y `email_verified` (`NO_AUTORIZADO`). Busca el correo en el personal **activo** y entrega sus roles del registro: `{ usuario, nombre, correo, roles, proveedor: 'google' }`. Un estudiante activo recibe `PERMISO_DENEGADO` (su acceso vendrá después; decisión del usuario); un correo no registrado o inactivo, `NO_REGISTRADO`. `LocalAPI` solo lee los claims (no puede verificar la firma). |
| `cerrarSesion()` | `{ cerrada: true }` | |

**Permisos (decisión del usuario):** la `Sesion` incluye `permisosPorRol` (los `permisos` de cada uno de sus roles; el servidor los usa para decidir y el cliente para ocultar lo que no permite cada rol activo). Toda operación que modifica datos exige sesión (`NO_AUTORIZADO`) y nivel `editar` en su módulo (`PERMISO_DENEGADO`): Matrícula (grupos, personal, estudiantes) `matricula`; configurar e iniciar ciclo e inscripciones `inicio`; plantel, crear y concluir ciclos `panelControl`; `evaluaciones`, `kardex`, `bitacora` (reportes), `cursos`; materias manuales `planEstudios`. Respaldos siguen siendo solo Administrador TI. «Solo lo suyo» del docente (que el servidor no le envíe datos ajenos) es la etapa 2.
| `exportarRespaldo()` | `Respaldo` | Solo **Administrador TI** (`NO_AUTORIZADO` sin sesión, `PERMISO_DENEGADO` sin el rol). `{ app: 'SIGESED', version, generadoEn, generadoPor, datos: { [almacén]: registro[] } }` con todos los datos (catálogos, plantel, personal, estudiantes, ciclos, evaluaciones, grupos, reportes, inscripciones, kárdex, cursos). |
| `restaurarRespaldo(respaldo)` | `{ restaurado: true, generadoEn }` | Solo **Administrador TI**. Valida `app`, que `version` sea la de la base actual, que cada almacén sea una lista con su clave y sin repetidos y que haya catálogos (`VALIDACION`); reemplaza **todos** los datos de forma atómica. |
| `listarCatalogos()` | `{ [nombre]: Elemento[] }` | |
| `obtenerPlantel()` | `Plantel \| null` | `null` mientras no se haya configurado. |
| `guardarPlantel(version, datos)` | `Plantel` | Si no existe lo crea (`version` = `null`); si existe lo reemplaza con los `datos` completos y exige su `version` (`CONFLICTO`). |
| `crearMateria(datos)` | `Materia` | Alta manual en el catálogo `materias` para programas sin plan de estudios completo (decisión del usuario): `{ programaEducativo, cuatrimestre (1–9), nombre }`. El servidor genera `clave` (3 letras del programa + cuatrimestre + consecutivo de 2 dígitos, ej. `BAC101`) e `id` (la clave en minúsculas), marca `manual: true` y deja vacíos objetivo, temas, actividades y evaluación. `VALIDACION` si el nombre se repite en el programa. Las actualizaciones del catálogo semilla deben **conservar** las materias `manual`. |
| `listarGrupos()` | `Grupo[]` | Ordenados por nombre. |
| `crearGrupo(datos)` | `Grupo` | `PLANTEL_NO_CONFIGURADO` si aún no hay plantel. |
| `editarGrupo(id, version, cambios)` | `Grupo` | |
| `eliminarGrupo(id)` | `{ id }` | `EN_USO` si tiene estudiantes o inscripciones en algún ciclo. |
| `listarPersonal()` | `Personal[]` | Ordenados por apellidos y nombre. |
| `crearPersonal(datos)` | `Personal` | `PLANTEL_NO_CONFIGURADO` si aún no hay plantel. |
| `editarPersonal(id, version, cambios)` | `Personal` | Solo los campos enviados. Valida `roles` igual que al crear (sin contarse a sí misma). |
| `eliminarPersonal(id)` | `{ id }` | `EN_USO` si es docente de alguna materia inscrita o imparte cursos extracurriculares. |
| `listarEstudiantes()` | `Estudiante[]` | Ordenados por apellidos y nombre. |
| `crearEstudiante(datos)` | `Estudiante` | Asigna `matricula`. `PLANTEL_NO_CONFIGURADO` si aún no hay plantel. |
| `editarEstudiante(id, version, cambios)` | `Estudiante` | `matricula` no se puede enviar (`VALIDACION`). |
| `eliminarEstudiante(id)` | `{ id }` | `CON_EVALUACIONES` si tiene evaluaciones o calificaciones de kárdex registradas, o está inscrito como voluntario o acreditó cursos extracurriculares. |
| `listarCiclos()` | `Ciclo[]` | Ordenados por año y número, con sus derivados. |
| `crearCiclosAnuales(anio)` | `Ciclo[]` | Crea los 6 ciclos de `anio` (entero, 2000–2100; si no, `VALIDACION`). Idempotente: solo crea los que falten. Devuelve **todos** los ciclos. |
| `configurarCiclo(id, version, datos)` | `Ciclo` | `datos`: `{ fechaInicio, diaInicioSemana, vacaciones, asuetos }` completos. Valida fechas, que `fechaInicio` caiga en `diaInicioSemana`, que cada vacación empiece al inicio de una semana del ciclo, que los asuetos estén dentro del ciclo y que no se encime con otro ciclo (`VALIDACION`). Exige `version` (`CONFLICTO`). Un ciclo `cerrado` no se puede configurar, y no se puede configurar uno nuevo mientras haya un ciclo configurado anterior sin cerrar (`VALIDACION`). |
| `concluirCiclo(id, version)` | `Ciclo` | Marca `cerrado`. Exige que el ciclo esté configurado y no cerrado (`VALIDACION`) y su `version` (`CONFLICTO`). |
| `iniciarCiclo(id, version)` | `Ciclo` | Marca `iniciado`. Exige `version` (`CONFLICTO`), que el ciclo no esté iniciado ni cerrado, que los anteriores configurados estén cerrados y que hoy sea **antes de `fechaInicio`** (`VALIDACION`), y que no tenga `pendientesInicio` (`CICLO_INCOMPLETO`, con los pendientes en el mensaje). Un ciclo iniciado ya no se configura (`VALIDACION`). |
| `listarInscripciones()` | `Inscripcion[]` | |
| `guardarInscripcion(cicloId, grupoId, version, datos)` | `Inscripcion` | `datos`: `{ materias }`. Si no existe la crea (`version` = `null`); si existe la reemplaza y exige su `version` (`CONFLICTO`). `NO_ENCONTRADO` si el ciclo o el grupo no existen; `VALIDACION` si el ciclo está iniciado o cerrado, el grupo inactivo o algún dato no cumple las reglas. |
| `listarCalificacionesKardex()` | `CalificacionKardex[]` | |
| `crearCalificacionKardex(datos)` | `CalificacionKardex` | `datos`: `{ estudianteId, materia, calificacion, observaciones }`. |
| `editarCalificacionKardex(id, version, cambios)` | `CalificacionKardex` | `cambios`: `{ materia, calificacion, observaciones }`. |
| `eliminarCalificacionKardex(id)` | `{ id }` | |
| `listarKardex()` | `Kardex[]` | Uno por estudiante con calificaciones. |
| `listarCursos()` | `Curso[]` | Del ciclo más reciente al más antiguo y por nombre, con sus derivados. |
| `crearCurso(datos)` | `Curso` | `datos`: `{ nombre, docenteId, materia, horaInicio }`. |
| `editarCurso(id, version, cambios)` | `Curso` | Mismos campos. Quita de `acreditados` a quien deje de estar inscrito. |
| `eliminarCurso(id)` | `{ id }` | `EN_USO` si ya tiene acreditados. |
| `inscribirEnCurso(id, version, estudianteId)` | `Curso` | Agrega un voluntario. `VALIDACION` si está inactivo o ya inscrito. |
| `quitarDeCurso(id, version, estudianteId)` | `Curso` | Solo voluntarios (`VALIDACION`). |
| `marcarAcreditado(id, version, estudianteId, acreditado)` | `Curso` | `acreditado` booleano; el estudiante debe estar inscrito. |
| `listarReportes()` | `Reporte[]` | Del más reciente al más antiguo (`fecha`, luego `creadoEn`). |
| `crearReporte(datos)` | `Reporte` | `datos`: `{ estudianteId, fecha, tipo, descripcion, acciones }`. `NO_ENCONTRADO` si el estudiante no existe; `VALIDACION` si está inactivo. |
| `listarEvaluaciones()` | `Evaluacion[]` | Con `promedio`. |
| `guardarEvaluacion(estudianteId, cicloId, version, datos)` | `Evaluacion` | `datos`: `{ calificaciones, observaciones }`. Si no existe la crea (`version` = `null`); si existe la reemplaza y exige su `version` (`CONFLICTO`). `NO_ENCONTRADO` si el estudiante o el ciclo no existen; `VALIDACION` si el ciclo no está iniciado. |

Al editar se valida el registro completo resultante.

## Errores

| Código | Cuándo |
|---|---|
| `VALIDACION` | Campo faltante, con formato inválido, con un `id` que no existe en su catálogo o un nombre de grupo repetido. |
| `NO_ENCONTRADO` | El registro no existe. |
| `CONFLICTO` | `version` distinta de la actual: alguien más lo cambió. El cliente recarga. |
| `PLANTEL_NO_CONFIGURADO` | Se intenta dar de alta personal o estudiantes sin plantel configurado. |
| `ROL_OCUPADO` | Se asigna un rol que ya alcanzó su `maximo` en otras personas. El mensaje dice quién lo tiene. |
| `EN_USO` | Se intenta eliminar un grupo con estudiantes o inscripciones, o a un docente con materias inscritas. |
| `CICLO_INCOMPLETO` | Se intenta iniciar un ciclo con pendientes. |
| `MATERIA_ACREDITADA` | Se registra (en kárdex o en una evaluación) una materia que el estudiante ya acreditó con 7 o más. |
| `CON_EVALUACIONES` | Se intenta eliminar un estudiante que tiene evaluaciones o calificaciones de kárdex. |
| `NO_AUTORIZADO` | El rol no permite escribir. |
| `NO_REGISTRADO` | El correo de la cuenta de Google no pertenece a ninguna persona activa del registro. |
| `NO_DISPONIBLE` | El almacenamiento no está disponible (en `LocalAPI`: otra pestaña con una versión anterior). |
| `NO_IMPLEMENTADO` | `ServerConnection` mientras no haya backend. |

## Seguridad (obligatorio para el backend)

- Cada operación valida la sesión y el rol en el servidor; la interfaz solo oculta lo que el usuario no puede hacer. Sin sesión válida: `NO_AUTORIZADO`; sin permiso: `PERMISO_DENEGADO`. Nunca se envían datos que el usuario no puede ver.
- Consultas a la base siempre parametrizadas (nunca SQL armado con texto).
- Sitio público (etapa 2): leer el contenido es público; editarlo solo **Administrador TI**. Bloques de tipos cerrados, texto con formato limitado (nunca HTML), longitudes máximas, enlaces solo `https://`, imágenes con tipo y tamaño validados.

## Pendiente (próximas versiones del contrato)

- **Exportar / importar JSON:** historias académicas, reportes y respaldos de registros. Los documentos oficiales los arma el servidor; el cliente solo los descarga o envía.
- **Datos de captura frecuente** (asistencias, tareas asignadas): pasan por el API como todo lo demás, con escritura **offline primero** (cola en `SesionIndexedDB` y estado `local` del `IndicadorSync` hasta sincronizar). Decisión del usuario (opción A).
