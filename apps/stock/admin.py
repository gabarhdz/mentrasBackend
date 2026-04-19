from django.contrib import admin

from apps.stock.models import Item, Menu, MenuItem, MenuMovement


@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "stock")


@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ("menu", "item", "quantity")
    list_select_related = ("menu", "item")


@admin.register(MenuMovement)
class MenuMovementAdmin(admin.ModelAdmin):
    list_display = ("menu", "action", "item", "performed_by", "created_at")
    list_filter = ("action", "created_at")
    list_select_related = ("menu", "item", "performed_by")
    search_fields = ("menu__name", "item__name", "performed_by__username", "details")
