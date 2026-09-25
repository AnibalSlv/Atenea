function Home({ usuario, onIrAPerfil, onCerrarSesion }) {
    return (
        <div className="home-pantalla">
            <header className="home-header">
                <h2>¡Hola, {usuario}!</h2>
                <button className="btn-salir" onClick={onCerrarSesion}>
                    Cerrar sesión
                </button>
            </header>

            <nav className="home-menu">
                <button className="home-tarjeta-menu" onClick={onIrAPerfil}>
                    <span className="home-tarjeta-icono">👤</span>
                    Mi Perfil
                </button>

                <button className="home-tarjeta-menu" disabled>
                    <span className="home-tarjeta-icono">📚</span>
                    Biblioteca
                    <span className="home-tarjeta-badge">Próximamente</span>
                </button>

                <button className="home-tarjeta-menu" disabled>
                    <span className="home-tarjeta-icono">🛒</span>
                    Tienda
                    <span className="home-tarjeta-badge">Próximamente</span>
                </button>
            </nav>
        </div>
    );
}

export default Home;
