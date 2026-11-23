import { useState, useMemo, useRef, useEffect } from 'react';
import { getAlumnosActivos } from '../../data/mockAlumnos';
import { useNotificaciones } from '../../context/NotificacionesContext';
import { IconoCampana, IconoCheck } from '../../components/Iconos';
import {
    CLAVE_STORAGE,
    CLAVE_LIMITE,
    DIAS_PERIODO_ALERTAS,
    ESTADO,
    PESTANAS,
    PERSONAL_INICIAL,
} from './constants/asistenciaConfig';
import {
    hoyISO,
    esFinDeSemana,
    restarDias,
    formatearFechaLarga,
} from './utils/fechasAsistencia';
import {
    generarHistorial,
    cargarGuardados,
    cargarLimite,
} from './utils/calculosAsistencia';
import RegistroAlumnos from './views/RegistroAlumnos';
import RegistroPersonal from './views/RegistroPersonal';
import ConsultarAsistencia from './views/ConsultarAsistencia';
import AlertasInasistencia from './views/AlertasInasistencia';
import './Asistencia.css';

/**
 * ====================================================================
 * MÓDULO DE ASISTENCIA (ORQUESTADOR) — U.E.M. Gregorio Romero
 * --------------------------------------------------------------------
 * Arquitectura interna por capas dentro de src/modules/Asistencia/:
 *  - constants/  → Configuración, estados y pestañas
 *  - utils/      → Fechas, cálculos V/H/T, exportación CSV y storage
 *  - components/ → Componentes visuales reutilizables del módulo
 *  - views/      → Sub-módulos por funcionalidad (Alumnos, Personal,
 *                  Consultar, Alertas)
 * ====================================================================
 */
function Asistencia() {
    const { agregarNotificacion } = useNotificaciones();
    const [pestana, setPestana] = useState('alumnos');
    const [aviso, setAviso] = useState(null);
    const [guardados, setGuardados] = useState(cargarGuardados);
    const [limiteFaltas, setLimiteFaltas] = useState(cargarLimite);
    const [alertaDiariaEnviada, setAlertaDiariaEnviada] = useState(false);
    const enviandoAlertaRef = useRef(false);

    const alumnos = useMemo(() => getAlumnosActivos(), []);
    const personal = PERSONAL_INICIAL;
    const historial = useMemo(
        () => generarHistorial(alumnos, personal),
        [alumnos, personal]
    );
    const registros = useMemo(
        () => ({ ...historial, ...guardados }),
        [historial, guardados]
    );

    const hoy = hoyISO();
    const hoyEsHabil = !esFinDeSemana(hoy);
    const alumnosPendientesHoy = hoyEsHabil && !registros[hoy]?.alumnosGuardado;
    const personalPendienteHoy = hoyEsHabil && !registros[hoy]?.personalGuardado;

    useEffect(() => {
        if (!aviso) return undefined;
        const t = setTimeout(() => setAviso(null), 4500);
        return () => clearTimeout(t);
    }, [aviso]);

    useEffect(() => {
        localStorage.setItem(CLAVE_LIMITE, String(limiteFaltas));
    }, [limiteFaltas]);

    // Restablecer el scroll del contenedor principal al cambiar de pestaña interna o al salir del módulo hacia otra pantalla del Sidebar
    useEffect(() => {
        const contenedor = document.querySelector('.main-layout__contenido');
        if (contenedor) contenedor.scrollTop = 0;
    }, [pestana]);

    useEffect(() => {
        return () => {
            const contenedor = document.querySelector('.main-layout__contenido');
            if (contenedor) contenedor.scrollTop = 0;
        };
    }, []);

    const faltasPorAlumno = useMemo(() => {
        const desde = restarDias(hoy, DIAS_PERIODO_ALERTAS);
        const conteo = {};
        Object.entries(registros).forEach(([fecha, reg]) => {
            if (fecha < desde || fecha > hoy || !reg.alumnos) return;
            Object.entries(reg.alumnos).forEach(([id, estado]) => {
                if (estado === ESTADO.AUSENTE) conteo[id] = (conteo[id] || 0) + 1;
            });
        });
        return conteo;
    }, [registros, hoy]);

    const totalSuperados = alumnos.filter(
        (a) => (faltasPorAlumno[a.id] || 0) >= limiteFaltas
    ).length;

    const guardarRegistro = (fecha, tipo, marcas) => {
        setGuardados((prev) => {
            const base = prev[fecha] || registros[fecha] || {};
            const nuevo = {
                ...prev,
                [fecha]: {
                    ...base,
                    [tipo]: { ...(base[tipo] || {}), ...marcas },
                    [`${tipo}Guardado`]: true,
                },
            };
            localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevo));
            return nuevo;
        });
    };

    const enviarAlertaDiaria = () => {
        if (enviandoAlertaRef.current || alertaDiariaEnviada) return;
        enviandoAlertaRef.current = true;
        const pendientes = [
            alumnosPendientesHoy && 'alumnos',
            personalPendienteHoy && 'personal',
        ]
            .filter(Boolean)
            .join(' y ');
        agregarNotificacion({
            id: `asis-diaria-${Date.now()}`,
            fecha: 'Hace un momento',
            titulo: 'Asistencia diaria pendiente',
            mensaje: `Aún no se ha registrado la asistencia de ${pendientes} del ${formatearFechaLarga(hoy)}.`,
            tipo: 'asistencia',
            prioridad: 'urgente',
            ruta: '/asistencia',
        });
        setAlertaDiariaEnviada(true);
        setAviso({
            tipo: 'exito',
            texto: 'Alerta de asistencia diaria enviada al panel de notificaciones.',
        });
        enviandoAlertaRef.current = false;
    };

    return (
        <div className="asis-modulo">
            {/* ─── Encabezado ─── */}
            <header className="asis-header">
                <div className="asis-header__info">
                    <h1>Control de Asistencia</h1>
                    <p>
                        Registro diario de alumnos y personal — {formatearFechaLarga(hoy)}
                    </p>
                </div>

                <nav className="asis-pills">
                    {PESTANAS.map(({ id, texto, Icono }) => (
                        <button
                            key={id}
                            type="button"
                            className={`asis-pill ${
                                pestana === id ? 'asis-pill--activo' : ''
                            }`}
                            onClick={() => setPestana(id)}
                        >
                            <Icono size={16} />
                            <span>{texto}</span>
                            {id === 'alertas' && totalSuperados > 0 && (
                                <span className="asis-pill__contador">
                                    {totalSuperados}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </header>

            {/* ─── Alerta: asistencia diaria pendiente ─── */}
            {(alumnosPendientesHoy || personalPendienteHoy) && (
                <div className="asis-banner-pendiente">
                    <div className="asis-banner-pendiente__icono">
                        <IconoCampana size={20} />
                    </div>
                    <div className="asis-banner-pendiente__texto">
                        <strong>Asistencia del día pendiente</strong>
                        <span>
                            Falta registrar hoy:{' '}
                            {alumnosPendientesHoy && (
                                <em className="asis-chip asis-chip--amarillo">Alumnos</em>
                            )}{' '}
                            {personalPendienteHoy && (
                                <em className="asis-chip asis-chip--amarillo">Personal</em>
                            )}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="asis-btn asis-btn--alerta"
                        onClick={enviarAlertaDiaria}
                        disabled={alertaDiariaEnviada}
                    >
                        {alertaDiariaEnviada ? (
                            <IconoCheck size={15} />
                        ) : (
                            <IconoCampana size={15} />
                        )}
                        {alertaDiariaEnviada ? 'Alerta enviada' : 'Enviar alerta'}
                    </button>
                </div>
            )}

            {/* ─── Aviso flotante ─── */}
            {aviso && (
                <div className={`asis-aviso asis-aviso--${aviso.tipo}`}>
                    <span>{aviso.texto}</span>
                    <button
                        type="button"
                        className="asis-aviso__cerrar"
                        onClick={() => setAviso(null)}
                    >
                        ×
                    </button>
                </div>
            )}

            {pestana === 'alumnos' && (
                <RegistroAlumnos
                    alumnos={alumnos}
                    registros={registros}
                    onGuardar={guardarRegistro}
                    onAviso={setAviso}
                />
            )}
            {pestana === 'personal' && (
                <RegistroPersonal
                    personal={personal}
                    registros={registros}
                    onGuardar={guardarRegistro}
                    onAviso={setAviso}
                />
            )}
            {pestana === 'consultar' && (
                <ConsultarAsistencia alumnos={alumnos} registros={registros} />
            )}
            {pestana === 'alertas' && (
                <AlertasInasistencia
                    alumnos={alumnos}
                    faltasPorAlumno={faltasPorAlumno}
                    limite={limiteFaltas}
                    setLimite={setLimiteFaltas}
                    onAviso={setAviso}
                    agregarNotificacion={agregarNotificacion}
                />
            )}
        </div>
    );
}

export default Asistencia;
