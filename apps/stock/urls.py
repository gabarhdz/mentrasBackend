from django.urls import path

from .views import AllItems, AllMenus, ItemsMenu


urlpatterns = [
    path("items/", AllItems.as_view(), name="all-items"),
    path("menus/", AllMenus.as_view(), name="all-menus"),
    path("menus/<int:menu_id>/items/", ItemsMenu.as_view(), name="items-menu"),
]
