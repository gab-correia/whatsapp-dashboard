# WhatsApp Dashboard


# Subir tudo
make up

# Ver logs
make logs

# Parar
make down

# Reconstruir
make build

# Executar comando no backend
docker-compose exec backend python manage.py migrate

# Acessar shell do backend
docker-compose exec backend bash

# Acessar shell do PostgreSQL
docker-compose exec postgres psql -U postgres -d whatsapp_dashboard
