import React from 'react'
import { useAuth } from '../contexts/AuthContext'

function Header({ vista, setVista }) {
  const { user, profile, signOut, isAdmin } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">
            Sistema de Reserva de Salas
          </h1>
          
          <div className="flex items-center space-x-4">
            <nav>
              <ul className="flex space-x-2 sm:space-x-6">
                <li>
                  <button
                    onClick={() => setVista('salas')}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      vista === 'salas' ? 'bg-white text-blue-600 font-medium' : 'hover:bg-blue-500'
                    }`}
                  >
                    Salas Disponibles
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setVista('misReservas')}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      vista === 'misReservas' ? 'bg-white text-blue-600 font-medium' : 'hover:bg-blue-500'
                    }`}
                  >
                    Mis Reservas
                  </button>
                </li>
                {isAdmin() && (
                  <li>
                    <button
                      onClick={() => setVista('admin')}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        vista === 'admin' ? 'bg-white text-blue-600 font-medium' : 'hover:bg-blue-500'
                      }`}
                    >
                      Administración
                    </button>
                  </li>
                )}
              </ul>
            </nav>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm">
                {profile?.full_name || user?.email}
                {isAdmin() && <span className="ml-1 text-xs bg-purple-500 px-2 py-1 rounded">Admin</span>}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header