import React, { useState } from 'react';

// Função para obter a data no formato YYYY-MM-DD sem problemas de fuso horário
function formatarDataLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Função para criar uma data a partir de uma string YYYY-MM-DD
function criarDataLocal(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function Calendar({ fechaSeleccionada, onSeleccionarFecha }) {
  const [mesActual, setMesActual] = useState(() => {
    const fechaObj = criarDataLocal(fechaSeleccionada);
    return { year: fechaObj.getFullYear(), month: fechaObj.getMonth() };
  });

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const nombresDias = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  const generarDiasDelMes = (year, month) => {
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const resultado = [];

    let inicioSemana = primerDia.getDay();
    inicioSemana = inicioSemana === 0 ? 6 : inicioSemana - 1;

    for (let i = 0; i < inicioSemana; i++) {
      resultado.push({ day: '', isCurrentMonth: false });
    }

    for (let day = 1; day <= ultimoDia.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = formatarDataLocal(date);
      const isToday = dateStr === formatarDataLocal(new Date());
      const isSelected = dateStr === fechaSeleccionada;

      resultado.push({
        day,
        date: dateStr,
        isCurrentMonth: true,
        isToday,
        isSelected,
      });
    }

    return resultado;
  };

  const diasDelMes = generarDiasDelMes(mesActual.year, mesActual.month);

  const irMesAnterior = () => {
    setMesActual(prev => {
      const nuevoMes = prev.month - 1;
      if (nuevoMes < 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: nuevoMes };
    });
  };

  const irMesSiguiente = () => {
    setMesActual(prev => {
      const nuevoMes = prev.month + 1;
      if (nuevoMes > 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: nuevoMes };
    });
  };

  const seleccionarFecha = (date, e) => {
    e.preventDefault();
    e.stopPropagation();
    onSeleccionarFecha(date);
  };

  const esHoy =
    new Date().getMonth() === mesActual.month &&
    new Date().getFullYear() === mesActual.year;

  const irMesActual = () => {
    const fechaActual = new Date();
    setMesActual({
      year: fechaActual.getFullYear(),
      month: fechaActual.getMonth(),
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64 z-50">
      <div className="flex items-center justify-between mb-2">
        <button onClick={irMesAnterior} className="p-1 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-gray-800 font-medium">
          {nombresMeses[mesActual.month]} {mesActual.year}
        </div>

        <button onClick={irMesSiguiente} className="p-1 text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {!esHoy && (
        <button onClick={irMesActual} className="w-full mb-2 text-xs text-blue-600 hover:text-blue-800">
          Ir al mes actual
        </button>
      )}

      <div className="grid grid-cols-7 gap-1 text-center">
        {nombresDias.map((dia) => (
          <div key={dia} className="py-1 text-xs font-medium text-gray-500">{dia}</div>
        ))}

        {diasDelMes.map((dia, index) => (
          <button
            type="button"
            key={index}
            onClick={(e) => dia.isCurrentMonth && seleccionarFecha(dia.date, e)}
            className={`
              py-1 text-sm rounded-full w-full h-full
              ${!dia.isCurrentMonth ? 'text-gray-300' : 'hover:bg-gray-100'}
              ${dia.isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
              ${dia.isToday && !dia.isSelected ? 'bg-blue-100 text-blue-800' : ''}
            `}
          >
            {dia.day}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Calendar;