from django.apps import AppConfig


class ToolsConfig(AppConfig):
    name = 'apps.tools'

    def ready(self):
        from . import signals  # noqa: F401
