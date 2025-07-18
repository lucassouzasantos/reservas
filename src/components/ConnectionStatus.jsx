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
      setError('Variáveis de ambiente do Supabase não configuradas')
      setStatus('config-error')
      return
    }

    if (!supabase) {
      setError('Cliente Supabase não inicializado')
      setStatus('config-error')
      return
    }

    try {
      const { data, error } = await supabase.from('salas').select('id').limit(1)
      
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
            <h3 className="text-sm font-medium text-orange-800">Configuração do Supabase Necessária</h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>Para usar este aplicativo, você precisa configurar as variáveis de ambiente do Supabase:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Crie um arquivo <code className="bg-orange-100 px-1 rounded">.env</code> na raiz do projeto</li>
                <li>Adicione suas credenciais do Supabase:</li>
              </ol>
              <div className="mt-2 p-3 bg-orange-100 rounded text-xs font-mono">
                VITE_SUPABASE_URL=https://seu-projeto.supabase.co<br/>
                VITE_SUPABASE_ANON_KEY=sua-chave-publica-aqui
              </div>
              <p className="mt-2">
                <strong>Como obter essas informações:</strong>
              </p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Acesse <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-orange-600 underline">supabase.com/dashboard</a></li>
                <li>Selecione seu projeto</li>
                <li>Vá em Settings → API</li>
                <li>Copie a "Project URL" e "anon public" key</li>
              </ul>
              {error && (
                <div className="mt-2 p-2 bg-orange-200 rounded text-xs">
                  <strong>Erro:</strong> {error}
                </div>
              )}
              <div className="mt-2 p-2 bg-orange-200 rounded text-xs">
                <strong>Status atual:</strong><br/>
                URL: {supabaseConfig.url || 'Não definida'}<br/>
                Key: {supabaseConfig.anonKey ? 'Definida' : 'Não definida'}
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
            <h3 className="text-sm font-medium text-red-800">Erro de Conexão com Supabase</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Não foi possível conectar ao Supabase. Verifique:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Se você configurou as variáveis de ambiente do Supabase</li>
                <li>Se as variáveis de ambiente estão configuradas corretamente</li>
                <li>Se o projeto Supabase está ativo</li>
                <li>Se as tabelas foram criadas corretamente no banco</li>
                <li>Se você tem conexão com a internet</li>
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