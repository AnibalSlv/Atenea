import { TURNOS, GENEROS } from '../../../constants/estructuraEscolar';
import {
    CLAVE_STORAGE,
    CLAVE_LIMITE,
    DIAS_HISTORIAL,
    LIMITE_POR_DEFECTO,
    ESTADO,
} from '../constants/asistenciaConfig';
import { diasHabilesPrevios } from './fechasAsistencia';

/**
 * ====================================================================
 * CAPA DE LÓGICA DE DOMINIO, CÁLCULOS V/H/T Y PERSISTENCIA OFFLINE
 * ====================================================================
 */

const pseudoAleatorio = (a, b) => {
    const x = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
    return x - Math.floor(x);
};

const idNumerico = (id) =>
    typeof id === 'number'
        ? id
        : String(id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

/**
 * Genera el historial base de días hábiles anteriores (100% determinista y offline).
 */
export const generarHistorial = (alumnos, personal) => {
    const historial = {};
    diasHabilesPrevios(DIAS_HISTORIAL).forEach((fecha, d) => {
        const registroAlumnos = {};
        alumnos.forEach((a) => {
            const n = idNumerico(a.id);
            const tasa = n % 5 === 0 ? 0.3 : n % 7 === 0 ? 0.18 : 0.05;
            registroAlumnos[a.id] =
                pseudoAleatorio(n, d + 1) < tasa ? ESTADO.AUSENTE : ESTADO.PRESENTE;
        });

        const registroPersonal = {};
        personal.forEach((p) => {
            const n = idNumerico(p.id);
            const presente = pseudoAleatorio(n, d + 7) >= 0.06;
            const minutos = String(Math.floor(pseudoAleatorio(n, d + 3) * 25)).padStart(2, '0');
            const horaBase = p.turno === TURNOS.MANANA ? '06' : '12';
            registroPersonal[p.id] = presente
                ? { estado: ESTADO.PRESENTE, hora: `${horaBase}:${minutos}` }
                : { estado: ESTADO.AUSENTE, hora: '' };
        });

        historial[fecha] = {
            alumnos: registroAlumnos,
            personal: registroPersonal,
            alumnosGuardado: true,
            personalGuardado: true,
        };
    });
    return historial;
};

export const cargarGuardados = () => {
    try {
        const datos = localStorage.getItem(CLAVE_STORAGE);
        return datos ? JSON.parse(datos) : {};
    } catch {
        return {};
    }
};

export const cargarLimite = () => {
    const valor = Number(localStorage.getItem(CLAVE_LIMITE));
    return valor > 0 ? valor : LIMITE_POR_DEFECTO;
};

export const nombreCompleto = (a) => `${a.apellidos}, ${a.nombres}`;

/**
 * Obtiene la inicial del primer nombre y la inicial del primer apellido.
 * - Si el texto viene en formato "Apellidos, Nombres" (ej. "Pérez Gómez, Carlos Luis") → "CP"
 * - Si el texto viene en formato "Nombre Apellido" (ej. "Yolanda Marcano") → "YM"
 */
export const iniciales = (texto = '') => {
    if (texto.includes(',')) {
        const [parteApellidos, parteNombres] = texto.split(',').map((s) => s.trim());
        const inicialNombre = parteNombres?.split(/\s+/).filter(Boolean)[0]?.[0] || '';
        const inicialApellido = parteApellidos?.split(/\s+/).filter(Boolean)[0]?.[0] || '';
        return `${inicialNombre}${inicialApellido}`.toUpperCase();
    }
    return texto
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0])
        .join('')
        .toUpperCase();
};

export const esVaron = (genero) => genero === GENEROS.VARON;

/**
 * Calcula la clasificación oficial escolar: Varones (V), Hembras (H) y Total (V + H).
 */
export const contarVHT = (lista, predicado = () => true) => {
    const filtrados = lista.filter(predicado);
    const v = filtrados.filter((x) => esVaron(x.genero)).length;
    return { v, h: filtrados.length - v, t: filtrados.length };
};

/**
 * Exporta una tabla de asistencia a archivo CSV con BOM UTF-8 (100% offline).
 */
export const descargarCSV = (nombreArchivo, encabezados, filas) => {
    const escapar = (valor) => `"${String(valor ?? '').replace(/"/g, '""')}"`;
    const contenido = [encabezados, ...filas]
        .map((fila) => fila.map(escapar).join(';'))
        .join('\r\n');
    const blob = new Blob(['\uFEFF' + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
};
