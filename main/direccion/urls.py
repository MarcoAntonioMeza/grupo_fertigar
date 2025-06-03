from django.urls import path,re_path
from main.direccion import views 


urlpatterns = [
    path('search', views.buscar_direccion, name='search_dir'),
    
    #path('create/', views.crear_usuario, name='user_create'),
    #path('solicitud-list/', views.index_list, name='list_solicituds'),C:\web-python\base\static\vendor\select2\dist\css\select2.min.css
    #path('solicitud-list-ajax/', views.index_list_ajax, name='list_solicituds_ajax'),
    
    
    
    
    #re_path(r'^.*\.*', views.pages, name='pages'),

]