import { useState, useEffect } from 'react';
import { TODOS_LOS_GRADOS, TURNOS } from '../../constants/estructuraEscolar';
import { getAlumnos } from '../../data/mockAlumnos';
import './Dashboard.css';

// Iconos SVG limpios
const IconoEscudo = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const IconoFiltro = ({ size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

function Dashboard() {
    const [alumnos, setAlumnos] = useState([]);

    // Cargar alumnos desde la base local al montar el componente
    useEffect(() => {
        setAlumnos(getAlumnos());
    }, []);

    // Listas auxiliares en estado inicial limpio
    const docentesGuardia = [];
    const avisosTareas = [];

    // Cálculo dinámico de métricas de matrícula
    const alumnosActivos = alumnos.filter((a) => !a.estado || a.estado === 'Activo');
    const totalAlumnos = alumnosActivos.length;
    const capacidadTotalPlantel = 540; // Capacidad estimada (9 grados x 60 alumnos)
    const ocupacionPorcentaje = totalAlumnos > 0 ? Math.round((totalAlumnos / capacidadTotalPlantel) * 100) : 0;

    // Métricas por turno
    const alumnosManana = alumnosActivos.filter((a) => a.turno === TURNOS.MANANA);
    const alumnosTarde = alumnosActivos.filter((a) => a.turno === TURNOS.TARDE);

    return (
        <div className="dashboard-layout">
            {/* ─────────────────────────────────────────────────────────────
                COLUMNA PRINCIPAL (IZQUIERDA)
            ────────────────────────────────────────────────────────────── */}
            <main className="dashboard-main">
                {/* Banner de Bienvenida */}
                <section className="banner-bienvenida">
                    <div className="banner-bienvenida__info">
                        <h1 className="banner-bienvenida__saludo">¡Hola, admin!</h1>
                        <p className="banner-bienvenida__desc">
                            Supervisión escolar de Preescolar y Primaria. El sistema registra{' '}
                            <strong>{totalAlumnos} alumnos matriculados</strong> entre ambos turnos con un{' '}
                            <strong>{ocupacionPorcentaje}% de capacidad ocupada</strong>.
                        </p>
                    </div>
                    <div className="banner-bienvenida__ilustracion">
                        <IconoEscudo size={52} />
                    </div>
                </section>

                {/* Fila Media: Ocupación de Cupos (Barras) y Asistencia (Donuts) */}
                <div className="metricas-fila">
                    {/* Tarjeta de Ocupación de Cupos */}
                    <div className="card-blanca barras-container">
                        <div className="card-header">
                            <h2 className="card-titulo">Ocupación de Cupos</h2>
                            <button type="button" className="card-pill-btn">
                                <span>Cupos</span>
                                <IconoFiltro />
                            </button>
                        </div>

                        <div className="barras-meta">
                            <h3 className="barras-score">{ocupacionPorcentaje}%</h3>
                            <p className="barras-subscore">
                                Preescolar (1ra a 3ra Sala) y Primaria (1º a 6º)
                            </p>
                        </div>

                        <div className="barras-grafico">
                            {TODOS_LOS_GRADOS.map((grado) => {
                                const totalGrado = alumnos.filter((a) => a.gradoNivel === grado.nombre).length;
                                const pctGrado = totalGrado > 0 ? Math.min(Math.round((totalGrado / 60) * 100), 100) : 0;

                                return (
                                    <div key={grado.id} className="barra-col">
                                        <span className="barra-val">{pctGrado}%</span>
                                        <div className="barra-track">
                                            <div className="barra-fill" style={{ height: `${pctGrado}%` }}></div>
                                        </div>
                                        <span className="barra-lbl">{grado.nombre}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tarjeta de Asistencia del Día (Donuts) */}
                    <div className="card-blanca">
                        <div className="card-header">
                            <h2 className="card-titulo">Asistencia del Día</h2>
                            <button type="button" className="card-pill-btn">
                                <span>Asistencia</span>
                                <IconoFiltro />
                            </button>
                        </div>

                        <div className="donuts-grid">
                            {[
                                { label: 'Preescolar Mañana', id: 'pm' },
                                { label: 'Primaria Mañana', id: 'prm' },
                                { label: 'Preescolar Tarde', id: 'pt' },
                                { label: 'Primaria Tarde', id: 'prt' },
                            ].map((item) => (
                                <div key={item.id} className="donut-item">
                                    <div className="donut-svg-wrapper">
                                        <svg className="donut-svg" width="76" height="76">
                                            <circle cx="38" cy="38" r="30" stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                                            <circle
                                                cx="38"
                                                cy="38"
                                                r="30"
                                                stroke="var(--color-sidebar)"
                                                strokeWidth="6"
                                                fill="transparent"
                                                strokeDasharray="188.4"
                                                strokeDashoffset="188.4"
                                            />
                                        </svg>
                                        <span className="donut-pct-text">0%</span>
                                    </div>
                                    <span className="donut-lbl">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Docentes de Guardia */}
                <section className="seccion-docentes">
                    <div className="card-header" style={{ marginBottom: '0.8rem' }}>
                        <h2 className="card-titulo">Docentes de Guardia Hoy</h2>
                    </div>

                    {docentesGuardia.length > 0 ? (
                        <div className="docentes-lista">
                            {/* Se renderizará dinámicamente cuando existan datos */}
                        </div>
                    ) : (
                        <div className="panel-vacio">
                            <p>No hay docentes asignados a la guardia el día de hoy.</p>
                        </div>
                    )}
                </section>
            </main>

            {/* ─────────────────────────────────────────────────────────────
                COLUMNA LATERAL DERECHA
            ────────────────────────────────────────────────────────────── */}
            <aside className="dashboard-sidebar-derecho">
                {/* Control de Turnos */}
                <section className="calendar-panel">
                    <div className="card-header">
                        <h2 className="card-titulo">Control de Turnos</h2>
                    </div>

                    <div className="turnos-lista-derecha">
                        {/* Turno Mañana */}
                        <div className="turno-card-box">
                            <div className="turno-card-box__header">
                                <div>
                                    <h3 className="turno-card-box__titulo">{TURNOS.MANANA}</h3>
                                    <p className="turno-card-box__sub">Preescolar y Primaria</p>
                                </div>
                                <span className="turno-badge-estado badge-estado--pendiente">Pendiente</span>
                            </div>

                            <div className="turno-card-box__barra">
                                <div className="turno-card-box__relleno" style={{ width: '0%' }}></div>
                            </div>

                            <div className="turno-card-box__metricas">
                                <div className="turno-card-box__col">
                                    <span className="turno-lbl">Varones</span>
                                    <span className="turno-val turno-val--varon">0</span>
                                </div>
                                <div className="turno-card-box__col">
                                    <span className="turno-lbl">Hembras</span>
                                    <span className="turno-val turno-val--hembra">0</span>
                                </div>
                                <div className="turno-card-box__col">
                                    <span className="turno-lbl">Total</span>
                                    <span className="turno-val turno-val--total">{alumnosManana.length}</span>
                                </div>
                            </div>
                        </div>

                        {/* Turno Tarde */}
                        <div className="turno-card-box">
                            <div className="turno-card-box__header">
                                <div>
                                    <h3 className="turno-card-box__titulo">{TURNOS.TARDE}</h3>
                                    <p className="turno-card-box__sub">Preescolar y Primaria</p>
                                </div>
                                <span className="turno-badge-estado badge-estado--pendiente">Pendiente</span>
                            </div>

                            <div className="turno-card-box__barra">
                                <div className="turno-card-box__relleno" style={{ width: '0%' }}></div>
                            </div>

                            <div className="turno-card-box__metricas">
                                <div className="turno-card-box__col">
                                    <span className="turno-lbl">Varones</span>
                                    <span className="turno-val turno-val--varon">0</span>
                                </div>
                                <div className="turno-card-box__col">
                                    <span className="turno-lbl">Hembras</span>
                                    <span className="turno-val turno-val--hembra">0</span>
                                </div>
                                <div className="turno-card-box__col">
                                    <span className="turno-lbl">Total</span>
                                    <span className="turno-val turno-val--total">{alumnosTarde.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Avisos y Tareas */}
                <section className="upcoming-panel">
                    <div className="card-header">
                        <h2 className="card-titulo">Avisos y Tareas</h2>
                    </div>

                    {avisosTareas.length > 0 ? (
                        <div className="upcoming-lista">
                            {/* Lista dinámica */}
                        </div>
                    ) : (
                        <div className="panel-vacio">
                            <p>No hay avisos ni tareas pendientes actualmente.</p>
                        </div>
                    )}
                </section>
            </aside>
        </div>
    );
}

export default Dashboard;