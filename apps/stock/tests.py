from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.stock.models import Item, Menu, MenuItem, MenuMovement
from apps.stock.serializers import ItemSerializer


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

    def test_accepts_valid_item_payload(self):
        payload = {
            "name": "Coffee",
            "profile_pic": "coffee.png",
            "price": "4.50",
            "stock": 25,
        }

        serializer = ItemSerializer(data=payload)

        self.assertTrue(serializer.is_valid(), serializer.errors)
