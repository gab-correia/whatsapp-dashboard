import { useContacts } from '@/hooks/useContacts';
import styles from './Contacts.module.css';

export function Contacts() {
  const { contacts, loading, error } = useContacts();

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Carregando contatos...</div>
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
        <h1 className={styles.title}>Contatos</h1>
        <div className={styles.totalCount}>
          Total: {contacts.length} contatos
        </div>
      </div>

      {/* Empty State */}
      {contacts.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <h3 className={styles.emptyTitle}>
            Nenhum contato ainda
          </h3>
          <p className={styles.emptyDescription}>
            Os contatos aparecerão quando mensagens forem recebidas
          </p>
        </div>
      ) : (
        /* Contacts Grid */
        <div className={styles.contactsGrid}>
          {contacts.map((contact) => (
            <div key={contact.id} className={styles.contactCard}>
              {/* Contact Header */}
              <div className={styles.contactHeader}>
                <div className={styles.avatar}>
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className={styles.contactInfo}>
                  <h3 className={styles.contactName}>
                    {contact.name}
                  </h3>
                  <p className={styles.contactPhone}>
                    {contact.phone_number}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <div className={styles.statValue}>
                    {contact.total_messages}
                  </div>
                  <div className={styles.statLabel}>Mensagens</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.lastMessageDate}>
                    {contact.last_message_at ? (
                      new Date(contact.last_message_at).toLocaleDateString('pt-BR')
                    ) : (
                      'Sem mensagens'
                    )}
                  </div>
                  <div className={styles.statLabel}>Última msg</div>
                </div>
              </div>

              {/* Blocked Badge */}
              {contact.is_blocked && (
                <div className={styles.blockedBadge}>
                  <span className={styles.badge}>
                    🚫 Bloqueado
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
