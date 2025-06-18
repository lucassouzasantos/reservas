import React from 'react';

function Header({ vista, setVista }) {
  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold mb-4 sm:mb-0">
            Sistema de Reserva de Salas
          </h1>
          
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
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;