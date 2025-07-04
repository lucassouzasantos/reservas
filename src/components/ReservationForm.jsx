import React, { useState, useMemo, useCallback } from 'react';
import Calendar from './Calendar';
import { formatearFecha, obtenerHorasDisponibles, formatearHora } from '../utils/dateUtils';

function ReservationForm({ sala, fechaSeleccionada, reservas, onCrearReserva, onCancelar }) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [duracion, setDuracion] = useState(1);
  const [descripcion, setDescripcion] = useState('');
  const [asistentes, setAsistentes] = useState(1);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [errores, setErrores] = useState({});
  
  const reservasDeSala = useMemo(() => 
    reservas.filter(res => res.salaId === sala.id && res.fecha === fechaSeleccionada),
    [reservas, sala.id, fechaSeleccionada]
  );
  
  const horasDisponibles = useMemo(() => 
    obtenerHorasDisponibles(reservasDeSala),
    [reservasDeSala]
  );
  
  const toggleCalendario = useCallback(() => {
    setMostrarCalendario(prev => !prev);
  }, []);
  
  const seleccionarFecha = useCallback(() => {
    onCancelar();
  }, [onCancelar]);
  
  const validarFormulario = useCallback(() => {
    const nuevosErrores = {};
    
    if (!nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }
    
    if (!correo.trim()) {
      nuevosErrores.correo = "El correo electrónico es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(correo)) {
      nuevosErrores.correo = "El correo electrónico no es válido";
    }
    
    if (!horaInicio) {
      nuevosErrores.horaInicio = "Debes seleccionar una hora de inicio";
    }
    
    if (asistentes <= 0) {
      nuevosErrores.asistentes = "El número de asistentes debe ser mayor a 0";
    }
    
    if (asistentes > sala.capacidad) {
      nuevosErrores.asistentes = `El número de asistentes excede la capacidad de la sala (${sala.capacidad})`;
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }, [nombre, correo, horaInicio, asistentes, sala.capacidad]);
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      const horaInicioNum = parseInt(horaInicio.split(':')[0]);
      const horaFin = `${horaInicioNum + duracion}:00`;
      
      const nuevaReserva = {
        salaId: sala.id,
        fecha: fechaSeleccionada,
        horaInicio,
        horaFin,
        nombre,
        correo,
        asistentes: parseInt(asistentes),
        descripcion,
      };
      
      onCrearReserva(nuevaReserva);
    }
  }, [validarFormulario, horaInicio, duracion, sala.id, fechaSeleccionada, nombre, correo, asistentes, descripcion, onCrearReserva]);
  
  const fechaFormateada = useMemo(() => formatearFecha(fechaSeleccionada), [fechaSeleccionada]);
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Reservar: {sala.nombre}</h2>
      
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 py-2">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {sala.capacidad} Personas
          </div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {sala.ubicacion}
          </div>
          {sala.equipamiento && sala.equipamiento.map((equipo) => (
            <div key={equipo} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {equipo}
            </div>
          ))}
        </div>
        
        <div className="relative mt-4">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span className="font-medium">Fecha:</span>
            <button 
              type="button"
              onClick={toggleCalendario}
              className="ml-2 text-blue-600 hover:text-blue-800 underline"
            >
              {fechaFormateada}
            </button>
          </div>
          
          {mostrarCalendario && (
            <div className="absolute z-10">
              <Calendar 
                fechaSeleccionada={fechaSeleccionada}
                onSeleccionarFecha={seleccionarFecha}
              />
            </div>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo *
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errores.nombre ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ingrese su nombre"
            />
            {errores.nombre && <p className="mt-1 text-sm text-red-600">{errores.nombre}</p>}
          </div>
          
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico *
            </label>
            <input
              type="email"
              id="correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errores.correo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="correo@ejemplo.com"
            />
            {errores.correo && <p className="mt-1 text-sm text-red-600">{errores.correo}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 mb-1">
              Hora de inicio *
            </label>
            <select
              id="horaInicio"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errores.horaInicio ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione una hora</option>
              {horasDisponibles.map((hora) => (
                <option key={hora} value={`${hora}:00`}>
                  {formatearHora(`${hora}:00`)}
                </option>
              ))}
            </select>
            {errores.horaInicio && <p className="mt-1 text-sm text-red-600">{errores.horaInicio}</p>}
          </div>
          
          <div>
            <label htmlFor="duracion" className="block text-sm font-medium text-gray-700 mb-1">
              Duración (horas)
            </label>
            <select
              id="duracion"
              value={duracion}
              onChange={(e) => setDuracion(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1 hora</option>
              <option value="2">2 horas</option>
              <option value="3">3 horas</option>
              <option value="4">4 horas</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="asistentes" className="block text-sm font-medium text-gray-700 mb-1">
              Número de asistentes *
            </label>
            <input
              type="number"
              id="asistentes"
              min="1"
              max={sala.capacidad}
              value={asistentes}
              onChange={(e) => setAsistentes(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errores.asistentes ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errores.asistentes && <p className="mt-1 text-sm text-red-600">{errores.asistentes}</p>}
          </div>
        </div>
        
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción / Propósito de la reunión
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describa el propósito de su reunión..."
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Confirmar Reserva
          </button>
        </div>
      </form>
    </div>
  );
}

export default ReservationForm;