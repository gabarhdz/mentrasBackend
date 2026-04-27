
import logging
import os

from django.conf import settings
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from google.oauth2 import id_token
from google.auth.transport import requests
from google.auth.exceptions import GoogleAuthError
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import UserSerializer
from .models import Forum,User,generate_code
from globals.get_tokens import get_tokens_for_user
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView

logger = logging.getLogger(__name__)

# Create your views here.

class AllUsers(APIView):
    permission_classes=[AllowAny]
    def get(self,request,*args,**kwargs):
        users = User.objects.all()
        serializer = UserSerializer(users, many=True, context={'request': request})
        return Response(serializer.data)
    def post(self,request,*args,**kwargs):
        try:
            serializer = UserSerializer(data=request.data, context={'request': request})

            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                user = serializer.save()

                email = EmailMultiAlternatives(
                    subject="verification code",
                    body=f"Hello {user.username}, your activation code is: {user.code}",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[user.email],
                )

                email.attach_alternative(
                    f"<h1>Hello {user.username}, your code is: {user.code}!</h1>",
                    "text/html"
                )

                email.send(fail_silently=False)

            response_serializer = UserSerializer(user, context={'request': request})
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Error creating user: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserDetail(APIView):
    permission_classes = [IsAuthenticated]
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
        if not request.user or not request.user.is_authenticated:
            return Response(
                {"error": "Authentication required"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if str(request.user.id) != str(id):
            return Response(
                {"error": "You can only delete your own user"},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        user.delete()
        return Response({"status": "User deleted successfully"}, status=status.HTTP_200_OK)




class ActivateEmail(APIView):
    def post(self,request,id,*args,**kwargs):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({'error':'User not found'},status=status.HTTP_404_NOT_FOUND)
        
        if request.data['code'] == user.code and timezone.now() <= user.code_expires_at:
            user.is_email_verified = True
            user.save()
            return Response({'status':'Email verified successfully'},status=status.HTTP_200_OK)
        else:
            return Response({'error':'Invalid verification code or code expired'},status=status.HTTP_400_BAD_REQUEST)

class ResendCode(APIView):
    def post(self,request,id,*args,**kwargs):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({'error':'User not found'},status=status.HTTP_404_NOT_FOUND)
        
        user.code = generate_code()
        user.code_expires_at = timezone.now() + timezone.timedelta(minutes=30)
        user.save()

        email = EmailMultiAlternatives(
            subject="verification code",
            body=f"Hello {user.username}, your activation code is: {user.code}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user.email],
        )

        email.attach_alternative(
            f"<h1>Hello {user.username}, your code is: {user.code}!</h1>",
            "text/html"
        )

        email.send(fail_silently=False)

        return Response({'status':'Verification code resent successfully'},status=status.HTTP_200_OK)
      
class GoogleLogin(SocialLoginView):
    permission_classes = [AllowAny]
    adapter_class = GoogleOAuth2Adapter
    callback_url = "http://127.0.0.1:8000/api/accounts/google/login/callback/"
    client_class = OAuth2Client

    def post(self, request, *args, **kwargs):
        google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        token_from_frontend = (
            request.data.get("credential")
            or request.data.get("id_token")
            or request.data.get("access_token")
            or request.data.get("token")
        )

        if not google_client_id:
            logger.error("GOOGLE_CLIENT_ID is not configured")
            return Response(
                {"error": "Google login is not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        if not token_from_frontend:
            return Response(
                {
                    "error": (
                        "Google token not provided. Send one of: "
                        "credential, id_token, access_token, or token."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            idinfo = id_token.verify_oauth2_token(
                token_from_frontend,
                requests.Request(),
                google_client_id,
            )
        except ValueError:
            return Response(
                {"error": "Invalid Google token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except GoogleAuthError as exc:
            logger.warning("Google auth error during login: %s", exc)
            return Response(
                {"error": "Unable to verify Google token"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as exc:
            logger.exception("Unexpected Google login error: %s", exc)
            return Response(
                {"error": "Unexpected error during Google login"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        email = idinfo.get("email")
        name = idinfo.get("name")

        if not email:
            return Response(
                {"error": "Google token does not contain an email"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email,
                "first_name": name or "",
            }
        )
        tokens = get_tokens_for_user(user)

        return Response(
            {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "username": user.username,
                },
                "tokens": tokens,
                "created": created,
            },
            status=status.HTTP_200_OK,
        )
