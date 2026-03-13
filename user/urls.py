from django.urls import path
from .views import AllForums

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('forums/',AllForums.as_view(),name='Get and Post forums'),
    path('login/',TokenObtainPairView.as_view(),name='login'),
    path('login/refresh/',TokenRefreshView.as_view(),name='refresh-login')
]
