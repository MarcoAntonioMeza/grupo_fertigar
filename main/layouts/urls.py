from django.urls import path
from .views import horizontal_view,detached_view

urlpatterns = [

    # Layouts
        path("horizontal", view=horizontal_view, name="horizontal"),
        path("detached", view=detached_view, name="detached"),
        
]