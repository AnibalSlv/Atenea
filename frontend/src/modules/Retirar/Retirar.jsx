import { useState, useEffect, useRef } from 'react';
import { TODOS_LOS_GRADOS, TURNOS } from '../../constants/estructuraEscolar';
import {
    getAlumnos,
    getAlumnosActivos,
    getAlumnosRetirados,
    retirarAlumno,
    restaurarAlumno,
    eliminarAlumnoDefinitivo,
    purgarAlumnosVencidos,
    obtenerConfiguracionRetiro,
} from '../../data/mockAlumnos';
import {
    IconoBuscar,
    IconoRetirar,
    IconoCheck,
    IconoAlerta,
    IconoPapelera,
    IconoRestaurar,
    IconoArchivo,
    IconoImprimir,
} from '../../components/Iconos';
import { useNotificaciones } from '../../context/NotificacionesContext';
import './Retirar.css';

// Motivos oficiales de retiro (Excluido viaje al exterior a solicitud)
const MOTIVOS_RETIRO = [
    'Traslado a otra Institución',
    'Cambio de Residencia / Mudanza',
    'Motivos Familiares / Custodia',
    'Dificultad de Acceso / Transporte',
    'Otro Motivo Particular',
];

// Opciones estándar de días de retención
const DIAS_OPCIONES = [15, 30, 60, 90];

function Retirar() {
    // ─── Pestaña Activa: 'tramite' | 'retirados' ───
    const [vistaActiva, setVistaActiva] = useState('tramite');

    // ─── Contexto de Notificaciones ───
    let agregarNotificacion = null;
    try {
        const notif = useNotificaciones();
        agregarNotificacion = notif?.agregarNotificacion;
    } catch {
        // En caso de render aislado
    }

    // ─── Estados de Datos ───
    const [alumnos, setAlumnos] = useState([]);
    const [retirados, setRetirados] = useState([]);
    const configRetiro = obtenerConfiguracionRetiro();

    // ─── Filtros por Categorías para Buscar Estudiante ───
    const [busquedaTexto, setBusquedaTexto] = useState('');
    const [filtroGrado, setFiltroGrado] = useState('TODOS');
    const [filtroGenero, setFiltroGenero] = useState('TODOS'); // 'TODOS' | 'Varón' | 'Hembra'
    const [filtroTurno, setFiltroTurno] = useState('TODOS'); // 'TODOS' | 'Mañana' | 'Tarde'
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

    // ─── Formulario de Retiro ───
    const hoyStr = new Date().toISOString().split('T')[0];
    const [institucionDestino, setInstitucionDestino] = useState('');
    const [numeroOficioCarta, setNumeroOficioCarta] = useState('');
    const [archivoCarta, setArchivoCarta] = useState(null);
    const [cartaFisicaVerificada, setCartaFisicaVerificada] = useState(false);

    // Campos secundarios
    const [motivo, setMotivo] = useState('Traslado a otra Institución');
    const [otroMotivoTexto, setOtroMotivoTexto] = useState('');
    const [fechaEfectiva, setFechaEfectiva] = useState(hoyStr);
    const [errores, setErrores] = useState({});

    // Retención y Purga de Datos (Con opción de días personalizados)
    const [diasSeleccionados, setDiasSeleccionados] = useState(configRetiro.diasRetencionDefault || 30);
    const [esPersonalizado, setEsPersonalizado] = useState(false);
    const [diasCustomInput, setDiasCustomInput] = useState(45);
    const [observaciones, setObservaciones] = useState('');

    // Días efectivos de retención (calculados dinámicamente)
    const diasRetencionEfectivos = esPersonalizado ? Number(diasCustomInput) || 30 : diasSeleccionados;

    // ─── Alertas y Modales ───
    const [alerta, setAlerta] = useState(null);
    const [modalConfirmacion, setModalConfirmacion] = useState(false);
    const [modalPurga, setModalPurga] = useState(null);
    const [actaEstudiante, setActaEstudiante] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const enviandoRef = useRef(false);

    // Recargar datos y auto-purga inicial
    const refrescar = () => {
        setAlumnos(getAlumnos());
        setRetirados(getAlumnosRetirados());
    };

    useEffect(() => {
        const resPurga = purgarAlumnosVencidos();
        if (resPurga.totalPurgados > 0) {
            setAlerta({
                tipo: 'aviso',
                mensaje: `Se eliminaron automáticamente ${resPurga.totalPurgados} expediente(s) con período de retención vencido.`,
            });
        }
        refrescar();
    }, []);

    // ─── Filtro Dinámico de Estudiantes Activos ───
    const alumnosActivosFiltrados = alumnos.filter((alumno) => {
        const esActivo = !alumno.estado || alumno.estado === 'Activo';
        if (!esActivo) return false;

        // Filtro por Grado
        const cumpleGrado = filtroGrado === 'TODOS' || alumno.gradoNivel === filtroGrado;

        // Filtro por Género (Niñas y Varones)
        const genero = alumno.genero || 'Varón';
        const cumpleGenero = filtroGenero === 'TODOS' || genero === filtroGenero;

        // Filtro por Turno (Mañana / Tarde)
        const cumpleTurno =
            filtroTurno === 'TODOS' ||
            (alumno.turno && alumno.turno.toLowerCase() === filtroTurno.toLowerCase());

        // Filtro por Texto libre
        const q = busquedaTexto.trim().toLowerCase();
        const cumpleTexto =
            !q ||
            (alumno.nombres && alumno.nombres.toLowerCase().includes(q)) ||
            (alumno.apellidos && alumno.apellidos.toLowerCase().includes(q)) ||
            (alumno.nombreRepresentante && alumno.nombreRepresentante.toLowerCase().includes(q));

        return cumpleGrado && cumpleGenero && cumpleTurno && cumpleTexto;
    });

    const hayFiltrosActivos =
        busquedaTexto.trim() !== '' || filtroGrado !== 'TODOS' || filtroGenero !== 'TODOS' || filtroTurno !== 'TODOS';

    const limpiarFiltros = () => {
        setBusquedaTexto('');
        setFiltroGrado('TODOS');
        setFiltroGenero('TODOS');
        setFiltroTurno('TODOS');
    };

    // Calcular fecha exacta de eliminación
    const calcularFechaEliminacion = (dias) => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + (Number(dias) || 30));
        return fecha.toLocaleDateString('es-VE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    // Manejar cambio en Escuela Receptora con validación reactiva
    const handleCambioInstitucion = (val) => {
        setInstitucionDestino(val);
        if (!val.trim()) {
            setErrores((prev) => ({ ...prev, institucionDestino: 'Este campo es obligatorio. Ingrese el plantel receptor.' }));
        } else {
            setErrores((prev) => {
                const copia = { ...prev };
                delete copia.institucionDestino;
                return copia;
            });
        }
    };

    // Manejar cambio de Motivo
    const handleCambioMotivo = (nuevoMotivo) => {
        setMotivo(nuevoMotivo);
        if (nuevoMotivo !== 'Otro Motivo Particular') {
            setOtroMotivoTexto('');
            setErrores((prev) => {
                const copia = { ...prev };
                delete copia.otroMotivoTexto;
                return copia;
            });
        }
    };

    // Manejar cambio en Otro Motivo Particular (sin números ni caracteres extraños)
    const handleCambioOtroMotivo = (val) => {
        // Bloquear dígitos de manera inmediata
        const sinNumeros = val.replace(/[0-9]/g, '');
        setOtroMotivoTexto(sinNumeros);

        if (!sinNumeros.trim()) {
            setErrores((prev) => ({ ...prev, otroMotivoTexto: 'Este campo es obligatorio al seleccionar otro motivo.' }));
        } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,.-]/.test(sinNumeros)) {
            setErrores((prev) => ({ ...prev, otroMotivoTexto: 'Solo letras, sin números ni símbolos.' }));
        } else {
            setErrores((prev) => {
                const copia = { ...prev };
                delete copia.otroMotivoTexto;
                return copia;
            });
        }
    };

    // Manejar adjunto de archivo de la carta
    const handleArchivo = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setArchivoCarta({
                nombre: file.name,
                tamano: `${(file.size / 1024).toFixed(1)} KB`,
            });
            setErrores((prev) => {
                const copia = { ...prev };
                delete copia.carta;
                return copia;
            });
        }
    };

    // Manejar verificación física
    const handleCheckFisico = (checked) => {
        setCartaFisicaVerificada(checked);
        if (checked || archivoCarta) {
            setErrores((prev) => {
                const copia = { ...prev };
                delete copia.carta;
                return copia;
            });
        }
    };

    // Validar y abrir confirmación
    const handleRevisarRetiro = (e) => {
        e.preventDefault();
        if (!alumnoSeleccionado) {
            setAlerta({ tipo: 'error', mensaje: 'Selecciona al estudiante que se va a retirar.' });
            return;
        }

        const nuevosErrores = {};

        if (!institucionDestino.trim()) {
            nuevosErrores.institucionDestino = 'Este campo es obligatorio. Ingrese el plantel receptor.';
        }

        if (!archivoCarta && !cartaFisicaVerificada) {
            nuevosErrores.carta = 'Requisito obligatorio: Adjunte la Carta de Aceptación o certifique su verificación física.';
        }

        if (motivo === 'Otro Motivo Particular') {
            if (!otroMotivoTexto.trim()) {
                nuevosErrores.otroMotivoTexto = 'Este campo es obligatorio al seleccionar otro motivo.';
            } else if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s,.-]/.test(otroMotivoTexto)) {
                nuevosErrores.otroMotivoTexto = 'Solo letras, sin números ni símbolos.';
            }
        }

        if (esPersonalizado && (!diasCustomInput || Number(diasCustomInput) < 1 || Number(diasCustomInput) > 365)) {
            nuevosErrores.dias = 'Ingrese una cantidad válida de días (entre 1 y 365).';
        }

        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            setAlerta({
                tipo: 'error',
                mensaje: 'Por favor complete correctamente los campos obligatorios para continuar.',
            });
            return;
        }

        setErrores({});
        setModalConfirmacion(true);
    };

    // Procesar retiro definitivo
    const handleConfirmar = () => {
        if (enviandoRef.current || guardando) return;
        enviandoRef.current = true;
        setGuardando(true);

        try {
            const diasFinales = diasRetencionEfectivos;
            const motivoFinal = motivo === 'Otro Motivo Particular' ? otroMotivoTexto.trim() : motivo;
            const datosRetiro = {
                motivo: motivoFinal,
                fechaEfectiva,
                institucionDestino: institucionDestino.trim(),
                numeroOficioCarta: numeroOficioCarta.trim(),
                nombreArchivoCarta:
                    archivoCarta?.nombre ||
                    (cartaFisicaVerificada ? `Constancia Física Verificada (Oficio ${numeroOficioCarta || 'S/N'})` : 'Carta_Aceptacion.pdf'),
                tamanoArchivoCarta: archivoCarta?.tamano || 'Copia física en Dirección',
                diasRetencion: diasFinales,
                observaciones: observaciones.trim(),
            };

            const alumnoRetirado = retirarAlumno(alumnoSeleccionado.id, datosRetiro);
            refrescar();

            setAlerta({
                tipo: 'exito',
                mensaje: `Retiro procesado para ${alumnoRetirado.nombres} ${alumnoRetirado.apellidos}. Eliminación programada en ${diasFinales} días.`,
            });

            if (agregarNotificacion) {
                agregarNotificacion({
                    titulo: 'Retiro Procesado',
                    mensaje: `Se desincorporó a ${alumnoRetirado.nombres} ${alumnoRetirado.apellidos}. Traslado a: ${institucionDestino}.`,
                    tipo: 'alerta',
                });
            }

            // Limpieza
            setModalConfirmacion(false);
            setAlumnoSeleccionado(null);
            setBusquedaTexto('');
            setInstitucionDestino('');
            setNumeroOficioCarta('');
            setArchivoCarta(null);
            setCartaFisicaVerificada(false);
            setMotivo('Traslado a otra Institución');
            setOtroMotivoTexto('');
            setErrores({});
            setObservaciones('');
            setVistaActiva('retirados');
        } catch (err) {
            console.error(err);
            setAlerta({ tipo: 'error', mensaje: 'Error al procesar el retiro del alumno.' });
        } finally {
            enviandoRef.current = false;
            setGuardando(false);
        }
    };

    // Restaurar alumno a matrícula activa
    const handleRestaurar = (id, nombre) => {
        if (window.confirm(`¿Reincorporar a "${nombre}" a la matrícula activa?`)) {
            restaurarAlumno(id);
            refrescar();
            setAlerta({
                tipo: 'exito',
                mensaje: `El estudiante "${nombre}" ha sido restaurado a la matrícula activa.`,
            });
        }
    };

    // Purga manual anticipada
    const handlePurgaInmediata = () => {
        if (!modalPurga) return;
        eliminarAlumnoDefinitivo(modalPurga.id, 'Eliminación manual anticipada');
        refrescar();
        setAlerta({
            tipo: 'aviso',
            mensaje: `Los datos del estudiante ${modalPurga.nombres} ${modalPurga.apellidos} han sido eliminados del sistema.`,
        });
        setModalPurga(null);
    };

    // Eliminación de vencidos
    const handlePurgaVencidos = () => {
        const res = purgarAlumnosVencidos();
        refrescar();
        if (res.totalPurgados > 0) {
            setAlerta({
                tipo: 'exito',
                mensaje: `Eliminación completada: ${res.totalPurgados} expediente(s) vencidos eliminados.`,
            });
        } else {
            setAlerta({ tipo: 'aviso', mensaje: 'No hay expedientes vencidos pendientes por eliminar.' });
        }
    };

    // Calcular días restantes de un alumno retirado
    const calcularDiasRestantes = (fechaEliminacionStr) => {
        if (!fechaEliminacionStr) return { dias: 0, vencido: true, texto: 'Vencido' };
        const ahora = new Date();
        const fin = new Date(fechaEliminacionStr);
        const dias = Math.ceil((fin - ahora) / (1000 * 60 * 60 * 24));
        if (dias <= 0) return { dias: 0, vencido: true, texto: 'Vencido' };
        return { dias, vencido: false, texto: `${dias} días` };
    };

    return (
        <div className="retiros-modulo">
            {/* ─── Encabezado y Píldoras de Navegación ─── */}
            <header className="retiros-header">
                <div className="retiros-header__info">
                    <h1>Retiro de Estudiantes</h1>
                    <p>Gestión de desincorporación escolar y archivo de constancias</p>
                </div>

                <div className="retiros-nav-pills">
                    <button
                        type="button"
                        className={`retiros-pill-btn ${vistaActiva === 'tramite' ? 'retiros-pill-btn--activo' : ''}`}
                        onClick={() => setVistaActiva('tramite')}
                    >
                        <IconoRetirar size={16} />
                        <span>Tramitar Retiro</span>
                    </button>

                    <button
                        type="button"
                        className={`retiros-pill-btn ${vistaActiva === 'retirados' ? 'retiros-pill-btn--activo' : ''}`}
                        onClick={() => setVistaActiva('retirados')}
                    >
                        <span>Estudiantes Retirados</span>
                        <span className="retiros-pill-count">{retirados.length}</span>
                    </button>
                </div>
            </header>

            {/* ─── Alerta Notificación ─── */}
            {alerta && (
                <div className={`alerta-notif alerta-notif--${alerta.tipo}`}>
                    <span>{alerta.mensaje}</span>
                    <button className="alerta-notif__btn" onClick={() => setAlerta(null)}>
                        ✕
                    </button>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                VISTA 1: TRAMITAR RETIRO (BÚSQUEDA POR CATEGORÍAS + FORMULARIO)
            ────────────────────────────────────────────────────────────── */}
            {vistaActiva === 'tramite' && (
                <div className="card-limpia">
                    {/* BÚSQUEDA Y FILTRADO POR CATEGORÍAS */}
                    {!alumnoSeleccionado ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Barra de Filtros Responsiva */}
                            <div className="filtros-categoria-wrapper">
                                {/* Fila 1: Buscador de texto */}
                                <div className="buscador-pill-wrapper">
                                    <span className="buscador-pill-icon">
                                        <IconoBuscar size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        className="buscador-pill-input"
                                        placeholder="Buscar por nombre o apellido del estudiante..."
                                        value={busquedaTexto}
                                        onChange={(e) => setBusquedaTexto(e.target.value)}
                                    />
                                </div>

                                {/* Fila 2: Categorías de Grados y Género */}
                                <div className="filtros-controles-fila">
                                    <div className="filtros-grupos-left">
                                        {/* Grados */}
                                        <div className="filtro-item-inline">
                                            <label className="filtro-label-inline">Grado:</label>
                                            <select
                                                className="filtro-select-limpio"
                                                value={filtroGrado}
                                                onChange={(e) => setFiltroGrado(e.target.value)}
                                            >
                                                <option value="TODOS">Todos los Grados</option>
                                                {TODOS_LOS_GRADOS.map((g) => (
                                                    <option key={g.id} value={g.nombre}>
                                                        {g.nombre}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Género (Niñas / Varones) */}
                                        <div className="filtro-item-inline">
                                            <label className="filtro-label-inline">Género:</label>
                                            <div className="genero-pills-container">
                                                <button
                                                    type="button"
                                                    className={`genero-pill-btn ${filtroGenero === 'TODOS' ? 'genero-pill-btn--todos-activo' : ''}`}
                                                    onClick={() => setFiltroGenero('TODOS')}
                                                >
                                                    Todos
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`genero-pill-btn ${filtroGenero === 'Varón' ? 'genero-pill-btn--varon-activo' : ''}`}
                                                    onClick={() => setFiltroGenero('Varón')}
                                                >
                                                    Varones
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`genero-pill-btn ${filtroGenero === 'Hembra' ? 'genero-pill-btn--hembra-activo' : ''}`}
                                                    onClick={() => setFiltroGenero('Hembra')}
                                                >
                                                    Niñas
                                                </button>
                                            </div>
                                        </div>

                                        {/* Turno (Mañana / Tarde) */}
                                        <div className="filtro-item-inline">
                                            <label className="filtro-label-inline">Turno:</label>
                                            <div className="genero-pills-container">
                                                <button
                                                    type="button"
                                                    className={`genero-pill-btn ${filtroTurno === 'TODOS' ? 'genero-pill-btn--todos-activo' : ''}`}
                                                    onClick={() => setFiltroTurno('TODOS')}
                                                >
                                                    Todos
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`genero-pill-btn ${filtroTurno === TURNOS.MANANA ? 'turno-pill-btn--activo' : ''}`}
                                                    onClick={() => setFiltroTurno(TURNOS.MANANA)}
                                                >
                                                    Mañana
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`genero-pill-btn ${filtroTurno === TURNOS.TARDE ? 'turno-pill-btn--activo' : ''}`}
                                                    onClick={() => setFiltroTurno(TURNOS.TARDE)}
                                                >
                                                    Tarde
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fila 3: Barra de Estado y Botón de Restablecer Rediseñado */}
                                <div className="filtros-estado-barra">
                                    <span className="conteo-badge">
                                        Inscritos activos: <strong>{alumnosActivosFiltrados.length}</strong>
                                    </span>

                                    {hayFiltrosActivos && (
                                        <button
                                            type="button"
                                            className="btn-restablecer-filtros"
                                            onClick={limpiarFiltros}
                                            title="Restablecer filtros a la vista general"
                                        >
                                            <IconoRestaurar size={13} />
                                            <span>Restablecer Filtros</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Cuadrícula de Estudiantes Inscritos según los filtros */}
                            {alumnosActivosFiltrados.length > 0 ? (
                                <div className="estudiantes-grid-filtrados">
                                    {alumnosActivosFiltrados.map((al) => {
                                        const esVaron = (al.genero || 'Varón') === 'Varón';
                                        return (
                                            <div
                                                key={al.id}
                                                className="estudiante-card-item"
                                                onClick={() => setAlumnoSeleccionado(al)}
                                            >
                                                <div className="estudiante-card-top">
                                                    <div
                                                        className={`avatar-genero ${
                                                            esVaron ? 'avatar-genero--varon' : 'avatar-genero--hembra'
                                                        }`}
                                                    >
                                                        {al.nombres?.charAt(0)}
                                                        {al.apellidos?.charAt(0)}
                                                    </div>

                                                    <div className="estudiante-card-nombres">
                                                        <h4>
                                                            {al.apellidos}, {al.nombres}
                                                        </h4>
                                                        <p title={al.nombreRepresentante || 'No registrado'}>
                                                            Repr: {al.nombreRepresentante || 'No registrado'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="estudiante-card-pills">
                                                    <span className="badge-tag badge-tag--grado">
                                                        {al.gradoNivel} "{al.seccionLiteral}"
                                                    </span>
                                                    <span
                                                        className={`badge-tag ${
                                                            esVaron ? 'badge-tag--varon' : 'badge-tag--hembra'
                                                        }`}
                                                    >
                                                        {esVaron ? 'Varón' : 'Niña'}
                                                    </span>
                                                    <span className="badge-tag">Turno {al.turno}</span>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn-seleccionar-card"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setAlumnoSeleccionado(al);
                                                    }}
                                                >
                                                    Seleccionar para Retiro →
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-texto-secundario)', fontWeight: 600 }}>
                                        No hay estudiantes inscritos que coincidan con los filtros seleccionados.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Píldora del Estudiante Seleccionado */
                        <div className="estudiante-seleccionado-pill">
                            <div className="estudiante-seleccionado-info">
                                <div
                                    className={`estudiante-seleccionado-avatar ${
                                        (alumnoSeleccionado.genero || 'Varón') === 'Varón'
                                            ? 'estudiante-seleccionado-avatar--varon'
                                            : 'estudiante-seleccionado-avatar--hembra'
                                    }`}
                                >
                                    {alumnoSeleccionado.nombres?.charAt(0)}
                                    {alumnoSeleccionado.apellidos?.charAt(0)}
                                </div>
                                <div className="estudiante-seleccionado-textos">
                                    <h3>
                                        {alumnoSeleccionado.nombres} {alumnoSeleccionado.apellidos}
                                    </h3>
                                    <div className="estudiante-meta-tags">
                                        <span className="badge-tag badge-tag--grado">
                                            {alumnoSeleccionado.gradoNivel} "{alumnoSeleccionado.seccionLiteral}"
                                        </span>
                                        <span
                                            className={`badge-tag ${
                                                (alumnoSeleccionado.genero || 'Varón') === 'Varón'
                                                    ? 'badge-tag--varon'
                                                    : 'badge-tag--hembra'
                                            }`}
                                        >
                                            {(alumnoSeleccionado.genero || 'Varón') === 'Varón' ? 'Varón' : 'Niña'}
                                        </span>
                                        <span className="badge-tag">Turno {alumnoSeleccionado.turno}</span>
                                        <span className="badge-tag">
                                            Repr: {alumnoSeleccionado.nombreRepresentante || 'No registrado'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-cambiar-estudiante"
                                onClick={() => setAlumnoSeleccionado(null)}
                            >
                                ✕ Cambiar Estudiante
                            </button>
                        </div>
                    )}

                    {/* FORMULARIO DE RETIRO (ENFOCADO EN CARTA DE ACEPTACIÓN) */}
                    {alumnoSeleccionado && (
                        <form onSubmit={handleRevisarRetiro} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {/* EL PROTAGONISTA: CARTA DE ACEPTACIÓN */}
                            <section className="hero-carta-aceptacion">
                                <div className="hero-carta-header">
                                    <h3 className="hero-carta-header__titulo">
                                        <IconoArchivo size={20} /> Carta de Aceptación del Nuevo Colegio
                                    </h3>
                                    <span className="badge-obligatorio">Requisito Obligatorio *</span>
                                </div>

                                <div className="hero-carta-grid">
                                    {/* Campo: Colegio Destino */}
                                    <div className="campo-grupo-limpio">
                                        <label className="campo-label-limpio">
                                            Institución o Escuela Receptora <span className="asterisco-rojo">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`campo-input-limpio ${errores.institucionDestino ? 'campo-input-limpio--error' : ''}`}
                                            placeholder="Ej: U.E.B. Nueva Esparta / Colegio San Martín"
                                            value={institucionDestino}
                                            onChange={(e) => handleCambioInstitucion(e.target.value)}
                                            autoFocus
                                        />
                                        {errores.institucionDestino ? (
                                            <span className="campo-mensaje-error">
                                                ⚠ {errores.institucionDestino}
                                            </span>
                                        ) : (
                                            <span className="nota-sutil">Indica el plantel que recibe al estudiante</span>
                                        )}
                                    </div>

                                    {/* Campo: Subida de Archivo o Verificación */}
                                    <div className="campo-grupo-limpio">
                                        <label className="campo-label-limpio">
                                            Documento de la Carta (PDF o Imagen) <span className="asterisco-rojo">*</span>
                                        </label>

                                        {!archivoCarta ? (
                                            <div>
                                                <label className={`carta-dropzone-minimal ${errores.carta ? 'carta-dropzone-minimal--error' : ''}`}>
                                                    <IconoArchivo size={22} style={{ color: errores.carta ? '#ef4444' : 'var(--color-sidebar)' }} />
                                                    <div>
                                                        <span>Adjuntar Carta de Aceptación</span>
                                                        <small>Formatos: PDF, JPG, PNG (Hasta 5MB)</small>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,image/*"
                                                        style={{ display: 'none' }}
                                                        onChange={handleArchivo}
                                                    />
                                                </label>
                                                {errores.carta && (
                                                    <span className="campo-mensaje-error">
                                                        ⚠ {errores.carta}
                                                    </span>
                                                )}

                                                <label className="check-fisico-box">
                                                    <input
                                                        type="checkbox"
                                                        checked={cartaFisicaVerificada}
                                                        onChange={(e) => handleCheckFisico(e.target.checked)}
                                                    />
                                                    <span>Original verificado y archivado físicamente en Dirección</span>
                                                </label>
                                            </div>
                                        ) : (
                                            <div className="archivo-adjunto-card">
                                                <div className="archivo-adjunto-info">
                                                    <IconoCheck size={20} style={{ color: 'var(--color-verde)' }} />
                                                    <div>
                                                        <p className="archivo-adjunto-nombre">{archivoCarta.nombre}</p>
                                                        <p className="archivo-adjunto-sub">
                                                            {archivoCarta.tamano} • Documento verificado
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="btn-quitar-adjunto"
                                                    onClick={() => {
                                                        setArchivoCarta(null);
                                                        if (!cartaFisicaVerificada) {
                                                            setErrores((prev) => ({ ...prev, carta: 'Requisito obligatorio: Adjunte la Carta o certifique su archivo físico.' }));
                                                        }
                                                    }}
                                                >
                                                    Quitar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* CAMPOS COMPLEMENTARIOS (MOTIVO Y FECHA EFECTIVA) */}
                            <div className="form-secundario-grid">
                                <div className="campo-grupo-limpio">
                                    <label className="campo-label-limpio">Motivo del Retiro</label>
                                    <select
                                        className="campo-select-limpio"
                                        value={motivo}
                                        onChange={(e) => handleCambioMotivo(e.target.value)}
                                    >
                                        {MOTIVOS_RETIRO.map((m) => (
                                            <option key={m} value={m}>
                                                {m}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="campo-grupo-limpio">
                                    <label className="campo-label-limpio">Fecha Efectiva</label>
                                    <input
                                        type="date"
                                        className="campo-input-limpio"
                                        value={fechaEfectiva}
                                        onChange={(e) => setFechaEfectiva(e.target.value)}
                                        required
                                    />
                                </div>

                                {/* Campo condicional para especificar otro motivo (solo si se selecciona 'Otro Motivo Particular') */}
                                {motivo === 'Otro Motivo Particular' && (
                                    <div className="campo-grupo-limpio" style={{ gridColumn: '1 / -1' }}>
                                        <label className="campo-label-limpio">
                                            Especifique el Motivo del Retiro <span className="asterisco-rojo">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className={`campo-input-limpio ${errores.otroMotivoTexto ? 'campo-input-limpio--error' : ''}`}
                                            placeholder="Escriba el motivo particular (solo letras y signos de puntuación)..."
                                            value={otroMotivoTexto}
                                            onChange={(e) => handleCambioOtroMotivo(e.target.value)}
                                            autoFocus
                                        />
                                        {errores.otroMotivoTexto ? (
                                            <span className="campo-mensaje-error">
                                                ⚠ {errores.otroMotivoTexto}
                                            </span>
                                        ) : (
                                            <span className="nota-sutil">Solo letras, sin números ni caracteres especiales</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* ELIMINACIÓN DE DATOS (CON OPCIÓN PERSONALIZABLE DE DÍAS) */}
                            <div className="retencion-opciones-box">
                                <label className="campo-label-limpio">
                                    Plazo para Eliminación Definitiva de Datos
                                </label>

                                <div className="retencion-pills-row">
                                    {DIAS_OPCIONES.map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            className={`retencion-pill-btn ${!esPersonalizado && diasSeleccionados === d ? 'retencion-pill-btn--activo' : ''}`}
                                            onClick={() => {
                                                setDiasSeleccionados(d);
                                                setEsPersonalizado(false);
                                            }}
                                        >
                                            {d} días {d === 30 ? '(Estándar)' : ''}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        className={`retencion-pill-btn ${esPersonalizado ? 'retencion-pill-btn--activo' : ''}`}
                                        onClick={() => setEsPersonalizado(true)}
                                    >
                                        ✏️ Personalizado...
                                    </button>
                                </div>

                                {esPersonalizado && (
                                    <div className="input-dias-personalizado-wrapper">
                                        <input
                                            type="number"
                                            min="1"
                                            max="365"
                                            className="input-dias-personalizado"
                                            value={diasCustomInput}
                                            onChange={(e) => setDiasCustomInput(Math.max(1, Number(e.target.value)))}
                                            placeholder="Días"
                                            autoFocus
                                        />
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-texto-principal)' }}>
                                            días de retención
                                        </span>
                                    </div>
                                )}

                                <span className="nota-sutil">
                                    📅 Los datos se eliminarán automáticamente el{' '}
                                    <strong>{calcularFechaEliminacion(diasRetencionEfectivos)}</strong> (en{' '}
                                    <strong>{diasRetencionEfectivos} días</strong>).
                                </span>
                            </div>

                            {/* PIE DE FORMULARIO CON ACCIONES */}
                            <div className="form-footer-accion">
                                <button
                                    type="button"
                                    className="btn-secundario-limpio"
                                    onClick={() => setAlumnoSeleccionado(null)}
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="btn-primario-retiro"
                                    disabled={guardando}
                                >
                                    <IconoRetirar size={18} />
                                    <span>Procesar Retiro</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                VISTA 2: ESTUDIANTES RETIRADOS (TARJETAS DASHBOARD)
            ────────────────────────────────────────────────────────────── */}
            {vistaActiva === 'retirados' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="retirados-topbar">
                        <span style={{ fontSize: '0.88rem', color: 'var(--color-texto-secundario)', fontWeight: 600 }}>
                            Total de estudiantes retirados: <strong>{retirados.length}</strong>
                        </span>

                        {retirados.length > 0 && (
                            <button
                                type="button"
                                className="btn-purga-rapida"
                                onClick={handlePurgaVencidos}
                                title="Eliminar automáticamente registros cuyo plazo de días ya expiró"
                            >
                                <IconoPapelera size={15} />
                                <span>Eliminar expedientes</span>
                            </button>
                        )}
                    </div>

                    {retirados.length === 0 ? (
                        <div className="card-limpia" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                            <IconoCheck size={42} style={{ color: 'var(--color-verde)', margin: '0 auto 0.8rem' }} />
                            <h3 style={{ margin: '0 0 0.3rem 0', fontSize: '1.05rem', color: 'var(--color-texto-principal)' }}>
                                No hay estudiantes retirados
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-texto-secundario)' }}>
                                Todos los alumnos matriculados están actualmente activos.
                            </p>
                        </div>
                    ) : (
                        <div className="retirados-grid-responsiva">
                            {retirados.map((al) => {
                                const ret = al.retiro || {};
                                const diasInfo = calcularDiasRestantes(ret.fechaProgramadaEliminacion);
                                const totalDias = ret.diasRetencion || 30;
                                const diasPasados = Math.max(0, totalDias - diasInfo.dias);
                                const pctTiempo = Math.min(100, Math.round((diasPasados / totalDias) * 100));
                                const esVaron = (al.genero || 'Varón') === 'Varón';

                                return (
                                    <div key={al.id} className="card-retirado-item">
                                        <div className="card-retirado-head">
                                            <div>
                                                <h3>
                                                    {al.nombres} {al.apellidos}
                                                </h3>
                                                <p>
                                                    {ret.gradoAlRetirarse || al.gradoNivel} "{ret.seccionAlRetirarse || al.seccionLiteral}" • {esVaron ? 'Varón' : 'Niña'}
                                                </p>
                                            </div>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-rojo)', backgroundColor: 'var(--color-rojo-fondo)', padding: '2px 8px', borderRadius: '999px' }}>
                                                Retirado
                                            </span>
                                        </div>

                                        {/* Destacado: Carta de Aceptación */}
                                        <div className="badge-carta-destino">
                                            <IconoArchivo size={16} />
                                            <div>
                                                <span>Destino: <strong>{ret.institucionDestino}</strong></span>
                                                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                                                    Carta: {ret.nombreArchivoCarta || 'Verificada'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Barra de progreso de eliminación */}
                                        <div className="retencion-mini-bar">
                                            <div className="retencion-mini-labels">
                                                <span style={{ color: 'var(--color-texto-secundario)' }}>
                                                    Eliminación:
                                                </span>
                                                <span style={{ color: diasInfo.vencido ? 'var(--color-rojo)' : '#92400e' }}>
                                                    ⏳ {diasInfo.texto}
                                                </span>
                                            </div>
                                            <div className="retencion-progress-track">
                                                <div
                                                    className={`retencion-progress-fill ${diasInfo.vencido ? 'retencion-progress-fill--vencido' : ''}`}
                                                    style={{ width: `${pctTiempo}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="card-retirado-acciones">
                                            <button
                                                type="button"
                                                className="btn-card-accion"
                                                onClick={() => setActaEstudiante(al)}
                                                title="Ver constancia oficial"
                                            >
                                                <IconoImprimir size={14} /> Constancia
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-card-accion"
                                                onClick={() => handleRestaurar(al.id, `${al.nombres} ${al.apellidos}`)}
                                                title="Revertir retiro"
                                            >
                                                <IconoRestaurar size={14} /> Restaurar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-card-accion btn-card-accion--peligro"
                                                onClick={() => setModalPurga(al)}
                                                title="Eliminar datos ahora"
                                            >
                                                <IconoPapelera size={14} /> Purgar
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                MODAL 1: CONFIRMACIÓN SIMPLE Y MINIMALISTA
            ────────────────────────────────────────────────────────────── */}
            {modalConfirmacion && alumnoSeleccionado && (
                <div className="modal-backdrop-blur" onClick={() => !guardando && setModalConfirmacion(false)}>
                    <div className="modal-card-limpio" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#fef2f2', color: 'var(--color-rojo)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <IconoAlerta size={22} />
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-texto-principal)' }}>
                                    Confirmar Retiro Escolar
                                </h3>
                                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--color-texto-secundario)' }}>
                                    Verifica los datos del traslado antes de aplicar
                                </p>
                            </div>
                        </div>

                        <div className="modal-resumen-filas">
                            <div className="modal-resumen-item">
                                <span>Estudiante:</span>
                                <strong>{alumnoSeleccionado.nombres} {alumnoSeleccionado.apellidos}</strong>
                            </div>
                            <div className="modal-resumen-item">
                                <span>Grado / Sección:</span>
                                <strong>{alumnoSeleccionado.gradoNivel} "{alumnoSeleccionado.seccionLiteral}"</strong>
                            </div>
                            <div className="modal-resumen-item">
                                <span>Escuela Receptora:</span>
                                <strong style={{ color: 'var(--color-sidebar)' }}>{institucionDestino}</strong>
                            </div>
                            <div className="modal-resumen-item">
                                <span>Carta de Aceptación:</span>
                                <strong style={{ color: 'var(--color-verde)' }}>
                                    ✓ {archivoCarta?.nombre || (cartaFisicaVerificada ? 'Física en Dirección' : 'Consignada')}
                                </strong>
                            </div>
                            <div className="modal-resumen-item">
                                <span>Eliminación de datos:</span>
                                <strong style={{ color: 'var(--color-rojo)' }}>En {diasRetencionEfectivos} días</strong>
                            </div>
                        </div>

                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#92400e', backgroundColor: '#fffbeb', padding: '0.65rem 0.85rem', borderRadius: '10px' }}>
                            ⚠️ El cupo en <strong>{alumnoSeleccionado.gradoNivel} "{alumnoSeleccionado.seccionLiteral}"</strong> quedará libre para nuevas inscripciones.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem', marginTop: '0.4rem' }}>
                            <button
                                type="button"
                                className="btn-secundario-limpio"
                                onClick={() => setModalConfirmacion(false)}
                                disabled={guardando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-primario-retiro"
                                onClick={handleConfirmar}
                                disabled={guardando}
                            >
                                <IconoCheck size={16} />
                                <span>{guardando ? 'Guardando...' : 'Confirmar Retiro'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                MODAL 2: PURGA MANUAL INMEDIATA
            ────────────────────────────────────────────────────────────── */}
            {modalPurga && (
                <div className="modal-backdrop-blur" onClick={() => setModalPurga(null)}>
                    <div className="modal-card-limpio" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#fef2f2', color: 'var(--color-rojo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconoPapelera size={18} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                                ¿Eliminar Datos Ahora?
                            </h3>
                        </div>

                        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-texto-secundario)', lineHeight: 1.5 }}>
                            Se eliminarán definitivamente los registros de{' '}
                            <strong>{modalPurga.nombres} {modalPurga.apellidos}</strong>. Esta acción no se puede deshacer.
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem', marginTop: '0.4rem' }}>
                            <button
                                type="button"
                                className="btn-secundario-limpio"
                                onClick={() => setModalPurga(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="btn-primario-retiro"
                                style={{ backgroundColor: 'var(--color-rojo)' }}
                                onClick={handlePurgaInmediata}
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                MODAL 3: CONSTANCIA FORMAL IMPRIMIBLE
            ────────────────────────────────────────────────────────────── */}
            {actaEstudiante && (
                <div className="modal-backdrop-blur" onClick={() => setActaEstudiante(null)}>
                    <div className="modal-card-limpio" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
                        <div style={{ border: '1px solid #e2e8f0', padding: '1.6rem', borderRadius: '16px', backgroundColor: '#fff', color: '#0f172a', fontFamily: 'Segoe UI, sans-serif' }}>
                            <div style={{ textAlign: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '10px', marginBottom: '14px' }}>
                                <h4 style={{ margin: 0, fontSize: '0.85rem', textTransform: 'uppercase' }}>República Bolivariana de Venezuela</h4>
                                <h5 style={{ margin: '2px 0 0 0', fontSize: '0.78rem' }}>U.E.M. "Gregorio Romero" — Maneiro, Edo. Nueva Esparta</h5>
                            </div>

                            <h3 style={{ textAlign: 'center', fontSize: '1.1rem', textDecoration: 'underline', margin: '12px 0' }}>
                                CONSTANCIA DE RETIRO ESCOLAR
                            </h3>

                            <div style={{ fontSize: '0.85rem', lineHeight: 1.6, textAlign: 'justify' }}>
                                Por medio de la presente se hace constar que el (la) estudiante{' '}
                                <strong>{actaEstudiante.nombres} {actaEstudiante.apellidos}</strong>, cursante de{' '}
                                <strong>{actaEstudiante.retiro?.gradoAlRetirarse || actaEstudiante.gradoNivel} "{actaEstudiante.retiro?.seccionAlRetirarse || actaEstudiante.seccionLiteral}"</strong> (Turno {actaEstudiante.retiro?.turnoAlRetirarse || actaEstudiante.turno}), ha sido formalmente desincorporado(a) de esta institución en fecha{' '}
                                <strong>{actaEstudiante.retiro?.fechaEfectiva}</strong>, habiendo consignado la debida Carta de Aceptación del plantel receptor:{' '}
                                <strong>{actaEstudiante.retiro?.institucionDestino}</strong>.
                                <br />
                                Representante legal: <strong>{actaEstudiante.nombreRepresentante}</strong> (C.I: {actaEstudiante.ciRepresentante || 'No registrada'}).
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px', textAlign: 'center' }}>
                                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                                    Dirección Escolar
                                </div>
                                <div style={{ borderTop: '1px solid #0f172a', paddingTop: '6px', fontSize: '0.78rem', fontWeight: 700 }}>
                                    Firma del Representante
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.7rem' }}>
                            <button
                                type="button"
                                className="btn-secundario-limpio"
                                onClick={() => setActaEstudiante(null)}
                            >
                                Cerrar
                            </button>
                            <button
                                type="button"
                                className="btn-primario-retiro"
                                onClick={() => window.print()}
                            >
                                <IconoImprimir size={16} />
                                <span>Imprimir</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Retirar;
