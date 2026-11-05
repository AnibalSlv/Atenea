#  Guía de Estilos y Arquitectura Frontend 

Este documento es la **referencia oficial de interfaz y arquitectura** para cualquier desarrollador que trabaje en el frontend del sistema administrativo.

---

## 1. Arquitectura Modular y por Capas (Feature-Driven)

El frontend sigue estrictamente una arquitectura dividida en **3 capas**:

```
src/
├── styles/           → CAPA 1: Base / Fundacional (tokens globales theme.css)
├── layout/           → CAPA 2: Shell global (Sidebar, Navbar, MainLayout)
├── context/          → CAPA 2: Estados globales (AuthContext, NotificacionesContext)
├── constants/        → CAPA 2: Constantes del dominio (estructuraEscolar.js)
└── modules/          → CAPA 3: Módulos de negocio (Feature-Driven)
    ├── Auth/         → Login y Register
    ├── Dashboard/    → Panel de Control y Métricas
    ├── Perfil/       → Información del usuario activo
    ├── Alumnos/      → Buscador y Ficha de expediente
    ├── Asistencia/   → Control diario (Varones/Hembras/Total)
    ├── Inscribir/    → Nuevos ingresos y regulares
    ├── Retirar/      → Pases y bajas
    ├── Graficos/     → Reportes visuales
    └── Cupos/        → Gestión de vacantes (Solo Directora)
```

> ⚠️ **Regla de oro:** Cada nuevo módulo DEBE crearse en su propia carpeta bajo `src/modules/NombreModulo/` conteniendo su `NombreModulo.jsx` y su `NombreModulo.css`. **Está prohibido crear componentes sueltos en carpetas genéricas como `pages/`.**

---

## 2. Paleta de Colores y Tokens Oficiales (`src/styles/theme.css`)

Nunca uses colores hexadecimales arbitrarios. Usa siempre las variables CSS del tema:

| Variable | Código | Uso Oficial |
| :--- | :--- | :--- |
| `var(--color-sidebar)` | `#4154b3` | Azul/Morado primario para botones principales y menús |
| `var(--color-sidebar-dark)` | `#324294` | Azul oscuro institucional para degradados y títulos |
| `var(--color-fondo)` | `#f1f4f9` | Fondo gris azulado ultra limpio de la aplicación |
| `var(--color-blanco)` | `#ffffff` | Fondo de tarjetas y paneles blancos |
| `var(--color-verde)` | `#548d36` | Asistencia presente, guardado exitoso, estados activos |
| `var(--color-amarillo)` | `#ffbc00` | Alertas, cupos por agotarse, pendientes |
| `var(--color-rojo)` | `#e63946` | Cupo agotado, errores, inasistencias |
| `var(--color-varon)` | `#1e40af` | Identificador de género Varón (V) |
| `var(--color-hembra)` | `#9d174d` | Identificador de género Hembra (H) |

---

## 3. Formas, Bordes y Sombras

- **Tarjetas y Paneles (`var(--radio-tarjeta)`):** `border-radius: 20px;`
- **Modales y Tarjetas Auth (`var(--radio-modal)`):** `border-radius: 24px;`
- **Inputs y Botones (`var(--radio-pequeno)`):** `border-radius: 12px;`
- **Píldoras y Badges (`var(--radio-pildora)`):** `border-radius: 999px;`
- **Sombra estándar de tarjetas:** `box-shadow: 0 4px 20px rgba(50, 66, 148, 0.06);`

---

## 4. Estructura Escolar Oficial (Dominio del Negocio)

La U.E.M. Gregorio Romero opera bajo la siguiente organización escolar estricta:

1. **Niveles y Grados:**
   - **PREESCOLAR:** 1ra Sala, 2da Sala y 3ra Sala.
   - **PRIMARIA:** 1er Grado, 2do Grado, 3er Grado, 4to Grado, 5to Grado y 6to Grado.
2. **Turnos:**
   - **Turno Mañana:** Contiene Preescolar (1ra, 2da, 3ra Sala) y Primaria (1º a 6º).
   - **Turno Tarde:** Contiene Preescolar (1ra, 2da, 3ra Sala) y Primaria (1º a 6º).
3. **Cálculo de Asistencia:**
   - Debe registrarse y tabularse siempre clasificando: **Varones (V)**, **Hembras (H)** y **Total (V + H)**.

Para mantener sincronía, importa siempre desde [`src/constants/estructuraEscolar.js`](file:///c:/Users/julia/Desktop/Atenea/frontend/src/constants/estructuraEscolar.js):
```javascript
import { NIVELES, TURNOS, TODOS_LOS_GRADOS } from '../../constants/estructuraEscolar';
```

---

## 5. Reglas de Integración con el Backend (Go / Wails)

1. **Sin APIs REST:** NUNCA usar `fetch`, `axios` ni llamadas HTTP. La comunicación se realiza **exclusivamente** importando los bindings autogenerados en `frontend/wailsjs/go/`.
2. **Prevención de doble clic:** En todos los formularios y botones de acción, usar `disabled={cargando}` y referencias síncronas (`useRef`) para evitar envíos múltiples accidentales.
3. **100% Offline:** Todo el sistema debe ser tolerante a caídas locales y recargas sin depender de internet.

