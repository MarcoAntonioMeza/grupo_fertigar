from django.conf import settings
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.shortcuts import render


def allauth_settings(request):
    """Expose some settings from django-allauth in templates."""
    return {
        "ACCOUNT_ALLOW_REGISTRATION": settings.ACCOUNT_ALLOW_REGISTRATION,
    }


def listado_modulos(request):
    modulos = [
         {
            "is_main": True,
            "nombre": "PRODUCTOS",
            "url": "crm_producto_index",
            "app": "crm",
            "permiso": "can_view_producto",
            "icono": "fe-gift",  # Alternativas: fe-user-plus, fe-briefcase, fe-credit-card
            "submodulos": [],
        },
         {
            "is_main": True,
            "nombre": "PROVEEDORES",
            "url": "crm_proveedor_index",
            "app": "crm",
            "permiso": "can_view_proveedor",
            "icono": "fe-package",  # Alternativas: fe-user-plus, fe-briefcase, fe-credit-card
            "submodulos": [],
        },
        {
            "is_main": True,
            "nombre": "ALMACENES",
            "url": "crm_almacen_index",
            "app": "crm",
            "permiso": "can_view_almacen",
            "icono": "fe-layers",  # Alternativas: fe-user-plus, fe-briefcase, fe-credit-card
            "submodulos": [],
        },
        {
            "is_main": True,
            "nombre": "CLIENTES",
            "url": "crm_cliente_index",
            "app": "crm",
            "permiso": "can_view_cliente",
            "icono": "fe-user-plus",  # Alternativas: fe-user-plus, fe-briefcase, fe-credit-card
            "submodulos": [],
        },
        # =====================================
        #   CONFIGURACIONES DEL SISTEMA
        # =====================================
        {
            "is_main": False,
            "nombre": "CONFIGURACIóN",
            "url": "user_index",
            "app": "user",
            "icono": "fe-settings",  # Alternativas: fe-sliders, fe-tool, fe-server
            "submodulos": [
                # =====================================
                #  SUBMÓDULO DE USUARIOS
                # =====================================
                {
                    "app": "users",
                    "nombre": "Usuarios",
                    "permiso": "can_view_user",
                    "url": "user_index",
                    "icono": "fe-user-check",  # Alternativas: fe-users, fe-user-check
                },
                # =====================================
                #  SUBMÓDULO DE GRUPOS
                # =====================================
                {
                    "app": "auth",
                    "nombre": "Grupos de permisos",
                    "permiso": "can_view_grupo",
                    "url": "grupos_index",
                    "icono": "fe-lock",  # Alternativas: fe-user-plus, fe-lock
                },
            ],
        },
    ]

    if request.user.is_authenticated:
        # print( request.user.get_all_permissions(),'permisos')
        permisos_usuario = request.user.get_all_permissions()
        # print(permisos_usuario,'permisos')
        modulos_accesibles = []

        for modulo in modulos:
            if modulo["is_main"]:
                if f'{modulo["app"]}.{modulo["permiso"]}' in permisos_usuario:
                    modulos_accesibles.append(modulo)

                continue

            modulos_acc = {
                "is_main": modulo["is_main"],
                "nombre": modulo["nombre"],
                "url": modulo["url"],
                "icono": modulo["icono"],  # Incluir el ícono del módulo
                "submodulos": [],
            }
            for submodulo in modulo["submodulos"]:
                if f'{submodulo["app"]}.{submodulo["permiso"]}' in permisos_usuario:
                    modulos_acc["submodulos"].append(submodulo)

            if modulos_acc["submodulos"]:
                modulos_accesibles.append(modulos_acc)
        # print(modulos_accesibles, "modulos_accesibles")

        return {"modulos_accesibles": modulos_accesibles}

    return {"modulos_accesibles": []}
