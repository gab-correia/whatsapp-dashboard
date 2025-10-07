from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3)
def process_incoming_message(self, message_data):
    """
    Processa uma mensagem recebida via webhook
    """
    try:
        from .models import Message
        from apps.contacts.models import Contact
        
        logger.info(f"Processing message: {message_data.get('whatsapp_id')}")
        
        # Buscar ou criar contato
        contact, created = Contact.objects.get_or_create(
            whatsapp_id=message_data['contact']['whatsapp_id'],
            defaults={
                'name': message_data['contact']['name'],
                'phone_number': message_data['contact']['phone_number'],
            }
        )
        
        # Criar mensagem
        message = Message.objects.create(
            whatsapp_id=message_data['whatsapp_id'],
            contact=contact,
            message_type=message_data.get('message_type', 'text'),
            content=message_data.get('content', ''),
            media_url=message_data.get('media_url'),
            status=message_data.get('status', 'sent'),
            is_from_me=message_data.get('is_from_me', False),
            timestamp=message_data.get('timestamp', timezone.now()),
            metadata=message_data.get('metadata', {})
        )
        
        # Atualizar estatísticas do contato
        contact.update_stats()
        
        logger.info(f"Message processed successfully: {message.id}")
        return {'status': 'success', 'message_id': message.id}
        
    except Exception as exc:
        logger.error(f"Error processing message: {exc}")
        raise self.retry(exc=exc, countdown=60)

@shared_task
def analyze_message_sentiment(message_id):
    """
    Analisa o sentimento de uma mensagem (exemplo de processamento assíncrono)
    """
    try:
        from .models import Message
        
        message = Message.objects.get(id=message_id)
        
        # poderiamos integrar com uma API de análise de sentimento
        # Por enquanto, vamos simular
        
        if message.content:
            # Simulação simples de análise
            positive_words = ['obrigado', 'ótimo', 'excelente', 'bom', 'legal']
            negative_words = ['ruim', 'péssimo', 'horrível', 'problema', 'erro']
            
            content_lower = message.content.lower()
            
            sentiment = 'neutral'
            if any(word in content_lower for word in positive_words):
                sentiment = 'positive'
            elif any(word in content_lower for word in negative_words):
                sentiment = 'negative'
            
            # Salvar no metadata
            message.metadata['sentiment'] = sentiment
            message.save()
            
            logger.info(f"Sentiment analyzed for message {message_id}: {sentiment}")
            
        return {'status': 'success', 'sentiment': sentiment}
        
    except Exception as exc:
        logger.error(f"Error analyzing sentiment: {exc}")
        return {'status': 'error', 'message': str(exc)}

@shared_task
def cleanup_old_messages():
    """
    Remove mensagens antigas (executada periodicamente)
    """
    from datetime import timedelta
    from .models import Message
    
    cutoff_date = timezone.now() - timedelta(days=90)
    deleted_count, _ = Message.objects.filter(created_at__lt=cutoff_date).delete()
    
    logger.info(f"Cleaned up {deleted_count} old messages")
    return {'status': 'success', 'deleted': deleted_count}
