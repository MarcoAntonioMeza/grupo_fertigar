from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.contrib.auth.models import Group


@receiver(post_migrate)
def crear_permisos_personalizados(sender, **kwargs):
    content_type = ContentType.objects.get_for_model(Group)
    permisos = [
        ("can_view_grupo", "VER GRUPO"),
        ("can_update_grupo", "ACTUALIZAR GRUPO"),
        ("can_create_grupo", "CREAR GRUPO"),
        ("can_delete_grupo", "ELIMINAR GRUPO"),
    ]
    for codename, name in permisos:
        permiso, created = Permission.objects.get_or_create(
            codename=codename,
            name=name,
            content_type=content_type,
        )
        if created:
            print(f"Permiso '{name}' creado automáticamente.")
