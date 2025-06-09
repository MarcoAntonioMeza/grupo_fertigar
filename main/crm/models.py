from django.db import models
from main.adminv2.models import BaseModel, BaseDireccion
from main.users.models import User
#?===============================================================
#                      EMPRESAS
# =================================================================
class Empresa(BaseModel):
    codigo = models.CharField(max_length=20, verbose_name="Código", unique=True)
    nombre = models.CharField(max_length=200, verbose_name="Nombre", blank=False, null=False)
    

class RegimenFiscal(BaseModel):
    codigo = models.CharField(max_length=20, verbose_name="Código", unique=True)
    nombre = models.CharField(max_length=200, verbose_name="Nombre")

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

    def save(self, *args, **kwargs):
        self.nombre.upper().strip()
        super().save(*args, **kwargs)


#CODIGOS CFDI
class UsoCfdi():
    pass


# =================================================================
#                    PROVEEDORES
# ================================================================


class Proveedor(BaseModel):
    ORIGEN_MEX = "MEX"
    ORIGEN_USA = "USA"
    ORIGEN_OTRO = "OTR"
    
    ORIGEN_LIST = [
        (ORIGEN_MEX, "México"),
        (ORIGEN_USA, "Estados Unidos"),
        (ORIGEN_OTRO, "Otro"),
    ]
    
    STATUS_ACTIVO = "ACT"
    STATUS_INACTIVO = "INA"
    STATUS_DELETE = "DEL"
    STATUS_CHOICES = [
        (STATUS_ACTIVO, "Activo"),
        (STATUS_INACTIVO, "Inactivo"),
    ]
    origen = models.CharField(max_length=3,choices=ORIGEN_LIST,verbose_name="Origen",default=ORIGEN_MEX,blank=True, null=True)
    codigo       = models.CharField(max_length=20, verbose_name="Código", unique=True,blank=True, null=True)
    razon_social = models.CharField(max_length=180,blank=True, null=True,default=None, verbose_name="Razón Social")
    nombre       = models.CharField(max_length=200, verbose_name="Nombre del Proveedor", blank=False, null=False)

    rfc = models.CharField(max_length=15, verbose_name="RFC", blank=True, null=True)
    telefono = models.CharField(max_length=20, verbose_name="Teléfono", blank=True, null=True)
    correo = models.EmailField(max_length=254, verbose_name="Correo Electrónico", blank=True, null=True)
    status = models.CharField(max_length=3,choices=STATUS_CHOICES,default=STATUS_ACTIVO,verbose_name="Estado")

    def __str__(self):
        if self.razon_social != "":
            return f"{self.codigo} - {self.razon_social}"
        else:
            return f"{self.codigo} - {self.nombre}"
        
        
    def save(self, *args, **kwargs):
        self.rfc = (self.rfc or "").upper().strip() 
        self.razon_social = (self.razon_social or "").upper().strip()
        self.nombre = (self.nombre or "").upper().strip()
        self.codigo = (self.codigo or "").upper().strip()
        self.telefono = (self.telefono or "").upper().strip()
        self.correo = (self.correo or "").upper().strip()
        
        
        return super().save(*args, **kwargs)


class DireccionProveedor(BaseDireccion):
    proveedor = models.ForeignKey(Proveedor, on_delete=models.CASCADE, related_name="direccion_proveedor")

    def __str__(self):
        return f"{self.calle}, {self.colonia}, {self.municipio.nombre}, {self.estado.nombre}"




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

    nombre = models.CharField(max_length=50, blank=False, null=False, verbose_name="Nombre")
    descripcion = models.TextField(blank=True, null=True,  verbose_name="Descripción")

    def __str__(self):
        return self.nombre
    
    def save(self, *args, **kwargs):
        self.nombre = self.nombre.strip()
        self.descripcion = self.descripcion.strip()
        super().save(*args, **kwargs)

class UnidadSAT(BaseModel):
    clave = models.CharField(max_length=10, unique=True,verbose_name="Clave")  # Ej: H87
    nombre = models.CharField(max_length=100, verbose_name="Nombre")             # Ej: Pieza
    
    def __str__(self):
        return f"({self.clave}) {self.nombre} "
    
    def save(self, *args, **kwargs):
        self.clave = self.clave.upper().strip()
        self.nombre = self.nombre.upper().strip()
        super().save(*args, **kwargs)
class Producto(BaseModel):
    STATUS_ACTIVO = "ACT"
    STATUS_INACTIVO = "INA"
    STATUS_DELETED = "DEL"
    STATUS_CHOICES = [
        (STATUS_ACTIVO, "Activo"),
        (STATUS_INACTIVO, "Inactivo"),
    ]
    status = models.CharField(max_length=3, choices=STATUS_CHOICES, default=STATUS_ACTIVO, verbose_name="Estado", blank=False, null=False)
    codigo = models.CharField(max_length=30, unique=True, verbose_name="Código" , blank=True, null=True)
    nombre = models.CharField(max_length=50, verbose_name="Nombre", blank=False, null=False)
    categoria = models.ForeignKey(Categoria,on_delete=models.SET_NULL,blank=True,null=True,verbose_name="Categoría",related_name="productos_categoria")
    imagen = models.ImageField(upload_to="productos/", blank=True, null=True)
    proveedores = models.ManyToManyField('Proveedor',blank=True)
    precio_especial = models.DecimalField(max_digits=10, decimal_places=2,blank=True,   default=0.0,  null=True,verbose_name="Precio Especial")
    precio_sub_dist = models.DecimalField(max_digits=10, decimal_places=2, blank=False, default=0.0,  null=True,verbose_name="Precio Sub Distribuidor")
    precio_mayoreo  = models.DecimalField(max_digits=10, decimal_places=2, blank=False, default=0.0,  null=True,verbose_name="Precio Mayoreo")
    precio_publico  = models.DecimalField(max_digits=10, decimal_places=2, blank=False, default=0.0,  null=True,verbose_name="Precio Público")
    unidad_sat = models.ForeignKey(UnidadSAT, on_delete=models.PROTECT, blank=True, null=True, default=None, verbose_name="Unidad SAT")
    clave_sat = models.CharField(max_length=10, blank=True, null=True, verbose_name="Clave SAT (Producto o Servicio)")
    iva = models.DecimalField(max_digits=5, decimal_places=2, default=0.16 , verbose_name="IVA")
    ieps = models.DecimalField(max_digits=5, decimal_places=2, default=0.0, verbose_name="IEPS")    
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")


    @property
    def detalle_precios(self):
        return f"Precio Especial: {self.precio_especial}\nPrecio Sub Distribuidor: {self.precio_sub_dist}\nPrecio Mayoreo: {self.precio_mayoreo}\nPrecio Público: {self.precio_publico}"
    
    def __str__(self):
        return f"({self.codigo}) {self.nombre} - {(self.unidad_sat.clave if self.unidad_sat else '')}"

    def save(self, *args, **kwargs):
        # Formatea nombre y descripción antes de guardar
        self.nombre = (self.nombre or "").strip().upper()
        self.descripcion = self.descripcion if self.descripcion else ""
        self.clave_sat = (self.clave_sat or "").strip()
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
    nombre = models.CharField(max_length=200, verbose_name="Nombre", blank=True, null=False,default=None)
    apellidos = models.CharField(max_length=200, verbose_name="Apellidos", blank=True, null=True)
    telefono = models.CharField(max_length=15, verbose_name="Teléfono", blank=True, null=True)
    email = models.EmailField(max_length=150,verbose_name="Correo Electrónico", blank=True, null=True)
    tipo = models.IntegerField(choices=TIPO_LIST,verbose_name="Tipo de Cliente",default=TIPO_ESTANDAR)
    rfc = models.CharField(max_length=15, verbose_name="RFC", blank=True, null=True)
    razon_social = models.CharField(max_length=180, verbose_name="Razón social", blank=True, null=True)
    uso_cfdi = models.CharField(max_length=100, verbose_name="Uso CFDI", blank=True, null=True,default=None)
    regimen_fiscal = models.ForeignKey(RegimenFiscal, on_delete=models.SET_NULL, blank=True, null=True,default=None, verbose_name="Régimen Fiscal", related_name="cliente_regimen_fiscal")
    #credito
    limite_credito = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Límite de crédito", default=None, blank=True, null=True)
    total_credito = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Total de crédito", default=0.00, blank=True, null=True)
    plazos_semanas = models.IntegerField(verbose_name="Plazos en semanas", default=0, blank=True, null=True)
    
    def __str__(self):
        return self.get_full_name
    
    
    @property
    def get_full_name(self):
        if self.nombre.strip() == "":
            return f"{self.codigo} - {self.razon_social}"
        return f"{self.codigo} - {self.nombre} {self.apellidos}" 
    
    def save(self, *args, **kwargs):
        self.email = (self.email or "").lower()
        self.telefono = (self.telefono or "").strip()
        self.rfc = (self.rfc or "").strip().upper()
        self.uso_cfdi = (self.uso_cfdi or "").strip().upper()
        self.razon_social = (self.razon_social or "").strip().upper()

        nombre = (self.nombre or "").strip()
        if nombre == "":
            self.nombre = self.razon_social
        else:
            self.nombre = nombre.upper()
            self.apellidos = (self.apellidos or "").strip().upper()

        super().save(*args, **kwargs)


class DireccionCliente(BaseDireccion):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name="direccion_cliente")