import { createContext, useContext, useState } from 'react';

const NotificacionesContext = createContext();

export function NotificacionesProvider({ children }) {
    // Estado inicial limpio sin notificaciones precargadas
    const [notificaciones, setNotificaciones] = useState([]);

    const agregarNotificacion = (notificación) => {
        setNotificaciones((prev) => [
            {
                id: Date.now(),
                leida: false,
                fecha: new Date().toISOString(),
                ...notificación,
            },
            ...prev,
        ]);
    };

    const marcarComoLeida = (id) => {
        setNotificaciones((prev) =>
            prev.map((item) => (item.id === id ? { ...item, leida: true } : item))
        );
    };

    const marcarTodasComoLeidas = () => {
        setNotificaciones((prev) =>
            prev.map((item) => ({ ...item, leida: true }))
        );
    };

    const eliminarNotificacion = (id) => {
        setNotificaciones((prev) => prev.filter((item) => item.id !== id));
    };

    const limpiarTodas = () => {
        setNotificaciones([]);
    };

    return (
        <NotificacionesContext.Provider
            value={{
                notificaciones,
                agregarNotificacion,
                marcarComoLeida,
                marcarTodasComoLeidas,
                eliminarNotificacion,
                limpiarTodas,
            }}
        >
            {children}
        </NotificacionesContext.Provider>
    );
}

export const useNotificaciones = () => {
    const context = useContext(NotificacionesContext);
    if (!context) {
        throw new Error('useNotificaciones debe utilizarse dentro de NotificacionesProvider');
    }
    return context;
};