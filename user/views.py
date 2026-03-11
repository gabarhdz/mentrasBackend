from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import ForumSerializer
from .models import Forum
# Create your views here.
class AllForums(APIView):
    def post(self,request,*args,**kwargs):
        serializer = ForumSerializer(data = request.data, context={'request':request})
        return ForumSerializer(Forum,context={'request':request}).data