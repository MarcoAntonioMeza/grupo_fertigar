from django.contrib.auth.decorators import login_required
from django.urls import path
from . import views
app = 'crm'
urlpatterns = [
    ###======================================================================
    ###                           CLIENTE
    ###======================================================================
    path('cliente/',                        views.ClienteListView.as_view(),                name=f'{app}_cliente_index'),
    path('cliente/create/',                 views.ClienteCreateView.as_view() ,             name=f'{app}_cliente_create'),
    path('cliente/view/<int:id>/',          views.ClienteDetailView.as_view(),              name=f'{app}_cliente_view'),
    path('cliente/update/<int:id>/',        views.ClienteUpdateView.as_view(),              name=f'{app}_cliente_update'),
    path('cliente/delete/<int:id>/',        views.ClienteDeleteView.as_view(),              name=f'{app}_cliente_delete'),
    path('cliente/index-list-ajax/',        login_required(views.cliente_list_datatable),   name='index_list_ajax_clientes'),
    ##path('grupo/list-ajax-calendar/',     login_required(views.lista_eventos_calendar),           name='list_ajax_eventos_calendar'),
    ###======================================================================
    ###                             ALMACEN
    ###======================================================================
    path('almacen/',                     views.AlmacenListView.as_view(),                name=f'{app}_almacen_index'),
    path('almacen/create/',              views.AlmacenCreateView.as_view(),              name=f'{app}_almacen_create'),
    path('almacen/view/<int:id>/',       views.AlmacenDetailView.as_view(),              name=f'{app}_almacen_view'),
    path('almacen/update/<int:id>/',     views.AlmacenUpdateView.as_view(),              name=f'{app}_almacen_update'),
    path('almacen/delete/<int:id>/',     views.AlmacenDeleteView.as_view(),              name=f'{app}_almacen_delete'),
    
    ###======================================================================
    ###                           PROVEEDOR
    ###======================================================================
    path('proveedor/',                        views.ProveedorListView.as_view(),                name=f'{app}_proveedor_index'),
    path('proveedor/create/',                 views.ProveedorCreateView.as_view() ,             name=f'{app}_proveedor_create'),
    path('proveedor/view/<int:id>/',          views.ProveedorDetailView.as_view(),              name=f'{app}_proveedor_view'),
    path('proveedor/update/<int:id>/',        views.ProveedorUpdateView.as_view(),              name=f'{app}_proveedor_update'),
    path('proveedor/delete/<int:id>/',        views.ProveedorDeleteView.as_view(),              name=f'{app}_proveedor_delete'),
    path('proveedor/index-list-ajax/',        login_required(views.proveedor_list_datatable),   name='index_list_ajax_proveedor'),
]