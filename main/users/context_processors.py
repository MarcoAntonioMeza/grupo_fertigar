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
         # =====================================
        #          GRUPOS SIN AGUPAR
        # =====================================
        {
            "is_main": True,
            "nombre": "GRUPOS",
            "url": "escolar_docente_grupo_index",
            "app": "escolar_docente",
            "permiso": "can_view_grupo_docente",
            "icono": "fa-th",
            "submodulos": [],
        },
        # =====================================
        #          ALUMNOS SIN AGUPAR
        # =====================================
        {
            "is_main": True,
            "nombre": "ALUMNOS",
            "url": "escolar_docente_alumnos_index",
            "app": "escolar_docente",
            "permiso": "can_view_alumno",
            "icono": "fa-users",
            "submodulos": [],
        },
        {
            "is_main": True,
            "nombre": "MATERIAS",
            "url": "escolar_docente_materia_index",
            "app": "escolar_docente",
            "permiso": "can_view_materia",
            "icono": "fa-book",
            "submodulos": [],
        },
        # =====================================
        #          CONFIGURACUIO ESCOLAR
        # =====================================
        {
            "is_main": False,
            "nombre": "CONFIGURACIÓN ESCOLAR",
            "url": "user_index",
            "app": "escolar",
            "icono": "fa-star",
            "submodulos": [
                {
                    "app": "escolar",
                    "nombre": "CICLOS ESCOLARES",
                    "permiso": "can_view_ciclo_escolar",
                    "url": "escolar_ciclo_index",
                    "icono": "fa-book",
                },
                {
                    "app": "escolar",
                    "nombre": "EVENTOS",
                    "permiso": "can_view_eventos_globales",
                    "url": "escolar_eventos_globales_index",
                    "icono": "fa-calendar-alt",
                },
                {
                    "app": "escolar",
                    "nombre": "CAMPOS FORMATIVOS",
                    "permiso": "can_view_campo_formativo",
                    "url": "escolar_campo_formativo_index",
                    "icono": "fa fa-pencil-square-o",
                },
            ],
        },
        # =====================================
        #   CONFIGURACIONES DEL SISTEMA
        # =====================================
        {
            "is_main": False,
            "nombre": "CONFIGURACION",
            "url": "user_index",
            "app": "user",
            "icono": "fa-cogs",  # Icono para el módulo 'USUARIOS'
            "submodulos": [
                # =====================================
                #  SUBMÓDULO DE USUARIOS
                # =====================================
                {
                    "app": "user",
                    "nombre": "Usuarios",
                    "permiso": "can_view_user",
                    "url": "user_index",
                    "icono": "fa-users",  # Icono para el submódulo 'Ver Usuarios'
                },
                # =====================================
                #  SUBMÓDULO DE GRUPOS
                # =====================================
                {
                    "app": "auth",
                    "nombre": "Grupos",
                    "permiso": "can_view_grupo",
                    "url": "grupos_index",
                    "icono": "fa-users",  # Icono para el submódulo 'Ver Usuarios'
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
                'url': modulo['url'],
                "icono": modulo["icono"],  # Incluir el ícono del módulo
                "submodulos": [],
            }
            for submodulo in modulo["submodulos"]:
                if f'{submodulo["app"]}.{submodulo["permiso"]}' in permisos_usuario:
                    modulos_acc["submodulos"].append(submodulo)

            if modulos_acc["submodulos"]:
                modulos_accesibles.append(modulos_acc)
        print(modulos_accesibles,'modulos_accesibles')

        return {"modulos_accesibles": modulos_accesibles}

    return {"modulos_accesibles": []}
