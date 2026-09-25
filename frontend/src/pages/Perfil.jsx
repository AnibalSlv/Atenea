import { useEffect, useState } from 'react';
import { GetUser } from '../../wailsjs/go/services/UserService';

function Perfil({ usuario, onVolver }) {
    const [datos, setDatos] = useState(null);
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        GetUser(usuario)
            .then((resultado) => {
                if (!resultado) {
                    setError('No se encontraron datos de este usuario.');
                    return;
                }
                setDatos(resultado);
            })
            .catch((err) => {
                console.error('Hubo un problema de conexión con el backend:', err);
                setError('No se pudo conectar con el servidor.');
            })
            .finally(() => setCargando(false));
    }, [usuario]);

    const stat = datos?.Stats?.[0];

    return (
        <div className="login-pantalla">
            <div className="login-tarjeta perfil-tarjeta">
                <button className="perfil-volver" onClick={onVolver}>
                    ← Volver
                </button>

                <div className="perfil-avatar">🧑</div>
                <h2>{usuario}</h2>

                {cargando && <p>Cargando perfil...</p>}
                {!cargando && error && <p className="auth-error">{error}</p>}

                {!cargando && stat && (
                    <div className="perfil-stats">
                        <div className="perfil-stat">
                            <span className="perfil-stat-valor">{stat.Level}</span>
                            <span className="perfil-stat-label">Nivel</span>
                        </div>
                        <div className="perfil-stat">
                            <span className="perfil-stat-valor">{stat.Money}</span>
                            <span className="perfil-stat-label">Monedas</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Perfil;
