from django.urls import path,re_path
from .views import index, crear_usuario, update_usuario, view_usuario, delete_usuario, index_list_ajax , cambiar_contraseña_usuario
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.decorators import login_required


urlpatterns = [
    path('',                    login_required(index), name='user_index'),
    path('create/',             login_required(crear_usuario), name='user_create'),
    path('update/<int:id>',     login_required(update_usuario), name='user_update'),
    path('reset-pwd/<int:id>',    login_required(cambiar_contraseña_usuario), name='reset_password'),
    path('view/<int:id>',       login_required(view_usuario), name='user_view'),
    path('delete/<int:id>',     login_required(delete_usuario), name='user_delete'),
    path('list-ajax/',          login_required(index_list_ajax), name='list_ajax_usuarios'),
    
    #path('solicitud-list/', index_list_ajax, name='list_solicituds'),
    #path('solicitud-list-ajax/', index_list_ajax, name='list_solicituds_ajax'),
    
    
    
    
    #re_path(r'^.*\.*', pages, name='pages'),

]