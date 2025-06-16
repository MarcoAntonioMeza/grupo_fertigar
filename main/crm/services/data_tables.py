from django.db.models import Q ,OuterRef, Subquery
from django.http import JsonResponse, HttpResponseRedirect, Http404
from django.core.paginator import Paginator, EmptyPage

from main.crm.models import Almacen, Proveedor, Cliente, Producto


#======================================================
#                 ALMACEN
#======================================================

def almacen_list(draw=0, start=0, length=10, search_value=""):
    # Base query optimizada
    base_query = Almacen.objects.filter(~Q(status=Cliente.STATUS_DELETE))#.select_related("created_by")
    # Búsqueda optimizada con índice en campos relevantes
    if search_value:
        base_query = base_query.filter(
            Q(nombre__icontains=search_value)
            | Q(id__istartswith=search_value)  # Mejor para búsqueda por ID
            | Q(codigo__icontains=search_value)
          
        ).distinct()

    # Ordenación inicial (asegurar que haya índice en apellido_paterno)
    ordered_query = base_query.order_by("-id")

    # Paginación optimizada
    paginator = Paginator(ordered_query, length)
    page_number = (start // length) + 1

    try:
        page_obj = paginator.page(page_number)
    except EmptyPage:
        page_obj = paginator.page(1)
        

    # Serialización optimizada con values() para evitar crear objetos completos
    list_data = ordered_query.values(
        "id",
        "nombre",
        "codigo",
        "status",
        "encargado__nombre",
        "created_at",
        "created_by__username",
        "updated_at",
        "updated_by__username",
    )[start : start + length]
    
    
    STATUS_DICT = dict(Almacen.STATUS_CHOICES)

    # Formateo de datos
    data = [
        {
            "id": item["id"],
            "name": f"{item['nombre']}".strip(),
            "codigo": f"{item['codigo']}".strip(),
            "status": STATUS_DICT.get(item["status"], "--"),
            "encargado": item["encargado__nombre"] or "--",
            "created_at": (item["created_at"] if item["created_at"] else "--"),
            "created_by": item["created_by__username"] or "--",
            "updated_at": (item["updated_at"] if item["updated_at"] else "--"),
            "updated_by": item["updated_by__username"] or "--",
        }
        for item in list_data
    ]
    
    return {
            "draw": draw,
            "recordsTotal": paginator.count,
            "recordsFiltered": (
                paginator.count if not search_value else ordered_query.count()
            ),
            "data": data,
        }
    

#?=====================================================
#                    CLIENTES
# ======================================================
def clientes_list(draw=0, start=0, length=10, search_value=""):
    # Base query optimizada
    base_query = Cliente.objects.filter(~Q(status=Cliente.STATUS_DELETE))#.select_related("created_by")
    # Búsqueda optimizada con índice en campos relevantes
    if search_value:
        base_query = base_query.filter(
            Q(nombre__icontains=search_value)
            | Q(id__istartswith=search_value)  # Mejor para búsqueda por ID
            | Q(codigo__icontains=search_value)
            | Q(razon_social__icontains=search_value)
        ).distinct()

    # Ordenación inicial (asegurar que haya índice en apellido_paterno)
    ordered_query = base_query.order_by("-id")

    # Paginación optimizada
    paginator = Paginator(ordered_query, length)
    page_number = (start // length) + 1

    try:
        page_obj = paginator.page(page_number)
    except EmptyPage:
        page_obj = paginator.page(1)
        

    # Serialización optimizada con values() para evitar crear objetos completos
    list_data = ordered_query.values(
        "id",
        "nombre",
        "razon_social",
        "codigo",
        "tipo",
        "status",
        "created_at",
        "created_by__username",
        "updated_at",
        "updated_by__username",
    )[start : start + length]
    
    TIPO_DICT = dict(Cliente.TIPO_LIST)
    STATUS_DICT = dict(Cliente.STATUS_CHOICES)

    # Formateo de datos
    data = [
        {
            "id": item["id"],
            "name": f"{item['nombre']}".strip(),
            "codigo": f"{item['codigo']}".strip(),
            "razon_social": f"{item['razon_social']}".strip() if item["razon_social"] else "--",
            "tipo": TIPO_DICT.get(item["tipo"], "--"),
            "status": STATUS_DICT.get(item["status"], "--"),
            "created_at": (item["created_at"] if item["created_at"] else "--"),
            "created_by": item["created_by__username"] or "--",
            "updated_at": (item["updated_at"] if item["updated_at"] else "--"),
            "updated_by": item["updated_by__username"] or "--",
        }
        for item in list_data
    ]
    
    return {
            "draw": draw,
            "recordsTotal": paginator.count,
            "recordsFiltered": (
                paginator.count if not search_value else ordered_query.count()
            ),
            "data": data,
        }
    
#?=====================================================
#                    PROVEEDOR
# ======================================================
def proveedor_list(draw=0, start=0, length=10, search_value=""):
    # Base query optimizada
    base_query = Proveedor.objects.filter(~Q(status=Proveedor.STATUS_DELETE))#.select_related("created_by")
    # Búsqueda optimizada con índice en campos relevantes
    if search_value:
        base_query = base_query.filter(
            Q(nombre__icontains=search_value)
            | Q(id__istartswith=search_value)  # Mejor para búsqueda por ID
            | Q(codigo__icontains=search_value)
            | Q(razon_social__icontains=search_value)
        ).distinct()

    # Ordenación inicial (asegurar que haya índice en apellido_paterno)
    ordered_query = base_query.order_by("-id")

    # Paginación optimizada
    paginator = Paginator(ordered_query, length)
    page_number = (start // length) + 1

    try:
        page_obj = paginator.page(page_number)
    except EmptyPage:
        page_obj = paginator.page(1)
        

    # Serialización optimizada con values() para evitar crear objetos completos
    list_data = ordered_query.values(
        "id",
        "nombre",
        "razon_social",
        "codigo",
        "status",
        "created_at",
        "created_by__username",
        "updated_at",
        "updated_by__username",
    )[start : start + length]
    
    STATUS_DICT = dict(Proveedor.STATUS_CHOICES)

    # Formateo de datos
    data = [
        {
            "id": item["id"],
            "name": f"{item['nombre']}".strip(),
            "codigo": f"{item['codigo']}".strip(),
            "razon_social": f"{item['razon_social']}".strip() if item["razon_social"] else "--",
           
            "status": STATUS_DICT.get(item["status"], "--"),
            "created_at": (item["created_at"] if item["created_at"] else "--"),
            "created_by": item["created_by__username"] or "--",
            "updated_at": (item["updated_at"] if item["updated_at"] else "--"),
            "updated_by": item["updated_by__username"] or "--",
        }
        for item in list_data
    ]
    
    return {
            "draw": draw,
            "recordsTotal": paginator.count,
            "recordsFiltered": (
                paginator.count if not search_value else ordered_query.count()
            ),
            "data": data,
        }
    

#?=====================================================
#                    PRODUCTO
# ======================================================
def producto_list(draw=0, start=0, length=10, search_value=""):
    # Base query optimizada
    base_query = Producto.objects.filter(~Q(status=Producto.STATUS_DELETE))#.select_related("created_by")
    # Búsqueda optimizada con índice en campos relevantes
    if search_value:
        base_query = base_query.filter(
            Q(nombre__icontains=search_value)
            | Q(id__istartswith=search_value)  # Mejor para búsqueda por ID
            | Q(codigo__icontains=search_value)
          
        ).distinct()

    # Ordenación inicial 
    ordered_query = base_query.order_by("-id")
    # Paginación optimizada
    paginator = Paginator(ordered_query, length)
    page_number = (start // length) + 1

    try:
        page_obj = paginator.page(page_number)
    except EmptyPage:
        page_obj = paginator.page(1)
    # Serialización optimizada con values() para evitar crear objetos completos
    list_data = ordered_query.values(
        "id",
        "nombre", 
        "codigo",
        "status",
        "created_at",
        "created_by__username",
        "updated_at",
        "updated_by__username",
    )[start : start + length]
    
    STATUS_DICT = dict(Producto.STATUS_CHOICES)

    # Formateo de datos
    data = [
        {
            "id": item["id"],
            "name": f"{item['nombre']}".strip(),
            "codigo": f"{item['codigo']}".strip(),
            "status": STATUS_DICT.get(item["status"], "--"),
            "created_at": (item["created_at"] if item["created_at"] else "--"),
            "created_by": item["created_by__username"] or "--",
            "updated_at": (item["updated_at"] if item["updated_at"] else "--"),
            "updated_by": item["updated_by__username"] or "--",
        }
        for item in list_data
    ]
    
    return {
            "draw": draw,
            "recordsTotal": paginator.count,
            "recordsFiltered": (
                paginator.count if not search_value else ordered_query.count()
            ),
            "data": data,
        }
    