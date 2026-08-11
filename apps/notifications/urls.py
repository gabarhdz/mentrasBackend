from django.urls import path

from .views import NotificationReadView, NotificationsReadAllView, NotificationsView


urlpatterns = [
    path("", NotificationsView.as_view(), name="notifications"),
    path("read-all/", NotificationsReadAllView.as_view(), name="notifications-read-all"),
    path("<uuid:id>/read/", NotificationReadView.as_view(), name="notification-read"),
]
