from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Forum,ForumUser,Post
from .serializers import ForumSerializer,PostSerializer


class AllForums(APIView):
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


class DetailedForums(APIView):
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


class AllPost(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        posts = Post.objects.all().order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, *args, **kwargs):
        data = request.data
        id = data.get('forum_id')

        try:
            forum = Forum.objects.get(id=id)
        except Forum.DoesNotExist:
            return Response({'error': 'Forum not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PostSerializer(data=data, context={'request': request})
        if serializer.is_valid() and request.user.is_authenticated:
            post = serializer.save(forum=forum)
            response_serializer = PostSerializer(post, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DetailedPost(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id, *args, **kwargs):
        try:
            post = Post.objects.get(id=id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = PostSerializer(post, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def delete(self, request, id, *args, **kwargs):
        try:
            post = Post.objects.get(id=id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        if post.user != request.user:
            return Response({'error': 'You do not have permission to delete this post'}, status=status.HTTP_403_FORBIDDEN)
        post.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
