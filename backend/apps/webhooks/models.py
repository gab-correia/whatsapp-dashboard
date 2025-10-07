from django.db import models

class WebhookLog(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]
    
    # Identificação
    event_type = models.CharField(max_length=100)
    webhook_id = models.CharField(max_length=255, unique=True)
    
    # Payload
    payload = models.JSONField()
    headers = models.JSONField(default=dict, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True, null=True)
    
    # Processamento
    processed_at = models.DateTimeField(null=True, blank=True)
    retry_count = models.IntegerField(default=0)
    
    # Auditoria
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['event_type']),
        ]
    
    def __str__(self):
        return f"{self.event_type} - {self.status} ({self.created_at})"
