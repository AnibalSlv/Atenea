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
 * retrocede al último viernes hábil (nunca devuelve una fecha futura).
 */
export const ultimoDiaHabil = () => {
    let cursor = hoyISO();
    while (esFinDeSemana(cursor)) {
        cursor = restarDias(cursor, 1);
    }
    return cursor;
};

/**
 * Devuelve el lunes (YYYY-MM-DD) de la semana escolar activa.
 * Solo se permite marcar o alterar asistencias desde este lunes
 * hasta el día hábil actual (nunca semanas pasadas ni días futuros).
 */
export const inicioSemanaEditable = () => {
    const ref = ultimoDiaHabil();
    const diaSemana = aFecha(ref).getDay(); // 1 = Lunes ... 5 = Viernes
    return restarDias(ref, diaSemana - 1);
};

export const finSemanaEditable = () => ultimoDiaHabil();

export const esFechaFutura = (iso) => iso > hoyISO();

export const esSemanaAnterior = (iso) => iso < inicioSemanaEditable();

/**
 * Evalúa si una fecha puede ser marcada o editada según las reglas:
 * 1. Prohibido marcar fechas futuras (posteriores a hoy).
 * 2. Prohibido alterar registros de semanas anteriores (solo la misma semana).
 * 3. Prohibido marcar en fines de semana.
 */
export const validarFechaEditable = (iso) => {
    if (!iso) {
        return {
            editable: false,
            motivo: 'invalida',
            texto: 'Selecciona una fecha válida',
        };
    }
    if (esFechaFutura(iso)) {
        return {
            editable: false,
            motivo: 'futura',
            texto: 'Fecha futura — no se permite marcar días posteriores',
        };
    }
    if (esSemanaAnterior(iso)) {
        return {
            editable: false,
            motivo: 'semana_cerrada',
            texto: 'Semana anterior cerrada — solo se puede modificar la semana actual',
        };
    }
    if (esFinDeSemana(iso)) {
        return {
            editable: false,
            motivo: 'fin_de_semana',
            texto: 'Fin de semana — sin actividad escolar',
        };
    }
    return {
        editable: true,
        motivo: null,
        texto: '',
    };
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
