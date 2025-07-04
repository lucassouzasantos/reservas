import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      await fetchUsers()
    } catch (error) {
      console.error('Error updating role:', error)
      alert('Error al actualizar el rol del usuario')
    }
  }

  const getRoleColor = (role) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-800' 
      : 'bg-blue-100 text-blue-800'
  }

  if (loading) {
    return <div className="text-center py-4">Cargando usuarios...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Gestión de Usuarios</h3>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900">
                      {user.full_name || 'Sin nombre'}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Registrado:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                {user.role === 'user' ? (
                  <button
                    onClick={() => handleRoleChange(user.id, 'admin')}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                  >
                    Hacer Administrador
                  </button>
                ) : (
                  <button
                    onClick={() => handleRoleChange(user.id, 'user')}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Hacer Usuario Normal
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
        
        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron usuarios.
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers