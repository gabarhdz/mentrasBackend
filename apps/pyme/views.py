from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from globals.permissions import IsEmailVerified

from .models import Pyme
from .serializers import PymeSerializer


class AccountPymes(APIView):
    permission_classes = [IsEmailVerified]

    def get(self, request, *args, **kwargs):
        pymes = Pyme.objects.filter(owner=request.user).order_by("-access_date")
        serializer = PymeSerializer(pymes, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        if not request.user.is_pyme_owner:
            return Response(
                {"error": "Your account is not allowed to create pymes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = PymeSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            pyme = serializer.save(owner=request.user)
            return Response(
                PymeSerializer(pyme, context={"request": request}).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PymeDetail(APIView):
    permission_classes = [IsEmailVerified]

    def get_object(self, request, id):
        try:
            pyme = Pyme.objects.get(id=id)
        except Pyme.DoesNotExist:
            return None, Response(
                {"error": "Pyme not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        if pyme.owner != request.user:
            return None, Response(
                {"error": "You do not have permission to access this pyme."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return pyme, None

    def get(self, request, id, *args, **kwargs):
        pyme, error_response = self.get_object(request, id)
        if error_response:
            return error_response

        serializer = PymeSerializer(pyme, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, id, *args, **kwargs):
        try:
            pyme = Pyme.objects.get(id=id)
        except Pyme.DoesNotExist:
            return Response(
                {"error": "Pyme not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PymeSerializer(
            pyme,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        if serializer.is_valid():
            updated_pyme = serializer.save()
            return Response(
                PymeSerializer(updated_pyme, context={"request": request}).data,
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):
        try:
            pyme = Pyme.objects.get(id=id)
        except Pyme.DoesNotExist:
            return Response(
                {"error": "Pyme not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        if pyme.owner != request.user:
            return Response(
                {"error": "You do not have permission to delete this pyme."},
                status=status.HTTP_403_FORBIDDEN,
            )
        pyme, error_response = self.get_object(request, id)
        if error_response:
            return error_response

        pyme.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
