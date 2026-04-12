from rest_framework.views import APIView
from rest_framework.response import Response

from apps.stock.models import Item
from apps.stock.serializers import ItemSerializer


class AllItems(APIView):
    def get(self, request):
        items = Item.objects.all()
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)
