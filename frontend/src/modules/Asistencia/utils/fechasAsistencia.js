/**
 * ====================================================================
 * CAPA DE UTILIDADES DE FECHA Y CALENDARIO ESCOLAR — MÓDULO ASISTENCIA
 * ====================================================================
 */

export const fechaISO = (fecha) => {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, '0');
    const d = String(fecha.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const hoyISO = () => fechaISO(new Date());

export const aFecha = (iso) => new Date(`${iso}T00:00:00`);

export const esFinDeSemana = (iso) => {
    const dia = aFecha(iso).getDay();
    return dia === 0 || dia === 6;
};

export const restarDias = (iso, dias) => {
    const f = aFecha(iso);
    f.setDate(f.getDate() - dias);
    return fechaISO(f);
};

/**
 * Devuelve la fecha actual si es día hábil; si cae en sábado o domingo,
 * retrocede al último viernes hábil.
 */
export const ultimoDiaHabil = () => {
    let cursor = hoyISO();
    while (esFinDeSemana(cursor)) {
        cursor = restarDias(cursor, 1);
    }
    return cursor;
};

export const formatearFechaLarga = (iso) =>
    aFecha(iso).toLocaleDateString('es-VE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

export const formatearFechaCorta = (iso) =>
    aFecha(iso).toLocaleDateString('es-VE', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

export const diasHabilesPrevios = (cantidad) => {
    const dias = [];
    let cursor = restarDias(hoyISO(), 1);
    while (dias.length < cantidad) {
        if (!esFinDeSemana(cursor)) dias.push(cursor);
        cursor = restarDias(cursor, 1);
    }
    return dias;
};
