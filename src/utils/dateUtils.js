export function normalizarFecha(fecha) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

export function esLaMismaFecha(fechaA, fechaB) {
  const fa = normalizarFecha(new Date(fechaA));
  const fb = normalizarFecha(new Date(fechaB));
  return fa.getTime() === fb.getTime();
}

export function formatearFecha(fechaISO) {
  if (!fechaISO) return '';

  // Criar data local a partir da string YYYY-MM-DD
  const [year, month, day] = fechaISO.split('-').map(Number);
  const fecha = new Date(year, month - 1, day);

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const diaSemana = diasSemana[fecha.getDay()];
  const dia = fecha.getDate();
  const mes = meses[fecha.getMonth()];
  const anio = fecha.getFullYear();

  return `${diaSemana}, ${dia} de ${mes} de ${anio}`;
}

export function formatearHora(hora) {
  if (!hora) return '';

  const [horas, minutos] = hora.split(':').map(Number);
  const periodo = horas >= 12 ? 'PM' : 'AM';
  const horas12 = horas > 12 ? horas - 12 : (horas === 0 ? 12 : horas);

  return `${horas12}:${minutos.toString().padStart(2, '0')} ${periodo}`;
}

export function obtenerFechaActual() {
  const ahora = new Date();
  const year = ahora.getFullYear();
  const month = (ahora.getMonth() + 1).toString().padStart(2, '0');
  const day = ahora.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function obtenerHorasDisponibles(reservas) {
  const todasLasHoras = Array.from({ length: 12 }, (_, i) => i + 8);

  if (!reservas || reservas.length === 0) {
    return todasLasHoras;
  }

  const horasOcupadas = new Set();

  reservas.forEach(reserva => {
    const horaInicio = parseInt(reserva.horaInicio.split(':')[0]);
    const horaFin = parseInt(reserva.horaFin.split(':')[0]);

    for (let hora = horaInicio; hora < horaFin; hora++) {
      horasOcupadas.add(hora);
    }
  });

  return todasLasHoras.filter(hora => !horasOcupadas.has(hora));
}