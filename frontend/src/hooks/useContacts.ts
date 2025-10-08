import { useState, useEffect } from 'react';
import { contactsApi } from '@/services/api';
import type { Contact } from '@/types';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await contactsApi.getAll();
      
      // A API retorna array direto, não objeto com results
      if (Array.isArray(data)) {
        setContacts(data);
      } else {
        setContacts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contatos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return { contacts, loading, error, refetch: fetchContacts };
}