from django.apps import AppConfig


class UserConfig(AppConfig):
    name = 'apps.user'

def ready():
    import apps.user.signals  # noqa