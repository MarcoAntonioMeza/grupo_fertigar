from allauth.account.decorators import secure_admin_login
from django.conf import settings
from django.contrib import admin
from django.contrib.auth import admin as auth_admin
from django.utils.translation import gettext_lazy as _

from .forms import UserAdminChangeForm, UserAdminCreationForm
from .models import User


@admin.register(User)
class CustomUserAdmin(auth_admin.UserAdmin):
    form = UserAdminChangeForm
    add_form = UserAdminCreationForm
    model = User

    fieldsets = (
        (None, {"fields": ("username", "password")}),
        (_("Información personal"), {
            "fields": (
                "nombre", "segundo_nombre", "apellido_paterno", "apellido_materno",
                "email", "telefono"
            )
        }),
        (_("Permisos"), {
            "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions"),
        }),
        (_("Fechas importantes"), {"fields": ("last_login", "date_joined")}),
        (_("Auditoría"), {"fields": ("created_by", "updated_by", "created_at", "updated_at")}),
        (_("App"), {"fields": ("access_to_app",)}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "password1", "password2"),
        }),
        (_("Información personal"), {
            "fields": (
                "nombre", "segundo_nombre", "apellido_paterno", "apellido_materno",
                "email", "telefono"
            )
        }),
        (_("Permisos"), {
            "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions"),
        }),
    )

    list_display = ["username", "email", "nombre", "apellido_paterno", "is_active", "is_staff"]
    search_fields = ["username", "email", "nombre", "apellido_paterno"]
    ordering = ["id"]

    def save_model(self, request, obj, form, change):
        raw_password = form.cleaned_data.get('password')
        if raw_password and not raw_password.startswith('pbkdf2_'):
            obj.set_password(raw_password)
        super().save_model(request, obj, form, change)


# Enlazar django-allauth al login del admin si está habilitado
if settings.DJANGO_ADMIN_FORCE_ALLAUTH:
    admin.autodiscover()
    admin.site.login = secure_admin_login(admin.site.login)

#admin.site.register(auth_admin.UserAdmin)  # type: ignore[call-arg]
