import React, { useMemo } from 'react';
import { obtenerHorasDisponibles } from '../utils/dateUtils';

function RoomCard({ sala, reservas, onSeleccionar }) {
  // Memoizar os cálculos de disponibilidade
  const { horasDisponibles, estaDisponible, porcentajeDisponible } = useMemo(() => {
    const horas = obtenerHorasDisponibles(reservas);
    const disponible = horas.length > 0;
    const porcentaje = Math.round((horas.length / 12) * 100);
    
    return {
      horasDisponibles: horas,
      estaDisponible: disponible,
      porcentajeDisponible: porcentaje
    };
  }, [reservas]);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg">
      <div className="h-40 bg-blue-100 flex items-center justify-center">
        <svg className="w-20 h-20 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
        </svg>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-800">{sala.nombre}</h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span>Capacidad: {sala.capacidad} personas</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Ubicación: {sala.ubicacion}</span>
          </div>

          {sala.equipamiento && sala.equipamiento.length > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
              </svg>
              <span>Equipamiento: {sala.equipamiento.join(', ')}</span>
            </div>
          )}
        </div>

        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700">
            {estaDisponible 
              ? `Disponibilidad: ${horasDisponibles.length} horas libres`
              : "Sin disponibilidad para hoy"}
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div 
              className={`h-2.5 rounded-full ${porcentajeDisponible > 30 ? 'bg-green-600' : 'bg-yellow-500'}`}
              style={{ width: `${porcentajeDisponible}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={onSeleccionar}
          disabled={!estaDisponible}
          className={`w-full px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${
            estaDisponible 
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {estaDisponible ? 'Reservar Sala' : 'No Disponible'}
        </button>
      </div>
    </div>
  );
}

export default RoomCard;