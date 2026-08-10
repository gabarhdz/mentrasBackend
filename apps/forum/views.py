from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Forum, ForumJoinRequest, ForumUser, Post
from .serializers import ForumJoinRequestSerializer, ForumSerializer, PostSerializer


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
            response_serializer = ForumSerializer(forum, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DetailedForums(APIView):
    permission_classes = [IsAuthenticated]

    def _is_forum_admin(self, forum, user):
        if user.is_admin:
            return True

        return ForumUser.objects.filter(
            forum=forum,
            user=user,
            isAdmin=True,
        ).exists()

    def get(self, request, id, *args, **kwargs):
        try:
            forum = Forum.objects.get(id=id)
        except Forum.DoesNotExist:
            return Response({'error': 'Forum not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ForumSerializer(forum, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request, id, *args, **kwargs):
        return self.patch(request, id, *args, **kwargs)

    def patch(self, request, id, *args, **kwargs):
        try:
            forum = Forum.objects.get(id=id)
        except Forum.DoesNotExist:
            return Response({'error': 'Forum not found'}, status=status.HTTP_404_NOT_FOUND)

        if not self._is_forum_admin(forum, request.user):
            return Response(
                {'error': 'You do not have permission to edit this forum'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ForumSerializer(forum, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            forum = serializer.save()
            response_serializer = ForumSerializer(forum, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):
        try:
            forum = Forum.objects.get(id=id)
        except Forum.DoesNotExist:
            return Response({'error': 'Forum not found'}, status=status.HTTP_404_NOT_FOUND)

        if not self._is_forum_admin(forum, request.user):
            return Response(
                {'error': 'You do not have permission to delete this forum'},
                status=status.HTTP_403_FORBIDDEN,
            )

        forum.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class JoinForum(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id, *args, **kwargs):
        try:
            forum = Forum.objects.get(id=id)
        except Forum.DoesNotExist:
            return Response({'error': 'Forum not found'}, status=status.HTTP_404_NOT_FOUND)

        if ForumUser.objects.filter(forum=forum, user=request.user).exists():
            return Response({'error': 'You are already a member of this forum'}, status=status.HTTP_400_BAD_REQUEST)

        if not forum.is_private:
            ForumUser.objects.create(forum=forum, user=request.user, isAdmin=False)
            return Response({'message': 'You joined the forum'}, status=status.HTTP_201_CREATED)

        join_request, created = ForumJoinRequest.objects.get_or_create(
            forum=forum,
            user=request.user,
        )
        if not created and join_request.status == ForumJoinRequest.REJECTED:
            join_request.status = ForumJoinRequest.PENDING
            join_request.save(update_fields=['status'])

        return Response(
            {'message': 'Join request sent', 'status': join_request.status},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

class LeaveForum(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, id, *args, **kwargs):
        try:
            forum = Forum.objects.get(id=id)
        except Forum.DoesNotExist:
            return Response({'error': 'Forum not found'}, status=status.HTTP_404_NOT_FOUND)

        forum_user = ForumUser.objects.filter(
            forum=forum,
            user=request.user,
        ).first()
        if forum_user is None:
            return Response({'error': 'You are not a member of this forum'}, status=status.HTTP_400_BAD_REQUEST)

        forum_user.delete()
        ForumJoinRequest.objects.filter(
            forum=forum,
            user=request.user,
            status=ForumJoinRequest.APPROVED,
        ).update(status=ForumJoinRequest.REJECTED)
        return Response(status=status.HTTP_204_NO_CONTENT)

class ForumJoinRequests(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.is_admin:
            requests = ForumJoinRequest.objects.filter(
                status=ForumJoinRequest.PENDING,
            ).order_by('-created_at')
        else:
            admin_forums = ForumUser.objects.filter(
                user=request.user,
                isAdmin=True,
            ).values('forum_id')
            requests = ForumJoinRequest.objects.filter(
                forum_id__in=admin_forums,
                status=ForumJoinRequest.PENDING,
            ).order_by('-created_at')

        if not requests.exists() and not request.user.is_admin and not ForumUser.objects.filter(
            user=request.user,
            isAdmin=True,
        ).exists():
            return Response({'error': 'You do not have permission to review join requests'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ForumJoinRequestSerializer(requests, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id, *args, **kwargs):
        try:
            join_request = ForumJoinRequest.objects.get(id=id, status=ForumJoinRequest.PENDING)
        except ForumJoinRequest.DoesNotExist:
            return Response({'error': 'Join request not found'}, status=status.HTTP_404_NOT_FOUND)

        is_forum_admin = ForumUser.objects.filter(
            forum=join_request.forum,
            user=request.user,
            isAdmin=True,
        ).exists()
        if not request.user.is_admin and not is_forum_admin:
            return Response({'error': 'You do not have permission to review join requests'}, status=status.HTTP_403_FORBIDDEN)

        decision = request.data.get('status')
        if decision not in [ForumJoinRequest.APPROVED, ForumJoinRequest.REJECTED]:
            return Response({'error': 'Status must be approved or rejected'}, status=status.HTTP_400_BAD_REQUEST)

        join_request.status = decision
        join_request.save(update_fields=['status'])
        if decision == ForumJoinRequest.APPROVED:
            ForumUser.objects.get_or_create(forum=join_request.forum, user=join_request.user)

        serializer = ForumJoinRequestSerializer(join_request, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


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

        if not request.user.is_authenticated:
            return Response({'error': 'Authentication is required to create a post'}, status=status.HTTP_401_UNAUTHORIZED)

        if not ForumUser.objects.filter(forum=forum, user=request.user).exists():
            return Response(
                {'error': 'You must be a member of the forum to create a post'},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PostSerializer(data=data, context={'request': request})
        if serializer.is_valid():
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
    
