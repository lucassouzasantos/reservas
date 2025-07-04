import React, { useState } from 'react'
import AdminSalas from './AdminSalas'
import AdminReservas from './AdminReservas'
import AdminUsers from './AdminUsers'

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('salas')

  const tabs = [
    { id: 'salas', label: 'Gestión de Salas', icon: '🏢' },
    { id: 'reservas', label: 'Gestión de Reservas', icon: '📅' },
    { id: 'users', label: 'Gestión de Usuarios', icon: '👥' },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'salas' && <AdminSalas />}
          {activeTab === 'reservas' && <AdminReservas />}
          {activeTab === 'users' && <AdminUsers />}
        </div>
      </div>
    </div>
  )
}

export default AdminPanel