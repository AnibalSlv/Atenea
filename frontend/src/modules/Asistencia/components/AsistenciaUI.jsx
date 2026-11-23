import { IconoInfo } from '../../../components/Iconos';
import { ESTADO } from '../constants/asistenciaConfig';
import { iniciales, esVaron } from '../utils/calculosAsistencia';

/**
 * ====================================================================
 * CAPA DE COMPONENTES VISUALES REUTILIZABLES — MÓDULO ASISTENCIA
 * ====================================================================
 */

export function SelectorPildoras({ opciones, valor, onCambio, etiquetas = {} }) {
    return (
        <div className="asis-selector">
            {opciones.map((op) => (
                <button
                    key={op}
                    type="button"
                    className={`asis-selector__op ${valor === op ? 'asis-selector__op--activo' : ''}`}
                    onClick={() => onCambio(op)}
                >
                    {etiquetas[op] || op}
                </button>
            ))}
        </div>
    );
}

export function Avatar({ texto, genero, pequeno = false }) {
    return (
        <span
            className={`asis-avatar ${
                esVaron(genero) ? 'asis-avatar--varon' : 'asis-avatar--hembra'
            } ${pequeno ? 'asis-avatar--pequeno' : ''}`}
        >
            {iniciales(texto)}
        </span>
    );
}

export function BadgeEstado({ estado }) {
    return estado === ESTADO.PRESENTE ? (
        <span className="asis-chip asis-chip--verde">Presente</span>
    ) : (
        <span className="asis-chip asis-chip--rojo">Ausente</span>
    );
}

export function BadgeGenero({ genero }) {
    return esVaron(genero) ? (
        <span className="asis-chip asis-chip--varon">Varón</span>
    ) : (
        <span className="asis-chip asis-chip--hembra">Hembra</span>
    );
}

export function FilaPersona({
    titulo,
    genero,
    detalles,
    estado,
    onMarcar,
    deshabilitado,
    extra,
}) {
    return (
        <li className="asis-fila">
            <Avatar texto={titulo} genero={genero} />
            <div className="asis-fila__info">
                <strong>{titulo}</strong>
                <div className="asis-fila__chips">
                    {detalles.map((d) => (
                        <span key={d.texto} className={`asis-chip asis-chip--${d.tipo}`}>
                            {d.texto}
                        </span>
                    ))}
                    <BadgeGenero genero={genero} />
                </div>
            </div>
            {extra}
            <div className="asis-toggle">
                <button
                    type="button"
                    className={`asis-toggle__btn asis-toggle__btn--presente ${
                        estado === ESTADO.PRESENTE ? 'asis-toggle__btn--activo' : ''
                    }`}
                    onClick={() => onMarcar(ESTADO.PRESENTE)}
                    disabled={deshabilitado}
                >
                    Presente
                </button>
                <button
                    type="button"
                    className={`asis-toggle__btn asis-toggle__btn--ausente ${
                        estado === ESTADO.AUSENTE ? 'asis-toggle__btn--activo' : ''
                    }`}
                    onClick={() => onMarcar(ESTADO.AUSENTE)}
                    disabled={deshabilitado}
                >
                    Ausente
                </button>
            </div>
        </li>
    );
}

export function TablaVHT({ filas }) {
    return (
        <table className="asis-vht">
            <thead>
                <tr>
                    <th />
                    <th className="asis-vht__varon">V</th>
                    <th className="asis-vht__hembra">H</th>
                    <th>T</th>
                </tr>
            </thead>
            <tbody>
                {filas.map(({ etiqueta, datos, tipo }) => (
                    <tr key={etiqueta} className={`asis-vht__fila--${tipo}`}>
                        <td>{etiqueta}</td>
                        <td>{datos.v}</td>
                        <td>{datos.h}</td>
                        <td>
                            <strong>{datos.t}</strong>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export function Kpi({ valor, etiqueta, tipo = 'neutro' }) {
    return (
        <div className={`asis-kpi asis-kpi--${tipo}`}>
            <strong>{valor}</strong>
            <span>{etiqueta}</span>
        </div>
    );
}

export function EstadoVacio({ texto, icono = <IconoInfo size={26} /> }) {
    return (
        <div className="asis-vacio">
            <div className="asis-vacio__icono">{icono}</div>
            <p>{texto}</p>
        </div>
    );
}
