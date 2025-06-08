from django.db import models
from main.users.models import User
from main.direccion.models import CodigoPostal, Estado, Municipio, Colonia

import time
from datetime import datetime


# Create your models here.


class BaseModel(models.Model):
    created_at = models.BigIntegerField(blank=True, null=True, default=None)
    updated_at = models.BigIntegerField(blank=True, null=True, default=None)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_%(class)s_set",
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_%(class)s_set",
    )

    class Meta:
        abstract = True
        # ordering = ['-created_at']

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
        current_time = int(time.time())
        if self._state.adding:
            self.created_at = current_time
            #self.updated_at = None
            #print("Created at:", self.created_at)
        else:
            self.updated_at = current_time
            #print("Updated at:", self.updated_at)
        #if self.created_by != None:
        #    self.updated_at = current_time

        super().save(*args, **kwargs)


class BaseDireccion(models.Model):
    estado = models.ForeignKey(Estado, on_delete=models.CASCADE)
    municipio = models.ForeignKey(Municipio, on_delete=models.CASCADE)
    codigo_postal = models.ForeignKey(CodigoPostal, on_delete=models.CASCADE, null=True)
    colonia = models.ForeignKey(Colonia, on_delete=models.CASCADE)
    calle = models.CharField(max_length=200)
    numero_exterior = models.CharField(max_length=20, null=True, blank=True)
    numero_interior = models.CharField(max_length=20, null=True, blank=True)
    
    

    class Meta:
        abstract = True
        # ordering = ['-created_at']


    def save(self, *args, **kwargs):
        self.numero_exterior = self.numero_exterior.upper().strip() if self.numero_exterior else "N/A"
        self.numero_interior = self.numero_interior.upper().strip() if self.numero_interior else "N/A"
        self.calle = self.calle.upper().strip() if self.calle else "N/A"
        super().save(*args, **kwargs)