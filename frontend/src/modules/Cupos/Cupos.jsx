import { useState, useEffect, useRef } from 'react';
import {
    NIVELES,
    TURNOS,
    TODOS_LOS_GRADOS,
    GENEROS,
} from '../../constants/estructuraEscolar';
import { getAlumnos } from '../../data/mockAlumnos';
import { useNotificaciones } from '../../context/NotificacionesContext';
import {
    IconoCupos,
    IconoCandado,
    IconoEditar,
    IconoGuardar,
    IconoBuscar,
    IconoCheck,
    IconoAlerta,
    IconoSol,
    IconoLuna,
    IconoUsuario,
    IconoRestaurar,
} from '../../components/Iconos';
import './Cupos.css';

// ─── Constantes del Módulo ────────────────────────────────────────────────────
const CLAVE_STORAGE_CUPOS = 'atenea_config_cupos_v1';
const CAPACIDAD_POR_DEFECTO = 30;
const CAPACIDAD_MAXIMA_PERMITIDA = 60;
const UMBRAL_ALERTA_PORCENTAJE = 80;

/**
 * Genera la clave única de configuración para cada curso (Turno + Grado).
 */
function obtenerClaveCurso(turno, gradoId) {
    return `${turno}__${gradoId}`;
}

/**
 * Construye el mapa inicial de capacidades y bloqueos para los 9 grados en ambos turnos.
 */
function construirConfiguracionInicial() {
    const config = {};
    [TURNOS.MANANA, TURNOS.TARDE].forEach((turno) => {
        TODOS_LOS_GRADOS.forEach((grado) => {
            const clave = obtenerClaveCurso(turno, grado.id);
            config[clave] = {
                capacidad: CAPACIDAD_POR_DEFECTO,
                bloqueoManual: false,
                actualizadoEn: null,
            };
        });
    });
    return config;
}

/**
 * Lee la configuración de cupos desde localStorage (100% Offline).
 */
function cargarConfiguracionCupos() {
    const base = construirConfiguracionInicial();
    try {
        const guardado = localStorage.getItem(CLAVE_STORAGE_CUPOS);
        if (!guardado) return base;
        const parseado = JSON.parse(guardado);
        return { ...base, ...parseado };
    } catch {
        return base;
    }
}

/**
 * Persiste la configuración de cupos en localStorage.
 */
function guardarConfiguracionCupos(nuevaConfig) {
    try {
        localStorage.setItem(CLAVE_STORAGE_CUPOS, JSON.stringify(nuevaConfig));
    } catch {
        // Tolerante a fallos locales
    }
}

/**
 * Calcula Varones (V), Hembras (H) y Total (V + H) de una lista de alumnos.
 */
function contarVHT(listaAlumnos) {
    const varones = listaAlumnos.filter((a) => a.genero === GENEROS.VARON).length;
    const hembras = listaAlumnos.filter((a) => a.genero === GENEROS.HEMBRA).length;
    return { varones, hembras, total: varones + hembras };
}

/**
 * Determina el estado semántico del cupo de un curso.
 * Retorna: 'lleno' | 'bloqueado' | 'alerta' | 'disponible'
 */
function determinarEstadoCupo(ocupados, capacidad, bloqueoManual) {
    if (ocupados >= capacidad) {
        return 'lleno';
    }
    if (bloqueoManual) {
        return 'bloqueado';
    }
    const porcentaje = capacidad > 0 ? Math.round((ocupados / capacidad) * 100) : 0;
    if (porcentaje >= UMBRAL_ALERTA_PORCENTAJE) {
        return 'alerta';
    }
    return 'disponible';
}

// ─── Subcomponente: Tarjeta Individual de Curso ──────────────────────────────
function TarjetaCursoCupo({
    curso,
    onAbrirEdicion,
    onAlternarBloqueo,
    onVerInscritos,
    procesandoAccion,
}) {
    const {
        nombre,
        nivel,
        turno,
        capacidad,
        ocupados,
        disponibles,
        porcentaje,
        varones,
        hembras,
        estadoCupo,
        inscripcionBloqueada,
        bloqueoManual,
    } = curso;

    const etiquetaEstado = {
        lleno: 'CUPO LLENO',
        bloqueado: 'INSCRIPCIÓN CERRADA',
        alerta: 'POR AGOTARSE',
        disponible: 'DISPONIBLE',
    }[estadoCupo];

    return (
        <article
            className={`cupos-curso-card cupos-curso-card--${estadoCupo}`}
            aria-label={`Curso ${nombre} Turno ${turno}`}
        >
            {/* Cabecera de la tarjeta */}
            <div className="cupos-curso-card__header">
                <div className="cupos-curso-card__titulos">
                    <span className="cupos-curso-card__nivel-tag">{nivel}</span>
                    <h3 className="cupos-curso-card__nombre">{nombre}</h3>
                </div>

                <span className={`cupos-estado-badge cupos-estado-badge--${estadoCupo}`}>
                    {estadoCupo === 'lleno' || estadoCupo === 'bloqueado' ? (
                        <IconoCandado size={13} />
                    ) : estadoCupo === 'alerta' ? (
                        <IconoAlerta size={13} />
                    ) : (
                        <IconoCheck size={13} />
                    )}
                    <span>{etiquetaEstado}</span>
                </span>
            </div>

            {/* Tres métricas principales exigidas: Capacidad Total, Ocupados, Disponibles */}
            <div className="cupos-metricas-curso-grid">
                <div className="cupos-metrica-box">
                    <span className="cupos-metrica-box__lbl">CAPACIDAD</span>
                    <span className="cupos-metrica-box__val">{capacidad}</span>
                </div>
                <div className="cupos-metrica-box cupos-metrica-box--ocupados">
                    <span className="cupos-metrica-box__lbl">OCUPADOS</span>
                    <span className="cupos-metrica-box__val">{ocupados}</span>
                </div>
                <div
                    className={`cupos-metrica-box ${
                        disponibles === 0
                            ? 'cupos-metrica-box--agotado'
                            : estadoCupo === 'alerta'
                            ? 'cupos-metrica-box--alerta'
                            : 'cupos-metrica-box--disponibles'
                    }`}
                >
                    <span className="cupos-metrica-box__lbl">DISPONIBLES</span>
                    <span className="cupos-metrica-box__val">
                        {bloqueoManual && disponibles > 0 ? '0 (Cerrado)' : disponibles}
                    </span>
                </div>
            </div>

            {/* Barra de progreso de ocupación */}
            <div className="cupos-progreso-bloque">
                <div className="cupos-progreso-info">
                    <span className="cupos-progreso-texto">Ocupación del curso</span>
                    <span className={`cupos-progreso-pct cupos-progreso-pct--${estadoCupo}`}>
                        {porcentaje}% ({ocupados}/{capacidad})
                    </span>
                </div>
                <div
                    className="cupos-progreso-track"
                    role="progressbar"
                    aria-valuenow={ocupados}
                    aria-valuemin={0}
                    aria-valuemax={capacidad}
                >
                    <div
                        className={`cupos-progreso-fill cupos-progreso-fill--${estadoCupo}`}
                        style={{ width: `${Math.min(porcentaje, 100)}%` }}
                    />
                </div>
            </div>

            {/* Tabulación obligatoria: Varones (V), Hembras (H) y Total (V + H) */}
            <div className="cupos-vht-grid">
                <div className="cupos-vht-col">
                    <span className="cupos-vht-lbl">VARONES (V)</span>
                    <span className="cupos-vht-val cupos-vht-val--varon">{varones}</span>
                </div>
                <div className="cupos-vht-col">
                    <span className="cupos-vht-lbl">HEMBRAS (H)</span>
                    <span className="cupos-vht-val cupos-vht-val--hembra">{hembras}</span>
                </div>
                <div className="cupos-vht-col">
                    <span className="cupos-vht-lbl">TOTAL (V+H)</span>
                    <span className="cupos-vht-val cupos-vht-val--total">{ocupados}</span>
                </div>
            </div>

            {/* Indicador visual de Alerta de Cupo Lleno y Bloqueo de Inscripción */}
            {inscripcionBloqueada ? (
                <div className="cupos-alerta-bloqueo cupos-alerta-bloqueo--activa">
                    <IconoCandado size={15} />
                    <div className="cupos-alerta-bloqueo__texto">
                        <strong>Inscripción Bloqueada</strong>
                        <span>
                            {estadoCupo === 'lleno'
                                ? 'Cupo lleno alcanzado (0 vacantes disponibles).'
                                : 'Cerrada manualmente por Dirección.'}
                        </span>
                    </div>
                </div>
            ) : estadoCupo === 'alerta' ? (
                <div className="cupos-alerta-bloqueo cupos-alerta-bloqueo--preventiva">
                    <IconoAlerta size={15} />
                    <div className="cupos-alerta-bloqueo__texto">
                        <strong>Cupos por agotarse</strong>
                        <span>
                            Quedan solo {disponibles}{' '}
                            {disponibles === 1 ? 'vacante libre' : 'vacantes libres'}.
                        </span>
                    </div>
                </div>
            ) : (
                <div className="cupos-alerta-bloqueo cupos-alerta-bloqueo--abierta">
                    <IconoCheck size={15} />
                    <div className="cupos-alerta-bloqueo__texto">
                        <strong>Inscripción Habilitada</strong>
                        <span>
                            {disponibles} {disponibles === 1 ? 'cupo disponible' : 'cupos disponibles'} en turno{' '}
                            {turno.toLowerCase()}.
                        </span>
                    </div>
                </div>
            )}

            {/* Acciones de Gestión (Directora) */}
            <div className="cupos-curso-card__acciones">
                <button
                    type="button"
                    className="cupos-btn cupos-btn--primario"
                    onClick={() => onAbrirEdicion(curso)}
                    disabled={procesandoAccion}
                >
                    <IconoEditar size={16} />
                    <span>Editar Capacidad</span>
                </button>

                <button
                    type="button"
                    className={`cupos-btn ${
                        bloqueoManual ? 'cupos-btn--desbloquear' : 'cupos-btn--bloquear'
                    }`}
                    onClick={() => onAlternarBloqueo(curso)}
                    disabled={procesandoAccion || estadoCupo === 'lleno'}
                    title={
                        estadoCupo === 'lleno'
                            ? 'El curso está bloqueado automáticamente por tener el cupo lleno. Amplíe la capacidad para habilitar inscripciones.'
                            : bloqueoManual
                            ? 'Habilitar nuevamente las inscripciones en este curso'
                            : 'Bloquear manualmente nuevas inscripciones en este curso'
                    }
                >
                    <IconoCandado size={15} />
                    <span>
                        {estadoCupo === 'lleno'
                            ? 'Bloqueado (Lleno)'
                            : bloqueoManual
                            ? 'Desbloquear'
                            : 'Bloquear Cupo'}
                    </span>
                </button>

                <button
                    type="button"
                    className="cupos-btn cupos-btn--fantasma"
                    onClick={() => onVerInscritos(curso)}
                    disabled={procesandoAccion}
                    title="Ver alumnos inscritos en este curso"
                >
                    <IconoUsuario size={15} />
                    <span>Ver Inscritos ({ocupados})</span>
                </button>
            </div>
        </article>
    );
}

// ─── Componente Principal: Módulo de Gestión de Cupos ────────────────────────
function Cupos() {
    // ─── Contexto de Notificaciones ───
    let agregarNotificacion = null;
    try {
        const notif = useNotificaciones();
        agregarNotificacion = notif?.agregarNotificacion;
    } catch {
        // Soporte seguro si se renderiza fuera del provider
    }

    // ─── Estados de Datos ───
    const [alumnos, setAlumnos] = useState([]);
    const [configCupos, setConfigCupos] = useState(() => cargarConfiguracionCupos());

    // ─── Filtros de Visualización ───
    const [turnoActivo, setTurnoActivo] = useState(TURNOS.MANANA);
    const [filtroNivel, setFiltroNivel] = useState('TODOS'); // 'TODOS' | NIVELES.PREESCOLAR | NIVELES.PRIMARIA
    const [filtroEstado, setFiltroEstado] = useState('TODOS'); // 'TODOS' | 'disponible' | 'alerta' | 'critico'
    const [busquedaCurso, setBusquedaCurso] = useState('');

    // ─── Estado del Modal de Edición de Capacidad ───
    const [cursoEditando, setCursoEditando] = useState(null);
    const [capacidadInput, setCapacidadInput] = useState('');
    const [bloqueoModalInput, setBloqueoModalInput] = useState(false);
    const [errorValidacion, setErrorValidacion] = useState('');
    const [guardando, setGuardando] = useState(false);

    // ─── Estado del Modal de Alumnos Inscritos en el Curso ───
    const [cursoDetalleAlumnos, setCursoDetalleAlumnos] = useState(null);

    // ─── Feedback Visual y Prevención Síncrona de Doble Clic ───
    const [mensajeFeedback, setMensajeFeedback] = useState(null); // { tipo: 'exito' | 'alerta', texto: string }
    const procesandoRef = useRef(false);

    useEffect(() => {
        setAlumnos(getAlumnos());
    }, []);

    const mostrarFeedback = (tipo, texto) => {
        setMensajeFeedback({ tipo, texto });
        setTimeout(() => {
            setMensajeFeedback((prev) => (prev?.texto === texto ? null : prev));
        }, 4200);
    };

    // ─── Filtrar alumnos activos (excluyendo retirados) ───
    const alumnosActivos = alumnos.filter((a) => !a.estado || a.estado === 'Activo');

    // ─── Construir lista enriquecida de cursos para el Turno Activo ───
    const construirCursosPorTurno = (turno) => {
        const alumnosDelTurno = alumnosActivos.filter((a) => a.turno === turno);

        return TODOS_LOS_GRADOS.map((grado) => {
            const clave = obtenerClaveCurso(turno, grado.id);
            const cfg = configCupos[clave] || {
                capacidad: CAPACIDAD_POR_DEFECTO,
                bloqueoManual: false,
            };

            const alumnosCurso = alumnosDelTurno.filter((a) => a.gradoNivel === grado.nombre);
            const { varones, hembras, total: ocupados } = contarVHT(alumnosCurso);
            const capacidad = Number(cfg.capacidad) || CAPACIDAD_POR_DEFECTO;
            const disponibles = Math.max(0, capacidad - ocupados);
            const porcentaje =
                capacidad > 0 ? Math.round((ocupados / capacidad) * 100) : 0;
            const estadoCupo = determinarEstadoCupo(ocupados, capacidad, cfg.bloqueoManual);
            const inscripcionBloqueada = estadoCupo === 'lleno' || Boolean(cfg.bloqueoManual);

            return {
                ...grado,
                clave,
                turno,
                capacidad,
                ocupados,
                disponibles,
                porcentaje,
                varones,
                hembras,
                alumnosCurso,
                bloqueoManual: Boolean(cfg.bloqueoManual),
                estadoCupo,
                inscripcionBloqueada,
            };
        });
    };

    const cursosTurnoActivo = construirCursosPorTurno(turnoActivo);

    // ─── Métricas Globales del Turno Activo ───
    const resumenTurno = cursosTurnoActivo.reduce(
        (acc, c) => {
            acc.capacidadTotal += c.capacidad;
            acc.ocupadosTotal += c.ocupados;
            acc.disponiblesTotal += c.bloqueoManual ? 0 : c.disponibles;
            acc.varonesTotal += c.varones;
            acc.hembrasTotal += c.hembras;
            if (c.estadoCupo === 'lleno') acc.cursosLlenos += 1;
            if (c.inscripcionBloqueada) acc.cursosBloqueados += 1;
            if (c.estadoCupo === 'alerta') acc.cursosPorAgotarse += 1;
            return acc;
        },
        {
            capacidadTotal: 0,
            ocupadosTotal: 0,
            disponiblesTotal: 0,
            varonesTotal: 0,
            hembrasTotal: 0,
            cursosLlenos: 0,
            cursosBloqueados: 0,
            cursosPorAgotarse: 0,
        }
    );

    const porcentajeGlobalTurno =
        resumenTurno.capacidadTotal > 0
            ? Math.round((resumenTurno.ocupadosTotal / resumenTurno.capacidadTotal) * 100)
            : 0;

    // Cursos con alerta de cupo lleno o inscripción bloqueada en el turno activo
    const cursosConAlertaLleno = cursosTurnoActivo.filter(
        (c) => c.estadoCupo === 'lleno' || c.inscripcionBloqueada
    );

    // ─── Aplicar filtros de Nivel, Estado y Búsqueda ───
    const cursosFiltrados = cursosTurnoActivo.filter((curso) => {
        if (filtroNivel !== 'TODOS' && curso.nivel !== filtroNivel) {
            return false;
        }
        if (filtroEstado === 'disponible' && curso.estadoCupo !== 'disponible') {
            return false;
        }
        if (filtroEstado === 'alerta' && curso.estadoCupo !== 'alerta') {
            return false;
        }
        if (
            filtroEstado === 'critico' &&
            curso.estadoCupo !== 'lleno' &&
            !curso.inscripcionBloqueada
        ) {
            return false;
        }
        if (busquedaCurso.trim()) {
            const q = busquedaCurso.trim().toLowerCase();
            const coincideNombre = curso.nombre.toLowerCase().includes(q);
            const coincideNivel = curso.nivel.toLowerCase().includes(q);
            if (!coincideNombre && !coincideNivel) return false;
        }
        return true;
    });

    const cursosPreescolar = cursosFiltrados.filter((c) => c.nivel === NIVELES.PREESCOLAR);
    const cursosPrimaria = cursosFiltrados.filter((c) => c.nivel === NIVELES.PRIMARIA);

    // ─── Validación de Capacidad contra Inscritos ────────────────────────────
    const validarCapacidadContraInscritos = (valorStr, inscritosActuales) => {
        if (valorStr === '' || valorStr === null || valorStr === undefined) {
            return 'Debe ingresar un número de cupo máximo.';
        }
        const numero = Number(valorStr);
        if (!Number.isInteger(numero) || Number.isNaN(numero)) {
            return 'La capacidad debe ser un número entero válido.';
        }
        if (numero < inscritosActuales) {
            return `Validación contra inscritos: No se puede asignar una capacidad de ${numero} cupos porque ya ${
                inscritosActuales === 1 ? 'existe 1 alumno inscrito' : `existen ${inscritosActuales} alumnos inscritos`
            } en este curso.`;
        }
        if (numero < 1) {
            return 'La capacidad mínima de un curso debe ser de al menos 1 cupo.';
        }
        if (numero > CAPACIDAD_MAXIMA_PERMITIDA) {
            return `La capacidad máxima permitida por aula es de ${CAPACIDAD_MAXIMA_PERMITIDA} cupos.`;
        }
        return '';
    };

    // ─── Abrir Modal de Edición de Capacidad ─────────────────────────────────
    const abrirModalEdicion = (curso) => {
        if (procesandoRef.current) return;
        setCursoEditando(curso);
        setCapacidadInput(String(curso.capacidad));
        setBloqueoModalInput(Boolean(curso.bloqueoManual));
        setErrorValidacion('');
    };

    const cerrarModalEdicion = () => {
        if (guardando) return;
        setCursoEditando(null);
        setCapacidadInput('');
        setErrorValidacion('');
    };

    const cambiarCapacidadInput = (nuevoValorTexto) => {
        const limpio = String(nuevoValorTexto).replace(/\D/g, '').slice(0, 2);
        setCapacidadInput(limpio);
        if (cursoEditando) {
            const msgError = validarCapacidadContraInscritos(limpio, cursoEditando.ocupados);
            setErrorValidacion(msgError);
        }
    };

    const ajustarCapacidadDelta = (delta) => {
        if (!cursoEditando) return;
        const actual = Number(capacidadInput) || cursoEditando.capacidad;
        const propuesto = Math.min(CAPACIDAD_MAXIMA_PERMITIDA, Math.max(0, actual + delta));
        cambiarCapacidadInput(String(propuesto));
    };

    // ─── Guardar Edición de Capacidad (con bloqueo síncrono anti doble clic) ─
    const manejarGuardarCapacidad = (e) => {
        if (e) e.preventDefault();
        if (!cursoEditando || procesandoRef.current) return;

        const msgError = validarCapacidadContraInscritos(capacidadInput, cursoEditando.ocupados);
        if (msgError) {
            setErrorValidacion(msgError);
            return;
        }

        procesandoRef.current = true;
        setGuardando(true);

        try {
            const nuevaCapacidad = Number(capacidadInput);
            const clave = cursoEditando.clave;
            const quedaLleno = cursoEditando.ocupados >= nuevaCapacidad;

            const nuevaConfig = {
                ...configCupos,
                [clave]: {
                    capacidad: nuevaCapacidad,
                    bloqueoManual: quedaLleno ? true : bloqueoModalInput,
                    actualizadoEn: new Date().toISOString(),
                },
            };

            setConfigCupos(nuevaConfig);
            guardarConfiguracionCupos(nuevaConfig);

            if (quedaLleno) {
                mostrarFeedback(
                    'alerta',
                    `Alerta de Cupo Lleno: ${cursoEditando.nombre} (${cursoEditando.turno}) alcanzó el 100% (${cursoEditando.ocupados}/${nuevaCapacidad}). Inscripción bloqueada.`
                );
                if (agregarNotificacion) {
                    agregarNotificacion({
                        tipo: 'cupo',
                        titulo: `Cupo lleno en ${cursoEditando.nombre} (${cursoEditando.turno})`,
                        mensaje: `Se alcanzó el límite de ${nuevaCapacidad} cupos. Nuevas inscripciones bloqueadas.`,
                        ruta: '/cupos',
                    });
                }
            } else {
                mostrarFeedback(
                    'exito',
                    `Capacidad de ${cursoEditando.nombre} (Turno ${cursoEditando.turno}) actualizada a ${nuevaCapacidad} cupos.`
                );
            }

            setCursoEditando(null);
            setCapacidadInput('');
            setErrorValidacion('');
        } finally {
            procesandoRef.current = false;
            setGuardando(false);
        }
    };

    // ─── Alternar Bloqueo Manual de Inscripción ──────────────────────────────
    const manejarAlternarBloqueo = (curso) => {
        if (procesandoRef.current || curso.estadoCupo === 'lleno') return;
        procesandoRef.current = true;

        try {
            const nuevoBloqueo = !curso.bloqueoManual;
            const nuevaConfig = {
                ...configCupos,
                [curso.clave]: {
                    capacidad: curso.capacidad,
                    bloqueoManual: nuevoBloqueo,
                    actualizadoEn: new Date().toISOString(),
                },
            };

            setConfigCupos(nuevaConfig);
            guardarConfiguracionCupos(nuevaConfig);

            if (nuevoBloqueo) {
                mostrarFeedback(
                    'alerta',
                    `Inscripción bloqueada manualmente para ${curso.nombre} (Turno ${curso.turno}).`
                );
                if (agregarNotificacion) {
                    agregarNotificacion({
                        tipo: 'cupo',
                        titulo: `Inscripción cerrada: ${curso.nombre} (${curso.turno})`,
                        mensaje: `La Dirección bloqueó la asignación de nuevos cupos en este curso.`,
                        ruta: '/cupos',
                    });
                }
            } else {
                mostrarFeedback(
                    'exito',
                    `Inscripción habilitada nuevamente para ${curso.nombre} (Turno ${curso.turno}).`
                );
            }
        } finally {
            procesandoRef.current = false;
        }
    };

    // ─── Restablecer Capacidades del Turno al Estándar (30 cupos) ────────────
    const manejarRestablecerTurno = () => {
        if (procesandoRef.current) return;
        procesandoRef.current = true;

        try {
            const nuevaConfig = { ...configCupos };
            cursosTurnoActivo.forEach((c) => {
                nuevaConfig[c.clave] = {
                    capacidad: Math.max(CAPACIDAD_POR_DEFECTO, c.ocupados),
                    bloqueoManual: false,
                    actualizadoEn: new Date().toISOString(),
                };
            });

            setConfigCupos(nuevaConfig);
            guardarConfiguracionCupos(nuevaConfig);
            mostrarFeedback(
                'exito',
                `Capacidades del Turno ${turnoActivo} restablecidas a ${CAPACIDAD_POR_DEFECTO} cupos por curso y desbloqueadas.`
            );
        } finally {
            procesandoRef.current = false;
        }
    };

    // Cálculos de vista previa en vivo para el modal de edición
    const capacidadPreview = Number(capacidadInput) || 0;
    const disponiblesPreview = cursoEditando
        ? Math.max(0, capacidadPreview - cursoEditando.ocupados)
        : 0;
    const estadoPreview = cursoEditando
        ? determinarEstadoCupo(cursoEditando.ocupados, capacidadPreview, bloqueoModalInput)
        : 'disponible';

    return (
        <div className="cupos-modulo">
            {/* ═════════════════════════════════════════════════════════════════
                ENCABEZADO PRINCIPAL Y SELECTOR DE TURNO
            ══════════════════════════════════════════════════════════════════ */}
            <header className="cupos-header">
                <div className="cupos-header__info">
                    <div className="cupos-header__badge-rol">
                        <IconoCupos size={14} />
                        <span>GESTIÓN EXCLUSIVA DE DIRECCIÓN</span>
                    </div>
                    <h1 className="cupos-header__titulo">Gestión de Cupos y Capacidad Escolar</h1>
                    <p className="cupos-header__subtitulo">
                        U.E.M. Gregorio Romero — Control de vacantes por curso, edición de cupo máximo y bloqueo de inscripciones
                    </p>
                </div>

                <div className="cupos-header__controles">
                    {/* Selector de Turno estilo píldora */}
                    <div className="cupos-turno-pills" role="tablist" aria-label="Seleccionar turno">
                        <button
                            type="button"
                            role="tab"
                            aria-selected={turnoActivo === TURNOS.MANANA}
                            className={`cupos-turno-pill ${
                                turnoActivo === TURNOS.MANANA ? 'cupos-turno-pill--activo' : ''
                            }`}
                            onClick={() => setTurnoActivo(TURNOS.MANANA)}
                        >
                            <IconoSol size={16} />
                            <span>Turno Mañana</span>
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={turnoActivo === TURNOS.TARDE}
                            className={`cupos-turno-pill ${
                                turnoActivo === TURNOS.TARDE ? 'cupos-turno-pill--activo' : ''
                            }`}
                            onClick={() => setTurnoActivo(TURNOS.TARDE)}
                        >
                            <IconoLuna size={16} />
                            <span>Turno Tarde</span>
                        </button>
                    </div>

                    <button
                        type="button"
                        className="cupos-btn-restablecer"
                        onClick={manejarRestablecerTurno}
                        title="Restablecer todos los cursos del turno actual a 30 cupos"
                    >
                        <IconoRestaurar size={16} />
                        <span>Restablecer Turno (30)</span>
                    </button>
                </div>
            </header>

            {/* ─── Notificación / Feedback de acción reciente ─── */}
            {mensajeFeedback && (
                <div
                    className={`cupos-feedback-banner cupos-feedback-banner--${mensajeFeedback.tipo}`}
                    role="status"
                >
                    {mensajeFeedback.tipo === 'alerta' ? (
                        <IconoAlerta size={18} />
                    ) : (
                        <IconoCheck size={18} />
                    )}
                    <span>{mensajeFeedback.texto}</span>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════
                TARJETAS DE RESUMEN DEL TURNO (CAPACIDAD TOTAL, OCUPADOS, DISPONIBLES, ALERTAS)
            ══════════════════════════════════════════════════════════════════ */}
            <section className="cupos-kpis-grid" aria-label="Resumen de cupos del turno">
                {/* KPI 1: Capacidad Total */}
                <div className="cupos-kpi-card">
                    <div className="cupos-kpi-card__top">
                        <span className="cupos-kpi-card__label">CAPACIDAD TOTAL ({turnoActivo.toUpperCase()})</span>
                        <div className="cupos-kpi-card__icono cupos-kpi-card__icono--primario">
                            <IconoCupos size={18} />
                        </div>
                    </div>
                    <div className="cupos-kpi-card__valor">{resumenTurno.capacidadTotal}</div>
                    <span className="cupos-kpi-card__detalle">
                        Distribuida en {cursosTurnoActivo.length} cursos oficiales ({porcentajeGlobalTurno}% ocupación)
                    </span>
                </div>

                {/* KPI 2: Cupos Ocupados + Desglose V / H / T */}
                <div className="cupos-kpi-card">
                    <div className="cupos-kpi-card__top">
                        <span className="cupos-kpi-card__label">CUPOS OCUPADOS (INSCRITOS)</span>
                        <div className="cupos-kpi-card__icono cupos-kpi-card__icono--ocupados">
                            <IconoUsuario size={18} />
                        </div>
                    </div>
                    <div className="cupos-kpi-card__valor">{resumenTurno.ocupadosTotal}</div>
                    <div className="cupos-kpi-card__vht-pills">
                        <span className="cupos-mini-vht cupos-mini-vht--varon">
                            V: {resumenTurno.varonesTotal}
                        </span>
                        <span className="cupos-mini-vht cupos-mini-vht--hembra">
                            H: {resumenTurno.hembrasTotal}
                        </span>
                        <span className="cupos-mini-vht cupos-mini-vht--total">
                            T: {resumenTurno.ocupadosTotal}
                        </span>
                    </div>
                </div>

                {/* KPI 3: Cupos Disponibles */}
                <div className="cupos-kpi-card">
                    <div className="cupos-kpi-card__top">
                        <span className="cupos-kpi-card__label">CUPOS DISPONIBLES</span>
                        <div className="cupos-kpi-card__icono cupos-kpi-card__icono--verde">
                            <IconoCheck size={18} />
                        </div>
                    </div>
                    <div className="cupos-kpi-card__valor cupos-kpi-card__valor--verde">
                        {resumenTurno.disponiblesTotal}
                    </div>
                    <span className="cupos-kpi-card__detalle">
                        Vacantes habilitadas para inscripción en turno {turnoActivo.toLowerCase()}
                    </span>
                </div>

                {/* KPI 4: Alerta de Cupo Lleno / Bloqueados */}
                <div
                    className={`cupos-kpi-card ${
                        resumenTurno.cursosBloqueados > 0 ? 'cupos-kpi-card--alerta-roja' : ''
                    }`}
                >
                    <div className="cupos-kpi-card__top">
                        <span className="cupos-kpi-card__label">CUPO LLENO / BLOQUEADOS</span>
                        <div className="cupos-kpi-card__icono cupos-kpi-card__icono--rojo">
                            <IconoCandado size={18} />
                        </div>
                    </div>
                    <div
                        className={`cupos-kpi-card__valor ${
                            resumenTurno.cursosBloqueados > 0 ? 'cupos-kpi-card__valor--rojo' : ''
                        }`}
                    >
                        {resumenTurno.cursosBloqueados}
                    </div>
                    <span className="cupos-kpi-card__detalle">
                        {resumenTurno.cursosLlenos} por cupo lleno · {resumenTurno.cursosPorAgotarse} por agotarse
                    </span>
                </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════════
                BANNER DE ALERTA DE CUPO LLENO / BLOQUEO DE INSCRIPCIÓN
            ══════════════════════════════════════════════════════════════════ */}
            {cursosConAlertaLleno.length > 0 && (
                <section
                    className="cupos-alerta-global"
                    aria-label="Alertas de cupo lleno y bloqueo de inscripción"
                >
                    <div className="cupos-alerta-global__icono">
                        <IconoCandado size={20} />
                    </div>
                    <div className="cupos-alerta-global__contenido">
                        <h2 className="cupos-alerta-global__titulo">
                            Alerta de Cupo Lleno / Inscripción Bloqueada — Turno {turnoActivo}
                        </h2>
                        <p className="cupos-alerta-global__desc">
                            Los siguientes cursos no admiten nuevas inscripciones hasta que Dirección amplíe su capacidad máxima o desbloquee el cupo:
                        </p>
                        <div className="cupos-alerta-global__lista">
                            {cursosConAlertaLleno.map((c) => (
                                <span key={c.clave} className="cupos-alerta-global__tag">
                                    <IconoCandado size={12} />
                                    <strong>{c.nombre}</strong>
                                    <span>
                                        ({c.ocupados}/{c.capacidad} —{' '}
                                        {c.estadoCupo === 'lleno' ? 'Cupo Lleno' : 'Cerrado'})
                                    </span>
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═════════════════════════════════════════════════════════════════
                BARRA DE FILTROS (NIVEL, ESTADO SEMÁFORO Y BUSCADOR DE CURSO)
            ══════════════════════════════════════════════════════════════════ */}
            <section className="cupos-filtros-bar" aria-label="Filtros de cursos">
                <div className="cupos-filtros-grupo">
                    <span className="cupos-filtros-label">Nivel:</span>
                    <div className="cupos-pills-group">
                        <button
                            type="button"
                            className={`cupos-filter-pill ${
                                filtroNivel === 'TODOS' ? 'cupos-filter-pill--activo' : ''
                            }`}
                            onClick={() => setFiltroNivel('TODOS')}
                        >
                            Todos (9)
                        </button>
                        <button
                            type="button"
                            className={`cupos-filter-pill ${
                                filtroNivel === NIVELES.PREESCOLAR ? 'cupos-filter-pill--activo' : ''
                            }`}
                            onClick={() => setFiltroNivel(NIVELES.PREESCOLAR)}
                        >
                            Preescolar (3)
                        </button>
                        <button
                            type="button"
                            className={`cupos-filter-pill ${
                                filtroNivel === NIVELES.PRIMARIA ? 'cupos-filter-pill--activo' : ''
                            }`}
                            onClick={() => setFiltroNivel(NIVELES.PRIMARIA)}
                        >
                            Primaria (6)
                        </button>
                    </div>
                </div>

                <div className="cupos-filtros-grupo">
                    <span className="cupos-filtros-label">Estado:</span>
                    <div className="cupos-pills-group">
                        <button
                            type="button"
                            className={`cupos-filter-pill ${
                                filtroEstado === 'TODOS' ? 'cupos-filter-pill--activo' : ''
                            }`}
                            onClick={() => setFiltroEstado('TODOS')}
                        >
                            Todos
                        </button>
                        <button
                            type="button"
                            className={`cupos-filter-pill ${
                                filtroEstado === 'disponible' ? 'cupos-filter-pill--activo' : ''
                            }`}
                            onClick={() => setFiltroEstado('disponible')}
                        >
                            Disponibles
                        </button>
                        <button
                            type="button"
                            className={`cupos-filter-pill ${
                                filtroEstado === 'alerta' ? 'cupos-filter-pill--activo' : ''
                            }`}
                            onClick={() => setFiltroEstado('alerta')}
                        >
                            Por Agotarse
                        </button>
                        <button
                            type="button"
                            className={`cupos-filter-pill ${
                                filtroEstado === 'critico' ? 'cupos-filter-pill--activo' : ''
                            }`}
                            onClick={() => setFiltroEstado('critico')}
                        >
                            Llenos / Bloqueados ({resumenTurno.cursosBloqueados})
                        </button>
                    </div>
                </div>

                <div className="cupos-buscador-box">
                    <IconoBuscar size={16} className="cupos-buscador-icono" />
                    <input
                        type="text"
                        className="cupos-buscador-input"
                        placeholder="Buscar curso (ej. 1ra Sala, 3er Grado)..."
                        value={busquedaCurso}
                        onChange={(e) => setBusquedaCurso(e.target.value)}
                    />
                </div>
            </section>

            {/* ═════════════════════════════════════════════════════════════════
                VISTA DE CUPOS POR CURSO (AGRUPADA POR NIVEL ESCOLAR)
            ══════════════════════════════════════════════════════════════════ */}
            {cursosFiltrados.length === 0 ? (
                <div className="cupos-vacio-card">
                    <IconoCupos size={34} />
                    <h3>No hay cursos que coincidan con el filtro seleccionado</h3>
                    <p>Prueba cambiando el filtro de estado o limpiando la búsqueda.</p>
                    <button
                        type="button"
                        className="cupos-btn cupos-btn--primario"
                        onClick={() => {
                            setFiltroNivel('TODOS');
                            setFiltroEstado('TODOS');
                            setBusquedaCurso('');
                        }}
                    >
                        Mostrar todos los cursos
                    </button>
                </div>
            ) : (
                <div className="cupos-niveles-contenedor">
                    {/* ─── Bloque 1: Educación Inicial (Preescolar) ─── */}
                    {cursosPreescolar.length > 0 && (
                        <section className="cupos-nivel-seccion">
                            <div className="cupos-nivel-header">
                                <div className="cupos-nivel-header__izq">
                                    <span className="cupos-nivel-pill">EDUCACIÓN INICIAL — PREESCOLAR</span>
                                    <h2 className="cupos-nivel-titulo">
                                        Salas de Preescolar · Turno {turnoActivo}
                                    </h2>
                                </div>
                                <span className="cupos-nivel-contador">
                                    {cursosPreescolar.length}{' '}
                                    {cursosPreescolar.length === 1 ? 'curso' : 'cursos'}
                                </span>
                            </div>

                            <div className="cupos-cursos-grid">
                                {cursosPreescolar.map((curso) => (
                                    <TarjetaCursoCupo
                                        key={curso.clave}
                                        curso={curso}
                                        onAbrirEdicion={abrirModalEdicion}
                                        onAlternarBloqueo={manejarAlternarBloqueo}
                                        onVerInscritos={setCursoDetalleAlumnos}
                                        procesandoAccion={guardando}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ─── Bloque 2: Educación Primaria ─── */}
                    {cursosPrimaria.length > 0 && (
                        <section className="cupos-nivel-seccion">
                            <div className="cupos-nivel-header">
                                <div className="cupos-nivel-header__izq">
                                    <span className="cupos-nivel-pill">EDUCACIÓN PRIMARIA</span>
                                    <h2 className="cupos-nivel-titulo">
                                        1er a 6to Grado · Turno {turnoActivo}
                                    </h2>
                                </div>
                                <span className="cupos-nivel-contador">
                                    {cursosPrimaria.length}{' '}
                                    {cursosPrimaria.length === 1 ? 'curso' : 'cursos'}
                                </span>
                            </div>

                            <div className="cupos-cursos-grid">
                                {cursosPrimaria.map((curso) => (
                                    <TarjetaCursoCupo
                                        key={curso.clave}
                                        curso={curso}
                                        onAbrirEdicion={abrirModalEdicion}
                                        onAlternarBloqueo={manejarAlternarBloqueo}
                                        onVerInscritos={setCursoDetalleAlumnos}
                                        procesandoAccion={guardando}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════
                MODAL 1: EDICIÓN DE CAPACIDAD (CON VALIDACIÓN CONTRA INSCRITOS)
            ══════════════════════════════════════════════════════════════════ */}
            {cursoEditando && (
                <div
                    className="cupos-modal-overlay"
                    onClick={cerrarModalEdicion}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-editar-cupo-titulo"
                >
                    <div
                        className="cupos-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="cupos-modal-header">
                            <div>
                                <span className="cupos-modal-tag">
                                    {cursoEditando.nivel} · Turno {cursoEditando.turno}
                                </span>
                                <h2 id="modal-editar-cupo-titulo" className="cupos-modal-titulo">
                                    Editar Capacidad — {cursoEditando.nombre}
                                </h2>
                            </div>
                            <button
                                type="button"
                                className="cupos-modal-cerrar"
                                onClick={cerrarModalEdicion}
                                aria-label="Cerrar modal"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={manejarGuardarCapacidad} className="cupos-modal-form">
                            {/* Resumen actual de alumnos inscritos contra los que se valida */}
                            <div className="cupos-modal-inscritos-box">
                                <div className="cupos-modal-inscritos-box__info">
                                    <span className="cupos-modal-inscritos-box__lbl">
                                        Alumnos inscritos actualmente (Mínimo requerido)
                                    </span>
                                    <strong className="cupos-modal-inscritos-box__num">
                                        {cursoEditando.ocupados}{' '}
                                        {cursoEditando.ocupados === 1 ? 'alumno' : 'alumnos'}
                                    </strong>
                                </div>
                                <div className="cupos-modal-inscritos-box__vht">
                                    <span className="cupos-mini-vht cupos-mini-vht--varon">
                                        Varones (V): {cursoEditando.varones}
                                    </span>
                                    <span className="cupos-mini-vht cupos-mini-vht--hembra">
                                        Hembras (H): {cursoEditando.hembras}
                                    </span>
                                </div>
                            </div>

                            {/* Input de Cupo Máximo + Botones de Ajuste Rápido */}
                            <div className="cupos-modal-campo">
                                <label htmlFor="input-cupo-maximo" className="cupos-modal-label">
                                    Ajustar Cupo Máximo (Capacidad Total del Curso)
                                </label>
                                <div className="cupos-modal-stepper">
                                    <button
                                        type="button"
                                        className="cupos-stepper-btn"
                                        onClick={() => ajustarCapacidadDelta(-5)}
                                        disabled={guardando}
                                    >
                                        -5
                                    </button>
                                    <button
                                        type="button"
                                        className="cupos-stepper-btn"
                                        onClick={() => ajustarCapacidadDelta(-1)}
                                        disabled={guardando}
                                    >
                                        -1
                                    </button>
                                    <input
                                        id="input-cupo-maximo"
                                        type="text"
                                        inputMode="numeric"
                                        className={`cupos-modal-input ${
                                            errorValidacion ? 'cupos-modal-input--error' : ''
                                        }`}
                                        value={capacidadInput}
                                        onChange={(e) => cambiarCapacidadInput(e.target.value)}
                                        disabled={guardando}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="cupos-stepper-btn"
                                        onClick={() => ajustarCapacidadDelta(1)}
                                        disabled={guardando}
                                    >
                                        +1
                                    </button>
                                    <button
                                        type="button"
                                        className="cupos-stepper-btn"
                                        onClick={() => ajustarCapacidadDelta(5)}
                                        disabled={guardando}
                                    >
                                        +5
                                    </button>
                                </div>

                                {/* Atajos rápidos de capacidad */}
                                <div className="cupos-modal-presets">
                                    <button
                                        type="button"
                                        className="cupos-preset-chip"
                                        onClick={() =>
                                            cambiarCapacidadInput(
                                                String(Math.max(1, cursoEditando.ocupados))
                                            )
                                        }
                                    >
                                        Igualar a inscritos ({Math.max(1, cursoEditando.ocupados)}) — Cupo Lleno
                                    </button>
                                    {[20, 25, 30, 35].map((val) => (
                                        <button
                                            key={val}
                                            type="button"
                                            className="cupos-preset-chip"
                                            onClick={() => cambiarCapacidadInput(String(val))}
                                        >
                                            {val} cupos
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Mensaje de Error de Validación contra Inscritos */}
                            {errorValidacion && (
                                <div className="cupos-modal-error" role="alert">
                                    <IconoAlerta size={18} />
                                    <span>{errorValidacion}</span>
                                </div>
                            )}

                            {/* Vista previa en vivo del resultado */}
                            {!errorValidacion && capacidadPreview > 0 && (
                                <div
                                    className={`cupos-modal-preview cupos-modal-preview--${estadoPreview}`}
                                >
                                    <div className="cupos-modal-preview__fila">
                                        <span>Capacidad resultante:</span>
                                        <strong>{capacidadPreview} cupos</strong>
                                    </div>
                                    <div className="cupos-modal-preview__fila">
                                        <span>Ocupados actuales:</span>
                                        <strong>{cursoEditando.ocupados} inscritos</strong>
                                    </div>
                                    <div className="cupos-modal-preview__fila">
                                        <span>Vacantes disponibles:</span>
                                        <strong>{disponiblesPreview} disponibles</strong>
                                    </div>
                                    <div className="cupos-modal-preview__fila">
                                        <span>Estado de inscripción:</span>
                                        <strong>
                                            {estadoPreview === 'lleno'
                                                ? 'CUPO LLENO (Inscripción Bloqueada)'
                                                : estadoPreview === 'bloqueado'
                                                ? 'CERRADA POR DIRECCIÓN'
                                                : estadoPreview === 'alerta'
                                                ? 'POR AGOTARSE (Habilitada)'
                                                : 'DISPONIBLE (Habilitada)'}
                                        </strong>
                                    </div>
                                </div>
                            )}

                            {/* Switch de Bloqueo Manual de Inscripción */}
                            <label className="cupos-modal-switch-row">
                                <input
                                    type="checkbox"
                                    checked={
                                        estadoPreview === 'lleno' ? true : bloqueoModalInput
                                    }
                                    disabled={guardando || estadoPreview === 'lleno'}
                                    onChange={(e) => setBloqueoModalInput(e.target.checked)}
                                />
                                <div className="cupos-modal-switch-texto">
                                    <strong>Bloquear nuevas inscripciones en este curso</strong>
                                    <span>
                                        {estadoPreview === 'lleno'
                                            ? 'Activado automáticamente al alcanzar el 100% del cupo máximo.'
                                            : 'Impide registrar nuevos alumnos aunque existan vacantes disponibles.'}
                                    </span>
                                </div>
                            </label>

                            <div className="cupos-modal-acciones">
                                <button
                                    type="button"
                                    className="cupos-btn cupos-btn--fantasma"
                                    onClick={cerrarModalEdicion}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="cupos-btn cupos-btn--guardar"
                                    disabled={guardando || Boolean(errorValidacion)}
                                >
                                    <IconoGuardar size={17} />
                                    <span>{guardando ? 'Guardando...' : 'Guardar Capacidad'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ═════════════════════════════════════════════════════════════════
                MODAL 2: LISTA DE ALUMNOS INSCRITOS EN EL CURSO
            ══════════════════════════════════════════════════════════════════ */}
            {cursoDetalleAlumnos && (
                <div
                    className="cupos-modal-overlay"
                    onClick={() => setCursoDetalleAlumnos(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-inscritos-titulo"
                >
                    <div
                        className="cupos-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="cupos-modal-header">
                            <div>
                                <span className="cupos-modal-tag">
                                    {cursoDetalleAlumnos.nivel} · Turno {cursoDetalleAlumnos.turno}
                                </span>
                                <h2 id="modal-inscritos-titulo" className="cupos-modal-titulo">
                                    Alumnos Inscritos — {cursoDetalleAlumnos.nombre}
                                </h2>
                            </div>
                            <button
                                type="button"
                                className="cupos-modal-cerrar"
                                onClick={() => setCursoDetalleAlumnos(null)}
                                aria-label="Cerrar modal"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="cupos-modal-inscritos-resumen">
                            <span>
                                Ocupados: <strong>{cursoDetalleAlumnos.ocupados}</strong> /{' '}
                                {cursoDetalleAlumnos.capacidad}
                            </span>
                            <div className="cupos-modal-inscritos-box__vht">
                                <span className="cupos-mini-vht cupos-mini-vht--varon">
                                    V: {cursoDetalleAlumnos.varones}
                                </span>
                                <span className="cupos-mini-vht cupos-mini-vht--hembra">
                                    H: {cursoDetalleAlumnos.hembras}
                                </span>
                                <span className="cupos-mini-vht cupos-mini-vht--total">
                                    Total: {cursoDetalleAlumnos.ocupados}
                                </span>
                            </div>
                        </div>

                        {cursoDetalleAlumnos.alumnosCurso.length === 0 ? (
                            <div className="cupos-lista-alumnos-vacia">
                                <p>No hay alumnos inscritos actualmente en este curso y turno.</p>
                            </div>
                        ) : (
                            <div className="cupos-lista-alumnos">
                                {cursoDetalleAlumnos.alumnosCurso.map((alumno) => (
                                    <div key={alumno.id} className="cupos-alumno-fila">
                                        <div className="cupos-alumno-fila__info">
                                            <strong>
                                                {alumno.apellidos}, {alumno.nombres}
                                            </strong>
                                            <span>
                                                C.E: {alumno.cedulaEscolar} · Sección &quot;
                                                {alumno.seccionLiteral || 'A'}&quot;
                                            </span>
                                        </div>
                                        <span
                                            className={`cupos-mini-vht ${
                                                alumno.genero === GENEROS.HEMBRA
                                                    ? 'cupos-mini-vht--hembra'
                                                    : 'cupos-mini-vht--varon'
                                            }`}
                                        >
                                            {alumno.genero}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="cupos-modal-acciones">
                            <button
                                type="button"
                                className="cupos-btn cupos-btn--primario"
                                onClick={() => setCursoDetalleAlumnos(null)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cupos;
