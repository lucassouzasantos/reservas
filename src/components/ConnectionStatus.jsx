import React, { useState, useEffect } from 'react'
import { supabase, hasValidSupabaseConfig, supabaseConfig } from '../lib/supabase'

function ConnectionStatus() {
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    // First check if we have valid Supabase configuration
    if (!hasValidSupabaseConfig()) {
      setError('Variables de ambiente de Supabase no configuradas')
      setStatus('config-error')
      return
    }

    if (!supabase) {
      setError('Cliente Supabase no inicializado')
      setStatus('config-error')
      return
    }

    try {
      // Test connection with a simple query
      const { data, error } = await supabase
        .from('salas')
        .select('id')
        .limit(1)
      
      if (error) {
        console.error('Supabase connection error:', error)
        setError(error.message)
        setStatus('error')
      } else {
        console.log('Supabase connection successful')
        setStatus('connected')
      }
    } catch (err) {
      console.error('Supabase connection failed:', err)
      setError(err.message)
      setStatus('error')
    }
  }

  if (status === 'checking') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Verificando conexão com Supabase...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'config-error') {
    return (
      <div className="bg-orange-50 border border-orange-200 rounded-md p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">Configuración de Supabase Necesaria</h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>Para usar esta aplicación, necesitas configurar las variables de ambiente de Supabase:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Crea un archivo <code className="bg-orange-100 px-1 rounded">.env</code> en la raíz del proyecto</li>
                <li>Agrega tus credenciales de Supabase:</li>
              </ol>
              <div className="mt-2 p-3 bg-orange-100 rounded text-xs font-mono">
                VITE_SUPABASE_URL=https://tu-proyecto.supabase.co<br/>
                VITE_SUPABASE_ANON_KEY=tu-clave-publica-aqui
              </div>
              <p className="mt-2">
                <strong>Cómo obtener esta información:</strong>
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Accede a <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">supabase.com/dashboard</a></li>
                <li>Selecciona tu proyecto</li>
                <li>Ve a Settings → API</li>
                <li>Copia la "Project URL" y "anon public" key</li>
              </ul>
              {error && (
                <div className="mt-2 p-2 bg-orange-200 rounded text-xs">
                  <strong>Erro:</strong> {error}
                </div>
              )}
              <div className="mt-2 p-2 bg-orange-200 rounded text-xs">
                <strong>Status atual:</strong><br/>
                URL: {supabaseConfig.url || 'No definida'}<br/>
                Key: {supabaseConfig.anonKey ? 'Definida' : 'No definida'}
              </div>
            </div>
            <div className="mt-3">
              <button
                onClick={() => window.location.reload()}
                className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error de Conexión con Supabase</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>No fue posible conectar con Supabase. Verifica:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Si configuraste las variables de ambiente de Supabase</li>
                <li>Si las variables de ambiente están configuradas correctamente</li>
                <li>Si el proyecto Supabase está activo</li>
                <li>Si las tablas fueron creadas correctamente en la base de datos</li>
                <li>Si tienes conexión a internet</li>
              </ul>
              {error && (
                <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                  <strong>Error técnico:</strong> {error}
                </div>
              )}
            </div>
            <div className="mt-3">
              <button
                onClick={checkConnection}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-green-700">¡Conectado a Supabase exitosamente!</p>
        </div>
      </div>
    </div>
  )
}

export default ConnectionStatus