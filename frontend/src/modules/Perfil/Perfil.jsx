import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconoUsuario } from '../../components/Iconos';
import './Perfil.css';

function Perfil() {
    const { usuario } = useAuth();
    const navigate = useNavigate();

    const nombreMostrar = usuario?.nombre
        ? (usuario.nombre.charAt(0).toUpperCase() + usuario.nombre.slice(1))
        : 'Admin';

    return (
        <div className="perfil-modulo">
            <div className="perfil-card">
                <button className="perfil-volver-btn" onClick={() => navigate('/')}>
                    ← Volver al Inicio
                </button>

                <div className="perfil-avatar-wrapper">
                    <IconoUsuario size={48} />
                </div>

                <h1 className="perfil-nombre">{nombreMostrar}</h1>
            </div>
        </div>
    );
}

export default Perfil;
