from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.pyme.models import Category, Pyme

from .models import MonthlySales, MostSeenProducts, MostSoldCategories, MostSoldProducts


class ToolsMetricsModelsTests(TestCase):
    def setUp(self):
        self.owner = get_user_model().objects.create_user(
            username="metricowner",
            email="metricowner@example.com",
            password="StrongPass123",
            is_pyme_owner=True,
            is_email_verified=True,
        )
        self.category = Category.objects.create(name="Servicios")
        self.pyme = Pyme.objects.create(
            name="Pyme Metrics",
            description="Pyme para pruebas de metricas",
            owner=self.owner,
            category=self.category,
            foundation_date="2024-01-01",
        )

    def test_all_metrics_can_be_related_to_a_pyme(self):
        monthly_sales = MonthlySales.objects.create(
            month="May",
            sales=1500.0,
            pyme=self.pyme,
        )
        most_sold_product = MostSoldProducts.objects.create(
            product_name="Cafe especial",
            quantity_sold=42,
            profit=320.5,
            pyme=self.pyme,
        )
        most_seen_product = MostSeenProducts.objects.create(
            product_name="Cafe frio",
            views=87,
            pyme=self.pyme,
        )
        most_sold_category = MostSoldCategories.objects.create(
            category_name="Bebidas",
            quantity_sold=61,
            profit=500.0,
            pyme=self.pyme,
        )

        self.assertEqual(monthly_sales.pyme, self.pyme)
        self.assertEqual(most_sold_product.pyme, self.pyme)
        self.assertEqual(most_seen_product.pyme, self.pyme)
        self.assertEqual(most_sold_category.pyme, self.pyme)
