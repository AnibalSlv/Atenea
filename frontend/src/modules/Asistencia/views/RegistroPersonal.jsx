import { useState, useMemo, useRef, useEffect } from 'react';
import { TURNOS } from '../../../constants/estructuraEscolar';
import {
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
import { contarVHT } from '../utils/calculosAsistencia';
import {
    SelectorPildoras,
    FilaPersona,
    TablaVHT,
    EstadoVacio,
} from '../components/AsistenciaUI';

/**
 * ====================================================================
 * SUB-MÓDULO 2: REGISTRO DIARIO DEL PERSONAL
 * ====================================================================
 */
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
        return `${String(ahora.getHours()).padStart(2, '0')}:${String(
            ahora.getMinutes()
        ).padStart(2, '0')}`;
    };

    const marcar = (persona, estado) => {
        setMarcas((prev) => {
            if (prev[persona.id]?.estado === estado) {
                const { [persona.id]: _omitido, ...resto } = prev;
                return resto;
            }
            const hora =
                estado === ESTADO.PRESENTE
                    ? fecha === hoyISO()
                        ? horaActual()
                        : persona.turno === TURNOS.MANANA
                        ? '07:00'
                        : '13:00'
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
            onAviso({
                tipo: 'error',
                texto: `Faltan ${sinMarcar} miembro(s) del personal por marcar.`,
            });
            return;
        }
        guardandoRef.current = true;
        setCargando(true);
        const marcasLimpias = {};
        filtrados.forEach((p) => {
            marcasLimpias[p.id] = marcas[p.id];
        });

        setTimeout(() => {
            onGuardar(fecha, 'personal', marcasLimpias);
            onAviso({
                tipo: 'exito',
                texto: `Asistencia del personal guardada para el ${formatearFechaCorta(fecha)}.`,
            });
            setCargando(false);
            guardandoRef.current = false;
        }, 500);
    };

    return (
        <section className="asis-card">
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
                    <div className="asis-campo">
                        <span className="asis-campo__etiqueta">Turno</span>
                        <SelectorPildoras
                            opciones={['Todos', TURNOS.MANANA, TURNOS.TARDE]}
                            valor={turno}
                            onCambio={setTurno}
                        />
                    </div>
                    <div className="asis-campo">
                        <span className="asis-campo__etiqueta">Área</span>
                        <SelectorPildoras
                            opciones={['Todas', ...areas]}
                            valor={area}
                            onCambio={setArea}
                        />
                    </div>
                </div>
            </div>

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
                <div className="asis-lista-wrapper">
                    <div className="asis-lista-acciones">
                        <span className="asis-lista-acciones__total">
                            {filtrados.length} miembro(s) del personal ·{' '}
                            <strong>{sinMarcar}</strong> sin marcar
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
                            <strong>{presentes.t}</strong>
                            <span>Presentes</span>
                        </div>
                        <div className="asis-mini-stat asis-mini-stat--rojo">
                            <strong>{ausentes.t}</strong>
                            <span>Ausentes</span>
                        </div>
                        <div className="asis-mini-stat">
                            <strong>{sinMarcar}</strong>
                            <span>Sin marcar</span>
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
                        {cargando
                            ? 'Guardando...'
                            : yaGuardado
                            ? 'Actualizar registro'
                            : 'Guardar registro'}
                    </button>
                </aside>
            </div>
        </section>
    );
}

export default RegistroPersonal;
