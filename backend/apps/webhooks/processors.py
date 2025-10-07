# apps/webhooks/processors.py
import logging
from typing import Dict, Any
from django.utils import timezone
from apps.msgms.models import Message
from apps.contacts.models import Contact
from apps.webhooks.models import WebhookLog
from apps.msgms.tasks import process_incoming_message, analyze_message_sentiment

logger = logging.getLogger(__name__)

class WebhookProcessor:
    """Processa diferentes tipos de eventos da Evolution API"""
    
    @staticmethod
    def process_messages_upsert(data: Dict[str, Any], webhook_log_id: int = None) -> Dict[str, Any]:
        """
        Processa evento MESSAGES_UPSERT (nova mensagem recebida)
        
        Formato do payload da Evolution API:
        {
            "event": "messages.upsert",
            "instance": "instance_name",
            "data": {
                "key": {
                    "remoteJid": "5511999999999@s.whatsapp.net",
                    "fromMe": false,
                    "id": "3EB0xxxxx"
                },
                "pushName": "João Silva",
                "message": {
                    "conversation": "Olá, tudo bem?"
                },
                "messageType": "conversation",
                "messageTimestamp": 1234567890
            }
        }
        """
        logger.info(f"Processing MESSAGES_UPSERT: {data.get('key', {}).get('id')}")
        
        try:
            # Extrair dados do payload
            key = data.get('key', {})
            message_data = data.get('message', {})
            
            # Extrair número do WhatsApp (remover sufixo @s.whatsapp.net)
            remote_jid = key.get('remoteJid', '')
            phone_number = remote_jid.split('@')[0] if '@' in remote_jid else remote_jid
            
            # Extrair conteúdo da mensagem
            content = WebhookProcessor._extract_message_content(message_data)
            
            # Dados formatados para a task
            formatted_data = {
                'whatsapp_id': key.get('id'),
                'contact': {
                    'whatsapp_id': phone_number,
                    'name': data.get('pushName', phone_number),
                    'phone_number': phone_number,
                },
                'message_type': data.get('messageType', 'text'),
                'content': content,
                'is_from_me': key.get('fromMe', False),
                'timestamp': timezone.now(),
                'metadata': {
                    'instance': data.get('instance'),
                    'raw_message_type': data.get('messageType'),
                }
            }
            
            # Enfileirar processamento assíncrono
            from apps.msgms.tasks import process_incoming_message
            task = process_incoming_message.delay(formatted_data)
            
            logger.info(f"Message processing task enqueued: {task.id}")
            
            return {
                'status': 'success',
                'task_id': task.id,
                'message': 'Message queued for processing'
            }
            
        except Exception as e:
            logger.error(f"Error processing MESSAGES_UPSERT: {e}", exc_info=True)
            return {
                'status': 'error',
                'message': str(e)
            }
    
    @staticmethod
    def _extract_message_content(message_data: Dict) -> str:
        """Extrai o conteúdo da mensagem baseado no tipo"""
        # Mensagem de texto simples
        if 'conversation' in message_data:
            return message_data['conversation']
        
        # Mensagem com texto estendido
        if 'extendedTextMessage' in message_data:
            return message_data['extendedTextMessage'].get('text', '')
        
        # Mensagem de imagem com legenda
        if 'imageMessage' in message_data:
            return message_data['imageMessage'].get('caption', '[Imagem]')
        
        # Mensagem de vídeo com legenda
        if 'videoMessage' in message_data:
            return message_data['videoMessage'].get('caption', '[Vídeo]')
        
        # Mensagem de áudio
        if 'audioMessage' in message_data:
            return '[Áudio]'
        
        # Mensagem de documento
        if 'documentMessage' in message_data:
            filename = message_data['documentMessage'].get('fileName', 'documento')
            return f'[Documento: {filename}]'
        
        # Localização
        if 'locationMessage' in message_data:
            return '[Localização]'
        
        # Contato
        if 'contactMessage' in message_data:
            return '[Contato]'
        
        return '[Mensagem não suportada]'
    
    @staticmethod
    def process_messages_update(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa evento MESSAGES_UPDATE (atualização de status da mensagem)
        """
        logger.info(f"Processing MESSAGES_UPDATE")
        
        try:
            key = data.get('key', {})
            update = data.get('update', {})
            
            whatsapp_id = key.get('id')
            status_map = {
                0: 'sent',
                1: 'delivered',
                2: 'read',
            }
            
            status_code = update.get('status', 0)
            new_status = status_map.get(status_code, 'sent')
            
            # Atualizar status no banco
            updated = Message.objects.filter(
                whatsapp_id=whatsapp_id
            ).update(status=new_status)
            
            logger.info(f"Updated {updated} messages with status {new_status}")
            
            return {
                'status': 'success',
                'updated_count': updated,
                'new_status': new_status
            }
            
        except Exception as e:
            logger.error(f"Error processing MESSAGES_UPDATE: {e}", exc_info=True)
            return {
                'status': 'error',
                'message': str(e)
            }
    
    @staticmethod
    def process_connection_update(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa evento CONNECTION_UPDATE (mudança de conexão da instância)
        """
        logger.info(f"Processing CONNECTION_UPDATE: {data.get('state')}")
        
        # Aqui você pode implementar lógica para:
        # - Notificar sobre desconexões
        # - Atualizar status da instância
        # - Enviar alertas
        
        return {
            'status': 'success',
            'connection_state': data.get('state'),
            'message': 'Connection update processed'
        }
    
    @staticmethod
    def process_qrcode_updated(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa evento QRCODE_UPDATED (QR Code atualizado)
        """
        logger.info(f"Processing QRCODE_UPDATED")
        
        # Você pode:
        # - Salvar o QR Code em um modelo
        # - Enviar notificação para admin
        # - Exibir na interface
        
        return {
            'status': 'success',
            'message': 'QR Code update processed'
        }
