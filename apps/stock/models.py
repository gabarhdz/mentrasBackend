from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Item(models.Model):
    name = models.CharField(max_length=255)
    profile_pic = models.CharField(max_length=255, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(
        blank=False,
        null=False,
        validators=[MinValueValidator(0)],
    )

    def __str__(self):
        return self.name


class Menu(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name="menu_items")
    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name="menu_items")
    quantity = models.IntegerField(validators=[MinValueValidator(0)])

    def __str__(self):
        return f"{self.quantity} x {self.item.name} in {self.menu.name}"


class MenuMovement(models.Model):
    class Action(models.TextChoices):
        CREATED = "created", "Created"
        UPDATED = "updated", "Updated"
        ITEM_ADDED = "item_added", "Item added"
        ITEM_REMOVED = "item_removed", "Item removed"
        QUANTITY_UPDATED = "quantity_updated", "Quantity updated"
        DELETED = "deleted", "Deleted"

    menu = models.ForeignKey(
        Menu,
        on_delete=models.CASCADE,
        related_name="movements",
    )
    item = models.ForeignKey(
        Item,
        on_delete=models.SET_NULL,
        related_name="menu_movements",
        blank=True,
        null=True,
    )
    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.SET_NULL,
        related_name="movements",
        blank=True,
        null=True,
    )
    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name="menu_movements",
        blank=True,
        null=True,
    )
    action = models.CharField(max_length=32, choices=Action.choices)
    quantity = models.IntegerField(blank=True, null=True)
    previous_quantity = models.IntegerField(blank=True, null=True)
    details = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.menu.name} - {self.get_action_display()}"


