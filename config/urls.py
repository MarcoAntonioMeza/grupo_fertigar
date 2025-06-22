# ruff: noqa
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include
from django.urls import path
from django.views import defaults as default_views
from django.views.generic import TemplateView
from config.view import index_view, boleta_pdf


from .view import login_view, logout_view

urlpatterns = [
    
    # Django Admin, use {% url 'admin:index' %}
    path(settings.ADMIN_URL, admin.site.urls),
    path("master/", include("main.adminv2.urls")),
    
    # User management
    path("users/", include("main.users.urls")),
    path("login/",  login_view, name="login_v2"),
    path("logout/", logout_view, name="logout_v2"),
    
    #path("accounts/", include("allauth.urls")),
    # Your stuff: custom urls includes go here
    

    path("", view=index_view, name="index"),
    #path("boleta/", view=boleta_pdf, name="boleta"),
    

    path("apps/", include("main.apps.urls")),

    #custom
    path("custom/", include("main.custom.urls")),

    #layouts
    path("layouts/", include("main.layouts.urls")),
    #components
    path("components/", include("main.components.urls")),
    path("direccion/", include("main.direccion.urls")),
    #CRM 
    path("crm/", include("main.crm.urls")),
    
    # ...
    # Media files
    *static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT),
]


if settings.DEBUG:
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        path(
            "400/",
            default_views.bad_request,
            kwargs={"exception": Exception("Bad Request!")},
        ),
        path(
            "403/",
            default_views.permission_denied,
            kwargs={"exception": Exception("Permission Denied")},
        ),
        path(
            "404/",
            default_views.page_not_found,
            kwargs={"exception": Exception("Page not Found")},
        ),
        path("500/", default_views.server_error),
    ]
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns
