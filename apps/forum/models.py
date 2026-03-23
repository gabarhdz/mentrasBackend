from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import uuid
import json
# Create your models here.

def validate_post_images(value: str) -> None:
    if value in (None, ""):
        return

    try:
        parsed = json.loads(value)
    except Exception as exc:
        raise ValidationError("images must be valid JSON.") from exc

    if not isinstance(parsed, list):
        raise ValidationError("images must be a JSON array.")

    if len(parsed) > 4:
        raise ValidationError("images must contain at most 4 items.")

    for item in parsed:
        if not isinstance(item, str) or not item.strip():
            raise ValidationError("Each image must be a non-empty string.")

class Forum(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=30,unique=True,blank=False,null=False)
    description = models.TextField(max_length=250,unique=False,blank=False,null=False)
    profile_pic = models.TextField(blank=True)
    is_private = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now=True)

class ForumUser(models.Model):
    forum = models.ForeignKey(Forum,on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    
class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=100)
    text = models.TextField(max_length= 2000)
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE)
    images = models.TextField(blank=True, default="[]", validators=[validate_post_images])
    created_at = models.DateTimeField(auto_now=True)
    
