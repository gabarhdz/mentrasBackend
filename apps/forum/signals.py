from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Forum, ForumUser


@receiver(post_save, sender=Forum)
def create_forum_creator_membership(sender, instance, created, **kwargs):
    if created and instance.created_by_id:
        ForumUser.objects.get_or_create(
            forum=instance,
            user=instance.created_by,
            defaults={'isAdmin': True},
        )
