from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def health_check(request):
    return Response({
        'status': 'ok',
        'message': 'Backend Django is running!',
        'version': '1.0.0'
    })

@api_view(['GET'])
def dashboard_stats(request):
    return Response({
        'total_messages': 150,
        'total_contacts': 45,
        'active_conversations': 12,
        'pending_messages': 3
    })
