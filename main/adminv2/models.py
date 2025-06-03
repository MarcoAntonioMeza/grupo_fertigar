from django.db import models
from main.users.models import User

import time
# Create your models here.

class BaseModel(models.Model):
    created_at = models.BigIntegerField(blank=True, null=True)
    updated_at = models.BigIntegerField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_%(class)s_set")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="updated_%(class)s_set")

    class Meta:
        abstract = True
        #ordering = ['-created_at']
        
    def save(self, *args, **kwargs):
       
        if not self.created_at:
            self.created_at = int(time.time())
        else:
            self.updated_at = int(time.time())
            
        super().save(*args, **kwargs)