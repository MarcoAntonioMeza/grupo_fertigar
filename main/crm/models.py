from django.db import models
from main.adminv2.models import BaseModel, BaseDireccion
from main.users.models import User


# Create your models here.
class RazonSocial(BaseModel):
    codigo = models.CharField(max_length=20, verbose_name="Código", unique=True)
    nombre = models.CharField(max_length=200, verbose_name="Nombre")

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        self.nombre.upper().strip()
        super().save(*args, **kwargs)


# ================================================================
#             PARA PRODUCTOS Y CATEGORÍAS
# =================================================================
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

    STATUS_ACTIVO = "ACT"
    STATUS_INACTIVO = "INA"
    STATUS_CHOICES = [
        (STATUS_ACTIVO, "Activo"),
        (STATUS_INACTIVO, "Inactivo"),
    ]

    nombre = models.CharField(max_length=50)
    status = models.CharField(
        max_length=3, choices=STATUS_CHOICES, default=STATUS_ACTIVO
    )
    imagen = models.ImageField(upload_to="productos/", blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    clave_sat = models.CharField(max_length=10, blank=True, null=True)
    iva = models.DecimalField(max_digits=5, decimal_places=2, default=0.16)
    ieps = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="productos",
    )

    def __str__(self):
        return self.nombre

    def save(self, *args, **kwargs):
        # Formatea nombre y descripción antes de guardar
        self.nombre = self.nombre.strip().upper()
        self.descripcion = self.descripcion.strip() if self.descripcion else ""
        super().save(*args, **kwargs)


class Precio(BaseModel):
    """
    Modelo que representa el historial de precios de un producto.

    Atributos:
        producto (FK): Producto al que pertenece este precio.
        precio (Decimal): Valor monetario del precio.
    """

    ESPECIAL = "ESP"
    SUBDISTRIBUIDOR = "SUB"
    MAYOREO = "MAY"
    PUBLICO = "PUB"
    TIPO_PRECIO_CHOICES = [
        (ESPECIAL, "Especial"),
        (SUBDISTRIBUIDOR, "Subdistribuidor"),
        (MAYOREO, "Mayoreo"),
        (PUBLICO, "Público"),
    ]
    producto = models.ForeignKey(
        Producto, on_delete=models.CASCADE, related_name="precios"
    )
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    tipo_precio = models.CharField(
        max_length=3, choices=TIPO_PRECIO_CHOICES, default=PUBLICO
    )

    def __str__(self):
        return f"{self.producto.nombre} - {self.precio}"


# =================================================================
#                    PROVEEDORES
# ================================================================


class Proveedor(BaseModel):
    STATUS_ACTIVO = "ACT"
    STATUS_INACTIVO = "INA"
    STATUS_CHOICES = [
        (STATUS_ACTIVO, "Activo"),
        (STATUS_INACTIVO, "Inactivo"),
    ]
    nombre = models.CharField(
        max_length=200, verbose_name="Nombre del Proveedor", blank=False, null=False
    )
    razon_social = models.CharField(
        max_length=200, verbose_name="Razón Social", blank=False, null=False
    )
    rfc = models.CharField(max_length=13, verbose_name="RFC", blank=False, null=False)
    telefono = models.CharField(
        max_length=20, verbose_name="Teléfono", blank=True, null=True
    )
    correo = models.EmailField(
        max_length=254, verbose_name="Correo Electrónico", blank=True, null=True
    )
    status = models.CharField(
        max_length=3,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVO,
        verbose_name="Estado",
    )

    def __str__(self):
        return self.nombre


class DireccionProveedor(BaseDireccion):
    proveedor = models.ForeignKey(
        Proveedor, on_delete=models.CASCADE, related_name="direccion_proveedor"
    )

    def __str__(self):
        return f"{self.calle}, {self.colonia}, {self.municipio.nombre}, {self.estado.nombre}"


# =================================================================
#                    ALAMCEN
# ================================================================
class Almacen(BaseModel):
    STATUS_ACTIVO = "ACT"
    STATUS_INACTIVO = "INA"
    STATUS_DELETE = "DEL"
    STATUS_CHOICES = [
        (STATUS_ACTIVO, "Activo"),
        (STATUS_INACTIVO, "Inactivo"),
    ]
    nombre = models.CharField(
        max_length=200, verbose_name="Nombre", blank=False, null=False
    )
    status = models.CharField(
        max_length=3,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVO,
        verbose_name="Estado",
    )
    codigo = models.CharField(
        max_length=20,
        verbose_name="Código",
        blank=False,
        null=True,
        unique=True,
    )
    telefono = models.CharField(
        max_length=20, verbose_name="Teléfono", blank=True, null=True
    )
    encargado = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="almacen_encargado",
        verbose_name="Encargado",
    )
    comentarios = models.TextField(blank=True, null=True, verbose_name="Comentarios")
    info_extra = models.TextField(
        blank=True, null=True, verbose_name="Información Extra"
    )

    def __str__(self):
        return self.nombre


class DireccionAlmacen(BaseDireccion):
    almacen = models.ForeignKey(
        Almacen, on_delete=models.CASCADE, related_name="direccion_almacen"
    )

    def __str__(self):
        return f"{self.calle}, {self.colonia}, {self.municipio.nombre}, {self.estado.nombre}"


# =================================================================
#                       AGENTES
# ================================================================
class Agente(BaseModel):
    STATUS_ACTIVO = "ACT"
    STATUS_INACTIVO = "INA"
    STATUS_CHOICES = [
        (STATUS_ACTIVO, "Activo"),
        (STATUS_INACTIVO, "Inactivo"),
    ]

    nombre = models.CharField(
        max_length=200, verbose_name="Nombre del Agente", blank=False, null=False
    )
    status = models.CharField(
        max_length=3,
        choices=STATUS_CHOICES,
        verbose_name="Estado",
        default=STATUS_ACTIVO,
    )
    codigo = models.CharField(
        max_length=20,
        verbose_name="Código del Agente",
        blank=False,
        null=True,
        unique=True,
    )





#=====================================================
#                  CLIENTES
#=====================================================

class Cliente(BaseModel):
    STATUS_ACTIVO = "ACT"
    STATUS_INACTIVO = "INA"
    STATUS_DELETE = "DEL"
    STATUS_CHOICES = [
        (STATUS_ACTIVO, "Activo"),
        (STATUS_INACTIVO, "Inactivo"),
    ]
    
    TIPO_POTENCIAL       = 10
    TIPO_ESTANDAR        = 20
    TIPO_NO_CREDITO      = 30
    TIPO_CREDITO_SEMANAL = 40
    TIPO_EVENTUAL        = 50
    TIPO_BUEN_CLIENTE    = 60 
    TIPO_PREMIUM         = 70
    
    TIPO_LIST = [
        (TIPO_POTENCIAL, "Potencial"),
        (TIPO_ESTANDAR, "Estándar"),
        (TIPO_NO_CREDITO, "No Crédito"),
        (TIPO_CREDITO_SEMANAL, "Crédito Semanal"),
        (TIPO_EVENTUAL, "Eventual"),
        (TIPO_BUEN_CLIENTE, "Buen Cliente"),
        (TIPO_PREMIUM, "Premium"),
    ]
    
    status = models.CharField(max_length=3,choices=STATUS_CHOICES,verbose_name="Estado",default=STATUS_ACTIVO)
    codigo = models.CharField(max_length=20, verbose_name="Código", blank=False, null=True, unique=True)
    nombre = models.CharField(max_length=200, verbose_name="Nombre", blank=False, null=False)
    apellidos = models.CharField(max_length=200, verbose_name="Apellidos", blank=True, null=True)
    telefono = models.CharField(max_length=15, verbose_name="Teléfono", blank=True, null=True)
    email = models.EmailField(max_length=150,verbose_name="Correo Electrónico", blank=True, null=True)
    tipo = models.IntegerField(choices=TIPO_LIST,verbose_name="Tipo de Cliente",default=TIPO_ESTANDAR)
    #filacal
    rfc = models.CharField(max_length=15, verbose_name="RFC", blank=True, null=True)
   
    regimen_fiscal = models.CharField(max_length=100, verbose_name="Régimen Fiscal", blank=True, null=True)
    uso_cfdi = models.CharField(max_length=100, verbose_name="Uso CFDI", blank=True, null=True)
    razon_social = models.ForeignKey(RazonSocial, on_delete=models.SET_NULL, blank=True, null=True,verbose_name="Razón Social", related_name="cliente_razon_social")
    #credito
    limite_credito = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Límite de crédito", default=0.00)
    total_credito = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Total de crédito", default=0.00, blank=True, null=True)
    plazos_semanas = models.IntegerField(verbose_name="Plazos en semanas", default=0, blank=True, null=True)
    
    def __str__(self):
        return self.get_full_name
    
    
    @property
    def get_full_name(self):
        return f"{self.nombre} {self.apellidos} [{self.id}]"  
    
    def save(self, *args, **kwargs):
        self.nombre = self.nombre.strip().upper()
        self.apellidos = self.apellidos.strip().upper()
        super().save(*args, **kwargs)
        

class DireccionCliente(BaseDireccion):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="direccion_cliente")