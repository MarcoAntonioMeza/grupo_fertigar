from django import forms
from django.contrib.auth.models import Group, Permission

class GroupForm(forms.ModelForm):
    permisos = forms.ModelMultipleChoiceField(
        queryset=Permission.objects.all(),
        required=False,
        widget=forms.SelectMultiple(attrs={
            'class': 'select2-multiple',  # Solo la clase para Select2
            'data-placeholder': 'Selecciona los permisos...',  # Placeholder
        }),
        label="Permisos"
    )

    class Meta:
        model = Group
        fields = ['name', 'permisos']
        labels = {
            'name': 'Nombre del Grupo',
        }
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Nombre del Grupo'
            })
        }
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            # Si estamos editando, cargar permisos existentes
            self.fields['permisos'].initial = self.instance.permissions.all()
        # Agregar clase para Select2 en todos los casos
        self.fields['permisos'].widget.attrs.update({
            'class': 'form-control select2-multiple  select2-container select2-container--default select2-container--below',
            'data-placeholder': 'Selecciona los permisos...'
        })

    def clean_permisos(self):
        permisos = self.cleaned_data['permisos']
        # Validar que al menos un permiso sea seleccionado si es necesario
        if not permisos.exists():
            raise forms.ValidationError("Debe seleccionar al menos un permiso.")
        return permisos

    def save(self, commit=True):
        group = super().save(commit=False)
        if commit:
            group.save()
            group.permissions.set(self.cleaned_data['permisos'])  # Asignar permisos seleccionados
        return group
