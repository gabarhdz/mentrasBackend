from rest_framework import serializers
from .models import ForumUser, Forum, Post
from apps.user.serializers import UserSerializer
from better_profanity import profanity
from globals.cloudinary import CloudinaryImageField, upload_profile_pic

class ForumSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    profile_pic = CloudinaryImageField(required=False, allow_null=True)

    def create(self, validated_data):
        profile_pic_file = validated_data.pop("profile_pic", None)
        forum = Forum.objects.create(**validated_data)

        if profile_pic_file:
            forum.profile_pic = upload_profile_pic(
                profile_pic_file,
                public_id=str(forum.id),
                folder="forum_pics",
                

            )
            forum.save(update_fields=["profile_pic"])

        return forum

    def update(self, instance, validated_data):
        profile_pic_file = validated_data.pop("profile_pic", None)

        if profile_pic_file:
            instance.profile_pic = upload_profile_pic(
                profile_pic_file,
                folder="forum_pics",
                public_id=str(instance.id),
                overwrite=True,
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

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
    user = UserSerializer(read_only=True)
    id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    forum_id = 0
    class Meta:
        model=Post
        fields=['id','title','text','user','images','created_at','forum_id']

    def create(self, validated_data):
        request = self.context.get('request')
        if request is not None and request.user.is_authenticated:
            validated_data['user'] = request.user
        return super().create(validated_data)

    def validate_text(self,value):
        if profanity.contains_profanity(value):
            raise serializers.ValidationError("Inappropriate content detected in the post text.")
        return value
    def validate_title(self,value):
        if profanity.contains_profanity(value):
            raise serializers.ValidationError("Inappropriate content detected in the post title.")
        return value
