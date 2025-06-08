from django.contrib import admin
from .models import (
    Categoria, Producto, Precio, Agente, Almacen, Cliente,
    UnidadSAT, Proveedor, RegimenFiscal, Empresa
)

# Registro optimizado de modelos
models = [
    Categoria, Producto, Precio, Agente, Almacen, Cliente,
    UnidadSAT, Proveedor, RegimenFiscal, Empresa
]

admin.site.register(models)
