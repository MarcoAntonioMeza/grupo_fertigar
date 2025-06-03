from django.views.generic.base import TemplateView


class LayoutView(TemplateView):
    pass

# Layouts
horizontal_view = LayoutView.as_view(template_name="custom/layouts/horizontal.html")
detached_view = LayoutView.as_view(template_name="custom/layouts/detached.html")