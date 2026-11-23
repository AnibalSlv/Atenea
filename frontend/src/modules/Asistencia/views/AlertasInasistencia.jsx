import { useState, useRef } from 'react';
import { IconoCampana, IconoCheck } from '../../../components/Iconos';
import { DIAS_PERIODO_ALERTAS } from '../constants/asistenciaConfig';
import { nombreCompleto } from '../utils/calculosAsistencia';
import {
    SelectorPildoras,
    Avatar,
    Kpi,
    EstadoVacio,
} from '../components/AsistenciaUI';

/**
 * ====================================================================
 * SUB-MÓDULO 4: ALERTAS DE INASISTENCIA (LÍMITE DE FALTAS)
 * ====================================================================
 */
function AlertasInasistencia({
    alumnos,
    faltasPorAlumno,
    limite,
    setLimite,
    onAviso,
    agregarNotificacion,
}) {
    const [filtro, setFiltro] = useState('Todos');
    const [notificados, setNotificados] = useState({});
    const notificandoRef = useRef(false);

    const lista = alumnos
        .map((a) => {
            const faltas = faltasPorAlumno[a.id] || 0;
            const nivel =
                faltas >= limite
                    ? 'superado'
                    : faltas === limite - 1 && faltas > 0
                    ? 'riesgo'
                    : 'normal';
            return { alumno: a, faltas, nivel };
        })
        .filter((x) => x.faltas > 0)
        .sort((a, b) => b.faltas - a.faltas);

    const superados = lista.filter((x) => x.nivel === 'superado');
    const enRiesgo = lista.filter((x) => x.nivel === 'riesgo');

    const visibles = lista.filter(
        (x) =>
            filtro === 'Todos' ||
            (filtro === 'Límite superado' && x.nivel === 'superado') ||
            (filtro === 'En riesgo' && x.nivel === 'riesgo')
    );

    const notificar = (items) => {
        if (notificandoRef.current) return;
        notificandoRef.current = true;
        const pendientes = items.filter((x) => !notificados[x.alumno.id]);
        const baseId = Date.now();
        pendientes.forEach(({ alumno: a, faltas }, idx) => {
            agregarNotificacion({
                id: `asis-falta-${a.id}-${baseId}-${idx}`,
                fecha: 'Hace un momento',
                titulo: 'Límite de inasistencias superado',
                mensaje: `${a.nombres} ${a.apellidos} (${a.gradoNivel} "${a.seccionLiteral}") acumula ${faltas} faltas en los últimos ${DIAS_PERIODO_ALERTAS} días.`,
                tipo: 'asistencia',
                prioridad: 'alerta',
                ruta: '/asistencia',
            });
        });
        if (pendientes.length) {
            setNotificados((prev) => {
                const nuevo = { ...prev };
                pendientes.forEach((x) => {
                    nuevo[x.alumno.id] = true;
                });
                return nuevo;
            });
            onAviso({
                tipo: 'exito',
                texto: `${pendientes.length} alerta(s) enviada(s) al panel de notificaciones.`,
            });
        }
        notificandoRef.current = false;
    };

    const ajustarLimite = (delta) =>
        setLimite((v) => Math.min(15, Math.max(1, v + delta)));

    return (
        <section className="asis-card">
            <div className="asis-alertas-top">
                <div className="asis-limite">
                    <div className="asis-limite__info">
                        <strong>Límite de faltas</strong>
                        <span>Período: últimos {DIAS_PERIODO_ALERTAS} días</span>
                    </div>
                    <div className="asis-limite__control">
                        <button
                            type="button"
                            onClick={() => ajustarLimite(-1)}
                            disabled={limite <= 1}
                            aria-label="Disminuir límite"
                        >
                            −
                        </button>
                        <span>{limite}</span>
                        <button
                            type="button"
                            onClick={() => ajustarLimite(1)}
                            disabled={limite >= 15}
                            aria-label="Aumentar límite"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="asis-kpis asis-kpis--compacto">
                    <Kpi valor={superados.length} etiqueta="Límite superado" tipo="rojo" />
                    <Kpi valor={enRiesgo.length} etiqueta="En riesgo" tipo="amarillo" />
                    <Kpi valor={lista.length} etiqueta="Con inasistencias" />
                </div>
            </div>

            <div className="asis-lista-acciones">
                <SelectorPildoras
                    opciones={['Todos', 'Límite superado', 'En riesgo']}
                    valor={filtro}
                    onCambio={setFiltro}
                />
                <button
                    type="button"
                    className="asis-btn asis-btn--alerta"
                    onClick={() => notificar(superados)}
                    disabled={!superados.some((x) => !notificados[x.alumno.id])}
                >
                    <IconoCampana size={15} /> Notificar a todos (
                    {superados.filter((x) => !notificados[x.alumno.id]).length})
                </button>
            </div>

            {visibles.length === 0 ? (
                <EstadoVacio
                    texto="No hay alumnos con alertas de inasistencia para este filtro."
                    icono={<IconoCheck size={26} />}
                />
            ) : (
                <ul className="asis-alertas-lista">
                    {visibles.map(({ alumno: a, faltas, nivel }) => (
                        <li
                            key={a.id}
                            className={`asis-alerta-item asis-alerta-item--${nivel}`}
                        >
                            <Avatar texto={nombreCompleto(a)} genero={a.genero} />
                            <div className="asis-alerta-item__info">
                                <strong>{nombreCompleto(a)}</strong>
                                <span>
                                    {a.gradoNivel} "{a.seccionLiteral}" · Turno {a.turno}
                                </span>
                                <div className="asis-barra">
                                    <div
                                        className={`asis-barra__relleno asis-barra__relleno--${nivel}`}
                                        style={{
                                            width: `${Math.min(100, (faltas / limite) * 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="asis-alerta-item__faltas">
                                <strong>{faltas}</strong>
                                <span>/ {limite} faltas</span>
                            </div>
                            <span
                                className={`asis-chip asis-chip--${
                                    nivel === 'superado'
                                        ? 'rojo'
                                        : nivel === 'riesgo'
                                        ? 'amarillo'
                                        : 'neutro'
                                }`}
                            >
                                {nivel === 'superado'
                                    ? 'Límite superado'
                                    : nivel === 'riesgo'
                                    ? 'En riesgo'
                                    : 'Normal'}
                            </span>
                            {nivel === 'superado' && (
                                <button
                                    type="button"
                                    className="asis-btn asis-btn--icono"
                                    onClick={() => notificar([{ alumno: a, faltas }])}
                                    disabled={!!notificados[a.id]}
                                    title={notificados[a.id] ? 'Alerta enviada' : 'Enviar alerta'}
                                >
                                    {notificados[a.id] ? (
                                        <IconoCheck size={15} />
                                    ) : (
                                        <IconoCampana size={15} />
                                    )}
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default AlertasInasistencia;
