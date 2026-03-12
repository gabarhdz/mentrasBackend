from rest_framework import serializers
from .models import Forum
class ForumSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(required=False)

    class Meta:
        model = Forum
        fields = ['id','name','description','created_at','users']
