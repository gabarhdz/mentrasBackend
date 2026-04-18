from django.contrib.auth import get_user_model
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APIRequestFactory, force_authenticate
from unittest.mock import patch

from apps.stock.models import Item, Menu, MenuItem, MenuMovement
from apps.stock.serializers import ItemSerializer
from apps.stock.views import ItemsMenu


def build_test_image(name="test.gif"):
    return SimpleUploadedFile(
        name,
        (
            b"GIF87a\x01\x00\x01\x00\x80\x00\x00"
            b"\x00\x00\x00\xff\xff\xff!\xf9\x04"
            b"\x01\x00\x00\x00\x00,\x00\x00\x00"
            b"\x00\x01\x00\x01\x00\x00\x02\x02D"
            b"\x01\x00;"
        ),
        content_type="image/gif",
    )


class MenuMovementModelTests(TestCase):
    def test_can_save_a_menu_movement_entry(self):
        user = get_user_model().objects.create_user(
            username="menu-owner",
            email="owner@example.com",
            password="StrongPass123",
        )
        item = Item.objects.create(
            name="Coffee",
            price="4.50",
            stock=25,
        )
        menu = Menu.objects.create(
            name="Breakfast",
            description="Morning menu",
        )
        menu_item = MenuItem.objects.create(
            menu=menu,
            item=item,
            quantity=3,
        )

        movement = MenuMovement.objects.create(
            menu=menu,
            item=item,
            menu_item=menu_item,
            performed_by=user,
            action=MenuMovement.Action.ITEM_ADDED,
            quantity=3,
            details="Added coffee to breakfast menu",
        )

        self.assertEqual(MenuMovement.objects.count(), 1)
        self.assertEqual(menu.movements.get(), movement)
        self.assertEqual(user.menu_movements.get(), movement)
        self.assertEqual(str(movement), "Breakfast - Item added")


class ItemSerializerTests(TestCase):
    def test_requires_all_fields_for_item_creation(self):
        serializer = ItemSerializer(data={})

        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)
        self.assertIn("profile_pic", serializer.errors)
        self.assertIn("price", serializer.errors)
        self.assertIn("stock", serializer.errors)

    @patch("globals.cloudinary.cloudinary.uploader.upload")
    def test_accepts_valid_item_payload_and_persists_cloudinary_url(self, mock_upload):
        mock_upload.return_value = {"secure_url": "https://cloudinary.example.com/coffee.gif"}
        payload = {
            "name": "Coffee",
            "profile_pic": build_test_image("coffee.gif"),
            "price": "4.50",
            "stock": 25,
        }

        serializer = ItemSerializer(data=payload)

        self.assertTrue(serializer.is_valid(), serializer.errors)
        item = serializer.save()
        self.assertEqual(item.profile_pic, "https://cloudinary.example.com/coffee.gif")
        mock_upload.assert_called_once()


class ItemsMenuViewTests(TestCase):
    def test_post_creates_menu_item_and_movement(self):
        user = get_user_model().objects.create_user(
            username="verified-user",
            email="verified@example.com",
            password="StrongPass123",
        )
        user.email_verified = True
        menu = Menu.objects.create(
            name="Breakfast",
            description="Morning menu",
        )
        item = Item.objects.create(
            name="Coffee",
            profile_pic="coffee.png",
            price="4.50",
            stock=25,
        )
        request = APIRequestFactory().post(
            f"/stock/menus/{menu.id}/items/",
            {"item_id": item.id, "quantity": 3},
            format="json",
        )
        force_authenticate(request, user=user)

        response = ItemsMenu.as_view()(request, menu_id=menu.id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        menu_item = MenuItem.objects.get(menu=menu, item=item)
        movement = MenuMovement.objects.get(menu_item=menu_item)
        self.assertEqual(menu_item.quantity, 3)
        self.assertEqual(movement.menu, menu)
        self.assertEqual(movement.item, item)
        self.assertEqual(movement.performed_by, user)
        self.assertEqual(movement.action, MenuMovement.Action.ITEM_ADDED)
        self.assertEqual(movement.quantity, 3)
