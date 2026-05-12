from django.db import models
import uuid
# Create your models here.

class MonthlySales(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    month = models.CharField(max_length=20)
    sales = models.FloatField()

    def __str__(self):
        return f"{self.month}: {self.sales}"

class MostSoldProducts(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_name = models.CharField(max_length=100)
    quantity_sold = models.IntegerField()
    profit = models.FloatField()

    def __str__(self):
        return f"{self.product_name}: {self.quantity_sold}"
    
class MostSeenProducts(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product_name = models.CharField(max_length=100)
    views = models.IntegerField()

    def __str__(self):
        return f"{self.product_name}: {self.views}"