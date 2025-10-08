import { useMessages } from '../../hooks/useMessages';
import { useState } from 'react';
import styles from './Messages.module.css';

export function Messages() {
  const { messages, loading, error, refetch } = useMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Filtrar mensagens
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.contact_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || message.message_type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
      return (
        <div className={styles.loading}>
          <div className={styles.loadingText}>Carregando mensagens...</div>
        </div>
      );
    }

  if (error) {
    return (
      <div className={styles.error}>
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mensagens Recebidas</h1>
          <p className={styles.subtitle}>
            Total: {filteredMessages.length} de {messages.length} mensagens
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

      {/* Filtros */}
      <div className={styles.filtersCard}>
        <div className={styles.filtersRow}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Buscar mensagens ou contatos..."
            className={styles.searchInput}
          />

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">Todos os tipos</option>
            <option value="conversation">Conversa</option>
            <option value="text">Texto</option>
            <option value="image">Imagem</option>
            <option value="audio">Áudio</option>
            <option value="video">Vídeo</option>
          </select>
        </div>
      </div>

      {/* Lista de Mensagens */}
      {filteredMessages.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>💬</div>
          <h3 className={styles.emptyTitle}>
            {searchTerm ? 'Nenhuma mensagem encontrada' : 'Nenhuma mensagem ainda'}
          </h3>
          <p className={styles.emptyDescription}>
            {searchTerm 
              ? 'Tente buscar por outros termos'
              : 'Aguarde mensagens chegarem no WhatsApp conectado'
            }
          </p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeadCell}>Contato</th>
                <th className={styles.tableHeadCell}>Mensagem</th>
                <th className={styles.tableHeadCell}>Tipo</th>
                <th className={styles.tableHeadCell}>Data/Hora</th>
                <th className={styles.tableHeadCell}>Status</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {filteredMessages.map((message) => (
                <tr key={message.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <div className={styles.contactCell}>
                      <div className={styles.avatar}>
                        {message.contact_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className={styles.contactInfo}>
                        <div className={styles.contactName}>
                          {message.contact_name || 'Desconhecido'}
                        </div>
                        <div className={styles.contactPhone}>
                          {message.contact_phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.messageContent}>
                      {message.content || '(mídia sem legenda)'}
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.badge} ${styles.badgeBlue}`}>
                      {message.message_type}
                    </span>
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.dateTimeCell}>
                      <div className={styles.date}>
                        {new Date(message.timestamp).toLocaleDateString('pt-BR')}
                      </div>
                      <div className={styles.time}>
                        {new Date(message.timestamp).toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={`${styles.badge} ${
                      message.status === 'read' ? styles.badgeGreen :
                      message.status === 'delivered' ? styles.badgeYellow :
                      styles.badgeGray
                    }`}>
                      {message.status || 'received'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}