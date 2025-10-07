from django.db import models
from django.contrib.auth.models import User

class Message(models.Model):
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('video', 'Video'),
        ('audio', 'Audio'),
        ('document', 'Document'),
    ]
    
    MESSAGE_STATUS = [
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed'),
    ]
    
    # Identificadores
    whatsapp_id = models.CharField(max_length=255, unique=True)
    
    # Relacionamentos
    contact = models.ForeignKey(
        'contacts.Contact',
        on_delete=models.CASCADE,
        related_name='messages'
    )
    
    # Conteúdo
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default='text')
    content = models.TextField(blank=True, null=True)
    media_url = models.URLField(blank=True, null=True)
    
    # Metadados
    status = models.CharField(max_length=20, choices=MESSAGE_STATUS, default='sent')
    is_from_me = models.BooleanField(default=False)
    timestamp = models.DateTimeField()
    
    # Dados extras (JSON)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Auditoria
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['contact', '-timestamp']),
            models.Index(fields=['whatsapp_id']),
        ]
    
    def __str__(self):
        direction = "→" if self.is_from_me else "←"
        return f"{direction} {self.contact.name}: {self.content[:50]}"
