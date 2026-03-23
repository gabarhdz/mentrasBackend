from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.core.exceptions import ValidationError
import uuid
import json
# Create your models here.


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone_number =models.IntegerField(blank=True,null=True)
    profile_pic = models.TextField(blank=True)
    is_admin = models.BooleanField(default=False)
    is_mod = models.BooleanField(default=False)
    is_mentor = models.BooleanField(default=False)
    is_pyme_owner = models.BooleanField(default=False)

