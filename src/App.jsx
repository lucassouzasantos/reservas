import { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import RoomList from './components/RoomList';
import ReservationForm from './components/ReservationForm';
import ReservationList from './components/ReservationList';
import { salas, reservasIniciales } from './utils/data';
import { obtenerFechaActual } from './utils/dateUtils';

function App() {
  const [vista, setVista] = useState('salas');
  const [salaSeleccionada, setSalaSeleccionada] = useState(null);
  const [reservas, setReservas] = useState(reservasIniciales);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(obtenerFechaActual());
  
  // Usar useCallback para evitar re-criação desnecessária de funções
  const seleccionarSala = useCallback((sala) => {
    setSalaSeleccionada(sala);
    setVista('reservar');
  }, []);
  
  const crearReserva = useCallback((nuevaReserva) => {
    setReservas(prevReservas => [...prevReservas, { ...nuevaReserva, id: Date.now() }]);
    setVista('misReservas');
  }, []);
  
  const cancelarReserva = useCallback((id) => {
    setReservas(prevReservas => prevReservas.filter(reserva => reserva.id !== id));
  }, []);
  
  const volverALista = useCallback(() => {
    setSalaSeleccionada(null);
    setVista('salas');
  }, []);

  // Memoizar o ano atual para evitar recálculos
  const anoActual = useMemo(() => new Date().getFullYear(), []);
  
  return (
    <div className="min-h-screen bg-gray-100">
      <Header vista={vista} setVista={setVista} />
      
      <main className="max-w-6xl mx-auto p-4">
        {vista === 'salas' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Salas Disponibles</h1>
            <RoomList 
              salas={salas} 
              reservas={reservas}
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
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Volver a las salas
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Reservar Sala</h1>
            <ReservationForm 
              sala={salaSeleccionada} 
              fechaSeleccionada={fechaSeleccionada}
              reservas={reservas}
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
      </main>
      
      <footer className="mt-12 py-6 bg-gray-800 text-white text-center">
        <p>© {anoActual} Sistema de Reserva de Salas</p>
      </footer>
    </div>
  );
}

export default App;