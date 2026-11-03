import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconoUsuario } from '../../components/Iconos';
import './Perfil.css';

function Perfil() {
    const { usuario, esDirectora } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="perfil-modulo">
            <div className="perfil-card">
                <button className="perfil-volver-btn" onClick={() => navigate('/')}>
                    ← Volver al Inicio
                </button>

                <div className="perfil-avatar-wrapper">
                    <IconoUsuario size={44} />
                </div>

                <h1 className="perfil-nombre">{usuario?.nombre || 'Usuario'}</h1>
                <span className="perfil-rol-badge">
                    {esDirectora ? 'Directora de la Institución' : 'Personal Administrativo'}
                </span>

                <div className="perfil-info-grid">
                    <div className="perfil-info-item">
                        <span className="perfil-info-lbl">Institución</span>
                        <p className="perfil-info-val">U.E.M. Gregorio Romero</p>
                    </div>

                    <div className="perfil-info-item">
                        <span className="perfil-info-lbl">Nivel de Acceso</span>
                        <p className="perfil-info-val">
                            {esDirectora ? 'Administración Total + Cupos' : 'Operaciones Escolares'}
                        </p>
                    </div>

                    <div className="perfil-info-item">
                        <span className="perfil-info-lbl">Estado de Base de Datos</span>
                        <p className="perfil-info-val" style={{ color: 'var(--color-verde)' }}>
                            Modo Local Autónomo (SQLite)
                        </p>
                    </div>

                    <div className="perfil-info-item">
                        <span className="perfil-info-lbl">Turnos Habilitados</span>
                        <p className="perfil-info-val">Preescolar y Primaria (Mañana / Tarde)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Perfil;
