from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=5)
def process_webhook(self, webhook_log_id):
    """
    Processa um webhook recebido (ATUALIZADO)
    """
    try:
        from .models import WebhookLog
        from .processors import WebhookProcessor
        
        webhook = WebhookLog.objects.get(id=webhook_log_id)
        webhook.status = 'processing'
        webhook.save()
        
        logger.info(f"Processing webhook: {webhook.webhook_id}")
        
        # Extrair dados
        event_type = webhook.event_type
        payload_data = webhook.payload.get('data', webhook.payload)
        
        # Processar baseado no tipo de evento
        processor_map = {
            'MESSAGES_UPSERT': WebhookProcessor.process_messages_upsert,
            'messages.upsert': WebhookProcessor.process_messages_upsert,
            'MESSAGES_UPDATE': WebhookProcessor.process_messages_update,
            'messages.update': WebhookProcessor.process_messages_update,
            'CONNECTION_UPDATE': WebhookProcessor.process_connection_update,
            'connection.update': WebhookProcessor.process_connection_update,
            'QRCODE_UPDATED': WebhookProcessor.process_qrcode_updated,
            'qrcode.updated': WebhookProcessor.process_qrcode_updated,
        }
        
        processor = processor_map.get(event_type)
        
        if processor:
            result = processor(payload_data, webhook_log_id)
            
            webhook.status = 'success'
            webhook.processed_at = timezone.now()
            webhook.metadata = result
            webhook.save()
            
            logger.info(f"Webhook processed successfully: {webhook_log_id}")
            return result
        else:
            logger.warning(f"No processor for event type: {event_type}")
            webhook.status = 'success'
            webhook.processed_at = timezone.now()
            webhook.error_message = f"Event type '{event_type}' not implemented"
            webhook.save()
            
            return {'status': 'skipped', 'message': 'Event type not implemented'}
        
    except Exception as exc:
        from .models import WebhookLog
        
        webhook = WebhookLog.objects.get(id=webhook_log_id)
        webhook.status = 'failed'
        webhook.error_message = str(exc)
        webhook.retry_count += 1
        webhook.save()
        
        logger.error(f"Error processing webhook: {exc}", exc_info=True)
        
        # Retry com backoff exponencial
        raise self.retry(exc=exc, countdown=2 ** webhook.retry_count * 60)
