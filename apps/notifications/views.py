from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        notifications = Notification.objects.filter(recipient=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response({
            "results": serializer.data,
            "unread_count": notifications.filter(read=False).count(),
        }, status=status.HTTP_200_OK)


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id, *args, **kwargs):
        try:
            notification = Notification.objects.get(id=id, recipient=request.user)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND)

        notification.read = True
        notification.save(update_fields=["read"])
        return Response(NotificationSerializer(notification).data, status=status.HTTP_200_OK)


class NotificationsReadAllView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, *args, **kwargs):
        Notification.objects.filter(recipient=request.user, read=False).update(read=True)
        return Response({"message": "Notifications marked as read"}, status=status.HTTP_200_OK)
