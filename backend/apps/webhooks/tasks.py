from celery import shared_task
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=5)
def process_webhook(self, webhook_log_id):
    """
    Processa um webhook recebido
    """
    try:
        from .models import WebhookLog
        from apps.msgms.tasks import process_incoming_message
        
        webhook = WebhookLog.objects.get(id=webhook_log_id)
        webhook.status = 'processing'
        webhook.save()
        
        logger.info(f"Processing webhook: {webhook.webhook_id}")
        
        # Processar baseado no tipo de evento
        event_type = webhook.event_type
        payload = webhook.payload
        
        if event_type == 'message.received':
            # Enfileirar processamento da mensagem
            process_incoming_message.delay(payload)
            
        elif event_type == 'message.status':
            # Atualizar status da mensagem
            from apps.msgms.models import Message
            Message.objects.filter(
                whatsapp_id=payload.get('whatsapp_id')
            ).update(status=payload.get('status'))
        
        # Marcar como sucesso
        webhook.status = 'success'
        webhook.processed_at = timezone.now()
        webhook.save()
        
        logger.info(f"Webhook processed successfully: {webhook_log_id}")
        return {'status': 'success', 'webhook_id': webhook_log_id}
        
    except Exception as exc:
        from .models import WebhookLog
        
        webhook = WebhookLog.objects.get(id=webhook_log_id)
        webhook.status = 'failed'
        webhook.error_message = str(exc)
        webhook.retry_count += 1
        webhook.save()
        
        logger.error(f"Error processing webhook: {exc}")
        
        # Retry com backoff exponencial
        raise self.retry(exc=exc, countdown=2 ** webhook.retry_count * 60)
