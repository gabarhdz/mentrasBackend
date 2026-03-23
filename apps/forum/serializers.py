import json
from rest_framework import serializers
from .models import Forum, Post

class ForumSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    class Meta:
        model = Forum
        fields = ["id", "name", "description", "profile_pic", "is_private"]


class PostSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    images = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        max_length=4,
    )

    class Meta:
        model = Post
        fields = ["id", "title", "text", "images"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        try:
            data["images"] = json.loads(getattr(instance, "images", "") or "[]")
        except Exception:
            data["images"] = []
        return data

    def create(self, validated_data):
        images = validated_data.pop("images", [])
        validated_data["images"] = json.dumps(images)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if "images" in validated_data:
            instance.images = json.dumps(validated_data.pop("images") or [])
        return super().update(instance, validated_data)
