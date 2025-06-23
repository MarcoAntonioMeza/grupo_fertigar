import time
from datetime import datetime

from django.urls import reverse
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser


from main.direccion.models import   CodigoPostal, Estado, Municipio, Colonia
from django.db import models



class User(AbstractUser):
    TIPO_ADMIN  = 10
    TIPO_USER   = 20
    TIPO_AGENTE = 30
    
    TIPO_CHOICES = (
        (TIPO_ADMIN, 'Administrador'),
        (TIPO_USER, 'Usuario'),
        (TIPO_AGENTE,'Agente'),
    )
     
    nombre = models.CharField(max_length=200, null=False, verbose_name='Primer Nombre')
    tipo = models.PositiveSmallIntegerField(
        choices=TIPO_CHOICES, 
        default=TIPO_USER, 
        verbose_name='Tipo de Usuario'
    )
    segundo_nombre = models.CharField(max_length=200, null=True, blank=True, verbose_name='Segundo Nombre')
    apellido_paterno = models.CharField(max_length=200, null=True,blank=True, verbose_name='Apellido Paterno')
    apellido_materno = models.CharField(max_length=200, null=True, blank=True, verbose_name='Apellido Materno')
    telefono = models.CharField(max_length=15, null=True, blank=True, verbose_name='Teléfono', default=None)
    access_to_app = models.BooleanField(default=True, verbose_name='Puede acceder a la app')
    created_at = models.IntegerField(default=True, null=True, blank=True, verbose_name='Fecha de creación')
    updated_at = models.IntegerField(default=None,null=True, blank=True, verbose_name='Fecha de actualización')
    created_by = models.ForeignKey(
        'self', 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL, 
        related_name='usuarios_creados',
        verbose_name='Creado por'
    )
    updated_by = models.ForeignKey(
        'self', 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL, 
        related_name='usuarios_actualizados',
        verbose_name='Actualizado por'
    )
    
    def full_name(self):
        return f"{self.nombre} {self.segundo_nombre or ''} {self.apellido_paterno} {self.apellido_materno}"
    
    def full_name_bread(self):
        return f"{self.nombre} {self.segundo_nombre or ''} {self.apellido_paterno} {self.apellido_materno} [{self.id}]"
    
    def __str__(self):
        return self.username
    
    @property
    def get_created_at(self):
        return (
            datetime.fromtimestamp(self.created_at).strftime("%d-%h-%Y %H:%M:%S")
            if self.created_at
            else "N/A"
        )

    @property
    def get_updated_at(self):
        return (
            datetime.fromtimestamp(self.updated_at).strftime("%d-%h-%Y %H:%M:%S")
            if self.updated_at and self.updated_by != None 
            else "N/A"
        )

    @property
    def get_created_by(self):
        return self.created_by.full_name() if self.created_by else "N/A"

    @property
    def get_updated_by(self):
        return self.updated_by.full_name() if self.updated_by else "N/A"
    
    
    
    def save(self, *args, **kwargs):
        self.nombre = (self.nombre or "").strip().upper()
        self.segundo_nombre = (self.segundo_nombre or "").strip().upper() 
        self.apellido_paterno = (self.apellido_paterno or "").strip().upper() 
        self.apellido_materno = (self.apellido_materno or "").strip().upper() 
    
        
        
        super(User, self).save(*args, **kwargs)


    def get_absolute_url(self) -> str:
        """Get URL for user's detail view.

        Returns:
            str: URL for user detail.

        """
        return reverse("users:detail", kwargs={"username": self.username})





class Direccion(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='direcciones')
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)
    municipio = models.ForeignKey(Municipio, on_delete=models.CASCADE)
    codigo_postal = models.ForeignKey(CodigoPostal, on_delete=models.CASCADE,null=True)
    colonia = models.ForeignKey(Colonia, on_delete=models.CASCADE)
    calle = models.CharField(max_length=200)
    numero_exterior = models.CharField(max_length=20, null=True, blank=True)
    numero_interior = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.calle}, {self.colonia}, {self.municipio.nombre}, {self.estado.nombre}"