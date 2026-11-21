import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Login as AutenticarUsuario } from '../../wailsjs/go/services/LoginService';
import { GetUser } from '../../wailsjs/go/services/UserService';

// ─── Constantes ──────────────────────────────────────────────
const ROLES = {
    DIRECTORA: 'directora',
    ADMIN: 'admin',
};

/**
 * Determina el rol del usuario.
 *
 * TEMPORAL: Mientras el backend no devuelva un campo "Role",
 * el usuario "admin" del mock actúa como Directora.
 * Cuando Aníbal agregue el campo Role al struct User,
 * basta con reemplazar esta función por:
 *   return datosUsuario.Role || ROLES.ADMIN;
 */
const determinarRol = (nombreUsuario, _datosUsuario) => {
    const nombreNormalizado = nombreUsuario.trim().toLowerCase();
    if (nombreNormalizado === 'admin') {
        return ROLES.DIRECTORA;
    }
    return ROLES.ADMIN;
};

// ─── Contexto ────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);   // { nombre, rol }
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState('');
    const enviandoRef = useRef(false);

    // ─── Login ───────────────────────────────────────────────
    const iniciarSesion = useCallback(async (nombreUsuario, contrasena) => {
        // Bloqueo sincrónico contra doble clic
        if (enviandoRef.current) return false;
        enviandoRef.current = true;
        setCargando(true);
        setError('');

        try {
            const esValido = await AutenticarUsuario(nombreUsuario, contrasena);

            if (!esValido) {
                setError('Usuario o contraseña incorrectos.');
                return false;
            }

            // Obtener datos del usuario para determinar el rol
            let datosUsuario = null;
            try {
                const resultado = await GetUser(nombreUsuario);
                // GetUser devuelve [User|null, boolean]
                if (resultado) {
                    datosUsuario = resultado;
                }
            } catch (err) {
                console.warn('No se pudieron obtener datos del usuario, continuando con rol por defecto:', err);
            }

            const rol = determinarRol(nombreUsuario, datosUsuario);

            setUsuario({
                nombre: nombreUsuario,
                rol,
            });

            return true;
        } catch (err) {
            console.error('Error de conexión con el backend:', err);
            setError('No se pudo conectar con el servidor.');
            return false;
        } finally {
            enviandoRef.current = false;
            setCargando(false);
        }
    }, []);

    // ─── Logout ──────────────────────────────────────────────
    const cerrarSesion = useCallback(() => {
        setUsuario(null);
        setError('');
    }, []);

    // ─── Helpers de rol ──────────────────────────────────────
    const estaAutenticado = usuario !== null;
    const esDirectora = usuario?.rol === ROLES.DIRECTORA;

    // ─── Provider ────────────────────────────────────────────
    const valor = {
        usuario,
        cargando,
        error,
        estaAutenticado,
        esDirectora,
        iniciarSesion,
        cerrarSesion,
        setError,
        ROLES,
    };

    return (
        <AuthContext.Provider value={valor}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook para consumir el AuthContext.
 * Lanza un error si se usa fuera del AuthProvider.
 */
export function useAuth() {
    const contexto = useContext(AuthContext);
    if (!contexto) {
        throw new Error('useAuth debe usarse dentro de un <AuthProvider>.');
    }
    return contexto;
}

export { ROLES };
export default AuthContext;

