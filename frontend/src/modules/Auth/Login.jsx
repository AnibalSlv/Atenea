import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    IconoEscudo,
    IconoUsuario,
    IconoCandado,
    IconoAlerta,
} from '../../components/Iconos';
import './Auth.css';

function Login() {
    const [nombreUsuario, setNombreUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [errorLocal, setErrorLocal] = useState('');
    const enviandoRef = useRef(false);
    const navigate = useNavigate();

    const { iniciarSesion, cargando, error: errorAuth } = useAuth();
    const LONGITUD_MAXIMA = 72;

    const manejarLogin = async (e) => {
        e.preventDefault();

        if (enviandoRef.current) return;

        const usuarioLimpio = nombreUsuario.trim();
        const contrasenaLimpia = contrasena.trim();

        if (!usuarioLimpio || !contrasenaLimpia) {
            setErrorLocal('Completa el usuario y la contraseña.');
            return;
        }

        if (usuarioLimpio.length > LONGITUD_MAXIMA || contrasenaLimpia.length > LONGITUD_MAXIMA) {
            setErrorLocal(`Máximo ${LONGITUD_MAXIMA} caracteres permitidos.`);
            return;
        }

        setErrorLocal('');
        enviandoRef.current = true;

        try {
            const exito = await iniciarSesion(usuarioLimpio, contrasenaLimpia);
            if (exito) {
                navigate('/', { replace: true });
            }
        } finally {
            enviandoRef.current = false;
        }
    };

    const mensajeError = errorLocal || errorAuth;

    return (
        <div className="auth-pantalla">
            <div className="auth-card">
                {/* Encabezado */}
                <div className="auth-header">
                    <div className="auth-logo-badge">
                        <IconoEscudo size={32} />
                    </div>
                    <h1 className="auth-titulo">Atenea</h1>
                    <p className="auth-subtitulo">
                        U.E.M. Gregorio Romero — Control Administrativo
                    </p>
                </div>

                {/* Formulario */}
                <form className="auth-form" onSubmit={manejarLogin}>
                    <div className="auth-field">
                        <label className="auth-label">Usuario</label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">
                                <IconoUsuario size={18} />
                            </span>
                            <input
                                type="text"
                                className="auth-input"
                                value={nombreUsuario}
                                onChange={(e) => setNombreUsuario(e.target.value)}
                                placeholder="Ingresa tu usuario"
                                maxLength={LONGITUD_MAXIMA}
                                required
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Contraseña</label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">
                                <IconoCandado size={18} />
                            </span>
                            <input
                                type="password"
                                className="auth-input"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                placeholder="Ingresa tu contraseña"
                                maxLength={LONGITUD_MAXIMA}
                                required
                            />
                        </div>
                    </div>

                    {mensajeError && (
                        <div className="auth-error-box">
                            <IconoAlerta size={16} />
                            <span>{mensajeError}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-btn-submit"
                        disabled={cargando}
                    >
                        {cargando ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                {/* Pie */}
                <div className="auth-footer">
                    <span>¿No tienes una cuenta?</span>
                    <Link to="/register" className="auth-link">
                        Crear cuenta
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
