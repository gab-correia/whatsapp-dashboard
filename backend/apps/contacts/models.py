from django.db import models

class Contact(models.Model):
    # Identificadores
    whatsapp_id = models.CharField(max_length=255, unique=True)
    phone_number = models.CharField(max_length=20)
    
    # Informações
    name = models.CharField(max_length=255)
    profile_picture_url = models.URLField(blank=True, null=True)
    
    # Metadados
    is_business = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)
    
    # Estatísticas
    total_messages = models.IntegerField(default=0)
    last_message_at = models.DateTimeField(null=True, blank=True)
    
    # Dados extras
    metadata = models.JSONField(default=dict, blank=True)
    
    # Auditoria
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-last_message_at']
        indexes = [
            models.Index(fields=['whatsapp_id']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['-last_message_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.phone_number})"
    
    def update_stats(self):
        """Atualiza estatísticas do contato"""
        # CORREÇÃO: usar 'messages' ao invés de 'msgms'
        self.total_messages = self.messages.count()
        last_message = self.messages.first()
        if last_message:
            self.last_message_at = last_message.timestamp
        self.save()