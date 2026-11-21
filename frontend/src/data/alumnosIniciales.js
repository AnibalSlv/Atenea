// Simulación de base de datos inicial de alumnos para Atenea
// Cobertura completa de los 9 grados (Preescolar y Primaria) en ambos turnos (Mañana y Tarde)
// Teléfonos sin guiones en formato numérico puro venezolano

export const ALUMNOS_INICIALES = [
    {
        id: 1,
        numeroCorrelativo: '#001',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Mañana',
        gradoNivel: '1ra Sala',
        seccionLiteral: 'A',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '13100111',
        apellidos: 'Pérez Gómez',
        nombres: 'Carlos Luis',
        genero: 'Varón',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2023-01-01',
        edad: '3',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #10',
        institucionOrigen: 'Hogar de Cuidado',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Carolina Rivas',
        ciMadre: '20111222',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04147890123',
        correoMadre: 'carolinarivas@gmail.com',

        nombrePadre: 'Roberto Moreno',
        ciPadre: '19555666',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04248901234',
        correoPadre: 'robertomoreno@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #10',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Carolina Rivas',
        ciRepresentante: '20111222',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #10',
        telefonoRepresentante: '04147890123',
        correoRepresentante: 'carolinarivas@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 2,
        numeroCorrelativo: '#002',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Tarde',
        gradoNivel: '1ra Sala',
        seccionLiteral: 'B',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '30540033',
        apellidos: 'Rojas Silva',
        nombres: 'Mariana Isabel',
        genero: 'Hembra',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2023-02-04',
        edad: '3',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #11',
        institucionOrigen: 'Hogar de Cuidado',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Daniela Díaz',
        ciMadre: '21333444',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04165678901',
        correoMadre: 'danieladaz@gmail.com',

        nombrePadre: 'Ángel Marcano',
        ciPadre: '20888999',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04266789012',
        correoPadre: 'ngelmarcano@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #11',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Daniela Díaz',
        ciRepresentante: '21333444',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #11',
        telefonoRepresentante: '04165678901',
        correoRepresentante: 'danieladaz@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 3,
        numeroCorrelativo: '#003',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Mañana',
        gradoNivel: '2da Sala',
        seccionLiteral: 'A',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '13100333',
        apellidos: 'Torres Hernández',
        nombres: 'José Gregorio',
        genero: 'Varón',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2022-03-07',
        edad: '4',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #12',
        institucionOrigen: 'Hogar de Cuidado',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Andrea Gómez',
        ciMadre: '18999000',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04142345678',
        correoMadre: 'andreagmez@gmail.com',

        nombrePadre: 'Luis Salazar',
        ciPadre: '17888777',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04123456789',
        correoPadre: 'luissalazar@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #12',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Andrea Gómez',
        ciRepresentante: '18999000',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #12',
        telefonoRepresentante: '04142345678',
        correoRepresentante: 'andreagmez@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 4,
        numeroCorrelativo: '#004',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Tarde',
        gradoNivel: '2da Sala',
        seccionLiteral: 'B',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '31200444',
        apellidos: 'Mendoza Castillo',
        nombres: 'Valentina Sofía',
        genero: 'Hembra',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2022-04-10',
        edad: '4',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #13',
        institucionOrigen: 'Hogar de Cuidado',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Gabriela Peña',
        ciMadre: '22444555',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04169012345',
        correoMadre: 'gabrielapea@gmail.com',

        nombrePadre: 'Armando Rodríguez',
        ciPadre: '21555666',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04260123456',
        correoPadre: 'armandorodrguez@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #13',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Gabriela Peña',
        ciRepresentante: '22444555',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #13',
        telefonoRepresentante: '04169012345',
        correoRepresentante: 'gabrielapea@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 5,
        numeroCorrelativo: '#005',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Mañana',
        gradoNivel: '3ra Sala',
        seccionLiteral: 'A',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '32100555',
        apellidos: 'García Rivas',
        nombres: 'Mateo Alejandro',
        genero: 'Varón',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2021-05-13',
        edad: '5',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #14',
        institucionOrigen: 'Hogar de Cuidado',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Lucía Cruz',
        ciMadre: '19777888',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04143456789',
        correoMadre: 'lucacruz@gmail.com',

        nombrePadre: 'Manuel Ramos',
        ciPadre: '18666555',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04124567890',
        correoPadre: 'manuelramos@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #14',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Lucía Cruz',
        ciRepresentante: '19777888',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #14',
        telefonoRepresentante: '04143456789',
        correoRepresentante: 'lucacruz@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 6,
        numeroCorrelativo: '#006',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Tarde',
        gradoNivel: '3ra Sala',
        seccionLiteral: 'B',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '32400666',
        apellidos: 'Navarro Velásquez',
        nombres: 'Camila Victoria',
        genero: 'Hembra',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2021-06-16',
        edad: '5',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #15',
        institucionOrigen: 'Hogar de Cuidado',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Yulimar Velásquez',
        ciMadre: '23111222',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04247890123',
        correoMadre: 'yulimarvelsquez@gmail.com',

        nombrePadre: 'José Martínez',
        ciPadre: '22888999',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04168901234',
        correoPadre: 'josmartnez@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #15',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Yulimar Velásquez',
        ciRepresentante: '23111222',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #15',
        telefonoRepresentante: '04247890123',
        correoRepresentante: 'yulimarvelsquez@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 7,
        numeroCorrelativo: '#007',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Mañana',
        gradoNivel: '1er Grado',
        seccionLiteral: 'A',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '31500777',
        apellidos: 'Hernández Blanco',
        nombres: 'Sebastián David',
        genero: 'Varón',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2020-07-19',
        edad: '6',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #16',
        institucionOrigen: 'C.E.I. Bolivariano Simón Bolívar',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Elena Blanco',
        ciMadre: '17555444',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04148901234',
        correoMadre: 'elenablanco@gmail.com',

        nombrePadre: 'Carlos Hernández',
        ciPadre: '16444333',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04129012345',
        correoPadre: 'carloshernndez@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #16',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Elena Blanco',
        ciRepresentante: '17555444',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #16',
        telefonoRepresentante: '04148901234',
        correoRepresentante: 'elenablanco@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 8,
        numeroCorrelativo: '#008',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Tarde',
        gradoNivel: '1er Grado',
        seccionLiteral: 'B',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '31800888',
        apellidos: 'Morales Gil',
        nombres: 'Paula Andrea',
        genero: 'Hembra',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2020-08-22',
        edad: '6',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #17',
        institucionOrigen: 'C.E.I. Bolivariano Simón Bolívar',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Natalia Gil',
        ciMadre: '20222333',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04245678901',
        correoMadre: 'nataliagil@gmail.com',

        nombrePadre: 'Ricardo Morales',
        ciPadre: '19111222',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04166789012',
        correoPadre: 'ricardomorales@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #17',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Natalia Gil',
        ciRepresentante: '20222333',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #17',
        telefonoRepresentante: '04245678901',
        correoRepresentante: 'nataliagil@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 9,
        numeroCorrelativo: '#009',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Mañana',
        gradoNivel: '2do Grado',
        seccionLiteral: 'A',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '30900999',
        apellidos: 'Castillo Ortiz',
        nombres: 'Diego Andrés',
        genero: 'Varón',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2019-09-25',
        edad: '7',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #18',
        institucionOrigen: 'C.E.I. Bolivariano Simón Bolívar',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Victoria Ortiz',
        ciMadre: '16888999',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04146789012',
        correoMadre: 'victoriaortiz@gmail.com',

        nombrePadre: 'Fernando Castillo',
        ciPadre: '15777888',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04127890123',
        correoPadre: 'fernandocastillo@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #18',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Victoria Ortiz',
        ciRepresentante: '16888999',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #18',
        telefonoRepresentante: '04146789012',
        correoRepresentante: 'victoriaortiz@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 10,
        numeroCorrelativo: '#010',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Tarde',
        gradoNivel: '2do Grado',
        seccionLiteral: 'B',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '30200112',
        apellidos: 'Gutiérrez Salazar',
        nombres: 'Valeria Nicole',
        genero: 'Hembra',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2019-10-03',
        edad: '7',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #19',
        institucionOrigen: 'C.E.I. Bolivariano Simón Bolívar',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Patricia Salazar',
        ciMadre: '18333444',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04241234567',
        correoMadre: 'patriciasalazar@gmail.com',

        nombrePadre: 'Mauricio Gutiérrez',
        ciPadre: '17222333',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04162345678',
        correoPadre: 'mauriciogutirrez@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #19',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Patricia Salazar',
        ciRepresentante: '18333444',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #19',
        telefonoRepresentante: '04241234567',
        correoRepresentante: 'patriciasalazar@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 11,
        numeroCorrelativo: '#011',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Mañana',
        gradoNivel: '3er Grado',
        seccionLiteral: 'A',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '29800223',
        apellidos: 'Romero Fuentes',
        nombres: 'Gabriel Eduardo',
        genero: 'Varón',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2018-11-06',
        edad: '8',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #20',
        institucionOrigen: 'C.E.I. Bolivariano Simón Bolívar',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Carmen Fuentes',
        ciMadre: '15999000',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04149012345',
        correoMadre: 'carmenfuentes@gmail.com',

        nombrePadre: 'Eduardo Romero',
        ciPadre: '14888999',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04120123456',
        correoPadre: 'eduardoromero@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #20',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Carmen Fuentes',
        ciRepresentante: '15999000',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #20',
        telefonoRepresentante: '04149012345',
        correoRepresentante: 'carmenfuentes@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 12,
        numeroCorrelativo: '#012',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Tarde',
        gradoNivel: '3er Grado',
        seccionLiteral: 'B',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '29500334',
        apellidos: 'Vargas Medina',
        nombres: 'Isabella Beatriz',
        genero: 'Hembra',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2018-12-09',
        edad: '8',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #21',
        institucionOrigen: 'C.E.I. Bolivariano Simón Bolívar',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Lorena Medina',
        ciMadre: '17444555',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04243456789',
        correoMadre: 'lorenamedina@gmail.com',

        nombrePadre: 'Simón Vargas',
        ciPadre: '16333444',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04164567890',
        correoPadre: 'simnvargas@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #21',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Lorena Medina',
        ciRepresentante: '17444555',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #21',
        telefonoRepresentante: '04243456789',
        correoRepresentante: 'lorenamedina@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 13,
        numeroCorrelativo: '#013',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Mañana',
        gradoNivel: '4to Grado',
        seccionLiteral: 'A',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '28900445',
        apellidos: 'Flores Parra',
        nombres: 'Samuel Enrique',
        genero: 'Varón',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2017-01-12',
        edad: '9',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #22',
        institucionOrigen: 'C.E.I. Bolivariano Simón Bolívar',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Mónica Parra',
        ciMadre: '14777888',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04145678901',
        correoMadre: 'mnicaparra@gmail.com',

        nombrePadre: 'Jorge Flores',
        ciPadre: '13666777',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04126789012',
        correoPadre: 'jorgeflores@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #22',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Mónica Parra',
        ciRepresentante: '14777888',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #22',
        telefonoRepresentante: '04145678901',
        correoRepresentante: 'mnicaparra@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 14,
        numeroCorrelativo: '#014',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Tarde',
        gradoNivel: '4to Grado',
        seccionLiteral: 'B',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '28600556',
        apellidos: 'Herrera Aguilar',
        nombres: 'Daniela Alejandra',
        genero: 'Hembra',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2017-02-15',
        edad: '9',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #23',
        institucionOrigen: 'C.E.I. Bolivariano Simón Bolívar',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Silvia Aguilar',
        ciMadre: '16111222',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04248901234',
        correoMadre: 'silviaaguilar@gmail.com',

        nombrePadre: 'César Herrera',
        ciPadre: '15000111',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04169012345',
        correoPadre: 'csarherrera@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #23',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Silvia Aguilar',
        ciRepresentante: '16111222',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #23',
        telefonoRepresentante: '04248901234',
        correoRepresentante: 'silviaaguilar@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 15,
        numeroCorrelativo: '#015',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Mañana',
        gradoNivel: '5to Grado',
        seccionLiteral: 'A',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '27800667',
        apellidos: 'Soto Villarroel',
        nombres: 'Leonardo José',
        genero: 'Varón',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2016-03-18',
        edad: '10',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #24',
        institucionOrigen: 'C.E.I. Bolivariano Simón Bolívar',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Daniela Soto',
        ciMadre: '13999000',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04243334455',
        correoMadre: 'danielasoto@gmail.com',

        nombrePadre: 'Pedro Villarroel',
        ciPadre: '12888999',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04164445566',
        correoPadre: 'pedrovillarroel@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #24',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Daniela Soto',
        ciRepresentante: '13999000',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #24',
        telefonoRepresentante: '04243334455',
        correoRepresentante: 'danielasoto@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 16,
        numeroCorrelativo: '#016',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Tarde',
        gradoNivel: '5to Grado',
        seccionLiteral: 'B',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '27400778',
        apellidos: 'Cedeño Romero',
        nombres: 'Fabiana Coromoto',
        genero: 'Hembra',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2016-04-21',
        edad: '10',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #25',
        institucionOrigen: 'C.E.I. Bolivariano Simón Bolívar',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Beatriz Cedeño',
        ciMadre: '15555666',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04145556677',
        correoMadre: 'beatrizcedeo@gmail.com',

        nombrePadre: 'Enrique Romero',
        ciPadre: '14444555',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04126667788',
        correoPadre: 'enriqueromero@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #25',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Beatriz Cedeño',
        ciRepresentante: '15555666',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #25',
        telefonoRepresentante: '04145556677',
        correoRepresentante: 'beatrizcedeo@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 17,
        numeroCorrelativo: '#017',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Mañana',
        gradoNivel: '6to Grado',
        seccionLiteral: 'A',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '26900889',
        apellidos: 'Lunar Brito',
        nombres: 'Santiago Jesús',
        genero: 'Varón',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2015-05-24',
        edad: '11',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #26',
        institucionOrigen: 'C.E.I. Bolivariano Simón Bolívar',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Inés Brito',
        ciMadre: '12777888',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04247778899',
        correoMadre: 'insbrito@gmail.com',

        nombrePadre: 'Héctor Lunar',
        ciPadre: '11666777',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04168889900',
        correoPadre: 'hctorlunar@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #26',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Inés Brito',
        ciRepresentante: '12777888',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #26',
        telefonoRepresentante: '04247778899',
        correoRepresentante: 'insbrito@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    },
    {
        id: 18,
        numeroCorrelativo: '#018',
        fechaRegistro: '2026-09-15T08:00:00.000Z',
        turno: 'Tarde',
        gradoNivel: '6to Grado',
        seccionLiteral: 'B',

        // 1. Datos del Estudiante
        fechaIngreso: '2026-09-15',
        cedulaEscolar: '26500990',
        apellidos: 'Alfonzo Millán',
        nombres: 'Génesis Carlota',
        genero: 'Hembra',
        lugarNacimiento: 'Porlamar, Nueva Esparta',
        fechaNacimiento: '2015-06-02',
        edad: '11',
        lateralidad: 'Derecho',
        nacionalidad: 'Venezolano',
        direccionEstudiante: 'Sector Los Cocos, Calle San Nicolás, Casa #27',
        institucionOrigen: 'C.E.I. Bolivariano Simón Bolívar',
        fiebreMedicamento: 'Paracetamol jarabe 120mg',
        alergias: 'Ninguna conocida',

        // 2. Diagnóstico / Necesidades Especiales
        diagnostico: '',
        medicoTratante: '',
        telefonoMedico: '',
        equipoApoyo: '',

        // 3. Datos de los Padres y Comunidad
        nombreMadre: 'Verónica Millán',
        ciMadre: '14999000',
        instruccionMadre: 'Universitario',
        ocupacionMadre: 'Docente',
        lugarTrabajoMadre: 'Porlamar',
        direccionTrabajoMadre: 'Av. 4 de Mayo',
        telefonoMadre: '04149990011',
        correoMadre: 'vernicamilln@gmail.com',

        nombrePadre: 'David Alfonzo',
        ciPadre: '13888999',
        instruccionPadre: 'TSU',
        ocupacionPadre: 'Comerciante',
        lugarTrabajoPadre: 'Centro de Porlamar',
        direccionTrabajoPadre: 'Calle Guevara',
        telefonoPadre: '04121110022',
        correoPadre: 'davidalfonzo@gmail.com',

        liderCalle: 'Margarita Suárez',
        nombreComuna: 'Comuna Bahía del Sol',
        direccionResidencia: 'Sector Los Cocos, Calle San Nicolás, Casa #27',
        centroVotacion: 'U.E.M. Gregorio Romero',

        // 4. Representante
        nombreRepresentante: 'Verónica Millán',
        ciRepresentante: '14999000',
        ocupacionRepresentante: 'Docente',
        direccionRepresentante: 'Sector Los Cocos, Calle San Nicolás, Casa #27',
        telefonoRepresentante: '04149990011',
        correoRepresentante: 'vernicamilln@gmail.com',

        // 5. Situación de la Pareja
        situacionPareja: 'Casado',

        // 6. Vivienda
        tipoVivienda: 'Propia',
        cuartosVivienda: '3',
        materialParedes: 'Bloque frisado',
        materialTecho: 'Platabanda / Concreto',

        // 7. Habitantes
        cantidadPersonasVivienda: '4',
        familiasEnVivienda: '1',
        numeroHermanos: '1',

        // 8. Servicios Básicos
        servicioAgua: true,
        servicioDesague: true,
        servicioElectricidad: true,
        servicioTelefonia: true,
        servicioInternet: true,

        // 9. Otros (Condiciones del Hogar)
        aguaPotableContinua: false,
        banosBuenEstado: true,
        tienePoceta: true,
        tieneDucha: true,
        tieneLavamanos: true,
        servicioAseoFrecuente: true,
        recibeGasFrecuente: true,
        participaComunidad: true,
        colaboraEscuela: true
    }
];
