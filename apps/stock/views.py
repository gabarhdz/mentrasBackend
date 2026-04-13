from rest_framework.views import APIView
from rest_framework.response import Response

from apps.stock.models import Item
from apps.stock.serializers import ItemSerializer

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