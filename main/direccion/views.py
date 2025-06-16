from django.shortcuts import render
from django.http import JsonResponse
from .models import CodigoPostal, Municipio, Colonia
from django.http import JsonResponse
from .models import CodigoPostal, Municipio, Colonia

from django.http import JsonResponse
from .models import CodigoPostal, Colonia, Municipio

def buscar_direccion(request):
    codigo_postal = request.GET.get('codigo_postal')
    estado_id = request.GET.get('estado_id')
    municipio_id = request.GET.get('municipio_id')

    municipios_data = []
    colonias_data = []

    if codigo_postal:
        try:
            # Obtiene el objeto de código postal
            codigo = CodigoPostal.objects.get(codigo_postal=codigo_postal)

            # Busca colonias asociadas (optimiza con select_related para evitar consultas adicionales)
            colonias_qs = Colonia.objects.select_related('municipio', 'codigo_postal').filter(
                codigo_postal=codigo
            ).order_by('d_asenta')

            # Extrae municipios únicos de esas colonias
            municipios_qs = Municipio.objects.filter(
                id__in=colonias_qs.values_list('municipio_id', flat=True).distinct()
            ).select_related('estado').order_by('nombre')

        except CodigoPostal.DoesNotExist:
            return JsonResponse({'municipios': [], 'colonias': []})

    elif estado_id:
        municipios_qs = Municipio.objects.filter(
            estado_id=estado_id
        ).order_by('nombre').select_related('estado')
        colonias_qs = Colonia.objects.none()  # Sin colonias en esta ruta

    elif municipio_id:
        colonias_qs = Colonia.objects.select_related('codigo_postal').filter(
            municipio_id=municipio_id
        ).order_by('d_asenta')
        municipios_qs = Municipio.objects.filter(id=municipio_id).select_related('estado')

    else:
        colonias_qs = Colonia.objects.none()
        municipios_qs = Municipio.objects.none()

    # Serializar resultados
    municipios_data = [
        {
            'id': municipio.id,
            'nombre': municipio.nombre,
            'estado_id': municipio.estado_id
        } for municipio in municipios_qs
    ]

    colonias_data = [
        {
            'id': colonia.id,
            'd_asenta': colonia.d_asenta,
            'codigo_postal': colonia.codigo_postal.codigo_postal
        } for colonia in colonias_qs
    ]

    return JsonResponse({'municipios': municipios_data, 'colonias': colonias_data})
