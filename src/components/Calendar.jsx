import React, { useState, useMemo, useCallback } from 'react';

function formatarDataLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function criarDataLocal(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

const NOMBRES_MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const NOMBRES_DIAS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function Calendar({ fechaSeleccionada, onSeleccionarFecha }) {
  const [mesActual, setMesActual] = useState(() => {
    const fechaObj = criarDataLocal(fechaSeleccionada);
    return { year: fechaObj.getFullYear(), month: fechaObj.getMonth() };
  });

  const fechaHoyStr = useMemo(() => formatarDataLocal(new Date()), []);

  const diasDelMes = useMemo(() => {
    const { year, month } = mesActual;
    const primerDia = new Date(year, month, 1);
    const ultimoDia = new Date(year, month + 1, 0);
    const resultado = [];

    let inicioSemana = primerDia.getDay();
    inicioSemana = inicioSemana === 0 ? 6 : inicioSemana - 1;

    for (let i = 0; i < inicioSemana; i++) {
      resultado.push({ day: '', isCurrentMonth: false, key: `empty-${i}` });
    }

    for (let day = 1; day <= ultimoDia.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = formatarDataLocal(date);
      const isToday = dateStr === fechaHoyStr;
      const isSelected = dateStr === fechaSeleccionada;

      resultado.push({
        day,
        date: dateStr,
        isCurrentMonth: true,
        isToday,
        isSelected,
        key: `day-${day}`
      });
    }

    return resultado;
  }, [mesActual, fechaSeleccionada, fechaHoyStr]);

  const irMesAnterior = useCallback(() => {
    setMesActual(prev => {
      const nuevoMes = prev.month - 1;
      if (nuevoMes < 0) return { year: prev.year - 1, month: 11 };
      return { ...prev, month: nuevoMes };
    });
  }, []);

  const irMesSiguiente = useCallback(() => {
    setMesActual(prev => {
      const nuevoMes = prev.month + 1;
      if (nuevoMes > 11) return { year: prev.year + 1, month: 0 };
      return { ...prev, month: nuevoMes };
    });
  }, []);

  const seleccionarFecha = useCallback((date, e) => {
    e.preventDefault();
    e.stopPropagation();
    onSeleccionarFecha(date);
  }, [onSeleccionarFecha]);

  const esHoy = useMemo(() => {
    const fechaActual = new Date();
    return fechaActual.getMonth() === mesActual.month &&
           fechaActual.getFullYear() === mesActual.year;
  }, [mesActual.month, mesActual.year]);

  const irMesActual = useCallback(() => {
    const fechaActual = new Date();
    setMesActual({
      year: fechaActual.getFullYear(),
      month: fechaActual.getMonth(),
    });
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 w-64 z-50">
      <div className="flex items-center justify-between mb-2">
        <button 
          type="button"
          onClick={irMesAnterior} 
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-gray-800 font-medium">
          {NOMBRES_MESES[mesActual.month]} {mesActual.year}
        </div>

        <button 
          type="button"
          onClick={irMesSiguiente} 
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {!esHoy && (
        <button 
          type="button"
          onClick={irMesActual} 
          className="w-full mb-2 text-xs text-blue-600 hover:text-blue-800"
        >
          Ir al mes actual
        </button>
      )}

      <div className="grid grid-cols-7 gap-1 text-center">
        {NOMBRES_DIAS.map((dia) => (
          <div key={dia} className="py-1 text-xs font-medium text-gray-500">{dia}</div>
        ))}

        {diasDelMes.map((dia) => (
          <button
            type="button"
            key={dia.key}
            onClick={(e) => dia.isCurrentMonth && seleccionarFecha(dia.date, e)}
            disabled={!dia.isCurrentMonth}
            className={`
              py-1 text-sm rounded-full w-full h-full
              ${!dia.isCurrentMonth ? 'text-gray-300 cursor-default' : 'hover:bg-gray-100'}
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