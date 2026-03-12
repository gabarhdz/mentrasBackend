from django.urls import path
from .views import AllForums

urlpatterns = [
    path('forums/',AllForums.as_view(),name='Get and Post forums'),
]
