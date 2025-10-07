.PHONY: help build up down logs restart clean

help:
	@echo "Comandos disponíveis:"
	@echo "  make build    - Build das imagens Docker"
	@echo "  make up       - Subir containers"
	@echo "  make down     - Parar containers"
	@echo "  make logs     - Ver logs"
	@echo "  make restart  - Reiniciar containers"
	@echo "  make clean    - Remover volumes e containers"

build:
	docker-compose build

up:
	docker-compose up

up-d:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

restart:
	docker-compose restart

clean:
	docker-compose down -v
	docker system prune -f
