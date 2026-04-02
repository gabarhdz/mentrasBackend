
from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/user/', include('apps.user.urls')),
    path('api/forum/', include('apps.forum.urls')),
    path('api/accounts/', include('allauth.urls'))
]
