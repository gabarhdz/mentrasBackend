from django.urls import path

from .views import AllItems, AllMenus, ItemsMenu, MenuMovements, SpecItem, SpecMenu


urlpatterns = [
    path("items/", AllItems.as_view(), name="all-items"),
    path("menus/", AllMenus.as_view(), name="all-menus"),
    path("menus/<uuid:menu_id>/movements/", MenuMovements.as_view(), name="menu-movements"),
    path("menus/<uuid:menu_id>/items/", ItemsMenu.as_view(), name="items-menu"),
]
