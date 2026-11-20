import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente que protege rutas privadas.
 *
 * Props:
 *  - children: Contenido a renderizar si el usuario está autenticado.
 *  - rolRequerido: (opcional) Si se especifica, solo permite acceso a ese rol.
 *                  Ejemplo: rolRequerido="directora"
 *  - redirigirA: (opcional) Ruta a la que redirigir. Default: "/login"
 *
 * Uso:
 *   <Route path="/cupos" element={
 *       <RutaProtegida rolRequerido="directora">
 *           <Cupos />
 *       </RutaProtegida>
 *   } />
 */
function RutaProtegida({ children, rolRequerido, redirigirA = '/login' }) {
    const { estaAutenticado, usuario } = useAuth();

    // Si no está autenticado, redirigir al login
    if (!estaAutenticado) {
        return <Navigate to={redirigirA} replace />;
    }

    // Si se requiere un rol específico y el usuario no lo tiene,
    // redirigir al home (no al login, porque sí está autenticado)
    if (rolRequerido && usuario.rol !== rolRequerido) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default RutaProtegida;

