# Documentação C4 - WhatsApp Dashboard

Documentação da arquitetura do sistema usando o modelo C4 (Context, Containers, Components, Code).

## 📐 Diagramas

### 1. Contexto (Level 1)
![Context Diagram](01-context-diagram.png)

Mostra o sistema em alto nível e seus relacionamentos com usuários e sistemas externos.

### 2. Containers (Level 2)
![Container Diagram](02-container-diagram.png)

Detalha os principais containers (aplicações) que compõem o sistema:
- Frontend React
- Backend Django
- Celery Workers
- Bancos de dados
- APIs externas

### 3. Componentes (Level 3)

#### Backend Components
![Backend Components](03-component-backend-diagram.png)

Componentes internos do backend Django:
- API Views
- Serializers
- Models
- Webhook Processor
- Celery Tasks

#### Frontend Components
![Frontend Components](03-component-frontend-diagram.png)

Componentes internos do frontend React:
- Router
- Pages
- UI Components
- Custom Hooks
- API Services

### 4. Deployment
![Deployment Diagram](04-deployment-diagram.png)

Infraestrutura Docker Compose com todos os containers e volumes.

### 5. Sequência
![Sequence Diagram](05-sequence-diagram.png)

Fluxo completo desde criação de instância até recebimento de mensagem.

