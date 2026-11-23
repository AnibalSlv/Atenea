import { useState, useMemo } from 'react';
import { TODOS_LOS_GRADOS, TURNOS } from '../../../constants/estructuraEscolar';
import {
    IconoBuscar,
    IconoCalendario,
    IconoArchivo,
} from '../../../components/Iconos';
import { ESTADO } from '../constants/asistenciaConfig';
import {
    hoyISO,
    aFecha,
    restarDias,
    formatearFechaLarga,
} from '../utils/fechasAsistencia';
import {
    nombreCompleto,
    contarVHT,
    descargarCSV,
} from '../utils/calculosAsistencia';
import {
    SelectorPildoras,
    Avatar,
    TablaVHT,
    BadgeEstado,
    BadgeGenero,
    Kpi,
    EstadoVacio,
} from '../components/AsistenciaUI';

/**
 * ====================================================================
 * SUB-MÓDULO 3: CONSULTAR ASISTENCIA (POR ALUMNO / POR FECHA) + CSV
 * ====================================================================
 */
function ConsultarAsistencia({ alumnos, registros }) {
    const [modo, setModo] = useState('alumno');

    return (
        <section className="asis-card">
            <div className="asis-consulta-modos">
                <SelectorPildoras
                    opciones={['alumno', 'fecha']}
                    etiquetas={{ alumno: 'Por alumno', fecha: 'Por fecha' }}
                    valor={modo}
                    onCambio={setModo}
                />
            </div>
            {modo === 'alumno' ? (
                <ConsultaPorAlumno alumnos={alumnos} registros={registros} />
            ) : (
                <ConsultaPorFecha alumnos={alumnos} registros={registros} />
            )}
        </section>
    );
}

function ConsultaPorAlumno({ alumnos, registros }) {
    const [busqueda, setBusqueda] = useState('');
    const [seleccionado, setSeleccionado] = useState(null);
    const [desde, setDesde] = useState(restarDias(hoyISO(), 30));
    const [hasta, setHasta] = useState(hoyISO());

    const sugerencias = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();
        if (!texto) return [];
        return alumnos
            .filter(
                (a) =>
                    nombreCompleto(a).toLowerCase().includes(texto) ||
                    String(a.cedulaEscolar || '').includes(texto)
            )
            .slice(0, 6);
    }, [alumnos, busqueda]);

    const filas = useMemo(() => {
        if (!seleccionado) return [];
        return Object.entries(registros)
            .filter(
                ([fecha, reg]) =>
                    fecha >= desde && fecha <= hasta && reg.alumnos?.[seleccionado.id]
            )
            .map(([fecha, reg]) => ({ fecha, estado: reg.alumnos[seleccionado.id] }))
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
    }, [registros, seleccionado, desde, hasta]);

    const asistencias = filas.filter((f) => f.estado === ESTADO.PRESENTE).length;
    const faltas = filas.length - asistencias;
    const porcentaje = filas.length ? Math.round((asistencias / filas.length) * 100) : 0;

    const exportar = () => {
        descargarCSV(
            `asistencia_${seleccionado.apellidos.replace(/\s+/g, '_')}_${desde}_${hasta}.csv`,
            ['Fecha', 'Alumno', 'Cédula Escolar', 'Grado', 'Sección', 'Turno', 'Estado'],
            filas.map((f) => [
                f.fecha,
                nombreCompleto(seleccionado),
                seleccionado.cedulaEscolar,
                seleccionado.gradoNivel,
                seleccionado.seccionLiteral,
                seleccionado.turno,
                f.estado === ESTADO.PRESENTE ? 'Presente' : 'Ausente',
            ])
        );
    };

    return (
        <div className="asis-consulta">
            <div className="asis-filtros">
                <div className="asis-filtros__fila">
                    <div className="asis-campo asis-campo--ancho">
                        <span className="asis-campo__etiqueta">Alumno</span>
                        <div className="asis-autocompletar">
                            <div className="asis-buscador">
                                <IconoBuscar size={17} />
                                <input
                                    type="text"
                                    placeholder="Escribe el nombre, apellido o cédula escolar..."
                                    value={busqueda}
                                    onChange={(e) => {
                                        setBusqueda(e.target.value);
                                        setSeleccionado(null);
                                    }}
                                />
                            </div>
                            {sugerencias.length > 0 && !seleccionado && (
                                <ul className="asis-sugerencias">
                                    {sugerencias.map((a) => (
                                        <li key={a.id}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSeleccionado(a);
                                                    setBusqueda(nombreCompleto(a));
                                                }}
                                            >
                                                <Avatar
                                                    texto={nombreCompleto(a)}
                                                    genero={a.genero}
                                                    pequeno
                                                />
                                                <span className="asis-sugerencias__nombre">
                                                    {nombreCompleto(a)}
                                                </span>
                                                <span className="asis-sugerencias__meta">
                                                    {a.gradoNivel} "{a.seccionLiteral}" · {a.turno}
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <label className="asis-campo">
                        <span className="asis-campo__etiqueta">Desde</span>
                        <input
                            type="date"
                            className="asis-input"
                            value={desde}
                            max={hasta}
                            onChange={(e) => e.target.value && setDesde(e.target.value)}
                        />
                    </label>
                    <label className="asis-campo">
                        <span className="asis-campo__etiqueta">Hasta</span>
                        <input
                            type="date"
                            className="asis-input"
                            value={hasta}
                            min={desde}
                            max={hoyISO()}
                            onChange={(e) => e.target.value && setHasta(e.target.value)}
                        />
                    </label>
                </div>
            </div>

            {!seleccionado ? (
                <EstadoVacio
                    texto="Busca y selecciona un alumno para ver su historial de asistencia."
                    icono={<IconoBuscar size={26} />}
                />
            ) : (
                <>
                    <div className="asis-ficha">
                        <Avatar
                            texto={nombreCompleto(seleccionado)}
                            genero={seleccionado.genero}
                        />
                        <div className="asis-ficha__datos">
                            <strong>{nombreCompleto(seleccionado)}</strong>
                            <span>
                                C.E. {seleccionado.cedulaEscolar} · {seleccionado.gradoNivel} "
                                {seleccionado.seccionLiteral}" · Turno {seleccionado.turno}
                            </span>
                        </div>
                        <button
                            type="button"
                            className="asis-btn asis-btn--secundario"
                            onClick={exportar}
                            disabled={!filas.length}
                        >
                            <IconoArchivo size={15} /> Exportar CSV
                        </button>
                    </div>

                    <div className="asis-kpis">
                        <Kpi valor={filas.length} etiqueta="Días registrados" />
                        <Kpi valor={asistencias} etiqueta="Asistencias" tipo="verde" />
                        <Kpi valor={faltas} etiqueta="Inasistencias" tipo="rojo" />
                        <Kpi valor={`${porcentaje}%`} etiqueta="% de asistencia" tipo="primario" />
                    </div>

                    {filas.length === 0 ? (
                        <EstadoVacio texto="No hay registros en el rango de fechas seleccionado." />
                    ) : (
                        <div className="asis-tabla-wrapper">
                            <table className="asis-tabla">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Día</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filas.map((f) => (
                                        <tr key={f.fecha}>
                                            <td>{f.fecha.split('-').reverse().join('/')}</td>
                                            <td>
                                                <span className="asis-tabla__capital">
                                                    {aFecha(f.fecha).toLocaleDateString('es-VE', {
                                                        weekday: 'long',
                                                    })}
                                                </span>
                                            </td>
                                            <td>
                                                <BadgeEstado estado={f.estado} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function ConsultaPorFecha({ alumnos, registros }) {
    const fechasDisponibles = useMemo(
        () =>
            Object.keys(registros)
                .filter((f) => registros[f].alumnosGuardado)
                .sort()
                .reverse(),
        [registros]
    );
    const [fecha, setFecha] = useState(fechasDisponibles[0] || hoyISO());
    const [turno, setTurno] = useState('Todos');
    const [grado, setGrado] = useState('Todos');
    const [estadoFiltro, setEstadoFiltro] = useState('Todos');

    const registro = registros[fecha];

    const filas = alumnos
        .filter((a) => turno === 'Todos' || a.turno === turno)
        .filter((a) => grado === 'Todos' || a.gradoNivel === grado)
        .map((a) => ({ alumno: a, estado: registro?.alumnos?.[a.id] }))
        .filter((f) => f.estado)
        .filter(
            (f) =>
                estadoFiltro === 'Todos' ||
                (estadoFiltro === 'Presentes' && f.estado === ESTADO.PRESENTE) ||
                (estadoFiltro === 'Ausentes' && f.estado === ESTADO.AUSENTE)
        );

    const lista = filas.map((f) => ({ ...f.alumno, estado: f.estado }));
    const presentes = contarVHT(lista, (a) => a.estado === ESTADO.PRESENTE);
    const ausentes = contarVHT(lista, (a) => a.estado === ESTADO.AUSENTE);
    const total = contarVHT(lista);

    const exportar = () => {
        descargarCSV(
            `asistencia_${fecha}.csv`,
            ['Fecha', 'Alumno', 'Cédula Escolar', 'Género', 'Grado', 'Sección', 'Turno', 'Estado'],
            filas.map(({ alumno: a, estado }) => [
                fecha,
                nombreCompleto(a),
                a.cedulaEscolar,
                a.genero,
                a.gradoNivel,
                a.seccionLiteral,
                a.turno,
                estado === ESTADO.PRESENTE ? 'Presente' : 'Ausente',
            ])
        );
    };

    return (
        <div className="asis-consulta">
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
                        <span className="asis-campo__etiqueta">Estado</span>
                        <SelectorPildoras
                            opciones={['Todos', 'Presentes', 'Ausentes']}
                            valor={estadoFiltro}
                            onCambio={setEstadoFiltro}
                        />
                    </div>
                </div>
            </div>

            <div className="asis-ficha">
                <div className="asis-ficha__icono">
                    <IconoCalendario size={22} />
                </div>
                <div className="asis-ficha__datos">
                    <strong className="asis-tabla__capital">{formatearFechaLarga(fecha)}</strong>
                    <span>
                        {registro?.alumnosGuardado
                            ? `${filas.length} registro(s) encontrados`
                            : 'Sin registro de asistencia para esta fecha'}
                    </span>
                </div>
                <button
                    type="button"
                    className="asis-btn asis-btn--secundario"
                    onClick={exportar}
                    disabled={!filas.length}
                >
                    <IconoArchivo size={15} /> Exportar CSV
                </button>
            </div>

            {filas.length === 0 ? (
                <EstadoVacio texto="No se encontraron registros de asistencia con estos filtros." />
            ) : (
                <div className="asis-consulta-grid">
                    <div className="asis-tabla-wrapper">
                        <table className="asis-tabla">
                            <thead>
                                <tr>
                                    <th>Alumno</th>
                                    <th>Grado</th>
                                    <th>Turno</th>
                                    <th>Género</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filas.map(({ alumno: a, estado }) => (
                                    <tr key={a.id}>
                                        <td className="asis-tabla__nombre">{nombreCompleto(a)}</td>
                                        <td>
                                            {a.gradoNivel} "{a.seccionLiteral}"
                                        </td>
                                        <td>{a.turno}</td>
                                        <td>
                                            <BadgeGenero genero={a.genero} />
                                        </td>
                                        <td>
                                            <BadgeEstado estado={estado} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <aside className="asis-resumen">
                        <h3 className="asis-resumen__titulo">Totales</h3>
                        <TablaVHT
                            filas={[
                                { etiqueta: 'Presentes', datos: presentes, tipo: 'verde' },
                                { etiqueta: 'Ausentes', datos: ausentes, tipo: 'rojo' },
                                { etiqueta: 'Total', datos: total, tipo: 'total' },
                            ]}
                        />
                    </aside>
                </div>
            )}
        </div>
    );
}

export default ConsultarAsistencia;
