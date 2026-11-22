import { useState, useMemo, useRef, useEffect } from 'react';
import { TODOS_LOS_GRADOS, TURNOS, GENEROS } from '../../constants/estructuraEscolar';
import { getAlumnosActivos } from '../../data/mockAlumnos';
import { useNotificaciones } from '../../context/NotificacionesContext';
import {
    IconoAlumnos,
    IconoUsuario,
    IconoBuscar,
    IconoAlerta,
    IconoCampana,
    IconoCalendario,
    IconoCheck,
    IconoGuardar,
    IconoArchivo,
    IconoInfo,
} from '../../components/Iconos';
import './Asistencia.css';

/**
 * ====================================================================
 * MÓDULO DE ASISTENCIA — U.E.M. Gregorio Romero
 * --------------------------------------------------------------------
 * 1. Registro diario del alumno (presente / ausente)
 * 2. Registro diario del personal
 * 3. Buscar asistencia (por alumno / por fecha, exportar)
 * 4. Alertas de inasistencia (límite de faltas)
 * 5. Alerta si falta la asistencia diaria
 *
 * NOTA: Capa visual. Mientras el backend (Go/Wails) no exponga los
 * bindings de asistencia, los registros se guardan localmente
 * (localStorage) para funcionar 100% offline.
 * ====================================================================
 */

// ─── Constantes ──────────────────────────────────────────────
const CLAVE_STORAGE = 'atenea_asistencia_v1';
const CLAVE_LIMITE = 'atenea_asistencia_limite_faltas';
const DIAS_HISTORIAL = 20;
const DIAS_PERIODO_ALERTAS = 30;
const LIMITE_POR_DEFECTO = 3;

const ESTADO = { PRESENTE: 'P', AUSENTE: 'A' };

const PESTANAS = [
    { id: 'alumnos', texto: 'Alumnos', Icono: IconoAlumnos },
    { id: 'personal', texto: 'Personal', Icono: IconoUsuario },
    { id: 'consultar', texto: 'Consultar', Icono: IconoBuscar },
    { id: 'alertas', texto: 'Alertas', Icono: IconoAlerta },
];

// Personal de prueba (temporal hasta que exista el binding del backend)
const PERSONAL_INICIAL = [
    { id: 'per-1', nombre: 'Yolanda Marcano', cargo: 'Directora', area: 'Directivo', turno: TURNOS.MANANA, genero: GENEROS.HEMBRA },
    { id: 'per-2', nombre: 'Luis Rodríguez', cargo: 'Subdirector', area: 'Directivo', turno: TURNOS.TARDE, genero: GENEROS.VARON },
    { id: 'per-3', nombre: 'Carmen Salazar', cargo: 'Docente — 1ra Sala', area: 'Docente', turno: TURNOS.MANANA, genero: GENEROS.HEMBRA },
    { id: 'per-4', nombre: 'Andreína Fermín', cargo: 'Docente — 3ra Sala', area: 'Docente', turno: TURNOS.TARDE, genero: GENEROS.HEMBRA },
    { id: 'per-5', nombre: 'José Brito', cargo: 'Docente — 2do Grado', area: 'Docente', turno: TURNOS.MANANA, genero: GENEROS.VARON },
    { id: 'per-6', nombre: 'Marisol Villarroel', cargo: 'Docente — 4to Grado', area: 'Docente', turno: TURNOS.TARDE, genero: GENEROS.HEMBRA },
    { id: 'per-7', nombre: 'Pedro Malavé', cargo: 'Docente — 6to Grado', area: 'Docente', turno: TURNOS.MANANA, genero: GENEROS.VARON },
    { id: 'per-8', nombre: 'Rosa Campos', cargo: 'Secretaria', area: 'Administrativo', turno: TURNOS.MANANA, genero: GENEROS.HEMBRA },
    { id: 'per-9', nombre: 'Daniel Gil', cargo: 'Coordinador de Control de Estudios', area: 'Administrativo', turno: TURNOS.TARDE, genero: GENEROS.VARON },
    { id: 'per-10', nombre: 'Ramón Suárez', cargo: 'Obrero', area: 'Ambiente', turno: TURNOS.MANANA, genero: GENEROS.VARON },
];

// ─── Helpers de fecha ────────────────────────────────────────
const fechaISO = (fecha) => {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const hoyISO = () => fechaISO(new Date());

const aFecha = (iso) => new Date(`${iso}T00:00:00`);

const esFinDeSemana = (iso) => {
    const dia = aFecha(iso).getDay();
    return dia === 0 || dia === 6;
};

const restarDias = (iso, dias) => {
    const f = aFecha(iso);
    f.setDate(f.getDate() - dias);
    return fechaISO(f);
};

const formatearFechaLarga = (iso) =>
    aFecha(iso).toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

const formatearFechaCorta = (iso) =>
    aFecha(iso).toLocaleDateString('es-VE', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

/** Hoy si es día hábil; si es fin de semana, el último viernes. */
const ultimoDiaHabil = () => {
    let cursor = hoyISO();
    while (esFinDeSemana(cursor)) cursor = restarDias(cursor, 1);
    return cursor;
};

const diasHabilesPrevios = (cantidad) => {
    const dias = [];
    let cursor = restarDias(hoyISO(), 1);
    while (dias.length < cantidad) {
        if (!esFinDeSemana(cursor)) dias.push(cursor);
        cursor = restarDias(cursor, 1);
    }
    return dias;
};

// ─── Helpers de datos ────────────────────────────────────────
const pseudoAleatorio = (a, b) => {
    const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
    return x - Math.floor(x);
};

const idNumerico = (id) =>
    typeof id === 'number'
        ? id
        : String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

/** Genera un historial simulado de días hábiles anteriores (solo visual). */
const generarHistorial = (alumnos, personal) => {
    const historial = {};
    diasHabilesPrevios(DIAS_HISTORIAL).forEach((fecha, d) => {
        const registroAlumnos = {};
        alumnos.forEach((a) => {
            const n = idNumerico(a.id);
            const tasa = n % 5 === 0 ? 0.3 : n % 7 === 0 ? 0.18 : 0.05;
            registroAlumnos[a.id] = pseudoAleatorio(n, d + 1) < tasa ? ESTADO.AUSENTE : ESTADO.PRESENTE;
        });

        const registroPersonal = {};
        personal.forEach((p) => {
            const n = idNumerico(p.id);
            const presente = pseudoAleatorio(n, d + 7) >= 0.06;
            const minutos = String(Math.floor(pseudoAleatorio(n, d + 3) * 25)).padStart(2, '0');
            const horaBase = p.turno === TURNOS.MANANA ? '06' : '12';
            registroPersonal[p.id] = presente
                ? { estado: ESTADO.PRESENTE, hora: `${horaBase}:${minutos}` }
                : { estado: ESTADO.AUSENTE, hora: '' };
        });

        historial[fecha] = {
            alumnos: registroAlumnos,
            personal: registroPersonal,
            alumnosGuardado: true,
            personalGuardado: true,
        };
    });
    return historial;
};

const cargarGuardados = () => {
    try {
        const datos = localStorage.getItem(CLAVE_STORAGE);
        return datos ? JSON.parse(datos) : {};
    } catch {
        return {};
    }
};

const cargarLimite = () => {
    const valor = Number(localStorage.getItem(CLAVE_LIMITE));
    return valor > 0 ? valor : LIMITE_POR_DEFECTO;
};

const nombreCompleto = (a) => `${a.apellidos}, ${a.nombres}`;

const iniciales = (texto) =>
    texto
        .replace(',', '')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();

const esVaron = (genero) => genero === GENEROS.VARON;

/** Calcula V / H / T de una lista de personas filtrando por un predicado. */
const contarVHT = (lista, predicado = () => true) => {
    const filtrados = lista.filter(predicado);
    const v = filtrados.filter((x) => esVaron(x.genero)).length;
    return { v, h: filtrados.length - v, t: filtrados.length };
};

const descargarCSV = (nombreArchivo, encabezados, filas) => {
    const escapar = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`;
    const contenido = [encabezados, ...filas].map((fila) => fila.map(escapar).join(';')).join('\r\n');
    const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
};

// ═════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═════════════════════════════════════════════════════════════
function Asistencia() {
    const { agregarNotificacion } = useNotificaciones();
    const [pestana, setPestana] = useState('alumnos');
    const [aviso, setAviso] = useState(null);
    const [guardados, setGuardados] = useState(cargarGuardados);
    const [limiteFaltas, setLimiteFaltas] = useState(cargarLimite);
    const [alertaDiariaEnviada, setAlertaDiariaEnviada] = useState(false);
    const enviandoAlertaRef = useRef(false);

    const alumnos = useMemo(() => getAlumnosActivos(), []);
    const personal = PERSONAL_INICIAL;
    const historial = useMemo(() => generarHistorial(alumnos, personal), [alumnos, personal]);
    const registros = useMemo(() => ({ ...historial, ...guardados }), [historial, guardados]);

    const hoy = hoyISO();
    const hoyEsHabil = !esFinDeSemana(hoy);
    const alumnosPendientesHoy = hoyEsHabil && !registros[hoy]?.alumnosGuardado;
    const personalPendienteHoy = hoyEsHabil && !registros[hoy]?.personalGuardado;

    // Ocultar aviso automáticamente
    useEffect(() => {
        if (!aviso) return undefined;
        const t = setTimeout(() => setAviso(null), 4500);
        return () => clearTimeout(t);
    }, [aviso]);

    useEffect(() => {
        localStorage.setItem(CLAVE_LIMITE, String(limiteFaltas));
    }, [limiteFaltas]);

    // Faltas por alumno en el período de alertas
    const faltasPorAlumno = useMemo(() => {
        const desde = restarDias(hoy, DIAS_PERIODO_ALERTAS);
        const conteo = {};
        Object.entries(registros).forEach(([fecha, reg]) => {
            if (fecha < desde || fecha > hoy || !reg.alumnos) return;
            Object.entries(reg.alumnos).forEach(([id, estado]) => {
                if (estado === ESTADO.AUSENTE) conteo[id] = (conteo[id] || 0) + 1;
            });
        });
        return conteo;
    }, [registros, hoy]);

    const totalSuperados = alumnos.filter((a) => (faltasPorAlumno[a.id] || 0) >= limiteFaltas).length;

    const guardarRegistro = (fecha, tipo, marcas) => {
        setGuardados((prev) => {
            const base = prev[fecha] || registros[fecha] || {};
            const nuevo = {
                ...prev,
                [fecha]: {
                    ...base,
                    [tipo]: { ...(base[tipo] || {}), ...marcas },
                    [`${tipo}Guardado`]: true,
                },
            };
            localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevo));
            return nuevo;
        });
    };

    const enviarAlertaDiaria = () => {
        if (enviandoAlertaRef.current || alertaDiariaEnviada) return;
        enviandoAlertaRef.current = true;
        const pendientes = [
            alumnosPendientesHoy && 'alumnos',
            personalPendienteHoy && 'personal',
        ].filter(Boolean).join(' y ');
        agregarNotificacion({
            id: `asis-diaria-${Date.now()}`,
            fecha: 'Hace un momento',
            titulo: 'Asistencia diaria pendiente',
            mensaje: `Aún no se ha registrado la asistencia de ${pendientes} del ${formatearFechaLarga(hoy)}.`,
            tipo: 'asistencia',
            prioridad: 'urgente',
            ruta: '/asistencia',
        });
        setAlertaDiariaEnviada(true);
        setAviso({ tipo: 'exito', texto: 'Alerta de asistencia diaria enviada al panel de notificaciones.' });
        enviandoAlertaRef.current = false;
    };

    return (
        <div className="asis-modulo">
            {/* ─── Encabezado ─── */}
            <header className="asis-header">
                <div className="asis-header__info">
                    <h1>Control de Asistencia</h1>
                    <p>Registro diario de alumnos y personal — {formatearFechaLarga(hoy)}</p>
                </div>

                <nav className="asis-pills">
                    {PESTANAS.map(({ id, texto, Icono }) => (
                        <button
                            key={id}
                            type="button"
                            className={`asis-pill ${pestana === id ? 'asis-pill--activo' : ''}`}
                            onClick={() => setPestana(id)}
                        >
                            <Icono size={16} />
                            <span>{texto}</span>
                            {id === 'alertas' && totalSuperados > 0 && (
                                <span className="asis-pill__contador">{totalSuperados}</span>
                            )}
                        </button>
                    ))}
                </nav>
            </header>

            {/* ─── Alerta: asistencia diaria pendiente ─── */}
            {(alumnosPendientesHoy || personalPendienteHoy) && (
                <div className="asis-banner-pendiente">
                    <div className="asis-banner-pendiente__icono">
                        <IconoCampana size={20} />
                    </div>
                    <div className="asis-banner-pendiente__texto">
                        <strong>Asistencia del día pendiente</strong>
                        <span>
                            Falta registrar hoy:{' '}
                            {alumnosPendientesHoy && <em className="asis-chip asis-chip--amarillo">Alumnos</em>}{' '}
                            {personalPendienteHoy && <em className="asis-chip asis-chip--amarillo">Personal</em>}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="asis-btn asis-btn--alerta"
                        onClick={enviarAlertaDiaria}
                        disabled={alertaDiariaEnviada}
                    >
                        {alertaDiariaEnviada ? <IconoCheck size={15} /> : <IconoCampana size={15} />}
                        {alertaDiariaEnviada ? 'Alerta enviada' : 'Enviar alerta'}
                    </button>
                </div>
            )}

            {/* ─── Aviso flotante ─── */}
            {aviso && (
                <div className={`asis-aviso asis-aviso--${aviso.tipo}`}>
                    <span>{aviso.texto}</span>
                    <button type="button" className="asis-aviso__cerrar" onClick={() => setAviso(null)}>×</button>
                </div>
            )}

            {pestana === 'alumnos' && (
                <RegistroAlumnos
                    alumnos={alumnos}
                    registros={registros}
                    onGuardar={guardarRegistro}
                    onAviso={setAviso}
                />
            )}
            {pestana === 'personal' && (
                <RegistroPersonal
                    personal={personal}
                    registros={registros}
                    onGuardar={guardarRegistro}
                    onAviso={setAviso}
                />
            )}
            {pestana === 'consultar' && (
                <ConsultarAsistencia alumnos={alumnos} registros={registros} />
            )}
            {pestana === 'alertas' && (
                <AlertasInasistencia
                    alumnos={alumnos}
                    faltasPorAlumno={faltasPorAlumno}
                    limite={limiteFaltas}
                    setLimite={setLimiteFaltas}
                    onAviso={setAviso}
                    agregarNotificacion={agregarNotificacion}
                />
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════
// 1. REGISTRO DIARIO DE ALUMNOS
// ═════════════════════════════════════════════════════════════
function RegistroAlumnos({ alumnos, registros, onGuardar, onAviso }) {
    const [fecha, setFecha] = useState(ultimoDiaHabil);
    const [turno, setTurno] = useState('Todos');
    const [grado, setGrado] = useState('Todos');
    const [seccion, setSeccion] = useState('Todas');
    const [busqueda, setBusqueda] = useState('');
    const [marcas, setMarcas] = useState({});
    const [cargando, setCargando] = useState(false);
    const guardandoRef = useRef(false);

    const registroDelDia = registros[fecha];
    const yaGuardado = !!registroDelDia?.alumnosGuardado;
    const finDeSemana = esFinDeSemana(fecha);

    useEffect(() => {
        setMarcas(registros[fecha]?.alumnos ? { ...registros[fecha].alumnos } : {});
        // Solo reiniciar al cambiar de fecha
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fecha]);

    const secciones = useMemo(
        () => [...new Set(alumnos.map((a) => a.seccionLiteral).filter(Boolean))].sort(),
        [alumnos]
    );

    const filtrados = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        return alumnos
            .filter((a) => turno === 'Todos' || a.turno === turno)
            .filter((a) => grado === 'Todos' || a.gradoNivel === grado)
            .filter((a) => seccion === 'Todas' || a.seccionLiteral === seccion)
            .filter((a) => !texto || nombreCompleto(a).toLowerCase().includes(texto) || String(a.cedulaEscolar || '').includes(texto));
    }, [alumnos, turno, grado, seccion, busqueda]);

    const presentes = contarVHT(filtrados, (a) => marcas[a.id] === ESTADO.PRESENTE);
    const ausentes = contarVHT(filtrados, (a) => marcas[a.id] === ESTADO.AUSENTE);
    const matricula = contarVHT(filtrados);
    const sinMarcar = matricula.t - presentes.t - ausentes.t;
    const porcentaje = matricula.t ? Math.round((presentes.t / matricula.t) * 100) : 0;

    const marcar = (id, estado) => {
        setMarcas((prev) => ({ ...prev, [id]: prev[id] === estado ? undefined : estado }));
    };

    const marcarTodos = (estado) => {
        setMarcas((prev) => {
            const nuevo = { ...prev };
            filtrados.forEach((a) => { nuevo[a.id] = estado; });
            return nuevo;
        });
    };

    const guardar = () => {
        if (guardandoRef.current) return;
        if (finDeSemana) return;
        if (sinMarcar > 0) {
            onAviso({ tipo: 'error', texto: `Faltan ${sinMarcar} alumno(s) por marcar antes de guardar.` });
            return;
        }
        guardandoRef.current = true;
        setCargando(true);

        const marcasLimpias = {};
        filtrados.forEach((a) => { marcasLimpias[a.id] = marcas[a.id]; });

        // Simulación local mientras se integra el binding de Wails
        setTimeout(() => {
            onGuardar(fecha, 'alumnos', marcasLimpias);
            onAviso({ tipo: 'exito', texto: `Asistencia de ${filtrados.length} alumno(s) guardada para el ${formatearFechaCorta(fecha)}.` });
            setCargando(false);
            guardandoRef.current = false;
        }, 500);
    };

    return (
        <section className="asis-card">
            {/* Filtros */}
            <div className="asis-filtros">
                <div className="asis-filtros__fila">
                    <label className="asis-campo">
                        <span className="asis-campo__etiqueta"><IconoCalendario size={14} /> Fecha</span>
                        <input
                            type="date"
                            className="asis-input"
                            value={fecha}
                            max={hoyISO()}
                            onChange={(e) => e.target.value && setFecha(e.target.value)}
                        />
                    </label>

                    <label className="asis-campo">
                        <span className="asis-campo__etiqueta">Grado</span>
                        <select className="asis-input" value={grado} onChange={(e) => setGrado(e.target.value)}>
                            <option value="Todos">Todos los grados</option>
                            {TODOS_LOS_GRADOS.map((g) => (
                                <option key={g.id} value={g.nombre}>{g.nombre}</option>
                            ))}
                        </select>
                    </label>

                    <div className="asis-campo">
                        <span className="asis-campo__etiqueta">Turno</span>
                        <SelectorPildoras
                            opciones={['Todos', TURNOS.MANANA, TURNOS.TARDE]}
                            valor={turno}
                            onCambio={setTurno}
                        />
                    </div>

                    <div className="asis-campo">
                        <span className="asis-campo__etiqueta">Sección</span>
                        <SelectorPildoras
                            opciones={['Todas', ...secciones]}
                            valor={seccion}
                            onCambio={setSeccion}
                        />
                    </div>
                </div>

                <div className="asis-buscador">
                    <IconoBuscar size={17} />
                    <input
                        type="text"
                        placeholder="Buscar alumno por nombre, apellido o cédula escolar..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
            </div>

            {/* Estado del día */}
            <div className="asis-estado-dia">
                <span className="asis-estado-dia__fecha">{formatearFechaLarga(fecha)}</span>
                {finDeSemana ? (
                    <span className="asis-chip asis-chip--neutro"><IconoInfo size={13} /> Fin de semana — sin actividad escolar</span>
                ) : yaGuardado ? (
                    <span className="asis-chip asis-chip--verde"><IconoCheck size={13} /> Registro guardado</span>
                ) : (
                    <span className="asis-chip asis-chip--amarillo"><IconoAlerta size={13} /> Pendiente por registrar</span>
                )}
            </div>

            <div className="asis-layout">
                {/* Lista de alumnos */}
                <div className="asis-lista-wrapper">
                    <div className="asis-lista-acciones">
                        <span className="asis-lista-acciones__total">
                            {filtrados.length} alumno(s) · <strong>{sinMarcar}</strong> sin marcar
                        </span>
                        <div className="asis-lista-acciones__botones">
                            <button type="button" className="asis-btn asis-btn--suave-verde" onClick={() => marcarTodos(ESTADO.PRESENTE)} disabled={finDeSemana || cargando || !filtrados.length}>
                                <IconoCheck size={14} /> Todos presentes
                            </button>
                            <button type="button" className="asis-btn asis-btn--suave-rojo" onClick={() => marcarTodos(ESTADO.AUSENTE)} disabled={finDeSemana || cargando || !filtrados.length}>
                                Todos ausentes
                            </button>
                        </div>
                    </div>

                    {filtrados.length === 0 ? (
                        <EstadoVacio texto="No hay alumnos que coincidan con los filtros seleccionados." />
                    ) : (
                        <ul className="asis-lista">
                            {filtrados.map((a) => (
                                <FilaPersona
                                    key={a.id}
                                    titulo={nombreCompleto(a)}
                                    genero={a.genero}
                                    detalles={[
                                        { texto: `${a.gradoNivel} "${a.seccionLiteral}"`, tipo: 'grado' },
                                        { texto: `Turno ${a.turno}`, tipo: 'neutro' },
                                    ]}
                                    estado={marcas[a.id]}
                                    onMarcar={(estado) => marcar(a.id, estado)}
                                    deshabilitado={finDeSemana || cargando}
                                />
                            ))}
                        </ul>
                    )}
                </div>

                {/* Resumen V / H / T */}
                <aside className="asis-resumen">
                    <h3 className="asis-resumen__titulo">Resumen del día</h3>

                    <div className="asis-anillo" style={{ '--asis-porcentaje': `${porcentaje * 3.6}deg` }}>
                        <div className="asis-anillo__centro">
                            <strong>{porcentaje}%</strong>
                            <span>asistencia</span>
                        </div>
                    </div>

                    <TablaVHT
                        filas={[
                            { etiqueta: 'Presentes', datos: presentes, tipo: 'verde' },
                            { etiqueta: 'Ausentes', datos: ausentes, tipo: 'rojo' },
                            { etiqueta: 'Matrícula', datos: matricula, tipo: 'total' },
                        ]}
                    />

                    <button
                        type="button"
                        className="asis-btn asis-btn--primario asis-btn--bloque"
                        onClick={guardar}
                        disabled={cargando || finDeSemana || filtrados.length === 0}
                    >
                        <IconoGuardar size={16} />
                        {cargando ? 'Guardando...' : yaGuardado ? 'Actualizar asistencia' : 'Guardar asistencia'}
                    </button>
                </aside>
            </div>
        </section>
    );
}

// ═════════════════════════════════════════════════════════════
// 2. REGISTRO DIARIO DEL PERSONAL
// ═════════════════════════════════════════════════════════════
function RegistroPersonal({ personal, registros, onGuardar, onAviso }) {
    const [fecha, setFecha] = useState(ultimoDiaHabil);
    const [turno, setTurno] = useState('Todos');
    const [area, setArea] = useState('Todas');
    const [marcas, setMarcas] = useState({});
    const [cargando, setCargando] = useState(false);
    const guardandoRef = useRef(false);

    const yaGuardado = !!registros[fecha]?.personalGuardado;
    const finDeSemana = esFinDeSemana(fecha);
    const areas = useMemo(() => [...new Set(personal.map((p) => p.area))], [personal]);

    useEffect(() => {
        setMarcas(registros[fecha]?.personal ? { ...registros[fecha].personal } : {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fecha]);

    const filtrados = personal
        .filter((p) => turno === 'Todos' || p.turno === turno)
        .filter((p) => area === 'Todas' || p.area === area);

    const presentes = contarVHT(filtrados, (p) => marcas[p.id]?.estado === ESTADO.PRESENTE);
    const ausentes = contarVHT(filtrados, (p) => marcas[p.id]?.estado === ESTADO.AUSENTE);
    const total = contarVHT(filtrados);
    const sinMarcar = total.t - presentes.t - ausentes.t;

    const horaActual = () => {
        const ahora = new Date();
        return `${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}`;
    };

    const marcar = (persona, estado) => {
        setMarcas((prev) => {
            if (prev[persona.id]?.estado === estado) {
                const { [persona.id]: _omitido, ...resto } = prev;
                return resto;
            }
            const hora = estado === ESTADO.PRESENTE
                ? (fecha === hoyISO() ? horaActual() : (persona.turno === TURNOS.MANANA ? '07:00' : '13:00'))
                : '';
            return { ...prev, [persona.id]: { estado, hora } };
        });
    };

    const cambiarHora = (id, hora) => {
        setMarcas((prev) => ({ ...prev, [id]: { ...prev[id], hora } }));
    };

    const guardar = () => {
        if (guardandoRef.current || finDeSemana) return;
        if (sinMarcar > 0) {
            onAviso({ tipo: 'error', texto: `Faltan ${sinMarcar} miembro(s) del personal por marcar.` });
            return;
        }
        guardandoRef.current = true;
        setCargando(true);
        const marcasLimpias = {};
        filtrados.forEach((p) => { marcasLimpias[p.id] = marcas[p.id]; });

        setTimeout(() => {
            onGuardar(fecha, 'personal', marcasLimpias);
            onAviso({ tipo: 'exito', texto: `Asistencia del personal guardada para el ${formatearFechaCorta(fecha)}.` });
            setCargando(false);
            guardandoRef.current = false;
        }, 500);
    };

    return (
        <section className="asis-card">
            <div className="asis-filtros">
                <div className="asis-filtros__fila">
                    <label className="asis-campo">
                        <span className="asis-campo__etiqueta"><IconoCalendario size={14} /> Fecha</span>
                        <input
                            type="date"
                            className="asis-input"
                            value={fecha}
                            max={hoyISO()}
                            onChange={(e) => e.target.value && setFecha(e.target.value)}
                        />
                    </label>
                    <div className="asis-campo">
                        <span className="asis-campo__etiqueta">Turno</span>
                        <SelectorPildoras opciones={['Todos', TURNOS.MANANA, TURNOS.TARDE]} valor={turno} onCambio={setTurno} />
                    </div>
                    <div className="asis-campo">
                        <span className="asis-campo__etiqueta">Área</span>
                        <SelectorPildoras opciones={['Todas', ...areas]} valor={area} onCambio={setArea} />
                    </div>
                </div>
            </div>

            <div className="asis-estado-dia">
                <span className="asis-estado-dia__fecha">{formatearFechaLarga(fecha)}</span>
                {finDeSemana ? (
                    <span className="asis-chip asis-chip--neutro"><IconoInfo size={13} /> Fin de semana — sin actividad escolar</span>
                ) : yaGuardado ? (
                    <span className="asis-chip asis-chip--verde"><IconoCheck size={13} /> Registro guardado</span>
                ) : (
                    <span className="asis-chip asis-chip--amarillo"><IconoAlerta size={13} /> Pendiente por registrar</span>
                )}
            </div>

            <div className="asis-layout">
                <div className="asis-lista-wrapper">
                    <div className="asis-lista-acciones">
                        <span className="asis-lista-acciones__total">
                            {filtrados.length} miembro(s) del personal · <strong>{sinMarcar}</strong> sin marcar
                        </span>
                    </div>

                    {filtrados.length === 0 ? (
                        <EstadoVacio texto="No hay personal registrado para los filtros seleccionados." />
                    ) : (
                        <ul className="asis-lista">
                            {filtrados.map((p) => (
                                <FilaPersona
                                    key={p.id}
                                    titulo={p.nombre}
                                    genero={p.genero}
                                    detalles={[
                                        { texto: p.cargo, tipo: 'grado' },
                                        { texto: `Turno ${p.turno}`, tipo: 'neutro' },
                                    ]}
                                    estado={marcas[p.id]?.estado}
                                    onMarcar={(estado) => marcar(p, estado)}
                                    deshabilitado={finDeSemana || cargando}
                                    extra={
                                        marcas[p.id]?.estado === ESTADO.PRESENTE && (
                                            <label className="asis-hora">
                                                <span>Entrada</span>
                                                <input
                                                    type="time"
                                                    value={marcas[p.id].hora || ''}
                                                    onChange={(e) => cambiarHora(p.id, e.target.value)}
                                                    disabled={finDeSemana || cargando}
                                                />
                                            </label>
                                        )
                                    }
                                />
                            ))}
                        </ul>
                    )}
                </div>

                <aside className="asis-resumen">
                    <h3 className="asis-resumen__titulo">Resumen del personal</h3>
                    <div className="asis-mini-stats">
                        <div className="asis-mini-stat asis-mini-stat--verde">
                            <strong>{presentes.t}</strong><span>Presentes</span>
                        </div>
                        <div className="asis-mini-stat asis-mini-stat--rojo">
                            <strong>{ausentes.t}</strong><span>Ausentes</span>
                        </div>
                        <div className="asis-mini-stat">
                            <strong>{sinMarcar}</strong><span>Sin marcar</span>
                        </div>
                    </div>
                    <TablaVHT
                        filas={[
                            { etiqueta: 'Presentes', datos: presentes, tipo: 'verde' },
                            { etiqueta: 'Ausentes', datos: ausentes, tipo: 'rojo' },
                            { etiqueta: 'Total', datos: total, tipo: 'total' },
                        ]}
                    />
                    <button
                        type="button"
                        className="asis-btn asis-btn--primario asis-btn--bloque"
                        onClick={guardar}
                        disabled={cargando || finDeSemana || filtrados.length === 0}
                    >
                        <IconoGuardar size={16} />
                        {cargando ? 'Guardando...' : yaGuardado ? 'Actualizar registro' : 'Guardar registro'}
                    </button>
                </aside>
            </div>
        </section>
    );
}

// ═════════════════════════════════════════════════════════════
// 3. CONSULTAR ASISTENCIA (POR ALUMNO / POR FECHA) + EXPORTAR
// ═════════════════════════════════════════════════════════════
function ConsultarAsistencia({ alumnos, registros }) {
    const [modo, setModo] = useState('alumno');

    return (
        <section className="asis-card">
            <div className="asis-consulta-modos">
                <SelectorPildoras
                    opciones={['alumno', 'fecha']}
                    etiquetas={{ alumno: 'Por alumno', fecha: 'Por fecha' }}
                    valor={modo}
                    onCambio={setModo}
                />
            </div>
            {modo === 'alumno'
                ? <ConsultaPorAlumno alumnos={alumnos} registros={registros} />
                : <ConsultaPorFecha alumnos={alumnos} registros={registros} />}
        </section>
    );
}

function ConsultaPorAlumno({ alumnos, registros }) {
    const [busqueda, setBusqueda] = useState('');
    const [seleccionado, setSeleccionado] = useState(null);
    const [desde, setDesde] = useState(restarDias(hoyISO(), 30));
    const [hasta, setHasta] = useState(hoyISO());

    const sugerencias = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        if (!texto) return [];
        return alumnos
            .filter((a) => nombreCompleto(a).toLowerCase().includes(texto) || String(a.cedulaEscolar || '').includes(texto))
            .slice(0, 6);
    }, [alumnos, busqueda]);

    const filas = useMemo(() => {
        if (!seleccionado) return [];
        return Object.entries(registros)
            .filter(([fecha, reg]) => fecha >= desde && fecha <= hasta && reg.alumnos?.[seleccionado.id])
            .map(([fecha, reg]) => ({ fecha, estado: reg.alumnos[seleccionado.id] }))
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
    }, [registros, seleccionado, desde, hasta]);

    const asistencias = filas.filter((f) => f.estado === ESTADO.PRESENTE).length;
    const faltas = filas.length - asistencias;
    const porcentaje = filas.length ? Math.round((asistencias / filas.length) * 100) : 0;

    const exportar = () => {
        descargarCSV(
            `asistencia_${seleccionado.apellidos.replace(/\s+/g, '_')}_${desde}_${hasta}.csv`,
            ['Fecha', 'Alumno', 'Cédula Escolar', 'Grado', 'Sección', 'Turno', 'Estado'],
            filas.map((f) => [
                f.fecha,
                nombreCompleto(seleccionado),
                seleccionado.cedulaEscolar,
                seleccionado.gradoNivel,
                seleccionado.seccionLiteral,
                seleccionado.turno,
                f.estado === ESTADO.PRESENTE ? 'Presente' : 'Ausente',
            ])
        );
    };

    return (
        <div className="asis-consulta">
            <div className="asis-filtros">
                <div className="asis-filtros__fila">
                    <div className="asis-campo asis-campo--ancho">
                        <span className="asis-campo__etiqueta">Alumno</span>
                        <div className="asis-autocompletar">
                            <div className="asis-buscador">
                                <IconoBuscar size={17} />
                                <input
                                    type="text"
                                    placeholder="Escribe el nombre, apellido o cédula escolar..."
                                    value={busqueda}
                                    onChange={(e) => { setBusqueda(e.target.value); setSeleccionado(null); }}
                                />
                            </div>
                            {sugerencias.length > 0 && !seleccionado && (
                                <ul className="asis-sugerencias">
                                    {sugerencias.map((a) => (
                                        <li key={a.id}>
                                            <button
                                                type="button"
                                                onClick={() => { setSeleccionado(a); setBusqueda(nombreCompleto(a)); }}
                                            >
                                                <Avatar texto={nombreCompleto(a)} genero={a.genero} pequeno />
                                                <span className="asis-sugerencias__nombre">{nombreCompleto(a)}</span>
                                                <span className="asis-sugerencias__meta">{a.gradoNivel} "{a.seccionLiteral}" · {a.turno}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <label className="asis-campo">
                        <span className="asis-campo__etiqueta">Desde</span>
                        <input type="date" className="asis-input" value={desde} max={hasta} onChange={(e) => e.target.value && setDesde(e.target.value)} />
                    </label>
                    <label className="asis-campo">
                        <span className="asis-campo__etiqueta">Hasta</span>
                        <input type="date" className="asis-input" value={hasta} min={desde} max={hoyISO()} onChange={(e) => e.target.value && setHasta(e.target.value)} />
                    </label>
                </div>
            </div>

            {!seleccionado ? (
                <EstadoVacio texto="Busca y selecciona un alumno para ver su historial de asistencia." icono={<IconoBuscar size={26} />} />
            ) : (
                <>
                    <div className="asis-ficha">
                        <Avatar texto={nombreCompleto(seleccionado)} genero={seleccionado.genero} />
                        <div className="asis-ficha__datos">
                            <strong>{nombreCompleto(seleccionado)}</strong>
                            <span>
                                C.E. {seleccionado.cedulaEscolar} · {seleccionado.gradoNivel} "{seleccionado.seccionLiteral}" · Turno {seleccionado.turno}
                            </span>
                        </div>
                        <button type="button" className="asis-btn asis-btn--secundario" onClick={exportar} disabled={!filas.length}>
                            <IconoArchivo size={15} /> Exportar CSV
                        </button>
                    </div>

                    <div className="asis-kpis">
                        <Kpi valor={filas.length} etiqueta="Días registrados" />
                        <Kpi valor={asistencias} etiqueta="Asistencias" tipo="verde" />
                        <Kpi valor={faltas} etiqueta="Inasistencias" tipo="rojo" />
                        <Kpi valor={`${porcentaje}%`} etiqueta="% de asistencia" tipo="primario" />
                    </div>

                    {filas.length === 0 ? (
                        <EstadoVacio texto="No hay registros en el rango de fechas seleccionado." />
                    ) : (
                        <div className="asis-tabla-wrapper">
                            <table className="asis-tabla">
                                <thead>
                                    <tr><th>Fecha</th><th>Día</th><th>Estado</th></tr>
                                </thead>
                                <tbody>
                                    {filas.map((f) => (
                                        <tr key={f.fecha}>
                                            <td>{f.fecha.split('-').reverse().join('/')}</td>
                                            <td className="asis-tabla__capital">{aFecha(f.fecha).toLocaleDateString('es-VE', { weekday: 'long' })}</td>
                                            <td><BadgeEstado estado={f.estado} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function ConsultaPorFecha({ alumnos, registros }) {
    const fechasDisponibles = useMemo(
        () => Object.keys(registros).filter((f) => registros[f].alumnosGuardado).sort().reverse(),
        [registros]
    );
    const [fecha, setFecha] = useState(fechasDisponibles[0] || hoyISO());
    const [turno, setTurno] = useState('Todos');
    const [grado, setGrado] = useState('Todos');
    const [estadoFiltro, setEstadoFiltro] = useState('Todos');

    const registro = registros[fecha];

    const filas = alumnos
        .filter((a) => turno === 'Todos' || a.turno === turno)
        .filter((a) => grado === 'Todos' || a.gradoNivel === grado)
        .map((a) => ({ alumno: a, estado: registro?.alumnos?.[a.id] }))
        .filter((f) => f.estado)
        .filter((f) => estadoFiltro === 'Todos'
            || (estadoFiltro === 'Presentes' && f.estado === ESTADO.PRESENTE)
            || (estadoFiltro === 'Ausentes' && f.estado === ESTADO.AUSENTE));

    const lista = filas.map((f) => ({ ...f.alumno, estado: f.estado }));
    const presentes = contarVHT(lista, (a) => a.estado === ESTADO.PRESENTE);
    const ausentes = contarVHT(lista, (a) => a.estado === ESTADO.AUSENTE);
    const total = contarVHT(lista);

    const exportar = () => {
        descargarCSV(
            `asistencia_${fecha}.csv`,
            ['Fecha', 'Alumno', 'Cédula Escolar', 'Género', 'Grado', 'Sección', 'Turno', 'Estado'],
            filas.map(({ alumno: a, estado }) => [
                fecha, nombreCompleto(a), a.cedulaEscolar, a.genero, a.gradoNivel, a.seccionLiteral, a.turno,
                estado === ESTADO.PRESENTE ? 'Presente' : 'Ausente',
            ])
        );
    };

    return (
        <div className="asis-consulta">
            <div className="asis-filtros">
                <div className="asis-filtros__fila">
                    <label className="asis-campo">
                        <span className="asis-campo__etiqueta"><IconoCalendario size={14} /> Fecha</span>
                        <input type="date" className="asis-input" value={fecha} max={hoyISO()} onChange={(e) => e.target.value && setFecha(e.target.value)} />
                    </label>
                    <label className="asis-campo">
                        <span className="asis-campo__etiqueta">Grado</span>
                        <select className="asis-input" value={grado} onChange={(e) => setGrado(e.target.value)}>
                            <option value="Todos">Todos los grados</option>
                            {TODOS_LOS_GRADOS.map((g) => <option key={g.id} value={g.nombre}>{g.nombre}</option>)}
                        </select>
                    </label>
                    <div className="asis-campo">
                        <span className="asis-campo__etiqueta">Turno</span>
                        <SelectorPildoras opciones={['Todos', TURNOS.MANANA, TURNOS.TARDE]} valor={turno} onCambio={setTurno} />
                    </div>
                    <div className="asis-campo">
                        <span className="asis-campo__etiqueta">Estado</span>
                        <SelectorPildoras opciones={['Todos', 'Presentes', 'Ausentes']} valor={estadoFiltro} onCambio={setEstadoFiltro} />
                    </div>
                </div>
            </div>

            <div className="asis-ficha">
                <div className="asis-ficha__icono"><IconoCalendario size={22} /></div>
                <div className="asis-ficha__datos">
                    <strong className="asis-tabla__capital">{formatearFechaLarga(fecha)}</strong>
                    <span>{registro?.alumnosGuardado ? `${filas.length} registro(s) encontrados` : 'Sin registro de asistencia para esta fecha'}</span>
                </div>
                <button type="button" className="asis-btn asis-btn--secundario" onClick={exportar} disabled={!filas.length}>
                    <IconoArchivo size={15} /> Exportar CSV
                </button>
            </div>

            {filas.length === 0 ? (
                <EstadoVacio texto="No se encontraron registros de asistencia con estos filtros." />
            ) : (
                <div className="asis-consulta-grid">
                    <div className="asis-tabla-wrapper">
                        <table className="asis-tabla">
                            <thead>
                                <tr><th>Alumno</th><th>Grado</th><th>Turno</th><th>Género</th><th>Estado</th></tr>
                            </thead>
                            <tbody>
                                {filas.map(({ alumno: a, estado }) => (
                                    <tr key={a.id}>
                                        <td className="asis-tabla__nombre">{nombreCompleto(a)}</td>
                                        <td>{a.gradoNivel} "{a.seccionLiteral}"</td>
                                        <td>{a.turno}</td>
                                        <td><BadgeGenero genero={a.genero} /></td>
                                        <td><BadgeEstado estado={estado} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <aside className="asis-resumen">
                        <h3 className="asis-resumen__titulo">Totales</h3>
                        <TablaVHT
                            filas={[
                                { etiqueta: 'Presentes', datos: presentes, tipo: 'verde' },
                                { etiqueta: 'Ausentes', datos: ausentes, tipo: 'rojo' },
                                { etiqueta: 'Total', datos: total, tipo: 'total' },
                            ]}
                        />
                    </aside>
                </div>
            )}
        </div>
    );
}

// ═════════════════════════════════════════════════════════════
// 4. ALERTAS DE INASISTENCIA
// ═════════════════════════════════════════════════════════════
function AlertasInasistencia({ alumnos, faltasPorAlumno, limite, setLimite, onAviso, agregarNotificacion }) {
    const [filtro, setFiltro] = useState('Todos');
    const [notificados, setNotificados] = useState({});
    const notificandoRef = useRef(false);

    const lista = alumnos
        .map((a) => {
            const faltas = faltasPorAlumno[a.id] || 0;
            const nivel = faltas >= limite ? 'superado' : faltas === limite - 1 && faltas > 0 ? 'riesgo' : 'normal';
            return { alumno: a, faltas, nivel };
        })
        .filter((x) => x.faltas > 0)
        .sort((a, b) => b.faltas - a.faltas);

    const superados = lista.filter((x) => x.nivel === 'superado');
    const enRiesgo = lista.filter((x) => x.nivel === 'riesgo');

    const visibles = lista.filter((x) =>
        filtro === 'Todos'
        || (filtro === 'Límite superado' && x.nivel === 'superado')
        || (filtro === 'En riesgo' && x.nivel === 'riesgo'));

    const notificar = (items) => {
        if (notificandoRef.current) return;
        notificandoRef.current = true;
        const pendientes = items.filter((x) => !notificados[x.alumno.id]);
        const baseId = Date.now();
        pendientes.forEach(({ alumno: a, faltas }, idx) => {
            agregarNotificacion({
                id: `asis-falta-${a.id}-${baseId}-${idx}`,
                fecha: 'Hace un momento',
                titulo: 'Límite de inasistencias superado',
                mensaje: `${a.nombres} ${a.apellidos} (${a.gradoNivel} "${a.seccionLiteral}") acumula ${faltas} faltas en los últimos ${DIAS_PERIODO_ALERTAS} días.`,
                tipo: 'asistencia',
                prioridad: 'alerta',
                ruta: '/asistencia',
            });
        });
        if (pendientes.length) {
            setNotificados((prev) => {
                const nuevo = { ...prev };
                pendientes.forEach((x) => { nuevo[x.alumno.id] = true; });
                return nuevo;
            });
            onAviso({ tipo: 'exito', texto: `${pendientes.length} alerta(s) enviada(s) al panel de notificaciones.` });
        }
        notificandoRef.current = false;
    };

    const ajustarLimite = (delta) => setLimite((v) => Math.min(15, Math.max(1, v + delta)));

    return (
        <section className="asis-card">
            <div className="asis-alertas-top">
                <div className="asis-limite">
                    <div className="asis-limite__info">
                        <strong>Límite de faltas</strong>
                        <span>Período: últimos {DIAS_PERIODO_ALERTAS} días</span>
                    </div>
                    <div className="asis-limite__control">
                        <button type="button" onClick={() => ajustarLimite(-1)} disabled={limite <= 1} aria-label="Disminuir límite">−</button>
                        <span>{limite}</span>
                        <button type="button" onClick={() => ajustarLimite(1)} disabled={limite >= 15} aria-label="Aumentar límite">+</button>
                    </div>
                </div>

                <div className="asis-kpis asis-kpis--compacto">
                    <Kpi valor={superados.length} etiqueta="Límite superado" tipo="rojo" />
                    <Kpi valor={enRiesgo.length} etiqueta="En riesgo" tipo="amarillo" />
                    <Kpi valor={lista.length} etiqueta="Con inasistencias" />
                </div>
            </div>

            <div className="asis-lista-acciones">
                <SelectorPildoras opciones={['Todos', 'Límite superado', 'En riesgo']} valor={filtro} onCambio={setFiltro} />
                <button
                    type="button"
                    className="asis-btn asis-btn--alerta"
                    onClick={() => notificar(superados)}
                    disabled={!superados.some((x) => !notificados[x.alumno.id])}
                >
                    <IconoCampana size={15} /> Notificar a todos ({superados.filter((x) => !notificados[x.alumno.id]).length})
                </button>
            </div>

            {visibles.length === 0 ? (
                <EstadoVacio texto="No hay alumnos con alertas de inasistencia para este filtro." icono={<IconoCheck size={26} />} />
            ) : (
                <ul className="asis-alertas-lista">
                    {visibles.map(({ alumno: a, faltas, nivel }) => (
                        <li key={a.id} className={`asis-alerta-item asis-alerta-item--${nivel}`}>
                            <Avatar texto={nombreCompleto(a)} genero={a.genero} />
                            <div className="asis-alerta-item__info">
                                <strong>{nombreCompleto(a)}</strong>
                                <span>{a.gradoNivel} "{a.seccionLiteral}" · Turno {a.turno}</span>
                                <div className="asis-barra">
                                    <div
                                        className={`asis-barra__relleno asis-barra__relleno--${nivel}`}
                                        style={{ width: `${Math.min(100, (faltas / limite) * 100)}%` }}
                                    />
                                </div>
                            </div>
                            <div className="asis-alerta-item__faltas">
                                <strong>{faltas}</strong>
                                <span>/ {limite} faltas</span>
                            </div>
                            <span className={`asis-chip asis-chip--${nivel === 'superado' ? 'rojo' : nivel === 'riesgo' ? 'amarillo' : 'neutro'}`}>
                                {nivel === 'superado' ? 'Límite superado' : nivel === 'riesgo' ? 'En riesgo' : 'Normal'}
                            </span>
                            {nivel === 'superado' && (
                                <button
                                    type="button"
                                    className="asis-btn asis-btn--icono"
                                    onClick={() => notificar([{ alumno: a, faltas }])}
                                    disabled={!!notificados[a.id]}
                                    title={notificados[a.id] ? 'Alerta enviada' : 'Enviar alerta'}
                                >
                                    {notificados[a.id] ? <IconoCheck size={15} /> : <IconoCampana size={15} />}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

// ═════════════════════════════════════════════════════════════
// SUBCOMPONENTES REUTILIZABLES (internos del módulo)
// ═════════════════════════════════════════════════════════════
function SelectorPildoras({ opciones, valor, onCambio, etiquetas = {} }) {
    return (
        <div className="asis-selector">
            {opciones.map((op) => (
                <button
                    key={op}
                    type="button"
                    className={`asis-selector__op ${valor === op ? 'asis-selector__op--activo' : ''}`}
                    onClick={() => onCambio(op)}
                >
                    {etiquetas[op] || op}
                </button>
            ))}
        </div>
    );
}

function Avatar({ texto, genero, pequeno = false }) {
    return (
        <span className={`asis-avatar ${esVaron(genero) ? 'asis-avatar--varon' : 'asis-avatar--hembra'} ${pequeno ? 'asis-avatar--pequeno' : ''}`}>
            {iniciales(texto)}
        </span>
    );
}

function FilaPersona({ titulo, genero, detalles, estado, onMarcar, deshabilitado, extra }) {
    return (
        <li className={`asis-fila ${estado === ESTADO.PRESENTE ? 'asis-fila--presente' : estado === ESTADO.AUSENTE ? 'asis-fila--ausente' : ''}`}>
            <Avatar texto={titulo} genero={genero} />
            <div className="asis-fila__info">
                <strong>{titulo}</strong>
                <div className="asis-fila__chips">
                    {detalles.map((d) => (
                        <span key={d.texto} className={`asis-chip asis-chip--${d.tipo}`}>{d.texto}</span>
                    ))}
                    <BadgeGenero genero={genero} />
                </div>
            </div>
            {extra}
            <div className="asis-toggle">
                <button
                    type="button"
                    className={`asis-toggle__btn asis-toggle__btn--presente ${estado === ESTADO.PRESENTE ? 'asis-toggle__btn--activo' : ''}`}
                    onClick={() => onMarcar(ESTADO.PRESENTE)}
                    disabled={deshabilitado}
                >
                    Presente
                </button>
                <button
                    type="button"
                    className={`asis-toggle__btn asis-toggle__btn--ausente ${estado === ESTADO.AUSENTE ? 'asis-toggle__btn--activo' : ''}`}
                    onClick={() => onMarcar(ESTADO.AUSENTE)}
                    disabled={deshabilitado}
                >
                    Ausente
                </button>
            </div>
        </li>
    );
}

function TablaVHT({ filas }) {
    return (
        <table className="asis-vht">
            <thead>
                <tr>
                    <th />
                    <th className="asis-vht__varon">V</th>
                    <th className="asis-vht__hembra">H</th>
                    <th>T</th>
                </tr>
            </thead>
            <tbody>
                {filas.map(({ etiqueta, datos, tipo }) => (
                    <tr key={etiqueta} className={`asis-vht__fila--${tipo}`}>
                        <td>{etiqueta}</td>
                        <td>{datos.v}</td>
                        <td>{datos.h}</td>
                        <td><strong>{datos.t}</strong></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function BadgeEstado({ estado }) {
    return estado === ESTADO.PRESENTE
        ? <span className="asis-chip asis-chip--verde">Presente</span>
        : <span className="asis-chip asis-chip--rojo">Ausente</span>;
}

function BadgeGenero({ genero }) {
    return esVaron(genero)
        ? <span className="asis-chip asis-chip--varon">Varón</span>
        : <span className="asis-chip asis-chip--hembra">Hembra</span>;
}

function Kpi({ valor, etiqueta, tipo = 'neutro' }) {
    return (
        <div className={`asis-kpi asis-kpi--${tipo}`}>
            <strong>{valor}</strong>
            <span>{etiqueta}</span>
        </div>
    );
}

function EstadoVacio({ texto, icono = <IconoInfo size={26} /> }) {
    return (
        <div className="asis-vacio">
            <div className="asis-vacio__icono">{icono}</div>
            <p>{texto}</p>
        </div>
    );
}

export default Asistencia;
