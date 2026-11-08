import { useState, useEffect } from 'react';
import { TODOS_LOS_GRADOS, TURNOS } from '../../constants/estructuraEscolar';
import { IconoEditar, IconoGuardar, IconoVolver, IconoBuscar } from '../../components/Iconos';
import { getAlumnos, actualizarAlumnoCompleto } from '../../data/mockAlumnos';
import './Alumnos.css';

// ─── Constantes y Reglas de Validación ───────────────────────────────────────
const REG_SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
const REG_TELEFONO    = /^[0-9\-\+\s]{7,15}$/;
const REG_EMAIL       = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REG_CEDULA      = /^([VEve]-?)?\d{5,12}$/;

const SECCIONES_PLANILLA = [
    { id: 'estudiante',    numero: 1, titulo: 'Datos del Estudiante', keywords: 'estudiante alumno nombre apellido cedula escolar nacimiento fecha edad nacionalidad direccion grado turno seccion literal genero varon hembra lateralidad derecho izquierdo institucion origen fiebre medicamento paracetamol alergias' },
    { id: 'especiales',   numero: 2, titulo: 'Diagnóstico o Necesidades Especiales', keywords: 'necesidades especiales diagnostico medico tratante doctor telefono especialista equipo apoyo aula integrada cdi psicopedagogia' },
    { id: 'padres',       numero: 3, titulo: 'Datos de los Padres y Comunidad', keywords: 'padres madre padre mama papa cedula ci telefono celular correo email instruccion ocupacion trabajo lider calle comuna comunidad residencia direccion centro votacion' },
    { id: 'representante',numero: 4, titulo: 'Nombre del Representante', keywords: 'representante legal tutor nombre cedula ci ocupacion telefono correo direccion' },
    { id: 'pareja',       numero: 5, titulo: 'Situación de la Pareja', keywords: 'situacion pareja estado civil soltero casado concubino divorciado viudo' },
    { id: 'vivienda',     numero: 6, titulo: 'Vivienda', keywords: 'vivienda casa condicion propia alquilada cuartos habitaciones paredes techo material concreto' },
    { id: 'habitantes',   numero: 7, titulo: 'Habitantes de la Vivienda', keywords: 'habitantes personas familias vivienda hermanos cantidad numero' },
    { id: 'servicios',    numero: 8, titulo: 'Servicios Básicos', keywords: 'servicios basicos agua potable desague aguas negras cloacas electricidad telefonia internet conexion' },
    { id: 'otros',        numero: 9, titulo: 'Otros (Condiciones del Hogar)', keywords: 'otros condiciones hogar banos poceta ducha lavamanos aseo gas bombona comunidad colabora escuela agua potable continua' },
];

const CAMPO_A_TAB = {
    fechaIngreso: 'estudiante', cedulaEscolar: 'estudiante',
    apellidos: 'estudiante', nombres: 'estudiante',
    lugarNacimiento: 'estudiante', fechaNacimiento: 'estudiante', edad: 'estudiante',
    nacionalidad: 'estudiante', direccionEstudiante: 'estudiante',
    genero: 'estudiante', lateralidad: 'estudiante',
    medicoTratante: 'especiales', telefonoMedico: 'especiales',
    nombreMadre: 'padres', ciMadre: 'padres', telefonoMadre: 'padres', correoMadre: 'padres',
    nombrePadre: 'padres', ciPadre: 'padres', telefonoPadre: 'padres', correoPadre: 'padres',
    nombreRepresentante: 'representante', ciRepresentante: 'representante',
    telefonoRepresentante: 'representante', correoRepresentante: 'representante',
    situacionPareja: 'pareja',
    tipoVivienda: 'vivienda', cuartosVivienda: 'vivienda',
    cantidadPersonasVivienda: 'habitantes', familiasEnVivienda: 'habitantes', numeroHermanos: 'habitantes',
    servicioAgua: 'servicios', servicioDesague: 'servicios',
    servicioElectricidad: 'servicios', servicioTelefonia: 'servicios', servicioInternet: 'servicios',
    aguaPotableContinua: 'otros', banosBuenEstado: 'otros', tienePoceta: 'otros',
    tieneDucha: 'otros', tieneLavamanos: 'otros', servicioAseoFrecuente: 'otros',
    recibeGasFrecuente: 'otros', participaComunidad: 'otros', colaboraEscuela: 'otros',
};

// ─── Funciones Auxiliares Fuera del Componente (evitan pérdida de foco) ───────
function calcularEdad(fechaStr) {
    if (!fechaStr) return '';
    const nac = new Date(fechaStr + 'T00:00:00');
    if (isNaN(nac.getTime())) return '';
    const hoy = new Date();
    if (nac > hoy) return '';
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mesDif = hoy.getMonth() - nac.getMonth();
    if (mesDif < 0 || (mesDif === 0 && hoy.getDate() < nac.getDate())) {
        edad--;
    }
    return edad >= 0 ? String(edad) : '';
}

function validarTab(tabId, form) {
    const e = {};
    if (!form) return e;

    if (tabId === 'estudiante') {
        if (!form.cedulaEscolar?.trim())
            e.cedulaEscolar = 'La cédula escolar es obligatoria.';
        else if (!REG_CEDULA.test(form.cedulaEscolar.trim()))
            e.cedulaEscolar = 'Solo números (ej: 13100111 o V-13100111). Sin letras.';

        if (!form.nombres?.trim())
            e.nombres = 'El nombre es obligatorio.';
        else if (!REG_SOLO_LETRAS.test(form.nombres.trim()))
            e.nombres = 'Solo letras, sin números ni símbolos.';
        else if (form.nombres.trim().length < 3 || form.nombres.trim().length > 50)
            e.nombres = 'Entre 3 y 50 caracteres.';

        if (!form.apellidos?.trim())
            e.apellidos = 'El apellido es obligatorio.';
        else if (!REG_SOLO_LETRAS.test(form.apellidos.trim()))
            e.apellidos = 'Solo letras, sin números ni símbolos.';
        else if (form.apellidos.trim().length < 3 || form.apellidos.trim().length > 50)
            e.apellidos = 'Entre 3 y 50 caracteres.';

        if (!form.genero)
            e.genero = 'Seleccione el género del alumno.';

        if (!form.fechaNacimiento) {
            e.fechaNacimiento = 'La fecha de nacimiento es obligatoria.';
        } else {
            const nac = new Date(form.fechaNacimiento + 'T00:00:00');
            const hoy = new Date();
            if (isNaN(nac.getTime())) {
                e.fechaNacimiento = 'Fecha de nacimiento inválida.';
            } else if (nac > hoy) {
                e.fechaNacimiento = 'La fecha de nacimiento no puede ser una fecha futura.';
            }
        }

        const edadCalculada = calcularEdad(form.fechaNacimiento);
        const edadNum = parseInt(edadCalculada, 10);
        if (!form.fechaNacimiento || edadCalculada === '') {
            e.edad = 'Ingrese una fecha de nacimiento válida para calcular la edad.';
        } else if (isNaN(edadNum) || edadNum < 3 || edadNum > 18) {
            e.edad = `La edad calculada (${edadNum} años) no es válida para la institución (debe tener entre 3 y 18 años).`;
        } else if (form.edad !== undefined && form.edad !== '' && String(form.edad) !== String(edadCalculada)) {
            e.edad = `La edad (${form.edad}) no coincide con la fecha de nacimiento (debe ser ${edadCalculada} años).`;
        }

        if (form.nacionalidad && !REG_SOLO_LETRAS.test(form.nacionalidad.trim()))
            e.nacionalidad = 'Solo letras (ej: Venezolana).';

        if (form.lugarNacimiento && !REG_SOLO_LETRAS.test(form.lugarNacimiento.trim()))
            e.lugarNacimiento = 'Solo se permiten letras.';
    }

    if (tabId === 'especiales') {
        if (form.medicoTratante && !REG_SOLO_LETRAS.test(form.medicoTratante.trim()))
            e.medicoTratante = 'Solo letras en el nombre del médico.';
        if (form.telefonoMedico && !REG_TELEFONO.test(form.telefonoMedico.trim()))
            e.telefonoMedico = 'Formato inválido. Ej: 0412-0000000.';
    }

    if (tabId === 'padres') {
        if (!form.nombreMadre?.trim())
            e.nombreMadre = 'El nombre de la madre es obligatorio.';
        else if (!REG_SOLO_LETRAS.test(form.nombreMadre.trim()))
            e.nombreMadre = 'Solo se permiten letras.';

        if (!form.telefonoMadre?.trim())
            e.telefonoMadre = 'El teléfono de la madre es obligatorio.';
        else if (!REG_TELEFONO.test(form.telefonoMadre.trim()))
            e.telefonoMadre = 'Formato inválido. Ej: 0414-0000000.';

        if (form.ciMadre && !REG_CEDULA.test(form.ciMadre.trim()))
            e.ciMadre = 'Solo números (ej: 15123456 o V-15123456). Sin letras.';
        if (form.correoMadre && !REG_EMAIL.test(form.correoMadre.trim()))
            e.correoMadre = 'Correo inválido.';

        if (!form.nombrePadre?.trim())
            e.nombrePadre = 'El nombre del padre es obligatorio.';
        else if (!REG_SOLO_LETRAS.test(form.nombrePadre.trim()))
            e.nombrePadre = 'Solo se permiten letras.';

        if (!form.telefonoPadre?.trim())
            e.telefonoPadre = 'El teléfono del padre es obligatorio.';
        else if (!REG_TELEFONO.test(form.telefonoPadre.trim()))
            e.telefonoPadre = 'Formato inválido. Ej: 0414-0000000.';

        if (form.ciPadre && !REG_CEDULA.test(form.ciPadre.trim()))
            e.ciPadre = 'Solo números (ej: 12345678 o V-12345678). Sin letras.';
        if (form.correoPadre && !REG_EMAIL.test(form.correoPadre.trim()))
            e.correoPadre = 'Correo inválido.';
    }

    if (tabId === 'representante') {
        if (!form.nombreRepresentante?.trim())
            e.nombreRepresentante = 'El nombre del representante es obligatorio.';
        else if (!REG_SOLO_LETRAS.test(form.nombreRepresentante.trim()))
            e.nombreRepresentante = 'Solo se permiten letras.';

        if (!form.telefonoRepresentante?.trim())
            e.telefonoRepresentante = 'El teléfono del representante es obligatorio.';
        else if (!REG_TELEFONO.test(form.telefonoRepresentante.trim()))
            e.telefonoRepresentante = 'Formato inválido.';

        if (form.ciRepresentante && !REG_CEDULA.test(form.ciRepresentante.trim()))
            e.ciRepresentante = 'Solo números (ej: 12345678 o V-12345678). Sin letras.';
        if (form.correoRepresentante && !REG_EMAIL.test(form.correoRepresentante.trim()))
            e.correoRepresentante = 'Correo inválido.';
    }

    if (tabId === 'pareja') {
        if (!form.situacionPareja)
            e.situacionPareja = 'Debe seleccionar la situación de la pareja.';
    }

    if (tabId === 'vivienda') {
        if (!form.tipoVivienda)
            e.tipoVivienda = 'Debe seleccionar el tipo de vivienda.';
        if (form.cuartosVivienda && (isNaN(Number(form.cuartosVivienda)) || Number(form.cuartosVivienda) < 1))
            e.cuartosVivienda = 'Ingrese un número mayor a 0.';
    }

    if (tabId === 'habitantes') {
        if (form.cantidadPersonasVivienda && (isNaN(Number(form.cantidadPersonasVivienda)) || Number(form.cantidadPersonasVivienda) < 1))
            e.cantidadPersonasVivienda = 'Ingrese un número mayor a 0.';
        if (form.familiasEnVivienda && (isNaN(Number(form.familiasEnVivienda)) || Number(form.familiasEnVivienda) < 1))
            e.familiasEnVivienda = 'Ingrese un número mayor a 0.';
        if (form.numeroHermanos && (isNaN(Number(form.numeroHermanos)) || Number(form.numeroHermanos) < 0))
            e.numeroHermanos = 'Ingrese 0 o más.';
    }

    if (tabId === 'servicios') {
        const servicios = [
            { id: 'servicioAgua', label: 'Red de Agua Potable' },
            { id: 'servicioDesague', label: 'Red de Desagüe' },
            { id: 'servicioElectricidad', label: 'Energía Eléctrica' },
            { id: 'servicioTelefonia', label: 'Telefonía Móvil' },
            { id: 'servicioInternet', label: 'Servicio de Internet' },
        ];
        servicios.forEach((s) => {
            if (form[s.id] === null || form[s.id] === undefined) {
                e[s.id] = `Debe marcar una opción (SÍ o NO) en ${s.label}.`;
            }
        });
    }

    if (tabId === 'otros') {
        if (!form.aguaPotableContinua) {
            e.aguaPotableContinua = 'Debe seleccionar una opción en Agua Potable Continua.';
        }
        const condiciones = [
            { id: 'banosBuenEstado', label: 'Baños en buen estado' },
            { id: 'tienePoceta', label: 'Tiene poceta' },
            { id: 'tieneDucha', label: 'Tiene ducha' },
            { id: 'tieneLavamanos', label: 'Tiene lavamanos' },
            { id: 'servicioAseoFrecuente', label: 'Servicio de aseo frecuente' },
            { id: 'recibeGasFrecuente', label: 'Recibe gas frecuente' },
            { id: 'participaComunidad', label: 'Participa en la comunidad' },
            { id: 'colaboraEscuela', label: 'Colabora con la escuela' },
        ];
        condiciones.forEach((c) => {
            if (form[c.id] === null || form[c.id] === undefined) {
                e[c.id] = `Debe marcar una opción (SÍ o NO) en ${c.label}.`;
            }
        });
    }

    return e;
}

function validarTodo(form) {
    if (!form) return {};
    const secciones = ['estudiante', 'especiales', 'padres', 'representante', 'pareja', 'vivienda', 'habitantes', 'servicios', 'otros'];
    return secciones.reduce((acc, tabId) => ({ ...acc, ...validarTab(tabId, form) }), {});
}

function normalizarPareja(str) {
    if (!str) return '';
    return String(str)
        .toLowerCase()
        .replace(/\/a$/i, '')
        .replace(/[oa]$/i, '')
        .trim();
}

function CampoTexto({ label, value, onChange, error, placeholder, tipo = 'text', span, requerido, disabled, readOnly, min, max, id }) {
    return (
        <div id={id} className="campo-grupo" style={span ? { gridColumn: '1 / -1' } : {}}>
            <label className="campo-label">{label}{requerido ? ' *' : ''}</label>
            <input
                type={tipo}
                className={`campo-input${error ? ' campo-input--error' : ''}${readOnly ? ' campo-input--readonly' : ''}`}
                placeholder={placeholder}
                value={value ?? ''}
                onChange={(e) => !readOnly && onChange(e.target.value)}
                disabled={disabled}
                readOnly={readOnly}
                tabIndex={readOnly ? -1 : undefined}
                min={min}
                max={max}
            />
            {error && <span className="campo-error-msg">⚠ {error}</span>}
        </div>
    );
}

function BotonesSiNo({ value, onChange, disabled }) {
    return (
        <div className="pills-sino-container" style={{ width: '130px' }}>
            <button
                type="button"
                disabled={disabled}
                className={`pill-sino-btn ${value === true ? 'pill-sino-btn--si-activo' : ''}`}
                onClick={() => onChange(true)}
            >
                SÍ
            </button>
            <button
                type="button"
                disabled={disabled}
                className={`pill-sino-btn ${value === false ? 'pill-sino-btn--no-activo' : ''}`}
                onClick={() => onChange(false)}
            >
                NO
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
function Alumnos() {
    // Vista actual: 'lista' | 'expediente'
    const [vistaActual, setVistaActual] = useState('lista');

    // Estado de Filtros de Selección
    const [filtroTurno, setFiltroTurno] = useState('TODOS');
    const [filtroGrado, setFiltroGrado] = useState('TODOS');
    const [filtroSeccion, setFiltroSeccion] = useState('TODOS');
    const [busquedaTexto, setBusquedaTexto] = useState('');

    // Estado de Alumnos
    const [alumnos, setAlumnos] = useState([]);

    useEffect(() => {
        setAlumnos(getAlumnos());
    }, []);

    // Estado de Alumno Seleccionado para el Expediente
    const [datos, setDatos] = useState(null);
    const [alumnoOriginal, setAlumnoOriginal] = useState(null);
    const [busquedaExpediente, setBusquedaExpediente] = useState('');
    const [modoEdicion, setModoEdicion] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [errores, setErrores] = useState({});
    const [mensajeExito, setMensajeExito] = useState('');

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
        const edadRecalculada = alumno.fechaNacimiento ? calcularEdad(alumno.fechaNacimiento) : (alumno.edad || '');
        const alumnoConEdad = { ...alumno, edad: edadRecalculada };
        setDatos(alumnoConEdad);
        setAlumnoOriginal(alumnoConEdad);
        setModoEdicion(false);
        setErrores({});
        setMensajeExito('');
        setBusquedaExpediente('');
        setVistaActual('expediente');
    };

    const volverALista = () => {
        setVistaActual('lista');
        setModoEdicion(false);
        setErrores({});
        setMensajeExito('');
        setBusquedaExpediente('');
    };

    const cancelarEdicion = () => {
        if (alumnoOriginal) {
            setDatos({ ...alumnoOriginal });
        }
        setErrores({});
        setModoEdicion(false);
    };

    const manejarCambio = (campo, valor) => {
        if (!modoEdicion) return;
        if (campo === 'edad') return; // La edad no es modificable directamente
        setDatos((prev) => {
            const nuevo = { ...prev, [campo]: valor };
            if (campo === 'fechaNacimiento') {
                nuevo.edad = calcularEdad(valor);
            }
            return nuevo;
        });
        if (errores[campo]) {
            setErrores((prev) => {
                const e = { ...prev };
                delete e[campo];
                return e;
            });
        }
        if (campo === 'fechaNacimiento' && errores.edad) {
            setErrores((prev) => {
                const e = { ...prev };
                delete e.edad;
                return e;
            });
        }
    };

    const handleGuardar = () => {
        const edadExacta = calcularEdad(datos?.fechaNacimiento);
        const datosActualizados = { ...datos, edad: edadExacta };

        const errTotal = validarTodo(datosActualizados);
        if (Object.keys(errTotal).length > 0) {
            setErrores(errTotal);
            const primerCampo = Object.keys(errTotal)[0];
            const tabDestino = CAMPO_A_TAB[primerCampo];
            if (busquedaExpediente) {
                setBusquedaExpediente('');
            }
            setTimeout(() => {
                const el = document.getElementById(`campo-${primerCampo}`) || document.getElementById(`seccion-${tabDestino}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
            return;
        }

        setGuardando(true);
        setTimeout(() => {
            actualizarAlumnoCompleto(datosActualizados);
            setAlumnos((prev) => prev.map((a) => (a.id === datosActualizados.id ? datosActualizados : a)));
            setAlumnoOriginal({ ...datosActualizados });
            setDatos(datosActualizados);
            setGuardando(false);
            setModoEdicion(false);
            setErrores({});
            setMensajeExito('Alumno actualizado con éxito');
            setTimeout(() => setMensajeExito(''), 4000);
        }, 400);
    };

    // Helper para determinar si una sección coincide con la búsqueda en la planilla
    const seccionCoincide = (secId) => {
        const q = busquedaExpediente.toLowerCase().trim();
        if (!q) return true;
        const meta = SECCIONES_PLANILLA.find((s) => s.id === secId);
        if (meta && (meta.titulo.toLowerCase().includes(q) || meta.keywords.toLowerCase().includes(q))) {
            return true;
        }
        return Object.entries(CAMPO_A_TAB).some(([campo, tab]) => {
            if (tab === secId && datos?.[campo]) {
                return String(datos[campo]).toLowerCase().includes(q);
            }
            return false;
        });
    };

    // Helper para campos de texto limpios
    const F = (campo, label, placeholder, opts = {}) => (
        <CampoTexto
            key={campo}
            id={`campo-${campo}`}
            label={label}
            placeholder={placeholder}
            value={datos?.[campo]}
            onChange={(v) => manejarCambio(campo, v)}
            error={errores[campo]}
            tipo={opts.tipo}
            span={opts.span}
            requerido={modoEdicion && opts.req}
            disabled={opts.disabled !== undefined ? opts.disabled : !modoEdicion}
            readOnly={opts.readOnly}
            min={opts.min}
            max={opts.max}
        />
    );

    const condItems8 = [
        { id: 'servicioAgua',         label: 'Red de Agua Potable' },
        { id: 'servicioDesague',      label: 'Red de Desagüe' },
        { id: 'servicioElectricidad', label: 'Energía Eléctrica' },
        { id: 'servicioTelefonia',    label: 'Telefonía Móvil' },
        { id: 'servicioInternet',     label: 'Servicio de Internet' },
    ];

    const condItems9 = [
        { id: 'banosBuenEstado',       label: 'Posee baños en buen estado' },
        { id: 'tienePoceta',           label: 'Tiene poceta' },
        { id: 'tieneDucha',            label: 'Tiene ducha' },
        { id: 'tieneLavamanos',        label: 'Tiene lavamanos' },
        { id: 'servicioAseoFrecuente', label: 'Tiene servicio de aseo frecuente' },
        { id: 'recibeGasFrecuente',    label: 'Recibe frecuentemente servicio de gas' },
        { id: 'participaComunidad',    label: 'Participa en actividades en su comunidad' },
        { id: 'colaboraEscuela',       label: 'Colabora en actividades planificadas en la escuela' },
    ];

    const esAguaActiva = (opc) => {
        if (!datos?.aguaPotableContinua) return false;
        if (opc === 'Sí' && (datos.aguaPotableContinua === 'Sí' || datos.aguaPotableContinua === 'SI' || datos.aguaPotableContinua === 'Si')) return true;
        return datos.aguaPotableContinua === opc;
    };

    const esParejaActiva = (opc) => {
        if (!datos?.situacionPareja) return false;
        return normalizarPareja(datos.situacionPareja) === normalizarPareja(opc);
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
                                <option value="D">Sección D</option>
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
                    {mensajeExito && (
                        <div className="alumnos-alerta-exito">
                            <span>{mensajeExito}</span>
                        </div>
                    )}

                    {/* 1. Barra de Navegación Superior: Botón Volver con amplio espacio */}
                    <div className="alumnos-top-nav">
                        <button
                            type="button"
                            className="alumnos-btn-volver"
                            onClick={volverALista}
                        >
                            <IconoVolver size={16} />
                            <span>Volver a la Lista de Alumnos</span>
                        </button>
                    </div>

                    {/* 2. Cabecera del Alumno y Acciones */}
                    <header className="alumnos-header alumnos-header--expediente">
                        <div className="alumnos-header__info">
                            <h1 className="alumnos-header__titulo">
                                {datos.apellidos}, {datos.nombres}
                            </h1>
                            <p className="alumnos-header__sub">
                                Cédula: <strong>{datos.cedulaEscolar}</strong> &bull; Grado: <strong>{datos.gradoNivel} &quot;{datos.seccionLiteral}&quot;</strong> &bull; Turno: <strong>{datos.turno}</strong>
                            </p>
                        </div>

                        <div className="alumnos-header__acciones">
                            {!modoEdicion ? (
                                <>
                                    <div className="indicador-estado-consulta" title="Visualizando ficha escolar">
                                        <span className="indicador-punto-verde"></span>
                                        <span>Modo Consulta</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="alumnos-tab-btn alumnos-tab-btn--activo"
                                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                        onClick={() => {
                                            setModoEdicion(true);
                                            setErrores({});
                                        }}
                                    >
                                        <IconoEditar size={15} />
                                        <span>Modificar Datos</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className="alumnos-tab-btn"
                                        onClick={cancelarEdicion}
                                        disabled={guardando}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        className="alumnos-tab-btn alumnos-tab-btn--guardar"
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

                    {/* 3. Barra de Búsqueda Integrada para la Planilla */}
                    <div className="expediente-busqueda-container">
                        <div className="expediente-busqueda-inputbox">
                            <span className="expediente-busqueda-icon">
                                <IconoBuscar size={17} />
                            </span>
                            <input
                                type="text"
                                className="campo-input expediente-busqueda-input"
                                placeholder="Buscar dato en la planilla física (ej: alergia, madre, teléfono, dirección, servicios, grado...)"
                                value={busquedaExpediente}
                                onChange={(e) => setBusquedaExpediente(e.target.value)}
                            />
                            {busquedaExpediente && (
                                <button
                                    type="button"
                                    className="expediente-busqueda-clear"
                                    onClick={() => setBusquedaExpediente('')}
                                    title="Limpiar búsqueda"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {busquedaExpediente.trim() && (
                            <div className="expediente-chips-salto">
                                <span className="chips-salto-titulo">Secciones encontradas:</span>
                                {SECCIONES_PLANILLA.filter((s) => seccionCoincide(s.id)).map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        className="chip-salto-item"
                                        onClick={() => {
                                            const el = document.getElementById(`seccion-${s.id}`);
                                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }}
                                    >
                                        {s.numero}. {s.titulo} ↓
                                    </button>
                                ))}
                                {SECCIONES_PLANILLA.filter((s) => seccionCoincide(s.id)).length === 0 && (
                                    <span className="chips-sin-resultados">No se encontraron secciones con ese criterio de búsqueda.</span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 4. Planilla Física de Registro Continuo */}
                    <div className="alumnos-card planilla-card-fisica">
                        <div className="planilla-header-banner">
                            <div className="planilla-header-escuela">
                                <span className="planilla-escuela-nombre">REPÚBLICA BOLIVARIANA DE VENEZUELA — U.E.M. GREGORIO ROMERO</span>
                                <span className="planilla-doc-sub">PLANILLA OFICIAL DE EXPEDIENTE DEL ESTUDIANTE</span>
                            </div>
                        </div>

                        {/* ── 1. DATOS DEL ESTUDIANTE ───────────────────────── */}
                        {seccionCoincide('estudiante') && (
                            <section id="seccion-estudiante" className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">1</span>
                                    <h2 className="seccion-titulo-texto">Datos del Estudiante</h2>
                                </div>

                                <div className="form-grid-2">
                                    {F('fechaIngreso', 'Fecha de Inscripción / Ingreso', '', { tipo: 'date' })}
                                    {F('cedulaEscolar', 'Cédula Escolar', 'Ej: 13100111 o V-13100111', { req: true })}
                                </div>

                                <div className="form-grid-2">
                                    {F('apellidos', 'Apellidos', 'Apellidos completos', { req: true })}
                                    {F('nombres', 'Nombres', 'Nombres completos', { req: true })}
                                </div>

                                <div className="form-grid-3">
                                    {F('lugarNacimiento', 'Lugar de Nacimiento', 'Ciudad / Estado')}
                                    {F('fechaNacimiento', 'Fecha de Nacimiento', '', { tipo: 'date', req: true })}
                                    {F('edad', 'Edad (Años - calculada automáticamente)', 'Auto', { tipo: 'number', req: true, readOnly: true, disabled: false })}
                                </div>

                                <div className="form-grid-2">
                                    <CampoTexto
                                        label="Nacionalidad"
                                        placeholder="Venezolana"
                                        value={datos.nacionalidad}
                                        onChange={(v) => manejarCambio('nacionalidad', v)}
                                        error={errores.nacionalidad}
                                        disabled={!modoEdicion}
                                    />
                                    {F('direccionEstudiante', 'Dirección del Estudiante', 'Calle, sector, casa...')}
                                </div>

                                <div className="form-grid-3">
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
                                        <label className="campo-label">Sección / Literal</label>
                                        <select
                                            className="campo-select"
                                            disabled={!modoEdicion}
                                            value={datos.seccionLiteral || ''}
                                            onChange={(e) => manejarCambio('seccionLiteral', e.target.value)}
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-grid-2">
                                    <div className="campo-grupo">
                                        <label className="campo-label">Género {modoEdicion ? ' *' : ''}</label>
                                        <div className="pills-sino-container">
                                            <button
                                                type="button"
                                                disabled={!modoEdicion}
                                                className={`pill-sino-btn ${datos.genero === 'Varón' ? 'pill-sino-btn--si-activo' : ''}`}
                                                onClick={() => manejarCambio('genero', 'Varón')}
                                            >
                                                Varón
                                            </button>
                                            <button
                                                type="button"
                                                disabled={!modoEdicion}
                                                className={`pill-sino-btn ${datos.genero === 'Hembra' ? 'pill-sino-btn--si-activo' : ''}`}
                                                onClick={() => manejarCambio('genero', 'Hembra')}
                                            >
                                                Hembra
                                            </button>
                                        </div>
                                        {errores.genero && <span className="campo-error-msg">⚠ {errores.genero}</span>}
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
                                </div>

                                <div className="form-grid-1">
                                    {F('institucionOrigen', 'Institución de donde Proviene', 'Nombre del plantel anterior', { span: true })}
                                </div>

                                <div className="form-grid-2">
                                    {F('medicamentoFiebre', 'En caso de fiebre suministrar:', 'Acetaminofén, Paracetamol...')}
                                    {F('alergias', 'Alérgico a:', 'Alimentos, medicamentos...')}
                                </div>
                            </section>
                        )}

                        {/* ── 2. NECESIDADES ESPECIALES ─────────────────────── */}
                        {seccionCoincide('especiales') && (
                            <section id="seccion-especiales" className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">2</span>
                                    <h2 className="seccion-titulo-texto">Diagnóstico o Necesidades Especiales</h2>
                                </div>

                                <div className="form-grid-1">
                                    {F('diagnosticoEspecial', 'Diagnóstico Médico (si aplica)', 'Condición médica o pedagógica especial', { span: true })}
                                </div>

                                <div className="form-grid-2">
                                    <CampoTexto
                                        label="Médico Tratante"
                                        placeholder="Nombre del especialista"
                                        value={datos.medicoTratante}
                                        onChange={(v) => manejarCambio('medicoTratante', v)}
                                        error={errores.medicoTratante}
                                        disabled={!modoEdicion}
                                    />
                                    <CampoTexto
                                        label="Teléfono del Médico"
                                        placeholder="0412-0000000"
                                        value={datos.telefonoMedico}
                                        onChange={(v) => manejarCambio('telefonoMedico', v)}
                                        error={errores.telefonoMedico}
                                        disabled={!modoEdicion}
                                    />
                                </div>

                                <div className="form-grid-1">
                                    {F('equipoApoyo', 'Equipo de Apoyo al que Asiste', 'Ej: Aula Integrada, CDI, Psicopedagogía', { span: true })}
                                </div>
                            </section>
                        )}

                        {/* ── 3. PADRES Y COMUNIDAD ─────────────────────────── */}
                        {seccionCoincide('padres') && (
                            <section id="seccion-padres" className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">3</span>
                                    <h2 className="seccion-titulo-texto">Datos de los Padres y Comunidad</h2>
                                </div>

                                <h3 className="subseccion-titulo">Madre</h3>
                                <div className="form-grid-4">
                                    <CampoTexto
                                        label="Nombre de la Madre"
                                        placeholder="Nombres y apellidos"
                                        value={datos.nombreMadre}
                                        onChange={(v) => manejarCambio('nombreMadre', v)}
                                        error={errores.nombreMadre}
                                        requerido={modoEdicion}
                                        disabled={!modoEdicion}
                                    />
                                    <CampoTexto
                                        label="C.I. de la Madre"
                                        placeholder="Ej: 15123456 o V-15123456"
                                        value={datos.ciMadre}
                                        onChange={(v) => manejarCambio('ciMadre', v)}
                                        error={errores.ciMadre}
                                        disabled={!modoEdicion}
                                    />
                                    {F('instruccionMadre', 'Nivel de Instrucción', 'Bachiller, TSU, Univ.')}
                                    {F('ocupacionMadre', 'Ocupación', 'Oficio o profesión')}
                                    {F('lugarTrabajoMadre', 'Lugar de Trabajo', 'Empresa o institución')}
                                    {F('direccionTrabajoMadre', 'Dirección del Trabajo', 'Dirección laboral')}
                                    <CampoTexto
                                        label="Teléfono de la Madre"
                                        placeholder="0414-0000000"
                                        value={datos.telefonoMadre}
                                        onChange={(v) => manejarCambio('telefonoMadre', v)}
                                        error={errores.telefonoMadre}
                                        requerido={modoEdicion}
                                        disabled={!modoEdicion}
                                    />
                                    <CampoTexto
                                        label="Correo de la Madre"
                                        placeholder="correo@ejemplo.com"
                                        tipo="email"
                                        value={datos.correoMadre}
                                        onChange={(v) => manejarCambio('correoMadre', v)}
                                        error={errores.correoMadre}
                                        disabled={!modoEdicion}
                                    />
                                </div>

                                <h3 className="subseccion-titulo">Padre</h3>
                                <div className="form-grid-4">
                                    <CampoTexto
                                        label="Nombre del Padre"
                                        placeholder="Nombres y apellidos"
                                        value={datos.nombrePadre}
                                        onChange={(v) => manejarCambio('nombrePadre', v)}
                                        error={errores.nombrePadre}
                                        requerido={modoEdicion}
                                        disabled={!modoEdicion}
                                    />
                                    <CampoTexto
                                        label="C.I. del Padre"
                                        placeholder="Ej: 12345678 o V-12345678"
                                        value={datos.ciPadre}
                                        onChange={(v) => manejarCambio('ciPadre', v)}
                                        error={errores.ciPadre}
                                        disabled={!modoEdicion}
                                    />
                                    {F('instruccionPadre', 'Nivel de Instrucción', 'Bachiller, TSU, Univ.')}
                                    {F('ocupacionPadre', 'Ocupación', 'Oficio o profesión')}
                                    {F('lugarTrabajoPadre', 'Lugar de Trabajo', 'Empresa o institución')}
                                    {F('direccionTrabajoPadre', 'Dirección del Trabajo', 'Dirección laboral')}
                                    <CampoTexto
                                        label="Teléfono del Padre"
                                        placeholder="0414-0000000"
                                        value={datos.telefonoPadre}
                                        onChange={(v) => manejarCambio('telefonoPadre', v)}
                                        error={errores.telefonoPadre}
                                        requerido={modoEdicion}
                                        disabled={!modoEdicion}
                                    />
                                    <CampoTexto
                                        label="Correo del Padre"
                                        placeholder="correo@ejemplo.com"
                                        tipo="email"
                                        value={datos.correoPadre}
                                        onChange={(v) => manejarCambio('correoPadre', v)}
                                        error={errores.correoPadre}
                                        disabled={!modoEdicion}
                                    />
                                </div>

                                <h3 className="subseccion-titulo">Comunidad</h3>
                                <div className="form-grid-3">
                                    {F('liderCalle', 'Líder de Calle', 'Nombre del líder')}
                                    {F('nombreComuna', 'Nombre de la Comunidad / Comuna', 'Nombre de la comunidad')}
                                    {F('centroVotacion', 'Centro de Votación', 'Centro de votación')}
                                    {F('direccionResidencia', 'Dirección de Residencia', 'Calle, sector, casa o apartamento', { span: true })}
                                </div>
                            </section>
                        )}

                        {/* ── 4. REPRESENTANTE LEGAL ────────────────────────── */}
                        {seccionCoincide('representante') && (
                            <section id="seccion-representante" className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">4</span>
                                    <h2 className="seccion-titulo-texto">Nombre del Representante</h2>
                                </div>

                                <div className="form-grid-3">
                                    <CampoTexto
                                        label="Nombre y Apellido"
                                        placeholder="Nombre completo"
                                        value={datos.nombreRepresentante}
                                        onChange={(v) => manejarCambio('nombreRepresentante', v)}
                                        error={errores.nombreRepresentante}
                                        requerido={modoEdicion}
                                        disabled={!modoEdicion}
                                    />
                                    <CampoTexto
                                        label="Cédula de Identidad"
                                        placeholder="Ej: 12345678 o V-12345678"
                                        value={datos.ciRepresentante}
                                        onChange={(v) => manejarCambio('ciRepresentante', v)}
                                        error={errores.ciRepresentante}
                                        disabled={!modoEdicion}
                                    />
                                    {F('ocupacionRepresentante', 'Ocupación', 'Oficio o profesión')}
                                    <CampoTexto
                                        label="Teléfono de Contacto"
                                        placeholder="0416-0000000"
                                        value={datos.telefonoRepresentante}
                                        onChange={(v) => manejarCambio('telefonoRepresentante', v)}
                                        error={errores.telefonoRepresentante}
                                        requerido={modoEdicion}
                                        disabled={!modoEdicion}
                                    />
                                    <CampoTexto
                                        label="Correo Electrónico"
                                        placeholder="correo@ejemplo.com"
                                        tipo="email"
                                        value={datos.correoRepresentante}
                                        onChange={(v) => manejarCambio('correoRepresentante', v)}
                                        error={errores.correoRepresentante}
                                        disabled={!modoEdicion}
                                    />
                                    {F('direccionRepresentante', 'Dirección del Representante', 'Dirección completa', { span: true })}
                                </div>
                            </section>
                        )}

                        {/* ── 5. SITUACIÓN DE LA PAREJA ─────────────────────── */}
                        {seccionCoincide('pareja') && (
                            <section id="seccion-pareja" className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">5</span>
                                    <h2 className="seccion-titulo-texto">Situación de la Pareja</h2>
                                </div>

                                <div className="pills-grupo-opciones">
                                    {['Soltero/a', 'Casado/a', 'Concubino/a', 'Divorciado/a', 'Viudo/a'].map((opc) => (
                                        <button
                                            key={opc}
                                            type="button"
                                            disabled={!modoEdicion}
                                            className={`pill-opcion-btn ${esParejaActiva(opc) ? 'pill-opcion-btn--activo' : ''}`}
                                            onClick={() => manejarCambio('situacionPareja', opc)}
                                        >
                                            {opc}
                                        </button>
                                    ))}
                                </div>
                                {errores.situacionPareja && <span className="campo-error-msg">⚠ {errores.situacionPareja}</span>}
                            </section>
                        )}

                        {/* ── 6. VIVIENDA ───────────────────────────────────── */}
                        {seccionCoincide('vivienda') && (
                            <section id="seccion-vivienda" className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">6</span>
                                    <h2 className="seccion-titulo-texto">Vivienda</h2>
                                </div>

                                <div className="form-grid-4">
                                    <div className="campo-grupo">
                                        <label className="campo-label">Condición de la Casa {modoEdicion ? ' *' : ''}</label>
                                        <select
                                            className={`campo-select${errores.tipoVivienda ? ' campo-input--error' : ''}`}
                                            disabled={!modoEdicion}
                                            value={datos.tipoVivienda || ''}
                                            onChange={(e) => manejarCambio('tipoVivienda', e.target.value)}
                                        >
                                            <option value="" disabled>Seleccione...</option>
                                            <option value="Propia">Propia</option>
                                            <option value="Alquilada">Alquilada</option>
                                            <option value="Otros">Otros</option>
                                        </select>
                                        {errores.tipoVivienda && <span className="campo-error-msg">⚠ {errores.tipoVivienda}</span>}
                                    </div>

                                    <CampoTexto
                                        label="Número de Cuartos"
                                        placeholder="Ej: 3"
                                        tipo="number"
                                        value={datos.cuartosVivienda}
                                        onChange={(v) => manejarCambio('cuartosVivienda', v)}
                                        error={errores.cuartosVivienda}
                                        min={1}
                                        disabled={!modoEdicion}
                                    />

                                    <div className="campo-grupo">
                                        <label className="campo-label">Material de las Paredes</label>
                                        <select
                                            className="campo-select"
                                            disabled={!modoEdicion}
                                            value={datos.materialParedes || ''}
                                            onChange={(e) => manejarCambio('materialParedes', e.target.value)}
                                        >
                                            <option value="">Seleccione...</option>
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
                                            <option value="">Seleccione...</option>
                                            <option value="Zinc">Zinc</option>
                                            <option value="Platabanda / Concreto">Platabanda / Concreto</option>
                                            <option value="Madera">Madera</option>
                                            <option value="Adobe">Adobe</option>
                                            <option value="Otros">Otros</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ── 7. HABITANTES ─────────────────────────────────── */}
                        {seccionCoincide('habitantes') && (
                            <section id="seccion-habitantes" className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">7</span>
                                    <h2 className="seccion-titulo-texto">Habitantes</h2>
                                </div>

                                <div className="form-grid-3">
                                    <CampoTexto
                                        label="Personas en la Vivienda"
                                        placeholder="Cantidad total"
                                        tipo="number"
                                        value={datos.cantidadPersonasVivienda}
                                        onChange={(v) => manejarCambio('cantidadPersonasVivienda', v)}
                                        error={errores.cantidadPersonasVivienda}
                                        min={1}
                                        disabled={!modoEdicion}
                                    />
                                    <CampoTexto
                                        label="Familias en la Vivienda"
                                        placeholder="Número de familias"
                                        tipo="number"
                                        value={datos.familiasEnVivienda}
                                        onChange={(v) => manejarCambio('familiasEnVivienda', v)}
                                        error={errores.familiasEnVivienda}
                                        min={1}
                                        disabled={!modoEdicion}
                                    />
                                    <CampoTexto
                                        label="Número de Hermanos"
                                        placeholder="Cantidad de hermanos"
                                        tipo="number"
                                        value={datos.numeroHermanos}
                                        onChange={(v) => manejarCambio('numeroHermanos', v)}
                                        error={errores.numeroHermanos}
                                        min={0}
                                        disabled={!modoEdicion}
                                    />
                                </div>
                            </section>
                        )}

                        {/* ── 8. SERVICIOS BÁSICOS ──────────────────────────── */}
                        {seccionCoincide('servicios') && (
                            <section id="seccion-servicios" className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">8</span>
                                    <h2 className="seccion-titulo-texto">Servicios Básicos</h2>
                                </div>

                                <div className="grid-condiciones-sanitarias">
                                    {condItems8.map((s) => (
                                        <div key={s.id} className="condicion-card-box">
                                            <div className={`condicion-item ${errores[s.id] ? 'condicion-item--error' : ''}`}>
                                                <span className="condicion-texto">{s.label} {modoEdicion ? '*' : ''}</span>
                                                <BotonesSiNo
                                                    value={datos[s.id]}
                                                    onChange={(v) => manejarCambio(s.id, v)}
                                                    disabled={!modoEdicion}
                                                />
                                            </div>
                                            {errores[s.id] && <span className="campo-error-msg">⚠ {errores[s.id]}</span>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── 9. OTROS / CONDICIONES DEL HOGAR ─────────────── */}
                        {seccionCoincide('otros') && (
                            <section id="seccion-otros" className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">9</span>
                                    <h2 className="seccion-titulo-texto">Otros (Condiciones del Hogar)</h2>
                                </div>

                                <div className="condicion-card-box" style={{ marginBottom: '16px' }}>
                                    <div className={`condicion-item ${errores.aguaPotableContinua ? 'condicion-item--error' : ''}`}>
                                        <span className="condicion-texto">Agua Potable Continua {modoEdicion ? '*' : ''}</span>
                                        <div className="pills-sino-container" style={{ width: '220px' }}>
                                            {['Sí', 'No', 'A veces'].map((opc) => (
                                                <button
                                                    key={opc}
                                                    type="button"
                                                    disabled={!modoEdicion}
                                                    className={`pill-sino-btn ${esAguaActiva(opc) ? 'pill-sino-btn--si-activo' : ''}`}
                                                    onClick={() => manejarCambio('aguaPotableContinua', opc)}
                                                >
                                                    {opc}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {errores.aguaPotableContinua && <span className="campo-error-msg">⚠ {errores.aguaPotableContinua}</span>}
                                </div>

                                <div className="grid-condiciones-sanitarias">
                                    {condItems9.map((c) => (
                                        <div key={c.id} className="condicion-card-box">
                                            <div className={`condicion-item ${errores[c.id] ? 'condicion-item--error' : ''}`}>
                                                <span className="condicion-texto">{c.label} {modoEdicion ? '*' : ''}</span>
                                                <BotonesSiNo
                                                    value={datos[c.id]}
                                                    onChange={(v) => manejarCambio(c.id, v)}
                                                    disabled={!modoEdicion}
                                                />
                                            </div>
                                            {errores[c.id] && <span className="campo-error-msg">⚠ {errores[c.id]}</span>}
                                        </div>
                                    ))}
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
