import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function ConnectionStatus() {
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState(null)

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.from('salas').select('count', { count: 'exact', head: true })
      
      if (error) {
        setError(error.message)
        setStatus('error')
      } else {
        setStatus('connected')
      }
    } catch (err) {
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
            <h3 className="text-sm font-medium text-red-800">Erro de Conexão com Supabase</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Não foi possível conectar ao Supabase. Verifique:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Se você clicou no botão "Connect to Supabase" no canto superior direito</li>
                <li>Se as variáveis de ambiente estão configuradas corretamente</li>
                <li>Se o projeto Supabase está ativo</li>
              </ul>
              {error && (
                <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                  <strong>Erro técnico:</strong> {error}
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
          <p className="text-sm text-green-700">Conectado ao Supabase com sucesso!</p>
        </div>
      </div>
    </div>
  )
}

export default ConnectionStatus