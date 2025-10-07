from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task
def sync_contact_from_evolution_api(whatsapp_id):
    """
    Sincroniza dados de um contato com a Evolution API
    """
    try:
        from .models import Contact
        # chamada  para a Evolution API
        # Por enquanto, vamos simular
        
        logger.info(f"Syncing contact: {whatsapp_id}")
        
        # Simulação de dados da API
        api_data = {
            'name': 'Contact Updated',
            'profile_picture_url': 'https://example.com/pic.jpg',
            'is_business': True,
        }
        
        contact = Contact.objects.get(whatsapp_id=whatsapp_id)
        contact.name = api_data.get('name', contact.name)
        contact.profile_picture_url = api_data.get('profile_picture_url')
        contact.is_business = api_data.get('is_business', False)
        contact.save()
        
        logger.info(f"Contact synced successfully: {contact.id}")
        return {'status': 'success', 'contact_id': contact.id}
        
    except Exception as exc:
        logger.error(f"Error syncing contact: {exc}")
        return {'status': 'error', 'message': str(exc)}

@shared_task
def update_all_contact_stats():
    """
    Atualiza estatísticas de todos os contatos
    """
    from .models import Contact
    
    contacts = Contact.objects.all()
    updated_count = 0
    
    for contact in contacts:
        contact.update_stats()
        updated_count += 1
    
    logger.info(f"Updated stats for {updated_count} contacts")
    return {'status': 'success', 'updated': updated_count}
