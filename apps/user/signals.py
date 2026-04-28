from allauth.socialaccount.models import SocialAccount
from allauth.account.signals import user_signed_up
from django.dispatch import receiver
from django.utils.text import slugify

from .models import User


def build_social_username(name, email, current_user_id=None):
    base_username = slugify(name or "") or email.split("@")[0]
    username = base_username
    suffix = 1

    while User.objects.filter(username=username).exclude(id=current_user_id).exists():
        username = f"{base_username}{suffix}"
        suffix += 1

    return username


@receiver(user_signed_up, sender=User)
def user_signed_up_handler(request, user, **kwargs):
    social_account = SocialAccount.objects.filter(user=user, provider="google").first()
    if social_account:
        extras = social_account.extra_data
        email = extras.get("email", user.email or "")
        display_name = extras.get("name") or extras.get("given_name", "")
        picture = extras.get("picture", "")

        user.username = build_social_username(display_name, email, user.id)
        user.first_name = display_name
        if picture:
            user.profile_pic = picture
        user.is_email_verified = True

        user.save(update_fields=["username", "first_name", "profile_pic", "is_email_verified"])
