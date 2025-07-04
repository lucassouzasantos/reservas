import React, { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './components/auth/AuthPage'
import Header from './components/Header'
import RoomList from './components/RoomList'
import ReservationForm from './components/ReservationForm'
import ReservationList from './components/ReservationList'
import AdminPanel from './components/admin/AdminPanel'
import ConnectionStatus from './components/ConnectionStatus'
import { useSalas, useReservas } from './hooks/useSupabaseData'
import { obtenerFechaActual } from './utils/dateUtils'

function AppContent() {
  const { user, loading } = useAuth()
  const [vista, setVista] = useState('salas')
  const [salaSeleccionada, setSalaSeleccionada] = useState(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => obtenerFechaActual())
  
  const { salas } = useSalas()
  const { reservas, createReserva, cancelReserva } = useReservas(user?.id)
  
  const seleccionarSala = (sala) => {
    setSalaSeleccionada(sala)
    setVista('reservar')
  }
  
  const crearReserva = async (nuevaReserva) => {
    const { error } = await createReserva(nuevaReserva)
    if (!error) {
      setVista('misReservas')
    } else {
      alert('Error al crear la reserva')
    }
  }
  
  const cancelarReserva = async (id) => {
    const { error } = await cancelReserva(id)
    if (error) {
      alert('Error al cancelar la reserva')
    }
  }
  
  const volverALista = () => {
    setSalaSeleccionada(null)
    setVista('salas')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto p-4">
          <ConnectionStatus />
          <AuthPage />
        </div>
      </div>
    )
  }

  const anoActual = new Date().getFullYear()
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header vista={vista} setVista={setVista} />
      
      <main className="max-w-6xl mx-auto p-4">
        <ConnectionStatus />
        
        {vista === 'salas' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Salas Disponibles</h1>
            <RoomList 
              salas={salas} 
              fechaSeleccionada={fechaSeleccionada}
              setFechaSeleccionada={setFechaSeleccionada}
              onSeleccionarSala={seleccionarSala}
            />
          </div>
        )}
        
        {vista === 'reservar' && salaSeleccionada && (
          <div className="space-y-6">
            <button 
              onClick={volverALista}
              className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Volver a las salas
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Reservar Sala</h1>
            <ReservationForm 
              sala={salaSeleccionada} 
              fechaSeleccionada={fechaSeleccionada}
              onCrearReserva={crearReserva}
              onCancelar={volverALista}
            />
          </div>
        )}
        
        {vista === 'misReservas' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Mis Reservas</h1>
            <ReservationList 
              reservas={reservas} 
              salas={salas} 
              onCancelar={cancelarReserva}
            />
          </div>
        )}
        
        {vista === 'admin' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Panel de Administración</h1>
            <AdminPanel />
          </div>
        )}
      </main>
      
      <footer className="mt-12 py-6 bg-gray-800 text-white text-center">
        <p>© {anoActual} Sistema de Reserva de Salas</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App