from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import User  # Asegúrate de que este modelo sea el correcto

@receiver(post_migrate)
def crear_permisos_personalizados(sender, **kwargs):
    #pass
    content_type = ContentType.objects.get_for_model(User)
    permisos = [
        ("can_view_user", "VER USUARIO"),
        ("can_update_user", "ACTUALIZAR USUARIO"),
        ("can_create_user", "CREAR USUARIO"),
        ("can_delete_user", "ELIMINAR USUARIO"),
    ]
    for codename, name in permisos:
        permiso, created = Permission.objects.get_or_create(
            codename=codename,
            name=name,
            content_type=content_type,
        )
        if created:
            print(f"Permiso '{name}' creado automáticamente.")
