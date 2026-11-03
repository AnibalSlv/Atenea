import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconoBuscar } from '../components/Iconos';
import NotificacionesDropdown from './NotificacionesDropdown';
import './Navbar.css';

function Navbar() {
    const { usuario } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="navbar">
            {/* Barra de Búsqueda */}
            <div className="navbar__search-box">
                <span className="navbar__search-icon">
                    <IconoBuscar size={17} />
                </span>
                <input
                    type="text"
                    className="navbar__search-input"
                    placeholder="Buscar alumno, cédula o expediente..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            navigate('/alumnos');
                        }
                    }}
                />
            </div>

            {/* Lado Derecho: Notificaciones y Perfil */}
            <div className="navbar__derecha">
                {/* Notificaciones */}
                <NotificacionesDropdown />

                {/* Perfil del Usuario */}
                <Link to="/perfil" className="navbar__user-pill" title="Mi Perfil">
                    <div className="navbar__user-avatar">
                        {usuario?.nombre?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <span className="navbar__user-name">{usuario?.nombre || 'Directora'}</span>
                </Link>
            </div>
        </header>
    );
}

export default Navbar;