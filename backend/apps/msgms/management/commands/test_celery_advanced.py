from django.core.management.base import BaseCommand
from apps.msgms.tasks import process_incoming_message, analyze_message_sentiment
from apps.msgms.models import Message
from apps.contacts.models import Contact
import time

class Command(BaseCommand):
    help = 'Testa Celery com feedback completo'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('🚀 Iniciando teste do Celery...\n'))
        
        # Dados de teste
        message_data = {
            'whatsapp_id': f'test-msg-{int(time.time())}',
            'contact': {
                'whatsapp_id': 'test-contact-456',
                'name': 'Test Contact',
                'phone_number': '5511999999999',
            },
            'message_type': 'text',
            'content': 'Teste do Celery! Muito obrigado pelo excelente atendimento!',
            'is_from_me': False,
        }
        
        # Contar antes
        msg_before = Message.objects.count()
        contact_before = Contact.objects.count()
        
        self.stdout.write(f'📊 Antes: {msg_before} mensagens, {contact_before} contatos')
        
        # Enfileirar task
        self.stdout.write(self.style.WARNING('\n⏳ Enfileirando task...'))
        task = process_incoming_message.delay(message_data)
        self.stdout.write(self.style.SUCCESS(f'✅ Task enfileirada! ID: {task.id}'))
        
        # Aguardar processamento
        self.stdout.write(self.style.WARNING('\n⏳ Aguardando processamento (5 segundos)...'))
        time.sleep(5)
        
        # Contar depois
        msg_after = Message.objects.count()
        contact_after = Contact.objects.count()
        
        self.stdout.write(f'\n📊 Depois: {msg_after} mensagens, {contact_after} contatos')
        
        # Verificar resultado
        if msg_after > msg_before:
            self.stdout.write(self.style.SUCCESS('\n✅ SUCESSO! Nova mensagem criada!'))
            
            # Mostrar última mensagem
            last_msg = Message.objects.last()
            self.stdout.write(f'\n📩 Mensagem criada:')
            self.stdout.write(f'   - ID: {last_msg.id}')
            self.stdout.write(f'   - Contato: {last_msg.contact.name}')
            self.stdout.write(f'   - Conteúdo: {last_msg.content}')
            
            # Testar análise de sentimento
            self.stdout.write(self.style.WARNING('\n⏳ Testando análise de sentimento...'))
            sentiment_task = analyze_message_sentiment.delay(last_msg.id)
            time.sleep(3)
            
            last_msg.refresh_from_db()
            if 'sentiment' in last_msg.metadata:
                sentiment = last_msg.metadata['sentiment']
                self.stdout.write(self.style.SUCCESS(f'✅ Sentiment detectado: {sentiment}'))
            
        else:
            self.stdout.write(self.style.ERROR('\n❌ FALHOU! Nenhuma mensagem criada'))
        
        self.stdout.write(self.style.SUCCESS('\n🎉 Teste concluído!'))

#Para teste:
# docker compose exec backend python manage.py test_celery_advanced
