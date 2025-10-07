import os
from celery import Celery

# Definir settings module padrão do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Criar instância do Celery
app = Celery('whatsapp_dashboard')

# Carregar configurações do Django
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-descobrir tasks nos apps
app.autodiscover_tasks()

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
