from django.contrib.auth.decorators import login_required
from django.urls import path
from . import views
app = 'crm'
urlpatterns = [
    path('almacen/',                     views.AlmacenListView.as_view(),                name=f'{app}_almacen_index'),
    path('almacen/create/',              views.AlmacenCreateView.as_view(),              name=f'{app}_almacen_create'),
    path('almacen/view/<int:id>/',       views.AlmacenDetailView.as_view(),              name=f'{app}_almacen_view'),
    path('almacen/update/<int:id>/',     views.AlmacenUpdateView.as_view(),              name=f'{app}_almacen_update'),
    path('almacen/delete/<int:id>/',     views.AlmacenDeleteView.as_view(),              name=f'{app}_almacen_delete'),
    #path('almacen/index-list-ajax/',     login_required(views.index_list_ajax_alumnos), name='index_list_ajax_alumnos'),
    ###======================================================================
    ###                           GRUPOS
    ###======================================================================
    #path('grupo/',                        views.GrupoListView.as_view(),                name=f'{app}_grupo_index'),
    #path('grupo/create/',                 views.GrupoCreateView.as_view() ,             name=f'{app}_grupo_create'),
    #path('grupo/view/<int:id>/',          views.GrupoDetailView.as_view(),              name=f'{app}_grupo_view'),
    #path('grupo/update/<int:id>/',        views.GrupoUpdateView.as_view(),              name=f'{app}_grupo_update'),
    #path('grupo/delete/<int:id>/',        views.GrupoDeleteView.as_view(),              name=f'{app}_grupo_delete'),
    #path('grupo/index-list-ajax/',        login_required(views.index_list_ajax_grupos), name='index_list_ajax_grupo'),
    ##path('grupo/list-ajax-calendar/',     login_required(views.lista_eventos_calendar),           name='list_ajax_eventos_calendar'),
    ###======================================================================
    ###                           MATERIASA
    ###======================================================================
    #path('materia/',                        views.MateriaListView.as_view(),                name=f'{app}_materia_index'),
    #path('materia/create/',                 views.MateriaCreateView.as_view() ,             name=f'{app}_materia_create'),
    #path('materia/view/<int:id>/',          views.MateriaDetailView.as_view(),              name=f'{app}_materia_view'),
    #path('materia/update/<int:id>/',        views.MateriaUpdateView.as_view(),              name=f'{app}_materia_update'),
    #path('materia/delete/<int:id>/',        views.MateriaDeleteView.as_view(),              name=f'{app}_materia_delete'),
    #path('materia/index-list-ajax/',        login_required(views.materia_list_datatable), name='index_list_ajax_materia'),
    ##path('grupo/list-ajax-calendar/',     login_required(views.lista_eventos_calendar),           name='list_ajax_eventos_calendar'),
]