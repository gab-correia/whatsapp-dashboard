# apps/webhooks/validators.py
from django.conf import settings
import hashlib
import hmac
import logging

logger = logging.getLogger(__name__)

def validate_webhook_signature(payload: dict, signature: str = None) -> bool:
    """
    Valida a assinatura do webhook (se configurado)
    Por padrão, a Evolution API não usa assinatura, mas é boa prática implementar
    """
    # Se não houver secret configurado, aceita qualquer requisição
    webhook_secret = getattr(settings, 'EVOLUTION_WEBHOOK_SECRET', None)
    
    if not webhook_secret:
        logger.warning("EVOLUTION_WEBHOOK_SECRET não configurado. Validação de assinatura desabilitada.")
        return True
    
    if not signature:
        logger.error("Signature não fornecida no header")
        return False
    
    # Calcular hash esperado
    import json
    payload_str = json.dumps(payload, sort_keys=True)
    expected_signature = hmac.new(
        webhook_secret.encode(),
        payload_str.encode(),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

def validate_evolution_payload(data: dict, event_type: str) -> tuple[bool, str]:
    """
    Valida se o payload do webhook está no formato esperado
    """
    required_fields = {
        'MESSAGES_UPSERT': ['key', 'message', 'messageType'],
        'MESSAGES_UPDATE': ['key', 'update'],
        'MESSAGES_DELETE': ['key'],
        'CONNECTION_UPDATE': ['state'],
        'QRCODE_UPDATED': ['qrcode'],
    }
    
    fields = required_fields.get(event_type, [])
    
    for field in fields:
        if field not in data:
            return False, f"Campo obrigatório '{field}' não encontrado"
    
    return True, "OK"
