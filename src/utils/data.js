// Dados de exemplo para as salas de reuniones
export const salas = [
  {
    id: 1,
    nombre: "Sala del consejo",
    capacidad: 10,
    ubicacion: "Oficina Central",
  },
  {
    id: 2,
    nombre: "Auditorio",
    capacidad: 100,
    ubicacion: "2 Piso ECOP",
  },
  {
    id: 3,
    nombre: "Sala Insumos",
    capacidad: 20,
    ubicacion: "Insumos Central",
  },
  {
    id: 4,
    nombre: "Amambay",
    capacidad: 10,
    ubicacion: "Insumos Amambay",
  },
  {
    id: 5,
    nombre: "San Juan nepomuceno",
    capacidad: 12,
    ubicacion: "Oficina San Juan Nepomuceno",
  },
  {
    id: 6,
    nombre: "Sala Piso 3",
    capacidad: 8,
    ubicacion: "Piso 3",
  }
];

// Função para obter data no formato correto
const formatoLocal = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Obtém a data atual e amanhã
const hoy = new Date();
const manana = new Date();
manana.setDate(hoy.getDate() + 1);

const hoyStr = formatoLocal(hoy);
const mananaStr = formatoLocal(manana);

// Reservas iniciales para demostración
export const reservasIniciales = [
  {
    id: 1,
    salaId: 1,
    fecha: hoyStr,
    horaInicio: "9:00",
    horaFin: "11:00",
    nombre: "Carlos Gómez",
    correo: "carlos@ejemplo.com",
    asistentes: 8,
    descripcion: "Reunión trimestral de ventas"
  },
  {
    id: 2,
    salaId: 3,
    fecha: hoyStr,
    horaInicio: "14:00",
    horaFin: "16:00",
    nombre: "Ana Martínez",
    correo: "ana@ejemplo.com",
    asistentes: 15,
    descripcion: "Presentación de nuevo producto"
  },
  {
    id: 3,
    salaId: 2,
    fecha: mananaStr,
    horaInicio: "10:00",
    horaFin: "12:00",
    nombre: "Miguel López",
    correo: "miguel@ejemplo.com",
    asistentes: 5,
    descripcion: "Sesión de brainstorming"
  }
];