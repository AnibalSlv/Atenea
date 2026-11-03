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

export const GENEROS = {
    VARON: 'Varón',
    HEMBRA: 'Hembra',
};

