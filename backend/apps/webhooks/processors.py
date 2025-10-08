import logging
from apps.msgms.models import Message
from apps.contacts.models import Contact
from django.utils import timezone

logger = logging.getLogger(__name__)

class WebhookProcessor:
    @staticmethod
    def process_messages_upsert(data, webhook_log_id=None):
        """Processa webhook de nova mensagem (messages.upsert)"""
        try:
            logger.info(f"Processing messages.upsert webhook")
            
            # Extrair dados da mensagem
            key = data.get('key', {})
            message_data = data.get('message', {})
            
            # Informações do contato
            remote_jid = key.get('remoteJid', '')
            phone_number = remote_jid.split('@')[0] if '@' in remote_jid else remote_jid
            contact_name = data.get('pushName', 'Unknown')
            
            # Criar ou atualizar contato
            contact, created = Contact.objects.get_or_create(
                phone_number=phone_number,
                defaults={
                    'name': contact_name,
                    'whatsapp_id': remote_jid,
                }
            )
            
            if not created and contact_name and contact_name != 'Unknown':
                contact.name = contact_name
                contact.save()
            
            # Extrair conteúdo da mensagem
            content = (
                message_data.get('conversation') or
                message_data.get('extendedTextMessage', {}).get('text') or
                message_data.get('imageMessage', {}).get('caption') or
                ''
            )
            
            # Tipo de mensagem
            message_type = data.get('messageType', 'conversation')
            
            # ID da mensagem
            message_id = key.get('id', '')
            
            # Verificar se mensagem já existe (usando whatsapp_id)
            existing = Message.objects.filter(
                whatsapp_id=message_id
            ).first()
            
            if existing:
                logger.info(f"Message {message_id} already exists, skipping")
                return {
                    'status': 'skipped',
                    'reason': 'Message already exists',
                    'message_id': existing.id
                }
            
            # Criar mensagem
            message = Message.objects.create(
                contact=contact,
                whatsapp_id=message_id,
                content=content,
                message_type=message_type,
                is_from_me=key.get('fromMe', False),
                timestamp=timezone.now(),
                status='received'
            )
            
            # Atualizar contato
            contact.total_messages += 1
            contact.last_message_at = timezone.now()
            contact.save()
            
            logger.info(f"✅ Message created: {message.id} from {contact.name}")
            
            return {
                'status': 'success',
                'message_id': message.id,
                'contact_id': contact.id,
                'contact_name': contact.name
            }
            
        except Exception as e:
            logger.error(f"❌ Error processing messages.upsert: {e}", exc_info=True)
            raise

    @staticmethod
    def process_messages_update(data, webhook_log_id=None):
        """Processa webhook de atualização de mensagem (messages.update)"""
        try:
            logger.info(f"Processing messages.update webhook")
            
            key = data.get('key', {})
            message_id = key.get('id', '')
            
            # Buscar mensagem existente
            message = Message.objects.filter(
                whatsapp_id=message_id
            ).first()
            
            if not message:
                logger.warning(f"Message {message_id} not found for update")
                return {
                    'status': 'skipped',
                    'reason': 'Message not found'
                }
            
            # Atualizar status se disponível
            update = data.get('update', {})
            status = update.get('status')
            
            if status:
                message.status = status
                message.save()
                logger.info(f"✅ Message {message.id} status updated to {status}")
            
            return {
                'status': 'success',
                'message_id': message.id,
                'new_status': status
            }
            
        except Exception as e:
            logger.error(f"❌ Error processing messages.update: {e}", exc_info=True)
            raise

    @staticmethod
    def process_connection_update(data, webhook_log_id=None):
        """Processa webhook de atualização de conexão (connection.update)"""
        try:
            logger.info(f"Processing connection.update webhook")
            logger.info(f"Connection state: {data.get('state', 'unknown')}")
            
            return {
                'status': 'success',
                'connection_state': data.get('state', 'unknown')
            }
            
        except Exception as e:
            logger.error(f"❌ Error processing connection.update: {e}", exc_info=True)
            raise

    @staticmethod
    def process_qrcode_updated(data, webhook_log_id=None):
        """Processa webhook de atualização de QR Code"""
        try:
            logger.info(f"Processing qrcode.updated webhook")
            
            return {
                'status': 'success',
                'event': 'qrcode.updated'
            }
            
        except Exception as e:
            logger.error(f"❌ Error processing qrcode.updated: {e}", exc_info=True)
            raise

    @staticmethod
    def process_chats_update(data, webhook_log_id=None):
        """Processa webhook de atualização de chats"""
        try:
            logger.info(f"Processing chats.update webhook")
            
            return {
                'status': 'success',
                'event': 'chats.update'
            }
            
        except Exception as e:
            logger.error(f"❌ Error processing chats.update: {e}", exc_info=True)
            raise

    @staticmethod
    def process_chats_upsert(data, webhook_log_id=None):
        """Processa webhook de novo chat"""
        try:
            logger.info(f"Processing chats.upsert webhook")
            
            return {
                'status': 'success',
                'event': 'chats.upsert'
            }
            
        except Exception as e:
            logger.error(f"❌ Error processing chats.upsert: {e}", exc_info=True)
            raise

