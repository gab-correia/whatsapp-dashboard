import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Ler variáveis de ambiente
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-dev-key')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('POSTGRES_DB', 'whatsapp_dashboard'),
        'USER': os.environ.get('POSTGRES_USER', 'postgres'),
        'PASSWORD': os.environ.get('POSTGRES_PASSWORD', 'postgres'),
        'HOST': os.environ.get('POSTGRES_HOST', 'localhost'),
        'PORT': os.environ.get('POSTGRES_PORT', '5432'),
    }
}

ALLOWED_HOSTS = ['*']  # Para desenvolvimento
