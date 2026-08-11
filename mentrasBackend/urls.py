
from django.contrib import admin
from django.http import JsonResponse
from django.urls import path, include


def health_check(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path('', health_check, name='health-check'),
    path('api/health/', health_check, name='api-health-check'),
    path('admin/', admin.site.urls),
    path('api/user/', include('apps.user.urls')),
    path('api/forum/', include('apps.forum.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/chatbot/', include('apps.chatbot.urls')),
    path('api/stock/', include('apps.stock.urls')),
    path('api/learning/', include('apps.learning.urls')),
    path('api/pyme/', include('apps.pyme.urls')),
    path('api/tools/', include('apps.tools.urls')),
    path('api/accounts/', include('allauth.urls'))
]
