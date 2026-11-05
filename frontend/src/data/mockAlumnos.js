import { ALUMNOS_INICIALES } from './alumnosIniciales';

const CLAVE_STORAGE = 'atenea_alumnos_db';
const CLAVE_CONFIG_RETIRO = 'atenea_config_retiro';
const CLAVE_HISTORIAL_PURGA = 'atenea_historial_purga';

// Obtener todos los alumnos desde localStorage o inicializar con los de prueba
export const getAlumnos = () => {
    const datosGuardados = localStorage.getItem(CLAVE_STORAGE);
    let lista = ALUMNOS_INICIALES;
    if (datosGuardados) {
        lista = JSON.parse(datosGuardados);
    } else {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(ALUMNOS_INICIALES));
    }
    // Asegurar que cada alumno tenga el atributo genero ('Varón' o 'Hembra')
    return lista.map((a) => {
        if (!a.genero) {
            const nom = (a.nombres || '').toLowerCase();
            const esHembra =
                nom.includes('mariana') ||
                nom.includes('maría') ||
                nom.includes('maria') ||
                nom.includes('carmen') ||
                nom.includes('isabel') ||
                nom.includes('ana') ||
                nom.includes('sofía') ||
                nom.includes('valentina');
            return { ...a, genero: esHembra ? 'Hembra' : 'Varón' };
        }
        return a;
    });
};

// Guardar un nuevo alumno (Nuevo Ingreso)
export const agregarAlumno = (nuevoAlumno) => {
    const listaActual = getAlumnos();
    const correlativo = String(listaActual.length + 1).padStart(3, '0');
    const alumnoConId = {
        ...nuevoAlumno,
        id: Date.now(),
        numeroCorrelativo: `#${correlativo}`,
        fechaRegistro: new Date().toISOString(),
        estado: 'Activo'
    };
    const nuevaLista = [...listaActual, alumnoConId];
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevaLista));
    return alumnoConId;
};

// Re-inscribir o actualizar grado/sección/turno de un alumno regular
export const actualizarGradoAlumnoRegular = (id, nuevoGrado, nuevaSeccion, nuevoTurno) => {
    const listaActual = getAlumnos();
    const nuevaLista = listaActual.map((alumno) => {
        if (alumno.id === id) {
            return {
                ...alumno,
                gradoNivel: nuevoGrado,
                seccionLiteral: nuevaSeccion,
                turno: nuevoTurno || alumno.turno,
                estado: 'Activo'
            };
        }
        return alumno;
    });
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevaLista));
};

// Actualizar la ficha completa del alumno desde el modo de edición
export const actualizarAlumnoCompleto = (alumnoEditado) => {
    const listaActual = getAlumnos();
    const nuevaLista = listaActual.map((alumno) =>
        alumno.id === alumnoEditado.id ? alumnoEditado : alumno
    );
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevaLista));
};

// Obtener solo los alumnos que se encuentran activos (no retirados)
export const getAlumnosActivos = () => {
    const lista = getAlumnos();
    return lista.filter((a) => !a.estado || a.estado === 'Activo');
};

// Obtener solo los alumnos en estado retirado
export const getAlumnosRetirados = () => {
    const lista = getAlumnos();
    return lista.filter((a) => a.estado === 'Retirado');
};

// Obtener configuración global del módulo de retiro
export const obtenerConfiguracionRetiro = () => {
    const guardada = localStorage.getItem(CLAVE_CONFIG_RETIRO);
    if (!guardada) {
        return {
            diasRetencionDefault: 30, // 30 días por defecto
            autoPurgaAlIniciar: true,
        };
    }
    return JSON.parse(guardada);
};

// Guardar configuración global del módulo de retiro
export const guardarConfiguracionRetiro = (nuevaConfig) => {
    const actual = obtenerConfiguracionRetiro();
    const actualizada = { ...actual, ...nuevaConfig };
    localStorage.setItem(CLAVE_CONFIG_RETIRO, JSON.stringify(actualizada));
    return actualizada;
};

/**
 * Registrar el retiro formal de un alumno
 * @param {number|string} id - ID del alumno a retirar
 * @param {Object} datosRetiro - Información del retiro
 */
export const retirarAlumno = (id, datosRetiro) => {
    const listaActual = getAlumnos();
    const diasRetencion = Number(datosRetiro.diasRetencion) || 30;

    // Calcular fecha exacta de eliminación programada (fecha actual + N días)
    const fechaProgramada = new Date();
    fechaProgramada.setDate(fechaProgramada.getDate() + diasRetencion);

    const nuevaLista = listaActual.map((alumno) => {
        if (alumno.id === id) {
            return {
                ...alumno,
                estado: 'Retirado',
                retiro: {
                    motivo: datosRetiro.motivo || 'Traslado a otra Institución',
                    motivoDetalle: datosRetiro.motivoDetalle || '',
                    fechaEfectiva: datosRetiro.fechaEfectiva || new Date().toISOString().split('T')[0],
                    fechaRegistroRetiro: new Date().toISOString(),
                    // Carta de aceptación obligatoria
                    institucionDestino: datosRetiro.institucionDestino,
                    numeroOficioCarta: datosRetiro.numeroOficioCarta || '',
                    nombreArchivoCarta: datosRetiro.nombreArchivoCarta || 'Carta_Aceptacion_Consignada.pdf',
                    tamanoArchivoCarta: datosRetiro.tamanoArchivoCarta || 'Documento en archivo',
                    tieneCartaAceptacion: 'SI',
                    // Política de retención (N días)
                    diasRetencion: diasRetencion,
                    fechaProgramadaEliminacion: fechaProgramada.toISOString(),
                    observaciones: datosRetiro.observaciones || '',
                    gradoAlRetirarse: alumno.gradoNivel || 'Sin Grado',
                    seccionAlRetirarse: alumno.seccionLiteral || 'A',
                    turnoAlRetirarse: alumno.turno || 'Mañana',
                    retiradoPor: datosRetiro.retiradoPor || 'Personal Administrativo',
                },
            };
        }
        return alumno;
    });

    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevaLista));
    return nuevaLista.find((a) => a.id === id);
};

// Restaurar un alumno retirado a estado activo
export const restaurarAlumno = (id) => {
    const listaActual = getAlumnos();
    const nuevaLista = listaActual.map((alumno) => {
        if (alumno.id === id) {
            const copia = { ...alumno };
            copia.estado = 'Activo';
            delete copia.retiro;
            return copia;
        }
        return alumno;
    });

    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevaLista));
};

// Historial de purgas / auditoría
export const obtenerHistorialPurga = () => {
    const guardado = localStorage.getItem(CLAVE_HISTORIAL_PURGA);
    return guardado ? JSON.parse(guardado) : [];
};

const registrarHistorialPurga = (registro) => {
    const historialActual = obtenerHistorialPurga();
    const nuevoHistorial = [
        {
            id: Date.now() + Math.random(),
            ...registro,
        },
        ...historialActual,
    ];
    localStorage.setItem(CLAVE_HISTORIAL_PURGA, JSON.stringify(nuevoHistorial));
};

// Eliminar un alumno definitivamente de la base de datos (Purga manual inmediata)
export const eliminarAlumnoDefinitivo = (id, motivoEliminacion = 'Eliminación manual anticipada') => {
    const listaActual = getAlumnos();
    const alumnoAEliminar = listaActual.find((a) => a.id === id);

    if (alumnoAEliminar) {
        registrarHistorialPurga({
            alumnoId: alumnoAEliminar.id,
            nombreCompleto: `${alumnoAEliminar.nombres} ${alumnoAEliminar.apellidos}`,
            numeroCorrelativo: alumnoAEliminar.numeroCorrelativo || 'S/C',
            representante: alumnoAEliminar.nombreRepresentante,
            ciRepresentante: alumnoAEliminar.ciRepresentante,
            grado: alumnoAEliminar.gradoNivel,
            fechaPurga: new Date().toISOString(),
            motivo: motivoEliminacion,
            diasRetencionEstablecidos: alumnoAEliminar.retiro?.diasRetencion || 0,
        });
    }

    const nuevaLista = listaActual.filter((a) => a.id !== id);
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(nuevaLista));
    return true;
};

// Purgar automáticamente todos los alumnos cuya fechaProgramadaEliminacion haya vencido
export const purgarAlumnosVencidos = () => {
    const listaActual = getAlumnos();
    const ahora = new Date();
    const alumnosParaPurgar = [];
    const alumnosConservados = [];

    listaActual.forEach((alumno) => {
        if (alumno.estado === 'Retirado' && alumno.retiro?.fechaProgramadaEliminacion) {
            const fechaLimite = new Date(alumno.retiro.fechaProgramadaEliminacion);
            if (ahora >= fechaLimite) {
                alumnosParaPurgar.push(alumno);
                return;
            }
        }
        alumnosConservados.push(alumno);
    });

    if (alumnosParaPurgar.length > 0) {
        alumnosParaPurgar.forEach((alumno) => {
            registrarHistorialPurga({
                alumnoId: alumno.id,
                nombreCompleto: `${alumno.nombres} ${alumno.apellidos}`,
                numeroCorrelativo: alumno.numeroCorrelativo || 'S/C',
                representante: alumno.nombreRepresentante,
                ciRepresentante: alumno.ciRepresentante,
                grado: alumno.gradoNivel,
                fechaPurga: ahora.toISOString(),
                motivo: 'Purga automática por vencimiento del período de retención (N días cumplidos)',
                diasRetencionEstablecidos: alumno.retiro?.diasRetencion || 0,
            });
        });

        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(alumnosConservados));
    }

    return {
        totalPurgados: alumnosParaPurgar.length,
        alumnosPurgados: alumnosParaPurgar,
    };
};
