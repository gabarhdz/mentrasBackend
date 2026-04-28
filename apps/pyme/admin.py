from django.contrib import admin
from .models import Pyme, Category, Order, Product
# Register your models here.

admin.site.register(Pyme)
admin.site.register(Category)
admin.site.register(Order)
admin.site.register(Product)