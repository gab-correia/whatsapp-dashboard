import { useEffect, useState } from 'react'
import { healthCheck, getDashboardStats } from './services/api'

interface Stats {
  total_messages: number;
  total_contacts: number;
  active_conversations: number;
  pending_messages: number;
}

function App() {
  const [health, setHealth] = useState<any>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const healthData = await healthCheck()
        setHealth(healthData)
        
        const statsData = await getDashboardStats()
        setStats(statsData)
      } catch (err) {
        setError('Erro ao conectar com o backend')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          WhatsApp Dashboard
        </h1>

        {/* Status do Backend */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Status do Backend</h2>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">{health?.message}</span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-500 mb-2">Total de Mensagens</div>
            <div className="text-3xl font-bold text-blue-600">
              {stats?.total_messages}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-500 mb-2">Total de Contatos</div>
            <div className="text-3xl font-bold text-green-600">
              {stats?.total_contacts}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-500 mb-2">Conversas Ativas</div>
            <div className="text-3xl font-bold text-purple-600">
              {stats?.active_conversations}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-500 mb-2">Mensagens Pendentes</div>
            <div className="text-3xl font-bold text-orange-600">
              {stats?.pending_messages}
            </div>
          </div>
        </div>

        {/* Indicador de conexão */}
        <div className="mt-8 text-center text-sm text-gray-600">
          ✅ Frontend e Backend conectados com sucesso!
        </div>
      </div>
    </div>
  )
}

export default App