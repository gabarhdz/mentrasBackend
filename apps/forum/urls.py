from django.urls import path
from .views import AllForums

urlpatterns = [
    path('',AllForums.as_view(),name='all-forums')
]