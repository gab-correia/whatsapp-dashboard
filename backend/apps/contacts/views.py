from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Contact
from .serializers import ContactSerializer, ContactListSerializer

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'phone_number']
    ordering_fields = ['name', 'last_message_at', 'total_messages']
    ordering = ['-last_message_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ContactListSerializer
        return ContactSerializer
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Retorna estatísticas de contatos"""
        total = self.queryset.count()
        business = self.queryset.filter(is_business=True).count()
        blocked = self.queryset.filter(is_blocked=True).count()
        
        return Response({
            'total_contacts': total,
            'business_accounts': business,
            'blocked': blocked,
            'active': total - blocked,
        })
