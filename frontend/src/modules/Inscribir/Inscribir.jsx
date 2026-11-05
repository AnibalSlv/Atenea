import { useState } from 'react';
import { TODOS_LOS_GRADOS, TURNOS } from '../../constants/estructuraEscolar';
import { getAlumnos, agregarAlumno, actualizarGradoAlumnoRegular } from '../../data/mockAlumnos';
import { IconoGuardar, IconoBuscar } from '../../components/Iconos';
import './Inscribir.css';

function Inscribir() {
    // Paso 1: Selección inicial de flujo
    const [gradoSeleccionado, setGradoSeleccionado] = useState('1er Grado');
    const [esRegular, setEsRegular] = useState(null); // true | false | null

    // Flujo Alumno Regular (SÍ)
    const [busquedaRegular, setBusquedaRegular] = useState('');
    const [alumnoRegularEncontrado, setAlumnoRegularEncontrado] = useState(null);
    const [nuevaSeccionRegular, setNuevaSeccionRegular] = useState('A');

    // Flujo Nuevo Ingreso (NO)
    const [turnoNuevo, setTurnoNuevo] = useState(TURNOS.MANANA);
    const [seccionNueva, setSeccionNueva] = useState('A');
    const [seccionTabActiva, setSeccionTabActiva] = useState('personales');

    // Formulario de Nuevo Ingreso (Ficha completa)
    const [datosForm, setDatosForm] = useState({
        cedulaEscolar: '',
        apellidos: '',
        nombres: '',
        lugarNacimiento: '',
        fechaNacimiento: '',
        edad: '',
        nacionalidad: '',
        lateralidad: '',
        institucionOrigen: '',
        medicamentoFiebre: '',
        alergias: '',
        diagnosticoEspecial: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',
        nombreMadre: '',
        ciMadre: '',
        instruccionMadre: '',
        ocupacionMadre: '',
        lugarTrabajoMadre: '',
        direccionTrabajoMadre: '',
        telefonoMadre: '',
        correoMadre: '',
        liderCalle: '',
        nombreComuna: '',
        direccionResidencia: '',
        centroVotacion: '',
        nombreRepresentante: '',
        ciRepresentante: '',
        ocupacionRepresentante: '',
        direccionRepresentante: '',
        telefonoRepresentante: '',
        correoRepresentante: '',
        situacionPareja: 'Casado',
        tipoVivienda: 'Propia',
        cuartosVivienda: '',
        materialParedes: 'Concreto',
        materialTecho: 'Zinc',
        cantidadPersonasVivienda: '',
        familiasEnVivienda: '',
        numeroHermanos: '',
        servicioAgua: null,
        servicioDesague: null,
        servicioElectricidad: null,
        servicioTelefonia: null,
        servicioInternet: null,
        banosBuenEstado: null,
        tienePoceta: null,
        tieneDucha: null,
        tieneLavamanos: null,
        servicioAseoFrecuente: null,
        aguaPotableContinua: '',
        participaComunidad: null,
        recibeGasFrecuente: null,
        colaboraEscuela: null,
    });

    const [mensajeExito, setMensajeExito] = useState('');

    const manejarCambio = (campo, valor) => {
        setDatosForm((prev) => ({ ...prev, [campo]: valor }));
    };

    // Alumnos almacenados en el mock local
    const listaExistente = getAlumnos();
    const resultadosBusqueda = busquedaRegular
        ? listaExistente.filter(
            (a) =>
                a.nombres.toLowerCase().includes(busquedaRegular.toLowerCase()) ||
                a.apellidos.toLowerCase().includes(busquedaRegular.toLowerCase()) ||
                a.cedulaEscolar.toLowerCase().includes(busquedaRegular.toLowerCase())
        )
        : [];

    // Guardar Re-inscripción (Alumno Regular)
    const handleReinscribir = (e) => {
        e.preventDefault();
        if (!alumnoRegularEncontrado) return;

        actualizarGradoAlumnoRegular(
            alumnoRegularEncontrado.id,
            gradoSeleccionado,
            nuevaSeccionRegular
        );

        setMensajeExito(
            `Alumno ${alumnoRegularEncontrado.nombres} ${alumnoRegularEncontrado.apellidos} re-inscrito exitosamente en ${gradoSeleccionado} "${nuevaSeccionRegular}".`
        );
        resetearFormulario();
    };

    // Guardar Nuevo Ingreso
    const handleGuardarNuevo = (e) => {
        e.preventDefault();

        const registroCompleto = {
            ...datosForm,
            gradoNivel: gradoSeleccionado,
            turno: turnoNuevo,
            seccionLiteral: seccionNueva,
        };

        const creado = agregarAlumno(registroCompleto);

        setMensajeExito(
            `Alumno registrado e inscrito con éxito bajo el correlativo ${creado.numeroCorrelativo}.`
        );
        resetearFormulario();
    };

    const resetearFormulario = () => {
        setEsRegular(null);
        setAlumnoRegularEncontrado(null);
        setBusquedaRegular('');
        setTimeout(() => setMensajeExito(''), 4000);
    };

    return (
        <div className="inscribir-modulo">
            <header className="inscribir-header">
                <div>
                    <h1 className="inscribir-header__titulo">Proceso de Inscripción Escolar</h1>
                    <p className="inscribir-header__sub">
                        U.E.M. Gregorio Romero — Registro e Inscripción de Alumnos
                    </p>
                </div>
            </header>

            {mensajeExito && (
                <div className="inscribir-alerta-exito">
                    <span>{mensajeExito}</span>
                </div>
            )}

            {/* PASO 1: SELECCIÓN DE GRADO Y PREGUNTA "¿EL NIÑO ES REGULAR?" */}
            <div className="inscribir-card-paso1">
                <div className="inscribir-paso1-grid">
                    <div className="campo-grupo">
                        <label className="campo-label">1. Seleccionar Grado / Nivel Objetivo</label>
                        <select
                            className="campo-select"
                            value={gradoSeleccionado}
                            onChange={(e) => setGradoSeleccionado(e.target.value)}
                        >
                            {TODOS_LOS_GRADOS.map((g) => (
                                <option key={g.id} value={g.nombre}>
                                    {g.nivel}: {g.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="campo-grupo">
                        <label className="campo-label">2. ¿El alumno es regular de la institución?</label>
                        <div className="pills-sino-container">
                            <button
                                type="button"
                                className={`pill-sino-btn ${esRegular === true ? 'pill-sino-btn--si-activo' : ''}`}
                                onClick={() => {
                                    setEsRegular(true);
                                    setAlumnoRegularEncontrado(null);
                                }}
                            >
                                SÍ (Re-inscripción)
                            </button>
                            <button
                                type="button"
                                className={`pill-sino-btn ${esRegular === false ? 'pill-sino-btn--no-activo' : ''}`}
                                onClick={() => setEsRegular(false)}
                            >
                                NO (Nuevo Ingreso)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CAMINO A: ALUMNO REGULAR (SÍ) */}
            {esRegular === true && (
                <div className="inscribir-card-regular">
                    <h2 className="inscribir-seccion-titulo">Buscar Alumno en el Sistema</h2>

                    <div className="busqueda-regular-box">
                        <span className="busqueda-icon">
                            <IconoBuscar size={18} />
                        </span>
                        <input
                            type="text"
                            className="campo-input"
                            placeholder="Ingrese nombre, apellido o cédula escolar del alumno..."
                            value={busquedaRegular}
                            onChange={(e) => setBusquedaRegular(e.target.value)}
                        />
                    </div>

                    {busquedaRegular && !alumnoRegularEncontrado && (
                        <div className="resultados-regular-lista">
                            {resultadosBusqueda.length > 0 ? (
                                resultadosBusqueda.map((alumno) => (
                                    <div
                                        key={alumno.id}
                                        className="resultado-regular-item"
                                        onClick={() => setAlumnoRegularEncontrado(alumno)}
                                    >
                                        <div>
                                            <strong>{alumno.apellidos}, {alumno.nombres}</strong>
                                            <p>{alumno.cedulaEscolar} — Grado Actual: {alumno.gradoNivel} "{alumno.seccionLiteral}"</p>
                                        </div>
                                        <button type="button" className="btn-seleccionar-regular">
                                            Seleccionar
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="busqueda-vacia">
                                    <p>No se encontraron alumnos registrados con esos datos.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {alumnoRegularEncontrado && (
                        <form onSubmit={handleReinscribir} className="form-confirmar-regular">
                            <div className="resumen-alumno-regular">
                                <h3>Alumno Seleccionado:</h3>
                                <p><strong>Nombre:</strong> {alumnoRegularEncontrado.nombres} {alumnoRegularEncontrado.apellidos}</p>
                                <p><strong>Cédula Escolar:</strong> {alumnoRegularEncontrado.cedulaEscolar}</p>
                                <p><strong>Grado Anterior:</strong> {alumnoRegularEncontrado.gradoNivel} "{alumnoRegularEncontrado.seccionLiteral}"</p>
                            </div>

                            <div className="form-grid-2" style={{ marginTop: '16px' }}>
                                <div className="campo-grupo">
                                    <label className="campo-label">Nuevo Grado a Cursar</label>
                                    <input
                                        type="text"
                                        className="campo-input"
                                        disabled
                                        value={gradoSeleccionado}
                                    />
                                </div>

                                <div className="campo-grupo">
                                    <label className="campo-label">Asignar Sección</label>
                                    <select
                                        className="campo-select"
                                        value={nuevaSeccionRegular}
                                        onChange={(e) => setNuevaSeccionRegular(e.target.value)}
                                    >
                                        <option value="A">Sección A</option>
                                        <option value="B">Sección B</option>
                                        <option value="C">Sección C</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="btn-guardar-inscripcion">
                                <IconoGuardar size={18} />
                                <span>Guardar Re-inscripción</span>
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* CAMINO B: NUEVO INGRESO (NO) */}
            {esRegular === false && (
                <form onSubmit={handleGuardarNuevo} className="inscribir-card-nuevo">
                    <div className="encabezado-nuevo-ingreso">
                        <div className="datos-clave-header">
                            <div className="badge-correlativo">
                                <span>Número Correlativo: #{String(listaExistente.length + 1).padStart(3, '0')}</span>
                            </div>

                            <div className="form-grid-3" style={{ marginTop: '12px' }}>
                                <div className="campo-grupo">
                                    <label className="campo-label">Cédula Escolar *</label>
                                    <input
                                        type="text"
                                        className="campo-input"
                                        required
                                        placeholder="V-1234567890"
                                        value={datosForm.cedulaEscolar}
                                        onChange={(e) => manejarCambio('cedulaEscolar', e.target.value)}
                                    />
                                </div>

                                <div className="campo-grupo">
                                    <label className="campo-label">Nombres del Alumno *</label>
                                    <input
                                        type="text"
                                        className="campo-input"
                                        required
                                        placeholder="Nombres completos"
                                        value={datosForm.nombres}
                                        onChange={(e) => manejarCambio('nombres', e.target.value)}
                                    />
                                </div>

                                <div className="campo-grupo">
                                    <label className="campo-label">Apellidos del Alumno *</label>
                                    <input
                                        type="text"
                                        className="campo-input"
                                        required
                                        placeholder="Apellidos completos"
                                        value={datosForm.apellidos}
                                        onChange={(e) => manejarCambio('apellidos', e.target.value)}
                                    />
                                </div>

                                <div className="campo-grupo">
                                    <label className="campo-label">Edad (Años)</label>
                                    <input
                                        type="number"
                                        className="campo-input"
                                        placeholder="Ej: 6"
                                        value={datosForm.edad}
                                        onChange={(e) => manejarCambio('edad', e.target.value)}
                                    />
                                </div>

                                <div className="campo-grupo">
                                    <label className="campo-label">Horario / Turno *</label>
                                    <select
                                        className="campo-select"
                                        value={turnoNuevo}
                                        onChange={(e) => setTurnoNuevo(e.target.value)}
                                    >
                                        <option value={TURNOS.MANANA}>{TURNOS.MANANA}</option>
                                        <option value={TURNOS.TARDE}>{TURNOS.TARDE}</option>
                                    </select>
                                </div>

                                <div className="campo-grupo">
                                    <label className="campo-label">Sección Asignada</label>
                                    <select
                                        className="campo-select"
                                        value={seccionNueva}
                                        onChange={(e) => setSeccionNueva(e.target.value)}
                                    >
                                        <option value="A">Sección A</option>
                                        <option value="B">Sección B</option>
                                        <option value="C">Sección C</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="alumnos-tabs" style={{ marginTop: '20px' }}>
                        <button
                            type="button"
                            className={`alumnos-tab-btn ${seccionTabActiva === 'personales' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionTabActiva('personales')}
                        >
                            1. Datos Personales
                        </button>
                        <button
                            type="button"
                            className={`alumnos-tab-btn ${seccionTabActiva === 'especiales' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionTabActiva('especiales')}
                        >
                            2. Necesidades Especiales
                        </button>
                        <button
                            type="button"
                            className={`alumnos-tab-btn ${seccionTabActiva === 'padres' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionTabActiva('padres')}
                        >
                            3. Madre y Comunidad
                        </button>
                        <button
                            type="button"
                            className={`alumnos-tab-btn ${seccionTabActiva === 'representante' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionTabActiva('representante')}
                        >
                            4. Representante Legal
                        </button>
                        <button
                            type="button"
                            className={`alumnos-tab-btn ${seccionTabActiva === 'vivienda' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionTabActiva('vivienda')}
                        >
                            5. Vivienda y Familia
                        </button>
                        <button
                            type="button"
                            className={`alumnos-tab-btn ${seccionTabActiva === 'servicios' ? 'alumnos-tab-btn--activo' : ''}`}
                            onClick={() => setSeccionTabActiva('servicios')}
                        >
                            6. Servicios Sanitarios
                        </button>
                    </div>

                    <div className="alumnos-card" style={{ marginTop: '16px' }}>
                        {seccionTabActiva === 'personales' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">1</span>
                                    <h2 className="seccion-titulo-texto">Datos Personales y Médicos del Alumno</h2>
                                </div>
                                <div className="form-grid-4">
                                    <div className="campo-grupo">
                                        <label className="campo-label">Lugar de Nacimiento</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Ciudad / Estado"
                                            value={datosForm.lugarNacimiento}
                                            onChange={(e) => manejarCambio('lugarNacimiento', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            className="campo-input"
                                            value={datosForm.fechaNacimiento}
                                            onChange={(e) => manejarCambio('fechaNacimiento', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Nacionalidad</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Venezolana"
                                            value={datosForm.nacionalidad}
                                            onChange={(e) => manejarCambio('nacionalidad', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Lateralidad / Mano</label>
                                        <div className="pills-sino-container">
                                            <button
                                                type="button"
                                                className={`pill-sino-btn ${datosForm.lateralidad === 'Derecho' ? 'pill-sino-btn--activo' : ''}`}
                                                onClick={() => manejarCambio('lateralidad', 'Derecho')}
                                            >
                                                Derecho
                                            </button>
                                            <button
                                                type="button"
                                                className={`pill-sino-btn ${datosForm.lateralidad === 'Izquierdo' ? 'pill-sino-btn--activo' : ''}`}
                                                onClick={() => manejarCambio('lateralidad', 'Izquierdo')}
                                            >
                                                Izquierdo
                                            </button>
                                        </div>
                                    </div>

                                    <div className="campo-grupo" style={{ gridColumn: '1 / -1' }}>
                                        <label className="campo-label">Institución de donde Proviene</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Nombre del plantel anterior"
                                            value={datosForm.institucionOrigen}
                                            onChange={(e) => manejarCambio('institucionOrigen', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">En caso de fiebre suministrar:</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Acetaminofén, Paracetamol..."
                                            value={datosForm.medicamentoFiebre}
                                            onChange={(e) => manejarCambio('medicamentoFiebre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Alérgico a:</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Alimentos, medicamentos..."
                                            value={datosForm.alergias}
                                            onChange={(e) => manejarCambio('alergias', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {seccionTabActiva === 'especiales' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">2</span>
                                    <h2 className="seccion-titulo-texto">Diagnóstico o Necesidades Especiales</h2>
                                </div>
                                <div className="form-grid-4">
                                    <div className="campo-grupo" style={{ gridColumn: '1 / -1' }}>
                                        <label className="campo-label">Diagnóstico Médico (si aplica)</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Condición médica o pedagógica especial"
                                            value={datosForm.diagnosticoEspecial}
                                            onChange={(e) => manejarCambio('diagnosticoEspecial', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Médico Tratante</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Nombre del especialista"
                                            value={datosForm.medicoTratante}
                                            onChange={(e) => manejarCambio('medicoTratante', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Teléfono del Médico</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="0412-0000000"
                                            value={datosForm.telefonoMedico}
                                            onChange={(e) => manejarCambio('telefonoMedico', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo" style={{ gridColumn: '1 / -1' }}>
                                        <label className="campo-label">Equipo de Apoyo al que Asiste</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Ej: Aula Integrada, CDI, Psicopedagogía"
                                            value={datosForm.equipoApoyo}
                                            onChange={(e) => manejarCambio('equipoApoyo', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {seccionTabActiva === 'padres' && (
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
                                            placeholder="Nombres y apellidos completos"
                                            value={datosForm.nombreMadre}
                                            onChange={(e) => manejarCambio('nombreMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Cédula de Identidad (Madre)</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="V-00000000"
                                            value={datosForm.ciMadre}
                                            onChange={(e) => manejarCambio('ciMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Nivel de Instrucción</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Bachiller, TSU, Univ."
                                            value={datosForm.instruccionMadre}
                                            onChange={(e) => manejarCambio('instruccionMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Ocupación</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Oficio o profesión"
                                            value={datosForm.ocupacionMadre}
                                            onChange={(e) => manejarCambio('ocupacionMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Teléfono de la Madre</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="0414-0000000"
                                            value={datosForm.telefonoMadre}
                                            onChange={(e) => manejarCambio('telefonoMadre', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Líder de Calle</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Nombre del líder de calle"
                                            value={datosForm.liderCalle}
                                            onChange={(e) => manejarCambio('liderCalle', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo" style={{ gridColumn: '1 / -1' }}>
                                        <label className="campo-label">Dirección de Residencia (Habitación)</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Calle, sector, casa o apartamento"
                                            value={datosForm.direccionResidencia}
                                            onChange={(e) => manejarCambio('direccionResidencia', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {seccionTabActiva === 'representante' && (
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
                                            placeholder="Nombre completo"
                                            value={datosForm.nombreRepresentante}
                                            onChange={(e) => manejarCambio('nombreRepresentante', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Cédula de Identidad</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="V-00000000"
                                            value={datosForm.ciRepresentante}
                                            onChange={(e) => manejarCambio('ciRepresentante', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Teléfono de Contacto</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="0416-0000000"
                                            value={datosForm.telefonoRepresentante}
                                            onChange={(e) => manejarCambio('telefonoRepresentante', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo" style={{ gridColumn: '1 / -1' }}>
                                        <label className="campo-label">Dirección del Representante</label>
                                        <input
                                            type="text"
                                            className="campo-input"
                                            placeholder="Dirección completa"
                                            value={datosForm.direccionRepresentante}
                                            onChange={(e) => manejarCambio('direccionRepresentante', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {seccionTabActiva === 'vivienda' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">5</span>
                                    <h2 className="seccion-titulo-texto">Vivienda y Entorno Familiar</h2>
                                </div>
                                <div className="form-grid-4">
                                    <div className="campo-grupo">
                                        <label className="campo-label">Condición de la Casa</label>
                                        <select
                                            className="campo-select"
                                            value={datosForm.tipoVivienda || ''}
                                            onChange={(e) => manejarCambio('tipoVivienda', e.target.value)}
                                        >
                                            <option value="" disabled>Seleccione una opción...</option>
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
                                            placeholder="Ej: 3"
                                            value={datosForm.cuartosVivienda}
                                            onChange={(e) => manejarCambio('cuartosVivienda', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Personas en la Vivienda</label>
                                        <input
                                            type="number"
                                            className="campo-input"
                                            placeholder="Cantidad total"
                                            value={datosForm.cantidadPersonasVivienda}
                                            onChange={(e) => manejarCambio('cantidadPersonasVivienda', e.target.value)}
                                        />
                                    </div>

                                    <div className="campo-grupo">
                                        <label className="campo-label">Número de Hermanos</label>
                                        <input
                                            type="number"
                                            className="campo-input"
                                            placeholder="Cantidad de hermanos"
                                            value={datosForm.numeroHermanos}
                                            onChange={(e) => manejarCambio('numeroHermanos', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </section>
                        )}

                        {seccionTabActiva === 'servicios' && (
                            <section className="seccion-bloque">
                                <div className="seccion-titulo-barra">
                                    <span className="seccion-numero-badge">6</span>
                                    <h2 className="seccion-titulo-texto">Servicios Básicos y Sanidad</h2>
                                </div>
                                <div className="grid-condiciones-sanitarias">
                                    {[
                                        { id: 'servicioAgua', label: 'Red de Agua Potable' },
                                        { id: 'servicioElectricidad', label: 'Energía Eléctrica' },
                                        { id: 'servicioInternet', label: 'Servicio de Internet' },
                                        { id: 'banosBuenEstado', label: 'Baños en buen estado' },
                                    ].map((s) => (
                                        <div key={s.id} className="condicion-item">
                                            <span className="condicion-texto">{s.label}</span>
                                            <div className="pills-sino-container" style={{ width: '130px' }}>
                                                {/* CORRECCIÓN: Ahora es estrictamente === true o === false */}
                                                <button
                                                    type="button"
                                                    className={`pill-sino-btn ${datosForm[s.id] === true ? 'pill-sino-btn--si-activo' : ''}`}
                                                    onClick={() => manejarCambio(s.id, true)}
                                                >
                                                    SÍ
                                                </button>
                                                <button
                                                    type="button"
                                                    className={`pill-sino-btn ${datosForm[s.id] === false ? 'pill-sino-btn--no-activo' : ''}`}
                                                    onClick={() => manejarCambio(s.id, false)}
                                                >
                                                    NO
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Botón de envío colocado únicamente al final de la última pestaña */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                                    <button type="submit" className="btn-guardar-inscripcion">
                                        <IconoGuardar size={18} />
                                        <span>Registrar e Inscribir Alumno</span>
                                    </button>
                                </div>
                            </section>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
}

export default Inscribir;