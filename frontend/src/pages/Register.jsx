import { useState } from 'react';
import { Register as RegistrarUsuario } from '../../wailsjs/go/services/RegisterService';

function Register({ onIrALogin }) {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [confirmarContrasena, setConfirmarContrasena] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const manejarRegistro = (e) => {
        e.preventDefault();
        setError('');

        if (!usuario || !contrasena) {
            setError('Completa usuario y contraseña.');
            return;
        }

        if (contrasena !== confirmarContrasena) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        setCargando(true);

        RegistrarUsuario(usuario, contrasena)
            .then((exito) => {
                if (exito) {
                    alert('¡Cuenta creada! Ahora puedes iniciar sesión.');
                    onIrALogin?.(usuario);
                } else {
                    setError('No se pudo crear la cuenta. Intenta con otro usuario.');
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
                <h2>Crear cuenta</h2>

                <form onSubmit={manejarRegistro}>
                    <div className="input-grupo">
                        <label>Usuario</label>
                        <input
                            type="text"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            placeholder="Elige un usuario"
                        />
                    </div>

                    <div className="input-grupo">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            placeholder="Crea una contraseña"
                        />
                    </div>

                    <div className="input-grupo">
                        <label>Confirmar contraseña</label>
                        <input
                            type="password"
                            value={confirmarContrasena}
                            onChange={(e) => setConfirmarContrasena(e.target.value)}
                            placeholder="Repite tu contraseña"
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button type="submit" className="btn-entrar" disabled={cargando}>
                        {cargando ? 'Creando cuenta...' : 'Registrarme'}
                    </button>
                </form>

                <p className="auth-enlace">
                    ¿Ya tienes cuenta?{' '}
                    <button type="button" onClick={() => onIrALogin?.()}>
                        Inicia sesión
                    </button>
                </p>
            </div>
        </div>
    );
}

export default Register;
