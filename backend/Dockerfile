FROM python:3.11-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Copiar requirements
COPY requirements/base.txt /app/requirements/

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements/base.txt

# Copiar código da aplicação
COPY . /app/

# Expor porta
EXPOSE 8000

# Comando padrão
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
