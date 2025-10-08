export interface Message {
  id: number;
  contact_name?: string;
  contact_phone?: string;
  message_type: string;
  content?: string;
  is_from_me: boolean;
  timestamp: string;
  status?: string;  // ← Adicionar campo status como opcional
}

export interface Contact {
  id: number;
  name: string;
  phone_number: string;
  whatsapp_id?: string;
  profile_picture_url?: string;
  is_business: boolean;
  is_blocked: boolean;
  total_messages: number;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_messages: number;
  total_contacts: number;
  active_conversations: number;
  pending_messages: number;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}