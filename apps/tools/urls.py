from django.urls import path

from .views import PymeMetricsView


urlpatterns = [
    path("pymes/<uuid:pyme_id>/metrics/", PymeMetricsView.as_view(), name="pyme-metrics"),
]
