# apps/webhooks/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
import logging
import json

from .models import WebhookLog
from .validators import validate_webhook_signature, validate_evolution_payload
from .processors import WebhookProcessor
from .tasks import process_webhook

logger = logging.getLogger(__name__)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])  # Webhooks não precisam de autenticação padrão
def evolution_webhook(request):
    """
    Endpoint principal para receber webhooks da Evolution API
    
    URL: /api/webhooks/evolution/
    Method: POST
    
    Evolution API enviará diferentes tipos de eventos para este endpoint
    """
    try:
        # Log do IP de origem (útil para debug)
        client_ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
        logger.info(f"Webhook received from {client_ip}")
        
        # Obter dados do payload
        payload = request.data
        
        # Extrair informações do evento
        event = payload.get('event', 'unknown')
        instance = payload.get('instance', 'unknown')
        data = payload.get('data', {})
        
        logger.info(f"Event: {event}, Instance: {instance}")
        
        # Criar log do webhook
        webhook_log = WebhookLog.objects.create(
            event_type=event,
            webhook_id=f"{instance}_{event}_{timezone.now().timestamp()}",
            payload=payload,
            headers=dict(request.headers),
            status='pending'
        )
        
        # Validar assinatura (se configurado)
        # signature = request.headers.get('X-Webhook-Signature')
        # if not validate_webhook_signature(payload, signature):
        #     webhook_log.status = 'failed'
        #     webhook_log.error_message = 'Invalid signature'
        #     webhook_log.save()
            
        #     return Response(
        #         {'error': 'Invalid signature'},
        #         status=status.HTTP_401_UNAUTHORIZED
        #     )
        
        # Processar de forma assíncrona
        process_webhook.delay(webhook_log.id)
        
        return Response(
            {
                'status': 'accepted',
                'webhook_log_id': webhook_log.id,
                'message': 'Webhook received and queued for processing'
            },
            status=status.HTTP_202_ACCEPTED
        )
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON payload")
        return Response(
            {'error': 'Invalid JSON payload'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    except Exception as e:
        logger.error(f"Error processing webhook: {e}", exc_info=True)
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def evolution_webhook_by_event(request, event_name):
    """
    Endpoint para webhooks separados por evento
    
    URL: /api/webhooks/evolution/<event_name>/
    Method: POST
    
    Exemplo: /api/webhooks/evolution/messages-upsert/
    """
    try:
        logger.info(f"Webhook received for event: {event_name}")
        
        # Converter nome do evento de URL para formato Evolution API
        # messages-upsert -> MESSAGES_UPSERT
        event_type = event_name.replace('-', '_').upper()
        
        payload = {
            'event': event_type,
            'data': request.data
        }
        
        # Criar log
        webhook_log = WebhookLog.objects.create(
            event_type=event_type,
            webhook_id=f"{event_name}_{timezone.now().timestamp()}",
            payload=payload,
            headers=dict(request.headers),
            status='pending'
        )
        
        # Processar
        process_webhook.delay(webhook_log.id)
        
        return Response(
            {
                'status': 'accepted',
                'event': event_type,
                'webhook_log_id': webhook_log.id
            },
            status=status.HTTP_202_ACCEPTED
        )
        
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def webhook_status(request, webhook_log_id):
    """
    Verifica o status de processamento de um webhook
    
    URL: /api/webhooks/status/<webhook_log_id>/
    Method: GET
    """
    try:
        webhook_log = WebhookLog.objects.get(id=webhook_log_id)
        
        return Response({
            'webhook_id': webhook_log.webhook_id,
            'event_type': webhook_log.event_type,
            'status': webhook_log.status,
            'created_at': webhook_log.created_at,
            'processed_at': webhook_log.processed_at,
            'retry_count': webhook_log.retry_count,
            'error_message': webhook_log.error_message
        })
        
    except WebhookLog.DoesNotExist:
        return Response(
            {'error': 'Webhook log not found'},
            status=status.HTTP_404_NOT_FOUND
        )
