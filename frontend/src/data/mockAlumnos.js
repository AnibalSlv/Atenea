import { ALUMNOS_INICIALES } from './alumnosIniciales';

const CLAVE_STORAGE = 'atenea_alumnos_db_v3';

// Limpiar versiones anteriores para eliminar registros residuales
try {
    localStorage.removeItem('atenea_alumnos_db_v2');
    localStorage.removeItem('atenea_alumnos_db_v1');
    localStorage.removeItem('atenea_alumnos_db');
} catch (e) {
    // Ignorar si localStorage no está disponible
}

// Obtener todos los alumnos desde localStorage o inicializar con los de prueba
export const getAlumnos = () => {
    try {
        localStorage.removeItem('atenea_alumnos_db_v2');
        localStorage.removeItem('atenea_alumnos_db_v1');
        localStorage.removeItem('atenea_alumnos_db');
    } catch (e) {}

    const datosGuardados = localStorage.getItem(CLAVE_STORAGE);
    let lista = datosGuardados ? JSON.parse(datosGuardados) : ALUMNOS_INICIALES;

    // Garantizar que todos los alumnos tengan el campo genero para estadísticas V/H/T
    let actualizado = false;
    lista = lista.map((alumno) => {
        if (!alumno.genero) {
            actualizado = true;
            const nombre = (alumno.nombres || '').toLowerCase();
            const esHembra =
                nombre.includes('mariana') ||
                nombre.includes('maria') ||
                nombre.includes('carmen') ||
                nombre.includes('sofía') ||
                nombre.includes('camila') ||
                nombre.includes('valeria');
            return { ...alumno, genero: esHembra ? 'Hembra' : 'Varón' };
        }
        return alumno;
    });

    if (!datosGuardados || actualizado) {
        localStorage.setItem(CLAVE_STORAGE, JSON.stringify(lista));
    }

    return lista;
};

// Restablecer la lista a los alumnos iniciales de prueba (limpia registros creados)
export const restablecerAlumnos = () => {
    try {
        localStorage.removeItem(CLAVE_STORAGE);
        localStorage.removeItem('atenea_alumnos_db_v2');
        localStorage.removeItem('atenea_alumnos_db_v1');
        localStorage.removeItem('atenea_alumnos_db');
    } catch (e) {}
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(ALUMNOS_INICIALES));
    return [...ALUMNOS_INICIALES];
};

// Guardar un nuevo alumno (Nuevo Ingreso)
export const agregarAlumno = (nuevoAlumno) => {
    const listaActual = getAlumnos();
    const correlativo = String(listaActual.length + 1).padStart(3, '0');
    const alumnoConId = {
        ...nuevoAlumno,
        id: Date.now(),
        numeroCorrelativo: `#${correlativo}`,
        fechaRegistro: new Date().toISOString()
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
                turno: nuevoTurno || alumno.turno
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