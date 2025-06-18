from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from django.http import JsonResponse
from django.core.paginator import Paginator
from datetime import datetime
from django.contrib.auth.decorators import permission_required
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages

from .forms import UsuarioCreationForm
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
    #direccion = Direccion.objects.get(usuario=usuario).firts()
    direccion = Direccion.objects.filter(usuario=usuario).first()


    if request.method == "POST":
        user_form = UsuarioCreationForm(
            data=request.POST, files=request.FILES, instance=usuario
        )
        direccion_form = DireccionForm(data=request.POST, instance=direccion)

        if not (user_form.is_valid() and direccion_form.is_valid()):
            context = {
                "title": f"USUARIO -{usuario.username}".upper(),
                "user_form": user_form,
                "direccion_form": direccion_form,
                "model": usuario,
            }
            return render(request, "user/update.html", context)

        try:
            # Procesamiento usuario
            usuario = user_form.save(commit=False)
            usuario.updated_by = request.user
            usuario.save()

            # Actualización grupos y permisos
            grupos = user_form.cleaned_data.get("grupos")
            permisos = user_form.cleaned_data.get("permisos")

            if grupos:
                usuario.groups.set(grupos)
            if permisos:
                usuario.user_permissions.set(permisos)

            # Procesamiento dirección
            datos_direccion = direccion_form.cleaned_data
            if (
                datos_direccion.get("estado")
                and datos_direccion.get("municipio")
                and datos_direccion.get("colonia")
            ):
                direccion_form.save()

            return redirect("user_view", id=usuario.id)

        except Exception as e:
            messages.error(request, f"Error al guardar: {e}")
            context = {
                "title": f"USUARIO -{usuario.username}".upper(),
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
    user_form = UsuarioCreationForm(instance=usuario, initial=initial_data)
    direccion_form = DireccionForm(instance=direccion)

    context = {
        "title": f"USUARIO -{usuario.username}".upper(),
        "user_form": user_form,
        "direccion_form": direccion_form,
        "model": usuario,
    }
    return render(request, "user/update.html", context)


@permission_required(USER_DELETE, raise_exception=True)
def delete_usuario(request, id):
    messages.error(request, "ACCION NO SOPORTADA")
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


