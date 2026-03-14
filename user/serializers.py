from rest_framework import serializers
from .models import Forum, User

class UserSerializer(serializers.ModelSerializer):
    id=serializers.UUID(read_only=True)
    password = serializers.CharField(write_only=True)
    is_mod = serializers.BooleanField(default=False)
    is_pyme_owner = serializers.BooleanField(default=False)
    is_admin = serializers.BooleanField(default=False)
    is_mentor = serializers.BooleanField(default=False)
    phone_number = serializers.IntegerField(required = True)
    profile_pic = serializers.CharField(required = False)
    class Meta:
        model = User
        fields = ['id',
                  'username',
                  'email',
                  'phone_number',
                  'password',
                  'profile_pic',
                  'is_mod',
                  'is_admin',
                  'is_mentor',
                  'is_pyme_owner']
    def create(self,validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(
            username = validated_data['username'],
            email = validated_data['email'],
            phone_number = validated_data['phone_number'],
            profile_pic = validated_data.get('profile_pic',''),
            is_mod = validated_data.get('is_mod',False),
            is_admin = validated_data.get('is_admin',False),
            is_mentor = validated_data.get('is_mentor',False),
            is_pyme_owner = validated_data.get('is_pyme_owner',False)
        )
        if password:
            user.set_password(password)
        user.save()
        return user

class ForumSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    created_at = serializers.DateTimeField(required=False)
    users = UserSerializer()
    class Meta:
        model = Forum
        fields = ['id','name','description','created_at','users']
