import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificaciones } from '../context/NotificacionesContext';
import {
    IconoCampana,
    IconoCupos,
    IconoAsistencia,
    IconoDocumento,
} from '../components/Iconos';
import './NotificacionesDropdown.css';

function NotificacionesDropdown() {
    const {
        notificaciones,
        noLeidasCount,
        marcarComoLeida,
        marcarTodasComoLeidas,
        eliminarNotificacion,
    } = useNotificaciones();

    const [abierto, setAbierto] = useState(false);
    const [filtro, setFiltro] = useState('todas');
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const manejarClicFuera = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setAbierto(false);
            }
        };

        const manejarEscape = (e) => {
            if (e.key === 'Escape') {
                setAbierto(false);
            }
        };

        if (abierto) {
            document.addEventListener('mousedown', manejarClicFuera);
            document.addEventListener('keydown', manejarEscape);
        }

        return () => {
            document.removeEventListener('mousedown', manejarClicFuera);
            document.removeEventListener('keydown', manejarEscape);
        };
    }, [abierto]);

    const notificacionesFiltradas = notificaciones.filter((n) => {
        if (filtro === 'todas') return true;
        return n.tipo === filtro;
    });

    const manejarClickNotificacion = (notif) => {
        marcarComoLeida(notif.id);
        setAbierto(false);
        if (notif.ruta) {
            navigate(notif.ruta);
        }
    };

    const renderizarIconoNotif = (tipo) => {
        if (tipo === 'cupo') return <IconoCupos size={16} />;
        if (tipo === 'asistencia') return <IconoAsistencia size={16} />;
        return <IconoDocumento size={16} />;
    };

    return (
        <div className="notificaciones-wrapper" ref={wrapperRef}>
            <button
                className={`notificaciones-btn ${abierto ? 'notificaciones-btn--abierto' : ''}`}
                onClick={() => setAbierto((prev) => !prev)}
                title="Centro de Notificaciones"
                aria-label="Abrir centro de notificaciones"
            >
                <IconoCampana size={18} />
                {noLeidasCount > 0 && (
                    <span className="notificaciones-badge">
                        {noLeidasCount > 9 ? '9+' : noLeidasCount}
                    </span>
                )}
            </button>

            {abierto && (
                <div className="notificaciones-panel">
                    <div className="notificaciones-panel__header">
                        <h3 className="notificaciones-panel__titulo">
                            Notificaciones
                            {noLeidasCount > 0 && <span>({noLeidasCount} nuevas)</span>}
                        </h3>
                        {noLeidasCount > 0 && (
                            <button
                                className="notificaciones-panel__btn-leidas"
                                onClick={marcarTodasComoLeidas}
                            >
                                Marcar todo leído
                            </button>
                        )}
                    </div>

                    <div className="notificaciones-panel__tabs">
                        <button
                            className={`notificaciones-panel__tab ${
                                filtro === 'todas' ? 'notificaciones-panel__tab--activo' : ''
                            }`}
                            onClick={() => setFiltro('todas')}
                        >
                            Todas ({notificaciones.length})
                        </button>
                        <button
                            className={`notificaciones-panel__tab ${
                                filtro === 'cupo' ? 'notificaciones-panel__tab--activo' : ''
                            }`}
                            onClick={() => setFiltro('cupo')}
                        >
                            Cupos
                        </button>
                        <button
                            className={`notificaciones-panel__tab ${
                                filtro === 'asistencia' ? 'notificaciones-panel__tab--activo' : ''
                            }`}
                            onClick={() => setFiltro('asistencia')}
                        >
                            Asistencia
                        </button>
                        <button
                            className={`notificaciones-panel__tab ${
                                filtro === 'vencimiento' ? 'notificaciones-panel__tab--activo' : ''
                            }`}
                            onClick={() => setFiltro('vencimiento')}
                        >
                            Vencimientos
                        </button>
                    </div>

                    {notificacionesFiltradas.length > 0 ? (
                        <ul className="notificaciones-panel__lista">
                            {notificacionesFiltradas.map((item) => (
                                <li
                                    key={item.id}
                                    className={`notificacion-item ${
                                        !item.leida ? 'notificacion-item--no-leida' : ''
                                    }`}
                                    onClick={() => manejarClickNotificacion(item)}
                                >
                                    <div
                                        className={`notificacion-item__icono notificacion-item__icono--${item.prioridad}`}
                                    >
                                        {renderizarIconoNotif(item.tipo)}
                                    </div>
                                    <div className="notificacion-item__contenido">
                                        <div className="notificacion-item__top">
                                            <h4 className="notificacion-item__titulo">
                                                {item.titulo}
                                            </h4>
                                            <span className="notificacion-item__hora">
                                                {item.fecha}
                                            </span>
                                        </div>
                                        <p className="notificacion-item__mensaje">
                                            {item.mensaje}
                                        </p>
                                        <div className="notificacion-item__tags">
                                            <span className="notificacion-item__categoria">
                                                {item.tipo}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="notificacion-item__descartar"
                                        title="Descartar notificación"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            eliminarNotificacion(item.id);
                                        }}
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="notificaciones-panel__vacio">
                            <p className="notificaciones-panel__vacio-texto">
                                No hay alertas en esta categoría.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificacionesDropdown;
