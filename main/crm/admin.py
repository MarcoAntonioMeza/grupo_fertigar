from django.contrib import admin

from .models import RazonSocial,Categoria, Producto, Precio, Agente, Almacen, Cliente

# Register your models here.

admin.site.register(Categoria)
admin.site.register(Producto)
admin.site.register(Precio)
admin.site.register(Agente)
admin.site.register(Almacen)
admin.site.register(Cliente)
admin.site.register(RazonSocial)