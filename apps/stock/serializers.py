from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.stock.models import Item, Menu, MenuItem, MenuMovement
from globals.cloudinary import CloudinaryImageField, upload_profile_pic


class ItemSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    profile_pic = CloudinaryImageField(required=True, allow_null=False)

    def create(self, validated_data):
        profile_pic_file = validated_data.pop("profile_pic")
        item = Item.objects.create(**validated_data)
        item.profile_pic = upload_profile_pic(
            profile_pic_file,
            folder="item_pics",
            public_id=str(item.id),
        ) or ""
        item.save(update_fields=["profile_pic"])
        return item

    def update(self, instance, validated_data):
        profile_pic_file = validated_data.pop("profile_pic", None)

        if profile_pic_file:
            instance.profile_pic = upload_profile_pic(
                profile_pic_file,
                public_id=str(instance.id),
                folder="item_pics",
                overwrite=True,
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    class Meta:
        model = Item
        fields = ["id", "name", "profile_pic", "price", "stock"]
        extra_kwargs = {
            "name": {"required": True, "allow_blank": False},
            "price": {"required": True},
            "stock": {"required": True},
        }


class MenuItemSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    item = ItemSerializer(read_only=True)
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(),
        source="item",
        write_only=True,
    )

    class Meta:
        model = MenuItem
        fields = ["id", "menu", "item", "item_id", "quantity"]
        read_only_fields = ["id"]


class MenuMovementSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    action_display = serializers.CharField(source="get_action_display", read_only=True)
    menu_name = serializers.CharField(source="menu.name", read_only=True)
    item_name = serializers.SerializerMethodField()
    performed_by = serializers.StringRelatedField(read_only=True)
    menu_id = serializers.PrimaryKeyRelatedField(
        queryset=Menu.objects.all(),
        source="menu",
        write_only=True,
    )
    item_id = serializers.PrimaryKeyRelatedField(
        queryset=Item.objects.all(),
        source="item",
        write_only=True,
        required=False,
        allow_null=True,
    )
    menu_item_id = serializers.PrimaryKeyRelatedField(
        queryset=MenuItem.objects.all(),
        source="menu_item",
        write_only=True,
        required=False,
        allow_null=True,
    )
    performed_by_id = serializers.PrimaryKeyRelatedField(
        queryset=get_user_model().objects.all(),
        source="performed_by",
        write_only=True,
        required=False,
        allow_null=True,
    )

    def get_item_name(self, obj):
        return obj.item.name if obj.item else None

    class Meta:
        model = MenuMovement
        fields = [
            "id",
            "menu",
            "menu_id",
            "menu_name",
            "item",
            "item_id",
            "item_name",
            "menu_item",
            "menu_item_id",
            "performed_by",
            "performed_by_id",
            "action",
            "action_display",
            "quantity",
            "previous_quantity",
            "details",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "menu",
            "item",
            "menu_item",
            "performed_by",
            "created_at",
        ]


class MenuSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    menu_items = MenuItemSerializer(many=True, read_only=True)
    movements = MenuMovementSerializer(many=True, read_only=True)

    class Meta:
        model = Menu
        fields = ["id", "name", "description", "menu_items", "movements"]
