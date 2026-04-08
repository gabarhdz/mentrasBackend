from rest_framework import serializers
from .models import User
import cloudinary.uploader


class UserSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    password = serializers.CharField(write_only=True)
    is_mod = serializers.BooleanField(default=False)
    is_pyme_owner = serializers.BooleanField(default=False)
    is_admin = serializers.BooleanField(default=False)
    is_mentor = serializers.BooleanField(default=False)
    phone_number = serializers.IntegerField(required=True)
    profile_pic = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'phone_number',
            'password',
            'profile_pic',
            'is_mod',
            'is_admin',
            'is_mentor',
            'is_pyme_owner'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        profile_pic_file = validated_data.pop('profile_pic', None)

        profile_pic_url = ""

        if profile_pic_file:
            result = cloudinary.uploader.upload(
                profile_pic_file,
                folder="profile_pics",
                resource_type="image",
                transformation=[
                    {"width": 500, "height": 500, "crop": "fill", "gravity": "face"},
                    {"quality": "auto"},
                    {"fetch_format": "auto"}
                ]
            )
            profile_pic_url = result["secure_url"]

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            profile_pic=profile_pic_url,
            is_mod=validated_data.get('is_mod', False),
            is_admin=validated_data.get('is_admin', False),
            is_mentor=validated_data.get('is_mentor', False),
            is_pyme_owner=validated_data.get('is_pyme_owner', False)
        )

        if password:
            user.set_password(password)
            user.save()

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        profile_pic_file = validated_data.pop('profile_pic', None)

        if profile_pic_file:
            result = cloudinary.uploader.upload(
                profile_pic_file,
                folder="profile_pics",
                public_id=str(instance.id),
                overwrite=True,
                resource_type="image",
                transformation=[
                    {"width": 500, "height": 500, "crop": "fill", "gravity": "face"},
                    {"quality": "auto"},
                    {"fetch_format": "auto"}
                ]
            )
            instance.profile_pic = result["secure_url"]

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance
