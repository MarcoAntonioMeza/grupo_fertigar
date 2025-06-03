from django.apps import AppConfig


class DireccionConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'main.direccion'

    def ready(self):
        import main.direccion.signals  # Importar las señales de la aplicación correcta