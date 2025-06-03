from django.urls import path,re_path
from .views import index, crear_usuario, update_usuario, view_usuario, delete_usuario, index_list_ajax 
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('', index, name='user_index'),
    path('create/', crear_usuario, name='user_create'),
    path('update/<int:id>', update_usuario, name='user_update'),
    path('view/<int:id>', view_usuario, name='user_view'),
    path('solicitud-list-ajax/', index_list_ajax, name='list_ajax_usuarios'),
    path('delete/<int:id>', delete_usuario, name='user_delete'),
    #path('solicitud-list/', index_list, name='list_solicituds'),
    #path('solicitud-list-ajax/', index_list_ajax, name='list_solicituds_ajax'),
    
    
    
    
    #re_path(r'^.*\.*', pages, name='pages'),

]