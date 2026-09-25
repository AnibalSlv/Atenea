import { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Perfil from './pages/Perfil';

function App() {
    const [vista, setVista] = useState('login');
    const [usuario, setUsuario] = useState('');

    const manejarLoginExitoso = (nombreUsuario) => {
        setUsuario(nombreUsuario);
        setVista('home');
    };

    const cerrarSesion = () => {
        setUsuario('');
        setVista('login');
    };

    if (vista === 'register') {
        return <Register onIrALogin={() => setVista('login')} />;
    }

    if (vista === 'home') {
        return (
            <Home
                usuario={usuario}
                onIrAPerfil={() => setVista('perfil')}
                onCerrarSesion={cerrarSesion}
            />
        );
    }

    if (vista === 'perfil') {
        return <Perfil usuario={usuario} onVolver={() => setVista('home')} />;
    }

    return (
        <Login
            onIrARegistro={() => setVista('register')}
            onLoginExitoso={manejarLoginExitoso}
        />
    );
}

export default App;
