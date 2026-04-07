from django.urls import path
from .views import AllUsers, UserDetail, GoogleLogin

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('',AllUsers.as_view(),name='create-users'),
    path('<uuid:id>/',UserDetail.as_view(),name='patch-user'),
    path('login/',TokenObtainPairView.as_view(),name='login'),
    path('login/refresh/',TokenRefreshView.as_view(),name='refresh-login'),
    path("accounts/google/", GoogleLogin.as_view(), name="google_login"),
]
