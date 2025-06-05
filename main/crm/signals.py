from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from .models import Categoria, Producto, Agente, Almacen,Cliente

@receiver(post_migrate)
def crear_permisos_personalizados(sender, **kwargs):
   
                 #permiso 
    models_str = [('categoria', 'categoria',Categoria),
                  ('producto', 'PRODUCTO',Producto),
                  ('agente', 'agente',Agente),
                  ('alamcen', 'almacen',Almacen),
                  ('cliente', 'cliente',Cliente),
                  
                  ]
   
    for model_name_permiso, model_name_str, model_class in models_str:
        content_type = ContentType.objects.get_for_model(model_class)
    
        permisos = [
            (  f"can_view_{model_name_permiso}".lower(),            f"Ver {model_name_str}".upper()),
            (f"can_update_{model_name_permiso}".lower(),     f"Actualizar {model_name_str}".upper()),
            (f"can_create_{model_name_permiso}".lower(),          f"Crear {model_name_str}".upper()),
            (  f"can_baja_{model_name_permiso}".lower(),f"Dar de baja un  {model_name_str}".upper()),
        ]
        
        for codename, name in permisos:
            permiso, created = Permission.objects.get_or_create(
                codename=codename,
                name=name,
                content_type=content_type,
            )
            if created:
                print(f"Permiso '{name}' creado automáticamente")
            else:
                print(f"Permiso '{name}' ya existe. ::)")

    
