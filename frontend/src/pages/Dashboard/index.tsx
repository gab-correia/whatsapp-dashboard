import { useDashboard } from '@/hooks';
import { StatCard } from '@/components/ui/StatCard';

export function Dashboard() {
  const { stats, loading, error } = useDashboard();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          WhatsApp Dashboard
        </h1>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Mensagens"
            value={stats?.total_messages || 0}
            color="blue"
          />
          <StatCard
            title="Total de Contatos"
            value={stats?.total_contacts || 0}
            color="green"
          />
          <StatCard
            title="Conversas Ativas"
            value={stats?.active_conversations || 0}
            color="purple"
          />
          <StatCard
            title="Mensagens Pendentes"
            value={stats?.pending_messages || 0}
            color="orange"
          />
        </div>

        {/* Status do Sistema */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Status do Sistema</h2>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700">Backend e Webhooks operacionais</span>
          </div>
        </div>
      </div>
    </div>
  );
}
