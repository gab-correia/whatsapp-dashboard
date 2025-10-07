export interface Contact {
  id: number;
  whatsapp_id: string;
  phone_number: string;
  name: string;
  profile_picture_url?: string;
  is_business: boolean;
  is_blocked: boolean;
  total_messages: number;
  last_message_at?: string;
  created_at: string;
}

export interface Message {
  id: number;
  whatsapp_id: string;
  contact: number;
  contact_name?: string;
  contact_phone?: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document';
  content?: string;
  media_url?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  is_from_me: boolean;
  timestamp: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  total_messages: number;
  total_contacts: number;
  active_conversations: number;
  pending_messages: number;
}

export interface ApiResponse<T> {
  count?: number;
  next?: string;
  previous?: string;
  results?: T[];
  data?: T;
}