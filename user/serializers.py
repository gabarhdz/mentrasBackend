from rest_framework import serializers
from .models import Forum
class ForumSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(required=False,allow_blank=False)

    class Meta:
        model = Forum
        fields = ['id','name','description','created_at','users']

    def create(self, validated_data):
        return Forum.object.create(validated_data)  