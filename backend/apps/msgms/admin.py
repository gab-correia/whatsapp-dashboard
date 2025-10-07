from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'contact', 'message_type', 'is_from_me', 'timestamp', 'status']
    list_filter = ['message_type', 'status', 'is_from_me', 'timestamp']
    search_fields = ['content', 'contact__name']
    date_hierarchy = 'timestamp'
