from django.urls import path
from . import views

urlpatterns = [
    # Endpoint principal
    path('evolution/', views.evolution_webhook, name='evolution_webhook'),
    
    # Endpoints por evento (webhook_by_events=true)
    path('evolution/<str:event_name>/', views.evolution_webhook_by_event, name='evolution_webhook_by_event'),
    
    # Status do webhook
    path('status/<int:webhook_log_id>/', views.webhook_status, name='webhook_status'),
]
