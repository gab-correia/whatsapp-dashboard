from django.contrib import admin
from .models import WebhookLog

@admin.register(WebhookLog)
class WebhookLogAdmin(admin.ModelAdmin):
    list_display = ['id', 'event_type', 'status', 'retry_count', 'created_at']
    list_filter = ['status', 'event_type']
    search_fields = ['webhook_id', 'event_type']
    date_hierarchy = 'created_at'