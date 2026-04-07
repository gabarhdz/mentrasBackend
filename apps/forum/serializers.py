from rest_framework import serializers
from .models import ForumUser, Forum, Post
from apps.user.serializers import UserSerializer
from better_profanity import profanity

class ForumSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)

    class Meta:
        model = Forum
        fields = ['id', 'name', 'description', 'profile_pic', 'is_private', 'created_at']
        read_only_fields = ['id', 'created_at']
    def validate_name(self, value):
        if profanity.contains_profanity(value):
            raise serializers.ValidationError("Inappropriate content detected in the forum name.")
        return value
    def validate_description(self, value): 
        if profanity.contains_profanity(value):
            raise serializers.ValidationError("Inappropriate content detected in the forum description.")
        return value

class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    forum_id = 0
    class Meta:
        model=Post
        fields=['id','title','text','images','created_at','forum_id']

    def validate_text(self,value):
        if profanity.contains_profanity(value):
            raise serializers.ValidationError("Inappropriate content detected in the post text.")
        return value
    def validate_title(self,value):
        if profanity.contains_profanity(value):
            raise serializers.ValidationError("Inappropriate content detected in the post title.")
        return value