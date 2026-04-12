from django.db import models

# Create your models here.

class Item(models.Model):
    name = models.CharField(max_length=255)
    profile_pic=models.CharField(blank=True,null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()

    def __str__(self):
        return self.name
    
class Menu(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    def __str__(self):
        return self.name

class MenuItem(models.Model):
    menu = models.ForeignKey(Menu, on_delete=models.CASCADE, related_name='menu_items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.IntegerField(min_value=0, max_value=Item.stock)

    def __str__(self):
        return f"{self.quantity} x {self.item.name} in {self.menu.name}"

