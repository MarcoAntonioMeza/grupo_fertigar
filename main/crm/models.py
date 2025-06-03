from django.db import models
from main.adminv2.models import BaseModel
# Create your models here.

class Categoria(BaseModel):
    """
    Modelo que representa una categoría de productos.

    Atributos:
        nombre (str): Nombre de la categoría.
        descripcion (str): Descripción opcional de la categoría.
    """
    nombre = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nombre

class Producto(BaseModel):
    """
    Modelo que representa un producto del catálogo.

    Atributos:
        nombre (str): Nombre del producto (se guarda en mayúsculas).
        status (str): Estado del producto ('ACT' para activo, 'INA' para inactivo).
        imagen (ImageField): Imagen opcional del producto.
        descripcion (str): Descripción del producto.
        precio (Decimal): Precio base del producto.
        clave_sat (str): Clave SAT opcional.
        iva (Decimal): Tasa de IVA (por defecto 0.16).
        ieps (Decimal): Tasa de IEPS (por defecto 0.0).
        categoria (FK): Categoría a la que pertenece el producto.

    Métodos:
        save(): Sobrescribe el método save para aplicar formato y validaciones antes de guardar.
    """

    STATUS_ACTIVO = 'ACT'
    STATUS_INACTIVO = 'INA'
    STATUS_CHOICES = [
        (STATUS_ACTIVO, 'Activo'),
        (STATUS_INACTIVO, 'Inactivo'),
    ]

    nombre = models.CharField(max_length=50)
    status = models.CharField(max_length=3, choices=STATUS_CHOICES, default=STATUS_ACTIVO)
    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    clave_sat = models.CharField(max_length=10, blank=True, null=True)
    iva = models.DecimalField(max_digits=5, decimal_places=2, default=0.16)
    ieps = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    categoria = models.ForeignKey(Categoria, on_delete=models.SET_NULL, blank=True, null=True, related_name='productos')

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        # Formatea nombre y descripción antes de guardar
        self.nombre = self.nombre.strip().upper()
        self.descripcion = self.descripcion.strip() if self.descripcion else ''
        super().save(*args, **kwargs)

class Precio(BaseModel):
    """
    Modelo que representa el historial de precios de un producto.

    Atributos:
        producto (FK): Producto al que pertenece este precio.
        precio (Decimal): Valor monetario del precio.
    """
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name='precios')
    precio = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.producto.nombre} - {self.precio}"
