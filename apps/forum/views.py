from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Forum
from .serializers import ForumSerializer


class AllView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        forums = Forum.objects.all().order_by('-created_at')
        serializer = ForumSerializer(forums, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = ForumSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            forum = serializer.save()
            response_serializer = ForumSerializer(forum, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
