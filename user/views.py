from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ForumSerializer
from .models import Forum
# Create your views here.
class AllForums(APIView):
    def get(self,request,*args,**kwargs):
        forum = Forum.objects.all()
        serializer = ForumSerializer(forum,context={'request':request})
        return Response(serializer.data,status=200)
    
    def post(self,request,*args,**kwargs):
        serializer = ForumSerializer(data = request.data, context={'request':request})
        return Response(serializer.data,status=201)