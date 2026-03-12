from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid
# Create your models here.

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number =models.IntegerField(blank=True,null=True)
    profile_pic = models.TextField(blank=True)
    is_admin = models.BooleanField(default=False)
    is_mod = models.BooleanField(default=False)
    is_mentor = models.BooleanField(default=False)
    is_pyme_owner = models.BooleanField(default=False)

class Forum(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.TextField(max_length=30,blank=False,null=False)
    description = models.TextField(max_length=500,blank=False,null=False)
    users = models.ManyToManyField(settings.AUTH_USER_MODEL,blank=True)
    created_at = models.DateTimeField(auto_now=True)

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=80)
    content = models.TextField(max_length = 350)
    user = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now=True)