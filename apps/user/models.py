from django.utils import timezone

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

import random
import uuid
# Create your models here.
def generate_code():
    return str(random.randint(100000, 999999))

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number =models.IntegerField(blank=True,null=True)
    profile_pic = models.TextField(blank=True)
    is_admin = models.BooleanField(default=False)
    is_mod = models.BooleanField(default=False)
    is_mentor = models.BooleanField(default=False)
    is_pyme_owner = models.BooleanField(default=False)
    code = models.CharField(max_length=6, blank=True, null=True, default=generate_code)
    is_email_verified = models.BooleanField(default=False)
    code_expires_at = models.DateTimeField(blank=True, null=True,default=timezone.now() + timezone.timedelta(minutes=30))

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
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_posts",
    )
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now=True)
