import { TURNOS, GENEROS } from '../../../constants/estructuraEscolar';
import {
    IconoAlumnos,
    IconoUsuario,
    IconoBuscar,
    IconoAlerta,
} from '../../../components/Iconos';

/**
 * ====================================================================
 * CAPA DE CONSTANTES Y CONFIGURACIÓN — MÓDULO ASISTENCIA
 * ====================================================================
 */

export const CLAVE_STORAGE = 'atenea_asistencia_v1';
export const CLAVE_LIMITE = 'atenea_asistencia_limite_faltas';

export const DIAS_HISTORIAL = 20;
export const DIAS_PERIODO_ALERTAS = 30;
export const LIMITE_POR_DEFECTO = 3;

export const ESTADO = {
    PRESENTE: 'P',
    AUSENTE: 'A',
};

export const PESTANAS = [
    { id: 'alumnos', texto: 'Alumnos', Icono: IconoAlumnos },
    { id: 'personal', texto: 'Personal', Icono: IconoUsuario },
    { id: 'consultar', texto: 'Consultar', Icono: IconoBuscar },
    { id: 'alertas', texto: 'Alertas', Icono: IconoAlerta },
];

/**
 * Nómina inicial del personal de la U.E.M. Gregorio Romero
 * (Temporal mientras se expone el servicio de personal desde Go/Wails)
 */
export const PERSONAL_INICIAL = [
    { id: 'per-1', nombre: 'Yolanda Marcano', cargo: 'Directora', area: 'Directivo', turno: TURNOS.MANANA, genero: GENEROS.HEMBRA },
    { id: 'per-2', nombre: 'Luis Rodríguez', cargo: 'Subdirector', area: 'Directivo', turno: TURNOS.TARDE, genero: GENEROS.VARON },
    { id: 'per-3', nombre: 'Carmen Salazar', cargo: 'Docente — 1ra Sala', area: 'Docente', turno: TURNOS.MANANA, genero: GENEROS.HEMBRA },
    { id: 'per-4', nombre: 'Andreína Fermín', cargo: 'Docente — 3ra Sala', area: 'Docente', turno: TURNOS.TARDE, genero: GENEROS.HEMBRA },
    { id: 'per-5', nombre: 'José Brito', cargo: 'Docente — 2do Grado', area: 'Docente', turno: TURNOS.MANANA, genero: GENEROS.VARON },
    { id: 'per-6', nombre: 'Marisol Villarroel', cargo: 'Docente — 4to Grado', area: 'Docente', turno: TURNOS.TARDE, genero: GENEROS.HEMBRA },
    { id: 'per-7', nombre: 'Pedro Malavé', cargo: 'Docente — 6to Grado', area: 'Docente', turno: TURNOS.MANANA, genero: GENEROS.VARON },
    { id: 'per-8', nombre: 'Rosa Campos', cargo: 'Secretaria', area: 'Administrativo', turno: TURNOS.MANANA, genero: GENEROS.HEMBRA },
    { id: 'per-9', nombre: 'Daniel Gil', cargo: 'Coordinador de Control de Estudios', area: 'Administrativo', turno: TURNOS.TARDE, genero: GENEROS.VARON },
    { id: 'per-10', nombre: 'Ramón Suárez', cargo: 'Obrero', area: 'Ambiente', turno: TURNOS.MANANA, genero: GENEROS.VARON },
];
