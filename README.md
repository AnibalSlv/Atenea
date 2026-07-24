# Atenea

Aplicación de escritorio desarrollada con **Wails** (Backend en Go y Frontend en React con Vite).

# Requisitos Previos

Antes de clonar y ejecutar el proyecto, asegúrate de tener instalado en tu sistema operativo:
- **Go** (Versión `1.25.0` o superior)
- **Node.js** (Gestionado mediante **NVM** para asegurar la misma versión)
- **Wails CLI** (Instalado globalmente en tu máquina)

---

# Guía de Inicio Rápido

Sigue estos pasos para levantar el entorno de desarrollo localmente:

1. Clonar el repositorio
git clone https://github.com/AnibalSlv/Atenea.git
cd atenea


2. Sincronizar la version de Node.js
```
cd frontend
nvm use
```

4. Instalar las dependencias del Frontend
npm install

5. Volver a la raíz y levantar el entorno de desarrollo
cd ..
wails dev
