import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function AdminSalas() {
  const [salas, setSalas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSala, setEditingSala] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    capacidade: '',
    ubicacion: '',
    equipamento: '',
  })

  useEffect(() => {
    fetchSalas()
  }, [])

  const fetchSalas = async () => {
    try {
      const { data, error } = await supabase
        .from('salas')
        .select('*')
        .order('id')

      if (error) throw error
      setSalas(data || [])
    } catch (error) {
      console.error('Error fetching salas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const salaData = {
      nome: formData.nome,
      capacidade: parseInt(formData.capacidade),
      ubicacion: formData.ubicacion,
      equipamento: formData.equipamento ? formData.equipamento.split(',').map(item => item.trim()) : [],
    }

    try {
      if (editingSala) {
        const { error } = await supabase
          .from('salas')
          .update(salaData)
          .eq('id', editingSala.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('salas')
          .insert([salaData])
        
        if (error) throw error
      }

      await fetchSalas()
      resetForm()
    } catch (error) {
      console.error('Error saving sala:', error)
      alert('Error al guardar la sala')
    }
  }

  const handleEdit = (sala) => {
    setEditingSala(sala)
    setFormData({
      nome: sala.nome,
      capacidade: sala.capacidade.toString(),
      ubicacion: sala.ubicacion || '',
      equipamento: sala.equipamento ? sala.equipamento.join(', ') : '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta sala?')) return

    try {
      const { error } = await supabase
        .from('salas')
        .update({ ativo: false })
        .eq('id', id)

      if (error) throw error
      await fetchSalas()
    } catch (error) {
      console.error('Error deleting sala:', error)
      alert('Error al eliminar la sala')
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      capacidade: '',
      ubicacion: '',
      equipamento: '',
    })
    setEditingSala(null)
    setShowForm(false)
  }

  if (loading) {
    return <div className="text-center py-4">Cargando salas...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Gestión de Salas</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Nueva Sala
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium mb-4">
            {editingSala ? 'Editar Sala' : 'Nueva Sala'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la sala *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidad *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.capacidade}
                  onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipamiento (separado por comas)
                </label>
                <input
                  type="text"
                  value={formData.equipamento}
                  onChange={(e) => setFormData({ ...formData, equipamento: e.target.value })}
                  placeholder="Proyector, Pizarra, WiFi"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {editingSala ? 'Actualizar' : 'Crear'} Sala
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {salas.map((sala) => (
            <li key={sala.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{sala.nome}</h4>
                  <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
                    <span>Capacidad: {sala.capacidade} personas</span>
                    {sala.ubicacion && <span>• {sala.ubicacion}</span>}
                  </div>
                  {sala.equipamento && sala.equipamento.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {sala.equipamento.map((equipo, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {equipo}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(sala)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(sala.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default AdminSalas