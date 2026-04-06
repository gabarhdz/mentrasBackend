from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Forum,ForumUser,Post
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
            if request.user.is_authenticated:
                ForumUser.objects.update_or_create(
                    forum=forum,
                    user=request.user,
                    defaults={'isAdmin': True},
                )
            response_serializer = ForumSerializer(forum, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id, *args, **kwargs):
        try:
            forum = Forum.objects.get(id=id)
        except Forum.DoesNotExist:
            return Response({'error': 'Forum not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ForumSerializer(forum, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, id, *args, **kwargs):
        try:
            forum = Forum.objects.get(id=id)
        except Forum.DoesNotExist:
            return Response({'error': 'Forum not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ForumSerializer(forum, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            forum = serializer.save()
            if request.user.is_authenticated:
                ForumUser.objects.update_or_create(
                    forum=forum,
                    user=request.user,
                    defaults={'isAdmin': True},
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
