from collections import defaultdict

from django.db import migrations


def backfill_pyme_metrics(apps, schema_editor):
    Pyme = apps.get_model("pyme", "Pyme")
    Product = apps.get_model("pyme", "Product")
    Order = apps.get_model("pyme", "Order")
    ProductOrder = apps.get_model("pyme", "ProductOrder")
    MonthlySales = apps.get_model("tools", "MonthlySales")
    MostSeenProducts = apps.get_model("tools", "MostSeenProducts")
    MostSoldProducts = apps.get_model("tools", "MostSoldProducts")
    MostSoldCategories = apps.get_model("tools", "MostSoldCategories")

    for pyme in Pyme.objects.select_related("category").all().iterator():
        monthly_sales = defaultdict(float)
        sold_products = defaultdict(lambda: {"quantity_sold": 0, "profit": 0.0})
        sold_categories = defaultdict(lambda: {"quantity_sold": 0, "profit": 0.0})
        views_by_product_name = defaultdict(int)
        category_name = pyme.category.name if pyme.category_id and pyme.category else "Uncategorized"

        product_orders = list(
            ProductOrder.objects.filter(product__pyme_id=pyme.id)
            .select_related("order", "product")
        )
        product_order_ids = {product_order.order_id for product_order in product_orders}
        standalone_orders = list(
            Order.objects.filter(product__pyme_id=pyme.id)
            .exclude(id__in=product_order_ids)
            .select_related("product")
        )

        for sale in product_orders:
            month_key = sale.order.created_at.strftime("%Y-%m")
            profit = float(sale.total_price)
            monthly_sales[month_key] += profit
            sold_products[sale.product.name]["quantity_sold"] += sale.quantity
            sold_products[sale.product.name]["profit"] += profit
            sold_categories[category_name]["quantity_sold"] += sale.quantity
            sold_categories[category_name]["profit"] += profit

        for sale in standalone_orders:
            month_key = sale.created_at.strftime("%Y-%m")
            profit = float(sale.total_price)
            monthly_sales[month_key] += profit
            sold_products[sale.product.name]["quantity_sold"] += sale.quantity
            sold_products[sale.product.name]["profit"] += profit
            sold_categories[category_name]["quantity_sold"] += sale.quantity
            sold_categories[category_name]["profit"] += profit

        for product_name, get_requests_count in Product.objects.filter(pyme_id=pyme.id).values_list(
            "name",
            "get_requests_count",
        ):
            views_by_product_name[product_name] += get_requests_count

        MonthlySales.objects.filter(pyme_id=pyme.id).delete()
        MostSoldProducts.objects.filter(pyme_id=pyme.id).delete()
        MostSeenProducts.objects.filter(pyme_id=pyme.id).delete()
        MostSoldCategories.objects.filter(pyme_id=pyme.id).delete()

        MonthlySales.objects.bulk_create(
            [
                MonthlySales(pyme_id=pyme.id, month=month, sales=total_sales)
                for month, total_sales in sorted(monthly_sales.items())
            ]
        )
        MostSoldProducts.objects.bulk_create(
            [
                MostSoldProducts(
                    pyme_id=pyme.id,
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
        MostSeenProducts.objects.bulk_create(
            [
                MostSeenProducts(
                    pyme_id=pyme.id,
                    product_name=product_name,
                    views=views,
                )
                for product_name, views in sorted(
                    views_by_product_name.items(),
                    key=lambda item: (-item[1], item[0]),
                )
            ]
        )
        MostSoldCategories.objects.bulk_create(
            [
                MostSoldCategories(
                    pyme_id=pyme.id,
                    category_name=current_category_name,
                    quantity_sold=values["quantity_sold"],
                    profit=values["profit"],
                )
                for current_category_name, values in sorted(
                    sold_categories.items(),
                    key=lambda item: (-item[1]["quantity_sold"], -item[1]["profit"], item[0]),
                )
            ]
        )


class Migration(migrations.Migration):

    dependencies = [
        ("pyme", "0003_order_created_at"),
        ("tools", "0002_monthlysales_pyme_mostseenproducts_pyme_and_more"),
    ]

    operations = [
        migrations.RunPython(backfill_pyme_metrics, migrations.RunPython.noop),
    ]
