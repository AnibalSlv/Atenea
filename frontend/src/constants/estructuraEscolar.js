/**
 * Estructura Escolar Oficial — U.E.M. Gregorio Romero
 */

export const TURNOS = {
    MANANA: 'Mañana',
    TARDE: 'Tarde',
};

export const NIVELES = {
    PREESCOLAR: 'Preescolar',
    PRIMARIA: 'Primaria',
};

export const GRADOS_PREESCOLAR = [
    { id: 'pre-1', nombre: '1ra Sala', nivel: NIVELES.PREESCOLAR },
    { id: 'pre-2', nombre: '2da Sala', nivel: NIVELES.PREESCOLAR },
    { id: 'pre-3', nombre: '3ra Sala', nivel: NIVELES.PREESCOLAR },
];

export const GRADOS_PRIMARIA = [
    { id: 'pri-1', nombre: '1er Grado', nivel: NIVELES.PRIMARIA },
    { id: 'pri-2', nombre: '2do Grado', nivel: NIVELES.PRIMARIA },
    { id: 'pri-3', nombre: '3er Grado', nivel: NIVELES.PRIMARIA },
    { id: 'pri-4', nombre: '4to Grado', nivel: NIVELES.PRIMARIA },
    { id: 'pri-5', nombre: '5to Grado', nivel: NIVELES.PRIMARIA },
    { id: 'pri-6', nombre: '6to Grado', nivel: NIVELES.PRIMARIA },
];

export const TODOS_LOS_GRADOS = [...GRADOS_PREESCOLAR, ...GRADOS_PRIMARIA];

export const ORDEN_GRADOS = TODOS_LOS_GRADOS.map((g) => g.nombre);

/**
 * Obtiene los grados válidos para la re-inscripción de un alumno regular.
 * Regla: solo puede repetir su grado actual (+0), pasar al siguiente grado (+1), o adelantarse 1 grado extra (+2).
 */
export function obtenerGradosPermitidosReinscripcion(gradoAnterior) {
    const idxAnt = ORDEN_GRADOS.indexOf(gradoAnterior);
    if (idxAnt === -1) return [...ORDEN_GRADOS];
    const permitidos = [];
    if (idxAnt < ORDEN_GRADOS.length) permitidos.push(ORDEN_GRADOS[idxAnt]);
    if (idxAnt + 1 < ORDEN_GRADOS.length) permitidos.push(ORDEN_GRADOS[idxAnt + 1]);
    if (idxAnt + 2 < ORDEN_GRADOS.length) permitidos.push(ORDEN_GRADOS[idxAnt + 2]);
    return permitidos;
}

/**
 * Valida si la promoción de grado es permitida en la re-inscripción.
 * Retorna null si es válida, o un mensaje de error si no está permitida.
 */
export function validarPromocionReinscripcion(gradoAnterior, gradoNuevo) {
    if (!gradoAnterior || !gradoNuevo) return null;
    const idxAnt = ORDEN_GRADOS.indexOf(gradoAnterior);
    const idxNue = ORDEN_GRADOS.indexOf(gradoNuevo);
    if (idxAnt === -1 || idxNue === -1) return null;

    if (idxNue < idxAnt) {
        return `No se puede retroceder de grado escolar. El alumno estaba en ${gradoAnterior} y no puede inscribirse en ${gradoNuevo}.`;
    }
    if (idxNue > idxAnt + 2) {
        const permitidos = obtenerGradosPermitidosReinscripcion(gradoAnterior);
        return `Promoción no válida: un alumno de ${gradoAnterior} no puede pasar directamente a ${gradoNuevo}. Como máximo solo es posible adelantarlo un grado (grados permitidos: ${permitidos.join(', ')}).`;
    }
    return null;
}

export const GENEROS = {
    VARON: 'Varón',
    HEMBRA: 'Hembra',
};

