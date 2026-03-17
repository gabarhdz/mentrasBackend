from django.urls import path
from .views import AllForums, AllUsers, UserDetail

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('',AllUsers.as_view(),name='create-users'),
    path('<uuid:id>/',UserDetail.as_view(),name='patch-user'),
    path('forums/',AllForums.as_view(),name='Get and Post forums'),
    path('login/',TokenObtainPairView.as_view(),name='login'),
    path('login/refresh/',TokenRefreshView.as_view(),name='refresh-login')
]
