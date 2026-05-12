from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from globals.permissions import IsEmailVerified

from apps.pyme.models import Pyme

from .models import MonthlySales, MostSeenProducts, MostSoldCategories, MostSoldProducts
from .serializers import PymeMetricsSerializer
from .services import ensure_pyme_metrics, refresh_pyme_metrics


class PymeMetricsView(APIView):
    permission_classes = [IsEmailVerified]

    def get_object(self, request, pyme_id):
        try:
            pyme = Pyme.objects.select_related("owner").get(id=pyme_id)
        except Pyme.DoesNotExist:
            return None, Response(
                {"error": "Pyme not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if pyme.owner != request.user:
            return None, Response(
                {"error": "You do not have permission to access this pyme metrics."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return pyme, None

    def get(self, request, pyme_id, *args, **kwargs):
        pyme, error_response = self.get_object(request, pyme_id)
        if error_response:
            return error_response

        if request.query_params.get("refresh") == "true":
            refresh_pyme_metrics(pyme)
        else:
            ensure_pyme_metrics(pyme)

        serializer = PymeMetricsSerializer(
            {
                "pyme": pyme.id,
                "monthly_sales": MonthlySales.objects.filter(pyme=pyme).order_by("-month"),
                "most_sold_products": MostSoldProducts.objects.filter(pyme=pyme).order_by(
                    "-quantity_sold",
                    "-profit",
                    "product_name",
                ),
                "most_seen_products": MostSeenProducts.objects.filter(pyme=pyme).order_by(
                    "-views",
                    "product_name",
                ),
                "most_sold_categories": MostSoldCategories.objects.filter(pyme=pyme).order_by(
                    "-quantity_sold",
                    "-profit",
                    "category_name",
                ),
            }
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
