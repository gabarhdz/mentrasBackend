from django.urls import path

from .views import AllView


urlpatterns = [
    path('', AllView.as_view(), name='all-forums'),
]
