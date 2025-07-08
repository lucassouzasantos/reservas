import React from 'react'
import { formatearFecha, formatearHora } from '../utils/dateUtils'

function ReservationList({ reservas, salas, onCancelar }) {
  if (reservas.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No tienes reservas</h3>
        <p className="mt-1 text-sm text-gray-500">
          Aún no has reservado ninguna sala de reuniones.
        </p>
      </div>
    )
  }

  const reservasOrdenadas = [...reservas].sort((a, b) => {
    const fechaA = new Date(a.fecha).getTime()
    const fechaB = new Date(b.fecha).getTime()
    
    if (fechaA !== fechaB) return fechaB - fechaA
    
    const [horaA] = a.hora_inicio.split(':')
    const [horaB] = b.hora_inicio.split(':')
    
    return parseInt(horaA) - parseInt(horaB)
  })

  const reservasPorFecha = reservasOrdenadas.reduce((acc, reserva) => {
    const fecha = reserva.fecha.split('T')[0]
    if (!acc[fecha]) {
      acc[fecha] = []
    }
    acc[fecha].push(reserva)
    return acc
  }, {})

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'confirmada':
        return 'bg-green-100 text-green-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="space-y-8">
      {Object.keys(reservasPorFecha).map((fecha) => (
        <div key={fecha} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-50 px-4 py-2 border-b">
            <h3 className="text-lg font-medium text-blue-800">
              {formatearFecha(fecha)}
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {reservasPorFecha[fecha].map((reserva) => {
              const sala = reserva.salas || salas.find(s => s.id === reserva.sala_id)
              
              const hoy = new Date().toISOString().split('T')[0]
              const esHoy = fecha === hoy
              
              const horaActual = new Date().getHours()
              const horaReserva = parseInt(reserva.hora_inicio.split(':')[0])
              const yaOcurrio = esHoy && horaActual > horaReserva
              
              return (
                <div key={reserva.id} className="px-6 py-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-semibold text-gray-900">
                          {sala ? sala.nome : 'Sala no disponible'}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reserva.estado)}`}>
                          {reserva.estado}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                          <svg className="mr-1.5 h-2 w-2 text-blue-400" fill="currentColor" viewBox="0 0 8 8">
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}
                        </span>
                        
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                          <svg className="mr-1.5 h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                          </svg>
                          {reserva.asistentes} {reserva.asistentes === 1 ? 'asistente' : 'asistentes'}
                        </span>
                        
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                          <svg className="mr-1.5 h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          {sala?.ubicacion || 'Sin ubicación'}
                        </span>
                      </div>
                      
                      {reserva.descripcion && (
                        <p className="mt-2 text-sm text-gray-500">
                          {reserva.descripcion}
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-4 md:mt-0">
                      {!yaOcurrio && reserva.estado !== 'cancelada' && (
                        <button
                          onClick={() => onCancelar(reserva.id)}
                          className="px-3 py-1 border border-red-300 text-red-700 bg-white hover:bg-red-50 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Cancelar Reserva
                        </button>
                      )}
                      
                      {yaOcurrio && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-md text-sm font-medium">
                          Reserva completada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ReservationList