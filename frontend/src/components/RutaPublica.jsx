import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente que protege rutas públicas (Login, Register).
 *
 * Si el usuario YA está autenticado y trata de ir a /login o /register,
 * lo redirige automáticamente al Home.
 */
function RutaPublica({ children }) {
    const { estaAutenticado } = useAuth();

    if (estaAutenticado) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default RutaPublica;

