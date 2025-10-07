from django.contrib import admin
from .models import Contact

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'phone_number', 'total_messages', 'last_message_at']
    list_filter = ['is_business', 'is_blocked']
    search_fields = ['name', 'phone_number']
