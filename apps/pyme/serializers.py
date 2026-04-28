from rest_framework import serializers

from globals.cloudinary import CloudinaryImageField, upload_profile_pic

from .models import Category, Pyme


class CategorySerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)

    class Meta:
        model = Category
        fields = ["id", "name"]
        read_only_fields = ["id"]


class PymeSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    owner = serializers.UUIDField(source="owner.id", read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source="category",
        write_only=True,
        required=False,
        allow_null=True,
    )
    profile_pic = CloudinaryImageField(required=False, allow_null=True)

    class Meta:
        model = Pyme
        fields = [
            "id",
            "name",
            "description",
            "owner",
            "category",
            "category_id",
            "profile_pic",
            "access_date",
            "foundation_date",
        ]
        read_only_fields = ["id", "owner", "access_date", "category"]
        extra_kwargs = {
            "name": {"required": True, "allow_blank": False},
            "description": {"required": True, "allow_blank": False},
            "foundation_date": {"required": True},
        }

    def create(self, validated_data):
        profile_pic_file = validated_data.pop("profile_pic", None)
        pyme = Pyme.objects.create(**validated_data)

        if profile_pic_file:
            pyme.profile_pic = upload_profile_pic(
                profile_pic_file,
                folder="pyme_pics",
                public_id=str(pyme.id),
            ) or ""
            pyme.save(update_fields=["profile_pic"])

        return pyme

    def update(self, instance, validated_data):
        profile_pic_file = validated_data.pop("profile_pic", None)

        if profile_pic_file:
            instance.profile_pic = upload_profile_pic(
                profile_pic_file,
                folder="pyme_pics",
                public_id=str(instance.id),
                overwrite=True,
            ) or ""

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
