import { useState, useEffect } from 'react';
import { messagesApi } from '@/services/api';
import type { Message } from '@/types';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await messagesApi.getAll();
      
      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return { messages, loading, error, refetch: fetchMessages };
}