import { useDashboard } from '../../hooks/useDashboard';
import { useMessages } from '../../hooks/useMessages';
import { useContacts } from '../../hooks/useContacts';
import { StatCard } from '../../components/ui/StatCard';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { stats, loading: statsLoading, error: statsError, refetch } = useDashboard();
  const { messages } = useMessages();
  const { contacts } = useContacts();

  // Calcular estatísticas reais
  const totalMessages = messages.length;
  const totalContacts = contacts.length;
  const activeConversations = contacts.filter(c => c.last_message_at).length;

  if (statsLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Visão geral do sistema WhatsApp Dashboard
          </p>
        </div>
        <button
          onClick={refetch}
          className={styles.refreshButton}
        >
          <span>🔄</span>
          <span>Atualizar</span>
        </button>
      </div>

      {/* Estatísticas */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Total de Mensagens"
          value={totalMessages}
        />
        <StatCard
          title="Total de Contatos"
          value={totalContacts}
        />
        <StatCard
          title="Conversas Ativas"
          value={activeConversations}
        />
        <StatCard
          title="Mensagens Hoje"
          value={messages.filter(m => {
            const today = new Date().toDateString();
            return new Date(m.timestamp).toDateString() === today;
          }).length}
        />
      </div>

      {/* Status do Sistema */}
      <div className={styles.statusCard}>
        <h2 className={styles.statusTitle}>Status do Sistema</h2>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <div className={styles.statusDot}></div>
            <div className={styles.statusDetails}>
              <div className={styles.statusName}>Backend</div>
              <div className={styles.statusDescription}>API operacional</div>
            </div>
          </div>
          
          <div className={styles.statusItem}>
            <div className={styles.statusDot}></div>
            <div className={styles.statusDetails}>
              <div className={styles.statusName}>Evolution API</div>
              <div className={styles.statusDescription}>Conectada</div>
            </div>
          </div>
          
          <div className={styles.statusItem}>
            <div className={styles.statusDot}></div>
            <div className={styles.statusDetails}>
              <div className={styles.statusName}>Webhooks</div>
              <div className={styles.statusDescription}>Recebendo mensagens</div>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas Mensagens */}
      <div className={styles.messagesCard}>
        <div className={styles.messagesHeader}>
          <h2 className={styles.messagesTitle}>Últimas Mensagens</h2>
          <a href="/messages" className={styles.viewAllLink}>
            Ver todas →
          </a>
        </div>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>Nenhuma mensagem ainda.</div>
        ) : (
          <div className={styles.messagesList}>
            {messages.slice(0, 5).map((message) => (
              <div key={message.id} className={styles.messageItem}>
                <div className={styles.messageAvatar}>
                  {message.contact_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className={styles.messageContent}>
                  <div className={styles.messageHeader}>
                    <div className={styles.messageName}>
                      {message.contact_name || 'Desconhecido'}
                    </div>
                    <div className={styles.messageTime}>
                      {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className={styles.messageText}>
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