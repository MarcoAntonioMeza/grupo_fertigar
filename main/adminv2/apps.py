from django.apps import AppConfig


class Adminv2Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'main.adminv2'

    def ready(self):
        import main.adminv2.signals.grupos