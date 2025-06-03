from django.urls import path
from django.contrib.auth.decorators import login_required
from . import views

urlpatterns = [
    path('groups/',                login_required(views.index), name='grupos_index'),
    path('groups/create/',         login_required(views.create), name='grupos_create'),
    path('groups/view/<int:id>/',  login_required(views.view), name='grupos_view'),
    path('groups/update/<int:id>/',login_required(views.update), name='grupos_update'),
    path('delete/<int:id>/',       login_required(views.delete), name='grupos_delete'),
    
    
    
    
    
    
    #AJAX
    path('grupos-list-ajax/', login_required(views.index_list_ajax), name='list_ajax_grupos'),
    
]