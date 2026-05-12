from rest_framework import serializers

from .models import MonthlySales, MostSeenProducts, MostSoldCategories, MostSoldProducts


class MonthlySalesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlySales
        fields = ["month", "sales"]


class MostSoldProductsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MostSoldProducts
        fields = ["product_name", "quantity_sold", "profit"]


class MostSeenProductsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MostSeenProducts
        fields = ["product_name", "views"]


class MostSoldCategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = MostSoldCategories
        fields = ["category_name", "quantity_sold", "profit"]


class PymeMetricsSerializer(serializers.Serializer):
    pyme = serializers.UUIDField()
    monthly_sales = MonthlySalesSerializer(many=True)
    most_sold_products = MostSoldProductsSerializer(many=True)
    most_seen_products = MostSeenProductsSerializer(many=True)
    most_sold_categories = MostSoldCategoriesSerializer(many=True)

