from venv import logger

from django.shortcuts import render
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ForumSerializer,UserSerializer
from .models import Forum,User
# Create your views here.

class AllUsers(APIView):
    def get(self,request,*args,**kwargs):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)
    def post(self,request,*args,**kwargs):
        try:
            serializer = UserSerializer(data=request.data, context={'request': request})
            
            if serializer.is_valid():
                user = serializer.save()
                response_serializer = UserSerializer(user, context={'request': request})
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Error creating user: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserDetail(APIView):

    def get(self,request,id,*args,**kwargs):
        try: 
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({'error':'User not found'},status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user,context={'request':request}) 
        return Response(serializer.data,status=status.HTTP_200_OK)
    def patch(self, request, id, *args, **kwargs):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserSerializer(
            user,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        if serializer.is_valid():
            updated_user = serializer.save()
            return Response(
                UserSerializer(updated_user, context={'request': request}).data,
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def delete(self,request,id,*args,**kwargs):
        id = request.user.id
        user = User.objects.get(id=id)
        if id == user.id:
            Response({"Error":"You can not delete an user that is not you"},status=status.HTTP_403_FORBIDDEN)
        user.delete()
        Response({"Status":"User deleted succesfully"})



class AllForums(APIView):
    def get(self,request,*args,**kwargs):
        forums = Forum.objects.all()
        serializer = ForumSerializer(forums, many=True,context={'request':request})
        return Response(serializer.data,status=200)
    
    def post(self,request,*args,**kwargs):
        serializer = ForumSerializer(data = request.data, context={'request':request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors)
