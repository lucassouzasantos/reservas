import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { formatearFecha, formatearHora } from '../../utils/dateUtils'

function AdminReservas() {
  const [reservas, setReservas] = useState([])
  const [salas, setSalas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroSala, setFiltroSala] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [reservasResult, salasResult] = await Promise.all([
        supabase
          .from('reservas')
          .select(`
            *,
            salas (nome),
            profiles (full_name, email)
          `)
          .order('fecha', { ascending: false }),
        supabase
          .from('salas')
          .select('*')
          .eq('ativo', true)
          .order('nome')
      ])

      if (reservasResult.error) throw reservasResult.error
      if (salasResult.error) throw salasResult.error

      setReservas(reservasResult.data || [])
      setSalas(salasResult.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (reservaId, newStatus) => {
    try {
      const { error } = await supabase
        .from('reservas')
        .update({ estado: newStatus })
        .eq('id', reservaId)

      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error al actualizar el estado')
    }
  }

  const handleDelete = async (reservaId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reserva?')) return

    try {
      const { error } = await supabase
        .from('reservas')
        .delete()
        .eq('id', reservaId)

      if (error) throw error
      await fetchData()
    } catch (error) {
      console.error('Error deleting reserva:', error)
      alert('Error al eliminar la reserva')
    }
  }

  const filteredReservas = reservas.filter(reserva => {
    const matchesStatus = !filtroEstado || reserva.estado === filtroEstado
    const matchesSala = !filtroSala || reserva.sala_id.toString() === filtroSala
    return matchesStatus && matchesSala
  })

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

  if (loading) {
    return <div className="text-center py-4">Cargando reservas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Gestión de Reservas</h3>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por estado:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por sala:
            </label>
            <select
              value={filtroSala}
              onChange={(e) => setFiltroSala(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las salas</option>
              {salas.map((sala) => (
                <option key={sala.id} value={sala.id}>
                  {sala.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredReservas.map((reserva) => (
            <li key={reserva.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">
                      {reserva.salas?.nome || 'Sala no encontrada'}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reserva.estado)}`}>
                      {reserva.estado}
                    </span>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Fecha:</strong> {formatearFecha(reserva.fecha.split('T')[0])}</p>
                      <p><strong>Hora:</strong> {formatearHora(reserva.hora_inicio)} - {formatearHora(reserva.hora_fin)}</p>
                      <p><strong>Asistentes:</strong> {reserva.asistentes}</p>
                    </div>
                    <div>
                      <p><strong>Solicitante:</strong> {reserva.profiles?.full_name || reserva.nome}</p>
                      <p><strong>Email:</strong> {reserva.profiles?.email || reserva.correo}</p>
                      {reserva.descripcion && (
                        <p><strong>Descripción:</strong> {reserva.descripcion}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                {reserva.estado === 'pendiente' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(reserva.id, 'confirmada')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleStatusChange(reserva.id, 'cancelada')}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Cancelar
                    </button>
                  </>
                )}
                
                {reserva.estado === 'confirmada' && (
                  <button
                    onClick={() => handleStatusChange(reserva.id, 'cancelada')}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Cancelar
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(reserva.id)}
                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
        
        {filteredReservas.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron reservas con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminReservas