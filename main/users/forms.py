from allauth.account.forms import SignupForm
from allauth.socialaccount.forms import SignupForm as SocialSignupForm
from django.contrib.auth import forms as admin_forms
from django.utils.translation import gettext_lazy as _
from django import forms


from .models import User
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import  Group,Permission




class UserAdminChangeForm(admin_forms.UserChangeForm):
    class Meta(admin_forms.UserChangeForm.Meta):  # type: ignore[name-defined]
        model = User


class UserAdminCreationForm(admin_forms.UserCreationForm):
    """
    Form for User Creation in the Admin Area.
    To change user signup, see UserSignupForm and UserSocialSignupForm.
    """

    class Meta(admin_forms.UserCreationForm.Meta):  # type: ignore[name-defined]
        model = User
        error_messages = {
            "username": {"unique": _("This username has already been taken.")},
        }


class UserSignupForm(SignupForm):
    """
    Form that will be rendered on a user sign up section/screen.
    Default fields will be added automatically.
    Check UserSocialSignupForm for accounts created from social.
    """


class UserSocialSignupForm(SocialSignupForm):
    """
    Renders the form when user has signed up using social accounts.
    Default fields will be added automatically.
    See UserSignupForm otherwise.
    """



class UsuarioCreationForm(UserCreationForm):
  
    grupos = forms.ModelMultipleChoiceField(
        queryset=Group.objects.all(),  # Obtiene todos los grupos
        required=False,  # Puede ser opcional
        widget=forms.SelectMultiple(attrs={'class': 'form-control select2'}),  # Usando select2 para la interfaz
    )
    # Campo para seleccionar permisos
    permisos = forms.ModelMultipleChoiceField(
        queryset=Permission.objects.all(),  # Obtener todos los permisos
        required=False,  # Puede ser opcional
        widget=forms.SelectMultiple(attrs={'class': 'form-control'}),  # Selección múltiple
    )
    class Meta:
        model = User
        fields = ['username', 'email', 'nombre', 'segundo_nombre', 'apellido_paterno', 'apellido_materno', 
                  'access_to_app', 'password1', 'password2']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name == 'access_to_app':
                field.widget.attrs['class'] = 'form-check-input'
            else:
                field.widget.attrs['class'] = 'form-control'
            if field_name == 'segundo_nombre':
                field.required = False
           
                
                
   
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username=username).exclude(id=self.instance.id).exists():
            raise forms.ValidationError("Ya existe un User con este nombre de User.")
        return username

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exclude(id=self.instance.id).exists():
            raise forms.ValidationError("Ya existe un User con este correo electrónico.")
        return email

#==================================================================
#                            LOGIN
#==================================================================
class LoginForm(forms.Form):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control' , 'placeholder': 'Usuario'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Contraseña'}))