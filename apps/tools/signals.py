from django.db.models.signals import post_delete, post_save, pre_save
from django.dispatch import receiver

from apps.pyme.models import Order, Product, ProductOrder, Pyme

from .services import (
    refresh_pyme_metrics,
    refresh_sales_metrics_for_pyme,
    refresh_view_metrics_for_pyme,
    sync_product_view_metric,
)


@receiver(post_save, sender=Pyme)
def sync_pyme_metrics(sender, instance, **kwargs):
    refresh_pyme_metrics(instance)


@receiver(pre_save, sender=Product)
def track_previous_product_pyme(sender, instance, **kwargs):
    if not instance.pk:
        return

    previous_state = Product.objects.filter(id=instance.id).values("pyme_id").first()
    instance._previous_pyme_id = previous_state["pyme_id"] if previous_state else None


@receiver(post_save, sender=Product)
def sync_product_metrics(sender, instance, update_fields=None, **kwargs):
    metric_only_update_fields = {"get_requests_count", "get_requests_count_reset_at"}
    if update_fields and set(update_fields).issubset(metric_only_update_fields):
        sync_product_view_metric(instance)
        return

    refresh_sales_metrics_for_pyme(instance.pyme)
    refresh_view_metrics_for_pyme(instance.pyme)
    _refresh_previous_pyme_metrics(getattr(instance, "_previous_pyme_id", None), instance.pyme_id)


@receiver(post_delete, sender=Product)
def sync_deleted_product_metrics(sender, instance, **kwargs):
    refresh_sales_metrics_for_pyme(instance.pyme)
    refresh_view_metrics_for_pyme(instance.pyme)


@receiver(pre_save, sender=Order)
def track_previous_order_pyme(sender, instance, **kwargs):
    if not instance.pk:
        return

    previous_state = Order.objects.filter(id=instance.id).select_related("product__pyme").first()
    instance._previous_pyme_id = previous_state.product.pyme_id if previous_state else None


@receiver(post_save, sender=Order)
def sync_order_metrics(sender, instance, **kwargs):
    refresh_sales_metrics_for_pyme(instance.product.pyme)
    _refresh_previous_pyme_metrics(getattr(instance, "_previous_pyme_id", None), instance.product.pyme_id)


@receiver(post_delete, sender=Order)
def sync_deleted_order_metrics(sender, instance, **kwargs):
    refresh_sales_metrics_for_pyme(instance.product.pyme)


@receiver(pre_save, sender=ProductOrder)
def track_previous_product_order_pyme(sender, instance, **kwargs):
    if not instance.pk:
        return

    previous_state = ProductOrder.objects.filter(id=instance.id).select_related("product__pyme").first()
    instance._previous_pyme_id = previous_state.product.pyme_id if previous_state else None


@receiver(post_save, sender=ProductOrder)
def sync_product_order_metrics(sender, instance, **kwargs):
    refresh_sales_metrics_for_pyme(instance.product.pyme)
    _refresh_previous_pyme_metrics(getattr(instance, "_previous_pyme_id", None), instance.product.pyme_id)


@receiver(post_delete, sender=ProductOrder)
def sync_deleted_product_order_metrics(sender, instance, **kwargs):
    refresh_sales_metrics_for_pyme(instance.product.pyme)


def _refresh_previous_pyme_metrics(previous_pyme_id, current_pyme_id):
    if not previous_pyme_id or previous_pyme_id == current_pyme_id:
        return

    previous_pyme = Pyme.objects.filter(id=previous_pyme_id).first()
    if previous_pyme:
        refresh_sales_metrics_for_pyme(previous_pyme)
        refresh_view_metrics_for_pyme(previous_pyme)

