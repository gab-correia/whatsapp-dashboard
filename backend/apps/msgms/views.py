from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import Message
from .serializers import MessageSerializer, MessageListSerializer

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.select_related('contact').all()
    serializer_class = MessageSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['content', 'contact__name', 'contact__phone_number']
    ordering_fields = ['timestamp', 'created_at']
    ordering = ['-timestamp']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MessageListSerializer
        return MessageSerializer
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Retorna estatísticas de mensagens"""
        total = self.queryset.count()
        by_type = dict(
            self.queryset.values('message_type')
            .annotate(count=Count('id'))
            .values_list('message_type', 'count')
        )
        
        return Response({
            'total_messages': total,
            'by_type': by_type,
            'sent_by_me': self.queryset.filter(is_from_me=True).count(),
            'received': self.queryset.filter(is_from_me=False).count(),
        })
