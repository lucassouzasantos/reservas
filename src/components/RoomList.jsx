import React, { useState, useMemo, useCallback } from 'react';
import RoomCard from './RoomCard';
import Calendar from './Calendar';
import { formatearFecha } from '../utils/dateUtils';

function RoomList({ salas, reservas, fechaSeleccionada, setFechaSeleccionada, onSeleccionarSala }) {
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [filtroCapacidad, setFiltroCapacidad] = useState('');
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  // Memoizar as salas filtradas para evitar recálculos desnecessários
  const salasFiltradas = useMemo(() => {
    return salas.filter(sala => {
      const cumpleNombre = sala.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase());
      const cumpleCapacidad = filtroCapacidad === '' || sala.capacidad >= parseInt(filtroCapacidad);
      return cumpleNombre && cumpleCapacidad;
    });
  }, [salas, filtroBusqueda, filtroCapacidad]);

  const toggleCalendario = useCallback(() => {
    setMostrarCalendario(prev => !prev);
  }, []);

  const seleccionarFecha = useCallback((fecha) => {
    setFechaSeleccionada(fecha);
    setMostrarCalendario(false);
  }, [setFechaSeleccionada]);

  // Memoizar a data formatada
  const fechaFormateada = useMemo(() => formatearFecha(fechaSeleccionada), [fechaSeleccionada]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-1">
                Buscar sala:
              </label>
              <input
                type="text"
                id="busqueda"
                placeholder="Buscar por nombre..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtroBusqueda}
                onChange={(e) => setFiltroBusqueda(e.target.value)}
              />
            </div>

            <div className="md:w-1/4">
              <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700 mb-1">
                Capacidad mínima:
              </label>
              <select
                id="capacidad"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filtroCapacidad}
                onChange={(e) => setFiltroCapacidad(e.target.value)}
              >
                <option value="">Cualquiera</option>
                <option value="4">4+ personas</option>
                <option value="8">8+ personas</option>
                <option value="12">12+ personas</option>
                <option value="20">20+ personas</option>
              </select>
            </div>

            <div className="md:w-1/3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de reserva:
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleCalendario}
                  className="w-full flex justify-between items-center px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fechaFormateada}
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mostrarCalendario && (
                  <div className="absolute z-10 mt-1 w-full">
                    <Calendar 
                      fechaSeleccionada={fechaSeleccionada}
                      onSeleccionarFecha={seleccionarFecha}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {salasFiltradas.length > 0 ? (
          salasFiltradas.map((sala) => (
            <RoomCard
              key={sala.id}
              sala={sala}
              reservas={reservas.filter(r => r.salaId === sala.id && r.fecha === fechaSeleccionada)}
              onSeleccionar={() => onSeleccionarSala(sala)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 bg-white rounded-lg shadow">
            <p className="text-lg text-gray-600">No se encontraron salas con los criterios seleccionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoomList;