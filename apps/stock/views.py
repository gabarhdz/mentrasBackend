from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import F
from apps.stock.models import Item, Menu, MenuMovement, MenuItem
from apps.stock.serializers import ItemSerializer, MenuSerializer, MenuItemSerializer, MenuMovementSerializer

from globals.permissions import IsEmailVerified

class AllItems(APIView):
    permission_classes = [IsEmailVerified]
    def get(self, request):
        items = Item.objects.all()
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = ItemSerializer(data=request.data)
        if serializer.is_valid():
            item = serializer.save()
            return Response(ItemSerializer(item).data, status=201)
        return Response(serializer.errors, status=400)
    
class SpecItem(APIView):
    permission_classes = [IsEmailVerified]
    def get(self, request, item_id):
        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response({"error": "Item not found"}, status=404)

        serializer = ItemSerializer(item)
        return Response(serializer.data)
    
class AllMenus(APIView):
    permission_classes = [IsEmailVerified]
    def get(self, request):
        menus = Menu.objects.all()
        serializer = MenuSerializer(menus, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = MenuSerializer(data=request.data)
        if serializer.is_valid():
            menu = serializer.save()
            return Response(MenuSerializer(menu).data, status=201)
        return Response(serializer.errors, status=400)
    
class SpecMenu(APIView):
    permission_classes = [IsEmailVerified]
    def get(self, request, menu_id):
        try:
            menu = Menu.objects.get(id=menu_id)
        except Menu.DoesNotExist:
            return Response({"error": "Menu not found"}, status=404)

        serializer = MenuSerializer(menu)
        return Response(serializer.data)

class ItemsMenu(APIView):
    permission_classes = [IsEmailVerified]
    def post(self, request, menu_id):
        try:
            menu = Menu.objects.get(id=menu_id)
            
        except Menu.DoesNotExist:
            return Response({"error": "Menu not found"}, status=404)

        payload = request.data.copy()
        payload["menu"] = menu.id
        serializer = MenuItemSerializer(data=payload)

        if serializer.is_valid():
            with transaction.atomic():
                menu_item = serializer.save()
                item = menu_item.item 
           
                if item.stock < menu_item.quantity:
                    return Response({"error": "Not enough stock"}, status=400)

                item.stock = F('stock') - menu_item.quantity
                item.save()
                item.refresh_from_db()

                MenuMovement.objects.create(
                    menu=menu,
                    item=item,
                    menu_item=menu_item,
                    performed_by=request.user if request.user.is_authenticated else None,
                    action=MenuMovement.Action.ITEM_ADDED,
                    quantity=menu_item.quantity,
                    details=f"Added {item.name} to {menu.name}",
                )

            return Response(MenuSerializer(menu).data, status=200)
        return Response(serializer.errors, status=400)

class MenuMovements(APIView):
    permission_classes = [IsEmailVerified]
    def get(self, request, menu_id):
        try:
            menu = Menu.objects.get(id=menu_id)
        except Menu.DoesNotExist:
            return Response({"error": "Menu not found"}, status=404)

        movements = MenuMovement.objects.filter(menu=menu)
        serializer = MenuMovementSerializer(movements, many=True)
        return Response(serializer.data)