from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import F
from django.db.models import Q
from apps.stock.models import Item, Menu, MenuMovement, MenuItem
from apps.stock.serializers import ItemSerializer, MenuSerializer, MenuItemSerializer, MenuMovementSerializer

from globals.permissions import IsEmailVerified


def user_item_scope(user):
    return Q(created_by=user) | Q(menu_items__menu__pyme__owner=user)


def user_can_access_item(user, item):
    return Item.objects.filter(id=item.id).filter(user_item_scope(user)).exists()

class AllItems(APIView):
    permission_classes = [IsEmailVerified]
    def get(self, request):
        items = Item.objects.all()
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = ItemSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            item = serializer.save()
            return Response(ItemSerializer(item, context={"request": request}).data, status=201)
        return Response(serializer.errors, status=400)

class MyItems(APIView):
    permission_classes = [IsEmailVerified]

    def get(self, request):
        items = Item.objects.filter(user_item_scope(request.user)).distinct()
        serializer = ItemSerializer(items, many=True, context={"request": request})
        return Response(serializer.data)

class SpecItem(APIView):
    permission_classes = [IsEmailVerified]
    def get(self, request, item_id):
        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response({"error": "Item not found"}, status=404)

        if not user_can_access_item(request.user, item):
            return Response(
                {"error": "You do not have permission to view this item"},
                status=403,
            )

        serializer = ItemSerializer(item)
        return Response(serializer.data)

    def patch(self, request, item_id):
        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response({"error": "Item not found"}, status=404)

        if item.created_by != request.user:
            return Response(
                {"error": "You do not have permission to edit this item"},
                status=403,
            )

        serializer = ItemSerializer(
            item,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        if serializer.is_valid():
            item = serializer.save()
            return Response(
                ItemSerializer(item, context={"request": request}).data,
                status=200,
            )
        return Response(serializer.errors, status=400)
    
class AllMenus(APIView):
    permission_classes = [IsEmailVerified]
    def get(self, request):
        menus = Menu.objects.filter(pyme__owner=request.user).select_related("pyme")
        serializer = MenuSerializer(menus, many=True, context={"request": request})
        return Response(serializer.data)
    
    def post(self, request):
        if not request.user.is_pyme_owner:
            return Response({"error": "Your account is not allowed to create menus."}, status=403)

        serializer = MenuSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            menu = serializer.save()
            return Response(MenuSerializer(menu, context={"request": request}).data, status=201)
        return Response(serializer.errors, status=400)
    
class SpecMenu(APIView):
    permission_classes = [IsEmailVerified]
    def get(self, request, menu_id):
        menu = get_object_or_404(
            Menu.objects.select_related("pyme"),
            id=menu_id,
            pyme__owner=request.user,
        )
        serializer = MenuSerializer(menu, context={"request": request})
        return Response(serializer.data)

class ItemsMenu(APIView):
    permission_classes = [IsEmailVerified]

    def _get_owned_menu(self, request, menu_id):
        return get_object_or_404(
            Menu.objects.select_related("pyme"),
            id=menu_id,
            pyme__owner=request.user,
        )

    def post(self, request, menu_id):
        menu = self._get_owned_menu(request, menu_id)

        payload = request.data.copy()
        payload["menu"] = menu.id
        serializer = MenuItemSerializer(data=payload)

        if serializer.is_valid():
            item = serializer.validated_data["item"]

            if not user_can_access_item(request.user, item):
                return Response(
                    {"error": "You do not have permission to use this item"},
                    status=403,
                )

            with transaction.atomic():
                item = Item.objects.select_for_update().get(id=item.id)

                if item.stock < serializer.validated_data["quantity"]:
                    return Response({"error": "Not enough stock"}, status=400)

                existing_menu_items = list(
                    MenuItem.objects.select_for_update()
                    .filter(menu=menu, item=item)
                    .order_by("id")
                )
                created = not existing_menu_items
                menu_item = existing_menu_items[0] if existing_menu_items else MenuItem(menu=menu, item=item)
                previous_quantity = sum(existing_menu_item.quantity for existing_menu_item in existing_menu_items)

                if len(existing_menu_items) > 1:
                    MenuItem.objects.filter(
                        id__in=[existing_menu_item.id for existing_menu_item in existing_menu_items[1:]]
                    ).delete()

                menu_item.quantity = F("quantity") + serializer.validated_data["quantity"]
                if created:
                    menu_item.quantity = serializer.validated_data["quantity"]
                    menu_item.save()
                else:
                    menu_item.quantity = previous_quantity + serializer.validated_data["quantity"]
                    menu_item.save(update_fields=["quantity"])
                menu_item.refresh_from_db()

                item.stock = F('stock') - serializer.validated_data["quantity"]
                item.save()
                item.refresh_from_db()

                MenuMovement.objects.create(
                    menu=menu,
                    item=item,
                    menu_item=menu_item,
                    performed_by=request.user if request.user.is_authenticated else None,
                    action=MenuMovement.Action.ITEM_ADDED,
                    quantity=serializer.validated_data["quantity"],
                    previous_quantity=previous_quantity if not created else None,
                    details=f"Added {item.name} to {menu.name}",
                )

            return Response(MenuSerializer(menu, context={"request": request}).data, status=200)
        return Response(serializer.errors, status=400)

    def patch(self, request, menu_id, menu_item_id):
        menu = self._get_owned_menu(request, menu_id)
        raw_quantity = request.data.get("quantity")

        try:
            next_quantity = int(raw_quantity)
        except (TypeError, ValueError):
            return Response({"error": "Quantity must be an integer"}, status=400)

        if next_quantity < 0:
            return Response({"error": "Quantity must be zero or greater"}, status=400)

        try:
            with transaction.atomic():
                selected_menu_item = (
                    MenuItem.objects.select_for_update()
                    .select_related("item", "menu")
                    .get(id=menu_item_id, menu=menu)
                )
                duplicate_menu_items = list(
                    MenuItem.objects.select_for_update()
                    .filter(menu=menu, item=selected_menu_item.item)
                    .order_by("id")
                )
                menu_item = duplicate_menu_items[0]
                item = Item.objects.select_for_update().get(id=selected_menu_item.item_id)
                previous_quantity = sum(current_menu_item.quantity for current_menu_item in duplicate_menu_items)
                difference = next_quantity - previous_quantity

                if difference == 0:
                    return Response(MenuSerializer(menu, context={"request": request}).data, status=200)

                if difference > 0 and item.stock < difference:
                    return Response({"error": "Not enough stock"}, status=400)

                if difference > 0:
                    item.stock = F("stock") - difference
                    action = MenuMovement.Action.QUANTITY_UPDATED
                    movement_quantity = difference
                    details = (
                        f"Increased {item.name} in {menu.name} from "
                        f"{previous_quantity} to {next_quantity}"
                    )
                else:
                    returned_quantity = abs(difference)
                    item.stock = F("stock") + returned_quantity
                    action = (
                        MenuMovement.Action.ITEM_REMOVED
                        if next_quantity == 0
                        else MenuMovement.Action.QUANTITY_UPDATED
                    )
                    movement_quantity = returned_quantity
                    details = (
                        f"Returned {returned_quantity} units of {item.name} from "
                        f"{menu.name} to inventory"
                    )

                item.save(update_fields=["stock"])
                item.refresh_from_db()

                if next_quantity == 0:
                    MenuItem.objects.filter(id__in=[current_menu_item.id for current_menu_item in duplicate_menu_items]).delete()
                    movement_menu_item = None
                else:
                    menu_item.quantity = next_quantity
                    menu_item.save(update_fields=["quantity"])
                    if len(duplicate_menu_items) > 1:
                        MenuItem.objects.filter(
                            id__in=[current_menu_item.id for current_menu_item in duplicate_menu_items[1:]]
                        ).delete()
                    movement_menu_item = menu_item

                MenuMovement.objects.create(
                    menu=menu,
                    item=item,
                    menu_item=movement_menu_item,
                    performed_by=request.user if request.user.is_authenticated else None,
                    action=action,
                    quantity=movement_quantity,
                    previous_quantity=previous_quantity,
                    details=details,
                )
        except MenuItem.DoesNotExist:
            return Response({"error": "Menu item not found"}, status=404)

        menu = Menu.objects.get(id=menu.id)
        return Response(MenuSerializer(menu, context={"request": request}).data, status=200)

class MenuMovements(APIView):
    permission_classes = [IsEmailVerified]
    def get(self, request, menu_id):
        menu = get_object_or_404(
            Menu.objects.select_related("pyme"),
            id=menu_id,
            pyme__owner=request.user,
        )

        movements = MenuMovement.objects.filter(menu=menu)
        serializer = MenuMovementSerializer(movements, many=True)
        return Response(serializer.data)
