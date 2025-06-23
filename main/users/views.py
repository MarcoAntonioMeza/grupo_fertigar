from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from django.http import JsonResponse
from django.core.paginator import Paginator
from datetime import datetime
from django.contrib.auth.decorators import permission_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.db import transaction

import time

from .forms import UsuarioCreationForm, UsuarioUpdateForm,PasswordUpdateForm
from .models import User, Direccion
from main.direccion.forms import DireccionForm


# from apps.usuario.forms import UsuarioCreationForm, DireccionForm

APP_NAME = "users"
MODEL_NAME_USER = "user"
USER_VIEW = f"{APP_NAME}.can_view_{MODEL_NAME_USER}"
USER_CREATE = f"{APP_NAME}.can_create_{MODEL_NAME_USER}"
USER_UPDATE = f"{APP_NAME}.can_update_{MODEL_NAME_USER}"
USER_DELETE = f"{APP_NAME}.can_delete_{MODEL_NAME_USER}"
CAN_USER = {
    "view": USER_VIEW,
    "create": USER_CREATE,
    "update": USER_UPDATE,
    "delete": USER_DELETE,
}


# Create your views here.
@permission_required(USER_VIEW, raise_exception=True)
def index(request):
    context = {
        "title": "USUARIOS",
        "sub_title": "USUARIOS",
        "can": {key: request.user.has_perm(value) for key, value in CAN_USER.items()},
    }
    return render(request, "user/index.html", context)


@permission_required(USER_VIEW, raise_exception=True)
def view_usuario(request, id):
    usuario = get_object_or_404(User, id=id)
    try:
        direccion = Direccion.objects.get(usuario=usuario)
    except Direccion.DoesNotExist:
        direccion = Direccion(usuario=usuario)

    context = {
        "labels": {field.name: field.verbose_name for field in User._meta.fields},
        "title": usuario.username.upper(),
        "sub_title": "ADMIN",
        "model": usuario,
        "direccion": direccion,
        "can": {key: request.user.has_perm(value) for key, value in CAN_USER.items()},
    }

    return render(request, "user/view.html", context)


@permission_required(USER_CREATE, raise_exception=True)
def crear_usuario(request):
    # estados = Estado.objects.all()
    if request.method == "POST":
        # Crear los formularios con los datos del POST
        user_form = UsuarioCreationForm(request.POST, request.FILES)
        direccion_form = DireccionForm(request.POST)

        # Verificar si ambos formularios son válidos
        if user_form.is_valid() and direccion_form.is_valid():
            usuario = user_form.save(commit=False)  # Guardar el usuario
            grupo = user_form.cleaned_data["grupos"]
            permisos = user_form.cleaned_data["permisos"]
            usuario.created_by = request.user  # Asignar el creador del usuario
            usuario.created_at = int(time.time())
            usuario.is_active = True
            
            usuario.save()  # Guardar el usuario

            # Asignar los grupos (si hay varios, usamos .set())
            if grupo:
                usuario.groups.set(
                    grupo
                )  # Asegúrate de que 'grupo' sea un queryset o lista de objetos

            # Asignar permisos (si hay varios, usamos .set())
            if permisos:
                usuario.user_permissions.set(permisos)

            direccion = direccion_form.save(commit=False)  # No guardar aún la dirección

            # Si no se proporcionó un código postal, lo dejamos como None
            if (
                direccion_form.cleaned_data.get("estado")
                and direccion_form.cleaned_data.get("municipio")
                and direccion_form.cleaned_data.get("colonia")
            ):
                direccion.usuario = usuario  # Asociar la dirección al usuario
                direccion.save()  # Guardar la dirección

            return redirect(
                "user_view", id=usuario.id
            )  # Redirigir al índice de usuarios u otra página
        else:
            # Si algún formulario no es válido, mostramos los errores en el template
            return render(
                request,
                "user/create.html",
                {
                    "title": "USUARIO NUEVO",
                    "sub_title": "USUARIOS",
                    "user_form": user_form,
                    "direccion_form": direccion_form,
                },
            )
    else:
        # Si no es un POST, crear formularios vacíos
        user_form = UsuarioCreationForm()
        direccion_form = DireccionForm()

    return render(
        request,
        "user/create.html",
        {
            "title": "USUARIO NUEVO",
            "sub_title": "USUARIOS",
            "user_form": user_form,
            "direccion_form": direccion_form,
        },
    )



@permission_required(USER_UPDATE, raise_exception=True)
def update_usuario(request, id):
    usuario = get_object_or_404(User, id=id)
    if usuario.is_superuser:
        messages.error(request, "No puedes editar el usuario administrador.")
        return redirect("user_view", id=id)
    
    direccion = Direccion.objects.filter(usuario=usuario).first()

    if request.method == "POST":
        user_form = UsuarioUpdateForm(
            data=request.POST, files=request.FILES, instance=usuario
        )
        direccion_form = DireccionForm(data=request.POST, instance=direccion)

        if not (user_form.is_valid() and direccion_form.is_valid()):
            #print("Errores user_form:", user_form.errors)
            #print("Errores direccion_form:", direccion_form.errors)
            context = {
                "title": f"USUARIO -{usuario.username}".upper(),
                "user_form": user_form,
                "direccion_form": direccion_form,
                "model": usuario,
            }
            return render(request, "user/update.html", context)

        try:
            with transaction.atomic():
                usuario = user_form.save(commit=False)
                usuario.password = usuario.__class__.objects.get(pk=usuario.pk).password
                usuario.is_active = True
                usuario.updated_by = request.user
                usuario.updated_at = int(time.time())
                usuario.save()

                grupos = user_form.cleaned_data.get("grupos")
                permisos = user_form.cleaned_data.get("permisos")

                if grupos:
                    usuario.groups.set(grupos)
                if permisos:
                    usuario.user_permissions.set(permisos)

                datos_direccion = direccion_form.cleaned_data
                if (
                    datos_direccion.get("estado")
                    and datos_direccion.get("municipio")
                    and datos_direccion.get("colonia")
                ):
                    direccion_instance = direccion_form.save(commit=False)
                    direccion_instance.usuario = usuario  # Asignar el usuario
                    direccion_instance.save()

                    

            return redirect("user_view", id=usuario.id)

        except Exception as e:
            # ⚠️ NO accedas a la base de datos aquí, crea texto plano si es posible
            messages.error(request, f"Error al guardar: {str(e)}")

            # Vuelve a renderizar sin tocar usuario (en caso de transacción fallida)
            context = {
                "title": f"USUARIO - {request.POST.get('username', 'SIN NOMBRE')}".upper(),
                "user_form": user_form,
                "direccion_form": direccion_form,
                "model": usuario,
            }
            return render(request, "user/update.html", context)

    # Método GET
    initial_data = {
        "grupos": usuario.groups.all(),
        "permisos": usuario.user_permissions.all(),
    }
    user_form = UsuarioUpdateForm(instance=usuario, initial=initial_data)
    direccion_form = DireccionForm(instance=direccion)

    context = {
        "title": f"USUARIO - {usuario.username}".upper(),
        "user_form": user_form,
        "direccion_form": direccion_form,
        "model": usuario,
    }
    return render(request, "user/update.html", context)


@permission_required(USER_UPDATE, raise_exception=True)
def cambiar_contraseña_usuario(request, id):
    usuario = get_object_or_404(User, id=id)
    if request.method == "POST":
        form = PasswordUpdateForm(request.POST, instance=usuario)
        if form.is_valid():
            form.save()
            messages.success(request, "Contraseña actualizada correctamente.")
            return redirect("user_view", id=usuario.id)
    else:
        form = PasswordUpdateForm(instance=usuario)

    return render(request, "user/update_pass.html", {"form": form, "usuario": usuario, 'model': usuario, "title": f"USUARIO -{usuario.username} cambiar contraseña".upper(),})

@permission_required(USER_DELETE, raise_exception=True)
def delete_usuario(request, id):
    usuario = get_object_or_404(User, id=id)
    if usuario.is_superuser:
        messages.error(request, "No puedes eliminar el usuario administrador.")
        return redirect("user_view", id=id)
    else:
        usuario.delete()
        messages.success(request, "Usuario eliminado correctamente.")
    #messages.error(request, "ACCIÓN NO SOPORTADA")
    return redirect("user_index")


# ==================================================================
#                            LIST TABLES
# ==================================================================
@permission_required(USER_VIEW, raise_exception=True)
def index_list_ajax(request):
    draw = int(request.GET.get("draw", 1))
    start = int(request.GET.get("start", 0))
    length = int(request.GET.get("length", 10))
    search_value = request.GET.get("search[value]", "")

    # Filtrado por búsqueda
    uesers = User.objects.all()
    if search_value:
        uesers = uesers.filter(
            Q(nombre__icontains=search_value)
            | Q(apellido_paterno__icontains=search_value)
            |
            # Q(email__icontains=search_value)|
            Q(id__icontains=search_value)
            | Q(username__icontains=search_value)
        )
    # Paginación
    paginator = Paginator(uesers, length)
    page_number = (start // length) + 1
    page_obj = paginator.get_page(page_number)

    # Serializar datos
    data = [
        {
            "id": s.id,
            "usuario": str(s.username),
            "name": f"{s.nombre} {s.segundo_nombre} {s.apellido_paterno}",  # Asume que tienes 'nombre' y 'apellido' en el modelo
            "email": str(s.email),
            "created_at": (
                datetime.fromtimestamp(s.created_at).strftime("%Y-%m-%d %H:%M:%S")
                if s.created_at
                else None
            ),
            "created_by": str(s.created_by.username) if s.created_by else "",
        }
        for s in page_obj
    ]

    return JsonResponse(
        {
            "draw": draw,
            "recordsTotal": paginator.count,
            "recordsFiltered": paginator.count,
            "data": data,
        }
    )


