from django.views.generic import (
    CreateView,
    UpdateView,
    DetailView,
    DeleteView,
    TemplateView
)
from django.urls import reverse, reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db import transaction
from django.http import JsonResponse, HttpResponseRedirect, Http404


from django.contrib import messages
from django.contrib.auth.decorators import permission_required


#MODELS
from .models import (Almacen, DireccionAlmacen, Cliente, Proveedor, Producto)
# FORMS
from .forms import (AlmacenForm, DireccionAlmacenForm,
                    ClienteForm, DireccionClienteForm,
                    ProveedorForm, DireccionProveedorForm,
                    ProductoForm)

# CONSTAS DE INFORMACION
from .services.data_tables import clientes_list, proveedor_list,producto_list,almacen_list

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
class AlmacenListView(LoginRequiredMixin, TemplateView):
    template_name = BASE_TEMPLATE_ALMACEN + "index.html"
    # context_object_name = "almacenes"
    permission_required = ALMACEN_VIEW
    raise_exception = True

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "ALMACEN"
        context["sub_title"] = "CATALOGOS"

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
        context["title"] = f"ALMACEN - {self.object.nombre}".upper()
        context["sub_title"] = "CATALOGOS"
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
    permission_required = ALMACEN_CREATE
    raise_exception = True

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "ALMACEN - CREAR"
        context["sub_title"] = "CATALOGOS"

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
        context["title"] = f"ALMACEN - {self.object} - EDITAR"
        context["sub_title"] = "CATALOGOS"

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


@permission_required(ALMACEN_VIEW, raise_exception=True)
def almacen_list_datatable(request):
    draw = int(request.GET.get("draw", 0))
    start = int(request.GET.get("start", 0))
    length = int(request.GET.get("length", 10))
    search_value = request.GET.get("search[value]", "").strip()
    #user_id = request.user.id
    #campo_formativo = request.GET.get("campo_formativo", "").strip()
    #grupo = request.GET.get("grupo", "").strip()
    
    return JsonResponse(almacen_list(draw=draw, start=start, length=length, search_value=search_value))




# =====================================================
#                  CLIENTES
# =====================================================

# CAN
MODEL_NAME_CLIENTE = "cliente"
CLIENTE_VIEW = f"{APP_NAME}.can_view_{MODEL_NAME_CLIENTE}"
CLIENTE_CREATE = f"{APP_NAME}.can_create_{MODEL_NAME_CLIENTE}"
CLIENTE_UPDATE = f"{APP_NAME}.can_update_{MODEL_NAME_CLIENTE}"
CLIENTE_DELETE = f"{APP_NAME}.can_baja_{MODEL_NAME_CLIENTE}"
CAN_CLIENTE = {
    "view": CLIENTE_VIEW,
    "create": CLIENTE_CREATE,
    "update": CLIENTE_UPDATE,
    "delete": CLIENTE_DELETE,
}
BASE_TEMPLATE_CLIENTE = "crm/cliente/"
# LIST VIEW
class ClienteListView(LoginRequiredMixin, TemplateView):
    permission_required = CLIENTE_VIEW
    raise_exception = True
    template_name = BASE_TEMPLATE_CLIENTE + "index.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "CLIENTES"
        context["sub_title"] = "CATALOGOS"

        context["can"] = {
            key: self.request.user.has_perm(value) for key, value in CAN_CLIENTE.items()
        }
        return context


class ClienteCreateView(LoginRequiredMixin, CreateView):
    model = Cliente
    permission_required = CLIENTE_CREATE
    raise_exception = True
    form_class = ClienteForm
    template_name = BASE_TEMPLATE_CLIENTE + "create.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "CLIENTE - CREAR"
        context["sub_title"] = "CATALOGOS"
        if self.request.POST:
            context["direccion_form"] = DireccionClienteForm(self.request.POST)
        else:
            context["direccion_form"] = DireccionClienteForm()
        return context

    def get_success_url(self):
        messages.success(self.request, "Cliente creado exitosamente!")
        return reverse("crm_cliente_view", kwargs={"id": self.object.pk})

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
            # Primero guardamos el cliente
            self.object = form.save(commit=False)
            self.object.save()  # Aquí se ejecuta BaseModel.save() (creación o actualización)
            # Luego guardamos la dirección asociada al cliente
            if (
                direccion_form.cleaned_data.get("estado")
                and direccion_form.cleaned_data.get("municipio")
                and direccion_form.cleaned_data.get("colonia")
            ):
                direccion = direccion_form.save(commit=False)
                direccion.cliente = self.object  # Asignamos la relación
                direccion.save()
        except Exception as e:
            messages.error(self.request, f"Error al guardar: {str(e)}")
            return self.render_to_response(self.get_context_data(form=form))

        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(
            self.request,
            f"Por favor corrija los errores en el formulario.  {form.errors}",
        )
        return super().form_invalid(form)


class ClienteDetailView(LoginRequiredMixin, DetailView):
    model = Cliente
    permission_required = CLIENTE_VIEW
    raise_exception = True
    template_name = BASE_TEMPLATE_CLIENTE + "view.html"
    pk_url_kwarg = "id"
    context_object_name = "model"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = f"CLIENTE - {self.object.get_full_name}"
        context["sub_title"] = "CATALOGOS"
        context["direccion"] = self.object.direccion_cliente.first()
        context["labels"] = {
            field.name: field.verbose_name for field in Cliente._meta.fields
        }
        context["can"] = {
            key: self.request.user.has_perm(value) for key, value in CAN_CLIENTE.items()
        }
        return context

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.status == Cliente.STATUS_DELETE:
            raise Http404("EELEMENTO NO ENCONTRADO")
        return obj


class ClienteUpdateView(LoginRequiredMixin, UpdateView):
    model = Cliente
    permission_required = CLIENTE_UPDATE
    raise_exception = True
    form_class = ClienteForm
    template_name = BASE_TEMPLATE_CLIENTE + "update.html"
    pk_url_kwarg = "id"
    context_object_name = "model"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = f"CLIENTE - {self.object.get_full_name}"
        context["sub_title"] = "CATALOGOS"
        # context['direccion_form'] = self.object.direccion_cliente.first()
        context["can"] = {
            key: self.request.user.has_perm(value) for key, value in CAN_CLIENTE.items()
        }
        instancia = self.object.direccion_cliente.first()
        context["direccion_form"] = (
            DireccionClienteForm(self.request.POST, instance=instancia)
            if self.request.method == "POST"
            else DireccionClienteForm(instance=instancia)
        )

        return context

    def get_success_url(self):
        messages.success(self.request, "Cliente actualizado exitosamente!")
        return reverse("crm_cliente_view", kwargs={"id": self.object.pk})

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.status == Cliente.STATUS_DELETE:
            raise Http404("ELEMENTO NO ENCONTRADO")
        return obj

    def form_valid(self, form):
        form.instance.updated_by = self.request.user
        context = self.get_context_data()
        direccion_form = context["direccion_form"]  # Usamos el form del contexto

        if not direccion_form.is_valid():
            messages.error(
                self.request, "Por favor corrija los errores en la dirección."
            )
            return self.render_to_response(self.get_context_data(form=form))

        try:
            with transaction.atomic():
                # Primero guardamos el cliente
                self.object = form.save()
                # Luego guardamos la dirección asociada al cliente
                if (
                    direccion_form.cleaned_data.get("estado")
                    and direccion_form.cleaned_data.get("municipio")
                    and direccion_form.cleaned_data.get("colonia")
                ):
                    direccion = direccion_form.save(commit=False)
                    direccion.cliente = self.object  # Asignamos la relación
                    direccion.save()

                    dirs_anteriores = self.object.direccion_cliente.exclude(
                        pk=direccion.pk
                    )
                    dirs_anteriores.delete()
        except Exception as e:
            messages.error(self.request, f"Error al guardar: {str(e)}")
            return self.render_to_response(self.get_context_data(form=form))

        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, "Por favor corrija los errores en el formulario.")
        return super().form_invalid(form)


class ClienteDeleteView(LoginRequiredMixin, DeleteView):
    model = Cliente
    permission_required = CLIENTE_DELETE
    raise_exception = True
    pk_url_kwarg = "id"
    success_url = reverse_lazy("crm_cliente_index")
    
    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.status = Cliente.STATUS_DELETE
        self.object.save()
        messages.success(self.request, "Cliente eliminado exitosamente!")
        return HttpResponseRedirect(self.get_success_url())
    
    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.status == Cliente.STATUS_DELETE:
            raise Http404("ELEMENTO NO ENCONTRADO")
        return obj
    
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
    
    
@permission_required(CLIENTE_VIEW, raise_exception=True)
def cliente_list_datatable(request):
    draw = int(request.GET.get("draw", 0))
    start = int(request.GET.get("start", 0))
    length = int(request.GET.get("length", 10))
    search_value = request.GET.get("search[value]", "").strip()
    #user_id = request.user.id
    #campo_formativo = request.GET.get("campo_formativo", "").strip()
    #grupo = request.GET.get("grupo", "").strip()
    
    return JsonResponse(clientes_list(draw=draw, start=start, length=length, search_value=search_value))



#=====================================================
#                  PROVEEDORES
#======================================================
# CAN
MODEL_NAME_PROVEEDOR = "proveedor"
PROVEEDOR_VIEW = f"{APP_NAME}.can_view_{MODEL_NAME_PROVEEDOR}"
PROVEEDOR_CREATE = f"{APP_NAME}.can_create_{MODEL_NAME_PROVEEDOR}"
PROVEEDOR_UPDATE = f"{APP_NAME}.can_update_{MODEL_NAME_PROVEEDOR}"
PROVEEDOR_DELETE = f"{APP_NAME}.can_baja_{MODEL_NAME_PROVEEDOR}"
CAN_PROVEEDOR = {
    "view":   PROVEEDOR_VIEW,
    "create": PROVEEDOR_CREATE,
    "update": PROVEEDOR_UPDATE,
    "delete": PROVEEDOR_DELETE,
}
BASE_TEMPLATE_PROVEEDOR = "crm/proveedor/"

#index
class ProveedorListView(LoginRequiredMixin, TemplateView):
    template_name = f"{BASE_TEMPLATE_PROVEEDOR}index.html"
    permission_required = PROVEEDOR_VIEW
    raise_exception = True
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "PROVEEDORES"
        context["sub_title"] = "CATALOGOS"

        context["can"] = {
            key: self.request.user.has_perm(value) for key, value in CAN_PROVEEDOR.items()
        }
        return context

#detail
class ProveedorDetailView(LoginRequiredMixin, DetailView):
    model = Proveedor
    permission_required = PROVEEDOR_VIEW
    raise_exception = True
    pk_url_kwarg = "id"
    template_name = f"{BASE_TEMPLATE_PROVEEDOR}view.html"
    context_object_name = "model"
    
    
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = f"PROVEEDORES {self.object}".upper
        context["sub_title"] = "CATALOGOS"
        context["direccion"] = self.object.direccion_proveedor.first()
        context["can"] = {
            key: self.request.user.has_perm(value) for key, value in CAN_PROVEEDOR.items()
        }
        context["labels"] = {
            field.name: field.verbose_name for field in Proveedor._meta.fields
        }
        return context

    def get_object(self, queryset=None):
        obj = super().get_object(queryset)
        if obj.status == Proveedor.STATUS_DELETE:
            raise Http404("ELEMENTO NO ENCONTRADO")
        return obj
  
#create
class ProveedorCreateView(LoginRequiredMixin, CreateView):
    model = Proveedor
    permission_required = PROVEEDOR_CREATE
    raise_exception = True
    form_class = ProveedorForm
    template_name = f"{BASE_TEMPLATE_PROVEEDOR}create.html"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "PROVEEDORES"
        context["sub_title"] = "CATALOGOS"
        context["can"] = {
            key: self.request.user.has_perm(value) for key, value in CAN_PROVEEDOR.items()
        }
        if self.request.method == "POST":
            context["direccion_form"] = DireccionProveedorForm(self.request.POST)
        else:
            context["direccion_form"] = DireccionProveedorForm()
        return context
    
    
    def get_success_url(self):
        messages.success(self.request, "Proveedor creado exitosamente!")
        return reverse_lazy("crm_proveedor_view",kwargs={"id": self.object.pk})
    
    def form_valid(self, form):
        form.instance.created_by = self.request.user
        context = self.get_context_data()
        direccion_form = context["direccion_form"]
    
        try:
            with transaction.atomic():
                self.object = form.save(commit=False)
                self.object.save()
    
                # Validar primero el formulario de dirección
                if direccion_form.is_valid():
                    direccion_data = direccion_form.cleaned_data
    
                    # Verifica si algún campo relevante de dirección fue proporcionado
                    hay_direccion = any([
                        direccion_data.get("estado"),
                        direccion_data.get("municipio"),
                        direccion_data.get("colonia"),
                        direccion_data.get("calle"),
                        direccion_data.get("codigo_postal"),
                        direccion_data.get("numero_exterior"),
                    ])
    
                    if hay_direccion:
                        direccion = direccion_form.save(commit=False)
                        direccion.proveedor = self.object
                        direccion.save()
                else:
                    # Si se intentó llenar y tiene errores, mostrar mensaje
                    direccion_data = direccion_form.cleaned_data if direccion_form.is_bound else {}
                    if any(direccion_data.values()):
                        messages.error(self.request, "Por favor corrija los errores en el formulario de dirección.")
                        raise ValueError("Formulario de dirección no válido.")
    
        except Exception as e:
            messages.error(self.request, f"Error al guardar: {str(e)}")
            return self.render_to_response(self.get_context_data(form=form))
    
        return super().form_valid(form)
            
    def form_invalid(self, form):
        messages.error(
            self.request,
            f"Por favor corrija los errores en el formulario.  {form.errors}",
        )
        return super().form_invalid(form)

#update
class ProveedorUpdateView(LoginRequiredMixin, UpdateView):
    model = Proveedor
    permission_required = PROVEEDOR_UPDATE
    raise_exception = True
    form_class = ProveedorForm
    template_name = f"{BASE_TEMPLATE_PROVEEDOR}update.html"
    pk_url_kwarg = "id"
    context_object_name = "model"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = f"PROVEEDORES - {self.object}- EDITAR".upper()
        context["sub_title"] = "CATALOGOS"
        context["can"] = {
            key: self.request.user.has_perm(value) for key, value in CAN_PROVEEDOR.items()
        }
        instancia = self.object.direccion_proveedor.first()
        context["direccion_form"] = (
            DireccionProveedorForm(self.request.POST,instance=instancia)
            if self.request.method == "POST"
            else DireccionProveedorForm(instance=instancia)
            )
        return context

    def get_success_url(self):
        messages.success(self.request, "Proveedor actualizado exitosamente!")
        return reverse_lazy("crm_proveedor_view",kwargs={"id": self.object.id})

    def get_object(self, queryset = None):
        model = super().get_object(queryset)
        if model.status == Proveedor.STATUS_DELETE:
            raise Http404("ELEMENTO NO ENCONTRADO")
        return model
    
    def form_valid(self, form):
        form.instance.updated_by = self.request.user
        context = self.get_context_data()
        direccion_form = context["direccion_form"]

        if not direccion_form.is_valid():
            messages.error(self.request, "Por favor corrija los errores en el formulario.")
            return self.render_to_response(self.get_context_data(form=form))

        try:
            with transaction.atomic():
                self.object = form.save(commit=False)
                self.object.save()

                direccion_data = direccion_form.cleaned_data
                hay_direccion = any([
                    direccion_data.get("estado"),
                    direccion_data.get("municipio"),
                    direccion_data.get("colonia"),
                    direccion_data.get("calle"),
                    direccion_data.get("codigo_postal"),
                    direccion_data.get("numero_exterior"),
                ])

                if hay_direccion:
                    direccion = direccion_form.save(commit=False)
                    direccion.proveedor = self.object
                    direccion.save()

                    # Eliminar direcciones anteriores distintas de la actual
                    self.object.direccion_proveedor.exclude(pk=direccion.pk).delete()
                else:
                    # Si hay datos pero incompletos
                    if any(direccion_data.values()):
                        messages.error(self.request, "Por favor corrija los errores en el formulario de dirección.")
                        raise ValueError("Formulario de dirección incompleto.")
                    else:
                        # No hay dirección y no se creó una nueva, eliminamos todas las anteriores
                        self.object.direccion_proveedor.all().delete()

        except Exception as e:
            messages.error(self.request, f"Error al guardar: {str(e)}")
            return self.render_to_response(self.get_context_data(form=form))

        return super().form_valid(form)
    
    
    def form_invalid(self, form):
        messages.error(self.request, "Por favor corrija los errores en el formulario.")
        return super().form_invalid(form)
#delete
class ProveedorDeleteView(LoginRequiredMixin, DeleteView):
    model = Proveedor
    permission_required = PROVEEDOR_DELETE
    raise_exception = True
    pk_url_kwarg = "id"
    success_url = reverse_lazy("crm_proveedor_index")
    
    def get_object(self, queryset = None):
        model = super().get_object(queryset)
        if model.status == Proveedor.STATUS_DELETE:
            raise Http404("ELEMENTO NO ENCONTRADO")
        return model
    
    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.status = Proveedor.STATUS_DELETE
        self.object.save()
        messages.success(request, "Proveedor eliminado exitosamente!")
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

@permission_required(PROVEEDOR_VIEW, raise_exception=True)
def proveedor_list_datatable(request):
    draw = int(request.GET.get("draw", 0))
    start = int(request.GET.get("start", 0))
    length = int(request.GET.get("length", 10))
    search_value = request.GET.get("search[value]", "").strip()
    #user_id = request.user.id
    #campo_formativo = request.GET.get("campo_formativo", "").strip()
    #grupo = request.GET.get("grupo", "").strip()
    
    return JsonResponse(proveedor_list(draw=draw, start=start, length=length, search_value=search_value))

#==================================================================================
#                                  PRODUCTOS
#==================================================================================

MODEL_NAME_PRODUCTO = "producto"
PRODUCTO_VIEW = f"{APP_NAME}.can_view_{MODEL_NAME_PRODUCTO}"
PRODUCTO_CREATE = f"{APP_NAME}.can_create_{MODEL_NAME_PRODUCTO}"
PRODUCTO_UPDATE = f"{APP_NAME}.can_update_{MODEL_NAME_PRODUCTO}"
PRODUCTO_DELETE = f"{APP_NAME}.can_baja_{MODEL_NAME_PRODUCTO}"
CAN_PRODUCTO = {
    "view":   PRODUCTO_VIEW,
    "create": PRODUCTO_CREATE,
    "update": PRODUCTO_UPDATE,
    "delete": PRODUCTO_DELETE,
}
BASE_TEMPLATE_PRODUCTO = "crm/producto/"

#INDEX
class ProductoIndexView(LoginRequiredMixin, TemplateView):
    template_name = f"{BASE_TEMPLATE_PRODUCTO}index.html"
    permission_required = PRODUCTO_VIEW
    raise_exception = True
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "PRODUCTOS"
        context["sub_title"] = "CATALOGOS"

        context["can"] = {
            key: self.request.user.has_perm(value) for key, value in CAN_PRODUCTO.items()
        }
        return context
#CREATE
class ProductoCreateView(LoginRequiredMixin, CreateView):
    model = Producto
    permission_required = PRODUCTO_CREATE
    raise_exception = True
    form_class = ProductoForm
    template_name = f"{BASE_TEMPLATE_PRODUCTO}create.html"
    

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = "PRODUCTO"
        context["sub_title"] = "CATALOGOS"
        context["action"] = "create"
        return context
    
    def get_success_url(self):
        messages.success(self.request, "Producto creado exitosamente!")
        return reverse_lazy("crm_producto_view",kwargs={"id": self.object.pk})
    

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        try:
            with transaction.atomic():
                self.object = form.save(commit=False)
                self.object.save()
        except Exception as e:
            messages.error(self.request, f"Error al guardar: {str(e)}")
            return self.render_to_response(self.get_context_data(form=form))
        
#UPDATE
class ProductoUpdateView(LoginRequiredMixin, UpdateView):
    model = Producto
    permission_required = PRODUCTO_UPDATE
    raise_exception = True
    form_class = ProductoForm
    template_name = f"{BASE_TEMPLATE_PRODUCTO}update.html"
    pk_url_kwarg = "id"
    context_object_name = "model"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = f"PRODUCTOS - {self.object} - EDITAR"
        context["sub_title"] = "CATALOGOS"
        context["can"] = {
            key: self.request.user.has_perm(value) for key, value in CAN_PRODUCTO.items()
        }
        return context

    def get_success_url(self):
        messages.success(self.request, "Producto actualizado exitosamente!")
        return reverse_lazy("crm_producto_view",kwargs={"id": self.object.pk})

    
    def get_object(self, queryset = None):
        model = super().get_object(queryset)
        if model.status == Producto.STATUS_DELETE:
            raise Http404("ELEMENTO NO ENCONTRADO")
        return model
    
    def form_valid(self, form):
        form.instance.updated_by = self.request.user
        try:
            with transaction.atomic():
                self.object = form.save(commit=False)
                self.object.save()
        except Exception as e:
            messages.error(self.request, f"Error al guardar: {str(e)}")
            return self.render_to_response(self.get_context_data(form=form))
        return super().form_valid(form)
    
    def form_invalid(self, form):
        messages.error(
            self.request,
            f"Por favor corrija los errores en el formulario.  {form.errors}",
        )
        return super().form_invalid(form)
    
#detail
class ProductoDetailView(LoginRequiredMixin, DetailView):
    model = Producto
    permission_required = PRODUCTO_VIEW
    raise_exception = True
    pk_url_kwarg = "id"
    template_name = f"{BASE_TEMPLATE_PRODUCTO}view.html"
    context_object_name = "model"
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["title"] = f"PRODUCTOS - {self.object} - DETALLE"
        context["sub_title"] = "CATALOGOS"
        context["can"] = {
            key: self.request.user.has_perm(value) for key, value in CAN_PRODUCTO.items()
        }
        context["labels"] = {
            field.name: field.verbose_name for field in Producto._meta.fields
        }
        return context
    
    
    def get_object(self, queryset = None):
        model = super().get_object(queryset)
        if model.status == Producto.STATUS_DELETE:
            raise Http404("ELEMENTO NO ENCONTRADO")
        return model
#delete 
class ProductoDeleteView(LoginRequiredMixin, DeleteView):
    model = Producto
    permission_required = PRODUCTO_DELETE
    raise_exception = True
    pk_url_kwarg = "id"
    success_url = reverse_lazy("crm_producto_index")
    
    def get_object(self, queryset = None):
        model = super().get_object(queryset)
        if model.status == Producto.STATUS_DELETE:
            raise Http404("ELEMENTO NO ENCONTRADO")
        return model
    
    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.status = Producto.STATUS_DELETE
        self.object.save()
        messages.success(request, "Poducto eliminado exitosamente!")
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
    
    
@permission_required(PROVEEDOR_VIEW, raise_exception=True)
def producto_list_datatable(request):
    draw = int(request.GET.get("draw", 0))
    start = int(request.GET.get("start", 0))
    length = int(request.GET.get("length", 10))
    search_value = request.GET.get("search[value]", "").strip()
    #user_id = request.user.id
    #campo_formativo = request.GET.get("campo_formativo", "").strip()
    #grupo = request.GET.get("grupo", "").strip()
    
    return JsonResponse(producto_list(draw=draw, start=start, length=length, search_value=search_value))
    

        
        
        
        
        