import { useState, useEffect } from 'react';
import { TODOS_LOS_GRADOS, TURNOS } from '../../constants/estructuraEscolar';
import { getAlumnos, agregarAlumno, actualizarGradoAlumnoRegular } from '../../data/mockAlumnos';
import { IconoGuardar, IconoBuscar } from '../../components/Iconos';
import './Inscribir.css';

// ─── Constantes ───────────────────────────────────────────────────────────────
const TABS = [
    { id: 'estudiante',    label: '1. Datos del Estudiante' },
    { id: 'especiales',   label: '2. Necesidades Especiales' },
    { id: 'padres',       label: '3. Padres y Comunidad' },
    { id: 'representante',label: '4. Representante' },
    { id: 'pareja',       label: '5. Situación de la Pareja' },
    { id: 'vivienda',     label: '6. Vivienda' },
    { id: 'habitantes',   label: '7. Habitantes' },
    { id: 'servicios',    label: '8. Servicios Básicos' },
    { id: 'otros',        label: '9. Otros' },
];

const REG_SOLO_LETRAS = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
const REG_TELEFONO    = /^[0-9\-\+\s]{7,15}$/;
const REG_EMAIL       = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REG_CEDULA      = /^[VEve]-?\d{5,10}$/;

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

// ─── Componentes auxiliares FUERA del componente principal ────────────────────
// (definirlos dentro causaría re-montaje en cada render y pérdida de foco)

function CampoTexto({ label, value, onChange, error, placeholder, tipo = 'text', span, requerido, min, max }) {
    return (
        <div className="campo-grupo" style={span ? { gridColumn: '1 / -1' } : {}}>
            <label className="campo-label">{label}{requerido ? ' *' : ''}</label>
            <input
                type={tipo}
                className={`campo-input${error ? ' campo-input--error' : ''}`}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                min={min}
                max={max}
            />
            {error && <span className="campo-error-msg">⚠ {error}</span>}
        </div>
    );
}

function BotonesSiNo({ value, onChange }) {
    return (
        <div className="pills-sino-container" style={{ width: '120px' }}>
            <button type="button"
                className={`pill-sino-btn ${value === true ? 'pill-sino-btn--si-activo' : ''}`}
                onClick={() => onChange(true)}>SÍ</button>
            <button type="button"
                className={`pill-sino-btn ${value === false ? 'pill-sino-btn--no-activo' : ''}`}
                onClick={() => onChange(false)}>NO</button>
        </div>
    );
}

// ─── Lógica de validación por pestaña ────────────────────────────────────────
function validarTab(tabId, form) {
    const e = {};

    if (tabId === 'estudiante') {
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

        const edadNum = parseInt(form.edad, 10);
        if (!form.edad)
            e.edad = 'La edad es obligatoria.';
        else if (isNaN(edadNum) || edadNum < 3 || edadNum > 18)
            e.edad = 'La edad debe estar entre 3 y 18 años.';

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
            e.ciMadre = 'Formato: V-12345678.';
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
            e.ciPadre = 'Formato: V-12345678.';
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
            e.ciRepresentante = 'Formato: V-12345678.';
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
    return TABS.reduce((acc, t) => ({ ...acc, ...validarTab(t.id, form) }), {});
}

// Calcula la edad en años cumplidos en base a la fecha de nacimiento (YYYY-MM-DD)
function calcularEdad(fechaStr) {
    if (!fechaStr) return '';
    const nac = new Date(fechaStr + 'T00:00:00');
    if (isNaN(nac.getTime())) return '';
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const mesDif = hoy.getMonth() - nac.getMonth();
    if (mesDif < 0 || (mesDif === 0 && hoy.getDate() < nac.getDate())) {
        edad--;
    }
    return edad >= 0 ? String(edad) : '0';
}

// ─────────────────────────────────────────────────────────────────────────────
function Inscribir() {
    const [gradoSeleccionado, setGradoSeleccionado] = useState('1er Grado');
    const [esRegular, setEsRegular]                 = useState(null);
    const [busquedaRegular, setBusquedaRegular]     = useState('');
    const [alumnoEncontrado, setAlumnoEncontrado]   = useState(null);
    const [nuevaSeccion, setNuevaSeccion]            = useState('A');
    const [turnoNuevo, setTurnoNuevo]               = useState(TURNOS.MANANA);
    const [seccionNueva, setSeccionNueva]            = useState('');
    const [tabActiva, setTabActiva]                 = useState('estudiante');
    const [errores, setErrores]                     = useState({});
    const [mensajeExito, setMensajeExito]           = useState('');

    const [datosForm, setDatosForm] = useState({
        // Sección 1
        fechaIngreso: '', cedulaEscolar: '',
        apellidos: '', nombres: '',
        lugarNacimiento: '', fechaNacimiento: '', edad: '',
        nacionalidad: '', direccionEstudiante: '',
        literal: '',
        genero: '', lateralidad: '',
        institucionOrigen: '', medicamentoFiebre: '', alergias: '',
        // Sección 2
        diagnosticoEspecial: '', medicoTratante: '', telefonoMedico: '', equipoApoyo: '',
        // Sección 3 – Madre
        nombreMadre: '', ciMadre: '', instruccionMadre: '', ocupacionMadre: '',
        lugarTrabajoMadre: '', direccionTrabajoMadre: '', telefonoMadre: '', correoMadre: '',
        // Sección 3 – Padre
        nombrePadre: '', ciPadre: '', instruccionPadre: '', ocupacionPadre: '',
        lugarTrabajoPadre: '', direccionTrabajoPadre: '', telefonoPadre: '', correoPadre: '',
        // Sección 3 – Comunidad
        liderCalle: '', nombreComuna: '', direccionResidencia: '', centroVotacion: '',
        // Sección 4
        nombreRepresentante: '', ciRepresentante: '', ocupacionRepresentante: '',
        telefonoRepresentante: '', correoRepresentante: '', direccionRepresentante: '',
        // Sección 5
        situacionPareja: '',
        // Sección 6
        tipoVivienda: '', cuartosVivienda: '', materialParedes: '', materialTecho: '',
        // Sección 7
        cantidadPersonasVivienda: '', familiasEnVivienda: '', numeroHermanos: '',
        // Sección 8
        servicioAgua: null, servicioDesague: null, servicioElectricidad: null,
        servicioTelefonia: null, servicioInternet: null,
        // Sección 9
        banosBuenEstado: null, tienePoceta: null, tieneDucha: null, tieneLavamanos: null,
        servicioAseoFrecuente: null, aguaPotableContinua: '',
        recibeGasFrecuente: null, participaComunidad: null, colaboraEscuela: null,
    });

    const cambiar = (campo, valor) => {
        setDatosForm((prev) => {
            const nuevo = { ...prev, [campo]: valor };
            if (campo === 'fechaNacimiento') {
                nuevo.edad = calcularEdad(valor);
            }
            return nuevo;
        });
        if (errores[campo]) setErrores((prev) => { const e = { ...prev }; delete e[campo]; return e; });
        if (campo === 'fechaNacimiento' && errores.edad) {
            setErrores((prev) => { const e = { ...prev }; delete e.edad; return e; });
        }
    };

    const listaExistente   = getAlumnos();
    const resultadosBusqueda = busquedaRegular
        ? listaExistente.filter((a) =>
            a.nombres.toLowerCase().includes(busquedaRegular.toLowerCase()) ||
            a.apellidos.toLowerCase().includes(busquedaRegular.toLowerCase()) ||
            a.cedulaEscolar.toLowerCase().includes(busquedaRegular.toLowerCase())
          )
        : [];

    const tabIndex = TABS.findIndex((t) => t.id === tabActiva);

    const handleSiguiente = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const errTab = validarTab(tabActiva, datosForm);
        if (Object.keys(errTab).length > 0) {
            setErrores((prev) => ({ ...prev, ...errTab }));
            return;
        }
        setErrores({});
        setTabActiva(TABS[tabIndex + 1].id);
    };

    const handleAtras = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setErrores({});
        setTabActiva(TABS[tabIndex - 1].id);
    };

    const handleReinscribir = (e) => {
        e.preventDefault();
        if (!alumnoEncontrado) return;
        actualizarGradoAlumnoRegular(alumnoEncontrado.id, gradoSeleccionado, nuevaSeccion);
        setMensajeExito(`${alumnoEncontrado.nombres} ${alumnoEncontrado.apellidos} re-inscrito en ${gradoSeleccionado} "${nuevaSeccion}".`);
        reset();
    };

    const handleGuardar = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const errTotal = validarTodo(datosForm);
        if (Object.keys(errTotal).length > 0) {
            setErrores(errTotal);
            const primerCampo = Object.keys(errTotal)[0];
            if (CAMPO_A_TAB[primerCampo]) setTabActiva(CAMPO_A_TAB[primerCampo]);
            return;
        }
        const creado = agregarAlumno({
            ...datosForm,
            gradoNivel: gradoSeleccionado,
            turno: turnoNuevo,
            seccionLiteral: seccionNueva || datosForm.literal || 'A',
        });
        setMensajeExito('Alumno Registrado con éxito');
        reset();
    };

    const reset = () => {
        setEsRegular(null);
        setAlumnoEncontrado(null);
        setBusquedaRegular('');
        setSeccionNueva('');
        setTabActiva('estudiante');
        setErrores({});
        setTimeout(() => setMensajeExito(''), 4500);
    };

    // ── Helpers para hacer el JSX más limpio ──────────────────────────────────
    const F = (campo, label, placeholder, opts = {}) => (
        <CampoTexto
            key={campo}
            label={label}
            placeholder={placeholder}
            value={datosForm[campo]}
            onChange={(v) => cambiar(campo, v)}
            error={errores[campo]}
            tipo={opts.tipo}
            span={opts.span}
            requerido={opts.req}
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
        { id: 'banosBuenEstado',       label: 'Baños en buen estado' },
        { id: 'tienePoceta',           label: 'Tiene poceta' },
        { id: 'tieneDucha',            label: 'Tiene ducha' },
        { id: 'tieneLavamanos',        label: 'Tiene lavamanos' },
        { id: 'servicioAseoFrecuente', label: 'Servicio de aseo frecuente' },
        { id: 'recibeGasFrecuente',    label: 'Recibe gas frecuente' },
        { id: 'participaComunidad',    label: 'Participa en la comunidad' },
        { id: 'colaboraEscuela',       label: 'Colabora con la escuela' },
    ];

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="inscribir-modulo">
            <header className="inscribir-header">
                <h1 className="inscribir-header__titulo">Proceso de Inscripción Escolar</h1>
                <p className="inscribir-header__sub">U.E.M. Gregorio Romero — Registro e Inscripción de Alumnos</p>
            </header>

            {mensajeExito && <div className="inscribir-alerta-exito">{mensajeExito}</div>}

            {/* PASO 1 */}
            <div className="inscribir-card-paso1">
                <div className="inscribir-paso1-grid">
                    <div className="campo-grupo">
                        <label className="campo-label">1. Seleccionar Grado / Nivel Objetivo</label>
                        <select className="campo-select" value={gradoSeleccionado}
                            onChange={(e) => setGradoSeleccionado(e.target.value)}>
                            {TODOS_LOS_GRADOS.map((g) => (
                                <option key={g.id} value={g.nombre}>{g.nivel}: {g.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="campo-grupo">
                        <label className="campo-label">2. ¿El alumno es regular de la institución?</label>
                        <div className="pills-sino-container">
                            <button type="button"
                                className={`pill-sino-btn ${esRegular === true ? 'pill-sino-btn--si-activo' : ''}`}
                                onClick={() => { setEsRegular(true); setAlumnoEncontrado(null); }}>
                                SÍ (Re-inscripción)
                            </button>
                            <button type="button"
                                className={`pill-sino-btn ${esRegular === false ? 'pill-sino-btn--no-activo' : ''}`}
                                onClick={() => setEsRegular(false)}>
                                NO (Nuevo Ingreso)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CAMINO A: Alumno Regular */}
            {esRegular === true && (
                <div className="inscribir-card-regular">
                    <h2 className="inscribir-seccion-titulo">Buscar Alumno en el Sistema</h2>
                    <div className="busqueda-regular-box">
                        <span className="busqueda-icon"><IconoBuscar size={18} /></span>
                        <input type="text" className="campo-input"
                            placeholder="Nombre, apellido o cédula escolar..."
                            value={busquedaRegular}
                            onChange={(e) => setBusquedaRegular(e.target.value)} />
                    </div>

                    {busquedaRegular && !alumnoEncontrado && (
                        <div className="resultados-regular-lista">
                            {resultadosBusqueda.length > 0 ? resultadosBusqueda.map((a) => (
                                <div key={a.id} className="resultado-regular-item" onClick={() => setAlumnoEncontrado(a)}>
                                    <div>
                                        <strong>{a.apellidos}, {a.nombres}</strong>
                                        <p>{a.cedulaEscolar} — {a.gradoNivel} &quot;{a.seccionLiteral}&quot;</p>
                                    </div>
                                    <button type="button" className="btn-seleccionar-regular">Seleccionar</button>
                                </div>
                            )) : (
                                <div className="busqueda-vacia"><p>No se encontraron alumnos.</p></div>
                            )}
                        </div>
                    )}

                    {alumnoEncontrado && (
                        <form onSubmit={handleReinscribir} className="form-confirmar-regular">
                            <div className="resumen-alumno-regular">
                                <h3>Alumno Seleccionado:</h3>
                                <p><strong>Nombre:</strong> {alumnoEncontrado.nombres} {alumnoEncontrado.apellidos}</p>
                                <p><strong>Cédula:</strong> {alumnoEncontrado.cedulaEscolar}</p>
                                <p><strong>Grado Anterior:</strong> {alumnoEncontrado.gradoNivel} &quot;{alumnoEncontrado.seccionLiteral}&quot;</p>
                            </div>
                            <div className="form-grid-2" style={{ marginTop: '16px' }}>
                                <div className="campo-grupo">
                                    <label className="campo-label">Nuevo Grado</label>
                                    <input type="text" className="campo-input" disabled value={gradoSeleccionado} />
                                </div>
                                <div className="campo-grupo">
                                    <label className="campo-label">Asignar Sección</label>
                                    <select className="campo-select" value={nuevaSeccion}
                                        onChange={(e) => setNuevaSeccion(e.target.value)}>
                                        <option value="A">Sección A</option>
                                        <option value="B">Sección B</option>
                                        <option value="C">Sección C</option>
                                        <option value="D">Sección D</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="btn-guardar-inscripcion">
                                <IconoGuardar size={18} /><span>Guardar Re-inscripción</span>
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* CAMINO B: Nuevo Ingreso */}
            {esRegular === false && (
                <form onSubmit={handleGuardar} className="inscribir-card-nuevo">

                    {/* Cabecera mínima: Turno */}
                    <div className="encabezado-nuevo-ingreso">
                        <div className="datos-clave-header">
                            <div className="campo-grupo" style={{ maxWidth: '280px' }}>
                                <label className="campo-label">Horario / Turno *</label>
                                <select className="campo-select" value={turnoNuevo}
                                    onChange={(e) => setTurnoNuevo(e.target.value)}>
                                    <option value={TURNOS.MANANA}>{TURNOS.MANANA}</option>
                                    <option value={TURNOS.TARDE}>{TURNOS.TARDE}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="inscribir-wizard-barra">
                        <span className="inscribir-wizard-paso">Paso {tabIndex + 1} de {TABS.length}</span>
                        <div className="inscribir-wizard-track">
                            {TABS.map((t, i) => (
                                <div key={t.id}
                                    className={`inscribir-wizard-seg ${i < tabIndex ? 'completado' : ''} ${i === tabIndex ? 'activo' : ''}`} />
                            ))}
                        </div>
                    </div>

                    {/* Contenido */}
                    <div className="alumnos-card">

                        {/* ── 1. Datos del Estudiante ───────────────────────── */}
                        {tabActiva === 'estudiante' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">1</span>
                                    <h2 className="seccion-titulo-texto">Datos del Estudiante</h2>
                                </div>

                                {/* Fila 1: Fecha inscripción + Cédula Escolar */}
                                <div className="form-grid-2">
                                    {F('fechaIngreso', 'Fecha de Inscripción', '', { tipo: 'date' })}
                                    {F('cedulaEscolar', 'Cédula Escolar', 'V-1234567890', { req: true })}
                                </div>

                                {/* Fila 2: Apellidos + Nombres */}
                                <div className="form-grid-2">
                                    {F('apellidos', 'Apellidos', 'Apellidos completos', { req: true })}
                                    {F('nombres', 'Nombres', 'Nombres completos', { req: true })}
                                </div>

                                {/* Fila 3: Lugar Nacimiento + Fecha Nacimiento + Edad */}
                                <div className="form-grid-3">
                                    {F('lugarNacimiento', 'Lugar de Nacimiento', 'Ciudad / Estado')}
                                    {F('fechaNacimiento', 'Fecha de Nacimiento', '', { tipo: 'date' })}
                                    {F('edad', 'Edad (Años)', 'Ej: 6', { tipo: 'number', req: true, min: 3, max: 18 })}
                                </div>

                                {/* Fila 4: Nacionalidad + Dirección */}
                                <div className="form-grid-2">
                                    <CampoTexto
                                        label="Nacionalidad"
                                        placeholder="Venezolana"
                                        value={datosForm.nacionalidad}
                                        onChange={(v) => cambiar('nacionalidad', v)}
                                        error={errores.nacionalidad}
                                    />
                                    {F('direccionEstudiante', 'Dirección', 'Calle, sector, casa...')}
                                </div>

                                {/* Fila 5: Grado/Nivel + Sección + Literal */}
                                <div className="form-grid-3">
                                    <div className="campo-grupo">
                                        <label className="campo-label">Grado o Nivel</label>
                                        <select className="campo-select" value={gradoSeleccionado}
                                            onChange={(e) => setGradoSeleccionado(e.target.value)}>
                                            {TODOS_LOS_GRADOS.map((g) => (
                                                <option key={g.id} value={g.nombre}>{g.nivel}: {g.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="campo-grupo">
                                        <label className="campo-label">Sección (A, B, C o D)</label>
                                        <select className="campo-select" value={seccionNueva}
                                            onChange={(e) => setSeccionNueva(e.target.value)}>
                                            <option value="">Seleccione...</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                        </select>
                                    </div>
                                    <div className="campo-grupo">
                                        <label className="campo-label">Literal (A, B, C, D)</label>
                                        <select className="campo-select" value={datosForm.literal}
                                            onChange={(e) => cambiar('literal', e.target.value)}>
                                            <option value="">Seleccione...</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Fila 6: Género + Lateralidad */}
                                <div className="form-grid-2">
                                    <div className="campo-grupo">
                                        <label className="campo-label">Género *</label>
                                        <div className="pills-sino-container">
                                            <button type="button"
                                                className={`pill-sino-btn ${datosForm.genero === 'Varón' ? 'pill-sino-btn--si-activo' : ''}`}
                                                onClick={() => cambiar('genero', 'Varón')}>Varón</button>
                                            <button type="button"
                                                className={`pill-sino-btn ${datosForm.genero === 'Hembra' ? 'pill-sino-btn--si-activo' : ''}`}
                                                onClick={() => cambiar('genero', 'Hembra')}>Hembra</button>
                                        </div>
                                        {errores.genero && <span className="campo-error-msg">⚠ {errores.genero}</span>}
                                    </div>
                                    <div className="campo-grupo">
                                        <label className="campo-label">Lateralidad</label>
                                        <div className="pills-sino-container">
                                            <button type="button"
                                                className={`pill-sino-btn ${datosForm.lateralidad === 'Derecho' ? 'pill-sino-btn--activo' : ''}`}
                                                onClick={() => cambiar('lateralidad', 'Derecho')}>Derecho</button>
                                            <button type="button"
                                                className={`pill-sino-btn ${datosForm.lateralidad === 'Izquierdo' ? 'pill-sino-btn--activo' : ''}`}
                                                onClick={() => cambiar('lateralidad', 'Izquierdo')}>Izquierdo</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Fila 7–9: Institución, Fiebre, Alergias */}
                                <div className="form-grid-1">
                                    {F('institucionOrigen', 'Institución de donde Proviene', 'Nombre del plantel anterior', { span: true })}
                                </div>
                                <div className="form-grid-2">
                                    {F('medicamentoFiebre', 'En caso de fiebre, ¿qué se le puede suministrar?', 'Acetaminofén, Paracetamol...')}
                                    {F('alergias', 'Alérgico a:', 'Alimentos, medicamentos...')}
                                </div>
                            </section>
                        )}

                        {/* ── 2. Diagnóstico / Necesidades Especiales ──────── */}
                        {tabActiva === 'especiales' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">2</span>
                                    <h2 className="seccion-titulo-texto">Diagnóstico o Necesidades Especiales</h2>
                                </div>
                                <div className="form-grid-1">
                                    {F('diagnosticoEspecial', 'Diagnóstico Médico (si aplica)', 'Condición médica o pedagógica especial', { span: true })}
                                </div>
                                <div className="form-grid-2">
                                    <CampoTexto label="Médico Tratante" placeholder="Nombre del especialista"
                                        value={datosForm.medicoTratante} onChange={(v) => cambiar('medicoTratante', v)} error={errores.medicoTratante} />
                                    <CampoTexto label="Teléfono del Médico" placeholder="0412-0000000"
                                        value={datosForm.telefonoMedico} onChange={(v) => cambiar('telefonoMedico', v)} error={errores.telefonoMedico} />
                                </div>
                                <div className="form-grid-1">
                                    {F('equipoApoyo', 'Equipo de Apoyo al que Asiste', 'Ej: Aula Integrada, CDI, Psicopedagogía', { span: true })}
                                </div>
                            </section>
                        )}

                        {/* ── 3. Padres y Comunidad ────────────────────────── */}
                        {tabActiva === 'padres' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">3</span>
                                    <h2 className="seccion-titulo-texto">Datos de los Padres y Comunidad</h2>
                                </div>

                                <h3 className="subseccion-titulo">Madre</h3>
                                <div className="form-grid-4">
                                    <CampoTexto label="Nombre de la Madre" placeholder="Nombres y apellidos"
                                        value={datosForm.nombreMadre} onChange={(v) => cambiar('nombreMadre', v)} error={errores.nombreMadre} requerido />
                                    <CampoTexto label="C.I. de la Madre" placeholder="V-00000000"
                                        value={datosForm.ciMadre} onChange={(v) => cambiar('ciMadre', v)} error={errores.ciMadre} />
                                    {F('instruccionMadre', 'Nivel de Instrucción', 'Bachiller, TSU, Univ.')}
                                    {F('ocupacionMadre', 'Ocupación', 'Oficio o profesión')}
                                    {F('lugarTrabajoMadre', 'Lugar de Trabajo', 'Empresa o institución')}
                                    {F('direccionTrabajoMadre', 'Dirección del Trabajo', 'Dirección laboral')}
                                    <CampoTexto label="Teléfono de la Madre" placeholder="0414-0000000"
                                        value={datosForm.telefonoMadre} onChange={(v) => cambiar('telefonoMadre', v)} error={errores.telefonoMadre} requerido />
                                    <CampoTexto label="Correo de la Madre" placeholder="correo@ejemplo.com" tipo="email"
                                        value={datosForm.correoMadre} onChange={(v) => cambiar('correoMadre', v)} error={errores.correoMadre} />
                                </div>

                                <h3 className="subseccion-titulo" style={{ marginTop: '20px' }}>Padre</h3>
                                <div className="form-grid-4">
                                    <CampoTexto label="Nombre del Padre" placeholder="Nombres y apellidos"
                                        value={datosForm.nombrePadre} onChange={(v) => cambiar('nombrePadre', v)} error={errores.nombrePadre} requerido />
                                    <CampoTexto label="C.I. del Padre" placeholder="V-00000000"
                                        value={datosForm.ciPadre} onChange={(v) => cambiar('ciPadre', v)} error={errores.ciPadre} />
                                    {F('instruccionPadre', 'Nivel de Instrucción', 'Bachiller, TSU, Univ.')}
                                    {F('ocupacionPadre', 'Ocupación', 'Oficio o profesión')}
                                    {F('lugarTrabajoPadre', 'Lugar de Trabajo', 'Empresa o institución')}
                                    {F('direccionTrabajoPadre', 'Dirección del Trabajo', 'Dirección laboral')}
                                    <CampoTexto label="Teléfono del Padre" placeholder="0414-0000000"
                                        value={datosForm.telefonoPadre} onChange={(v) => cambiar('telefonoPadre', v)} error={errores.telefonoPadre} requerido />
                                    <CampoTexto label="Correo del Padre" placeholder="correo@ejemplo.com" tipo="email"
                                        value={datosForm.correoPadre} onChange={(v) => cambiar('correoPadre', v)} error={errores.correoPadre} />
                                </div>

                                <h3 className="subseccion-titulo" style={{ marginTop: '20px' }}>Comunidad</h3>
                                <div className="form-grid-3">
                                    {F('liderCalle', 'Líder de Calle', 'Nombre del líder')}
                                    {F('nombreComuna', 'Nombre de la Comunidad / Comuna', 'Nombre de la comunidad')}
                                    {F('centroVotacion', 'Centro de Votación', 'Centro de votación')}
                                    {F('direccionResidencia', 'Dirección de Residencia', 'Calle, sector, casa o apartamento', { span: true })}
                                </div>
                            </section>
                        )}

                        {/* ── 4. Representante Legal ────────────────────────── */}
                        {tabActiva === 'representante' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">4</span>
                                    <h2 className="seccion-titulo-texto">Nombre del Representante</h2>
                                </div>
                                <div className="form-grid-3">
                                    <CampoTexto label="Nombre y Apellido" placeholder="Nombre completo"
                                        value={datosForm.nombreRepresentante} onChange={(v) => cambiar('nombreRepresentante', v)} error={errores.nombreRepresentante} requerido />
                                    <CampoTexto label="Cédula de Identidad" placeholder="V-00000000"
                                        value={datosForm.ciRepresentante} onChange={(v) => cambiar('ciRepresentante', v)} error={errores.ciRepresentante} />
                                    {F('ocupacionRepresentante', 'Ocupación', 'Oficio o profesión')}
                                    <CampoTexto label="Teléfono de Contacto" placeholder="0416-0000000"
                                        value={datosForm.telefonoRepresentante} onChange={(v) => cambiar('telefonoRepresentante', v)} error={errores.telefonoRepresentante} requerido />
                                    <CampoTexto label="Correo Electrónico" placeholder="correo@ejemplo.com" tipo="email"
                                        value={datosForm.correoRepresentante} onChange={(v) => cambiar('correoRepresentante', v)} error={errores.correoRepresentante} />
                                    {F('direccionRepresentante', 'Dirección del Representante', 'Dirección completa', { span: true })}
                                </div>
                            </section>
                        )}

                        {/* ── 5. Situación de la Pareja ─────────────────────── */}
                        {tabActiva === 'pareja' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">5</span>
                                    <h2 className="seccion-titulo-texto">Situación de la Pareja</h2>
                                </div>
                                <div className="pills-grupo-opciones">
                                    {['Soltero/a', 'Casado/a', 'Concubino/a', 'Divorciado/a', 'Viudo/a'].map((op) => (
                                        <button key={op} type="button"
                                            className={`pill-opcion-btn ${datosForm.situacionPareja === op ? 'pill-opcion-btn--activo' : ''}`}
                                            onClick={() => cambiar('situacionPareja', op)}>{op}</button>
                                    ))}
                                </div>
                                {errores.situacionPareja && <span className="campo-error-msg">⚠ {errores.situacionPareja}</span>}
                            </section>
                        )}

                        {/* ── 6. Vivienda ───────────────────────────────────── */}
                        {tabActiva === 'vivienda' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">6</span>
                                    <h2 className="seccion-titulo-texto">Vivienda</h2>
                                </div>
                                <div className="form-grid-4">
                                    <div className="campo-grupo">
                                        <label className="campo-label">Condición de la Casa *</label>
                                        <select className={`campo-select${errores.tipoVivienda ? ' campo-input--error' : ''}`}
                                            value={datosForm.tipoVivienda}
                                            onChange={(e) => cambiar('tipoVivienda', e.target.value)}>
                                            <option value="" disabled>Seleccione...</option>
                                            <option value="Propia">Propia</option>
                                            <option value="Alquilada">Alquilada</option>
                                            <option value="Otros">Otros</option>
                                        </select>
                                        {errores.tipoVivienda && <span className="campo-error-msg">⚠ {errores.tipoVivienda}</span>}
                                    </div>
                                    <CampoTexto label="Número de Cuartos" placeholder="Ej: 3" tipo="number"
                                        value={datosForm.cuartosVivienda} onChange={(v) => cambiar('cuartosVivienda', v)} error={errores.cuartosVivienda} min={1} />
                                    <div className="campo-grupo">
                                        <label className="campo-label">Material de las Paredes</label>
                                        <select className="campo-select" value={datosForm.materialParedes}
                                            onChange={(e) => cambiar('materialParedes', e.target.value)}>
                                            <option value="" disabled>Seleccione...</option>
                                            <option value="Concreto">Concreto</option>
                                            <option value="Madera">Madera</option>
                                            <option value="Adobe">Adobe</option>
                                            <option value="Otros">Otros</option>
                                        </select>
                                    </div>
                                    <div className="campo-grupo">
                                        <label className="campo-label">Material del Techo</label>
                                        <select className="campo-select" value={datosForm.materialTecho}
                                            onChange={(e) => cambiar('materialTecho', e.target.value)}>
                                            <option value="" disabled>Seleccione...</option>
                                            <option value="Madera">Madera</option>
                                            <option value="Adobe">Adobe</option>
                                            <option value="Zinc">Zinc</option>
                                            <option value="Concreto">Concreto</option>
                                            <option value="Otros">Otros</option>
                                        </select>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* ── 7. Habitantes ─────────────────────────────────── */}
                        {tabActiva === 'habitantes' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">7</span>
                                    <h2 className="seccion-titulo-texto">Habitantes</h2>
                                </div>
                                <div className="form-grid-3">
                                    <CampoTexto label="Personas en la Vivienda" placeholder="Cantidad total" tipo="number"
                                        value={datosForm.cantidadPersonasVivienda} onChange={(v) => cambiar('cantidadPersonasVivienda', v)} error={errores.cantidadPersonasVivienda} min={1} />
                                    <CampoTexto label="Familias en la Vivienda" placeholder="Número de familias" tipo="number"
                                        value={datosForm.familiasEnVivienda} onChange={(v) => cambiar('familiasEnVivienda', v)} error={errores.familiasEnVivienda} min={1} />
                                    <CampoTexto label="Número de Hermanos" placeholder="Cantidad de hermanos" tipo="number"
                                        value={datosForm.numeroHermanos} onChange={(v) => cambiar('numeroHermanos', v)} error={errores.numeroHermanos} min={0} />
                                </div>
                            </section>
                        )}

                        {/* ── 8. Servicios Básicos ──────────────────────────── */}
                        {tabActiva === 'servicios' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">8</span>
                                    <h2 className="seccion-titulo-texto">Servicios Básicos</h2>
                                </div>
                                <div className="grid-condiciones-sanitarias">
                                    {condItems8.map((s) => (
                                        <div key={s.id} className="condicion-card-box">
                                            <div className={`condicion-item ${errores[s.id] ? 'condicion-item--error' : ''}`}>
                                                <span className="condicion-texto">{s.label} *</span>
                                                <BotonesSiNo value={datosForm[s.id]} onChange={(v) => cambiar(s.id, v)} />
                                            </div>
                                            {errores[s.id] && <span className="campo-error-msg">⚠ {errores[s.id]}</span>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── 9. Otros / Condiciones del Hogar ─────────────── */}
                        {tabActiva === 'otros' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">9</span>
                                    <h2 className="seccion-titulo-texto">Otros (Condiciones del Hogar)</h2>
                                </div>

                                <div className="condicion-card-box" style={{ marginBottom: '16px' }}>
                                    <div className={`condicion-item ${errores.aguaPotableContinua ? 'condicion-item--error' : ''}`}>
                                        <span className="condicion-texto">Agua Potable Continua *</span>
                                        <div className="pills-sino-container" style={{ width: '210px' }}>
                                            {['Sí', 'No', 'A veces'].map((op) => (
                                                <button key={op} type="button"
                                                    className={`pill-sino-btn ${datosForm.aguaPotableContinua === op ? 'pill-sino-btn--si-activo' : ''}`}
                                                    onClick={() => cambiar('aguaPotableContinua', op)}>{op}</button>
                                            ))}
                                        </div>
                                    </div>
                                    {errores.aguaPotableContinua && <span className="campo-error-msg">⚠ {errores.aguaPotableContinua}</span>}
                                </div>

                                <div className="grid-condiciones-sanitarias">
                                    {condItems9.map((s) => (
                                        <div key={s.id} className="condicion-card-box">
                                            <div className={`condicion-item ${errores[s.id] ? 'condicion-item--error' : ''}`}>
                                                <span className="condicion-texto">{s.label} *</span>
                                                <BotonesSiNo value={datosForm[s.id]} onChange={(v) => cambiar(s.id, v)} />
                                            </div>
                                            {errores[s.id] && <span className="campo-error-msg">⚠ {errores[s.id]}</span>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>

                    {/* Navegación Siguiente / Atrás */}
                    <div className="inscribir-wizard-nav">
                        <button
                            type="button"
                            key="btn-atras"
                            className="wizard-btn wizard-btn--atras"
                            disabled={tabIndex === 0}
                            onClick={handleAtras}
                        >
                            ← Atrás
                        </button>
                        <span className="wizard-paso-texto">
                            Sección {tabIndex + 1} de {TABS.length}
                        </span>
                        {tabIndex < TABS.length - 1 ? (
                            <button
                                type="button"
                                key="btn-siguiente"
                                className="wizard-btn wizard-btn--siguiente"
                                onClick={handleSiguiente}
                            >
                                Siguiente →
                            </button>
                        ) : (
                            <button
                                type="button"
                                key="btn-guardar"
                                className="btn-guardar-inscripcion"
                                onClick={handleGuardar}
                            >
                                <IconoGuardar size={16} /><span>Guardar Inscripción</span>
                            </button>
                        )}
                    </div>

                </form>
            )}
        </div>
    );
}

export default Inscribir;
