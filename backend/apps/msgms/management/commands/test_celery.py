from django.core.management.base import BaseCommand
from apps.msgms.tasks import process_incoming_message

class Command(BaseCommand):
    help = 'Testa Celery enviando uma task de exemplo'

    def handle(self, *args, **options):
        message_data = {
            'whatsapp_id': 'test-msg-123',
            'contact': {
                'whatsapp_id': 'test-contact-456',
                'name': 'Test Contact',
                'phone_number': '5511999999999',
            },
            'message_type': 'text',
            'content': 'Esta é uma mensagem de teste!',
            'is_from_me': False,
        }
        
        # Enfileirar task
        task = process_incoming_message.delay(message_data)
        
        self.stdout.write(
            self.style.SUCCESS(f'Task enfileirada com sucesso! Task ID: {task.id}')
        )
        
        
        
# Para teste: # Executar o comando no container
#docker compose exec backend python manage.py test_celery
    