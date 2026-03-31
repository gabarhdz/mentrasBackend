from rest_framework import serializers
from .models import ForumUser, Forum, Post
from apps.user.serializers import UserSerializer

class ForumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Forum
        field = ['id','name','description','profile_pic','is_private','created_at']

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    forum_id = 0
    class Meta:
        model=Post
        fields=['íd','title','text','images','created_at','forum_id']