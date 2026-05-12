from collections import defaultdict

from django.db import transaction

from apps.pyme.models import Order, Product, ProductOrder, Pyme

from .models import MonthlySales, MostSeenProducts, MostSoldCategories, MostSoldProducts


def refresh_pyme_metrics(pyme: Pyme) -> None:
    refresh_sales_metrics_for_pyme(pyme)
    refresh_view_metrics_for_pyme(pyme)


def refresh_sales_metrics_for_pyme(pyme: Pyme) -> None:
    monthly_sales = defaultdict(float)
    sold_products = defaultdict(lambda: {"quantity_sold": 0, "profit": 0.0})
    sold_categories = defaultdict(lambda: {"quantity_sold": 0, "profit": 0.0})

    product_orders = list(
        ProductOrder.objects.filter(product__pyme=pyme)
        .select_related("order", "product", "product__pyme__category")
    )
    product_order_ids = {product_order.order_id for product_order in product_orders}
    standalone_orders = list(
        Order.objects.filter(product__pyme=pyme)
        .exclude(id__in=product_order_ids)
        .select_related("product", "product__pyme__category")
    )

    for sale in product_orders:
        _accumulate_sale_line(
            monthly_sales=monthly_sales,
            sold_products=sold_products,
            sold_categories=sold_categories,
            month_source=sale.order.created_at,
            product_name=sale.product.name,
            category_name=_get_category_name(pyme),
            quantity_sold=sale.quantity,
            profit=float(sale.total_price),
        )

    for sale in standalone_orders:
        _accumulate_sale_line(
            monthly_sales=monthly_sales,
            sold_products=sold_products,
            sold_categories=sold_categories,
            month_source=sale.created_at,
            product_name=sale.product.name,
            category_name=_get_category_name(pyme),
            quantity_sold=sale.quantity,
            profit=float(sale.total_price),
        )

    with transaction.atomic():
        MonthlySales.objects.filter(pyme=pyme).delete()
        MostSoldProducts.objects.filter(pyme=pyme).delete()
        MostSoldCategories.objects.filter(pyme=pyme).delete()

        MonthlySales.objects.bulk_create(
            [
                MonthlySales(pyme=pyme, month=month, sales=total_sales)
                for month, total_sales in sorted(monthly_sales.items())
            ]
        )
        MostSoldProducts.objects.bulk_create(
            [
                MostSoldProducts(
                    pyme=pyme,
                    product_name=product_name,
                    quantity_sold=values["quantity_sold"],
                    profit=values["profit"],
                )
                for product_name, values in sorted(
                    sold_products.items(),
                    key=lambda item: (-item[1]["quantity_sold"], -item[1]["profit"], item[0]),
                )
            ]
        )
        MostSoldCategories.objects.bulk_create(
            [
                MostSoldCategories(
                    pyme=pyme,
                    category_name=category_name,
                    quantity_sold=values["quantity_sold"],
                    profit=values["profit"],
                )
                for category_name, values in sorted(
                    sold_categories.items(),
                    key=lambda item: (-item[1]["quantity_sold"], -item[1]["profit"], item[0]),
                )
            ]
        )


def refresh_view_metrics_for_pyme(pyme: Pyme) -> None:
    views_by_product_name = defaultdict(int)

    for product in Product.objects.filter(pyme=pyme).only("name", "get_requests_count"):
        views_by_product_name[product.name] += product.get_requests_count

    with transaction.atomic():
        MostSeenProducts.objects.filter(pyme=pyme).delete()
        MostSeenProducts.objects.bulk_create(
            [
                MostSeenProducts(
                    pyme=pyme,
                    product_name=product_name,
                    views=views,
                )
                for product_name, views in sorted(
                    views_by_product_name.items(),
                    key=lambda item: (-item[1], item[0]),
                )
            ]
        )


def sync_product_view_metric(product: Product) -> None:
    total_views = sum(
        Product.objects.filter(pyme=product.pyme, name=product.name)
        .values_list("get_requests_count", flat=True)
    )

    with transaction.atomic():
        MostSeenProducts.objects.filter(
            pyme=product.pyme,
            product_name=product.name,
        ).delete()
        MostSeenProducts.objects.create(
            pyme=product.pyme,
            product_name=product.name,
            views=total_views,
        )


def _accumulate_sale_line(
    *,
    monthly_sales,
    sold_products,
    sold_categories,
    month_source,
    product_name: str,
    category_name: str,
    quantity_sold: int,
    profit: float,
) -> None:
    month_key = month_source.strftime("%Y-%m")
    monthly_sales[month_key] += profit
    sold_products[product_name]["quantity_sold"] += quantity_sold
    sold_products[product_name]["profit"] += profit
    sold_categories[category_name]["quantity_sold"] += quantity_sold
    sold_categories[category_name]["profit"] += profit


def _get_category_name(pyme: Pyme) -> str:
    if pyme.category and pyme.category.name:
        return pyme.category.name
    return "Uncategorized"
