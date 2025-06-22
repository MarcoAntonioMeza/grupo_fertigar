# ruff: noqa: ERA001, E501
"""Base settings to build other settings files upon."""


from pathlib import Path

import environ
import pymysql

# CONEXION A MYSQL
pymysql.install_as_MySQLdb()

BASE_DIR = Path(__file__).resolve(strict=True).parent.parent.parent
# codefox/
APPS_DIR = BASE_DIR / "main"
env = environ.Env()

APPLY_LOAD_SEPOMEX = False
ES_LOCAL = env.bool("DJANGO_IS_LOCAL", default=True)


READ_DOT_ENV_FILE = env.bool("DJANGO_READ_DOT_ENV_FILE", default=True)
if READ_DOT_ENV_FILE:
    # OS environment variables take precedence over variables from .env
    env.read_env(str(BASE_DIR / ".env"))

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#debug
DEBUG = env.bool("DJANGO_DEBUG", False)
# Local time zone. Choices are
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# though not all of them may be available with every OS.
# In Windows, this must be set to your system time zone.
TIME_ZONE = "America/Mexico_City"
# https://docs.djangoproject.com/en/dev/ref/settings/#language-code
LANGUAGE_CODE = "es-Mx"
# https://docs.djangoproject.com/en/dev/ref/settings/#languages
# from django.utils.translation import gettext_lazy as _
# LANGUAGES = [
#     ('en', _('English')),
#     ('fr-fr', _('French')),
#     ('pt-br', _('Portuguese')),
# ]
# https://docs.djangoproject.com/en/dev/ref/settings/#site-id
SITE_ID = 1
# https://docs.djangoproject.com/en/dev/ref/settings/#use-i18n
USE_I18N = True
# https://docs.djangoproject.com/en/dev/ref/settings/#use-tz
USE_TZ = True
# https://docs.djangoproject.com/en/dev/ref/settings/#locale-paths
LOCALE_PATHS = [str(BASE_DIR / "locale")]

# DATABASES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#databases

# DATABASES = {
#    "default": {
#        'ENGINE': 'django.db.backends.sqlite3',
#        'NAME': BASE_DIR / 'db.sqlite3',
#    },
# }
# DATABASES = {
#    "default": {
#        "ENGINE": "django.db.backends.mysql",
#        "NAME": "dev_fertigar",
#        "USER": "root",
#        "PASSWORD": "2808",
#        "HOST": "localhost",  # o IP del servidor
#        "PORT": "3307",
#        "OPTIONS": {
#            #'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
#            "charset": "utf8mb4"
#        },
#    }
# }

DATABASES = {
    "default": {
        "ENGINE": env("DB_ENGINE"),
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT"),
        "OPTIONS": {
            "charset": env("DB_CHARSET", default="utf8mb4"),
        },
    }
}


DATABASES["default"]["ATOMIC_REQUESTS"] = True
# https://docs.djangoproject.com/en/stable/ref/settings/#std:setting-DEFAULT_AUTO_FIELD
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# URLS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#root-urlconf
ROOT_URLCONF = "config.urls"
# https://docs.djangoproject.com/en/dev/ref/settings/#wsgi-application
WSGI_APPLICATION = "config.wsgi.application"

# APPS
# ------------------------------------------------------------------------------
DJANGO_APPS = [
    "jazzmin",  # tema Material
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    # "django.contrib.sites",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.humanize",  # Handy template tags
    "django.contrib.admin",
    "django.forms",
    "rest_framework",
]
THIRD_PARTY_APPS = [
    "crispy_forms",
    "widget_tweaks",
    "crispy_bootstrap5",
    "allauth",
    "allauth.account",
    "allauth.mfa",
    "allauth.socialaccount",
]

LOCAL_APPS = [
    "main.crm",
    "main.users",
    "main.adminv2",
    "main.apps",
    "main.components",
    "main.custom",
    "main.layouts",
    "main.direccion",
    # Your stuff: custom apps go here
]
# https://docs.djangoproject.com/en/dev/ref/settings/#installed-apps
INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# Configuración avanzada para Django Admin con tema oscuro personalizado
JAZZMIN_SETTINGS = {
    # 🎨 BRANDING Y TÍTULOS
    "site_title": "FERTIGAR Admin",
    "site_header": "GRUPO FERTIGAR",
    "site_brand": "BY LERCO",
    "site_logo": "images/logo-light.png",
    "login_logo": "images/logo-light.png",
    "login_logo_dark": "images/logo-dark.png",  # Logo específico para modo oscuro
    "site_logo_classes": "img-circle",  # Hace el logo circular
    "welcome_sign": "Bienvenido al Panel Administrativo",
    "copyright": "© 2024 BY LERCO - Todos los derechos reservados",
    # 🌙 CONFIGURACIÓN DE TEMA OSCURO AVANZADA
    "theme": "darkly",
    "dark_mode_theme": "darkly",
    "use_theme_switcher": False,  # Fuerza modo oscuro
    # 🎨 COLORES PERSONALIZADOS PARA MODO OSCURO
    "custom_css": "admin/css/custom_dark.css",  # Archivo CSS personalizado
    "custom_js": "admin/js/custom_dark.js",  # JavaScript personalizado
    # 📱 DISEÑO Y LAYOUT
    "layout": "dark",  # Layout específico oscuro
    "changeform_format": "horizontal_tabs",  # Pestañas horizontales más modernas
    "changeform_format_overrides": {
        "auth.user": "horizontal_tabs",
        "auth.group": "collapsible",
        "crm.cliente": "single",
        "ventas.factura": "horizontal_tabs",
    },
    # 📦 NAVEGACIÓN Y SIDEBAR MEJORADA
    "show_sidebar": True,
    "navigation_expanded": True,
    "sidebar_nav_small_text": False,  # Texto más grande en sidebar
    "sidebar_disable_expand": False,
    "sidebar_nav_legacy_style": False,  # Estilo moderno
    "sidebar_nav_flat_style": True,  # Estilo plano moderno
    # 🔍 CONFIGURACIÓN DE BÚSQUEDA
    "search_model": ["auth.user", "crm.cliente", "ventas.factura"],
    # 📋 APPS Y MODELOS ORGANIZADOS
    "hide_apps": ["sites"],  # Ocultar apps innecesarias
    "hide_models": ["auth.group"],  # Ocultar modelos específicos
    "order_with_respect_to": [
        "dashboard",
        "crm",
        "ventas",
        "productos",
        "clientes",
        "inventario",
        "reportes",
        "auth",
        "usuarios",
    ],
    # 🎯 ÍCONOS MODERNOS Y COHERENTES
    "icons": {
        # Apps principales
        "auth": "fas fa-shield-alt",
        "crm": "fas fa-users",
        "ventas": "fas fa-chart-line",
        "productos": "fas fa-seedling",  # Tema agrícola
        "clientes": "fas fa-handshake",
        "inventario": "fas fa-warehouse",
        "reportes": "fas fa-chart-bar",
        # Modelos específicos
        "auth.user": "fas fa-user-circle",
        "auth.group": "fas fa-users-cog",
        "crm.agente": "fas fa-user-tie",
        "crm.cliente": "fas fa-address-book",
        "crm.contacto": "fas fa-id-card",
        "ventas.factura": "fas fa-file-invoice-dollar",
        "ventas.cotizacion": "fas fa-file-contract",
        "ventas.pedido": "fas fa-shopping-cart",
        "productos.fertilizante": "fas fa-leaf",
        "productos.categoria": "fas fa-tags",
        "inventario.stock": "fas fa-boxes",
        "reportes.reporte": "fas fa-file-alt",
    },
    # 🏠 DASHBOARD PERSONALIZADO
    "show_ui_builder": False,
    "changeform_format": "horizontal_tabs",
    # 🔧 FUNCIONALIDADES AVANZADAS
    "related_modal_active": True,
    "related_modal_active_tab": "related-object",
    "custom_links": {
        "crm": [
            {
                "name": "Reportes CRM",
                "url": "admin:crm_reporte_changelist",
                "icon": "fas fa-chart-pie",
                "permissions": ["crm.view_reporte"],
            }
        ],
        "ventas": [
            {
                "name": "Dashboard Ventas",
                "url": "/admin/ventas/dashboard/",
                "icon": "fas fa-tachometer-alt",
                "permissions": ["ventas.view_factura"],
            }
        ],
    },
    # 🎨 INTERFAZ DE USUARIO MEJORADA
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    "show_ui_builder": False,
    # 🔒 CONFIGURACIÓN DE SEGURIDAD Y NAVEGACIÓN
    "show_logout_link": True,
    "logout_redirect_url": "/admin/login/",
    "show_sidebar_toggle": True,
    "show_navbar": True,
    "navbar_small_text": False,
    # 📊 WIDGETS Y FORMULARIOS
    "changeform_format": "horizontal_tabs",
    "language_chooser": False,  # Desactivar selector de idioma si no es necesario
    # 🎭 PERSONALIZACIÓN ADICIONAL
    "user_avatar": None,  # o una URL si quieres avatares
    "topmenu_links": [
        # Enlaces adicionales en el menú superior
        {"name": "Inicio", "url": "admin:index", "permissions": ["auth.view_user"]},
    ],
    # 🌐 CONFIGURACIÓN DE IDIOMA
    "language_chooser": False,
}

# 🎨 CONFIGURACIÓN CSS PERSONALIZADA ADICIONAL
JAZZMIN_UI_TWEAKS = {
    # Colores del tema oscuro personalizados
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": False,
    "accent": "accent-primary",
    "navbar": "navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": False,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": False,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_nav_flat_style": True,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_compact_style": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "theme": "darkly",
    "dark_mode_theme": "darkly",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
}
# MIGRATIONS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#migration-modules
MIGRATION_MODULES = {"sites": "main.contrib.sites.migrations"}

# AUTHENTICATION
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#authentication-backends
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
]
# https://docs.djangoproject.com/en/dev/ref/settings/#auth-user-model
AUTH_USER_MODEL = "users.User"
# https://docs.djangoproject.com/en/dev/ref/settings/#login-redirect-url
# LOGIN_REDIRECT_URL = "users:redirect"
# https://docs.djangoproject.com/en/dev/ref/settings/#login-url
LOGIN_URL = "/login/"

# PASSWORDS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#password-hashers
PASSWORD_HASHERS = [
    # https://docs.djangoproject.com/en/dev/topics/auth/passwords/#using-argon2-with-django
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]
# https://docs.djangoproject.com/en/dev/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# MIDDLEWARE
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#middleware
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",
]

# STATIC
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#static-root
STATIC_ROOT = str(BASE_DIR / "staticfiles")
# https://docs.djangoproject.com/en/dev/ref/settings/#static-url
STATIC_URL = "/static/"
# https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#std:setting-STATICFILES_DIRS
STATICFILES_DIRS = [
    str(APPS_DIR / "static"),
    BASE_DIR / "main" / "static",
]
# https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#staticfiles-finders
STATICFILES_FINDERS = [
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
]

# MEDIA
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#media-root
MEDIA_ROOT = str(APPS_DIR / "media")
# https://docs.djangoproject.com/en/dev/ref/settings/#media-url
MEDIA_URL = "/media/"

# TEMPLATES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#templates
TEMPLATES = [
    {
        # https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-TEMPLATES-BACKEND
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # https://docs.djangoproject.com/en/dev/ref/settings/#dirs
        "DIRS": [str(APPS_DIR / "templates")],
        # https://docs.djangoproject.com/en/dev/ref/settings/#app-dirs
        "APP_DIRS": True,
        "OPTIONS": {
            # https://docs.djangoproject.com/en/dev/ref/settings/#template-context-processors
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.i18n",
                "django.template.context_processors.media",
                "django.template.context_processors.static",
                "django.template.context_processors.tz",
                "django.contrib.messages.context_processors.messages",
                "main.users.context_processors.allauth_settings",
                "main.users.context_processors.listado_modulos",
            ],
        },
    },
]

# https://docs.djangoproject.com/en/dev/ref/settings/#form-renderer
FORM_RENDERER = "django.forms.renderers.TemplatesSetting"

# http://django-crispy-forms.readthedocs.io/en/latest/install.html#template-packs
CRISPY_TEMPLATE_PACK = "bootstrap5"
CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"

# FIXTURES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#fixture-dirs
FIXTURE_DIRS = (str(APPS_DIR / "fixtures"),)

# SECURITY
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#session-cookie-httponly
SESSION_COOKIE_HTTPONLY = True
# https://docs.djangoproject.com/en/dev/ref/settings/#csrf-cookie-httponly
CSRF_COOKIE_HTTPONLY = True
# https://docs.djangoproject.com/en/dev/ref/settings/#x-frame-options
X_FRAME_OPTIONS = "DENY"

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#email-backend
EMAIL_BACKEND = env(
    "DJANGO_EMAIL_BACKEND",
    default="django.core.mail.backends.smtp.EmailBackend",
)
# https://docs.djangoproject.com/en/dev/ref/settings/#email-timeout
EMAIL_TIMEOUT = 5

# ADMIN
# ------------------------------------------------------------------------------
# Django Admin URL.
ADMIN_URL = "admin"
# https://docs.djangoproject.com/en/dev/ref/settings/#admins
ADMINS = [("""coderthemes""", "coderthemes@example.com")]
# https://docs.djangoproject.com/en/dev/ref/settings/#managers
MANAGERS = ADMINS
# https://cookiecutter-django.readthedocs.io/en/latest/settings.html#other-environment-settings
# Force the `admin` sign in process to go through the `django-allauth` workflow
DJANGO_ADMIN_FORCE_ALLAUTH = env.bool("DJANGO_ADMIN_FORCE_ALLAUTH", default=False)

# LOGGING
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#logging
# See https://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {"level": "INFO", "handlers": ["console"]},
}

# REDIS_URL = env("REDIS_URL", default="redis://localhost:6379/0")
# REDIS_SSL = REDIS_URL.startswith("rediss://")


## django-allauth
## ------------------------------------------------------------------------------
ACCOUNT_ALLOW_REGISTRATION = env.bool("DJANGO_ACCOUNT_ALLOW_REGISTRATION", True)
## https://docs.allauth.org/en/latest/account/configuration.html
# ACCOUNT_AUTHENTICATION_METHOD = "username"
## https://docs.allauth.org/en/latest/account/configuration.html
# ACCOUNT_EMAIL_REQUIRED = True
## https://docs.allauth.org/en/latest/account/configuration.html
# ACCOUNT_EMAIL_VERIFICATION = "mandatory"
## https://docs.allauth.org/en/latest/account/configuration.html
# ACCOUNT_ADAPTER = "main.users.adapters.AccountAdapter"
## https://docs.allauth.org/en/latest/account/forms.html
# ACCOUNT_FORMS = {"signup": "main.users.forms.UserSignupForm"}
## https://docs.allauth.org/en/latest/socialaccount/configuration.html
# SOCIALACCOUNT_ADAPTER = "main.users.adapters.SocialAccountAdapter"
## https://docs.allauth.org/en/latest/socialaccount/configuration.html
# SOCIALACCOUNT_FORMS = {"signup": "main.users.forms.UserSocialSignupForm"}


# Your stuff...
# ------------------------------------------------------------------------------
# Solo aceptar peticiones CSRF de estos dominios
if not ES_LOCAL:
    pass
    ## pass
    #CSRF_TRUSTED_ORIGINS = [
    #    "https://dev-fertigar.lercomx.com",
    #    "https://www.dev-fertigar.lercomx.com",
    #]
#
    ## Seguridad adicional para cookies
    #CSRF_COOKIE_SECURE = True  # Solo envía cookies CSRF sobre HTTPS
    #SESSION_COOKIE_SECURE = True  # Solo envía cookies de sesión sobre HTTPS
    #SECURE_SSL_REDIRECT = True  # Redirige HTTP a HTTPS automáticamente
    #USE_TLS = True
    #SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')