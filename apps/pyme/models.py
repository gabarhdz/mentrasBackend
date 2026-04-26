from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from uuid import uuid4
import json

def validate_post_images(value: str) -> None:
    if value in (None, ""):
        return

    try:
        parsed = json.loads(value)
    except Exception as exc:
        raise ValidationError("images must be valid JSON.") from exc

    if not isinstance(parsed, list):
        raise ValidationError("images must be a JSON array.")

    if len(parsed) > 8:
        raise ValidationError("images must contain at most 8 items.")

    for item in parsed:
        if not isinstance(item, str) or not item.strip():
            raise ValidationError("Each image must be a non-empty string.")


class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Pyme(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    profile_pic = models.TextField(blank=True)
    access_date = models.DateTimeField(auto_now_add=True)
    foundation_date = models.DateField()
    def __str__(self):
        return self.name 
    
class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField()
    images = models.TextField(blank=False, default="[]", validators=[validate_post_images])
    price = models.DecimalField(max_digits=10, decimal_places=2)
    pyme = models.ForeignKey(Pyme, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
    
class Order(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return f"Order {self.id} - {self.product.name} x {self.quantity}"
    
class ProductOrder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity} in Order {self.order.id}"