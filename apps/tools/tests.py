from datetime import datetime

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from apps.pyme.models import Category, Order, Product, Pyme

from .models import MonthlySales, MostSeenProducts, MostSoldCategories, MostSoldProducts


class ToolsMetricsSignalsTests(TestCase):
    def setUp(self):
        self.owner = get_user_model().objects.create_user(
            username="metricowner",
            email="metricowner@example.com",
            password="StrongPass123",
            is_pyme_owner=True,
            is_email_verified=True,
        )
        self.customer = get_user_model().objects.create_user(
            username="metriccustomer",
            email="metriccustomer@example.com",
            password="StrongPass123",
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
        self.product = Product.objects.create(
            name="Cafe especial",
            description="Producto para metricas",
            price="15.00",
            pyme=self.pyme,
        )

    def test_order_creation_refreshes_sales_metrics_automatically(self):
        order_date = timezone.make_aware(datetime(2026, 5, 10, 14, 30, 0))

        Order.objects.create(
            product=self.product,
            quantity=3,
            total_price="45.00",
            customer=self.customer,
            created_at=order_date,
        )

        monthly_sales = MonthlySales.objects.get(pyme=self.pyme, month="2026-05")
        most_sold_product = MostSoldProducts.objects.get(
            pyme=self.pyme,
            product_name=self.product.name,
        )
        most_sold_category = MostSoldCategories.objects.get(
            pyme=self.pyme,
            category_name=self.category.name,
        )

        self.assertEqual(monthly_sales.sales, 45.0)
        self.assertEqual(most_sold_product.quantity_sold, 3)
        self.assertEqual(most_sold_product.profit, 45.0)
        self.assertEqual(most_sold_category.quantity_sold, 3)
        self.assertEqual(most_sold_category.profit, 45.0)

    def test_view_counter_update_refreshes_seen_metrics(self):
        self.product.get_requests_count = 7
        self.product.save(update_fields=["get_requests_count"])

        most_seen_product = MostSeenProducts.objects.get(
            pyme=self.pyme,
            product_name=self.product.name,
        )

        self.assertEqual(most_seen_product.views, 7)


class ToolsMetricsViewsTests(APITestCase):
    def setUp(self):
        self.owner = get_user_model().objects.create_user(
            username="verifiedmetricowner",
            email="verifiedmetricowner@example.com",
            password="StrongPass123",
            is_pyme_owner=True,
            is_email_verified=True,
        )
        self.other_user = get_user_model().objects.create_user(
            username="anotherowner",
            email="anotherowner@example.com",
            password="StrongPass123",
            is_pyme_owner=True,
            is_email_verified=True,
        )
        self.customer = get_user_model().objects.create_user(
            username="metricbuyer",
            email="metricbuyer@example.com",
            password="StrongPass123",
            is_email_verified=True,
        )
        self.category = Category.objects.create(name="Bebidas")
        self.pyme = Pyme.objects.create(
            name="Metrics Cafe",
            description="Cafe de prueba",
            owner=self.owner,
            category=self.category,
            foundation_date="2023-07-01",
        )
        self.product = Product.objects.create(
            name="Cold Brew",
            description="Bebida fria",
            price="12.50",
            pyme=self.pyme,
            get_requests_count=1,
        )

    def test_metrics_view_returns_precomputed_metrics_for_pyme(self):
        self.client.force_authenticate(user=self.owner)
        Order.objects.create(
            product=self.product,
            quantity=2,
            total_price="25.00",
            customer=self.customer,
            created_at=timezone.make_aware(datetime(2026, 5, 11, 9, 0, 0)),
        )
        self.product.get_requests_count = 4
        self.product.save(update_fields=["get_requests_count"])

        response = self.client.get(reverse("pyme-metrics", args=[self.pyme.id]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["pyme"], str(self.pyme.id))
        self.assertEqual(response.data["monthly_sales"][0]["month"], "2026-05")
        self.assertEqual(response.data["monthly_sales"][0]["sales"], 25.0)
        self.assertEqual(response.data["most_sold_products"][0]["product_name"], "Cold Brew")
        self.assertEqual(response.data["most_sold_products"][0]["quantity_sold"], 2)
        self.assertEqual(response.data["most_seen_products"][0]["product_name"], "Cold Brew")
        self.assertEqual(response.data["most_seen_products"][0]["views"], 4)
        self.assertEqual(response.data["most_sold_categories"][0]["category_name"], "Bebidas")

    def test_metrics_view_blocks_non_owner(self):
        self.client.force_authenticate(user=self.other_user)

        response = self.client.get(reverse("pyme-metrics", args=[self.pyme.id]))

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_metrics_view_refresh_query_rebuilds_missing_cache(self):
        self.client.force_authenticate(user=self.owner)
        Order.objects.create(
            product=self.product,
            quantity=1,
            total_price="12.50",
            customer=self.customer,
            created_at=timezone.make_aware(datetime(2026, 5, 11, 9, 0, 0)),
        )

        MonthlySales.objects.filter(pyme=self.pyme).delete()
        MostSoldProducts.objects.filter(pyme=self.pyme).delete()
        MostSeenProducts.objects.filter(pyme=self.pyme).delete()
        MostSoldCategories.objects.filter(pyme=self.pyme).delete()

        response = self.client.get(reverse("pyme-metrics", args=[self.pyme.id]) + "?refresh=true")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["monthly_sales"][0]["sales"], 12.5)

