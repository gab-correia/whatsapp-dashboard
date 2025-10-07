# Documentação de Arquitetura C4

Este diretório contém a documentação completa da arquitetura do sistema usando o modelo C4 (Context, Containers, Components, Code).

## 📋 Arquivos Disponíveis

| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `Condigo.puml` | Overview | Visão geral da documentação |
| `01-context-diagram.puml` | Level 1 | Contexto do sistema e usuários |
| `02-container-diagram.puml` | Level 2 | Containers tecnológicos |
| `03-component-backend-diagram.puml` | Level 3 | Componentes do Django |
| `03-component-frontend-diagram.puml` | Level 3 | Componentes do React |
| `04-deployment-diagram.puml` | Deployment | Arquitetura Docker |
| `05-sequence-diagram.puml` | Sequence | Fluxo de integração |

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico
- **Frontend**: React.js 18 com componentes reutilizáveis
- **Backend**: Django 4.2 + Django REST Framework
- **Banco de Dados**: PostgreSQL 15
- **Cache/Broker**: Redis 7
- **Proxy**: Nginx 1.21
- **Containerização**: Docker + Docker Compose
- **Workers**: Celery para processamento assíncrono
- **API Externa**: Evolution API

### Containers Docker
1. **nginx-container**: Proxy reverso e servidor de arquivos estáticos
2. **react-container**: Aplicação frontend React
3. **django-container**: API backend Django
4. **postgres-container**: Banco de dados PostgreSQL
5. **redis-container**: Cache e message broker
6. **celery-container**: Workers para tarefas assíncronas

## 🔍 Como Visualizar

### Opção 1: VS Code + PlantUML Extension
1. Instale a extensão "PlantUML" no VS Code
2. Abra qualquer arquivo `.puml`
3. Use `Ctrl+Shift+P` → "PlantUML: Preview Current Diagram"

### Opção 2: PlantUML Online
1. Acesse: http://www.plantuml.com/plantuml/uml/
2. Cole o conteúdo do arquivo `.puml`
3. Visualize o diagrama gerado

### Opção 3: PlantUML Local
```bash
# Instalar PlantUML (requer Java)
sudo apt-get install plantuml

# Gerar PNG
plantuml -png arquivo.puml

# Gerar SVG
plantuml -tsvg arquivo.puml
```

## 📊 Níveis de Abstração

### Level 1 - Contexto
Mostra o sistema como uma "caixa preta" e suas interações com usuários e sistemas externos.

### Level 2 - Container
Decompõe o sistema em containers (aplicações, bancos de dados, etc.) mostrando as tecnologias.

### Level 3 - Componente
Detalha os componentes internos de cada container, suas responsabilidades e interações.

### Deployment
Mostra como o sistema é implantado na infraestrutura, incluindo servidores e containers.

## 🔄 Fluxos Principais

1. **Autenticação**: Usuário → React → Django → PostgreSQL
2. **Integração API**: Django → Evolution API → Cache Redis
3. **Processamento Assíncrono**: Django → Celery → Redis → PostgreSQL
4. **Servir Conteúdo**: Nginx → React (estáticos) + Django (API)

## 🛠️ Próximos Passos

Para implementar esta arquitetura:

1. **Setup Docker**: Criar `docker-compose.yml`
2. **Backend Django**: Configurar models, views, serializers
3. **Frontend React**: Criar componentes e serviços
4. **Integração**: Configurar comunicação com Evolution API
5. **Deploy**: Configurar Nginx e orquestração de containers