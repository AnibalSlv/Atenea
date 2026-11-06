import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TODOS_LOS_GRADOS, TURNOS, GENEROS } from '../../constants/estructuraEscolar';
import { getAlumnos } from '../../data/mockAlumnos';
import {
    IconoEscudo,
    IconoUsuario,
    IconoCalendario,
    IconoSol,
    IconoLuna,
} from '../../components/Iconos';
import './Dashboard.css';

// Nombres de grados por nivel para clasificar alumnos
const NOMBRES_PREESCOLAR = TODOS_LOS_GRADOS.filter((g) => g.nivel === 'Preescolar').map((g) => g.nombre);
const NOMBRES_PRIMARIA = TODOS_LOS_GRADOS.filter((g) => g.nivel === 'Primaria').map((g) => g.nombre);

const IconoFiltro = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

/**
 * Calcula V, H y T de un subconjunto de alumnos.
 */
function contarVHT(listaAlumnos) {
    const varones = listaAlumnos.filter((a) => a.genero === GENEROS.VARON).length;
    const hembras = listaAlumnos.filter((a) => a.genero === GENEROS.HEMBRA).length;
    return { varones, hembras, total: varones + hembras };
}

function formatearFechaHoy() {
    const ahora = new Date();
    const opciones = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const texto = ahora.toLocaleDateString('es-VE', opciones);
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function Dashboard() {
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [alumnos, setAlumnos] = useState([]);
    const [turnoActivoCupos, setTurnoActivoCupos] = useState(TURNOS.MANANA);
    const [turnoActivoControl, setTurnoActivoControl] = useState(TURNOS.MANANA);

    useEffect(() => {
        setAlumnos(getAlumnos());
    }, []);

    // ─── Métricas Generales de Matrícula ─────────────────────────
    const matriculaGlobal = contarVHT(alumnos);

    // ─── Desglose por Turno y Nivel (Control de Turnos) ──────────
    const alumnosManana = alumnos.filter((a) => a.turno === TURNOS.MANANA);
    const alumnosTarde = alumnos.filter((a) => a.turno === TURNOS.TARDE);

    const inicialManana = contarVHT(alumnosManana.filter((a) => NOMBRES_PREESCOLAR.includes(a.gradoNivel)));
    const primariaManana = contarVHT(alumnosManana.filter((a) => NOMBRES_PRIMARIA.includes(a.gradoNivel)));
    const inicialTarde = contarVHT(alumnosTarde.filter((a) => NOMBRES_PREESCOLAR.includes(a.gradoNivel)));
    const primariaTarde = contarVHT(alumnosTarde.filter((a) => NOMBRES_PRIMARIA.includes(a.gradoNivel)));

    // ─── Datos para Barras de Cupos ──────────────────────────────
    const alumnosTurnoGrafico = alumnos.filter((a) => a.turno === turnoActivoCupos);

    const generarDatosNivel = (gradosNivel) => {
        return gradosNivel.map((grado) => {
            const totalGrado = alumnosTurnoGrafico.filter((a) => a.gradoNivel === grado.nombre).length;
            const capacidadGrado = 30;
            const porcentaje = totalGrado > 0 ? Math.min(Math.round((totalGrado / capacidadGrado) * 100), 100) : 0;
            return { ...grado, inscritos: totalGrado, capacidad: capacidadGrado, porcentaje };
        });
    };

    const cuposPreescolar = generarDatosNivel(TODOS_LOS_GRADOS.filter((g) => g.nivel === 'Preescolar'));
    const cuposPrimaria = generarDatosNivel(TODOS_LOS_GRADOS.filter((g) => g.nivel === 'Primaria'));

    // Cálculo porcentaje para la barra segmentada de matrícula
    const pctVarones = matriculaGlobal.total > 0 ? (matriculaGlobal.varones / matriculaGlobal.total) * 100 : 0;
    const pctHembras = matriculaGlobal.total > 0 ? (matriculaGlobal.hembras / matriculaGlobal.total) * 100 : 0;

    // Circunferencia del Donut de Asistencia (r = 26 -> 2 * PI * 26 ≈ 163.36)
    const RADIO_DONUT = 26;
    const CIRCUNFERENCIA_DONUT = 2 * Math.PI * RADIO_DONUT;

    return (
        <div className="dashboard-contenedor">
            {/* ═════════════════════════════════════════════════════════════════
                BANNER SUPERIOR AZUL
            ══════════════════════════════════════════════════════════════════ */}
            <header className="dashboard-top-banner">
                <div className="dashboard-banner-izq">
                    <div className="dashboard-banner-escudo" aria-hidden="true">
                        <IconoEscudo size={24} />
                    </div>
                    <div className="dashboard-banner-titulos">
                        <span className="dashboard-banner-institucion">U.E.M. GREGORIO ROMERO</span>
                        <h1 className="dashboard-banner-saludo">
                            ¡Hola, {usuario?.nombre || 'admin'}!
                        </h1>
                    </div>
                </div>

                <div className="dashboard-banner-der">
                    {/* Fecha Diaria Actual del Sistema */}
                    <div className="dashboard-banner-fecha-pill" title="Fecha del sistema">
                        <IconoCalendario size={16} />
                        <span>{formatearFechaHoy()}</span>
                    </div>
                </div>
            </header>

            {/* ═════════════════════════════════════════════════════════════════
                GRID PRINCIPAL DE DOS COLUMNAS
            ══════════════════════════════════════════════════════════════════ */}
            <div className="dashboard-grid-2col">
                {/* ─────────────────────────────────────────────────────────────
                    COLUMNA IZQUIERDA (~340px)
                ────────────────────────────────────────────────────────────── */}
                <aside className="dashboard-col-izq">
                    {/* ── Tarjeta: Matrícula Estudiantil ── */}
                    <section className="dashboard-card card-matricula">
                        <div className="dashboard-card-header">
                            <div className="matricula-icono-wrapper" aria-hidden="true">
                                <IconoUsuario size={18} />
                            </div>
                            <div className="dashboard-card-header-titulos">
                                <h2 className="dashboard-card-titulo">Matrícula Estudiantil</h2>
                                <p className="dashboard-card-subtitulo">Distribución por Género</p>
                            </div>
                        </div>

                        {/* Barra Segmentada */}
                        <div className="matricula-barra-segmentada" role="progressbar" aria-valuenow={matriculaGlobal.total} aria-valuemin="0">
                            <div
                                className="matricula-segmento-varones"
                                style={{ width: `${pctVarones}%` }}
                                title={`Varones: ${matriculaGlobal.varones}`}
                            />
                            <div
                                className="matricula-segmento-hembras"
                                style={{ width: `${pctHembras}%` }}
                                title={`Hembras: ${matriculaGlobal.hembras}`}
                            />
                        </div>

                        {/* Lista de Totales */}
                        <div className="matricula-items-lista">
                            <div className="matricula-item-fila">
                                <div className="matricula-item-label-grp">
                                    <span className="matricula-punto punto-varon" aria-hidden="true">●</span>
                                    <span className="matricula-item-nombre">Varones</span>
                                </div>
                                <span className="matricula-item-num">{matriculaGlobal.varones}</span>
                            </div>

                            <div className="matricula-item-fila">
                                <div className="matricula-item-label-grp">
                                    <span className="matricula-punto punto-hembra" aria-hidden="true">●</span>
                                    <span className="matricula-item-nombre">Hembras</span>
                                </div>
                                <span className="matricula-item-num">{matriculaGlobal.hembras}</span>
                            </div>

                            <hr className="matricula-divisor" />

                            <div className="matricula-item-fila matricula-item-fila--total">
                                <span className="matricula-total-label">Total</span>
                                <span className="matricula-total-num">{matriculaGlobal.total}</span>
                            </div>
                        </div>
                    </section>

                    {/* ── Tarjeta: Control de Turnos ── */}
                    <section className="dashboard-card card-control-turnos">
                        <div className="dashboard-card-header">
                            <div className="dashboard-card-header-titulos">
                                <h2 className="dashboard-card-titulo">Control de Turnos</h2>
                                <p className="dashboard-card-subtitulo">Desglose general por turno</p>
                            </div>

                            <div className="dashboard-selector-pills">
                                <button
                                    type="button"
                                    className={`dashboard-pill ${turnoActivoControl === TURNOS.MANANA ? 'dashboard-pill--activo' : ''}`}
                                    onClick={() => setTurnoActivoControl(TURNOS.MANANA)}
                                >
                                    Mañana
                                </button>
                                <button
                                    type="button"
                                    className={`dashboard-pill ${turnoActivoControl === TURNOS.TARDE ? 'dashboard-pill--activo' : ''}`}
                                    onClick={() => setTurnoActivoControl(TURNOS.TARDE)}
                                >
                                    Tarde
                                </button>
                            </div>
                        </div>

                        <div className="control-turnos-cuerpo">
                            <div className="control-turno-seccion">
                                <div className="control-turno-subencabezado">
                                    {turnoActivoControl === TURNOS.MANANA ? (
                                        <IconoSol size={18} className="icono-sol-header" />
                                    ) : (
                                        <IconoLuna size={18} className="icono-luna-header" />
                                    )}
                                    <h3 className="control-turno-nombre">Turno {turnoActivoControl}</h3>
                                </div>

                                {/* Educación Inicial */}
                                <div className="control-nivel-bloque">
                                    <span className="control-nivel-tag">EDUCACIÓN INICIAL</span>
                                    <div className="control-vht-grid">
                                        <div className="control-vht-col">
                                            <span className="control-vht-lbl">VARONES</span>
                                            <span className="control-vht-val control-vht-val--varon">
                                                {turnoActivoControl === TURNOS.MANANA ? inicialManana.varones : inicialTarde.varones}
                                            </span>
                                        </div>
                                        <div className="control-vht-col">
                                            <span className="control-vht-lbl">HEMBRAS</span>
                                            <span className="control-vht-val control-vht-val--hembra">
                                                {turnoActivoControl === TURNOS.MANANA ? inicialManana.hembras : inicialTarde.hembras}
                                            </span>
                                        </div>
                                        <div className="control-vht-col">
                                            <span className="control-vht-lbl">TOTAL</span>
                                            <span className="control-vht-val control-vht-val--total">
                                                {turnoActivoControl === TURNOS.MANANA ? inicialManana.total : inicialTarde.total}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Educación Primaria */}
                                <div className="control-nivel-bloque">
                                    <span className="control-nivel-tag">EDUCACIÓN PRIMARIA</span>
                                    <div className="control-vht-grid">
                                        <div className="control-vht-col">
                                            <span className="control-vht-lbl">VARONES</span>
                                            <span className="control-vht-val control-vht-val--varon">
                                                {turnoActivoControl === TURNOS.MANANA ? primariaManana.varones : primariaTarde.varones}
                                            </span>
                                        </div>
                                        <div className="control-vht-col">
                                            <span className="control-vht-lbl">HEMBRAS</span>
                                            <span className="control-vht-val control-vht-val--hembra">
                                                {turnoActivoControl === TURNOS.MANANA ? primariaManana.hembras : primariaTarde.hembras}
                                            </span>
                                        </div>
                                        <div className="control-vht-col">
                                            <span className="control-vht-lbl">TOTAL</span>
                                            <span className="control-vht-val control-vht-val--total">
                                                {turnoActivoControl === TURNOS.MANANA ? primariaManana.total : primariaTarde.total}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </aside>

                {/* ─────────────────────────────────────────────────────────────
                    COLUMNA DERECHA (Flex 1)
                ────────────────────────────────────────────────────────────── */}
                <main className="dashboard-col-der">
                    {/* ── Tarjeta: Asistencia del Día ── */}
                    <section className="dashboard-card card-asistencia-general">
                        <div className="dashboard-card-header">
                            <div className="dashboard-card-header-titulos">
                                <h2 className="dashboard-card-titulo">Asistencia del Día</h2>
                                <p className="dashboard-card-subtitulo">Registro general por turno</p>
                            </div>
                            <button
                                type="button"
                                className="dashboard-btn-filtro"
                                onClick={() => navigate('/asistencia')}
                            >
                                <span>Ver Asistencias</span>
                                <IconoFiltro />
                            </button>
                        </div>

                        <div className="asistencia-turnos-h-grid">
                            {/* Subcard Turno Mañana */}
                            <div className="asistencia-turno-card-h">
                                <div className="asistencia-donut-h">
                                    <svg className="asistencia-donut-svg" viewBox="0 0 64 64">
                                        <circle cx="32" cy="32" r={RADIO_DONUT} stroke="#edf2f7" strokeWidth="5.5" fill="transparent" />
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r={RADIO_DONUT}
                                            stroke="var(--color-sidebar)"
                                            strokeWidth="5.5"
                                            fill="transparent"
                                            strokeDasharray={CIRCUNFERENCIA_DONUT}
                                            strokeDashoffset={CIRCUNFERENCIA_DONUT}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="asistencia-donut-pct">0%</span>
                                </div>

                                <div className="asistencia-turno-detalles">
                                    <div className="asistencia-turno-fila-titulo">
                                        <h3 className="asistencia-nombre-turno">{TURNOS.MANANA}</h3>
                                        <span className="asistencia-badge-pendiente">PENDIENTE</span>
                                    </div>
                                    <p className="asistencia-matriculados-txt">
                                        0 presentes de {alumnosManana.length} matriculados
                                    </p>
                                    <span className="asistencia-niveles-txt">Educación Inicial y Primaria</span>
                                </div>
                            </div>

                            {/* Subcard Turno Tarde */}
                            <div className="asistencia-turno-card-h">
                                <div className="asistencia-donut-h">
                                    <svg className="asistencia-donut-svg" viewBox="0 0 64 64">
                                        <circle cx="32" cy="32" r={RADIO_DONUT} stroke="#edf2f7" strokeWidth="5.5" fill="transparent" />
                                        <circle
                                            cx="32"
                                            cy="32"
                                            r={RADIO_DONUT}
                                            stroke="var(--color-sidebar)"
                                            strokeWidth="5.5"
                                            fill="transparent"
                                            strokeDasharray={CIRCUNFERENCIA_DONUT}
                                            strokeDashoffset={CIRCUNFERENCIA_DONUT}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <span className="asistencia-donut-pct">0%</span>
                                </div>

                                <div className="asistencia-turno-detalles">
                                    <div className="asistencia-turno-fila-titulo">
                                        <h3 className="asistencia-nombre-turno">{TURNOS.TARDE}</h3>
                                        <span className="asistencia-badge-pendiente">PENDIENTE</span>
                                    </div>
                                    <p className="asistencia-matriculados-txt">
                                        0 presentes de {alumnosTarde.length} matriculados
                                    </p>
                                    <span className="asistencia-niveles-txt">Educación Inicial y Primaria</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Tarjeta: Ocupación de Cupos ── */}
                    <section className="dashboard-card card-cupos-modulo">
                        <div className="dashboard-card-header">
                            <div className="dashboard-card-header-titulos">
                                <h2 className="dashboard-card-titulo">Ocupación de Cupos</h2>
                                <p className="dashboard-card-subtitulo">Desglose general por sección</p>
                            </div>

                            <div className="dashboard-selector-pills">
                                <button
                                    type="button"
                                    className={`dashboard-pill ${turnoActivoCupos === TURNOS.MANANA ? 'dashboard-pill--activo' : ''}`}
                                    onClick={() => setTurnoActivoCupos(TURNOS.MANANA)}
                                >
                                    Mañana
                                </button>
                                <button
                                    type="button"
                                    className={`dashboard-pill ${turnoActivoCupos === TURNOS.TARDE ? 'dashboard-pill--activo' : ''}`}
                                    onClick={() => setTurnoActivoCupos(TURNOS.TARDE)}
                                >
                                    Tarde
                                </button>
                            </div>
                        </div>

                        {/* Bloques de niveles lado a lado en dos columnas */}
                        <div className="cupos-dos-columnas">
                            {/* Columna Izquierda: Educación Inicial */}
                            <div className="cupos-columna-nivel">
                                <span className="cupos-badge-nivel">EDUCACIÓN INICIAL</span>
                                <div className="cupos-lista-barras">
                                    {cuposPreescolar.map((item) => (
                                        <div key={item.id} className="cupos-item-barra">
                                            <div className="cupos-item-info">
                                                <span className="cupos-item-nombre">{item.nombre}</span>
                                                <span className="cupos-item-valor">{item.porcentaje}% ({item.inscritos}/{item.capacidad})</span>
                                            </div>
                                            <div className="cupos-track-barra">
                                                <div
                                                    className={`cupos-fill-barra ${item.porcentaje >= 90 ? 'cupos-fill-barra--lleno' : item.porcentaje >= 70 ? 'cupos-fill-barra--alerta' : ''}`}
                                                    style={{ width: `${item.porcentaje}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Columna Derecha: Educación Primaria */}
                            <div className="cupos-columna-nivel">
                                <span className="cupos-badge-nivel">EDUCACIÓN PRIMARIA</span>
                                <div className="cupos-lista-barras">
                                    {cuposPrimaria.map((item) => (
                                        <div key={item.id} className="cupos-item-barra">
                                            <div className="cupos-item-info">
                                                <span className="cupos-item-nombre">{item.nombre}</span>
                                                <span className="cupos-item-valor">{item.porcentaje}% ({item.inscritos}/{item.capacidad})</span>
                                            </div>
                                            <div className="cupos-track-barra">
                                                <div
                                                    className={`cupos-fill-barra cupos-fill-primaria ${item.porcentaje >= 90 ? 'cupos-fill-barra--lleno' : item.porcentaje >= 70 ? 'cupos-fill-barra--alerta' : ''}`}
                                                    style={{ width: `${item.porcentaje}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Dashboard;
