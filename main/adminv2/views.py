from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.models import Group
from django.db.models import Q
from django.http import JsonResponse
from django.core.paginator import Paginator
from .forms.grupos import GroupForm
from django.contrib import messages
from django.views.defaults import page_not_found
from django.contrib.auth.decorators import permission_required

"""
================================================================
                          GRUPOS 
================================================================
"""
@permission_required('auth.can_view_grupo', raise_exception=True)
def index (request):
    return render(request, 'adminv2/grupos/index.html')
@permission_required('auth.can_create_grupo', raise_exception=True)
def create(request):
    if request.method == 'POST':
        form = GroupForm(request.POST)
        if form.is_valid():
            form.save()
            #messages.success(request, "¡El grupo se ha creado exitosamente!")  # Mensaje de éxito
            return redirect('grupos_view', id=form.instance.id)  # Redirige al detalle del grupo recién creado
        else:
            pass
            #messages.error(request, "Hubo un error al crear el grupo. Por favor, revisa los campos.")  # Mensaje de error
    else:
        form = GroupForm()
    
    return render(request, 'adminv2/grupos/create.html', {'form': form})

@permission_required('auth.can_view_grupo', raise_exception=True)
def view(request, id):
    group = get_object_or_404(Group, pk=id)
    return render(request, 'adminv2/grupos/view.html', {'group': group})

@permission_required('auth.can_update_grupo', raise_exception=True)
def update (request, id):
    group = get_object_or_404(Group, pk=id)
    if request.method == 'POST':
        form = GroupForm(request.POST, instance=group)
        if form.is_valid():
            form.save()
            return redirect('grupos_view', id=id)
    else:
        form = GroupForm(instance=group)
    return render(request, 'adminv2/grupos/update.html', {'form': form, 'group': group})

@permission_required('auth.can_delete_grupo', raise_exception=True)
def delete(request, id):
    group = get_object_or_404(Group, pk=id)

    # Verificar si el grupo tiene usuarios asignados
    if group.user_set.exists():
        messages.error(request, "No se puede eliminar el grupo porque tiene usuarios asignados.")
    else:
        try:
            group.delete()
            #messages.success(request, "¡El grupo se ha eliminado exitosamente!")  # Mensaje de éxito
        except Exception as e:  # Captura cualquier excepción
            messages.error(request, f"Hubo un error al eliminar el grupo. Detalle del error: {str(e)}")
    
    return redirect('grupos_index')


@permission_required('auth.can_view_grupo', raise_exception=True)
def index_list_ajax(request):
    draw = int(request.GET.get('draw', 1))
    start = int(request.GET.get('start', 0))
    length = int(request.GET.get('length', 10))
    search_value = request.GET.get('search[value]', '')

    # Filtrado por búsqueda
    grupos = Group.objects.all()
    if search_value:
       grupos = grupos.filter(
        Q(name__icontains=search_value) |
        #Q(apellido_paterno__icontains=search_value) |
        #Q(email__icontains=search_value)|
        Q(id__icontains=search_value)
        #Q(username__icontains=search_value)
    )
    # Paginación
    paginator = Paginator(grupos, length)
    page_number = (start // length) + 1
    page_obj = paginator.get_page(page_number)

    # Serializar datos
    data = [
        {
            "id": s.id,
            "name": f"{s.name}".upper(),
            #"phone": str(s.telefono),
            #"phone2": str(s.telefono2),
            #'tipo': s.get_tipo_display(),
            #'estado': s.get_status_display(),
            #
            #"email": str(s.email),
            ##"created_at": s.created_at,
            #"created_at": format(s.created_at, 'd-m-Y h:i:s'),
            ##"created_by": str(s.created_by.username) if s.created_by else "",
        }
        for s in page_obj
    ]

    return JsonResponse({
        "draw": draw,
        "recordsTotal": paginator.count,
        "recordsFiltered": paginator.count,
        "data": data
    })


"""
================================================================
                          ERRORS 
================================================================
"""
def error_404(request, exception):
    return render(request, 'adminv2/errors/404.html', status=404)

def pag_404_not_found(request, exception, template_name="errors/404.html"):
    try:
        response = render(request, template_name)
        response.status_code = 404
        return response
    except Exception as e:
        print(f"Error en la función 404: {e}")
        raise e  # Esto ayudará a identificar el error exacto
    
def pag_403_forbidden(request, exception, template_name="errors/403.html"):
    try:
        response = render(request, template_name)
        response.status_code = 403
        return response
    except Exception as e:
        print(f"Error en la función 404: {e}")
        raise e  # Esto ayudará a identificar el error exacto
    
def pag_500_server_error(request, template_name="errors/500.html"):
    try:
        response = render(request, template_name)
        response.status_code = 500
        return response
    except Exception as e:
        print(f"Error en la función 404: {e}")
        raise e  # Esto ayudará a identificar el error exacto