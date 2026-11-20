import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Register as RegistrarUsuario } from '../../../wailsjs/go/services/RegisterService';
import {
    IconoEscudo,
    IconoUsuario,
    IconoCandado,
    IconoAlerta,
} from '../../components/Iconos';
import './Auth.css';

function Register() {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    const LONGITUD_MAXIMA = 72;

    const manejarRegistro = async (e) => {
        e.preventDefault();
        setError('');

        const usuarioLimpio = usuario.trim();
        const contrasenaLimpia = contrasena.trim();

        if (!usuarioLimpio || !contrasenaLimpia) {
            setError('Completa el usuario y la contraseña.');
            return;
        }

        if (usuarioLimpio.length > LONGITUD_MAXIMA || contrasenaLimpia.length > LONGITUD_MAXIMA) {
            setError(`Máximo ${LONGITUD_MAXIMA} caracteres permitidos.`);
            return;
        }

        if (contrasena !== confirmarContrasena) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setCargando(true);

        try {
            const exito = await RegistrarUsuario(usuarioLimpio, contrasenaLimpia);
            if (exito) {
                alert('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
                navigate('/login', { replace: true });
            } else {
                setError('No se pudo crear la cuenta. Intenta con otro nombre de usuario.');
            }
        } catch (err) {
            console.error('Error de conexión con el backend:', err);
            setError('No se pudo conectar con el servidor.');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="auth-pantalla">
            <div className="auth-card">
                {/* Encabezado */}
                <div className="auth-header">
                    <div className="auth-logo-badge">
                        <IconoEscudo size={32} />
                    </div>
                    <h1 className="auth-titulo">Crear Cuenta</h1>
                    <p className="auth-subtitulo">
                        Registro de Personal — U.E.M. Gregorio Romero
                    </p>
                </div>

                {/* Formulario */}
                <form className="auth-form" onSubmit={manejarRegistro}>
                    <div className="auth-field">
                        <label className="auth-label">Usuario</label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">
                                <IconoUsuario size={18} />
                            </span>
                            <input
                                type="text"
                                className="auth-input"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                placeholder="Elige un nombre de usuario"
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
                                placeholder="Crea una contraseña segura"
                                maxLength={LONGITUD_MAXIMA}
                                required
                            />
                        </div>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Confirmar Contraseña</label>
                        <div className="auth-input-wrapper">
                            <span className="auth-input-icon">
                                <IconoCandado size={18} />
                            </span>
                            <input
                                type="password"
                                className="auth-input"
                                value={confirmarContrasena}
                                onChange={(e) => setConfirmarContrasena(e.target.value)}
                                placeholder="Repite tu contraseña"
                                maxLength={LONGITUD_MAXIMA}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="auth-error-box">
                            <IconoAlerta size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="auth-btn-submit"
                        disabled={cargando}
                    >
                        {cargando ? 'Creando cuenta...' : 'Registrarme'}
                    </button>
                </form>

                {/* Pie */}
                <div className="auth-footer">
                    <span>¿Ya tienes una cuenta?</span>
                    <Link to="/login" className="auth-link">
                        Iniciar sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;
