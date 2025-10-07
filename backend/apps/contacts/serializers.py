from rest_framework import serializers
from .models import Contact

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = [
            'id',
            'whatsapp_id',
            'phone_number',
            'name',
            'profile_picture_url',
            'is_business',
            'is_blocked',
            'total_messages',
            'last_message_at',
            'metadata',
            'created_at',
        ]
        read_only_fields = ['id', 'total_messages', 'last_message_at', 'created_at']

class ContactListSerializer(serializers.ModelSerializer):
    """Serializer simplificado para listagens"""
    class Meta:
        model = Contact
        fields = [
            'id',
            'name',
            'phone_number',
            'profile_picture_url',
            'total_messages',
            'last_message_at',
        ]
