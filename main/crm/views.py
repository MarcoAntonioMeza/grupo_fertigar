from django.views.generic import (
    ListView,
    CreateView,
    UpdateView,
    DetailView,
    DeleteView,
)
from django.urls import reverse, reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin

from django.db.models import Q, OuterRef, Subquery
from django.db import transaction
from django.http import JsonResponse, HttpResponseRedirect, Http404
from django.core.paginator import Paginator, EmptyPage


from django.contrib import messages
from django.contrib.auth.decorators import permission_required
from django.contrib.auth.models import Permission

from .models import Almacen, DireccionAlmacen, Producto, Categoria, Agente

# FORMS
from .forms import AlmacenForm, DireccionAlmacenForm
from django.forms import inlineformset_factory

APP_NAME = "crm"

# =======================================================================
#                            VIEW  ALAMCENES
# ========================================================================
# CAN
MODEL_NAME_ALAMCEN = "almacen"
ALMACEN_VIEW = f"{APP_NAME}.can_view_{MODEL_NAME_ALAMCEN}"
ALMACEN_CREATE = f"{APP_NAME}.can_create_{MODEL_NAME_ALAMCEN}"
ALMACEN_UPDATE = f"{APP_NAME}.can_update_{MODEL_NAME_ALAMCEN}"
ALMACEN_DELETE = f"{APP_NAME}.can_baja_{MODEL_NAME_ALAMCEN}"
CAN_ALMACEN = {
    "view": ALMACEN_VIEW,
    "create": ALMACEN_CREATE,
    "update": ALMACEN_UPDATE,
    "delete": ALMACEN_DELETE,
}
BASE_TEMPLATE_ALMACEN = "crm/almacen/"


# =======================================================================
#                            VIEW  INDEX
# ========================================================================
class AlmacenListView(LoginRequiredMixin, ListView):
    model = Almacen
    template_name = BASE_TEMPLATE_ALMACEN + "index.html"
    # context_object_name = "almacenes"
    permission_required = ALMACEN_VIEW
    raise_exception = True

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "Almacenes"
        context["can"] = {
            key: self.request.user.has_perm(value) for key, value in CAN_ALMACEN.items()
        }
        return context


# DETAIL
class AlmacenDetailView(LoginRequiredMixin, DetailView):
    model = Almacen
    template_name = BASE_TEMPLATE_ALMACEN + "view.html"
    permission_required = ALMACEN_VIEW
    raise_exception = True
    context_object_name = "model"
    pk_url_kwarg = "id"

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.status == Almacen.STATUS_DELETE:
            raise Http404("PAGINA NO ENCONTRADA")
        # if not self.request.user.has_perm(ALMACEN_VIEW):
        return obj

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # context["title"] = "ALMACENES -"
        context["title"] = f"ALMACENES - {self.object.nombre}".upper()
        context["direccion"] = DireccionAlmacen.objects.filter(
            almacen=self.object
        ).first()
        context["can"] = {
            key: self.request.user.has_perm(value) for key, value in CAN_ALMACEN.items()
        }
        print(context["direccion"], "*************")
        return context


# CREATE
class AlmacenCreateView(LoginRequiredMixin, CreateView):
    model = Almacen
    form_class = AlmacenForm
    template_name = BASE_TEMPLATE_ALMACEN + "create.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "ALMACENES - CREAR"
        if self.request.POST:
            context["direccion_form"] = DireccionAlmacenForm(self.request.POST)
        else:
            context["direccion_form"] = DireccionAlmacenForm()
        return context

    def get_success_url(self):
        messages.success(self.request, "Almacén creado exitosamente!")
        return reverse("crm_almacen_view", kwargs={"id": self.object.pk})

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        context = self.get_context_data()
        direccion_form = context["direccion_form"]  # Usamos el form del contexto

        if not direccion_form.is_valid():
            messages.error(
                self.request, "Por favor corrija los errores en la dirección."
            )
            return self.render_to_response(self.get_context_data(form=form))

        try:
            # Primero guardamos el almacén
            self.object = form.save()

            # Luego guardamos la dirección asociada al almacén
            if (
                direccion_form.cleaned_data.get("estado")
                and direccion_form.cleaned_data.get("municipio")
                and direccion_form.cleaned_data.get("colonia")
            ):
                direccion = direccion_form.save(commit=False)
                direccion.almacen = self.object  # Asignamos la relación
                direccion.save()

        except Exception as e:
            messages.error(self.request, f"Error al guardar: {str(e)}")
            return self.render_to_response(self.get_context_data(form=form))

        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "Por favor corrija los errores en el formulario.")
        return super().form_invalid(form)


# update
class AlmacenUpdateView(LoginRequiredMixin, UpdateView):
    model = Almacen
    form_class = AlmacenForm
    template_name = BASE_TEMPLATE_ALMACEN + "update.html"
    permission_required = ALMACEN_UPDATE
    raise_exception = True
    pk_url_kwarg = "id"
    context_object_name = "model"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = f"ALMACENES - {self.object} - EDITAR"

        # Obtenemos la primera dirección asociada (o creamos formulario vacío si no existe)
        direccion_instance = self.object.direccion_almacen.first()

        if self.request.POST:
            context["direccion_form"] = DireccionAlmacenForm(
                self.request.POST, instance=direccion_instance
            )
        else:
            context["direccion_form"] = DireccionAlmacenForm(
                instance=direccion_instance
            )
        return context

    def get_success_url(self):
        messages.success(self.request, "Almacén actualizado exitosamente!")
        return reverse("crm_almacen_view", kwargs={"id": self.object.pk})

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.status == Almacen.STATUS_DELETE:
            raise Http404("Este almacén ha sido eliminado y no puede ser editado")
        return obj

    def form_valid(self, form):
        form.instance.updated_by = self.request.user
        context = self.get_context_data()
        direccion_form = context["direccion_form"]

        if not direccion_form.is_valid():
            messages.error(
                self.request, "Por favor corrija los errores en la dirección."
            )
            return self.render_to_response(self.get_context_data(form=form))

        try:
            with transaction.atomic():
                # Guardamos primero el almacén
                self.object = form.save()
                if (
                    direccion_form.cleaned_data.get("estado")
                    and direccion_form.cleaned_data.get("municipio")
                    and direccion_form.cleaned_data.get("colonia")
                ):

                    # Manejo de la dirección
                    direccion = direccion_form.save(commit=False)
                    direccion.almacen = self.object  # Asignamos la relación
                    direccion.save()

                    # Eliminamos direcciones antiguas si es necesario
                    direcciones_anteriores = self.object.direccion_almacen.exclude(
                        pk=direccion.pk
                    )
                    direcciones_anteriores.delete()

        except Exception as e:
            messages.error(self.request, f"Error al actualizar: {str(e)}")
            # logger.error(f"Error actualizando almacén: {str(e)}")
            return self.render_to_response(self.get_context_data(form=form))

        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "Por favor corrija los errores en el formulario.")
        return super().form_invalid(form)


# delete
class AlmacenDeleteView(LoginRequiredMixin, DeleteView):
    model = Almacen
    permission_required = ALMACEN_DELETE
    raise_exception = True
    pk_url_kwarg = "id"
    success_url = reverse_lazy("crm_almacen_index")

    def delete(self, request, *args, **kwargs):
        """
        Sobrescribe el método delete para cambiar el estado en lugar de eliminar
        """
        self.object = self.get_object()

        # Cambiamos el estado a "eliminado" en lugar de borrar
        self.object.status = Almacen.STATUS_DELETE
        self.object.deleted_by = self.request.user  # Si tienes este campo
        self.object.save()

        messages.success(request, "Almacén marcado como eliminado correctamente")
        return HttpResponseRedirect(self.get_success_url())

    def post(self, request, *args, **kwargs):
        """
        Maneja las solicitudes POST (equivalente a delete)
        """
        return self.delete(request, *args, **kwargs)

    def get(self, request, *args, **kwargs):
        """
        Maneja las solicitudes GET (equivalente a get_object)
        """
        return self.delete(request, *args, **kwargs)

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.status == Almacen.STATUS_DELETE:
            raise Http404("Este almacén ya ha sido eliminado")
        return obj
