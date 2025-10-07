from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    contact_phone = serializers.CharField(source='contact.phone_number', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id',
            'whatsapp_id',
            'contact',
            'contact_name',
            'contact_phone',
            'message_type',
            'content',
            'media_url',
            'status',
            'is_from_me',
            'timestamp',
            'metadata',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']

class MessageListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagens"""
    contact_name = serializers.CharField(source='contact.name', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'id',
            'contact_name',
            'message_type',
            'content',
            'is_from_me',
            'timestamp',
        ]
