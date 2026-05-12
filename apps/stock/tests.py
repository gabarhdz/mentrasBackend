from django.contrib.auth import get_user_model
from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from unittest.mock import patch

from apps.pyme.models import Category, Pyme
from apps.stock.models import Item, Menu, MenuItem, MenuMovement
from apps.stock.serializers import ItemSerializer, MenuSerializer
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
        category = Category.objects.create(name="Food")
        pyme = Pyme.objects.create(
            name="Cafe owner",
            description="Owner pyme",
            owner=user,
            category=category,
            foundation_date="2024-01-01",
        )
        item = Item.objects.create(
            name="Coffee",
            price="4.50",
            stock=25,
        )
        menu = Menu.objects.create(
            pyme=pyme,
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
            is_pyme_owner=True,
            is_email_verified=True,
        )
        category = Category.objects.create(name="Food")
        pyme = Pyme.objects.create(
            name="Cafe owner",
            description="Owner pyme",
            owner=user,
            category=category,
            foundation_date="2024-01-01",
        )
        menu = Menu.objects.create(
            pyme=pyme,
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


class MenuSerializerTests(TestCase):
    def test_requires_pyme_for_menu_creation(self):
        serializer = MenuSerializer(data={"name": "Breakfast", "description": "Morning menu"})

        self.assertFalse(serializer.is_valid())
        self.assertIn("pyme_id", serializer.errors)


class AllMenusViewTests(APITestCase):
    def setUp(self):
        self.owner = get_user_model().objects.create_user(
            username="pyme-owner",
            email="pyme-owner@example.com",
            password="StrongPass123",
            is_pyme_owner=True,
            is_email_verified=True,
        )
        self.other_owner = get_user_model().objects.create_user(
            username="other-owner",
            email="other-owner@example.com",
            password="StrongPass123",
            is_pyme_owner=True,
            is_email_verified=True,
        )
        self.category = Category.objects.create(name="Food")
        self.owner_pyme = Pyme.objects.create(
            name="Owner pyme",
            description="Main pyme",
            owner=self.owner,
            category=self.category,
            foundation_date="2024-01-01",
        )
        self.other_pyme = Pyme.objects.create(
            name="Other pyme",
            description="Other pyme",
            owner=self.other_owner,
            category=self.category,
            foundation_date="2024-01-01",
        )

    def test_post_creates_menu_when_owned_pyme_is_selected(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.post(
            reverse("all-menus"),
            {
                "name": "Breakfast",
                "description": "Morning menu",
                "pyme_id": str(self.owner_pyme.id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["pyme"], str(self.owner_pyme.id))

    def test_post_rejects_menu_for_pyme_from_another_owner(self):
        self.client.force_authenticate(user=self.owner)

        response = self.client.post(
            reverse("all-menus"),
            {
                "name": "Breakfast",
                "description": "Morning menu",
                "pyme_id": str(self.other_pyme.id),
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("pyme_id", response.data)

    def test_get_only_returns_menus_from_authenticated_owner_pymes(self):
        Menu.objects.create(
            pyme=self.owner_pyme,
            name="Owner menu",
            description="Visible",
        )
        Menu.objects.create(
            pyme=self.other_pyme,
            name="Other menu",
            description="Hidden",
        )
        self.client.force_authenticate(user=self.owner)

        response = self.client.get(reverse("all-menus"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Owner menu")
