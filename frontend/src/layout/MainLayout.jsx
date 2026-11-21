import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './MainLayout.css';

function MainLayout() {
    return (
        <div className="main-layout">
            <Sidebar />
            <div className="main-layout__cuerpo">
                <Navbar />
                <main className="main-layout__contenido">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default MainLayout;
