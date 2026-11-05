import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificacionesProvider } from './context/NotificacionesContext';
import RutaProtegida from './components/RutaProtegida';
import RutaPublica from './components/RutaPublica';
import MainLayout from './layout/MainLayout';
import Login from './modules/Auth/Login';
import Register from './modules/Auth/Register';
import Dashboard from './modules/Dashboard/Dashboard';
import Perfil from './modules/Perfil/Perfil';
import Alumnos from './modules/Alumnos/Alumnos';
import Inscribir from './modules/Inscribir/Inscribir';
import Retirar from './modules/Retirar';
import './App.css';

/**
 * HashRouter para Wails en Windows (Offline)
 */
function App() {
    return (
        <HashRouter>
            <AuthProvider>
                <NotificacionesProvider>
                    <Routes>
                        {/* ─── Rutas Públicas (Auth) ─────────────── */}
                        <Route
                            path="/login"
                            element={
                                <RutaPublica>
                                    <Login />
                                </RutaPublica>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <RutaPublica>
                                    <Register />
                                </RutaPublica>
                            }
                        />

                        {/* ─── Rutas Protegidas (con Layout Moderno) ─── */}
                        <Route
                            element={
                                <RutaProtegida>
                                    <MainLayout />
                                </RutaProtegida>
                            }
                        >
                            <Route index element={<Dashboard />} />
                            <Route path="perfil" element={<Perfil />} />
                            <Route path="alumnos" element={<Alumnos />} />
                            <Route path="inscribir" element={<Inscribir />} />
                            <Route path="retirar" element={<Retirar />} />

                            {/* Placeholders modulares restantes */}
                            <Route
                                path="asistencia"
                                element={
                                    <PlaceholderModulo
                                        nombre="Control de Asistencia"
                                        icono="📋"
                                    />
                                }
                            />
                            <Route
                                path="graficos"
                                element={
                                    <PlaceholderModulo
                                        nombre="Gráficos y Reportes"
                                        icono="📊"
                                    />
                                }
                            />
                            <Route
                                path="cupos"
                                element={
                                    <PlaceholderModulo
                                        nombre="Gestión de Cupos (Directora)"
                                        icono="🔒"
                                    />
                                }
                            />
                        </Route>

                        {/* ─── Ruta Catch-All ──────────────────── */}
                        <Route path="*" element={<RutaPublica><Login /></RutaPublica>} />
                    </Routes>
                </NotificacionesProvider>
            </AuthProvider>
        </HashRouter>
    );
}

function PlaceholderModulo({ nombre, icono }) {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '60vh',
                color: '#6b7280',
                gap: '1rem',
            }}
        >
            <span style={{ fontSize: '3rem' }}>{icono}</span>
            <h2 style={{ margin: 0, color: 'var(--color-sidebar)' }}>{nombre}</h2>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>Módulo en construcción</p>
        </div>
    );
}

export default App;
