import { useState } from 'react';
import { Login as AutenticarUsuario } from '../../wailsjs/go/services/LoginService';

function Login({ onIrARegistro, onLoginExitoso }) {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const manejarLogin = (e) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        AutenticarUsuario(usuario, contrasena)
            .then((esValido) => {
                if (esValido) {
                    onLoginExitoso?.(usuario);
                } else {
                    setError('Usuario o contraseña incorrectos.');
                }
            })
            .catch((err) => {
                console.error('Hubo un problema de conexión con el backend:', err);
                setError('No se pudo conectar con el servidor.');
            })
            .finally(() => setCargando(false));
    };

    return (
        <div id="App" className="login-pantalla">
            <div className="login-tarjeta">
                <h2>Bienvenido a Atenea</h2>

                <form onSubmit={manejarLogin}>
                    <div className="input-grupo">
                        <label>Usuario</label>
                        <input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder="Ingresa tu usuario"
                        />
                    </div>

                    <div className="input-grupo">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="btn-entrar" disabled={cargando}>
                        {cargando ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p className="auth-enlace">
                    ¿No tienes cuenta?{' '}
                    <button type="button" onClick={onIrARegistro}>
                        Regístrate
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Login;
