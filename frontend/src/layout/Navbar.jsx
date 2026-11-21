import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificacionesDropdown from './NotificacionesDropdown';
import './Navbar.css';

function Navbar() {
    const { usuario } = useAuth();

    return (
        <header className="navbar">
            {/* Lado Derecho: Notificaciones y Perfil */}
            <div className="navbar__derecha">
                {/* Notificaciones */}
                <NotificacionesDropdown />

                {/* Perfil del Usuario */}
                <Link to="/perfil" className="navbar__user-pill" title="Mi Perfil">
                    <div className="navbar__user-avatar">
                        {usuario?.nombre?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <span className="navbar__user-name">{usuario?.nombre || 'admin'}</span>
                </Link>
            </div>
        </header>
    );
}

export default Navbar;
