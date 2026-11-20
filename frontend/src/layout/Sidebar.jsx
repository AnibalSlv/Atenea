import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    IconoDashboard,
    IconoAlumnos,
    IconoAsistencia,
    IconoInscribir,
    IconoRetirar,
    IconoGraficos,
    IconoCupos,
    IconoLogout,
    IconoEscudo,
} from '../components/Iconos';
import './Sidebar.css';

function Sidebar() {
    const { esDirectora, cerrarSesion } = useAuth();
    const navigate = useNavigate();

    const manejarCerrarSesion = () => {
        cerrarSesion();
        navigate('/login', { replace: true });
    };

    const enlaces = [
        { ruta: '/', ComponenteIcono: IconoDashboard, texto: 'Inicio' },
        { ruta: '/alumnos', ComponenteIcono: IconoAlumnos, texto: 'Alumnos' },
        { ruta: '/asistencia', ComponenteIcono: IconoAsistencia, texto: 'Asistencia' },
        { ruta: '/inscribir', ComponenteIcono: IconoInscribir, texto: 'Inscribir' },
        { ruta: '/retirar', ComponenteIcono: IconoRetirar, texto: 'Retiros' },
        { ruta: '/graficos', ComponenteIcono: IconoGraficos, texto: 'Gráficos' },
    ];

    return (
        <aside className="sidebar-container">
            {/* Encabezado con Logo y Nombre */}
            <div className="sidebar-brand">
                <div className="sidebar-brand__logo-box">
                    <IconoEscudo size={22} />
                </div>
                <span className="sidebar-brand__nombre">Atenea</span>
            </div>

            {/* Menú de Navegación Único */}
            <nav className="sidebar-nav">
                {enlaces.map((enlace) => {
                    const Icono = enlace.ComponenteIcono;
                    return (
                        <NavLink
                            key={enlace.ruta}
                            to={enlace.ruta}
                            end={enlace.ruta === '/'}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'sidebar-link--activo' : ''}`
                            }
                        >
                            <span className="sidebar-link__icon-wrapper">
                                <Icono size={19} />
                            </span>
                            <span>{enlace.texto}</span>
                        </NavLink>
                    );
                })}

                {esDirectora && (
                    <NavLink
                        to="/cupos"
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'sidebar-link--activo' : ''}`
                        }
                    >
                        <span className="sidebar-link__icon-wrapper">
                            <IconoCupos size={19} />
                        </span>
                        <span>Cupos</span>
                        <span className="sidebar-link__badge">DIR</span>
                    </NavLink>
                )}
            </nav>

            {/* Botón Salir */}
            <div className="sidebar-logout">
                <button className="sidebar-logout__btn" onClick={manejarCerrarSesion}>
                    <IconoLogout size={19} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
