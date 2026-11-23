import { useState, useMemo, useRef, useEffect } from 'react';
import { TODOS_LOS_GRADOS, TURNOS } from '../../../constants/estructuraEscolar';
import {
    IconoBuscar,
    IconoAlerta,
    IconoCalendario,
    IconoCheck,
    IconoGuardar,
    IconoInfo,
} from '../../../components/Iconos';
import { ESTADO } from '../constants/asistenciaConfig';
import {
    hoyISO,
    ultimoDiaHabil,
    esFinDeSemana,
    formatearFechaLarga,
    formatearFechaCorta,
} from '../utils/fechasAsistencia';
import { nombreCompleto, contarVHT } from '../utils/calculosAsistencia';
import {
    SelectorPildoras,
    FilaPersona,
    TablaVHT,
    EstadoVacio,
} from '../components/AsistenciaUI';

/**
 * ====================================================================
 * SUB-MÓDULO 1: REGISTRO DIARIO DEL ALUMNO (PRESENTE / AUSENTE)
 * ====================================================================
 */
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
            .filter(
                (a) =>
                    !texto ||
                    nombreCompleto(a).toLowerCase().includes(texto) ||
                    String(a.cedulaEscolar || '').includes(texto)
            );
    }, [alumnos, turno, grado, seccion, busqueda]);

    const presentes = contarVHT(filtrados, (a) => marcas[a.id] === ESTADO.PRESENTE);
    const ausentes = contarVHT(filtrados, (a) => marcas[a.id] === ESTADO.AUSENTE);
    const matricula = contarVHT(filtrados);
    const sinMarcar = matricula.t - presentes.t - ausentes.t;
    const porcentaje = matricula.t ? Math.round((presentes.t / matricula.t) * 100) : 0;

    const marcar = (id, estado) => {
        setMarcas((prev) => ({
            ...prev,
            [id]: prev[id] === estado ? undefined : estado,
        }));
    };

    const marcarTodos = (estado) => {
        setMarcas((prev) => {
            const nuevo = { ...prev };
            filtrados.forEach((a) => {
                nuevo[a.id] = estado;
            });
            return nuevo;
        });
    };

    const guardar = () => {
        if (guardandoRef.current || finDeSemana) return;
        if (sinMarcar > 0) {
            onAviso({
                tipo: 'error',
                texto: `Faltan ${sinMarcar} alumno(s) por marcar antes de guardar.`,
            });
            return;
        }
        guardandoRef.current = true;
        setCargando(true);

        const marcasLimpias = {};
        filtrados.forEach((a) => {
            marcasLimpias[a.id] = marcas[a.id];
        });

        setTimeout(() => {
            onGuardar(fecha, 'alumnos', marcasLimpias);
            onAviso({
                tipo: 'exito',
                texto: `Asistencia de ${filtrados.length} alumno(s) guardada para el ${formatearFechaCorta(fecha)}.`,
            });
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
                        <span className="asis-campo__etiqueta">
                            <IconoCalendario size={14} /> Fecha
                        </span>
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
                        <select
                            className="asis-input"
                            value={grado}
                            onChange={(e) => setGrado(e.target.value)}
                        >
                            <option value="Todos">Todos los grados</option>
                            {TODOS_LOS_GRADOS.map((g) => (
                                <option key={g.id} value={g.nombre}>
                                    {g.nombre}
                                </option>
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
                    <span className="asis-chip asis-chip--neutro">
                        <IconoInfo size={13} /> Fin de semana — sin actividad escolar
                    </span>
                ) : yaGuardado ? (
                    <span className="asis-chip asis-chip--verde">
                        <IconoCheck size={13} /> Registro guardado
                    </span>
                ) : (
                    <span className="asis-chip asis-chip--amarillo">
                        <IconoAlerta size={13} /> Pendiente por registrar
                    </span>
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
                            <button
                                type="button"
                                className="asis-btn asis-btn--suave-verde"
                                onClick={() => marcarTodos(ESTADO.PRESENTE)}
                                disabled={finDeSemana || cargando || !filtrados.length}
                            >
                                <IconoCheck size={14} /> Todos presentes
                            </button>
                            <button
                                type="button"
                                className="asis-btn asis-btn--suave-rojo"
                                onClick={() => marcarTodos(ESTADO.AUSENTE)}
                                disabled={finDeSemana || cargando || !filtrados.length}
                            >
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

                    <div
                        className="asis-anillo"
                        style={{ '--asis-porcentaje': `${porcentaje * 3.6}deg` }}
                    >
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
                        {cargando
                            ? 'Guardando...'
                            : yaGuardado
                            ? 'Actualizar asistencia'
                            : 'Guardar asistencia'}
                    </button>
                </aside>
            </div>
        </section>
    );
}

export default RegistroAlumnos;
