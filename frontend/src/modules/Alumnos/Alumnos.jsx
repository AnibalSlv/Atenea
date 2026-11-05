import { useState, useEffect } from 'react';
import { TODOS_LOS_GRADOS, TURNOS } from '../../constants/estructuraEscolar';
import { IconoEditar, IconoGuardar, IconoVolver } from '../../components/Iconos';
import { getAlumnos, actualizarAlumnoCompleto } from '../../data/mockAlumnos';
import './Alumnos.css';

function Alumnos() {
    // Vista actual: 'lista' | 'expediente'
    const [vistaActual, setVistaActual] = useState('lista');

    // Estado de Filtros de Selección
    const [filtroTurno, setFiltroTurno] = useState('TODOS');
    const [filtroGrado, setFiltroGrado] = useState('TODOS');
    const [filtroSeccion, setFiltroSeccion] = useState('TODOS');
    const [busquedaTexto, setBusquedaTexto] = useState('');

    // Estado de Alumnos (Inicialmente vacío)
    const [alumnos, setAlumnos] = useState([]);

    // Cargar alumnos desde el almacenamiento local al abrir la pantalla
    useEffect(() => {
        setAlumnos(getAlumnos());
    }, []);

    // Estado de Alumno Seleccionado para el Expediente
    const [datos, setDatos] = useState(null);
    const [seccionActiva, setSeccionActiva] = useState('todas');
    const [modoEdicion, setModoEdicion] = useState(false);
    const [guardando, setGuardando] = useState(false);

    // Filtrar la lista de alumnos según los criterios seleccionados
    const alumnosFiltrados = alumnos.filter((alumno) => {
        const cumpleTurno = filtroTurno === 'TODOS' || alumno.turno === filtroTurno;
        const cumpleGrado = filtroGrado === 'TODOS' || alumno.gradoNivel === filtroGrado;
        const cumpleSeccion = filtroSeccion === 'TODOS' || alumno.seccionLiteral === filtroSeccion;

        const texto = busquedaTexto.toLowerCase();
        const cumpleTexto =
            busquedaTexto === '' ||
            (alumno.nombres && alumno.nombres.toLowerCase().includes(texto)) ||
            (alumno.apellidos && alumno.apellidos.toLowerCase().includes(texto)) ||
            (alumno.cedulaEscolar && alumno.cedulaEscolar.toLowerCase().includes(texto));

        return cumpleTurno && cumpleGrado && cumpleSeccion && cumpleTexto;
    });

    const abrirExpediente = (alumno) => {
        setDatos(alumno);
        setModoEdicion(false);
        setSeccionActiva('todas');
        setVistaActual('expediente');
    };

    const volverALista = () => {
        setVistaActual('lista');
        setModoEdicion(false);
    };

    const manejarCambio = (campo, valor) => {
        if (!modoEdicion) return;
        setDatos((prev) => ({ ...prev, [campo]: valor }));
    };

    const handleGuardar = () => {
        setGuardando(true);
        setTimeout(() => {
            // 1. Guardar en el almacenamiento local para que persista al cerrar el programa
            actualizarAlumnoCompleto(datos);

            // 2. Actualizar la vista en pantalla
            setAlumnos((prev) => prev.map((a) => (a.id === datos.id ? datos : a)));
            setGuardando(false);
            setModoEdicion(false);
        }, 600);
    };

    return (
        <div className="alumnos-modulo">
            {/* ─────────────────────────────────────────────────────────────
                VISTA 1: LISTA CON FILTROS Y BÚSQUEDA
            ────────────────────────────────────────────────────────────── */}
            {vistaActual === 'lista' && (
                <>
                    <header className="alumnos-header">
                        <div>
                            <h1 className="alumnos-header__titulo">Consulta de Alumnos</h1>
                            <p className="alumnos-header__sub">
                                Seleccione turno, grado o sección para filtrar el expediente escolar
                            </p>
                        </div>
                        <div className="alumnos-header__badge">
                            <span>{alumnosFiltrados.length} Alumnos Encontrados</span>
                        </div>
                    </header>

                    {/* Barra de Filtros Prioritaria */}
                    <div className="alumnos-filtros-bar">
                        <div className="filtro-item">
                            <label className="campo-label">Turno</label>
                            <select
                                className="campo-select"
                                value={filtroTurno}
                                onChange={(e) => setFiltroTurno(e.target.value)}
                            >
                                <option value="TODOS">Todos los Turnos</option>
                                <option value={TURNOS.MANANA}>{TURNOS.MANANA}</option>
                                <option value={TURNOS.TARDE}>{TURNOS.TARDE}</option>
                            </select>
                        </div>

                        <div className="filtro-item">
                            <label className="campo-label">Grado / Nivel</label>
                            <select
                                className="campo-select"
                                value={filtroGrado}
                                onChange={(e) => setFiltroGrado(e.target.value)}
                            >
                                <option value="TODOS">Todos los Grados</option>
                                {TODOS_LOS_GRADOS.map((g) => (
                                    <option key={g.id} value={g.nombre}>
                                        {g.nivel}: {g.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filtro-item">
                            <label className="campo-label">Sección</label>
                            <select
                                className="campo-select"
                                value={filtroSeccion}
                                onChange={(e) => setFiltroSeccion(e.target.value)}
                            >
                                <option value="TODOS">Todas las Secciones</option>
                                <option value="A">Sección A</option>
                                <option value="B">Sección B</option>
                                <option value="C">Sección C</option>
                            </select>
                        </div>

                        <div className="filtro-item filtro-item--busqueda">
                            <label className="campo-label">Buscar por Nombre o Cédula</label>
                            <input
                                type="text"
                                className="campo-input"
                                placeholder="Ej: 13100111 o Carlos Gómez..."
                                value={busquedaTexto}
                                onChange={(e) => setBusquedaTexto(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Grilla de Resultados */}
                    {alumnosFiltrados.length > 0 ? (
                        <div className="alumnos-grid-cards">
                            {alumnosFiltrados.map((alumno) => (
                                <div
                                    key={alumno.id}
                                    className="alumno-card-item"
                                    onClick={() => abrirExpediente(alumno)}
                                >
                                    <div className="alumno-card-avatar">
                                        {alumno.nombres ? alumno.nombres.charAt(0) : ''}
                                        {alumno.apellidos ? alumno.apellidos.charAt(0) : ''}
                                    </div>
                                    <div className="alumno-card-info">
                                        <h3 className="alumno-card-nombre">
                                            {alumno.apellidos}, {alumno.nombres}
                                        </h3>
                                        <span className="alumno-card-cedula">{alumno.cedulaEscolar}</span>
                                        <div className="alumno-card-tags">
                                            <span className="tag-grado">{alumno.gradoNivel} "{alumno.seccionLiteral}"</span>
                                            <span className="tag-turno">{alumno.turno}</span>
                                            {alumno.estado === 'Retirado' && (
                                                <span style={{ backgroundColor: 'var(--color-rojo-fondo)', color: 'var(--color-rojo)', border: '1px solid rgba(230, 57, 70, 0.3)', padding: '3px 8px', borderRadius: 'var(--radio-pequeno)', fontSize: '0.75rem', fontWeight: 800 }}>
                                                    Retirado
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="alumnos-vacio">
                            <p>No hay alumnos registrados en el sistema actualmente.</p>
                        </div>
                    )}
                </>
            )}

            {/* ─────────────────────────────────────────────────────────────
                VISTA 2: EXPEDIENTE DETALLADO DEL ALUMNO SELECCIONADO
            ────────────────────────────────────────────────────────────── */}
            {vistaActual === 'expediente' && datos && (
                <>
                    <header className="alumnos-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <button
                                type="button"
                                className="alumnos-tab-btn"
                                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                onClick={volverALista}
                            >
                                <IconoVolver size={16} />
                                <span>Volver a la Lista</span>
                            </button>
                            <div>
                                <h1 className="alumnos-header__titulo">
                                    {datos.apellidos}, {datos.nombres}
                                </h1>
                                <p className="alumnos-header__sub">
                                    {datos.cedulaEscolar} — {datos.gradoNivel} "{datos.seccionLiteral}" ({datos.turno})
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {!modoEdicion ? (
                                <>
                                    <div className="alumnos-header__badge">
                                        <span>Modo Consulta</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="alumnos-tab-btn alumnos-tab-btn--activo"
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                        onClick={() => setModoEdicion(true)}
                                    >
                                        <IconoEditar size={15} />
                                        <span>Editar Datos</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="alumnos-tab-btn"
                                        onClick={() => setModoEdicion(false)}
                                        disabled={guardando}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="alumnos-tab-btn"
                                        style={{
                                            backgroundColor: 'var(--color-verde)',
                                            borderColor: 'var(--color-verde)',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                        onClick={handleGuardar}
                                        disabled={guardando}
                                    >
                                        <IconoGuardar size={15} />
                                        <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </header>

                    <div className="alumnos-tabs">
                        <button
                            className={`alumnos-tab-btn ${seccionActiva === 'todas' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionActiva('todas')}
                        >
                            Ver Todo
                        </button>
                        <button
                            className={`alumnos-tab-btn ${seccionActiva === 'personales' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionActiva('personales')}
                        >
                            1. Datos Personales
                        </button>
                        <button
                            className={`alumnos-tab-btn ${seccionActiva === 'especiales' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionActiva('especiales')}
                        >
                            2. Necesidades Especiales
                        </button>
                        <button
                            className={`alumnos-tab-btn ${seccionActiva === 'padres' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionActiva('padres')}
                        >
                            3. Madre y Comunidad
                        </button>
                        <button
                            className={`alumnos-tab-btn ${seccionActiva === 'representante' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionActiva('representante')}
                        >
                            4. Representante Legal
                        </button>
                        <button
                            className={`alumnos-tab-btn ${seccionActiva === 'vivienda' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionActiva('vivienda')}
                        >
                            5. Vivienda y Familia
                        </button>
                        <button
                            className={`alumnos-tab-btn ${seccionActiva === 'servicios' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionActiva('servicios')}
                        >
                            6. Servicios Sanitarios
                        </button>
                    </div>

                    <div className="alumnos-card">
                        {/* BLOQUE 1: DATOS PERSONALES */}
                        {(seccionActiva === 'todas' || seccionActiva === 'personales') && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">1</span>
                                    <h2 className="seccion-titulo-texto">Datos Personales y Médicos del Alumno</h2>
                                </div>

                                <div className="form-grid-4">
                                    <div className="campo-grupo">
                                        <label className="campo-label">Cédula Escolar</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.cedulaEscolar || ''}
                                            onChange={(e) => manejarCambio('cedulaEscolar', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Apellidos</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.apellidos || ''}
                                            onChange={(e) => manejarCambio('apellidos', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Nombres</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.nombres || ''}
                                            onChange={(e) => manejarCambio('nombres', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Lugar de Nacimiento</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.lugarNacimiento || ''}
                                            onChange={(e) => manejarCambio('lugarNacimiento', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.fechaNacimiento || ''}
                                            onChange={(e) => manejarCambio('fechaNacimiento', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Edad (Años)</label>
                                        <input
                                            type="number"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.edad || ''}
                                            onChange={(e) => manejarCambio('edad', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Nacionalidad</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.nacionalidad || ''}
                                            onChange={(e) => manejarCambio('nacionalidad', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Grado o Nivel</label>
                                        <select
                                            className="campo-select"
                                            disabled={!modoEdicion}
                                            value={datos.gradoNivel || ''}
                                            onChange={(e) => manejarCambio('gradoNivel', e.target.value)}
                                        >
                                            {TODOS_LOS_GRADOS.map((g) => (
                                                <option key={g.id} value={g.nombre}>
                                                    {g.nivel}: {g.nombre}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Turno</label>
                                        <select
                                            className="campo-select"
                                            disabled={!modoEdicion}
                                            value={datos.turno || ''}
                                            onChange={(e) => manejarCambio('turno', e.target.value)}
                                        >
                                            <option value={TURNOS.MANANA}>{TURNOS.MANANA}</option>
                                            <option value={TURNOS.TARDE}>{TURNOS.TARDE}</option>
                                        </select>
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Sección Literal</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            maxLength={2}
                                            disabled={!modoEdicion}
                                            value={datos.seccionLiteral || ''}
                                            onChange={(e) => manejarCambio('seccionLiteral', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Lateralidad / Mano</label>
                                        <div className="pills-sino-container">
                                            <button
                                                type="button"
                                                disabled={!modoEdicion}
                                                className={`pill-sino-btn ${datos.lateralidad === 'Derecho' ? 'pill-sino-btn--activo' : ''}`}
                                                onClick={() => manejarCambio('lateralidad', 'Derecho')}
                                            >
                                                Derecho
                                            </button>
                                            <button
                                                type="button"
                                                disabled={!modoEdicion}
                                                className={`pill-sino-btn ${datos.lateralidad === 'Izquierdo' ? 'pill-sino-btn--activo' : ''}`}
                                                onClick={() => manejarCambio('lateralidad', 'Izquierdo')}
                                            >
                                                Izquierdo
                                            </button>
                                        </div>
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Institución de donde Proviene</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.institucionOrigen || ''}
                                            onChange={(e) => manejarCambio('institucionOrigen', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">En caso de fiebre suministrar:</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.medicamentoFiebre || ''}
                                            onChange={(e) => manejarCambio('medicamentoFiebre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Alérgico a:</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.alergias || ''}
                                            onChange={(e) => manejarCambio('alergias', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* BLOQUE 2: NECESIDADES ESPECIALES */}
                        {(seccionActiva === 'todas' || seccionActiva === 'especiales') && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">2</span>
                                    <h2 className="seccion-titulo-texto">Diagnóstico o Necesidades Especiales</h2>
                                </div>

                                <div className="form-grid-4">
                                    <div className="campo-grupo" style={{ gridColumn: 'span 2' }}>
                                        <label className="campo-label">Diagnóstico Médico (si aplica)</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.diagnosticoEspecial || ''}
                                            onChange={(e) => manejarCambio('diagnosticoEspecial', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Médico Tratante</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.medicoTratante || ''}
                                            onChange={(e) => manejarCambio('medicoTratante', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Teléfono del Médico</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.telefonoMedico || ''}
                                            onChange={(e) => manejarCambio('telefonoMedico', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo" style={{ gridColumn: 'span 4' }}>
                                        <label className="campo-label">Equipo de Apoyo al que Asiste</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.equipoApoyo || ''}
                                            onChange={(e) => manejarCambio('equipoApoyo', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* BLOQUE 3: MADRE Y COMUNIDAD */}
                        {(seccionActiva === 'todas' || seccionActiva === 'padres') && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">3</span>
                                    <h2 className="seccion-titulo-texto">Datos de la Madre y Entorno Comunitario</h2>
                                </div>

                                <div className="form-grid-4">
                                    <div className="campo-grupo">
                                        <label className="campo-label">Nombre de la Madre</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.nombreMadre || ''}
                                            onChange={(e) => manejarCambio('nombreMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Cédula de Identidad (Madre)</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.ciMadre || ''}
                                            onChange={(e) => manejarCambio('ciMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Nivel de Instrucción</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.instruccionMadre || ''}
                                            onChange={(e) => manejarCambio('instruccionMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Ocupación</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.ocupacionMadre || ''}
                                            onChange={(e) => manejarCambio('ocupacionMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Lugar de Trabajo</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.lugarTrabajoMadre || ''}
                                            onChange={(e) => manejarCambio('lugarTrabajoMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Dirección de Trabajo</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.direccionTrabajoMadre || ''}
                                            onChange={(e) => manejarCambio('direccionTrabajoMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Teléfono</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.telefonoMadre || ''}
                                            onChange={(e) => manejarCambio('telefonoMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.correoMadre || ''}
                                            onChange={(e) => manejarCambio('correoMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Líder de Calle</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.liderCalle || ''}
                                            onChange={(e) => manejarCambio('liderCalle', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Nombre de la Comuna</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.nombreComuna || ''}
                                            onChange={(e) => manejarCambio('nombreComuna', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Dirección de Residencia</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.direccionResidencia || ''}
                                            onChange={(e) => manejarCambio('direccionResidencia', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">¿Dónde Vota?</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.centroVotacion || ''}
                                            onChange={(e) => manejarCambio('centroVotacion', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* BLOQUE 4: REPRESENTANTE LEGAL */}
                        {(seccionActiva === 'todas' || seccionActiva === 'representante') && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">4</span>
                                    <h2 className="seccion-titulo-texto">Datos del Representante Legal</h2>
                                </div>

                                <div className="form-grid-3">
                                    <div className="campo-grupo">
                                        <label className="campo-label">Nombre y Apellido</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.nombreRepresentante || ''}
                                            onChange={(e) => manejarCambio('nombreRepresentante', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Cédula de Identidad (CI)</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.ciRepresentante || ''}
                                            onChange={(e) => manejarCambio('ciRepresentante', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Ocupación</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.ocupacionRepresentante || ''}
                                            onChange={(e) => manejarCambio('ocupacionRepresentante', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Dirección</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.direccionRepresentante || ''}
                                            onChange={(e) => manejarCambio('direccionRepresentante', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Teléfono de Contacto</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.telefonoRepresentante || ''}
                                            onChange={(e) => manejarCambio('telefonoRepresentante', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            className="campo-input"
                                            disabled={!modoEdicion}
                                            value={datos.correoRepresentante || ''}
                                            onChange={(e) => manejarCambio('correoRepresentante', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* BLOQUE 5: PAREJA Y VIVIENDA */}
                        {(seccionActiva === 'todas' || seccionActiva === 'vivienda') && (
                            <>
                                <section className="seccion-bloque">
                                    <div className="seccion-titulo-barra">
                                        <span className="seccion-numero-badge">5</span>
                                        <h2 className="seccion-titulo-texto">Situación de la Pareja</h2>
                                    </div>

                                    <div className="form-grid-4">
                                        <div className="campo-grupo" style={{ gridColumn: 'span 2' }}>
                                            <label className="campo-label">Estado Conyugal</label>
                                            <div className="pills-sino-container">
                                                {['Soltero', 'Casado', 'Concubino', 'Divorciados'].map((opc) => (
                                                    <button
                                                        key={opc}
                                                        type="button"
                                                        disabled={!modoEdicion}
                                                        className={`pill-sino-btn ${datos.situacionPareja === opc ? 'pill-sino-btn--activo' : ''}`}
                                                        onClick={() => manejarCambio('situacionPareja', opc)}
                                                    >
                                                        {opc}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="seccion-bloque">
                                    <div className="seccion-titulo-barra">
                                        <span className="seccion-numero-badge">6</span>
                                        <h2 className="seccion-titulo-texto">Condición de la Vivienda y Habitantes</h2>
                                    </div>

                                    <div className="form-grid-4">
                                        <div className="campo-grupo">
                                            <label className="campo-label">Condición de la Casa</label>
                                            <select
                                                className="campo-select"
                                                disabled={!modoEdicion}
                                                value={datos.tipoVivienda || ''}
                                                onChange={(e) => manejarCambio('tipoVivienda', e.target.value)}
                                            >
                                                <option value="Propia">Propia</option>
                                                <option value="Alquilada">Alquilada</option>
                                                <option value="Otros">Otros</option>
                                            </select>
                                        </div>

                                        <div className="campo-grupo">
                                            <label className="campo-label">Número de Cuartos</label>
                                            <input
                                                type="number"
                                                className="campo-input"
                                                disabled={!modoEdicion}
                                                value={datos.cuartosVivienda || ''}
                                                onChange={(e) => manejarCambio('cuartosVivienda', e.target.value)}
                                            />
                                        </div>

                                        <div className="campo-grupo">
                                            <label className="campo-label">Material de Paredes</label>
                                            <select
                                                className="campo-select"
                                                disabled={!modoEdicion}
                                                value={datos.materialParedes || ''}
                                                onChange={(e) => manejarCambio('materialParedes', e.target.value)}
                                            >
                                                <option value="Concreto">Concreto</option>
                                                <option value="Madera">Madera</option>
                                                <option value="Adobe">Adobe</option>
                                                <option value="Otros">Otros</option>
                                            </select>
                                        </div>

                                        <div className="campo-grupo">
                                            <label className="campo-label">Material del Techo</label>
                                            <select
                                                className="campo-select"
                                                disabled={!modoEdicion}
                                                value={datos.materialTecho || ''}
                                                onChange={(e) => manejarCambio('materialTecho', e.target.value)}
                                            >
                                                <option value="Zinc">Zinc</option>
                                                <option value="Platabanda / Concreto">Platabanda / Concreto</option>
                                                <option value="Madera">Madera</option>
                                                <option value="Adobe">Adobe</option>
                                                <option value="Otros">Otros</option>
                                            </select>
                                        </div>

                                        <div className="campo-grupo">
                                            <label className="campo-label">Personas en la Vivienda</label>
                                            <input
                                                type="number"
                                                className="campo-input"
                                                disabled={!modoEdicion}
                                                value={datos.cantidadPersonasVivienda || ''}
                                                onChange={(e) => manejarCambio('cantidadPersonasVivienda', e.target.value)}
                                            />
                                        </div>

                                        <div className="campo-grupo">
                                            <label className="campo-label">Familias en la Vivienda</label>
                                            <input
                                                type="number"
                                                className="campo-input"
                                                disabled={!modoEdicion}
                                                value={datos.familiasEnVivienda || ''}
                                                onChange={(e) => manejarCambio('familiasEnVivienda', e.target.value)}
                                            />
                                        </div>

                                        <div className="campo-grupo">
                                            <label className="campo-label">Número de Hermanos</label>
                                            <input
                                                type="number"
                                                className="campo-input"
                                                disabled={!modoEdicion}
                                                value={datos.numeroHermanos || ''}
                                                onChange={(e) => manejarCambio('numeroHermanos', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}

                        {/* BLOQUE 6: SERVICIOS Y SANIDAD */}
                        {(seccionActiva === 'todas' || seccionActiva === 'servicios') && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">7</span>
                                    <h2 className="seccion-titulo-texto">Servicios Básicos y Condiciones Sanitarias</h2>
                                </div>

                                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-sidebar)', margin: '0 0 0.8rem' }}>
                                    Servicios Básicos en Vivienda
                                </h3>
                                <div className="grid-condiciones-sanitarias" style={{ marginBottom: '1.5rem' }}>
                                    {[
                                        { id: 'servicioAgua', label: 'Red de Agua Potable' },
                                        { id: 'servicioDesague', label: 'Red de Desagüe / Aguas Servidas' },
                                        { id: 'servicioElectricidad', label: 'Energía Eléctrica' },
                                        { id: 'servicioTelefonia', label: 'Telefonía Móvil' },
                                        { id: 'servicioInternet', label: 'Internet' },
                                    ].map((s) => (
                                        <div key={s.id} className="condicion-item">
                                            <span className="condicion-texto">{s.label}</span>
                                            <div className="pills-sino-container" style={{ width: '130px' }}>
                                                <button
                                                    type="button"
                                                    disabled={!modoEdicion}
                                                    className={`pill-sino-btn ${datos[s.id] ? 'pill-sino-btn--si-activo' : ''}`}
                                                    onClick={() => manejarCambio(s.id, true)}
                                                >
                                                    SÍ
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={!modoEdicion}
                                                    className={`pill-sino-btn ${!datos[s.id] ? 'pill-sino-btn--no-activo' : ''}`}
                                                    onClick={() => manejarCambio(s.id, false)}
                                                >
                                                    NO
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <h3 style={{ fontSize: '0.9rem', color: 'var(--color-sidebar)', margin: '0 0 0.8rem' }}>
                                    Entorno Sanitario y Comunitario
                                </h3>
                                <div className="grid-condiciones-sanitarias">
                                    {[
                                        { id: 'banosBuenEstado', label: 'Posee baños en buen estado' },
                                        { id: 'tienePoceta', label: 'Tiene poceta' },
                                        { id: 'tieneDucha', label: 'Tiene ducha' },
                                        { id: 'tieneLavamanos', label: 'Tiene lavamanos' },
                                        { id: 'servicioAseoFrecuente', label: 'Tiene servicio de aseo frecuente' },
                                        { id: 'participaComunidad', label: 'Participa en actividades en su comunidad' },
                                        { id: 'recibeGasFrecuente', label: 'Recibe frecuentemente servicio de gas' },
                                        { id: 'colaboraEscuela', label: 'Colabora en actividades planificadas en la escuela' },
                                    ].map((c) => (
                                        <div key={c.id} className="condicion-item">
                                            <span className="condicion-texto">{c.label}</span>
                                            <div className="pills-sino-container" style={{ width: '130px' }}>
                                                <button
                                                    type="button"
                                                    disabled={!modoEdicion}
                                                    className={`pill-sino-btn ${datos[c.id] ? 'pill-sino-btn--si-activo' : ''}`}
                                                    onClick={() => manejarCambio(c.id, true)}
                                                >
                                                    SÍ
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={!modoEdicion}
                                                    className={`pill-sino-btn ${!datos[c.id] ? 'pill-sino-btn--no-activo' : ''}`}
                                                    onClick={() => manejarCambio(c.id, false)}
                                                >
                                                    NO
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="condicion-item" style={{ gridColumn: 'span 2' }}>
                                        <span className="condicion-texto">Tiene servicio continuo de agua potable</span>
                                        <div className="pills-sino-container" style={{ width: '220px' }}>
                                            {['SI', 'NO', 'A veces'].map((opc) => (
                                                <button
                                                    key={opc}
                                                    type="button"
                                                    disabled={!modoEdicion}
                                                    className={`pill-sino-btn ${datos.aguaPotableContinua === opc
                                                        ? opc === 'SI'
                                                            ? 'pill-sino-btn--si-activo'
                                                            : opc === 'NO'
                                                                ? 'pill-sino-btn--no-activo'
                                                                : 'pill-sino-btn--activo'
                                                        : ''
                                                        }`}
                                                    onClick={() => manejarCambio('aguaPotableContinua', opc)}
                                                >
                                                    {opc}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default Alumnos;