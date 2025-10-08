import { useDashboard } from '../../hooks/useDashboard';
import { useMessages } from '../../hooks/useMessages';
import { useContacts } from '../../hooks/useContacts';
import { StatCard } from '../../components/ui/StatCard';

export function Dashboard() {
  const { stats, loading: statsLoading, error: statsError, refetch } = useDashboard();
  const { messages } = useMessages();
  const { contacts } = useContacts();

  // Calcular estatísticas reais
  const totalMessages = messages.length;
  const totalContacts = contacts.length;
  const activeConversations = contacts.filter(c => c.last_message_at).length;
  const pendingMessages = messages.filter(m => m.status === 'pending' || m.status === 'sent').length;

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Visão geral do sistema WhatsApp Dashboard
          </p>
        </div>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>🔄</span>
          <span>Atualizar</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Mensagens"
          value={totalMessages}
          icon={<span className="text-3xl">💬</span>}
          color="blue"
        />
        <StatCard
          title="Total de Contatos"
          value={totalContacts}
          icon={<span className="text-3xl">👥</span>}
          color="green"
        />
        <StatCard
          title="Conversas Ativas"
          value={activeConversations}
          icon={<span className="text-3xl">🔥</span>}
          color="purple"
        />
        <StatCard
          title="Mensagens Hoje"
          value={messages.filter(m => {
            const today = new Date().toDateString();
            return new Date(m.timestamp).toDateString() === today;
          }).length}
          icon={<span className="text-3xl">📅</span>}
          color="orange"
        />
      </div>

      {/* Status do Sistema */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Status do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <div className="font-semibold text-gray-800">Backend</div>
              <div className="text-sm text-gray-600">API operacional</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <div className="font-semibold text-gray-800">Evolution API</div>
              <div className="text-sm text-gray-600">Conectada</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <div className="font-semibold text-gray-800">Webhooks</div>
              <div className="text-sm text-gray-600">Recebendo mensagens</div>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas Mensagens */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Últimas Mensagens</h2>
          <a href="/messages" className="text-blue-600 hover:underline text-sm">
            Ver todas →
          </a>
        </div>
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma mensagem ainda.</p>
        ) : (
          <div className="space-y-3">
            {messages.slice(0, 5).map((message) => (
              <div key={message.id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                  {message.contact_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-gray-800">
                      {message.contact_name || 'Desconhecido'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 truncate">
                    {message.content || '(mídia)'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}