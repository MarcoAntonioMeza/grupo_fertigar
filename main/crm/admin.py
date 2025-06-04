from django.contrib import admin

from .models import Categoria, Producto, Precio, Agente, Almacen

# Register your models here.

admin.site.register(Categoria)
admin.site.register(Producto)
admin.site.register(Precio)
admin.site.register(Agente)
admin.site.register(Almacen)
